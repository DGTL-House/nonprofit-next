// UTM / click-id forwarding.
//
// Captures attribution params from the landing URL into sessionStorage and
// appends them to outbound booking-widget links, so attribution survives the
// cross-domain handoff to api.dgtl-house.com and reaches the CRM.
//
//   https://non-profit.dgtl-house.com/?fbclid=…&utm_source=facebook&…
//     -> https://api.dgtl-house.com/widget/bookings/dgtlhouse-nonprofits?fbclid=…&utm_source=facebook&…

const FORWARD_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "_gl",
] as const;

// Outbound hosts whose links should carry the attribution params.
const FORWARD_HOSTS = ["api.dgtl-house.com"];

const STORAGE_KEY = "dgtl_utm_params";

type Params = Record<string, string>;

function readFromLocation(): Params {
  const params = new URLSearchParams(window.location.search);
  const out: Params = {};
  FORWARD_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) out[k] = v;
  });
  return out;
}

function readStored(): Params {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Params) : {};
  } catch {
    return {};
  }
}

function writeStored(data: Params): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* private mode / storage disabled — links still work for this pageview */
  }
}

/** Capture params from the current URL and merge them into sessionStorage. */
export function captureUtmParams(): Params {
  const fromUrl = readFromLocation();
  if (Object.keys(fromUrl).length > 0) {
    const merged = { ...readStored(), ...fromUrl };
    writeStored(merged);
    return merged;
  }
  return readStored();
}

/** Current param set — the URL wins over what was stored earlier. */
export function getUtmParams(): Params {
  return { ...readStored(), ...readFromLocation() };
}

/**
 * Return `url` with the attribution params appended. Params already present on
 * the target URL are left untouched.
 */
export function appendUtmParams(url: string): string {
  if (!url) return url;
  const utm = getUtmParams();
  const keys = Object.keys(utm);
  if (keys.length === 0) return url;
  try {
    const u = new URL(url, window.location.origin);
    keys.forEach((k) => {
      if (!u.searchParams.has(k)) u.searchParams.set(k, utm[k]);
    });
    return u.toString();
  } catch {
    return url;
  }
}

function shouldForward(href: string): boolean {
  try {
    const u = new URL(href, window.location.origin);
    return FORWARD_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

/** Rewrite every outbound booking link currently in the document. */
export function decorateBookingLinks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || !shouldForward(href)) return;
    a.setAttribute("href", appendUtmParams(href));
  });
}

/**
 * Entry point: capture on load, decorate existing links, and keep decorating
 * links that appear later (the page swaps blocks in and out client-side).
 */
export function initUtmForwarding(): void {
  captureUtmParams();
  decorateBookingLinks();

  if (typeof MutationObserver === "undefined") return;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches("a[href]")) {
          const href = node.getAttribute("href");
          if (href && shouldForward(href)) {
            node.setAttribute("href", appendUtmParams(href));
          }
        }
        decorateBookingLinks(node);
      });
    });
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
