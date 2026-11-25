import Link from "next/link";
import { BookOpen, Lightbulb, TriangleAlert } from "lucide-react";

/* Admin user guide for the Menu, Pages, Press and Journal features.
   Screenshots live in server/admin-guide and are served only to signed-in admins. */

const toc = [
  { id: "overview", label: "What's new" },
  { id: "leads", label: "Enquiries & messages" },
  { id: "projects", label: "Projects & articles" },
  { id: "menu", label: "Edit the site menu" },
  { id: "pages", label: "Create a new page" },
  { id: "sections", label: "Section types" },
  { id: "publish", label: "Preview & publish" },
  { id: "website-pages", label: "Edit any website page" },
  { id: "site-details", label: "Site details" },
  { id: "ai-access", label: "AI access" },
  { id: "press", label: "Add press coverage" },
  { id: "press-where", label: "Where coverage appears" },
  { id: "journal", label: "Home page Journal" },
  { id: "tips", label: "Tips & troubleshooting" },
];

function Shot({ file, alt, caption }: { file: string; alt: string; caption: string }) {
  const src = `/api/admin/guide/${file}`;
  return (
    <figure className="my-6">
      <a href={src} target="_blank" rel="noopener noreferrer" title="Open full size" className="block overflow-hidden rounded-2xl border border-line bg-ivory-50  transition hover:border-navy-900 hover:shadow-md">
        <img src={src} alt={alt} loading="lazy" className="w-full" />
      </a>
      <figcaption className="mt-2 text-xs text-ink-muted">{caption} <span className="text-ink-subtle">· Click to enlarge</span></figcaption>
    </figure>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-10">
      <h2 className="mb-4 font-heading text-2xl text-ink">{title}</h2>
      <div className="space-y-4 text-[15px] leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal space-y-2 pl-6 marker:font-semibold marker:text-gold-700">{children}</ol>;
}

function Note({ tone = "tip", children }: { tone?: "tip" | "warn"; children: React.ReactNode }) {
  const warn = tone === "warn";
  const Icon = warn ? TriangleAlert : Lightbulb;
  return (
    <div className={`flex gap-3 rounded-2xl border px-4 py-3 text-sm ${warn ? "border-amber-200 bg-amber-50 text-amber-900" : "border-sky-200 bg-sky-50 text-sky-900"}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

const B = ({ children }: { children: React.ReactNode }) => <strong className="font-semibold text-ink">{children}</strong>;
const A = ({ href, children }: { href: string; children: React.ReactNode }) => <Link href={href} className="font-medium text-ink underline decoration-gold-400 underline-offset-4 hover:text-gold-700">{children}</Link>;

export function AdminGuide() {
  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-200/60 text-ink"><BookOpen size={24} /></span>
        <div>
                    <h1 className="font-heading text-[28px] leading-9 text-ink md:text-[32px] md:leading-10">User guide</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">How to edit the site menu, build new pages and publish press coverage. This guide is visible only to signed-in admins.</p>
        </div>
      </div>

      <div className="flex flex-col gap-10 xl:flex-row">
        <nav aria-label="Guide contents" className="xl:sticky xl:top-24 xl:w-56 xl:shrink-0 xl:self-start">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-subtle">Contents</p>
          <ol className="grid gap-1 text-sm sm:grid-cols-2 xl:grid-cols-1">
            {toc.map((item, index) => <li key={item.id}><a href={`#${item.id}`} className="block rounded px-2 py-1.5 text-ink-muted hover:bg-ivory-100 hover:text-ink"><span className="mr-2 text-ink-subtle">{index + 1}.</span>{item.label}</a></li>)}
          </ol>
        </nav>

        <article className="min-w-0 max-w-4xl flex-1 space-y-10">
          <Section id="overview" title="What's new">
            <p>These things can now be managed from the admin panel without a developer:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li><B>Every website page</B>: Home, Services, Investments, Projects, In the news, Journal, Contact and the Privacy policy now open in the page builder, so you can change their headings, text, photos and sections. See <A href="#website-pages">Edit any website page</A>.</li>
              <li><B>Site details</B>: the phone number, WhatsApp number, email, office address, social links and footer tagline are edited in one place and update the whole website. See <A href="#site-details">Site details</A>.</li>
              <li><B>Google &amp; sharing</B>: every page has its own title and description for Google, and its own picture for when the link is shared on WhatsApp.</li>
              <li><B>Menu</B>: rename, reorder, hide or add the links in the website&apos;s header and footer.</li>
              <li><B>Pages</B>: create brand-new pages (for example an NRI desk or a project launch page) from ready-made sections, preview them as drafts and publish when ready.</li>
              <li><B>Our Story</B>: edit the text and image of the Our Story (<code>/about</code>) page, and add more sections to it.</li>
              <li><B>Press</B>: add newspaper clippings, TV/YouTube coverage and online articles. They appear on the <em>In the News</em> page and on the project&apos;s page.</li>
              <li><B>Journal on the home page</B>: the home page now shows your three latest articles automatically.</li>
            </ul>
            <p>The admin panel itself has also been redesigned:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li><B>Dashboard</B>: new leads at a glance, with one-tap Call and WhatsApp buttons, and a <B>Needs attention</B> list (leads waiting over a day, unread messages, project pages without a gallery or brochure, drafts).</li>
              <li><B>Enquiries</B> now have a status (<em>New</em>, <em>Contacted</em>, <em>Closed</em>) and private notes. <B>Contact requests</B> are marked read or unread.</li>
              <li><B>Articles</B> can be saved as drafts and unpublished.</li>
              <li><B>Projects</B> are listed in a compact table, edited on a full page with tabs, and can be reordered by dragging.</li>
              <li><B>Search everything</B>: the search box at the top (or <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd>) finds projects, articles, pages, press and leads, including by phone number.</li>
              <li><B>Settings</B>: change your password here (it used to be on the dashboard).</li>
            </ul>
            <p>Everything is in the left sidebar, grouped into Leads, Content and Help. On a phone, tap the menu button at the top left. The panel icon next to the logo shrinks the sidebar to icons on a computer.</p>
          </Section>

          <Section id="leads" title="Enquiries & messages">
            <p><A href="/admin/enquiries">Enquiries</A> lists every lead from the enquiry forms (project pages, the header button and the pop-up). The number next to <B>Enquiries</B> in the sidebar is how many are still <em>New</em>.</p>
            <Shot file="enquiries.png" alt="Enquiries list with one enquiry open in the side panel" caption="Click an enquiry to open it. Change the status and add notes on the right." />
            <Steps>
              <li>Click an enquiry. Use <B>Call</B> or <B>WhatsApp</B> to reach the person straight away.</li>
              <li>Set the <B>Status</B> to <em>Contacted</em> once you have spoken to them, and to <em>Closed</em> when the lead is finished. It saves immediately.</li>
              <li>Write anything worth remembering in <B>Notes</B> and click <B>Save notes</B>. Notes are only visible to admins.</li>
            </Steps>
            <p><B>Sent from</B> shows the page the visitor was on, e.g. <code>/projects/amrit-aarogyam</code>. Use the tabs to see only New, Contacted or Closed leads, and <B>Export CSV</B> to download the list you are looking at.</p>
            <p><A href="/admin/contacts">Contact requests</A> works like an inbox: unread messages have a gold dot and are counted in the sidebar. Opening a message marks it as read; <B>Mark unread</B> puts it back. <B>Reply by email</B> opens your email app with the address filled in.</p>
            <Note>Enquiries received before this update all start as <em>New</em>. Mark the ones you have already handled as Contacted or Closed.</Note>
          </Section>

          <Section id="projects" title="Projects & articles">
            <p><A href="/admin/properties">Projects</A> shows every project with its price, status and how much of its page is filled in (for example <em>4/7</em>). The switch in the <B>Visible</B> column shows or hides a project on the website instantly.</p>
            <Shot file="project-editor.png" alt="Project editor with tabs for details, page content, gallery, amenities and documents" caption="Editing a project. The tabs with a tick already have content." />
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Click a project to edit it. The tabs hold the <B>Details</B>, <B>Page content</B> (overview, highlights, key facts), <B>Gallery & video</B>, <B>Amenities & layout</B> and <B>Documents</B>. A bar appears at the bottom when you have unsaved changes.</li>
              <li>Drop several images onto a gallery at once, and drag them to change the order. The first image is the cover.</li>
              <li>Click <B>Reorder</B> above the list and drag projects into the order you want on the website, then <B>Save order</B>. The featured project always shows first.</li>
            </ul>
            <p>In <A href="/admin/articles">Articles</A>, click <B>Write article</B>. <B>Save draft</B> keeps it private while you work; <B>Publish</B> puts it in the Journal. A published article can be taken down again with <B>Unpublish</B>, which moves it back to drafts.</p>
            <Shot file="article-editor.png" alt="Article editor with text, publishing options and cover image" caption="Writing an article. Publishing options and the cover image are on the right." />
            <Note>To publish, an article needs a summary, text and a cover image. A draft only needs a title.</Note>
          </Section>

          <Section id="menu" title="1. Edit the site menu">
            <p>Open <A href="/admin/menu">Menu</A> in the sidebar. There are two lists: the <B>Header menu</B> (top navigation, desktop and mobile) and the <B>Footer menu</B> (the Explore column in the footer). Above each list is a <B>Preview</B> that updates as you type, so you can see the result before saving. For the header, switch between <B>Desktop</B> and <B>Mobile</B>.</p>
            <Shot file="menu-editor.png" alt="Menu editor with header and footer menu lists" caption="The Menu page. Each row is one link with its label, its address and action buttons." />
            <p>For each link you can:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li><B>Change the label</B>: the text visitors see, e.g. &quot;Our Story&quot;.</li>
              <li><B>Change the link</B>: click the box to pick a site page from the list, or type a full web address (<code>https://…</code>), an email (<code>mailto:info@hpglobalinfra.com</code>) or a phone number (<code>tel:+91…</code>).</li>
              <li>Turn on <B>Open in a new tab</B> under the link box for links that should open in a separate browser tab (handy for outside websites). In the preview these links are marked ↗.</li>
              <li>Use the buttons on the right to <B>hide/show</B> the link (eye icon), <B>visit</B> the link to check it works (arrow icon), <B>move it up or down</B>, or <B>remove</B> it.</li>
              <li>Click <B>Add link</B> to add a new one (up to 12 per menu).</li>
            </ul>
            <p>Nothing changes on the website until you click <B>Save menu</B> at the bottom. To start over, <B>Reset to default</B> restores the original links (again, only once you save).</p>
            <Note>Hiding a link is a good way to take a page out of the menu temporarily without losing its label and position.</Note>
          </Section>

          <Section id="pages" title="2. Create a new page">
            <p>Open <A href="/admin/pages">Pages</A>. The list shows every page you have created, whether it is a <B>Draft</B> (not public) or <B>Published</B>, and when it was last edited.</p>
            <Shot file="pages-list.png" alt="Pages list showing a published page and a draft" caption="The Pages list. Use the icons on the right to view, edit or delete a page." />
            <Steps>
              <li>Click <B>New page</B>.</li>
              <li>Type the <B>page title</B>. The <B>page URL</B> is filled in for you (e.g. <code>nri-investment-desk</code>); you can shorten it. Addresses the site already uses, such as <code>about</code> or <code>blog</code>, are not allowed.</li>
              <li>Click <B>Create page</B>. The page opens in the editor as a draft with a hero banner and a text section to start from.</li>
            </Steps>
            <Shot file="pages-new.png" alt="New page dialog with title and URL fields" caption="Creating a page: just a title and the address." />
            <p>In the editor, the page is a stack of <B>sections</B> shown top to bottom in the same order as on the website. Click a section&apos;s header to open it and edit its content.</p>
            <Shot file="page-editor.png" alt="Page editor showing a list of sections with one open for editing" caption="The page editor. The toolbar at the top has Preview, Save and Publish." />
            <p>On each section header you can:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Pick a <B>background</B> (white, light grey or dark) with the three coloured dots.</li>
              <li><B>Move</B> the section up or down, <B>duplicate</B> it, or <B>remove</B> it.</li>
            </ul>
            <p>To add a section, click <B>Add section</B> at the bottom, or hover between two sections and click <B>Insert section here</B>. Then choose the type:</p>
            <Shot file="page-section-picker.png" alt="Add a section dialog listing the ten section types" caption="Choosing a section type." />
            <p>The panel on the right of the editor holds the <B>Page settings</B> (page name and address), <B>Google &amp; sharing</B> (see below) and a quick <B>Add a section</B> list, which adds the new section below the one you have open.</p>
            <p><B>Google &amp; sharing</B> shows a preview of how the page appears on Google. <B>Title on Google</B> can be left blank (the page name plus &quot;| HP Global Infrra&quot; is used). Keep the <B>Description on Google</B> to about 160 characters: the counter turns amber when Google may cut it off. The <B>Share image</B> is the picture shown when the link is sent on WhatsApp or social media; without one, the default from <A href="/admin/site-details">Site details</A> is used.</p>
            <Note>Images: click <B>Upload image</B> next to any image field (JPG, PNG, WebP or GIF, up to 10 MB). Wide landscape photos around 1600–2400 px work best for hero banners.</Note>
          </Section>

          <Section id="sections" title="Section types">
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-ivory-50 text-xs uppercase tracking-wider text-ink-muted"><tr><th className="px-4 py-2.5">Section</th><th className="px-4 py-2.5">Use it for</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {[
                    ["Hero banner", "The opening of a page: a big photo with the title, or a Plain heading on a light background. Gold words, a subtitle and up to two buttons. Usually the first section."],
                    ["Text", "Headings and paragraphs. The toolbar has bold, italic, H2/H3 headings, lists, quotes and links (select text, then click the link icon)."],
                    ["Image + text", "A photo beside a heading, text and an optional button. Choose whether the image is on the left or right."],
                    ["Image gallery", "A grid of photos (2, 3 or 4 per row). Upload several images at once with Upload images."],
                    ["Cards", "Photo cards side by side, or Large photo rows (big photo beside numbered text, alternating sides) — as on Investments, “Four ways to invest”."],
                    ["Icon cards (new)", "Short points with an icon: as Cards, as a List beside the heading, or as Numbered steps — e.g. “What we do”, “Why HP Global Infrra”, “How it works”."],
                    ["Service (new)", "A service with photo, description, a “What’s included” list, a button and an optional Call link. Services placed one after another share one block, with photos alternating sides."],
                    ["Key figures", "Big numbers with labels, e.g. 25+ Years of experience."],
                    ["Video", "Paste a normal YouTube or Vimeo link; it is converted automatically."],
                    ["FAQ", "Questions that open to show the answer when clicked."],
                    ["Call to action", "Simple (centred heading and button), Photo banner (dark banner with Book a consultation and WhatsApp buttons) or Box with icon (e.g. “Investing from outside India?”)."],
                    ["Contact form", "Name, email and message form. Submissions arrive in Contact Requests."],
                    ["Legal text (new)", "Long text such as a privacy policy. Each H2 heading is listed in a contents column beside the text."],
                    ["Projects (live)", "Your published projects with the filter chips. Choose which projects and how many; the cards update by themselves."],
                    ["Featured project (live)", "The project chosen in Featured project, with its photos, highlights and brochure."],
                    ["Press (live)", "Your latest press coverage. Hidden while there is none."],
                    ["Articles (live)", "Your latest Journal articles."],
                  ].map(([name, use]) => <tr key={name}><td className="whitespace-nowrap px-4 py-2.5 font-medium text-ink">{name}</td><td className="px-4 py-2.5">{use}</td></tr>)}
                </tbody>
              </table>
            </div>
            <p>Buttons have a <B>When clicked</B> choice: go to a page or link, or <B>Open the enquiry form</B> (the same form as “Enquire now”). If a button has text, it also needs a link, otherwise saving shows a message telling you which section to fix.</p>
            <p><B>Gold words</B>: type one or more words that appear in the heading (for example <em>future</em> in “Shaping the future of real estate”) and they are shown in gold italics. Words that aren&apos;t in the heading are added after it.</p>
            <p><B>Live</B> sections are marked with a gold <em>Live</em> label. You choose their heading and how many items to show; the projects, press and articles themselves come from their own screens and stay up to date.</p>
          </Section>

          <Section id="publish" title="3. Preview & publish">
            <Steps>
              <li>Click <B>Save draft</B>. Drafts are never shown to visitors.</li>
              <li>Click <B>Preview</B> to open the page on the real website. While signed in you will see it with a gold <B>Draft preview</B> bar at the bottom; visitors who try the address get &quot;page not found&quot;.</li>
              <li>When it looks right, click <B>Publish</B>. In the dialog you can tick <B>Header menu</B> and/or <B>Footer menu</B> to add a link to the page, and choose the menu label.</li>
              <li>Click <B>Publish now</B>. The page is live at its address straight away.</li>
            </Steps>
            <Shot file="page-publish.png" alt="Publish dialog with options to add the page to the header or footer menu" caption="Publishing, with the option to add the page to the menu." />
            <Shot file="page-live.png" alt="A published page on the website" caption="The published page on the website, with its new link in the header menu." />
            <p><B>Editing a published page:</B> the save button changes to <B>Save &amp; update live page</B>, and your changes go live as soon as you save.</p>
            <p><B>Unpublish</B> turns the page back into a draft and removes its menu links. <B>Delete</B> (from the Pages list) removes the page permanently, and its menu links too.</p>
            <Note tone="warn">Changing the URL of a published page breaks the old address (for example, links already shared on WhatsApp). Menu links are updated automatically, but anything shared elsewhere is not.</Note>
          </Section>

          <Section id="website-pages" title="4. Edit any website page">
            <span id="our-story" />
            <p>Every page of the website is listed at the top of <A href="/admin/pages">Pages</A> under <B>Website pages</B>: Home, Our Story, Services, Investments, Projects, In the news, Journal, Contact and Privacy policy. Click one to open it in the same editor as your own pages. Each one starts with exactly what is on the website today, so nothing changes until you save.</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Change headings, text, photos and buttons, move sections up or down, hide one by removing it, or add new sections. Click <B>Save &amp; update live page</B>; changes appear on the website immediately.</li>
              <li>The <B>Home</B> page is made of live sections (Featured project, Projects, Press, Articles) plus the banner, key figures, “What we do”, “Why HP Global Infrra” and the closing banner.</li>
              <li>The key figures on Home count your projects by themselves: <code>{"{projects}"}</code>, <code>{"{hpg}"}</code> and <code>{"{partner}"}</code> in a figure are replaced with live numbers.</li>
              <li>Projects, In the news, Journal and Contact each have one <B>locked</B> section (the project list, the press list, the article list and the contact details). It is marked <em>Live · always on this page</em> and can&apos;t be removed, but you can edit the heading above it and the banner below it.</li>
              <li>The <B>Privacy policy</B> is a <em>Legal text</em> section. Use the H2 button for each heading; the contents list beside the text updates by itself.</li>
            </ul>
            <Note>Website pages are always live: they have no Publish or Unpublish button, can&apos;t be deleted, and keep their address, so links in the menu and elsewhere keep working. Use <B>Duplicate</B> in the Pages list to start a new page from one of them.</Note>
          </Section>

          <Section id="site-details" title="Site details">
            <p>Open <A href="/admin/site-details">Site details</A> (under Content in the sidebar) to change the details used across the whole website:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li><B>Contact</B>: phone number (shown in the header), email, office address (one line per row) and the Google Maps link.</li>
              <li><B>WhatsApp</B>: the number used by every WhatsApp button, and the first message filled in for visitors.</li>
              <li><B>Social links</B>: Instagram, Facebook, LinkedIn and YouTube. Leave one empty to hide its icon.</li>
              <li><B>Footer</B>: the tagline under the logo.</li>
              <li><B>Search &amp; sharing defaults</B>: the website name added to page titles on Google, and the default picture for shared links.</li>
            </ul>
            <p>Click <B>Save changes</B>. The header, footer, Contact page and WhatsApp buttons update straight away.</p>
          </Section>

          <Section id="ai-access" title="AI access">
            <p>AI access lets people you trust update the website by asking an AI assistant, for example &quot;add a FAQ about home loans to the Investments page&quot; in Claude. The assistant connects to the website through a secure <B>MCP</B> connection and makes the same changes you could make in this panel, with the same checks.</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Open <A href="/admin/ai-access">AI access</A> (under Help in the sidebar), give the token a name and choose <B>Read only</B> or <B>Read and edit</B>, then click <B>Create token</B>.</li>
              <li>Copy the token straight away: it is shown only once. The page also shows the command to connect Claude Code and the settings for other apps.</li>
              <li>Create one token per person or tool. The <B>Recent activity</B> list shows what each one did, and <B>Revoke</B> stops a token at once.</li>
            </ul>
            <p>An assistant can read and edit pages, sections, menus, site details, articles, press and projects. It <B>can&apos;t</B> delete anything, and it never sees enquiries or contact requests. Changes to website pages go live immediately, just like saving here, so review what the assistant plans before you let it proceed.</p>
            <Note tone="warn">A token works like a password. Send it only to the person who needs it, never post it in a group chat or email thread, and revoke it when they no longer need access.</Note>
          </Section>

          <Section id="press" title="5. Add press coverage">
            <p>Open <A href="/admin/press">Press</A>. All coverage is listed newest first, with its type, publication, date and project. Use the tabs, the project filter or the search box to find an item.</p>
            <Shot file="press-list.png" alt="Press clippings list with print, video and online items" caption="The Press page. The eye icon hides or shows an item; the pencil edits; the bin deletes." />
            <Steps>
              <li>Click <B>Add coverage</B>.</li>
              <li>Choose the <B>type of coverage</B>:
                <ul className="mt-1.5 list-disc space-y-1 pl-5">
                  <li><B>Newspaper / magazine</B>: upload the scan or photo with <B>Upload image</B>, and/or the full page as a <B>PDF</B> (up to 25 MB).</li>
                  <li><B>TV / video</B>: paste the YouTube or Vimeo link. The video&apos;s own thumbnail is used unless you upload one.</li>
                  <li><B>Online article</B>: paste the link to the story on the news website.</li>
                </ul>
              </li>
              <li>Fill in the <B>publication</B> or channel, the <B>date published</B> and the <B>headline</B>. A short <B>summary</B> is optional.</li>
              <li>Choose the <B>project</B> from the list (start typing to see suggestions). Leave it empty for coverage about the company as a whole.</li>
              <li>Click <B>Add coverage</B>. It is live on the website immediately, unless you switch off <B>Show on the website</B>.</li>
            </Steps>
            <Shot file="press-form.png" alt="Add coverage form with type, publication, headline, project and image upload" caption="Adding a newspaper clipping." />
            <Note>Always pick the project name from the suggestions rather than typing it differently. That way all coverage for a project is grouped together.</Note>
          </Section>

          <Section id="press-where" title="Where coverage appears">
            <p><B>The In the News page</B> (<A href="/media">/media</A>) lists all visible coverage, newest first. Visitors can filter by project and by type. Videos play in a pop-up, newspaper scans and PDFs open full size, and online articles open the news website in a new tab.</p>
            <Shot file="press-media-page.png" alt="Public In the News page listing press coverage" caption="The public In the News page." />
            <p><B>The Featured Project page</B> shows an <B>In the News</B> block automatically once at least one visible clipping is tagged with the featured project&apos;s name (currently <em>Amrit Aarogyam</em>). With more than six, a link to all of them appears.</p>
            <Shot file="press-featured.png" alt="In the News block on the Featured Project page" caption="Coverage tagged with the featured project, on its page." />
            <Note>The In the News page isn&apos;t in the menu by default. To add it, go to <A href="/admin/menu">Menu</A>, click <B>Add link</B>, choose <code>/media</code> from the list and save.</Note>
          </Section>

          <Section id="journal" title="6. Home page Journal">
            <p>The <B>The Journal</B> section on the home page now shows the three most recent articles from <A href="/admin/articles">Articles</A>, ordered by publish date. Publish or edit an article and the home page updates by itself. There&apos;s nothing else to do.</p>
          </Section>

          <Section id="tips" title="Tips & troubleshooting">
            <ul className="list-disc space-y-2 pl-6">
              <li><B>&quot;You have unsaved changes&quot;</B>: the editors warn you before you leave with unsaved work. Save first.</li>
              <li><B>A save shows a red message</B>: it names the section and field to fix, e.g. a button without a link, or a video link that isn&apos;t YouTube or Vimeo.</li>
              <li><B>Preview shows old content</B>: Preview shows the last <em>saved</em> version. Save, then refresh the preview tab.</li>
              <li><B>&quot;Please sign in again&quot;</B>: your session has ended. Sign in again; unsaved changes in that tab may be lost.</li>
              <li><B>A menu is full</B>: each menu holds up to 12 links. If the header is full when you publish, remove or hide a link on the Menu page first.</li>
              <li><B>Uploaded files</B> are stored on the server and stay available even if you remove them from a page.</li>
            </ul>
          </Section>
        </article>
      </div>
    </div>
  );
}
