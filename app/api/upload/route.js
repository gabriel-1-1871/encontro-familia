import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const arquivo = formData.get('arquivo')
    const pasta = String(formData.get('pasta') || 'geral').replace(/[^a-z0-9-]/gi, '') || 'geral'

    if (!arquivo || typeof arquivo === 'string') {
      return NextResponse.json({ erro: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    const extensao = (arquivo.name || 'arquivo').split('.').pop()
    const nomeArquivo = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extensao}`

    const supabase = supabaseAdmin()
    const bytes = await arquivo.arrayBuffer()

    const { error } = await supabase.storage
      .from('fotos-encontro')
      .upload(nomeArquivo, bytes, { contentType: arquivo.type })

    if (error) {
      // As mensagens mais comuns aqui e o que elas normalmente significam:
      //  - "Bucket not found" -> o bucket "fotos-encontro" ainda não foi
      //    criado no Supabase (Storage > New bucket).
      //  - "The resource already exists" -> colisão de nome, tente de novo.
      //  - "new row violates row-level security policy" -> a
      //    SUPABASE_SERVICE_ROLE_KEY configurada não é a "service_role"
      //    de verdade (foi colada a "anon" por engano).
      let dica = ''
      if (/bucket.*not.*found/i.test(error.message)) {
        dica = ' Verifique em Supabase > Storage se o bucket "fotos-encontro" existe e está marcado como Public.'
      } else if (/row-level security/i.test(error.message)) {
        dica = ' Verifique se a variável SUPABASE_SERVICE_ROLE_KEY está com a chave "service_role" (não a "anon").'
      }
      return NextResponse.json({ erro: `Falha ao enviar imagem: ${error.message}.${dica}` }, { status: 500 })
    }

    const { data } = supabase.storage.from('fotos-encontro').getPublicUrl(nomeArquivo)
    return NextResponse.json({ url: data.publicUrl })
  } catch (erroInesperado) {
    return NextResponse.json(
      { erro: 'Falha inesperada ao enviar a imagem: ' + erroInesperado.message },
      { status: 500 }
    )
  }
}
