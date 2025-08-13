import React from 'react';
import styled from 'styled-components';
import PageLayout from './PageLayout';

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 15px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const MetricTitle = styled.h3`
  color: white;
  font-size: 1.3rem;
  margin-bottom: 15px;
  font-weight: 600;
`;

const MetricValue = styled.div`
  color: #eab308;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
`;

const MetricChange = styled.div`
  color: ${props => props.isPositive ? '#4ade80' : '#f87171'};
  font-size: 1rem;
  font-weight: 500;
`;

const ChartPlaceholder = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  color: white;
  border: 2px dashed rgba(255, 255, 255, 0.3);
`;

const CommodityPage = () => {
  const commodityMetrics = [
    { title: 'Gold', value: '$2,045.67', change: '+1.23%', isPositive: true },
    { title: 'Silver', value: '$24.56', change: '-0.45%', isPositive: false },
    { title: 'Brent Crude', value: '$78.90', change: '+2.34%', isPositive: true },
    { title: 'WTI Crude', value: '$73.45', change: '+1.89%', isPositive: true },
    { title: 'Copper', value: '$3.89', change: '-0.67%', isPositive: false },
    { title: 'Natural Gas', value: '$2.34', change: '-1.23%', isPositive: false }
  ];

  return (
    <PageLayout title="Commodities">
      <MetricsGrid>
        {commodityMetrics.map((metric, index) => (
          <MetricCard key={index}>
            <MetricTitle>{metric.title}</MetricTitle>
            <MetricValue>{metric.value}</MetricValue>
            <MetricChange isPositive={metric.isPositive}>
              {metric.change}
            </MetricChange>
          </MetricCard>
        ))}
      </MetricsGrid>

      <ChartPlaceholder>
        <h3>상품 시장 차트</h3>
        <p>여기에 실시간 상품 차트가 표시됩니다</p>
        <p>🪙 🛢️ 📊</p>
      </ChartPlaceholder>
    </PageLayout>
  );
};

export default CommodityPage; 