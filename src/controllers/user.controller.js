import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../services/email.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (password === user.password) {
        // Migration logic: User still has plain text password
        console.log('[LOGIN]: Migrating plain text password to hashed...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
      } else {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...safeUser } = user;
    res.json({ success: true, token, data: safeUser });
  } catch (error) {
    console.error('[LOGIN_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    console.error('[GET_PROFILE_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    console.log('[UPDATE_PROFILE]: Received name:', name, 'email:', email, 'avatar exists:', !!avatar);
    
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email, avatar }
    });

    const { password: _, ...safeUser } = updated;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    console.error('[UPDATE_PROFILE_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch && oldPassword !== user.password) {
      return res.status(400).json({ success: false, error: 'Invalid old password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('[UPDATE_PASSWORD_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // For security, don't reveal if user exists, but here we can be helpful
      return res.status(404).json({ success: false, error: 'No account found with this email' });
    }

    // 1. Generate Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // 2. Save to User
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    // 3. Return data to frontend for client-side sending
    const resetUrl = `${req.get('origin')}/reset-password/${resetToken}`;
    console.log(`[AUTH] Reset Link Generated for ${user.email}: ${resetUrl}`);
    
    res.json({ 
      success: true, 
      message: 'Reset link generated',
      emailData: {
        to_name: user.name,
        to_email: user.email,
        reset_url: resetUrl
      }
    });
  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
  } catch (error) {
    console.error('[RESET_PASSWORD_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
