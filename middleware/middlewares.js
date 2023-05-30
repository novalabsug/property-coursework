export const ErrorHandler = (err, req, res, next) => {
  console.log({ name: err.name, message: err.message, stack: err.stack });

  return res.status(500).json({ Error: err.message });
};
