export const validateRequiredFields = (data, requiredFields) => {
  if (!data || typeof data !== "object") {
    return requiredFields;
  }

  return requiredFields.filter((field) => {
    const value = data[field];
    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim().length === 0)
    );
  });
};
