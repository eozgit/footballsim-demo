import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';

console.log(
  `%c [SYSTEM] App Boot: ${new Date().toLocaleTimeString()}`,
  'color: #88c0d0; font-weight: bold;'
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
