import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../components/ContactPopup.css';
import { useToast } from '../components/useToast';
import { Container } from '@mantine/core';
import { Box } from '@mantine/core';
import { sendResetPasswordEmail, resetPasswordWithToken } from '../services/api';
 
// UUID v4 validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUUID = (str: string): boolean => {
  return UUID_REGEX.test(str);
};

export default function ResetPassword() {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const hasToken = token && isValidUUID(token);
  
  const [formData, setFormData] = useState({
    username_or_email: '',
    password: '',
    confirm_password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate password match if token is present
    if (hasToken) {
      if (formData.password !== formData.confirm_password) {
        setError('Passwords do not match.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      if (hasToken) {
        // Reset password with token API call
        const response = await resetPasswordWithToken(token, formData.password);
        
        if (response.result) {
          showToast(response.message || 'Password has been reset successfully!', 'success');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          showToast(response.message || 'Failed to reset password. Please try again.', 'error');
        }
      } else {
        // Request password reset email
        const response = await sendResetPasswordEmail(formData.username_or_email);
        
        if (response.result) {
          showToast(response.message || 'If this email address is associated with an account, a password reset instructions will be   sent to that email.', 'success');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          showToast(response.message || 'Failed to send reset instructions. Please try again.', 'error');
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 
        (hasToken ? 'Failed to reset password. Please try again.' : 'Failed to send reset instructions. Please try again.');
      showToast(errorMessage, 'error');
      console.error('Reset password error:', err);
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

  // Render form based on whether token is present
  if (hasToken) {
    // Token present - show new password form
    return (
      <Container>
        <Box pt="lg" pb="lg">
          {ToastComponent}
          <div className="register-popup-content">
            <div className="contact-popup-header">
              <h2 className="contact-popup-title">Set New Password</h2>
            </div>

            <p className="contact-popup-description">
              Please enter your new password below.
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
                <label htmlFor="password">New Password*</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">Confirm Password*</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  placeholder="Confirm your new password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <button 
                type="submit" 
                className="form-submit-btn" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <div style={{ 
              marginTop: '1.5rem', 
              textAlign: 'center' 
            }}>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
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
                Back to Login
              </a>
            </div>
          </div>
        </Box>
      </Container>
    );
  }

  // No token - show request reset form
  return (
    <Container>
      <Box pt="lg" pb="lg">
        {ToastComponent}
        <div className="register-popup-content">
          <div className="contact-popup-header">
            <h2 className="contact-popup-title">Reset Password</h2>
          </div>

          <p className="contact-popup-description">
            Enter your email address  to reset your password.
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

            <button 
              type="submit" 
              className="form-submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center' 
          }}>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
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
              Back to Login
            </a>
          </div>
        </div>
      </Box>
    </Container>
  );
}

