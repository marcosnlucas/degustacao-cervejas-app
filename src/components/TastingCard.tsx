'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Star, Trash2 } from 'lucide-react';

interface Tasting {
  id: string;
  beer: {
    name: string;
    brewery: {
      name: string;
    };
  };
  finalScore: number;
  createdAt: string;
  imageUrl?: string | null;
}

interface TastingCardProps {
  tasting: Tasting;
}

export default function TastingCard({ tasting }: TastingCardProps) {
  return (
    <Link href={`/tastings/${tasting.id}`} className="block h-full">
      <Card className="bg-gray-800 border-amber-500/20 hover:border-amber-500/60 transition-all h-full flex flex-col overflow-hidden">
        {tasting.imageUrl && (
          <div className="w-full h-40 overflow-hidden">
            <img src={tasting.imageUrl} alt={`Foto da cerveja ${tasting.beer.name}`} className="w-full h-full object-contain" />
          </div>
        )}
        <CardHeader className={`${tasting.imageUrl ? 'pt-4' : ''}`}>
          <CardTitle className="text-xl text-amber-500 pr-8">{tasting.beer.name}</CardTitle>
          <p className="text-sm text-gray-400">{tasting.beer.brewery.name}</p>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end">
          <div className="flex items-center justify-between text-sm text-gray-300 mt-4">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={16} />
              <strong>{tasting.finalScore.toFixed(1)}</strong>
            </div>
            <span>{new Date(tasting.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
