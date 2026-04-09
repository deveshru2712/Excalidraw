import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import App from './App.tsx';
import CollaborativePlayground from './components/Collaboration/CollaborativePlayground.tsx';
import Playground from './components/Playground.tsx';

import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/playground" element={<Playground />} />

                <Route
                    path="/room/:roomId"
                    element={<CollaborativePlayground />}
                />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
