import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar.js';
import { PublicFooter } from '../../components/layout/PublicFooter.js';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-procure-bg flex flex-col font-sans">
      <PublicNavbar />
      <div className="pt-28 pb-16 max-w-4xl mx-auto px-4 sm:px-6 flex-1 text-slate-700 space-y-6">
        <h1 className="text-3xl font-extrabold text-procure-text">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Effective Date: October 2025</p>

        <section className="space-y-3 bg-white p-6 rounded-2xl border border-procure-border">
          <h2 className="text-base font-bold text-slate-900">1. Data Collected</h2>
          <p className="text-xs leading-relaxed text-slate-600">
            ProcureX collects authorized business records including supplier organizational names, contact representatives, GSTIN identifiers, purchase order amounts, goods receipt records, and financial transaction references strictly for procurement management.
          </p>
        </section>

        <section className="space-y-3 bg-white p-6 rounded-2xl border border-procure-border">
          <h2 className="text-base font-bold text-slate-900">2. Data Security & Storage</h2>
          <p className="text-xs leading-relaxed text-slate-600">
            Passwords are cryptographically salted and hashed using bcrypt. Access tokens are governed via secure HttpOnly session cookies. Role-based access control prevents unauthorized horizontal or vertical data traversal.
          </p>
        </section>

        <section className="space-y-3 bg-white p-6 rounded-2xl border border-procure-border">
          <h2 className="text-base font-bold text-slate-900">3. AI Grounding & Privacy</h2>
          <p className="text-xs leading-relaxed text-slate-600">
            Data processed by the ProcureX AI Intelligence Center is bounded by allowlisted domain queries. No customer purchase order records or pricing agreements are used to train public language models.
          </p>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
};
