import React from 'react';
import TutorialCard from '@/features/HelpPageFeatures/TutorialCard';
import FaqCard from '@/features/HelpPageFeatures/FaqCard';
import ContactsCard from '@/features/HelpPageFeatures/ContactsCard';

const HelpPage: React.FC = () => {
  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
        <h1 className="text-4xl font-bold text-center text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_0.2)] mb-10">Need Help?</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TutorialCard />
            <FaqCard />
            <ContactsCard />
        </div>
    </div>
  );
};

export default HelpPage; 