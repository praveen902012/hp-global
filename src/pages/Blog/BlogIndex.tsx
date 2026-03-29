import { Card } from "../../components/ui/Card";
import { blogs } from "../../data/blogData";

export function BlogIndex() {
  return (
    <div className="pt-40 pb-32 bg-brand-light-grey min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-24 flex flex-col items-center text-center animate-fade-in-up">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-champagne mb-6 block">Journal</span>
          <div className="w-12 h-[1px] bg-brand-charcoal mb-10"></div>
          
          <h1 className="text-4xl md:text-5xl font-heading font-light text-brand-charcoal mb-8 tracking-tight">
            Market Insights &<br/>
            Industry News
          </h1>
          <p className="text-lg text-gray-500 font-light leading-relaxed max-w-2xl">
            Read the latest reports, trends, and success stories from HP Global Infra experts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
          {blogs.map((blog) => (
            <Card
              key={blog.slug}
              title={blog.title}
              description={blog.snippet}
              imageSrc={blog.image}
              linkTo={`/blog/${blog.slug}`}
              author={blog.author}
              date={blog.date}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
