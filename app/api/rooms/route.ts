import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';
import User from '@/models/User';

// GET - List all active rooms or get specific room
export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const userId = searchParams.get('userId'); // optional: used to include the requester's own hidden rooms
    
    if (roomId) {
      // Get specific room
      const room = await Room.findById(roomId)
        .populate('createdBy', 'name avatarConfig')
        .populate('participants', 'name avatarConfig')
        .lean();
      
      if (!room) {
        return NextResponse.json({ message: 'Room not found' }, { status: 404 });
      }
      
      return NextResponse.json({ rooms: [room] }, { status: 200 });
    }
    
    // Build the query:
    // - Always return non-hidden rooms (public, or private+visible)
    // - If userId is provided, ALSO return hidden rooms owned by that user
    //   so the owner can see their own hidden rooms in the sidebar
    let query: any;
    if (userId) {
      query = {
        isActive: true,
        $or: [
          // Non-hidden rooms (visible to everyone)
          { $nor: [{ roomType: 'private', visibility: 'hidden' }] },
          // Hidden rooms owned by the requesting user
          { roomType: 'private', visibility: 'hidden', createdBy: userId },
        ],
      };
    } else {
      // No userId — exclude all hidden private rooms
      query = {
        isActive: true,
        $nor: [{ roomType: 'private', visibility: 'hidden' }],
      };
    }

    const rooms = await Room.find(query)
      .populate('createdBy', 'name avatarConfig')
      .populate('participants', 'name avatarConfig')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ rooms }, { status: 200 });
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create new room
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, description, maxParticipants, roomType, visibility, createdBy } = await req.json();

    if (!name || !createdBy) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newRoom = await Room.create({
      name,
      description: description || '',
      maxParticipants: maxParticipants || 10,
      roomType: roomType || 'public',
      visibility: visibility || 'visible',
      createdBy,
      participants: [], // Start empty - users join when they click
      isActive: true,
    });

    const populatedRoom = await Room.findById(newRoom._id)
      .populate('createdBy', 'name avatarConfig')
      .populate('participants', 'name avatarConfig')
      .lean();

    // Broadcast to all connected clients so sidebars update in real-time
    // Hidden private rooms are NOT broadcast — they're invite-only and must stay invisible
    const io = (globalThis as any).__socketio;
    const isHidden = roomType === 'private' && visibility === 'hidden';
    if (io && !isHidden) {
      io.emit('room-created', { room: populatedRoom });
    }

    return NextResponse.json({ room: populatedRoom }, { status: 201 });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
