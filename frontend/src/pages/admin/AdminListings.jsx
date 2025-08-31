import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminListings(){
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const fetchListings = async (p=1) => {
    try{
      setLoading(true); setErr('');
      const res = await fetch(`/api/admin/listings?search=${encodeURIComponent(q)}&page=${p}&limit=${limit}`, { credentials:'include' });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items || []);
      setPage(data.page); setTotal(data.total);
    }catch(e){ setErr(e.message); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchListings(1); }, []);

  const removeListing = async (id) => {
    if(!confirm('Xoá bài đăng này?')) return;
    const res = await fetch(`/api/admin/listings/${id}`, { method:'DELETE', credentials:'include' });
    if(res.ok) fetchListings(page);
  };

  const pages = Math.ceil(total/limit)||1;

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input className="border p-2 rounded flex-1" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Tìm theo tên listing..." />
        <button onClick={()=>fetchListings(1)} className="px-3 py-2 rounded bg-slate-900 text-white">Tìm</button>
      </div>

      {err && <div className="mb-3 text-red-600">{err}</div>}
      {loading ? <div>Đang tải...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(l => (
            <div key={l._id} className="rounded-xl border overflow-hidden">
              <img src={l.imageUrls?.[0]} alt={l.name} className="h-40 w-full object-cover" />
              <div className="p-3 space-y-1">
                <div className="font-semibold line-clamp-1">{l.name}</div>
                <div className="text-sm text-slate-500 line-clamp-1">{l.address}</div>
                <div className="text-slate-800 font-bold">
                  ${ (l.offer ? l.discountPrice : l.regularPrice)?.toLocaleString('en-US') }
                  {l.type==='rent' && <span className="text-sm text-slate-500"> /month</span>}
                </div>
                <div className="flex gap-2 pt-2">
                  <Link to={`/listing/${l._id}`} className="px-3 py-1 rounded border">Xem</Link>
                  {/* Nếu có trang sửa (re-use trang CreateListing ở chế độ edit) */}
                  <Link to={`/update-listing/${l._id}`} className="px-3 py-1 rounded border">Sửa</Link>
                  <button onClick={()=>removeListing(l._id)} className="px-3 py-1 rounded bg-red-600 text-white">Xoá</button>
                </div>
              </div>
            </div>
          ))}
          {items.length===0 && <div>Không có dữ liệu</div>}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button disabled={page<=1} onClick={()=>fetchListings(page-1)} className="px-3 py-1 rounded border disabled:opacity-50">Trước</button>
        <span>Trang {page}/{pages}</span>
        <button disabled={page>=pages} onClick={()=>fetchListings(page+1)} className="px-3 py-1 rounded border disabled:opacity-50">Sau</button>
      </div>
    </div>
  );
}
