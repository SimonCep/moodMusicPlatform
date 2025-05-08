import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { Card, CardContent } from "./ui/card";

// Define music genres
const genreOptions = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Classical' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'hip-hop', label: 'Hip-Hop' },
  { value: 'r&b', label: 'R&B' },
  { value: 'country', label: 'Country' },
  { value: 'blues', label: 'Blues' },
  { value: 'metal', label: 'Metal' },
  { value: 'folk', label: 'Folk' },
  { value: 'indie', label: 'Indie' },
];

// Updated styles with menuPortal
const customStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'var(--primary)'
    }
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'white',
    backdropFilter: 'none',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    marginTop: 0,
    borderRadius: '0 0 4px 4px'
  }),
  menuList: (base: any) => ({
    ...base,
    padding: 0,
    backgroundColor: 'white'
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--primary)'
      : state.isFocused
        ? 'rgba(var(--primary), 0.1)'
        : 'white',
    color: state.isSelected ? 'white' : 'black'
  }),
  // Add menuPortal styles
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999 // Very high z-index to ensure it's above everything
  })
};

interface GenreSelectorProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ selectedGenre, onGenreChange }) => {
  // State to track if the component is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  const handleChange = (option: any) => {
    if (option) {
      onGenreChange(option.value);
    }
  };

  const createOption = (inputValue: string) => {
    return {
      label: inputValue,
      value: inputValue.toLowerCase().replace(/\W/g, '-')
    };
  };

  const handleCreate = (inputValue: string) => {
    const newOption = createOption(inputValue);
    onGenreChange(newOption.value);
  };

  return (
    <Card className="mb-4 glass-card">
      <CardContent className="pt-4">
        <label className="block text-sm font-medium mb-2">Favorite Music Genre</label>
        <CreatableSelect
          options={genreOptions}
          styles={customStyles}
          value={genreOptions.find(option => option.value === selectedGenre) ||
                { value: selectedGenre, label: selectedGenre }}
          onChange={handleChange}
          onCreateOption={handleCreate}
          placeholder="Select or type your favorite genre..."
          className="genre-selector"
          isSearchable
          formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
          aria-label="Music genre selector"
          // Add menuPortalTarget to render dropdown in a portal
          menuPortalTarget={isMounted ? document.body : null}
          // Ensure the menu is always open when clicked
          menuPlacement="auto"
        />
      </CardContent>
    </Card>
  );
};

export default GenreSelector;
