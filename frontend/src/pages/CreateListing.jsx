import React, { useState } from 'react'
import { uploadToCloudinary } from '../utils/cloudinary'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
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
  });
  

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length < 7) {
      setUploading(true);
      try {
        const promises = [];
        for (let i = 0; i < files.length; i++) {
          promises.push(uploadToCloudinary(files[i]));
        }
        
        const urls = await Promise.all(promises);
        setImageUrls(urls);
        setFormData({ ...formData, imageUrls: urls });
        console.log('Uploaded URLs:', urls);
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    }
  };


  const handleChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!currentUser) {
        return setError('Bạn cần đăng nhập để tạo bài đăng');
      }
      if (formData.imageUrls.length < 1)
        return setError('Bạn cần tải lên ít nhất 1 ảnh');
      if (formData.offer && +formData.regularPrice < +formData.discountPrice)
        return setError('Giá khuyến mãi phải thấp hơn giá thông thường');
      setLoading(true);
      setError(false);
      
      const listingData = {
        ...formData,
        userRef:   currentUser?.rest?._id ||   currentUser._id,
        discountPrice: formData.offer ? formData.discountPrice : 0,
      };
      
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Quan trọng: gửi cookies
        body: JSON.stringify(listingData),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
        return;
      }
      if (res.ok) {
        navigate(`/listing/${data._id}`);
      } else {
        setError(data.message || 'Đã có lỗi xảy ra');
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };


console.log(formData)
  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Tạo bài đăng</h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4'>
        <input type="text" placeholder='Tên bài đăng' id='name' maxLength='62' minLength='10' required className='border p-3 rounded-lg' 
        onChange={handleChange}
        value={formData.name}/>
        <input onChange={handleChange} value={formData.description} type="text" placeholder='Mô tả' id='description'  required className='border p-3 rounded-lg' />
        <input onChange={handleChange} value={formData.address} type="text" placeholder='Địa chỉ' id='address' maxLength='62' minLength='10' required className='border p-3 rounded-lg' />
        <div className='flex gap-6 flex-wrap'>
          <div className='flex items-center gap-2'>
            <input onChange={handleChange} checked={formData.type === 'sale'} type="checkbox" id='sale' className='w-5 h-5' />
            <label htmlFor="sale">Bán</label>
            <input onChange={handleChange} checked={formData.type === 'rent'} type="checkbox" id='rent' className='w-5 h-5' />
            <label htmlFor="rent">Cho thuê</label>
          </div>
          <div className='flex items-center gap-2'>
            <input onChange={handleChange} checked={formData.parking} type="checkbox" id='parking' className='w-5 h-5' />
            <label htmlFor="parking">Gara</label>
          </div>
          <div className='flex items-center gap-2'>
            <input onChange={handleChange} checked={formData.furnished} type="checkbox" id='furnished' className='w-5 h-5' />
            <label htmlFor="furnished">Nội thất</label>
          </div>
          <div className='flex items-center gap-2'>
            <input onChange={handleChange} checked={formData.offer} type="checkbox" id='offer' className='w-5 h-5' />
            <label htmlFor="offer">Có ưu đãi</label>
          </div>
        </div>  
        <div className='flex flex-wrap gap-6'>
          <div className='flex items-center gap-2'>
            <input onChange={handleChange} value={formData.bedrooms} type="number" id='bedrooms' min={1} max={10} required
            className='border border-gray-300 p-3 rounded-lg' />
            <p>Số phòng ngủ</p>
          </div>

          <div className='flex items-center gap-2'>
            <input onChange={handleChange} value={formData.bathrooms} type="number" id='bathrooms' min={1} max={10} required
            className='border border-gray-300 p-3 rounded-lg' />
            <p>Số phòng tắm</p>
          </div>

          <div className='flex items-center gap-2'>
            <input onChange={handleChange} value={formData.regularPrice} type="number" id='regularPrice' min={1} max={2000000} required
            className='border border-gray-300 p-3 rounded-lg' />
            <div className='flex flex-col items-center'>
              <p>Giá thông thường</p>
              <span className='text-xs'>($ / tháng)</span>
            </div>
          </div>

          {formData.offer && (
            <div className='flex items-center gap-2'>
              <input onChange={handleChange} value={formData.discountPrice} type="number" id='discountPrice' min={1} max={2000000} required
              className='border border-gray-300 p-3 rounded-lg' />
              <div className='flex flex-col items-center'>
              <p>Giá khuyến mãi</p>
                <span className='text-xs'>($ / tháng)</span>
              </div>
            </div>
          )}

        </div>
        </div>
        <div className='flex flex-col gap-4 flex-1'>
          <p className='font-semibold' >Image:</p>
          <span className='text-sm text-gray-600'>Ảnh đầu tiên sẽ là ảnh bìa (tối đa 6 ảnh)</span>
          <div className='flex gap-4'>
            <input onChange={(e)=>setFiles(e.target.files)} type="file" id='images' accept='image/*' multiple
            className='p-3 border border-gray-300 rounded-lg' />
            <button 
              type='button' 
              onClick={handleImageSubmit} 
              disabled={uploading || files.length === 0}
              className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-50'>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Hiển thị ảnh đã upload */}
          {imageUrls.length > 0 && (
            <div className='flex flex-col gap-2'>
              <p className='font-semibold'>Ảnh đã upload:</p>
              <div className='flex flex-wrap gap-2'>
                {imageUrls.map((url, index) => (
                  <div key={index} className='relative'>
                    <img 
                      src={url} 
                      alt={`Uploaded ${index + 1}`}
                      className='w-20 h-20 object-cover rounded-lg'
                    />
                    <span className='absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full'>
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className='text-red-700 text-sm'>{error}</p>}
          <button 
            type='submit' 
            disabled={loading || imageUrls.length === 0}
            className='p-3 bg-slate-700 text-white rounded-lg uppercase disabled:opacity-80 hover:opacity-95'>
          {loading ? 'Đang tạo...' : 'Tạo bài đăng'}
        </button>
        {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
       
      </form> 

    </main>
  )
}