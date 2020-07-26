const isEmpty = (string) => {
  if (string.trim() === '') return true;
  else return false;
};

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
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

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};
