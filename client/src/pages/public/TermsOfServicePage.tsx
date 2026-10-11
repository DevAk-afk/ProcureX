import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar.js';
import { PublicFooter } from '../../components/layout/PublicFooter.js';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-procure-bg flex flex-col font-sans">
      <PublicNavbar />
      <div className="pt-28 pb-16 max-w-4xl mx-auto px-4 sm:px-6 flex-1 text-slate-700 space-y-6">
        <h1 className="text-3xl font-extrabold text-procure-text">Terms of Service</h1>
        <p className="text-xs text-slate-400">Effective Date: October 2025</p>

        <section className="space-y-3 bg-white p-6 rounded-2xl border border-procure-border">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p className="text-xs leading-relaxed text-slate-600">
            By accessing or using the ProcureX platform, you agree to be bound by these enterprise service terms. Users agree not to attempt privilege escalation or circumvent role-based access constraints.
          </p>
        </section>

        <section className="space-y-3 bg-white p-6 rounded-2xl border border-procure-border">
          <h2 className="text-base font-bold text-slate-900">2. Financial Responsibility & Approvals</h2>
          <p className="text-xs leading-relaxed text-slate-600">
            The platform provides deterministic arithmetic tools for requisition validation and 3-way invoice matching. Consequential financial disbursements require human approver confirmation and authorized release.
          </p>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
};
