import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutStart,
  signOutSuccess,
  signOutFailure,
} from '../redux/userSlice';
import { Link, useNavigate } from 'react-router-dom';
import { uploadAvatarFromUrl, uploadToCloudinary } from '../utils/cloudinary';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const me = currentUser?.rest ?? currentUser ?? null;

  // form
  const [formData, setFormData] = useState({
    username: me?.username || '',
    email: me?.email || '',
    password: '', // không prefill
  });

  // avatar
  const [avatarUrl, setAvatarUrl] = useState(me?.avatar || '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // user listings
  const [userListings, setUserListings] = useState(null);
  const [showListingsError, setShowListingsError] = useState(false);

  // Nếu avatar là ảnh Google -> đồng bộ về Cloudinary 1 lần
  useEffect(() => {
    async function syncGoogleAvatar() {
      const avatar = me?.avatar;
      if (avatar && avatar.includes('googleusercontent.com')) {
        try {
          const url = await uploadAvatarFromUrl(avatar);
          await fetch(`/api/user/update/${me?._id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ avatar: url }),
          });
          setAvatarUrl(url);
        } catch (err) {
          console.error('Upload avatar to Cloudinary failed:', err);
        }
      }
    }
    if (me) syncGoogleAvatar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?._id]);

  // handlers
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((p) => ({ ...p, [id]: value }));
  };

  const handlePickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setProgress(0);
      const url = await uploadToCloudinary(file, (p) => setProgress(p));
      setAvatarUrl(url);
      toast.success('Đã tải ảnh lên Cloudinary');
    } catch (err) {
      toast.error(err.message || 'Upload ảnh thất bại');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const body = {
        username: formData.username,
        email: formData.email,
      };
      if (formData.password?.trim()) body.password = formData.password.trim();
      if (avatarUrl) body.avatar = avatarUrl;

      const res = await fetch(`/api/user/update/${me?._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        dispatch(updateUserFailure(data?.message || 'Cập nhật thất bại'));
        toast.error(data?.message || 'Cập nhật thất bại');
        return;
      }
      dispatch(updateUserSuccess(data));
      toast.success('Cập nhật thành công');
    } catch (err) {
      dispatch(updateUserFailure(err.message));
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Xoá tài khoản? Hành động không thể hoàn tác.')) return;
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${me?._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        dispatch(deleteUserFailure(data?.message || 'Xoá thất bại'));
        toast.error(data?.message || 'Xoá thất bại');
        return;
      }
      dispatch(deleteUserSuccess());
      toast.success('Đã xoá tài khoản');
      navigate('/signup');
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch(`/api/auth/signout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        dispatch(signOutFailure(data?.message || 'Đăng xuất thất bại'));
        toast.error(data?.message || 'Đăng xuất thất bại');
        return;
      }
      dispatch(signOutSuccess());
      toast.success('Đã đăng xuất');
      navigate('/signin');
    } catch (err) {
      dispatch(signOutFailure(err.message));
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${me?._id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        setShowListingsError(true);
        toast.error(data?.message || 'Không lấy được danh sách bài đăng');
        return;
      }
      setUserListings(data);
    } catch (err) {
      setShowListingsError(true);
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleListingDelete = async (listingId) => {
    if (!confirm('Xoá bài đăng này?')) return;
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        toast.error(data?.message || 'Xoá thất bại');
        return;
      }
      setUserListings((prev) => prev.filter((l) => l._id !== listingId));
      toast.success('Đã xoá bài đăng');
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
        <p className="text-slate-500 mt-1">Cập nhật thông tin & quản lý bài đăng của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: Avatar + Actions */}
        <div className="md:col-span-1">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  className="rounded-full h-24 w-24 object-cover ring-2 ring-emerald-400"
                  src={avatarUrl || 'https://placehold.co/200x200?text=Avatar'}
                  alt="avatar"
                />
                {/* Ring progress khi đang upload */}
                {uploading && (
                  <div className="absolute inset-0 rounded-full grid place-items-center bg-black/30 text-white text-xs font-semibold">
                    {progress}%
                  </div>
                )}
              </div>

              <label className="mt-3 text-sm font-medium text-slate-700 cursor-pointer">
                <span className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 inline-block">
                  Chọn ảnh mới
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePickFile} />
              </label>

              <div className="mt-5 w-full space-y-2">
                <button
                  onClick={handleShowListings}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white hover:opacity-90"
                >
                  Xem bài đăng của tôi
                </button>
                <Link
                  to="/create-listing"
                  className="block text-center w-full px-3 py-2 rounded-lg bg-emerald-600 text-white hover:opacity-90"
                >
                  Tạo bài đăng
                </Link>
              </div>

              <div className="mt-4 w-full flex items-center justify-between text-sm">
                <button onClick={handleDelete} className="text-red-600 hover:underline">
                  Xoá tài khoản
                </button>
                <button onClick={handleSignOut} className="text-slate-700 hover:underline">
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 p-4 space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tên hiển thị</label>
              <input
                id="username"
                type="text"
                className="w-full border rounded-lg px-3 py-2 outline-none"
                value={formData.username}
                onChange={handleChange}
                placeholder="Tên của bạn"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Email</label>
              <input
                id="email"
                type="email"
                className="w-full border rounded-lg px-3 py-2 outline-none"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Mật khẩu (để trống nếu không đổi)</label>
              <input
                id="password"
                type="password"
                className="w-full border rounded-lg px-3 py-2 outline-none"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Đang cập nhật…' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* LISTINGS */}
      {showListingsError && (
        <p className="text-red-600 mt-4">Không tải được danh sách bài đăng của bạn.</p>
      )}

      {userListings && userListings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">Bài đăng của bạn</h2>
          <div className="space-y-3">
            {userListings.map((listing) => (
              <div
                key={listing._id}
                className="rounded-xl border border-slate-200 p-3 flex items-center gap-3"
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls?.[0]}
                    alt={listing.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/listing/${listing._id}`}
                    className="font-medium text-slate-800 hover:underline line-clamp-1"
                  >
                    {listing.name}
                  </Link>
                  <div className="text-sm text-slate-500 line-clamp-1">{listing.address}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Xoá
                  </button>
                  <Link
                    to={`/update-listing/${listing._id}`}
                    className="text-emerald-700 text-sm hover:underline"
                  >
                    Sửa
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
