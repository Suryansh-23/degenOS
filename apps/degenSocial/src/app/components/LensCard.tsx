import { MediaRenderer } from "thirdweb/react";
import { SocialProfile } from "thirdweb/social";
import { client } from "../client";

interface LensCardProps {
  profile: SocialProfile;
}

export function LensCard({ profile }: LensCardProps) {
  const lensMetadata = profile.metadata as { handle?: string };

  return (
    <div className="card bg-base-100 shadow-xl w-full h-full">
      <div className="card-body flex flex-col justify-between h-full">
        <div>
          <p className="mb-2 bg-green-500 text-sm rounded-lg py-1 px-2 inline-block w-fit">Lens</p>
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
            <div className="flex flex-col">
              <h2 className="card-title">{profile.name || lensMetadata.handle || 'Unnamed Lens'}</h2>
              <p className="text-sm">{profile.bio}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 w-full flex space-x-2">
          <a href={`https://hey.xyz/u/${profile.name || lensMetadata.handle}`} target="_blank" rel="noopener noreferrer" className="btn flex-1 text-white bg-green-500 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300">
            View on Hey
          </a>
          <a href={`https://orb.club/@${profile.name || lensMetadata.handle}`} target="_blank" rel="noopener noreferrer" className="btn flex-1 text-white bg-green-500 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300">
            View on Orb
          </a>
        </div>
      </div>
    </div>
  );
}
