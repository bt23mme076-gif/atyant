import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useMentors(filters) {
  const { searchTerm, selectedCategory, mentorBackground, availability, price, sort } = filters;

  return useQuery({
    queryKey: ['mentors', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('q', searchTerm);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (mentorBackground !== 'All') params.append('mentorBackground', mentorBackground);
      if (availability !== 'All') params.append('availability', availability);
      if (price !== 'All') params.append('price', price);
      params.append('sort', sort);

      const url = params.toString()
        ? `${API_URL}/api/search/mentors?${params.toString()}`
        : `${API_URL}/api/users/mentors`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch mentors');
      }
      return response.json();
    },
    
    // ✅ CHANGE THESE VALUES (MORE AGGRESSIVE CACHING)
    staleTime: 10 * 60 * 1000, // 10 minutes (was 3 minutes)
    cacheTime: 30 * 60 * 1000, // 30 minutes (was 10 minutes)
    retry: 2, // Retry twice on failure
    refetchOnWindowFocus: false,
    refetchOnMount: false, // ✅ NEW: Don't refetch if data is cached
    refetchOnReconnect: false, // ✅ NEW: Don't refetch on reconnect
  });
}