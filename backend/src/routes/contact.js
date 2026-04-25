const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { submitContactForm } = require('../controllers/contactController');

// Rate limiting kuralları: Aynı IP adresinden 15 dakikada en fazla 3 istek
const contactLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 dakika
  max: 3, // IP başına maksimum 3 istek
  message: {
    error: 'Çok fazla mesaj gönderdiniz. Lütfen 3 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true, // `RateLimit-*` başlıklarını döner
  legacyHeaders: false, // `X-RateLimit-*` başlıklarını kapatır
});

router.post('/', contactLimiter, submitContactForm);

module.exports = router;
