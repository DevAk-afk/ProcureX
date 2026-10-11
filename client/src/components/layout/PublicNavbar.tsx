import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Menu, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const { user, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'AI Intelligence', href: '#ai-intelligence' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-procure-border py-3.5'
          : 'bg-white border-b border-procure-border py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
            P
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-procure-text">
              Procure<span className="text-teal-500">X</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) =>
            link.href.startsWith('#') ? (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Auth CTA buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/demo"
                className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100/80 px-3 py-2 rounded-xl border border-teal-200 transition-colors flex items-center gap-1.5"
                title="Open isolated demo environment with sample data"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Explore Demo
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-teal-600 px-3.5 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-all"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-procure-border px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) =>
            link.href.startsWith('#') ? (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 py-2 hover:text-teal-600"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 py-2 hover:text-teal-600"
              >
                {link.label}
              </Link>
            )
          )}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 font-semibold text-sm text-slate-700 border border-slate-200 rounded-xl"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 font-semibold text-sm bg-teal-500 text-white rounded-xl shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
