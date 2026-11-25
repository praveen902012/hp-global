export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  message: string;
  read_at?: string | null;
  created_at: string;
}

export type EnquiryStatus = "new" | "contacted" | "closed";

export interface Enquiry {
  id: number;
  name: string;
  phone: string;
  whatsapp_consent: boolean;
  project_title: string;
  source?: string;
  status?: EnquiryStatus;
  notes?: string;
  created_at: string;
}

export interface AttentionItem { id: string; title: string; detail: string; href: string; tone: "warning" | "info" }

export interface DashboardStats {
  counts: {
    new_enquiries: number; enquiries_week: number; waiting_enquiries: number;
    unread_contacts: number; contacts_week: number;
    live_projects: number; hidden_projects: number;
    published_articles: number; draft_articles: number; press_items: number;
  };
  latestEnquiries: Enquiry[];
  latestContacts: ContactRequest[];
  attention: AttentionItem[];
}

export interface SearchResult { type: "Project" | "Article" | "Page" | "Press" | "Enquiry" | "Contact request"; title: string; detail: string; href: string }

export interface ManagedBlog {
  id: number;
  title: string;
  slug: string;
  author: string;
  snippet: string;
  content: string;
  image_url: string;
  published_at: string;
  is_draft: boolean;
  updated_at?: string;
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
  is_draft: boolean;
}

export interface BlogPage {
  items: ManagedBlog[];
  pagination: { page: number; limit: number; total: number };
  counts: { published: number; draft: number };
}

export type { FeaturedProjectContent } from "../data/featuredProject";

export interface PortfolioProject {
  id: number; portfolio_category: 'hpg' | 'partner'; project_type: 'commercial' | 'residential'; title: string; location: string; description: string; price: string; image_url: string; tags: string[]; sort_order: number; is_enabled: boolean;
  slug: string; status: string; is_featured: boolean; details: import("../data/projects").ProjectDetails;
}
export type PortfolioInput = Omit<PortfolioProject, 'id'>;
export interface PortfolioPage { items: PortfolioProject[]; pagination: { page: number; limit: number; total: number }; }

export type AdminPage = import("../data/pages").SitePage & { menus: ("header" | "footer")[] };

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
    return apiRequest<ContactRequest[]>('/admin/contact-requests', { cache: 'no-store' });
  },

  createEnquiry(input: {
    name: string;
    phone: string;
    whatsapp_consent: boolean;
    project_title: string;
    source?: string;
  }) {
    return apiRequest<Enquiry>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  listEnquiries() {
    return apiRequest<Enquiry[]>('/admin/enquiries', { cache: 'no-store' });
  },

  updateEnquiry(id: number, input: { status?: EnquiryStatus; notes?: string }) {
    return apiRequest<Enquiry>(`/admin/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },

  deleteEnquiry(id: number) {
    return apiRequest<{ ok: true }>(`/admin/enquiries/${id}`, { method: 'DELETE' });
  },

  markContactRequest(id: number, read: boolean) {
    return apiRequest<ContactRequest>(`/admin/contact-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ read }) });
  },

  deleteContactRequest(id: number) {
    return apiRequest<{ ok: true }>(`/admin/contact-requests/${id}`, { method: 'DELETE' });
  },

  getAdminCounts() {
    return apiRequest<{ enquiries: number; contacts: number }>('/admin/counts', { cache: 'no-store' });
  },

  searchAdmin(q: string) {
    return apiRequest<{ results: SearchResult[] }>(`/admin/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
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

  getBlog(id: number) {
    return apiRequest<ManagedBlog>(`/admin/blogs/${id}`, { cache: 'no-store' });
  },

  listBlogs(params: { page?: number; limit?: number; search?: string; status?: string } = {}) {
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

  getMenu() { return apiRequest<import("../data/siteMenu").SiteMenu>("/admin/menu", { cache: "no-store" }); },
  updateMenu(menu: import("../data/siteMenu").SiteMenu) { return apiRequest<import("../data/siteMenu").SiteMenu>("/admin/menu", { method: "PUT", body: JSON.stringify(menu) }); },

  listPages() { return apiRequest<import("../data/pages").PageSummary[]>("/admin/pages", { cache: "no-store" }); },
  createPage(input: { title: string; slug: string }) { return apiRequest<import("../data/pages").SitePage>("/admin/pages", { method: "POST", body: JSON.stringify(input) }); },
  getPage(id: number) { return apiRequest<AdminPage>(`/admin/pages/${id}`, { cache: "no-store" }); },
  updatePage(id: number, content: import("../data/pages").PageContent) { return apiRequest<AdminPage>(`/admin/pages/${id}`, { method: "PUT", body: JSON.stringify(content) }); },
  setPagePublished(id: number, input: { published: boolean; add_to_menu?: ("header" | "footer")[]; menu_label?: string }) { return apiRequest<AdminPage & { menu_full: ("header" | "footer")[]; removed_menu_links: number }>(`/admin/pages/${id}/publish`, { method: "POST", body: JSON.stringify(input) }); },
  deletePage(id: number) { return apiRequest<{ ok: true; removed_menu_links: number }>(`/admin/pages/${id}`, { method: "DELETE" }); },
  getSiteDetails() { return apiRequest<import("../data/siteDetails").SiteDetails>("/admin/site-details", { cache: "no-store" }); },
  saveSiteDetails(details: import("../data/siteDetails").SiteDetails) { return apiRequest<import("../data/siteDetails").SiteDetails>("/admin/site-details", { method: "PUT", body: JSON.stringify(details) }); },

  listPress() { return apiRequest<{ items: import("../data/press").PressClipping[]; projects: string[]; featured_project: string }>("/admin/press", { cache: "no-store" }); },
  createPress(input: import("../data/press").PressClippingInput) { return apiRequest<import("../data/press").PressClipping>("/admin/press", { method: "POST", body: JSON.stringify(input) }); },
  updatePress(id: number, input: import("../data/press").PressClippingInput) { return apiRequest<import("../data/press").PressClipping>(`/admin/press/${id}`, { method: "PUT", body: JSON.stringify(input) }); },
  deletePress(id: number) { return apiRequest<{ ok: true }>(`/admin/press/${id}`, { method: "DELETE" }); },

  listPortfolio(params: { page?: number; limit?: number; search?: string; category?: string; type?: string } = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== "") as [string, string][]);
    return apiRequest<PortfolioPage>(`/admin/portfolio?${query}`, { cache: 'no-store' });
  },
  createPortfolio(input: PortfolioInput) { return apiRequest<PortfolioProject>('/admin/portfolio', { method: 'POST', body: JSON.stringify(input) }); },
  updatePortfolio(id: number, input: PortfolioInput) { return apiRequest<PortfolioProject>(`/admin/portfolio/${id}`, { method: 'PUT', body: JSON.stringify(input) }); },
  reorderPortfolio(ids: number[]) { return apiRequest<{ ok: true }>('/admin/portfolio/reorder', { method: 'POST', body: JSON.stringify({ ids }) }); },
  getPortfolio(id: number) { return apiRequest<PortfolioProject>(`/admin/portfolio/${id}`, { cache: 'no-store' }); },
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
  async uploadDocument(file: File) {
    const form = new FormData();
    form.append("document", file);
    const response = await fetch("/api/admin/media/documents", { method: "POST", credentials: "include", body: form });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Unable to upload document.");
    return payload as { document_url: string; name: string; size: string };
  },
};
