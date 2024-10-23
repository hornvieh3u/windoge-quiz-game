import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from 'react-hot-toast';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.Fragment>
    <App />
    <Toaster />
  </React.Fragment>,
);
