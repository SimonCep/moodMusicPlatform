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
          className="w-full justify-between bg-input/50 hover:bg-input/70 border-primary cursor-pointer transition-all duration-200 hover:scale-[1.02]"
        >
          {genreValue
            ? genreOptions.find((genre) => genre.value.toLowerCase() === genreValue.toLowerCase())?.label || genreValue
            : "Select or type genre..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-card/95 backdrop-blur-sm border border-primary">
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search or type genre..."
            value={genreValue}
            onValueChange={setGenreValue}
            className="border-none bg-transparent cursor-text"
          />
          <CommandList>
            <CommandEmpty className="py-2 px-4 text-sm text-muted-foreground">
              Press enter to use "{genreValue}" as your genre
            </CommandEmpty>
            <CommandGroup>
              {genreOptions.map((genre) => (
                <CommandItem
                  key={genre.value}
                  value={genre.label}
                  onSelect={(currentLabel) => {
                    const selectedOption = genreOptions.find(g => g.label.toLowerCase() === currentLabel.toLowerCase());
                    setGenreValue(selectedOption ? selectedOption.value : currentLabel);
                    setGenreOpen(false);
                  }}
                  className="cursor-pointer transition-all duration-200 hover:pl-6 hover:bg-primary/10 hover:border-l-2 hover:border-primary group relative"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 transition-opacity",
                      (genreValue.toLowerCase() === genre.value.toLowerCase() || genreValue.toLowerCase() === genre.label.toLowerCase() && !genreOptions.find(opt => opt.value.toLowerCase() === genre.label.toLowerCase() && opt.value.toLowerCase() !== genre.value.toLowerCase()))
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-50"
                    )}
                  />
                  <span className="transition-colors group-hover:text-primary">{genre.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 