"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { LocationData, MonthlyTimetableDay } from "@/types/prayer";

interface MonthlyTimetableProps {
  location: LocationData;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MonthlyTimetable({ location }: MonthlyTimetableProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [days, setDays] = useState<MonthlyTimetableDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          latitude: location.latitude,
          longitude: location.longitude,
          month: String(month),
          year: String(year),
        });
        const response = await fetch(`/api/prayer-times/monthly?${params}`);
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load monthly timetable");
        }
        const data = await response.json();
        if (!cancelled) setDays(data.days ?? []);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load timetable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [location.latitude, location.longitude, month, year]);

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4 space-y-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-base-content">
            {MONTH_NAMES[month - 1]} {year}
          </h3>
          <button
            onClick={goToNextMonth}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Next month"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        )}

        {error && !loading && (
          <div className="alert alert-warning text-sm">
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="table table-sm table-zebra">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Hijri</th>
                  <th>Fajr</th>
                  <th>Dhuhr</th>
                  <th>Asr</th>
                  <th>Maghrib</th>
                  <th>Isha</th>
                </tr>
              </thead>
              <tbody>
                {days.map((day) => {
                  const isToday = day.gregorianDate === todayStr;
                  const dayNumber = Number(day.gregorianDate.split("-")[2]);
                  return (
                    <tr
                      key={day.gregorianDate}
                      className={isToday ? "bg-primary/10 font-semibold" : ""}
                    >
                      <td>{dayNumber}</td>
                      <td className="whitespace-nowrap">
                        {day.hijri ? `${day.hijri.day} ${day.hijri.monthEn}` : "—"}
                      </td>
                      <td>{day.timings.fajr}</td>
                      <td>{day.timings.dhuhr}</td>
                      <td>{day.timings.asr}</td>
                      <td>{day.timings.maghrib}</td>
                      <td>{day.timings.isha}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
