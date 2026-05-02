import { useState } from 'react'
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants'
import RestaurantCard from '@/features/restaurants/components/RestaurantCard'
import { CUISINE_TYPES } from '@/shared/utils/constants'
import './ExplorePage.css'

export default function ExplorePage() {
  const [search, setSearch] = useState('')
  const [activeCuisine, setActiveCuisine] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { restaurants, loading, error } = useRestaurants({
    cuisine: activeCuisine,
    search,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div className="explore">
      <div className="explore__header">
        <h1 className="explore__title">Explore Restaurants</h1>

        <form className="explore__search" onSubmit={handleSearch}>
          <input
            id="explore-search"
            type="text"
            placeholder="Search restaurants..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="explore__search-input"
          />
          <button type="submit" className="explore__search-btn">Search</button>
        </form>
      </div>

      {/* Cuisine Filters */}
      <div className="explore__filters">
        <button
          className={`explore__filter-chip ${activeCuisine === '' ? 'active' : ''}`}
          onClick={() => setActiveCuisine('')}
        >
          All
        </button>
        {CUISINE_TYPES.map((c) => (
          <button
            key={c}
            className={`explore__filter-chip ${activeCuisine === c ? 'active' : ''}`}
            onClick={() => setActiveCuisine(activeCuisine === c ? '' : c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="explore__state">
          <div className="explore__spinner" />
          <p>Loading restaurants...</p>
        </div>
      )}

      {error && (
        <div className="explore__state explore__state--error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && restaurants.length === 0 && (
        <div className="explore__state">
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <p>No restaurants found. Try a different search or filter.</p>
        </div>
      )}

      {!loading && !error && restaurants.length > 0 && (
        <div className="explore__grid">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  )
}
