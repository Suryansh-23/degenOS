import { MediaRenderer } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { SocialProfile } from "thirdweb/social";
import { client } from "../client";

interface ENSCardProps {
  profile: SocialProfile;
}

export function ENSCard({ profile }: ENSCardProps) {
  const ensMetadata = profile.metadata as { address?: string };

  return (
    <div className="card bg-base-100 shadow-xl w-full h-full">
      <div className="card-body flex flex-col justify-between h-full">
        <div>
          <p className="mb-2 bg-blue-500 text-sm rounded-lg py-1 px-2 inline-block w-fit">ENS</p>
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
              <h2 className="card-title">{profile.name || 'Unnamed ENS'}</h2>
              <p className="text-xs text-gray-500 border border-gray-500 rounded-lg px-2 py-1 inline-block mt-2 flex items-center">{shortenAddress(ensMetadata.address as string)}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 w-full">
          <a href={`https://app.ens.domains/${profile.name}`} target="_blank" rel="noopener noreferrer" className="btn w-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/50">
            View on ENS
          </a>
        </div>
      </div>
    </div>
  );
}
