export const formatPlaylistDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        // console.warn("Error formatting date:", dateString, e); // Optional: for debugging
        return "Invalid Date"; // Return a more informative fallback
    }
}; 