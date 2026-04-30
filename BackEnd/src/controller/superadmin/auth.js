const User = require("../../models/superadmin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        message: "Super Admin already exist",
      });
    const { firstName, lastName, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      firstName,
      lastName,
      email,
      hash_password,
      username: firstName + "_" + Math.random().toString(36).substring(2),
      role: "superadmin",
    });

    _user.save((error, data) => {
      if (error) {
        return res.status(400).json({
          message: "Something went wrong",
        });
      }

      if (data) {
        return res.status(201).json({
          message: "Super Admin created Successfully..!",
        });
      }
    });
  });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error)
      return res.status(400).json({
        message: "something went wrong",
      });

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });
    var verified = bcrypt.compareSync(req.body.password, user.hash_password);
    if (verified && user.role === "superadmin") {
      const { _id, firstName, lastName, username, role } = user;
      const { email } = req.body;
      const token = jwt.sign({ email, role, _id }, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "1d",
      });

      return res.status(200).json({
        token: token,
        user: { _id, firstName, lastName, email, username, role },
      });
    } else {
      return res.status(400).json({
        message: "Please Check Email and Password ",
      });
    }
  });
};
