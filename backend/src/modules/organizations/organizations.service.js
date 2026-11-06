import prisma from '../../database/prisma.js';
import { generateUuid } from '../../utils/uuid.js';
import { notificationService } from '../../services/notification.service.js';
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from '../../utils/errors.js';

export class OrganizationsService {
  async listOrganizations() {
    return prisma.organization.findMany({
      include: {
        _count: {
          select: { tournaments: true, memberships: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getMyOrganizations(userId) {
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        organization: {
          include: {
            _count: { select: { tournaments: true, memberships: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.organization,
      myRole: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async createOrganization(userId, data) {
    const existing = await prisma.organization.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new ConflictError(`Organization slug '${data.slug}' is already taken`);
    }

    const orgId = generateUuid();

    const [org] = await prisma.$transaction([
      prisma.organization.create({
        data: {
          id: orgId,
          ownerId: userId,
          ...data,
        },
      }),
      prisma.organizationMembership.create({
        data: {
          id: generateUuid(),
          organizationId: orgId,
          userId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      }),
    ]);

    return org;
  }

  async getOrganizationBySlug(slug) {
    const org = await prisma.organization.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, username: true } },
        memberships: {
          where: { status: 'ACTIVE' },
          include: {
            user: { select: { id: true, username: true } },
          },
        },
        tournaments: {
          where: { visibility: 'PUBLIC' },
          include: { game: true, _count: { select: { registrations: true, matches: true } } },
          orderBy: { startDate: 'desc' },
        },
        portfolioRecords: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!org) {
      throw new NotFoundError(`Organization '${slug}' not found`);
    }

    return org;
  }

  async updateOrganization(orgId, userId, updateData) {
    const membership = await prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      throw new ForbiddenError('Only organization owners and admins can update settings');
    }

    return prisma.organization.update({
      where: { id: orgId },
      data: updateData,
    });
  }

  async addStaff(orgId, actorId, { usernameOrEmail, role }) {
    const actorMembership = await prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: actorId } },
    });

    if (!actorMembership || !['OWNER', 'ADMIN'].includes(actorMembership.role)) {
      throw new ForbiddenError('Only organization owners and admins can manage staff');
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail.toLowerCase() },
          { username: usernameOrEmail },
        ],
      },
    });

    if (!targetUser) {
      throw new NotFoundError(`User '${usernameOrEmail}' not found`);
    }

    const org = await prisma.organization.findUnique({ where: { id: orgId } });

    const membership = await prisma.organizationMembership.upsert({
      where: { organizationId_userId: { organizationId: orgId, userId: targetUser.id } },
      create: {
        id: generateUuid(),
        organizationId: orgId,
        userId: targetUser.id,
        role,
        status: 'ACTIVE',
      },
      update: {
        role,
        status: 'ACTIVE',
      },
    });

    await notificationService.notifyUser({
      recipientId: targetUser.id,
      type: 'ORGANIZATION_INVITE',
      title: 'Added to Organization Staff',
      message: `You have been added to ${org.name} as ${role}.`,
      payload: { organizationId: orgId, orgSlug: org.slug },
    });

    return membership;
  }

  async removeStaff(orgId, actorId, targetUserId) {
    const actorMembership = await prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: actorId } },
    });

    if (!actorMembership || !['OWNER', 'ADMIN'].includes(actorMembership.role)) {
      throw new ForbiddenError('Permission denied to remove staff');
    }

    const targetMembership = await prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: targetUserId } },
    });

    if (!targetMembership) {
      throw new NotFoundError('Staff member not found');
    }

    if (targetMembership.role === 'OWNER') {
      throw new ForbiddenError('Cannot remove organization owner');
    }

    return prisma.organizationMembership.delete({
      where: { organizationId_userId: { organizationId: orgId, userId: targetUserId } },
    });
  }
}

export const organizationsService = new OrganizationsService();

