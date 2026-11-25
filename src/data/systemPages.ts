import { ENQUIRE_LINK, type PageSection } from "./pages";

/**
 * Built-in website pages that open in the page builder. Their starting content is exactly
 * what the hand-built pages showed, so nothing changes on the site until an editor publishes.
 */
export interface SystemPageDefinition {
  key: string;
  /** Stored slug ("" for the home page). */
  slug: string;
  path: string;
  title: string;
  meta_description: string;
  sections: () => PageSection[];
}

const HERO_IMAGE = "/hero_banner_real_estate_1774769760013.png";
const COMMERCIAL_IMAGE = "/commercial_building_investment_1774769793820.png";
const PLOT_IMAGE = "/residential_excellence_plot_1774769812737.png";
const SITE_DESCRIPTION = "Premier real estate services and investment advisory across NCR and Uttarakhand.";
const RESPONSE_PROMISE = "Speak to an advisor today — we respond to every enquiry within 24 hours.";

const band = (id: string, heading: string, accent: string, text: string, eyebrow = "Talk to an advisor"): PageSection =>
  ({ id, type: "cta", style: "band", background: "white", eyebrow, heading, accent, text, button_label: "", button_href: "", icon: "globe" });

const plainHero = (id: string, eyebrow: string, title: string, accent: string, subtitle: string, layout: { height?: "medium" | "large"; title_width: number; subtitle_width?: number; tight?: boolean }): PageSection =>
  ({ id, type: "hero", style: "plain", background: "light", eyebrow, title, accent_title: accent, subtitle, image_url: "", button_label: "", button_href: "", button2_label: "", button2_href: "", height: layout.height ?? "medium", show_featured: false, title_width: layout.title_width, subtitle_width: layout.subtitle_width ?? 620, ...(layout.tight ? { tight: true } : {}) });

const PRIVACY_BODY = [
  "<p>Thank you for visiting our website. HP Global Infrra and its operating divisions and subsidiaries (collectively \"HP Global Infrra\", \"We\", \"Us\", or \"The Company\") maintain and operate this and other websites and are committed to safeguarding your privacy.</p>",
  "<p>This Privacy Policy is to help the audience of HP Global Infrra to understand what data we gather, how we use it, and what securities are in place to protect your data on the Sites. This Privacy Policy also applies to information collected offline through trade shows, seminars, conferences, or other activities.</p>",
  "<h2>What Information Do We Collect?</h2>",
  "<p>HP Global Infrra collects the following types of information about you when you visit our Sites or through the offline means described above:</p>",
  "<ul><li>If you communicate with us via email, we collect your email ID.</li><li>Otherwise, data collected on our website or any other website(s) linked to this website or via offline means if you voluntarily choose to provide it. The data includes your name and/or that of your employer, address, telephone number and email address as well as account or transactional information collected as part of our business relationship with you.</li></ul>",
  "<h2>How The Company Uses Your Data?</h2>",
  "<p>We collect your Personal Data to:</p>",
  "<ul><li>Conduct our business, including providing you with the services you requested.</li><li>Send you marketing communications regarding new or updates on existing services benefits.</li><li>Comply with our legal obligations.</li><li>Protect the security of you and the Sites.</li><li>To deliver customer assistance and otherwise administer our business relationship with you.</li></ul>",
  "<p>We do not use robotic decision-making or conduct data profiling in a way that concerns you or significantly affects you. You are not forced to provide all personal data specified in this Privacy Policy to use our site or to interact with us offline, but certain functionality will be restricted if you do not provide certain personal data. We may not be able to respond to your requests, complete a transaction with you, or provide you with marketing that we believe you would find valuable.</p>",
  "<h2>Your Rights</h2>",
  "<p>As permitted, you may have the right to obtain confirmation of the existence of data related to you, to verify its content, origin, and accuracy, as well as the right to access, review, delete or stop or withdraw consent to the processing of certain personal data, by contacting us at <a href=\"mailto:info@hpglobalinfra.com\">info@hpglobalinfra.com</a>.</p>",
  "<h2>Your Choices</h2>",
  "<p>Your choices concerning our use and disclosure of your data:</p>",
  "<ul><li><strong>Marketing Communications:</strong> If you no longer wish to receive any marketing communications, please contact us at <a href=\"mailto:info@hpglobalinfra.com\">info@hpglobalinfra.com</a>.</li><li><strong>Cookies and Similar Technologies:</strong> Please examine your browser or device settings to exercise certain choices regarding cookies.</li></ul>",
  "<h2>How The Company Retains Your Data?</h2>",
  "<p>HP Global Infrra only retains your Personal Data for the minimum amount of time necessary to accomplish the purpose for which it was collected.</p>",
  "<h2>How Company Safeguards The Information?</h2>",
  "<p>HP Global Infrra uses industry-standard encryption technologies while sharing and receiving data exchanged with our site. We have proper security standards in our physical facilities to protect against the loss, misuse or alteration of data that we have collected. We also employ reasonable technologies to keep the Personal Data you provide on HP Global Infrra secure. HP Global Infrra maintains a Data Security Incident Response Plan that would provide notification as required by applicable law in the event of unlawful or unauthorised disclosure of personal data.</p>",
  "<h2>Changes To Our Privacy Policy</h2>",
  "<p>HP Global Infrra may update this Privacy Policy from time to time as our business and services change, or as directed by law. We encourage you to visit our Sites periodically to stay informed about HP Global Infrra's privacy practices.</p>",
  "<h2>How You Can Contact Us?</h2>",
  "<p>If you have any questions regarding this Privacy Policy or our privacy practices in general, please contact us at <a href=\"mailto:info@hpglobalinfra.com\">info@hpglobalinfra.com</a>.<br><br>You may also have a right to complain to a supervisory authority.</p>",
].join("");

export const systemPages: SystemPageDefinition[] = [
  {
    key: "home", slug: "", path: "/", title: "Home", meta_description: SITE_DESCRIPTION,
    sections: () => [
      { id: "home_hero", type: "hero", style: "image", background: "dark", height: "large", eyebrow: "Premier real estate · NCR & Uttarakhand", title: "Shaping the future of real estate", accent_title: "future", subtitle: "Curated residential and commercial investments — with one trusted advisor from shortlist to handover. Partner in vision, invest in growth.", image_url: HERO_IMAGE, button_label: "Explore projects", button_href: "/projects", button2_label: "Book a consultation", button2_href: ENQUIRE_LINK, show_featured: true },
      { id: "home_figures", type: "stats", layout: "strip", background: "white", heading: "", items: [{ value: "{projects}", label: "Projects in our portfolio" }, { value: "{hpg}", label: "HPG developments" }, { value: "{partner}", label: "Partner projects" }, { value: "24h", label: "Response to every enquiry" }] },
      { id: "home_featured", type: "featured_project", background: "light", button_label: "Explore project", brochure_label: "Download brochure" },
      { id: "home_projects", type: "projects", background: "white", eyebrow: "Our portfolio", heading: "Landmark projects across NCR & Uttarakhand", accent: "Landmark", intro: "HPG developments and handpicked partner projects — residential and commercial.", filter: "all", limit: 6, button_label: "View all projects" },
      { id: "home_services", type: "icon_cards", style: "cards", background: "dark", eyebrow: "What we do", heading: "Bespoke solutions for every kind of investor", accent: "every", intro: "From first-time buyers to institutional investors, we unlock the potential of your property with dedicated strategy and management.", button_label: "", button_href: "", cards: [
        { icon: "trending-up", title: "Investment management", text: "End-to-end advisory for individuals and organisations — sourcing, due diligence and acquisition of assets built for steady cash flow and appreciation.", link: "/services" },
        { icon: "key-round", title: "Property management strategy", text: "Maintenance, tenant relations and yield optimisation, so your property stays secure, occupied and future-ready.", link: "/services" },
        { icon: "land-plot", title: "Strategic plots & land", text: "Plots chosen for long-term growth, backed by our property management services after purchase.", link: "/investments" },
      ] },
      { id: "home_why", type: "icon_cards", style: "list", background: "white", eyebrow: "Why HP Global Infrra", heading: "Advice you can build a future on", accent: "build", intro: "We’re investors first — every recommendation is backed by research, transparency and long-term thinking.", button_label: "Talk to an advisor", button_href: ENQUIRE_LINK, cards: [
        { icon: "shield-check", title: "Curated, verified projects", text: "Our own developments and handpicked partner projects across NCR and Uttarakhand.", link: "" },
        { icon: "trending-up", title: "Investment-first advice", text: "Guidance on yield, appreciation and exit — not just the brochure.", link: "" },
        { icon: "user-round-check", title: "One dedicated advisor", text: "A single point of contact from your first site visit to handover.", link: "" },
        { icon: "file-text", title: "Clear documentation", text: "Brochures, price lists and floor plans shared upfront, in writing.", link: "" },
      ] },
      { id: "home_press", type: "press", background: "light", eyebrow: "In the news", heading: "What the press is saying", accent: "press", link_label: "All coverage", limit: 3 },
      { id: "home_journal", type: "articles", background: "white", eyebrow: "The Journal", heading: "Market insights & company news", accent: "insights", link_label: "Read the journal", limit: 3 },
      band("home_cta", "Let’s find your next landmark investment", "landmark", RESPONSE_PROMISE, "Book a consultation"),
    ],
  },
  {
    key: "about", slug: "about", path: "/about", title: "Our Story",
    meta_description: "HP Global Infrra is committed to excellence in every facet of real estate, from investment advisory to property management.",
    sections: () => [{
      id: "about_intro", type: "image_text", background: "white", eyebrow: "Our Origin", heading: "A Commitment to", accent_heading: "Excellence",
      body: "<p>At HP Global Infrra, we are committed to excellence in every facet of real estate. Our services range from investment advisory to property management, focusing on high-end projects that make a difference.</p><p>Our specialized approach includes mixed-use developments, smart solutions, and residential excellence, all backed by profound market insights.</p>",
      tagline: "Join us in shaping a new era of real estate advancement.",
      image_url: HERO_IMAGE, image_alt: "HP Global Infrra Building", image_position: "right", button_label: "", button_href: "",
    }, band("about_cta", "Let’s build your portfolio together", "together", "Meet an advisor at our Noida office, or speak over a call or WhatsApp.")],
  },
  {
    key: "services", slug: "services", path: "/services", title: "Services", meta_description: SITE_DESCRIPTION,
    sections: () => [
      plainHero("services_hero", "Our services", "Expertise that protects and grows your investment", "grows", "Two focused services, one advisor. From finding the right asset to managing it for years after — we stay with you.", { height: "large", title_width: 820 }),
      { id: "services_investment", type: "service", background: "white", eyebrow: "Service 01", title: "Real estate investment management", text: "HP Global Infrra offers extensive advisory and management for real estate investments. We guide high-net-worth individuals and organisations toward investments that secure steady cash flows and high appreciation.", image_url: COMMERCIAL_IMAGE, image_position: "left", includes: ["Market research & opportunity sourcing", "Due diligence on project, developer and documentation", "Price negotiation and booking support", "Portfolio reviews and exit planning"], button_label: "Schedule a consultation", button_href: ENQUIRE_LINK, show_call: true },
      { id: "services_management", type: "service", background: "white", eyebrow: "Service 02", title: "Property management strategy", text: "Ensure your investment is secure and future-ready. From ongoing maintenance and tenant relations to strategic optimisation of yield, our property management takes the hassle out of owning property.", image_url: PLOT_IMAGE, image_position: "right", includes: ["Tenant sourcing, agreements & rent collection", "Maintenance and periodic inspections", "Society, tax and utility coordination", "Regular updates on asset performance"], button_label: "Optimise your assets", button_href: ENQUIRE_LINK, show_call: true },
      { id: "services_audiences", type: "icon_cards", style: "cards", background: "light", eyebrow: "Who we work with", heading: "Advice shaped around the way you invest", accent: "you", intro: "Whether it’s your first property or your fifteenth, the process is the same: honest advice, complete documentation, and someone to call.", button_label: "", button_href: "", cards: [
        { icon: "user-round", title: "First-time investors", text: "Clear guidance from shortlist to registration, with every document explained.", link: "" },
        { icon: "globe", title: "Investors outside India", text: "Video site visits and documentation support, so distance is never a barrier.", link: "" },
        { icon: "layers", title: "Portfolio investors", text: "Diversify across residential, commercial and plots with research-backed advice.", link: "" },
      ] },
      band("services_cta", "Not sure which service you need?", "which", "Tell us about your goals and we’ll recommend the right approach — no obligation."),
    ],
  },
  {
    key: "investments", slug: "investments", path: "/investments", title: "Investments",
    meta_description: "Strategic, high-yield real estate investments — high-end projects, strategic plots, residential and commercial.",
    sections: () => [
      { id: "investments_hero", type: "hero", style: "image", background: "dark", height: "auto", eyebrow: "Investment opportunities", title: "Strategic, high-yield real estate ventures", accent_title: "high-yield", subtitle: "Opportunities precisely designed for visionary investors — from landmark residences to commercial assets and strategic plots.", image_url: COMMERCIAL_IMAGE, button_label: "Speak to an advisor", button_href: ENQUIRE_LINK, button2_label: "Explore projects", button2_href: "/projects", show_featured: false },
      { id: "investments_ways", type: "cards", layout: "rows", background: "white", eyebrow: "Four ways to invest", heading: "Choose the opportunity that fits your goals", accent: "fits", intro: "Every category is backed by our research, transparent documentation and ongoing management.", cards: [
        { title: "High-end projects", description: "Engage with signature high-end projects that set new benchmarks in luxury and impact. From concept to completion, we pave the way for extraordinary real estate ventures.", image_url: HERO_IMAGE, link: "/projects?type=residential", link_label: "View projects", projects: "high_end" },
        { title: "Premium strategic plots with property management", description: "Explore strategic plots designed with a focus on long-term growth and sustainability. With our expert property management services, your investment stays secure and future-ready.", image_url: PLOT_IMAGE, link: "/contact", link_label: "Ask about plots", projects: "" },
        { title: "Residential excellence", description: "Expertly crafted spaces that blend comfort, aesthetics and functionality seamlessly — an unmatched living experience for families and investors.", image_url: "/assets/featured-project-details/projects-image/slider-05.jpg", link: "/projects?type=residential", link_label: "View projects", projects: "residential" },
        { title: "Commercial brilliance", description: "Commercial developments that cater to dynamic business needs, offering cutting-edge spaces designed for productivity, growth and success.", image_url: COMMERCIAL_IMAGE, link: "/projects?type=commercial", link_label: "View projects", projects: "commercial" },
      ] },
      { id: "investments_steps", type: "icon_cards", style: "steps", background: "dark", eyebrow: "How it works", heading: "From first call to handover in four clear steps", accent: "four clear steps", intro: "", button_label: "", button_href: "", cards: [
        { icon: "search", title: "Consultation", text: "Tell us your goals, budget and timeline — in person, on a call or over WhatsApp.", link: "" },
        { icon: "file-text", title: "Curated shortlist", text: "Within 24 hours you receive a shortlist with brochures, price lists and our analysis.", link: "" },
        { icon: "calendar-days", title: "Site visits", text: "Visit shortlisted projects with your advisor — or take a live video walkthrough.", link: "" },
        { icon: "key-round", title: "Booking & handover", text: "We coordinate documentation, registration and handover, and can manage the asset after.", link: "" },
      ] },
      { id: "investments_remote", type: "cta", style: "strip", background: "white", icon: "globe", eyebrow: "", accent: "", heading: "Investing from outside India?", text: "We can arrange live video site visits and help with documentation remotely — talk to us about your plans.", button_label: "Plan a remote purchase", button_href: ENQUIRE_LINK },
      { id: "investments_faq", type: "faq", layout: "side", background: "white", eyebrow: "FAQ", heading: "Questions investors ask us", accent: "ask", intro: "Can’t find your answer? Call or WhatsApp us — we usually reply within the hour.", items: [
        { question: "How do I get started?", answer: "Book a free consultation — tell us your budget, preferred location and goals, and we’ll share a curated shortlist within 24 hours." },
        { question: "Do you only offer HPG developments?", answer: "No. Alongside our own developments we recommend handpicked partner projects from leading developers across NCR." },
        { question: "Can I invest from outside India?", answer: "Yes. We can arrange video site visits and help with documentation remotely — speak to an advisor to plan your purchase." },
        { question: "Do you manage the property after purchase?", answer: "Yes — property management is one of our core services, covering maintenance, tenant relations and yield optimisation." },
      ] },
      band("investments_cta", "Ready to grow your portfolio?", "grow", RESPONSE_PROMISE),
    ],
  },
  {
    key: "projects", slug: "projects", path: "/projects", title: "Projects",
    meta_description: "Residential and commercial projects across NCR and Uttarakhand — HPG developments and handpicked partner projects.",
    sections: () => [
      plainHero("projects_hero", "Our portfolio", "Projects worth investing in", "investing", "Landmark HPG developments and handpicked partner projects across NCR and Uttarakhand — each one researched by our advisory team.", { title_width: 1100, subtitle_width: 640, tight: true }),
      { id: "projects_list", type: "projects_list", background: "white" },
      band("projects_cta", "Can’t find what you’re looking for?", "looking for", "Tell us your budget and preferred location — we’ll share a curated shortlist within 24 hours."),
    ],
  },
  {
    key: "media", slug: "media", path: "/media", title: "In the News",
    meta_description: "Newspaper, TV and online coverage of HP Global Infrra and its projects.",
    sections: () => [
      plainHero("media_hero", "In the news", "HP Global Infrra in the press", "press", "Newspaper, television and online coverage of HP Global Infrra and our projects.", { title_width: 900, subtitle_width: 600, tight: true }),
      { id: "media_list", type: "press_list", background: "white", show_contact: true, contact_heading: "Press & media enquiries", contact_text: "For interviews, project information or high-resolution images, write to {email}.", contact_button: "Email the press desk" },
    ],
  },
  {
    key: "blog", slug: "blog", path: "/blog", title: "Journal",
    meta_description: "Market insights, buying guides and company news from HP Global Infrra.",
    sections: () => [
      plainHero("blog_hero", "The Journal", "Insights for smarter property decisions", "smarter", "Market updates, buying guides and investment ideas from the HP Global Infrra team.", { title_width: 900, subtitle_width: 600, tight: true }),
      { id: "blog_list", type: "articles_list", background: "white" },
      band("blog_cta", "Have a question about a market?", "question", "Our advisors are happy to talk through any location or project — no obligation."),
    ],
  },
  {
    key: "contact", slug: "contact", path: "/contact", title: "Contact",
    meta_description: "Call, WhatsApp or write to HP Global Infrra, or visit our office in Sector 63, Noida.",
    sections: () => [
      plainHero("contact_hero", "Contact us", "Let’s talk about your next investment", "next", "Call, WhatsApp or write to us — or visit our office in Noida. An advisor will get back to you within 24 hours.", { title_width: 860 }),
      { id: "contact_details", type: "contact_details", background: "white", office_heading: "Head office", response_text: "We reply to every enquiry within 24 hours", visits_text: "By appointment — in person or on a video call" },
    ],
  },
  {
    key: "privacy", slug: "privacy", path: "/privacy", title: "Privacy policy", meta_description: SITE_DESCRIPTION,
    sections: () => [{ id: "privacy_text", type: "legal_text", background: "white", eyebrow: "Legal", heading: "Privacy policy", updated: "", body: PRIVACY_BODY }],
  },
];

export const systemPageByKey = (key: string | null | undefined) => systemPages.find((page) => page.key === key);
export const systemPagePath = (key: string | null | undefined, slug: string) => systemPageByKey(key)?.path ?? `/${slug}`;
