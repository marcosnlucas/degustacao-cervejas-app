'use client';

import { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BeerIcon } from 'lucide-react';

function LoginComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-amber-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-amber-500/10 p-3 rounded-full w-fit">
            <BeerIcon className="w-8 h-8 text-amber-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Bem-vindo!</CardTitle>
          <CardDescription className="text-gray-400">Acesse com sua conta Google para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out"
          >
            Entrar com o Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}> 
      <LoginComponent />
    </Suspense>
  );
}
