import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
  token = req.headers.authorization.split(' ')[1];
  console.log("Token received in backend:", token); // add this
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Decoded payload:", decoded); // add this
  console.log("JWT_SECRET from env:", process.env.JWT_SECRET);
  req.user = decoded;
  next();
} catch (error) {
  console.error('Token verification failed:', error.message);
  res.status(401).json({ message: 'Not authorized, token failed' });
}

  } else if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
export default protect;