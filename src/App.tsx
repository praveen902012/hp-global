import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";

// Lazy load pages
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Services = lazy(() => import("./pages/Services").then(m => ({ default: m.Services })));
const About = lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const Investments = lazy(() => import("./pages/Investments").then(m => ({ default: m.Investments })));
const BlogIndex = lazy(() => import("./pages/Blog/BlogIndex").then(m => ({ default: m.BlogIndex })));
const BlogPost = lazy(() => import("./pages/Blog/BlogPost").then(m => ({ default: m.BlogPost })));
const Contact = lazy(() => import("./pages/Contact").then(m => ({ default: m.Contact })));
const AdminLayout = lazy(() => import("./pages/Admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import("./pages/Admin/Login").then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard").then(m => ({ default: m.AdminDashboard })));
const FeaturedProject = lazy(() => import("./pages/FeaturedProject").then(m => ({ default: m.FeaturedProject })));
const AdminEnquiries = lazy(() => import("./pages/Admin/Enquiries").then(m => ({ default: m.AdminEnquiries })));
const AdminContacts = lazy(() => import("./pages/Admin/Contacts").then(m => ({ default: m.AdminContacts })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy").then(m => ({ default: m.PrivacyPolicy })));

// Simple loading fallback
const PageLoading = () => (
  <div className="min-h-screen bg-brand-white flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-brand-champagne/20 border-t-brand-champagne rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="about" element={<About />} />
            <Route path="investments" element={<Investments />} />
            <Route path="blog" element={<BlogIndex />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="featured-project" element={<FeaturedProject />} />
            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            {/* Placeholder routes that we will build next */}
            <Route path="articles" element={<div className="p-10 text-2xl">Articles coming soon...</div>} />
            <Route path="properties" element={<div className="p-10 text-2xl">Properties coming soon...</div>} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="contacts" element={<AdminContacts />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
