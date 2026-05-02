import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { profileService } from '@/features/profile/services/profileService'
import { goalService } from '@/features/profile/services/goalService'
import { useToast } from '@/shared/components/Toast'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, profile, displayName, refreshProfile } = useAuth()
  const toast = useToast()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  // Addresses
  const [addresses, setAddresses] = useState([])
  const [loadingAddr, setLoadingAddr] = useState(true)
  const [newAddr, setNewAddr] = useState({ label: '', address_line: '', city: '', pincode: '' })
  const [showAddrForm, setShowAddrForm] = useState(false)

  // Goals
  const [goals, setGoals] = useState([])
  const [loadingGoals, setLoadingGoals] = useState(true)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newGoal, setNewGoal] = useState({ goal_type: 'calorie_limit', target_value: 2000, period: 'daily' })

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  useEffect(() => {
    if (!user) return
    async function loadAddresses() {
      const { data } = await profileService.getAddresses(user.id)
      setAddresses(data || [])
      setLoadingAddr(false)
    }
    loadAddresses()

    async function loadGoals() {
      const { data } = await goalService.getUserGoals(user.id)
      setGoals(data || [])
      setLoadingGoals(false)
    }
    loadGoals()
  }, [user])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) return
    setSaving(true)
    const { error } = await profileService.update(user.id, {
      full_name: fullName.trim(),
      phone: phone.trim() || null,
    })
    setSaving(false)
    if (error) {
      toast.error('Failed to update profile.')
    } else {
      toast.success('Profile updated!')
      refreshProfile()
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    if (!newAddr.address_line.trim() || !newAddr.city.trim()) return

    const { data, error } = await profileService.addAddress({
      user_id: user.id,
      ...newAddr,
    })
    if (!error && data) {
      setAddresses((prev) => [...prev, data])
      setNewAddr({ label: '', address_line: '', city: '', pincode: '' })
      setShowAddrForm(false)
      toast.success('Address added!')
    } else {
      toast.error('Failed to add address.')
    }
  }

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return
    const { error } = await profileService.deleteAddress(id)
    if (!error) {
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success('Address removed.')
    }
  }

  const handleAddGoal = async (e) => {
    e.preventDefault()
    if (!newGoal.target_value) return

    const { data, error } = await goalService.upsertGoal(user.id, newGoal)
    if (!error && data) {
      setGoals((prev) => {
        const existing = prev.find(g => g.id === data.id)
        if (existing) return prev.map(g => g.id === data.id ? data : g)
        return [...prev, data]
      })
      setShowGoalForm(false)
      toast.success('Goal saved!')
    } else {
      toast.error('Failed to save goal.')
    }
  }

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return
    const { error } = await goalService.deleteGoal(id)
    if (!error) {
      setGoals((prev) => prev.filter((g) => g.id !== id))
      toast.success('Goal removed.')
    }
  }

  if (!user) {
    return (
      <div className="profile__state">
        <p>Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="profile">
      <h1 className="profile__title">Profile Settings</h1>

      {/* Profile Info Card */}
      <div className="profile__card">
        <div className="profile__avatar">
          {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="profile__meta">
          <p className="profile__name">{displayName}</p>
          <p className="profile__email">{user.email}</p>
          <p className="profile__joined">
            Joined {new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <form className="profile__form" onSubmit={handleSaveProfile}>
        <h2 className="profile__section-title">Personal Info</h2>

        <div className="profile__field">
          <label htmlFor="profile-name">Full Name</label>
          <input
            id="profile-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="profile__field">
          <label htmlFor="profile-email">Email</label>
          <input id="profile-email" type="email" value={user.email} disabled />
        </div>

        <div className="profile__field">
          <label htmlFor="profile-phone">Phone (optional)</label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9876543210"
          />
        </div>

        <button type="submit" className="profile__save-btn" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Saved Addresses */}
      <div className="profile__section">
        <div className="profile__section-header">
          <h2 className="profile__section-title">Saved Addresses</h2>
          <button
            className="profile__add-addr-btn"
            onClick={() => setShowAddrForm(!showAddrForm)}
          >
            {showAddrForm ? 'Cancel' : '+ Add Address'}
          </button>
        </div>

        {showAddrForm && (
          <form className="profile__addr-form" onSubmit={handleAddAddress}>
            <div className="profile__field">
              <label>Label (e.g. Home, Office)</label>
              <input
                type="text"
                value={newAddr.label}
                onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                placeholder="Home"
              />
            </div>
            <div className="profile__field">
              <label>Address</label>
              <input
                type="text"
                value={newAddr.address_line}
                onChange={(e) => setNewAddr({ ...newAddr, address_line: e.target.value })}
                placeholder="House/flat, street, landmark"
                required
              />
            </div>
            <div className="profile__field-row">
              <div className="profile__field">
                <label>City</label>
                <input
                  type="text"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  placeholder="City"
                  required
                />
              </div>
              <div className="profile__field">
                <label>Pincode</label>
                <input
                  type="text"
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  placeholder="110001"
                />
              </div>
            </div>
            <button type="submit" className="profile__save-btn">Save Address</button>
          </form>
        )}

        {loadingAddr ? (
          <div className="profile__loading"><div className="profile__spinner" /></div>
        ) : addresses.length === 0 ? (
          <p className="profile__empty">No saved addresses yet.</p>
        ) : (
          <div className="profile__addr-list">
            {addresses.map((addr) => (
              <div key={addr.id} className="profile__addr-card">
                <div className="profile__addr-info">
                  {addr.label && <span className="profile__addr-label">{addr.label}</span>}
                  <p className="profile__addr-line">{addr.address_line}</p>
                  <p className="profile__addr-city">{addr.city}{addr.pincode ? `, ${addr.pincode}` : ''}</p>
                </div>
                <button
                  className="profile__addr-delete"
                  onClick={() => handleDeleteAddress(addr.id)}
                  title="Delete address"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nutrition Goals */}
      <div className="profile__section">
        <div className="profile__section-header">
          <h2 className="profile__section-title">Nutrition Goals</h2>
          <button
            className="profile__add-addr-btn"
            onClick={() => setShowGoalForm(!showGoalForm)}
          >
            {showGoalForm ? 'Cancel' : '+ Add Goal'}
          </button>
        </div>

        {showGoalForm && (
          <form className="profile__addr-form" onSubmit={handleAddGoal}>
            <div className="profile__field-row">
              <div className="profile__field">
                <label>Goal Type</label>
                <select 
                  value={newGoal.goal_type} 
                  onChange={(e) => setNewGoal({...newGoal, goal_type: e.target.value})}
                  className="profile__select"
                >
                  <option value="calorie_limit">Max Calories</option>
                  <option value="protein_target">Min Protein (g)</option>
                  <option value="carbs_limit">Max Carbs (g)</option>
                  <option value="fat_limit">Max Fat (g)</option>
                </select>
              </div>
              <div className="profile__field">
                <label>Target Value</label>
                <input
                  type="number"
                  value={newGoal.target_value}
                  onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="profile__field">
              <label>Period</label>
              <select 
                value={newGoal.period} 
                onChange={(e) => setNewGoal({...newGoal, period: e.target.value})}
                className="profile__select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <button type="submit" className="profile__save-btn">Save Goal</button>
          </form>
        )}

        {loadingGoals ? (
          <div className="profile__loading"><div className="profile__spinner" /></div>
        ) : goals.length === 0 ? (
          <p className="profile__empty">No goals set yet. Set a calorie or macro goal to start conscious eating!</p>
        ) : (
          <div className="profile__addr-list">
            {goals.map((goal) => (
              <div key={goal.id} className="profile__addr-card">
                <div className="profile__addr-info">
                  <span className="profile__addr-label">{goal.goal_type.replace('_', ' ').toUpperCase()}</span>
                  <p className="profile__addr-line">{goal.target_value} {goal.goal_type.includes('calorie') ? 'kcal' : 'g'} / {goal.period}</p>
                </div>
                <button
                  className="profile__addr-delete"
                  onClick={() => handleDeleteGoal(goal.id)}
                  title="Delete goal"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
