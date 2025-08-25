import { NextRequest, NextResponse } from 'next/server';
import { getBlogCategoriesCollection, BlogCategory, generateSlug } from '@/lib/blogDatabase';

// GET - Fetch all blog categories
export async function GET() {
  try {
    const collection = await getBlogCategoriesCollection();
    
    if (!collection) {
      return NextResponse.json({
        categories: [],
        warning: 'Database connection failed'
      }, { status: 503 });
    }

    const categories = await collection
      .find({})
      .sort({ name: 1 })
      .toArray();

    // If no categories exist, seed with default categories
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'General', slug: 'general', description: 'General blog posts' },
        { name: 'Technology', slug: 'technology', description: 'Technology and innovation posts' },
        { name: 'Finance', slug: 'finance', description: 'Financial insights and tips' },
        { name: 'Savings', slug: 'savings', description: 'Savings strategies and advice' },
        { name: 'News', slug: 'news', description: 'Latest news and updates' }
      ];

      const now = new Date();
      const categoriesToInsert = defaultCategories.map(cat => ({
        ...cat,
        createdAt: now,
        updatedAt: now
      }));

      await collection.insertMany(categoriesToInsert);
      const seededCategories = await collection.find({}).sort({ name: 1 }).toArray();
      
      return NextResponse.json({
        categories: seededCategories,
        message: 'Default categories created'
      });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog categories' },
      { status: 500 }
    );
  }
}

// POST - Create a new blog category
export async function POST(request: NextRequest) {
  try {
    const collection = await getBlogCategoriesCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);
    const now = new Date();

    // Check if category already exists
    const existingCategory = await collection.findOne({ 
      $or: [{ name }, { slug }] 
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    const newCategory: Omit<BlogCategory, '_id'> = {
      name,
      slug,
      description,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newCategory);
    const createdCategory = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json({
      message: 'Blog category created successfully',
      category: createdCategory
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog category:', error);
    return NextResponse.json(
      { error: 'Failed to create blog category' },
      { status: 500 }
    );
  }
}