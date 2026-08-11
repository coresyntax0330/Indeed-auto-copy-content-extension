(function () {
  if (!location.hostname.endsWith("indeed.com")) return;
  if (document.getElementById("resume-builder-extension")) return;

  const API_BASE = "https://api.lovapextech.com/api";
  const TRIGGER_BUTTON = ".js-match-insights-provider-1s05l8k.e19afand0";
  const TARGET_CONTAINERS = [
    "#jobDescriptionText",
    ".serp-page-yl2akf",
    ".css-whzpm2.eu4oa1w0",
  ];

  const host = document.createElement("div");
  host.id = "resume-builder-extension";
  const shadow = host.attachShadow({ mode: "open" });
  document.documentElement.appendChild(host);

  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; }
      .launcher { position: fixed; right: 20px; bottom: 20px; z-index: 2147483646; display: flex; gap: 8px; font: 600 14px Inter, Arial, sans-serif; }
      button { border: 0; border-radius: 8px; cursor: pointer; font: inherit; }
      .mini { padding: 10px 13px; color: #fff; background: #24343d; box-shadow: 0 5px 18px #0003; }
      .send { background: #087b85; }
      .panel { position: fixed; z-index: 2147483647; inset: 0 0 0 auto; width: min(430px, 100vw); background: #f4fbfc; color: #10212b; box-shadow: -16px 0 45px #10212b30; transform: translateX(105%); transition: transform .22s ease; font: 14px Inter, Arial, sans-serif; }
      .panel.open { transform: translateX(0); }
      .head { height: 72px; padding: 16px 20px; color: white; background: #123a45; display: flex; align-items: center; justify-content: space-between; }
      .brand { font-size: 18px; font-weight: 750; } .brand small { display: block; opacity: .72; font-size: 11px; margin-top: 3px; font-weight: 500; }
      .close { width: 34px; height: 34px; color: #fff; background: #ffffff18; font-size: 23px; }
      .body { height: calc(100vh - 72px); overflow: auto; padding: 22px; }
      .card { padding: 20px; background: #fff; border: 1px solid #d8e8ec; border-radius: 14px; box-shadow: 0 12px 30px #10212b0d; }
      h2 { margin: 0 0 7px; font-size: 21px; } p { color: #607783; line-height: 1.45; margin: 0 0 20px; }
      label { display: block; font-weight: 650; margin: 14px 0 7px; }
      input, textarea { width: 100%; border: 1px solid #cbdde2; border-radius: 8px; padding: 10px 11px; background: white; color: #10212b; font: 14px Inter, Arial, sans-serif; outline: none; }
      input:focus, textarea:focus { border-color: #087b85; box-shadow: 0 0 0 3px #087b851a; }
      textarea { resize: vertical; min-height: 220px; line-height: 1.4; }
      .primary { width: 100%; padding: 11px 14px; margin-top: 18px; color: white; background: #087b85; }
      .secondary { width: 100%; padding: 10px; margin-top: 10px; color: #31515b; background: #e8f3f5; }
      button:disabled { cursor: wait; opacity: .65; }
      .error, .success { padding: 10px 12px; border-radius: 8px; margin: 0 0 12px; line-height: 1.4; }
      .error { color: #8c2929; background: #fff0f0; border: 1px solid #f0cccc; }
      .success { color: #08664f; background: #eaf9f4; border: 1px solid #bee8d9; }
      .user { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; margin-bottom: 14px; background: #e8f3f5; border-radius: 9px; }
      .link { color: #087b85; background: transparent; padding: 3px; }
      .hidden { display: none !important; }
      .hint { margin-top: 8px; font-size: 12px; }
    </style>
    <div class="launcher">
      <button class="mini" data-copy>Copy</button><button class="mini" data-url>Copy URL</button><button class="mini send" data-send>Send</button>
    </div>
    <aside class="panel" aria-label="Resume Builder">
      <header class="head"><div class="brand">Resume Builder<small>Indeed assistant</small></div><button class="close" aria-label="Close">&times;</button></header>
      <main class="body"><div class="card"><div data-view></div></div></main>
    </aside>`;

  const $ = (selector) => shadow.querySelector(selector);
  const panel = $(".panel");
  const view = $("[data-view]");
  let token = "";
  let user = null;
  let verificationToken = "";
  let job = { url: location.href, content: "" };

  function collectText() {
    return TARGET_CONTAINERS.map((selector) => document.querySelector(selector)?.innerText?.trim() || "")
      .filter((value, index, values) => value && values.indexOf(value) === index)
      .join("\n\n");
  }

  function errorMessage(response, fallback) {
    return response?.data?.errors?.map((item) => item.msg).join(" ") || response?.data?.msg || response?.data?.message || response?.error || fallback;
  }

  async function api(path, options = {}) {
    return chrome.runtime.sendMessage({
      action: "fetchData",
      url: `${API_BASE}${path}`,
      method: options.method || "POST",
      headers: options.auth === false || !token ? {} : { "x-auth-token": token },
      body: options.body,
    });
  }

  async function expandAndCollect() {
    const trigger = document.querySelector(TRIGGER_BUTTON);
    if (trigger?.innerText?.toLowerCase().includes("show more")) {
      trigger.click();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    job = { url: location.href, content: collectText() };
    return job;
  }

  function showLogin(message = "Sign in to generate a tailored resume without leaving Indeed.") {
    view.innerHTML = `<h2>Welcome back</h2><p>${message}</p><div data-message></div>
      <form data-login><label>Email</label><input name="email" type="email" autocomplete="email" required placeholder="you@company.com">
      <label>Password</label><input name="password" type="password" autocomplete="current-password" required placeholder="Enter your password">
      <button class="primary" type="submit">Sign in</button></form>`;
    $("[data-login]").onsubmit = handleLogin;
  }

  function showVerification(email) {
    view.innerHTML = `<h2>Verify your email</h2><p>Enter the 8-digit code sent to ${email}.</p><div data-message></div>
      <form data-verify><label>Verification code</label><input name="code" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" required placeholder="00000000">
      <button class="primary" type="submit">Verify and continue</button></form><button class="secondary" data-back>Back to sign in</button>`;
    $("[data-verify]").onsubmit = handleVerification;
    $("[data-back]").onclick = () => showLogin();
  }

  async function finishAuthentication(newToken) {
    token = newToken;
    await chrome.storage.local.set({ resumeBuilderToken: token });
    const response = await api("/users/get", { method: "GET" });
    if (!response.success) {
      await logout();
      throw new Error(errorMessage(response, "Unable to load your account."));
    }
    user = response.data;
    showBuilder();
  }

  async function handleLogin(event) {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button");
    const message = $("[data-message]");
    button.disabled = true; button.textContent = "Signing in..."; message.innerHTML = "";
    const form = new FormData(event.currentTarget);
    const response = await api("/users/login", { auth: false, body: { email: form.get("email"), password: form.get("password") } });
    if (response.success && response.data.verificationRequired) {
      verificationToken = response.data.verificationToken;
      showVerification(response.data.email);
      return;
    }
    try {
      if (!response.success || !response.data.token) throw new Error(errorMessage(response, "Sign in failed."));
      await finishAuthentication(response.data.token);
    } catch (error) {
      message.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
      button.disabled = false; button.textContent = "Sign in";
    }
  }

  async function handleVerification(event) {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button");
    const message = $("[data-message]");
    button.disabled = true; button.textContent = "Verifying..."; message.innerHTML = "";
    const response = await api("/users/verify-email", { auth: false, body: { verificationToken, code: new FormData(event.currentTarget).get("code") } });
    try {
      if (!response.success || !response.data.token) throw new Error(errorMessage(response, "Verification failed."));
      await finishAuthentication(response.data.token);
    } catch (error) {
      message.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
      button.disabled = false; button.textContent = "Verify and continue";
    }
  }

  function escapeHtml(value) {
    const div = document.createElement("div"); div.textContent = value || ""; return div.innerHTML;
  }

  function showBuilder() {
    job.url = location.href;
    job.content = collectText() || job.content;
    view.innerHTML = `<div class="user"><span>Signed in as <strong>${escapeHtml(user.name || user.email)}</strong></span><button class="link" data-logout>Sign out</button></div>
      <h2>Build resume</h2><p>The Indeed job details are ready. Review them, then generate your draft.</p><div data-message></div>
      <form data-build><label>Job URL</label><input name="url" type="url" required value="${escapeHtml(job.url)}">
      <label>Job description</label><textarea name="content" required>${escapeHtml(job.content)}</textarea>
      <button class="primary" type="submit">Generate resume draft</button></form>`;
    $("[data-logout]").onclick = logout;
    $("[data-build]").onsubmit = handleGenerate;
  }

  function showGeneratedDraft(rawResult) {
    let draft;
    try {
      draft = typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;
    } catch (_error) {
      draft = null;
    }

    if (!draft || typeof draft !== "object") {
      view.innerHTML = `<div class="success">Your tailored resume draft was generated successfully.</div>
        <h2>Generated draft</h2><textarea readonly>${escapeHtml(String(rawResult || ""))}</textarea>
        <button class="secondary" data-another>Generate another draft</button>`;
    } else {
      const skillGroups = Object.entries(draft.skills || {})
        .map(([name, skills]) => `<div><strong>${escapeHtml(name.replaceAll("_", " "))}:</strong> ${escapeHtml(Array.isArray(skills) ? skills.join(", ") : String(skills || ""))}</div>`)
        .join("");
      const experienceGroups = [1, 2, 3]
        .map((index) => {
          const role = draft.experiences?.[`role${index}`] || "";
          const items = draft.experiences?.[`experience${index}`] || [];
          if (!role && !items.length) return "";
          return `<section><label>${escapeHtml(role || `Experience ${index}`)}</label>${items.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</section>`;
        })
        .join("");
      view.innerHTML = `<div class="success">Your tailored resume draft is ready.</div>
        <h2>${escapeHtml(draft.developer_title || "Generated resume")}</h2>
        <p><strong>${escapeHtml(draft.company_name || "")}</strong>${draft.role_title ? ` &middot; ${escapeHtml(draft.role_title)}` : ""}</p>
        ${draft.summary ? `<label>Summary</label><p>${escapeHtml(draft.summary)}</p>` : ""}
        ${skillGroups ? `<label>Skills</label><div>${skillGroups}</div>` : ""}
        ${experienceGroups}
        <button class="secondary" data-another>Generate another draft</button>`;
    }
    $("[data-another]").onclick = showBuilder;
  }

  async function handleGenerate(event) {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button");
    const message = $("[data-message]");
    const form = new FormData(event.currentTarget);
    job = { url: String(form.get("url")).trim(), content: String(form.get("content")).trim() };
    if (!user.template_url) {
      message.innerHTML = `<div class="error">Please upload a resume template in your Resume Builder profile first.</div>`;
      return;
    }
    button.disabled = true; button.textContent = "Generating draft..."; message.innerHTML = `<p class="hint">This may take a moment. Keep this panel open.</p>`;
    const response = await api("/bids/gen-draft", { body: { user: user._id, job_url: job.url, job_desc: job.content } });
    if (!response.success || !response.data?.bid?._id) {
      if (response.status === 401) return logout("Your session expired. Please sign in again.");
      message.innerHTML = `<div class="error">${escapeHtml(errorMessage(response, "Unable to generate the resume draft."))}</div>`;
      button.disabled = false; button.textContent = "Generate resume draft";
      return;
    }
    showGeneratedDraft(response.data.result);
  }

  async function logout(message) {
    token = ""; user = null;
    await chrome.storage.local.remove("resumeBuilderToken");
    showLogin(typeof message === "string" ? message : undefined);
  }

  async function openPanel() {
    await expandAndCollect();
    panel.classList.add("open");
    const stored = await chrome.storage.local.get("resumeBuilderToken");
    if (!stored.resumeBuilderToken) return showLogin();
    token = stored.resumeBuilderToken;
    const response = await api("/users/get", { method: "GET" });
    if (!response.success) return logout("Your saved session expired. Please sign in again.");
    user = response.data;
    showBuilder();
  }

  $("[data-send]").onclick = openPanel;
  $(".close").onclick = () => panel.classList.remove("open");
  $("[data-copy]").onclick = async (event) => {
    const button = event.currentTarget;
    try { await expandAndCollect(); await navigator.clipboard.writeText(job.content); button.textContent = "Copied!"; }
    catch (_error) { button.textContent = "Failed"; }
    setTimeout(() => (button.textContent = "Copy"), 1400);
  };
  $("[data-url]").onclick = async (event) => {
    const button = event.currentTarget;
    try { await navigator.clipboard.writeText(location.href); button.textContent = "Copied!"; }
    catch (_error) { button.textContent = "Failed"; }
    setTimeout(() => (button.textContent = "Copy URL"), 1400);
  };

  new MutationObserver(() => {
    if (!document.documentElement.contains(host)) document.documentElement.appendChild(host);
  }).observe(document.documentElement, { childList: true });
})();
