import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Services } from "./pages/Services";
import { About } from "./pages/About";
import { Investments } from "./pages/Investments";
import { BlogIndex } from "./pages/Blog/BlogIndex";
import { BlogPost } from "./pages/Blog/BlogPost";
import { Contact } from "./pages/Contact";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
           <Route index element={<Home />} />
           <Route path="services" element={<Services />} />
           <Route path="about" element={<About />} />
           <Route path="investments" element={<Investments />} />
           <Route path="blog" element={<BlogIndex />} />
           <Route path="blog/:slug" element={<BlogPost />} />
           <Route path="contact" element={<Contact />} />
           {/* Fallback route */}
           <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}
