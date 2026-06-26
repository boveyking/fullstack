import './NavigationOverlay.css';
import { useNavigate } from 'react-router-dom';

interface NavigationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavigationOverlay({ isOpen, onClose }: NavigationOverlayProps) {
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/home');
    onClose();
  };

  return (
    <div className={`nav-overlay ${isOpen ? 'active' : ''}`} id="navOverlay">
      <div className="nav-header">
        <button 
          className="logo" 
          onClick={handleLogoClick}
          onMouseDown={(e) => e.stopPropagation()}
          type="button"
        >
          fullstack
        </button>
        <div className="close-btn" onClick={onClose}></div>
      </div>
      <ul className="nav-links">
        <li><a href="/home" onClick={(e) => { e.preventDefault(); navigate('/home'); onClose(); }}>Home</a></li>
         <li><a href="#" onClick={(e) => { e.preventDefault(); onClose(); }}>Articles</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); onClose(); }}>Gatherings</a></li>
        <li><a href="/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); onClose(); }}>Members</a></li>
   
      </ul>
    </div>
  );
}

