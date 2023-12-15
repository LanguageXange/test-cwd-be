const formatError = (message) => {
  return {
    message,
    hasError: true,
  };
};

module.exports = { formatError };
