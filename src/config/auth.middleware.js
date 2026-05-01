import jwt from 'jsonwebtoken';
import prisma from './prisma.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE_ERROR]:', error.message);
    res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
};

export const checkPermission = (moduleName, action) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No user found' });
      }

      // Admin has full access
      console.log(`[DEBUG] Permission check for ${moduleName}:${action} - User: ${user.id}, Role: ${user.role}`);
      if (user.role === 'ADMIN') {
        return next();
      }

      // Check specific module and action
      const permissions = user.permissions;
      
      if (!permissions || typeof permissions !== 'object') {
        return res.status(403).json({ success: false, error: `Forbidden: No permissions set` });
      }

      if (!permissions[moduleName] || !permissions[moduleName][action]) {
        return res.status(403).json({ success: false, error: `Forbidden: Missing ${action} permission for ${moduleName}` });
      }

      next();
    } catch (error) {
      console.error('[PERMISSION_CHECK_ERROR]:', error);
      res.status(500).json({ success: false, error: 'Internal server error during permission check' });
    }
  };
};
