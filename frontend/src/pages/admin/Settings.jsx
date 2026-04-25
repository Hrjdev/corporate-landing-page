import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const settingsSchema = z.object({
  heroTitle: z.string().min(1, 'Ana başlık zorunludur.'),
  heroSubtitle: z.string().min(1, 'Alt başlık zorunludur.'),
  contactEmail: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  contactPhone: z.string().min(1, 'Telefon numarası zorunludur.'),
  contactAddress: z.string().min(1, 'Adres zorunludur.')
});

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(settingsSchema)
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await axios.get(`${baseUrl}/settings`);
        reset(response.data);
      } catch (err) {
        toast.error('Ayarlar yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      await axios.patch(`${baseUrl}/admin/settings`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Ayarlar başarıyla güncellendi.');
    } catch (err) {
      toast.error('Ayarlar güncellenirken hata oluştu veya yetkiniz yok.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Sistem Ayarları</h1>
        <p className="text-brand-muted">Web sitenizin ana metinlerini ve iletişim bilgilerini güncelleyin.</p>
      </div>
      <div className="bg-brand-dark rounded-xl border border-white/5 p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Karşılama Ekranı (Hero)</h3>
            
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-2">Ana Başlık</label>
              <input
                type="text"
                {...register('heroTitle')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
              />
              {errors.heroTitle && <p className="text-red-500 text-xs mt-1">{errors.heroTitle.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-2">Alt Başlık (Açıklama)</label>
              <textarea
                rows="3"
                {...register('heroSubtitle')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none"
              ></textarea>
              {errors.heroSubtitle && <p className="text-red-500 text-xs mt-1">{errors.heroSubtitle.message}</p>}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">İletişim Bilgileri</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-text/80 mb-2">E-Posta Adresi</label>
                <input
                  type="email"
                  {...register('contactEmail')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                />
                {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-brand-text/80 mb-2">Telefon Numarası</label>
                <input
                  type="text"
                  {...register('contactPhone')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                />
                {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-2">Açık Adres</label>
              <textarea
                rows="2"
                {...register('contactAddress')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none"
              ></textarea>
              {errors.contactAddress && <p className="text-red-500 text-xs mt-1">{errors.contactAddress.message}</p>}
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-brand-blue hover:bg-brand-lightBlue text-white rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
