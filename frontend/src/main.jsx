import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

// Securely load the API key from Vite environment variables rather than hardcoding it
axios.defaults.headers.common['X-API-Key'] = import.meta.env.VITE_API_KEY;

createRoot(document.getElementById('root')).render(
  <App />
);
