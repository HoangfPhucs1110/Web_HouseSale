import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const { currentUser } = useSelector((s) => s.user);
  const user = currentUser?.rest ?? currentUser ?? null;

  const [searchTerm, setSearchTerm] = useState('');
  const [openExplore, setOpenExplore] = useState(false); // desktop dropdown
  const [openDrawer, setOpenDrawer] = useState(false);   // mobile drawer

  const navigate = useNavigate();
  const location = useLocation();
  const exploreRef = useRef(null);

  const isActive = (path) =>
    location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setSearchTerm(urlParams.get('searchTerm') || '');
  }, [location.search]);

  // đóng dropdown desktop khi click ra ngoài
  useEffect(() => {
    function onClickOutside(e) {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setOpenExplore(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // submit search
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm || '');
    navigate(`/search?${urlParams.toString()}`);
    setOpenDrawer(false);
  };

  // link helper
  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={() => {
        setOpenDrawer(false);
        onClick?.();
      }}
      className={`px-2 py-1 rounded-md transition ${
        isActive(to) ? 'text-emerald-300' : 'text-slate-200 hover:text-emerald-300'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 sticky top-0 z-50 shadow">
      <div className="max-w-6xl mx-auto px-3 py-3 flex items-center gap-3">
        {/* Hamburger (mobile) */}
        <button
          className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:bg-white/10"
          onClick={() => setOpenDrawer(true)}
          aria-label="Mở menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
          </svg>
        </button>

        {/* Logo */}
        <Link to="/" onClick={() => setOpenDrawer(false)}>
          <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight flex items-center">
            <span className="text-emerald-400">PP</span>
            <span className="text-white ml-1">House</span>
          </h1>
        </Link>

        {/* Search (desktop & tablet) */}
        <form
          onSubmit={handleSubmit}
          className="hidden sm:flex bg-white/95 backdrop-blur px-3 py-2 rounded-full items-center shadow-inner ml-auto lg:ml-6 flex-1 max-w-md"
        >
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="bg-transparent focus:outline-none w-full text-sm text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" aria-label="Tìm kiếm">
            <FaSearch className="text-slate-600 hover:text-emerald-600 transition ml-2" />
          </button>
        </form>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-2 ml-4">
          <NavLink to="/">Trang chủ</NavLink>

          {/* Dropdown Khám phá (desktop) */}
          <div className="relative" ref={exploreRef}>
            <button
              onClick={() => setOpenExplore((v) => !v)}
              className="px-2 py-1 rounded-md text-slate-200 hover:text-emerald-300 flex items-center gap-1"
            >
              Khám phá
              <svg
                className={`w-4 h-4 transition ${openExplore ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
              </svg>
            </button>
            {openExplore && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-slate-200 overflow-hidden">
                <div className="p-2 text-sm">
                  {[
                    ['/search', 'Tìm kiếm'],
                    ['/guide', 'Hướng dẫn đăng tin'],
                    ['/faq', 'Câu hỏi thường gặp'],
                    ['/about', 'Giới thiệu'],
                    ['/dudoan', 'Dự đoán giá'],
                  ].map(([to, label]) => (
                    <Link
                      key={to}
                      to={to}
                      className={`block px-3 py-2 rounded-md ${
                        isActive(to) ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => setOpenExplore(false)}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {user?.isAdmin && <NavLink to="/admin/users">Quản trị</NavLink>}

          <Link
            to="/create-listing"
            className="ml-1 px-3 py-2 rounded-lg bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 transition"
          >
            Đăng tin
          </Link>

          <div className="ml-2">
            {user ? (
              <Link to="/profile" className="block">
                <img
                  className="rounded-full h-9 w-9 object-cover ring-2 ring-emerald-400"
                  src={user?.avatar}
                  alt="profile"
                  referrerPolicy="no-referrer"
                />
              </Link>
            ) : (
              <Link
                to="/signin"
                className="text-slate-200 hover:text-emerald-300 font-medium"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* ======== MOBILE DRAWER ======== */}
      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          openDrawer ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpenDrawer(false)}
      />

      {/* Panel trượt từ cạnh trái */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 h-full w-[85%] max-w-[340px]
          bg-slate-900 text-white shadow-2xl
          transform transition-transform duration-300
          ${openDrawer ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
        aria-hidden={!openDrawer}
      >
        {/* Header drawer */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
          <Link to="/" onClick={() => setOpenDrawer(false)}>
            <h2 className="font-extrabold text-xl tracking-tight">
              <span className="text-emerald-400">PP</span>
              <span className="text-white ml-1">House</span>
            </h2>
          </Link>
          <button
            onClick={() => setOpenDrawer(false)}
            className="p-2 rounded-md hover:bg-white/10"
            aria-label="Đóng menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.225 4.811L4.811 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586z"/>
            </svg>
          </button>
        </div>

        {/* Search trong drawer (mobile) */}
        <div className="px-4 pt-3">
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur px-3 py-2 rounded-full flex items-center shadow-inner"
          >
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="bg-transparent focus:outline-none w-full text-sm text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" aria-label="Tìm kiếm">
              <FaSearch className="text-slate-600 hover:text-emerald-600 transition ml-2" />
            </button>
          </form>
        </div>

        {/* Nav (dọc) */}
        <nav className="px-2 py-4 flex-1 overflow-y-auto">
          <Section title="Điều hướng">
            <DrawerLink to="/search">Tìm kiếm</DrawerLink>
            <DrawerLink to="/guide">Hướng dẫn đăng tin</DrawerLink>
            <DrawerLink to="/faq">Câu hỏi thường gặp</DrawerLink>
            <DrawerLink to="/about">Giới thiệu</DrawerLink>
            <DrawerLink to="/dudoan">Dự đoán giá</DrawerLink>
            {user?.isAdmin && <DrawerLink to="/admin/users">Quản trị</DrawerLink>}
          </Section>

          <Section title="Hành động">
            <Link
              to="/create-listing"
              onClick={() => setOpenDrawer(false)}
              className="block w-full text-center px-3 py-2 rounded-lg bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 transition"
            >
              Đăng tin
            </Link>
          </Section>
        </nav>

        {/* Footer drawer: avatar / đăng nhập */}
        <div className="px-4 py-3 border-t border-white/10">
          {user ? (
            <Link
              to="/profile"
              onClick={() => setOpenDrawer(false)}
              className="flex items-center gap-3"
            >
              <img
                className="rounded-full h-9 w-9 object-cover ring-2 ring-emerald-400"
                src={user?.avatar}
                alt="profile"
                referrerPolicy="no-referrer"
              />
              <div className="text-sm">
                <p className="font-semibold">{user?.username ?? 'Tài khoản'}</p>
                <span className="text-white/70">Trang cá nhân</span>
              </div>
            </Link>
          ) : (
            <Link
              to="/signin"
              onClick={() => setOpenDrawer(false)}
              className="text-slate-200 hover:text-emerald-300"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </aside>
    </header>
  );
}

/* ====== Subcomponents cho Drawer ====== */
function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="px-3 mb-2 text-xs uppercase tracking-wider text-white/60">{title}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function DrawerLink({ to, children }) {
  return (
    <Link
      to={to}
      className="mx-1 px-3 py-2 rounded-lg text-slate-200 hover:bg-white/10 hover:text-emerald-300 transition"
      onClick={() => {/* close handled in parent via Link default */}}
    >
      {children}
    </Link>
  );
}
