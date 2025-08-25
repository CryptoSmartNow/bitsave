import { NextResponse } from 'next/server';
import { optimizeBlogDatabase, getDatabaseStats } from '@/lib/optimizeDatabase';

// POST - Optimize database indexes
export async function POST() {
  try {
    const success = await optimizeBlogDatabase();
    
    if (success) {
      return NextResponse.json({
        message: 'Database optimization completed successfully',
        success: true
      });
    } else {
      return NextResponse.json(
        { error: 'Database optimization failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error optimizing database:', error);
    return NextResponse.json(
      { error: 'Failed to optimize database' },
      { status: 500 }
    );
  }
}

// GET - Get database statistics
export async function GET() {
  try {
    const stats = await getDatabaseStats();
    
    if (stats) {
      return NextResponse.json({
        stats,
        success: true
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to get database statistics' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error getting database stats:', error);
    return NextResponse.json(
      { error: 'Failed to get database statistics' },
      { status: 500 }
    );
  }
}