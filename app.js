(() => {
  const { profiles } = window.PERSONA_DATA;
  const app = document.getElementById("app");
  const searchInput = document.getElementById("search");

  // ---------- Data helpers ----------
  const byId = Object.fromEntries(profiles.map((p) => [p.id, p]));
  const allPins = [];
  profiles.forEach((p) =>
    p.pins.forEach((pin, i) => {
      pin.id = `${p.id}-${i + 1}`;
      pin.profile = p;
    })
  );
  // Interleave pins so the feed mixes profiles (round-robin, offset per row)
  const maxLen = Math.max(...profiles.map((p) => p.pins.length));
  for (let i = 0; i < maxLen; i++) {
    const order = profiles.map((_, k) => profiles[(k + i) % profiles.length]);
    order.forEach((p) => p.pins[i] && allPins.push(p.pins[i]));
  }
  const pinById = Object.fromEntries(allPins.map((p) => [p.id, p]));

  // ---------- Local state ----------
  const store = {
    get(key) { try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); } catch { return new Set(); } },
    set(key, set) { try { localStorage.setItem(key, JSON.stringify([...set])); } catch {} },
  };
  let saved = store.get("persona.saved");
  let follows = store.get("persona.follows");

  // ---------- Utils ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "m" : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + "k" : String(n)).replace(".0", "");
  const avatar = (p, cls = "") => `<span class="avatar ${cls}"><img src="${p.pins[0].src}" alt="" loading="lazy"></span>`;
  const icon = {
    back: '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
  };

  let toastTimer;
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  // ---------- Components ----------
  function pinCard(pin, { showMeta = true } = {}) {
    const p = pin.profile;
    const isSaved = saved.has(pin.id);
    return `
      <article class="pin">
        <a class="pin-media" href="#/pin/${pin.id}" aria-label="${esc(pin.title)} by ${esc(p.name)}">
          <img src="${pin.src}" width="${pin.w}" height="${pin.h}" alt="${esc(pin.title)}" loading="lazy" decoding="async">
          <button class="pin-save ${isSaved ? "saved" : ""}" data-save="${pin.id}">${isSaved ? "Saved" : "Save"}</button>
          <span class="pin-kind">${p.kind}</span>
        </a>
        ${showMeta ? `
        <a class="pin-meta" href="#/u/${p.id}">
          ${avatar(p)}<b>${esc(p.name)}</b><span>by @${esc(p.creator.handle)}</span>
        </a>` : `<div class="pin-title">${esc(pin.title)}</div>`}
      </article>`;
  }
  const grid = (pins, opts) => `<section class="masonry">${pins.map((x) => pinCard(x, opts)).join("")}</section>`;

  function followBtn(p, cls = "btn-dark") {
    const on = follows.has(p.id);
    return `<button class="btn ${on ? "btn-soft" : cls}" data-follow="${p.id}">${on ? "Following" : "Follow"}</button>`;
  }

  // ---------- Views ----------
  const FILTERS = ["All", "Characters", "Brands", "Editorial", "Menswear", "Street", "Monochrome", "Portrait"];
  let activeFilter = "All";

  function matches(pin, q) {
    const p = pin.profile;
    if (activeFilter === "Characters" && p.kind !== "Character") return false;
    if (activeFilter === "Brands" && p.kind !== "Brand") return false;
    if (!["All", "Characters", "Brands"].includes(activeFilter) && !p.tags.includes(activeFilter)) return false;
    if (!q) return true;
    const hay = [pin.title, p.name, p.handle, p.kind, p.creator.name, p.creator.handle, ...p.tags].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  }

  function viewHome() {
    const q = searchInput.value.trim();
    const pins = allPins.filter((pin) => matches(pin, q));
    return `
      <div class="page-in">
        ${q ? "" : `
        <section class="intro">
          <h1>Faces that <em>don't exist,</em> made by people who do.</h1>
          <p>Persona is where human creators publish AI characters and brands — and where you follow them.</p>
        </section>`}
        <nav class="chips" aria-label="Filters">
          ${FILTERS.map((f) => `<button class="chip ${f === activeFilter ? "on" : ""}" data-filter="${f}">${f}</button>`).join("")}
        </nav>
        ${pins.length ? grid(pins) : `<div class="empty"><h2>Nothing yet</h2><p>No pins match “${esc(q)}”.</p></div>`}
      </div>`;
  }

  let profileTab = "pins";
  function viewProfile(id) {
    const p = byId[id];
    if (!p) return viewNotFound();
    const followers = p.followers + (follows.has(p.id) ? 1 : 0);
    const body = profileTab === "about" ? `
      <section class="about">
        <dl>
          <dt>Type</dt><dd>AI ${p.kind.toLowerCase()}</dd>
          <dt>Created by</dt><dd>${esc(p.creator.name)} · @${esc(p.creator.handle)}</dd>
          <dt>About</dt><dd>${esc(p.bio)}</dd>
          <dt>Style</dt><dd><div class="taglist">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div></dd>
          <dt>Pins</dt><dd>${p.pins.length}</dd>
        </dl>
      </section>` : grid(p.pins, { showMeta: false });

    return `
      <div class="page-in">
        <section class="profile">
          ${avatar(p, "ring")}
          <h1>${esc(p.name)}</h1>
          <div class="handle-row">@${esc(p.handle)} <span class="badge">AI ${p.kind}</span></div>
          <div class="creator-line">Created by <a href="#/u/${p.id}" data-tab="about">${esc(p.creator.name)}</a></div>
          <p class="bio">${esc(p.bio)}</p>
          <div class="stats"><span><b>${fmt(followers)}</b> followers</span><span><b>${p.following}</b> following</span><span><b>${p.pins.length}</b> pins</span></div>
          <div class="actions">
            <button class="btn btn-soft btn-icon" data-share aria-label="Share">${icon.share}</button>
            ${followBtn(p)}
            <button class="btn btn-soft" data-toast="Messaging is coming soon">Message</button>
          </div>
        </section>
        <nav class="tabs">
          <button class="${profileTab === "pins" ? "on" : ""}" data-tab="pins">Created</button>
          <button class="${profileTab === "about" ? "on" : ""}" data-tab="about">About</button>
        </nav>
        ${body}
      </div>`;
  }

  function viewPin(id) {
    const pin = pinById[id];
    if (!pin) return viewNotFound();
    const p = pin.profile;
    const isSaved = saved.has(pin.id);
    const more = p.pins.filter((x) => x !== pin).concat(allPins.filter((x) => x.profile !== p).slice(0, 6));
    return `
      <div class="page-in">
        <a class="back" href="javascript:history.back()" aria-label="Back">${icon.back}</a>
        <article class="detail">
          <div class="detail-media"><img src="${pin.src}" width="${pin.w}" height="${pin.h}" alt="${esc(pin.title)}"></div>
          <div class="detail-body">
            <div class="detail-top">
              <button class="btn btn-soft btn-icon" data-share aria-label="Share">${icon.share}</button>
              <button class="btn btn-soft btn-icon" data-toast="More options coming soon" aria-label="More">${icon.more}</button>
              <button class="btn ${isSaved ? "btn-soft" : "btn-dark"}" data-save="${pin.id}">${isSaved ? "Saved" : "Save"}</button>
            </div>
            <h1>${esc(pin.title)}</h1>
            <p>${esc(p.bio)}</p>
            <div class="taglist">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}<span class="tag">AI ${p.kind.toLowerCase()}</span></div>
            <div class="by">
              <a href="#/u/${p.id}">${avatar(p)}</a>
              <a class="by-text" href="#/u/${p.id}"><b>${esc(p.name)}</b><small>${fmt(p.followers)} followers · by @${esc(p.creator.handle)}</small></a>
              ${followBtn(p, "btn-line")}
            </div>
          </div>
        </article>
        <h2 class="section-title">More like this</h2>
        ${grid(more)}
      </div>`;
  }

  function viewDirectory() {
    return `
      <div class="page-in">
        <section class="intro">
          <h1>Characters <em>&amp;</em> brands</h1>
          <p>Every profile is an AI persona, built and run by a human creator.</p>
        </section>
        <section class="dir">
          ${profiles.map((p) => `
            <a class="card" href="#/u/${p.id}">
              <div class="collage">${[0, 2, 4].map((i) => `<img src="${p.pins[i].src}" alt="" loading="lazy">`).join("")}</div>
              <div class="card-meta">
                ${avatar(p)}
                <div><b>${esc(p.name)} <span class="badge">${p.kind}</span></b><small>${fmt(p.followers)} followers · by ${esc(p.creator.name)}</small></div>
              </div>
            </a>`).join("")}
        </section>
      </div>`;
  }

  function viewSaved() {
    const pins = allPins.filter((x) => saved.has(x.id));
    return `
      <div class="page-in">
        <section class="intro"><h1>Your <em>saves</em></h1><p>${pins.length} pin${pins.length === 1 ? "" : "s"} saved on this device.</p></section>
        ${pins.length ? grid(pins) : `<div class="empty"><h2>Nothing saved yet</h2><p>Tap Save on any pin to keep it here.</p><a class="btn btn-dark" href="#/">Explore</a></div>`}
      </div>`;
  }

  function viewCreate() {
    return `
      <div class="page-in empty">
        <h2>Build a persona</h2>
        <p>Creator tools — upload a character, set a voice, publish a brand — land in the next version.</p>
        <a class="btn btn-dark" href="#/directory">See existing personas</a>
      </div>`;
  }

  const viewNotFound = () => `<div class="page-in empty"><h2>Not found</h2><p>This page doesn’t exist.</p><a class="btn btn-dark" href="#/">Back home</a></div>`;

  // ---------- Router ----------
  let lastRoute = "";
  function render() {
    const hash = location.hash.replace(/^#/, "") || "/";
    const [, section, arg] = hash.split("/");
    if (hash !== lastRoute && section !== "u") profileTab = "pins";
    const routeChanged = hash !== lastRoute;
    lastRoute = hash;

    let html, nav = "";
    switch (section) {
      case "": html = viewHome(); nav = "home"; break;
      case "u": html = viewProfile(arg); break;
      case "pin": html = viewPin(arg); break;
      case "directory": html = viewDirectory(); nav = "directory"; break;
      case "saved": html = viewSaved(); break;
      case "create": html = viewCreate(); break;
      default: html = viewNotFound();
    }
    app.innerHTML = html;
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === nav));
    const titleBits = { u: byId[arg]?.name, pin: pinById[arg]?.title, directory: "Creators", saved: "Saves", create: "Create" };
    document.title = (titleBits[section] ? titleBits[section] + " — " : "") + "Persona";
    if (routeChanged) window.scrollTo(0, 0);
  }

  // ---------- Events ----------
  document.addEventListener("click", (e) => {
    const saveBtn = e.target.closest("[data-save]");
    if (saveBtn) {
      e.preventDefault(); e.stopPropagation();
      const id = saveBtn.dataset.save;
      saved.has(id) ? saved.delete(id) : saved.add(id);
      store.set("persona.saved", saved);
      toast(saved.has(id) ? "Saved to your profile" : "Removed from saves");
      return render();
    }
    const followBtnEl = e.target.closest("[data-follow]");
    if (followBtnEl) {
      const id = followBtnEl.dataset.follow;
      follows.has(id) ? follows.delete(id) : follows.add(id);
      store.set("persona.follows", follows);
      toast(follows.has(id) ? `Following ${byId[id].name}` : `Unfollowed ${byId[id].name}`);
      return render();
    }
    const filter = e.target.closest("[data-filter]");
    if (filter) { activeFilter = filter.dataset.filter; return render(); }
    const tab = e.target.closest("[data-tab]");
    if (tab) { e.preventDefault(); profileTab = tab.dataset.tab; return render(); }
    if (e.target.closest("[data-share]")) {
      navigator.clipboard?.writeText(location.href).catch(() => {});
      return toast("Link copied");
    }
    const t = e.target.closest("[data-toast]");
    if (t) return toast(t.dataset.toast);
  });

  searchInput.addEventListener("input", () => {
    if (location.hash && location.hash !== "#/") location.hash = "#/";
    else render();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
  });

  window.addEventListener("hashchange", render);
  render();
})();
