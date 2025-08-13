
import { useState } from 'react';

//let growth = 0;
//let prevYear = 0;
//let openingStock = 0;
let projectedStock = 0;
let projection = 0;


// Function to calculate the stock projection with growth
function stockWithGrowth(growth, prevYear, openingStock) {
    projectedStock = (((prevYear / 100) * growth) + prevYear);
    
    return projectedStock
}

//returns actual stock projection
function calculateProjection(projectedStock, openingStock) {
  projection = projectedStock-openingStock
    return projection;
}



function App() {
  const [growth, setGrowth] = useState('');
  const [prevYear, setPrevYear] = useState('');
  const [openingStock, setOpeningStock] = useState('');
  const [projection, setProjection] = useState('');
  const [projectedStock, setProjectedStock] = useState('');


  return (
    <div className="App">
      <header className="StockProjection">
        <h1>Stock Projection Tool</h1>
        <form>
          <div>
            <label>
              Growth:
              <input
                type="text"
                value={growth}
                onChange={e => setGrowth(e.target.value)}
                name="growth"
              />
            </label>
          </div>
          <div>
            <label>
              Previous Year:
              <input
                type="text"
                value={prevYear}
                onChange={e => setPrevYear(e.target.value)}
                name="previousYear"
              />
            </label>
          </div>
          <div>
            <label>
              Opening Stock:
              <input
                type="text"
                value={openingStock}
                onChange={e => setOpeningStock(e.target.value)}
                name="openingStock"
              />
            </label>
          </div>
          <div>
          <button
            type="button"
            onClick={() => {
              const g = parseFloat(growth) || 0;
              const p = parseFloat(prevYear) || 0;
              const o = parseFloat(openingStock) || 0;
              const projStock = stockWithGrowth(g, p, o);
              setProjectedStock(projStock);
              setProjection(calculateProjection(projStock, o));
            }}
          >
            Calculate Projection
          </button>
        </div>
        <div>
          {projectedStock !== '' && (
            <p>Projected Stock: {projectedStock}</p>
          )}
          {projection !== '' && (
            <p>Projection: {projection}</p>
          )}
        </div>
        </form>
      </header>
    </div>
  );
}

export default App;