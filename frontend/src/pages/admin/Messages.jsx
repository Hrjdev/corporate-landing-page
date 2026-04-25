import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, Mail, Loader2, AlertCircle, Check, X, RefreshCw, RotateCcw, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox');
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  const role = localStorage.getItem('adminRole');

  // Debounce logic for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const endpoint = activeTab === 'trash' ? '/admin/messages/trash' : '/admin/messages';
      
      const response = await axios.get(`${baseUrl}${endpoint}`, {
        params: { page, limit, search: debouncedSearchTerm },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.pagination) {
        setMessages(response.data.data);
        setTotalPages(response.data.pagination.totalPages || 1);
        setTotalCount(response.data.pagination.total || 0);
      } else {
        // Fallback backward compatibility
        setMessages(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeTab, page, debouncedSearchTerm]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      if (activeTab === 'trash') {
        await axios.delete(`${baseUrl}/admin/messages/${id}/permanent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.delete(`${baseUrl}/admin/messages/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      fetchMessages(); // Refetch messages to update count and get next ones
      setDeleteId(null);
      window.dispatchEvent(new Event('messages_updated'));
    } catch (err) {
      console.error(err);
      alert('Mesaj silinirken bir hata oluştu.');
    }
  };

  const handleRestore = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      await axios.patch(`${baseUrl}/admin/messages/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMessages();
      window.dispatchEvent(new Event('messages_updated'));
    } catch (err) {
      console.error(err);
      alert('Mesaj geri yüklenirken bir hata oluştu.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.patch(`${baseUrl}/admin/messages/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(messages.map(msg => msg.id === id ? response.data.data : msg));
      window.dispatchEvent(new Event('messages_updated'));
    } catch (err) {
      console.error(err);
      alert('Durum güncellenirken hata oluştu.');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setPage(1);
  };

  const handleEmptyTrash = async () => {
    if(!window.confirm('Tüm çöp kutusunu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      await axios.delete(`${baseUrl}/admin/messages/trash/empty`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMessages();
      window.dispatchEvent(new Event('messages_updated'));
      alert('Çöp kutusu başarıyla boşaltıldı.');
    } catch (err) {
      console.error(err);
      alert('Çöp kutusu boşaltılırken hata oluştu.');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.get(`${baseUrl}/admin/messages/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mesajlar_raporu.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Dışa aktarma sırasında hata oluştu.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {activeTab === 'inbox' ? 'Gelen Kutusu' : 'Çöp Kutusu'}
          </h1>
          <p className="text-brand-muted">
            {activeTab === 'inbox' ? 'Müşterilerinizden gelen iletişim mesajları.' : 'Silinmiş ve kalıcı olarak yok edilmeyi bekleyen mesajlar.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => fetchMessages()}
            className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-brand-muted hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
            title="Yenile"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-brand-muted" />
            </div>
            <input
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="İsim, e-posta veya konu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {role === 'SUPER_ADMIN' && (
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 justify-between items-center w-full">
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('inbox')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'inbox' ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30' : 'text-brand-muted hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              Gelen Kutusu
            </button>
            <button
              onClick={() => handleTabChange('trash')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'trash' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-brand-muted hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              Çöp Kutusu
            </button>
          </div>
          <div className="flex gap-2">
            {activeTab === 'inbox' && (
              <button 
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Dışa Aktar (.csv)
              </button>
            )}
            {activeTab === 'trash' && messages.length > 0 && (
              <button 
                onClick={handleEmptyTrash}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Tümünü Temizle
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 bg-brand-dark rounded-xl border border-white/5 overflow-hidden flex flex-col">
        {loading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-brand-muted p-8 text-center">
            <Mail className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Gösterilecek mesaj bulunamadı.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto flex flex-col">
            <table className="w-full text-left border-collapse table-fixed min-w-[900px] mb-auto">
              <thead className="bg-brand-dark/95 backdrop-blur-md sticky top-0 z-20 border-b border-white/10 shadow-sm">
                <tr>
                  <th className="p-4 text-sm font-semibold text-brand-muted uppercase tracking-wider w-[20%]">Gönderen</th>
                  <th className="p-4 text-sm font-semibold text-brand-muted uppercase tracking-wider w-[15%]">Konu</th>
                  <th className="p-4 text-sm font-semibold text-brand-muted uppercase tracking-wider w-[30%]">Mesaj İçeriği</th>
                  <th className="p-4 text-sm font-semibold text-brand-muted uppercase tracking-wider w-[15%]">Durum</th>
                  <th className="p-4 text-sm font-semibold text-brand-muted uppercase tracking-wider w-[12%]">Tarih</th>
                  <th className="p-4 text-sm font-semibold text-brand-muted uppercase tracking-wider text-right w-[8%] min-w-[80px]">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {messages.map((msg) => (
                      <tr 
                        key={msg.id} 
                        className={`hover:bg-white/5 transition-colors group ${msg.status === 'UNREAD' ? 'bg-white/[0.02]' : ''}`}
                      >
                        <td className="p-4 align-top">
                          <div className={`font-medium ${msg.status === 'UNREAD' ? 'text-white' : 'text-white/80'}`}>
                            {msg.status === 'UNREAD' && <span className="inline-block w-2 h-2 rounded-full bg-brand-blue mr-2"></span>}
                            {msg.name}
                          </div>
                          <div className="text-sm text-brand-muted">{msg.email}</div>
                        </td>
                        <td className="p-4 align-top overflow-hidden" style={{ maxWidth: '200px' }}>
                          <div className="max-h-[100px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
                            <span 
                              className={`inline-block w-fit max-w-full whitespace-pre-wrap break-words px-2 py-1 rounded text-xs font-medium border ${msg.status === 'UNREAD' ? 'bg-brand-blue/20 text-brand-blue border-brand-blue/30' : 'bg-white/10 text-brand-muted border-white/20'}`}
                              style={{ wordBreak: 'break-word' }}
                            >
                              {msg.subject}
                            </span>
                          </div>
                        </td>
                        <td className={`p-4 align-top text-sm whitespace-pre-wrap break-words overflow-hidden ${msg.status === 'UNREAD' ? 'text-white/90' : 'text-brand-muted/80'}`} style={{ wordBreak: 'break-word', maxWidth: '300px' }}>
                          <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                            {msg.message}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          {msg.status !== 'REPLIED' ? (
                            <button 
                              onClick={() => {
                                const nextStatus = msg.status === 'UNREAD' ? 'READ' : 'REPLIED';
                                handleStatusChange(msg.id, nextStatus);
                              }}
                              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                                msg.status === 'UNREAD' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20' : 
                                'bg-brand-blue/10 text-brand-blue border-brand-blue/20 hover:bg-brand-blue/20' 
                              }`}
                            >
                              {msg.status === 'UNREAD' ? 'Okunmadı' : 'Okundu'}
                            </button>
                          ) : (
                            <span className="inline-block px-3 py-1.5 rounded-md text-xs font-semibold border bg-green-500/10 text-green-500 border-green-500/20">
                              Yanıtlandı
                            </span>
                          )}
                          <div className="mt-2 text-[10px] flex flex-wrap items-center gap-2">
                            {msg.readBy && (
                              <span className="text-white/60 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5" title="Okuyan">
                                <strong className="font-medium mr-1">{msg.readBy}</strong> {format(new Date(msg.readAt), 'd MMM HH:mm', { locale: tr })}
                              </span>
                            )}
                            {msg.repliedBy && (
                              <span className="text-green-400/80 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10" title="Yanıtlayan">
                                <strong className="font-medium mr-1">{msg.repliedBy}</strong> {format(new Date(msg.repliedAt), 'd MMM HH:mm', { locale: tr })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-top text-sm text-brand-muted">
                          {format(new Date(msg.createdAt), 'd MMM yyyy, HH:mm', { locale: tr })}
                        </td>
                        <td className="p-4 align-middle text-right relative min-w-[70px]">
                          <div className="flex items-center justify-end h-8">
                            <AnimatePresence mode="wait">
                              {deleteId === msg.id ? (
                                <motion.div 
                                  key="confirm"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.15 }}
                                  className="flex items-center gap-1"
                                >
                                  <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors" title="Evet, Sil">
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setDeleteId(null)} className="p-1.5 text-brand-muted bg-white/5 hover:bg-white/10 rounded transition-colors" title="İptal">
                                    <X className="w-4 h-4" />
                                  </button>
                                </motion.div>
                              ) : (
                                <motion.div 
                                  key="idle"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.15 }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                >
                                  {activeTab === 'trash' && (
                                    <button 
                                      onClick={() => handleRestore(msg.id)}
                                      className="p-1.5 text-brand-muted hover:text-green-400 hover:bg-green-400/10 rounded transition-colors"
                                      title="Geri Yükle"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => setDeleteId(msg.id)}
                                    className="p-1.5 text-brand-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                    title={activeTab === 'trash' ? 'Kalıcı Olarak Sil' : 'Çöp Kutusuna Taşı'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.01]">
                <div className="text-sm text-brand-muted">
                  Toplam <span className="text-white font-medium">{totalCount}</span> kayıt
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`p-1.5 rounded ${page === 1 ? 'text-brand-muted/30 cursor-not-allowed' : 'text-brand-muted hover:text-white hover:bg-white/10 transition-colors'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-sm">
                    Sayfa <span className="font-medium text-white">{page}</span> / {totalPages}
                  </div>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`p-1.5 rounded ${page === totalPages ? 'text-brand-muted/30 cursor-not-allowed' : 'text-brand-muted hover:text-white hover:bg-white/10 transition-colors'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
