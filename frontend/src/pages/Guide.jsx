import React from "react";
import { Link } from "react-router-dom";
import {
  FaCamera,
  FaRulerCombined,
  FaMapMarkerAlt,
  FaDollarSign,
  FaCheckCircle,
  FaLightbulb,
} from "react-icons/fa";

export default function Guide() {
  return (
    <div className="bg-white text-slate-800">
      {/* HERO */}
      <section className="relative">
        <img
          src="https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop"
          alt="Modern interior"
          className="w-full h-[380px] object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Hướng dẫn đăng tin bất động sản
          </h1>
          <p className="mt-4 text-slate-200 max-w-3xl">
            Chỉ với vài bước đơn giản, tin đăng của bạn sẽ nổi bật và tiếp cận đúng khách hàng.
          </p>
        </div>
      </section>

      {/* 4 BƯỚC CHÍNH */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-center">
          Đăng tin chỉ trong 4 bước
        </h2>
        <p className="text-slate-600 text-center mt-2">
          Chuẩn bị thông tin kỹ – hình ảnh đẹp – giá hợp lý – vị trí rõ ràng.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Bước 1 */}
          <div className="rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <FaCamera />
              </div>
              <h3 className="font-semibold text-lg">1) Chuẩn bị hình ảnh</h3>
            </div>
            <p className="text-slate-600 mt-3 leading-relaxed">
              Chụp ảnh sáng, rõ, đủ các phòng: mặt tiền, phòng khách, bếp, phòng ngủ, WC, ban công.
              Ảnh ngang (16:9) sẽ hiển thị đẹp hơn. Tối đa 6–10 ảnh chất lượng cao.
            </p>
            <div className="mt-4 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop"
                alt="Sample photos"
                className="w-full h-56 object-cover"
              />
            </div>
          </div>

          {/* Bước 2 */}
          <div className="rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <FaRulerCombined />
              </div>
              <h3 className="font-semibold text-lg">2) Mô tả chi tiết</h3>
            </div>
            <p className="text-slate-600 mt-3 leading-relaxed">
              Ghi rõ diện tích sử dụng, số phòng ngủ/tắm, nội thất, tình trạng pháp lý, tiện ích xung quanh.
              Mô tả càng rõ – tỉ lệ liên hệ càng cao.
            </p>
            <div className="mt-4 rounded-xl overflow-hidden">
              <img
                src="https://sieuthinhamau.com/wp-content/uploads/2017/08/Ban-ve-nha-2-tang-8x15m-dep.jpg.webp"
                alt="Floor and details"
                className="w-full h-56 object-cover"
              />
            </div>
          </div>

          {/* Bước 3 */}
          <div className="rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <FaDollarSign />
              </div>
              <h3 className="font-semibold text-lg">3) Định giá hợp lý</h3>
            </div>
            <p className="text-slate-600 mt-3 leading-relaxed">
              Tham khảo thị trường khu vực hoặc dùng công cụ <b>Dự đoán giá</b> của chúng tôi để tham chiếu.
              Giá cạnh tranh giúp thu hút nhiều người xem hơn.
            </p>
            <div className="mt-4 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"
                alt="Pricing"
                className="w-full h-56 object-cover"
              />
            </div>
          </div>

          {/* Bước 4 */}
          <div className="rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <FaMapMarkerAlt />
              </div>
              <h3 className="font-semibold text-lg">4) Vị trí & liên hệ</h3>
            </div>
            <p className="text-slate-600 mt-3 leading-relaxed">
              Gắn địa chỉ hoặc mô tả vị trí rõ ràng (gần trường, chợ, công viên). Kiểm tra thông tin liên lạc
              để khách dễ kết nối với bạn.
            </p>
            <div className="mt-4 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop"
                alt="Map"
                className="w-full h-56 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MẸO NHANH */}
      <section className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center">
              <FaLightbulb />
            </div>
            <h3 className="text-xl md:text-2xl font-bold">Mẹo giúp tin đăng nổi bật</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="rounded-xl bg-white border border-slate-200 p-6">
              <p className="text-slate-600 leading-relaxed">
                <b>Tiêu đề rõ ràng</b>: Nêu khu vực + loại hình + đặc điểm chính (VD: “Nhà phố 3PN, gần công viên, Q.7”).
              </p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-6">
              <p className="text-slate-600 leading-relaxed">
                <b>Ảnh bìa ấn tượng</b>: Chọn ảnh mặt tiền hoặc phòng khách sáng sủa làm ảnh đầu tiên.
              </p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-6">
              <p className="text-slate-600 leading-relaxed">
                <b>Trả lời nhanh</b>: Phản hồi tin nhắn trong 15–30 phút để tối ưu tỷ lệ chốt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* XEM TRƯỚC MẪU TIN */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h3 className="text-2xl font-bold text-center">Mẫu tin đăng đẹp</h3>
        <p className="text-slate-600 text-center mt-2">
          Bạn có thể tham khảo bố cục & nội dung như dưới đây.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Card Preview */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
            <img
              src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop"
              alt="Listing preview"
              className="w-full h-56 object-cover"
            />
            <div className="p-5">
              <h4 className="font-semibold text-lg">Nhà phố 3PN – nội thất mới, gần công viên</h4>
              <p className="text-slate-600 mt-1 text-sm">Quận 7, TP. HCM • 130 m² • 3PN • 2WC</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-slate-900 font-bold">$ 1,200 / tháng</span>
                <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                  Cho thuê
                </span>
              </div>
            </div>
          </div>

          {/* Check-list */}
          <div className="rounded-2xl border border-slate-200 p-6">
            <h4 className="font-semibold">Check-list trước khi đăng</h4>
            <ul className="mt-4 space-y-3 text-slate-700">
              {[
                "Ảnh sắc nét (3-6 ảnh)",
                "Tiêu đề & mô tả rõ ràng",
                "Giá & loại hình (bán/cho thuê)",
                "Địa chỉ / khu vực chính xác",
                "Thông tin liên hệ hoạt động",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link
                to="/create-listing"
                className="inline-block bg-slate-900 text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Bắt đầu đăng tin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA CUỐI */}
      <section className="bg-slate-900 text-white text-center py-14">
        <h3 className="text-2xl md:text-3xl font-bold">Sẵn sàng đăng tin?</h3>
        <p className="text-slate-300 mt-2">
          Hãy chuẩn bị ảnh đẹp & mô tả rõ ràng — chúng tôi sẽ giúp tin của bạn tỏa sáng.
        </p>
        <Link
          to="/create-listing"
          className="mt-5 inline-block bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Đăng tin ngay
        </Link>
      </section>
    </div>
  );
}
