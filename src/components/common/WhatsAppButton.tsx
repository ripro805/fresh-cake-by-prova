import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minus, 
  Sparkles, 
  Clock, 
  Check, 
  CheckCheck, 
  User, 
  Phone,
  RotateCw,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../api/client';

interface SupportMessageItem {
  id: string;
  sender_type: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
  sender_name?: string;
  text: string;
  delivery_status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  created_at: string;
}

interface SupportConversationData {
  id: string;
  reference: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  customer_name?: string;
  customer_contact?: string;
  assigned_whatsapp_number?: string;
  messages: SupportMessageItem[];
}

const SESSION_KEY_STORAGE = 'fresh_cake_support_session_v1';
const CONV_REF_STORAGE = 'fresh_cake_support_ref_v1';

export const WhatsAppButton: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { settings, showToast } = useSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<SupportConversationData | null>(null);
  const [messages, setMessages] = useState<SupportMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<number | null>(null);

  // Initialize or restore session key
  const getSessionKey = (): string => {
    let key = localStorage.getItem(SESSION_KEY_STORAGE);
    if (!key) {
      key = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY_STORAGE, key);
    }
    return key;
  };

  // Scroll to bottom of message thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Restore existing conversation on mount
  useEffect(() => {
    const savedRef = localStorage.getItem(CONV_REF_STORAGE);
    const sessionKey = getSessionKey();

    if (savedRef) {
      api.getSupportConversation(savedRef, sessionKey)
        .then((data: SupportConversationData) => {
          if (data && data.reference) {
            setConversation(data);
            setMessages(data.messages || []);
          }
        })
        .catch(() => {
          // If conversation expired or not found, clear storage
          localStorage.removeItem(CONV_REF_STORAGE);
        });
    }
  }, []);

  // Poll for admin WhatsApp replies while the chat window is open
  useEffect(() => {
    if (isOpen && conversation?.reference) {
      const sessionKey = getSessionKey();
      
      const poll = async () => {
        try {
          setIsPolling(true);
          const data = await api.pollSupportMessages(conversation.reference, sessionKey);
          if (data && Array.isArray(data.messages)) {
            setMessages(data.messages);
            if (data.status) {
              setConversation(prev => prev ? { ...prev, status: data.status as any } : null);
            }
          }
        } catch {
          // Silent catch to prevent console spam
        } finally {
          setIsPolling(false);
        }
      };

      // Initial immediate check
      poll();

      // Poll every 3.5 seconds
      pollIntervalRef.current = window.setInterval(poll, 3500);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [isOpen, conversation?.reference]);

  // Scroll on new messages
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Quick inquiry prompts
  const quickEnquiries = [
    '🎂 Inquiring about a Custom Cake quote',
    '📦 Check delivery status in Kushtia',
    '🍩 Fresh donut assortment availability',
    '🥟 Delivery timing for steamed momos'
  ];

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputText).trim();
    if (!messageText) return;

    const sessionKey = getSessionKey();

    setIsSending(true);

    try {
      if (!conversation) {
        // Create new conversation with first message
        const payload = {
          guest_name: currentUser?.name || guestName.trim() || 'Bakery Guest',
          guest_phone: currentUser?.phone || guestPhone.trim() || '',
          guest_email: currentUser?.email || '',
          session_key: sessionKey,
          initial_message: messageText,
        };

        const res = await api.createSupportConversation(payload);
        if (res && res.reference) {
          setConversation(res);
          setMessages(res.messages || []);
          localStorage.setItem(CONV_REF_STORAGE, res.reference);
          setInputText('');
          showToast(`Live inquiry connected! Reference: ${res.reference}`, 'success');
        }
      } else {
        // Send to existing conversation
        // Optimistic UI update
        const optimisticMsg: SupportMessageItem = {
          id: 'temp-' + Date.now(),
          sender_type: 'CUSTOMER',
          sender_name: currentUser?.name || guestName || 'You',
          text: messageText,
          delivery_status: 'SENT',
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setInputText('');

        const res = await api.sendSupportMessage(conversation.reference, messageText, sessionKey);
        if (res && res.id) {
          // Replace optimistic message with confirmed server message
          setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? res : m));
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to deliver message. Please retry.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleStartNewConversation = () => {
    localStorage.removeItem(CONV_REF_STORAGE);
    setConversation(null);
    setMessages([]);
    setInputText('');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 998,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#25D366',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isOpen ? 'rotate(90deg)' : 'scale(1)'
          }}
          title="Live WhatsApp Support — FRESH CAKE by PROVA"
          aria-label="Open Live WhatsApp Customer Support"
        >
          {isOpen ? <X size={26} /> : <MessageCircle size={28} />}
          
          {/* Pulsing online status indicator */}
          {!isOpen && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                border: '2px solid #FFFFFF',
                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.4)'
              }}
            />
          )}
        </button>
      </div>

      {/* Main Support Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: 'clamp(320px, 90vw, 390px)',
            height: '560px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#1C1410',
              backgroundImage: 'linear-gradient(135deg, #221812 0%, #170E0A 100%)',
              color: '#FFFFFF',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(217, 185, 155, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)'
                }}
              >
                <MessageCircle size={20} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0, color: '#FFFFFF', fontFamily: 'var(--font-serif)' }}>
                    FRESH CAKE
                  </h4>
                  <span style={{ fontSize: '0.65rem', color: '#D9B99B', letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase' }}>
                    by PROVA
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.78)', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#25D366', display: 'inline-block' }} />
                  <span>WhatsApp Live Sync</span>
                  {isPolling && <RotateCw size={10} className="animate-spin" style={{ color: '#D9B99B' }} />}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%'
                }}
                title="Minimize Chat"
                aria-label="Minimize Chat"
              >
                <Minus size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%'
                }}
                title="Close Chat"
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Active Conversation Reference Banner */}
          {conversation && (
            <div
              style={{
                backgroundColor: 'var(--brand-accent-light)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '0.45rem 1rem',
                fontSize: '0.74rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--brand-primary)',
                fontWeight: 700
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} />
                <span>Ticket: <strong>{conversation.reference}</strong></span>
                <span style={{ opacity: 0.6 }}>&bull;</span>
                <span style={{ textTransform: 'capitalize' }}>{conversation.status.toLowerCase()}</span>
              </div>

              <button
                type="button"
                onClick={handleStartNewConversation}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-secondary)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'underline'
                }}
              >
                New Chat
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              backgroundColor: 'var(--bg-primary)'
            }}
          >
            {/* Initial Welcome Greeting */}
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                FC
              </div>
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '0.8rem 1rem',
                  borderRadius: '4px 16px 16px 16px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-subtle)',
                  maxWidth: '82%',
                  fontSize: '0.84rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--brand-primary)', marginBottom: '3px' }}>
                  PROVA Artisan Studio
                </div>
                Hello! Welcome to FRESH CAKE by PROVA live bakery support. Your messages route directly to our WhatsApp so you can discuss custom cakes, timings, and flavors in real-time.
              </div>
            </div>

            {/* Quick Enquiries if starting a fresh session */}
            {!conversation && messages.length === 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Frequently Asked Topics:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {quickEnquiries.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      style={{
                        textAlign: 'left',
                        padding: '0.55rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Thread */}
            {messages.map((msg) => {
              const isMe = msg.sender_type === 'CUSTOMER';
              const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '0.75rem 0.95rem',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: isMe ? 'var(--brand-primary)' : 'var(--bg-surface)',
                      color: isMe ? '#FFFFFF' : 'var(--text-primary)',
                      boxShadow: 'var(--shadow-sm)',
                      border: isMe ? 'none' : '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                      lineHeight: 1.45,
                      wordBreak: 'break-word'
                    }}
                  >
                    {!isMe && (
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#25D366', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                        <span>WhatsApp Owner</span>
                      </div>
                    )}
                    {msg.text}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      marginTop: '3px',
                      padding: '0 4px'
                    }}
                  >
                    <span>{time}</span>
                    {isMe && (
                      msg.delivery_status === 'DELIVERED' || msg.delivery_status === 'READ' ? (
                        <CheckCheck size={12} style={{ color: '#25D366' }} />
                      ) : (
                        <Check size={12} style={{ color: 'var(--text-muted)' }} />
                      )
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Guest Identity Form if not logged in and no conversation yet */}
          {!currentUser && !conversation && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderTop: '1px solid var(--border-subtle)',
                padding: '0.75rem 1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem'
              }}
            >
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.5rem 0.4rem 1.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                />
                <User size={12} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  placeholder="Your Phone Number"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.5rem 0.4rem 1.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                />
                <Phone size={12} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message to the bakery..."
              style={{
                flex: 1,
                padding: '0.65rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-secondary)',
                fontSize: '0.85rem',
                outline: 'none',
                color: 'var(--text-primary)'
              }}
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isSending || !inputText.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: inputText.trim() ? '#25D366' : 'var(--border-subtle)',
                color: '#FFFFFF',
                border: 'none',
                cursor: inputText.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title="Send to WhatsApp"
              aria-label="Send Message"
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}
    </>
  );
};
