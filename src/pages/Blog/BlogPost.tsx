import { useParams, Navigate } from "react-router-dom";
import { blogs } from "../../data/blogData";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";

export function BlogPost() {
  const { slug } = useParams();
  const blog = blogs.find((b) => b.slug === slug);

  if (!blog) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <article className="pt-40 pb-32 bg-brand-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-brand-white">
        
        <div className="mb-16">
          <Button to="/blog" variant="ghost" className="mb-16 -ml-4 hover:bg-transparent">
            <ArrowLeft size={16} className="mr-3" /> Back to Journal
          </Button>
          
          <div className="flex flex-wrap items-center gap-4 text-brand-champagne font-semibold uppercase tracking-[0.2em] text-[10px] mb-8">
            <span>{blog.date}</span>
            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
            <span className="text-gray-400">Written by <span className="text-brand-charcoal">{blog.author}</span></span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-light text-brand-charcoal mb-16 leading-tight tracking-tight">
            {blog.title}
          </h1>
        </div>
        
        <div className="relative mb-24 subtle-border p-3 bg-brand-light-grey group">
           <img 
            src={blog.image} 
            alt={blog.title} 
            className="w-full h-[400px] md:h-[600px] object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-1000"
          />
        </div>

        <div className="mx-auto max-w-3xl">
          <div 
            className="prose prose-lg max-w-none 
                       text-gray-600 leading-loose prose-p:font-light 
                       prose-h3:text-brand-charcoal prose-h3:font-heading prose-h3:font-normal prose-h3:mt-20 prose-h3:mb-8 prose-h3:text-3xl
                       prose-strong:text-brand-charcoal prose-strong:font-semibold
                       prose-li:marker:text-brand-champagne
                       prose-ul:text-gray-600 prose-ul:font-light
                       prose-ol:text-gray-600 prose-ol:font-light
                       prose-a:text-brand-charcoal hover:prose-a:text-brand-champagne prose-a:transition-colors prose-a:font-semibold prose-a:underline-offset-4"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </div>
    </article>
  );
}
