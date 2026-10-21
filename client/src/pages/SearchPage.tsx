import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Clock, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { ServiceItem } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setIsLoading(true);
    apiRequest<ServiceItem[]>(`/services?search=${encodeURIComponent(query)}`)
      .then((res) => {
        if (res.success) setServices(res.data);
      })
      .finally(() => setIsLoading(false));
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Search Results
        </h1>
        <p className="text-sm text-stone-600">
          Showing matching home services for "{query}"
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by problem or trade..."
              className="w-full rounded-xl border border-stone-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-stone-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-2" />
          <h3 className="font-bold text-stone-900 text-base">No exact service matches</h3>
          <p className="text-xs text-stone-500 mt-1">
            Try checking spelling or use broader terms like "AC", "cleaning", "pipe", or "wiring".
          </p>
          <Link to="/services">
            <Button variant="outline" size="sm" className="mt-4">
              Browse All Services
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} hoverEffect className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    {service.category_name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.duration_minutes} mins</span>
                  </div>
                </div>

                <h3 className="font-bold text-stone-900 text-base mb-1.5">{service.name}</h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">{service.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <div>
                  <span className="text-[10px] text-stone-500 block">Fixed Price</span>
                  <span className="text-lg font-bold text-stone-900">₹{service.base_price_inr}</span>
                </div>
                <Link to={`/services/${service.slug}`}>
                  <Button size="sm">
                    View & Book
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
