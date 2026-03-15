const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Debug: See what is inside decoded
    console.log("Decoded JWT payload:", decoded);

    // Get user ID from token (supports both id & _id)
    const userId = decoded.id || decoded._id || decoded.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload - no user ID found',
      });
    }

    // Get user from DB
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

// Admin only middleware
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as admin',
    });
  }
};

// Optional auth middleware (no error if no token)
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        console.log("Optional Auth - Decoded JWT payload:", decoded);

        const userId = decoded.id || decoded._id || decoded.userId;
        if (userId) {
          req.user = await User.findById(userId).select('-password');
        } else {
          req.user = null;
        }
      } catch (error) {
        req.user = null; // Token invalid
      }
    }

    next();
  } catch (error) {
    next();
  }
};



// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// // Protect routes - verify JWT token
// exports.protect = async (req, res, next) => {
//   try {
//     let token;

//     // Get token from header
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     }

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Not authorized, no token provided',
//       });
//     }

//     try {
//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
//       // Get user from token
//       req.user = await User.findById(decoded.id).select('-password');
      
//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           message: 'Not authorized, user not found',
//         });
//       }

//       next();
//     } catch (error) {
//       return res.status(401).json({
//         success: false,
//         message: 'Not authorized, token failed',
//       });
//     }
//   } catch (error) {
//     console.error('Auth middleware error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error in authentication',
//     });
//   }
// };

// // Admin only middleware
// exports.adminOnly = (req, res, next) => {
//   if (req.user && req.user.role === 'admin') {
//     next();
//   } else {
//     res.status(403).json({
//       success: false,
//       message: 'Not authorized as admin',
//     });
//   }
// };

// // Optional auth middleware (doesn't throw error if no token)
// exports.optionalAuth = async (req, res, next) => {
//   try {
//     let token;

//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     }

//     if (token) {
//       try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
//         req.user = await User.findById(decoded.id).select('-password');
//       } catch (error) {
//         // Invalid token, but we don't throw error
//         req.user = null;
//       }
//     }

//     next();
//   } catch (error) {
//     next();
//   }
// };