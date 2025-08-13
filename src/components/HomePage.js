import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #ffffff;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
  color: #2c3e50;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1a5f3c;
  text-shadow: 2px 2px 4px rgba(26, 95, 60, 0.1);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  font-weight: 400;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 900px;
  width: 100%;
`;

const CategoryButton = styled.button`
  background: linear-gradient(135deg, #1a5f3c 0%, #2d7a4f 100%);
  border: none;
  border-radius: 20px;
  padding: 40px 30px;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(26, 95, 60, 0.3);

  &:hover {
    background: linear-gradient(135deg, #134a30 0%, #1a5f3c 100%);
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(26, 95, 60, 0.4);
  }

  &:active {
    transform: translateY(-2px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const HomePage = () => {
  const navigate = useNavigate();

  const categories = [
    { name: 'Stock', path: '/stock', description: '주식 시장 지표' },
    { name: 'Fixed Income', path: '/fixed-income', description: '채권 시장 지표' },
    { name: 'FX', path: '/fx', description: '외환 시장 지표' },
    { name: 'Commodity', path: '/commodity', description: '상품 시장 지표' },
    { name: 'Credit', path: '/credit', description: '신용 시장 지표' },
    { name: 'Macro', path: '/macro', description: '거시경제 지표' }
  ];

  return (
    <HomeContainer>
      <Header>
        <Title>FBoard</Title>
        <Subtitle>Financial Dashboard - 다양한 금융 지표를 한눈에</Subtitle>
      </Header>
      
      <ButtonGrid>
        {categories.map((category) => (
          <CategoryButton
            key={category.path}
            onClick={() => navigate(category.path)}
          >
            {category.name}
          </CategoryButton>
        ))}
      </ButtonGrid>
    </HomeContainer>
  );
};

export default HomePage; 