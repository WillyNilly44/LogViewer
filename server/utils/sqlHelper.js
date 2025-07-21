// SQL query helpers for different database types
class SqlHelper {
  constructor(dbType) {
    this.dbType = dbType;
  }

  // Get paginated query with proper syntax for each DB type
  getPaginatedQuery(tableName, orderBy = 'created_at DESC', limit, offset) {
    switch (this.dbType) {
      case 'postgresql':
        return {
          query: `SELECT * FROM ${tableName} ORDER BY ${orderBy} LIMIT $1 OFFSET $2`,
          params: [limit, offset]
        };
      case 'mysql':
        return {
          query: `SELECT * FROM ${tableName} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
          params: [limit, offset]
        };
      case 'mssql':
        return {
          query: `SELECT * FROM ${tableName} ORDER BY ${orderBy} OFFSET @param0 ROWS FETCH NEXT @param1 ROWS ONLY`,
          params: [offset, limit]
        };
      default:
        throw new Error(`Unsupported database type: ${this.dbType}`);
    }
  }

  // Get search query with proper syntax
  getSearchQuery(tableName, searchColumns, searchTerm, limit, offset) {
    const searchConditions = searchColumns.map(col => {
      switch (this.dbType) {
        case 'postgresql':
          return `${col} ILIKE '%' || $1 || '%'`;
        case 'mysql':
          return `${col} LIKE CONCAT('%', ?, '%')`;
        case 'mssql':
          return `${col} LIKE '%' + @param0 + '%'`;
        default:
          throw new Error(`Unsupported database type: ${this.dbType}`);
      }
    }).join(' OR ');

    switch (this.dbType) {
      case 'postgresql':
        return {
          query: `SELECT * FROM ${tableName} WHERE ${searchConditions} ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
          params: [searchTerm, limit, offset]
        };
      case 'mysql':
        return {
          query: `SELECT * FROM ${tableName} WHERE ${searchConditions} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          params: [searchTerm, limit, offset]
        };
      case 'mssql':
        return {
          query: `SELECT * FROM ${tableName} WHERE ${searchConditions} ORDER BY created_at DESC OFFSET @param1 ROWS FETCH NEXT @param2 ROWS ONLY`,
          params: [searchTerm, offset, limit]
        };
      default:
        throw new Error(`Unsupported database type: ${this.dbType}`);
    }
  }

  // Get count query
  getCountQuery(tableName, whereClause = '', searchTerm = null) {
    const query = `SELECT COUNT(*) as count FROM ${tableName}${whereClause ? ` WHERE ${whereClause}` : ''}`;
    
    if (searchTerm) {
      switch (this.dbType) {
        case 'postgresql':
        case 'mysql':
          return { query, params: [searchTerm] };
        case 'mssql':
          return { query, params: [searchTerm] };
        default:
          throw new Error(`Unsupported database type: ${this.dbType}`);
      }
    }
    
    return { query, params: [] };
  }

  // Get today's records query
  getTodayQuery(tableName) {
    switch (this.dbType) {
      case 'postgresql':
        return {
          query: `SELECT COUNT(*) as count FROM ${tableName} WHERE DATE(created_at) = CURRENT_DATE`,
          params: []
        };
      case 'mysql':
        return {
          query: `SELECT COUNT(*) as count FROM ${tableName} WHERE DATE(created_at) = CURDATE()`,
          params: []
        };
      case 'mssql':
        return {
          query: `SELECT COUNT(*) as count FROM ${tableName} WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)`,
          params: []
        };
      default:
        throw new Error(`Unsupported database type: ${this.dbType}`);
    }
  }

  // Get records by level query
  getByLevelQuery(tableName) {
    return {
      query: `SELECT level, COUNT(*) as count FROM ${tableName} GROUP BY level`,
      params: []
    };
  }

  // Get single record query
  getByIdQuery(tableName, id) {
    switch (this.dbType) {
      case 'postgresql':
        return {
          query: `SELECT * FROM ${tableName} WHERE id = $1`,
          params: [id]
        };
      case 'mysql':
        return {
          query: `SELECT * FROM ${tableName} WHERE id = ?`,
          params: [id]
        };
      case 'mssql':
        return {
          query: `SELECT * FROM ${tableName} WHERE id = @param0`,
          params: [id]
        };
      default:
        throw new Error(`Unsupported database type: ${this.dbType}`);
    }
  }
}

module.exports = SqlHelper;
