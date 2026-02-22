// Corner Spotter - Content Script
// Analyzes Bet365 pages for corner betting opportunities

(function() {
  'use strict';

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scan') {
      const signals = scanForCorners(request.config);
      sendResponse({ signals });
    }
    return true;
  });

  function scanForCorners(config) {
    const signals = [];
    
    try {
      // Get page info
      const pageInfo = getPageInfo();
      
      // Find corner markets
      const cornerMarkets = findCornerMarkets();
      
      cornerMarkets.forEach(market => {
        const probability = calculateProbability(market.odds);
        
        // Check if meets criteria
        if (probability >= (config?.minProbability || 60) &&
            market.odds >= (config?.minOdds || 1.20) &&
            market.odds <= (config?.maxOdds || 2.50)) {
          
          signals.push({
            homeTeam: pageInfo.homeTeam || market.homeTeam || 'Time Casa',
            awayTeam: pageInfo.awayTeam || market.awayTeam || 'Time Fora',
            league: pageInfo.league || market.league || 'Liga',
            matchTime: pageInfo.matchTime || market.matchTime || '--',
            isLive: pageInfo.isLive || market.isLive || false,
            cornerLine: market.line,
            odds: market.odds,
            probability: probability
          });
        }
      });
      
    } catch (error) {
      console.error('Corner Spotter - Scan error:', error);
    }
    
    return signals;
  }

  function getPageInfo() {
    const info = {
      homeTeam: '',
      awayTeam: '',
      league: '',
      matchTime: '',
      isLive: false
    };
    
    try {
      // Try to get match header info
      // Bet365 uses various class names, we'll try common patterns
      
      // Check if live
      const liveIndicators = document.querySelectorAll('[class*="live"], [class*="Live"], [class*="inplay"], [class*="InPlay"]');
      info.isLive = liveIndicators.length > 0;
      
      // Try to get team names from header
      const headerElements = document.querySelectorAll('[class*="participant"], [class*="Participant"], [class*="team"], [class*="Team"]');
      if (headerElements.length >= 2) {
        info.homeTeam = headerElements[0]?.textContent?.trim() || '';
        info.awayTeam = headerElements[1]?.textContent?.trim() || '';
      }
      
      // Try to get league
      const leagueElements = document.querySelectorAll('[class*="competition"], [class*="Competition"], [class*="league"], [class*="League"]');
      if (leagueElements.length > 0) {
        info.league = leagueElements[0]?.textContent?.trim() || '';
      }
      
      // Try to get time
      const timeElements = document.querySelectorAll('[class*="time"], [class*="Time"], [class*="clock"], [class*="Clock"]');
      if (timeElements.length > 0) {
        info.matchTime = timeElements[0]?.textContent?.trim() || '';
      }
      
      // Fallback: try to get from page title
      if (!info.homeTeam || !info.awayTeam) {
        const title = document.title;
        const vsMatch = title.match(/(.+?)\s*(?:v|vs|x)\s*(.+?)(?:\s*-|$)/i);
        if (vsMatch) {
          info.homeTeam = vsMatch[1].trim();
          info.awayTeam = vsMatch[2].trim();
        }
      }
      
    } catch (error) {
      console.error('Corner Spotter - Error getting page info:', error);
    }
    
    return info;
  }

  function findCornerMarkets() {
    const markets = [];
    
    try {
      // Common patterns for corner markets in Bet365
      // Look for elements containing "corner", "escanteio", "cantos"
      const allText = document.body.innerText.toLowerCase();
      
      // Find all odds elements
      const oddsElements = document.querySelectorAll('[class*="odd"], [class*="Odd"], [class*="price"], [class*="Price"], [class*="bet-pick"]');
      
      oddsElements.forEach(el => {
        const parent = el.closest('[class*="market"], [class*="Market"], [class*="coupon"], [class*="Coupon"], [class*="row"], [class*="Row"]') || el.parentElement;
        const marketText = parent?.textContent?.toLowerCase() || '';
        
        // Check if this is a corner market
        if (marketText.includes('corner') || 
            marketText.includes('escanteio') || 
            marketText.includes('canto') ||
            marketText.includes('kicks')) {
          
          // Try to extract the line (e.g., "Over 9.5", "Mais de 9.5")
          const lineMatch = marketText.match(/(over|under|mais|menos|acima|abaixo)\s*(?:de\s*)?(\d+\.?\d*)/i);
          
          if (lineMatch) {
            const isOver = /over|mais|acima/i.test(lineMatch[1]);
            const lineValue = lineMatch[2];
            const line = `${isOver ? 'Over' : 'Under'} ${lineValue}`;
            
            // Get odds value
            const oddsText = el.textContent.trim();
            const oddsMatch = oddsText.match(/(\d+\.?\d*)/);
            
            if (oddsMatch) {
              const odds = parseFloat(oddsMatch[1]);
              
              if (odds > 1 && odds < 50) { // Sanity check
                markets.push({
                  line,
                  odds,
                  isLive: marketText.includes('live') || marketText.includes('ao vivo')
                });
              }
            }
          }
        }
      });
      
      // Also scan for specific corner bet sections
      const cornerSections = document.querySelectorAll('[class*="corner"], [class*="Corner"]');
      cornerSections.forEach(section => {
        const oddsInSection = section.querySelectorAll('[class*="odd"], [class*="price"]');
        oddsInSection.forEach(el => {
          const text = el.parentElement?.textContent || '';
          const lineMatch = text.match(/(over|under|mais|menos)\s*(\d+\.?\d*)/i);
          const oddsMatch = el.textContent.match(/(\d+\.?\d*)/);
          
          if (lineMatch && oddsMatch) {
            const isOver = /over|mais/i.test(lineMatch[1]);
            const odds = parseFloat(oddsMatch[1]);
            
            if (odds > 1 && odds < 50) {
              markets.push({
                line: `${isOver ? 'Over' : 'Under'} ${lineMatch[2]}`,
                odds
              });
            }
          }
        });
      });
      
      // Remove duplicates
      const uniqueMarkets = [];
      const seen = new Set();
      
      markets.forEach(m => {
        const key = `${m.line}-${m.odds}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueMarkets.push(m);
        }
      });
      
      return uniqueMarkets;
      
    } catch (error) {
      console.error('Corner Spotter - Error finding markets:', error);
      return [];
    }
  }

  function calculateProbability(odds) {
    if (odds <= 1) return 0;
    return parseFloat(((1 / odds) * 100).toFixed(1));
  }

  // Inject visual indicator for identified markets
  function highlightMarkets() {
    try {
      const cornerElements = document.querySelectorAll('[class*="corner"], [class*="Corner"]');
      cornerElements.forEach(el => {
        if (!el.dataset.cornerSpotterHighlighted) {
          el.style.border = '2px solid #10B981';
          el.style.borderRadius = '4px';
          el.dataset.cornerSpotterHighlighted = 'true';
        }
      });
    } catch (error) {
      // Silently fail
    }
  }

  // Auto-highlight on page changes (for live updates)
  const observer = new MutationObserver(() => {
    highlightMarkets();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial highlight
  highlightMarkets();

  console.log('Corner Spotter - Content script loaded');
})();
