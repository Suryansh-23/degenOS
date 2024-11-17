import { MediaRenderer } from "thirdweb/react";
import { SocialProfile } from "thirdweb/social";
import { client } from "../client";

interface FarcasterCardProps {
  profile: SocialProfile;
}

export function FarcasterCard({ profile }: FarcasterCardProps) {
  const farcasterMetadata = profile.metadata as { fid?: string; display_name?: string };

  return (
    <div className="card bg-base-100 shadow-xl w-full h-full">
      <div className="card-body flex flex-col justify-between h-full">
        <div>
          <p className="mb-2 bg-purple-500 text-sm rounded-lg py-1 px-2 inline-block w-fit">Farcaster</p>
          <div className="flex flex-row mt-2">
            <div className="mr-4 w-24 h-24 flex-shrink-0">
              {profile.avatar ? ( 
                <MediaRenderer
                  client={client}
                  src={profile.avatar}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                </div>
              )}
            </div>
            <div className="flex flex-col h-fit">
              <p className="font-bold text-xl mb-1">{profile.name || 'Unnamed Farcaster'}</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 border border-gray-500 rounded-lg px-2 py-1 inline-block">{farcasterMetadata.fid}</span>
                <p className="text-sm text-gray-500">{farcasterMetadata.display_name}</p>
              </div>
              {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
            </div>
          </div>
        </div>
        <div className="mt-4 w-full">
          <a href={`https://warpcast.com/${profile.name}`} target="_blank" rel="noopener noreferrer" className="btn w-full bg-purple-500 text-white hover:bg-purple-600 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-purple-500/50">
            View on Warpcast
          </a>
        </div>
      </div>
    </div>
  );
}
