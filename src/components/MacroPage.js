import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PageLayout from './PageLayout';
import { fetchAllMacroData, EXTERNAL_URLS } from '../services/macroApi';

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 25px;
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
  font-size: 1.2rem;
  margin-bottom: 15px;
  font-weight: 600;
  text-align: center;
`;

const MetricDescription = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 15px;
  text-align: center;
  font-style: italic;
`;

const MetricValue = styled.div`
  color: #1a5f3c;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 15px;
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
  font-size: 0.8rem;
  color: #666;
  margin-top: 15px;
`;

const DataSourceDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.isRealData ? '#22c55e' : '#f59e0b'};
`;

const DataSourceInfo = styled.span`
  font-size: 0.8rem;
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

// 퍼센트 포맷팅 함수
const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  const sign = value >= 0 ? '+' : '';
  const formattedValue = formatNumber(Math.abs(value), decimals);
  
  return `${sign}${formattedValue}%`;
};

// 값 포맷팅 함수 (단위 포함)
const formatValue = (value, unit) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  const formattedValue = formatNumber(value, 2);
  return unit ? `${formattedValue}${unit}` : formattedValue;
};

const MacroPage = () => {
  const [macroData, setMacroData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMacroData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllMacroData();
      setMacroData(data);
    } catch (err) {
      setError('Macro 경제 데이터를 불러올 수 없습니다.');
      console.error('Error fetching macro data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMacroData();
  }, []);

  const handleCardClick = (title) => {
    const url = EXTERNAL_URLS[title];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <PageLayout title="Macro Economics">
        <LoadingCard>Macro 경제 데이터를 불러오는 중...</LoadingCard>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Macro Economics">
      <RefreshButton onClick={fetchMacroData} disabled={loading}>
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
        {macroData.map((item, index) => (
          <MetricCard key={index} onClick={() => handleCardClick(item.title)}>
            <MetricTitle>{item.title}</MetricTitle>
            <MetricDescription>{item.description}</MetricDescription>
            <MetricValue>
              {formatValue(item.value, item.unit)}
            </MetricValue>
            <DataSourceIndicator>
              <DataSourceDot isRealData={item.isRealData} />
              <DataSourceInfo>
                {item.isRealData ? item.dataSource || '실시간 데이터' : '더미 데이터'}
              </DataSourceInfo>
            </DataSourceIndicator>
          </MetricCard>
        ))}
      </MetricsGrid>

      <ClickHint>
        💡 각 지표를 클릭하면 해당 데이터 소스에서 상세 정보를 확인할 수 있습니다
      </ClickHint>
    </PageLayout>
  );
};

export default MacroPage; 