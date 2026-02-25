export default {
  async fetch(request, env) {
    const allowedExact = ["rungkhoai.odoo.com"];

    const allowedBaseDomains = [
      "rungkhoai.com",
      "trethanhphat.vn",
      "trethanhphat.com",
      "tpbc.top",
    ];

    const origin = request.headers.get("Origin");
    const referer = request.headers.get("Referer");

    /*
    // 🔎 Check origin only
    function isAllowed(origin) {
      if (!origin) return true;

      try {
        const hostname = new URL(origin).hostname;

        if (allowedExact.includes(hostname)) return true;

        return allowedBaseDomains.some(
          (base) => hostname === base || hostname.endsWith("." + base)
        );
      } catch {
        return false;
      }
    }
    */

    function matchHost(hostname) {
      if (!hostname) return false;

      if (allowedExact.includes(hostname)) return true;

      return allowedBaseDomains.some(
        (base) => hostname === base || hostname.endsWith("." + base),
      );
    }

    function isAllowedRequest() {
      try {
        if (origin) {
          const originHost = new URL(origin).hostname;
          if (!matchHost(originHost)) return false;
        }

        if (referer) {
          const refererHost = new URL(referer).hostname;
          if (!matchHost(refererHost)) return false;
        }

        // Allow server-side request (no header)
        if (!origin && !referer) return true;

        return true;
      } catch {
        return false;
      }
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);

    const contentType = headers.get("content-type") || "";

    const isStaticAsset =
      contentType.includes("text/css") ||
      contentType.includes("font/") ||
      contentType.includes("application/font") ||
      contentType.includes("application/octet-stream");

    // 🔒 Anti-hotlink
    if (isStaticAsset && !isAllowedRequest()) {
      return new Response("Forbidden", { status: 403 });
    }

    // 🌍 CORS
    if (origin) {
      try {
        const originHost = new URL(origin).hostname;
        if (matchHost(originHost)) {
          headers.set("Access-Control-Allow-Origin", origin);
          headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
          headers.set("Access-Control-Allow-Headers", "*");
        }
      } catch {}
    }

    // 🧠 Cache
    headers.set("CDN-Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Cache-Control", "public, max-age=604800");
    headers.set("Vary", "Origin");

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  },
};
