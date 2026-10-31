package com.brightloop.subscription.service;

import com.brightloop.subscription.dto.tax.TaxRequest;
import com.brightloop.subscription.dto.tax.TaxResponse;
import com.brightloop.subscription.entity.Tax;
import com.brightloop.subscription.enums.TaxType;
import com.brightloop.subscription.exception.ResourceNotFoundException;
import com.brightloop.subscription.repository.TaxRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaxService {

    private final TaxRepository taxRepository;

    public TaxService(TaxRepository taxRepository) {
        this.taxRepository = taxRepository;
    }

    @Transactional(readOnly = true)
    public List<TaxResponse> getAllTaxes() {
        return taxRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaxResponse> getActiveTaxes() {
        return taxRepository.findByActiveTrue().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaxResponse getTaxById(Long id) {
        Tax tax = taxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax rule not found with id: " + id));
        return mapToResponse(tax);
    }

    @Transactional
    public TaxResponse createTax(TaxRequest request) {
        Tax tax = new Tax(
                request.getTaxName(),
                request.getTaxRate(),
                request.getTaxType() != null ? request.getTaxType() : TaxType.PERCENTAGE,
                request.getDescription()
        );
        tax.setActive(request.getActive() != null ? request.getActive() : true);
        Tax saved = taxRepository.save(tax);
        return mapToResponse(saved);
    }

    @Transactional
    public TaxResponse updateTax(Long id, TaxRequest request) {
        Tax tax = taxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax rule not found with id: " + id));

        tax.setTaxName(request.getTaxName());
        tax.setTaxRate(request.getTaxRate());
        if (request.getTaxType() != null) tax.setTaxType(request.getTaxType());
        tax.setDescription(request.getDescription());
        if (request.getActive() != null) tax.setActive(request.getActive());

        Tax saved = taxRepository.save(tax);
        return mapToResponse(saved);
    }

    public TaxResponse mapToResponse(Tax tax) {
        TaxResponse res = new TaxResponse();
        res.setId(tax.getId());
        res.setTaxName(tax.getTaxName());
        res.setTaxRate(tax.getTaxRate());
        res.setTaxType(tax.getTaxType());
        res.setDescription(tax.getDescription());
        res.setActive(tax.getActive());
        res.setCreatedAt(tax.getCreatedAt());
        return res;
    }
}

