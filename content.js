(function () {
  const isIndeed = location.hostname.endsWith("indeed.com");
  const isCvLibrary = location.hostname.includes("cv-library.co");
  const ADZUNA_DOMAINS = [
    "adzuna.com.au", "adzuna.at", "adzuna.be", "adzuna.com.br",
    "adzuna.ca", "adzuna.fr", "adzuna.de", "adzuna.in", "adzuna.it",
    "adzuna.com.mx", "adzuna.nl", "adzuna.co.nz", "adzuna.pl",
    "adzuna.sg", "adzuna.co.za", "adzuna.es", "adzuna.ch",
    "adzuna.co.uk", "adzuna.com",
  ];
  const isAdzuna = ADZUNA_DOMAINS.some(
    (domain) =>
      location.hostname === domain || location.hostname.endsWith(`.${domain}`),
  );
  if (!isIndeed && !isCvLibrary && !isAdzuna) return;
  if (document.getElementById("resume-builder-extension")) return;

  const API_BASE = "https://api.lovapextech.com/api";
  const SERVICE_BASE = "https://api.lovapextech.com";
  const TRIGGER_BUTTON = ".js-match-insights-provider-1s05l8k.e19afand0";
  const FALLBACK_TARGET_CONTAINERS = [
    "#jobDescriptionText",
    ".css-whzpm2.eu4oa1w0",
  ];

  function getTargetContainers() {
    if (isAdzuna) {
      return [
        ".ui-adp-content",
        '[class~="lg:flex"][class~="mb-4"][class~="lg:gap-8"]',
        ".flex-grow",
      ];
    }

    if (isCvLibrary) {
      return [".Card_card__ySwWs.JobView_jobCard__j1gZ0"];
    }

    if (location.pathname.startsWith("/jobs")) {
      return [
        ".jobsearch-RightPane.css-6iabie.eu4oa1w0",
        ...FALLBACK_TARGET_CONTAINERS,
      ];
    }

    if (location.pathname.startsWith("/viewjob")) {
      return [".css-1butozf.eu4oa1w0", ...FALLBACK_TARGET_CONTAINERS];
    }

    return FALLBACK_TARGET_CONTAINERS;
  }

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
      textarea { resize: vertical; min-height: 100px; line-height: 1.4; }
      .primary { width: 100%; padding: 11px 14px; margin-top: 18px; color: white; background: #087b85; }
      .secondary { width: 100%; padding: 10px; margin-top: 10px; color: #31515b; background: #e8f3f5; }
      .danger { width: auto; flex: 0 0 auto; padding: 8px 10px; margin: 0; color: #9d3030; background: #fff0f0; }
      .actions { display: flex; gap: 8px; margin-top: 18px; }
      .actions .primary { flex: 1; width: auto; margin-top: 0; }
      .actions .remove-draft { flex: 0 0 auto; padding: 11px 14px; color: #fff; background: #c44747; }
      .row { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; }
      .row input, .row textarea { flex: 1; }
      .row textarea { min-height: 72px; }
      .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .section { padding-top: 14px; margin-top: 16px; border-top: 1px solid #d8e8ec; }
      .section-title { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .section-title label { margin: 0; text-transform: capitalize; }
      .add { padding: 6px 9px; color: #087b85; background: #e8f3f5; font-size: 12px; }
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
      <header class="head"><div class="brand">Resume Builder<small>Job assistant</small></div><button class="close" aria-label="Close">&times;</button></header>
      <main class="body"><div class="card"><div data-view></div></div></main>
    </aside>`;

  const $ = (selector) => shadow.querySelector(selector);
  const panel = $(".panel");
  const view = $("[data-view]");
  let token = "";
  let user = null;
  let verificationToken = "";
  let job = { url: location.href, content: "" };
  let generationInFlight = false;
  let pendingAutoGenerate = false;
  let memoryToken = "";

  function getExtensionStorage() {
    return globalThis.chrome?.storage?.local || null;
  }

  async function saveSessionToken(value) {
    memoryToken = value;
    const storage = getExtensionStorage();
    if (storage) await storage.set({ resumeBuilderToken: value });
  }

  async function loadSessionToken() {
    const storage = getExtensionStorage();
    if (!storage) return memoryToken;
    const stored = await storage.get("resumeBuilderToken");
    return stored.resumeBuilderToken || "";
  }

  async function clearSessionToken() {
    memoryToken = "";
    const storage = getExtensionStorage();
    if (storage) await storage.remove("resumeBuilderToken");
  }

  function collectText() {
    // Indeed's fallback containers can wrap the whole search page and also
    // contain #jobDescriptionText. Sending all matches duplicates the job and
    // can exceed the API/proxy request limit, which surfaces as ERR_CONNECTION_CLOSED.
    for (const selector of getTargetContainers()) {
      const text = document.querySelector(selector)?.innerText?.trim();
      if (text) return text.slice(0, 60000);
    }
    return "";
  }

  function errorMessage(response, fallback) {
    return (
      response?.data?.errors?.map((item) => item.msg).join(" ") ||
      response?.data?.msg ||
      response?.data?.message ||
      response?.error ||
      fallback
    );
  }

  async function api(path, options = {}) {
    // Axios uses XMLHttpRequest in the Resume Builder browser app. Use the
    // same transport here instead of the extension service worker's fetch.
    return new Promise((resolve) => {
      const request = new XMLHttpRequest();
      request.open(options.method || "POST", `${API_BASE}${path}`, true);
      request.timeout = 5 * 60 * 1000;
      request.setRequestHeader("Content-Type", "application/json");
      if (options.auth !== false && token) {
        request.setRequestHeader("x-auth-token", token);
      }

      request.onload = () => {
        let data = {};
        try {
          data = request.responseText ? JSON.parse(request.responseText) : {};
        } catch (_error) {
          data = {
            message:
              request.responseText ||
              "The service returned an invalid response.",
          };
        }
        resolve({
          success: request.status >= 200 && request.status < 300,
          status: request.status,
          data,
        });
      };
      request.onerror = () =>
        resolve({
          success: false,
          status: 0,
          error: "The Resume Builder API connection was closed.",
        });
      request.ontimeout = () =>
        resolve({
          success: false,
          status: 0,
          error: "Resume generation timed out after 5 minutes.",
        });
      request.onabort = () =>
        resolve({ success: false, status: 0, error: "Request cancelled." });

      request.send(options.body ? JSON.stringify(options.body) : null);
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

  function showLogin(
    message = "Sign in to generate a tailored resume without leaving Indeed.",
  ) {
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
    await saveSessionToken(token);
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
    button.disabled = true;
    button.textContent = "Signing in...";
    message.innerHTML = "";
    const form = new FormData(event.currentTarget);
    const response = await api("/users/login", {
      auth: false,
      body: { email: form.get("email"), password: form.get("password") },
    });
    if (response.success && response.data.verificationRequired) {
      verificationToken = response.data.verificationToken;
      showVerification(response.data.email);
      return;
    }
    try {
      if (!response.success || !response.data.token)
        throw new Error(errorMessage(response, "Sign in failed."));
      await finishAuthentication(response.data.token);
    } catch (error) {
      message.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
      button.disabled = false;
      button.textContent = "Sign in";
    }
  }

  async function handleVerification(event) {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button");
    const message = $("[data-message]");
    button.disabled = true;
    button.textContent = "Verifying...";
    message.innerHTML = "";
    const response = await api("/users/verify-email", {
      auth: false,
      body: {
        verificationToken,
        code: new FormData(event.currentTarget).get("code"),
      },
    });
    try {
      if (!response.success || !response.data.token)
        throw new Error(errorMessage(response, "Verification failed."));
      await finishAuthentication(response.data.token);
    } catch (error) {
      message.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
      button.disabled = false;
      button.textContent = "Verify and continue";
    }
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value || "";
    return div.innerHTML;
  }

  function showBuilder(clearJob = false, notice = "") {
    if (clearJob === true) {
      job = { url: "", content: "" };
      generatedDraft = null;
      generatedBid = null;
      finalizedPdf = null;
    } else {
      job.url = location.href;
      job.content = collectText() || job.content;
    }
    view.innerHTML = `<div class="user"><span><strong>${escapeHtml(user.name || user.email)}</strong><br><small>Balance: ${escapeHtml(String(user.balance ?? 0))}</small></span><button class="link" data-logout>Sign out</button></div>
      <h2>Build resume</h2><p>${clearJob === true ? "Enter a job URL and description to generate another resume." : "The Indeed job details are ready. Review them, then generate your draft."}</p>${notice ? `<div class="success">${escapeHtml(notice)}</div>` : ""}<div data-message></div>
      <form data-build><label>Job URL</label><input name="url" type="url" required value="${escapeHtml(job.url)}">
      <label>Job description</label><textarea name="content" required>${escapeHtml(job.content)}</textarea>
      <button class="primary" type="submit">Generate resume draft</button></form>`;
    $("[data-logout]").onclick = logout;
    $("[data-build]").onsubmit = handleGenerate;
    if (pendingAutoGenerate && job.url && job.content) {
      pendingAutoGenerate = false;
      const form = $("[data-build]");
      setTimeout(() => form?.requestSubmit(), 0);
    }
  }

  let generatedDraft = null;
  let generatedBid = null;
  let finalizeInFlight = false;
  let removeInFlight = false;
  let finalizedPdf = null;

  function normalizeDraft(rawResult) {
    let draft;
    try {
      draft = typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;
    } catch (_error) {
      draft = null;
    }

    if (!draft || typeof draft !== "object") return null;
    draft.skills =
      draft.skills && typeof draft.skills === "object" ? draft.skills : {};
    draft.experiences =
      draft.experiences && typeof draft.experiences === "object"
        ? draft.experiences
        : {};
    for (let index = 1; index <= 3; index += 1) {
      draft.experiences[`role${index}`] ||= "";
      if (!Array.isArray(draft.experiences[`experience${index}`])) {
        draft.experiences[`experience${index}`] = [];
      }
    }
    return draft;
  }

  function editorInput(label, field, value, type = "input") {
    const control =
      type === "textarea"
        ? `<textarea data-field="${field}" rows="4">${escapeHtml(value || "")}</textarea>`
        : `<input data-field="${field}" value="${escapeHtml(value || "")}">`;
    return `<label>${label}</label>${control}`;
  }

  function renderDraftEditor() {
    const draft = generatedDraft;
    const skillGroups = Object.entries(draft.skills)
      .map(
        ([
          category,
          skills,
        ]) => `<div class="section" data-skill-group="${escapeHtml(category)}">
        <div class="section-title"><label>${escapeHtml(category.replaceAll("_", " "))}</label><button class="add" type="button" data-add-skill="${escapeHtml(category)}">+ Add skill</button></div>
        ${(Array.isArray(skills) ? skills : []).map((skill, index) => `<div class="row"><input data-skill-category="${escapeHtml(category)}" data-index="${index}" value="${escapeHtml(skill)}"><button class="danger" type="button" data-remove-skill="${escapeHtml(category)}" data-index="${index}">Remove</button></div>`).join("")}
      </div>`,
      )
      .join("");
    const roles = `<div class="section"><h2>Roles</h2>${[1, 2, 3]
      .map((number) =>
        editorInput(
          `Role ${number}`,
          `role${number}`,
          draft.experiences[`role${number}`],
        ),
      )
      .join("")}</div>`;
    const experiences = [1, 2, 3]
      .map(
        (number) => `<div class="section">
      <div class="section-title"><label>Experience ${number}</label><button class="add" type="button" data-add-experience="${number}">+ Add entry</button></div>
      ${draft.experiences[`experience${number}`].map((item, index) => `<div class="row"><textarea data-experience="${number}" data-index="${index}">${escapeHtml(item)}</textarea><button class="danger" type="button" data-remove-experience="${number}" data-index="${index}">Remove</button></div>`).join("")}
    </div>`,
      )
      .join("");

    view.innerHTML = `<div class="user"><span><strong>${escapeHtml(user.name || user.email)}</strong><br><small>Balance: ${escapeHtml(String(user.balance ?? 0))}</small></span><button class="link" data-logout>Sign out</button></div>
      <div class="success">Your tailored resume draft is ready. Review and edit it below.</div>
      <h2>Resume Preview &amp; Edit</h2>
      <div data-finalize-message></div>
      <div class="actions"><button class="primary" type="button" data-finalize>Finalize generate &amp; download</button><button class="remove-draft" type="button" data-remove-draft>Remove</button></div>
      ${editorInput("Company", "company_name", draft.company_name)}
      ${editorInput("Company title", "role_title", draft.role_title)}
      ${editorInput("Role title", "developer_title", draft.developer_title)}
      <div class="two-column"><div>${editorInput("Salary range", "salary_range", draft.salary_range)}</div><div>${editorInput("Job type", "job_type", draft.job_type)}</div></div>
      ${editorInput("Summary", "summary", draft.summary, "textarea")}
      ${roles}
      ${experiences}
      <div class="section"><h2>Skills</h2>${skillGroups || "<p>No skill groups were generated.</p>"}</div>
      <div class="actions"><button class="primary" type="button" data-finalize>Finalize generate &amp; download</button><button class="remove-draft" type="button" data-remove-draft>Remove</button></div>
      <button class="primary" type="button" data-copy-draft>Copy edited draft</button>
      <button class="secondary" type="button" data-another>Generate another draft</button>`;

    view.oninput = (event) => {
      const target = event.target;
      if (target.dataset.field) {
        if (
          target.dataset.field.startsWith("role") &&
          /^role\d$/.test(target.dataset.field)
        ) {
          draft.experiences[target.dataset.field] = target.value;
        } else draft[target.dataset.field] = target.value;
      } else if (target.dataset.skillCategory) {
        draft.skills[target.dataset.skillCategory][
          Number(target.dataset.index)
        ] = target.value;
      } else if (target.dataset.experience) {
        draft.experiences[`experience${target.dataset.experience}`][
          Number(target.dataset.index)
        ] = target.value;
      }
    };
    view.onclick = async (event) => {
      const target = event.target;
      if (target.dataset.addSkill) {
        draft.skills[target.dataset.addSkill].push("");
        renderDraftEditor();
      } else if (target.dataset.removeSkill) {
        draft.skills[target.dataset.removeSkill].splice(
          Number(target.dataset.index),
          1,
        );
        renderDraftEditor();
      } else if (target.dataset.addExperience) {
        draft.experiences[`experience${target.dataset.addExperience}`].push("");
        renderDraftEditor();
      } else if (target.dataset.removeExperience) {
        draft.experiences[
          `experience${target.dataset.removeExperience}`
        ].splice(Number(target.dataset.index), 1);
        renderDraftEditor();
      } else if (target.matches("[data-copy-draft]")) {
        await navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
        target.textContent = "Copied!";
        setTimeout(() => (target.textContent = "Copy edited draft"), 1400);
      } else if (target.matches("[data-finalize]")) {
        await finalizeResume(target);
      } else if (target.matches("[data-remove-draft]")) {
        await removeDraft(target);
      } else if (target.matches("[data-another]")) showBuilder();
      else if (target.matches("[data-logout]")) logout();
    };
  }

  function showGeneratedDraft(rawResult, bid = generatedBid) {
    const draft = normalizeDraft(rawResult);

    if (!draft || typeof draft !== "object") {
      view.innerHTML = `<div class="success">Your tailored resume draft was generated successfully.</div>
        <h2>Generated draft</h2><textarea readonly>${escapeHtml(String(rawResult || ""))}</textarea>
        <button class="secondary" data-another>Generate another draft</button>`;
      $("[data-another]").onclick = () => showBuilder();
    } else {
      generatedDraft = draft;
      generatedBid = bid;
      finalizedPdf = null;
      renderDraftEditor();
    }
  }

  function downloadPdf(relativePath, filename) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open(
        "GET",
        `${SERVICE_BASE}/job/description/${relativePath}`,
        true,
      );
      request.responseType = "blob";
      request.timeout = 2 * 60 * 1000;
      request.onload = () => {
        if (request.status < 200 || request.status >= 300) {
          reject(new Error("The generated PDF could not be downloaded."));
          return;
        }
        const objectUrl = URL.createObjectURL(request.response);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename || "resume.pdf";
        link.style.display = "none";
        shadow.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        resolve();
      };
      request.onerror = () =>
        reject(new Error("The PDF download connection failed."));
      request.ontimeout = () =>
        reject(new Error("The PDF download timed out."));
      request.send();
    });
  }

  async function finalizeResume(button) {
    if (finalizeInFlight || removeInFlight) return;
    const message = $("[data-finalize-message]");
    if (finalizedPdf) {
      try {
        button.disabled = true;
        button.textContent = "Downloading PDF...";
        await downloadPdf(finalizedPdf.path, finalizedPdf.filename);
        message.innerHTML = `<div class="success">Your PDF download has started.</div>`;
        button.textContent = "Download PDF again";
      } catch (error) {
        message.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
        button.textContent = "Try PDF download again";
      } finally {
        button.disabled = false;
      }
      return;
    }
    if (!generatedBid?._id) {
      message.innerHTML = `<div class="error">The generated job record is missing. Please generate the draft again.</div>`;
      return;
    }

    finalizeInFlight = true;
    button.disabled = true;
    button.textContent = "Finalizing resume...";
    message.innerHTML = `<p class="hint">Creating your document and PDF. This may take a moment.</p>`;
    const response = await api("/bids/gen-resume", {
      body: {
        company_name: String(generatedDraft.company_name || "").replace(
          /\.$/,
          "",
        ),
        developer_title: generatedDraft.developer_title || "",
        role_title: generatedDraft.role_title || "",
        salary_range: generatedDraft.salary_range || "",
        job_type: generatedDraft.job_type || "",
        summary: generatedDraft.summary || "",
        skills: generatedDraft.skills,
        experiences: generatedDraft.experiences,
        bid: generatedBid,
        user,
      },
    });

    if (!response.success || response.data?.status !== "success") {
      message.innerHTML = `<div class="error">${escapeHtml(errorMessage(response, "Unable to finalize the resume."))}</div>`;
      button.disabled = false;
      button.textContent = "Finalize generate & download";
      finalizeInFlight = false;
      return;
    }

    finalizedPdf = {
      path: response.data.downloadPDFLink,
      filename: response.data.pdf_filename,
    };
    try {
      await downloadPdf(finalizedPdf.path, finalizedPdf.filename);
      message.innerHTML = `<div class="success">Resume generated successfully. Your PDF download has started.</div>`;
      user.balance = response.data.balance ?? user.balance;
      showBuilder(
        true,
        "Resume generated successfully. Your PDF download has started.",
      );
    } catch (error) {
      message.innerHTML = `<div class="error">${escapeHtml(error.message)} The resume was finalized successfully.</div>`;
      button.disabled = false;
      button.textContent = "Try PDF download again";
    }
    finalizeInFlight = false;
  }

  async function removeDraft(button) {
    if (removeInFlight || finalizeInFlight || !generatedBid?._id) return;
    if (!window.confirm("Remove this resume draft from Resume Builder?")) return;

    removeInFlight = true;
    button.disabled = true;
    button.textContent = "Removing...";
    const message = $("[data-finalize-message]");
    const response = await api("/bids/del-draft", {
      body: { id: generatedBid._id },
    });

    if (!response.success || response.data?.status !== "success") {
      message.innerHTML = `<div class="error">${escapeHtml(errorMessage(response, "Unable to remove the resume draft."))}</div>`;
      button.disabled = false;
      button.textContent = "Remove";
      removeInFlight = false;
      return;
    }

    removeInFlight = false;
    showBuilder(true, "Resume draft removed successfully.");
  }

  function normalizeUrl(value) {
    try {
      const url = new URL(value);
      url.hash = "";
      return url.toString().replace(/\/$/, "");
    } catch (_error) {
      return String(value || "").replace(/\/$/, "");
    }
  }

  async function recoverExistingDraft(jobUrl) {
    const recentResponse = await api("/bids/get-recent", {
      body: { user_id: user._id, limit: 20 },
    });
    if (
      !recentResponse.success ||
      !Array.isArray(recentResponse.data?.result)
    ) {
      return false;
    }
    const existing = recentResponse.data.result.find(
      (item) => normalizeUrl(item.job_url) === normalizeUrl(jobUrl),
    );
    if (!existing?._id) return false;

    const itemResponse = await api("/bids/get-bid-item", {
      body: { id: existing._id },
    });
    if (!itemResponse.success || !itemResponse.data?.result?.bid) return false;
    showGeneratedDraft(itemResponse.data.result.bid, itemResponse.data.result);
    return true;
  }

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  const GENERATION_LOCK_ATTRIBUTE = "data-resume-builder-generation-lock";

  function acquirePageGenerationLock(jobUrl) {
    const now = Date.now();
    const existingValue = document.documentElement.getAttribute(
      GENERATION_LOCK_ATTRIBUTE,
    );
    if (existingValue) {
      try {
        const existing = JSON.parse(existingValue);
        const isFresh = now - Number(existing.createdAt) < 10 * 60 * 1000;
        if (isFresh && normalizeUrl(existing.jobUrl) === normalizeUrl(jobUrl)) {
          return false;
        }
      } catch (_error) {
        // Replace invalid or stale lock data below.
      }
    }
    document.documentElement.setAttribute(
      GENERATION_LOCK_ATTRIBUTE,
      JSON.stringify({ jobUrl, createdAt: now }),
    );
    return true;
  }

  function releasePageGenerationLock(jobUrl) {
    const existingValue = document.documentElement.getAttribute(
      GENERATION_LOCK_ATTRIBUTE,
    );
    if (!existingValue) return;
    try {
      const existing = JSON.parse(existingValue);
      if (normalizeUrl(existing.jobUrl) !== normalizeUrl(jobUrl)) return;
    } catch (_error) {
      // Invalid lock values are safe to remove.
    }
    document.documentElement.removeAttribute(GENERATION_LOCK_ATTRIBUTE);
  }

  async function waitForGeneratedDraft(jobUrl, messageElement) {
    // A proxy may close the long HTTP response while OpenAI/backend processing
    // continues. Poll for that same saved bid instead of sending a second job.
    const maxAttempts = 36;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      messageElement.innerHTML = `<p class="hint">The server is still generating your resume. Recovering it automatically (${attempt}/${maxAttempts})...</p>`;
      if (await recoverExistingDraft(jobUrl)) return true;
      if (attempt < maxAttempts) await wait(5000);
    }
    return false;
  }

  async function handleGenerate(event) {
    event.preventDefault();
    if (generationInFlight) return;
    generationInFlight = true;
    const button = event.currentTarget.querySelector("button");
    const message = $("[data-message]");
    const form = new FormData(event.currentTarget);
    job = {
      url: String(form.get("url")).trim(),
      content: String(form.get("content")).trim(),
    };
    if (!user.template_url) {
      message.innerHTML = `<div class="error">Please upload a resume template in your Resume Builder profile first.</div>`;
      generationInFlight = false;
      return;
    }
    if (!acquirePageGenerationLock(job.url)) {
      message.innerHTML = `<div class="error">This job is already being generated in this Indeed page. Please wait for the current request to finish.</div>`;
      generationInFlight = false;
      return;
    }
    button.disabled = true;
    button.textContent = "Generating draft...";
    message.innerHTML = `<p class="hint">This may take a moment. Keep this panel open.</p>`;
    const response = await api("/bids/gen-draft", {
      body: { user: user._id, job_url: job.url, job_desc: job.content },
    });
    if (!response.success || !response.data?.bid?._id) {
      if (response.status === 401) {
        releasePageGenerationLock(job.url);
        generationInFlight = false;
        return logout("Your session expired. Please sign in again.");
      }
      const responseMessage = errorMessage(response, "");
      if (response.status === 0) {
        if (await waitForGeneratedDraft(job.url, message)) {
          releasePageGenerationLock(job.url);
          generationInFlight = false;
          return;
        }
        message.innerHTML = `<div class="error">The server did not return the generated draft within 3 minutes. Check your Resume Builder drafts before trying again, because the original request may still complete.</div>`;
        button.disabled = false;
        button.textContent = "Generate resume draft";
        releasePageGenerationLock(job.url);
        generationInFlight = false;
        return;
      }
      if (
        responseMessage.toLowerCase().includes("job url is already existed")
      ) {
        message.innerHTML = `<p class="hint">This draft was already generated. Loading it now...</p>`;
        if (await recoverExistingDraft(job.url)) {
          releasePageGenerationLock(job.url);
          generationInFlight = false;
          return;
        }
      }
      const fallback = "Unable to generate the resume draft.";
      message.innerHTML = `<div class="error">${escapeHtml(errorMessage(response, fallback))}</div>`;
      button.disabled = false;
      button.textContent = "Generate resume draft";
      releasePageGenerationLock(job.url);
      generationInFlight = false;
      return;
    }
    releasePageGenerationLock(job.url);
    generationInFlight = false;
    showGeneratedDraft(response.data.result, response.data.bid);
  }

  async function logout(message) {
    token = "";
    user = null;
    await clearSessionToken();
    showLogin(typeof message === "string" ? message : undefined);
  }

  async function openPanel() {
    await expandAndCollect();
    pendingAutoGenerate = Boolean(job.url && job.content);
    panel.classList.add("open");
    const storedToken = await loadSessionToken();
    if (!storedToken) return showLogin();
    token = storedToken;
    const response = await api("/users/get", { method: "GET" });
    if (!response.success)
      return logout("Your saved session expired. Please sign in again.");
    user = response.data;
    showBuilder();
  }

  $("[data-send]").onclick = openPanel;
  $(".close").onclick = () => panel.classList.remove("open");
  $("[data-copy]").onclick = async (event) => {
    const button = event.currentTarget;
    try {
      await expandAndCollect();
      await navigator.clipboard.writeText(job.content);
      button.textContent = "Copied!";
    } catch (_error) {
      button.textContent = "Failed";
    }
    setTimeout(() => (button.textContent = "Copy"), 1400);
  };
  $("[data-url]").onclick = async (event) => {
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(location.href);
      button.textContent = "Copied!";
    } catch (_error) {
      button.textContent = "Failed";
    }
    setTimeout(() => (button.textContent = "Copy URL"), 1400);
  };

  new MutationObserver(() => {
    if (!document.documentElement.contains(host))
      document.documentElement.appendChild(host);
  }).observe(document.documentElement, { childList: true });
})();
