import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Clock, ArrowRight, Check, Search, Filter } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { ServiceCategory, ServiceItem } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CategoryIcon } from '../components/ui/CategoryIcon';

export const Services: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategorySlug = searchParams.get('category_slug') || 'all';

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    apiRequest<ServiceCategory[]>('/categories').then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    let endpoint = '/services';
    if (selectedCategorySlug && selectedCategorySlug !== 'all') {
      endpoint += `?category_slug=${selectedCategorySlug}`;
    }

    apiRequest<ServiceItem[]>(endpoint)
      .then((res) => {
        if (res.success) setServices(res.data);
      })
      .finally(() => setIsLoading(false));
  }, [selectedCategorySlug]);

  const filteredServices = services.filter((s) =>
    localSearch
      ? s.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        s.description.toLowerCase().includes(localSearch.toLowerCase())
      : true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Home Service Catalog
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Explore all verified repairs, installations, and maintenance services across Bengaluru
        </p>
      </div>

      {/* Main Layout: Categories Sidebar + Service Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Category Filters (Pills on mobile, Sidebar on desktop) */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-sm text-stone-900 pb-2 border-b border-stone-200">
            <Filter className="w-4 h-4 text-brand-600" />
            <span>Categories</span>
          </div>

          <div className="flex lg:flex-col overflow-x-auto gap-1.5 pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => {
                searchParams.delete('category_slug');
                setSearchParams(searchParams);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors whitespace-nowrap flex items-center justify-between ${
                selectedCategorySlug === 'all'
                  ? 'bg-brand-600 text-white'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span>All Categories</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSearchParams({ category_slug: cat.slug });
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors whitespace-nowrap flex items-center gap-2 ${
                  selectedCategorySlug === cat.slug
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <CategoryIcon name={cat.icon_name} className="w-4 h-4" />
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Services Listing */}
        <main className="flex-1 space-y-6">
          {/* Quick search filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter services by name or problem..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full rounded-xl border border-stone-300 pl-10 pr-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-stone-200 animate-pulse" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-stone-200 p-8">
              <p className="text-stone-600 text-sm">No services found matching your criteria.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setLocalSearch('');
                  setSearchParams({});
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} hoverEffect className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                        {service.category_name}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-stone-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{service.duration_minutes} mins</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-stone-900 text-base mb-1.5">{service.name}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed mb-4">{service.description}</p>

                    {service.inclusions && service.inclusions.length > 0 && (
                      <div className="space-y-1 mb-4 bg-surface-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[10px] font-bold text-stone-600 uppercase">Includes:</span>
                        {service.inclusions.slice(0, 2).map((inc, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-stone-600">
                            <Check className="w-3 h-3 text-brand-600 flex-shrink-0" />
                            <span className="truncate">{inc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Standard Rate</span>
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
        </main>
      </div>
    </div>
  );
};
