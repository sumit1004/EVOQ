import React from 'react';
import { Icon } from '../Icons.jsx';

export function Button({
  as: Component = 'button',
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  iconRight,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'ops'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  className = '',
  ...props
}) {
  const sizeClass = size === 'sm' ? 'evoq-btn-sm' : size === 'lg' ? 'evoq-btn-lg' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  let variantClass = 'evoq-btn-primary';

  if (variant === 'secondary') variantClass = 'evoq-btn-secondary';
  else if (variant === 'ghost') variantClass = 'evoq-btn-ghost';
  else if (variant === 'danger') variantClass = 'evoq-btn-danger';
  else if (variant === 'ops' || variant === 'cyan') variantClass = 'evoq-btn-ops';

  const isButton = Component === 'button';
  const buttonProps = isButton ? { type, disabled: disabled || loading } : {};

  return (
    <Component
      onClick={onClick}
      className={`evoq-btn ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      {...buttonProps}
      {...props}
    >
      {loading ? (
        <span className="evoq-spinner" aria-hidden="true" />
      ) : icon ? (
        <Icon name={icon} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      <span>{children}</span>
      {iconRight && !loading && (
        <Icon name={iconRight} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      )}
    </Component>
  );
}

export function PrimaryButton({
  as = 'button',
  variant = 'brand', // 'brand' | 'ops'
  ...props
}) {
  const mappedVariant = variant === 'ops' ? 'ops' : 'primary';
  return <Button as={as} variant={mappedVariant} {...props} />;
}

export function SecondaryButton({
  as = 'button',
  variant = 'secondary', // 'secondary' | 'ghost' | 'danger' | 'ops'
  ...props
}) {
  return <Button as={as} variant={variant} {...props} />;
}

export function IconButton({
  icon,
  onClick,
  type = 'button',
  label,
  disabled = false,
  active = false,
  badge,
  variant = 'default', // 'default' | 'lime' | 'danger' | 'ops'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  as: Component = 'button',
  ...props
}) {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 18;
  const sizeClass = size === 'sm' ? 'evoq-icon-btn-sm' : size === 'lg' ? 'evoq-icon-btn-lg' : '';
  const variantClass =
    variant === 'lime'
      ? 'evoq-icon-btn-lime'
      : variant === 'danger'
      ? 'evoq-icon-btn-danger'
      : variant === 'ops'
      ? 'evoq-icon-btn-ops'
      : '';

  const isButton = Component === 'button';
  const buttonProps = isButton ? { type, disabled } : {};

  return (
    <Component
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`evoq-icon-btn ${active ? 'active' : ''} ${sizeClass} ${variantClass} ${className}`.trim()}
      {...buttonProps}
      {...props}
    >
      <Icon name={icon} size={iconSize} />
      {badge !== undefined && badge !== null && (
        <span className="evoq-badge-counter">{badge}</span>
      )}
    </Component>
  );
}
