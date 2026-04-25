import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';

const contactSchema = z.object({
  name: z.string().min(1, 'Ad Soyad alanı gereklidir'),
  email: z.string().email('Geçerli bir e-posta giriniz'),
  subject: z.string().max(200, 'Konu 200 karakterden uzun olamaz.').optional(),
  message: z.string().min(1, 'Mesaj alanı boş bırakılamaz').max(500, 'Mesajınız en fazla 500 karakter olabilir.')
});

const Contact = ({ settings }) => {
  const email = settings?.contactEmail || "hello@erbiltech.corp";
  const phone = settings?.contactPhone || "+90 (212) 555 01 23";
  const address = settings?.contactAddress || "Teknoloji Vadisi, İnovasyon Cd. No:42 Kadıköy, İstanbul";

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(contactSchema)
  });

  const watchedSubject = watch('subject', '');
  const watchedMessage = watch('message', '');

  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | null
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const onSubmit = async (data) => {
    try {
      if (!recaptchaToken) {
        toast.error('Lütfen bot olmadığınızı doğrulayın.');
        return;
      }

      const payload = { ...data, recaptchaToken };
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      await axios.post(`${baseUrl}/contact`, payload);
      setSubmitStatus('success');
      reset();
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error(error);
      const serverMsg = error.response?.data?.error || 'Lütfen daha sonra tekrar deneyin.';
      if (error.response?.status === 429) {
        setSubmitStatus('rate_limit');
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        toast.error(serverMsg);
      }
    }
  };

  return (
    <section id="contact" className="py-24 bg-brand-dark/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
          >
            Bize <span className="text-brand-blue">Ulaşın</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-brand-muted max-w-2xl mx-auto"
          >
            Projeleriniz, fikirleriniz veya sormak istedikleriniz için formu doldurabilirsiniz. Ekibimiz sizinle en kısa sürede iletişime geçecektir.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="glass-effect p-6 rounded-xl flex items-start gap-4">
              <Mail className="w-6 h-6 text-brand-blue flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">E-Posta Adresi</h4>
                <p className="text-brand-muted">{email}</p>
              </div>
            </div>

            <div className="glass-effect p-6 rounded-xl flex items-start gap-4">
              <Phone className="w-6 h-6 text-brand-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Telefon</h4>
                <p className="text-brand-muted">{phone}</p>
              </div>
            </div>

            <div className="glass-effect p-6 rounded-xl flex items-start gap-4">
              <MapPin className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Ofisimiz</h4>
                <p className="text-brand-muted whitespace-pre-wrap">{address}</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 glass-effect p-8 rounded-2xl relative overflow-hidden"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-brand-text/80 mb-2">Ad Soyad</label>
                  <input
                    {...register("name")}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                    placeholder="John Doe"
                  />
                  {errors.name && <span className="text-red-400 text-xs mt-1 block">{errors.name.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text/80 mb-2">E-Posta</label>
                  <input
                    {...register("email")}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                    placeholder="john@example.com"
                  />
                  {errors.email && <span className="text-red-400 text-xs mt-1 block">{errors.email.message}</span>}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-brand-text/80">Konu</label>
                  <span className="text-xs text-brand-muted">{watchedSubject.length}/200</span>
                </div>
                <input
                  {...register("subject")}
                  maxLength={200}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                  placeholder="Proje Teklifi"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-brand-text/80">Mesajınız</label>
                  <span className="text-xs text-brand-muted">{watchedMessage.length}/500</span>
                </div>
                <textarea
                  {...register("message")}
                  rows="4"
                  maxLength={500}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none"
                  placeholder="Bize projenizden bahsedin..."
                ></textarea>
                {errors.message && <span className="text-red-400 text-xs mt-1 block">{errors.message.message}</span>}
              </div>

              <div className="flex justify-center my-4">
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'yoursitekey'}
                  onChange={(token) => setRecaptchaToken(token)}
                  theme="dark"
                />
              </div>

              <button
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-blue hover:bg-brand-lightBlue text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                {!isSubmitting && <Send className="w-5 h-5" />}
              </button>
            </form>

            <AnimatePresence>
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/95 backdrop-blur-sm z-10"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Teşekkürler!</h3>
                  <p className="text-brand-muted">Mesajınız başarıyla iletildi.</p>
                </motion.div>
              )}
              {submitStatus === 'rate_limit' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/95 backdrop-blur-sm z-10 p-8 text-center rounded-2xl"
                >
                  <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Çok Fazla Gönderim</h3>
                  <p className="text-brand-muted">Lütfen 3 dakika bekledikten sonra tekrar deneyiniz.</p>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
