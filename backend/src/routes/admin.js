const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { loginAdmin, getMessages, deleteMessage, getStats } = require('../controllers/adminController');
const { verifyAdmin } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');
const rateLimit = require('express-rate-limit');

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // IP başına maksimum 5 giriş denemesi
  message: { error: 'Çok fazla başarısız giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authMiddleware = verifyAdmin;
const requireSuperAdmin = checkRole(['SUPER_ADMIN']);

router.post('/login', adminLoginLimiter, loginAdmin);
router.get('/stats', verifyAdmin, getStats);
router.get('/messages', authMiddleware, getMessages);
router.get('/messages/trash', authMiddleware, requireSuperAdmin, adminController.getDeletedMessages);
router.delete('/messages/trash/empty', authMiddleware, requireSuperAdmin, adminController.emptyTrash);
router.get('/messages/export', authMiddleware, requireSuperAdmin, adminController.exportMessages);
router.delete('/messages/:id', authMiddleware, deleteMessage);
router.delete('/messages/:id/permanent', authMiddleware, requireSuperAdmin, adminController.deleteMessagePermanent);
router.patch('/messages/:id/restore', authMiddleware, requireSuperAdmin, adminController.restoreMessage);
router.patch('/messages/:id/status', authMiddleware, adminController.updateMessageStatus);
router.get('/unread-count', authMiddleware, adminController.getUnreadCount);
const { updateSettings } = require('../controllers/settingsController');
router.patch('/settings', authMiddleware, updateSettings);

router.get('/users', authMiddleware, requireSuperAdmin, adminController.getUsers);
router.post('/users', authMiddleware, requireSuperAdmin, adminController.createUser);
router.delete('/users/:id', authMiddleware, requireSuperAdmin, adminController.deleteUser);
router.patch('/users/:id', authMiddleware, requireSuperAdmin, adminController.updateUser);

router.get('/logs', authMiddleware, requireSuperAdmin, adminController.getActivityLogs);

module.exports = router;
