import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PageLayout from './PageLayout';
import { fetchAllCommoditiesData, YAHOO_FINANCE_URLS } from '../services/commoditiesApi';

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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ClickHint = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 20px;
  font-style: italic;
`;

const DataSourceIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 0.7rem;
  color: #666;
  margin-top: 8px;
`;

const DataSourceDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => props.isRealData ? '#22c55e' : '#f59e0b'};
`;

const DataSourceInfo = styled.span`
  font-size: 0.7rem;
  color: #666;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
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
  
  return `$${formattedValue}`;
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

const CommoditiesPage = () => {
  const [commoditiesData, setCommoditiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCommoditiesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllCommoditiesData();
      setCommoditiesData(data);
    } catch (err) {
      setError('상품 데이터를 불러올 수 없습니다.');
      console.error('Error fetching commodities data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommoditiesData();
  }, []);

  const handleCardClick = (title) => {
    const url = YAHOO_FINANCE_URLS[title];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <PageLayout title="Commodities">
        <LoadingCard>상품 데이터를 불러오는 중...</LoadingCard>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Commodities">
      <RefreshButton onClick={fetchCommoditiesData} disabled={loading}>
        {loading ? (
          <>
            <LoadingSpinner />
            {' '}데이터 새로고침 중...
          </>
        ) : (
          '🔄 데이터 새로고침'
        )}
      </RefreshButton>

      <MetricsGrid>
        {commoditiesData.map((item, index) => (
          <MetricCard key={index} onClick={() => handleCardClick(item.title)}>
            <MetricTitle>{item.title}</MetricTitle>
            <MetricValue>
              {formatCurrency(item.value)}
            </MetricValue>
            <MetricChange isPositive={item.isPositive}>
              {formatPercent(item.change)}
            </MetricChange>
            <DataSourceIndicator>
              <DataSourceDot isRealData={item.isRealData} />
              <DataSourceInfo>
                {item.isRealData ? '실시간' : '더미'}
              </DataSourceInfo>
            </DataSourceIndicator>
          </MetricCard>
        ))}
      </MetricsGrid>

      <ClickHint>
        💡 각 상품을 클릭하면 Yahoo Finance에서 상세 정보를 확인할 수 있습니다
      </ClickHint>
    </PageLayout>
  );
};

export default CommoditiesPage; 