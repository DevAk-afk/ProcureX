import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLogger.js';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'procurex-super-secure-jwt-secret-key-2025';
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

const sendTokenResponse = (user: any, statusCode: number, res: Response, message: string) => {
  const token = generateToken(user._id.toString());
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    vendorId: user.vendorId,
    avatar: user.avatar,
  };

  res.status(statusCode).json({
    success: true,
    message,
    token, // Also return in body for testing/bearer token use
    user: userData,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, department, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    return;
  }

  // Security Rule: Public registration cannot self-grant Super Admin or Admin roles
  const requestedRole = role || 'Employee / Requester';
  const safeRole =
    requestedRole === 'Super Admin' || requestedRole === 'Admin'
      ? 'Employee / Requester'
      : requestedRole;

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    department,
    phone,
  });

  await logAudit(req as any, 'USER_REGISTER', 'User', user._id.toString(), { email: user.email, role: user.role });
  sendTokenResponse(user, 201, res, 'Registration successful.');
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Please provide email and password.' });
    return;
  }

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    res.status(401).json({ success: false, message: 'Invalid credentials or inactive account.' });
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid credentials.' });
    return;
  }

  await logAudit(req as any, 'USER_LOGIN', 'User', user._id.toString(), { email: user.email });
  sendTokenResponse(user, 200, res, 'Login successful.');
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      vendorId: req.user.vendorId,
      avatar: req.user.avatar,
    },
  });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const { name, phone, department } = req.body;
  if (name) req.user.name = name;
  if (phone) req.user.phone = phone;
  if (department) req.user.department = department;

  await req.user.save();
  await logAudit(req, 'USER_PROFILE_UPDATE', 'User', req.user._id.toString());

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
    },
  });
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  const isMatch = await req.user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    return;
  }

  req.user.password = newPassword;
  await req.user.save();
  await logAudit(req, 'PASSWORD_CHANGE', 'User', req.user._id.toString());

  res.status(200).json({ success: true, message: 'Password changed successfully.' });
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: users });
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isActive, role } = req.body;

  const targetUser = await User.findById(id);
  if (!targetUser) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  if (isActive !== undefined) targetUser.isActive = Boolean(isActive);
  if (role) targetUser.role = role;

  await targetUser.save();
  await logAudit(req, 'USER_STATUS_UPDATE', 'User', targetUser._id.toString(), { isActive, role });

  res.status(200).json({
    success: true,
    message: 'User updated successfully.',
    data: { id: targetUser._id, name: targetUser.name, role: targetUser.role, isActive: targetUser.isActive },
  });
};
