export const serializeDocument = (_document, returned) => {
  returned.id = returned._id.toString();
  delete returned._id;
  delete returned.__v;
  return returned;
};
