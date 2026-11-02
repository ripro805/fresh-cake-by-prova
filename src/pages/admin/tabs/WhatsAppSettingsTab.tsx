import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Clock, 
  HelpCircle,
  Copy,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { api } from '../../../api/client';
import { useSettings } from '../../../context/SettingsContext';

export const WhatsAppSettingsTab: React.FC = () => {
  const { showToast } = useSettings();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const [form, setForm] = useState({
    destination_admin_number: '+8801308516242',
    is_enabled: true,
    support_hours: '10:00 AM - 10:00 PM (Daily)',
    welcome_message: 'Welcome to FRESH CAKE by PROVA live bakery support! How can we make your celebration special today?',
    offline_message: 'Our bakery studio is currently closed for the night. Please leave your order or enquiry and we will reply first thing tomorrow morning!',
    auto_response_enabled: true
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getWhatsAppSettings();
      if (data) {
        setForm({
          destination_admin_number: data.destination_admin_number || '+8801308516242',
          is_enabled: data.is_enabled ?? true,
          support_hours: data.support_hours || '10:00 AM - 10:00 PM (Daily)',
          welcome_message: data.welcome_message || '',
          offline_message: data.offline_message || '',
          auto_response_enabled: data.auto_response_enabled ?? true
        });
      }
    } catch (err: any) {
      console.warn('Could not load WhatsApp settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateWhatsAppSettings(form);
      showToast('WhatsApp Chat Settings updated and recorded in Audit Log!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update WhatsApp settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const webhookUrl = `${window.location.origin}/api/v1/webhooks/whatsapp/`;
  const verifyToken = 'freshcake_webhook_token_2026';

  const copyToClipboard = (text: string, type: 'url' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
    showToast('Copied to clipboard!', 'info');
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading WhatsApp Chat Settings...
      </div>
    );
  }

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        border: '1px solid var(--border-subtle)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#25D366',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.35)',
            flexShrink: 0
          }}>
            <MessageCircle size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
                WhatsApp Live Customer Support
              </h2>
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                Two-Way Sync Active
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
              Customers message on the website &bull; Forwarded to your WhatsApp &bull; Your WhatsApp replies sync back to the customer's chat.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ height: '44px', padding: '0 1.5rem' }}
        >
          <Save size={16} />
          <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
        
        {/* Form Column */}
        <form onSubmit={handleSave} style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={18} style={{ color: 'var(--brand-primary)' }} />
            <span>Admin Routing &amp; Identity</span>
          </h3>

          {/* Admin Destination Number */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Admin WhatsApp Destination Number *
            </label>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              The phone number where you receive customer messages. Must be in international E.164 format (+880...).
            </p>
            <input
              type="text"
              required
              value={form.destination_admin_number}
              onChange={(e) => setForm({ ...form, destination_admin_number: e.target.value })}
              placeholder="+8801308516242"
              className="form-control"
              style={{ fontWeight: 600, fontSize: '0.95rem' }}
            />
          </div>

          {/* Enable Live Support Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Enable Live WhatsApp Support</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                When disabled, customer website chat will show offline notification
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.is_enabled}
                onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: form.is_enabled ? '#25D366' : '#ccc',
                borderRadius: '34px',
                transition: '0.2s',
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '20px',
                  width: '20px',
                  left: form.is_enabled ? '25px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </span>
            </label>
          </div>

          {/* Business Support Hours */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Business Support Hours
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={form.support_hours}
                onChange={(e) => setForm({ ...form, support_hours: e.target.value })}
                placeholder="e.g. 10:00 AM - 10:00 PM (Daily)"
                className="form-control"
              />
              <Clock size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Customer Welcome Message
            </label>
            <textarea
              rows={3}
              value={form.welcome_message}
              onChange={(e) => setForm({ ...form, welcome_message: e.target.value })}
              className="form-control"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Offline Notice */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Night / Offline Message
            </label>
            <textarea
              rows={3}
              value={form.offline_message}
              onChange={(e) => setForm({ ...form, offline_message: e.target.value })}
              className="form-control"
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ width: '100%', height: '46px' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </form>

        {/* Cloud API & Webhook Guidance Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* How Two-Way Reply Works Card */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} />
              <span>How To Reply From Your WhatsApp</span>
            </h3>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '0.75rem' }}>
                When a customer sends a message on the website, you will receive a WhatsApp message formatted like this:
              </p>

              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                borderLeft: '4px solid #25D366',
                color: 'var(--text-primary)'
              }}>
                <div>🎂 [FRESH CAKE by PROVA]</div>
                <div>📌 Ref: FC-1024</div>
                <div>👤 Customer: Anika Rahman (01308...)</div>
                <div>💬 "Do you have 2-pound chocolate truffle cakes?"</div>
                <div style={{ marginTop: '0.5rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
                  👉 Reply with: FC-1024 | Your reply here
                </div>
              </div>

              <p style={{ marginBottom: '0.75rem' }}>
                <strong>To reply to the customer:</strong> Simply reply on WhatsApp starting with the reference:
              </p>

              <div style={{
                backgroundColor: '#E8F5E9',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#1B5E20',
                fontWeight: 700,
                border: '1px solid #A5D6A7'
              }}>
                FC-1024 | Yes, we have chocolate truffle cakes ready for delivery!
              </div>

              <p style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Our Django webhook will immediately extract your reply and push it to the customer's website chat in real-time.
              </p>
            </div>
          </div>

          {/* Meta Cloud API Webhook Credentials Card */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#25D366' }} />
              <span>Meta Webhook Integration Endpoints</span>
            </h3>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Configure these in your <strong>Meta App Dashboard &rarr; WhatsApp &rarr; Configuration</strong>:
            </p>

            {/* Webhook Callback URL */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Callback URL (POST &amp; GET)
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  style={{
                    flex: 1,
                    fontSize: '0.78rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-secondary)',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(webhookUrl, 'url')}
                  className="btn btn-secondary btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Verify Token */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Verify Token (Webhook Challenge)
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={verifyToken}
                  style={{
                    flex: 1,
                    fontSize: '0.78rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-secondary)',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(verifyToken, 'token')}
                  className="btn btn-secondary btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  {copiedToken ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
