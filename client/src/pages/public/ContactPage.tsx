import React, { useState } from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar.js';
import { PublicFooter } from '../../components/layout/PublicFooter.js';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-procure-bg flex flex-col font-sans">
      <PublicNavbar />
      <div className="pt-28 pb-16 max-w-4xl mx-auto px-4 sm:px-6 flex-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-procure-text mb-4">Contact ProcureX</h1>
        <p className="text-base text-procure-muted leading-relaxed mb-8">
          Get in touch with our enterprise implementation and support engineering team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-5">
            <div className="bg-white border border-procure-border p-5 rounded-2xl">
              <Mail className="w-5 h-5 text-teal-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">Email</h4>
              <p className="text-xs text-slate-500 mt-1">support@procurex.enterprise</p>
            </div>
            <div className="bg-white border border-procure-border p-5 rounded-2xl">
              <Phone className="w-5 h-5 text-teal-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">Support Desk</h4>
              <p className="text-xs text-slate-500 mt-1">+91 80 4999 1200</p>
            </div>
            <div className="bg-white border border-procure-border p-5 rounded-2xl">
              <MapPin className="w-5 h-5 text-teal-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">Headquarters</h4>
              <p className="text-xs text-slate-500 mt-1">Bengaluru Tech Park, Karnataka, India</p>
            </div>
          </div>

          <div className="md:col-span-7 bg-white border border-procure-border p-6 rounded-2xl shadow-card">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">Inquiry Received</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you for reaching out. Our solution engineer will connect with you shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can ProcureX assist your procurement workflow?"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
