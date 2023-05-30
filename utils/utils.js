export const TryCatch = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const Errors = {
  ValidationError: (message) => {
    const NewError = new Error(message);
    return {
      type: "VALIDATION ERROR",
      code: NewError.code || 400,
      name: NewError.name,
      message: NewError.message,
    };
  },
  AuthenticationError: (message) => {
    const NewError = new Error(message);
    return {
      type: "AUTHENTICATION ERROR",
      code: NewError.code || 401,
      name: NewError.name,
      message: NewError.message,
    };
  },
};
