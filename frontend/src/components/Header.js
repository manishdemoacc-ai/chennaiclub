import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, LogOut, User, MessageSquare, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Header({ user }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('auth_token');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-header shadow-md border-b border-border/40' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2" data-testid="logo-link">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Forgeit</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link to="/dashboard" data-testid="nav-dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full ${isActive('/dashboard') ? 'bg-accent' : ''}`}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link to="/discover" data-testid="nav-discover">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full ${isActive('/discover') ? 'bg-accent' : ''}`}
                  >
                    Discover
                  </Button>
                </Link>
                <Link to="/connections" data-testid="nav-connections">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full ${isActive('/connections') ? 'bg-accent' : ''}`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Connections
                  </Button>
                </Link>
                <Link to="/messages" data-testid="nav-messages">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full ${isActive('/messages') ? 'bg-accent' : ''}`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <a href="#features">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Features
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    How It Works
                  </Button>
                </a>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            {user ? (
              <>
                <Link to={`/profile/${user.user_id}`} data-testid="profile-link">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={handleLogout}
                  data-testid="logout-button"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="login-link">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" data-testid="register-link">
                  <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90">
                    Join Network
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
