// src/components/ListingItem.jsx
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';

export default function ListingItem({ listing }) {
  const {
    _id,
    imageUrls = [],
    name = '',
    address = '',
    offer = false,
    regularPrice = 0,
    discountPrice = 0,
    type = 'rent',
    bedrooms = 0,
    bathrooms = 0,
  } = listing || {};

  const price = offer ? discountPrice : regularPrice;

  return (
    <Link
      to={`/listing/${_id}`}
      className="
        group
        w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.666rem)] lg:w-[calc(25%-0.75rem)]
        rounded-xl overflow-hidden border border-slate-200 bg-white
        hover:shadow-lg transition-shadow
      "
    >
      {/* Ảnh */}
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={imageUrls[0]}
          alt={name}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
          loading="lazy"
        />
        {/* Tag For Rent/Sale */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 text-xs rounded-md bg-black/70 text-white">
            {type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
        {/* Tag Offer */}
        {offer && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 text-xs rounded-md bg-emerald-600 text-white">
              Offer
            </span>
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div className="p-3">
        {/* Tên */}
        <h3 className="font-semibold text-slate-800 leading-tight line-clamp-2 min-h-[3rem]">
          {name}
        </h3>

        {/* Địa chỉ */}
        <div className="mt-1 flex items-center gap-1 text-slate-500 text-sm line-clamp-1">
          <FaMapMarkerAlt className="text-emerald-600 shrink-0" />
          <span title={address}>{address}</span>
        </div>

        {/* Giá */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900">
            ${price?.toLocaleString('en-US')}
            {type === 'rent' && <span className="text-sm text-slate-500"> /month</span>}
          </span>
          {offer && (
            <span className="text-xs line-through text-slate-400">
              ${regularPrice?.toLocaleString('en-US')}
            </span>
          )}
        </div>

        {/* Info nhỏ */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
          <span>{bedrooms} bed{bedrooms > 1 ? 's' : ''}</span>
          <span className="inline-block h-1 w-1 rounded-full bg-slate-300" />
          <span>{bathrooms} bath{bathrooms > 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  );
}
