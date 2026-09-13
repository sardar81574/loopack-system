import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import WarehouseDashboard from './pages/WarehouseDashboard';
import CustomerScanPage from './pages/CustomerScanPage';
import OrderPage from './pages/OrderPage';
import OrderTrackPage from './pages/OrderTrackPage';
import DeliveryDashboard from './pages/DeliveryDashboard';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute'; // Sirf admin ke liye
import AuthRequired from './components/AuthRequired';     // Sabhi logged-in users ke liye

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Default page ab Login Page khulega */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected User Pages (Bina login ke open nahi honge) */}
        <Route path="/order" element={<AuthRequired><OrderPage /></AuthRequired>} />
        <Route path="/track" element={<AuthRequired><OrderTrackPage /></AuthRequired>} />
        <Route path="/delivery" element={<AuthRequired><DeliveryDashboard /></AuthRequired>} />
        <Route path="/scan" element={<CustomerScanPage />} />

        {/* Strict Admin Dashboard (Sirf sardardhakad81@gmail.com ke liye) */}
        <Route path="/admin" element={<ProtectedRoute><WarehouseDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;