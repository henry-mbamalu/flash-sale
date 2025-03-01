


export const paginate = async(
  model,
  req,
  options = {}
) => {
  const page = options.page || parseInt(req.query.page, 10) || 1;
  const perPage =
    options.limit || parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * perPage;
  const sort = options.sort || { createdAt: -1 };
  const query = options.query || {};
  const populate = options.populate || [];

  // Fetch the data with pagination
  const data = await model.find(query).populate(populate).sort(sort).skip(skip).limit(perPage);

  // Get the total number of documents
  const total = await model.countDocuments(query);

  // Calculate the total number of pages
  const pageCount = Math.ceil(total / perPage);

  // Determine next and previous page values
  const hasNextPage = page < pageCount;
  const hasPrevPage = page > 1;
  const nextPage = hasNextPage ? page + 1 : 0;

  return {
    data,
    meta: {
      page,
      perPage,
      total,
      pageCount,
      nextPage,
      hasNextPage,
      hasPrevPage,
    },
  };
};
