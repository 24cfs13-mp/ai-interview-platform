import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Interview from './pages/Interview';
import Results from './pages/Results';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center">
        <div className="w-full h-full flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
