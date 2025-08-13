import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  background: #ffffff;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  border: 1px solid #dee2e6;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #1a5f3c 0%, #2d7a4f 100%);
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(26, 95, 60, 0.3);

  &:hover {
    background: linear-gradient(135deg, #134a30 0%, #1a5f3c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 95, 60, 0.4);
  }
`;

const PageTitle = styled.h1`
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(44, 62, 80, 0.1);
`;

const ContentArea = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid #dee2e6;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
`;

const PageLayout = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate('/')}>
          ← 홈으로 돌아가기
        </BackButton>
        <PageTitle>{title}</PageTitle>
        <div></div> {/* Spacer for flexbox centering */}
      </Header>
      
      <ContentArea>
        {children}
      </ContentArea>
    </PageContainer>
  );
};

export default PageLayout; 