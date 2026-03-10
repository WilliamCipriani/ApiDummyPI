const requests = [];
let requestCounter = 1;
const MAX_REQUESTS = 100;

function saveRequest(req, extra = {}) {
  const entry = {
    id: requestCounter++,
    receivedAt: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query || {},
    authorizationPreview: getAuthorizationPreview(req.headers),
    headers: req.headers || {},
    body: req.body || null,
    extra
  };

  requests.push(entry);

  if (requests.length > MAX_REQUESTS) {
    requests.shift();
  }

  return entry;
}

function getAuthorizationPreview(headers) {
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

function getAllRequests() {
  return requests;
}

function getLatestRequest() {
  return requests.length ? requests[requests.length - 1] : null;
}

function getRequestById(id) {
  return requests.find(r => r.id === Number(id)) || null;
}

function clearRequests() {
  requests.length = 0;
}

module.exports = {
  saveRequest,
  getAllRequests,
  getLatestRequest,
  getRequestById,
  clearRequests
};