import React from "react";

export default function Faq() {
  const faqs = [
    {
      category: "Đăng tin & Quản lý tin",
      questions: [
        {
          q: "Làm thế nào để đăng tin bán hoặc cho thuê nhà?",
          a: "Bạn cần đăng nhập tài khoản, vào mục 'Đăng tin', điền đầy đủ thông tin (hình ảnh, mô tả, giá, địa chỉ), sau đó nhấn 'Đăng'. Tin sẽ được kiểm duyệt trước khi hiển thị công khai.",
        },
        {
          q: "Tôi có thể chỉnh sửa hoặc gỡ tin đã đăng không?",
          a: "Có. Vào mục 'Tin của tôi', chọn tin cần chỉnh sửa hoặc gỡ. Bạn có thể cập nhật nội dung, hình ảnh hoặc ẩn tin bất cứ lúc nào.",
        },
      ],
    },
    {
      category: "Tài khoản & Bảo mật",
      questions: [
        {
          q: "Làm thế nào để đổi mật khẩu?",
          a: "Bạn vào mục 'Hồ sơ cá nhân' → 'Cài đặt bảo mật' → 'Đổi mật khẩu'. Nhập mật khẩu cũ và mật khẩu mới để hoàn tất.",
        },
        {
          q: "Thông tin cá nhân của tôi có được bảo mật không?",
          a: "Chúng tôi cam kết bảo mật thông tin theo tiêu chuẩn quốc tế. Thông tin liên hệ chỉ hiển thị khi bạn đồng ý hoặc khi người mua liên hệ qua hệ thống.",
        },
      ],
    },
    {
      category: "Khác",
      questions: [
        {
          q: "Làm sao để dự đoán giá nhà trước khi mua?",
          a: "Bạn có thể sử dụng công cụ 'Dự đoán giá' trên website. Chỉ cần nhập các thông số như diện tích, số phòng, vị trí… hệ thống sẽ gợi ý mức giá hợp lý dựa trên dữ liệu thực tế.",
        },
        {
          q: "Tôi gặp sự cố khi sử dụng website thì liên hệ ở đâu?",
          a: "Bạn có thể liên hệ qua mục 'Hỗ trợ trực tuyến', gửi email đến support@pphouse.vn hoặc gọi hotline 1800-xxxx (miễn phí).",
        },
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">
        Câu hỏi thường gặp (FAQ)
      </h1>

      {faqs.map((section, idx) => (
        <div key={idx} className="mb-10">
          <h2 className="text-xl font-semibold text-slate-700 mb-4 border-l-4 border-emerald-400 pl-3">
            {section.category}
          </h2>
          <div className="space-y-4">
            {section.questions.map((item, i) => (
              <details
                key={i}
                className="group border border-slate-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition"
              >
                <summary className="flex justify-between items-center font-medium text-slate-700">
                  <span>{item.q}</span>
                  <span className="ml-2 text-slate-500 group-open:rotate-90 transition-transform">
                    ▶
                  </span>
                </summary>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
