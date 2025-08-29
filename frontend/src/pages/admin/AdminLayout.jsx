import { Link, Outlet, useLocation } from 'react-router-dom';

export default function AdminLayout(){
  const { pathname } = useLocation();
  const active = (p) => pathname.includes(p) ? 'bg-slate-900 text-white' : 'text-slate-700';
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trang quản trị</h1>
      <div className="flex gap-2 mb-4">
        <Link to="/admin/users" className={`px-3 py-2 rounded ${active('/admin/users')}`}>Quản lý User</Link>
        <Link to="/admin/listings" className={`px-3 py-2 rounded ${active('/admin/listings')}`}>Quản lý Listing</Link>
      </div>
      <div className="rounded-xl border p-4">
        <Outlet />
      </div>
    </div>
  );
}
