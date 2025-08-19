import { useState, useEffect } from 'react';
import { NewDashboard } from './components/NewDashboard';
import { Auth } from './components/Auth';

function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
    setLoading(false);
  }, []);

  const handleAuthSuccess = (token: string) => {
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setAuthToken(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="text-accent-cyan">Loading...</div>
      </div>
    );
  }

  if (!authToken) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <NewDashboard onLogout={handleLogout} />
    </div>
  );
}

export default App;
