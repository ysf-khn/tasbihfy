import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prayerLocation = await prisma.prayerLocation.findUnique({
      where: {
        userId: session.user.id
      }
    });

    if (!prayerLocation) {
      return NextResponse.json(
        { error: 'No saved location found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: prayerLocation.name,
      latitude: prayerLocation.latitude,
      longitude: prayerLocation.longitude,
      timezone: prayerLocation.timezone,
      country: prayerLocation.country,
      countryCode: prayerLocation.countryCode
    });

  } catch (error) {
    console.error('Get prayer location error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, latitude, longitude, timezone, country, countryCode } = body;

    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Name, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    // Upsert the prayer location
    const prayerLocation = await prisma.prayerLocation.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        name,
        latitude,
        longitude,
        timezone: timezone || null,
        country: country || null,
        countryCode: countryCode || null,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        name,
        latitude,
        longitude,
        timezone: timezone || null,
        country: country || null,
        countryCode: countryCode || null
      }
    });

    return NextResponse.json({
      message: 'Location saved successfully',
      location: {
        name: prayerLocation.name,
        latitude: prayerLocation.latitude,
        longitude: prayerLocation.longitude,
        timezone: prayerLocation.timezone,
        country: prayerLocation.country,
        countryCode: prayerLocation.countryCode
      }
    });

  } catch (error) {
    console.error('Save prayer location error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}