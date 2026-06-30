import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: 'var(--bg-color)',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '3rem', color: 'var(--text-color)' }}>
        That is the scaffold for you to extend.
      </h1>
      <a
        href="/demo"
        onClick={(e) => { e.preventDefault(); navigate('/demo'); }}
        style={{
          color: 'var(--muted-text)',
          textDecoration: 'none',
          fontSize: '1.1rem',
          transition: 'color 0.3s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-color)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-text)')}
      >
        See Demo page
      </a>
    </div>
  );
}

export default Home;