import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import HomePage from './components/HomePage';
import StockPage from './components/StockPage';
import FixedIncomePage from './components/FixedIncomePage';
import FXPage from './components/FXPage';
import CommoditiesPage from './components/CommoditiesPage';
import CreditPage from './components/CreditPage';
import MacroPage from './components/MacroPage';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/fixed-income" element={<FixedIncomePage />} />
          <Route path="/fx" element={<FXPage />} />
          <Route path="/commodity" element={<CommoditiesPage />} />
          <Route path="/credit" element={<CreditPage />} />
          <Route path="/macro" element={<MacroPage />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App; 