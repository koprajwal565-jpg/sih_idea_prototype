import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/supabase.js';
import { env } from '../config/env.js';

const router = Router();

const assistBookingSchema = z.object({
  query: z.string().min(3, 'Please describe your home service issue in a few words'),
});

const smartSearchSchema = z.object({
  query: z.string().min(2),
});

const supportChatSchema = z.object({
  message: z.string().min(3),
});

const jobSummarySchema = z.object({
  problem_description: z.string().min(5),
  service_name: z.string().optional(),
});

// Deterministic classifier & rule-based NLP matcher
function ruleBasedClassify(text: string) {
  const lower = text.toLowerCase();

  if (lower.includes('ac') || lower.includes('cool') || lower.includes('filter') || lower.includes('refrigerat') || lower.includes('washing machine')) {
    return {
      categorySlug: 'ac-appliances',
      suggestedServiceSlug: lower.includes('wash') ? 'washing-machine-service' : 'split-ac-foam-cleaning',
      urgency: lower.includes('leak') || lower.includes('hot') ? 'high' : 'medium',
      clarifications: ['Is the indoor unit leaking water?', 'Is the airflow completely stopped or just warm?'],
    };
  }

  if (lower.includes('water') || lower.includes('leak') || lower.includes('tap') || lower.includes('pipe') || lower.includes('drain') || lower.includes('clog') || lower.includes('sink') || lower.includes('flush') || lower.includes('toilet')) {
    return {
      categorySlug: 'plumbing',
      suggestedServiceSlug: lower.includes('drain') || lower.includes('clog') ? 'drain-blockage-removal' : lower.includes('flush') || lower.includes('toilet') ? 'toilet-flush-repair' : 'tap-mixer-repair',
      urgency: lower.includes('overflow') || lower.includes('burst') ? 'urgent' : 'high',
      clarifications: ['Can you isolate the main control valve?', 'Is the water leaking continuously or only when opened?'],
    };
  }

  if (lower.includes('electric') || lower.includes('fan') || lower.includes('switch') || lower.includes('spark') || lower.includes('mcb') || lower.includes('power') || lower.includes('light') || lower.includes('inverter') || lower.includes('wiring')) {
    return {
      categorySlug: 'electrician',
      suggestedServiceSlug: lower.includes('inverter') ? 'inverter-battery-setup' : lower.includes('fan') ? 'fan-install-repair' : 'switchboard-repair',
      urgency: lower.includes('spark') || lower.includes('smoke') ? 'urgent' : 'medium',
      clarifications: ['Did any circuit breaker (MCB) trip in the distribution board?', 'Are other rooms having normal power?'],
    };
  }

  if (lower.includes('door') || lower.includes('lock') || lower.includes('wood') || lower.includes('furniture') || lower.includes('hinge') || lower.includes('carpenter') || lower.includes('bed')) {
    return {
      categorySlug: 'carpentry',
      suggestedServiceSlug: lower.includes('furniture') || lower.includes('bed') || lower.includes('table') ? 'furniture-assembly' : 'door-lock-installation',
      urgency: lower.includes('lock') ? 'high' : 'low',
      clarifications: ['Do you already have the new lock/hardware, or should the technician bring one?', 'Is the door wooden or metal?'],
    };
  }

  if (lower.includes('clean') || lower.includes('bathroom') || lower.includes('kitchen') || lower.includes('deep clean') || lower.includes('sofa')) {
    return {
      categorySlug: 'cleaning',
      suggestedServiceSlug: lower.includes('kitchen') ? 'kitchen-cleaning' : 'bathroom-deep-cleaning',
      urgency: 'low',
      clarifications: ['How many bathrooms / rooms need service?', 'Are there hard water stains on the tiles or glass partition?'],
    };
  }

  if (lower.includes('ro') || lower.includes('purifier') || lower.includes('tds') || lower.includes('filter')) {
    return {
      categorySlug: 'ro-water-purifier',
      suggestedServiceSlug: 'ro-purifier-service',
      urgency: 'medium',
      clarifications: ['When was the last filter replacement done?', 'Is the water tasting salty or has the flow reduced?'],
    };
  }

  // Default fallback
  return {
    categorySlug: 'electrician',
    suggestedServiceSlug: 'switchboard-repair',
    urgency: 'medium',
    clarifications: ['Could you provide more details regarding which appliance or room is affected?'],
  };
}

// POST /api/v1/ai/assist-booking
router.post('/assist-booking', async (req: Request, res: Response) => {
  const parsed = assistBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
    });
  }

  const { query } = parsed.data;

  // Perform classification
  const classification = ruleBasedClassify(query);

  const matchedCategory = db.categories.find((c) => c.slug === classification.categorySlug) || db.categories[0];
  const matchedService = db.services.find((s) => s.slug === classification.suggestedServiceSlug) || db.services[0];

  return res.json({
    success: true,
    data: {
      user_query: query,
      detected_category: matchedCategory,
      suggested_service: matchedService,
      urgency_level: classification.urgency,
      clarifying_questions: classification.clarifications,
      structured_summary: `Customer reports: "${query}". Recommended action: Book a professional diagnostic for ${matchedService.name}.`,
    },
  });
});

// POST /api/v1/ai/smart-search
router.post('/smart-search', (req: Request, res: Response) => {
  const parsed = smartSearchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
    });
  }

  const { query } = parsed.data;
  const classification = ruleBasedClassify(query);

  const matchedServices = db.services.filter(
    (s) =>
      s.category_id === (db.categories.find((c) => c.slug === classification.categorySlug)?.id || '') ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
  );

  return res.json({
    success: true,
    data: {
      matched_services: matchedServices.length > 0 ? matchedServices : [db.services[0]],
      detected_intent: classification.categorySlug,
    },
  });
});

// POST /api/v1/ai/customer-support
router.post('/customer-support', (req: Request, res: Response) => {
  const parsed = supportChatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
    });
  }

  const msg = parsed.data.message.toLowerCase();
  let answer = 'FixNear connects you with vetted home service experts in Bengaluru. You can easily book online, track your technician in real-time, and pay securely.';

  if (msg.includes('cancel') || msg.includes('refund')) {
    answer = 'Cancellation Policy: You can cancel free of charge before the service professional departs. If cancelled while provider is en-route, a minimal standard dispatch fee applies. Any pre-paid amount is refunded within 3-5 business days.';
  } else if (msg.includes('price') || msg.includes('cost') || msg.includes('rate')) {
    answer = 'Pricing Transparency: All our service base prices are fixed upfront starting at ₹149. Platform convenience fee is ₹49. If spare parts are required, the professional will provide an itemized estimate for your approval before proceeding.';
  } else if (msg.includes('verify') || msg.includes('safe') || msg.includes('trust')) {
    answer = 'Safety First: Every FixNear technician undergoes Govt ID (Aadhaar/PAN) verification, trade skill vetting, and background checks. Look for the "Verified Pro" badge on provider profiles.';
  } else if (msg.includes('payment') || msg.includes('razorpay') || msg.includes('upi')) {
    answer = 'We accept UPI (GPay, PhonePe, Paytm), Credit/Debit cards, Net Banking via Razorpay. We also offer a 100% risk-free Demo Mode for student hackathon & review evaluations.';
  }

  return res.json({
    success: true,
    data: {
      response: answer,
    },
  });
});

// POST /api/v1/ai/summarize-job
router.post('/summarize-job', (req: Request, res: Response) => {
  const parsed = jobSummarySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
    });
  }

  const { problem_description, service_name } = parsed.data;

  return res.json({
    success: true,
    data: {
      service: service_name || 'General Maintenance',
      summary: `Issue: ${problem_description}`,
      checklist: [
        'Inspect primary connection points and diagnose root issue',
        'Verify voltage / water pressure before beginning repairs',
        'Demonstrate operational test to customer upon completion',
        'Collect customer digital sign-off and receipt review',
      ],
      estimated_time: '45-60 minutes',
    },
  });
});

export default router;
