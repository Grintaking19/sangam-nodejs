const handleBadRequest = async (e, res) => {
  console.error("Bad Request: ", e);
  res.status(500).json({
    success: false,
    message: "Bad Request, Something went wrong. Try Again",
  });
};

export default handleBadRequest;
