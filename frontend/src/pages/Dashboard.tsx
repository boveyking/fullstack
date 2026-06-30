import './Demo.css';
import './Dashboard.css';
import { Box,Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <Box pr="xl" pl="xl">
            <Container className="dashboard-section">
        <div className="about-header">
          <h2 className="about-title">My Dashboard</h2>         
        </div>
        
        <div className="about-content">
          <div className="about-left">
            <div className="service-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/register/invite')}>
              <div className="service-icon">💌</div>
              <h3 className="service-title">Invite Member</h3>
              <p className="service-description">
               Invite new members to your organization.
              </p>
            </div>
          </div>
          <div className="about-right">
            <div className="service-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/usermgr?tab=organizations')}>
              <div className="service-icon">✅</div>
              <h3 className="service-title">Approve Organization</h3>
              <p className="service-description">
                Check and approve new organizations.
              </p>
            </div>
          </div>
        </div>

        <div className="about-content" style={{ marginTop: '2rem' }}>
          <div className="about-left">
            <div className="service-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/usermgr?tab=users')}>
              <div className="service-icon">👥</div>
              <h3 className="service-title">Manage Members</h3>
              <p className="service-description">
                View and manage members of your organization.
              </p>
            </div>
          </div>
          <div className="about-right">
            <div className="service-card">
              <div className="service-icon">🪪</div>
              <h3 className="service-title">My Profile</h3>
              <p className="service-description">
               Update My Profile. Reset Password.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Box>
  );
}

