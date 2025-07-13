import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

// Função para normalizar nomes para servirem como chaves
const normalize = (name: string) => (name || '').trim().toLowerCase();

async function main() {
  console.log('Iniciando o script de seed aprimorado...');

  let user = await prisma.user.findUnique({
    where: { email: 'marcoslucas@gmail.com' },
  });

  if (!user) {
    console.log('Usuário padrão não encontrado. Criando usuário...');
    const hashedPassword = await bcrypt.hash('123456', 10); // Senha padrão para o usuário de seed
    user = await prisma.user.create({
      data: {
        email: 'marcoslucas@gmail.com',
        password: hashedPassword,
      },
    });
    console.log('Usuário padrão criado:', user.email);
  } else {
    console.log(`Usuário encontrado: ${user.email}. As degustações serão associadas a este usuário.`);
  }

  // 1. Limpar TODAS as degustações antigas para evitar conflitos de usuário
  console.log('Limpando todas as degustações antigas...');
  await prisma.tasting.deleteMany({});
  console.log(`Degustações antigas foram removidas.`);

  // 2. Ler o arquivo Excel
  const filePath = path.join(process.cwd(), 'cervejas.xlsx');
  const workbook = xlsx.readFile(filePath);
  
  const descriptionsSheet = workbook.Sheets['Ficha de degustação'];
  const scoresSheet = workbook.Sheets['Tabela sensorial'];

  if (!descriptionsSheet || !scoresSheet) {
    console.error('Não foi possível encontrar as abas necessárias na planilha. Verifique se a primeira aba e a aba `tabela sensorial` existem.');
    return;
  }

  const descriptionsData: any[][] = xlsx.utils.sheet_to_json(descriptionsSheet, { header: 1 });
  const scoresData: any[][] = xlsx.utils.sheet_to_json(scoresSheet, { header: 1 });

  // 3. Mapear notas para fácil acesso
  const scoresMap = new Map<string, any[]>();
  // Ignora o cabeçalho da planilha de notas (scoresData[0])
  for (let i = 1; i < scoresData.length; i++) {
    const row = scoresData[i];
    if (row && row[0]) {
      scoresMap.set(normalize(row[0]), row);
    }
  }

  console.log(`Encontradas ${descriptionsData.length} descrições e ${scoresMap.size} conjuntos de notas.`);

  // 4. Iterar sobre as descrições e criar as degustações
  for (const descRow of descriptionsData) {
    if (!descRow || !descRow[0]) continue;

    const beerFullName = descRow[0];
    const breweryName = descRow[1];
    const beerName = beerFullName.includes(' - ') ? beerFullName.split(' - ')[0].trim() : beerFullName.trim();

    if (!beerName || !breweryName) {
      console.warn(`Linha de descrição ignorada: ${descRow}`);
      continue;
    }

    // Encontra as notas correspondentes
    const scoreRow = scoresMap.get(normalize(beerFullName));

    console.log(`Processando: ${beerName} da ${breweryName}...`);

    try {
      await prisma.$transaction(async (tx) => {
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

        await tx.tasting.create({
          data: {
            userId: user.id,
            beerId: beer.id,
            appearance: descRow[2] || '',
            foam: descRow[3] || '',
            aroma: descRow[4] || '',
            flavor: descRow[5] || '',
            creaminess: descRow[6] || '',
            aftertaste: descRow[7] || '',
            drinkability: descRow[8] || '',
            dryFinish: descRow[9] || '',
            carbonation: descRow[10] || '',
            idealOccasion: descRow[11] || '',
            // Usa as notas da planilha ou 5 como padrão
            appearanceScore: scoreRow ? Number(scoreRow[1]) || 5 : 5,
            foamScore: scoreRow ? Number(scoreRow[2]) || 5 : 5,
            aromaScore: scoreRow ? Number(scoreRow[3]) || 5 : 5,
            flavorScore: scoreRow ? Number(scoreRow[4]) || 5 : 5,
            creaminessScore: scoreRow ? Number(scoreRow[5]) || 5 : 5,
            aftertasteScore: scoreRow ? Number(scoreRow[6]) || 5 : 5,
            drinkabilityScore: scoreRow ? Number(scoreRow[7]) || 5 : 5,
            dryFinishScore: scoreRow ? Number(scoreRow[8]) || 5 : 5,
            carbonationScore: scoreRow ? Number(scoreRow[9]) || 5 : 5,
            perceptionScore: scoreRow ? Number(scoreRow[10]) || 5 : 5,
          },
        });
      });
    } catch (error) {
      console.error(`Falha ao importar a cerveja ${beerName}:`, error);
    }
  }

  console.log('Script de seed aprimorado concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
