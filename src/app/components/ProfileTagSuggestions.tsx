"use client";

interface Profile {
  id: string;
  name: string;
  gender: string;
  age: number;
  summary: string;
  details?: {
    occupation: string;
    interests: string[];
    personality: string;
    background: string;
    emotionalState: string;
  };
}

interface ProfileTagSuggestionsProps {
  profiles: Profile[];
  searchTerm: string;
  onSelect: (profile: Profile) => void;
}

export default function ProfileTagSuggestions({ 
  profiles = [], 
  searchTerm = '', 
  onSelect 
}: ProfileTagSuggestionsProps) {
  // Only show suggestions if we have an @ symbol
  const shouldShowSuggestions = searchTerm.startsWith('@');
  
  const filteredProfiles = shouldShowSuggestions 
    ? (profiles ?? []).filter(profile => 
        profile.name.toLowerCase().includes(
          searchTerm.slice(1).toLowerCase() // Remove @ from search
        )
      )
    : [];

  if (!shouldShowSuggestions || filteredProfiles.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full mb-2 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
      {filteredProfiles.map(profile => (
        <button
          key={profile.id}
          onClick={() => onSelect(profile)}
          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
        >
          <div className="flex items-start gap-3">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${
                profile.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
              }`}
            >
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium truncate">{profile.name}</span>
                <span className="text-sm text-gray-500">Age: {profile.age}</span>
              </div>
              <p className="text-sm text-gray-600 truncate mt-0.5">
                {profile.summary}
              </p>
              {profile.details?.occupation && (
                <p className="text-xs text-gray-500 mt-1">
                  {profile.details.occupation}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
