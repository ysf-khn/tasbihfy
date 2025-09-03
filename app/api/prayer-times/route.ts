import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PrayerTimesResponse } from '@/types/prayer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    
    if (!location) {
      return NextResponse.json(
        { error: 'Location parameter is required' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if we have cached data for today
    const cachedData = await prisma.prayerTimeCache.findFirst({
      where: {
        locationQuery: location.toLowerCase(),
        date: today
      }
    });

    if (cachedData) {
      return NextResponse.json({
        location: {
          name: location,
          latitude: cachedData.latitude || '',
          longitude: cachedData.longitude || '',
          country: cachedData.country || '',
          countryCode: cachedData.countryCode || '',
          timezone: cachedData.timezone || ''
        },
        date: `${cachedData.date.getFullYear()}-${String(cachedData.date.getMonth() + 1).padStart(2, '0')}-${String(cachedData.date.getDate()).padStart(2, '0')}`,
        prayers: [
          { name: 'fajr', time: cachedData.fajr, arabicName: 'الفجر' },
          { name: 'shurooq', time: cachedData.shurooq, arabicName: 'الشروق' },
          { name: 'dhuhr', time: cachedData.dhuhr, arabicName: 'الظهر' },
          { name: 'asr', time: cachedData.asr, arabicName: 'العصر' },
          { name: 'maghrib', time: cachedData.maghrib, arabicName: 'المغرب' },
          { name: 'isha', time: cachedData.isha, arabicName: 'العشاء' }
        ],
        qiblaDirection: cachedData.qiblaDirection || '',
        weather: {
          temperature: cachedData.temperature || '',
          pressure: cachedData.pressure ? parseInt(cachedData.pressure) : 0
        },
        sunrise: cachedData.shurooq
      });
    }

    // Fetch from API if not cached
    const apiUrl = `https://muslimsalat.p.rapidapi.com/${encodeURIComponent(location)}.json`;
    const apiKey = process.env.SALATTIME_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'muslimsalat.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch prayer times' },
        { status: response.status }
      );
    }

    const data: PrayerTimesResponse = await response.json();

    if (data.status_code !== 1 || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid response from prayer times API' },
        { status: 400 }
      );
    }

    const todayPrayers = data.items[0];

    // Cache the data
    await prisma.prayerTimeCache.create({
      data: {
        locationQuery: location.toLowerCase(),
        date: today,
        fajr: todayPrayers.fajr,
        shurooq: todayPrayers.shurooq,
        dhuhr: todayPrayers.dhuhr,
        asr: todayPrayers.asr,
        maghrib: todayPrayers.maghrib,
        isha: todayPrayers.isha,
        qiblaDirection: data.qibla_direction,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: String(data.timezone),
        country: data.country,
        countryCode: data.country_code,
        temperature: data.today_weather.temperature,
        pressure: data.today_weather.pressure.toString()
      }
    });

    // Clean up old cache entries for this location (keep only today's data)
    await prisma.prayerTimeCache.deleteMany({
      where: {
        locationQuery: location.toLowerCase(),
        date: {
          lt: today
        }
      }
    });

    // Return formatted data
    return NextResponse.json({
      location: {
        name: location,
        latitude: data.latitude,
        longitude: data.longitude,
        country: data.country,
        countryCode: data.country_code,
        timezone: String(data.timezone)
      },
      date: todayPrayers.date_for,
      prayers: [
        { name: 'fajr', time: todayPrayers.fajr, arabicName: 'الفجر' },
        { name: 'shurooq', time: todayPrayers.shurooq, arabicName: 'الشروق' },
        { name: 'dhuhr', time: todayPrayers.dhuhr, arabicName: 'الظهر' },
        { name: 'asr', time: todayPrayers.asr, arabicName: 'العصر' },
        { name: 'maghrib', time: todayPrayers.maghrib, arabicName: 'المغرب' },
        { name: 'isha', time: todayPrayers.isha, arabicName: 'العشاء' }
      ],
      qiblaDirection: data.qibla_direction,
      weather: {
        temperature: data.today_weather.temperature,
        pressure: data.today_weather.pressure
      },
      sunrise: todayPrayers.shurooq
    });

  } catch (error) {
    console.error('Prayer times API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}