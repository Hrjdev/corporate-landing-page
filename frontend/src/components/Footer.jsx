import React from 'react';
import { Hexagon, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-dark border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2">
            <Hexagon className="h-6 w-6 text-brand-blue" />
            <span className="text-lg font-bold tracking-tight text-white">Nexus<span className="text-brand-blue">Tech</span></span>
          </div>

          <div className="text-brand-muted text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} NexusTech Corp. Tüm hakları saklıdır.
          </div>

          <div className="flex gap-4">
            <a href="#" className="text-brand-muted hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-brand-muted hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-brand-muted hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
