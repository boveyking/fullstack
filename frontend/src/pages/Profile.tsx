import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../components/ContactPopup.css';
import { getUserInfo, UserInfo } from '../services/api';
import { useToast } from '../components/useToast';
import { Button } from '@mantine/core';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user?.user_id) {
        setError('User not authenticated');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getUserInfo(user.user_id);
        setUserInfo(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to load user information.';
        setError(errorMessage);
        console.error('Error fetching user information:', err);
        showToast(errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [user]);

  if (!user) {
    return (
      <div className="register-page">
        <div className="register-popup-content">
          <div className="contact-popup-header">
            <h2 className="contact-popup-title">Profile</h2>
          </div>
          <p className="contact-popup-description">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      {ToastComponent}
      <div id="main-content" className="register-popup-content">
        <div className="contact-popup-header">
          <h2 className="contact-popup-title">User Profile</h2>
        </div>

        <p className="contact-popup-description">
          View your profile information and organization details.
        </p>

        {isLoading && (
          <div style={{
            color: '#0066cc',
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#e6f2ff',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            Loading profile information...
          </div>
        )}

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

        {userInfo && (
          <div className="contact-form">
            {/* User Information Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                borderBottom: '1px solid #333',
                paddingBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                User Information
                <Button variant="subtle" onClick={() => navigate('/reset-password')}>Reset Password</Button>
              </h3>

              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userInfo.name || ''}
                    readOnly
                    style={{ cursor: 'default', opacity: 0.8 }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">User Name</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={userInfo.user_name || ''}
                    readOnly
                    style={{ cursor: 'default', opacity: 0.8 }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="alias">Preferred Name</label>
                  <input
                    type="text"
                    id="alias"
                    name="alias"
                    value={userInfo.alias_name || ''}
                    readOnly
                    style={{ cursor: 'default', opacity: 0.8 }}
                  />
                </div>
              </div>

              <div className="form-row-3" style={{ paddingTop: '15px' }}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userInfo.email || ''}
                    readOnly
                    style={{ cursor: 'default', opacity: 0.8 }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={userInfo.title || ''}
                    readOnly
                    style={{ cursor: 'default', opacity: 0.8 }}
                  />
                </div>

               <div className="form-group">
                  <label htmlFor="is_active">Account Status</label>
                  <input
                    type="text"
                    id="is_active"
                    name="is_active"
                    value={userInfo.is_active ? 'Active' : 'Inactive'}
                    readOnly
                    style={{ cursor: 'default', opacity: 0.8 }}
                  />
                </div>
              </div>

            
            </div>

            {/* Organization Information Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                borderBottom: '1px solid #333',
                paddingBottom: '0.5rem'
              }}>
                Organization Information
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="org_name">Organization Name</label>
                  <input
                    type="text"
                    id="org_name"
                    name="org_name"
                    value={userInfo.org_name || ''}
                    readOnly
                    style={{ cursor: 'default', opacity: 0.8 }}
                  />
                </div>

               <div className="form-group">
                  <label htmlFor="is_public">Public Searchable</label>
                  <input
                    type="text"
                    id="is_public"
                    name="is_public"
                    value={userInfo.is_public ? 'Yes' : 'No'}
                    readOnly
                    style={{ cursor: 'default', opacity: 0.8 }}
                  />
                </div>
              </div>

              <div className="form-row">
               
              </div>

              <div className="form-group"  style={{ paddingTop: '15px' }}>
                <label htmlFor="org_desc">Organization Introduction</label>
                <textarea
                  id="org_desc"
                  name="org_desc"
                  rows={6}
                  value={userInfo.org_desc || ''}
                  readOnly
                  style={{ cursor: 'default', opacity: 0.8 }}
                ></textarea>
              </div>

              {userInfo.logo && (
                <div className="form-group"  style={{ paddingTop: '15px' }}>
                  <label htmlFor="logo">Organization Logo</label>
                  <div style={{
                    marginTop: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <img
                      src={userInfo.logo}
                      alt="Organization Logo"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Address Information Section */}
            <div>
              <h3 style={{
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                borderBottom: '1px solid #333',
                paddingBottom: '0.5rem'
              }}>
                Address Information
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={userInfo.city || ''}
                    readOnly
                    style={{ cursor: 'default', opacity: 0.8 }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={userInfo.country || ''}
                    readOnly
                    style={{ cursor: 'default', opacity: 0.8 }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

