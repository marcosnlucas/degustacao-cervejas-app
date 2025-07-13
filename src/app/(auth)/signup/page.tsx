'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { BeerIcon } from 'lucide-react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push('/login?signup=success');
      } else {
        const data = await response.json();
        setError(data.message || 'Falha ao criar conta. Tente novamente.');
      }
    } catch (error) {
      setError('Ocorreu um erro. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-amber-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-amber-500/10 p-3 rounded-full w-fit">
            <BeerIcon className="w-8 h-8 text-amber-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Crie sua Conta</CardTitle>
          <CardDescription className="text-gray-400">Junte-se à comunidade de mestres cervejeiros.</CardDescription>
        </CardHeader>
        <CardContent>
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
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar Senha"
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Conta'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-amber-500 hover:underline">
              Faça Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
