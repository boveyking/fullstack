import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/ContactPopup.css';
import { useToast } from '../components/useToast';
import { Container } from '@mantine/core';
import { inviteUser } from '../services/api';

export default function Invite() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    organization: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Call API to send invitation
      const response = await inviteUser({
        email: formData.email,
        organization: formData.organization,
      });
      
      // Check if invitation was successful
      if (response.result && response.code === 200) {
        showToast(response.message || 'Invitation sent successfully!', 'success');
        
        // Reset form after successful submission
        setFormData({
          email: '',
          organization: '',
        });
        
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // Handle API error response
        showToast(response.message || 'Failed to send invitation. Please try again.', 'error');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to send invitation. Please try again.';
      showToast(errorMessage, 'error');
      console.error('Invitation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container  >
      {ToastComponent}
      <div className="register-popup-content">
        <div className="contact-popup-header">
          <h2 className="contact-popup-title">Invite Member</h2>
        </div>

        <p className="contact-popup-description">
          Invite a new member to join your organization.
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter member's email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="organization">Organization*</label>
            <input
              type="text"
              id="organization"
              name="organization"
              placeholder="Enter organization name"
              value={formData.organization}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="form-submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
          </button>
        </form>
      </div>
    </Container>
  );
}

