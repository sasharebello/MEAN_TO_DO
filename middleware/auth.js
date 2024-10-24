require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Extract the token from the Authorization header
  const token = req.header('Authorization')?.split(' ')[1];
  // console.log('Token received:', token); // Log the received token

  // Check if token exists
  if (!token) {
    // console.warn('No token, authorization denied'); // Log warning
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded token:', decoded); // Log decoded token
    req.user = decoded; // Attach decoded user information to the request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    // console.error('Token verification error:', err.message); // Log the error
    res.status(401).json({ message: 'Token is not valid' });
  }
};
