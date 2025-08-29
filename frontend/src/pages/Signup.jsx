import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // KHÔNG dùng bcrypt ở FE, gửi plain password qua HTTPS
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data?.success === false) {
        setError(data.message || 'Đăng ký thất bại');
        setLoading(false);
        return;
      }

      // Đăng ký xong điều hướng sang trang đăng nhập
      navigate('/signin');
    } catch (err) {
      setError(err?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Đăng ký</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="name"
          placeholder="Họ tên"
          className="border p-3 rounded-lg"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
          required
        />
        <button disabled={loading} className="uppercase bg-slate-700 text-white p-3 rounded-lg">
          {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
        </button>
      </form>

      <div className="flex gap-2 mt-5 justify-center">
        <p>Đã có tài khoản?</p>
        <Link to="/signin">
          <span className="hover:underline">Đăng nhập</span>
        </Link>
      </div>

      {error && <p className="text-red-500 text-center mt-3">{error}</p>}
    </div>
  );
}
