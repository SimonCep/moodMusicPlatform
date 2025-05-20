import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createMoodAndGetPlaylist } from '../services/api';

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
  
  const navigate = useNavigate();

  const handleScanFaceClick = () => {
    setShowFaceScanPopup(true);
  };

  const handleClosePopup = () => {
    setShowFaceScanPopup(false);
  };

  const handleEmotionFromScan = (description: string) => {
    setDetectedEmotion(description.trim());
    setMoodInput('');
    setShowFaceScanPopup(false);
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
    try {
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
  };
}; 