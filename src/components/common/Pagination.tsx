import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  totalCount?: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showingLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showingLabel = 'results',
  className = '',
  style = {}
}) => {
  const actualTotal = totalCount ?? totalItems ?? 0;

  // If there are no items or only 1 page with actualTotal <= pageSize and no custom size change, return null or minimal
  if (actualTotal <= 0) return null;

  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startItem = actualTotal === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(validCurrentPage * pageSize, actualTotal);

  // Generate pagination buttons with smart ellipsis
  const getPageNumbers = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
    pages.push(1);

    if (validCurrentPage > 3) {
      pages.push('ellipsis-start');
    }

    const start = Math.max(2, validCurrentPage - 1);
    const end = Math.min(totalPages - 1, validCurrentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (validCurrentPage < totalPages - 2) {
      pages.push('ellipsis-end');
    }

    pages.push(totalPages);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div 
      className={`pagination-container ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.25rem 0',
        marginTop: '1.5rem',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        ...style
      }}
      aria-label="Pagination Navigation"
    >
      {/* 1. Showing X-Y of Z */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{startItem}</strong>–<strong style={{ color: 'var(--text-primary)' }}>{endItem}</strong> of{' '}
          <strong style={{ color: 'var(--brand-primary)' }}>{actualTotal}</strong> {showingLabel}
        </span>

        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '0.5rem' }}>
            <label htmlFor="pagination-page-size" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Per page:
            </label>
            <select
              id="pagination-page-size"
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize);
              }}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Controls & Page Numbers */}
      {totalPages > 1 && (
        <nav 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px',
            backgroundColor: 'var(--bg-surface)',
            padding: '4px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xs)'
          }}
          aria-label="Page navigation"
        >
          {/* First Page button (only for multi-page counts > 5) */}
          {totalPages > 5 && (
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={validCurrentPage === 1}
              style={{
                width: '34px',
                height: '34px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'transparent',
                color: validCurrentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: validCurrentPage === 1 ? 0.45 : 1,
                transition: 'all 0.15s ease'
              }}
              title="First Page"
              aria-label="Go to first page"
            >
              <ChevronsLeft size={16} />
            </button>
          )}

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, validCurrentPage - 1))}
            disabled={validCurrentPage === 1}
            style={{
              padding: '0.35rem 0.65rem',
              height: '34px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              color: validCurrentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: validCurrentPage === 1 ? 0.45 : 1,
              transition: 'all 0.15s ease'
            }}
            aria-label="Go to previous page"
          >
            <ChevronLeft size={16} />
            <span className="pagination-label-prev">Prev</span>
          </button>

          {/* Page numbers */}
          {pages.map((p, idx) => {
            if (p === 'ellipsis-start' || p === 'ellipsis-end') {
              return (
                <span
                  key={`${p}-${idx}`}
                  style={{
                    width: '32px',
                    height: '34px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    userSelect: 'none'
                  }}
                >
                  &hellip;
                </span>
              );
            }

            const isCurrent = p === validCurrentPage;

            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isCurrent ? 'page' : undefined}
                style={{
                  minWidth: '34px',
                  height: '34px',
                  padding: '0 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-md)',
                  border: isCurrent ? '1px solid var(--brand-primary)' : '1px solid transparent',
                  backgroundColor: isCurrent ? 'var(--brand-primary)' : 'transparent',
                  color: isCurrent ? '#FFFFFF' : 'var(--text-primary)',
                  fontWeight: isCurrent ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: isCurrent ? 'default' : 'pointer',
                  boxShadow: isCurrent ? '0 2px 6px rgba(74, 36, 24, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {p}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, validCurrentPage + 1))}
            disabled={validCurrentPage === totalPages}
            style={{
              padding: '0.35rem 0.65rem',
              height: '34px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              color: validCurrentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: validCurrentPage === totalPages ? 0.45 : 1,
              transition: 'all 0.15s ease'
            }}
            aria-label="Go to next page"
          >
            <span className="pagination-label-next">Next</span>
            <ChevronRight size={16} />
          </button>

          {/* Last Page button (only for multi-page counts > 5) */}
          {totalPages > 5 && (
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={validCurrentPage === totalPages}
              style={{
                width: '34px',
                height: '34px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'transparent',
                color: validCurrentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: validCurrentPage === totalPages ? 0.45 : 1,
                transition: 'all 0.15s ease'
              }}
              title="Last Page"
              aria-label="Go to last page"
            >
              <ChevronsRight size={16} />
            </button>
          )}
        </nav>
      )}
    </div>
  );
};
