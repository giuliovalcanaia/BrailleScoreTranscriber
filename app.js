// =============================================================================
// 1. DICIONÁRIOS DE MUSICOGRAFIA BRAILLE E CIFRAS
// =============================================================================

const OCTAVAS = { 1: '⠈', 2: '⠘', 3: '⠸', 4: '⠐', 5: '⠨', 6: '⠰', 7: '⠠' };

const PAUSAS = {
  'whole': '⠍',
  'half': '⠥',
  'quarter': '⠧',
  'eighth': '⠦',
  '16th': '⠴',
};

const NOTAS = {
  'C': { 'whole': '⠽', 'half': '⠝', 'quarter': '⠹', 'eighth': '⠙', '16th': '⠽', '32nd': '⠝' },
  'D': { 'whole': '⠵', 'half': '⠕', 'quarter': '⠱', 'eighth': '⠑', '16th': '⠵', '32nd': '⠕' },
  'E': { 'whole': '⠯', 'half': '⠏', 'quarter': '⠫', 'eighth': '⠋', '16th': '⠯', '32nd': '⠏' },
  'F': { 'whole': '⠿', 'half': '⠟', 'quarter': '⠻', 'eighth': '⠛', '16th': '⠿', '32nd': '⠟' },
  'G': { 'whole': '⠷', 'half': '⠗', 'quarter': '⠳', 'eighth': '⠓', '16th': '⠷', '32nd': '⠗' },
  'A': { 'whole': '⠮', 'half': '⠎', 'quarter': '⠪', 'eighth': '⠊', '16th': '⠮', '32nd': '⠎' },
  'B': { 'whole': '⠾', 'half': '⠞', 'quarter': '⠺', 'eighth': '⠚', '16th': '⠾', '32nd': '⠞' },
};

const LETRAS_CIFRAS = {
  'C': '⠉', 'D': '⠙', 'E': '⠑', 'F': '⠋',
  'G': '⠛', 'A': '⠁', 'B': '⠃'
};

const SINAL_MAIUSCULA = '⠨';
const SINAL_MENOR = '⠍';

const NUMERADOR = {
  '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙',
  '5': '⠑', '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊'
};
const DENOMINADOR = { '2': '⠆', '4': '⠲', '8': '⠦', '16': '⠖' };
const CASAS = { '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙' };
const PONTO3 = '⠄';
const INICIO_REPEAT = '⠣⠆';
const FIM_REPEAT = '⠰⠜';
const BARRA_FINAL = '⠣⠅';
const SINAL_NUMERICO = '⠼';

// =============================================================================
// 2. UTILITÁRIOS
// =============================================================================

function removerAcentos(texto) {
  if (!texto) return 'Sem_Titulo';
  const normalizado = texto.normalize('NFKD');
  return normalizado.replace(/[\u0300-\u036f]/g, '').trim() || 'Sem_Titulo';
}

function indiceDiatonico(nota, oitava) {
  const escala = { C: 1, D: 2, E: 3, F: 4, G: 5, A: 6, B: 7 };
  return (oitava * 7) + escala[nota];
}

function precisaSinalOitava(notaAnt, oitavaAnt, notaAtual, oitavaAtual) {
  if (notaAnt === null || notaAnt === undefined) return true;
  const idxAnt = indiceDiatonico(notaAnt, oitavaAnt);
  const idxAtual = indiceDiatonico(notaAtual, oitavaAtual);
  const intervalo = Math.abs(idxAtual - idxAnt) + 1;
  if (intervalo <= 3) return false;
  else if (intervalo <= 5) return oitavaAnt !== oitavaAtual;
  else return true;
}

function notaTemPontos123(brailleChar) {
  if (!brailleChar || brailleChar.length === 0) return false;
  const c = brailleChar[0];
  const bits = c.codePointAt(0) - 0x2800;
  return (bits & 0b00000111) !== 0;
}

// =============================================================================
// 3. MOTOR DE PROCESSAMENTO XML
// =============================================================================

function getTag(parent, tagName) {
  const el = parent.getElementsByTagName(tagName);
  return el.length > 0 ? el[0] : null;
}

function getText(parent, tagName) {
  const el = getTag(parent, tagName);
  return el && el.textContent ? el.textContent : null;
}

function transcreverMusicXML(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  // Parse error check
  const parseError = doc.getElementsByTagName('parsererror');
  if (parseError.length > 0) {
    throw new Error('Erro ao analisar XML: arquivo inválido');
  }

  // Title
  const credits = doc.getElementsByTagName('credit');
  let tituloOriginal = 'Sem Titulo';
  for (let i = 0; i < credits.length; i++) {
    const creditWords = credits[i].getElementsByTagName('credit-words');
    if (creditWords.length > 0 && creditWords[0].textContent.trim()) {
      tituloOriginal = creditWords[0].textContent.trim();
      break;
    }
  }
  const workTitle = getTag(doc, 'work-title');
  if (workTitle && workTitle.textContent) {
    tituloOriginal = workTitle.textContent.trim();
  }
  const titulo = removerAcentos(tituloOriginal);

  // Key and Time signature
  let beats = '4', beatType = '4', fifths = 0;
  const attributes = getTag(doc, 'attributes');
  if (attributes) {
    const timeEl = getTag(attributes, 'time');
    if (timeEl) {
      const beatsEl = getTag(timeEl, 'beats');
      const beatTypeEl = getTag(timeEl, 'beat-type');
      if (beatsEl) beats = beatsEl.textContent;
      if (beatTypeEl) beatType = beatTypeEl.textContent;
    }
    const keyEl = getTag(attributes, 'key');
    if (keyEl) {
      const fifthsEl = getTag(keyEl, 'fifths');
      if (fifthsEl) fifths = parseInt(fifthsEl.textContent);
    }
  }

  // Key signature braille
  let armadura = '';
  if (fifths > 0) {
    armadura = '⠩'.repeat(fifths);
  } else if (fifths < 0) {
    armadura = '⠣'.repeat(Math.abs(fifths));
  }

  // Time signature braille
  const tempoBraille = SINAL_NUMERICO + (NUMERADOR[beats] || '?') + (DENOMINADOR[beatType] || '?');
  const cabecalhoBraille = (armadura + ' ' + tempoBraille).trim();

  // Get all measures
  const allMeasures = doc.getElementsByTagName('measure');
  const totalMeasures = allMeasures.length;

  // Find final bar (light-heavy)
  let indiceBarraFinal = totalMeasures;
  for (let i = 0; i < totalMeasures; i++) {
    const measure = allMeasures[i];
    const barlines = measure.getElementsByTagName('barline');
    for (let j = 0; j < barlines.length; j++) {
      const bs = getTag(barlines[j], 'bar-style');
      const rp = getTag(barlines[j], 'repeat');
      if (bs && bs.textContent === 'light-heavy') {
        if (!rp || rp.getAttribute('direction') !== 'backward') {
          indiceBarraFinal = i + 1;
          break;
        }
      }
    }
  }

  const measuresToProcess = [];
  for (let i = 0; i < indiceBarraFinal; i++) {
    measuresToProcess.push(allMeasures[i]);
  }

  // Process each measure
  const compassosBraille = [];
  const compassosCifras = [];
  let notaAnterior = null;
  let oitavaAnterior = null;
  let primeiroAposInicioRepeat = false;
  let primeiroAposBarraDupla = false;

  for (let m = 0; m < measuresToProcess.length; m++) {
    const measure = measuresToProcess[m];
    let compassoStr = '';
    let cifrasDoCompasso = '';
    let prefixoCompasso = '';
    let sufixoCompasso = '';

    const children = measure.children;
    for (let c = 0; c < children.length; c++) {
      const element = children[c];
      const tag = element.localName;

      // HARMONY
      if (tag === 'harmony') {
        const rootStep = getText(element, 'root-step');
        if (rootStep) {
          let cifraAtual = SINAL_MAIUSCULA + (LETRAS_CIFRAS[rootStep] || '?');
          const rootAlter = getText(element, 'root-alter');
          if (rootAlter === '1') cifraAtual += '⠩';
          else if (rootAlter === '-1') cifraAtual += '⠣';
          const kind = getText(element, 'kind');
          if (kind === 'minor') cifraAtual += SINAL_MENOR;
          if (cifrasDoCompasso) cifrasDoCompasso += ' ';
          cifrasDoCompasso += cifraAtual;
        }
      }
      // NOTE
      else if (tag === 'note') {
        const restEl = getTag(element, 'rest');
        const isRest = restEl !== null;
        const isDotted = getTag(element, 'dot') !== null;
        const tipoVal = getText(element, 'type');

        if (isRest) {
          const simboloPausa = (tipoVal && PAUSAS[tipoVal]) ? PAUSAS[tipoVal] : '⠍';
          compassoStr += simboloPausa;
          if (isDotted) compassoStr += PONTO3;
        } else {
          const pitch = getTag(element, 'pitch');
          if (pitch) {
            const step = getText(pitch, 'step');
            const octave = parseInt(getText(pitch, 'octave'));
            const dur = tipoVal || 'quarter';

            if (primeiroAposInicioRepeat || primeiroAposBarraDupla ||
              precisaSinalOitava(notaAnterior, oitavaAnterior, step, octave)) {
              compassoStr += (OCTAVAS[octave] || '');
              primeiroAposInicioRepeat = false;
              primeiroAposBarraDupla = false;
            }

            compassoStr += (NOTAS[step] && NOTAS[step][dur]) ? NOTAS[step][dur] : '?';
            if (isDotted) compassoStr += PONTO3;

            notaAnterior = step;
            oitavaAnterior = octave;
          }
        }
      }
      // BARLINE
      else if (tag === 'barline') {
        const repeat = getTag(element, 'repeat');
        const barStyle = getTag(element, 'bar-style');
        const ending = getTag(element, 'ending');

        if (ending && ending.getAttribute('type') === 'start') {
          const numCasa = ending.getAttribute('number') || '1';
          const brailleNum = CASAS[numCasa] || '⠁';
          prefixoCompasso = '⠩⠼' + brailleNum;
          primeiroAposInicioRepeat = true;
        }

        if (repeat && repeat.getAttribute('direction') === 'forward') {
          prefixoCompasso = INICIO_REPEAT;
          primeiroAposInicioRepeat = true;
        } else if (repeat && repeat.getAttribute('direction') === 'backward') {
          sufixoCompasso = FIM_REPEAT;
        } else if (barStyle && barStyle.textContent === 'light-heavy') {
          if (!repeat) {
            sufixoCompasso = BARRA_FINAL;
            primeiroAposBarraDupla = true;
          }
        }
      }
    }

    let conteudo = compassoStr;
    if (prefixoCompasso) {
      const primeiroChar = conteudo.length > 0 ? conteudo[0] : '';
      if (prefixoCompasso.includes('⠩⠼') && notaTemPontos123(primeiroChar)) {
        conteudo = PONTO3 + conteudo;
      }
      conteudo = prefixoCompasso + conteudo;
    }
    conteudo += sufixoCompasso;

    compassosBraille.push(conteudo);
    compassosCifras.push(cifrasDoCompasso);
  }

  // =============================================================================
  // 4. MONTAGEM DA SAÍDA FINAL
  // =============================================================================
  const saidaLinhas = [titulo, '', cabecalhoBraille, ''];

  for (let i = 0; i < compassosBraille.length; i += 4) {
    const grupoMusica = compassosBraille.slice(i, i + 4);
    const grupoCifras = compassosCifras.slice(i, i + 4);

    const temAcorde = grupoCifras.some(c => c.trim() !== '');

    if (temAcorde) {
      const linhaCifras = [];
      const linhaMusica = [];

      for (let j = 0; j < grupoMusica.length; j++) {
        const mMusica = grupoMusica[j] || '';
        const mCifra = grupoCifras[j] || '';
        const tamanhoMaximo = Math.max(mMusica.length, mCifra.length);
        linhaCifras.push(mCifra.padEnd(tamanhoMaximo));
        linhaMusica.push(mMusica.padEnd(tamanhoMaximo));
      }

      saidaLinhas.push('  ' + linhaCifras.join('  ').replace(/\s+$/, ''));
      saidaLinhas.push('  ' + linhaMusica.join('  ').replace(/\s+$/, ''));
    } else {
      let linha = '';
      for (let j = 0; j < grupoMusica.length; j++) {
        if (j > 0) linha += '  ';
        linha += grupoMusica[j] || '';
      }
      saidaLinhas.push('  ' + linha);
    }

    saidaLinhas.push('');
  }

  const saidaFinal = saidaLinhas.join('\n') + '\n';
  return saidaFinal;
}

// =============================================================================
// 4. INTERFACE
// =============================================================================

const fileInput = document.getElementById('fileInput');
const statusEl = document.getElementById('status');
const outputEl = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const legendBtn = document.getElementById('legendBtn');
const legendEl = document.getElementById('legend');

fileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  statusEl.className = 'status loading';
  statusEl.textContent = 'Processando...';
  outputEl.textContent = '';
  copyBtn.disabled = true;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const xmlString = event.target.result;
      const resultado = transcreverMusicXML(xmlString);
      outputEl.textContent = resultado;
      statusEl.className = 'status success';
      statusEl.textContent = 'Conversão concluída com sucesso!';
      copyBtn.disabled = false;
    } catch (err) {
      statusEl.className = 'status error';
      statusEl.textContent = 'Erro: ' + err.message;
      outputEl.textContent = '';
    }
  };
  reader.onerror = function() {
    statusEl.className = 'status error';
    statusEl.textContent = 'Erro ao ler o arquivo.';
  };
  reader.readAsText(file);
});

copyBtn.addEventListener('click', function() {
  const text = outputEl.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(function() {
    copyBtn.textContent = 'Copiado!';
    setTimeout(function() {
      copyBtn.textContent = 'Copiar';
    }, 2000);
  }).catch(function() {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    copyBtn.textContent = 'Copiado!';
    setTimeout(function() {
      copyBtn.textContent = 'Copiar';
    }, 2000);
  });
});

legendBtn.addEventListener('click', function() {
  legendEl.classList.toggle('hidden');
  if (legendEl.classList.contains('hidden')) {
    legendBtn.textContent = 'Mostrar Legenda';
  } else {
    legendBtn.textContent = 'Ocultar Legenda';
  }
});
