import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkTo: string;
  buttonText: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, linkTo, buttonText }) => {
  return (
    <Card className="glass-card text-card-foreground text-left hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex items-center mb-2">
          {icon}
          <CardTitle className="text-2xl">{title}</CardTitle>
        </div>
        <CardDescription className="text-sm text-card-foreground/80">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end mt-auto">
        <Link to={linkTo}>
          <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10">
            {buttonText} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default FeatureCard; 