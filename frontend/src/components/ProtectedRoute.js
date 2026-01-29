import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    location.state?.user ? true : null
  );
  const [user, setUser] = useState(location.state?.user || null);

  useEffect(() => {
    if (location.state?.user) return;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          withCredentials: true,
          ...(token && { headers: { Authorization: `Bearer ${token}` } })
        };

        const response = await axios.get(`${API}/auth/me`, config);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        navigate('/login', { state: { from: location.pathname } });
      }
    };

    checkAuth();
  }, [navigate, location]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return typeof children === 'function' ? children(user) : children;
}
