import { getBlogCollection, getBlogCategoriesCollection } from './blogDatabase';

/**
 * Optimize database performance by creating indexes for frequently queried fields
 */
export async function optimizeBlogDatabase() {
  try {
    const blogCollection = await getBlogCollection();
    const categoriesCollection = await getBlogCategoriesCollection();

    if (!blogCollection || !categoriesCollection) {
      console.error('Failed to connect to database collections');
      return false;
    }

    console.log('Creating database indexes for blog optimization...');

    // Blog posts indexes
    await blogCollection.createIndex({ published: 1, publishedAt: -1 });
    await blogCollection.createIndex({ slug: 1 }, { unique: true });
    await blogCollection.createIndex({ category: 1, published: 1 });
    await blogCollection.createIndex({ tags: 1, published: 1 });
    await blogCollection.createIndex({ 
      title: 'text', 
      content: 'text', 
      excerpt: 'text' 
    }, {
      weights: {
        title: 10,
        excerpt: 5,
        content: 1
      },
      name: 'blog_search_index'
    });
    await blogCollection.createIndex({ createdAt: -1 });
    await blogCollection.createIndex({ updatedAt: -1 });

    // Categories indexes
    await categoriesCollection.createIndex({ slug: 1 }, { unique: true });
    await categoriesCollection.createIndex({ name: 1 });

    console.log('Database indexes created successfully!');
    return true;
  } catch (error) {
    console.error('Error optimizing database:', error);
    return false;
  }
}

/**
 * Get database performance statistics
 */
export async function getDatabaseStats() {
  try {
    const blogCollection = await getBlogCollection();
    
    if (!blogCollection) {
      return null;
    }

    const totalDocuments = await blogCollection.countDocuments();
    const indexes = await blogCollection.listIndexes().toArray();
    
    return {
      totalDocuments,
      indexes: indexes.map(index => ({
        name: index.name,
        keys: index.key,
        unique: index.unique || false
      }))
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
}