export default {
  async fetch(request) {
    const allowedBaseDomains = [
      "rungkhoai.com",
      "tpbc.top",
      "trethanhphat.com",
      "trethanhphat.vn",
    ];

    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    function isAllowed(origin) {
      if (!origin) return true; // cho phép truy cập trực tiếp

      try {
        const originUrl = new URL(origin);
        const hostname = originUrl.hostname;

        return allowedBaseDomains.some(
          (base) => hostname === base || hostname.endsWith("." + base),
        );
      } catch (e) {
        return false;
      }
    }

    // Chỉ bảo vệ asset
    if (
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".woff") ||
      url.pathname.endsWith(".woff2") ||
      url.pathname.endsWith(".ttf") ||
      url.pathname.endsWith(".eot")
    ) {
      if (!isAllowed(origin)) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);

    if (origin && isAllowed(origin)) {
      newHeaders.set("Access-Control-Allow-Origin", origin);
      newHeaders.set("Vary", "Origin");
    }

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  },
};
