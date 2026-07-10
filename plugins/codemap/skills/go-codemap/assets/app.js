/* codemap: generic shell for sidebar, theme, mobile nav, prev/next.
 * Copy this file verbatim into every generated codemap.
 * The site-specific page list lives in assets/nav.js, which must set
 * window.CODEMAP_PAGES (and optionally window.CODEMAP_TITLE) BEFORE this loads. */
(function () {
  var PAGES = window.CODEMAP_PAGES || [
    { group: "Pages", items: [{ n: "00", href: "index.html", title: "Overview" }] }
  ];
  var TITLE = window.CODEMAP_TITLE || "Code Map";

  // Flat list for prev/next
  var FLAT = [];
  PAGES.forEach(function (g) { g.items.forEach(function (it) { FLAT.push(it); }); });

  var here = location.pathname.split("/").pop() || "index.html";

  // ---- Theme ----
  var saved = null;
  try { saved = localStorage.getItem("codemap-theme"); } catch (e) {}
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    var nxt = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nxt);
    try { localStorage.setItem("codemap-theme", nxt); } catch (e) {}
    document.querySelectorAll(".theme-icon").forEach(function (el) { el.textContent = nxt === "dark" ? "☀" : "☽"; });
  }
  window.__toggleTheme = toggleTheme;

  // ---- Build sidebar ----
  var sb = document.createElement("aside");
  sb.className = "sidebar";
  var initials = (window.CODEMAP_LOGO || TITLE.replace(/[^A-Za-z0-9]/g, "").slice(0, 2) || "CM").toUpperCase();
  var html = '<div class="brand"><div class="logo">' + initials + '</div>' +
    '<div class="brand-txt"><b>' + TITLE + '</b><span>Code Map</span></div></div>';
  PAGES.forEach(function (g) {
    html += '<div class="nav-group"><div class="nav-label">' + g.group + '</div>';
    g.items.forEach(function (it) {
      var active = it.href === here ? " active" : "";
      html += '<a class="nav-link' + active + '" href="' + it.href + '">' +
        '<span class="num">' + it.n + '</span><span>' + it.title + '</span></a>';
    });
    html += '</div>';
  });
  sb.innerHTML = html;

  var layout = document.querySelector(".layout");
  if (layout) layout.insertBefore(sb, layout.firstChild);

  // ---- Topbar (mobile) ----
  var main = document.querySelector(".main");
  if (main) {
    var topbar = document.createElement("div");
    topbar.className = "topbar";
    topbar.innerHTML =
      '<button class="icon-btn" id="menuBtn" aria-label="Menu">☰</button>' +
      '<b style="font-size:.95rem">' + TITLE + '</b>' +
      '<button class="icon-btn" onclick="__toggleTheme()" aria-label="Theme"><span class="theme-icon">☽</span></button>';
    main.insertBefore(topbar, main.firstChild);
    topbar.querySelector("#menuBtn").addEventListener("click", function () {
      sb.classList.toggle("open");
      if (sb.classList.contains("open")) {
        var scrim = document.createElement("div");
        scrim.className = "scrim";
        scrim.addEventListener("click", function () { sb.classList.remove("open"); scrim.remove(); });
        document.body.appendChild(scrim);
      } else {
        var s = document.querySelector(".scrim"); if (s) s.remove();
      }
    });
  }

  // ---- Floating theme toggle (desktop) ----
  var ft = document.createElement("button");
  ft.className = "icon-btn theme-toggle";
  ft.setAttribute("aria-label", "Toggle theme");
  ft.innerHTML = '<span class="theme-icon">☽</span>';
  ft.addEventListener("click", toggleTheme);
  document.body.appendChild(ft);
  var initTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  document.querySelectorAll(".theme-icon").forEach(function (el) { el.textContent = initTheme === "dark" ? "☀" : "☽"; });

  // ---- Prev/next ----
  var idx = FLAT.findIndex(function (p) { return p.href === here; });
  if (idx >= 0) {
    var content = document.querySelector(".content");
    if (content) {
      var prev = idx > 0 ? FLAT[idx - 1] : null;
      var next = idx < FLAT.length - 1 ? FLAT[idx + 1] : null;
      var nav = document.createElement("nav");
      nav.className = "page-nav";
      nav.innerHTML =
        (prev ? '<a class="prev" href="' + prev.href + '"><div class="pn-dir">← Previous</div><div class="pn-title">' + prev.title + '</div></a>' : '<span></span>') +
        (next ? '<a class="next" href="' + next.href + '"><div class="pn-dir">Next →</div><div class="pn-title">' + next.title + '</div></a>' : '<span></span>');
      content.appendChild(nav);
    }
  }

  // ---- Click-to-anchor headings ----
  document.querySelectorAll(".content h2[id], .content h3[id]").forEach(function (h) {
    h.style.cursor = "pointer";
    h.addEventListener("click", function () { location.hash = h.id; });
  });
})();
