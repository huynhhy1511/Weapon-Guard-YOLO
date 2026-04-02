// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Navbar from './components/common/Navbar';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MultiViewPage from './pages/MultiViewPage';
import SingleViewPage from './pages/SingleViewPage';
import HistoryPage from './pages/HistoryPage';
import AdminPage from './pages/AdminPage';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Navbar />}
      <div style={{ width: '100%', padding: 0, margin: 0, overflowX: 'hidden' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
              <PrivateRoute>
                  <div style={{padding: 20}}><DashboardPage /></div>
              </PrivateRoute>
          } />

          {/* 👇 SỬA Ở ĐÂY: Đổi thành /multi-view cho khớp với Navbar của bạn */}
          <Route path="/multi-view" element={
              <PrivateRoute>
                  <MultiViewPage />
              </PrivateRoute>
          } />

          <Route path="/camera/:id" element={
              <PrivateRoute>
                  <div style={{padding: 20}}><SingleViewPage /></div>
              </PrivateRoute>
          } />

          <Route path="/history" element={
              <PrivateRoute>
                  <div style={{padding: 20}}><HistoryPage /></div>
              </PrivateRoute>
          } />

          <Route path="/admin" element={
              <PrivateRoute>
                  <div style={{padding: 20}}><AdminPage /></div>
              </PrivateRoute>
          } />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;