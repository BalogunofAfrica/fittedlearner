import { Link, Outlet } from '@tanstack/react-router';
import { useThemeMode } from '../lib/theme';

const navItems = [
  { label: 'Projects', to: '/projects' },
  { label: 'Articles', to: '/articles' },
  { label: 'Reading Notes', to: '/reading-notes' },
];

export function RootLayout() {
  const { theme, toggleTheme } = useThemeMode();
  const isDarkTheme = theme === 'dark';
  const toggleLabel = isDarkTheme
    ? 'Switch to light mode'
    : 'Switch to dark mode';
  const iconGlyph = isDarkTheme ? '日' : '月';

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="site-brand">
          <span className="site-brand-mark">文</span>
          <span className="site-brand-text">fitted learner</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-link"
              activeProps={{
                'aria-current': 'page',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={toggleLabel}
          title={toggleLabel}
        >
          <span className="theme-toggle-icon" aria-hidden="true">
            {iconGlyph}
          </span>
          <span className="sr-only">{toggleLabel}</span>
        </button>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Built with React + TanStack Router.</p>
      </footer>
    </div>
  );
}
