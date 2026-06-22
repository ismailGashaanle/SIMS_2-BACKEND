const validator = require("validator");

const ValidateSignUp = (req) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName || !lastName) {
    throw new Error("please fill Name");
  }

  if (!email) {
    throw new Error("please fill email");
  }

  if (!validator.isEmail(email)) {
    throw new Error("invalid email");
  }

  if (!password) {
    throw new Error("please fill password");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("invalid password");
  }
};

const validateLogin = (req) => {
  const { email, password } = req.body;

  if (!email) {
    throw new Error("please fill email");
  }

  if (!validator.isEmail(email)) {
    throw new Error("invalid email");
  }

  if (!password) {
    throw new Error("please fill password");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("invalid password");
  }
};

const ValidateUpdate = (req) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    throw new Error("please fill new password");
  }

  if (!validator.isStrongPassword(newPassword)) {
    throw new Error("invalid new password");
  }
};

function ValidateProfileUpdate(req) {
  const allowedFields = ["firstName", "lastName", "phone", "gender", "photoImage", "dateOfBirth"];
  return Object.keys(req.body).every(field => allowedFields.includes(field));
}

const ApplicationValidate = (req) => {
  const isAllowedPost = [
    "userId",
    "fullName",
    "ApplicationType",
    "email",
    "phone",
    "dateOfBirth",
    "nationality",
    "passportNumber",
    "passportDateIssue",
    "passportExpireDate",
    "purposeOfTravel",
    "intendedDepartureDate",
    "addressInDestination"
  ];

  const AllowedPost = Object.keys(req.body).every((key) => isAllowedPost.includes(key));
  return AllowedPost;
};

module.exports = { ValidateSignUp, validateLogin, ValidateUpdate, ValidateProfileUpdate, ApplicationValidate };