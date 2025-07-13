import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log('API ROTA: /api/tastings (GET) foi chamada.');

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    console.error('API ROTA: Não autorizado. Sessão não encontrada ou sem ID de usuário.');
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  console.log(`API ROTA: Sessão encontrada para o usuário ID: ${session.user.id}`);

  try {
    console.log('API ROTA: Buscando degustações no banco de dados...');
    const tastings = await prisma.tasting.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        beer: {
          select: {
            name: true,
            brewery: {
              select: {
                name: true,
              },
            },
          },
        },
        finalScore: true,
        createdAt: true,
        imageUrl: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`API ROTA: ${tastings.length} degustações encontradas. Enviando resposta.`);
    return NextResponse.json(tastings, { status: 200 });

  } catch (error) {
    console.error('API ROTA: Erro ao buscar degustações:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

const tastingSchema = z.object({
  beerName: z.string().min(1, 'Nome da cerveja é obrigatório.'),
  breweryName: z.string().min(1, 'Nome da cervejaria é obrigatório.'),
  appearance: z.string().optional(),
  foam: z.string().optional(),
  aroma: z.string().optional(),
  flavor: z.string().optional(),
  creaminess: z.string().optional(),
  aftertaste: z.string().optional(),
  drinkability: z.string().optional(),
  dryFinish: z.string().optional(),
  carbonation: z.string().optional(),
  idealOccasion: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  appearanceScore: z.coerce.number().min(0).max(10),
  foamScore: z.coerce.number().min(0).max(10),
  aromaScore: z.coerce.number().min(0).max(10),
  flavorScore: z.coerce.number().min(0).max(10),
  creaminessScore: z.coerce.number().min(0).max(10),
  aftertasteScore: z.coerce.number().min(0).max(10),
  drinkabilityScore: z.coerce.number().min(0).max(10),
  dryFinishScore: z.coerce.number().min(0).max(10),
  carbonationScore: z.coerce.number().min(0).max(10),
  perceptionScore: z.coerce.number().min(0).max(10),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const validation = tastingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { beerName, breweryName, ...tastingData } = validation.data;

    // Lógica para calcular a nota final
    const sensoryScores = [
      tastingData.appearanceScore,
      tastingData.foamScore,
      tastingData.aromaScore,
      tastingData.flavorScore,
      tastingData.creaminessScore,
      tastingData.aftertasteScore,
      tastingData.drinkabilityScore,
      tastingData.dryFinishScore,
      tastingData.carbonationScore,
    ];
    const sensoryAverage = sensoryScores.reduce((acc, score) => acc + score, 0) / sensoryScores.length;
    const finalScore = (sensoryAverage + tastingData.perceptionScore) / 2;

        const newTasting = await prisma.$transaction(async (tx) => {
      const brewery = await tx.brewery.upsert({
        where: { name: breweryName },
        update: {},
        create: { name: breweryName },
      });

      const beer = await tx.beer.upsert({
        where: { name_breweryId: { name: beerName, breweryId: brewery.id } },
        update: {},
        create: { name: beerName, breweryId: brewery.id },
      });

      const tasting = await tx.tasting.create({
        data: {
          // Campos de texto (com fallback para string vazia ou null)
          appearance: tastingData.appearance || '',
          foam: tastingData.foam || '',
          aroma: tastingData.aroma || '',
          flavor: tastingData.flavor || '',
          creaminess: tastingData.creaminess || '',
          aftertaste: tastingData.aftertaste || '',
          drinkability: tastingData.drinkability || '',
          dryFinish: tastingData.dryFinish || '',
          carbonation: tastingData.carbonation || '',
          idealOccasion: tastingData.idealOccasion || null,
          imageUrl: tastingData.imageUrl || null,

          // Scores numéricos
          appearanceScore: tastingData.appearanceScore,
          foamScore: tastingData.foamScore,
          aromaScore: tastingData.aromaScore,
          flavorScore: tastingData.flavorScore,
          creaminessScore: tastingData.creaminessScore,
          aftertasteScore: tastingData.aftertasteScore,
          drinkabilityScore: tastingData.drinkabilityScore,
          dryFinishScore: tastingData.dryFinishScore,
          carbonationScore: tastingData.carbonationScore,
          perceptionScore: tastingData.perceptionScore,
          
          // Nota final calculada
          finalScore: finalScore,

          // Relacionamentos
          userId: user.id,
          beerId: beer.id,
        },
      });

      return tasting;
    });

    return NextResponse.json(newTasting, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar degustação:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Erro de validação', details: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
