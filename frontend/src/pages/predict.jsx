import { useMemo, useState } from "react";

// Gọi thẳng FastAPI (đã bật CORS bên FastAPI)
const PREDICT_URL = "http://localhost:8001/predict";

const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{children}</h3>
);

const HelpText = ({ children }) => (
  <p className="text-xs text-slate-500 mt-1">{children}</p>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-600">
    {children}
  </span>
);

export default function DuDoanGiaNha() {
  // INPUT người dùng
  const [form, setForm] = useState({
    bedrooms: 3,
    bathrooms: 2,
    sqft_living: 1780,
    grade: 7,        // 1–13
    view: 0,         // 0–4
    waterfront: 0,   // 0/1
    yr_built: 1960,
    yr_renovated: 0,
    zipcode: 98146,
  });

  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Các giá trị cố định theo mẫu bạn đưa
  const FIXED = useMemo(() => ({
    sqft_lot: 7470,
    floors: 1,
    condition: 3,
    sqft_above: 1050,
    sqft_basement: 730,
    lat: 47.5123,
    long: -122.337,
    sqft_living15: 1780,
    sqft_lot15: 7000, // hợp lý
  }), []);

  const onChange = (key, val) => {
    const n = key === "zipcode" ? parseInt(val || 0, 10) : Number(val);
    setForm((p) => ({ ...p, [key]: isNaN(n) ? 0 : n }));
  };

  const submitDisabled = useMemo(() => {
    // chút validate cơ bản
    if (form.sqft_living <= 0) return true;
    if (form.bedrooms < 0 || form.bathrooms < 0) return true;
    if (form.grade < 1 || form.grade > 13) return true;
    if (form.view < 0 || form.view > 4) return true;
    if (form.waterfront !== 0 && form.waterfront !== 1) return true;
    if (form.yr_built < 1800 || form.yr_built > 2025) return true;
    if (form.yr_renovated < 0 || form.yr_renovated > 2025) return true;
    return false;
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setResult(null);
    setLoading(true);

    const payload = {
      features: {
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        sqft_living: Number(form.sqft_living),
        sqft_lot: Number(FIXED.sqft_lot),
        floors: Number(FIXED.floors),
        waterfront: Number(form.waterfront),
        view: Number(form.view),
        condition: Number(FIXED.condition),
        grade: Number(form.grade),
        sqft_above: Number(FIXED.sqft_above),
        sqft_basement: Number(FIXED.sqft_basement),
        yr_built: Number(form.yr_built),
        yr_renovated: Number(form.yr_renovated),
        zipcode: Number(form.zipcode),
        lat: Number(FIXED.lat),
        long: Number(FIXED.long),
        sqft_living15: Number(FIXED.sqft_living15),
        sqft_lot15: Number(FIXED.sqft_lot15),
      },
    };

    try {
      const res = await fetch(PREDICT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const price =
        data?.predicted_price ??
        data?.prediction ??
        (Array.isArray(data?.y_pred) ? data.y_pred[0] : null);

      if (price == null) throw new Error("Không nhận được giá dự đoán");
      setResult(Number(price));
    } catch (e) {
      setErr(e.message || "Lỗi dự đoán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dự đoán giá nhà</h2>
          <p className="text-slate-500 text-sm">Mô hình Random Forest (King County, WA)</p>
        </div>
        <div className="flex gap-2">
          <Badge>Dataset 2014–2015</Badge>
          <Badge>King County, WA</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM CARD */}
        <form
          onSubmit={onSubmit}
          className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-4 border-b">
            <SectionTitle>Thông tin chính</SectionTitle>
            <p className="text-sm text-slate-500 mt-1">
              Nhập các thông số quan trọng. Các thông số khác đã được cố định theo mẫu.
            </p>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bedrooms */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700">Số phòng ngủ </label>
              <input
                type="number" min="0" step="1"
                value={form.bedrooms}
                onChange={(e) => onChange("bedrooms", e.target.value)}
                className="mt-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="vd: 3"
              />
              <HelpText>Gợi ý: 2–5 phòng ngủ là phổ biến.</HelpText>
            </div>

            {/* Bathrooms */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700">Số phòng tắm </label>
              <input
                type="number" min="0" step="0.5"
                value={form.bathrooms}
                onChange={(e) => onChange("bathrooms", e.target.value)}
                className="mt-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="vd: 2"
              />
              <HelpText>Dùng số thập phân .5 nếu có phòng tắm phụ.</HelpText>
            </div>

            {/* sqft_living */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Diện tích sử dụng
              </label>
              <input
                type="number" min="200" step="1"
                value={form.sqft_living}
                onChange={(e) => onChange("sqft_living", e.target.value)}
                className="mt-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="vd: 1780"
              />
              <HelpText>Tổng diện tích trong nhà (m²).</HelpText>
            </div>

            {/* Grade (1–13) */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700">
                Chất lượng xây dựng 
              </label>
              <input
                type="range" min="1" max="13" step="1"
                value={form.grade}
                onChange={(e) => onChange("grade", e.target.value)}
                className="mt-2"
              />
              <div className="flex items-center justify-between mt-1 text-xs text-slate-600">
                <span>1</span>
                <span>7 (chuẩn)</span>
                <span>13</span>
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                Grade hiện tại: {form.grade}
              </div>
              <HelpText>
                1–3: thấp • 4–6: trung bình/thấp • 7: trung bình • 8–9: tốt • 10–11: cao cấp • 12–13: siêu cao cấp
              </HelpText>
            </div>

            {/* View (0–4) */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700">Điểm view (0–4)</label>
              <input
                type="range" min="0" max="4" step="1"
                value={form.view}
                onChange={(e) => onChange("view", e.target.value)}
                className="mt-2"
              />
              <div className="flex items-center justify-between mt-1 text-xs text-slate-600">
                <span>0</span>
                <span>2</span>
                <span>4</span>
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                View hiện tại: {form.view}
              </div>
              <HelpText>
                0: không view • 1: chút view • 2: trung bình • 3: đẹp • 4: rất đẹp/premium
              </HelpText>
            </div>

            {/* Waterfront 0/1 */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700">
                View mặt nước 
              </label>
              <div className="mt-2 flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="waterfront"
                    checked={form.waterfront === 0}
                    onChange={() => onChange("waterfront", 0)}
                  />
                  <span className="text-sm text-slate-700">Không</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="waterfront"
                    checked={form.waterfront === 1}
                    onChange={() => onChange("waterfront", 1)}
                  />
                  <span className="text-sm text-slate-700">Có</span>
                </label>
              </div>
              <HelpText>Nhìn trực diện ra sông/hồ/biển?</HelpText>
            </div>

            {/* Năm xây & cải tạo */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700">Năm xây dựng </label>
              <input
                type="number" min="1800" max="2025" step="1"
                value={form.yr_built}
                onChange={(e) => onChange("yr_built", e.target.value)}
                className="mt-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="vd: 1960"
              />
              <HelpText>Năm căn nhà được xây.</HelpText>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700">Năm cải tạo </label>
              <input
                type="number" min="0" max="2025" step="1"
                value={form.yr_renovated}
                onChange={(e) => onChange("yr_renovated", e.target.value)}
                className="mt-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="0 nếu chưa"
              />
              <HelpText>0 = chưa từng cải tạo; hoặc nhập năm gần nhất.</HelpText>
            </div>

            {/* Zipcode */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Mã vùng (zipcode)</label>
              <input
                type="number" step="1"
                value={form.zipcode}
                onChange={(e) => onChange("zipcode", e.target.value)}
                className="mt-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="vd: 98146"
              />
              <HelpText>Zip code khu vực King County.</HelpText>
            </div>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {/* Các trường khác cố định theo mẫu: sqft_lot 7470 • floors 1 • condition 3 • sqft_above 1050 • sqft_basement 730 • lat 47.5123 • long -122.337 • sqft_living15 1780 • sqft_lot15 7000 */}
            </div>
            <button
              type="submit"
              disabled={submitDisabled || loading}
              className={`px-4 py-2 rounded-lg text-white ${
                submitDisabled || loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-slate-700 hover:opacity-90"
              }`}
            >
              {loading ? "Đang dự đoán..." : "Dự đoán"}
            </button>
          </div>
        </form>

        {/* INFO + RESULT CARD */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle>Hướng dẫn chấm điểm</SectionTitle>
            <div className="mt-3 space-y-3 text-sm text-slate-700">
              <div>
                <div className="font-medium text-slate-800">Điểm view (0–4)</div>
                <ul className="list-disc pl-5 text-slate-600">
                  <li>0: không view đặc biệt</li>
                  <li>1: chút view (vườn/công viên nhỏ)</li>
                  <li>2: view trung bình (rừng/hồ nhỏ/cảnh thoáng)</li>
                  <li>3: view đẹp (hồ lớn/núi/công viên rộng)</li>
                  <li>4: view rất đẹp (biển/hồ lớn/toàn cảnh)</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-slate-800">Chất lượng xây dựng (grade 1–13)</div>
                <ul className="list-disc pl-5 text-slate-600">
                  <li>1–3: thấp • 4–6: trung bình/thấp • 7: trung bình</li>
                  <li>8–9: tốt • 10–11: cao cấp • 12–13: siêu cao cấp</li>
                </ul>
              </div>
              <div className="text-xs text-slate-500">
                Lưu ý: Mô hình được huấn luyện với dữ liệu King County, Washington (2014–2015).
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle>Kết quả</SectionTitle>
            {result !== null ? (
              <div className="mt-3">
                <div className="text-3xl font-bold text-emerald-700">
                  {result.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  (* Giá tham khảo từ mô hình, không thay thế thẩm định chính thức)
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Nhập thông tin và bấm “Dự đoán”.</p>
            )}

            {err && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {err}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
