'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { BeerIcon } from 'lucide-react';

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setSuccess('Conta criada com sucesso! Faça o login para continuar.');
    }
    const errorParam = searchParams.get('error');
    if (errorParam === 'CredentialsSignin') {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } else {
      router.replace('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-amber-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-amber-500/10 p-3 rounded-full w-fit">
            <BeerIcon className="w-8 h-8 text-amber-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Bem-vindo de Volta!</CardTitle>
          <CardDescription className="text-gray-400">Acesse sua conta para continuar suas avaliações.</CardDescription>
        </CardHeader>
        <CardContent>
          {success && <p className="text-green-400 text-sm text-center mb-4 p-3 bg-green-900/50 rounded-md">{success}</p>}
          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Não tem uma conta?{' '}
            <Link href="/signup" className="font-medium text-amber-500 hover:underline">
              Cadastre-se
            </Link>
          </p>
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
