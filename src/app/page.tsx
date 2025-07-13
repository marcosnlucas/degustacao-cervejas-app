'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BeerIcon, PlusCircle, Star } from 'lucide-react';
import TastingCard from '@/components/TastingCard';
import TastingRankChart from '@/components/TastingRankChart';



interface Tasting {
  id: string;
  beer: {
    name: string;
    brewery: {
      name: string;
    };
  };
  perceptionScore: number;
  finalScore: number;
  createdAt: string;
  imageUrl?: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tastings, setTastings] = useState<Tasting[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    console.log('FRONTEND: Status da sessão mudou para:', status);
    if (status === 'unauthenticated') {
      console.log('FRONTEND: Usuário não autenticado, redirecionando para /login.');
      router.push('/login');
    } else if (status === 'authenticated') {
      console.log('FRONTEND: Usuário autenticado, buscando degustações.');
      const fetchTastings = async () => {
        console.log('FRONTEND: Iniciando busca por degustações...');
        setLoading(true);
        try {
          const response = await fetch('/api/tastings');
          console.log('FRONTEND: Resposta da API recebida. Status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log(`FRONTEND: ${data.length} degustações recebidas.`);
            setTastings(data);
          } else {
            const errorText = await response.text();
            console.error('FRONTEND: Falha ao buscar degustações. Resposta não OK.', { status: response.status, text: errorText });
          }
        } catch (error) {
          console.error('FRONTEND: Erro catastrófico ao buscar degustações.', error);
        } finally {
          console.log('FRONTEND: Finalizando estado de loading.');
          setLoading(false);
        }
      };
      fetchTastings();
    }
  }, [status, router]);

  



  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-amber-500">Carregando suas degustações...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-500 flex items-center gap-2">
            <BeerIcon />
            BeerTaster
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 hidden sm:block">{session.user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => signOut()} className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {tastings.length > 0 && (
          <TastingRankChart data={[...tastings].sort((a, b) => b.finalScore - a.finalScore)} />
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Minhas Degustações</h2>
          <Button onClick={() => router.push('/tastings/new')} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
            <PlusCircle size={18} />
            Nova Degustação
          </Button>
        </div>

        {tastings.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/50 rounded-lg">
            <h3 className="text-xl font-semibold">Nenhuma degustação encontrada.</h3>
            <p className="text-gray-400 mt-2">Que tal adicionar a primeira?</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tastings.map((tasting) => (
              <TastingCard key={tasting.id} tasting={tasting} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
