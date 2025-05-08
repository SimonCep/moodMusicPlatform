import React from 'react';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Genre {
  value: string;
  label: string;
}

interface GenreSelectorProps {
  genreOptions: Genre[];
  genreValue: string;
  setGenreValue: (value: string) => void;
  genreOpen: boolean;
  setGenreOpen: (open: boolean) => void;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  genreOptions,
  genreValue,
  setGenreValue,
  genreOpen,
  setGenreOpen,
}) => {
  return (
    <Popover open={genreOpen} onOpenChange={setGenreOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={genreOpen}
          className="w-full justify-between bg-input/50 hover:bg-input/70"
        >
          {genreValue
            ? genreOptions.find((genre) => genre.value.toLowerCase() === genreValue.toLowerCase())?.label || genreValue
            : "Select or type genre..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command className="bg-card">
          <CommandInput
            placeholder="Search or type genre..."
            value={genreValue}
            // Note: Using onValueChange from CommandInput to directly set genreValue
            // might be preferable for typing custom genres.
            // For this extraction, we'll keep the MoodPage's original behavior
            // where setGenreValue is called on select or if CommandInput's value is used directly.
            // This might need further refinement based on desired UX for custom genres.
            onValueChange={setGenreValue} 
          />
          <CommandList>
            <CommandEmpty>No genre found. Enter custom genre above.</CommandEmpty>
            <CommandGroup>
              {genreOptions.map((genre) => (
                <CommandItem
                  key={genre.value}
                  value={genre.label} // This value is used for filtering and searching within Command
                  onSelect={(currentLabel) => {
                    // currentLabel is the *label* of the selected item, or the input value if custom
                    const selectedOption = genreOptions.find(g => g.label.toLowerCase() === currentLabel.toLowerCase());
                    setGenreValue(selectedOption ? selectedOption.value : currentLabel);
                    setGenreOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      (genreValue.toLowerCase() === genre.value.toLowerCase() || genreValue.toLowerCase() === genre.label.toLowerCase() && !genreOptions.find(opt => opt.value.toLowerCase() === genre.label.toLowerCase() && opt.value.toLowerCase() !== genre.value.toLowerCase()))
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {genre.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 