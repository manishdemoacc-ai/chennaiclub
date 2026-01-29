import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/ProfileSetup';
import Discovery from './pages/Discovery';
import UserProfile from './pages/UserProfile';
import Connections from './pages/Connections';
import Messages from './pages/Messages';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import '@/App.css';

function AppRouter() {
  const location = useLocation();
  
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;
