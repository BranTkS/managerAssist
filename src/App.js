import './App.css';
import StockprojectionMain from './managerTools/stockProjection/stockMain/stockProjectionMain.jsx';
import Stockprojection from './managerTools/stockProjection/stockProjection.jsx';
import RosterHours from './managerTools/stockProjection/rosterHours/rosterHours.jsx';
import React, { useState } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('stockprojectionmain');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Manager Assist</h1>
        {/* Menu Section */}
        <nav style={{ marginBottom: '20px' }}>
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

        {/* Section Rendering */}
        {activeSection === 'stockprojectionmain' && <StockprojectionMain />}
        {activeSection === 'stockprojection' && <Stockprojection />}
        {activeSection === 'rosterhours' && <RosterHours />}
      </header>
    </div>
  );
}

export default App;
