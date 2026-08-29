export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface Enquiry {
  id: number;
  name: string;
  phone: string;
  whatsapp_consent: boolean;
  project_title: string;
  created_at: string;
}

export interface DashboardStats {
  blogs: number;
  properties: number;
  portfolioCategories: { hpg: number; partner: number };
  publishedArticles: PublishedArticle[];
}

export interface PublishedArticle {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
}

export interface ManagedBlog {
  id: number;
  title: string;
  slug: string;
  author: string;
  snippet: string;
  content: string;
  image_url: string;
  published_at: string;
  created_at: string;
}

export interface BlogInput {
  title: string;
  slug: string;
  author: string;
  snippet: string;
  content: string;
  image_url: string;
  published_at: string;
}

export interface BlogPage {
  items: ManagedBlog[];
  pagination: { page: number; limit: number; total: number };
}

export type { FeaturedProjectContent } from "../data/featuredProject";

export interface PortfolioProject {
  id: number; portfolio_category: 'hpg' | 'partner'; project_type: 'commercial' | 'residential'; title: string; location: string; description: string; price: string; image_url: string; tags: string[]; sort_order: number; is_enabled: boolean;
}
export type PortfolioInput = Omit<PortfolioProject, 'id'>;
export interface PortfolioPage { items: PortfolioProject[]; pagination: { page: number; limit: number; total: number }; }

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed. Please try again.');
  }

  return payload as T;
}

export const api = {
  login(email: string, password: string) {
    return apiRequest<{ user: { email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout() {
    return apiRequest<{ ok: true }>('/auth/logout', {
      method: 'POST',
    });
  },

  getSession() {
    return apiRequest<{ user: { email: string } | null }>('/auth/session');
  },

  createContactRequest(input: { name: string; email: string; message: string }) {
    return apiRequest<ContactRequest>('/contact-requests', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  listContactRequests() {
    return apiRequest<ContactRequest[]>('/admin/contact-requests');
  },

  createEnquiry(input: {
    name: string;
    phone: string;
    whatsapp_consent: boolean;
    project_title: string;
  }) {
    return apiRequest<Enquiry>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  listEnquiries() {
    return apiRequest<Enquiry[]>('/admin/enquiries', { cache: 'no-store' });
  },

  getDashboardStats() {
    return apiRequest<DashboardStats>('/admin/stats');
  },

  changeAdminPassword(currentPassword: string, newPassword: string) {
    return apiRequest<{ ok: true }>('/admin/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  listBlogs(params: { page?: number; limit?: number; search?: string } = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== "") as [string, string][]);
    return apiRequest<BlogPage>(`/admin/blogs?${query}`, { cache: 'no-store' });
  },

  createBlog(input: BlogInput) {
    return apiRequest<ManagedBlog>('/admin/blogs', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  updateBlog(id: number, input: BlogInput) {
    return apiRequest<ManagedBlog>(`/admin/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  deleteBlog(id: number) {
    return apiRequest<{ ok: true }>(`/admin/blogs/${id}`, { method: 'DELETE' });
  },

  getFeaturedProject() { return apiRequest<import("../data/featuredProject").FeaturedProjectContent>("/admin/featured-project", { cache: "no-store" }); },
  updateFeaturedProject(content: import("../data/featuredProject").FeaturedProjectContent) { return apiRequest<import("../data/featuredProject").FeaturedProjectContent>("/admin/featured-project", { method: "PUT", body: JSON.stringify(content) }); },

  listPortfolio(params: { page?: number; limit?: number; search?: string; category?: string; type?: string } = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== "") as [string, string][]);
    return apiRequest<PortfolioPage>(`/admin/portfolio?${query}`, { cache: 'no-store' });
  },
  createPortfolio(input: PortfolioInput) { return apiRequest<PortfolioProject>('/admin/portfolio', { method: 'POST', body: JSON.stringify(input) }); },
  updatePortfolio(id: number, input: PortfolioInput) { return apiRequest<PortfolioProject>(`/admin/portfolio/${id}`, { method: 'PUT', body: JSON.stringify(input) }); },
  deletePortfolio(id: number) { return apiRequest<{ ok: true }>(`/admin/portfolio/${id}`, { method: 'DELETE' }); },
  async uploadPortfolioImage(file: File) {
    const form = new FormData();
    form.append('image', file);
    const response = await fetch('/api/admin/portfolio/upload', { method: 'POST', credentials: 'include', body: form });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Unable to upload image.');
    return payload as { image_url: string };
  },
  async uploadImage(file: File) {
    const form = new FormData();
    form.append("image", file);
    const response = await fetch("/api/admin/media/images", { method: "POST", credentials: "include", body: form });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Unable to upload image.");
    return payload as { image_url: string };
  },
};
