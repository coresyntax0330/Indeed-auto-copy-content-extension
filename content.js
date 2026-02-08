(function () {
  if (!location.hostname.endsWith("indeed.com")) return;
  if (document.getElementById("indeed-copy-ui")) return;

  const TRIGGER_BUTTON = ".js-match-insights-provider-1s05l8k.e19afand0";
  const TARGET_CONTAINER = ".serp-page-yl2akf";

  // Create floating Copy button
  const copyBtn = document.createElement("button");
  copyBtn.id = "indeed-copy-ui";
  copyBtn.textContent = "Copy";
  Object.assign(copyBtn.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "999999",
    padding: "10px 16px",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
  });

  document.body.appendChild(copyBtn);

  function waitForContent(timeout = 5000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();

      const observer = new MutationObserver(() => {
        const target = document.querySelector(TARGET_CONTAINER);
        if (target && target.innerText.trim()) {
          observer.disconnect();
          resolve(target);
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

  async function copyContent() {
    const target = document.querySelector(TARGET_CONTAINER);
    if (!target) throw new Error("No content");
    await navigator.clipboard.writeText(target.innerText.trim());
  }

  copyBtn.addEventListener("click", async () => {
    const trigger = document.querySelector(TRIGGER_BUTTON);
    copyBtn.textContent = "Loading…";

    try {
      // 🔹 If trigger exists AND includes "show more"
      if (trigger && trigger.innerText.toLowerCase().includes("show more")) {
        trigger.click();
        await waitForContent();
      }

      // 🔹 Copy content (always)
      await copyContent();

      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    } catch {
      copyBtn.textContent = "Failed";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    }
  });

  // Keep button alive on SPA rerenders
  const keepAlive = new MutationObserver(() => {
    if (!document.getElementById("indeed-copy-ui")) {
      document.body.appendChild(copyBtn);
    }
  });

  keepAlive.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
