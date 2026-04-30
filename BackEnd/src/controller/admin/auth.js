const User = require("../../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        message: "Admin already exist",
      });
    const { firstName, profession, PhoneNo, email, password, interestedin } =
      req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      firstName,
      profession,
      PhoneNo,
      interestedin,
      email,
      hash_password,
      username: firstName + "_" + Math.random().toString(36).substring(2),
      role: "admin",
    });

    _user.save((error, data) => {
      if (error) {
        return res.status(400).json({
          message: "Something went wrong",
        });
      }

      if (data) {
        return res.status(201).json({
          message: "Admin created Successfully..!",
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
    if (verified && user.role === "admin") {
      const { _id, firstName, lastName, username, role } = user;
      const { email } = req.body;
      const token = jwt.sign({ email, role, _id }, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "8h",
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

exports.update = (req, res) => {
  const { firstName, email } = req.body;
  const userName = firstName + "_" + Math.random().toString(36).substring(2);
  User.findOne({ _id: req.body._id })
    .exec()
    .then((data) => {
      // if (!data) {
      //     const _user = new User({
      //         title,
      //         author,
      //         gener,
      //         img
      //     });

      //     _user.save((error, data) => {
      //         if (error) {
      //             res.status(400).json({
      //                 message: "Something Went Wrong ...",
      //             });
      //         } else {
      //             res.status(200).json({
      //                 message: "Product is Successfully Added to Cart255...",
      //             });
      //         }
      //     });
      // }
      if (data) {
        User.find({ _id: req._id })
          .exec()
          .then((data) => {
            if (data) {
              var myquery = { _id: req.body._id };
              var newvalues = {
                $set: {
                  firstName: firstName,
                  email: email,
                  username: userName,
                },
              };
              User.updateOne(myquery, newvalues).exec((error, data) => {
                if (error) {
                  res.status(400).json({
                    message: "Something went wrong...",
                  });
                } else {
                  res.status(200).json({
                    message: "Admin has Updated",
                  });
                }
              });
            }
          });
      }
    });
};

exports.getadmin = (req, res) => {
  User.find({}).exec((error, data) => {
    if (error) return res.status(400).json({ error });
    if (data) {
      return res.status(200).json({ data });
    }
  });
};

exports.deleteadmin = (req, res) => {
  console.log(req.body._id);
  if (req.body._id) {
    User.findOneAndDelete({ _id: req.body._id }).then((data) => {
      if (data) {
        return res.status(200).json({
          data,
        });
      } else {
        return res.status(400).json({
          message: "Something went wrong",
        });
      }
    });
  }
};
