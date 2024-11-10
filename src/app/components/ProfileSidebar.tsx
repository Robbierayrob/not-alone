"use client";

import NodeDetailsModal from './NodeDetailsModal';
import { useState } from 'react';

interface ProfileSidebarProps {
  isOpen: boolean;
  profiles: Array<{
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
  }>;
}

export default function ProfileSidebar({ isOpen, profiles }: ProfileSidebarProps) {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  return (
    <div className={`${isOpen ? 'w-64' : 'w-0'} bg-gray-50 border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Profiles</h2>
        <div className="space-y-2">
          {profiles.map((profile) => (
            <div key={profile.id} className="relative group">
              <button
                onClick={() => setSelectedProfile(profile)}
                className="w-full px-4 py-3 rounded-lg text-left hover:bg-gray-100 
                  transition-colors"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                        profile.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}
                    >
                      {profile.name.charAt(0)}
                    </div>
                    <span className="font-medium truncate">{profile.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 mt-1 truncate">
                    {profile.summary}
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <NodeDetailsModal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        nodeData={selectedProfile}
      />
    </div>
  );
}
