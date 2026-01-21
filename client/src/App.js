import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import GlobalInvitationHandler from './components/GlobalInvitationHandler';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import FindMatch from './pages/FindMatch';
import Interview from './pages/Interview';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import Premium from './pages/Premium';
import Invitations from './pages/Invitations';

function App() {
  const { user, loading, isProfileComplete } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>🎯 InterviewAce</div>
        <div style={{ marginTop: '20px', fontSize: '1rem' }}>Loading...</div>
      </div>
    );
  }

  // Helper function to check if user should be redirected to profile setup
  const shouldRedirectToProfileSetup = (user) => {
    return user && !isProfileComplete(user);
  };

  return (
    <div className="App">
      {user && <Navbar />}
      {user && <GlobalInvitationHandler />}
      <Routes>
        <Route 
          path="/" 
          element={
            !user ? <LandingPage /> : 
            shouldRedirectToProfileSetup(user) ? <Navigate to="/profile-setup" /> :
            <Navigate to="/dashboard" />
          } 
        />
        <Route 
          path="/login" 
          element={
            !user ? <Login /> : 
            shouldRedirectToProfileSetup(user) ? <Navigate to="/profile-setup" /> :
            <Navigate to="/dashboard" />
          } 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/profile-setup" />} 
        />
        <Route 
          path="/forgot-password" 
          element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/profile-setup" 
          element={user ? <ProfileSetup /> : <Navigate to="/" />} 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? 
            (shouldRedirectToProfileSetup(user) ? <Navigate to="/profile-setup" /> : <Dashboard />) :
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/find-match" 
          element={
            user ? 
            (shouldRedirectToProfileSetup(user) ? <Navigate to="/profile-setup" /> : <FindMatch />) :
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/invitations" 
          element={
            user ? 
            (shouldRedirectToProfileSetup(user) ? <Navigate to="/profile-setup" /> : <Invitations />) :
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/interview/:roomId" 
          element={
            user ? 
            (shouldRedirectToProfileSetup(user) ? <Navigate to="/profile-setup" /> : <Interview />) :
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/profile" 
          element={user ? <Profile /> : <Navigate to="/" />} 
        />
        <Route 
          path="/account-settings" 
          element={user ? <AccountSettings /> : <Navigate to="/" />} 
        />
        <Route 
          path="/history" 
          element={
            user ? 
            (shouldRedirectToProfileSetup(user) ? <Navigate to="/profile-setup" /> : <History />) :
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/admin" 
          element={
            user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
          } 
        />
        <Route 
          path="/premium" 
          element={
            user ? 
            (shouldRedirectToProfileSetup(user) ? <Navigate to="/profile-setup" /> : <Premium />) :
            <Navigate to="/" />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;