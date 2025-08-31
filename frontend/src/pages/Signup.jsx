import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/firebase';

export default function Signup() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || '/api';

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // nếu BE tự đăng nhập sau signup
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        setError(data?.message || 'Đăng ký thất bại');
        setLoading(false);
        return;
      }
      setLoading(false);
      // toast?.success?.('Đăng ký thành công');
      // Nếu BE tự login sau signup, có thể navigate('/') luôn
      navigate('/signin');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
      setLoading(false);
    }
  };

  // --- Google Sign-Up / Sign-In combined ---
  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      const r = await signInWithPopup(auth, googleProvider);
      const payload = {
        name: r.user.displayName,
        email: r.user.email,
        photo: r.user.photoURL,
      };
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        setError(data?.message || 'Google đăng nhập thất bại');
        setLoading(false);
        return;
      }
      setLoading(false);
      // toast?.success?.('Đăng nhập thành công');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google đăng nhập thất bại');
      setLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Đăng ký</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" name="username" placeholder="Username" className="border p-3 rounded-lg" onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" className="border p-3 rounded-lg" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" className="border p-3 rounded-lg" onChange={handleChange} />

        <button disabled={loading} type="submit" className="uppercase bg-slate-700 text-white p-3 rounded-lg">
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>

        {/* Nút Google */}
        <button
          type="button"
          onClick={handleGoogleClick}
          className="uppercase bg-red-600 text-white p-3 rounded-lg"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Tiếp tục với Google'}
        </button>
        {/* Nếu muốn, thay bằng <OAuth /> */}
      </form>

      <div className="flex gap-2 mt-5 justify-center">
        <p>Đã có tài khoản?</p>
        <Link to="/signin">
          <span className="hover:underline">Đăng nhập</span>
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
