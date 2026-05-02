import { Link } from 'react-router-dom'
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants'
import RestaurantCard from '@/features/restaurants/components/RestaurantCard'
import './HomePage.css'

export default function HomePage() {
  const { restaurants, loading } = useRestaurants()

  return (
    <div className="home">
      {/* Hero */}
      <section className="home__hero">
        <h1 className="home__hero-title">
          Discover food you <span className="home__accent">crave</span>
        </h1>
        <p className="home__hero-sub">
          Browse stunning menus, order from the best local restaurants, and get it delivered to your door.
        </p>
        <Link to="/explore" className="home__hero-cta">
          Explore Restaurants →
        </Link>
      </section>

      {/* Featured Restaurants */}
      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">Top Rated Near You</h2>
          <Link to="/explore" className="home__section-link">View all →</Link>
        </div>

        {loading ? (
          <div className="home__loading">
            <div className="home__spinner" />
          </div>
        ) : (
          <div className="home__grid">
            {restaurants.slice(0, 6).map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}

        {!loading && restaurants.length === 0 && (
          <p className="home__empty">No restaurants yet. Check back soon!</p>
        )}
      </section>
    </div>
  )
}
