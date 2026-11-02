import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Send, 
  CheckCircle2, 
  Clock, 
  RotateCw, 
  User, 
  Phone, 
  Check, 
  CheckCheck,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../../../api/client';
import { useSettings } from '../../../context/SettingsContext';
import { Pagination } from '../../../components/common/Pagination';

interface SupportMessageItem {
  id: string;
  sender_type: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
  sender_name?: string;
  text: string;
  delivery_status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  created_at: string;
}

interface SupportConversationItem {
  id: string;
  reference: string;
  customer_name?: string;
  customer_contact?: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  assigned_whatsapp_number?: string;
  last_message_at: string;
  created_at: string;
  messages: SupportMessageItem[];
}

export const ConversationsTab: React.FC = () => {
  const { showToast } = useSettings();

  const [conversations, setConversations] = useState<SupportConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<SupportConversationItem | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);

  // Pagination state
  const [convPage, setConvPage] = useState(1);
  const [convPageSize, setConvPageSize] = useState(10);

  useEffect(() => {
    setConvPage(1);
  }, [statusFilter, searchTerm]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await api.getAdminSupportConversations(params);
      if (Array.isArray(data)) {
        setConversations(data);
        if (selectedConversation) {
          const updated = data.find(c => c.id === selectedConversation.id);
          if (updated) setSelectedConversation(updated);
        }
      }
    } catch (err: any) {
      console.warn('Could not load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadConversations();
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !replyText.trim()) return;

    setSendingReply(true);
    try {
      await api.adminReplySupportConversation(selectedConversation.id, replyText.trim());
      showToast('Reply dispatched to customer live chat!', 'success');
      setReplyText('');
      loadConversations();
    } catch (err: any) {
      showToast(err?.message || 'Failed to dispatch reply.', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.adminResolveSupportConversation(id);
      showToast('Conversation marked as resolved.', 'success');
      loadConversations();
    } catch (err: any) {
      showToast(err?.message || 'Failed to resolve conversation.', 'error');
    }
  };

  const handleReopen = async (id: string) => {
    try {
      await api.adminReopenSupportConversation(id);
      showToast('Conversation reopened.', 'info');
      loadConversations();
    } catch (err: any) {
      showToast(err?.message || 'Failed to reopen conversation.', 'error');
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            Customer Support Conversations
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Two-way sync: Customer messages via website &bull; WhatsApp replies routed automatically
          </p>
        </div>

        <button
          onClick={loadConversations}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '420px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search reference (e.g. FC-1024), name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        {/* Status Filter Chips */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'open', 'resolved', 'closed'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: statusFilter === status ? 'var(--brand-primary)' : 'var(--bg-surface)',
                color: statusFilter === status ? '#FFFFFF' : 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: List on Left, Thread Inspector on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedConversation ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        
        {/* Left Column: Conversation List */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <MessageCircle size={40} style={{ color: 'var(--border-subtle)', marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>No Conversations Found</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Customer messages from the website will appear here in real-time.
              </p>
            </div>
          ) : (
            <div>
              {conversations.slice((convPage - 1) * convPageSize, convPage * convPageSize).map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                const lastMsg = conv.messages && conv.messages.length > 0
                  ? conv.messages[conv.messages.length - 1]
                  : null;
                const time = new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    style={{
                      padding: '1.15rem 1.25rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--brand-accent-light)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: 'var(--brand-primary)',
                          fontFamily: 'monospace',
                          backgroundColor: 'var(--bg-secondary)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {conv.reference}
                        </span>

                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {conv.customer_name || 'Bakery Guest'}
                        </span>

                        <span className={`badge ${conv.status === 'OPEN' ? 'badge-caramel' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                          {conv.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lastMsg ? lastMsg.text : 'No messages yet'}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>📞 {conv.customer_contact || 'Website Guest'}</span>
                        <span>&bull;</span>
                        <span>Routed to {conv.assigned_whatsapp_number}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        {time}
                      </div>
                      <ChevronRight size={18} style={{ color: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
                    </div>
                  </div>
                );
              })}

              <div style={{ padding: '0.75rem 1rem 1rem 1rem' }}>
                <Pagination
                  currentPage={convPage}
                  totalPages={Math.ceil(conversations.length / convPageSize) || 1}
                  totalCount={conversations.length}
                  pageSize={convPageSize}
                  pageSizeOptions={[5, 10, 20]}
                  onPageChange={setConvPage}
                  onPageSizeChange={(sz) => { setConvPageSize(sz); setConvPage(1); }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Thread Inspector & Reply Form */}
        {selectedConversation && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            height: '640px',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden'
          }}>
            {/* Inspector Header */}
            <div style={{
              padding: '1.15rem 1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '1rem', color: 'var(--brand-primary)' }}>
                    {selectedConversation.reference}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                    {selectedConversation.customer_name || 'Bakery Guest'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Customer Contact: {selectedConversation.customer_contact || 'None'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedConversation.status === 'OPEN' ? (
                  <button
                    type="button"
                    onClick={() => handleResolve(selectedConversation.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleReopen(selectedConversation.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              backgroundColor: 'var(--bg-primary)'
            }}>
              {selectedConversation.messages && selectedConversation.messages.map((m) => {
                const isAdminMsg = m.sender_type === 'ADMIN';
                const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAdminMsg ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    <div style={{
                      maxWidth: '82%',
                      padding: '0.75rem 1rem',
                      borderRadius: isAdminMsg ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: isAdminMsg ? '#25D366' : 'var(--bg-surface)',
                      color: isAdminMsg ? '#FFFFFF' : 'var(--text-primary)',
                      boxShadow: 'var(--shadow-sm)',
                      border: isAdminMsg ? 'none' : '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                      lineHeight: 1.45
                    }}>
                      <div style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: isAdminMsg ? 'rgba(255,255,255,0.9)' : 'var(--brand-primary)',
                        marginBottom: '3px'
                      }}>
                        {isAdminMsg ? '👑 Owner Admin' : selectedConversation.customer_name || 'Customer'}
                      </div>
                      {m.text}
                    </div>

                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px', padding: '0 4px' }}>
                      {time} &bull; {m.delivery_status}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Composer Bar */}
            <form onSubmit={handleSendReply} style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="Reply directly to customer's live chat..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-secondary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={sendingReply || !replyText.trim()}
                className="btn btn-primary btn-sm"
                style={{ height: '38px', borderRadius: 'var(--radius-full)' }}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
