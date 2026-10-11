import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-procure-border pt-16 pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-100">
          {/* Brand & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center text-white font-black text-base shadow-sm">
                P
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-procure-text">
                Procure<span className="text-teal-500">X</span>
              </span>
            </Link>
            <p className="text-sm text-procure-muted mt-4 max-w-sm leading-relaxed">
              ProcureX is an enterprise-grade AI-powered procurement management platform. Automate purchasing, score suppliers, reconcile invoices with 3-way matching, and forecast inventory in real time.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Enterprise RBAC • GST Compliance • Deterministic AI Grounding
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-teal-600 transition-colors">Vendor Scoring</Link></li>
              <li><Link to="/login" className="hover:text-teal-600 transition-colors">Purchase Orders</Link></li>
              <li><Link to="/login" className="hover:text-teal-600 transition-colors">Requisition Approvals</Link></li>
              <li><Link to="/login" className="hover:text-teal-600 transition-colors">3-Way Invoice Matching</Link></li>
              <li><Link to="/login" className="hover:text-teal-600 transition-colors">Inventory Control</Link></li>
            </ul>
          </div>

          {/* AI Intelligence */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              AI Intelligence
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-teal-600 transition-colors">Procurement Copilot</Link></li>
              <li><Link to="/login" className="hover:text-teal-600 transition-colors">Smart Sourcing</Link></li>
              <li><Link to="/login" className="hover:text-teal-600 transition-colors">Quote Analyzer</Link></li>
              <li><Link to="/login" className="hover:text-teal-600 transition-colors">Spend Anomaly Alerts</Link></li>
              <li><Link to="/login" className="hover:text-teal-600 transition-colors">Inventory Forecasting</Link></li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Organization
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-teal-600 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-teal-600 transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-teal-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-teal-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} ProcureX Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered for modern enterprise procurement teams.
          </p>
        </div>
      </div>
    </footer>
  );
};
