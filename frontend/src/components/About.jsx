import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Globe2, ShieldCheck } from 'lucide-react';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <section id="about" className="py-24 bg-brand-dark/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Neden <span className="text-brand-blue">ErbilTech?</span>
            </h2>
            <p className="text-brand-muted mb-6 leading-relaxed">
              Sektördeki 10 yılı aşkın tecrübemizle, kurumların dijital ihtiyaçlarını analiz ediyor, ölçeklenebilir ve güvenli çözümler üretiyoruz. Modern yazılım mimarileri ve çevik (agile) geliştirme süreçlerimizle projelerinizi zamanında teslim ediyoruz.
            </p>
            <p className="text-brand-muted leading-relaxed">
              Müşteri memnuniyetini merkeze alan yaklaşımımızla sadece bir sağlayıcı değil, aynı dili konuştuğunuz bir teknoloji partneri olmaktan gurur duyuyoruz.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <motion.div variants={itemVariants} className="glass-effect p-6 rounded-xl">
              <Code2 className="w-10 h-10 text-brand-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Modern Mimari</h3>
              <p className="text-brand-muted text-sm scale-95 origin-left">En güncel teknolojilerle yüksek performanslı uygulamalar.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-effect p-6 rounded-xl translate-y-0 sm:translate-y-8">
              <Globe2 className="w-10 h-10 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Global Standartlar</h3>
              <p className="text-brand-muted text-sm scale-95 origin-left">Uluslararası standartlarda kod kalitesi ve UX erişilebilirliği.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-effect p-6 rounded-xl sm:col-span-2 mt-0 sm:mt-4">
              <ShieldCheck className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Üstün Güvenlik</h3>
              <p className="text-brand-muted text-sm scale-95 origin-left">Verileriniz ve uygulamalarınız endüstri standardı güvenlik önlemleriyle korunur. KVKK ve GDPR uyumlu altyapılar inşa ederiz.</p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
