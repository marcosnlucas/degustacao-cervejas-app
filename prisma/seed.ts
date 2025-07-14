import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

const USER_EMAIL = 'marcoslucas@gmail.com';

async function main() {
  console.log(`Iniciando o processo de seed para o usuário: ${USER_EMAIL}...`);

  const user = await prisma.user.findUnique({ where: { email: USER_EMAIL } });

  if (!user) {
    console.error(`Erro: Usuário com o e-mail ${USER_EMAIL} não encontrado.`);
    return;
  }
  console.log(`Usuário encontrado: ${user.name} (ID: ${user.id})`);

  const filePath = path.join(__dirname, '..', 'Cervejas.xlsx');
  console.log(`Lendo a planilha em: ${filePath}`);
  const workbook = XLSX.readFile(filePath);

  // Assumindo que a primeira aba tem as descrições e a segunda as notas
  const descriptionsSheet = workbook.Sheets[workbook.SheetNames[0]];
  const scoresSheet = workbook.Sheets[workbook.SheetNames[1]];

  const descriptionsData = XLSX.utils.sheet_to_json(descriptionsSheet, { cellDates: true });
  const scoresData = XLSX.utils.sheet_to_json(scoresSheet);

  console.log(`Encontradas ${descriptionsData.length} linhas de descrição e ${scoresData.length} linhas de notas.`);

  // Criar um mapa de notas para fácil acesso, usando Cerveja+Cervejaria como chave
  const scoresMap = new Map();
  for (const scoreRow of scoresData as any[]) {
    const key = `${scoreRow['Cerveja']?.trim()}-${scoreRow['Cervejaria']?.trim()}`;
    scoresMap.set(key, scoreRow);
  }

  for (const descRow of descriptionsData as any[]) {
    const beerName = descRow['Cerveja']?.trim();
    const breweryName = descRow['Cervejaria']?.trim();

    if (!breweryName || !beerName) {
      console.warn('Linha de descrição ignorada por falta de Cervejaria ou Cerveja:', descRow);
      continue;
    }

    const key = `${beerName}-${breweryName}`;
    const scoreRow = scoresMap.get(key);

    if (!scoreRow) {
      console.warn(`Notas não encontradas para a cerveja: ${beerName} da ${breweryName}. Pulando.`);
      continue;
    }

    try {
      let brewery = await prisma.brewery.findUnique({ where: { name: breweryName } });
      if (!brewery) {
        brewery = await prisma.brewery.create({ data: { name: breweryName } });
        console.log(`Cervejaria criada: ${brewery.name}`);
      }

      // Encontra ou cria a cerveja
      let beer = await prisma.beer.findFirst({
        where: {
          name: beerName,
          breweryId: brewery.id,
        },
      });
      if (!beer) {
        beer = await prisma.beer.create({
          data: {
            name: beerName,
            style: descRow['Estilo']?.toString() || '',
            breweryId: brewery.id,
          },
        });
        console.log(`Cerveja criada: ${beer.name}`);
      }

      // Cria a degustação, associando ao usuário, cerveja e cervejaria
      const tastingData = {
        userId: user.id,
        beerId: beer.id,
        
        
        // Colunas Descritivas (da primeira aba)
        appearance: descRow['Aparência']?.toString() || '',
        foam: descRow['Espuma']?.toString() || '',
        creaminess: descRow['Cremosidade']?.toString() || '',
        carbonation: descRow['Carbonatação']?.toString() || '',
        idealOccasion: descRow['Ocasião Ideal']?.toString() || null,

        // Colunas Descritivas (da segunda aba, conforme listado pelo usuário)
        aroma: scoreRow['Aromas']?.toString() || '',
        flavor: scoreRow['Sabor']?.toString() || '',
        aftertaste: scoreRow['Retrogosto']?.toString() || '',
        drinkability: scoreRow['Drinkability']?.toString() || '',
        dryFinish: scoreRow['Final Seco']?.toString() || '',
        
        // Colunas de Notas (da segunda aba)
        appearanceScore: parseInt(scoreRow['Aparência']) || 0,
        foamScore: parseInt(scoreRow['Espuma']) || 0,
        aromaScore: parseInt(scoreRow['Aromas']) || 0,
        flavorScore: parseInt(scoreRow['Sabor']) || 0,
        creaminessScore: parseInt(scoreRow['Cremoso']) || 0, // 'Cremoso' para a nota
        aftertasteScore: parseInt(scoreRow['Retrogosto']) || 0,
        drinkabilityScore: parseInt(scoreRow['Drinkability']) || 0,
        dryFinishScore: parseInt(scoreRow['Final Seco']) || 0,
        carbonationScore: parseInt(scoreRow['Carbonatação']) || 0,
        perceptionScore: parseFloat(scoreRow['Nota de Percepção']) || 0,
        finalScore: 0, // Ignorando 'Média Final'
      };

      await prisma.tasting.create({ data: tastingData });
      console.log(`Degustação criada para: ${beerName}`);

    } catch (error) {
      console.error(`Erro ao processar a linha:`, descRow);
      console.error(error);
    }
  }

  console.log('Processo de seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

