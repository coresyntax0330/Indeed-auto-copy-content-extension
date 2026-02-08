(function () {
  // Run only on Indeed
  if (!location.hostname.endsWith("indeed.com")) return;

  // Prevent duplicate UI
  if (document.getElementById("indeed-copy-ui")) return;

  const TRIGGER_BUTTON = ".js-match-insights-provider-1s05l8k.e19afand0";

  const TARGET_CONTAINERS = [".serp-page-yl2akf", ".css-whzpm2.eu4oa1w0"];

  // ---------- UI CONTAINER ----------
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

  // ---------- COPY CONTENT BUTTON ----------
  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  Object.assign(copyBtn.style, {
    padding: "10px 16px",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
  });

  // ---------- COPY URL BUTTON ----------
  const copyUrlBtn = document.createElement("button");
  copyUrlBtn.textContent = "Copy URL";
  Object.assign(copyUrlBtn.style, {
    padding: "10px 16px",
    background: "#444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
  });

  uiWrapper.appendChild(copyBtn);
  uiWrapper.appendChild(copyUrlBtn);
  document.body.appendChild(uiWrapper);

  // ---------- HELPERS ----------
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

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  function collectText() {
    return TARGET_CONTAINERS.map((selector) => {
      const el = document.querySelector(selector);
      return el ? el.innerText.trim() : "";
    })
      .filter(Boolean)
      .join("\n\n");
  }

  // ---------- COPY CONTENT LOGIC ----------
  copyBtn.addEventListener("click", async () => {
    const trigger = document.querySelector(TRIGGER_BUTTON);
    copyBtn.textContent = "Loading…";

    try {
      // Click only if button includes "show more"
      if (trigger && trigger.innerText.toLowerCase().includes("show more")) {
        trigger.click();
        await waitForContent();
      }

      const text = collectText();
      if (!text) throw new Error("No content");

      await navigator.clipboard.writeText(text);

      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    } catch {
      copyBtn.textContent = "Failed";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    }
  });

  // ---------- COPY URL LOGIC ----------
  copyUrlBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyUrlBtn.textContent = "URL Copied!";
      setTimeout(() => (copyUrlBtn.textContent = "Copy URL"), 1500);
    } catch {
      copyUrlBtn.textContent = "Failed";
      setTimeout(() => (copyUrlBtn.textContent = "Copy URL"), 1500);
    }
  });

  // ---------- KEEP UI ALIVE (SPA SAFE) ----------
  const keepAlive = new MutationObserver(() => {
    if (!document.getElementById("indeed-copy-ui")) {
      document.body.appendChild(uiWrapper);
    }
  });

  keepAlive.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
