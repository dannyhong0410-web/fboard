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
  color: #a855f7;
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

const CreditPage = () => {
  const creditMetrics = [
    { title: 'CDS IG', value: '85.6', change: '-2.3', isPositive: true },
    { title: 'CDS HY', value: '425.8', change: '+15.6', isPositive: false },
    { title: 'BBB Spread', value: '185.4', change: '+8.9', isPositive: false },
    { title: 'High Yield Spread', value: '425.6', change: '+12.3', isPositive: false },
    { title: 'Investment Grade', value: '125.8', change: '+5.4', isPositive: false },
    { title: 'EMBI+', value: '325.6', change: '-8.9', isPositive: true }
  ];

  return (
    <PageLayout title="Credit Markets">
      <MetricsGrid>
        {creditMetrics.map((metric, index) => (
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
        <h3>신용 스프레드 차트</h3>
        <p>여기에 신용 스프레드 차트가 표시됩니다</p>
        <p>💳 📊 📈</p>
      </ChartPlaceholder>
    </PageLayout>
  );
};

export default CreditPage; 