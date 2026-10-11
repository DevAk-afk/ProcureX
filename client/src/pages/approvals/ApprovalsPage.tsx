import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Requisition } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  ShieldAlert,
} from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [pendingReqs, setPendingReqs] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requisitions?status=submitted');
      if (res.data.success) {
        setPendingReqs(res.data.data);
      }
    } catch (err: any) {
      error('Failed to load approval queue', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleExecuteApproval = async () => {
    if (!selectedReq || !actionType) return;
    setSubmitting(true);
    try {
      const endpoint =
        actionType === 'approve'
          ? `/requisitions/${selectedReq._id}/approve`
          : `/requisitions/${selectedReq._id}/reject`;

      const res = await api.post(endpoint, {
        remarks: remarks || (actionType === 'approve' ? 'Approved by manager.' : 'Rejected.'),
        reason: remarks,
      });

      if (res.data.success) {
        success(
          actionType === 'approve' ? 'Requisition Approved' : 'Requisition Rejected',
          `${selectedReq.reqNumber} processed successfully.`
        );
        setSelectedReq(null);
        setActionType(null);
        setRemarks('');
        fetchPending();
      }
    } catch (err: any) {
      error('Approval failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Executive Approval Queue
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Review submitted departmental purchase requisitions and enforce spend authorization policy.
          </p>
        </div>

        <button
          onClick={fetchPending}
          className="inline-flex items-center gap-2 bg-white border border-procure-border text-slate-700 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-sm hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Queue
        </button>
      </div>

      {/* Queue Card Table */}
      <div className="bg-white border border-procure-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-procure-border bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Pending Requisitions Awaiting Action ({pendingReqs.length})
          </span>
          <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
            Current Approver: {user?.name} ({user?.role})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-procure-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Requisition</th>
                <th className="py-3.5 px-4">Requester & Dept</th>
                <th className="py-3.5 px-4">Est. Total (₹)</th>
                <th className="py-3.5 px-4">Items Count</th>
                <th className="py-3.5 px-4">Submitted On</th>
                <th className="py-3.5 px-4 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingReqs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <CheckSquare className="w-10 h-10 mx-auto text-teal-500/50 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">Approval queue is clear!</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No purchase requisitions currently require your authorization.
                    </p>
                  </td>
                </tr>
              ) : (
                pendingReqs.map((req) => {
                  const isSelfApproval =
                    user?.role !== 'Super Admin' &&
                    req.requesterId?.toString() === user?.id?.toString();

                  return (
                    <tr key={req._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-teal-700 font-mono text-sm">{req.reqNumber}</span>
                        <div className="text-[11px] text-slate-500 truncate max-w-sm">{req.justification}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{req.requesterName}</div>
                        <div className="text-[11px] text-slate-400">{req.departmentName}</div>
                      </td>
                      <td className="py-3 px-4 font-black text-sm text-slate-900">
                        ₹{req.estimatedTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {req.lineItems.length} item(s)
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isSelfApproval ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            <ShieldAlert className="w-3.5 h-3.5" /> Self-Approval Restricted
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedReq(req);
                                setActionType('approve');
                              }}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReq(req);
                                setActionType('reject');
                              }}
                              className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve / Reject Dialog Modal */}
      {selectedReq && actionType && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => {
            setSelectedReq(null);
            setActionType(null);
          }}
          title={actionType === 'approve' ? 'Approve Requisition' : 'Reject Requisition'}
          subtitle={`Decision for ${selectedReq.reqNumber} (₹${selectedReq.estimatedTotal.toLocaleString('en-IN')})`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Justification:</span>
              <p className="text-slate-600">{selectedReq.justification}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {actionType === 'approve' ? 'Approver Remarks (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <textarea
                rows={3}
                required={actionType === 'reject'}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? 'e.g. Budget verified against Q1 CapEx quota.'
                    : 'e.g. Cost center exceeded quarterly spending allocation.'
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedReq(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || (actionType === 'reject' && !remarks)}
                onClick={handleExecuteApproval}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submitting
                  ? 'Processing...'
                  : actionType === 'approve'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
