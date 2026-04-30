/**
 * Build pagination response with search and filter support
 * @param {Object} model - Mongoose model
 * @param {Object} options - Pagination options
 * @param {Number} options.page - Current page (default: 1)
 * @param {Number} options.limit - Items per page (default: 10)
 * @param {String} options.search - Search query
 * @param {Array} options.searchFields - Fields to search in
 * @param {Object} options.filter - Additional filter criteria
 * @param {Object} options.sort - Sort criteria (default: {createdAt: -1})
 * @returns {Promise<Object>} - { data, totalCount, page, totalPages }
 */
async function getPaginatedData(model, options = {}) {
  const {
    page = 1,
    limit = 10,
    search = "",
    searchFields = [],
    filter = {},
    sort = { createdAt: -1 },
  } = options;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // Cap at 100
  const skip = (pageNum - 1) * limitNum;

  // Build query with search
  const query = { ...filter };
  if (search && searchFields.length > 0) {
    query.$or = searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  // Execute query with pagination
  const [data, totalCount] = await Promise.all([
    model.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
    model.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / limitNum);

  return {
    data,
    totalCount,
    page: pageNum,
    limit: limitNum,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1,
  };
}

module.exports = { getPaginatedData };
