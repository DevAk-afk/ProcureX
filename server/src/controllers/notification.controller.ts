import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const userRole = req.user?.role;
  const userId = req.user?._id;

  const notifications = await Notification.find({
    $or: [
      { userId },
      { roleScope: 'all' },
      { roleScope: userRole },
    ],
  }).sort({ createdAt: -1 }).limit(30);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await Notification.findByIdAndUpdate(id, { isRead: true });
  res.status(200).json({ success: true, message: 'Notification marked as read.' });
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const userRole = req.user?.role;
  const userId = req.user?._id;

  await Notification.updateMany(
    {
      $or: [{ userId }, { roleScope: 'all' }, { roleScope: userRole }],
      isRead: false,
    },
    { isRead: true }
  );

  res.status(200).json({ success: true, message: 'All notifications marked as read.' });
};
