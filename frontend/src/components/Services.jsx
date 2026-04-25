import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Smartphone, Cloud, Database, BarChart, Settings } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Layout className="w-8 h-8 text-brand-blue" />,
      title: "Web Çözümleri",
      description: "Modern, duyarlı (responsive) ve yüksek performanslı kurumsal web uygulamaları geliştiriyoruz."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-brand-accent" />,
      title: "Mobil Uygulama",
      description: "iOS ve Android platformları için native performansında hibrit mobil uygulamalar üretiyoruz."
    },
    {
      icon: <Cloud className="w-8 h-8 text-blue-400" />,
      title: "Bulut Bilişim",
      description: "AWS, Azure ve Google Cloud üzerinde ölçeklenebilir ve güvenli bulut mimarileri kuruyoruz."
    },
    {
      icon: <Database className="w-8 h-8 text-brand-blue" />,
      title: "Veritabanı Yönetimi",
      description: "Büyük veri projeleriniz için sorunsuz, optimize edilmiş ve yedekli veritabanı sistemleri dizayn ediyoruz."
    },
    {
      icon: <BarChart className="w-8 h-8 text-brand-accent" />,
      title: "İş Zekası & Veri",
      description: "Verilerinizi anlamlı sonuçlara dönüştürecek analiz araçları ve dashboardlar hazırlıyoruz."
    },
    {
      icon: <Settings className="w-8 h-8 text-blue-400" />,
      title: "DevOps & Süreç",
      description: "CI/CD süreç otomasyonları ile yazılım teslimat sürelerinizi hızlandırıyor ve kalitenizi artırıyoruz."
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <section id="services" className="py-24 bg-brand-darker relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
          >
            Profesyonel <span className="text-brand-accent">Hizmetlerimiz</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-brand-muted max-w-2xl mx-auto"
          >
            İşletmenizi ileriye taşıyacak endüstri lideri dijital çözümler sunuyoruz.
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <motion.div 
              key={index} 
              variants={item}
              className="glass-effect p-8 rounded-2xl hover:border-brand-blue/30 transition-colors group cursor-pointer"
            >
              <div className="bg-white/5 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-brand-muted leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Services;
