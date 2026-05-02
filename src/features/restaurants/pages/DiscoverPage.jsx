import { useState } from 'react'
import { Link } from 'react-router-dom'
import { restaurantService } from '@/features/restaurants/services/restaurantService'
import { useCart } from '@/features/cart/hooks/useCart'
import { formatCurrency } from '@/shared/utils/formatters'
import './DiscoverPage.css'

const MOODS = ['Comfort', 'Healthy', 'Indulgent', 'Light']
const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy', 'Extra Spicy']
const BUDGETS = [
  { label: '₹ (Under 200)', maxPrice: 200 },
  { label: '₹₹ (200 - 400)', maxPrice: 400 },
  { label: '₹₹₹ (400+)', maxPrice: 10000 },
]

export default function DiscoverPage() {
  const { addItem, items: cartItems, restaurantId } = useCart()

  const [step, setStep] = useState(1) // 1: Quiz, 2: Results
  const [mood, setMood] = useState('')
  const [spice, setSpice] = useState('')
  const [budget, setBudget] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  const handleMatch = async () => {
    if (!mood || !spice || !budget) return
    setLoading(true)
    setStep(2)

    // Fetch items based on budget constraint
    const { data, error } = await restaurantService.getDiscoverItems({ maxPrice: budget.maxPrice })
    
    if (!error && data) {
      // In a real app, we'd use an ML/Recommendation engine to filter by mood/spice.
      // For MVP, we will shuffle the results to simulate "discovery"
      const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 10)
      setResults(shuffled)
    }
    setLoading(false)
  }

  const getCartQty = (itemId) => {
    const found = cartItems.find((i) => i.id === itemId)
    return found ? found.quantity : 0
  }

  return (
    <div className="discover">
      {step === 1 && (
        <div className="discover__quiz">
          <div className="discover__header">
            <h1 className="discover__title">Craving Match</h1>
            <p className="discover__sub">Tell us what you're feeling, and we'll find the perfect dish for you.</p>
          </div>

          <div className="discover__question">
            <h3>1. What's your mood?</h3>
            <div className="discover__options">
              {MOODS.map(m => (
                <button
                  key={m}
                  className={`discover__option ${mood === m ? 'active' : ''}`}
                  onClick={() => setMood(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="discover__question">
            <h3>2. How spicy?</h3>
            <div className="discover__options">
              {SPICE_LEVELS.map(s => (
                <button
                  key={s}
                  className={`discover__option ${spice === s ? 'active' : ''}`}
                  onClick={() => setSpice(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="discover__question">
            <h3>3. Budget?</h3>
            <div className="discover__options">
              {BUDGETS.map(b => (
                <button
                  key={b.label}
                  className={`discover__option ${budget?.label === b.label ? 'active' : ''}`}
                  onClick={() => setBudget(b)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="discover__match-btn"
            disabled={!mood || !spice || !budget}
            onClick={handleMatch}
          >
            Find My Match ✨
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="discover__results">
          <div className="discover__results-header">
            <h2>We found these for your {mood.toLowerCase()} craving!</h2>
            <button className="discover__retake" onClick={() => setStep(1)}>
              ⟲ Retake Quiz
            </button>
          </div>

          {loading ? (
            <div className="discover__loading">
              <div className="discover__spinner"></div>
              <p>Consulting our culinary experts...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="discover__empty">
              <span style={{fontSize: '3rem'}}>😔</span>
              <p>We couldn't find a perfect match right now.</p>
            </div>
          ) : (
            <div className="discover__grid">
              {results.map((item) => {
                const qty = getCartQty(item.id)
                // Cart conflict warning if from another restaurant
                const conflict = restaurantId && restaurantId !== item.restaurant_id
                
                return (
                  <div key={item.id} className="discover-card">
                    <div className="discover-card__img-wrapper">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="discover-card__img" />
                      ) : (
                        <div className="discover-card__placeholder">🍽️</div>
                      )}
                      {item.is_veg ? (
                        <span className="discover-card__veg veg">●</span>
                      ) : (
                        <span className="discover-card__veg nonveg">●</span>
                      )}
                    </div>
                    
                    <div className="discover-card__body">
                      <div className="discover-card__rest">
                        <Link to={`/restaurant/${item.restaurant?.slug}`}>{item.restaurant?.name}</Link>
                      </div>
                      <h3 className="discover-card__name">{item.name}</h3>
                      <p className="discover-card__price">{formatCurrency(item.price)}</p>
                      
                      {/* Nutrition snippet if available */}
                      {(item.calories || item.protein) && (
                        <div className="discover-card__macros">
                          {item.calories && <span>{item.calories} kcal</span>}
                          {item.protein && <span>{item.protein}g P</span>}
                        </div>
                      )}

                      <button
                        className={`discover-card__add ${conflict ? 'conflict' : ''}`}
                        onClick={() => {
                          if (conflict) {
                            if (!window.confirm('Adding this will clear your current cart from another restaurant. Continue?')) return
                          }
                          addItem({
                            id: item.id,
                            name: item.name,
                            price: Number(item.price),
                            image_url: item.image_url,
                          }, item.restaurant_id)
                        }}
                      >
                        {qty > 0 ? `Added (${qty})` : conflict ? 'Replace Cart +' : 'Add to Cart +'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
