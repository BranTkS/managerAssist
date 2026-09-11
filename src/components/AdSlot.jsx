import React from 'react';

function AdSlot({ title = 'Sponsored', compact = false, className = '' }) {
  return (
    <aside
      className={`ad-slot ${compact ? 'ad-slot--compact' : ''} ${className}`.trim()}
      aria-label="Advertisement"
    >
      <div className="ad-slot__label-row">
        <span className="ad-slot__label">Ad</span>
        <span className="ad-slot__sponsor">Sponsored</span>
      </div>

      <div className="ad-slot__content">
        <div className="ad-slot__badge">Google Ad</div>
        <h4>{title}</h4>
        <p>Relevant tools and services for smarter team operations.</p>
      </div>
    </aside>
  );
}

export default AdSlot;
