import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hexagon, Lock, User, KeyRound, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  username: z.string().min(1, 'Kullanıcı adı zorunludur.'),
  password: z.string().min(1, 'Şifre zorunludur.'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${baseUrl}/admin/login`, data);
      
      const { token, role, name } = response.data;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminRole', role);
      if (name) localStorage.setItem('adminName', name);
      
      toast.success('Başarıyla giriş yapıldı!');
      navigate('/admin');
    } catch (err) {
      toast.error('Geçersiz kullanıcı adı veya şifre.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Hexagon className="h-10 w-10 text-brand-blue" />
            <span className="text-2xl font-bold tracking-tight text-white">Nexus<span className="text-brand-blue">Tech</span> Yönetim</span>
          </div>
          <p className="text-brand-muted">Admin paneline erişim sağlamak için giriş yapın.</p>
        </div>

        <div className="glass-effect p-8 rounded-2xl border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-2">Kullanıcı Adı</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-brand-muted" />
                </div>
                <input
                  type="text"
                  {...register('username')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                  placeholder="admin"
                />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-2">Şifre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-brand-muted" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-blue hover:bg-brand-lightBlue text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-70 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Giriş Yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
