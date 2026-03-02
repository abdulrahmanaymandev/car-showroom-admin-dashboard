const BASE = "https://api.api-ninjas.com/v1";

function getKey() {
  const key = import.meta.env.VITE_NINJAS_KEY;
  if (!key) throw new Error("Missing VITE_NINJAS_KEY in .env");
  return key;
}

export async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Api-Key": getKey() },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${txt || "Request failed"}`);
  }

  return res.json();
}

export const CarsAPI = {
  getMakes: (year) => apiGet(`/carmakes${year ? `?year=${encodeURIComponent(year)}` : ""}`),
  getModels: (make, year) =>
    apiGet(`/carmodels?make=${encodeURIComponent(make)}${year ? `&year=${encodeURIComponent(year)}` : ""}`),
  getTrims: (make, model, year) =>
    apiGet(
      `/cartrims?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${
        year ? `&year=${encodeURIComponent(year)}` : ""
      }`
    ),
  getDetails: (make, model, trim, year) =>
    apiGet(
      `/cardetails?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&trim=${encodeURIComponent(
        trim
      )}${year ? `&year=${encodeURIComponent(year)}` : ""}`
    ),
};
