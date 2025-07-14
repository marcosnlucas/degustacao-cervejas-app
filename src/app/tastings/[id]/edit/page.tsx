'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// Tipagem para os dados do formulário
interface FormData {
  beerName: string;
  breweryName: string;
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
  imageUrl: string | null;
  finalScore: number;
  [key: string]: any; // Para permitir acesso dinâmico às chaves de pontuação
}

export default function EditTastingPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const scoreLabels: { [key: string]: string } = {
    appearanceScore: 'Aparência',
    foamScore: 'Espuma',
    aromaScore: 'Aroma',
    flavorScore: 'Sabor',
    creaminessScore: 'Cremosidade',
    aftertasteScore: 'Retrogosto',
    drinkabilityScore: 'Drinkability',
    dryFinishScore: 'Final Seco',
    carbonationScore: 'Carbonatação',
  };

  useEffect(() => {
    if (id) {
      const fetchTasting = async () => {
        try {
          const response = await fetch(`/api/tastings/${id}`);
          if (!response.ok) {
            throw new Error('Degustação não encontrada ou não autorizada.');
          }
          const data = await response.json();
          const flatData = {
            ...data,
            beerName: data.beer.name,
            breweryName: data.beer.brewery ? data.beer.brewery.name : '', // Correção aqui
          };
          delete flatData.beer; // Remove o objeto aninhado
          setFormData(flatData);
          setCurrentImageUrl(data.imageUrl || null);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchTasting();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setCurrentImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSubmitting(true);
    setError('');
    setFieldErrors({});

    let imageUrl = formData.imageUrl;

    if (selectedFile) {
      setUploading(true);
      try {
        const uploadResponse = await fetch(
          `/api/upload?filename=${encodeURIComponent(selectedFile.name)}`,
          {
            method: 'POST',
            body: selectedFile,
          },
        );

        if (!uploadResponse.ok) {
          const errorResult = await uploadResponse.json();
          throw new Error(errorResult.error || 'Falha no upload da imagem.');
        }

        const newBlob = await uploadResponse.json();
        imageUrl = newBlob.url;
      } catch (err: any) {
        setError(err.message || 'Erro ao enviar a imagem.');
        setSubmitting(false);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      const finalData = { ...formData, imageUrl };
      const response = await fetch(`/api/tastings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.details) {
          setFieldErrors(errorData.details);
          throw new Error('Por favor, corrija os erros no formulário.');
        } else {
          throw new Error(errorData.error || 'Falha ao atualizar a degustação.');
        }
      }
      router.push('/');
      router.refresh(); // Atualiza os dados da página inicial
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta degustação? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch(`/api/tastings/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao excluir a degustação.');
        }
        router.push('/');
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="text-center p-10">Carregando degustação...</div>;
  if (!formData) return <div className="text-center p-10">Degustação não encontrada.</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <header className="flex items-center justify-between pb-6 border-b flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Editar Degustação</h1>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting || uploading}>
              {uploading ? 'Enviando...' : (submitting ? 'Salvando...' : 'Salvar Alterações')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>Excluir</Button>
          </div>
        </header>

        {error && <p className="text-red-500 text-center py-2">{error}</p>}

        <Card>
          <CardHeader><CardTitle>Informações da Cerveja</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="beerName">Nome da Cerveja</Label>
              <Input id="beerName" value={formData.beerName} onChange={handleChange} required className={fieldErrors.beerName ? 'border-red-500' : ''} />
              {fieldErrors.beerName && <p className="text-red-500 text-xs mt-1">{fieldErrors.beerName[0]}</p>}
            </div>
            <div>
              <Label htmlFor="breweryName">Cervejaria</Label>
              <Input id="breweryName" value={formData.breweryName} onChange={handleChange} required className={fieldErrors.breweryName ? 'border-red-500' : ''} />
              {fieldErrors.breweryName && <p className="text-red-500 text-xs mt-1">{fieldErrors.breweryName[0]}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Foto da Cerveja</CardTitle>
            <CardDescription>Envie uma nova foto para atualizar a existente.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {currentImageUrl && <img src={currentImageUrl} alt="Prévia da cerveja" className="w-48 h-48 object-cover rounded-lg border" />}
            <Input id="file" type="file" onChange={handleFileChange} className="file:text-white" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise Sensorial</CardTitle>
            <CardDescription>Descreva suas percepções sobre a cerveja.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2"><Label htmlFor="appearance">Aparência</Label><Textarea id="appearance" value={formData.appearance} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="foam">Espuma</Label><Textarea id="foam" value={formData.foam} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="aroma">Aroma</Label><Textarea id="aroma" value={formData.aroma} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="flavor">Sabor</Label><Textarea id="flavor" value={formData.flavor} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="creaminess">Cremosidade</Label><Textarea id="creaminess" value={formData.creaminess} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="aftertaste">Retrogosto</Label><Textarea id="aftertaste" value={formData.aftertaste} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="drinkability">Drinkability</Label><Textarea id="drinkability" value={formData.drinkability} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="dryFinish">Final Seco</Label><Textarea id="dryFinish" value={formData.dryFinish} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="carbonation">Carbonatação</Label><Textarea id="carbonation" value={formData.carbonation} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="idealOccasion">Ocasião Ideal</Label><Textarea id="idealOccasion" value={formData.idealOccasion} onChange={handleChange} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avaliação Sensorial (0-10)</CardTitle>
            <CardDescription>Dê notas para cada característica.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {Object.keys(scoreLabels).map(key => (
              <div className="space-y-2" key={key}>
                <Label htmlFor={key}>{scoreLabels[key]}</Label>
                <Input id={key} type="number" min="0" max="10" value={formData[key]} onChange={handleChange} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Nota Final</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="perceptionScore">Nota de Percepção (0-10)</Label>
              <Input id="perceptionScore" type="number" min="0" max="10" step="0.1" value={formData.perceptionScore} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

      </form>
    </div>
  );
}
