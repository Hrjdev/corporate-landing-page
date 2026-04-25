const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.set('trust proxy', 1); // Reverse proxy (Docker/Nginx) arkasında IP'leri doğru okuması için eklendi

app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
const settingsRoutes = require('./routes/settings');
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running smoothly.' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
