(() => {
  "use strict";

  if (window.vnpetAuto?.destroy) {
    window.vnpetAuto.destroy();
  }

  const CONFIG = {
    preferBuiltInAuto: true,
    actionGapMs: 350,
    manualSearchMinMs: 1200,
    manualSearchMaxMs: 1700,
    stopOnCaptcha: true,
    captcha: {
  autoSolve: true,
  minDelayMs: 500,
  maxDelayMs: 1100,
  stopIfUnknown: true
},
    builtIn: {
      speedLabelIncludes: "Nhanh",
      formValue: "all",
      preferredBallKeywords: ["Master Ball", "Ultra Ball", "Great Ball", "Poke Ball", "Pokeball"]
    },
    manual: {
      preferredBallKeywords: ["Master Ball", "Ultra Ball", "Great Ball", "Poke Ball", "Pokeball"],
      actionByRarity: {
        god: "catch",
        gr: "catch",
        mr: "catch",
        lr: "catch",
        "ur+": "catch",
        ur: "catch",
        ssr: "catch",
        sr: "catch",
        r: "catch",
        "sss+": "catch",
        sss: "catch",
        ss: "catch",
        s: "catch",
        a: "run",
        b: "run",
        c: "run",
        d: "run"
      }
    }
  };

  const RARITY_MAP = {
    GOD: "god", GR: "gr", MR: "mr", LR: "lr", "UR+": "ur+",
    UR: "ur", SSR: "ssr", SR: "sr", R: "r", "SSS+": "sss+",
    SSS: "sss", SS: "ss", S: "s", A: "a", B: "b", C: "c", D: "d"
  };

  const state = {
    running: false,
    mode: "manual",
    timer: null,
    nextSearchAt: 0,
    nextActionAt: 0,
    lastStatus: "idle",
    panel: null,
    statusEl: null,
    metaEl: null,
    logEl: null,
    toggleBtn: null,
    minimized: false,
    captchaTimer: null,
    captchaTaskKey: "",
    lastPathname: location.pathname
  };

  const now = () => Date.now();
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const lower = (s) => norm(s).toLowerCase();

  function setNativeInputValue(input, value) {
    const proto = window.HTMLInputElement?.prototype;
    const desc = proto ? Object.getOwnPropertyDescriptor(proto, "value") : null;
    if (desc?.set) desc.set.call(input, value);
    else input.value = value;

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function findCaptchaElements() {
    const dialog = [...document.querySelectorAll('[role="dialog"], div, section')]
      .find((el) => isVisible(el) && /Kiểm tra anti auto click|Mật mã Pokeball|Xác minh thao tác/i.test(norm(el.textContent)));

    if (!dialog) return null;

    const promptEl = [...dialog.querySelectorAll("div,p,span")]
      .find((el) => /Mật mã Pokeball:/i.test(norm(el.textContent)));

    const input =
      dialog.querySelector('input[inputmode="numeric"]') ||
      dialog.querySelector('input[type="text"]') ||
      dialog.querySelector("input");

    const form = input?.closest("form") || dialog.querySelector("form");
    const submitBtn =
      form?.querySelector('button[type="submit"]') ||
      [...dialog.querySelectorAll("button")].find((btn) => /Xác nhận/i.test(norm(btn.textContent)));

    const promptText = norm(promptEl?.textContent || dialog.textContent || "");

    return { dialog, promptEl, promptText, input, form, submitBtn };
  }

  function parseCaptchaAnswer(text) {
    const match = norm(text).match(/(\d+)\s*([+-])\s*(\d+)\s*=\s*\?/i);
    if (!match) return null;

    const a = Number(match[1]);
    const b = Number(match[3]);
    return match[2] === "+" ? a + b : a - b;
  }

  function clearCaptchaTask({ keepKey = false } = {}) {
    if (state.captchaTimer) clearTimeout(state.captchaTimer);
    state.captchaTimer = null;
    if (!keepKey) state.captchaTaskKey = "";
  }

  function maybeSolveCaptcha() {
    const captcha = findCaptchaElements();
    if (!captcha) {
      if (state.captchaTaskKey) state.captchaTaskKey = "";
      return false;
    }

    if (!CONFIG.captcha?.autoSolve) {
      if (CONFIG.stopOnCaptcha) {
        stopInternal(`Dừng vì captcha: ${captcha.promptText}`);
      }
      return true;
    }

    const answer = parseCaptchaAnswer(captcha.promptText);
    if (answer == null) {
      if (CONFIG.captcha.stopIfUnknown) {
        stopInternal(`Captcha không parse được: ${captcha.promptText}`);
      }
      return true;
    }

    const key = `${captcha.promptText}|${answer}`;
    if (state.captchaTaskKey === key) return true;

    clearCaptchaTask();
    state.captchaTaskKey = key;

    const delay = rand(CONFIG.captcha.minDelayMs, CONFIG.captcha.maxDelayMs);
    log(`Đang giải captcha: ${captcha.promptText} -> ${answer}`);

    state.captchaTimer = setTimeout(() => {
      const live = findCaptchaElements();
      if (!live) {
        clearCaptchaTask();
        return;
      }

      const liveAnswer = parseCaptchaAnswer(live.promptText);
      const liveKey = `${live.promptText}|${liveAnswer}`;
      if (liveKey !== key) {
        clearCaptchaTask();
        return;
      }

      if (!live.input) {
        log("Không thấy ô nhập captcha", "warn");
        clearCaptchaTask();
        return;
      }

      setNativeInputValue(live.input, String(answer));

      if (live.form?.requestSubmit) live.form.requestSubmit();
      else if (live.submitBtn) live.submitBtn.click();
      else {
        live.form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }

      state.nextActionAt = now() + CONFIG.actionGapMs + 600;
      state.nextSearchAt = now() + rand(CONFIG.manualSearchMinMs, CONFIG.manualSearchMaxMs);

      log(`Đã gửi captcha: ${answer}`);
      state.captchaTimer = null;
    }, delay);

    return true;
  }

  function getMapSlug() {
    const match = location.pathname.match(/^\/map\/([^/]+)/i);
    return match ? match[1] : "";
  }

  function isMapRoute() {
    return /^\/map\/[^/]+/i.test(location.pathname);
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
  }

  function syncMetaUI() {
    if (!state.metaEl) return;
    const slug = getMapSlug() || "-";
    state.metaEl.textContent = `Map: ${slug} | Mode: ${state.mode}`;
  }

  function syncToggleUI() {
    if (!state.toggleBtn) return;
    state.toggleBtn.textContent = state.running ? "AUTO: ON" : "AUTO: OFF";
    state.toggleBtn.style.background = state.running
      ? "linear-gradient(135deg,#10b981,#059669)"
      : "linear-gradient(135deg,#ef4444,#dc2626)";
    syncMetaUI();
  }

  function log(message, type = "log") {
    state.lastStatus = message;
    if (state.statusEl) state.statusEl.textContent = message;
    if (state.logEl) state.logEl.textContent = `[${new Date().toLocaleTimeString("vi-VN")}] ${message}`;
    syncToggleUI();
    console[type](`[vnpetAuto] ${message}`);
  }

  function click(el) {
    if (!isVisible(el) || el.disabled) return false;
    el.click();
    state.nextActionAt = now() + CONFIG.actionGapMs;
    return true;
  }

  function visibleButtons() {
    return [...document.querySelectorAll("button")].filter(isVisible);
  }

  function visibleSelects() {
    return [...document.querySelectorAll("select")].filter(isVisible);
  }

  function findButton(matchers) {
    const list = Array.isArray(matchers) ? matchers : [matchers];
    return visibleButtons().find((btn) => {
      const text = norm(btn.textContent);
      return list.some((matcher) => matcher instanceof RegExp ? matcher.test(text) : lower(text).includes(lower(matcher)));
    }) || null;
  }

  function findSelectByLabel(labelRegex) {
    const nodes = [...document.querySelectorAll("span,div,label,p")].filter(isVisible);
    for (const node of nodes) {
      const text = norm(node.textContent);
      if (!text || !labelRegex.test(text)) continue;
      const row = node.closest("div");
      const select = row?.querySelector("select");
      if (isVisible(select)) return select;
    }
    return null;
  }

  function pageText() {
    return norm(document.body?.innerText || "");
  }

  function hasBuiltInAutoBlockedMessage() {
    const text = pageText();
    return /Bản đồ này là sự kiện nên tự tìm bị khóa/i.test(text);
  }

  function mapRarityLabel(raw) {
    return RARITY_MAP[String(raw || "").toUpperCase()] || "d";
  }

  function findEncounterRoot() {
    return [...document.querySelectorAll("div,section,p")].find(
      (el) => isVisible(el) && /hoang dã xuất hiện!/i.test(norm(el.textContent))
    ) || null;
  }

  function getEncounterRarity() {
    const root = findEncounterRoot();
    const text = norm(root?.textContent || "");
    const match = text.match(/\[(GOD|GR|MR|LR|UR\+|UR|SSR|SR|R|SSS\+|SSS|SS|S|A|B|C|D)\]/i);
    return mapRarityLabel(match?.[1] || "d");
  }

  function getEnterMapButton() {
    const byData = document.querySelector('[data-tutorial="enter-map"]');
    if (isVisible(byData) && !byData.disabled) return byData;

    return findButton([
      /^Vào map$/i,
      /^Vào bản đồ$/i,
      /^Vào khu vực$/i,
      /^Bắt đầu$/i,
      /^Tiến vào$/i
    ]);
  }

  function getSearchButton() {
    const byData = document.querySelector('[data-tutorial="search-map"]');
    if (isVisible(byData) && !byData.disabled) return byData;
    return findButton([/^Tìm kiếm$/i, /^Tìm$/i]);
  }

  function getCatchButton() {
    const byData = document.querySelector('[data-tutorial="catch-pokemon"]');
    if (isVisible(byData)) return byData;
    return findButton([/^Dùng bóng$/i]);
  }

  function getBattleButton() {
    return findButton([/^Chiến đấu$/i]);
  }

  function getRunButton() {
    return findButton([/^Bỏ chạy$/i, /^Bỏ qua$/i]);
  }

  function getEncounterBallSelect() {
    const catchBtn = getCatchButton();
    const selectNearCatch = catchBtn?.closest("div")?.querySelector("select");
    if (isVisible(selectNearCatch)) return selectNearCatch;

    return visibleSelects().find((select) => {
      const text = [...select.options].map((o) => norm(o.textContent)).join(" | ");
      return /Chọn bóng để bắt|~\d+%/i.test(text);
    }) || null;
  }

  function optionPercent(opt) {
    const match = norm(opt.textContent).match(/~\s*(\d+)\s*%/i);
    return match ? Number(match[1]) : -1;
  }

  function keywordScore(text, keywords) {
    const value = lower(text);
    const idx = keywords.findIndex((k) => value.includes(lower(k)));
    return idx === -1 ? 0 : (keywords.length - idx) * 1000;
  }

  function pickBestBallOption(select, keywords) {
    const options = [...select.options].filter((opt) => opt.value && !opt.disabled);
    if (!options.length) return null;

    return options
      .map((opt) => ({ opt, score: keywordScore(opt.textContent, keywords) + optionPercent(opt) }))
      .sort((a, b) => b.score - a.score)[0]?.opt || null;
  }

  function setSelectOption(select, opt) {
    if (!select || !opt) return { ok: false, changed: false };
    const changed = select.value !== opt.value;
    if (changed) {
      select.value = opt.value;
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    return { ok: true, changed };
  }

  function chooseEncounterBall() {
    const select = getEncounterBallSelect();
    if (!select) return { ok: false, changed: false, label: "Không thấy select bóng" };
    const opt = pickBestBallOption(select, CONFIG.manual.preferredBallKeywords);
    if (!opt) return { ok: false, changed: false, label: "Hết bóng" };
    const result = setSelectOption(select, opt);
    return { ...result, label: norm(opt.textContent) };
  }

  function applyBuiltInSettings() {
    const speedSelect = findSelectByLabel(/Tốc độ tìm kiếm/i);
    const formSelect = findSelectByLabel(/Dạng sẽ bắt/i);
    const ballSelect = findSelectByLabel(/Bóng dùng để bắt/i);

    if (speedSelect) {
      const speedOpt = [...speedSelect.options].find((opt) =>
        lower(opt.textContent).includes(lower(CONFIG.builtIn.speedLabelIncludes))
      );
      if (speedOpt) setSelectOption(speedSelect, speedOpt);
    }

    if (formSelect) {
      const formOpt = [...formSelect.options].find((opt) => lower(opt.value) === lower(CONFIG.builtIn.formValue));
      if (formOpt) setSelectOption(formSelect, formOpt);
    }

    if (ballSelect) {
      const ballOpt = pickBestBallOption(ballSelect, CONFIG.builtIn.preferredBallKeywords);
      if (ballOpt) setSelectOption(ballSelect, ballOpt);
    }

    visibleSelects().forEach((select) => {
      const optionText = [...select.options].map((o) => norm(o.textContent)).join(" | ");
      if (!/Dùng bóng bắt/i.test(optionText) || !/Chiến đấu/i.test(optionText)) return;

      const rowText = norm(select.closest("div")?.textContent || "");
      const match = rowText.match(/\b(GOD|GR|MR|LR|UR\+|UR|SSR|SR|R|SSS\+|SSS|SS|S|A|B|C|D)\b/i);
      const rarity = mapRarityLabel(match?.[1]);
      const action = CONFIG.manual.actionByRarity[rarity] || "run";

      const wanted = [...select.options].find((opt) => {
        const t = lower(opt.textContent);
        const v = lower(opt.value);
        if (action === "catch") return v === "catch" || t.includes("dùng bóng");
        if (action === "battle") return v === "battle" || t.includes("chiến đấu");
        return v === "run" || t.includes("bỏ qua");
      });

      if (wanted) setSelectOption(select, wanted);
    });
  }

  function getBuiltInAutoButton() {
    return findButton([/^Bật auto$/i, /^Đang chạy$/i]);
  }

  function tryStartBuiltInAuto() {
    if (hasBuiltInAutoBlockedMessage()) {
      log("Map này khóa auto built-in, chuyển sang manual");
      return false;
    }

    const autoBtn = getBuiltInAutoButton();
    const speedSelect = findSelectByLabel(/Tốc độ tìm kiếm/i);
    if (!autoBtn || !speedSelect) return false;

    applyBuiltInSettings();

    if (/^Đang chạy$/i.test(norm(autoBtn.textContent))) {
      state.mode = "built-in";
      syncMetaUI();
      log("Auto sẵn của trang đang chạy");
      return true;
    }

    if (autoBtn.disabled) {
      log("Nút auto sẵn của trang đang bị khóa", "warn");
      return false;
    }

    click(autoBtn);
    state.mode = "built-in";
    syncMetaUI();
    log("Đã bật auto sẵn của trang");
    return true;
  }

  function tryStopBuiltInAuto() {
    const autoBtn = getBuiltInAutoButton();
    if (autoBtn && /^Đang chạy$/i.test(norm(autoBtn.textContent)) && !autoBtn.disabled) {
      click(autoBtn);
      return true;
    }
    return false;
  }

  function stopInternal(message = "Đã dừng") {
    if (state.mode === "built-in") {
      tryStopBuiltInAuto();
    }
    clearCaptchaTask();
    state.running = false;
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    log(message);
  }

  function manualTick() {
    if (!isMapRoute()) {
      stopInternal(`Đã rời trang map: ${location.pathname}`);
      return;
    }

    if (now() < state.nextActionAt) return;
    if (maybeSolveCaptcha()) return;

    const enterBtn = getEnterMapButton();
    if (enterBtn) {
      if (click(enterBtn)) {
        log(`Đang vào map ${getMapSlug()}`);
      }
      return;
    }

    const encounterRoot = findEncounterRoot();
    if (encounterRoot) {
      const rarity = getEncounterRarity();
      const action = CONFIG.manual.actionByRarity[rarity] || "run";

      if (action === "catch") {
        const ball = chooseEncounterBall();
        if (!ball.ok) {
          const runBtn = getRunButton();
          if (click(runBtn)) log(`Hết bóng, bỏ qua ${rarity.toUpperCase()}`);
          return;
        }
        if (ball.changed) {
          log(`Đổi bóng: ${ball.label}`);
          state.nextActionAt = now() + 250;
          return;
        }
        if (click(getCatchButton())) {
          log(`Bắt ${rarity.toUpperCase()} bằng ${ball.label}`);
          return;
        }
      }

      if (action === "battle" && click(getBattleButton())) {
        log(`Chiến đấu với ${rarity.toUpperCase()}`);
        return;
      }

      if (click(getRunButton())) {
        log(`Bỏ qua ${rarity.toUpperCase()}`);
      }
      return;
    }

    const searchBtn = getSearchButton();
    if (searchBtn && !searchBtn.disabled && now() >= state.nextSearchAt) {
      click(searchBtn);
      state.nextSearchAt = now() + rand(CONFIG.manualSearchMinMs, CONFIG.manualSearchMaxMs);
      log(`Đang tìm kiếm ở ${getMapSlug()}`);
    }
  }

  function tick() {
    if (!state.running) return;
    if (maybeSolveCaptcha()) return;
    if (state.lastPathname !== location.pathname) {
      state.lastPathname = location.pathname;
      state.mode = "manual";
      syncMetaUI();
      log(`Đổi route sang ${location.pathname}`);
      if (CONFIG.preferBuiltInAuto && isMapRoute()) {
        tryStartBuiltInAuto();
      }
    }

    if (state.mode === "built-in") return;
    manualTick();
  }

  function togglePanel() {
    state.minimized = !state.minimized;
    if (state.panel) {
      state.panel.style.display = state.minimized ? "none" : "block";
    }
  }

  function createUI() {
    const toggleBtn = document.createElement("button");
    toggleBtn.style.cssText = [
      "position:fixed","right:16px","bottom:16px","z-index:999999","border:0","border-radius:999px",
      "padding:12px 16px","color:#fff","font:700 13px system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
      "cursor:pointer","box-shadow:0 10px 24px rgba(0,0,0,.35)"
    ].join(";");
    toggleBtn.title = "Click để bật/tắt auto. Shift+Click để ẩn/hiện panel.";
    toggleBtn.addEventListener("click", (e) => {
      if (e.shiftKey) return togglePanel();
      if (state.running) stop();
      else start();
    });
    document.body.appendChild(toggleBtn);
    state.toggleBtn = toggleBtn;

    const panel = document.createElement("div");
    panel.style.cssText = [
      "position:fixed","right:16px","bottom:68px","z-index:999998","width:340px",
      "background:rgba(17,24,39,.96)","color:#fff","border:1px solid rgba(255,255,255,.18)",
      "border-radius:10px","box-shadow:0 12px 30px rgba(0,0,0,.35)","padding:12px",
      "font:12px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
    ].join(";");

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">
        <div style="font-weight:700;font-size:13px;">VNPET Auto</div>
        <button id="vnpet-auto-hide" style="border:0;background:#334155;color:#fff;border-radius:6px;padding:4px 8px;cursor:pointer;">Ẩn panel</button>
      </div>
      <div id="vnpet-auto-meta" style="opacity:.75;margin-bottom:6px;">Map: - | Mode: manual</div>
      <div style="margin-bottom:6px;">
        <div style="opacity:.7;margin-bottom:2px;">Trạng thái</div>
        <div id="vnpet-auto-status" style="font-weight:700;">idle</div>
      </div>
      <div id="vnpet-auto-log" style="opacity:.8;min-height:18px;margin-bottom:10px;">Chưa có log</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button id="vnpet-auto-start" style="border:0;border-radius:8px;padding:7px 10px;background:#10b981;color:#fff;font-weight:700;cursor:pointer;">Start</button>
        <button id="vnpet-auto-stop" style="border:0;border-radius:8px;padding:7px 10px;background:#ef4444;color:#fff;font-weight:700;cursor:pointer;">Stop</button>
        <button id="vnpet-auto-destroy" style="border:0;border-radius:8px;padding:7px 10px;background:#64748b;color:#fff;font-weight:700;cursor:pointer;">Close</button>
      </div>
      <div style="margin-top:8px;opacity:.7;">Shift + click nút nổi để ẩn/hiện panel</div>
    `;

    document.body.appendChild(panel);
    state.panel = panel;
    state.statusEl = panel.querySelector("#vnpet-auto-status");
    state.metaEl = panel.querySelector("#vnpet-auto-meta");
    state.logEl = panel.querySelector("#vnpet-auto-log");

    panel.querySelector("#vnpet-auto-start").addEventListener("click", start);
    panel.querySelector("#vnpet-auto-stop").addEventListener("click", stop);
    panel.querySelector("#vnpet-auto-destroy").addEventListener("click", destroy);
    panel.querySelector("#vnpet-auto-hide").addEventListener("click", togglePanel);

    syncToggleUI();
  }

  function start() {
    if (state.running) {
      log("Script đang chạy rồi");
      return;
    }

    state.mode = "manual";
    syncMetaUI();

    if (CONFIG.preferBuiltInAuto && isMapRoute()) {
      tryStartBuiltInAuto();
    }

    state.running = true;
    state.nextSearchAt = now();
    state.nextActionAt = 0;
    state.timer = setInterval(tick, 250);

    if (state.mode === "built-in") log("Đang giám sát auto sẵn của trang");
    else log(`Đã bật auto thủ công cho ${getMapSlug() || location.pathname}`);
  }

  function stop() {
    stopInternal("Đã dừng bởi người dùng");
  }

  function destroy() {
    if (state.mode === "built-in") {
      tryStopBuiltInAuto();
    }
    if (state.timer) clearInterval(state.timer);
    clearCaptchaTask();
    state.timer = null;
    state.running = false;
    state.panel?.remove();
    state.toggleBtn?.remove();
    delete window.vnpetAuto;
    console.log("[vnpetAuto] destroyed");
  }

  window.vnpetAuto = {
    start,
    stop,
    destroy,
    togglePanel,
    config: CONFIG,
    status: () => ({
      running: state.running,
      mode: state.mode,
      mapSlug: getMapSlug(),
      lastStatus: state.lastStatus,
      pathname: location.pathname
    })
  };

  createUI();
  start();
})();
