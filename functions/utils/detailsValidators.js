const isEmpty = (data) => {
  if (data.trim() === "") return true;
  else return false;
};

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isUrl = (data) => {
  const regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
  if (data.match(regex)) return true;
  else return false;
};

exports.validateSignup = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Email field must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Not a valid email address. Try again with valid one!!!";
  }

  if (isEmpty(data.password)) {
    errors.password = "Password field must not be empty";
  }
  if (data.password !== data.confirmPassword)
    errors.confirmPassword =
      "Both password and confirm password should be same";
  if (isEmpty(data.userName)) errors.userName = "User name should not be empty";

  if (isEmpty(data.gender)) errors.gender = "Gender field must not be empty";
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateSignin = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Email field must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Not a valid email address. Try again with valid one!!!";
  }

  if (isEmpty(data.password)) {
    errors.password = "Password field must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateUrl = (data) => {
  let errors = {};

  if (isEmpty(data.url)) errors.url = "URL must not be empty";
  if (!isUrl(data.url)) errors.url = "Invalid URL";
  return { errors, valid: Object.keys(errors).length === 0 ? true : false };
};

