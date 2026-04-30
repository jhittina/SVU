const jwt = require("jsonwebtoken");

exports.requiredsignin = (req, res, next) => {
  const token =
    req.headers.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  if (!token)
    return res.status(401).json({
      message: "Authentication token is required",
    });
  jwt.verify(token, process.env.JWT_SECRET, function (err, data) {
    if (err)
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    req.User = data;
    next();
  });
};

exports.verifyadmin = (req, res, next) => {
  if (req.User && req.User.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied: admin role required",
    });
  }
};

exports.verifysuperadmin = (req, res, next) => {
  if (req.User && req.User.role === "superadmin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied: superadmin role required",
    });
  }
};
