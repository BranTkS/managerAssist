import { useState } from 'react';

const items = [
  "Chicken", "Strips", "Fillets", "Livers", "Chilli Bean", "Rice", "Pap",
  "Coleslaw", "Spinach", "Rolls", "Pulled Chicken"
];

// Function to calculate the stock projection with growth
function stockWithGrowth(growth, prevMonth, openingStock) {
  const projectedStock = (((prevMonth / 100) * growth) + prevMonth);
  return projectedStock;
}

// Returns actual stock projection
function calculateProjection(projectedStock, openingStock) {
  return (projectedStock - openingStock).toFixed(2);
}

function App() {
  const [growth, setGrowth] = useState(10); // Default to 10%
  const [tableData, setTableData] = useState(
    items.map(item => ({
      name: item,
      openingStock: '',
      previousMonth: '',
    }))
  );

  const handleChange = (index, field, value) => {
    const newData = [...tableData];
    newData[index][field] = value;
    setTableData(newData);
  };

  return (
    <div className="App">
      <header className="StockProjection">
        <h1>Stock Projection Tool</h1>
        <form>
          <div>
            <label>
              Growth Percentage:
              <input
                type="number"
                value={growth}
                onChange={e => setGrowth(e.target.value)}
                name="growth"
                style={{ width: '80px', marginLeft: '10px' }}
              />
              %
            </label>
          </div>
        </form>
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', margin: '20px 0' }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Opening Stock</th>
              <th>Previous Month</th>
              <th>Projection</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => {
              const prevMonth = parseFloat(row.previousMonth) || 0;
              const openingStock = parseFloat(row.openingStock) || 0;
              const projectedStock = stockWithGrowth(parseFloat(growth) || 0, prevMonth, openingStock);
              const projection = (row.openingStock !== '' && row.previousMonth !== '')
                ? calculateProjection(projectedStock, openingStock)
                : '';
              return (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>
                    <input
                      type="number"
                      value={row.openingStock}
                      onChange={e => handleChange(idx, 'openingStock', e.target.value)}
                      style={{ width: '80px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.previousMonth}
                      onChange={e => handleChange(idx, 'previousMonth', e.target.value)}
                      style={{ width: '80px' }}
                    />
                  </td>
                  <td>{projection}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </header>
    </div>
      );
      }

      export default App;