import { NextResponse } from 'next/server';
import { getDatabase, getBizSwapCollection, getBizSwapUsersCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const usersCollection = db.collection('users');
    const certificatesCollection = await getBizSwapCollection();
    const feedbackCollection = db.collection('feedback');

    const [usersCount, certificatesCount, feedbackCount] = await Promise.all([
      usersCollection.countDocuments(),
      certificatesCollection ? certificatesCollection.countDocuments() : 0,
      feedbackCollection.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        usersCount,
        certificatesCount,
        feedbackCount,
      }
    });

  } catch (err: any) {
    console.error('Database Admin API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
