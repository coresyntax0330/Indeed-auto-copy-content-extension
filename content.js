(function () {
  // Safety: only run on indeed
  if (!location.hostname.endsWith("indeed.com")) return;

  // Prevent duplicate UI
  if (document.getElementById("indeed-copy-ui")) return;

  const TRIGGER_BUTTON = ".js-match-insights-provider-1s05l8k.e19afand0";

  const TARGET_CONTAINERS = [".serp-page-yl2akf", ".css-whzpm2.eu4oa1w0"];

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
      .join("\n\n"); // clean separation between sections
  }

  copyBtn.addEventListener("click", async () => {
    const trigger = document.querySelector(TRIGGER_BUTTON);
    copyBtn.textContent = "Loading…";

    try {
      // Click only if button says "show more"
      if (trigger && trigger.innerText.toLowerCase().includes("show more")) {
        trigger.click();
        await waitForContent();
      }

      const text = collectText();
      if (!text) throw new Error("No content found");

      await navigator.clipboard.writeText(text);

      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    } catch {
      copyBtn.textContent = "Failed";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    }
  });

  // Keep button alive across SPA rerenders
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
