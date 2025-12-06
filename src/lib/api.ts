function getApiBaseUrl() {
  const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || undefined;
  if (envBase && envBase.length > 0) {
    return envBase;
  }

  const { protocol, hostname } = window.location;
  const apiPort = 3000;

  return `${protocol}//${hostname}:${apiPort}/api`;
}

export const API_BASE_URL = getApiBaseUrl();

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Request failed with status ${res.status}`;
    try {
      const json = JSON.parse(text);
      if (json?.error) message = json.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    // No content
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengunggah gambar");
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error("Respons upload tidak valid");
  return data.url;
}

// Products
export async function getProducts(activeOnly: boolean = true) {
  const params = new URLSearchParams();
  if (!activeOnly) params.set("activeOnly", "false");
  const query = params.toString();
  const raw = await request<any[]>(`/products${query ? `?${query}` : ""}`);
  return raw.map((p) => ({
    ...p,
    price: Number(p.price ?? 0),
  }));
}

export async function getProductById(id: string) {
  const p = await request<any>(`/products/${id}`);
  return { ...p, price: Number(p.price ?? 0) };
}

export async function getProductVariants(productId: string, activeOnly: boolean = true) {
  const params = new URLSearchParams();
  if (!activeOnly) params.set("activeOnly", "false");
  const query = params.toString();
  const raw = await request<any[]>(`/variants/product/${productId}${query ? `?${query}` : ""}`);
  return raw.map((v) => ({
    ...v,
    extra_price: Number(v.extra_price ?? 0),
  }));
}

export async function createProduct(input: {
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  is_active: boolean;
}) {
  return request<any>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProductApi(id: string, partial: Partial<{
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
}>) {
  return request<any>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(partial),
  });
}

export async function deleteProductApi(id: string) {
  return request<void>(`/products/${id}`, {
    method: "DELETE",
  });
}

export async function createVariantApi(input: {
  product_id: string;
  name: string;
  extra_price: number;
  is_active: boolean;
}) {
  return request<any>("/variants", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateVariantApi(id: string, partial: Partial<{
  name: string;
  extra_price: number;
  is_active: boolean;
}>) {
  return request<any>(`/variants/${id}`, {
    method: "PATCH",
    body: JSON.stringify(partial),
  });
}

export async function deleteVariantApi(id: string) {
  return request<void>(`/variants/${id}`, {
    method: "DELETE",
  });
}

// Reports
export async function getReportSummary(params: { start?: string; end?: string } = {}) {
  const search = new URLSearchParams();
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  const query = search.toString();
  return request<any>(`/reports/summary${query ? `?${query}` : ""}`);
}

export async function getReportByVariant(params: { start?: string; end?: string } = {}) {
  const search = new URLSearchParams();
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  const query = search.toString();
  return request<any[]>(`/reports/by-variant${query ? `?${query}` : ""}`);
}

export function getReportExportUrl(type: "summary" | "by-variant", params: { start?: string; end?: string } = {}) {
  const search = new URLSearchParams();
  search.set("type", type);
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  const query = search.toString();
  return `${API_BASE_URL}/reports/export?${query}`;
}

// Admin users (super admin only)
export async function getAdminUsers() {
  const res = await request<any>("/admin/users");
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function createAdminUserApi(input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "super_admin";
}) {
  return request<any>("/admin/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function toggleAdminUserActiveApi(id: number, is_active: boolean) {
  return request<any>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active }),
  });
}

// Orders
export interface CreateOrderInputApi {
  customer_name: string;
  customer_whatsapp: string;
  customer_email?: string;
  notes?: string;
  items: {
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
  }[];
}

export async function createOrder(input: CreateOrderInputApi) {
  return request<any>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getOrders(filters: Record<string, string | undefined> = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return request<any[]>(`/orders${query ? `?${query}` : ""}`);
}

export async function getOrderById(id: string) {
  return request<any>(`/orders/${id}`);
}

export async function getOrderByCodePublic(code: string) {
  return request<any>(`/orders/public/by-code/${code}`);
}

export async function updateOrder(id: string, updates: any) {
  return request<any>(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function deleteOrder(id: string) {
  return request<void>(`/orders/${id}`, {
    method: "DELETE",
  });
}

// Settings
export async function getSettings() {
  return request<any>("/settings");
}

export async function updateSettingsApi(partial: any) {
  return request<any>("/settings", {
    method: "PATCH",
    body: JSON.stringify(partial),
  });
}
