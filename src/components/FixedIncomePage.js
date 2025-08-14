import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PageLayout from './PageLayout';
import { fetchAllFixedIncomeDataOptimized, clearFixedIncomeCache } from '../services/fixedIncomeApiOptimized';

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
  position: relative;

  ${props => props.isRealData && `
    border: 2px solid #1a5f3c;
    background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
    &::before {
      content: '🌐';
      position: absolute;
      top: 5px;
      right: 5px;
      font-size: 12px;
    }
  `}

  &:hover {
    transform: translateY(-3px);
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    border-color: #1a5f3c;
    box-shadow: 0 6px 20px rgba(26, 95, 60, 0.2);
  }
`;

const MetricTitle = styled.h3`
  color: #2c3e50;
  font-size: 1rem;
  margin-bottom: 10px;
  font-weight: 600;
  text-align: center;
  
  ${props => props.isRealData && `
    color: #1a5f3c;
    font-weight: 700;
  `}
`;

const MetricValue = styled.div`
  color: #1a5f3c;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 8px;
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

const DataSourceIndicator = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 10px;
  color: ${props => props.isRealData ? '#1a5f3c' : '#7f8c8d'};
  font-weight: ${props => props.isRealData ? 'bold' : 'normal'};
  background: ${props => props.isRealData ? 'rgba(26, 95, 60, 0.1)' : 'rgba(127, 140, 141, 0.1)'};
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid ${props => props.isRealData ? '#1a5f3c' : '#7f8c8d'};
`;

const DataSourceInfo = styled.div`
  font-size: 9px;
  color: #7f8c8d;
  text-align: center;
  margin-top: 5px;
  font-style: italic;
  
  ${props => props.isRealData && `
    color: #1a5f3c;
    font-weight: 500;
  `}
`;

// 숫자 포맷팅 함수
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  const roundedValue = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  
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

const FixedIncomePage = () => {
  const [bondMetrics, setBondMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFixedIncomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 최적화된 API 사용
      const data = await fetchAllFixedIncomeDataOptimized();
      setBondMetrics(data);
    } catch (err) {
      setError('Fixed Income 데이터를 불러올 수 없습니다.');
      console.error('Error fetching fixed income data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    // 캐시 초기화 후 새로고침
    clearFixedIncomeCache();
    await fetchFixedIncomeData();
  };

  useEffect(() => {
    fetchFixedIncomeData();
  }, []);

  const handleBondClick = (title) => {
    // Trading Economics URL 매핑
    const tradingEconomicsUrls = {
      '미국 기준 금리': 'https://tradingeconomics.com/united-states/interest-rate',
      '유로 기준 금리': 'https://tradingeconomics.com/euro-area/interest-rate',
      '일본 기준 금리': 'https://tradingeconomics.com/japan/interest-rate',
      '한국 기준 금리': 'https://tradingeconomics.com/south-korea/interest-rate',
      '스위스 기준 금리': 'https://tradingeconomics.com/switzerland/interest-rate',
      '영국 기준 금리': 'https://tradingeconomics.com/united-kingdom/interest-rate',
      '호주 기준 금리': 'https://tradingeconomics.com/australia/interest-rate',
      '브라질 기준 금리': 'https://tradingeconomics.com/brazil/interest-rate',
      'US 3M': 'https://tradingeconomics.com/united-states/3-month-bill-yield',
      'US 2Y': 'https://tradingeconomics.com/united-states/2-year-note-yield',
      'US 10Y': 'https://tradingeconomics.com/united-states/government-bond-yield',
      'US 30Y': 'https://tradingeconomics.com/united-states/30-year-bond-yield',
      'Korea 2Y': 'https://tradingeconomics.com/south-korea/2-year-note-yield',
      'Korea 10Y': 'https://tradingeconomics.com/south-korea/government-bond-yield',
      'Japan 10Y': 'https://tradingeconomics.com/japan/government-bond-yield',
      'Germany 10Y': 'https://tradingeconomics.com/germany/government-bond-yield'
    };
    
    const url = tradingEconomicsUrls[title];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <PageLayout title="Fixed Income">
        <LoadingCard>Fixed Income 데이터를 불러오는 중...</LoadingCard>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Fixed Income">
      <RefreshButton onClick={handleRefresh}>
        🔄 데이터 새로고침 (최적화됨)
      </RefreshButton>

      {error && (
        <ErrorMessage>
          오류: {error}
        </ErrorMessage>
      )}

      <MetricsGrid>
        {bondMetrics.map((metric, index) => (
          <MetricCard
            key={index}
            onClick={() => handleBondClick(metric.title)}
            isRealData={metric.isRealData}
          >
            <MetricTitle isRealData={metric.isRealData}>{metric.title}</MetricTitle>
            {metric.error ? (
              <div style={{ color: '#e74c3c', textAlign: 'center' }}>데이터 오류</div>
            ) : (
              <>
                <MetricValue>
                  {formatPercent(metric.value)}
                </MetricValue>
                <DataSourceIndicator isRealData={metric.isRealData}>
                  {metric.isRealData ? '실제 데이터' : '시뮬레이션'}
                </DataSourceIndicator>
                <DataSourceInfo isRealData={metric.isRealData}>
                  {metric.dataSource ? `소스: ${metric.dataSource}` : '실시간 시뮬레이션'}
                </DataSourceInfo>
              </>
            )}
          </MetricCard>
        ))}
      </MetricsGrid>

      <ClickHint>
        💡 각 지표를 클릭하면 Trading Economics에서 상세 정보를 확인할 수 있습니다
        <br />
        ⚡ 최적화된 로딩으로 빠른 응답을 제공합니다
      </ClickHint>
    </PageLayout>
  );
};

export default FixedIncomePage; 