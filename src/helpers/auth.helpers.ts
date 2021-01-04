const PASSWORD = {
  length: 8,
  regExp: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[&%$@])[a-zA-Z\d&%$@]{8,}$/,
};

export const validatePassword = (password: string): boolean =>
  password.length >= PASSWORD.length && !!PASSWORD.regExp.test(password);
