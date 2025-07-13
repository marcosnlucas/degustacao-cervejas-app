import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
  console.log('API UPLOAD: Rota de upload iniciada.');
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  console.log('API UPLOAD: Formulário de dados recebido.');
  if (!file) {
    return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' });
  }

  // Garante que o nome do arquivo é seguro para uso em um sistema de arquivos
  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
  const uniqueFilename = `${Date.now()}-${filename}`;
  console.log(`API UPLOAD: Arquivo recebido: ${file.name}`);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // O caminho onde a imagem será salva
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const path = join(uploadDir, uniqueFilename);

  try {
    // Garante que o diretório de upload exista
    await mkdir(uploadDir, { recursive: true });
    // Escreve o arquivo no diretório
    console.log(`API UPLOAD: Tentando escrever o arquivo em: ${path}`);
    await writeFile(path, buffer);

    console.log(`Arquivo salvo em: ${path}`);

    // Retorna a URL pública do arquivo
    const imageUrl = `/uploads/${uniqueFilename}`;
    return NextResponse.json({ success: true, url: imageUrl });

  } catch (error) {
    console.error('Erro ao salvar o arquivo:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor ao salvar o arquivo.' }, { status: 500 });
  }
}
