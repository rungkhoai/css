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
    const url = new URL(request.url);

    function isAllowed(origin) {
      if (!origin) return true;

      try {
        const hostname = new URL(origin).hostname;

        if (allowedExact.includes(hostname)) return true;

        return allowedBaseDomains.some(
          (base) => hostname === base || hostname.endsWith("." + base),
        );
      } catch {
        return false;
      }
    }

    // Serve asset
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);

    const contentType = headers.get("content-type") || "";

    const isStaticAsset =
      contentType.includes("text/css") ||
      contentType.includes("font/") ||
      contentType.includes("application/font") ||
      contentType.includes("application/octet-stream");

    if (origin && isAllowed(origin) && isStaticAsset) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "*");
      headers.set("Vary", "Origin");
    }

    if (isStaticAsset) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  },
};
