"use client";

import { useState, useEffect } from "react";
import { getSocialProfiles, SocialProfile } from "thirdweb/social";
import { client } from "./client";
import { ENSCard } from "./components/ENSCard";
import { FarcasterCard } from "./components/FarcasterCard";
import { LensCard } from "./components/LensCard";
import { CardSkeleton } from "./components/CardSkeleton";
import { shortenAddress } from "thirdweb/utils";

type FilterType = "all" | "ens" | "farcaster" | "lens";

const isValidEthereumAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [searchedAddress, setSearchedAddress] = useState("");
  const [userProfiles, setUserProfiles] = useState<SocialProfile[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);

  useEffect(() => {
    setIsValidAddress(isValidEthereumAddress(searchInput));
  }, [searchInput]);

  const handleSearch = async () => {
    if (!isValidAddress) return;
    
    setIsLoading(true);
    setSearchedAddress(searchInput);
    try {
      const profiles = await getSocialProfiles({
        address: searchInput,
        client: client,
      });
      setUserProfiles(profiles);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setIsLoading(false);
      setSearchInput("");
    }
  };

  const filteredProfiles = userProfiles.filter(profile => 
    activeFilter === "all" || profile.type === activeFilter
  );

  return (
    <main className="min-h-screen bg-base-200 flex flex-col items-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-8 text-primary">FindMe Web3</h1>
        
        <div className="flex flex-row items-center justify-center mb-4">
          <input
            type="text"
            placeholder="Enter wallet address"
            className={`input input-bordered w-full max-w-xs mr-2 ${!isValidAddress && searchInput ? 'input-error' : ''}`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            className="btn btn-primary" 
            onClick={handleSearch}
            disabled={isLoading || !isValidAddress}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
        {searchInput && !isValidAddress && (
          <p className="text-error text-xs text-left">Please enter a valid Ethereum address</p>
        )}

        {hasSearched && (
          <>
            <p className="text-sm mb-4">Search results for: {shortenAddress(searchedAddress)}</p>
            <div className="tabs tabs-boxed">
              {["all", "ens", "farcaster", "lens"].map((filter) => (
                <a
                  key={filter}
                  className={`tab ${activeFilter === filter ? "tab-active" : ""}`}
                  onClick={() => setActiveFilter(filter as FilterType)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </a>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => <CardSkeleton key={index} />)
        ) : hasSearched && filteredProfiles.length > 0 ? (
          filteredProfiles.map((profile, index) => (
            <div key={index} className="w-full h-full">
              {profile.type === "ens" && <ENSCard profile={profile} />}
              {profile.type === "farcaster" && <FarcasterCard profile={profile} />}
              {profile.type === "lens" && <LensCard profile={profile} />}
            </div>
          ))
        ) : hasSearched ? (
          <p className="text-center text-gray-500 col-span-full">No profiles found for this address.</p>
        ) : null}
      </div>
    </main>
  );
}