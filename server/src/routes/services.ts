import { Router, Request, Response } from 'express';
import { db } from '../db/supabase.js';

const router = Router();

// GET /api/v1/categories - list all active categories
router.get('/categories', (req: Request, res: Response) => {
  const activeCategories = db.categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  return res.json({
    success: true,
    data: activeCategories,
  });
});

// GET /api/v1/services - list services with filters
router.get('/services', (req: Request, res: Response) => {
  const { category_id, category_slug, search } = req.query;

  let filtered = db.services.filter((s) => s.is_active);

  if (category_id) {
    filtered = filtered.filter((s) => s.category_id === category_id);
  }

  if (category_slug) {
    const category = db.categories.find((c) => c.slug === category_slug);
    if (category) {
      filtered = filtered.filter((s) => s.category_id === category.id);
    } else {
      return res.json({ success: true, data: [] });
    }
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category_name?.toLowerCase().includes(q)
    );
  }

  return res.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// GET /api/v1/services/:slugOrId - get service detail with eligible verified providers
router.get('/services/:slugOrId', (req: Request, res: Response) => {
  const { slugOrId } = req.params;

  const service = db.services.find(
    (s) => s.id === slugOrId || s.slug === slugOrId
  );

  if (!service) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Service not found' },
    });
  }

  const category = db.categories.find((c) => c.id === service.category_id);

  // Find eligible verified providers offering this service
  const providerIds = db.providerServiceMap
    .filter((mapping) => mapping.service_id === service.id)
    .map((m) => m.provider_id);

  const eligibleProviders = db.providerProfiles.filter(
    (p) => providerIds.includes(p.id) && p.verification_status === 'verified' && p.is_available
  );

  return res.json({
    success: true,
    data: {
      ...service,
      category,
      eligible_providers: eligibleProviders,
    },
  });
});

export default router;
