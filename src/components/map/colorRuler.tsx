"use client";

import React from 'react';

export default function ColorScaleRuler({
  width = '100%',         // e.g. '300px' or '100%'
  height = 16,            // height of the color bar in px
  labels = [-1, -0.5, 0, 0.5, 1]
}) {
  const gradient = `linear-gradient(
    to right,
    #ff0000 0%,
    #7f7f00 50%,
    #00ff00 100%
  )`;

  return (
    <div style={{ width, position: 'relative', paddingBottom: '1.5rem' }} className='flex-2'>
      {/* Color bar */}
      <div
        style={{
          height: `${height}px`,
          background: gradient,
          borderRadius: '4px',
        }}
      />

      {/* Tick labels */}
      <div
        style={{
          position: 'absolute',
          top: `${height + 4}px`,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.875rem',
            color: '#333',
        }}
      >
        {labels.map((lbl) => (
          <span key={lbl}>{lbl}</span>
        ))}
      </div>
    </div>
  );
}
