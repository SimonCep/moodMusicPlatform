import React, { useState, useEffect } from 'react';
import { quotes, Quote } from '@/data/quotes'; // Import quotes and Quote interface
import FeatureCard from '@/components/FeatureCard'; // Import FeatureCard
import { Compass, BarChartHorizontalBig, AreaChart, ListMusic } from 'lucide-react'; // Import icons

const HomePage: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const features = [
    {
      icon: <ListMusic className="h-8 w-8 mr-3 text-primary" />,
      title: "Your Playlists",
      description: "Access your personalized playlists generated based on your mood and preferences.",
      linkTo: "/playlists",
      buttonText: "View Playlists"
    },
    {
      icon: <BarChartHorizontalBig className="h-8 w-8 mr-3 text-primary" />,
      title: "Understand Mood",
      description: "Log your emotions, track your patterns, and gain insights into your well-being.",
      linkTo: "/mood",
      buttonText: "Track Mood"
    },
    {
      icon: <Compass className="h-8 w-8 mr-3 text-primary" />,
      title: "Explore Music",
      description: "Dive into curated playlists and find new tracks tailored to every mood and moment.",
      linkTo: "/discovery",
      buttonText: "Discover Now"
    },
    {
      icon: <AreaChart className="h-8 w-8 mr-3 text-primary" />,
      title: "View Reports",
      description: "See detailed reports on your mood history and the impact of music on your emotions.",
      linkTo: "/report",
      buttonText: "See Reports"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 md:py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_0.3)]">
        Welcome Back!
      </h1>
      <p className="text-lg md:text-xl text-gray-200 [text-shadow:_0_1px_3px_rgb(0_0_0_/_0.3)] mb-8 md:mb-10 max-w-2xl mx-auto">
        Your personalized mood and music experience awaits. Discover new tracks, understand your emotional patterns, and see how music influences your day.
      </p>

      {/* Sound Reflection Section */}
      {currentQuote && (
        <div className="pt-2 pb-6 md:pb-8 w-full max-w-3xl text-center">
          <p className="italic text-gray-200 [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.2)] text-lg md:text-xl">
            "{currentQuote.quote}" - {currentQuote.author}
          </p>
        </div>
      )}

      <div className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-6xl">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            linkTo={feature.linkTo}
            buttonText={feature.buttonText}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage; 