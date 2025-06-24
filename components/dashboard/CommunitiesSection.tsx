"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { databases, ID, Query } from "@/app/appwrite";
import { useUserStore } from "@/stores/userStore";
import { Models } from "appwrite";
import { Users, MapPin, Crown } from "lucide-react";

interface Community extends Models.Document {
  name: string;
  address: string;
  members?: string[]; // Array of user IDs
  description?: string;
  createdAt?: string;
}

interface UserProfile extends Models.Document {
  userId: string;
  joinedCommunities: string[]; // Array of community IDs
}

interface CommunitiesSectionProps {
  onJoinStatusChange?: (hasJoinedCommunity: boolean, joinedCommunities: string[]) => void;
}

export default function CommunitiesSection({ onJoinStatusChange }: CommunitiesSectionProps = {}) {
  const { user } = useUserStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [memberCounts, setMemberCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!;
  const COMMUNITIES_ID = process.env.NEXT_PUBLIC_COMMUNITIES_ID!;
  const USER_PROFILES_ID = process.env.NEXT_PUBLIC_USER_PROFILES_ID!;

  // Validate environment variables
  useEffect(() => {
    if (!DB_ID || !COMMUNITIES_ID || !USER_PROFILES_ID) {
      console.error("Missing required environment variables");
      toast.error("Configuration error. Please check environment variables.");
      return;
    }
  }, [DB_ID, COMMUNITIES_ID, USER_PROFILES_ID]);

  console.log("Hydrated user from zustand:", user);

  const fetchCommunities = useCallback(async () => {
    console.log("Fetching communities...");
    try {
      const res = await databases.listDocuments(DB_ID, COMMUNITIES_ID);
      console.log("Communities fetched:", res.documents);
      setCommunities(res.documents as Community[]);
      
      // Fetch member counts for all communities
      const counts: { [key: string]: number } = {};
      await Promise.all(
        res.documents.map(async (community) => {
          counts[community.$id] = await getMemberCount(community.$id);
        })
      );
      setMemberCounts(counts);
    } catch (err) {
      console.error("Error fetching communities:", err);
      toast.error("Failed to fetch communities.");
    } finally {
      setLoading(false);
    }
  }, [DB_ID, COMMUNITIES_ID]);

  // Notify parent component when join status changes
  useEffect(() => {
    const hasJoined = joinedIds.length > 0;
    onJoinStatusChange?.(hasJoined, joinedIds);
  }, [joinedIds, onJoinStatusChange]);

  const fetchUserProfile = useCallback(async () => {
    if (!user?.$id) {
      setLoading(false);
      return;
    }
    
    try {
      // Try to get existing user profile
      const res = await databases.listDocuments(
        DB_ID,
        USER_PROFILES_ID,
        [Query.equal("userId", user.$id)]
      );
      
      if (res.documents.length > 0) {
        const profile = res.documents[0] as UserProfile;
        const communities = profile.joinedCommunities || [];
        setJoinedIds(communities);
        console.log("User joined communities:", communities);
      } else {
        // Create new user profile if it doesn't exist
        const newProfile = await databases.createDocument(
          DB_ID,
          USER_PROFILES_ID,
          ID.unique(),
          {
            userId: user.$id,
            joinedCommunities: []
          }
        );
        setJoinedIds([]);
        console.log("User joined communities:", []);
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      
      // Handle session expired
      if (err?.code === 401) {
        console.log("Session expired, clearing joined communities");
        setJoinedIds([]);
      }
    }
  }, [user?.$id, DB_ID, USER_PROFILES_ID]);

  const handleJoin = async (communityId: string) => {
    if (!user?.$id) {
      toast.warning("Please log in to join a community");
      return;
    }

    setJoining(communityId);

    try {
      // Get user profile
      const userProfileRes = await databases.listDocuments(
        DB_ID,
        USER_PROFILES_ID,
        [Query.equal("userId", user.$id)]
      );

      if (userProfileRes.documents.length === 0) {
        toast.error("User profile not found. Please refresh the page.");
        setJoining(null);
        return;
      }

      const userProfile = userProfileRes.documents[0] as UserProfile;
      const currentCommunities = userProfile.joinedCommunities || [];

      // Check if already joined
      if (currentCommunities.includes(communityId)) {
        toast.info("You're already in this community.");
        setJoinedIds(currentCommunities);
        setJoining(null);
        return;
      }

      // Add community to user's joined list
      const updatedCommunities = [...currentCommunities, communityId];
      
      await databases.updateDocument(
        DB_ID,
        USER_PROFILES_ID,
        userProfile.$id,
        {
          joinedCommunities: updatedCommunities
        }
      );

      // Update local state and member count
      setJoinedIds(updatedCommunities);
      setMemberCounts(prev => ({
        ...prev,
        [communityId]: (prev[communityId] || 0) + 1
      }));
      
      toast.success("🎉 Welcome to the community!");
    } catch (err: any) {
      console.error("Error joining community:", err);
      
      if (err?.code === 401) {
        toast.error("Please log in again to join communities.");
      } else {
        toast.error("Failed to join community. Please try again.");
      }
    } finally {
      setJoining(null);
    }
  };

  const handleLeave = async (communityId: string) => {
    if (!user?.$id) return;

    setJoining(communityId);

    try {
      // Get user profile
      const userProfileRes = await databases.listDocuments(
        DB_ID,
        USER_PROFILES_ID,
        [Query.equal("userId", user.$id)]
      );

      if (userProfileRes.documents.length === 0) {
        toast.error("User profile not found.");
        setJoining(null);
        return;
      }

      const userProfile = userProfileRes.documents[0] as UserProfile;
      const currentCommunities = userProfile.joinedCommunities || [];

      // Remove community from user's joined list
      const updatedCommunities = currentCommunities.filter(id => id !== communityId);
      
      await databases.updateDocument(
        DB_ID,
        USER_PROFILES_ID,
        userProfile.$id,
        {
          joinedCommunities: updatedCommunities
        }
      );

      // Update local state and member count
      setJoinedIds(updatedCommunities);
      setMemberCounts(prev => ({
        ...prev,
        [communityId]: Math.max((prev[communityId] || 1) - 1, 0)
      }));
      
      toast.success("Left community successfully!");
    } catch (err) {
      console.error("Error leaving community:", err);
      toast.error("Failed to leave community. Please try again.");
    } finally {
      setJoining(null);
    }
  };

  // Get member count by counting users who have joined this community
  const getMemberCount = useCallback(async (communityId: string) => {
    try {
      const res = await databases.listDocuments(
        DB_ID,
        USER_PROFILES_ID,
        [Query.contains("joinedCommunities", communityId)]
      );
      return res.documents.length;
    } catch (err) {
      console.error("Error getting member count:", err);
      return 0;
    }
  }, [DB_ID, USER_PROFILES_ID]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  useEffect(() => {
    if (user?.$id) {
      fetchUserProfile();
    } else {
      setJoinedIds([]);
      setLoading(false);
    }
  }, [user?.$id, fetchUserProfile]);

  if (loading) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-600" />
          <p className="font-semibold text-lg text-gray-800">Communities</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 rounded-lg animate-pulse bg-gray-50"
            >
              <div className="h-4 bg-gray-300 rounded mb-3"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-600" />
          <p className="font-semibold text-lg text-gray-800">Communities</p>
        </div>
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No communities available</p>
          <p className="text-sm">Check back later for new communities to join.</p>
        </div>
      </div>
    );
  }

  // Separate joined and available communities
  const joinedCommunities = communities.filter(community => joinedIds.includes(community.$id));
  const availableCommunities = communities.filter(community => !joinedIds.includes(community.$id));

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-purple-600" />
        <p className="font-semibold text-lg text-gray-800">Communities</p>
        {joinedIds.length > 0 && (
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
            {joinedIds.length} joined
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Joined Communities */}
        {joinedCommunities.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
              <Crown className="w-4 h-4 text-amber-500" />
              Your Communities
            </h3>
            <div className="space-y-3">
              {joinedCommunities.map(({ $id, name, address, description }) => (
                <div
                  key={$id}
                  className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-sm text-gray-800 truncate">{name}</p>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Joined
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-600 truncate">{address}</p>
                      </div>
                      {description && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{description}</p>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          {memberCounts[$id] || 0} member{(memberCounts[$id] || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="ml-3 flex-shrink-0">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleLeave($id)}
                        disabled={joining === $id}
                      >
                        {joining === $id ? "Leaving..." : "Leave"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Communities */}
        {availableCommunities.length > 0 && (
          <div>
            {joinedCommunities.length > 0 && (
              <h3 className="text-sm font-medium text-gray-600 mb-2 mt-6">
                Discover More Communities
              </h3>
            )}
            <div className="space-y-3">
              {availableCommunities.map(({ $id, name, address, description }) => (
                <div
                  key={$id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-25 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate mb-2">{name}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-600 truncate">{address}</p>
                      </div>
                      {description && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{description}</p>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          {memberCounts[$id] || 0} member{(memberCounts[$id] || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="ml-3 flex-shrink-0">
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleJoin($id)}
                        disabled={joining === $id || !user?.$id}
                      >
                        {joining === $id ? "Joining..." : "Join"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}