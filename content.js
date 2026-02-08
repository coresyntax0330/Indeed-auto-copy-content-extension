(function () {
  if (!location.hostname.endsWith("indeed.com")) return;
  if (document.getElementById("indeed-copy-ui")) return;

  const TRIGGER_BUTTON = ".js-match-insights-provider-1s05l8k.e19afand0";

  const TARGET_CONTAINERS = [".serp-page-yl2akf", ".css-whzpm2.eu4oa1w0"];

  const API_URL = "http://45.15.160.247:5000/api/bids/get-draft";
  const BID_PAGE_URL = "http://45.15.160.247:3000/bid";

  // ---------- UI ----------
  const uiWrapper = document.createElement("div");
  uiWrapper.id = "indeed-copy-ui";
  Object.assign(uiWrapper.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "999999",
    display: "flex",
    gap: "8px",
  });

  function makeBtn(text, bg) {
    const btn = document.createElement("button");
    btn.textContent = text;
    Object.assign(btn.style, {
      padding: "10px 14px",
      background: bg,
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      cursor: "pointer",
    });
    return btn;
  }

  const copyBtn = makeBtn("Copy", "#111");
  const copyUrlBtn = makeBtn("Copy URL", "#444");
  const sendBtn = makeBtn("Send", "#0066ff");

  uiWrapper.append(copyBtn, copyUrlBtn, sendBtn);
  document.body.appendChild(uiWrapper);

  // ---------- HELPERS ----------
  function collectText() {
    return TARGET_CONTAINERS.map((sel) => {
      const el = document.querySelector(sel);
      return el ? el.innerText.trim() : "";
    })
      .filter(Boolean)
      .join("\n\n");
  }

  function waitForContent(timeout = 5000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const observer = new MutationObserver(() => {
        const hasContent = TARGET_CONTAINERS.some((sel) => {
          const el = document.querySelector(sel);
          return el && el.innerText.trim();
        });
        if (hasContent) {
          observer.disconnect();
          resolve();
        }
        if (Date.now() - start > timeout) {
          observer.disconnect();
          reject();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // ---------- COPY CONTENT ----------
  copyBtn.onclick = async () => {
    const trigger = document.querySelector(TRIGGER_BUTTON);
    copyBtn.textContent = "Loading…";

    try {
      if (trigger && trigger.innerText.toLowerCase().includes("show more")) {
        trigger.click();
        await waitForContent();
      }

      const text = collectText();
      if (!text) throw new Error();

      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied!";
    } catch {
      copyBtn.textContent = "Failed";
    } finally {
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    }
  };

  // ---------- COPY URL ----------
  copyUrlBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      copyUrlBtn.textContent = "URL Copied!";
    } catch {
      copyUrlBtn.textContent = "Failed";
    } finally {
      setTimeout(() => (copyUrlBtn.textContent = "Copy URL"), 1500);
    }
  };

  // ---------- SEND TO API + OPEN TAB ----------
  sendBtn.onclick = async () => {
    sendBtn.textContent = "Sending…";
    const trigger = document.querySelector(TRIGGER_BUTTON);

    if (trigger && trigger.innerText.toLowerCase().includes("show more")) {
      trigger.click();
      await waitForContent();
    }

    const payload = {
      url: location.href,
      content: collectText(),
    };

    // Step 1: validate locally
    if (!payload.url || !payload.content) {
      sendBtn.textContent = "Empty data";
      setTimeout(() => (sendBtn.textContent = "Send"), 1500);
      return;
    }

    try {
      // Step 2: send to API
      const res = await chrome.runtime.sendMessage({
        action: "fetchData",
        url: API_URL,
        method: "POST",
        body: payload,
      });

      if (!res || !res.success) {
        throw new Error(res?.error || "API error");
      }

      const data = res.data;

      // Step 3: validate response
      const flag = data.flag;

      if (flag) {
        window.open(BID_PAGE_URL + "?draftID=" + data.draftID, "_blank");
        sendBtn.textContent = "Opened!";
      } else {
        sendBtn.textContent = "No Data";
      }
    } catch {
      sendBtn.textContent = "Error";
    } finally {
      setTimeout(() => (sendBtn.textContent = "Send"), 1500);
    }
  };

  // ---------- KEEP UI ALIVE ----------
  new MutationObserver(() => {
    if (!document.getElementById("indeed-copy-ui")) {
      document.body.appendChild(uiWrapper);
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
