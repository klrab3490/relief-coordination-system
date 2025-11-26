// Enhanced routes renderer with filters, grouping, copy, theme toggle & controls.

// --- DOM references ---
const searchInput = document.getElementById("search");
const methodFilter = document.getElementById("methodFilter");
const clearBtn = document.getElementById("clearFilters");
const collapseBtn = document.getElementById("collapseAll");
const expandBtn = document.getElementById("expandAll");
const themeToggle = document.getElementById("themeToggle");

// --- Theme handling ---
(function initTheme() {
    if (!themeToggle) return;

    const applyLabel = () => {
        const isDark = document.body.classList.contains("theme-dark");
        const span = themeToggle.querySelector("span:last-child");
        if (span) span.textContent = isDark ? "Light mode" : "Dark mode";
    };

    // default to dark
    const stored = window.localStorage.getItem("api-explorer-theme");
    if (stored === "dark" || !stored) {
        document.body.classList.add("theme-dark");
    } else if (stored === "light") {
        document.body.classList.remove("theme-dark");
    }
    applyLabel();

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("theme-dark");
        const isDark = document.body.classList.contains("theme-dark");
        window.localStorage.setItem("api-explorer-theme", isDark ? "dark" : "light");
        applyLabel();
    });
})();

// --- Method colour + badges ---
function methodColor(method) {
    const m = (method || "").toUpperCase();
    switch (m) {
        case "POST":
            return { classes: "bg-blue-100 text-blue-800", fallback: { bg: "#DBEAFE", color: "#1D4ED8" } };
        case "PUT":
            return { classes: "bg-yellow-100 text-yellow-800", fallback: { bg: "#FEF3C7", color: "#92400E" } };
        case "PATCH":
            return { classes: "bg-indigo-100 text-indigo-800", fallback: { bg: "#EDE9FE", color: "#4C1D95" } };
        case "DELETE":
            return { classes: "bg-red-100 text-red-800", fallback: { bg: "#FEE2E2", color: "#B91C1C" } };
        case "GET":
        default:
            return { classes: "bg-green-100 text-green-800", fallback: { bg: "#DCFCE7", color: "#166534" } };
    }
}

function createMethodBadge(method) {
    const span = document.createElement("span");
    const info = methodColor(method);
    span.className = `method-pill ${info.classes}`;
    span.style.backgroundColor = info.fallback.bg;
    span.style.color = info.fallback.color;
    span.innerText = method;
    return span;
}

// --- Path copying helpers ---
const groupPrefixMap = {
    "Auth Route": "/api",
    "Admin Route": "/api",
    "User Route": "/api",
    "Report Route": "/api",
    "Volunteer Route": "/api",
};

function computeCopyPath(origPath, groupName) {
    if (!origPath) return origPath;
    const path = String(origPath);
    if (!groupName || groupName === "Basic") return path;
    const prefix = groupPrefixMap[groupName];
    if (!prefix) return path;
    if (path.startsWith(prefix)) return path;
    if (path.startsWith("/api")) return path;
    return prefix.replace(/\/$/, "") + "/" + path.replace(/^\/+/, "");
}

function createCopyButton(path, groupName) {
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.title = "Copy path";
    btn.innerText = "Copy";
    btn.addEventListener("click", async () => {
        try {
            const toCopy = computeCopyPath(path, groupName);
            await navigator.clipboard.writeText(toCopy);
            const original = btn.innerText;
            btn.innerText = "Copied";
            setTimeout(() => (btn.innerText = original), 1200);
        } catch (err) {
            console.error("copy failed", err);
        }
    });
    return btn;
}

// --- Core renderer ---
function renderRoutes(data) {
    const container = document.getElementById("routes");
    if (!container) return;
    container.innerHTML = "";
    container.classList.remove("empty-state");

    const groups = data.groups ?? data.routes ?? data;

    const search = (searchInput?.value || "").toLowerCase().trim();
    const methodSel = (methodFilter?.value || "").toUpperCase().trim();

    let totalShown = 0;

    const makeCard = (route, methods, path, groupName) => {
        const card = document.createElement("div");
        card.className = "route-card";

        const primary = (methods && methods.length ? methods[0] : "GET") || "GET";
        const info = methodColor(primary.toUpperCase());
        // colored left border (Stripe/Postman style)
        card.style.borderLeftColor = info.fallback.color;

        const badgeWrap = document.createElement("div");
        badgeWrap.className = "method-title";
        methods.forEach((m) => badgeWrap.appendChild(createMethodBadge((m || "GET").toUpperCase())));

        const methodLabel = document.createElement("div");
        methodLabel.className = "muted";
        methodLabel.innerText = "Method:";

        const methodNames = document.createElement("div");
        methodNames.className = "method-names";
        methodNames.appendChild(document.createTextNode(methods.join(", ")));

        const pathLabel = document.createElement("div");
        pathLabel.className = "muted";
        pathLabel.innerText = "Path:";

        const pathEl = document.createElement("div");
        pathEl.className = "font-mono text-blue-400 break-all";
        pathEl.innerText = path;

        const copyWrap = document.createElement("div");
        copyWrap.className = "actions";
        copyWrap.appendChild(createCopyButton(path, groupName));

        card.appendChild(badgeWrap);
        card.appendChild(methodLabel);
        card.appendChild(methodNames);
        card.appendChild(pathLabel);
        card.appendChild(pathEl);
        card.appendChild(copyWrap);

        return card;
    };

    // When /list returns a flat array
    if (Array.isArray(groups)) {
        const grid = document.createElement("div");
        grid.className = "grid mb-4";

        groups.forEach((r) => {
            const methods = Array.isArray(r.methods)
                ? r.methods
                : [r.methods ?? r.method ?? "GET"];
            const path = r.path ?? r.route ?? String(r);

            if (search && !(path.toLowerCase().includes(search) || methods.join(" ").toLowerCase().includes(search)))
                return;
            if (methodSel && !methods.map((m) => m.toUpperCase()).includes(methodSel)) return;

            totalShown++;
            grid.appendChild(makeCard(r, methods, path));
        });

        if (totalShown === 0) {
            container.classList.add("empty-state");
            container.innerText = "No routes match your filters.";
            document.getElementById("count").innerText = 0;
            return;
        }

        container.appendChild(grid);
        document.getElementById("count").innerText = totalShown;
        return;
    }

    // When /list returns object keyed by group
    Object.keys(groups).forEach((groupName) => {
        const group = groups[groupName] ?? [];
        const matched = [];

        group.forEach((r) => {
            const methods = Array.isArray(r.methods)
                ? r.methods
                : [r.methods ?? r.method ?? "GET"];
            const path = r.path ?? r.route ?? String(r);

            if (search && !(path.toLowerCase().includes(search) || methods.join(" ").toLowerCase().includes(search)))
                return;
            if (methodSel && !methods.map((m) => m.toUpperCase()).includes(methodSel)) return;

            matched.push({ r, methods, path });
        });

        if (matched.length === 0) return;

        totalShown += matched.length;

        const details = document.createElement("details");
        details.className = "mb-4";
        details.open = true;

        const summary = document.createElement("summary");
        summary.className = "group-header";
        summary.innerText = `${groupName} (${matched.length})`;
        details.appendChild(summary);

        const grid = document.createElement("div");
        grid.className = "grid";

        matched.forEach(({ r, methods, path }) => {
            const card = makeCard(r, methods, path, groupName);
            grid.appendChild(card);
        });

        details.appendChild(grid);
        container.appendChild(details);
    });

    if (totalShown === 0) {
        container.classList.add("empty-state");
        container.innerText = "No routes match your filters.";
    }

    const countEl = document.getElementById("count");
    if (countEl) countEl.innerText = totalShown;
}

// --- Controls: filters + expand/collapse ---
if (searchInput) searchInput.addEventListener("input", () => loadRoutes());
if (methodFilter) methodFilter.addEventListener("change", () => loadRoutes());
if (clearBtn)
    clearBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (methodFilter) methodFilter.value = "";
        loadRoutes();
    });

if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
        document.querySelectorAll("#routes details").forEach((d) => {
            d.open = false;
        });
    });
}
if (expandBtn) {
    expandBtn.addEventListener("click", () => {
        document.querySelectorAll("#routes details").forEach((d) => {
            d.open = true;
        });
    });
}

// --- Fetch + auto-refresh ---
async function loadRoutes() {
    try {
        const res = await fetch("/list");
        if (!res.ok) {
            console.error("Failed to fetch routes:", res.status, res.statusText);
            const container = document.getElementById("routes");
            if (container) {
                container.classList.add("empty-state");
                container.innerText = "Failed to load routes (see console).";
            }
            return;
        }
        const data = await res.json();
        if (!data) {
            const container = document.getElementById("routes");
            if (container) {
                container.classList.add("empty-state");
                container.innerText = "No data returned from server.";
            }
            return;
        }
        renderRoutes(data);
    } catch (err) {
        console.error(err);
        const container = document.getElementById("routes");
        if (container) {
            container.classList.add("empty-state");
            container.innerText = "Error loading routes. See console.";
        }
    }
}

// Initial load + polling
window.addEventListener("load", loadRoutes);