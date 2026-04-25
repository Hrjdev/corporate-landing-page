const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'temp-secret-fallback-key-2026';

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: JWT_SECRET çevre değişkeni tanımlanmamış. Sistem güvenliği için başlatılamıyor.');
    process.exit(1);
  } else {
    console.warn('UYARI: JWT_SECRET çevre değişkeni tanımlanmamış! Güvenlik için lütfen .env dosyasını kontrol edin.');
  }
}

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Erişim reddedildi: Token bulunamadı.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
};

module.exports = { verifyAdmin, JWT_SECRET };
