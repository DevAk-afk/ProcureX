import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserStatus,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

// Organization User Management (Super Admin & Admin)
router.get('/users', authenticate, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), getAllUsers);
router.patch('/users/:id', authenticate, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateUserStatus);

export default router;
