// In-memory database for testing when MongoDB is not available
class MemoryDatabase {
  constructor() {
    this.collections = {
      users: new Map(),
      teas: new Map(),
      votes: new Map(),
      comments: new Map(),
      comment_votes: new Map()
    };
    this.counters = {
      users: 0,
      teas: 0,
      votes: 0,
      comments: 0,
      comment_votes: 0
    };
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new Map();
    }

    return {
      // Find operations
      findOne: async (query) => {
        const collection = this.collections[name];
        for (const [id, doc] of collection) {
          if (this.matchesQuery(doc, query, id)) {
            return { ...doc, _id: id };
          }
        }
        return null;
      },

      find: (query = {}) => ({
        sort: (sortOptions) => ({
          skip: (skipCount) => ({
            limit: (limitCount) => ({
              toArray: async () => {
                const collection = this.collections[name];
                let results = [];
                
                for (const [id, doc] of collection) {
                  if (this.matchesQuery(doc, query, id)) {
                    results.push({ ...doc, _id: id });
                  }
                }

                // Apply sorting
                if (sortOptions) {
                  results.sort((a, b) => {
                    for (const [field, order] of Object.entries(sortOptions)) {
                      const aVal = a[field] || 0;
                      const bVal = b[field] || 0;
                      if (aVal !== bVal) {
                        return order === 1 ? aVal - bVal : bVal - aVal;
                      }
                    }
                    return 0;
                  });
                }

                // Apply skip and limit
                return results.slice(skipCount || 0, (skipCount || 0) + (limitCount || results.length));
              }
            })
          })
        }),
        toArray: async () => {
          const collection = this.collections[name];
          const results = [];
          for (const [id, doc] of collection) {
            if (this.matchesQuery(doc, query, id)) {
              results.push({ ...doc, _id: id });
            }
          }
          return results;
        }
      }),

      // Insert operations
      insertOne: async (doc) => {
        const collection = this.collections[name];
        const id = `${name}_${++this.counters[name]}`;
        collection.set(id, { ...doc });
        return { insertedId: id };
      },

      // Update operations
      updateOne: async (query, update) => {
        const collection = this.collections[name];
        for (const [id, doc] of collection) {
          if (this.matchesQuery(doc, query, id)) {
            if (update.$set) {
              Object.assign(doc, update.$set);
            }
            return { modifiedCount: 1 };
          }
        }
        return { modifiedCount: 0 };
      },

      // Delete operations
      deleteOne: async (query) => {
        const collection = this.collections[name];
        for (const [id, doc] of collection) {
          if (this.matchesQuery(doc, query, id)) {
            collection.delete(id);
            return { deletedCount: 1 };
          }
        }
        return { deletedCount: 0 };
      },

      deleteMany: async (query) => {
        const collection = this.collections[name];
        let deletedCount = 0;
        const toDelete = [];

        for (const [id, doc] of collection) {
          if (this.matchesQuery(doc, query, id)) {
            toDelete.push(id);
          }
        }

        toDelete.forEach(id => {
          collection.delete(id);
          deletedCount++;
        });

        return { deletedCount };
      },

      // Count operations
      countDocuments: async (query = {}) => {
        const collection = this.collections[name];
        let count = 0;
        for (const [id, doc] of collection) {
          if (this.matchesQuery(doc, query, id)) {
            count++;
          }
        }
        return count;
      },

      // Index operations (no-op for memory database)
      createIndex: async () => ({ ok: 1 }),

      // Aggregation (simplified)
      aggregate: (pipeline) => ({
        toArray: async () => {
          // Simple aggregation for batch counting
          if (pipeline.length === 3 && 
              pipeline[0].$match && 
              pipeline[1].$group && 
              pipeline[2].$sort) {
            
            const collection = this.collections[name];
            const batches = new Map();
            
            for (const [id, doc] of collection) {
              if (doc.batch && doc.batch !== null) {
                batches.set(doc.batch, (batches.get(doc.batch) || 0) + 1);
              }
            }
            
            return Array.from(batches.entries()).map(([batch, count]) => ({
              _id: batch,
              count
            })).sort((a, b) => a._id.localeCompare(b._id));
          }
          
          return [];
        }
      })
    };
  }

  matchesQuery(doc, query, docId = null) {
    if (!query || Object.keys(query).length === 0) return true;

    for (const [key, value] of Object.entries(query)) {
      if (key === '_id') {
        // Handle _id comparison using the document ID from the Map key
        if (docId !== value && docId !== value.toString()) {
          return false;
        }
      } else if (key === '$or') {
        // Handle $or queries
        const orMatches = value.some(orQuery => this.matchesQuery(doc, orQuery, docId));
        if (!orMatches) return false;
      } else if (typeof value === 'object' && value.$regex) {
        // Handle regex queries
        const regex = new RegExp(value.$regex, value.$options || '');
        if (!regex.test(doc[key] || '')) return false;
      } else if (typeof value === 'object' && value.$ne) {
        // Handle $ne queries
        if (doc[key] === value.$ne) return false;
      } else {
        // Simple equality
        if (doc[key] !== value) return false;
      }
    }
    return true;
  }

  // Admin operations (no-op for memory database)
  admin() {
    return {
      ping: async () => ({ ok: 1 })
    };
  }
}

// Create and export memory database instance
const memoryDB = new MemoryDatabase();

const connectMemoryDB = async () => {
  console.log('🧠 Using in-memory database for testing');
  console.log('⚠️  Data will not persist between server restarts');
  return memoryDB;
};

const getMemoryDB = () => memoryDB;

module.exports = {
  connectMemoryDB,
  getMemoryDB
};
