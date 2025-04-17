chrome.webNavigation.onCompleted.addListener(async (details) => {
    const { url } = details;
  
    let visitedSites = await chrome.storage.local.get('visitedSites');
    visitedSites = visitedSites.visitedSites || [];
  
    if (!visitedSites.includes(url) && chrome.scripting) {
      visitedSites.push(url);
      await chrome.storage.local.set({ visitedSites });
    
      chrome.scripting.insertCSS({
        target: { tabId: details.tabId },
        files: ['style.css']
      })

      chrome.scripting.executeScript({
        target: {tabId: details.tabId},
        files: ['contentScript.js']
      });
    }
}, {url: [{urlMatches: '.*'}]});
