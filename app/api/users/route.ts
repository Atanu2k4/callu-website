import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const ids = searchParams.get('ids'); // comma-separated user IDs for invite modal

    // Fetch specific users by IDs (used by invite modal)
    if (ids) {
      const idList = ids.split(',').filter(Boolean);
      const users = await User.find({ _id: { $in: idList } })
        .select('name avatarConfig color')
        .lean();
      return NextResponse.json({ users }, { status: 200 });
    }

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (role) query.role = role;

    // Exclude admin users from regular user lists
    if (!role) {
      query.role = { $ne: 'admin' };
    }
    
    // Sort by creation usually
    const users = await User.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
