import './App.css';
import StockprojectionMain from './managerTools/stockProjection/stockMain/stockProjectionMain.jsx';
import Stockprojection from './managerTools/stockProjection/stockProjection.jsx';

function App() {
  return (
    
    <div className="App">
      
      <header className="App-header">
<h1>Manager Assist</h1>
      <div>
      <StockprojectionMain />
      </div>
            <div>
      <Stockprojection />
      </div>
      </header>
    </div>
  );
}

export default App;
