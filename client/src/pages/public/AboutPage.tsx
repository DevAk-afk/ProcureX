import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar.js';
import { PublicFooter } from '../../components/layout/PublicFooter.js';
import { ShieldCheck, Target, Award, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-procure-bg flex flex-col font-sans">
      <PublicNavbar />
      <div className="pt-28 pb-16 max-w-4xl mx-auto px-4 sm:px-6 flex-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-procure-text mb-4">About ProcureX</h1>
        <p className="text-base text-procure-muted leading-relaxed mb-8">
          ProcureX is an enterprise AI-powered procurement management platform engineered to modernize how organizations manage suppliers, purchasing requisitions, goods receipts, and 3-way invoice matching.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-10">
          <div className="bg-white border border-procure-border p-6 rounded-2xl shadow-card">
            <Target className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-bold text-base text-slate-800">Our Mission</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              To eliminate manual friction and unauthorized spending by connecting sourcing, finance, and warehouse operations through deterministic intelligence.
            </p>
          </div>

          <div className="bg-white border border-procure-border p-6 rounded-2xl shadow-card">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="font-bold text-base text-slate-800">Financial Integrity</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Strict 3-way reconciliation ensures zero variance between what was ordered, what was received, and what is paid.
            </p>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
