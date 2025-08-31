import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/userSlice.js';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/firebase';

export default function Signin() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const API_BASE = import.meta.env.VITE_API_BASE || '/api';

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // nhận cookie JWT
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        dispatch(signInFailure(data?.message || 'Đăng nhập thất bại'));
        return;
      }
      dispatch(signInSuccess(data)); // BE trả { rest: {...} }
      // toast?.success?.('Đăng nhập thành công');
      navigate('/');
    } catch (err) {
      dispatch(signInFailure(err.message || 'Đăng nhập thất bại'));
    }
  };

  // --- Google Sign-In ---
  const handleGoogleClick = async () => {
    try {
      dispatch(signInStart());
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
        dispatch(signInFailure(data?.message || 'Google đăng nhập thất bại'));
        return;
      }
      dispatch(signInSuccess(data));
      // toast?.success?.('Đăng nhập thành công');
      navigate('/');
    } catch (err) {
      dispatch(signInFailure(err.message || 'Google đăng nhập thất bại'));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Đăng nhập</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" name="email" placeholder="Email" className="border p-3 rounded-lg" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" className="border p-3 rounded-lg" onChange={handleChange} />

        <button disabled={loading} type="submit" className="uppercase bg-slate-700 text-white p-3 rounded-lg">
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
        {/* Nếu muốn dùng component cũ: <OAuth /> */}
      </form>

      <div className="flex gap-2 mt-5 justify-center">
        <p>Chưa có tài khoản?</p>
        <Link to="/signup">
          <span className="hover:underline">Đăng ký</span>
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
