import { useTheme } from '../features/theme/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="nebula-btn nebula-btn-ghost nebula-btn-sm"
      style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', border: '1px solid var(--nebula-border)' }}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
      aria-label="Toggle visual theme"
    >
      {theme === 'dark' ? '☀' : '🌙'}
    </button>
  );
}

