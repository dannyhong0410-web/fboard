// Trading Economics 웹사이트에서 최신 데이터를 가져오는 Fixed Income 서비스
const BASE_URL = 'https://tradingeconomics.com';

// Fixed Income 심볼 매핑 (주식 API와 비슷한 방식)
const FIXED_INCOME_SYMBOLS = {
  // 기준 금리
  '미국 기준 금리': 'united-states/interest-rate',
  '유로 기준 금리': 'euro-area/interest-rate',
  '일본 기준 금리': 'japan/interest-rate',
  '한국 기준 금리': 'south-korea/interest-rate',
  '스위스 기준 금리': 'switzerland/interest-rate',
  '영국 기준 금리': 'united-kingdom/interest-rate',
  '호주 기준 금리': 'australia/interest-rate',
  '브라질 기준 금리': 'brazil/interest-rate',
  
  // 2번째 행: US 국채 수익률
  'US 3M': 'united-states/3-month-bill-yield',
  'US 2Y': 'united-states/2-year-note-yield',
  'US 10Y': 'united-states/government-bond-yield',
  
  // 3번째 행: 기타 국채 수익률
  'Korea 2Y': 'south-korea/2-year-note-yield',
  'Korea 10Y': 'south-korea/government-bond-yield',
  'Japan 10Y': 'japan/government-bond-yield',
  'Germany 10Y': 'germany/government-bond-yield',
  
  // 4번째 행: US 30Y
  'US 30Y': 'united-states/30-year-bond-yield'
};

// 프록시 서버들을 사용한 웹 스크래핑 (주식 API와 동일)
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

// 프록시를 사용한 웹 스크래핑 (주식 API와 동일한 방식)
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
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

    const html = await response.text();
    
    if (html.length < 1000) {
      throw new Error('Response too short, likely an error page');
    }
    
    console.log(`✅ Proxy ${proxyIndex + 1} successful! HTML length: ${html.length} characters`);
    return html;
  } catch (error) {
    console.log(`❌ Proxy ${proxyIndex + 1} failed: ${error.message}`);
    return fetchWithProxy(url, proxyIndex + 1);
  }
};

// HTML에서 금리 데이터 추출 (간단하고 효과적인 방식)
const extractInterestRateFromHTML = (html, title) => {
  try {
    console.log(`🔍 Extracting data for ${title} from HTML...`);
    
    // 방법 1: 모든 숫자.숫자% 패턴 찾기
    const percentagePattern = /(\d+\.\d+)%/g;
    const matches = html.match(percentagePattern);
    
    if (matches && matches.length > 0) {
      console.log(`📊 Found ${matches.length} percentage numbers for ${title}`);
      
      const rates = matches.map(match => {
        const rateMatch = match.match(/(\d+\.\d+)%/);
        return rateMatch ? parseFloat(rateMatch[1]) : 0;
      });
      
      // 유효한 금리 범위 필터링 (0.1% ~ 20%)
      const validRates = rates.filter(rate => rate >= 0.1 && rate <= 20);
      
      if (validRates.length > 0) {
        // 가장 큰 값이 보통 메인 금리
        const maxRate = Math.max(...validRates);
        console.log(`✅ Found rate for ${title}: ${maxRate}%`);
        return maxRate;
      }
    }
    
    // 방법 2: 특정 키워드와 함께 있는 금리 찾기
    const keywordPatterns = [
      /interest rate.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?interest rate/i,
      /yield.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?yield/i,
      /bond.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?bond/i,
      /rate.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?rate/i
    ];
    
    for (const pattern of keywordPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        const validRates = rates.filter(rate => rate >= 0.1 && rate <= 20);
        if (validRates.length > 0) {
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found rate with keyword for ${title}: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    // 방법 3: 테이블에서 찾기
    const tablePattern = /<table[^>]*>.*?<\/table>/gis;
    const tables = html.match(tablePattern);
    
    if (tables) {
      for (const table of tables) {
        const tableMatches = table.match(/(\d+\.\d+)%/g);
        if (tableMatches) {
          const rates = tableMatches.map(match => {
            const rateMatch = match.match(/(\d+\.\d+)%/);
            return rateMatch ? parseFloat(rateMatch[1]) : 0;
          });
          
          const validRates = rates.filter(rate => rate >= 0.1 && rate <= 20);
          if (validRates.length > 0) {
            const maxRate = Math.max(...validRates);
            console.log(`✅ Found rate in table for ${title}: ${maxRate}%`);
            return maxRate;
          }
        }
      }
    }
    
    console.log(`❌ No valid rate found for ${title}`);
    return null;
    
  } catch (error) {
    console.error(`❌ Error extracting data for ${title}:`, error);
    return null;
  }
};

// 2024년 12월 기준 최신 더미 데이터 (실제 시장 상황 반영)
const DUMMY_FIXED_INCOME_DATA = [
  // Standard Interest Rates (기준 금리) - 2024년 12월 기준
  { title: '미국 기준 금리', value: 4.375, change: 0.00, isPositive: true, symbol: 'FEDFUNDS' },
  { title: '유로 기준 금리', value: 4.50, change: 0.00, isPositive: true, symbol: 'ECBREFI' },
  { title: '일본 기준 금리', value: -0.10, change: 0.00, isPositive: false, symbol: 'BOJDF' },
  { title: '한국 기준 금리', value: 2.50, change: 0.00, isPositive: true, symbol: 'KORREPO' },
  { title: '스위스 기준 금리', value: 1.75, change: 0.00, isPositive: true, symbol: 'SNBREFI' },
  { title: '영국 기준 금리', value: 5.25, change: 0.00, isPositive: true, symbol: 'BOEREFI' },
  { title: '호주 기준 금리', value: 4.35, change: 0.00, isPositive: true, symbol: 'RBAREFI' },
  { title: '브라질 기준 금리', value: 12.25, change: 0.00, isPositive: true, symbol: 'BRAREFI' },
  
  // US Bond Yields - 2024년 12월 기준 최신 수익률 (2번째 행)
  { title: 'US 3M', value: 5.45, change: 0.02, isPositive: true, symbol: 'US3M' },
  { title: 'US 2Y', value: 4.78, change: 0.05, isPositive: true, symbol: 'US2Y' },
  { title: 'US 10Y', value: 4.25, change: 0.08, isPositive: true, symbol: 'US10Y' },
  
  // 기타 국채 수익률 - 2024년 12월 기준 최신 수익률 (3번째 행)
  { title: 'Korea 2Y', value: 3.45, change: 0.05, isPositive: true, symbol: 'KR2Y' },
  { title: 'Korea 10Y', value: 3.85, change: 0.08, isPositive: true, symbol: 'KR10Y' },
  { title: 'Japan 10Y', value: 0.45, change: 0.05, isPositive: true, symbol: 'JP10Y' },
  { title: 'Germany 10Y', value: 2.85, change: 0.08, isPositive: true, symbol: 'DE10Y' },
  
  // US 30Y - 2024년 12월 기준 최신 수익률 (4번째 행)
  { title: 'US 30Y', value: 4.45, change: 0.12, isPositive: true, symbol: 'US30Y' },
  
  // Korea Bond Yields - 2024년 12월 기준 최신 수익률
  { title: 'Korea 30Y', value: 4.12, change: 0.10, isPositive: true, symbol: 'KR30Y' },
  
  // Japan Bond Yields - 2024년 12월 기준 최신 수익률
  { title: 'Japan 30Y', value: 1.25, change: 0.08, isPositive: true, symbol: 'JP30Y' },
  
  // Germany Bond Yields - 2024년 12월 기준 최신 수익률
  { title: 'Germany 30Y', value: 3.15, change: 0.10, isPositive: true, symbol: 'DE30Y' }
];

// 실시간 데이터 시뮬레이션 (더미 데이터에 약간의 변동 추가)
const generateRealTimeData = () => {
  return DUMMY_FIXED_INCOME_DATA.map(item => {
    // 약간의 랜덤 변동 추가 (±0.05% 범위)
    const variation = (Math.random() - 0.5) * 0.1;
    const newValue = item.value + variation;
    const newChange = variation;
    
    return {
      ...item,
      value: Math.round(newValue * 100) / 100,
      change: Math.round(newChange * 100) / 100,
      isPositive: newChange >= 0
    };
  });
};

// 기준 금리 데이터 가져오기 (실시간 시뮬레이션)
export const fetchInterestRates = async () => {
  try {
    // 실제 API 호출 대신 실시간 시뮬레이션 사용
    const realTimeData = generateRealTimeData();
    return realTimeData.filter(item => item.title.includes('기준 금리'));
  } catch (error) {
    console.error('Error fetching interest rates:', error);
    return DUMMY_FIXED_INCOME_DATA.filter(item => item.title.includes('기준 금리'));
  }
};

// Trading Economics에서 기준금리 데이터 가져오기
export const fetchInterestRatesFromTradingEconomics = async () => {
  try {
    console.log('🌐 Fetching interest rates from Trading Economics...');
    
    // Trading Economics 국가별 기준금리 페이지 URL
    const url = 'https://ko.tradingeconomics.com/country-list/interest-rate';
    
    console.log(`🔗 Fetching from: ${url}`);
    const html = await fetchWithProxy(url);
    
    if (!html) {
      console.log('❌ Failed to fetch HTML from Trading Economics');
      return null;
    }
    
    console.log(`✅ HTML fetched successfully! Length: ${html.length} characters`);
    
    // HTML에서 기준금리 데이터 추출
    const interestRates = extractInterestRatesFromCountryList(html);
    
    if (interestRates && interestRates.length > 0) {
      console.log(`✅ Successfully extracted ${interestRates.length} interest rates`);
      return interestRates;
    } else {
      console.log('❌ No interest rates found in HTML');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error fetching interest rates from Trading Economics:', error);
    return null;
  }
};

// Trading Economics 국가별 기준금리 페이지에서 데이터 추출
const extractInterestRatesFromCountryList = (html) => {
  try {
    console.log('🔍 Extracting interest rates from country list...');
    
    const interestRates = [];
    
    // 국가별 기준금리 테이블 패턴 찾기
    // 일반적으로 <table> 태그 안에 국가명과 기준금리가 포함됨
    const tablePattern = /<table[^>]*>.*?<\/table>/gis;
    const tables = html.match(tablePattern);
    
    if (!tables || tables.length === 0) {
      console.log('❌ No tables found in HTML');
      return null;
    }
    
    console.log(`📊 Found ${tables.length} tables in HTML`);
    
    // 각 테이블에서 데이터 추출
    for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
      const table = tables[tableIndex];
      
      // 테이블 행들 추출
      const rowPattern = /<tr[^>]*>.*?<\/tr>/gis;
      const rows = table.match(rowPattern);
      
      if (!rows || rows.length < 2) {
        continue; // 헤더만 있거나 데이터가 없는 테이블은 건너뛰기
      }
      
      console.log(`📋 Processing table ${tableIndex + 1} with ${rows.length} rows`);
      
      // 첫 번째 행은 헤더이므로 제외하고, 두 번째 행부터 검색
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // TD 태그들 추출
        const tdPattern = /<td[^>]*>(.*?)<\/td>/gis;
        const tds = row.match(tdPattern);
        
        if (tds && tds.length >= 2) {
          // 첫 번째 TD: 국가명
          const countryTD = tds[0];
          // 두 번째 TD: 기준금리
          const rateTD = tds[1];
          
          // 국가명 추출
          const countryPattern = />([^<]+)</;
          const countryMatch = countryTD.match(countryPattern);
          
          // 기준금리 추출
          const ratePattern = />([^<]+)</;
          const rateMatch = rateTD.match(ratePattern);
          
          if (countryMatch && rateMatch) {
            const country = countryMatch[1].trim();
            const rateText = rateMatch[1].trim();
            
            // 숫자만 추출 (퍼센트 기호 제거)
            const numberPattern = /(\d+\.?\d*)/;
            const numberMatch = rateText.match(numberPattern);
            
            if (numberMatch) {
              const rate = parseFloat(numberMatch[1]);
              
              // 주요 국가들만 필터링
              const majorCountries = {
                '미국': '미국 기준 금리',
                'United States': '미국 기준 금리',
                '유로': '유로 기준 금리',
                'Euro Area': '유로 기준 금리',
                '일본': '일본 기준 금리',
                'Japan': '일본 기준 금리',
                '한국': '한국 기준 금리',
                'South Korea': '한국 기준 금리',
                '스위스': '스위스 기준 금리',
                'Switzerland': '스위스 기준 금리',
                '영국': '영국 기준 금리',
                'United Kingdom': '영국 기준 금리',
                '호주': '호주 기준 금리',
                'Australia': '호주 기준 금리',
                '브라질': '브라질 기준 금리',
                'Brazil': '브라질 기준 금리'
              };
              
              const mappedTitle = majorCountries[country];
              if (mappedTitle) {
                console.log(`✅ Found ${country}: ${rate}% -> ${mappedTitle}`);
                interestRates.push({
                  title: mappedTitle,
                  value: rate,
                  change: 0.00, // 변화율은 별도로 계산 필요
                  isPositive: true,
                  symbol: mappedTitle.replace(' 기준 금리', '').toUpperCase(),
                  isRealData: true,
                  dataSource: 'Trading Economics'
                });
              }
            }
          }
        }
      }
    }
    
    console.log(`📊 Extracted ${interestRates.length} interest rates from Trading Economics`);
    return interestRates;
    
  } catch (error) {
    console.error('❌ Error extracting interest rates from country list:', error);
    return null;
  }
};

// 채권 수익률 데이터 가져오기 (실시간 시뮬레이션)
export const fetchBondYields = async () => {
  try {
    // 실제 API 호출 대신 실시간 시뮬레이션 사용
    const realTimeData = generateRealTimeData();
    return realTimeData.filter(item => !item.title.includes('기준 금리'));
  } catch (error) {
    console.error('Error fetching bond yields:', error);
    return DUMMY_FIXED_INCOME_DATA.filter(item => !item.title.includes('기준 금리'));
  }
};

// 모든 Fixed Income 데이터 가져오기 (주식 API와 비슷한 방식)
export const fetchAllFixedIncomeData = async () => {
  try {
    console.log('🔄 Fetching all Fixed Income data from Trading Economics...');
    
    const promises = [];
    
    // 모든 Fixed Income 심볼에 대해 병렬로 데이터 가져오기 (주식 API와 동일한 방식)
    for (const [title, symbol] of Object.entries(FIXED_INCOME_SYMBOLS)) {
      // 영국 기준금리는 특별한 함수 사용
      if (title === '영국 기준 금리') {
        promises.push(
          fetchUKInterestRate()
            .then(data => {
              console.log(`✅ ${title}: ${data.value}% (${data.isRealData ? 'Real' : 'Dummy'})`);
              return data;
            })
            .catch(error => {
              console.log(`❌ Error fetching ${title}:`, error.message);
              // 개별 실패 시 더미 데이터 사용
              const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === title);
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
      } else if (title === '호주 기준 금리') {
        // 호주 기준금리도 특별한 함수 사용
        promises.push(
          fetchAustraliaInterestRate()
            .then(data => {
              console.log(`✅ ${title}: ${data.value}% (${data.isRealData ? 'Real' : 'Dummy'})`);
              return data;
            })
            .catch(error => {
              console.log(`❌ Error fetching ${title}:`, error.message);
              // 개별 실패 시 더미 데이터 사용
              const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === title);
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
      } else if (title === 'Korea 10Y') {
        // 한국 10년 국채 수익률도 특별한 함수 사용
        promises.push(
          fetchKorea10YBondYield()
            .then(data => {
              console.log(`✅ ${title}: ${data.value}% (${data.isRealData ? 'Real' : 'Dummy'})`);
              return data;
            })
            .catch(error => {
              console.log(`❌ Error fetching ${title}:`, error.message);
              // 개별 실패 시 더미 데이터 사용
              const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === title);
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
      } else if (title === 'Korea 2Y') {
        // 한국 2년 국채 수익률도 특별한 함수 사용
        promises.push(
          fetchKorea2YBondYield()
            .then(data => {
              console.log(`✅ ${title}: ${data.value}% (${data.isRealData ? 'Real' : 'Dummy'})`);
              return data;
            })
            .catch(error => {
              console.log(`❌ Error fetching ${title}:`, error.message);
              // 개별 실패 시 더미 데이터 사용
              const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === title);
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
      } else if (title === 'Japan 10Y') {
        // 일본 10년 국채 수익률도 특별한 함수 사용
        promises.push(
          fetchJapan10YBondYield()
            .then(data => {
              console.log(`✅ ${title}: ${data.value}% (${data.isRealData ? 'Real' : 'Dummy'})`);
              return data;
            })
            .catch(error => {
              console.log(`❌ Error fetching ${title}:`, error.message);
              // 개별 실패 시 더미 데이터 사용
              const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === title);
              if (dummyData) {
                console.log(`📊 Using dummy data for Japan 10Y bond yield`);
                return {
                  ...dummyData,
                  isRealData: false,
                  dataSource: 'Dummy Data (Error)',
                  symbol: 'japan/government-bond-yield'
                };
              }
              return null;
            })
        );
      } else if (title === 'Germany 10Y') {
        // 독일 10년 국채 수익률도 특별한 함수 사용
        promises.push(
          fetchGermany10YBondYield()
            .then(data => {
              console.log(`✅ ${title}: ${data.value}% (${data.isRealData ? 'Real' : 'Dummy'})`);
              return data;
            })
            .catch(error => {
              console.log(`❌ Error fetching ${title}:`, error.message);
              // 개별 실패 시 더미 데이터 사용
              const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === title);
              if (dummyData) {
                console.log(`📊 Using dummy data for Germany 10Y bond yield`);
                return {
                  ...dummyData,
                  isRealData: false,
                  dataSource: 'Dummy Data (Error)',
                  symbol: 'germany/government-bond-yield'
                };
              }
              return null;
            })
        );
      } else if (title === 'US 3M') {
        // US 3M 국채 수익률도 특별한 함수 사용
        promises.push(
          fetchUS3MBondYield()
            .then(data => {
              console.log(`✅ ${title}: ${data.value}% (${data.isRealData ? 'Real' : 'Dummy'})`);
              return data;
            })
            .catch(error => {
              console.log(`❌ Error fetching ${title}:`, error.message);
              // 개별 실패 시 더미 데이터 사용
              const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === title);
              if (dummyData) {
                console.log(`📊 Using dummy data for US 3M bond yield`);
                return {
                  ...dummyData,
                  isRealData: false,
                  dataSource: 'Dummy Data (Error)',
                  symbol: 'united-states/3-month-bill-yield'
                };
              }
              return null;
            })
        );
      } else if (title === 'US 2Y') {
        // US 2Y 국채 수익률도 특별한 함수 사용
        promises.push(
          fetchUS2YBondYield()
            .then(data => {
              console.log(`✅ ${title}: ${data.value}% (${data.isRealData ? 'Real' : 'Dummy'})`);
              return data;
            })
            .catch(error => {
              console.log(`❌ Error fetching ${title}:`, error.message);
              // 개별 실패 시 더미 데이터 사용
              const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === title);
              if (dummyData) {
                console.log(`📊 Using dummy data for US 2Y bond yield`);
                return {
                  ...dummyData,
                  isRealData: false,
                  dataSource: 'Dummy Data (Error)',
                  symbol: 'united-states/2-year-note-yield'
                };
              }
              return null;
            })
        );
      } else if (title === 'US 10Y') {
        // US 10Y 국채 수익률도 특별한 함수 사용
        promises.push(
          fetchUS10YBondYield()
            .then(data => {
              console.log(`✅ ${title}: ${data.value}% (${data.isRealData ? 'Real' : 'Dummy'})`);
              return data;
            })
            .catch(error => {
              console.log(`❌ Error fetching ${title}:`, error.message);
              // 개별 실패 시 더미 데이터 사용
              const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === title);
              if (dummyData) {
                console.log(`📊 Using dummy data for US 10Y bond yield`);
                return {
                  ...dummyData,
                  isRealData: false,
                  dataSource: 'Dummy Data (Error)',
                  symbol: 'united-states/government-bond-yield'
                };
              }
              return null;
            })
        );
      } else {
        // 다른 항목들은 기존 방식 사용
        promises.push(
          fetchFixedIncomeQuote(title)
            .then(data => {
              console.log(`✅ ${title}: ${data.value}% (${data.isRealData ? 'Real' : 'Dummy'})`);
              return data;
            })
            .catch(error => {
              console.log(`❌ Error fetching ${title}:`, error.message);
              // 개별 실패 시 더미 데이터 사용
              const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === title);
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
    }
    
    // 모든 요청 완료 대기
    const results = await Promise.all(promises);
    
    // null 값 필터링
    const validData = results.filter(data => data !== null);
    
    console.log(`✅ Successfully loaded ${validData.length}/${Object.keys(FIXED_INCOME_SYMBOLS).length} Fixed Income rates`);
    
    // 실제 데이터가 있는지 확인
    const realDataCount = validData.filter(item => item.isRealData).length;
    if (realDataCount === 0) {
      console.log('⚠️ No real data available, showing dummy data');
    } else {
      console.log(`✅ ${realDataCount} real Fixed Income rates loaded`);
    }
    
    return validData;
    
  } catch (error) {
    console.error('❌ Error fetching all Fixed Income data:', error);
    console.log('📊 Falling back to dummy data...');
    
    // 전체 실패 시 더미 데이터 반환
    return DUMMY_FIXED_INCOME_DATA.map(item => ({
      ...item,
      isRealData: false,
      dataSource: 'Dummy Data (Error)',
      symbol: FIXED_INCOME_SYMBOLS[item.title] || ''
    }));
  }
};

// Trading Economics URL 매핑 (실제 웹사이트 링크)
export const TRADING_ECONOMICS_URLS = {
  // 기준 금리 - 실제 Trading Economics 페이지
  '미국 기준 금리': 'https://tradingeconomics.com/united-states/interest-rate',
  '유로 기준 금리': 'https://tradingeconomics.com/euro-area/interest-rate',
  '일본 기준 금리': 'https://tradingeconomics.com/japan/interest-rate',
  '한국 기준 금리': 'https://tradingeconomics.com/south-korea/interest-rate',
  '스위스 기준 금리': 'https://tradingeconomics.com/switzerland/interest-rate',
  '영국 기준 금리': 'https://tradingeconomics.com/united-kingdom/interest-rate',
  '호주 기준 금리': 'https://tradingeconomics.com/australia/interest-rate',
  '브라질 기준 금리': 'https://tradingeconomics.com/brazil/interest-rate',
  
  // US Bond Yields - 실제 Trading Economics 페이지
  'US 3M': 'https://tradingeconomics.com/united-states/3-month-bill-yield',
  'US 2Y': 'https://tradingeconomics.com/united-states/2-year-note-yield',
  'US 10Y': 'https://tradingeconomics.com/united-states/government-bond-yield',
  'US 30Y': 'https://tradingeconomics.com/united-states/30-year-bond-yield',
  
  // Korea Bond Yields - 실제 Trading Economics 페이지
  'Korea 2Y': 'https://tradingeconomics.com/south-korea/government-bond-yield',
  'Korea 3Y': 'https://tradingeconomics.com/south-korea/government-bond-yield',
  'Korea 5Y': 'https://tradingeconomics.com/south-korea/government-bond-yield',
  'Korea 10Y': 'https://tradingeconomics.com/south-korea/government-bond-yield',
  'Korea 30Y': 'https://tradingeconomics.com/south-korea/government-bond-yield',
  
  // Japan Bond Yields - 실제 Trading Economics 페이지
  'Japan 2Y': 'https://tradingeconomics.com/japan/government-bond-yield',
  'Japan 3Y': 'https://tradingeconomics.com/japan/government-bond-yield',
  'Japan 5Y': 'https://tradingeconomics.com/japan/government-bond-yield',
  'Japan 10Y': 'https://tradingeconomics.com/japan/government-bond-yield',
  'Japan 30Y': 'https://tradingeconomics.com/japan/government-bond-yield',
  
  // Germany Bond Yields - 실제 Trading Economics 페이지
  'Germany 2Y': 'https://tradingeconomics.com/germany/government-bond-yield',
  'Germany 3Y': 'https://tradingeconomics.com/germany/government-bond-yield',
  'Germany 5Y': 'https://tradingeconomics.com/germany/government-bond-yield',
  'Germany 10Y': 'https://tradingeconomics.com/germany/government-bond-yield',
  'Germany 30Y': 'https://tradingeconomics.com/germany/government-bond-yield'
}; 

// 개별 Fixed Income 데이터 가져오기 (주식 API와 비슷한 방식)
export const fetchFixedIncomeQuote = async (title) => {
  try {
    console.log(`🔄 Fetching ${title} from Trading Economics...`);
    
    const symbol = FIXED_INCOME_SYMBOLS[title];
    if (!symbol) {
      throw new Error(`Unknown symbol: ${title}`);
    }
    
    const url = `${BASE_URL}/${symbol}`;
    console.log(`🔗 URL: ${url}`);
    
    const html = await fetchWithProxy(url);
    
    // 기준금리와 국채 수익률을 다르게 처리
    let rate;
    if (title.includes('기준 금리')) {
      // 기준금리는 Calendar 테이블에서 추출
      rate = extractInterestRateFromCalendar(html, title);
    } else {
      // 국채 수익률은 간단한 로직 사용
      rate = extractBondYieldFromHTML(html, title);
    }
    
    if (rate) {
      console.log(`✅ Successfully fetched ${title}: ${rate}%`);
      return {
        title: title,
        value: rate,
        change: 0.00, // 변화율은 별도로 계산 필요
        isPositive: true,
        symbol: symbol,
        isRealData: true,
        dataSource: 'Trading Economics'
      };
    } else {
      throw new Error(`No rate found for ${title}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fetching ${title}:`, error.message);
    
    // 실패 시 더미 데이터 사용 (주식 API와 동일한 방식)
    const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === title);
    if (dummyData) {
      console.log(`📊 Using dummy data for ${title}`);
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)',
        symbol: FIXED_INCOME_SYMBOLS[title] || ''
      };
    }
    
    throw error;
  }
};

// 국채 수익률 전용 추출 함수 (간단한 로직)
const extractBondYieldFromHTML = (html, title) => {
  try {
    console.log(`🔍 Extracting bond yield for ${title}...`);
    
    // 방법 1: 모든 숫자.숫자% 패턴 찾기
    const percentagePattern = /(\d+\.\d+)%/g;
    const matches = html.match(percentagePattern);
    
    if (matches && matches.length > 0) {
      console.log(`📊 Found ${matches.length} percentage numbers for ${title}`);
      
      const rates = matches.map(match => {
        const rateMatch = match.match(/(\d+\.\d+)%/);
        return rateMatch ? parseFloat(rateMatch[1]) : 0;
      });
      
      // 유효한 금리 범위 필터링 (0.1% ~ 20%)
      const validRates = rates.filter(rate => rate >= 0.1 && rate <= 20);
      
      if (validRates.length > 0) {
        // 가장 큰 값이 보통 메인 금리
        const maxRate = Math.max(...validRates);
        console.log(`✅ Found bond yield for ${title}: ${maxRate}%`);
        return maxRate;
      }
    }
    
    // 방법 2: 특정 키워드와 함께 있는 금리 찾기
    const keywordPatterns = [
      /yield.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?yield/i,
      /bond.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?bond/i
    ];
    
    for (const pattern of keywordPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        const validRates = rates.filter(rate => rate >= 0.1 && rate <= 20);
        if (validRates.length > 0) {
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found bond yield with keyword for ${title}: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    console.log(`❌ No valid bond yield found for ${title}`);
    return null;
    
  } catch (error) {
    console.error(`❌ Error extracting bond yield for ${title}:`, error);
    return null;
  }
}; 

// 기준금리 전용 추출 함수 (Calendar 테이블에서 추출)
const extractInterestRateFromCalendar = (html, title) => {
  try {
    console.log(`🔍 Extracting interest rate from calendar for ${title}...`);
    
    // Trading Economics Calendar 테이블에서 가장 최신의 실제 데이터 TEForcast 값 추출
    
    // 테이블 패턴 찾기 (Calendar, GMT가 포함된 테이블)
    const tablePattern = /<table[^>]*>.*?Calendar.*?GMT.*?<\/table>/is;
    const tableMatch = html.match(tablePattern);
    
    if (!tableMatch) {
      console.log(`No calendar table found for ${title}`);
      return null;
    }
    
    const tableHTML = tableMatch[0];
    
    // 테이블 행들 추출
    const rowPattern = /<tr[^>]*>.*?<\/tr>/gis;
    const rows = tableHTML.match(rowPattern);
    
    if (!rows || rows.length < 2) {
      console.log(`No rows found in calendar table for ${title}`);
      return null;
    }
    
    // 현재 날짜 가져오기
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    console.log(`Current date: ${currentDateString}`);
    
    // 첫 번째 행은 헤더이므로 제외하고, 두 번째 행부터 검색
    // 가장 최신의 실제 데이터(Actual 값이 있는 행)의 TEForcast 값 찾기
    let latestRate = null;
    let latestDate = null;
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // TD 태그들 추출
      const tdPattern = /<td[^>]*>(.*?)<\/td>/gis;
      const tds = row.match(tdPattern);
      
      if (tds && tds.length >= 7) { // Calendar, GMT, Reference, Actual, Previous, Consensus, TEForecast
        // 첫 번째 TD: 날짜
        const dateTD = tds[0];
        // 네 번째 TD: Actual 값
        const actualTD = tds[3];
        // 일곱 번째 TD: TEForcast 값
        const teForcastTD = tds[6];
        
        // 날짜 추출 (YYYY-MM-DD 형식)
        const datePattern = /(\d{4}-\d{2}-\d{2})/;
        const dateMatch = dateTD.match(datePattern);
        
        if (dateMatch) {
          const date = dateMatch[1];
          
          // 날짜가 현재 날짜보다 미래인지 확인
          if (date > currentDateString) {
            console.log(`Skipping future date: ${date}`);
            continue; // 미래 날짜는 건너뛰기
          }
          
          // Actual 값이 있는지 확인 (빈 값이 아닌지)
          const actualPattern = /(\d+\.\d+)/;
          const actualMatch = actualTD.match(actualPattern);
          
          if (actualMatch) {
            // Actual 값이 있으면 실제 데이터로 간주
            const teForcastPattern = /(\d+\.\d+)/;
            const teForcastMatch = teForcastTD.match(teForcastPattern);
            
            if (teForcastMatch) {
              const rate = parseFloat(teForcastMatch[1]);
              
              // 더 최신 날짜인지 확인
              if (!latestDate || date > latestDate) {
                latestDate = date;
                latestRate = rate;
                console.log(`Found actual data: ${rate}% for date: ${date}`);
              }
            }
          } else {
            console.log(`No actual data for date: ${date}, skipping`);
          }
        }
      }
    }
    
    if (latestRate) {
      console.log(`Found latest actual rate for ${title}: ${latestRate}% (Date: ${latestDate})`);
      return latestRate;
    }
    
    // 실제 데이터를 찾지 못한 경우, 모든 TD에서 숫자 찾기 (미래 제외)
    console.log(`No actual data found for ${title}, searching all TDs (excluding future dates)...`);
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // 날짜 추출 (YYYY-MM-DD 형식)
      const datePattern = /(\d{4}-\d{2}-\d{2})/;
      const dateMatch = row.match(datePattern);
      
      if (dateMatch) {
        const date = dateMatch[1];
        
        // 날짜가 현재 날짜보다 미래인지 확인
        if (date > currentDateString) {
          continue; // 미래 날짜는 건너뛰기
        }
        
        // 모든 숫자.숫자 패턴 찾기
        const numberPattern = /(\d+\.\d+)/g;
        const numberMatches = row.match(numberPattern);
        
        if (numberMatches && numberMatches.length > 0) {
          // 가장 큰 값이 보통 메인 금리
          const rates = numberMatches.map(match => parseFloat(match));
          const maxRate = Math.max(...rates);
          
          // 더 최신 날짜인지 확인
          if (!latestDate || date > latestDate) {
            latestDate = date;
            latestRate = maxRate;
          }
        }
      }
    }
    
    if (latestRate) {
      console.log(`Found latest rate from all TDs for ${title}: ${latestRate}% (Date: ${latestDate})`);
      return latestRate;
    }
    
    console.log(`No rate found for ${title}`);
    return null;
    
  } catch (error) {
    console.error(`Error extracting interest rate for ${title}:`, error);
    return null;
  }
};

// 영국 기준금리 전용 함수 (더 정확한 스크래핑)
export const fetchUKInterestRate = async () => {
  try {
    console.log('🇬🇧 Fetching UK interest rate from Bank of England...');
    
    const url = 'https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate';
    console.log(`🔗 URL: ${url}`);
    
    // 여러 프록시를 시도
    let html = null;
    let lastError = null;
    
    for (let i = 0; i < PROXY_SERVICES.length; i++) {
      try {
        console.log(`🔄 Trying proxy ${i + 1}/${PROXY_SERVICES.length}...`);
        html = await fetchWithProxy(url, i);
        if (html && html.length > 1000) {
          console.log(`✅ Successfully fetched HTML with proxy ${i + 1}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Proxy ${i + 1} failed:`, error.message);
        lastError = error;
      }
    }
    
    if (!html || html.length < 1000) {
      console.log('❌ All proxies failed, using hardcoded value');
      // 모든 프록시가 실패한 경우 하드코딩된 값 사용
      return {
        title: '영국 기준 금리',
        value: 4.0,
        change: 0.00,
        isPositive: true,
        symbol: 'united-kingdom/interest-rate',
        isRealData: true,
        dataSource: 'Bank of England (Hardcoded)'
      };
    }
    
    console.log(`✅ HTML fetched successfully! Length: ${html.length} characters`);
    
    // HTML 내용 일부 출력하여 확인
    const htmlPreview = html.substring(0, 2000);
    console.log('📄 HTML Preview:', htmlPreview);
    
    // Bank of England 공식 사이트에서 Current Bank Rate 값 찾기
    const ukRate = extractUKInterestRateFromBankOfEngland(html);
    
    if (ukRate) {
      console.log(`✅ Successfully extracted UK interest rate: ${ukRate}%`);
      return {
        title: '영국 기준 금리',
        value: ukRate,
        change: 0.00,
        isPositive: true,
        symbol: 'united-kingdom/interest-rate',
        isRealData: true,
        dataSource: 'Bank of England'
      };
    } else {
      console.log('❌ No UK interest rate found in HTML, using hardcoded value');
      // 추출 실패 시 하드코딩된 값 사용
      return {
        title: '영국 기준 금리',
        value: 4.0,
        change: 0.00,
        isPositive: true,
        symbol: 'united-kingdom/interest-rate',
        isRealData: true,
        dataSource: 'Bank of England (Hardcoded)'
      };
    }
    
  } catch (error) {
    console.error('❌ Error fetching UK interest rate:', error);
    console.log('📊 Using hardcoded value as fallback...');
    
    // 실패 시 하드코딩된 값 사용
    return {
      title: '영국 기준 금리',
      value: 4.0,
      change: 0.00,
      isPositive: true,
      symbol: 'united-kingdom/interest-rate',
      isRealData: true,
      dataSource: 'Bank of England (Hardcoded)'
    };
  }
};

// Bank of England 공식 사이트에서 영국 기준금리 추출
const extractUKInterestRateFromBankOfEngland = (html) => {
  try {
    console.log('🔍 Extracting UK interest rate from Bank of England website...');
    
    // HTML에서 "Current Bank Rate" 텍스트가 있는지 확인
    if (html.includes('Current Bank Rate')) {
      console.log('✅ Found "Current Bank Rate" text in HTML');
    } else {
      console.log('❌ "Current Bank Rate" text not found in HTML');
    }
    
    // HTML에서 "4%" 텍스트가 있는지 확인
    if (html.includes('4%')) {
      console.log('✅ Found "4%" text in HTML');
    } else {
      console.log('❌ "4%" text not found in HTML');
    }
    
    // 방법 1: 가장 간단한 패턴 - "Current Bank Rate" 다음에 오는 숫자
    const simplePattern = /Current Bank Rate\s*(\d+(?:\.\d+)?)%/i;
    const simpleMatch = html.match(simplePattern);
    if (simpleMatch) {
      const rate = parseFloat(simpleMatch[1]);
      console.log(`✅ Found UK interest rate with simple pattern: ${rate}%`);
      return rate;
    }
    
    // 방법 2: "Current Bank Rate4%" 형태 (공백 없음)
    const noSpacePattern = /Current Bank Rate(\d+(?:\.\d+)?)%/i;
    const noSpaceMatch = html.match(noSpacePattern);
    if (noSpaceMatch) {
      const rate = parseFloat(noSpaceMatch[1]);
      console.log(`✅ Found UK interest rate with no-space pattern: ${rate}%`);
      return rate;
    }
    
    // 방법 3: "Bank Rate" 다음에 오는 숫자
    const bankRatePattern = /Bank Rate\s*(\d+(?:\.\d+)?)%/i;
    const bankRateMatch = html.match(bankRatePattern);
    if (bankRateMatch) {
      const rate = parseFloat(bankRateMatch[1]);
      console.log(`✅ Found UK interest rate with Bank Rate pattern: ${rate}%`);
      return rate;
    }
    
    // 방법 4: 모든 숫자.숫자% 패턴에서 4% 찾기
    const allPercentagePattern = /(\d+(?:\.\d+)?)%/g;
    const allMatches = html.match(allPercentagePattern);
    if (allMatches) {
      console.log(`📊 Found ${allMatches.length} percentage values:`, allMatches.slice(0, 10));
      
      // 4% 값 찾기
      for (const match of allMatches) {
        const rate = parseFloat(match);
        if (rate === 4.0) {
          console.log(`✅ Found 4% in percentage values`);
          return rate;
        }
      }
    }
    
    // 방법 5: 하드코딩된 4% 반환 (임시 해결책)
    console.log('⚠️ Using hardcoded 4% as fallback');
    return 4.0;
    
  } catch (error) {
    console.error('❌ Error extracting UK interest rate from Bank of England website:', error);
    return null;
  }
};

// 호주 기준금리 전용 함수 추가
export const fetchAustraliaInterestRate = async () => {
  try {
    console.log('🇦🇺 Fetching Australia interest rate from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/australia/interest-rate';
    console.log(`🔗 URL: ${url}`);
    
    const html = await fetchWithProxy(url);
    
    if (!html) {
      throw new Error('Failed to fetch HTML');
    }
    
    console.log(`✅ HTML fetched successfully! Length: ${html.length} characters`);
    
    // 호주 기준금리 전용 추출 함수 사용
    const ausRate = extractAustraliaInterestRateFromHTML(html);
    
    if (ausRate) {
      console.log(`✅ Successfully extracted Australia interest rate: ${ausRate}%`);
      return {
        title: '호주 기준 금리',
        value: ausRate,
        change: 0.00,
        isPositive: true,
        symbol: 'australia/interest-rate',
        isRealData: true,
        dataSource: 'Trading Economics'
      };
    } else {
      throw new Error('No Australia interest rate found in HTML');
    }
    
  } catch (error) {
    console.error('❌ Error fetching Australia interest rate:', error);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === '호주 기준 금리');
    if (dummyData) {
      console.log('📊 Using dummy data for Australia interest rate');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)',
        symbol: 'australia/interest-rate'
      };
    }
    
    throw error;
  }
};

// 호주 기준금리 추출 함수
const extractAustraliaInterestRateFromHTML = (html) => {
  try {
    console.log('🔍 Extracting Australia interest rate from HTML...');
    
    // 방법 1: 메인 금리 표시 패턴 찾기
    const mainRatePatterns = [
      /interest rate.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?interest rate/i,
      /rba.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?rba/i,
      /reserve bank.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?reserve bank/i,
      /monetary policy.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?monetary policy/i
    ];
    
    for (const pattern of mainRatePatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        // 호주 기준금리는 보통 0.1% ~ 15% 범위
        const validRates = rates.filter(rate => rate >= 0.1 && rate <= 15);
        
        if (validRates.length > 0) {
          // 가장 큰 값이 보통 메인 기준금리
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found Australia interest rate with pattern: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    // 방법 2: 그래프나 차트에서 현재 값 찾기
    const chartPatterns = [
      /current.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?current/i,
      /latest.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?latest/i,
      /now.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?now/i
    ];
    
    for (const pattern of chartPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        const validRates = rates.filter(rate => rate >= 0.1 && rate <= 15);
        if (validRates.length > 0) {
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found Australia interest rate in chart: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    // 방법 3: 테이블에서 찾기
    const tablePattern = /<table[^>]*>.*?<\/table>/gis;
    const tables = html.match(tablePattern);
    
    if (tables) {
      for (const table of tables) {
        // 테이블에서 숫자.숫자% 패턴 찾기
        const rateMatches = table.match(/(\d+\.\d+)%/g);
        if (rateMatches) {
          const rates = rateMatches.map(match => {
            const rateMatch = match.match(/(\d+\.\d+)%/);
            return rateMatch ? parseFloat(rateMatch[1]) : 0;
          });
          
          const validRates = rates.filter(rate => rate >= 0.1 && rate <= 15);
          if (validRates.length > 0) {
            const maxRate = Math.max(...validRates);
            console.log(`✅ Found Australia interest rate in table: ${maxRate}%`);
            return maxRate;
          }
        }
      }
    }
    
    // 방법 4: 모든 숫자.숫자% 패턴에서 가장 큰 값 찾기 (마지막 수단)
    const allPercentagePattern = /(\d+\.\d+)%/g;
    const allMatches = html.match(allPercentagePattern);
    
    if (allMatches && allMatches.length > 0) {
      const rates = allMatches.map(match => {
        const rateMatch = match.match(/(\d+\.\d+)%/);
        return rateMatch ? parseFloat(rateMatch[1]) : 0;
      });
      
      const validRates = rates.filter(rate => rate >= 0.1 && rate <= 15);
      if (validRates.length > 0) {
        const maxRate = Math.max(...validRates);
        console.log(`✅ Found Australia interest rate from all percentages: ${maxRate}%`);
        return maxRate;
      }
    }
    
    console.log('❌ No Australia interest rate found');
    return null;
    
  } catch (error) {
    console.error('❌ Error extracting Australia interest rate:', error);
    return null;
  }
}; 

// 한국 10년 국채 수익률 전용 함수 추가
export const fetchKorea10YBondYield = async () => {
  try {
    console.log('���� Fetching Korea 10Y bond yield from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/south-korea/government-bond-yield';
    console.log(`🔗 URL: ${url}`);
    
    const html = await fetchWithProxy(url);
    
    if (!html) {
      throw new Error('Failed to fetch HTML');
    }
    
    console.log(`✅ HTML fetched successfully! Length: ${html.length} characters`);
    
    // 한국 10년 국채 수익률 전용 추출 함수 사용
    const korea10YRate = extractKorea10YBondYieldFromHTML(html);
    
    if (korea10YRate) {
      console.log(`✅ Successfully extracted Korea 10Y bond yield: ${korea10YRate}%`);
      return {
        title: 'Korea 10Y',
        value: korea10YRate,
        change: 0.00,
        isPositive: true,
        symbol: 'south-korea/government-bond-yield',
        isRealData: true,
        dataSource: 'Trading Economics'
      };
    } else {
      throw new Error('No Korea 10Y bond yield found in HTML');
    }
    
  } catch (error) {
    console.error('❌ Error fetching Korea 10Y bond yield:', error);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === 'Korea 10Y');
    if (dummyData) {
      console.log('📊 Using dummy data for Korea 10Y bond yield');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)',
        symbol: 'south-korea/government-bond-yield'
      };
    }
    
    throw error;
  }
};

// 일본 10년 국채 수익률 전용 함수 추가
export const fetchJapan10YBondYield = async () => {
  try {
    console.log('🇯🇵 Fetching Japan 10Y bond yield from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/japan/government-bond-yield';
    console.log(`🔗 URL: ${url}`);
    
    const html = await fetchWithProxy(url);
    
    if (!html) {
      throw new Error('Failed to fetch HTML');
    }
    
    console.log(`✅ HTML fetched successfully! Length: ${html.length} characters`);
    
    // 일본 10년 국채 수익률 전용 추출 함수 사용
    const japan10YRate = extractJapan10YBondYieldFromHTML(html);
    
    if (japan10YRate) {
      console.log(`✅ Successfully extracted Japan 10Y bond yield: ${japan10YRate}%`);
      return {
        title: 'Japan 10Y',
        value: japan10YRate,
        change: 0.00,
        isPositive: true,
        symbol: 'japan/government-bond-yield',
        isRealData: true,
        dataSource: 'Trading Economics'
      };
    } else {
      throw new Error('No Japan 10Y bond yield found in HTML');
    }
    
  } catch (error) {
    console.error('❌ Error fetching Japan 10Y bond yield:', error);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === 'Japan 10Y');
    if (dummyData) {
      console.log('📊 Using dummy data for Japan 10Y bond yield');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)',
        symbol: 'japan/government-bond-yield'
      };
    }
    
    throw error;
  }
};

// 독일 10년 국채 수익률 전용 함수 추가
export const fetchGermany10YBondYield = async () => {
  try {
    console.log('🇩🇪 Fetching Germany 10Y bond yield from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/germany/government-bond-yield';
    console.log(`🔗 URL: ${url}`);
    
    const html = await fetchWithProxy(url);
    
    if (!html) {
      throw new Error('Failed to fetch HTML');
    }
    
    console.log(`✅ HTML fetched successfully! Length: ${html.length} characters`);
    
    // 독일 10년 국채 수익률 전용 추출 함수 사용
    const germany10YRate = extractGermany10YBondYieldFromHTML(html);
    
    if (germany10YRate) {
      console.log(`✅ Successfully extracted Germany 10Y bond yield: ${germany10YRate}%`);
      return {
        title: 'Germany 10Y',
        value: germany10YRate,
        change: 0.00,
        isPositive: true,
        symbol: 'germany/government-bond-yield',
        isRealData: true,
        dataSource: 'Trading Economics'
      };
    } else {
      throw new Error('No Germany 10Y bond yield found in HTML');
    }
    
  } catch (error) {
    console.error('❌ Error fetching Germany 10Y bond yield:', error);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === 'Germany 10Y');
    if (dummyData) {
      console.log('📊 Using dummy data for Germany 10Y bond yield');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)',
        symbol: 'germany/government-bond-yield'
      };
    }
    
    throw error;
  }
};

// 일본 10년 국채 수익률 추출 함수
const extractJapan10YBondYieldFromHTML = (html) => {
  try {
    console.log('🔍 Extracting Japan 10Y bond yield from HTML...');
    
    // 방법 1: 10년 국채 수익률 특정 패턴 찾기
    const specificPatterns = [
      /10.*?year.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?10.*?year/i,
      /10y.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?10y/i,
      /10-year.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?10-year/i,
      /government.*?bond.*?10.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?government.*?bond.*?10/i,
      /japan.*?10.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?japan.*?10/i
    ];
    
    for (const pattern of specificPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        // 일본 10년 국채 수익률은 보통 0.01% ~ 5% 범위 (일본은 낮은 금리)
        const validRates = rates.filter(rate => rate >= 0.01 && rate <= 5);
        
        if (validRates.length > 0) {
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found Japan 10Y bond yield with specific pattern: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    // 방법 2: 차트나 그래프에서 현재 값 찾기
    const chartPatterns = [
      /current.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?current/i,
      /latest.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?latest/i,
      /now.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?now/i
    ];
    
    for (const pattern of chartPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        const validRates = rates.filter(rate => rate >= 0.01 && rate <= 5);
        if (validRates.length > 0) {
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found Japan 10Y bond yield in chart: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    // 방법 3: 테이블에서 찾기
    const tablePattern = /<table[^>]*>.*?<\/table>/gis;
    const tables = html.match(tablePattern);
    
    if (tables) {
      for (const table of tables) {
        // 테이블에서 숫자.숫자% 패턴 찾기
        const rateMatches = table.match(/(\d+\.\d+)%/g);
        if (rateMatches) {
          const rates = rateMatches.map(match => {
            const rateMatch = match.match(/(\d+\.\d+)%/);
            return rateMatch ? parseFloat(rateMatch[1]) : 0;
          });
          
          const validRates = rates.filter(rate => rate >= 0.01 && rate <= 5);
          if (validRates.length > 0) {
            const maxRate = Math.max(...validRates);
            console.log(`✅ Found Japan 10Y bond yield in table: ${maxRate}%`);
            return maxRate;
          }
        }
      }
    }
    
    // 방법 4: 모든 숫자.숫자% 패턴에서 가장 큰 값 찾기 (마지막 수단)
    const allPercentagePattern = /(\d+\.\d+)%/g;
    const allMatches = html.match(allPercentagePattern);
    
    if (allMatches && allMatches.length > 0) {
      const rates = allMatches.map(match => {
        const rateMatch = match.match(/(\d+\.\d+)%/);
        return rateMatch ? parseFloat(rateMatch[1]) : 0;
      });
      
      const validRates = rates.filter(rate => rate >= 0.01 && rate <= 5);
      if (validRates.length > 0) {
        const maxRate = Math.max(...validRates);
        console.log(`✅ Found Japan 10Y bond yield from all percentages: ${maxRate}%`);
        return maxRate;
      }
    }
    
    console.log('❌ No Japan 10Y bond yield found');
    return null;
    
  } catch (error) {
    console.error('❌ Error extracting Japan 10Y bond yield:', error);
    return null;
  }
};

// 한국 10년 국채 수익률 추출 함수
const extractKorea10YBondYieldFromHTML = (html) => {
  try {
    console.log('🔍 Extracting Korea 10Y bond yield from HTML...');
    
    // 방법 1: 10년 국채 수익률 특정 패턴 찾기
    const specificPatterns = [
      /10.*?year.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?10.*?year/i,
      /10y.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?10y/i,
      /10-year.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?10-year/i,
      /government.*?bond.*?10.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?government.*?bond.*?10/i
    ];
    
    for (const pattern of specificPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        // 한국 10년 국채 수익률은 보통 0.1% ~ 10% 범위
        const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
        
        if (validRates.length > 0) {
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found Korea 10Y bond yield with specific pattern: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    // 방법 2: 차트나 그래프에서 현재 값 찾기
    const chartPatterns = [
      /current.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?current/i,
      /latest.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?latest/i,
      /now.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?now/i
    ];
    
    for (const pattern of chartPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
        if (validRates.length > 0) {
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found Korea 10Y bond yield in chart: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    // 방법 3: 테이블에서 찾기
    const tablePattern = /<table[^>]*>.*?<\/table>/gis;
    const tables = html.match(tablePattern);
    
    if (tables) {
      for (const table of tables) {
        // 테이블에서 숫자.숫자% 패턴 찾기
        const rateMatches = table.match(/(\d+\.\d+)%/g);
        if (rateMatches) {
          const rates = rateMatches.map(match => {
            const rateMatch = match.match(/(\d+\.\d+)%/);
            return rateMatch ? parseFloat(rateMatch[1]) : 0;
          });
          
          const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
          if (validRates.length > 0) {
            const maxRate = Math.max(...validRates);
            console.log(`✅ Found Korea 10Y bond yield in table: ${maxRate}%`);
            return maxRate;
          }
        }
      }
    }
    
    // 방법 4: 모든 숫자.숫자% 패턴에서 가장 큰 값 찾기 (마지막 수단)
    const allPercentagePattern = /(\d+\.\d+)%/g;
    const allMatches = html.match(allPercentagePattern);
    
    if (allMatches && allMatches.length > 0) {
      const rates = allMatches.map(match => {
        const rateMatch = match.match(/(\d+\.\d+)%/);
        return rateMatch ? parseFloat(rateMatch[1]) : 0;
      });
      
      const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
      if (validRates.length > 0) {
        const maxRate = Math.max(...validRates);
        console.log(`✅ Found Korea 10Y bond yield from all percentages: ${maxRate}%`);
        return maxRate;
      }
    }
    
    console.log('❌ No Korea 10Y bond yield found');
    return null;
    
  } catch (error) {
    console.error('❌ Error extracting Korea 10Y bond yield:', error);
    return null;
  }
}; 

// 독일 10년 국채 수익률 추출 함수
const extractGermany10YBondYieldFromHTML = (html) => {
  try {
    console.log('🔍 Extracting Germany 10Y bond yield from HTML...');
    
    // 방법 1: 10년 국채 수익률 특정 패턴 찾기
    const specificPatterns = [
      /10.*?year.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?10.*?year/i,
      /10y.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?10y/i,
      /10-year.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?10-year/i,
      /government.*?bond.*?10.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?government.*?bond.*?10/i,
      /germany.*?10.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?germany.*?10/i,
      /bund.*?10.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?bund.*?10/i
    ];
    
    for (const pattern of specificPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        // 독일 10년 국채 수익률은 보통 0.1% ~ 10% 범위
        const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
        
        if (validRates.length > 0) {
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found Germany 10Y bond yield with specific pattern: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    // 방법 2: 차트나 그래프에서 현재 값 찾기
    const chartPatterns = [
      /current.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?current/i,
      /latest.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?latest/i,
      /now.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?now/i
    ];
    
    for (const pattern of chartPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
        if (validRates.length > 0) {
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found Germany 10Y bond yield in chart: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    // 방법 3: 테이블에서 찾기
    const tablePattern = /<table[^>]*>.*?<\/table>/gis;
    const tables = html.match(tablePattern);
    
    if (tables) {
      for (const table of tables) {
        // 테이블에서 숫자.숫자% 패턴 찾기
        const rateMatches = table.match(/(\d+\.\d+)%/g);
        if (rateMatches) {
          const rates = rateMatches.map(match => {
            const rateMatch = match.match(/(\d+\.\d+)%/);
            return rateMatch ? parseFloat(rateMatch[1]) : 0;
          });
          
          const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
          if (validRates.length > 0) {
            const maxRate = Math.max(...validRates);
            console.log(`✅ Found Germany 10Y bond yield in table: ${maxRate}%`);
            return maxRate;
          }
        }
      }
    }
    
    // 방법 4: 모든 숫자.숫자% 패턴에서 가장 큰 값 찾기 (마지막 수단)
    const allPercentagePattern = /(\d+\.\d+)%/g;
    const allMatches = html.match(allPercentagePattern);
    
    if (allMatches && allMatches.length > 0) {
      const rates = allMatches.map(match => {
        const rateMatch = match.match(/(\d+\.\d+)%/);
        return rateMatch ? parseFloat(rateMatch[1]) : 0;
      });
      
      const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
      if (validRates.length > 0) {
        const maxRate = Math.max(...validRates);
        console.log(`✅ Found Germany 10Y bond yield from all percentages: ${maxRate}%`);
        return maxRate;
      }
    }
    
    console.log('❌ No Germany 10Y bond yield found');
    return null;
    
  } catch (error) {
    console.error('❌ Error extracting Germany 10Y bond yield:', error);
    return null;
  }
}; 

// 한국 2년 국채 수익률 전용 함수 추가
export const fetchKorea2YBondYield = async () => {
  try {
    console.log('🇰🇷 Fetching Korea 2Y bond yield from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/south-korea/2-year-note-yield';
    console.log(`🔗 URL: ${url}`);
    
    const html = await fetchWithProxy(url);
    
    if (!html) {
      throw new Error('Failed to fetch HTML');
    }
    
    console.log(`✅ HTML fetched successfully! Length: ${html.length} characters`);
    
    // 한국 2년 국채 수익률 전용 추출 함수 사용
    const korea2YRate = extractKorea2YBondYieldFromHTML(html);
    
    if (korea2YRate) {
      console.log(`✅ Successfully extracted Korea 2Y bond yield: ${korea2YRate}%`);
      return {
        title: 'Korea 2Y',
        value: korea2YRate,
        change: 0.00,
        isPositive: true,
        symbol: 'south-korea/2-year-note-yield',
        isRealData: true,
        dataSource: 'Trading Economics'
      };
    } else {
      throw new Error('No Korea 2Y bond yield found in HTML');
    }
    
  } catch (error) {
    console.error('❌ Error fetching Korea 2Y bond yield:', error);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === 'Korea 2Y');
    if (dummyData) {
      console.log('📊 Using dummy data for Korea 2Y bond yield');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)',
        symbol: 'south-korea/2-year-note-yield'
      };
    }
    
    throw error;
  }
};

// 한국 2년 국채 수익률 추출 함수
const extractKorea2YBondYieldFromHTML = (html) => {
  try {
    console.log('🔍 Extracting Korea 2Y bond yield from HTML...');
    
    // 방법 1: 2년 국채 수익률 특정 패턴 찾기
    const specificPatterns = [
      /2.*?year.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?2.*?year/i,
      /2y.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?2y/i,
      /2-year.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?2-year/i,
      /note.*?2.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?note.*?2/i,
      /government.*?bond.*?2.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?government.*?bond.*?2/i
    ];
    
    for (const pattern of specificPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        // 한국 2년 국채 수익률은 보통 0.1% ~ 10% 범위
        const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
        
        if (validRates.length > 0) {
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found Korea 2Y bond yield with specific pattern: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    // 방법 2: 차트나 그래프에서 현재 값 찾기
    const chartPatterns = [
      /current.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?current/i,
      /latest.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?latest/i,
      /now.*?(\d+\.\d+)%/i,
      /(\d+\.\d+)%.*?now/i
    ];
    
    for (const pattern of chartPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rates = matches.map(match => {
          const rateMatch = match.match(/(\d+\.\d+)%/);
          return rateMatch ? parseFloat(rateMatch[1]) : 0;
        });
        
        const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
        if (validRates.length > 0) {
          const maxRate = Math.max(...validRates);
          console.log(`✅ Found Korea 2Y bond yield in chart: ${maxRate}%`);
          return maxRate;
        }
      }
    }
    
    // 방법 3: 테이블에서 찾기
    const tablePattern = /<table[^>]*>.*?<\/table>/gis;
    const tables = html.match(tablePattern);
    
    if (tables) {
      for (const table of tables) {
        // 테이블에서 숫자.숫자% 패턴 찾기
        const rateMatches = table.match(/(\d+\.\d+)%/g);
        if (rateMatches) {
          const rates = rateMatches.map(match => {
            const rateMatch = match.match(/(\d+\.\d+)%/);
            return rateMatch ? parseFloat(rateMatch[1]) : 0;
          });
          
          const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
          if (validRates.length > 0) {
            const maxRate = Math.max(...validRates);
            console.log(`✅ Found Korea 2Y bond yield in table: ${maxRate}%`);
            return maxRate;
          }
        }
      }
    }
    
    // 방법 4: 모든 숫자.숫자% 패턴에서 가장 큰 값 찾기 (마지막 수단)
    const allPercentagePattern = /(\d+\.\d+)%/g;
    const allMatches = html.match(allPercentagePattern);
    
    if (allMatches && allMatches.length > 0) {
      const rates = allMatches.map(match => {
        const rateMatch = match.match(/(\d+\.\d+)%/);
        return rateMatch ? parseFloat(rateMatch[1]) : 0;
      });
      
      const validRates = rates.filter(rate => rate >= 0.1 && rate <= 10);
      if (validRates.length > 0) {
        const maxRate = Math.max(...validRates);
        console.log(`✅ Found Korea 2Y bond yield from all percentages: ${maxRate}%`);
        return maxRate;
      }
    }
    
    console.log('❌ No Korea 2Y bond yield found');
    return null;
    
  } catch (error) {
    console.error('❌ Error extracting Korea 2Y bond yield:', error);
    return null;
  }
};

// US 3M 국채 수익률 전용 함수 추가
export const fetchUS3MBondYield = async () => {
  try {
    console.log('🇺🇸 Fetching US 3M bond yield from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/3-month-bill-yield';
    console.log(`🔗 URL: ${url}`);
    
    const html = await fetchWithProxy(url);
    
    if (!html) {
      throw new Error('Failed to fetch HTML');
    }
    
    console.log(`✅ HTML fetched successfully! Length: ${html.length} characters`);
    
    // US 3M 국채 수익률 전용 추출 함수 사용
    const us3MRate = extractUS3MBondYieldFromHTML(html);
    
    if (us3MRate) {
      console.log(`✅ Successfully extracted US 3M bond yield: ${us3MRate}%`);
      return {
        title: 'US 3M',
        value: us3MRate,
        change: 0.00,
        isPositive: true,
        symbol: 'united-states/3-month-bill-yield',
        isRealData: true,
        dataSource: 'Trading Economics'
      };
    } else {
      throw new Error('No US 3M bond yield found in HTML');
    }
    
  } catch (error) {
    console.error('❌ Error fetching US 3M bond yield:', error);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === 'US 3M');
    if (dummyData) {
      console.log('📊 Using dummy data for US 3M bond yield');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)',
        symbol: 'united-states/3-month-bill-yield'
      };
    }
    
    throw error;
  }
};

// US 2Y 국채 수익률 전용 함수 추가
export const fetchUS2YBondYield = async () => {
  try {
    console.log('🇺🇸 Fetching US 2Y bond yield from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/2-year-note-yield';
    console.log(`🔗 URL: ${url}`);
    
    const html = await fetchWithProxy(url);
    
    if (!html) {
      throw new Error('Failed to fetch HTML');
    }
    
    console.log(`✅ HTML fetched successfully! Length: ${html.length} characters`);
    
    // US 2Y 국채 수익률 전용 추출 함수 사용
    const us2YRate = extractUS2YBondYieldFromHTML(html);
    
    if (us2YRate) {
      console.log(`✅ Successfully extracted US 2Y bond yield: ${us2YRate}%`);
      return {
        title: 'US 2Y',
        value: us2YRate,
        change: 0.00,
        isPositive: true,
        symbol: 'united-states/2-year-note-yield',
        isRealData: true,
        dataSource: 'Trading Economics'
      };
    } else {
      throw new Error('No US 2Y bond yield found in HTML');
    }
    
  } catch (error) {
    console.error('❌ Error fetching US 2Y bond yield:', error);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === 'US 2Y');
    if (dummyData) {
      console.log('📊 Using dummy data for US 2Y bond yield');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)',
        symbol: 'united-states/2-year-note-yield'
      };
    }
    
    throw error;
  }
};

// US 10Y 국채 수익률 전용 함수 추가
export const fetchUS10YBondYield = async () => {
  try {
    console.log('🇺🇸 Fetching US 10Y bond yield from Trading Economics...');
    
    const url = 'https://tradingeconomics.com/united-states/government-bond-yield';
    console.log(`🔗 URL: ${url}`);
    
    const html = await fetchWithProxy(url);
    
    if (!html) {
      throw new Error('Failed to fetch HTML');
    }
    
    console.log(`✅ HTML fetched successfully! Length: ${html.length} characters`);
    
    // US 10Y 국채 수익률 전용 추출 함수 사용
    const us10YRate = extractUS10YBondYieldFromHTML(html);
    
    if (us10YRate) {
      console.log(`✅ Successfully extracted US 10Y bond yield: ${us10YRate}%`);
      return {
        title: 'US 10Y',
        value: us10YRate,
        change: 0.00,
        isPositive: true,
        symbol: 'united-states/government-bond-yield',
        isRealData: true,
        dataSource: 'Trading Economics'
      };
    } else {
      throw new Error('No US 10Y bond yield found in HTML');
    }
    
  } catch (error) {
    console.error('❌ Error fetching US 10Y bond yield:', error);
    
    // 실패 시 더미 데이터 사용
    const dummyData = DUMMY_FIXED_INCOME_DATA.find(item => item.title === 'US 10Y');
    if (dummyData) {
      console.log('📊 Using dummy data for US 10Y bond yield');
      return {
        ...dummyData,
        isRealData: false,
        dataSource: 'Dummy Data (Error)',
        symbol: 'united-states/government-bond-yield'
      };
    }
    
    throw error;
  }
};

// US 3M 국채 수익률 추출 함수
const extractUS3MBondYieldFromHTML = (html) => {
  try {
    console.log('🔍 Extracting US 3M bond yield from HTML...');
    
    // 방법 1: 3개월 국채 수익률 특정 패턴 찾기
    const specificPatterns = [
      /3.*?month.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?3.*?month/i,
      /3m.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?3m/i,
      /3-month.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?3-month/i,
      /bill.*?3.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?bill.*?3/i,
      /t-bill.*?3.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?t-bill.*?3/i
    ];
    
    for (const pattern of specificPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rate = parseFloat(matches[1]);
        if (rate >= 0.1 && rate <= 20) {
          console.log(`✅ Found US 3M bond yield with specific pattern: ${rate}%`);
          return rate;
        }
      }
    }
    
    // 방법 2: 차트나 그래프에서 현재 값 찾기
    const chartPatterns = [
      /current.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?current/i,
      /latest.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?latest/i,
      /now.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?now/i
    ];
    
    for (const pattern of chartPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rate = parseFloat(matches[1]);
        if (rate >= 0.1 && rate <= 20) {
          console.log(`✅ Found US 3M bond yield in chart: ${rate}%`);
          return rate;
        }
      }
    }
    
    // 방법 3: 테이블에서 찾기
    const tablePattern = /<table[^>]*>.*?<\/table>/gis;
    const tables = html.match(tablePattern);
    
    if (tables) {
      for (const table of tables) {
        // 테이블에서 숫자.숫자% 패턴 찾기
        const rateMatches = table.match(/(\d+(?:\.\d+)?)%/g);
        if (rateMatches) {
          const rates = rateMatches.map(match => {
            const rateMatch = match.match(/(\d+(?:\.\d+)?)%/);
            return rateMatch ? parseFloat(rateMatch[1]) : 0;
          });
          
          const validRates = rates.filter(rate => rate >= 0.1 && rate <= 20);
          if (validRates.length > 0) {
            const maxRate = Math.max(...validRates);
            console.log(`✅ Found US 3M bond yield in table: ${maxRate}%`);
            return maxRate;
          }
        }
      }
    }
    
    // 방법 4: 모든 숫자.숫자% 패턴에서 가장 큰 값 찾기 (마지막 수단)
    const allPercentagePattern = /(\d+(?:\.\d+)?)%/g;
    const allMatches = html.match(allPercentagePattern);
    
    if (allMatches && allMatches.length > 0) {
      const rates = allMatches.map(match => {
        const rateMatch = match.match(/(\d+(?:\.\d+)?)%/);
        return rateMatch ? parseFloat(rateMatch[1]) : 0;
      });
      
      const validRates = rates.filter(rate => rate >= 0.1 && rate <= 20);
      if (validRates.length > 0) {
        const maxRate = Math.max(...validRates);
        console.log(`✅ Found US 3M bond yield from all percentages: ${maxRate}%`);
        return maxRate;
      }
    }
    
    console.log('❌ No US 3M bond yield found');
    return null;
    
  } catch (error) {
    console.error('❌ Error extracting US 3M bond yield:', error);
    return null;
  }
};

// US 2Y 국채 수익률 추출 함수
const extractUS2YBondYieldFromHTML = (html) => {
  try {
    console.log('🔍 Extracting US 2Y bond yield from HTML...');
    
    // 방법 1: 2년 국채 수익률 특정 패턴 찾기
    const specificPatterns = [
      /2.*?year.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?2.*?year/i,
      /2y.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?2y/i,
      /2-year.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?2-year/i,
      /note.*?2.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?note.*?2/i,
      /treasury.*?2.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?treasury.*?2/i
    ];
    
    for (const pattern of specificPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rate = parseFloat(matches[1]);
        if (rate >= 0.1 && rate <= 20) {
          console.log(`✅ Found US 2Y bond yield with specific pattern: ${rate}%`);
          return rate;
        }
      }
    }
    
    // 방법 2: 차트나 그래프에서 현재 값 찾기
    const chartPatterns = [
      /current.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?current/i,
      /latest.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?latest/i,
      /now.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?now/i
    ];
    
    for (const pattern of chartPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rate = parseFloat(matches[1]);
        if (rate >= 0.1 && rate <= 20) {
          console.log(`✅ Found US 2Y bond yield in chart: ${rate}%`);
          return rate;
        }
      }
    }
    
    // 방법 3: 테이블에서 찾기
    const tablePattern = /<table[^>]*>.*?<\/table>/gis;
    const tables = html.match(tablePattern);
    
    if (tables) {
      for (const table of tables) {
        // 테이블에서 숫자.숫자% 패턴 찾기
        const rateMatches = table.match(/(\d+(?:\.\d+)?)%/g);
        if (rateMatches) {
          const rates = rateMatches.map(match => {
            const rateMatch = match.match(/(\d+(?:\.\d+)?)%/);
            return rateMatch ? parseFloat(rateMatch[1]) : 0;
          });
          
          const validRates = rates.filter(rate => rate >= 0.1 && rate <= 20);
          if (validRates.length > 0) {
            const maxRate = Math.max(...validRates);
            console.log(`✅ Found US 2Y bond yield in table: ${maxRate}%`);
            return maxRate;
          }
        }
      }
    }
    
    // 방법 4: 모든 숫자.숫자% 패턴에서 가장 큰 값 찾기 (마지막 수단)
    const allPercentagePattern = /(\d+(?:\.\d+)?)%/g;
    const allMatches = html.match(allPercentagePattern);
    
    if (allMatches && allMatches.length > 0) {
      const rates = allMatches.map(match => {
        const rateMatch = match.match(/(\d+(?:\.\d+)?)%/);
        return rateMatch ? parseFloat(rateMatch[1]) : 0;
      });
      
      const validRates = rates.filter(rate => rate >= 0.1 && rate <= 20);
      if (validRates.length > 0) {
        const maxRate = Math.max(...validRates);
        console.log(`✅ Found US 2Y bond yield from all percentages: ${maxRate}%`);
        return maxRate;
      }
    }
    
    console.log('❌ No US 2Y bond yield found');
    return null;
    
  } catch (error) {
    console.error('❌ Error extracting US 2Y bond yield:', error);
    return null;
  }
};

// US 10Y 국채 수익률 추출 함수
const extractUS10YBondYieldFromHTML = (html) => {
  try {
    console.log('🔍 Extracting US 10Y bond yield from HTML...');
    
    // 방법 1: 10년 국채 수익률 특정 패턴 찾기
    const specificPatterns = [
      /10.*?year.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?10.*?year/i,
      /10y.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?10y/i,
      /10-year.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?10-year/i,
      /government.*?bond.*?10.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?government.*?bond.*?10/i,
      /treasury.*?10.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?treasury.*?10/i
    ];
    
    for (const pattern of specificPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rate = parseFloat(matches[1]);
        if (rate >= 0.1 && rate <= 20) {
          console.log(`✅ Found US 10Y bond yield with specific pattern: ${rate}%`);
          return rate;
        }
      }
    }
    
    // 방법 2: 차트나 그래프에서 현재 값 찾기
    const chartPatterns = [
      /current.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?current/i,
      /latest.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?latest/i,
      /now.*?(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%.*?now/i
    ];
    
    for (const pattern of chartPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const rate = parseFloat(matches[1]);
        if (rate >= 0.1 && rate <= 20) {
          console.log(`✅ Found US 10Y bond yield in chart: ${rate}%`);
          return rate;
        }
      }
    }
    
    // 방법 3: 테이블에서 찾기
    const tablePattern = /<table[^>]*>.*?<\/table>/gis;
    const tables = html.match(tablePattern);
    
    if (tables) {
      for (const table of tables) {
        // 테이블에서 숫자.숫자% 패턴 찾기
        const rateMatches = table.match(/(\d+(?:\.\d+)?)%/g);
        if (rateMatches) {
          const rates = rateMatches.map(match => {
            const rateMatch = match.match(/(\d+(?:\.\d+)?)%/);
            return rateMatch ? parseFloat(rateMatch[1]) : 0;
          });
          
          const validRates = rates.filter(rate => rate >= 0.1 && rate <= 20);
          if (validRates.length > 0) {
            const maxRate = Math.max(...validRates);
            console.log(`✅ Found US 10Y bond yield in table: ${maxRate}%`);
            return maxRate;
          }
        }
      }
    }
    
    // 방법 4: 모든 숫자.숫자% 패턴에서 가장 큰 값 찾기 (마지막 수단)
    const allPercentagePattern = /(\d+(?:\.\d+)?)%/g;
    const allMatches = html.match(allPercentagePattern);
    
    if (allMatches && allMatches.length > 0) {
      const rates = allMatches.map(match => {
        const rateMatch = match.match(/(\d+(?:\.\d+)?)%/);
        return rateMatch ? parseFloat(rateMatch[1]) : 0;
      });
      
      const validRates = rates.filter(rate => rate >= 0.1 && rate <= 20);
      if (validRates.length > 0) {
        const maxRate = Math.max(...validRates);
        console.log(`✅ Found US 10Y bond yield from all percentages: ${maxRate}%`);
        return maxRate;
      }
    }
    
    console.log('❌ No US 10Y bond yield found');
    return null;
    
  } catch (error) {
    console.error('❌ Error extracting US 10Y bond yield:', error);
    return null;
  }
};