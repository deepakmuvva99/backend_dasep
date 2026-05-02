/**
 * Standardized Sorting Utility corresponding to API Docs Section 5.3
 * Prevents SQL Injection by whitelisting allowable sorting fields.
 */

function parseSorting(query, allowedFields, defaultField = 'created_at') {
    const order = (query.order && query.order.toLowerCase() === 'asc') ? 'ASC' : 'DESC';
    const sort_by = allowedFields.includes(query.sort_by) ? query.sort_by : defaultField;
    return { sort_by, order };
}

module.exports = { parseSorting };
