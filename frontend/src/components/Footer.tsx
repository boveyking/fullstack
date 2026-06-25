import { Link } from 'react-router-dom';
import './Footer.css';

interface FooterProps {
  onContactClick: () => void;
}

export function Footer({ onContactClick }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-logo">FAMILyS</div>
          <p className="footer-description">
          Family Alliance for Multigenerational International Legacy and Sustainability
            </p>
          
          <nav className="footer-nav">
            <a href="/">Home</a>
            <a href="#">Articles</a>
            <a href="#">Projects</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onContactClick(); }}>Contact</a>
            <Link to="/privacy">Privacy</Link>
            <Link to="/term">Terms of Service</Link>
          </nav>
        </div>
        
        <div className="footer-right">
          <h3 className="footer-cta-title">From families,By families, for families</h3>
          <a href="#" className="footer-cta-btn">Member Access</a>  
          <p className="footer-copyright">© 2025 FAMILYs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

