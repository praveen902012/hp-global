export default function Blog() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-900 font-display mb-4">Market Insights & News</h1>
        <p className="text-lg text-brand-600 max-w-2xl mx-auto">Stay up to date with the latest trends in luxury real estate, market analysis, and firm achievements.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-100 hover:shadow-md transition-shadow">
            <div className="h-48 bg-brand-200 animate-pulse"></div>
            <div className="p-6">
              <span className="text-xs font-bold text-accent-600 uppercase tracking-wider mb-2 block">Market Report</span>
              <h3 className="text-xl font-bold text-brand-900 mb-3 truncate">The Future of Urban Luxury</h3>
              <p className="text-brand-600 text-sm mb-4 line-clamp-3">Explore how architectural trends are shaping the next generation of highly sought after penthouses in metropolitan centers.</p>
              <span className="text-brand-400 text-xs font-medium">May 24, 2026</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
