const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/authMiddleware');
const { logActivity } = require('../utils/logger');

const prisma = new PrismaClient();

const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, name: admin.name, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, username: admin.username, name: admin.name, role: admin.role });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const whereClause = {
      isDeleted: false,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } },
        ]
      } : {})
    };

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.contactMessage.count({ where: whereClause })
    ]);

    res.json({
      data: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.contactMessage.update({
      where: { id },
      data: { isDeleted: true }
    });
    
    if (req.admin) {
      await logActivity(req.admin.id, req.admin.name || req.admin.username, 'DELETE_MESSAGE', `#${id} numaralı mesajı çöp kutusuna taşıdı.`);
    }

    res.json({ success: true, message: 'Mesaj çöp kutusuna taşındı' });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const totalMessages = await prisma.contactMessage.count({ where: { isDeleted: false } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newMessages = await prisma.contactMessage.count({
      where: {
        createdAt: { gte: today },
        isDeleted: false
      }
    });

    res.json({ totalMessages, newMessages });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await prisma.contactMessage.count({
      where: {
        status: 'UNREAD',
        isDeleted: false
      }
    });
    res.json({ count: unreadCount });
  } catch (error) {
    next(error);
  }
};

const updateMessageStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!['UNREAD', 'READ', 'REPLIED'].includes(status)) {
      return res.status(400).json({ error: 'Geçersiz statü.' });
    }

    const currentMsg = await prisma.contactMessage.findUnique({ where: { id } });
    if (!currentMsg) {
      return res.status(404).json({ error: 'Mesaj bulunamadı.' });
    }

    const dataToUpdate = { status };
    const adminName = req.admin.name || req.admin.username;

    if (status === 'READ') {
      if (!currentMsg.readBy) {
        dataToUpdate.readBy = adminName;
        dataToUpdate.readAt = new Date();
      }
    } else if (status === 'REPLIED') {
      if (!currentMsg.readBy) {
        dataToUpdate.readBy = adminName;
        dataToUpdate.readAt = new Date();
      }
      if (!currentMsg.repliedBy) {
        dataToUpdate.repliedBy = adminName;
        dataToUpdate.repliedAt = new Date();
      }
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: dataToUpdate
    });
    
    await logActivity(req.admin.id, adminName, 'UPDATE_MESSAGE_STATUS', `#${id} numaralı mesajı ${status} olarak işaretledi.`);

    res.json({ success: true, message: 'Mesaj durumu güncellendi.', data: updatedMessage });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, name: true, username: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(admins);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, username, password, role } = req.body;
    
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({
      data: { name, username, password: hashedPassword, role: role || 'EDITOR' },
      select: { id: true, name: true, username: true, role: true, createdAt: true }
    });

    await logActivity(req.admin.id, req.admin.name || req.admin.username, 'CREATE_USER', `"${name}" isimli yeni yönetici profilini oluşturdu.`);

    res.json({ success: true, message: 'Kullanıcı başarıyla oluşturuldu.', data: newAdmin });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (id === req.admin.id) {
      return res.status(400).json({ error: 'Kendi aktif hesabınızı silemezsiniz.' });
    }

    const targetUser = await prisma.admin.findUnique({ where: { id } });
    if (targetUser) {
      await prisma.admin.delete({ where: { id } });
      await logActivity(req.admin.id, req.admin.name || req.admin.username, 'DELETE_USER', `"${targetUser.name}" isimli yöneticinin hesabını sildi.`);
    }

    res.json({ success: true, message: 'Kullanıcı başarıyla silindi.' });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, username, password, role } = req.body;
    
    // Check if another user has this username
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing && existing.id !== id) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
    }

    const dataToUpdate = { name, username, role };
    if (password && password.trim() !== '') {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, username: true, role: true, createdAt: true }
    });
    
    await logActivity(req.admin.id, req.admin.name || req.admin.username, 'UPDATE_USER', `"${updatedAdmin.name}" yöneticisinin bilgilerini güncelledi.`);

    res.json({ success: true, message: 'Kullanıcı bilgileri güncellendi.', data: updatedAdmin });
  } catch (error) {
    next(error);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.activityLog.count()
    ]);

    res.json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDeletedMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const whereClause = {
      isDeleted: true,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } },
        ]
      } : {})
    };

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.contactMessage.count({ where: whereClause })
    ]);

    res.json({
      data: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteMessagePermanent = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.contactMessage.delete({
      where: { id }
    });
    
    await logActivity(req.admin.id, req.admin.name || req.admin.username, 'DELETE_PERMANENT', `#${id} numaralı mesajı veritabanından kalıcı olarak sildi.`);

    res.json({ success: true, message: 'Mesaj kalıcı olarak silindi' });
  } catch (error) {
    next(error);
  }
};

const restoreMessage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isDeleted: false }
    });
    
    await logActivity(req.admin.id, req.admin.name || req.admin.username, 'RESTORE_MESSAGE', `#${id} numaralı mesajı çöp kutusundan geri yükledi.`);

    res.json({ success: true, message: 'Mesaj geri yüklendi', data: updated });
  } catch (error) {
    next(error);
  }
};

const emptyTrash = async (req, res, next) => {
  try {
    await prisma.contactMessage.deleteMany({
      where: { isDeleted: true }
    });
    
    await logActivity(req.admin.id, req.admin.name || req.admin.username, 'EMPTY_TRASH', `Çöp kutusundaki tüm mesajları kalıcı olarak sildi.`);

    res.json({ success: true, message: 'Çöp kutusu tamamen boşaltıldı.' });
  } catch (error) {
    next(error);
  }
};

const exportMessages = async (req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' }
    });

    const headers = ['ID', 'Gönderen', 'E-Posta', 'Konu', 'Mesaj', 'Durum', 'Tarih'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const msg of messages) {
      const name = `"${msg.name.replace(/"/g, '""')}"`;
      const email = `"${msg.email.replace(/"/g, '""')}"`;
      const subject = `"${(msg.subject || '').replace(/"/g, '""')}"`;
      const messageText = `"${msg.message.replace(/"/g, '""')}"`;
      const status = msg.status;
      const date = msg.createdAt.toISOString();

      csvRows.push([msg.id, name, email, subject, messageText, status, date].join(','));
    }

    const csvData = '\uFEFF' + csvRows.join('\n'); // Türkçe karakterler için BOM

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="mesajlar_raporu.csv"');
    res.send(csvData);

    await logActivity(req.admin.id, req.admin.name || req.admin.username, 'EXPORT_CSV', `Gelen kutusu mesajlarını Excel (CSV) olarak dışa aktardı.`);
  } catch (error) {
    next(error);
  }
};

module.exports = { loginAdmin, getMessages, deleteMessage, getStats, getUnreadCount, updateMessageStatus, getUsers, createUser, deleteUser, updateUser, getActivityLogs, getDeletedMessages, deleteMessagePermanent, restoreMessage, emptyTrash, exportMessages };
