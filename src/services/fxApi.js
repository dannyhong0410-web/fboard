// Yahoo Finance API를 사용한 FX 데이터 서비스

// 주요 환율 심볼 매핑
const FX_SYMBOLS = {
  'USD/KRW': 'KRW=X', // 달러/원
  'EUR/KRW': 'EURKRW=X', // 유로/원
  'JPY/KRW': 'JPYKRW=X', // 엔/원
  'CNY/KRW': 'CNYKRW=X', // 위안/원
  'GBP/KRW': 'GBPKRW=X', // 파운드/원
  'EUR/USD': 'EURUSD=X', // 유로/달러
  'USD/JPY': 'USDJPY=X', // 달러/엔
  'GBP/USD': 'GBPUSD=X', // 파운드/달러
  'USD/CNY': 'USDCNY=X', // 달러/위안
  'EUR/JPY': 'EURJPY=X', // 유로/엔
  'AUD/USD': 'AUDUSD=X', // 호주달러/달러
  'USD/CAD': 'USDCAD=X', // 달러/캐나다달러
  'USD/CHF': 'USDCHF=X', // 달러/스위스프랑
  'NZD/USD': 'NZDUSD=X', // 뉴질랜드달러/달러
  'USD/SGD': 'USDSGD=X', // 달러/싱가포르달러
  'DXY': 'DX-Y.NYB' // 달러 인덱스
};

// 현실적인 더미 FX 데이터 (2024년 12월 기준)
const DUMMY_FX_DATA = [
  { title: 'USD/KRW', value: 1345.67, change: 0.15, isPositive: true },
  { title: 'EUR/KRW', value: 1459.23, change: -0.21, isPositive: false },
  { title: 'JPY/KRW', value: 9.12, change: 0.45, isPositive: true },
  { title: 'CNY/KRW', value: 186.34, change: -0.12, isPositive: false },
  { title: 'GBP/KRW', value: 1702.45, change: 0.32, isPositive: true },
  { title: 'EUR/USD', value: 1.0856, change: -0.21, isPositive: false },
  { title: 'USD/JPY', value: 148.45, change: 0.45, isPositive: true },
  { title: 'GBP/USD', value: 1.2654, change: 0.32, isPositive: true },
  { title: 'USD/CNY', value: 7.2345, change: -0.12, isPositive: false },
  { title: 'EUR/JPY', value: 161.23, change: 0.24, isPositive: true },
  { title: 'AUD/USD', value: 0.6756, change: 0.18, isPositive: true },
  { title: 'USD/CAD', value: 1.3456, change: -0.08, isPositive: false },
  { title: 'USD/CHF', value: 0.8923, change: 0.12, isPositive: true },
  { title: 'NZD/USD', value: 0.6234, change: 0.25, isPositive: true },
  { title: 'USD/SGD', value: 1.3456, change: -0.05, isPositive: false },
  { title: 'DXY', value: 102.45, change: 0.35, isPositive: true }
];

// CORS 프록시 URL들 (주식 API와 동일한 방식)
const CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  '' // 직접 호출도 시도
];

// 프록시를 사용한 API 호출 (주식 API와 동일한 방식)
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

// Yahoo Finance API에서 환율 데이터 가져오기 (주식 API와 동일한 방식)
const fetchFXDataFromYahoo = async (symbol) => {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const response = await fetchWithProxy(url);
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No chart data available');
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    
    // 가장 최근 데이터 (주식 API와 동일한 방식)
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
      currency: meta.currency || 'USD'
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    throw error;
  }
};

// 모든 환율 데이터 가져오기 (주식 API와 동일한 방식)
export const fetchAllFXData = async () => {
  try {
    console.log('🔄 Fetching FX data from Yahoo Finance...');
    
    const promises = [];
    
    // 모든 환율 심볼에 대해 병렬로 데이터 가져오기
    for (const [name, symbol] of Object.entries(FX_SYMBOLS)) {
      promises.push(
        fetchFXDataFromYahoo(symbol)
          .then(data => {
            console.log(`✅ ${name}: ${data.price} (${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`);
            return {
              title: name,
              value: data.price,
              change: data.changePercent,
              isPositive: data.changePercent >= 0,
              symbol: symbol,
              isRealData: true,
              dataSource: 'Yahoo Finance'
            };
          })
          .catch(error => {
            console.log(`❌ Error fetching ${name}:`, error.message);
            // 개별 FX 실패 시 더미 데이터 사용
            const dummyData = DUMMY_FX_DATA.find(item => item.title === name);
            if (dummyData) {
              console.log(`📊 Using dummy data for ${name}`);
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
    
    console.log(`✅ Successfully loaded ${validData.length}/${Object.keys(FX_SYMBOLS).length} FX rates`);
    
    return validData;
    
  } catch (error) {
    console.error('❌ Error fetching FX data:', error);
    console.log('📊 Falling back to dummy data...');
    
    // 전체 실패 시 더미 데이터 반환
    return DUMMY_FX_DATA.map(item => ({
      ...item,
      isRealData: false,
      dataSource: 'Dummy Data (Error)',
      symbol: FX_SYMBOLS[item.title] || ''
    }));
  }
};

// 특정 환율 데이터 가져오기
export const fetchFXRate = async (symbol) => {
  const yahooSymbol = FX_SYMBOLS[symbol];
  if (!yahooSymbol) {
    throw new Error(`Unknown symbol: ${symbol}`);
  }
  
  return await fetchFXDataFromYahoo(yahooSymbol);
};

// Yahoo Finance URL 매핑
export const YAHOO_FINANCE_URLS = {
  'USD/KRW': 'https://finance.yahoo.com/quote/KRW=X',
  'EUR/KRW': 'https://finance.yahoo.com/quote/EURKRW=X',
  'JPY/KRW': 'https://finance.yahoo.com/quote/JPYKRW=X',
  'CNY/KRW': 'https://finance.yahoo.com/quote/CNYKRW=X',
  'GBP/KRW': 'https://finance.yahoo.com/quote/GBPKRW=X',
  'EUR/USD': 'https://finance.yahoo.com/quote/EURUSD=X',
  'USD/JPY': 'https://finance.yahoo.com/quote/USDJPY=X',
  'GBP/USD': 'https://finance.yahoo.com/quote/GBPUSD=X',
  'USD/CNY': 'https://finance.yahoo.com/quote/USDCNY=X',
  'EUR/JPY': 'https://finance.yahoo.com/quote/EURJPY=X',
  'AUD/USD': 'https://finance.yahoo.com/quote/AUDUSD=X',
  'USD/CAD': 'https://finance.yahoo.com/quote/USDCAD=X',
  'USD/CHF': 'https://finance.yahoo.com/quote/USDCHF=X',
  'NZD/USD': 'https://finance.yahoo.com/quote/NZDUSD=X',
  'USD/SGD': 'https://finance.yahoo.com/quote/USDSGD=X',
  'DXY': 'https://finance.yahoo.com/quote/DX-Y.NYB'
};

// FX vs 주식 API 비교 테스트
export const compareFXvsStockAPI = async () => {
  try {
    console.log('🔍 Comparing FX vs Stock API...');
    
    // FX 심볼 테스트
    const fxSymbol = 'KRW=X';
    const fxUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${fxSymbol}?interval=1d&range=1d`;
    
    // 주식 심볼 테스트
    const stockSymbol = '^GSPC';
    const stockUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol}?interval=1d&range=1d`;
    
    console.log(`🔗 FX URL: ${fxUrl}`);
    console.log(`🔗 Stock URL: ${stockUrl}`);
    
    // FX API 테스트
    try {
      console.log('🧪 Testing FX API...');
      const fxResponse = await fetch(fxUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`📊 FX response status: ${fxResponse.status}`);
      console.log(`📊 FX response headers:`, Object.fromEntries(fxResponse.headers.entries()));
      
      if (fxResponse.ok) {
        const fxData = await fxResponse.json();
        console.log(`📊 FX data keys:`, Object.keys(fxData));
        
        if (fxData && fxData.chart && fxData.chart.result && fxData.chart.result[0]) {
          const fxMeta = fxData.chart.result[0].meta;
          console.log(`📊 FX meta data:`, fxMeta);
          console.log(`✅ FX API works! USD/KRW: ${fxMeta.regularMarketPrice}`);
        }
      }
    } catch (fxError) {
      console.log(`❌ FX API failed:`, fxError.message);
    }
    
    // 주식 API 테스트
    try {
      console.log('🧪 Testing Stock API...');
      const stockResponse = await fetch(stockUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`📊 Stock response status: ${stockResponse.status}`);
      console.log(`📊 Stock response headers:`, Object.fromEntries(stockResponse.headers.entries()));
      
      if (stockResponse.ok) {
        const stockData = await stockResponse.json();
        console.log(`📊 Stock data keys:`, Object.keys(stockData));
        
        if (stockData && stockData.chart && stockData.chart.result && stockData.chart.result[0]) {
          const stockMeta = stockData.chart.result[0].meta;
          console.log(`📊 Stock meta data:`, stockMeta);
          console.log(`✅ Stock API works! S&P 500: ${stockMeta.regularMarketPrice}`);
        }
      }
    } catch (stockError) {
      console.log(`❌ Stock API failed:`, stockError.message);
    }
    
  } catch (error) {
    console.error(`❌ Comparison test failed:`, error);
  }
};

// Yahoo Finance API 테스트 함수
export const testYahooFinanceAPI = async () => {
  try {
    console.log('🧪 Testing Yahoo Finance API...');
    
    // 간단한 테스트: USD/KRW 환율 가져오기
    const testSymbol = 'KRW=X';
    const testUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${testSymbol}?interval=1d&range=1d`;
    
    console.log(`🔗 Testing URL: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📊 Response data keys:`, Object.keys(data));
    
    if (data && data.chart && data.chart.result && data.chart.result[0]) {
      const result = data.chart.result[0];
      const meta = result.meta;
      console.log(`📊 Meta data:`, meta);
      
      if (meta.regularMarketPrice) {
        console.log(`✅ Yahoo Finance API test successful! USD/KRW: ${meta.regularMarketPrice}`);
        return true;
      }
    }
    
    console.log(`❌ No valid data in response`);
    return false;
    
  } catch (error) {
    console.error(`❌ Yahoo Finance API test failed:`, error);
    return false;
  }
}; 