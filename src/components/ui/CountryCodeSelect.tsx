import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CountryCode {
  dial_code: string;
  name: string;
  phone_length: number;
  code: string;
}

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string, country: CountryCode | undefined) => void;
  countryCodes: CountryCode[];
  disabled?: boolean;
  className?: string;
}

const CountryCodeSelect = ({
  value,
  onChange,
  countryCodes,
  disabled = false,
  className,
}: CountryCodeSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCountries = React.useMemo(() => {
    if (!searchQuery.trim()) return countryCodes;
    
    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/);
    
    // Filter and score matches
    const scored = countryCodes
      .map((country) => {
        const nameLower = country.name.toLowerCase();
        const codeLower = country.code.toLowerCase();
        const dialCode = country.dial_code;
        
        let score = 0;
        
        // Exact full match - highest priority
        if (nameLower === query || codeLower === query) {
          score = 100;
        }
        // Multi-word search: all words must match (e.g., "united states")
        else if (queryWords.length > 1 && queryWords.every(word => nameLower.includes(word))) {
          // Bonus if name starts with first query word
          score = nameLower.startsWith(queryWords[0]) ? 95 : 85;
        }
        // Single word: Name starts with query
        else if (nameLower.startsWith(query)) {
          score = 80;
        }
        // Country code exact match
        else if (codeLower === query) {
          score = 90;
        }
        // Country code starts with
        else if (codeLower.startsWith(query)) {
          score = 75;
        }
        // Dial code exact match
        else if (dialCode === query || dialCode === query.replace('+', '')) {
          score = 85;
        }
        // Dial code starts with
        else if (dialCode.startsWith(query.replace('+', ''))) {
          score = 70;
        }
        // Any word in name starts with query
        else if (nameLower.split(' ').some(word => word.startsWith(query))) {
          score = 60;
        }
        // Name contains query
        else if (nameLower.includes(query)) {
          score = 40;
        }
        
        return { country, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => {
        // Sort by score first, then alphabetically by name
        if (b.score !== a.score) return b.score - a.score;
        return a.country.name.localeCompare(b.country.name);
      });
    
    return scored.map(item => item.country);
  }, [countryCodes, searchQuery]);

  const selectedCountry = countryCodes.find(
    (c) => `+${c.dial_code}` === value || c.dial_code === value.replace("+", "")
  );

  const handleSelect = (country: CountryCode) => {
    onChange(`+${country.dial_code}`, country);
    setIsOpen(false);
    setSearchQuery("");
  };

  const displayValue = selectedCountry
    ? `+${selectedCountry.dial_code} ${selectedCountry.code}`
    : value || "+91 IN";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between gap-1 h-9 px-2 min-w-[100px] border border-[#d1d5db] rounded-md text-[13px] bg-white transition-colors",
          disabled
            ? "text-[#888] cursor-not-allowed bg-[#f9fafb]"
            : "text-[#333] hover:border-[#a1a1aa] cursor-pointer"
        )}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-[220px] bg-white border border-[#e5e7eb] rounded-lg shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-[#f0f0f0]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-8 text-[13px] border border-[#e5e7eb] rounded-md outline-none focus:border-[#2563eb] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-[200px] overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-4 text-center text-[13px] text-[#999]">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={`${country.code}-${country.dial_code}`}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-[13px] hover:bg-[#f5f5f5] transition-colors flex items-center gap-2",
                    selectedCountry?.code === country.code && "bg-[#f0f7ff]"
                  )}
                >
                  <span className="font-medium text-[#333] min-w-[45px]">+{country.dial_code}</span>
                  <span className="text-[#666] truncate">{country.code} - {country.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelect;
