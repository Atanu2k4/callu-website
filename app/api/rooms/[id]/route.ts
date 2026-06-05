import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

// DELETE - Delete a room by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    await dbConnect();

    if (!roomId) {
      return NextResponse.json(
        { message: 'Room ID is required' },
        { status: 400 }
      );
    }

    const room = await Room.findByIdAndDelete(roomId);

    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }

    // Broadcast to all clients so sidebars remove it in real-time
    const io = (globalThis as any).__socketio;
    if (io) {
      io.emit('room-deleted', { roomId });
    }

    return NextResponse.json(
      { message: 'Room deleted successfully', room },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET - Get a specific room by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    await dbConnect();

    if (!roomId) {
      return NextResponse.json(
        { message: 'Room ID is required' },
        { status: 400 }
      );
    }

    const room = await Room.findById(roomId)
      .populate('createdBy', 'name avatarConfig')
      .populate('participants', 'name avatarConfig')
      .lean();

    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ room }, { status: 200 });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH - Update a room by ID
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    await dbConnect();

    if (!roomId) {
      return NextResponse.json(
        { message: 'Room ID is required' },
        { status: 400 }
      );
    }

    const { name } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: 'Valid room name is required' },
        { status: 400 }
      );
    }

    const room = await Room.findByIdAndUpdate(
      roomId,
      { name },
      { new: true }
    );

    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }

    // Broadcast to all clients so sidebars update the name in real-time
    const io = (globalThis as any).__socketio;
    if (io) {
      io.emit('room-updated', { roomId, name: room.name });
    }

    return NextResponse.json(
      { message: 'Room updated successfully', room },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update room error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
