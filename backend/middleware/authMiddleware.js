import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authorization header required',
        code: 'NO_AUTH_HEADER'
      });
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: 'Token not provided',
        code: 'NO_TOKEN'
      });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      
      // Check token expiration
      if (decoded.exp * 1000 < Date.now()) {
        return res.status(401).json({ 
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      // Attach user info to request
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        error: jwtError.message
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Internal server error during authentication',
      code: 'AUTH_ERROR'
    });
  }
};

export default protect;