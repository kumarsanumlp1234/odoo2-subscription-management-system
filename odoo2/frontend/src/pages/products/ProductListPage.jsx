import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { taxService } from '../../services/taxService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { FormInput } from '../../components/forms/FormInput';
import { SelectInput } from '../../components/forms/SelectInput';
import { formatCurrency } from '../../utils/formatters';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';

export const ProductListPage = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    productType: 'SERVICE',
    salesPrice: '',
    costPrice: '',
    description: '',
    notes: '',
    taxIds: [],
  });

  const [variantData, setVariantData] = useState({
    variantName: '',
    additionalPrice: '0.00',
    sku: '',
    description: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchTaxes();
  }, [page, typeFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
        search: search || undefined,
        productType: typeFilter || undefined,
      };
      const res = await productService.getProducts(params);
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxes = async () => {
    try {
      const res = await taxService.getActiveTaxes();
      setTaxes(res || []);
    } catch (e) {
      console.warn('Could not fetch taxes', e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleOpenCreate = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        productType: product.productType,
        salesPrice: product.salesPrice,
        costPrice: product.costPrice || '',
        description: product.description || '',
        notes: product.notes || '',
        taxIds: product.taxes ? product.taxes.map((t) => t.id) : [],
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        productType: 'SERVICE',
        salesPrice: '',
        costPrice: '',
        description: '',
        notes: '',
        taxIds: taxes.length > 0 ? [taxes[0].id] : [],
      });
    }
    setCreateModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.salesPrice) {
      toast.warning('Name and Sales Price are required');
      return;
    }

    try {
      setSaving(true);
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(formData);
        toast.success('Product created successfully');
      }
      setCreateModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddVariant = (product) => {
    setSelectedProduct(product);
    setVariantData({
      variantName: '',
      additionalPrice: '0.00',
      sku: `${product.name.substring(0, 3).toUpperCase()}-VAR-01`,
      description: '',
    });
    setVariantModalOpen(true);
  };

  const handleSaveVariant = async (e) => {
    e.preventDefault();
    if (!variantData.variantName) {
      toast.warning('Variant name is required');
      return;
    }

    try {
      setSaving(true);
      await productService.addVariant(selectedProduct.id, variantData);
      toast.success('Product variant added successfully');
      setVariantModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to add variant');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deactivated');
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-600" />
            Product & Variant Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure subscription items, recurring SaaS products, and tiered variants
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => handleOpenCreate()}
            className="btn-primary text-xs py-2"
          >
            <Plus className="w-4 h-4" />
            New Product
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            className="text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:border-brand-500"
          >
            <option value="">All Product Types</option>
            <option value="SERVICE">SERVICE (SaaS, Retainers)</option>
            <option value="PHYSICAL">PHYSICAL (Hardware, Goods)</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading catalog..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Products Found"
            description="Create your first subscription service or physical product to start billing."
            action={
              isAdmin ? (
                <button onClick={() => handleOpenCreate()} className="btn-primary text-xs">
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Product Name</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Base Price</th>
                  <th className="table-th">Variants</th>
                  <th className="table-th">Default Taxes</th>
                  <th className="table-th">Status</th>
                  {isAdmin && <th className="table-th text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      {p.description && (
                        <div className="text-xs text-slate-400 truncate max-w-xs">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="table-td">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {p.productType}
                      </span>
                    </td>
                    <td className="table-td font-semibold text-slate-900">
                      {formatCurrency(p.salesPrice)}
                    </td>
                    <td className="table-td">
                      {p.variants && p.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {p.variants.map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200"
                            >
                              <span>{v.variantName}</span>
                              <span className="font-bold">
                                (+{formatCurrency(v.additionalPrice)})
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No variants</span>
                      )}
                    </td>
                    <td className="table-td">
                      {p.taxes && p.taxes.length > 0 ? (
                        p.taxes.map((t) => (
                          <span
                            key={t.id}
                            className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 mr-1"
                          >
                            {t.taxName} ({t.taxRate}%)
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">0%</span>
                      )}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={p.active ? 'ACTIVE' : 'CLOSED'} />
                    </td>
                    {isAdmin && (
                      <td className="table-td text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAddVariant(p)}
                            title="Add Variant"
                            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenCreate(p)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Deactivate"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      </div>

      {/* Create / Edit Product Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Create New Product'}
        subtitle="Configure base subscription price and default taxation"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <FormInput
            id="name"
            label="Product Name"
            placeholder="e.g. Brightloop Enterprise Cloud"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              id="productType"
              label="Product Type"
              options={[
                { value: 'SERVICE', label: 'SERVICE (Digital/SaaS)' },
                { value: 'PHYSICAL', label: 'PHYSICAL (Hardware/Goods)' },
              ]}
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
              required
            />

            <FormInput
              id="salesPrice"
              label="Base Sales Price (₹)"
              type="number"
              step="0.01"
              placeholder="1000.00"
              value={formData.salesPrice}
              onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
              required
            />
          </div>

          <FormInput
            id="costPrice"
            label="Internal Cost Price (₹ - Optional)"
            type="number"
            step="0.01"
            placeholder="250.00"
            value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Description &amp; Feature Highlights
            </label>
            <textarea
              rows={2}
              className="block w-full rounded-lg border border-slate-200 text-sm p-2.5 focus:border-brand-500"
              placeholder="Describe what customers receive..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Tax Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Applicable Tax Rates
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg">
              {taxes.map((t) => {
                const checked = formData.taxIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const newTaxIds = checked
                          ? formData.taxIds.filter((id) => id !== t.id)
                          : [...formData.taxIds, t.id];
                        setFormData({ ...formData, taxIds: newTaxIds });
                      }}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>
                      {t.taxName} ({t.taxRate}%)
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Saving...' : selectedProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Variant Modal */}
      <Modal
        isOpen={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        title={`Add Variant to ${selectedProduct?.name}`}
        subtitle="e.g. Enterprise Tier with +₹560 additional price"
      >
        <form onSubmit={handleSaveVariant} className="space-y-4">
          <FormInput
            id="variantName"
            label="Variant Name"
            placeholder="e.g. Enterprise Edition / 10-Users Pack"
            value={variantData.variantName}
            onChange={(e) => setVariantData({ ...variantData, variantName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="additionalPrice"
              label="Additional Surcharge (₹)"
              type="number"
              step="0.01"
              placeholder="560.00"
              value={variantData.additionalPrice}
              onChange={(e) =>
                setVariantData({ ...variantData, additionalPrice: e.target.value })
              }
              required
            />

            <FormInput
              id="sku"
              label="SKU Code"
              placeholder="BC-ENT-01"
              value={variantData.sku}
              onChange={(e) => setVariantData({ ...variantData, sku: e.target.value })}
            />
          </div>

          <div className="bg-brand-50/70 p-3 rounded-lg border border-brand-200 text-xs text-brand-900">
            <p className="font-semibold">Calculated Final Price:</p>
            <p className="mt-0.5">
              Base Price ({formatCurrency(selectedProduct?.salesPrice || 0)}) + Additional (
              {formatCurrency(variantData.additionalPrice || 0)}) ={' '}
              <span className="font-bold text-sm text-brand-700">
                {formatCurrency(
                  Number(selectedProduct?.salesPrice || 0) +
                    Number(variantData.additionalPrice || 0)
                )}
              </span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setVariantModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Adding Variant...' : 'Add Variant'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
