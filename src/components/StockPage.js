import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PageLayout from './PageLayout';
import { fetchMultipleStockQuotes, POPULAR_STOCKS } from '../services/stockApi';

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 15px;
  border: 1px solid #dee2e6;
  transition: transform 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-3px);
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    border-color: #27ae60;
    box-shadow: 0 6px 20px rgba(39, 174, 96, 0.2);
  }
`;

const MetricTitle = styled.h3`
  color: #2c3e50;
  font-size: 1rem;
  margin-bottom: 10px;
  font-weight: 600;
  text-align: center;
`;

const MetricValue = styled.div`
  color: #1a5f3c;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
`;

const MetricChange = styled.div`
  color: ${props => props.isPositive ? '#1a5f3c' : '#e74c3c'};
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
`;

const LoadingCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 25px;
  border: 1px solid #dee2e6;
  text-align: center;
  color: #2c3e50;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const RefreshButton = styled.button`
  background: linear-gradient(135deg, #1a5f3c 0%, #2d7a4f 100%);
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(26, 95, 60, 0.3);

  &:hover {
    background: linear-gradient(135deg, #134a30 0%, #1a5f3c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 95, 60, 0.4);
  }
`;

const ClickHint = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 20px;
  font-style: italic;
`;

// 숫자 포맷팅 함수
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  // 소수점 둘째자리까지 반올림
  const roundedValue = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  
  // 천 단위 콤마와 소수점 표시
  return roundedValue.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// 통화별 포맷팅 함수
const formatCurrency = (value, currency = 'USD', decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  const formattedValue = formatNumber(value, decimals);
  
  return formattedValue;
};

// 퍼센트 포맷팅 함수
const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  const sign = value >= 0 ? '+' : '';
  const formattedValue = formatNumber(Math.abs(value), decimals);
  
  return `${sign}${formattedValue}%`;
};

const StockPage = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 주식 데이터 가져오기
  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMultipleStockQuotes(POPULAR_STOCKS);
      setStockData(data);
    } catch (err) {
      setError('주식 데이터를 불러올 수 없습니다.');
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchStockData();
  }, []);

  // 주식 클릭 핸들러 - Yahoo Finance 페이지 열기
  const handleStockClick = (symbol) => {
    const yahooFinanceUrls = {
      '^GSPC': 'https://finance.yahoo.com/quote/%5EGSPC/chart?p=%5EGSPC&t=ytd',
      '^IXIC': 'https://finance.yahoo.com/quote/%5EIXIC/chart?p=%5EIXIC&t=ytd',
      '^DJI': 'https://finance.yahoo.com/quote/%5EDJI/chart?p=%5EDJI&t=ytd',
      '^VIX': 'https://finance.yahoo.com/quote/%5EVIX/chart?p=%5EVIX&t=ytd',
      '^KS11': 'https://finance.yahoo.com/quote/%5EKS11/chart?p=%5EKS11&t=ytd',
      '^KQ11': 'https://finance.yahoo.com/quote/%5EKQ11/',
      '^STOXX50E': 'https://finance.yahoo.com/quote/%5ESTOXX50E/chart?p=%5ESTOXX50E&t=ytd',
      'MXWO.SW': 'https://finance.yahoo.com/quote/MXWO.SW/chart?p=MXWO.SW&t=ytd',
      'MXEF': 'https://finance.yahoo.com/quote/MXEF/chart?p=MXEF&t=ytd',
      '^N225': 'https://finance.yahoo.com/quote/%5EN225/chart?p=%5EN225&t=ytd',
      '^HSI': 'https://finance.yahoo.com/quote/%5EHSI/chart?p=%5EHSI&t=ytd',
      '^HSCE': 'https://finance.yahoo.com/quote/%5EHSCE/chart?p=%5EHSCE&t=ytd',
      '000300.SS': 'https://finance.yahoo.com/quote/000300.SS/chart?p=000300.SS&t=ytd',
      '^BSESN': 'https://finance.yahoo.com/quote/%5EBSESN/chart?p=%5EBSESN&t=ytd',
      '^MXX': 'https://finance.yahoo.com/quote/%5EMXX/chart?p=%5EMXX&t=ytd'
    };
    
    const url = yahooFinanceUrls[symbol];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // 주식 이름 매핑
  const getStockDisplayName = (symbol) => {
    const names = {
      '^GSPC': 'S&P 500',
      '^IXIC': 'NASDAQ',
      '^DJI': 'DOW JONES',
      '^VIX': 'VIX',
      '^KS11': 'KOSPI',
      '^KQ11': 'KOSDAQ',
      '^STOXX50E': 'Eurostoxx50',
      'MXWO.SW': 'MSCI World',
      'MXEF': 'MSCI EM',
      '^N225': 'Nikkei 225',
      '^HSI': 'Hang Seng',
      '^HSCE': 'HSCEI',
      '000300.SS': 'CSI 300',
      '^BSESN': 'SENSEX',
      '^MXX': 'MEXBOL'
    };
    return names[symbol] || symbol;
  };

  if (loading) {
    return (
      <PageLayout title="Stock Market">
        <LoadingCard>주식 데이터를 불러오는 중...</LoadingCard>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Stock Market">
      <RefreshButton onClick={fetchStockData}>
        🔄 데이터 새로고침
      </RefreshButton>

      <MetricsGrid>
        {stockData.map((stock, index) => (
          <MetricCard 
            key={stock.symbol} 
            onClick={() => handleStockClick(stock.symbol)}
          >
            <MetricTitle>{getStockDisplayName(stock.symbol)}</MetricTitle>
            {stock.error ? (
              <div style={{ color: '#e74c3c', textAlign: 'center' }}>데이터 오류</div>
            ) : (
              <>
                <MetricValue>
                  {formatCurrency(stock.price, stock.currency)}
                </MetricValue>
                <MetricChange isPositive={stock.changePercent >= 0}>
                  {formatPercent(stock.changePercent)}
                </MetricChange>
              </>
            )}
          </MetricCard>
        ))}
      </MetricsGrid>

      <ClickHint>
        💡 각 지수를 클릭하면 Yahoo Finance에서 상세 정보를 확인할 수 있습니다
      </ClickHint>
    </PageLayout>
  );
};

export default StockPage; 