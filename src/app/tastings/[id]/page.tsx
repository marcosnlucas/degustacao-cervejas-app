'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Definindo uma interface mais completa para a degustação
interface TastingDetails {
  id: string;
  appearance: string;
  foam: string;
  aroma: string;
  flavor: string;
  creaminess: string;
  aftertaste: string;
  drinkability: string;
  dryFinish: string;
  carbonation: string;
  idealOccasion: string;
  appearanceScore: number;
  foamScore: number;
  aromaScore: number;
  flavorScore: number;
  creaminessScore: number;
  aftertasteScore: number;
  drinkabilityScore: number;
  dryFinishScore: number;
  carbonationScore: number;
  perceptionScore: number;
  finalScore: number;
  createdAt: string;
  imageUrl?: string | null;
  beer: {
    name: string;
    brewery: {
      name: string;
    };
  };
}

export default function TastingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [tasting, setTasting] = useState<TastingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchTasting = async () => {
        try {
          const response = await fetch(`/api/tastings/${id}`);
          if (!response.ok) {
            throw new Error('Degustação não encontrada ou não autorizada.');
          }
          const data = await response.json();
          setTasting(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchTasting();
    }
  }, [id]);

  const confirmDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/tastings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Falha ao excluir a degustação.');
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false); // Apenas para de deletar se der erro
    }
    // O estado de isDeleting não precisa ser resetado em caso de sucesso, pois a página será redirecionada
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Carregando detalhes da degustação...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen"><p>Erro: {error}</p></div>;
  }

  if (!tasting) {
    return <div className="flex justify-center items-center min-h-screen"><p>Degustação não encontrada.</p></div>;
  }

  // Calcula a média das notas sensoriais para exibição
  const sensoryScores = [
    tasting.appearanceScore,
    tasting.foamScore,
    tasting.aromaScore,
    tasting.flavorScore,
    tasting.creaminessScore,
    tasting.aftertasteScore,
    tasting.drinkabilityScore,
    tasting.dryFinishScore,
    tasting.carbonationScore,
  ];
  const sensoryAverage = sensoryScores.reduce((acc, score) => acc + score, 0) / sensoryScores.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-amber-500">{tasting.beer.name}</h1>
            <p className="mt-1 text-xl text-gray-400">{tasting.beer.brewery.name}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" onClick={() => router.push(`/tastings/${id}/edit`)}>Editar</Button>
            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>Excluir</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente a sua degustação.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
                    {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => router.push('/')}>Voltar</Button>
          </div>
        </header>

        {tasting.imageUrl && (
          <div className="mb-8 bg-black/30 rounded-lg overflow-hidden shadow-2xl">
            <img 
              src={tasting.imageUrl} 
              alt={`Foto da cerveja ${tasting.beer.name}`} 
              className="w-full h-auto max-h-[600px] object-contain rounded-lg mx-auto"
            />
          </div>
        )}

        <main className="space-y-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-amber-500">Ficha de Degustação</CardTitle>
              <CardDescription>
                Avaliado em {new Date(tasting.createdAt).toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center p-6 bg-gray-900/70 rounded-lg">
                  <p className="text-7xl font-bold tracking-tighter">{tasting.finalScore.toFixed(1)}<span className="text-3xl text-gray-400">/10</span></p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-amber-500">Composição da Nota Final</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900/70 rounded-lg text-center">
                  <p className="font-semibold text-gray-300">Média Técnica</p>
                  <p className="text-3xl font-bold">{sensoryAverage.toFixed(1)}</p>
              </div>
              <div className="p-4 bg-gray-900/70 rounded-lg text-center">
                  <p className="font-semibold text-gray-300">Nota Pessoal</p>
                  <p className="text-3xl font-bold">{tasting.perceptionScore.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-amber-500">Avaliação Descritiva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({
                'Aparência': tasting.appearance,
                'Espuma': tasting.foam,
                'Aroma': tasting.aroma,
                'Sabor': tasting.flavor,
                'Cremosidade': tasting.creaminess,
                'Retrogosto': tasting.aftertaste,
                'Drinkability': tasting.drinkability,
                'Final Seco': tasting.dryFinish,
                'Carbonatação': tasting.carbonation,
                'Ocasião Ideal': tasting.idealOccasion,
              }).map(([label, value]) => value && (
                <div key={label}>
                  <h3 className="font-semibold text-lg text-amber-500">{label}</h3>
                  <p className="text-gray-300 whitespace-pre-wrap font-light">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-amber-500">Avaliação Sensorial</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries({
                'Aparência': tasting.appearanceScore,
                'Espuma': tasting.foamScore,
                'Aroma': tasting.aromaScore,
                'Sabor': tasting.flavorScore,
                'Cremosidade': tasting.creaminessScore,
                'Retrogosto': tasting.aftertasteScore,
                'Drinkability': tasting.drinkabilityScore,
                'Final Seco': tasting.dryFinishScore,
                'Carbonatação': tasting.carbonationScore,
              }).map(([label, score]) => score !== null && (
                <div key={label} className="p-4 bg-gray-900/70 rounded-lg text-center">
                  <p className="font-semibold text-gray-300">{label}</p>
                  <p className="text-2xl font-bold">{score}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
