import { Router, Response } from 'express';
import { db } from '../db/supabase.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/notifications - list notifications for current user with unread count
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const userNotifications = db.notifications
    .filter((n) => n.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = userNotifications.filter((n) => !n.is_read).length;

  return res.json({
    success: true,
    unread_count: unreadCount,
    data: userNotifications,
  });
});

// PATCH /api/v1/notifications/:id/read - mark single notification as read
router.patch('/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const notification = db.notifications.find((n) => n.id === id && n.user_id === user.id);
  if (!notification) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Notification not found' },
    });
  }

  notification.is_read = true;

  return res.json({
    success: true,
    data: notification,
  });
});

// POST /api/v1/notifications/read-all - mark all user notifications as read
router.post('/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  db.notifications
    .filter((n) => n.user_id === user.id)
    .forEach((n) => {
      n.is_read = true;
    });

  return res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});

export default router;
