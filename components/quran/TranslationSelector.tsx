"use client";

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { 
  getGroupedTranslations, 
  getTranslationDisplayInfo,
  getPopularTranslations,
  TranslationResource 
} from '@/lib/quran/translations-data';

interface TranslationSelectorProps {
  selectedTranslationIds: number[];
  onSelectionChange: (translationIds: number[]) => void;
  maxSelections?: number;
  compactMode?: boolean;
}

export default function TranslationSelector({
  selectedTranslationIds,
  onSelectionChange,
  maxSelections = 5,
  compactMode = false
}: TranslationSelectorProps) {
  const [expandedLanguages, setExpandedLanguages] = useState<Set<string>>(new Set(['english']));

  const groupedTranslations = getGroupedTranslations();
  const popularTranslations = getPopularTranslations();

  const handleTranslationToggle = (translationId: number) => {
    const isSelected = selectedTranslationIds.includes(translationId);
    let newSelection: number[];

    if (isSelected) {
      newSelection = selectedTranslationIds.filter(id => id !== translationId);
    } else {
      if (selectedTranslationIds.length >= maxSelections) {
        // Replace the last selection if at max
        newSelection = [...selectedTranslationIds.slice(0, maxSelections - 1), translationId];
      } else {
        newSelection = [...selectedTranslationIds, translationId];
      }
    }

    onSelectionChange(newSelection);
  };

  const toggleLanguageExpansion = (language: string) => {
    const newExpanded = new Set(expandedLanguages);
    if (newExpanded.has(language)) {
      newExpanded.delete(language);
    } else {
      newExpanded.add(language);
    }
    setExpandedLanguages(newExpanded);
  };

  const renderTranslationItem = (translation: TranslationResource) => {
    const isSelected = selectedTranslationIds.includes(translation.id);
    const displayInfo = getTranslationDisplayInfo(translation.id);
    
    return (
      <div
        key={translation.id}
        className={`
          flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
          ${isSelected 
            ? 'bg-primary/10 border border-primary/30' 
            : 'hover:bg-base-200 border border-transparent'
          }
          ${!displayInfo?.isAvailable ? 'opacity-50' : ''}
        `}
        onClick={() => handleTranslationToggle(translation.id)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium text-sm ${compactMode ? 'truncate' : ''}`}>
              {translation.name}
            </h4>
            {!displayInfo?.isAvailable && (
              <span className="text-xs px-2 py-1 bg-warning/20 text-warning-content rounded">
                Prod Only
              </span>
            )}
          </div>
          <p className="text-xs text-base-content/70 truncate">
            {translation.author_name}
          </p>
          {!compactMode && (
            <p className="text-xs text-base-content/50 capitalize">
              {translation.language_name}
            </p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}} // Handled by parent onClick
            className="checkbox checkbox-primary checkbox-sm"
            tabIndex={-1}
          />
        </div>
      </div>
    );
  };

  const renderLanguageSection = (language: string, translations: TranslationResource[]) => {
    const isExpanded = expandedLanguages.has(language);
    const languageDisplayName = language.charAt(0).toUpperCase() + language.slice(1);
    const popularIds = popularTranslations[language] || [];
    const popular = translations.filter(t => popularIds.includes(t.id));
    const others = translations.filter(t => !popularIds.includes(t.id));
    
    return (
      <div key={language} className="border border-base-300 rounded-lg">
        <button
          onClick={() => toggleLanguageExpansion(language)}
          className="w-full flex items-center justify-between p-4 hover:bg-base-100 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">{languageDisplayName}</h3>
            <span className="text-xs bg-base-300 px-2 py-1 rounded">
              {translations.length} translations
            </span>
          </div>
          <ChevronDownIcon 
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4 space-y-2">
            {popular.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-base-content/70 mb-2">Popular</h4>
                {popular.map(renderTranslationItem)}
              </>
            )}
            
            {others.length > 0 && (
              <>
                {popular.length > 0 && (
                  <h4 className="text-sm font-medium text-base-content/70 mb-2 mt-4">Others</h4>
                )}
                {others.map(renderTranslationItem)}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Select Translations</h3>
        <span className="text-xs text-base-content/70">
          {selectedTranslationIds.length} / {maxSelections} selected
        </span>
      </div>


      {/* Language Sections */}
      <div className="space-y-3">
        {Object.entries(groupedTranslations).map(([language, translations]) =>
          renderLanguageSection(language, translations)
        )}
      </div>

      {/* Selection Summary */}
      {selectedTranslationIds.length > 0 && (
        <div className="bg-base-100 p-3 rounded-lg border border-base-300">
          <h4 className="font-medium text-sm mb-2">Selected Translations:</h4>
          <div className="space-y-1">
            {selectedTranslationIds.map((id) => {
              const displayInfo = getTranslationDisplayInfo(id);
              if (!displayInfo) return null;
              
              return (
                <div key={id} className="flex items-center justify-between text-xs">
                  <span className="truncate">
                    {displayInfo.displayName} - {displayInfo.languageDisplayName}
                  </span>
                  <button
                    onClick={() => handleTranslationToggle(id)}
                    className="text-error hover:text-error/80 ml-2"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}