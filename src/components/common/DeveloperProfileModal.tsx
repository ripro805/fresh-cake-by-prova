import React, { useEffect } from 'react';
import { 
  X, 
  MapPin, 
  GraduationCap, 
  Mail, 
  Phone, 
  MessageCircle, 
  Globe, 
  Code2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface DeveloperProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperProfileModal: React.FC<DeveloperProfileModalProps> = ({ isOpen, onClose }) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Contact and Profile details
  const developer = {
    name: "Md. Rifat Islam Rizvi",
    title: "AI/ML + Full-Stack Builder",
    location: "Kushtia, Bangladesh",
    image: "/developer/rifat-rizvi.jpeg",
    education: {
      university: "Gopalganj Science and Technology University",
      degree: "Bachelor of Science (B.Sc.)",
      department: "Computer Science and Engineering (CSE)",
      duration: "2023–2027 (Expected)",
    },
    skills: [
      { category: "Languages", items: ["C", "C++", "Python", "JavaScript", "HTML", "CSS"] },
      { category: "Frameworks & Tools", items: ["React", "Tailwind CSS", "Node.js", "Django"] },
      { category: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB"] },
      { category: "AI & Data Science", items: ["NumPy", "Pandas", "Matplotlib", "Seaborn", "Plotly", "Scikit-learn"] },
    ],
    contact: {
      email: "rifatrizviofficial001@gmail.com",
      phone: "+8801305612767",
      whatsapp: "+8801305612767",
      github: "https://github.com/ripro805",
      linkedin: "https://www.linkedin.com/in/md-rifat-islam-rizvi-9b5273328/",
      portfolio: import.meta.env.VITE_DEVELOPER_PORTFOLIO_URL || "https://github.com/ripro805/portfolio-rizvi",
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="developer-modal-title"
      style={{
        zIndex: 9999,
        padding: '1.25rem',
      }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '2rem 1.75rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Profile"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--brand-accent-light)';
            e.currentTarget.style.color = 'var(--brand-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <X size={18} />
        </button>

        {/* Header: Photo + Name + Title + Location */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.75rem' }}>
          
          {/* Profile Picture with Bakery Theme Ring */}
          <div style={{ position: 'relative', marginBottom: '1.15rem' }}>
            <div 
              style={{
                width: '108px',
                height: '108px',
                borderRadius: '50%',
                padding: '4px',
                backgroundColor: 'var(--bg-primary)',
                border: '2px solid var(--brand-secondary)',
                boxShadow: '0 8px 24px rgba(121, 84, 61, 0.18)',
                overflow: 'hidden',
                margin: '0 auto'
              }}
            >
              <img 
                src={developer.image}
                alt={developer.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%'
                }}
                onError={(e) => {
                  // Fallback if image path differs
                  (e.currentTarget as HTMLImageElement).src = '/brand/logo.jpeg';
                }}
              />
            </div>
            
            {/* Subtle Verified / Builder Badge */}
            <span 
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '4px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-surface)',
                boxShadow: 'var(--shadow-sm)'
              }}
              title="Verified Developer"
            >
              <Sparkles size={12} />
            </span>
          </div>

          {/* Full Name */}
          <h2 
            id="developer-modal-title"
            style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '1.65rem', 
              fontWeight: 700, 
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
              letterSpacing: '-0.01em'
            }}
          >
            {developer.name}
          </h2>

          {/* Professional Title */}
          <div 
            style={{ 
              fontSize: '0.98rem', 
              fontWeight: 600, 
              color: 'var(--brand-primary)',
              marginBottom: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{developer.title}</span>
          </div>

          {/* Location */}
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.86rem', 
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-primary)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <MapPin size={14} style={{ color: 'var(--brand-secondary)' }} />
            <span>{developer.location}</span>
          </div>
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0 0 1.5rem 0' }} />

        {/* Education Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
              <GraduationCap size={16} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Education
            </h3>
          </div>

          <div 
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem 1.15rem',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.94rem', marginBottom: '0.2rem' }}>
              {developer.education.university}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--brand-primary)', fontWeight: 500, marginBottom: '0.25rem' }}>
              {developer.education.degree} in {developer.education.department}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Duration: {developer.education.duration}
            </div>
          </div>
        </div>

        {/* Technical Skills Section */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
              <Code2 size={16} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Technical Skills
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {developer.skills.map((group, idx) => (
              <div 
                key={idx}
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.45rem' }}>
                  {group.category}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {group.items.map((skill, sIdx) => (
                    <span 
                      key={sIdx}
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        padding: '0.2rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0 0 1.5rem 0' }} />

        {/* Contact & Social Links */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
            Connect &amp; Contact
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem', marginBottom: '1rem' }}>
            
            {/* Email */}
            <a 
              href={`mailto:${developer.contact.email}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.backgroundColor = 'var(--brand-accent-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', flexShrink: 0 }}>
                <Mail size={16} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Email</span>
                <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{developer.contact.email}</span>
              </div>
            </a>

            {/* Phone */}
            <a 
              href={`tel:${developer.contact.phone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.backgroundColor = 'var(--brand-accent-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', flexShrink: 0 }}>
                <Phone size={16} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Phone</span>
                <span style={{ fontWeight: 600 }}>{developer.contact.phone}</span>
              </div>
            </a>

            {/* WhatsApp */}
            <a 
              href={`https://wa.me/${developer.contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent("Hello Rifat! I'm reaching out through the FRESH CAKE by PROVA platform.")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#25D366';
                e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                <MessageCircle size={16} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>WhatsApp</span>
                <span style={{ fontWeight: 600 }}>{developer.contact.whatsapp}</span>
              </div>
            </a>

            {/* GitHub */}
            <a 
              href={developer.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.backgroundColor = 'var(--brand-accent-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', flexShrink: 0 }}>
                <GithubIcon size={16} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>GitHub</span>
                <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  ripro805
                  <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
                </span>
              </div>
            </a>

            {/* LinkedIn */}
            <a 
              href={developer.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0A66C2';
                e.currentTarget.style.backgroundColor = 'rgba(10, 102, 194, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                <LinkedinIcon size={16} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>LinkedIn</span>
                <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Md. Rifat Islam Rizvi
                  <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
                </span>
              </div>
            </a>

            {/* Personal Portfolio */}
            <a 
              href={developer.contact.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.backgroundColor = 'var(--brand-accent-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', flexShrink: 0 }}>
                <Globe size={16} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Portfolio</span>
                <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Personal Portfolio
                  <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
                </span>
              </div>
            </a>

          </div>
        </div>

      </div>
    </div>
  );
};
