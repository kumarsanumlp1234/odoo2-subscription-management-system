package com.brightloop.subscription.service;

import com.brightloop.subscription.dto.product.ProductRequest;
import com.brightloop.subscription.dto.product.ProductResponse;
import com.brightloop.subscription.dto.product.ProductVariantDto;
import com.brightloop.subscription.entity.Product;
import com.brightloop.subscription.entity.ProductVariant;
import com.brightloop.subscription.entity.Tax;
import com.brightloop.subscription.enums.ProductType;
import com.brightloop.subscription.exception.ResourceNotFoundException;
import com.brightloop.subscription.repository.ProductRepository;
import com.brightloop.subscription.repository.ProductVariantRepository;
import com.brightloop.subscription.repository.TaxRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final TaxRepository taxRepository;
    private final TaxService taxService;

    public ProductService(
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            TaxRepository taxRepository,
            TaxService taxService) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.taxRepository = taxRepository;
        this.taxService = taxService;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String search, ProductType productType, Boolean active, Pageable pageable) {
        return productRepository.searchProducts(search, productType, active, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByActiveTrue().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product(request.getName(), request.getProductType(), request.getSalesPrice(), request.getCostPrice());
        product.setDescription(request.getDescription());
        product.setNotes(request.getNotes());
        product.setActive(request.getActive() != null ? request.getActive() : true);

        if (request.getTaxIds() != null && !request.getTaxIds().isEmpty()) {
            Set<Tax> taxes = new HashSet<>(taxRepository.findAllById(request.getTaxIds()));
            product.setTaxes(taxes);
        }

        Product savedProduct = productRepository.save(product);

        if (request.getVariants() != null) {
            for (ProductVariantDto vDto : request.getVariants()) {
                ProductVariant variant = new ProductVariant(
                        savedProduct,
                        vDto.getVariantName(),
                        vDto.getAdditionalPrice(),
                        vDto.getSku() != null ? vDto.getSku() : "SKU-" + savedProduct.getId() + "-" + System.currentTimeMillis() % 10000
                );
                variant.setDescription(vDto.getDescription());
                variant.setActive(vDto.getActive() != null ? vDto.getActive() : true);
                productVariantRepository.save(variant);
                savedProduct.addVariant(variant);
            }
        }

        return mapToResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setName(request.getName());
        product.setProductType(request.getProductType());
        product.setSalesPrice(request.getSalesPrice());
        product.setCostPrice(request.getCostPrice());
        product.setDescription(request.getDescription());
        product.setNotes(request.getNotes());
        if (request.getActive() != null) product.setActive(request.getActive());

        if (request.getTaxIds() != null) {
            Set<Tax> taxes = new HashSet<>(taxRepository.findAllById(request.getTaxIds()));
            product.setTaxes(taxes);
        }

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public ProductVariantDto addVariant(Long productId, ProductVariantDto dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        ProductVariant variant = new ProductVariant(
                product,
                dto.getVariantName(),
                dto.getAdditionalPrice(),
                dto.getSku() != null ? dto.getSku() : "SKU-" + productId + "-" + System.currentTimeMillis() % 10000
        );
        variant.setDescription(dto.getDescription());
        variant.setActive(dto.getActive() != null ? dto.getActive() : true);
        ProductVariant saved = productVariantRepository.save(variant);

        dto.setId(saved.getId());
        dto.setSku(saved.getSku());
        return dto;
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        // Soft delete to protect financial invoice links
        product.setActive(false);
        productRepository.save(product);
    }

    public ProductResponse mapToResponse(Product product) {
        ProductResponse res = new ProductResponse();
        res.setId(product.getId());
        res.setName(product.getName());
        res.setProductType(product.getProductType());
        res.setSalesPrice(product.getSalesPrice());
        res.setCostPrice(product.getCostPrice());
        res.setDescription(product.getDescription());
        res.setNotes(product.getNotes());
        res.setActive(product.getActive());
        res.setCreatedAt(product.getCreatedAt());
        res.setUpdatedAt(product.getUpdatedAt());

        res.setVariants(product.getVariants().stream().map(v -> {
            ProductVariantDto dto = new ProductVariantDto();
            dto.setId(v.getId());
            dto.setVariantName(v.getVariantName());
            dto.setAdditionalPrice(v.getAdditionalPrice());
            dto.setSku(v.getSku());
            dto.setDescription(v.getDescription());
            dto.setActive(v.getActive());
            return dto;
        }).collect(Collectors.toList()));

        res.setTaxes(product.getTaxes().stream().map(taxService::mapToResponse).collect(Collectors.toList()));

        return res;
    }
}

