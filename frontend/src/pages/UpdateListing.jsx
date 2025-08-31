import React, { useState, useEffect } from 'react'
import { uploadToCloudinary } from '../utils/cloudinary'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const params = useParams()

  const [files, setFiles] = useState([])
  const [imageUrls, setImageUrls] = useState([])   // <-- list ảnh đang hiển thị & submit
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  })

  // Load bài và gắn ảnh cũ
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listingId = params.listingId
        const res = await fetch(`/api/listing/get/${listingId}`)
        const data = await res.json()
        if (data?.success === false) {
          setError(data?.message || 'Không tải được bài đăng')
          return
        }
        setFormData(data)
        setImageUrls(Array.isArray(data?.imageUrls) ? data.imageUrls : [])
      } catch (e) {
        setError('Không tải được bài đăng')
      }
    }
    fetchListing()
  }, [params.listingId])

  // Upload ảnh mới và APPEND vào imageUrls
  const handleImageSubmit = async () => {
    setError('')
    if (!files || files.length === 0) return
    const remain = 6 - imageUrls.length
    if (remain <= 0) return setError('Đã đạt tối đa 6 ảnh')

    if (files.length > remain) {
      return setError(`Bạn chỉ có thể thêm tối đa ${remain} ảnh nữa`)
    }

    try {
      setUploading(true)
      const tasks = []
      for (let i = 0; i < files.length; i++) {
        tasks.push(uploadToCloudinary(files[i]))
      }
      const newUrls = await Promise.all(tasks)

      const merged = [...imageUrls, ...newUrls]
      setImageUrls(merged)
      setFormData((prev) => ({ ...prev, imageUrls: merged }))
      setFiles([])
    } catch (e) {
      setError('Upload ảnh thất bại, thử lại sau')
    } finally {
      setUploading(false)
    }
  }

  // Xoá 1 ảnh theo index
  const handleRemoveImage = (idx) => {
    const next = imageUrls.filter((_, i) => i !== idx)
    setImageUrls(next)
    setFormData((prev) => ({ ...prev, imageUrls: next }))
  }

  // Đặt làm ảnh bìa (đưa ảnh về index 0)
  const handleMakeCover = (idx) => {
    if (idx === 0) return
    const next = [...imageUrls]
    const [picked] = next.splice(idx, 1)
    next.unshift(picked)
    setImageUrls(next)
    setFormData((prev) => ({ ...prev, imageUrls: next }))
  }

  const handleChange = (e) => {
    const { id, type, value, checked, name } = e.target

    // radio cho type
    if (name === 'listingType') {
      return setFormData((prev) => ({ ...prev, type: value }))
    }

    // checkbox boolean
    if (id === 'parking' || id === 'furnished' || id === 'offer') {
      return setFormData((prev) => ({ ...prev, [id]: checked }))
    }

    // text/number/textarea
    if (type === 'number' || type === 'text' || type === 'textarea') {
      return setFormData((prev) => ({ ...prev, [id]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (!currentUser) {
        return setError('Bạn cần đăng nhập để cập nhật bài đăng')
      }
      if (imageUrls.length < 1) {
        return setError('Bạn cần có ít nhất 1 ảnh')
      }
      if (formData.offer && +formData.regularPrice < +formData.discountPrice) {
        return setError('Giá khuyến mãi phải thấp hơn giá thông thường')
      }

      setLoading(true)
      const listingData = {
        ...formData,
        imageUrls, // đồng bộ ảnh
        userRef: currentUser?.rest?._id || currentUser._id,
        discountPrice: formData.offer ? Number(formData.discountPrice) : 0,
      }

      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: 'POST', // nếu backend của bạn là PUT/PATCH thì đổi tại đây
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(listingData),
      })
      const data = await res.json()
      setLoading(false)

      if (!res.ok || data?.success === false) {
        return setError(data?.message || `Lỗi cập nhật (HTTP ${res.status})`)
      }

      navigate(`/listing/${data._id}`)
    } catch (e) {
      setLoading(false)
      setError(e.message || 'Đã có lỗi xảy ra')
    }
  }

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Cập nhật bài đăng</h1>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        {/* Cột trái: fields */}
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Tên bài đăng"
            id="name"
            maxLength="62"
            minLength="10"
            required
            className="border p-3 rounded-lg"
            onChange={handleChange}
            value={formData.name}
          />
          <input
            onChange={handleChange}
            value={formData.description}
            type="text"
            placeholder="Mô tả"
            id="description"
            required
            className="border p-3 rounded-lg"
          />
          <input
            onChange={handleChange}
            value={formData.address}
            type="text"
            placeholder="Địa chỉ"
            id="address"
            maxLength="100"
            minLength="5"
            required
            className="border p-3 rounded-lg"
          />

          {/* Type: dùng radio để không xung đột */}
          <div className="flex gap-6 flex-wrap items-center">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="listingType"
                  value="sale"
                  checked={formData.type === 'sale'}
                  onChange={handleChange}
                />
                <span>Bán</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="listingType"
                  value="rent"
                  checked={formData.type === 'rent'}
                  onChange={handleChange}
                />
                <span>Cho thuê</span>
              </label>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                onChange={handleChange}
                checked={formData.parking}
                type="checkbox"
                id="parking"
                className="w-5 h-5"
              />
              <span>Gara</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                onChange={handleChange}
                checked={formData.furnished}
                type="checkbox"
                id="furnished"
                className="w-5 h-5"
              />
              <span>Nội thất</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                onChange={handleChange}
                checked={formData.offer}
                type="checkbox"
                id="offer"
                className="w-5 h-5"
              />
              <span>Có ưu đãi</span>
            </label>
          </div>

          {/* Số liệu */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <input
                onChange={handleChange}
                value={formData.bedrooms}
                type="number"
                id="bedrooms"
                min={1}
                max={10}
                required
                className="border border-gray-300 p-3 rounded-lg w-24"
              />
              <span>Số phòng ngủ</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                onChange={handleChange}
                value={formData.bathrooms}
                type="number"
                id="bathrooms"
                min={1}
                max={10}
                required
                className="border border-gray-300 p-3 rounded-lg w-24"
              />
              <span>Số phòng tắm</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                onChange={handleChange}
                value={formData.regularPrice}
                type="number"
                id="regularPrice"
                min={1}
                max={2000000}
                required
                className="border border-gray-300 p-3 rounded-lg w-36"
              />
              <span className="flex flex-col items-start leading-tight">
                <span>Giá thông thường</span>
                <span className="text-xs text-slate-500">($)</span>
              </span>
            </label>

            {formData.offer && (
              <label className="flex items-center gap-2">
                <input
                  onChange={handleChange}
                  value={formData.discountPrice}
                  type="number"
                  id="discountPrice"
                  min={1}
                  max={2000000}
                  required
                  className="border border-gray-300 p-3 rounded-lg w-36"
                />
                <span className="flex flex-col items-start leading-tight">
                  <span>Giá khuyến mãi</span>
                  <span className="text-xs text-slate-500">($)</span>
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Cột phải: ảnh */}
        <div className="flex flex-col gap-4 flex-1">
          <p className="font-semibold">Hình ảnh</p>
          <span className="text-sm text-gray-600">Ảnh đầu tiên là ảnh bìa (tối đa 6 ảnh)</span>

          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              type="file"
              id="images"
              accept="image/*"
              multiple
              className="p-3 border border-gray-300 rounded-lg"
            />
            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={uploading || !files || files.length === 0 || imageUrls.length >= 6}
              className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Lưới ảnh hiện có (cũ + mới) */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {imageUrls.map((url, idx) => (
                <div key={url + idx} className="relative rounded-lg overflow-hidden border">
                  <img src={url} alt={`img-${idx}`} className="w-full h-24 object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-1 flex gap-1 bg-gradient-to-t from-black/60 to-transparent">
                    <button
                      type="button"
                      onClick={() => handleMakeCover(idx)}
                      className="text-xs text-white bg-black/60 px-2 py-1 rounded hover:bg-black/80"
                    >
                      {idx === 0 ? 'Bìa' : 'Đặt làm bìa'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="ml-auto text-xs text-white bg-red-600/80 px-2 py-1 rounded hover:bg-red-700"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-700 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || imageUrls.length === 0}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase disabled:opacity-80 hover:opacity-95"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </main>
  )
}
