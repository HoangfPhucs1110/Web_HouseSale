# Hướng dẫn thiết lập Cloudinary

## Bước 1: Tạo tài khoản Cloudinary
1. Truy cập https://cloudinary.com/
2. Đăng ký tài khoản miễn phí
3. Đăng nhập vào dashboard

## Bước 2: Lấy thông tin cấu hình
1. Trong dashboard, tìm phần "Account Details"
2. Ghi lại:
   - Cloud Name
   - API Key
   - API Secret

## Bước 3: Tạo Upload Preset
1. Vào Settings > Upload
2. Cuộn xuống phần "Upload presets"
3. Click "Add upload preset"
4. Đặt tên preset (ví dụ: "house_sale_upload")
5. Chọn "Unsigned" trong phần "Signing Mode"
6. Lưu preset

## Bước 4: Tạo file .env
Tạo file `.env` trong thư mục `frontend` với nội dung:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
```

**Ví dụ thực tế:**
```
VITE_CLOUDINARY_CLOUD_NAME=mycloud123
VITE_CLOUDINARY_UPLOAD_PRESET=house_sale_upload
```

**Lưu ý**: 
- Chỉ cần Cloud Name và Upload Preset cho client-side upload
- API Key và Secret chỉ cần cho server-side operations
- Thay thế `your_cloud_name` bằng Cloud Name thực từ dashboard Cloudinary
- Thay thế `your_upload_preset_name` bằng tên Upload Preset bạn đã tạo

**Quan trọng**: Sau khi tạo file .env, bạn phải khởi động lại development server để load các biến môi trường mới.

## Bước 5: Khởi động lại ứng dụng
Sau khi tạo file .env, khởi động lại development server để load các biến môi trường mới.

## Lưu ý bảo mật
- Không commit file .env lên git
- Thêm .env vào .gitignore
- Chỉ sử dụng API Key và Secret cho server-side operations
- Upload Preset có thể sử dụng ở client-side vì đã được cấu hình "Unsigned" 