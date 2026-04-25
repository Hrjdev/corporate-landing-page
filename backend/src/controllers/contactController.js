const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message, recaptchaToken } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required fields.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Lütfen geçerli bir e-posta adresi girin.' });
    }
    if (subject && subject.length > 200) {
      return res.status(400).json({ error: 'Konu 200 karakterden uzun olamaz.' });
    }
    if (message.length > 500) {
      return res.status(400).json({ error: 'Mesaj 500 karakterden uzun olamaz.' });
    }

    if (!recaptchaToken) {
      return res.status(400).json({ error: 'Lütfen bot olmadığınızı doğrulayın.' });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    // For development without keys, we can bypass or warn, but let's implement the actual logic:
    if (secretKey && secretKey !== 'yoursecretkey') {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
      const response = await axios.post(verifyUrl);
      const data = response.data;

      if (!data.success) {
        return res.status(400).json({ error: 'reCAPTCHA doğrulaması başarısız oldu.' });
      }
    } else {
      // If the user hasn't put the real key yet, we still accept it to not break their dev environment.
      console.log('RECAPTCHA secret is unset or default. Bypassing verification.');
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || 'No Subject',
        message
      }
    });

    res.status(201).json({ success: true, message: 'Your message has been sent successfully.', data: newMessage });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ error: 'An internal server error occurred while processing your request.' });
  }
};

module.exports = {
  submitContactForm
};
