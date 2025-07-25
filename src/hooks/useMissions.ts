"use client";

import { useQuery } from "@tanstack/react-query";
// This is a mock import. In a real app, you would import your configured firestore instance.
// import { firestore } from '@/lib/firebase'; 
// import { collection, getDocs } from 'firebase/firestore';

// Mock mission data
const MOCK_MISSIONS = [
  { id: 'mission-1', title: 'Reconnoiter the Whispering Woods', rank: 'Scout', status: 'Active' },
  { id: 'mission-2', title: 'Secure the Sunstone Quarry', rank: 'Conquistador', status: 'Active' },
  { id: 'mission-3', title: 'Deliver Intelligence to the Spymaster', rank: 'Scout', status: 'Completed' },
];

// Mock async function to simulate fetching from Firestore
const fetchMissions = async (): Promise<any[]> => {
  console.log("Fetching missions from Firestore...");
  // In a real implementation:
  // const missionsCollection = collection(firestore, 'missions');
  // const missionSnapshot = await getDocs(missionsCollection);
  // const missionList = missionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // return missionList;
  
  // For now, return mock data after a delay
  return new Promise(resolve => setTimeout(() => resolve(MOCK_MISSIONS), 1000));
};

export function useMissions() {
  return useQuery({
    queryKey: ["missions"],
    queryFn: fetchMissions,
  });
}
