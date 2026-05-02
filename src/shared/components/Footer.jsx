import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand-col">
            <Link to="/" className="footer__brand">🍽️ Cravour</Link>
            <p className="footer__tagline">Conscious eating, delivered.</p>
            <p className="footer__copy">© {new Date().getFullYear()} Cravour. All rights reserved.</p>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4 className="footer__col-title">Explore</h4>
            <Link to="/discover" className="footer__link">✨ Craving Match</Link>
            <Link to="/explore" className="footer__link">Restaurants</Link>
            <Link to="/cart" className="footer__link">Cart</Link>
          </div>

          {/* Account */}
          <div className="footer__col">
            <h4 className="footer__col-title">Account</h4>
            <Link to="/dashboard" className="footer__link">Dashboard</Link>
            <Link to="/orders" className="footer__link">Orders</Link>
            <Link to="/profile" className="footer__link">Profile</Link>
          </div>

          {/* Info */}
          <div className="footer__col">
            <h4 className="footer__col-title">Info</h4>
            <span className="footer__link footer__link--static">Built with ❤️ by Jhanvi</span>
            <span className="footer__link footer__link--static">React + Supabase</span>
          </div>
        </div>

        <div className="footer__bottom">
          <p>Eat conscious. Live better.</p>
        </div>
      </div>
    </footer>
  )
}
