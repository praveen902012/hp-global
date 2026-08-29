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

  listBlogs() {
    return apiRequest<ManagedBlog[]>('/admin/blogs', { cache: 'no-store' });
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
};
