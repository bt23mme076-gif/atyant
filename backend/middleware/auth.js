import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ✅ Required authentication (for protected routes like profile, messages)
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ Fetch full user data including education
    const user = await User.findById(decoded.userId || decoded.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;

    next();

  } catch (error) {
    console.error('❌ Authentication failed:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// ✅ Optional authentication (for public routes like mentor search)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    // ✅ No token? Continue as guest
    if (!authHeader) {
      req.user = null;
      console.log('👤 Guest user');
      return next();
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      req.user = null;
      console.log('👤 No valid token - guest user');
      return next();
    }

    // Try to verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user data
    const user = await User.findById(decoded.userId || decoded.id)
      .select('-password')
      .lean();

    if (user) {
      req.user = user;
      console.log('🔐 Authenticated user:', user.username);
      console.log('🎓 User college:', user.education?.[0]?.institution);
    } else {
      req.user = null;
      console.log('⚠️ User not found - continuing as guest');
    }

    next();

  } catch (error) {
    // ✅ On any auth error, just continue as guest (don't block request)
    console.log('⚠️ Auth error, continuing as guest:', error.message);
    req.user = null;
    next();
  }
};

export default auth;