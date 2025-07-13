import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = context.params;
    const tasting = await prisma.tasting.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        beer: {
          include: {
            brewery: true,
          },
        },
      },
    });

    if (!tasting) {
      return NextResponse.json({ error: 'Degustação não encontrada' }, { status: 404 });
    }

    return NextResponse.json(tasting, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar degustação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

const tastingUpdateSchema = z.object({
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
}).partial();

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = context.params;
    const validation = tastingUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { beerName, breweryName, ...tastingData } = validation.data;

    const existingTasting = await prisma.tasting.findUnique({
      where: { id: id, userId: session.user.id },
    });

    if (!existingTasting) {
      return NextResponse.json({ error: 'Degustação não encontrada' }, { status: 404 });
    }

    const dataForScoreCalculation = { ...existingTasting, ...tastingData };

    const sensoryScores = [
      dataForScoreCalculation.appearanceScore,
      dataForScoreCalculation.foamScore,
      dataForScoreCalculation.aromaScore,
      dataForScoreCalculation.flavorScore,
      dataForScoreCalculation.creaminessScore,
      dataForScoreCalculation.aftertasteScore,
      dataForScoreCalculation.drinkabilityScore,
      dataForScoreCalculation.dryFinishScore,
      dataForScoreCalculation.carbonationScore,
    ];
    const sensoryAverage = sensoryScores.reduce((acc, score) => acc + (score || 0), 0) / sensoryScores.length;
    const finalScore = (sensoryAverage + dataForScoreCalculation.perceptionScore) / 2;

    const updatedTasting = await prisma.$transaction(async (tx) => {
      let beerId: string | undefined = existingTasting.beerId;

      if (beerName && breweryName) {
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
        beerId = beer.id;
      }

      const tasting = await tx.tasting.update({
        where: { id: id, userId: session.user.id },
        data: {
          ...tastingData,
          finalScore,
          beerId: beerId,
        },
      });

      return tasting;
    });

    return NextResponse.json(updatedTasting, { status: 200 });

  } catch (error) {
    console.error('Erro ao atualizar degustação:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Erro de validação', details: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = context.params;

    await prisma.tasting.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Erro ao excluir degustação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
