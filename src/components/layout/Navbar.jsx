import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

const primaryLinks = [
  { to: ROUTES.home, label: 'الرئيسية', end: true },
  { to: ROUTES.services, label: 'الخدمات' },
  { to: ROUTES.categories, label: 'التصنيفات' },
];

function navLinkClass({ isActive }) {
  if (isActive) return 'nav-link is-active';
  return 'nav-link';
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const profileTo = user ? ROUTES.studentProfile(user.uid) : ROUTES.studentProfile('student-ahmed');
  const profileLabel = user ? 'ملفي' : 'طالب مقدم خدمة (عينة)';

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <NavLink className="brand" to={ROUTES.home} onClick={closeMenu} aria-label="سوق خدمات الطلبة، الرئيسية">
          <span className="brand-mark" aria-hidden="true">س</span>
          <span className="brand-copy">
            <strong>سوق الطلبة</strong>
            <small>خدمات من زملاء الجامعة</small>
          </span>
        </NavLink>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={toggleMenu}
        >
          {menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
        </button>
        <nav id="site-navigation" className={`site-navigation${menuOpen ? ' is-open' : ''}`} aria-label="التنقل الرئيسي">
          <div className="nav-links">
            {primaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={navLinkClass}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink className={navLinkClass} to={ROUTES.myRequests} onClick={closeMenu}>
              طلباتي
            </NavLink>
            {!loading && (
              <NavLink className={navLinkClass} to={profileTo} onClick={closeMenu}>
                {profileLabel}
              </NavLink>
            )}
          </div>
          <div className="nav-actions">
            {user && <span className="nav-user-label">مرحبًا، {user.displayName || 'طالب مسجل'}</span>}
            {!user && (
              <>
                <NavLink className="nav-link nav-login" to={ROUTES.login} onClick={closeMenu}>
                  تسجيل الدخول
                </NavLink>
                <NavLink className="btn btn-primary nav-register" to={ROUTES.register} onClick={closeMenu}>
                  إنشاء حساب
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
