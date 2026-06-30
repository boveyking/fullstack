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
 
          
          <nav className="footer-nav">
            <a href="/">Home</a>
            <a href="#">Articles</a>
            <a href="#">Projects</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onContactClick(); }}>Contact</a>
            <Link to="/privacy">Privacy</Link>
            <Link to="/term">Terms of Service</Link>
          </nav>
        </div>
        
        
      </div>
    </footer>
  );
}

