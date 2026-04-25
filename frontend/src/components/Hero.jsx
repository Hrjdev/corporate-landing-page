import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = ({ settings }) => {
  const title = settings?.heroTitle || "Kurumsal Vizyonunuzu\nDijitale Taşıyın";
  const subtitle = settings?.heroSubtitle || "Modern teknolojiler ve yenilikçi çözümlerle işletmenizin dijital dönüşüm yolculuğunda güvenilir teknolojı ortağınız.";
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/30 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-brand-blue/10 text-brand-accent border border-brand-blue/20 text-sm font-medium mb-6">
            dotNox
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white"
        >
          {title.split('\n')[0]} {title.includes('\n') && <br className="hidden md:block" />}
          {title.includes('\n') && (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-accent">
              {title.split('\n').slice(1).join('\n')}
            </span>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-xl text-brand-muted mb-10 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#services" className="w-full sm:w-auto px-8 py-4 bg-brand-blue hover:bg-brand-lightBlue text-white rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 font-medium shadow-lg shadow-brand-blue/25">
            Çözümlerimizi İnceleyin
            <ArrowRight className="w-5 h-5" />
          </a>
          <a href="#contact" className="w-full sm:w-auto px-8 py-4 glass-effect hover:bg-white/10 text-white rounded-lg transition-transform hover:scale-105 font-medium border border-white/20">
            İletişime Geçin
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
