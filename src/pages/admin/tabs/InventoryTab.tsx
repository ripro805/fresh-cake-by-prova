import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, ArrowUpRight, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../../../api/client';
import { Pagination } from '../../../components/common/Pagination';

export const InventoryTab: React.FC = () => {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [ingPage, setIngPage] = useState(1);
  const [ingPageSize, setIngPageSize] = useState(10);
  const [fgPage, setFgPage] = useState(1);
  const [fgPageSize, setFgPageSize] = useState(10);

  // Restock modal state
  const [selectedIngredient, setSelectedIngredient] = useState<any | null>(null);
  const [restockQty, setRestockQty] = useState<number>(5);
  const [restockNotes, setRestockNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ings, fgs, movs] = await Promise.all([
        api.getIngredients(),
        api.getFinishedGoodsStock(),
        api.getStockMovements()
      ]);
      setIngredients(Array.isArray(ings) ? ings : []);
      setFinishedGoods(Array.isArray(fgs) ? fgs : []);
      setMovements(Array.isArray(movs) ? movs : []);
    } catch (err) {
      console.warn('Error loading inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || restockQty <= 0) return;
    setIsSubmitting(true);
    try {
      await api.restockIngredient(selectedIngredient.id, restockQty, restockNotes);
      setSelectedIngredient(null);
      setRestockQty(5);
      setRestockNotes('');
      await loadData();
    } catch (err) {
      alert('Failed to restock ingredient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const lowStockCount = ingredients.filter(i => i.is_low_stock).length;

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 1rem auto' }} />
        <p>Loading real-time inventory from PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Dual Bakery Inventory Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Live tracking of raw bakery ingredients and finished goods batches in Kushtia studio.
          </p>
        </div>
        <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockCount > 0 && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #EF4444',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <AlertTriangle color="#EF4444" size={24} style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ color: '#EF4444', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>
              Low Stock Alert: {lowStockCount} Ingredient{lowStockCount > 1 ? 's' : ''} Below Minimum Threshold
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Reorder soon to avoid halts in cake baking and momo preparation.
            </p>
          </div>
        </div>
      )}

      {/* RAW INGREDIENTS TABLE */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Raw Baking Ingredients & Packaging</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Total tracked essentials: {ingredients.length}
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Ingredient / Supply</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem' }}>Current Stock</th>
                <th style={{ padding: '0.85rem 1rem' }}>Min Alert Threshold</th>
                <th style={{ padding: '0.85rem 1rem' }}>Unit Cost</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.slice((ingPage - 1) * ingPageSize, ingPage * ingPageSize).map((ing) => (
                <tr key={ing.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {ing.is_low_stock && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} title="Low stock" />
                      )}
                      <span>{ing.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {ing.category}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: ing.is_low_stock ? '#EF4444' : 'var(--text-primary)' }}>
                    {parseFloat(ing.current_stock).toFixed(2)} {ing.unit}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {parseFloat(ing.min_threshold).toFixed(2)} {ing.unit}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    ৳{parseFloat(ing.unit_cost).toFixed(2)} / {ing.unit}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedIngredient(ing)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                    >
                      <Plus size={12} />
                      <span>Restock</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0 1.25rem 1rem 1.25rem' }}>
          <Pagination
            currentPage={ingPage}
            totalPages={Math.ceil(ingredients.length / ingPageSize) || 1}
            totalCount={ingredients.length}
            pageSize={ingPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={setIngPage}
            onPageSizeChange={(sz) => { setIngPageSize(sz); setIngPage(1); }}
          />
        </div>
      </div>

      {/* FINISHED GOODS STOCK */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Finished Goods Daily Stock</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Fresh daily baked inventory & batches available for immediate dispatch
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Product Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem' }}>Available</th>
                <th style={{ padding: '0.85rem 1rem' }}>Reserved (Orders)</th>
                <th style={{ padding: '0.85rem 1rem' }}>Total Batch Qty</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {finishedGoods.slice((fgPage - 1) * fgPageSize, fgPage * fgPageSize).map((fg) => (
                <tr key={fg.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>{fg.product_name}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {fg.product_category}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {fg.available_quantity} units
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {fg.reserved_quantity} units
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {fg.current_quantity} units
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {fg.is_low_stock ? (
                      <span className="badge badge-caramel" style={{ fontSize: '0.72rem' }}>Low Stock</span>
                    ) : (
                      <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0 1.25rem 1rem 1.25rem' }}>
          <Pagination
            currentPage={fgPage}
            totalPages={Math.ceil(finishedGoods.length / fgPageSize) || 1}
            totalCount={finishedGoods.length}
            pageSize={fgPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={setFgPage}
            onPageSizeChange={(sz) => { setFgPageSize(sz); setFgPage(1); }}
          />
        </div>
      </div>

      {/* RESTOCK MODAL */}
      {selectedIngredient && (
        <div className="modal-overlay" onClick={() => setSelectedIngredient(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 800 }}>
              Restock: {selectedIngredient.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Current stock: <strong>{selectedIngredient.current_stock} {selectedIngredient.unit}</strong>
            </p>

            <form onSubmit={handleRestockSubmit}>
              <div className="form-group">
                <label className="form-label">Added Quantity ({selectedIngredient.unit}) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseFloat(e.target.value) || 0)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supplier / Batch Note</label>
                <input
                  type="text"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  placeholder="e.g. Delivered by Local Kushtia Dairy Supplier"
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedIngredient(null)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
