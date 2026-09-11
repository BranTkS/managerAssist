import './App.css';
import StockprojectionMain from './managerTools/stockProjection/stockMain/stockProjectionMain.jsx';
import Stockprojection from './managerTools/stockProjection/stockProjection.jsx';
import RosterHours from './managerTools/rosterComponents/frontend/RosterHours.jsx';
import LoginPage from './managerTools/login/loginPage';
import RegisterPage from './managerTools/login/registerPage';
import AdSlot from './components/AdSlot';
import React, { useState } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('rosterhours');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');

  const enterApp = (nextUser = null) => {
    setUser(nextUser);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="App">
        <header className="App-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setAuthView('login')} style={{ padding: '8px 12px' }}>Login</button>
              <button onClick={() => setAuthView('register')} style={{ padding: '8px 12px' }}>Register</button>
              <h1 style={{ margin: 0 }}>Manager Assist</h1>
            </div>
          </div>

          <div className="app-ad-layout app-ad-layout--single" style={{ marginTop: '18px' }}>
            {authView === 'register' ? (
              <RegisterPage
                onRegisterSuccess={(registeredUser) => {
                  enterApp(registeredUser || { name: 'Guest User', email: 'guest@local' });
                }}
                onSwitchToLogin={() => setAuthView('login')}
                onContinueAsGuest={() => enterApp({ name: 'Guest User', email: 'guest@local' })}
              />
            ) : (
              <LoginPage
                onLoginSuccess={(loggedInUser) => {
                  enterApp(loggedInUser || { name: 'User', email: 'user@local' });
                }}
                onSwitchToRegister={() => setAuthView('register')}
                onContinueAsGuest={() => enterApp({ name: 'Guest User', email: 'guest@local' })}
              />
            )}
            <AdSlot title="Team scheduling tools" compact />
          </div>
        </header>
      </div>
    );
  }

  const activePanel = activeSection === 'stockprojectionmain' ? 'light' : activeSection === 'stockprojection' ? 'busy' : 'busy';

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setAuthView('login')} style={{ padding: '8px 12px' }}>Login</button>
            <button onClick={() => setAuthView('register')} style={{ padding: '8px 12px' }}>Register</button>
            <h1 style={{ margin: 0 }}>Manager Assist</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-secondary)', padding: '8px 12px', borderRadius: '999px', border: '1px solid var(--color-border)' }}>
            {user?.photoUrl && (
              <img src={user.photoUrl} alt={user.name || 'User'} style={{ width: '36px', height: '36px', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(28,163,155,.12)' }} />
            )}
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{user?.name || user?.email || 'User'}</span>
            <button onClick={() => setIsLoggedIn(false)} style={{ padding: '8px 12px' }}>Log out</button>
          </div>
        </div>
        <nav>
          <button
            onClick={() => setActiveSection('stockprojectionmain')}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              fontWeight: activeSection === 'stockprojectionmain' ? 'bold' : 'normal'
            }}
          >
            Gali Stock Projection
          </button>
          <button
            onClick={() => setActiveSection('stockprojection')}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              fontWeight: activeSection === 'stockprojection' ? 'bold' : 'normal'
            }}
          >
            Stock Projection
          </button>
          <button
            onClick={() => setActiveSection('rosterhours')}
            style={{
              padding: '8px 16px',
              fontWeight: activeSection === 'rosterhours' ? 'bold' : 'normal'
            }}
          >
            Roster Hours
          </button>
        </nav>

        <div className="app-ad-layout app-ad-layout--single">
          <div>
            {activeSection === 'stockprojectionmain' && <StockprojectionMain />}
            {activeSection === 'stockprojection' && <Stockprojection />}
            {activeSection === 'rosterhours' && <RosterHours user={user} />}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
