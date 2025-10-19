/**
 * Pagination Middleware
 * Extracts pagination parameters from query string and attaches to request
 */

const config = require('../config/config');

/**
 * Pagination middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const pagination = (req, res, next) => {
    try {
        // Extract pagination parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || config.pagination.defaultLimit;
        const maxLimit = config.pagination.maxLimit;
        
        // Validate page number
        if (page < 1) {
            return res.status(400).json({
                success: false,
                message: 'Page number must be greater than 0'
            });
        }
        
        // Validate limit
        if (limit < 1) {
            return res.status(400).json({
                success: false,
                message: 'Limit must be greater than 0'
            });
        }
        
        // Enforce maximum limit
        const finalLimit = Math.min(limit, maxLimit);
        
        // Calculate offset
        const offset = (page - 1) * finalLimit;
        
        // Attach pagination info to request
        req.pagination = {
            page,
            limit: finalLimit,
            offset,
            maxLimit
        };
        
        next();
    } catch (error) {
        console.error('Pagination middleware error:', error);
        return res.status(400).json({
            success: false,
            message: 'Invalid pagination parameters'
        });
    }
};

/**
 * Search middleware
 * Extracts search parameters from query string
 */
const search = (req, res, next) => {
    try {
        const searchQuery = req.query.search || '';
        const searchFields = req.query.searchFields || '';
        
        // Parse search fields (comma-separated)
        const fields = searchFields ? searchFields.split(',').map(field => field.trim()) : [];
        
        req.search = {
            query: searchQuery.trim(),
            fields: fields,
            isActive: searchQuery.length > 0
        };
        
        next();
    } catch (error) {
        console.error('Search middleware error:', error);
        next();
    }
};

/**
 * Sort middleware
 * Extracts sorting parameters from query string
 */
const sort = (req, res, next) => {
    try {
        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = req.query.sortOrder || 'DESC';
        
        // Validate sort order
        const validSortOrders = ['ASC', 'DESC', 'asc', 'desc'];
        const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) 
            ? sortOrder.toUpperCase() 
            : 'DESC';
        
        req.sort = {
            by: sortBy,
            order: finalSortOrder
        };
        
        next();
    } catch (error) {
        console.error('Sort middleware error:', error);
        next();
    }
};

/**
 * Filter middleware
 * Extracts filter parameters from query string
 */
const filter = (req, res, next) => {
    try {
        const filters = {};
        
        // Common filters
        if (req.query.role) {
            filters.role = req.query.role;
        }
        
        if (req.query.status) {
            filters.status = req.query.status;
        }
        
        if (req.query.gender) {
            filters.gender = req.query.gender;
        }
        
        if (req.query.specialization) {
            filters.specialization = req.query.specialization;
        }
        
        if (req.query.bloodGroup) {
            filters.bloodGroup = req.query.bloodGroup;
        }
        
        // Date range filters
        if (req.query.createdFrom) {
            filters.createdFrom = req.query.createdFrom;
        }
        
        if (req.query.createdTo) {
            filters.createdTo = req.query.createdTo;
        }
        
        req.filters = filters;
        next();
    } catch (error) {
        console.error('Filter middleware error:', error);
        next();
    }
};

/**
 * Combined query middleware
 * Applies pagination, search, sort, and filter middleware
 */
const query = (req, res, next) => {
    pagination(req, res, (err) => {
        if (err) return;
        
        search(req, res, (err) => {
            if (err) return;
            
            sort(req, res, (err) => {
                if (err) return;
                
                filter(req, res, next);
            });
        });
    });
};

module.exports = {
    pagination,
    search,
    sort,
    filter,
    query
};
