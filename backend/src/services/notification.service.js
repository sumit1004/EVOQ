import prisma from '../database/prisma.js';
import { generateUuid } from '../utils/uuid.js';

class NotificationService {
  async notifyUser({ recipientId, type, title, message, payload = null }) {
    if (!recipientId) return null;
    try {
      return await prisma.notification.create({
        data: {
          id: generateUuid(),
          recipientId,
          type,
          title,
          message,
          payload,
        },
      });
    } catch (err) {
      console.error('Failed to create notification:', err.message);
      return null;
    }
  }

  async getUserNotifications(userId, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.notification.count({ where: { recipientId: userId } }),
      prisma.notification.count({ where: { recipientId: userId, readAt: null } }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { recipientId: userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}

export const notificationService = new NotificationService();

