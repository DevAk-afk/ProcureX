import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Notification } from '../../types/index.js';
import { Bell, CheckCheck, RefreshCw, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) setNotifications(res.data.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await api.post('/notifications/read-all');
    fetchNotifications();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            System alerts, approval triage requests, and workflow automation notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 bg-white border border-procure-border text-slate-700 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-sm hover:bg-slate-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-teal-600" /> Mark All as Read
          </button>
          <button onClick={fetchNotifications} className="p-2 text-slate-500 hover:text-slate-800 rounded-lg">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-procure-border rounded-2xl shadow-card divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No notifications recorded.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start gap-3.5 transition-colors ${
                n.isRead ? 'bg-white' : 'bg-teal-50/30'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {n.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : n.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Info className="w-5 h-5 text-teal-600" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                {n.link && (
                  <Link to={n.link} className="inline-block mt-2 text-teal-600 hover:underline font-bold text-[11px]">
                    Go to item →
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
