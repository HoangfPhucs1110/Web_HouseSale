import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';

SwiperCore.use([Navigation]);

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(Array.isArray(data) ? data : []);
        await fetchRentListings();
      } catch (error) {
        setErr('Không tải được dữ liệu ưu đãi.');
      }
    };

    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(Array.isArray(data) ? data : []);
        await fetchSaleListings();
      } catch (error) {
        setErr((prev) => prev || 'Không tải được dữ liệu cho thuê.');
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=4');
        const data = await res.json();
        setSaleListings(Array.isArray(data) ? data : []);
      } catch (error) {
        setErr((prev) => prev || 'Không tải được dữ liệu mua bán.');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setErr('');
    fetchOfferListings();
  }, []);

  return (
    <div className="bg-white text-slate-800">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                Tìm ngôi nhà <span className="text-emerald-300">phù hợp nhất</span> với bạn
              </h1>
              <p className="mt-4 text-slate-200 text-sm md:text-base leading-relaxed">
                Nền tảng bất động sản hiện đại, dữ liệu minh bạch, thao tác đơn giản.
                Khám phá hàng ngàn căn nhà cập nhật mỗi ngày.
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  to="/search"
                  className="px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90 transition"
                >
                  Bắt đầu tìm kiếm
                </Link>
                <Link
                  to="/dudoan"
                  className="px-5 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition"
                >
                  Dự đoán giá
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-2 text-slate-300 text-xs md:text-sm">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                Dữ liệu cập nhật • Trải nghiệm nhanh chóng • Hỗ trợ tận tâm
              </div>
            </div>

            {/* Slider preview (ẩn trên mobile) */}
            <div className="hidden lg:block">
              <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                {offerListings.length > 0 ? (
                  <Swiper navigation>
                    {offerListings.map((listing) => (
                      <SwiperSlide key={listing._id}>
                        <div className="relative h-[360px]">
                          <img
                            src={listing.imageUrls?.[0]}
                            alt={listing.name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <p className="font-semibold line-clamp-1">{listing.name}</p>
                            <p className="text-sm text-white/90">{listing.address}</p>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="h-[360px] bg-slate-800 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THÔNG BÁO LỖI */}
      {err && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            {err}
          </div>
        </div>
      )}

      {/* listing results for offer, sale and rent — GIỮ Y NGUYÊN BỐ CỤC CỦA BẠN */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-12 my-10">
        {/* Ưu đãi */}
        {loading ? (
          <SectionSkeleton title="Ưu đãi nổi bật" />
        ) : (
          offerListings &&
          offerListings.length > 0 && (
            <div>
              <div className="my-3 flex items-end justify-between">
                <h2 className="text-2xl font-semibold text-slate-700">Ưu đãi nổi bật</h2>
                <Link className="text-sm text-blue-800 hover:underline" to="/search?offer=true">
                  Xem thêm ưu đãi
                </Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {offerListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )
        )}

        {/* Cho thuê */}
        {loading ? (
          <SectionSkeleton title="Cho thuê mới nhất" />
        ) : (
          rentListings &&
          rentListings.length > 0 && (
            <div>
              <div className="my-3 flex items-end justify-between">
                <h2 className="text-2xl font-semibold text-slate-700">Cho thuê mới nhất</h2>
                <Link className="text-sm text-blue-800 hover:underline" to="/search?type=rent">
                  Xem thêm nhà cho thuê
                </Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {rentListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )
        )}

        {/* Mua bán */}
        {loading ? (
          <SectionSkeleton title="Mua bán mới nhất" />
        ) : (
          saleListings &&
          saleListings.length > 0 && (
            <div>
              <div className="my-3 flex items-end justify-between">
                <h2 className="text-2xl font-semibold text-slate-700">Mua bán mới nhất</h2>
                <Link className="text-sm text-blue-800 hover:underline" to="/search?type=sale">
                  Xem thêm nhà bán
                </Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {saleListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* CTA CUỐI */}
      <section className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <h3 className="text-2xl md:text-3xl font-bold">
            Sẵn sàng đăng tin? Hãy để tin của bạn tỏa sáng
          </h3>
          <p className="mt-2 text-slate-600">
            Chuẩn bị ảnh đẹp & mô tả rõ ràng, chúng tôi sẽ giúp bạn tiếp cận đúng khách hàng.
          </p>
          <Link
            to="/create-listing"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:opacity-90 transition"
          >
            Đăng tin ngay
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Skeleton cho mỗi section khi đang loading */
function SectionSkeleton({ title }) {
  return (
    <div>
      <div className="my-3 flex items-end justify-between">
        <h2 className="text-2xl font-semibold text-slate-700">{title}</h2>
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-[280px] h-[260px] rounded-xl border border-slate-200 overflow-hidden"
          >
            <div className="h-[150px] bg-slate-200 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-3/4 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-slate-200 rounded animate-pulse mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
