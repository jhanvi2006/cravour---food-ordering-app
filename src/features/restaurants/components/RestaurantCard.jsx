import { Link } from 'react-router-dom'
import { formatPriceRange } from '@/shared/utils/formatters'
import './RestaurantCard.css'

export default function RestaurantCard({ restaurant }) {
  const {
    slug,
    name,
    image_url,
    cuisine_type = [],
    rating,
    total_reviews,
    price_range,
    avg_delivery_time,
    delivery_fee,
  } = restaurant

  return (
    <Link to={`/restaurant/${slug}`} className="restaurant-card" id={`restaurant-${slug}`}>
      <div className="restaurant-card__image-wrapper">
        {image_url ? (
          <img src={image_url} alt={name} className="restaurant-card__image" />
        ) : (
          <div className="restaurant-card__placeholder">🍽️</div>
        )}
        {delivery_fee === 0 && (
          <span className="restaurant-card__badge">Free Delivery</span>
        )}
      </div>

      <div className="restaurant-card__body">
        <div className="restaurant-card__header">
          <h3 className="restaurant-card__name">{name}</h3>
          {rating > 0 && (
            <span className="restaurant-card__rating">
              ⭐ {rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="restaurant-card__cuisines">
          {cuisine_type.join(' • ')}
        </p>

        <div className="restaurant-card__meta">
          <span>{formatPriceRange(price_range || 2)}</span>
          <span className="restaurant-card__dot">•</span>
          <span>{avg_delivery_time} min</span>
          {total_reviews > 0 && (
            <>
              <span className="restaurant-card__dot">•</span>
              <span>{total_reviews} reviews</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
