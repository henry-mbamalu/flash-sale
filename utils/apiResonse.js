

export const sendErrorResponse = (
  res,
  statusCode,
  message,
  errors
) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    errors,
  });
};

export const sendSuccessResponse = (
  res,
  statusCode,
  data,
  message = undefined,
  meta = undefined
) => {
  return res.status(statusCode).json({
    status: 'success',
    message: message || 'Operation successful',
    data,
    meta
  });
};
