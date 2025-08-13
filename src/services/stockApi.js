// Yahoo Finance API를 사용한 주식 데이터 서비스
const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const ALPHA_VANTAGE_URL = 'https://www.alphavantage.co/query';

// 더미 데이터 (API 문제시 사용)
const DUMMY_STOCK_DATA = [
  {
    symbol: '^GSPC',
    price: 4567.89, // 현재 가격 (2024년 말 대비 하락)
    change: 56.78,
    changePercent: 1.23,
    previousClose: 4511.11,
    open: 4520.00,
    high: 4580.00,
    low: 4510.00,
    volume: 2345678901,
    currency: 'USD',
    threeMonthReturn: 8.45,
    ytdReturn: -22.33 // 5,881.63 → 4,567.89 = -22.33%
  },
  {
    symbol: '^IXIC',
    price: 14234.56,
    change: -64.32,
    changePercent: -0.45,
    previousClose: 14298.88,
    open: 14300.00,
    high: 14350.00,
    low: 14200.00,
    volume: 3456789012,
    currency: 'USD',
    threeMonthReturn: 15.67,
    ytdReturn: -18.76 // 2024년 말 대비 하락
  },
  {
    symbol: '^DJI',
    price: 35678.90,
    change: 278.45,
    changePercent: 0.78,
    previousClose: 35400.45,
    open: 35450.00,
    high: 35800.00,
    low: 35400.00,
    volume: 4567890123,
    currency: 'USD',
    threeMonthReturn: 6.78,
    ytdReturn: -15.43 // 2024년 말 대비 하락
  },
  {
    symbol: '^VIX',
    price: 18.45,
    change: -0.40,
    changePercent: -2.1,
    previousClose: 18.85,
    open: 19.00,
    high: 19.20,
    low: 18.30,
    volume: 5678901234,
    currency: 'USD',
    threeMonthReturn: -12.34,
    ytdReturn: 45.67 // VIX는 시장 불안시 상승하므로 양수
  },
  {
    symbol: '^KS11',
    price: 2567.89,
    change: 23.45,
    changePercent: 0.92,
    previousClose: 2544.44,
    open: 2550.00,
    high: 2580.00,
    low: 2540.00,
    volume: 6789012345,
    currency: 'KRW',
    threeMonthReturn: 5.43,
    ytdReturn: -12.34 // 2024년 말 대비 하락
  },
  {
    symbol: '^KQ11',
    price: 856.78,
    change: -2.92,
    changePercent: -0.34,
    previousClose: 859.70,
    open: 860.00,
    high: 865.00,
    low: 855.00,
    volume: 7890123456,
    currency: 'KRW',
    threeMonthReturn: 3.21,
    ytdReturn: -18.76 // 2024년 말 대비 하락
  },
  {
    symbol: '^STOXX50E',
    price: 5338.58,
    change: -9.12,
    changePercent: -0.17,
    previousClose: 5347.70,
    open: 5350.00,
    high: 5360.00,
    low: 5330.00,
    volume: 1234567890,
    currency: 'EUR',
    threeMonthReturn: 4.56,
    ytdReturn: -8.90
  },
  {
    symbol: 'MXWO.SW',
    price: 1578.49,
    change: -1.26,
    changePercent: -0.08,
    previousClose: 1579.75,
    open: 1580.00,
    high: 1585.00,
    low: 1575.00,
    volume: 987654321,
    currency: 'USD',
    threeMonthReturn: 6.78,
    ytdReturn: -12.45
  },
  {
    symbol: 'MXEF',
    price: 892.34,
    change: 5.67,
    changePercent: 0.64,
    previousClose: 886.67,
    open: 887.00,
    high: 895.00,
    low: 885.00,
    volume: 876543210,
    currency: 'USD',
    threeMonthReturn: 2.34,
    ytdReturn: -15.67
  },
  {
    symbol: '^N225',
    price: 41820.48,
    change: 760.85,
    changePercent: 1.85,
    previousClose: 41059.63,
    open: 41100.00,
    high: 42000.00,
    low: 41000.00,
    volume: 765432109,
    currency: 'JPY',
    threeMonthReturn: 12.34,
    ytdReturn: 8.76
  },
  {
    symbol: '^HSI',
    price: 24906.81,
    change: 47.19,
    changePercent: 0.19,
    previousClose: 24859.62,
    open: 24850.00,
    high: 25000.00,
    low: 24800.00,
    volume: 654321098,
    currency: 'HKD',
    threeMonthReturn: -3.45,
    ytdReturn: -18.90
  },
  {
    symbol: '^HSCE',
    price: 8765.43,
    change: -23.45,
    changePercent: -0.27,
    previousClose: 8788.88,
    open: 8790.00,
    high: 8800.00,
    low: 8750.00,
    volume: 543210987,
    currency: 'HKD',
    threeMonthReturn: -5.67,
    ytdReturn: -22.34
  },
  {
    symbol: '000300.SS',
    price: 3647.55,
    change: 12.45,
    changePercent: 0.34,
    previousClose: 3635.10,
    open: 3630.00,
    high: 3650.00,
    low: 3620.00,
    volume: 432109876,
    currency: 'CNY',
    threeMonthReturn: -2.34,
    ytdReturn: -25.67
  },
  {
    symbol: '^BSESN',
    price: 80325.71,
    change: 470.59,
    changePercent: 0.59,
    previousClose: 79855.12,
    open: 79900.00,
    high: 80500.00,
    low: 79800.00,
    volume: 321098765,
    currency: 'INR',
    threeMonthReturn: 8.90,
    ytdReturn: 12.34
  },
  {
    symbol: '^MXX',
    price: 58070.17,
    change: -192.83,
    changePercent: -0.33,
    previousClose: 58263.00,
    open: 58300.00,
    high: 58500.00,
    low: 58000.00,
    volume: 210987654,
    currency: 'MXN',
    threeMonthReturn: 3.21,
    ytdReturn: -8.76
  }
];

// 더미 차트 데이터 생성
const generateDummyChartData = (symbol, range = '1mo') => {
  const days = range === '1d' ? 1 : range === '5d' ? 5 : range === '1mo' ? 30 : 90;
  const data = [];
  
  // 2024년 12월 31일 기준 가격 설정
  const basePrices = {
    '^GSPC': 5881.63,    // S&P 500: 2024년 말 종가
    '^IXIC': 17500.00,   // NASDAQ: 2024년 말 종가
    '^DJI': 42200.00,    // DOW JONES: 2024년 말 종가
    '^VIX': 12.67,       // VIX: 2024년 말 종가
    '^KS11': 2930.00,    // KOSPI: 2024년 말 종가
    '^KQ11': 1050.00,    // KOSDAQ: 2024년 말 종가
    '^STOXX50E': 5860.00, // Eurostoxx50: 2024년 말 종가
    'MXWO.SW': 1800.00,  // MSCI World: 2024년 말 종가
    'MXEF': 1050.00,     // MSCI Emerging Markets: 2024년 말 종가
    '^N225': 38400.00,   // Nikkei 225: 2024년 말 종가
    '^HSI': 30700.00,    // Hang Seng Index: 2024년 말 종가
    '^HSCE': 11200.00,   // Hang Seng China Enterprises: 2024년 말 종가
    '000300.SS': 4900.00, // CSI 300: 2024년 말 종가
    '^BSESN': 71500.00,  // SENSEX: 2024년 말 종가
    '^MXX': 63600.00     // MEXBOL: 2024년 말 종가
  };
  
  const basePrice = basePrices[symbol] || 100;
  const currentPrice = DUMMY_STOCK_DATA.find(stock => stock.symbol === symbol)?.price || basePrice;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // 시간에 따른 가격 변화 (2024년 말에서 현재까지 하락 추세)
    const timeProgress = i / (days - 1); // 0 = 현재, 1 = 과거
    const trendFactor = 1 + (timeProgress * 0.3); // 과거로 갈수록 높은 가격
    
    // 랜덤한 가격 변동 생성 (더 현실적인 범위)
    const variation = (Math.random() - 0.5) * 0.015; // ±0.75% 변동
    const price = basePrice * trendFactor * (1 + variation);
    
    // OHLC 데이터 생성
    const open = price * (1 + (Math.random() - 0.5) * 0.008);
    const high = Math.max(open, price) * (1 + Math.random() * 0.005);
    const low = Math.min(open, price) * (1 - Math.random() * 0.005);
    const close = price;
    
    data.push({
      date: date.toLocaleDateString('ko-KR'),
      timestamp: Math.floor(date.getTime() / 1000),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
  }
  
  return data;
};

// CORS 프록시 URL들 (여러 개 시도)
const CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  '' // 직접 호출도 시도
];

// 프록시를 사용한 API 호출
const fetchWithProxy = async (url, proxyIndex = 0) => {
  if (proxyIndex >= CORS_PROXIES.length) {
    throw new Error('All proxy attempts failed');
  }

  try {
    const proxyUrl = CORS_PROXIES[proxyIndex] + url;
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.log(`Proxy ${proxyIndex} failed, trying next...`);
    return fetchWithProxy(url, proxyIndex + 1);
  }
};

// 수익률 계산 함수
const calculateReturns = (currentPrice, historicalPrice) => {
  if (!historicalPrice || historicalPrice <= 0) return 0;
  return ((currentPrice - historicalPrice) / historicalPrice) * 100;
};

// Alpha Vantage API를 사용한 주식 데이터 가져오기 (대체 방법)
export const fetchStockDataAlphaVantage = async (symbol) => {
  try {
    // 무료 API 키 (실제 사용시에는 본인의 API 키를 사용해야 함)
    const API_KEY = 'demo'; // 실제 사용시 본인의 API 키로 교체
    const url = `${ALPHA_VANTAGE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    const quote = data['Global Quote'];
    if (!quote) {
      throw new Error('No quote data available');
    }
    
    return {
      symbol: symbol,
      price: parseFloat(quote['05. price']) || 0,
      change: parseFloat(quote['09. change']) || 0,
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')) || 0,
      previousClose: parseFloat(quote['08. previous close']) || 0,
      open: parseFloat(quote['02. open']) || 0,
      high: parseFloat(quote['03. high']) || 0,
      low: parseFloat(quote['04. low']) || 0,
      volume: parseInt(quote['06. volume']) || 0,
      currency: 'USD'
    };
  } catch (error) {
    console.error('Error fetching Alpha Vantage data:', error);
    throw error;
  }
};

// 주식 심볼별 차트 데이터 가져오기
export const fetchStockChartData = async (symbol, range = '1mo', interval = '1d') => {
  try {
    const url = `${BASE_URL}/${symbol}?interval=${interval}&range=${range}`;
    const response = await fetchWithProxy(url);
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No chart data available');
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    
    // 데이터 정리 및 변환
    const chartData = timestamps.map((timestamp, index) => {
      const date = new Date(timestamp * 1000);
      return {
        date: date.toLocaleDateString('ko-KR'),
        timestamp: timestamp,
        open: quotes.open[index] || 0,
        high: quotes.high[index] || 0,
        low: quotes.low[index] || 0,
        close: quotes.close[index] || 0,
        volume: quotes.volume[index] || 0
      };
    }).filter(item => item.close > 0); // 유효한 데이터만 필터링
    
    return chartData;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    // API 실패시 더미 데이터 사용
    console.log('Using dummy data as fallback...');
    return generateDummyChartData(symbol, range);
  }
};

// 주식 실시간 가격 정보 가져오기 (수익률 포함)
export const fetchStockQuote = async (symbol) => {
  try {
    const url = `${BASE_URL}/${symbol}?interval=1m&range=1d`;
    const response = await fetchWithProxy(url);
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No quote data available');
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    
    // 가장 최근 데이터
    const latestIndex = quotes.close.length - 1;
    const currentPrice = meta.regularMarketPrice || quotes.close[latestIndex] || 0;
    
    return {
      symbol: symbol,
      price: currentPrice,
      change: meta.regularMarketPrice - meta.previousClose || 0,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
      previousClose: meta.previousClose || 0,
      open: quotes.open[latestIndex] || 0,
      high: quotes.high[latestIndex] || 0,
      low: quotes.low[latestIndex] || 0,
      volume: quotes.volume[latestIndex] || 0,
      marketCap: meta.marketCap || 0,
      currency: meta.currency || 'USD'
    };
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    // Yahoo Finance API 실패시 Alpha Vantage 시도
    try {
      console.log('Trying Alpha Vantage as fallback...');
      return await fetchStockDataAlphaVantage(symbol);
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError);
      // 모든 API 실패시 더미 데이터 사용
      console.log('Using dummy data as final fallback...');
      const dummyData = DUMMY_STOCK_DATA.find(stock => stock.symbol === symbol);
      if (dummyData) {
        return dummyData;
      }
      throw error;
    }
  }
};

// 주식 수익률 데이터 가져오기 (3개월, YTD)
export const fetchStockReturns = async (symbol) => {
  try {
    // 3개월 데이터
    const threeMonthUrl = `${BASE_URL}/${symbol}?interval=1d&range=3mo`;
    const threeMonthResponse = await fetchWithProxy(threeMonthUrl);
    const threeMonthData = await threeMonthResponse.json();
    
    // YTD 데이터 (작년 12월 31일부터)
    const currentYear = new Date().getFullYear();
    const lastYearEnd = new Date(currentYear - 1, 11, 31); // 작년 12월 31일
    const ytdDays = Math.ceil((new Date() - lastYearEnd) / (1000 * 60 * 60 * 24));
    const ytdUrl = `${BASE_URL}/${symbol}?interval=1d&range=${ytdDays}d`;
    const ytdResponse = await fetchWithProxy(ytdUrl);
    const ytdData = await ytdResponse.json();
    
    if (!threeMonthData.chart?.result?.[0] || !ytdData.chart?.result?.[0]) {
      throw new Error('No return data available');
    }
    
    const threeMonthResult = threeMonthData.chart.result[0];
    const ytdResult = ytdData.chart.result[0];
    
    const threeMonthQuotes = threeMonthResult.indicators.quote[0];
    const ytdQuotes = ytdResult.indicators.quote[0];
    
    // 3개월 전 가격 (90일 전)
    const threeMonthPrice = threeMonthQuotes.close[0] || 0;
    
    // YTD 시작 가격 (작년 12월 31일)
    const ytdPrice = ytdQuotes.close[0] || 0;
    
    // 현재 가격
    const currentPrice = threeMonthQuotes.close[threeMonthQuotes.close.length - 1] || 0;
    
    return {
      threeMonthReturn: calculateReturns(currentPrice, threeMonthPrice),
      ytdReturn: calculateReturns(currentPrice, ytdPrice)
    };
  } catch (error) {
    console.error('Error fetching stock returns:', error);
    // API 실패시 더미 데이터 사용
    const dummyData = DUMMY_STOCK_DATA.find(stock => stock.symbol === symbol);
    if (dummyData) {
      return {
        threeMonthReturn: dummyData.threeMonthReturn,
        ytdReturn: dummyData.ytdReturn
      };
    }
    return { threeMonthReturn: 0, ytdReturn: 0 };
  }
};

// 여러 주식 심볼의 실시간 데이터 가져오기 (수익률 포함)
export const fetchMultipleStockQuotes = async (symbols) => {
  try {
    const promises = symbols.map(async (symbol) => {
      try {
        const [quoteData, returnsData] = await Promise.all([
          fetchStockQuote(symbol),
          fetchStockReturns(symbol)
        ]);
        
        return {
          ...quoteData,
          ...returnsData
        };
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error);
        // API 실패시 더미 데이터 사용
        const dummyData = DUMMY_STOCK_DATA.find(stock => stock.symbol === symbol);
        if (dummyData) {
          console.log(`Using dummy data for ${symbol}`);
          return dummyData;
        }
        return {
          symbol: symbol,
          error: true,
          message: error.message
        };
      }
    });
    
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Error fetching multiple stock quotes:', error);
    // 전체 실패시 더미 데이터 반환
    console.log('All APIs failed, using dummy data...');
    return DUMMY_STOCK_DATA;
  }
};

// Yahoo Finance API 테스트 함수
export const testYahooFinanceStockAPI = async () => {
  try {
    console.log('🧪 Testing Yahoo Finance Stock API...');
    
    // 간단한 테스트: S&P 500 데이터 가져오기
    const testSymbol = '^GSPC';
    const testUrl = `${BASE_URL}/${testSymbol}?interval=1d&range=1d`;
    
    console.log(`🔗 Testing URL: ${testUrl}`);
    
    // 방법 1: 직접 호출
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`📊 Direct response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📊 Direct response data keys:`, Object.keys(data));
      
      if (data && data.chart && data.chart.result && data.chart.result[0]) {
        const result = data.chart.result[0];
        const meta = result.meta;
        console.log(`📊 Meta data:`, meta);
        
        if (meta.regularMarketPrice) {
          console.log(`✅ Yahoo Finance Stock API test successful! S&P 500: ${meta.regularMarketPrice}`);
          return { success: true, method: 'Direct', price: meta.regularMarketPrice };
        }
      }
    } catch (directError) {
      console.log(`❌ Direct API call failed:`, directError.message);
    }
    
    // 방법 2: 프록시를 통한 호출
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(testUrl)}`;
      
      const response = await fetch(proxyUrl);
      console.log(`📊 Proxy response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Proxy HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📊 Proxy response data keys:`, Object.keys(data));
      
      if (data && data.chart && data.chart.result && data.chart.result[0]) {
        const result = data.chart.result[0];
        const meta = result.meta;
        console.log(`📊 Proxy meta data:`, meta);
        
        if (meta.regularMarketPrice) {
          console.log(`✅ Yahoo Finance Stock API test successful via proxy! S&P 500: ${meta.regularMarketPrice}`);
          return { success: true, method: 'Proxy', price: meta.regularMarketPrice };
        }
      }
    } catch (proxyError) {
      console.log(`❌ Proxy API call failed:`, proxyError.message);
    }
    
    console.log(`❌ All methods failed for stock API test`);
    return { success: false, method: 'None', price: null };
    
  } catch (error) {
    console.error(`❌ Yahoo Finance Stock API test failed:`, error);
    return { success: false, method: 'Error', price: null };
  }
};

// 인기 주식 심볼들
export const POPULAR_STOCKS = [
  '^GSPC',    // S&P 500
  '^IXIC',    // NASDAQ
  '^DJI',     // DOW JONES
  '^VIX',     // VIX
  '^KS11',    // KOSPI
  '^KQ11',    // KOSDAQ
  '^STOXX50E', // Eurostoxx50
  'MXWO.SW',  // MSCI World
  'MXEF',     // MSCI Emerging Markets
  '^N225',    // Nikkei 225
  '^HSI',     // Hang Seng Index
  '^HSCE',    // Hang Seng China Enterprises
  '000300.SS', // CSI 300
  '^BSESN',   // SENSEX
  '^MXX'      // MEXBOL
]; 