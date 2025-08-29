import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const API_BASE = import.meta.env.VITE_API_BASE || "/api";

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");
      setStatus({ type: "success", message: data.message || "Đăng ký thành công." });
      setEmail("");
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Có lỗi xảy ra." });
    }
  }

  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="inline-block">
            <div className="text-xl font-extrabold tracking-tight">
              <span className="text-slate-300">PP</span>
              <span className="text-white">House</span>
            </div>
          </Link>
          <p className="mt-3 text-sm text-slate-400 leading-6">
            Nền tảng mua bán, cho thuê nhà đất với bộ lọc thông minh và dự đoán giá.
          </p>
          <div className="mt-4 flex items-center gap-3 text-xl">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition"><FaFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition"><FaInstagram /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition"><FaGithub /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition"><FaLinkedin /></a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-300">NHẬN BẢN TIN</h3>
          <p className="mt-2 text-sm text-slate-400">
            Mẹo mua bán và tin nổi bật mỗi tuần. Bạn có thể hủy bất cứ lúc nào.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="email"
              required
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90 transition"
            >
              Đăng ký
            </button>
          </form>
          {status.message && (
            <p className={`mt-2 text-sm ${status.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {status.message}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-300">LIÊN KẾT NHANH</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link to="/search" className="hover:text-white transition">Tìm kiếm</Link></li>
            <li><Link to="/create-listing" className="hover:text-white transition">Đăng tin</Link></li>
            <li><Link to="/profile" className="hover:text-white transition">Tài khoản</Link></li>
            <li><Link to="/about" className="hover:text-white transition">Giới thiệu</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-300">LIÊN HỆ</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>Email: <a href="mailto:contact@pphouse.example" className="hover:text-white transition">contact@pphouse.example</a></li>
            <li>Hotline: <span className="text-slate-300">(+84) 0123 456 789</span></li>
            <li>Địa chỉ: 123 Đường ABC, Q.1, TP.HCM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {year} PPHouse. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <span className="select-none">•</span>
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <span className="select-none">•</span>
            <a href="mailto:contact@pphouse.example" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
