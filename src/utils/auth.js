function safeAuthHeader(headers) {
  const auth = headers?.authorization || headers?.Authorization;
  if (!auth) return null;

  if (auth.startsWith("Bearer ")) {
    const token = auth.substring(7);
    return `Bearer ${token.substring(0, 12)}...`;
  }

  if (auth.startsWith("Basic ")) {
    return "Basic ***";
  }

  return auth;
}

module.exports = { safeAuthHeader };