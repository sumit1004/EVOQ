import React from 'react';
import { Icon } from '../Icons.jsx';

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div className={`evoq-tabs-bar ${className}`.trim()} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`evoq-tab-item ${isActive ? 'active' : ''}`}
          >
            {tab.icon && <Icon name={tab.icon} size={15} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`evoq-tab-count ${isActive ? 'active' : ''}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  hasNext = false,
  hasPrev = false,
  className = '',
}) {
  if (totalPages <= 1 && !hasNext && !hasPrev) return null;

  const canPrev = hasPrev || currentPage > 1;
  const canNext = hasNext || currentPage < totalPages;

  return (
    <nav className={`evoq-pagination ${className}`.trim()} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canPrev}
        className="evoq-pagination-btn"
        aria-label="Previous page"
      >
        <Icon name="arrow-left" size={14} />
        <span className="evoq-pagination-btn-text">Prev</span>
      </button>

      <div className="evoq-pagination-info">
        <span className="evoq-pagination-curr">PAGE {currentPage}</span>
        {totalPages > 1 && (
          <span className="evoq-pagination-total">OF {totalPages}</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNext}
        className="evoq-pagination-btn"
        aria-label="Next page"
      >
        <span className="evoq-pagination-btn-text">Next</span>
        <Icon name="arrow-right" size={14} />
      </button>
    </nav>
  );
}

