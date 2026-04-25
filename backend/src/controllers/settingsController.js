const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logActivity } = require('../utils/logger');

const getSettings = async (req, res) => {
  try {
    let settings = await prisma.siteContent.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = await prisma.siteContent.create({
        data: { id: 1 } // Will use defaults defined in schema
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Ayarlar yüklenirken sorun oluştu.' });
  }
};

const updateSettings = async (req, res) => {
  try {
    if (req.admin && req.admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Sadece yetkili yöneticiler bu işlemi yapabilir.' });
    }

    const { heroTitle, heroSubtitle, contactEmail, contactPhone, contactAddress } = req.body;
    
    // UPSERT pattern
    const updatedSettings = await prisma.siteContent.upsert({
      where: { id: 1 },
      update: { heroTitle, heroSubtitle, contactEmail, contactPhone, contactAddress },
      create: { id: 1, heroTitle, heroSubtitle, contactEmail, contactPhone, contactAddress }
    });

    const adminName = req.admin ? (req.admin.name || req.admin.username) : 'Sistem';
    const adminId = req.admin ? req.admin.id : null;
    await logActivity(adminId, adminName, 'UPDATE_SETTINGS', 'Site ayarlarını ve iletişim bilgilerini güncelledi.');

    res.json({ success: true, message: 'Ayarlar güncellendi.', data: updatedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Ayarlar güncellenirken sorun oluştu.' });
  }
};

module.exports = { getSettings, updateSettings };
