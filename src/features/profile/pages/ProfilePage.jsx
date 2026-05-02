import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { profileService } from '@/features/profile/services/profileService'
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
    </div>
  )
}
