"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getTafsir, getTafsirs } from "@/lib/quran/api";
import { Tafsir, TafsirResource } from "@/lib/quran/types";

interface TafsirModalProps {
  surahId: number;
  verseNumber: number;
  verseText: string;
  verseKey: string;
  onClose: () => void;
}

export default function TafsirModal({
  surahId,
  verseNumber,
  verseText,
  verseKey,
  onClose,
}: TafsirModalProps) {
  const [availableTafsirs, setAvailableTafsirs] = useState<TafsirResource[]>(
    []
  );
  const [selectedTafsirId, setSelectedTafsirId] = useState<number>(169); // Default to tafsir ID 169
  const [tafsirData, setTafsirData] = useState<Tafsir | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTafsirs, setLoadingTafsirs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tafsirsError, setTafsirsError] = useState<string | null>(null);

  // Load available tafsirs on component mount
  useEffect(() => {
    loadAvailableTafsirs();
  }, []);

  // Load tafsir when selection changes
  useEffect(() => {
    if (availableTafsirs.length > 0) {
      loadTafsir();
    }
  }, [selectedTafsirId, availableTafsirs]);

  const loadAvailableTafsirs = async () => {
    try {
      setLoadingTafsirs(true);
      setTafsirsError(null);
      const tafsirs = await getTafsirs();
      setAvailableTafsirs(tafsirs);

      // Set default selection to first tafsir if available
      if (tafsirs.length > 0) {
        setSelectedTafsirId(tafsirs[0].id);
      }
    } catch (err) {
      console.error("Failed to load available tafsirs:", err);
      setTafsirsError("Failed to load available tafsirs. Using defaults.");
      // Fallback to a default tafsir ID
      setSelectedTafsirId(169);
    } finally {
      setLoadingTafsirs(false);
    }
  };

  const loadTafsir = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTafsir(surahId, verseNumber, selectedTafsirId);
      setTafsirData(data);
    } catch (err) {
      setError("Failed to load tafsir. Please try again.");
      console.error("Failed to load tafsir:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to sanitize and render HTML content safely
  const renderTafsirHTML = (htmlText: string) => {
    // Basic HTML sanitization - in a production app, consider using DOMPurify
    const sanitizedHTML = htmlText
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
      .replace(/javascript:/gi, "") // Remove javascript: URLs
      .replace(/on\w+="[^"]*"/gi, ""); // Remove event handlers

    return { __html: sanitizedHTML };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2">
      <div className="bg-base-100 w-full max-w-4xl h-[95vh] overflow-hidden rounded-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-base-100 border-b border-base-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Tafsir</h2>
            <p className="text-sm text-base-content/70">
              {verseKey} •{" "}
              {availableTafsirs.find((t) => t.id === selectedTafsirId)?.name ||
                "Loading..."}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-square">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Verse Text */}
          <div className="p-4 border-b border-base-200 bg-base-50">
            <p className="text-right text-xl font-arabic leading-loose text-base-content mb-3">
              {verseText}
            </p>
            <p className="text-sm text-base-content/70 text-center">
              Quran {verseKey}
            </p>
          </div>

          {/* Tafsir Selection */}
          <div className="p-4 border-b border-base-200">
            <label className="text-sm font-medium mb-2 block">
              Select Tafsir:
            </label>
            {loadingTafsirs ? (
              <div className="flex items-center gap-2">
                <div className="loading loading-spinner loading-sm"></div>
                <span className="text-sm text-base-content/70">
                  Loading available tafsirs...
                </span>
              </div>
            ) : tafsirsError ? (
              <div className="alert alert-warning alert-sm">
                <p className="text-xs">{tafsirsError}</p>
              </div>
            ) : (
              <select
                className="select select-bordered w-full max-w-xs"
                value={selectedTafsirId}
                onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
                disabled={availableTafsirs.length === 0}
              >
                {availableTafsirs.map((tafsir) => (
                  <option key={tafsir.id} value={tafsir.id}>
                    {tafsir.name} - {tafsir.author_name} ({tafsir.language_name}
                    )
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tafsir Content */}
          <div className="p-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="loading loading-spinner loading-md text-primary"></div>
              </div>
            )}

            {error && (
              <div className="alert alert-warning">
                <p>{error}</p>
                <button onClick={loadTafsir} className="btn btn-sm btn-primary">
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && tafsirData && (
              <div>
                {tafsirData.text ? (
                  <div
                    className="tafsir-content prose prose-sm max-w-none text-base-content"
                    dangerouslySetInnerHTML={renderTafsirHTML(tafsirData.text)}
                  />
                ) : (
                  <div className="text-center py-8 text-base-content/70">
                    <p>Tafsir not available for this verse.</p>
                    <p className="text-sm mt-1">
                      Try selecting a different tafsir source.
                    </p>
                  </div>
                )}

                {tafsirData.text && (
                  <div className="mt-6 pt-4 border-t border-base-200 text-xs text-base-content/60">
                    <p>Source: {tafsirData.resource_name}</p>
                    {/* <p>Language: {tafsirData.language_name}</p> */}
                  </div>
                )}
              </div>
            )}

            {!loading && !error && !tafsirData && (
              <div className="text-center py-8 text-base-content/70">
                <p>No tafsir available for this verse.</p>
                <p className="text-sm mt-1">
                  Please try a different source or verse.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-base-100 border-t border-base-200 p-4">
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="btn btn-outline">
              Close
            </button>
            {tafsirData?.text && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tafsirData.text);
                  // Could show toast here
                }}
                className="btn btn-primary"
              >
                Copy Tafsir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
