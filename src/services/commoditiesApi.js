// Yahoo Finance에서 상품 데이터를 가져오는 Commodities 서비스
const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Commodities 심볼 매핑 (Yahoo Finance 심볼)
const COMMODITIES_SYMBOLS = {
  'Gold': 'GC=F',
  'Silver': 'SI=F',
  'Brent Crude': 'BZ=F',
  'WTI': 'CL=F',
  'Copper': 'HG=F',
  'Natural Gas': 'NG=F',
  'Soybean': 'ZS=F',
  'Wheat': 'ZW=F',
  'Corn': 'ZC=F'
};

// Yahoo Finance URL 매핑
export const YAHOO_FINANCE_URLS = {
  'Gold': 'https://finance.yahoo.com/quote/GC=F',
  'Silver': 'https://finance.yahoo.com/quote/SI=F',
  'Brent Crude': 'https://finance.yahoo.com/quote/BZ=F',
  'WTI': 'https://finance.yahoo.com/quote/CL=F',
  'Copper': 'https://finance.yahoo.com/quote/HG=F',
  'Natural Gas': 'https://finance.yahoo.com/quote/NG=F',
  'Soybean': 'https://finance.yahoo.com/quote/ZS=F',
  'Wheat': 'https://finance.yahoo.com/quote/ZW=F',
  'Corn': 'https://finance.yahoo.com/quote/ZC=F'
};

// 프록시 서버들을 사용한 웹 스크래핑
const PROXY_SERVICES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://thingproxy.freeboard.io/fetch/',
  'https://cors.bridged.cc/',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors.eu.org/',
  'https://cors-anywhere.herokuapp.com/',
  '' // 직접 호출도 시도
];

// 프록시를 사용한 웹 스크래핑
const fetchWithProxy = async (url, proxyIndex = 0) => {
  if (proxyIndex >= PROXY_SERVICES.length) {
    throw new Error('All proxy attempts failed');
  }

  try {
    const proxyUrl = PROXY_SERVICES[proxyIndex] + url;
    console.log(`🔗 Trying proxy ${proxyIndex + 1}/${PROXY_SERVICES.length}: ${proxyUrl.substring(0, 50)}...`);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000 // 10초 타임아웃
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    
    if (data.length < 100) {
      throw new Error('Response too short, likely an error page');
    }
    
    console.log(`✅ Proxy ${proxyIndex + 1} successful! Data length: ${data.length} characters`);
    return data;
  } catch (error) {
    console.log(`❌ Proxy ${proxyIndex + 1} failed: ${error.message}`);
    return fetchWithProxy(url, proxyIndex + 1);
  }
};

// 2024년 12월 기준 최신 더미 데이터 (실제 시장 상황 반영)
const DUMMY_COMMODITIES_DATA = [
  // Precious Metals (귀금속)
  { title: 'Gold', value: 2075.50, change: 12.30, isPositive: true, symbol: 'GC=F' },
  { title: 'Silver', value: 24.85, change: -0.15, isPositive: false, symbol: 'SI=F' },
  
  // Energy (에너지)
  { title: 'Brent Crude', value: 82.45, change: 1.25, isPositive: true, symbol: 'BZ=F' },
  { title: 'WTI', value: 78.90, change: 1.10, isPositive: true, symbol: 'CL=F' },
  { title: 'Natural Gas', value: 2.85, change: -0.08, isPositive: false, symbol: 'NG=F' },
  
  // Industrial Metals (산업용 금속)
  { title: 'Copper', value: 3.95, change: 0.05, isPositive: true, symbol: 'HG=F' },
  
  // Agriculture (농산물)
  { title: 'Soybean', value: 1250.75, change: -5.25, isPositive: false, symbol: 'ZS=F' },
  { title: 'Wheat', value: 580.50, change: 8.75, isPositive: true, symbol: 'ZW=F' },
  { title: 'Corn', value: 485.25, change: -2.50, isPositive: false, symbol: 'ZC=F' }
];

// 실시간 데이터 시뮬레이션 (더미 데이터에 약간의 변동 추가)
const generateRealTimeData = () => {
  return DUMMY_COMMODITIES_DATA.map(item => {
    // 약간의 랜덤 변동 추가 (±2% 범위)
    const variation = (Math.random() - 0.5) * 0.04;
    const newValue = item.value * (1 + variation);
    const newChange = newValue - item.value;
    
    return {
      ...item,
      value: Math.round(newValue * 100) / 100,
      change: Math.round(newChange * 100) / 100,
      isPositive: newChange >= 0
    };
  });
};

// 개별 상품 데이터 가져오기
export const fetchCommodityQuote = async (title) => {
  try {
    console.log(`🔄 Fetching ${title} from Yahoo Finance...`);
    
    const symbol = COMMODITIES_SYMBOLS[title];
    if (!symbol) {
      throw new Error(`Unknown symbol: ${title}`);
    }
    
    const url = `${BASE_URL}/${symbol}?interval=1d&range=1d`;
    console.log(`🔗 URL: ${url}`);
    
    const data = await fetchWithProxy(url);
    
    if (!data) {
      throw new Error('Failed to fetch data');
    }
    
    // JSON 파싱 시도
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (error) {
      console.log('❌ Failed to parse JSON, using dummy data');
      throw new Error('Invalid JSON response');
    }
    
    // Yahoo Finance API 응답 구조에서 데이터 추출
    if (jsonData.chart && jsonData.chart.result && jsonData.chart.result[0]) {
      const result = jsonData.chart.result[0];
      const meta = result.meta;
      const indicators = result.indicators;
      
      if (meta && indicators && indicators.quote && indicators.quote[0]) {
        const quote = indicators.quote[0];
        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose;
        const change = currentPrice - previousClose;
        
        console.log(`✅ Successfully fetched ${title}: $${currentPrice} (${change >= 0 ? '+' : ''}${change.toFixed(2)})`);
        return {
          title: title,
          value: currentPrice,
          change: Math.round(change * 100) / 100,
          isPositive: change >= 0,
          symbol: symbol,
          isRealData: true,
          dataSource: 'Yahoo Finance'
        };
      }
    }
    
    throw new Error(`No valid data found for ${title}`);
    
  } catch (error) {
    console.error(`❌ Error fetching ${title}:`, error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_COMMODITIES_DATA.find(item => item.title === title);
    if (dummyData) {
      console.log(`📊 Using dummy data for ${title}`);
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)',
        symbol: COMMODITIES_SYMBOLS[title] || ''
      };
    }
    
    throw error;
  }
};

// 모든 Commodities 데이터 가져오기
export const fetchAllCommoditiesData = async () => {
  try {
    console.log('🔄 Fetching all Commodities data from Yahoo Finance...');
    
    const promises = [];
    
    // 모든 Commodities 심볼에 대해 병렬로 데이터 가져오기
    for (const [title, symbol] of Object.entries(COMMODITIES_SYMBOLS)) {
      promises.push(
        fetchCommodityQuote(title)
          .then(data => {
            console.log(`✅ ${title}: $${data.value} (${data.isRealData ? 'Real' : 'Dummy'})`);
            return data;
          })
          .catch(error => {
            console.log(`❌ Error fetching ${title}:`, error.message);
            // 개별 실패 시 더미 데이터 사용
            const dummyData = DUMMY_COMMODITIES_DATA.find(item => item.title === title);
            if (dummyData) {
              console.log(`📊 Using dummy data for ${title}`);
              return {
                ...dummyData,
                isRealData: false,
                dataSource: 'Dummy Data (Error)',
                symbol: symbol
              };
            }
            return null;
          })
      );
    }
    
    // 모든 요청 완료 대기
    const results = await Promise.all(promises);
    
    // null 값 필터링
    const validData = results.filter(data => data !== null);
    
    console.log(`✅ Successfully loaded ${validData.length}/${Object.keys(COMMODITIES_SYMBOLS).length} Commodities`);
    
    // 실제 데이터가 있는지 확인
    const realDataCount = validData.filter(item => item.isRealData).length;
    if (realDataCount === 0) {
      console.log('⚠️ No real data available, showing dummy data');
    } else {
      console.log(`✅ ${realDataCount} real Commodities loaded`);
    }
    
    return validData;
    
  } catch (error) {
    console.error('❌ Error fetching all Commodities data:', error);
    console.log('📊 Falling back to dummy data...');
    
    // 전체 실패 시 더미 데이터 반환
    return DUMMY_COMMODITIES_DATA.map(item => ({
      ...item,
      isRealData: false,
      dataSource: 'Dummy Data (Error)',
      symbol: COMMODITIES_SYMBOLS[item.title] || ''
    }));
  }
};

// 상품 데이터 가져오기 (실시간 시뮬레이션)
export const fetchCommodities = async () => {
  try {
    // 실제 API 호출 대신 실시간 시뮬레이션 사용
    const realTimeData = generateRealTimeData();
    return realTimeData;
  } catch (error) {
    console.error('Error fetching commodities:', error);
    return DUMMY_COMMODITIES_DATA;
  }
}; 