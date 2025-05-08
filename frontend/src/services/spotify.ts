import axios from 'axios';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_SEARCH_URL = 'https://api.spotify.com/v1/search';

// Simple in-memory cache for the token
let spotifyAccessToken: string | null = null;
let tokenExpiryTime: number | null = null;

/**
 * Fetches a Spotify API access token using Client Credentials Flow.
 * Handles caching the token to avoid repeated requests.
 */
const getSpotifyToken = async (): Promise<string | null> => {
    // Check if token exists and is still valid (with a small buffer)
    if (spotifyAccessToken && tokenExpiryTime && Date.now() < tokenExpiryTime - 60000) {
        console.log("Using cached Spotify token");
        return spotifyAccessToken;
    }

    console.log("Fetching new Spotify token...");
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("Spotify Client ID or Secret not configured in .env file.");
        return null;
    }

    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

    try {
        const response = await axios.post(SPOTIFY_TOKEN_URL, 'grant_type=client_credentials', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`,
            },
        });

        spotifyAccessToken = response.data.access_token;
        // Calculate expiry time (response.data.expires_in is in seconds)
        tokenExpiryTime = Date.now() + (response.data.expires_in * 1000);
        console.log("Spotify token fetched successfully.");
        return spotifyAccessToken;

    } catch (error: any) {
        console.error("Error fetching Spotify token:", error.response?.data || error.message);
        spotifyAccessToken = null; // Invalidate token on error
        tokenExpiryTime = null;
        return null;
    }
};

/**
 * Searches Spotify for a track using title and artist.
 * Requires a valid Spotify API token (obtained via getSpotifyToken).
 * Returns the Spotify track URI if found, otherwise null.
 */
export const searchSpotifyTrack = async (title: string, artist: string): Promise<string | null> => {
    const token = await getSpotifyToken();
    if (!token) {
        console.error("Cannot search Spotify without a valid token.");
        return null;
    }

    // Basic cleaning for search query
    const cleanedTitle = title.replace(/\?feature=oembed/i, '').trim(); // Remove potential embed flags
    const cleanedArtist = artist.trim();

    // Construct the search query string (q param)
    const query = `track:${cleanedTitle} artist:${cleanedArtist}`;
    
    console.log(`Searching Spotify for: ${query}`);

    try {
        const response = await axios.get(SPOTIFY_SEARCH_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params: {
                q: query,
                type: 'track',
                limit: 1, // We only need the best match
            },
        });

        // Check if tracks were found
        if (response.data?.tracks?.items?.length > 0) {
            const trackUri = response.data.tracks.items[0].uri;
            console.log(`Found Spotify track URI: ${trackUri}`);
            return trackUri;
        } else {
            console.log(`No Spotify track found for: ${query}`);
            return null;
        }
    } catch (error: any) {
        console.error("Error searching Spotify:", error.response?.data || error.message);
        // Handle potential token expiry error? The token fetcher should handle it on next call.
        return null;
    }
}; 