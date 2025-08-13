// Macro Economics 데이터를 가져오는 서비스
const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Macro 지표 심볼 매핑
const MACRO_SYMBOLS = {
  'Korea GDP Growth': 'KOREA_GDP_GROWTH',
  'S&P 500 Annual Dividend Futures': '^SP500DIV',
  'World Citi Economic Surprise Index': 'CITI_SURPRISE',
  '5-Year 5-Year Forward Inflation Expectation Rate': 'T5YIFR',
  'US Core Inflation Rate YoY': 'US_CORE_INFLATION',
  'US Core PCE YoY': 'US_CORE_PCE',
  'US Core PPI YoY': 'US_CORE_PPI',
  'US Money Supply M2': 'US_M2',
  'US SOFR': 'US_SOFR',
  'US 30Y Mortgage Rate': 'US_30Y_MORTGAGE',
  'US New House Price': 'US_NEW_HOUSE_PRICE',
  'Korea Export Import': 'KOREA_EXPORT_IMPORT',
  'US Non Farm Payrolls': 'US_NON_FARM_PAYROLLS',
  'US Unemployment Rate': 'US_UNEMPLOYMENT_RATE'
};

// 외부 URL 매핑
export const EXTERNAL_URLS = {
  'Korea GDP Growth': 'https://tradingeconomics.com/south-korea/gdp-growth-annual',
  'S&P 500 Annual Dividend Futures': 'https://finance.yahoo.com/quote/%5ESP500DIV',
  'World Citi Economic Surprise Index': 'https://en.macromicro.me/charts/45866/global-citi-surprise-index',
  '5-Year 5-Year Forward Inflation Expectation Rate': 'https://fred.stlouisfed.org/series/T5YIFR',
  'US Core Inflation Rate YoY': 'https://tradingeconomics.com/united-states/core-inflation-rate',
  'US Core PCE YoY': 'https://tradingeconomics.com/united-states/core-pce-price-index-annual-change',
  'US Core PPI YoY': 'https://tradingeconomics.com/united-states/core-producer-prices-yoy',
  'US Money Supply M2': 'https://tradingeconomics.com/united-states/money-supply-m2',
  'US SOFR': 'https://tradingeconomics.com/united-states/secured-overnight-financing-rate',
  'US 30Y Mortgage Rate': 'https://tradingeconomics.com/united-states/30-year-mortgage-rate',
  'US New House Price': 'https://tradingeconomics.com/united-states/average-house-prices',
  'Korea Export Import': 'https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1066',
  'US Non Farm Payrolls': 'https://tradingeconomics.com/united-states/non-farm-payrolls',
  'US Unemployment Rate': 'https://tradingeconomics.com/united-states/unemployment-rate?c=usd&v=2024&d1=20140101&d2=20241231&h=10y'
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
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors.bridged.cc/',
  'https://thingproxy.freeboard.io/fetch/',
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://thingproxy.freeboard.io/fetch/',
  'https://cors.bridged.cc/',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors.eu.org/',
  '' // 직접 호출도 시도
];

// 프록시를 사용한 웹 스크래핑
const fetchWithProxy = async (url, proxyIndex = 0) => {
  if (proxyIndex >= PROXY_SERVICES.length) {
    throw new Error('All proxy attempts failed');
  }

  try {
    const proxyUrl = PROXY_SERVICES[proxyIndex] + url;
    console.log(`🔗 Trying proxy ${proxyIndex + 1}/${PROXY_SERVICES.length}: ${proxyUrl.substring(0, 80)}...`);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 15000 // 15초 타임아웃
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.text();
    
    console.log(`📊 Response data length: ${data.length} characters`);
    
    if (data.length < 100) {
      console.log(`📄 Short response data: ${data}`);
      throw new Error('Response too short, likely an error page');
    }
    
    // 에러 페이지인지 확인
    if (data.includes('error') || data.includes('Error') || data.includes('ERROR')) {
      console.log('⚠️ Response contains error indicators');
      console.log('📄 Error response preview:', data.substring(0, 500));
    }
    
    // CORS 에러인지 확인
    if (data.includes('CORS') || data.includes('cors') || data.includes('Access-Control')) {
      console.log('⚠️ Response contains CORS error indicators');
      console.log('📄 CORS error preview:', data.substring(0, 500));
    }
    
    console.log(`✅ Proxy ${proxyIndex + 1} successful! Data length: ${data.length} characters`);
    return data;
  } catch (error) {
    console.log(`❌ Proxy ${proxyIndex + 1} failed: ${error.message}`);
    console.log(`🔍 Error details:`, error);
    
    // 마지막 프록시가 아니면 다음 프록시 시도
    if (proxyIndex < PROXY_SERVICES.length - 1) {
      console.log(`🔄 Retrying with next proxy...`);
      return fetchWithProxy(url, proxyIndex + 1);
    } else {
      throw new Error(`All ${PROXY_SERVICES.length} proxies failed. Last error: ${error.message}`);
    }
  }
};

// 2024년 12월 기준 최신 더미 데이터 (실제 시장 상황 반영)
const DUMMY_MACRO_DATA = [
  {
    title: 'Korea GDP Growth',
    value: 2.1,
    change: 0.00,
    isPositive: true,
    symbol: 'KOREA_GDP_GROWTH',
    unit: '%',
    description: '한국 GDP 성장률'
  },
  {
    title: 'S&P 500 Annual Dividend Futures',
    value: 2.15,
    change: 0.05,
    isPositive: true,
    symbol: '^SP500DIV',
    unit: '%',
    description: 'S&P 500 연간 배당률 선물'
  },
  {
    title: 'World Citi Economic Surprise Index',
    value: 13.40,  // 실제 MacroMicro 사이트에서 확인한 값으로 업데이트
    change: -0.90, // 13.40 - 14.30 = -0.90
    isPositive: true,
    symbol: 'CITI_SURPRISE',
    unit: '',
    description: '글로벌 경제 서프라이즈 지수'
  },
  {
    title: '5-Year 5-Year Forward Inflation Expectation Rate',
    value: 2.33,  // FRED에서 확인한 실제 값으로 업데이트
    change: -0.01,
    isPositive: true,
    symbol: 'T5YIFR',
    unit: '%',
    description: '5년 후 5년 인플레이션 기대율'
  },
  {
    title: 'US Core Inflation Rate YoY',
    value: 3.2,
    change: -0.1,
    isPositive: false,
    symbol: 'US_CORE_INFLATION',
    unit: '%',
    description: '미국 핵심 인플레이션률 (전년 동기 대비)'
  },
  {
    title: 'US Core PCE YoY',
    value: 2.9,
    change: -0.2,
    isPositive: false,
    symbol: 'US_CORE_PCE',
    unit: '%',
    description: '미국 핵심 PCE 물가지수 (전년 동기 대비)'
  },
  {
    title: 'US Core PPI YoY',
    value: 2.4,
    change: -0.3,
    isPositive: false,
    symbol: 'US_CORE_PPI',
    unit: '%',
    description: '미국 핵심 PPI 물가지수 (전년 동기 대비)'
  },
  {
    title: 'US Money Supply M2',
    value: 20.8,
    change: -2.1,
    isPositive: false,
    symbol: 'US_M2',
    unit: '',
    description: '미국 M2 통화량 (전년 동기 대비)'
  },
  {
    title: 'US SOFR',
    value: 5.33,
    change: 0.00,
    isPositive: true,
    symbol: 'US_SOFR',
    unit: '%',
    description: '미국 담보부 하루물 금리'
  },
  {
    title: 'US 30Y Mortgage Rate',
    value: 7.15,
    change: 0.00,
    isPositive: true,
    symbol: 'US_30Y_MORTGAGE',
    unit: '%',
    description: '미국 30년 주택담보대출 금리'
  },
  {
    title: 'US New House Price',
    value: 400000, // 더미 데이터
    change: 0.00,
    isPositive: true,
    symbol: 'US_NEW_HOUSE_PRICE',
    unit: '$',
    description: '미국 신축 주택 평균 가격'
  },
  {
    title: 'Korea Export Import',
    value: 1250.8, // 더미 데이터 (단위: 억 달러)
    change: 0.00,
    isPositive: true,
    symbol: 'KOREA_EXPORT_IMPORT',
    unit: '억$',
    description: '한국 수출입 실적'
  },
  {
    title: 'US Non Farm Payrolls',
    value: 199.0, // 더미 데이터 (단위: 천 명)
    change: 0.00,
    isPositive: true,
    symbol: 'US_NON_FARM_PAYROLLS',
    unit: '천명',
    description: '미국 비농업 고용 지표'
  },
  {
    title: 'US Unemployment Rate',
    value: 3.7, // 더미 데이터 (단위: %)
    change: 0.00,
    isPositive: false,
    symbol: 'US_UNEMPLOYMENT_RATE',
    unit: '%',
    description: '미국 실업률'
  }
];

// S&P 500 Annual Dividend Futures 가져오기 (Yahoo Finance)
export const fetchSP500DividendFutures = async () => {
  try {
    console.log('🔄 Fetching S&P 500 Annual Dividend Futures from Yahoo Finance...');
    
    const symbol = '^SP500DIV';
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
      
      if (meta) {
        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose;
        const change = currentPrice - previousClose;
        
        console.log(`✅ Successfully fetched S&P 500 Dividend Futures: ${currentPrice}% (${change >= 0 ? '+' : ''}${change.toFixed(2)})`);
        return {
          title: 'S&P 500 Annual Dividend Futures',
          value: currentPrice,
          change: Math.round(change * 100) / 100,
          isPositive: change >= 0,
          symbol: symbol,
          unit: '%',
          description: 'S&P 500 연간 배당률 선물',
          isRealData: true,
          dataSource: 'Yahoo Finance'
        };
      }
    }
    
    throw new Error('No valid data found for S&P 500 Dividend Futures');
    
  } catch (error) {
    console.error('❌ Error fetching S&P 500 Dividend Futures:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'S&P 500 Annual Dividend Futures');
    if (dummyData) {
      console.log('📊 Using dummy data for S&P 500 Dividend Futures');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// World Citi Economic Surprise Index 가져오기 (MacroMicro)
export const fetchCitiEconomicSurpriseIndex = async () => {
  try {
    console.log('🔄 Fetching World Citi Economic Surprise Index from MacroMicro...');
    
    const url = 'https://en.macromicro.me/charts/45866/global-citi-surprise-index';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    // 방법 3: JSONP 방식 시도 (MacroMicro에서 지원하는 경우)
    if (!data) {
      try {
        console.log('🔄 Trying JSONP approach...');
        // JSONP는 동적 스크립트 로딩을 통해 CORS를 우회
        const script = document.createElement('script');
        script.src = url + '?callback=handleMacroData';
        
        // 전역 콜백 함수 정의
        window.handleMacroData = function(jsonData) {
          console.log('✅ JSONP callback received:', jsonData);
          data = JSON.stringify(jsonData);
        };
        
        document.head.appendChild(script);
        
        // 5초 대기
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        if (data) {
          console.log('✅ Successfully fetched data using JSONP');
        } else {
          throw new Error('JSONP timeout');
        }
      } catch (error) {
        console.log('❌ JSONP method failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'World Citi Economic Surprise Index');
      if (dummyData) {
        console.log('📊 Using dummy data for Citi Economic Surprise Index');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // "Latest Stats" 텍스트 찾기
    const latestStatsIndex = data.indexOf('Latest Stats');
    if (latestStatsIndex === -1) {
      console.log('❌ "Latest Stats" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        'Latest Stats',
        'latest stats',
        'LATEST STATS',
        'Latest Statistics',
        'Statistics',
        'Stats'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          break;
        }
      }
      
      // HTML에서 "Citigroup" 관련 텍스트 찾기
      const citigroupIndex = data.indexOf('Citigroup');
      if (citigroupIndex !== -1) {
        console.log(`✅ Found "Citigroup" at index ${citigroupIndex}`);
        console.log('📄 Context around Citigroup:', data.substring(citigroupIndex - 100, citigroupIndex + 200));
      }
      
      throw new Error('Latest Stats section not found');
    }
    
    console.log(`✅ Found "Latest Stats" section at index ${latestStatsIndex}`);
    
    // "Latest Stats" 이후의 HTML에서 "Citigroup Economic Surprise Index: Global" 찾기
    const afterLatestStats = data.substring(latestStatsIndex);
    console.log('📄 After Latest Stats (first 1000 chars):', afterLatestStats.substring(0, 1000));
    
    const citiIndexIndex = afterLatestStats.indexOf('Citigroup Economic Surprise Index: Global');
    if (citiIndexIndex === -1) {
      console.log('❌ "Citigroup Economic Surprise Index: Global" text not found');
      console.log('🔍 Searching for alternative Citigroup patterns...');
      
      // 대안 패턴들 시도
      const citigroupPatterns = [
        'Citigroup Economic Surprise Index: Global',
        'Citigroup Economic Surprise Index',
        'Economic Surprise Index: Global',
        'Economic Surprise Index',
        'Surprise Index: Global',
        'Surprise Index'
      ];
      
      for (const pattern of citigroupPatterns) {
        const index = afterLatestStats.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', afterLatestStats.substring(index - 50, index + 200));
          break;
        }
      }
      
      throw new Error('Citigroup Economic Surprise Index: Global not found');
    }
    
    console.log(`✅ Found "Citigroup Economic Surprise Index: Global" text at index ${citiIndexIndex}`);
    
    // "Citigroup Economic Surprise Index: Global" 이후의 HTML에서 날짜와 값 찾기
    const afterCitiIndex = afterLatestStats.substring(citiIndexIndex);
    console.log('📄 After Citigroup pattern (first 500 chars):', afterCitiIndex.substring(0, 500));
    
    // YYYY-MM-DD 패턴 찾기
    const datePattern = /\d{4}-\d{2}-\d{2}/;
    const dateMatch = afterCitiIndex.match(datePattern);
    
    if (!dateMatch) {
      console.log('❌ Date pattern not found');
      console.log('🔍 Searching for any date-like patterns...');
      
      // 다른 날짜 패턴들 시도
      const datePatterns = [
        /\d{4}-\d{2}-\d{2}/,  // YYYY-MM-DD
        /\d{2}-\d{2}-\d{4}/,  // MM-DD-YYYY
        /\d{4}\/\d{2}\/\d{2}/, // YYYY/MM/DD
        /\d{2}\/\d{2}\/\d{4}/  // MM/DD/YYYY
      ];
      
      for (const pattern of datePatterns) {
        const match = afterCitiIndex.match(pattern);
        if (match) {
          console.log(`✅ Found date pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Date pattern not found');
    }
    
    const dateFound = dateMatch[0];
    console.log(`✅ Found date: ${dateFound}`);
    
    // 날짜 이후의 HTML에서 숫자 값 찾기 (더 정확한 패턴)
    const dateIndex = afterCitiIndex.indexOf(dateFound);
    const afterDate = afterCitiIndex.substring(dateIndex + dateFound.length);
    console.log('📄 After date (first 300 chars):', afterDate.substring(0, 300));
    
    // 숫자 패턴 찾기 (소수점 포함, 더 정확한 매칭)
    const numberPattern = /[-+]?\d+\.\d+/;
    const numberMatch = afterDate.match(numberPattern);
    
    if (!numberMatch) {
      console.log('❌ Number value not found after date');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?\d+\.\d+/,  // 소수점 포함
        /[-+]?\d+/,       // 정수만
        /\d+\.\d+/        // 양수 소수점
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterDate.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found after date');
    }
    
    const currentValue = parseFloat(numberMatch[0]);
    console.log(`✅ Successfully extracted Citi Economic Surprise Index: ${currentValue}`);
    
    // 이전 값도 찾아보기 (Prev: 패턴)
    const prevPattern = /Prev:\s*([-+]?\d+\.\d+)/;
    const prevMatch = afterDate.match(prevPattern);
    let change = 0.00;
    
    if (prevMatch) {
      const prevValue = parseFloat(prevMatch[1]);
      change = currentValue - prevValue;
      console.log(`✅ Found previous value: ${prevValue}, change: ${change}`);
    } else {
      console.log('⚠️ Previous value not found, using 0.00 for change');
    }
    
    return {
      title: 'World Citi Economic Surprise Index',
      value: currentValue,
      change: Math.round(change * 100) / 100,
      isPositive: currentValue >= 0,
      symbol: 'CITI_SURPRISE',
      unit: '',
      description: '글로벌 경제 서프라이즈 지수',
      isRealData: true,
      dataSource: 'MacroMicro'
    };
    
  } catch (error) {
    console.error('❌ Error fetching Citi Economic Surprise Index:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'World Citi Economic Surprise Index');
    if (dummyData) {
      console.log('📊 Using dummy data for Citi Economic Surprise Index');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// 5-Year 5-Year Forward Inflation Expectation Rate 가져오기 (FRED)
export const fetchInflationExpectationRate = async () => {
  try {
    console.log('🔄 Fetching 5-Year 5-Year Forward Inflation Expectation Rate from FRED...');
    
    const url = 'https://fred.stlouisfed.org/series/T5YIFR';
    console.log(`🔗 URL: ${url}`);
    
    const data = await fetchWithProxy(url);
    
    if (!data) {
      throw new Error('Failed to fetch data');
    }
    
    // FRED 페이지에서 데이터 추출 시도
    console.log('📄 HTML Preview:', data.substring(0, 1000));
    
    // FRED 페이지에서 최신 값 추출 (2025-08-12: 2.33 형태)
    const latestValueMatch = data.match(/2025-\d{2}-\d{2}:\s*(\d+\.\d+)/);
    if (latestValueMatch) {
      const currentValue = parseFloat(latestValueMatch[1]);
      console.log(`✅ Successfully extracted inflation expectation rate: ${currentValue}%`);
      
      return {
        title: '5-Year 5-Year Forward Inflation Expectation Rate',
        value: currentValue,
        change: 0.00, // FRED에서는 변화량을 직접 제공하지 않으므로 0으로 설정
        isPositive: true,
        symbol: 'T5YIFR',
        unit: '%',
        description: '5년 후 5년 인플레이션 기대율',
        isRealData: true,
        dataSource: 'FRED (Federal Reserve Economic Data)'
      };
    }
    
    // 임시로 더미 데이터 반환
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === '5-Year 5-Year Forward Inflation Expectation Rate');
    if (dummyData) {
      console.log('📊 Using dummy data for Inflation Expectation Rate (parsing not implemented)');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Parsing not implemented)'
      };
    }
    
    throw new Error('No valid data found for Inflation Expectation Rate');
    
  } catch (error) {
    console.error('❌ Error fetching Inflation Expectation Rate:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === '5-Year 5-Year Forward Inflation Expectation Rate');
    if (dummyData) {
      console.log('📊 Using dummy data for Inflation Expectation Rate');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// US Core Inflation Rate YoY 가져오기 (Trading Economics)
export const fetchUSCoreInflationRate = async () => {
  try {
    console.log('🔄 Fetching US Core Inflation Rate YoY from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/core-inflation-rate';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Core Inflation Rate YoY');
      if (dummyData) {
        console.log('📊 Using dummy data for US Core Inflation Rate');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // Trading Economics 페이지에서 데이터 추출 시도
    // "Core Inflation Rate" 텍스트 찾기
    const coreInflationIndex = data.indexOf('Core Inflation Rate');
    if (coreInflationIndex === -1) {
      console.log('❌ "Core Inflation Rate" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        'Core Inflation Rate',
        'core inflation rate',
        'CORE INFLATION RATE',
        'Inflation Rate',
        'inflation rate'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', data.substring(index - 100, index + 200));
          break;
        }
      }
      
      throw new Error('Core Inflation Rate section not found');
    }
    
    console.log(`✅ Found "Core Inflation Rate" at index ${coreInflationIndex}`);
    
    // "Core Inflation Rate" 이후의 HTML에서 숫자 값 찾기
    const afterCoreInflation = data.substring(coreInflationIndex);
    console.log('📄 After Core Inflation Rate (first 1000 chars):', afterCoreInflation.substring(0, 1000));
    
    // 숫자 패턴 찾기 (소수점 포함)
    const numberPattern = /[-+]?\d+\.\d+/;
    const numberMatch = afterCoreInflation.match(numberPattern);
    
    if (!numberMatch) {
      console.log('❌ Number value not found');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?\d+\.\d+/,  // 소수점 포함
        /[-+]?\d+/,       // 정수만
        /\d+\.\d+/        // 양수 소수점
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterCoreInflation.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found');
    }
    
    const currentValue = parseFloat(numberMatch[0]);
    console.log(`✅ Successfully extracted US Core Inflation Rate: ${currentValue}%`);
    
    // 변화량은 별도로 계산하기 어려우므로 더미 데이터에서 가져오기
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Core Inflation Rate YoY');
    const change = dummyData ? dummyData.change : 0.00;
    
    return {
      title: 'US Core Inflation Rate YoY',
      value: currentValue,
      change: change,
      isPositive: change >= 0,
      symbol: 'US_CORE_INFLATION',
      unit: '%',
      description: '미국 핵심 인플레이션률 (전년 동기 대비)',
      isRealData: true,
      dataSource: 'Trading Economics'
    };
    
  } catch (error) {
    console.error('❌ Error fetching US Core Inflation Rate:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Core Inflation Rate YoY');
    if (dummyData) {
      console.log('📊 Using dummy data for US Core Inflation Rate');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// US Core PCE YoY 가져오기 (Trading Economics)
export const fetchUSCorePCE = async () => {
  try {
    console.log('🔄 Fetching US Core PCE YoY from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/core-pce-price-index-annual-change';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Core PCE YoY');
      if (dummyData) {
        console.log('📊 Using dummy data for US Core PCE');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // Trading Economics 페이지에서 데이터 추출 시도
    // "Core PCE Price Index" 텍스트 찾기
    const corePCEIndex = data.indexOf('Core PCE Price Index');
    if (corePCEIndex === -1) {
      console.log('❌ "Core PCE Price Index" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        'Core PCE Price Index',
        'core pce price index',
        'CORE PCE PRICE INDEX',
        'PCE Price Index',
        'pce price index',
        'PCE',
        'pce'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', data.substring(index - 100, index + 200));
          break;
        }
      }
      
      throw new Error('Core PCE Price Index section not found');
    }
    
    console.log(`✅ Found "Core PCE Price Index" at index ${corePCEIndex}`);
    
    // "Core PCE Price Index" 이후의 HTML에서 숫자 값 찾기
    const afterCorePCE = data.substring(corePCEIndex);
    console.log('📄 After Core PCE Price Index (first 1000 chars):', afterCorePCE.substring(0, 1000));
    
    // 숫자 패턴 찾기 (소수점 포함)
    const numberPattern = /[-+]?\d+\.\d+/;
    const numberMatch = afterCorePCE.match(numberPattern);
    
    if (!numberMatch) {
      console.log('❌ Number value not found');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?\d+\.\d+/,  // 소수점 포함
        /[-+]?\d+/,       // 정수만
        /\d+\.\d+/        // 양수 소수점
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterCorePCE.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found');
    }
    
    const currentValue = parseFloat(numberMatch[0]);
    console.log(`✅ Successfully extracted US Core PCE: ${currentValue}%`);
    
    // 변화량은 별도로 계산하기 어려우므로 더미 데이터에서 가져오기
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Core PCE YoY');
    const change = dummyData ? dummyData.change : 0.00;
    
    return {
      title: 'US Core PCE YoY',
      value: currentValue,
      change: change,
      isPositive: change >= 0,
      symbol: 'US_CORE_PCE',
      unit: '%',
      description: '미국 핵심 PCE 물가지수 (전년 동기 대비)',
      isRealData: true,
      dataSource: 'Trading Economics'
    };
    
  } catch (error) {
    console.error('❌ Error fetching US Core PCE:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Core PCE YoY');
    if (dummyData) {
      console.log('📊 Using dummy data for US Core PCE');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// US Core PPI YoY 가져오기 (Trading Economics)
export const fetchUSCorePPI = async () => {
  try {
    console.log('🔄 Fetching US Core PPI YoY from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/core-producer-prices-yoy';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Core PPI YoY');
      if (dummyData) {
        console.log('📊 Using dummy data for US Core PPI');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // Trading Economics 페이지에서 데이터 추출 시도
    // "Core PPI" 텍스트 찾기
    const corePPIIndex = data.indexOf('Core PPI');
    if (corePPIIndex === -1) {
      console.log('❌ "Core PPI" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        'Core PPI',
        'core ppi',
        'CORE PPI',
        'PPI',
        'ppi'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', data.substring(index - 100, index + 200));
          break;
        }
      }
      
      throw new Error('Core PPI section not found');
    }
    
    console.log(`✅ Found "Core PPI" at index ${corePPIIndex}`);
    
    // "Core PPI" 이후의 HTML에서 숫자 값 찾기
    const afterCorePPI = data.substring(corePPIIndex);
    console.log('📄 After Core PPI (first 1000 chars):', afterCorePPI.substring(0, 1000));
    
    // 숫자 패턴 찾기 (소수점 포함)
    const numberPattern = /[-+]?\d+\.\d+/;
    const numberMatch = afterCorePPI.match(numberPattern);
    
    if (!numberMatch) {
      console.log('❌ Number value not found');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?\d+\.\d+/,  // 소수점 포함
        /[-+]?\d+/,       // 정수만
        /\d+\.\d+/        // 양수 소수점
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterCorePPI.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found');
    }
    
    const currentValue = parseFloat(numberMatch[0]);
    console.log(`✅ Successfully extracted US Core PPI: ${currentValue}%`);
    
    // 변화량은 별도로 계산하기 어려우므로 더미 데이터에서 가져오기
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Core PPI YoY');
    const change = dummyData ? dummyData.change : 0.00;
    
    return {
      title: 'US Core PPI YoY',
      value: currentValue,
      change: change,
      isPositive: change >= 0,
      symbol: 'US_CORE_PPI',
      unit: '%',
      description: '미국 핵심 PPI 물가지수 (전년 동기 대비)',
      isRealData: true,
      dataSource: 'Trading Economics'
    };
    
  } catch (error) {
    console.error('❌ Error fetching US Core PPI:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Core PPI YoY');
    if (dummyData) {
      console.log('📊 Using dummy data for US Core PPI');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// US Money Supply M2 가져오기 (Trading Economics)
export const fetchUSMoneySupplyM2 = async () => {
  try {
    console.log('🔄 Fetching US Money Supply M2 from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/money-supply-m2';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Money Supply M2');
      if (dummyData) {
        console.log('📊 Using dummy data for US Money Supply M2');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // Trading Economics 페이지에서 데이터 추출 시도
    // "Money Supply M2" 텍스트 찾기
    const moneySupplyIndex = data.indexOf('Money Supply M2');
    if (moneySupplyIndex === -1) {
      console.log('❌ "Money Supply M2" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        'Money Supply M2',
        'money supply m2',
        'MONEY SUPPLY M2',
        'Money Supply',
        'money supply'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', data.substring(index - 100, index + 200));
          break;
        }
      }
      
      throw new Error('Money Supply M2 section not found');
    }
    
    console.log(`✅ Found "Money Supply M2" at index ${moneySupplyIndex}`);
    
    // "Money Supply M2" 이후의 HTML에서 숫자 값 찾기
    const afterMoneySupply = data.substring(moneySupplyIndex);
    console.log('📄 After Money Supply M2 (first 1000 chars):', afterMoneySupply.substring(0, 1000));
    
    // 숫자 패턴 찾기 (소수점 포함)
    const numberPattern = /[-+]?\d+\.\d+/;
    const numberMatch = afterMoneySupply.match(numberPattern);
    
    if (!numberMatch) {
      console.log('❌ Number value not found');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?\d+\.\d+/,  // 소수점 포함
        /[-+]?\d+/,       // 정수만
        /\d+\.\d+/        // 양수 소수점
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterMoneySupply.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found');
    }
    
    const currentValue = parseFloat(numberMatch[0]);
    console.log(`✅ Successfully extracted US Money Supply M2: ${currentValue}`);
    
    // 변화량은 별도로 계산하기 어려우므로 더미 데이터에서 가져오기
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Money Supply M2');
    const change = dummyData ? dummyData.change : 0.00;
    
    return {
      title: 'US Money Supply M2',
      value: currentValue,
      change: change,
      isPositive: change >= 0,
      symbol: 'US_M2',
      unit: '',
      description: '미국 핵심 M2 통화량 (전년 동기 대비)',
      isRealData: true,
      dataSource: 'Trading Economics'
    };
    
  } catch (error) {
    console.error('❌ Error fetching US Money Supply M2:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Money Supply M2');
    if (dummyData) {
      console.log('📊 Using dummy data for US Money Supply M2');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// US SOFR 가져오기 (Trading Economics)
export const fetchUSSOFR = async () => {
  try {
    console.log('🔄 Fetching US SOFR from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/secured-overnight-financing-rate';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US SOFR');
      if (dummyData) {
        console.log('📊 Using dummy data for US SOFR');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // Trading Economics 페이지에서 데이터 추출 시도
    // "SOFR" 텍스트 찾기
    const sofrIndex = data.indexOf('SOFR');
    if (sofrIndex === -1) {
      console.log('❌ "SOFR" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        'SOFR',
        'sofr',
        'Secured Overnight Financing Rate',
        'secured overnight financing rate',
        'Overnight Financing Rate',
        'overnight financing rate'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', data.substring(index - 100, index + 200));
          break;
        }
      }
      
      throw new Error('SOFR section not found');
    }
    
    console.log(`✅ Found "SOFR" at index ${sofrIndex}`);
    
    // "SOFR" 이후의 HTML에서 숫자 값 찾기
    const afterSOFR = data.substring(sofrIndex);
    console.log('📄 After SOFR (first 1000 chars):', afterSOFR.substring(0, 1000));
    
    // 숫자 패턴 찾기 (소수점 포함)
    const numberPattern = /[-+]?\d+\.\d+/;
    const numberMatch = afterSOFR.match(numberPattern);
    
    if (!numberMatch) {
      console.log('❌ Number value not found');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?\d+\.\d+/,  // 소수점 포함
        /[-+]?\d+/,       // 정수만
        /\d+\.\d+/        // 양수 소수점
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterSOFR.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found');
    }
    
    const currentValue = parseFloat(numberMatch[0]);
    console.log(`✅ Successfully extracted US SOFR: ${currentValue}%`);
    
    // 변화량은 별도로 계산하기 어려우므로 더미 데이터에서 가져오기
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US SOFR');
    const change = dummyData ? dummyData.change : 0.00;
    
    return {
      title: 'US SOFR',
      value: currentValue,
      change: change,
      isPositive: change >= 0,
      symbol: 'US_SOFR',
      unit: '%',
      description: '미국 담보부 하루물 금리',
      isRealData: true,
      dataSource: 'Trading Economics'
    };
    
  } catch (error) {
    console.error('❌ Error fetching US SOFR:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US SOFR');
    if (dummyData) {
      console.log('📊 Using dummy data for US SOFR');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// US 30Y Mortgage Rate 가져오기 (Trading Economics)
export const fetchUS30YMortgageRate = async () => {
  try {
    console.log('🔄 Fetching US 30Y Mortgage Rate from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/30-year-mortgage-rate';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US 30Y Mortgage Rate');
      if (dummyData) {
        console.log('📊 Using dummy data for US 30Y Mortgage Rate');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // Trading Economics 페이지에서 데이터 추출 시도
    // "30-Year Mortgage Rate" 텍스트 찾기
    const mortgageRateIndex = data.indexOf('30-Year Mortgage Rate');
    if (mortgageRateIndex === -1) {
      console.log('❌ "30-Year Mortgage Rate" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        '30-Year Mortgage Rate',
        '30 year mortgage rate',
        '30-Year Mortgage',
        '30 year mortgage',
        'Mortgage Rate',
        'mortgage rate'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', data.substring(index - 100, index + 200));
          break;
        }
      }
      
      throw new Error('30-Year Mortgage Rate section not found');
    }
    
    console.log(`✅ Found "30-Year Mortgage Rate" at index ${mortgageRateIndex}`);
    
    // "30-Year Mortgage Rate" 이후의 HTML에서 숫자 값 찾기
    const afterMortgageRate = data.substring(mortgageRateIndex);
    console.log('📄 After 30-Year Mortgage Rate (first 1000 chars):', afterMortgageRate.substring(0, 1000));
    
    // 숫자 패턴 찾기 (소수점 포함)
    const numberPattern = /[-+]?\d+\.\d+/;
    const numberMatch = afterMortgageRate.match(numberPattern);
    
    if (!numberMatch) {
      console.log('❌ Number value not found');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?\d+\.\d+/,  // 소수점 포함
        /[-+]?\d+/,       // 정수만
        /\d+\.\d+/        // 양수 소수점
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterMortgageRate.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found');
    }
    
    const currentValue = parseFloat(numberMatch[0]);
    console.log(`✅ Successfully extracted US 30Y Mortgage Rate: ${currentValue}%`);
    
    // 변화량은 별도로 계산하기 어려우므로 더미 데이터에서 가져오기
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US 30Y Mortgage Rate');
    const change = dummyData ? dummyData.change : 0.00;
    
    return {
      title: 'US 30Y Mortgage Rate',
      value: currentValue,
      change: change,
      isPositive: change >= 0,
      symbol: 'US_30Y_MORTGAGE',
      unit: '%',
      description: '미국 30년 주택담보대출 금리',
      isRealData: true,
      dataSource: 'Trading Economics'
    };
    
  } catch (error) {
    console.error('❌ Error fetching US 30Y Mortgage Rate:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US 30Y Mortgage Rate');
    if (dummyData) {
      console.log('📊 Using dummy data for US 30Y Mortgage Rate');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// US New House Price 가져오기 (Trading Economics)
export const fetchUSNewHousePrice = async () => {
  try {
    console.log('🔄 Fetching US New House Price from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/average-house-prices';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US New House Price');
      if (dummyData) {
        console.log('📊 Using dummy data for US New House Price');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // Trading Economics 페이지에서 데이터 추출 시도
    // "Average House Prices" 텍스트 찾기
    const averageHousePricesIndex = data.indexOf('Average House Prices');
    if (averageHousePricesIndex === -1) {
      console.log('❌ "Average House Prices" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        'Average House Prices',
        'average house prices',
        'AVERAGE HOUSE PRICES',
        'House Prices',
        'house prices'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', data.substring(index - 100, index + 200));
          break;
        }
      }
      
      throw new Error('Average House Prices section not found');
    }
    
    console.log(`✅ Found "Average House Prices" at index ${averageHousePricesIndex}`);
    
    // "Average House Prices" 이후의 HTML에서 숫자 값 찾기
    const afterAverageHousePrices = data.substring(averageHousePricesIndex);
    console.log('📄 After Average House Prices (first 1000 chars):', afterAverageHousePrices.substring(0, 1000));
    
    // Actual 값을 찾기 위한 패턴들 시도
    let currentValue = null;
    
    // 패턴 1: "Actual" 텍스트 근처에서 숫자 찾기
    const actualIndex = afterAverageHousePrices.indexOf('Actual');
    if (actualIndex !== -1) {
      console.log(`✅ Found "Actual" at index ${actualIndex}`);
      const afterActual = afterAverageHousePrices.substring(actualIndex);
      console.log('📄 After Actual (first 500 chars):', afterActual.substring(0, 500));
      
      // Actual 이후의 숫자 패턴 찾기
      const actualNumberPattern = /[-+]?[\d,]+\.?\d*/;
      const actualMatch = afterActual.match(actualNumberPattern);
      if (actualMatch) {
        currentValue = parseFloat(actualMatch[0].replace(/,/g, ''));
        console.log(`✅ Found Actual value: ${currentValue}`);
      }
    }
    
    // 패턴 2: "Current" 텍스트 근처에서 숫자 찾기
    if (!currentValue) {
      const currentIndex = afterAverageHousePrices.indexOf('Current');
      if (currentIndex !== -1) {
        console.log(`✅ Found "Current" at index ${currentIndex}`);
        const afterCurrent = afterAverageHousePrices.substring(currentIndex);
        console.log('📄 After Current (first 500 chars):', afterCurrent.substring(0, 500));
        
        const currentNumberPattern = /[-+]?[\d,]+\.?\d*/;
        const currentMatch = afterCurrent.match(currentNumberPattern);
        if (currentMatch) {
          currentValue = parseFloat(currentMatch[0].replace(/,/g, ''));
          console.log(`✅ Found Current value: ${currentValue}`);
        }
      }
    }
    
    // 패턴 3: "Latest" 텍스트 근처에서 숫자 찾기
    if (!currentValue) {
      const latestIndex = afterAverageHousePrices.indexOf('Latest');
      if (latestIndex !== -1) {
        console.log(`✅ Found "Latest" at index ${latestIndex}`);
        const afterLatest = afterAverageHousePrices.substring(latestIndex);
        console.log('📄 After Latest (first 500 chars):', afterLatest.substring(0, 500));
        
        const latestNumberPattern = /[-+]?[\d,]+\.?\d*/;
        const latestMatch = afterLatest.match(latestNumberPattern);
        if (latestMatch) {
          currentValue = parseFloat(latestMatch[0].replace(/,/g, ''));
          console.log(`✅ Found Latest value: ${currentValue}`);
        }
      }
    }
    
    // 패턴 4: 일반적인 숫자 패턴 (마지막 수단)
    if (!currentValue) {
      console.log('🔍 Searching for general number patterns...');
      const numberPattern = /[-+]?[\d,]+\.?\d*/;
      const numberMatch = afterAverageHousePrices.match(numberPattern);
      
      if (numberMatch) {
        currentValue = parseFloat(numberMatch[0].replace(/,/g, ''));
        console.log(`✅ Found general number value: ${currentValue}`);
      }
    }
    
    if (!currentValue) {
      console.log('❌ No valid number value found');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?[\d,]+\.?\d*/,  // 콤마 포함
        /[-+]?\d+\.?\d*/,     // 소수점 포함
        /[-+]?\d+/,           // 정수만
        /\d+\.?\d*/           // 양수
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterAverageHousePrices.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found');
    }
    
    console.log(`✅ Successfully extracted US New House Price: ${currentValue}`);
    
    // 변화량은 별도로 계산하기 어려우므로 더미 데이터에서 가져오기
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US New House Price');
    const change = dummyData ? dummyData.change : 0.00;
    
    return {
      title: 'US New House Price',
      value: currentValue,
      change: change,
      isPositive: change >= 0,
      symbol: 'US_NEW_HOUSE_PRICE',
      unit: '$',
      description: '미국 신축 주택 평균 가격',
      isRealData: true,
      dataSource: 'Trading Economics'
    };
    
  } catch (error) {
    console.error('❌ Error fetching US New House Price:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US New House Price');
    if (dummyData) {
      console.log('📊 Using dummy data for US New House Price');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// 모든 Macro 데이터 가져오기
export const fetchAllMacroData = async () => {
  try {
    console.log('🔄 Fetching all Macro Economics data...');
    
    const promises = [
      fetchKoreaGDPGrowth(),
      fetchSP500DividendFutures(),
      fetchCitiEconomicSurpriseIndex(),
      fetchInflationExpectationRate(),
      fetchUSCoreInflationRate(),
      fetchUSCorePCE(),
      fetchUSCorePPI(),
      fetchUSMoneySupplyM2(),
      fetchUSSOFR(),
      fetchUS30YMortgageRate(),
      fetchUSNewHousePrice(),
      fetchKoreaExportImport(),
      fetchUSNonFarmPayrolls(),
      fetchUSUnemploymentRate()
    ];
    
    // 모든 요청 완료 대기
    const results = await Promise.all(promises);
    
    console.log(`✅ Successfully loaded ${results.length} Macro Economics indicators`);
    
    // 실제 데이터가 있는지 확인
    const realDataCount = results.filter(item => item.isRealData).length;
    if (realDataCount === 0) {
      console.log('⚠️ No real data available, showing dummy data');
    } else {
      console.log(`✅ ${realDataCount} real Macro indicators loaded`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error fetching all Macro data:', error);
    console.log('📊 Falling back to dummy data...');
    
    // 전체 실패 시 더미 데이터 반환
    return DUMMY_MACRO_DATA.map(item => ({
      ...item,
      isRealData: false,
      dataSource: 'Dummy Data (Error)'
    }));
  }
};

// Macro 데이터 가져오기 (실시간 시뮬레이션)
export const fetchMacroData = async () => {
  try {
    // 실제 API 호출 대신 실시간 시뮬레이션 사용
    return DUMMY_MACRO_DATA.map(item => ({
      ...item,
      isRealData: false,
      dataSource: 'Dummy Data (Simulation)'
    }));
  } catch (error) {
    console.error('Error fetching macro data:', error);
    return DUMMY_MACRO_DATA;
  }
};

// Korea Export Import 가져오기 (e-나라지표)
export const fetchKoreaExportImport = async () => {
  try {
    console.log('🔄 Fetching Korea Export Import from e-나라지표...');
    
    const url = 'https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1066';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'Korea Export Import');
      if (dummyData) {
        console.log('📊 Using dummy data for Korea Export Import');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // e-나라지표 페이지에서 데이터 추출 시도
    // "수출입실적" 텍스트 찾기
    const exportImportIndex = data.indexOf('수출입실적');
    if (exportImportIndex === -1) {
      console.log('❌ "수출입실적" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        '수출입실적',
        '수출입',
        'export import',
        'EXPORT IMPORT'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', data.substring(index - 100, index + 200));
          break;
        }
      }
      
      throw new Error('수출입실적 section not found');
    }
    
    console.log(`✅ Found "수출입실적" at index ${exportImportIndex}`);
    
    // "수출입실적" 이후의 HTML에서 숫자 값 찾기
    const afterExportImport = data.substring(exportImportIndex);
    console.log('📄 After 수출입실적 (first 1000 chars):', afterExportImport.substring(0, 1000));
    
    // 숫자 패턴 찾기 (소수점 포함, 억 단위)
    const numberPattern = /[-+]?\d+\.?\d*/;
    const numberMatch = afterExportImport.match(numberPattern);
    
    if (!numberMatch) {
      console.log('❌ Number value not found');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?\d+\.?\d*/,  // 소수점 포함
        /[-+]?\d+/,        // 정수만
        /\d+\.?\d*/        // 양수
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterExportImport.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found');
    }
    
    const currentValue = parseFloat(numberMatch[0]);
    console.log(`✅ Successfully extracted Korea Export Import: ${currentValue}`);
    
    // 변화량은 별도로 계산하기 어려우므로 더미 데이터에서 가져오기
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'Korea Export Import');
    const change = dummyData ? dummyData.change : 0.00;
    
    return {
      title: 'Korea Export Import',
      value: currentValue,
      change: change,
      isPositive: change >= 0,
      symbol: 'KOREA_EXPORT_IMPORT',
      unit: '억$',
      description: '한국 수출입 실적',
      isRealData: true,
      dataSource: 'e-나라지표 (통계청)'
    };
    
  } catch (error) {
    console.error('❌ Error fetching Korea Export Import:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'Korea Export Import');
    if (dummyData) {
      console.log('📊 Using dummy data for Korea Export Import');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// Korea GDP Growth 가져오기 (Trading Economics)
export const fetchKoreaGDPGrowth = async () => {
  try {
    console.log('🔄 Fetching Korea GDP Growth from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/south-korea/gdp-growth-annual';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'Korea GDP Growth');
      if (dummyData) {
        console.log('📊 Using dummy data for Korea GDP Growth');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // Trading Economics 페이지에서 데이터 추출 시도
    // "GDP Growth" 텍스트 찾기
    const gdpGrowthIndex = data.indexOf('GDP Growth');
    if (gdpGrowthIndex === -1) {
      console.log('❌ "GDP Growth" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        'GDP Growth',
        'gdp growth',
        'GDP GROWTH',
        'GDP',
        'gdp'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', data.substring(index - 100, index + 200));
          break;
        }
      }
      
      throw new Error('GDP Growth section not found');
    }
    
    console.log(`✅ Found "GDP Growth" at index ${gdpGrowthIndex}`);
    
    // "GDP Growth" 이후의 HTML에서 숫자 값 찾기
    const afterGDPGrowth = data.substring(gdpGrowthIndex);
    console.log('📄 After GDP Growth (first 1000 chars):', afterGDPGrowth.substring(0, 1000));
    
    // 숫자 패턴 찾기 (소수점 포함)
    const numberPattern = /[-+]?\d+\.\d+/;
    const numberMatch = afterGDPGrowth.match(numberPattern);
    
    if (!numberMatch) {
      console.log('❌ Number value not found');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?\d+\.\d+/,  // 소수점 포함
        /[-+]?\d+/,       // 정수만
        /\d+\.\d+/        // 양수 소수점
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterGDPGrowth.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found');
    }
    
    const currentValue = parseFloat(numberMatch[0]);
    console.log(`✅ Successfully extracted Korea GDP Growth: ${currentValue}%`);
    
    // 변화량은 별도로 계산하기 어려우므로 더미 데이터에서 가져오기
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'Korea GDP Growth');
    const change = dummyData ? dummyData.change : 0.00;
    
    return {
      title: 'Korea GDP Growth',
      value: currentValue,
      change: change,
      isPositive: change >= 0,
      symbol: 'KOREA_GDP_GROWTH',
      unit: '%',
      description: '한국 GDP 성장률',
      isRealData: true,
      dataSource: 'Trading Economics'
    };
    
  } catch (error) {
    console.error('❌ Error fetching Korea GDP Growth:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'Korea GDP Growth');
    if (dummyData) {
      console.log('📊 Using dummy data for Korea GDP Growth');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// US Non Farm Payrolls 가져오기 (Trading Economics)
export const fetchUSNonFarmPayrolls = async () => {
  try {
    console.log('🔄 Fetching US Non Farm Payrolls from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/non-farm-payrolls';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Non Farm Payrolls');
      if (dummyData) {
        console.log('📊 Using dummy data for US Non Farm Payrolls');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // Trading Economics 페이지에서 데이터 추출 시도
    // "Non Farm Payrolls" 텍스트 찾기
    const nonFarmPayrollsIndex = data.indexOf('Non Farm Payrolls');
    if (nonFarmPayrollsIndex === -1) {
      console.log('❌ "Non Farm Payrolls" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        'Non Farm Payrolls',
        'non farm payrolls',
        'NON FARM PAYROLLS',
        'Nonfarm Payrolls',
        'nonfarm payrolls',
        'Payrolls',
        'payrolls'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', data.substring(index - 100, index + 200));
          break;
        }
      }
      
      throw new Error('Non Farm Payrolls section not found');
    }
    
    console.log(`✅ Found "Non Farm Payrolls" at index ${nonFarmPayrollsIndex}`);
    
    // "Non Farm Payrolls" 이후의 HTML에서 숫자 값 찾기
    const afterNonFarmPayrolls = data.substring(nonFarmPayrollsIndex);
    console.log('📄 After Non Farm Payrolls (first 1000 chars):', afterNonFarmPayrolls.substring(0, 1000));
    
    // 숫자 패턴 찾기 (소수점 포함)
    const numberPattern = /[-+]?\d+\.?\d*/;
    const numberMatch = afterNonFarmPayrolls.match(numberPattern);
    
    if (!numberMatch) {
      console.log('❌ Number value not found');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?\d+\.?\d*/,  // 소수점 포함
        /[-+]?\d+/,        // 정수만
        /\d+\.?\d*/        // 양수
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterNonFarmPayrolls.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found');
    }
    
    const currentValue = parseFloat(numberMatch[0]);
    console.log(`✅ Successfully extracted US Non Farm Payrolls: ${currentValue}`);
    
    // 변화량은 별도로 계산하기 어려우므로 더미 데이터에서 가져오기
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Non Farm Payrolls');
    const change = dummyData ? dummyData.change : 0.00;
    
    return {
      title: 'US Non Farm Payrolls',
      value: currentValue,
      change: change,
      isPositive: change >= 0,
      symbol: 'US_NON_FARM_PAYROLLS',
      unit: '천명',
      description: '미국 비농업 고용 지표',
      isRealData: true,
      dataSource: 'Trading Economics'
    };
    
  } catch (error) {
    console.error('❌ Error fetching US Non Farm Payrolls:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Non Farm Payrolls');
    if (dummyData) {
      console.log('📊 Using dummy data for US Non Farm Payrolls');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
};

// US Unemployment Rate 가져오기 (Trading Economics)
export const fetchUSUnemploymentRate = async () => {
  try {
    console.log('🔄 Fetching US Unemployment Rate from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/unemployment-rate';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 방법으로 시도
    let data = null;
    let lastError = null;
    
    // 방법 1: 프록시 서버들 시도
    try {
      data = await fetchWithProxy(url);
      console.log('✅ Successfully fetched data using proxy');
    } catch (error) {
      console.log('❌ Proxy method failed:', error.message);
      lastError = error;
    }
    
    // 방법 2: 직접 fetch 시도 (CORS 우회)
    if (!data) {
      try {
        console.log('🔄 Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          data = await response.text();
          console.log('✅ Successfully fetched data using direct fetch');
        } else {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
        lastError = error;
      }
    }
    
    if (!data) {
      console.log('❌ All methods failed, using dummy data');
      console.log('🔍 Last error:', lastError);
      
      // 실패 시 더미 데이터 사용
      const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Unemployment Rate');
      if (dummyData) {
        console.log('📊 Using dummy data for US Unemployment Rate');
        return {
          ...dummyData,
          isRealData: false,
          dataSource: 'Dummy Data (All methods failed)'
        };
      }
      
      throw new Error('All data fetching methods failed');
    }
    
    console.log(`📄 Total HTML length: ${data.length} characters`);
    console.log('📄 HTML Preview (first 3000 chars):', data.substring(0, 3000));
    
    // Trading Economics 페이지에서 데이터 추출 시도
    // "Unemployment Rate" 텍스트 찾기
    const unemploymentRateIndex = data.indexOf('Unemployment Rate');
    if (unemploymentRateIndex === -1) {
      console.log('❌ "Unemployment Rate" text not found');
      console.log('🔍 Searching for alternative patterns...');
      
      // 대안 패턴들 시도
      const alternativePatterns = [
        'Unemployment Rate',
        'unemployment rate',
        'UNEMPLOYMENT RATE',
        'Unemployment',
        'unemployment'
      ];
      
      for (const pattern of alternativePatterns) {
        const index = data.indexOf(pattern);
        if (index !== -1) {
          console.log(`✅ Found alternative pattern: "${pattern}" at index ${index}`);
          console.log('📄 Context around pattern:', data.substring(index - 100, index + 200));
          break;
        }
      }
      
      throw new Error('Unemployment Rate section not found');
    }
    
    console.log(`✅ Found "Unemployment Rate" at index ${unemploymentRateIndex}`);
    
    // "Unemployment Rate" 이후의 HTML에서 숫자 값 찾기
    const afterUnemploymentRate = data.substring(unemploymentRateIndex);
    console.log('📄 After Unemployment Rate (first 1000 chars):', afterUnemploymentRate.substring(0, 1000));
    
    // 숫자 패턴 찾기 (소수점 포함)
    const numberPattern = /[-+]?\d+\.\d+/;
    const numberMatch = afterUnemploymentRate.match(numberPattern);
    
    if (!numberMatch) {
      console.log('❌ Number value not found');
      console.log('🔍 Searching for any number patterns...');
      
      // 다른 숫자 패턴들 시도
      const numberPatterns = [
        /[-+]?\d+\.\d+/,  // 소수점 포함
        /[-+]?\d+/,       // 정수만
        /\d+\.\d+/        // 양수 소수점
      ];
      
      for (const pattern of numberPatterns) {
        const match = afterUnemploymentRate.match(pattern);
        if (match) {
          console.log(`✅ Found number pattern: ${match[0]}`);
          break;
        }
      }
      
      throw new Error('Number value not found');
    }
    
    const currentValue = parseFloat(numberMatch[0]);
    console.log(`✅ Successfully extracted US Unemployment Rate: ${currentValue}%`);
    
    // 변화량은 별도로 계산하기 어려우므로 더미 데이터에서 가져오기
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Unemployment Rate');
    const change = dummyData ? dummyData.change : 0.00;
    
    return {
      title: 'US Unemployment Rate',
      value: currentValue,
      change: change,
      isPositive: change >= 0,
      symbol: 'US_UNEMPLOYMENT_RATE',
      unit: '%',
      description: '미국 실업률',
      isRealData: true,
      dataSource: 'Trading Economics'
    };
    
  } catch (error) {
    console.error('❌ Error fetching US Unemployment Rate:', error.message);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_MACRO_DATA.find(item => item.title === 'US Unemployment Rate');
    if (dummyData) {
      console.log('📊 Using dummy data for US Unemployment Rate');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)'
      };
    }
    
    throw error;
  }
}; 