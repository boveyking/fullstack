import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../components/ContactPopup.css';
import { registerUser, getOrgByToken } from '../services/api';
import { useToast } from '../components/useToast';
import { Upload, X } from 'lucide-react';
import { Modal, Text, Button } from '@mantine/core';

export default function Register() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    title: '',
    password: '',
    alias: '',
    intro: '',
    city: '',
    country: '',
    org_name: '',
    confirmPassword: '',
    privacy: false,
    public: true,
    logo: ''
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoInputMethod, setLogoInputMethod] = useState<'url' | 'upload'>('url');
  const [logoUrl, setLogoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const { showToast, ToastComponent } = useToast();

  // Fetch organization data if token is not 'invite'
  useEffect(() => {
    const fetchOrgData = async () => {
      if (!token || token === 'invite') {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const orgData = await getOrgByToken(token);
        setFormData(prev => ({
          ...prev,
          email: orgData.email || '',
          org_name: orgData.organization || '',
          city: orgData.city || '',
          country: orgData.country || '',
          intro: orgData.intro || '',
          title: orgData.title || '',
          username: orgData.user_name || '',
          name: orgData.name || '',
          alias: orgData.alias_name || '',
          logo: orgData.logo || ''
        }));

        if(orgData.status === 'pending'){
          setIsPendingModalOpen(true);
          return;
        }
        // Set logo preview if logo exists
        if (orgData.logo) {
          setLogoPreview(orgData.logo);
          setLogoInputMethod('upload'); // Switch to upload mode to show dropzone
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to load organization data.';
        setError(errorMessage);
        console.error('Error fetching organization data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Determine the flag based on token
      const flag = token === 'invite' ? 'invite' : token;
      
      const response = await registerUser({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        title: formData.title,
        password: formData.password,
        alias: formData.alias,
        intro: formData.intro,
        city: formData.city,
        country: formData.country,
        org_name: formData.org_name,
        public: formData.public,
        flag: flag,
        logo: formData.logo || undefined
      });
      
      showToast(`Registration successful! ${response.message}`, 'success');
      setFormData({ 
        name: '', 
        username: '', 
        email: '', 
        title: '', 
        password: '', 
        alias: '', 
        intro: '', 
        city: '', 
        country: '', 
        org_name: '', 
        confirmPassword: '', 
        privacy: false, 
        public: true,
        logo: ''
      });
      setLogoPreview(null);
      setLogoUrl('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Convert image file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Download image from URL and convert to base64
  const urlToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error('Failed to load image from URL');
    }
  };

  // Handle logo URL input
  const handleLogoUrlSubmit = async () => {
    if (!logoUrl.trim()) {
      setError('Please enter a valid image URL');
      return;
    }
    try {
      const base64 = await urlToBase64(logoUrl);
      setFormData(prev => ({ ...prev, logo: base64 }));
      setLogoPreview(base64);
      setError(null);
      // Switch to upload mode to show the dropzone with preview
      setLogoInputMethod('upload');
    } catch (err: any) {
      setError(err.message || 'Failed to load image from URL');
      setLogoPreview(null);
      setFormData(prev => ({ ...prev, logo: '' }));
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setFormData(prev => ({ ...prev, logo: base64 }));
      setLogoPreview(base64);
      setError(null);
    } catch (err: any) {
      setError('Failed to process image file');
      setLogoPreview(null);
      setFormData(prev => ({ ...prev, logo: '' }));
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  useEffect(() => {
    // Only set up drag and drop when in upload mode
    if (logoInputMethod !== 'upload') return;

    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      dropZone.classList.add('drag-over');
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter === 0) {
        dropZone.classList.remove('drag-over');
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer?.files[0];
      if (file) {
        handleFileSelect(file);
      }
    };

    dropZone.addEventListener('dragenter', handleDragEnter);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragenter', handleDragEnter);
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [logoInputMethod, handleFileSelect]);

  // Remove logo
  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
    setLogoPreview(null);
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="register-page">
      {ToastComponent}
      <Modal
        opened={isPendingModalOpen}
        onClose={() => {
          setIsPendingModalOpen(false);
          navigate('/login');
        }}
        title="Organization Pending Approval"
        centered
        withCloseButton
        overlayProps={{
          backgroundOpacity: 0.9,
        }}
        styles={{
          title: {
            color: '#fff',
            fontSize: '1.25rem',
            fontWeight: 600,
            textAlign: 'center',
            width: '100%',
          },
          content: {
            backgroundColor: '#0a0a0a',
            border: '1px solid #222',
          },
          header: {
            backgroundColor: '#0a0a0a',
            borderBottom: '1px solid #222',
          },
          body: {
            padding: '1.5rem',
          },
        }}
      >
        <Text size="sm" style={{ marginBottom: '20px', color: '#999' }}>
          Organization is pending approval. Please wait for approval.
        </Text>
        <Button
          onClick={() => {
            setIsPendingModalOpen(false);
            navigate('/login');
          }}
          style={{ 
            width: '100%',
            backgroundColor: 'white',
            color: 'black'
          }}
        >
          Close
        </Button>
      </Modal>
      {!isPendingModalOpen && (
        <div id='mian-content' className="register-popup-content">
        <div className="contact-popup-header">
          <h2 className="contact-popup-title">{token === 'invite' ? ' Invitation Form fullstack' : 'Create Account with fullstack '}</h2>
        </div>

        <p className="contact-popup-description">
          {token === 'invite' ? 'Pre-fill   information for invitation.' : 'Join us today and start your journey.'}
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
            Loading organization data...
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

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="name">Full Name*</label>
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
              <label htmlFor="username">User Name</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Your user name"
                value={formData.username}
                onChange={handleChange}

              />
            </div>

            <div className="form-group">
              <label htmlFor="alias">Preferred Name</label>
              <input
                type="text"
                id="alias"
                name="alias"
                placeholder="Your alias"
                value={formData.alias}
                onChange={handleChange}
                 
              />
            </div>
          </div>

          <div className="form-row-3">
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
              <label htmlFor="password">Password*</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required={token !== 'invite'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password*</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={token !== 'invite'}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="org_name">Your Organization Name*</label>
              <input
                type="text"
                id="org_name"
                name="org_name"
                placeholder="Your organization name"
                value={formData.org_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Your title"
                value={formData.title}
                onChange={handleChange}

              />
            </div>

           
          </div>
          <div className="form-row">
            

            <div className="form-group">
              <label htmlFor="city">City*</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Your city"
                value={formData.city}
                onChange={handleChange}

              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country*</label>
              <input
                type="text"
                id="country"
                name="country"
                placeholder="Your country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="intro">Introduction</label>
            <textarea
              id="intro"
              name="intro"
              placeholder="Write here a brief introduction about your oraganization."
              rows={6}
              value={formData.intro}
              onChange={handleChange}
           
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="logo">Organization Logo</label>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setLogoInputMethod('url')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: logoInputMethod === 'url' ? 'white' : '#333',
                    color: logoInputMethod === 'url' ? 'black' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Enter URL
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputMethod('upload')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: logoInputMethod === 'upload' ? 'white' : '#333',
                    color: logoInputMethod === 'upload' ? 'black' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Upload File
                </button>
              </div>

              {logoInputMethod === 'url' ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      color: 'white'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleLogoUrlSubmit}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'white',
                      color: 'black',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Load
                  </button>
                </div>
              ) : (
                <div
                  ref={dropZoneRef}
                  onClick={() => fileInputRef.current?.click()}
                  className="logo-upload-dropzone"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                  {logoPreview ? (
                    <>
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="logo-preview-in-dropzone"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLogo();
                        }}
                        className="logo-remove-btn-in-dropzone"
                      >
                        <X size={16} />
                      </button>
                      <p className="logo-change-hint">
                        Click to change image or drag and drop a new one
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={32} style={{ marginBottom: '10px', color: '#666' }} />
                      <p style={{ color: '#999', margin: '0' }}>
                        Click to upload or drag and drop
                      </p>
                      <p style={{ color: '#666', fontSize: '12px', margin: '5px 0 0 0' }}>
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  checked={formData.privacy}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="privacy">I accept the privacy policy and terms of service.</label>
              </div>

            </div>
            <div className="form-group">

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="public"
                  name="public"
                  checked={formData.public}
                  onChange={handleChange}
           
                />
                <label htmlFor="public">I want to make my organization public searchable.</label>
              </div>

            </div>
          </div>

          <button 
            type="submit" 
            className="form-submit-btn" 
            disabled={!formData.privacy || isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : token === 'invite' ? 'Send Invitation' : 'Create Account'}
          </button>
        </form>
        </div>
      )}
    </div>
  );
}

