/**
 * Gerador de "Pix Copia e Cola" (BR Code), no padrão EMV do Banco Central.
 *
 * Isso NÃO depende de nenhum gateway de pagamento — é só a montagem do
 * texto padronizado que qualquer app de banco brasileiro sabe ler. O que
 * ele NÃO faz é avisar automaticamente quando o pagamento cai na conta;
 * isso exigiria contratar um provedor (Mercado Pago, Efí, Asaas...) com
 * taxas e webhook próprios — o organizador confirma manualmente no
 * painel usando o código de referência (txid), o que facilita bater com
 * o extrato do banco.
 *
 * Referência: Manual de Padrões para Iniciação do Pix (Bacen), QR Code
 * no formato EMVCo.
 *
 * @typedef {Object} DadosPix
 * @property {string} chave - chave Pix do recebedor (CPF, e-mail, telefone ou aleatória)
 * @property {string} nomeRecebedor - até 25 caracteres (acentos são removidos automaticamente)
 * @property {string} cidade - até 15 caracteres
 * @property {number} [valor] - em reais, com centavos (ex: 45.9). Omitir = valor livre
 * @property {string} [identificador] - "txid", referência para conciliação (até 25 caracteres alfanuméricos)
 */

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, "") // só letras/números/espaço
    .trim();
}

/** Monta um campo TLV: ID (2 dígitos) + Tamanho (2 dígitos) + Valor */
function campo(id, valor) {
  const tamanho = valor.length.toString().padStart(2, "0");
  return `${id}${tamanho}${valor}`;
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF) — o checksum exigido pelo padrão EMV/Pix */
function crc16(payload) {
  let crc = 0xffff;
  const polinomio = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polinomio) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * @param {DadosPix} dados
 * @returns {string} o payload "Pix Copia e Cola" completo, pronto para virar QR Code
 */
export function gerarPayloadPix(dados) {
  const nome = normalizarTexto(dados.nomeRecebedor).slice(0, 25) || "RECEBEDOR";
  const cidade = normalizarTexto(dados.cidade).slice(0, 15) || "BRASIL";
  const identificador =
    (dados.identificador ?? "***").replace(/[^a-zA-Z0-9]/g, "").slice(0, 25) || "***";

  const merchantAccountInfo = campo("00", "br.gov.bcb.pix") + campo("01", dados.chave);

  let payload =
    campo("00", "01") + // Payload Format Indicator
    campo("26", merchantAccountInfo) + // Merchant Account Information (Pix)
    campo("52", "0000") + // Merchant Category Code
    campo("53", "986"); // Moeda: Real (BRL)

  if (dados.valor !== undefined && dados.valor > 0) {
    payload += campo("54", dados.valor.toFixed(2));
  }

  payload +=
    campo("58", "BR") + // País
    campo("59", nome) + // Nome do recebedor
    campo("60", cidade) + // Cidade do recebedor
    campo("62", campo("05", identificador)); // Additional Data Field (txid)

  // O campo do CRC (63) entra no cálculo já com seu próprio cabeçalho "6304"
  const payloadParaChecksum = `${payload}6304`;
  const checksum = crc16(payloadParaChecksum);

  return `${payloadParaChecksum}${checksum}`;
}

export function gerarCodigoInscricao() {
  // Código curto, fácil de digitar/falar por telefone, mas com baixa
  // chance de colisão para o volume de uma reunião de família.
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem O/0/I/1 (confusos)
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return codigo;
}
