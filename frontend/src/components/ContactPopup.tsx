import { useState } from 'react';
import './ContactPopup.css';

interface ContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactPopup({ isOpen, onClose }: ContactPopupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    privacy: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! I\'ll get back to you within one business day.');
    setFormData({ name: '', email: '', message: '', privacy: false });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div 
      className={`contact-popup ${isOpen ? 'active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="contact-popup-content">
        <div className="contact-popup-header">
          <h2 className="contact-popup-title">Get in touch</h2>
          <div className="close-btn" onClick={onClose}></div>
        </div>
        
        <p className="contact-popup-description">
          Ready to turn your idea into a standout digital experience?<br />
          Send a message and I'll reply within one business day.
        </p>
        
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name*</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="Jane Smith" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="jane@email.com" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message*</label>
            <textarea 
              id="message" 
              name="message" 
              placeholder="Write here..." 
              rows={6} 
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          
          <div className="form-checkbox">
            <input 
              type="checkbox" 
              id="privacy" 
              name="privacy" 
              checked={formData.privacy}
              onChange={handleChange}
              required 
            />
            <label htmlFor="privacy">I accept the privacy policy.</label>
          </div>
          
          <button type="submit" className="form-submit-btn">Send message</button>
        </form>
      </div>
    </div>
  );
}

