import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon, Plus, Trash2, Shield, ShieldAlert, X } from 'lucide-react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const userSchema = z.object({
    name: z.string().min(1, 'İsim gereklidir'),
    username: z.string().min(1, 'Kullanıcı adı gereklidir'),
    password: z.string().optional(),
    role: z.string()
  }).superRefine((data, ctx) => {
    if (!editingUser && (!data.password || data.password.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Şifre zorunludur'
      });
    }
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema)
  });

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('adminToken');
  const currentUser = localStorage.getItem('adminName');

  const fetchUsers = async (signal) => {
    try {
      const response = await axios.get(`${baseUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        signal
      });
      setUsers(response.data);
    } catch (err) {
      if ((signal && signal.aborted) || axios.isCancel(err) || err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log('Request canceled');
      } else {
        console.error(err);
        toast.error('Kullanıcılar yüklenirken bir hata oluştu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, []);

  const openEditModal = (user) => {
    setEditingUser(user);
    reset({
      name: user.name,
      username: user.username,
      role: user.role,
      password: '' // empty so it won't be updated unless typed
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingUser(null);
    reset({ name: '', username: '', role: 'EDITOR', password: '' });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingUser) {
        await axios.patch(`${baseUrl}/admin/users/${editingUser.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Yönetici başarıyla güncellendi.');
      } else {
        await axios.post(`${baseUrl}/admin/users`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Yönetici başarıyla oluşturuldu.');
      }
      setIsModalOpen(false);
      reset();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'İşlem sırasında bir hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Kullanıcı başarıyla silindi.');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Silme işlemi başarısız.');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Yöneticiler</h1>
          <p className="text-brand-muted">Sistemdeki yönetici ve editör hesaplarını yönetin.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-brand-blue hover:bg-brand-lightBlue text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Kullanıcı Ekle
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-effect rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-sm font-semibold text-white">İsim</th>
                <th className="p-4 text-sm font-semibold text-white">Kullanıcı Adı</th>
                <th className="p-4 text-sm font-semibold text-white">Rol</th>
                <th className="p-4 text-sm font-semibold text-white">Oluşturulma</th>
                <th className="p-4 text-sm font-semibold text-white text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-xs uppercase">
                        {user.name.substring(0, 2)}
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-brand-muted">@{user.username}</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${user.role === 'SUPER_ADMIN'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                      <Shield className="w-3 h-3" />
                      {user.role === 'SUPER_ADMIN' ? 'Süper Admin' : 'Editör'}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-sm text-brand-muted flex flex-col">
                    <span>{format(new Date(user.createdAt), 'd MMM yyyy', { locale: tr })}</span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    {user.name !== currentUser ? (
                      deleteId === user.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleDelete(user.id)} className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded hover:bg-red-400/20">Sil</button>
                          <button onClick={() => setDeleteId(null)} className="text-brand-muted text-xs bg-white/5 px-2 py-1 rounded hover:bg-white/10">İptal</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(user)}
                            className="p-1 text-brand-muted hover:text-brand-blue rounded transition-colors text-sm font-medium"
                            title="Kullanıcıyı Düzenle"
                          >
                            Düzenle
                          </button>
                          <button 
                            onClick={() => setDeleteId(user.id)}
                            className="p-1.5 text-brand-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="Kullanıcıyı Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(user)}
                            className="p-1 text-brand-muted hover:text-brand-blue rounded transition-colors text-sm font-medium"
                            title="Kullanıcıyı Düzenle"
                          >
                            Düzenle
                          </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-brand-muted">Henüz kullanıcı bulunmuyor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-brand-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-brand-blue" />
                  {editingUser ? 'Yöneticiyi Düzenle' : 'Yeni Yönetici Ekle'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-brand-muted hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-text/80 mb-1.5">Sistemdeki İsmi (Ad Soyad)</label>
                    <input
                      {...register("name")}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      placeholder=" "
                    />
                    {errors.name && <span className="text-red-400 text-xs mt-1 block">{errors.name.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-text/80 mb-1.5">Giriş Kullanıcı Adı (Login ID)</label>
                    <input
                      {...register("username")}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      placeholder=" "
                    />
                    {errors.username && <span className="text-red-400 text-xs mt-1 block">{errors.username.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-text/80 mb-1.5">
                      Giriş Şifresi {editingUser && <span className="text-brand-muted text-xs font-normal">(Değiştirmek istemiyorsanız boş bırakın)</span>}
                    </label>
                    <input
                      type="password"
                      {...register("password")}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      placeholder="••••••••"
                    />
                    {errors.password && <span className="text-red-400 text-xs mt-1 block">{errors.password.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-text/80 mb-1.5">Hesap Yetkisi (Rol)</label>
                    <select
                      {...register("role")}
                      className="w-full bg-[#1c1c24] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer"
                    >
                      <option value="EDITOR">Editör (Sadece Mesajları Görebilir)</option>
                      <option value="SUPER_ADMIN">Süper Admin (Tam Yetki)</option>
                    </select>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors">İptal</button>
                    <button type="submit" className="flex-1 py-2.5 bg-brand-blue hover:bg-brand-lightBlue text-white rounded-lg font-medium transition-colors">
                      {editingUser ? 'Güncelle' : 'Oluştur'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;
