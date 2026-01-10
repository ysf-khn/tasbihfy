"use client";

import { useState, useEffect } from "react";
import type { Dhikr } from "@/types/models";
import islamicTexts from "@/data/islamic-texts.json";

interface CreateDhikrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; targetCount: number; arabic?: string; transliteration?: string }) => Promise<void>;
  initialData?: Dhikr;
  title: string;
}

export const commonDhikrs = [
  // Basic Tasbihat with inline Arabic
  { name: "SubhanAllah", arabic: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", targetCount: 33 },
  { name: "Alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", targetCount: 33 },
  { name: "Allahu Akbar", arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", targetCount: 34 },
  { name: "La ilaha illa Allah", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", transliteration: "La ilaha illallah", targetCount: 100 },
  { name: "Astaghfirullah", arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", targetCount: 100 },
  { name: "SubhanAllahi wa bihamdihi", arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "SubhanAllahi wa bihamdihi", targetCount: 100 },
  { name: "SubhanAllahi wa bihamdihi, SubhanAllahil Azeem", arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ", transliteration: "SubhanAllahi wa bihamdihi, SubhanAllahil 'Azeem", targetCount: 100 },
  { name: "La Hawla Wa La Quwwata Illa Billah", arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "La hawla wa la quwwata illa billah", targetCount: 100 },
  { name: "Hasbunallahu wa ni'mal wakeel", arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", transliteration: "Hasbunallahu wa ni'mal wakeel", targetCount: 70 },
  
  // Texts with full references to islamic-texts.json
  { name: "Ayatul Kursi", targetCount: 7, textRef: "ayatul-kursi" },
  { name: "Last 2 Ayahs of Surah Baqarah", targetCount: 3, textRef: "last-two-ayahs-baqarah" },
  { name: "Durud Ibrahim", targetCount: 100, textRef: "durud-ibrahim" },
  
  // Four Quls (Individual)
  { name: "Surah Al-Ikhlas", targetCount: 3, textRef: "surah-ikhlas" },
  { name: "Surah Al-Falaq", targetCount: 3, textRef: "surah-falaq" },
  { name: "Surah An-Nas", targetCount: 3, textRef: "surah-nas" },
  { name: "Surah Al-Kafirun", targetCount: 1, textRef: "surah-kafirun" },
  
  // Full Surahs
  { name: "Surah Al-Mulk", targetCount: 1, textRef: "surah-mulk" },
];

export default function CreateDhikrModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: CreateDhikrModalProps) {
  const [name, setName] = useState("");
  const [targetCount, setTargetCount] = useState(100);
  const [arabic, setArabic] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTargetCount(initialData.targetCount);
      // TODO: Load Arabic and transliteration from initialData when database fields are added
      setArabic("");
      setTransliteration("");
    } else {
      setName("");
      setTargetCount(100);
      setArabic("");
      setTransliteration("");
    }
    setError("");
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await onSubmit({ 
        name: name.trim(), 
        targetCount,
        arabic: arabic.trim() || undefined,
        transliteration: transliteration.trim() || undefined
      });
      setName("");
      setTargetCount(100);
      setArabic("");
      setTransliteration("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (dhikr: any) => {
    setName(dhikr.name);
    setTargetCount(dhikr.targetCount);
    
    if (dhikr.textRef) {
      // Load full text from islamic-texts.json
      const fullText = islamicTexts[dhikr.textRef as keyof typeof islamicTexts];
      if (fullText) {
        setArabic(fullText.arabic);
        setTransliteration(fullText.transliteration);
      }
    } else if (dhikr.arabic) {
      // Use inline Arabic text
      setArabic(dhikr.arabic);
      setTransliteration(dhikr.transliteration || "");
    } else {
      // Clear Arabic text for basic names
      setArabic("");
      setTransliteration("");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setError("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-lg max-h-[80vh] h-auto">
        <h3 className="font-bold text-lg mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Tasbih Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter tasbih name (eg: Alhamdulillah)"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          {!initialData && (
            <div className="space-y-2">
              <label className="label">
                <span className="label-text">Quick Select</span>
              </label>
              <div className="max-h-64 overflow-y-auto border border-base-300 rounded-lg p-2">
                <div className="space-y-1">
                  {commonDhikrs.map((dhikr, index) => (
                    <button
                      key={index}
                      type="button"
                      className="btn btn-outline btn-md w-full justify-start h-auto py-3"
                      onClick={() => handleQuickSelect(dhikr)}
                    >
                      <span className="truncate text-left">{dhikr.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Target Count</span>
            </label>
            <input
              type="number"
              placeholder="Enter target count"
              className="input input-bordered w-full"
              value={targetCount}
              onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
              required
              min={1}
              max={10000}
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isLoading ? "loading" : ""}`}
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  );
}
