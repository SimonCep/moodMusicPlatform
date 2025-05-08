import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createMoodAndGetPlaylist } from '../services/api';
import { MoodPlaylistResponse } from '../types'; // Assuming MoodPlaylistResponse includes playlist_quality_metrics
// import { useAuth } from '../context/AuthContext'; // Will be needed for isLoading, etc.

export interface MoodFormState {
  moodInput: string;
  detectedEmotion: string;
  energyLevel: number[];
  genreOpen: boolean;
  genreValue: string;
  songCount: number[];
  playlistGoal: string;
  isLoadingPlaylist: boolean;
  showFaceScanPopup: boolean;
  // Removed unused playlistDisclaimer state from interface
  // playlistDisclaimer: string | null;
}

export interface MoodFormHandlers {
  setMoodInput: React.Dispatch<React.SetStateAction<string>>;
  setDetectedEmotion: React.Dispatch<React.SetStateAction<string>>;
  setEnergyLevel: React.Dispatch<React.SetStateAction<number[]>>;
  setGenreOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setGenreValue: React.Dispatch<React.SetStateAction<string>>;
  setSongCount: React.Dispatch<React.SetStateAction<number[]>>;
  setPlaylistGoal: React.Dispatch<React.SetStateAction<string>>;
  handleScanFaceClick: () => void;
  handleClosePopup: () => void;
  handleEmotionFromScan: (description: string) => void;
  handleSubmitMood: () => Promise<void>;
}

export const useMoodForm = () => {
  const [moodInput, setMoodInput] = useState('');
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [genreOpen, setGenreOpen] = useState(false);
  const [genreValue, setGenreValue] = useState("");
  const [songCount, setSongCount] = useState([7]);
  const [playlistGoal, setPlaylistGoal] = useState('');
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const [showFaceScanPopup, setShowFaceScanPopup] = useState(false);
  // Removed unused playlistDisclaimer state
  // const [playlistDisclaimer, setPlaylistDisclaimer] = useState<string | null>(null); 
  
  const navigate = useNavigate();
  // const { isLoading: isAuthLoading } = useAuth(); // Placeholder for auth loading

  const handleScanFaceClick = () => {
    setShowFaceScanPopup(true);
  };

  const handleClosePopup = () => {
    setShowFaceScanPopup(false);
  };

  const handleEmotionFromScan = (description: string) => {
    setDetectedEmotion(description.trim());
    setMoodInput(''); // Clear manual mood input when emotion is detected
    setShowFaceScanPopup(false); // Close popup after detection
  };

  const handleSubmitMood = async () => {
    if (!moodInput && !detectedEmotion) {
      toast.error("Please enter your mood or use face scan.");
      return;
    }
    if (!genreValue) {
      toast.error("Please select or enter a genre.");
      return;
    }

    setIsLoadingPlaylist(true);
    // Removed setPlaylistDisclaimer(null);
    try {
      // Changed back to not needing the response data variable here
      await createMoodAndGetPlaylist(
        moodInput, 
        energyLevel[0], 
        genreValue, 
        songCount[0], 
        playlistGoal, 
        detectedEmotion
      );
      
      toast.success("Playlist generated!", {
        description: "Redirecting to your playlist..."
      });

      navigate('/playlists', { replace: true });

    } catch (err: any) {
      // console.error removed
      toast.error("Playlist Generation Failed", {
        description: err.response?.data?.detail || err.message || "Please try again."
      });
    } finally {
      setIsLoadingPlaylist(false);
    }
  };

  return {
    values: {
      moodInput,
      detectedEmotion,
      energyLevel,
      genreOpen,
      genreValue,
      songCount,
      playlistGoal,
      isLoadingPlaylist,
      showFaceScanPopup,
      // Removed playlistDisclaimer from returned values
    },
    handlers: {
      setMoodInput,
      setDetectedEmotion,
      setEnergyLevel,
      setGenreOpen,
      setGenreValue,
      setSongCount,
      setPlaylistGoal,
      handleScanFaceClick,
      handleClosePopup,
      handleEmotionFromScan,
      handleSubmitMood,
    },
    // Removed isAuthLoading // export if needed by the page
  };
}; 