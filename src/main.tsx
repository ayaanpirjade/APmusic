import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const isCapacitorNative =
  window.location.hostname === 'localhost' ||
  window.location.protocol === 'capacitor:' ||
  Boolean((window as any).Capacitor?.isNativePlatform?.());

document.documentElement.classList.toggle('capacitor-native', isCapacitorNative);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
