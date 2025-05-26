const getClientIp = (ctx) => {
  return (
    ctx.ip || // ✅ Works if `app.proxy = true`
    ctx.request.headers["x-forwarded-for"]?.split(",")[0] || // ✅ Proxy IPs list
    ctx.request.headers["x-real-ip"] || // ✅ Some proxies use this
    ctx.request.connection?.remoteAddress || // ✅ Direct connection IP
    "UNKNOWN"
  );
};

const getUserAgent = (ctx) => {
  return ctx.request.headers["user-agent"] || "UNKNOWN"; // ✅ Extracts User-Agent
};

module.exports = { getClientIp, getUserAgent }
