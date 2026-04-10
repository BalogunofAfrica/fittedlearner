import { Link, Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useThemeMode } from '../lib/theme';

const navItems = [
  { label: 'Projects', to: '/projects' },
  { label: 'Articles', to: '/articles' },
  { label: 'Reading Notes', to: '/reading-notes' },
];

export function RootLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeMode();
  const isDarkTheme = theme === 'dark';
  const toggleLabel = isDarkTheme
    ? 'Switch to light mode'
    : 'Switch to dark mode';
  const iconGlyph = isDarkTheme ? '日' : '月';
  const mobileMenuLabel = isMobileMenuOpen
    ? 'Close navigation menu'
    : 'Open navigation menu';
  const mobileMenuGlyph = isMobileMenuOpen ? '閉' : 'メ';

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.removeProperty('overflow');
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.removeProperty('overflow');
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="site-header">
        <Link to="/" className="site-brand" aria-label="Go to homepage">
          <span className="site-brand-mark">文</span>
          <span className="site-brand-text">fitted learner</span>
        </Link>

        <nav
          id="primary-navigation"
          className={`site-nav${isMobileMenuOpen ? ' is-open' : ''}`}
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-link"
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
              activeProps={{
                'aria-current': 'page',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-controls">
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

          <button
            type="button"
            className="menu-toggle"
            onClick={() => {
              setIsMobileMenuOpen((previousState) => !previousState);
            }}
            aria-controls="primary-navigation"
            aria-expanded={isMobileMenuOpen}
            aria-label={mobileMenuLabel}
            title={mobileMenuLabel}
          >
            <span className="menu-toggle-icon" aria-hidden="true">
              {mobileMenuGlyph}
            </span>
            <span className="sr-only">{mobileMenuLabel}</span>
          </button>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <button
          type="button"
          className="menu-backdrop"
          onClick={() => {
            setIsMobileMenuOpen(false);
          }}
          aria-label="Close navigation menu"
        />
      ) : null}

      <main id="main-content" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Built with React + TanStack Router.</p>
      </footer>
    </div>
  );
}
