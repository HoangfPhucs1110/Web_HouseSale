// src/pages/Listing.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from 'react-icons/fa';

SwiperCore.use([Navigation]);

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?.rest?._id || currentUser?._id || null;

  const fmtPrice = useMemo(
    () => (n) =>
      (n ?? 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    []
  );

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || 'Không tải được dữ liệu');
        }
        setListing(data);
      } catch (e) {
        setErr(e.message || 'Đã có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-3">
        <div className="animate-pulse space-y-4">
          <div className="h-[420px] rounded-2xl bg-slate-200" />
          <div className="h-6 w-1/2 bg-slate-200 rounded" />
          <div className="h-4 w-1/3 bg-slate-200 rounded" />
          <div className="h-24 bg-slate-200 rounded" />
        </div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="max-w-6xl mx-auto p-3">
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {err}
        </div>
      </main>
    );
  }

  if (!listing) return null;

  const price = listing.offer ? listing.discountPrice : listing.regularPrice;
  const priceDiff =
    listing.offer && listing.regularPrice && listing.discountPrice
      ? Number(listing.regularPrice) - Number(listing.discountPrice)
      : 0;

  const isOwner = userId && String(listing.userRef) === String(userId);

  return (
    <main className="bg-white">
      {/* SHARE floating */}
      <button
        type="button"
        aria-label="Copy link"
        className="fixed top-20 right-4 z-40 border rounded-full w-12 h-12 flex justify-center items-center bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
      >
        <FaShare className="text-slate-700" />
      </button>
      {copied && (
        <p className="fixed top-36 right-4 z-40 rounded-md bg-slate-900 text-white px-3 py-2 text-sm shadow">
          Đã sao chép liên kết
        </p>
      )}

      {/* HERO GALLERY */}
      <section className="relative">
        <div className="max-w-6xl mx-auto p-3">
          <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200">
            <Swiper navigation>
              {(listing.imageUrls || []).map((url) => (
                <SwiperSlide key={url}>
                  <div className="relative h-[420px] md:h-[520px]">
                    <img
                      src={url}
                      alt={listing.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-900">
                        {listing.type === 'rent' ? 'Cho thuê' : 'Mua bán'}
                      </span>
                      {listing.offer && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">
                          Ưu đãi {fmtPrice(priceDiff)}
                        </span>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* INFO */}
      <section className="max-w-6xl mx-auto p-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                {listing.name}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-slate-600 text-sm">
                <FaMapMarkerAlt className="text-emerald-600" />
                <span>{listing.address}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
              <p className="text-3xl font-extrabold text-slate-900">
                {fmtPrice(price)}
                {listing.type === 'rent' && (
                  <span className="text-base font-semibold text-slate-500"> / tháng</span>
                )}
              </p>
              {listing.offer && (
                <p className="text-sm text-emerald-700 mt-1">
                  Tiết kiệm {fmtPrice(priceDiff)} so với giá gốc {fmtPrice(listing.regularPrice)}
                </p>
              )}
            </div>

            <ul className="flex flex-wrap items-center gap-3 text-sm">
              <li className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-700">
                <FaBed />
                {listing.bedrooms} phòng ngủ
              </li>
              <li className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-700">
                <FaBath />
                {listing.bathrooms} phòng tắm
              </li>
              <li className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-700">
                <FaParking />
                {listing.parking ? 'Có gara' : 'Không có gara'}
              </li>
              <li className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-700">
                <FaChair />
                {listing.furnished ? 'Nội thất' : 'Trống'}
              </li>
            </ul>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Mô tả</h2>
              <p className="leading-relaxed text-slate-700 whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Nhắn tin (mở chat) – chỉ hiện khi KHÔNG phải chủ bài */}
              {!isOwner && (
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent('open-chat-with-listing', {
                        detail: { listingId: listing._id },
                      })
                    )
                  }
                  className="w-full bg-slate-900 text-white rounded-xl py-3 font-semibold hover:opacity-90 transition"
                >
                  Nhắn tin với người bán
                </button>
              )}

              {/* Đặt lịch tham quan – chỉ hiện khi KHÔNG phải chủ bài */}
              {!isOwner && (
                <button
                  onClick={() => setShowBooking(true)}
                  className="w-full bg-emerald-600 text-white rounded-xl py-3 font-semibold hover:opacity-90 transition"
                >
                  Đặt lịch tham quan
                </button>
              )}

              {/* Thông tin nhanh */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                <h3 className="font-semibold text-slate-800 mb-3">Thông tin nhanh</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex justify-between">
                    <span>Loại</span>
                    <span className="font-medium">
                      {listing.type === 'rent' ? 'Cho thuê' : 'Mua bán'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Ưu đãi</span>
                    <span className="font-medium">{listing.offer ? 'Có' : 'Không'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Giá gốc</span>
                    <span className="font-medium">{fmtPrice(listing.regularPrice)}</span>
                  </li>
                  {listing.offer && (
                    <li className="flex justify-between">
                      <span>Giá ưu đãi</span>
                      <span className="font-medium text-emerald-700">
                        {fmtPrice(listing.discountPrice)}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Modal đặt lịch */}
      <BookingModal
        open={showBooking}
        onClose={() => setShowBooking(false)}
        listing={listing}
      />
    </main>
  );
}

/* ========= Modal đặt lịch tham quan ========= */
function BookingModal({ open, onClose, listing }) {
  const { currentUser } = useSelector((s) => s.user);
  const me = currentUser?.rest?._id || currentUser?._id || null;
  const API = import.meta.env.VITE_API_BASE || '/api';

  // 🔧 TẤT CẢ HOOKS Ở TRÊN
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    datetime: '',
    address: listing?.address || '',
  });
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const backdropRef = useRef(null); // <-- move lên đây!

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, address: listing?.address || '' }));
      setErr('');
    }
  }, [open, listing]);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!me) {
      setErr('Bạn cần đăng nhập để đặt lịch.');
      return;
    }
    if (!form.fullName.trim() || !form.phone.trim() || !form.datetime) {
      setErr('Vui lòng nhập đầy đủ họ tên, số điện thoại và thời gian tham quan.');
      return;
    }

    setSending(true);
    try {
      // 1) Tạo/lấy conversation
      const r1 = await fetch(`${API}/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ listingId: listing._id }),
      });
      const d1 = await r1.json();
      if (!r1.ok) throw new Error(d1?.message || 'Không tạo được cuộc trò chuyện');
      const conversationId = d1.conversationId;

      // 2) Format message
      const when = new Date(form.datetime);
      const human = isNaN(when) ? form.datetime : when.toLocaleString();
      const msg = [
        '📝 *Yêu cầu đặt lịch tham quan*',
        `• Nhà: ${listing.name}`,
        `• Địa chỉ: ${form.address || listing.address || '(không có)'}`,
        `• Thời gian: ${human}`,
        `• Người mua: ${form.fullName}`,
        `• Số điện thoại: ${form.phone}`,
        '',
        'Vui lòng phản hồi để xác nhận. Xin cảm ơn!',
      ].join('\n');

      // 3) Gửi tin nhắn
      const r2 = await fetch(`${API}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ conversationId, text: msg }),
      });
      const d2 = await r2.json();
      if (!r2.ok) throw new Error(d2?.message || 'Gửi tin nhắn thất bại');

      // 4) Mở widget chat
      window.dispatchEvent(
        new CustomEvent('open-chat-with-listing', { detail: { listingId: listing._id } })
      );

      onClose();
    } catch (e) {
      setErr(e.message || 'Có lỗi xảy ra');
    } finally {
      setSending(false);
    }
  };

  const onBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  // ✅ KHÔNG return trước khi khai báo hooks; chỉ ẩn UI khi open=false
  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={onBackdropClick}
      className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-3"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">Đặt lịch tham quan</div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="p-4 space-y-3">
          <div className="text-sm text-slate-600">
            Bạn đang đặt lịch cho: <span className="font-medium">{listing?.name}</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col">
              <label className="text-sm text-slate-600 mb-1">Họ và tên</label>
              <input
                className="border rounded-lg px-3 py-2 outline-none"
                value={form.fullName}
                onChange={(e) => onChange('fullName', e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-slate-600 mb-1">Số điện thoại</label>
              <input
                className="border rounded-lg px-3 py-2 outline-none"
                value={form.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                placeholder="090..."
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-slate-600 mb-1">Thời gian tham quan</label>
              <input
                type="datetime-local"
                className="border rounded-lg px-3 py-2 outline-none"
                value={form.datetime}
                onChange={(e) => onChange('datetime', e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-slate-600 mb-1">Địa chỉ căn nhà</label>
              <input
                className="border rounded-lg px-3 py-2 outline-none"
                value={form.address}
                onChange={(e) => onChange('address', e.target.value)}
                placeholder={listing?.address}
              />
              <p className="text-xs text-slate-500 mt-1">
                Có thể chỉnh lại nếu muốn, mặc định lấy địa chỉ của tin.
              </p>
            </div>
          </div>

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {err}
            </div>
          )}
        </form>

        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
          >
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={sending}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:opacity-90 disabled:opacity-60"
          >
            {sending ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </div>
    </div>
  );
}
