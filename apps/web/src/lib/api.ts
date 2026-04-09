import type { InputFile } from "@geosurvey-ai/shared";

export type PaginatedResponse<T> = {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function getToken(): Promise<string | null> {
  try {
    const clerk = (window as Window & { Clerk?: { session?: { getToken?: () => Promise<string | null> } } }).Clerk;
    return clerk ? await clerk.session?.getToken?.() ?? null : null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error ?? "Request failed");
  }

  const payload = await response.json() as { data: T; pagination?: PaginatedResponse<unknown>["pagination"] };
  if (payload.pagination) {
    return {
      data: payload.data,
      pagination: payload.pagination
    } as T;
  }
  return payload.data as T;
}

async function apiFetchForm<T>(path: string, formData: FormData, init?: Omit<RequestInit, "body" | "headers">): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    method: init?.method ?? "POST",
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error ?? "Request failed");
  }

  const payload = await response.json();
  return payload.data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  return apiFetchForm<T>(path, formData, { method: "POST" });
}

export async function apiDelete<T = void>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE" });
}

export function apiUrl(path: string) {
  return `${BASE}${path}`;
}

export async function apiUpload(
  jobId: string,
  file: File,
  onProgress: (pct: number) => void,
  signal?: AbortSignal
): Promise<InputFile> {
  const token = await getToken();
  return new Promise<InputFile>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", `${BASE}/api/jobs/${jobId}/upload`);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onabort = () => reject(new Error("Upload aborted"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const payload = JSON.parse(xhr.responseText) as { data: InputFile };
        resolve(payload.data);
      } else {
        try {
          const payload = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(payload.error ?? "Upload failed"));
        } catch {
          reject(new Error("Upload failed"));
        }
      }
    };

    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(formData);
  });
}
