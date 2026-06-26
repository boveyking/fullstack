import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyInvitation } from '../services/api';
import '../components/ContactPopup.css';

export default function Verify() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('We are verifying the invitation...');
  const [apiReady, setApiReady] = useState(false);
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    // Avoid running verification twice in React.StrictMode (dev)
    if (hasVerifiedRef.current) {
      return;
    }
    hasVerifiedRef.current = true;

    const verify = async () => {
      // Start verifying as soon as effect runs
      setStatus('verifying');
      setMessage('We are verifying the invitation...');

      if (!token) {
        setStatus('error');
        setMessage('Invalid invitation link');
        setApiReady(true);
        return;
      }

      try {
        const response = await verifyInvitation(token);
        
        if (response.code === 200 && response.result) {
          // Success - invitation verified
          setStatus('success');
          setMessage(response.message);
          // Redirect to register page with token after 2 seconds
          setTimeout(() => {
            navigate(`/register/${token}`);
          }, 2000);
        } else if (response.code === 404) {
          // Invalid invitation code
          setStatus('error');
          setMessage('Invalid invitation code');
        } else if (response.code === 400) {
          // Invitation already accepted
          setStatus('error');
          setMessage('Invitation already accepted');
        } else {
          // Other error
          setStatus('error');
          setMessage(response.message || 'Verification failed');
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setStatus('error');
        const errorMessage = err.response?.data?.message || 'Failed to verify invitation. Please try again.';
        setMessage(errorMessage);
      } finally {
        // Mark API as completed (success or error)
        setApiReady(true);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="register-page">
      <div className="register-popup-content" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        padding: '40px'
      }}>
        <div className="contact-popup-header">
          <h2 className="contact-popup-title">Welcome to fullstack</h2>
        </div>

        {/* Verifying State */}
        {status === 'verifying' && (
          <div style={{ 
            marginTop: '30px',
            fontSize: '18px',
            color: '#ffffff'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div className="spinner" style={{
                border: '4px solid rgba(255, 255, 255, 0.3)',
                borderTop: '4px solid #ffffff',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
            <p>{message}</p>
          </div>
        )}
        
        {/* Success State */}
        {status === 'success' && (
          <div style={{ 
            marginTop: '30px',
            fontSize: '18px',
            color: '#44ff44'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
            <p>{message}</p>
            <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.8 }}>
              Redirecting to registration page...
            </p>
          </div>
        )}
        
        {/* Error State (only show after API call is done) */}
        {apiReady && status === 'error' && (
          <div style={{ 
            marginTop: '30px',
            fontSize: '18px',
            color: '#ff4444'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛑</div>
            <p>{message}</p>
            <button 
              onClick={() => navigate('/login')}
              style={{
                marginTop: '20px',
                padding: '10px 30px',
                fontSize: '16px',
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

