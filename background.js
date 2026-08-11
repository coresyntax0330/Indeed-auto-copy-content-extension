chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action !== "fetchData") return;

  (async () => {
    try {
      const response = await fetch(message.url, {
        method: message.method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...(message.headers || {}),
        },
        body: message.body ? JSON.stringify(message.body) : undefined,
      });

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_error) {
        data = { message: text || "The service returned an invalid response." };
      }

      sendResponse({
        success: response.ok,
        status: response.status,
        data,
      });
    } catch (error) {
      sendResponse({ success: false, status: 0, error: error.message });
    }
  })();

  return true;
});
