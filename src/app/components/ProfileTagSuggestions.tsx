"use client";

interface ProfileTagSuggestionsProps {
  profiles: Array<{
    id: string;
    name: string;
  }>;
  searchTerm: string;
  onSelect: (name: string) => void;
}

export default function ProfileTagSuggestions({ 
  profiles, 
  searchTerm, 
  onSelect 
}: ProfileTagSuggestionsProps) {
  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchTerm.toLowerCase().replace('@', ''))
  );

  if (filteredProfiles.length === 0 || searchTerm.length < 2) {
    return null;
  }

  return (
    <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
      {filteredProfiles.map(profile => (
        <button
          key={profile.id}
          onClick={() => onSelect(profile.name)}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
        >
          {profile.name}
        </button>
      ))}
    </div>
  );
}
