const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logActivity = async (adminId, adminName, action, details) => {
  try {
    await prisma.activityLog.create({
      data: {
        adminId: parseInt(adminId) || null,
        adminName: adminName || 'Sistem',
        action,
        details
      }
    });
  } catch (error) {
    console.error('Activity log error:', error);
  }
};

module.exports = { logActivity };
