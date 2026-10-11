import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { ROLES, UserRole } from '../config/constants.js';

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Admin & Super Admin have universal access
    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    // Role alias equivalence:
    // 'Purchase Manager' <=> 'Procurement Manager'
    // 'Employee / Requester' <=> 'Procurement Officer'
    const effectiveRoles = [req.user.role];
    if (req.user.role === 'Purchase Manager') effectiveRoles.push('Procurement Manager');
    if (req.user.role === 'Procurement Manager') effectiveRoles.push('Purchase Manager');
    if (req.user.role === 'Employee / Requester') effectiveRoles.push('Procurement Officer');
    if (req.user.role === 'Procurement Officer') effectiveRoles.push('Employee / Requester');

    const hasPermission = effectiveRoles.some((r) => allowedRoles.includes(r as any));
    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to perform this operation. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

export const enforceVendorIsolation = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  // If user is a Vendor, ensure they can only query or mutate their own vendorId
  if (req.user.role === ROLES.VENDOR) {
    if (!req.user.vendorId) {
      res.status(403).json({ success: false, message: 'Vendor account is not associated with any vendor profile.' });
      return;
    }

    // Enforce filter in query / params / body
    req.query.vendorId = req.user.vendorId.toString();
  }

  next();
};
