import axios from 'axios';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_SEARCH_URL = 'https://api.spotify.com/v1/search';

let spotifyAccessToken: string | null = null;
let tokenExpiryTime: number | null = null;

const getSpotifyToken = async (): Promise<string | null> => {
    if (spotifyAccessToken && tokenExpiryTime && Date.now() < tokenExpiryTime - 60000) {
        return spotifyAccessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
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
        tokenExpiryTime = Date.now() + (response.data.expires_in * 1000);
        return spotifyAccessToken;

    } catch (error: any) {
        spotifyAccessToken = null;
        tokenExpiryTime = null;
        return null;
    }
};

export const searchSpotifyTrack = async (title: string, artist: string): Promise<string | null> => {
    const token = await getSpotifyToken();
    if (!token) {
        return null;
    }

    const cleanedTitle = title.replace(/\?feature=oembed/i, '').trim();
    const cleanedArtist = artist.trim();

    const query = `track:${cleanedTitle} artist:${cleanedArtist}`;

    try {
        const response = await axios.get(SPOTIFY_SEARCH_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params: {
                q: query,
                type: 'track',
                limit: 1,
            },
        });

        if (response.data?.tracks?.items?.length > 0) {
            const trackUri = response.data.tracks.items[0].uri;
            return trackUri;
        } else {
            return null;
        }
    } catch (error: any) {
        return null;
    }
}; 