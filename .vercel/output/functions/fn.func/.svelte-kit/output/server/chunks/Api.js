const getWheel = async (path, uid, apiKey, fetch = window.fetch) => {
  const headers = {};
  {
    headers["x-api-key"] = apiKey;
  }
  const response = await fetch(`/api/wheels/${path}`, { headers });
  return await response.json();
};
const wheelVisibilities = ["public", "private"];
export {
  getWheel as g,
  wheelVisibilities as w
};
