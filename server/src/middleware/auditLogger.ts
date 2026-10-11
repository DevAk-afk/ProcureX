import { AuthRequest } from './auth.js';
import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async (
  req: AuthRequest,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, any>
): Promise<void> => {
  try {
    const performedBy = req.user?.email || 'system';
    const performedByRole = req.user?.role || 'System';
    const ipAddress = req.ip || req.socket.remoteAddress;

    await AuditLog.create({
      action,
      entity,
      entityId,
      performedBy,
      performedByRole,
      details,
      ipAddress,
    });
  } catch (err: any) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
};
