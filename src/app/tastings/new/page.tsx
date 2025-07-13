'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const initialFormData = {
  beerName: '', breweryName: '', 
  appearance: '', foam: '', aroma: '', flavor: '', creaminess: '', aftertaste: '', drinkability: '', dryFinish: '', carbonation: '', idealOccasion: '',
  appearanceScore: '', foamScore: '', aromaScore: '', flavorScore: '', creaminessScore: '', aftertasteScore: '', drinkabilityScore: '', dryFinishScore: '', carbonationScore: '',
  perceptionScore: ''
};

export default function NewTastingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors({});

    let imageUrl = '';

    if (selectedFile) {
      setUploading(true);
      try {
        const fileData = new FormData();
        fileData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: fileData,
        });

        const result = await uploadResponse.json();
        if (!result.success) {
          throw new Error('Falha no upload da imagem.');
        }
        const fullUrl = `${window.location.origin}${result.url}`;
        imageUrl = fullUrl;
      } catch (err: any) {
        setError(err.message || 'Erro ao enviar a imagem.');
        setUploading(false);
        setSubmitting(false); // Garante que o estado de submissão seja resetado
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
            const scores = [
        'appearanceScore', 'foamScore', 'aromaScore', 'flavorScore', 'creaminessScore',
        'aftertasteScore', 'drinkabilityScore', 'dryFinishScore', 'carbonationScore', 'perceptionScore'
      ];

      const numericFormData: { [key: string]: any } = { ...formData };
      scores.forEach(score => {
        // Garante que o valor seja tratado como número, convertendo string vazia ou nula para 0.
        numericFormData[score] = parseFloat(numericFormData[score] || '0');
      });

            const optionalTextFields = [
        'appearance', 'foam', 'aroma', 'flavor', 'creaminess', 'aftertaste',
        'drinkability', 'dryFinish', 'carbonation', 'idealOccasion'
      ];

      const finalData = { ...numericFormData };

      optionalTextFields.forEach(field => {
        if (!finalData[field]) {
          delete finalData[field];
        }
      });

      if (imageUrl) {
        finalData.imageUrl = imageUrl;
      } else {
        delete finalData.imageUrl; 
      }

      const response = await fetch('/api/tastings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('API Error Details:', errorData.details);
        if (response.status === 400 && errorData.details) {
          setFieldErrors(errorData.details);
          setError('Por favor, corrija os erros no formulário.');
          return;
        } else {
          setError(errorData.error || 'Falha ao criar a degustação.');
          return;
        }
      }

      router.push('/');
    } catch (err: any) {
      // Este catch agora é para erros inesperados, como falha de rede.
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between pb-6 border-b">
        <h1 className="text-3xl font-bold">Nova Degustação</h1>
        <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Cerveja</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="beerName">Nome da Cerveja</Label>
              <Input id="beerName" name="beerName" value={formData.beerName} onChange={handleChange} placeholder="Ex: Cerveja IPA" required className={fieldErrors.beerName ? 'border-red-500' : ''} />
              {fieldErrors.beerName && <p className="text-red-500 text-xs mt-1">{fieldErrors.beerName[0]}</p>}
            </div>
            <div>
              <Label htmlFor="breweryName">Cervejaria</Label>
              <Input id="breweryName" name="breweryName" value={formData.breweryName} onChange={handleChange} placeholder="Ex: Cervejaria do Zé" required className={fieldErrors.breweryName ? 'border-red-500' : ''} />
              {fieldErrors.breweryName && <p className="text-red-500 text-xs mt-1">{fieldErrors.breweryName[0]}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Foto da Cerveja</CardTitle>
            <CardDescription>Adicione uma imagem para a sua degustação.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input id="file" type="file" onChange={handleFileChange} className="file:text-white" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise Sensorial</CardTitle>
            <CardDescription>Descreva suas percepções sobre a cerveja.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="appearance">Aparência</Label>
              <Textarea id="appearance" value={formData.appearance} onChange={handleChange} placeholder="Cor, turbidez, brilho." />

            </div>
            <div className="space-y-2">
              <Label htmlFor="foam">Espuma</Label>
              <Textarea id="foam" value={formData.foam} onChange={handleChange} placeholder="Formação, retenção, cor." />

            </div>
            <div className="space-y-2">
              <Label htmlFor="aroma">Aroma</Label>
              <Textarea id="aroma" value={formData.aroma} onChange={handleChange} placeholder="Notas de malte, lúpulo, frutado." />

            </div>
            <div className="space-y-2">
              <Label htmlFor="flavor">Sabor</Label>
              <Textarea id="flavor" value={formData.flavor} onChange={handleChange} placeholder="Doçura, amargor, acidez." />

            </div>
            <div className="space-y-2">
              <Label htmlFor="creaminess">Cremosidade</Label>
              <Textarea id="creaminess" value={formData.creaminess} onChange={handleChange} placeholder="Corpo da cerveja, sensação na boca." />

            </div>
            <div className="space-y-2">
              <Label htmlFor="aftertaste">Retrogosto</Label>
              <Textarea id="aftertaste" value={formData.aftertaste} onChange={handleChange} placeholder="Persistência, notas finais." />

            </div>
            <div className="space-y-2">
              <Label htmlFor="drinkability">Drinkability</Label>
              <Textarea id="drinkability" value={formData.drinkability} onChange={handleChange} placeholder='Facilidade de beber, "refrescância".' />

            </div>
            <div className="space-y-2">
              <Label htmlFor="dryFinish">Final Seco</Label>
              <Textarea id="dryFinish" value={formData.dryFinish} onChange={handleChange} placeholder="Sensação seca no final." />

            </div>
            <div className="space-y-2">
              <Label htmlFor="carbonation">Carbonatação</Label>
              <Textarea id="carbonation" value={formData.carbonation} onChange={handleChange} placeholder="Nível de gás, bolhas." />

            </div>
            <div className="space-y-2">
              <Label htmlFor="idealOccasion">Ocasião Ideal</Label>
              <Textarea id="idealOccasion" value={formData.idealOccasion} onChange={handleChange} placeholder="Harmonização, momento para beber." />

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avaliação Sensorial (0-10)</CardTitle>
            <CardDescription>Dê notas para cada característica.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            <div className="space-y-2">
              <Label htmlFor="appearanceScore">Aparência</Label>
              <Input id="appearanceScore" name="appearanceScore" type="number" min="0" max="10" value={formData.appearanceScore} onChange={handleChange} className={fieldErrors.appearanceScore ? 'border-red-500' : ''} />
              {fieldErrors.appearanceScore && <p className="text-red-500 text-xs mt-1">{fieldErrors.appearanceScore[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="foamScore">Espuma</Label>
              <Input id="foamScore" name="foamScore" type="number" min="0" max="10" value={formData.foamScore} onChange={handleChange} className={fieldErrors.foamScore ? 'border-red-500' : ''} />
              {fieldErrors.foamScore && <p className="text-red-500 text-xs mt-1">{fieldErrors.foamScore[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="aromaScore">Aroma</Label>
              <Input id="aromaScore" name="aromaScore" type="number" min="0" max="10" value={formData.aromaScore} onChange={handleChange} className={fieldErrors.aromaScore ? 'border-red-500' : ''} />
              {fieldErrors.aromaScore && <p className="text-red-500 text-xs mt-1">{fieldErrors.aromaScore[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="flavorScore">Sabor</Label>
              <Input id="flavorScore" name="flavorScore" type="number" min="0" max="10" value={formData.flavorScore} onChange={handleChange} className={fieldErrors.flavorScore ? 'border-red-500' : ''} />
              {fieldErrors.flavorScore && <p className="text-red-500 text-xs mt-1">{fieldErrors.flavorScore[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="creaminessScore">Cremosidade</Label>
              <Input id="creaminessScore" name="creaminessScore" type="number" min="0" max="10" value={formData.creaminessScore} onChange={handleChange} className={fieldErrors.creaminessScore ? 'border-red-500' : ''} />
              {fieldErrors.creaminessScore && <p className="text-red-500 text-xs mt-1">{fieldErrors.creaminessScore[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="aftertasteScore">Retrogosto</Label>
              <Input id="aftertasteScore" name="aftertasteScore" type="number" min="0" max="10" value={formData.aftertasteScore} onChange={handleChange} className={fieldErrors.aftertasteScore ? 'border-red-500' : ''} />
              {fieldErrors.aftertasteScore && <p className="text-red-500 text-xs mt-1">{fieldErrors.aftertasteScore[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="drinkabilityScore">Drinkability</Label>
              <Input id="drinkabilityScore" name="drinkabilityScore" type="number" min="0" max="10" value={formData.drinkabilityScore} onChange={handleChange} className={fieldErrors.drinkabilityScore ? 'border-red-500' : ''} />
              {fieldErrors.drinkabilityScore && <p className="text-red-500 text-xs mt-1">{fieldErrors.drinkabilityScore[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dryFinishScore">Final Seco</Label>
              <Input id="dryFinishScore" name="dryFinishScore" type="number" min="0" max="10" value={formData.dryFinishScore} onChange={handleChange} className={fieldErrors.dryFinishScore ? 'border-red-500' : ''} />
              {fieldErrors.dryFinishScore && <p className="text-red-500 text-xs mt-1">{fieldErrors.dryFinishScore[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbonationScore">Carbonatação</Label>
              <Input id="carbonationScore" name="carbonationScore" type="number" min="0" max="10" value={formData.carbonationScore} onChange={handleChange} className={fieldErrors.carbonationScore ? 'border-red-500' : ''} />
              {fieldErrors.carbonationScore && <p className="text-red-500 text-xs mt-1">{fieldErrors.carbonationScore[0]}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nota Final</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="perceptionScore">Nota de Percepção (0-10)</Label>
              <Input id="perceptionScore" name="perceptionScore" type="number" min="0" max="10" step="0.1" value={formData.perceptionScore} onChange={handleChange} placeholder="Sua nota pessoal para a cerveja" className={fieldErrors.perceptionScore ? 'border-red-500' : ''} />
              {fieldErrors.perceptionScore && <p className="text-red-500 text-xs mt-1">{fieldErrors.perceptionScore[0]}</p>}
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting || uploading}>
            {uploading ? 'Enviando imagem...' : (submitting ? 'Salvando...' : 'Salvar Degustação')}
          </Button>
        </div>
      </form>
    </div>
  );
}
