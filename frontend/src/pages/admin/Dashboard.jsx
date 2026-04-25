import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Inbox, Activity, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalMessages: 0, newMessages: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (signal) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const role = localStorage.getItem('adminRole');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const requests = [
        axios.get(`${baseUrl}/admin/stats`, { headers: { Authorization: `Bearer ${token}` }, signal })
      ];
      
      if (role === 'SUPER_ADMIN') {
        requests.push(axios.get(`${baseUrl}/admin/logs`, { headers: { Authorization: `Bearer ${token}` }, signal }));
      }
      
      const responses = await Promise.all(requests);
      
      setStats(responses[0].data);
      if (role === 'SUPER_ADMIN') {
        setLogs(responses[1].data.data || responses[1].data);
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled', err.message);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gösterge Paneli</h1>
          <p className="text-brand-muted">Sisteminizin genel durum özeti.</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-brand-text transition-colors border border-white/10"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-brand-blue' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Total Messages Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-8 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 bg-brand-blue/10 w-32 h-32 rounded-full blur-2xl" />
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-brand-blue/20 p-3 rounded-lg">
              <Inbox className="w-8 h-8 text-brand-blue" />
            </div>
            <h3 className="text-xl font-semibold text-white">Toplam Mesajlar</h3>
          </div>
          <div className="text-5xl font-bold text-white mt-4">{loading ? '-' : stats.totalMessages}</div>
          <p className="text-brand-muted mt-2 text-sm">Veritabanındaki tüm birikmiş iletişim mesajları</p>
        </motion.div>

        {/* New Messages (Today) Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect p-8 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 bg-brand-accent/10 w-32 h-32 rounded-full blur-2xl" />
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-brand-accent/20 p-3 rounded-lg">
              <Activity className="w-8 h-8 text-brand-accent" />
            </div>
            <h3 className="text-xl font-semibold text-white">Bugün Gelenler</h3>
          </div>
          <div className="text-5xl font-bold text-white mt-4">{loading ? '-' : stats.newMessages}</div>
          <p className="text-brand-muted mt-2 text-sm">Bugün içerisinde size ulaşan kişilerin sayısı</p>
        </motion.div>

      </div>

      {/* Activity Logs Section */}
      {localStorage.getItem('adminRole') === 'SUPER_ADMIN' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">Son Aktiviteler</h2>
          <div className="glass-effect rounded-2xl border border-white/5 p-6 overflow-hidden">
            {loading && logs.length === 0 ? (
               <div className="flex items-center justify-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
               </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.length > 0 ? logs.map(log => (
                  <div key={log.id} className="flex gap-4 items-start p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-sm uppercase flex-shrink-0 mt-0.5">
                      {log.adminName.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-white text-sm leading-relaxed">
                        <span className="font-semibold text-brand-blue mr-1">{log.adminName}</span> 
                        {log.details}
                      </p>
                      <span className="text-xs text-brand-muted mt-1.5 block font-medium tracking-wide">
                        {format(new Date(log.createdAt), 'd MMMM yyyy, HH:mm', { locale: tr })}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-brand-muted text-center py-8">Henüz bir hareket bulunmuyor veya veritabanı yansıtması yapılmadı.</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
