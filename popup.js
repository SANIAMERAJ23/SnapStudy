document
  .getElementById("download-path-selected-button")
  .addEventListener("click", async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      let activeTab = tabs[0];

      let activeTabUrl = activeTab.url;

      if (activeTabUrl.includes("youtube.com")){
        chrome.scripting.insertCSS({
          target: { tabId: activeTab.id },
          files: ["style.css"],
        });
  
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ['contentScript.js']
        });
      }

    });
  });
