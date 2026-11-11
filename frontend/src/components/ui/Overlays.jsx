import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icons.jsx';
import { PrimaryButton, SecondaryButton } from './Buttons.jsx';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '540px',
  closeOnBackdrop = true,
  className = '',
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="evoq-modal-backdrop" onClick={closeOnBackdrop ? onClose : undefined}>
      <div
        className={`evoq-modal-dialog ${className}`.trim()}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        ref={modalRef}
      >
        <div className="evoq-modal-header">
          <div>
            {title && <h3 className="evoq-modal-title">{title}</h3>}
            {subtitle && <p className="evoq-modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="evoq-modal-close-btn"
            aria-label="Close dialog"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="evoq-modal-body">{children}</div>

        {footer && <div className="evoq-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this operation?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="440px"
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
          <SecondaryButton onClick={onClose} disabled={loading}>
            {cancelText}
          </SecondaryButton>
          {danger ? (
            <SecondaryButton
              variant="danger"
              onClick={onConfirm}
              loading={loading}
            >
              {confirmText}
            </SecondaryButton>
          ) : (
            <PrimaryButton onClick={onConfirm} loading={loading}>
              {confirmText}
            </PrimaryButton>
          )}
        </div>
      }
    >
      <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
        {message}
      </p>
    </Modal>
  );
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right', // 'right' | 'left' | 'bottom'
  width = '360px',
  className = '',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="evoq-drawer-backdrop" onClick={onClose}>
      <aside
        className={`evoq-drawer-panel evoq-drawer-${position} ${className}`.trim()}
        style={{ width: position === 'bottom' ? '100%' : width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="evoq-drawer-header">
          {title && <h3 className="evoq-drawer-title">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            className="evoq-modal-close-btn"
            aria-label="Close drawer"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="evoq-drawer-body">{children}</div>
      </aside>
    </div>
  );
}

export function Dropdown({
  trigger,
  items = [],
  children,
  align = 'right', // 'left' | 'right'
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`evoq-dropdown-wrap ${className}`.trim()} ref={dropdownRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="evoq-dropdown-trigger">
        {typeof trigger === 'function' ? trigger(isOpen) : trigger}
      </div>
      {isOpen && (
        <div className={`evoq-dropdown-menu evoq-dropdown-${align}`}>
          {children ||
            items.map((item, idx) => {
              if (item.divider) {
                return <div key={`div-${idx}`} className="evoq-dropdown-divider" />;
              }
              return (
                <button
                  key={item.label || idx}
                  type="button"
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  className={`evoq-dropdown-item ${item.danger ? 'is-danger' : ''} ${
                    item.active ? 'is-active' : ''
                  }`}
                >
                  {item.icon && <Icon name={item.icon} size={16} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}

export function Tooltip({ text, children, position = 'top' }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="evoq-tooltip-wrap"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`evoq-tooltip evoq-tooltip-${position}`} role="tooltip">
          {text}
        </div>
      )}
    </div>
  );
}

