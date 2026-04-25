import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Ana Sayfa', href: '#home' },
    { name: 'Hakkımızda', href: '#about' },
    { name: 'Hizmetler', href: '#services' },
    { name: 'İletişim', href: '#contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-brand-dark/90 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Hexagon className="h-8 w-8 text-brand-blue" />
            <span className="text-xl font-bold tracking-tight text-white">Erbil<span className="text-brand-blue">Tech</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-brand-text/80 hover:text-brand-accent transition-colors font-medium">
                {link.name}
              </a>
            ))}
            <a href="#contact" className="px-5 py-2 bg-brand-blue hover:bg-brand-lightBlue text-white rounded-lg transition-colors font-medium">
              Bize Ulaşın
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-brand-text">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <motion.div
        initial={false}
        animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
        className="md:hidden overflow-hidden bg-brand-dark border-t border-white/10"
      >
        <div className="px-4 py-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block text-brand-text/80 hover:text-brand-accent font-medium">
              {link.name}
            </a>
          ))}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
