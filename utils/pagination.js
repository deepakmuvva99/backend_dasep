/**
 * Standardized Database Pagination Utility corresponding to API Docs Section 5.1
 */

function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20)); // Limit to max 100 per page to avoid full-table scans
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}

function buildPaginationMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
        total: total,
        page: page,
        limit: limit,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}

module.exports = { parsePagination, buildPaginationMeta };
