import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/ContactPopup.css';
import { loginUser } from '../services/api';
import { useToast } from '../components/useToast';
import { Container } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { Box } from '@mantine/core';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username_or_email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    setIsSubmitting(true);
    
    try {
      const response = await loginUser({
        username_or_email: formData.username_or_email,
        password: formData.password,
      });
      
      if (response.code === 200 && response.result && response.user_data) {
        // Save user data to AuthContext (which will also save to localStorage)
        login(response.user_data);
        showToast('Login successful!', 'success');
        // Navigate to home page after successful login
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        //setError('Failed to login. Please check your credentials.');
        showToast(response.message || 'Login failed', 'error');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to login. Please try again.';
      //setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Login error:', err);
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
        <Box pt="lg" pb="lg"  >
      {ToastComponent}
      <div className="register-popup-content">
        <div className="contact-popup-header">
          <h2 className="contact-popup-title">Login to Fullstack</h2>
        </div>

        <p className="contact-popup-description">
          Welcome back! Please sign in to your account.
        </p>

        {error && (
          <div style={{ 
            color: 'red', 
            padding: '10px', 
            marginBottom: '20px', 
            backgroundColor: '#ffe6e6', 
            borderRadius: '4px' 
          }}>
            {error}
          </div>
        )}

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username_or_email">Username or Email*</label>
            <input
              type="text"
              id="username_or_email"
              name="username_or_email"
              placeholder="Enter your username or email"
              value={formData.username_or_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">Password*</label>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/reset-password');
                }}
                style={{ 
                  fontSize: '0.85rem', 
                  color: 'white', 
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'orange'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
              >
                Forgot Password
              </a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="form-submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      </Box>
    </Container>
  );
}

