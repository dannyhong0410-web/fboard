import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PageLayout from './PageLayout';
import { fetchAllFXData, YAHOO_FINANCE_URLS } from '../services/fxApi';

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

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border: 1px solid #e74c3c;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
  color: #e74c3c;
  font-weight: 600;
`;

const WarningMessage = styled.div`
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #f39c12;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
  color: #d68910;
  font-weight: 600;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

// 숫자 포맷팅 함수
const formatNumber = (value, decimals = 4) => {
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

const FXPage = () => {
  const [fxMetrics, setFxMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FX 데이터 가져오기
  const fetchFXData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting FX data fetch from Yahoo Finance...');
      
      const data = await fetchAllFXData();
      
      if (data && data.length > 0) {
        console.log(`✅ Successfully loaded ${data.length} FX rates`);
        setFxMetrics(data);
        
        // 실제 데이터가 있는지 확인
        const realDataCount = data.filter(item => item.isRealData).length;
        if (realDataCount === 0) {
          console.log('⚠️ No real data available, showing dummy data');
        } else {
          console.log(`✅ ${realDataCount} real FX rates loaded`);
        }
      } else {
        console.log('❌ No FX data received');
        setError('FX 데이터를 불러올 수 없습니다.');
      }
      
    } catch (err) {
      setError('FX 데이터를 불러올 수 없습니다.');
      console.error('❌ Error fetching FX data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchFXData();
  }, []);

  // FX 지표 클릭 핸들러 - Yahoo Finance 페이지 열기
  const handleFXClick = (title) => {
    const url = YAHOO_FINANCE_URLS[title];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <PageLayout title="Foreign Exchange">
        <LoadingCard>FX 데이터를 불러오는 중...</LoadingCard>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Foreign Exchange">
      <RefreshButton onClick={fetchFXData}>
        🔄 데이터 새로고침
      </RefreshButton>

      {error && (
        <ErrorMessage>
          오류: {error}
        </ErrorMessage>
      )}

      <MetricsGrid>
        {fxMetrics.map((metric, index) => (
          <MetricCard 
            key={index} 
            onClick={() => handleFXClick(metric.title)}
            isRealData={metric.isRealData}
          >
            <MetricTitle isRealData={metric.isRealData}>{metric.title}</MetricTitle>
            {metric.error ? (
              <ErrorMessage>데이터 오류</ErrorMessage>
            ) : (
              <>
                <MetricValue>
                  {formatNumber(metric.value)}
                </MetricValue>
                <MetricChange isPositive={metric.isPositive}>
                  {formatPercent(metric.change)}
                </MetricChange>
                <DataSourceIndicator isRealData={metric.isRealData}>
                  {metric.isRealData ? '실제 데이터' : '더미 데이터'}
                </DataSourceIndicator>
                <DataSourceInfo isRealData={metric.isRealData}>
                  {metric.dataSource ? `소스: ${metric.dataSource}` : '더미 데이터'}
                </DataSourceInfo>
              </>
            )}
          </MetricCard>
        ))}
      </MetricsGrid>

      <ClickHint>
        💡 각 환율을 클릭하면 Yahoo Finance에서 상세 정보를 확인할 수 있습니다
      </ClickHint>
    </PageLayout>
  );
};

export default FXPage; 