import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

export default {
  async fetch(request, env, ctx) {
    const allowedExact = ["rungkhoai.odoo.com"];

    const allowedBaseDomains = [
      "rungkhoai.com",
      "trethanhphat.vn",
      "trethanhphat.com",
      "tpbc.top",
    ];

    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

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

    const isAsset =
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".woff") ||
      url.pathname.endsWith(".woff2") ||
      url.pathname.endsWith(".ttf") ||
      url.pathname.endsWith(".eot");

    if (isAsset && !isAllowed(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    // Serve static file từ /public
    const response = await env.ASSETS.fetch(request);

    const headers = new Headers(response.headers);

    if (origin && isAllowed(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Vary", "Origin");
    }

    if (isAsset) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  },
};
