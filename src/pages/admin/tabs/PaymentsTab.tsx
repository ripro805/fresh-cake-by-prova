import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, XCircle, AlertCircle, RefreshCw, DollarSign, Phone } from 'lucide-react';
import { api } from '../../../api/client';
import { useSettings } from '../../../context/SettingsContext';
import { Pagination } from '../../../components/common/Pagination';

export const PaymentsTab: React.FC = () => {
  const { settings } = useSettings();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Transaction ID could not be verified on statement.');
  const [actionInProgress, setActionInProgress] = useState(false);

  // Pagination states
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPageSize, setPendingPageSize] = useState(10);
  const [verifiedPage, setVerifiedPage] = useState(1);
  const [verifiedPageSize, setVerifiedPageSize] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const subs = await api.getPaymentSubmissions();
      setSubmissions(Array.isArray(subs) ? subs : []);
    } catch (err) {
      console.warn('Error loading payment submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (id: string) => {
    setActionInProgress(true);
    try {
      await api.verifyPayment(id, 'verify');
      await loadData();
    } catch (err) {
      alert('Failed to verify payment');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    setActionInProgress(true);
    try {
      await api.verifyPayment(rejectingId, 'reject', rejectReason);
      setRejectingId(null);
      await loadData();
    } catch (err) {
      alert('Failed to reject payment');
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 1rem auto' }} />
        <p>Loading payment queue from PostgreSQL...</p>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING');
  const verifiedSubmissions = submissions.filter(s => s.status === 'VERIFIED');

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Manual Payment Verification Queue</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Verify bKash and Nagad mobile banking Transaction IDs (TrxID) submitted by customers.
          </p>
        </div>
        <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} />
          <span>Refresh Payments</span>
        </button>
      </div>

      {/* Info Notice */}
      <div style={{
        backgroundColor: 'var(--brand-accent-light)',
        border: '1px solid rgba(217, 185, 155, 0.4)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <CreditCard color="var(--brand-primary)" size={24} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Merchant &amp; Personal Wallet Settings:</strong>
          {' '}bKash: <strong>{settings.bkash_number || '01308516242'}</strong> &bull; Nagad: <strong>{settings.nagad_number || '01308516242'}</strong>.
          Matching transactions updates order status to <span style={{ color: '#15803D', fontWeight: 600 }}>Order Confirmed</span> and adds to audit logs.
        </div>
      </div>

      {/* PENDING QUEUE TABLE */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Pending Verification ({pendingSubmissions.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Awaiting admin match against Kushtia studio statement
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Order Number</th>
                <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                <th style={{ padding: '0.85rem 1rem' }}>Provider</th>
                <th style={{ padding: '0.85rem 1rem' }}>TrxID (Transaction ID)</th>
                <th style={{ padding: '0.85rem 1rem' }}>Sender Phone</th>
                <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={32} color="#15803D" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>All payments are verified! No pending transactions.</p>
                  </td>
                </tr>
              ) : (
                pendingSubmissions.slice((pendingPage - 1) * pendingPageSize, pendingPage * pendingPageSize).map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                      {sub.order_number}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{sub.customer_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{sub.customer_phone}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                        {sub.provider}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>
                      {sub.transaction_id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {sub.sender_phone}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                      ৳{parseFloat(sub.amount).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleVerify(sub.id)}
                          className="btn btn-primary btn-sm"
                          disabled={actionInProgress}
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', backgroundColor: '#15803D', borderColor: '#15803D' }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Verify</span>
                        </button>
                        <button
                          onClick={() => setRejectingId(sub.id)}
                          className="btn btn-secondary btn-sm"
                          disabled={actionInProgress}
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: '#EF4444' }}
                        >
                          <XCircle size={13} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pendingSubmissions.length > 0 && (
          <div style={{ padding: '0 1.25rem 1rem 1.25rem' }}>
            <Pagination
              currentPage={pendingPage}
              totalPages={Math.ceil(pendingSubmissions.length / pendingPageSize) || 1}
              totalCount={pendingSubmissions.length}
              pageSize={pendingPageSize}
              pageSizeOptions={[5, 10, 20, 50]}
              onPageChange={setPendingPage}
              onPageSizeChange={(sz) => { setPendingPageSize(sz); setPendingPage(1); }}
            />
          </div>
        )}
      </div>

      {/* VERIFIED PAYMENTS HISTORY */}
      <div className="card">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
            Recent Verified Transactions ({verifiedSubmissions.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Order Number</th>
                <th style={{ padding: '0.85rem 1rem' }}>Provider</th>
                <th style={{ padding: '0.85rem 1rem' }}>Transaction ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.85rem 1rem' }}>Verified At</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {verifiedSubmissions.slice((verifiedPage - 1) * verifiedPageSize, verifiedPage * verifiedPageSize).map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>{sub.order_number}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{sub.provider}</td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace' }}>{sub.transaction_id}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>৳{parseFloat(sub.amount).toLocaleString()}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {sub.verified_at ? new Date(sub.verified_at).toLocaleString() : 'Verified'}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>Verified</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0 1.25rem 1rem 1.25rem' }}>
          <Pagination
            currentPage={verifiedPage}
            totalPages={Math.ceil(verifiedSubmissions.length / verifiedPageSize) || 1}
            totalCount={verifiedSubmissions.length}
            pageSize={verifiedPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={setVerifiedPage}
            onPageSizeChange={(sz) => { setVerifiedPageSize(sz); setVerifiedPage(1); }}
          />
        </div>
      </div>

      {/* REJECT MODAL */}
      {rejectingId && (
        <div className="modal-overlay" onClick={() => setRejectingId(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 800, color: '#EF4444' }}>
              Reject Payment Submission
            </h3>
            <form onSubmit={handleRejectConfirm}>
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="btn btn-secondary"
                  disabled={actionInProgress}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#EF4444', borderColor: '#EF4444' }} disabled={actionInProgress}>
                  {actionInProgress ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
