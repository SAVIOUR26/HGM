import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POSInterface from './pages/POSInterface';
import AdminPanel from './pages/AdminPanel';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

type Page = 'login' | 'dashboard' | 'pos' | 'admin' | 'reports' | 'profile';

interface User {
  id: number;
  username: string;
  role: string;
  full_name?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<'bar' | 'restaurant' | 'lodge' | null>(null);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('pos_token');
    const storedUser = localStorage.getItem('pos_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (loggedInUser: User, authToken: string) => {
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('pos_token', authToken);
    localStorage.setItem('pos_user', JSON.stringify(loggedInUser));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setSelectedSection(null);
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    setCurrentPage('login');
  };

  const handleSectionSelect = (section: 'bar' | 'restaurant' | 'lodge') => {
    setSelectedSection(section);
    setCurrentPage('pos');
  };

  const handleBackToDashboard = () => {
    setSelectedSection(null);
    setCurrentPage('dashboard');
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app">
      {currentPage === 'login' && (
        <Login onLogin={handleLogin} />
      )}

      {currentPage === 'dashboard' && user && (
        <Dashboard
          user={user}
          onSectionSelect={handleSectionSelect}
          onNavigateToAdmin={() => navigateTo('admin')}
          onNavigateToReports={() => navigateTo('reports')}
          onNavigateToProfile={() => navigateTo('profile')}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'pos' && user && token && selectedSection && (
        <POSInterface
          section={selectedSection}
          user={user}
          token={token}
          onBack={handleBackToDashboard}
        />
      )}

      {currentPage === 'admin' && user && token && user.role === 'admin' && (
        <AdminPanel
          user={user}
          token={token}
          onBack={handleBackToDashboard}
        />
      )}

      {currentPage === 'reports' && user && token && (
        <Reports
          user={user}
          token={token}
          onBack={handleBackToDashboard}
        />
      )}

      {currentPage === 'profile' && user && token && (
        <Profile
          user={user}
          token={token}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}

export default App;