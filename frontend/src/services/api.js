const baseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request(
  path,
  { body, method = "GET", signal, blob = false } = {},
) {
  const headers = {};
  const token = localStorage.getItem("accessToken");
  if (token) headers.Authorization = `Bearer ${token}`;
  const multipart = body instanceof FormData;
  if (body !== undefined && !multipart)
    headers["Content-Type"] = "application/json";
  const response = await fetch(baseUrl + path, {
    method,
    headers,
    signal,
    body: multipart
      ? body
      : body === undefined
        ? undefined
        : JSON.stringify(body),
  });
  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("usuario");
    window.dispatchEvent(new Event("session-expired"));
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const details = data.error?.details;
    const error = new Error(
      Array.isArray(details)
        ? details.join(". ")
        : data.error?.message ||
            data.message ||
            "No se pudo completar la solicitud.",
    );
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return blob ? response.blob() : response.json();
}

export const api = {
  get: (path, signal) => request(path, { signal }),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
  download: async (lessonId, file) => {
    const blob = await request(`/lecciones/${lessonId}/archivos/${file.id}`, {
      blob: true,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.nombre_original;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
