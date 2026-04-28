import xml.etree.ElementTree as ET
import glob
import sys
import unicodedata
import os

# =============================================================================
# 1. DICIONÁRIOS DE MUSICOGRAFIA BRAILLE E CIFRAS
#   Fonte: New International Manual of Braille Music Notation (1996)
# =============================================================================

OCTAVAS = {1: '⠈', 2: '⠘', 3: '⠸', 4: '⠐', 5: '⠨', 6: '⠰', 7: '⠠'}

PAUSAS = {
    'whole':    '⠍',
    'half':     '⠥',
    'quarter':  '⠧',
    'eighth':   '⠦',
    '16th':     '⠴',
}

NOTAS = {
    'C': {'whole': '⠽', 'half': '⠝', 'quarter': '⠹', 'eighth': '⠙', '16th': '⠊', '32nd': '⠑'},
    'D': {'whole': '⠵', 'half': '⠕', 'quarter': '⠱', 'eighth': '⠑', '16th': '⠚', '32nd': '⠋'},
    'E': {'whole': '⠯', 'half': '⠏', 'quarter': '⠫', 'eighth': '⠋', '16th': '⠛', '32nd': '⠓'},
    'F': {'whole': '⠿', 'half': '⠟', 'quarter': '⠻', 'eighth': '⠛', '16th': '⠓', '32nd': '⠊'},
    'G': {'whole': '⠷', 'half': '⠗', 'quarter': '⠳', 'eighth': '⠓', '16th': '⠊', '32nd': '⠚'},
    'A': {'whole': '⠮', 'half': '⠎', 'quarter': '⠪', 'eighth': '⠊', '16th': '⠚', '32nd': '⠙'},
    'B': {'whole': '⠾', 'half': '⠞', 'quarter': '⠺', 'eighth': '⠚', '16th': '⠙', '32nd': '⠑'},
}

# Dicionário para Cifras Literárias
LETRAS_CIFRAS = {
    'C': '⠉', 'D': '⠙', 'E': '⠑', 'F': '⠋',
    'G': '⠛', 'A': '⠁', 'B': '⠃'
}
SINAL_MAIUSCULA = '⠨'
SINAL_MENOR = '⠍'

NUMERADOR = {'1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙',
             '5': '⠑', '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊'}
DENOMINADOR = {'2': '⠆', '4': '⠲', '8': '⠦', '16': '⠖'}
CASAS = {'1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙'}
PONTO3 = '⠄'
INICIO_REPEAT = '⠣⠆'
FIM_REPEAT = '⠰⠜'
BARRA_FINAL = '⠣⠅'
SINAL_NUMERICO = '⠼'

# =============================================================================
# 2. UTILITÁRIOS
# =============================================================================


def imprimir_legenda_braille():
    legenda = """
======================================================================
         LEGENDA DOS SÍMBOLOS DA MUSICOGRAFIA BRAILLE
======================================================================

1. OITAVAS (Precedem a nota para indicar sua altura)
   1ª Oitava: ⠈      2ª Oitava: ⠘      3ª Oitava: ⠸      4ª Oitava: ⠐
   5ª Oitava: ⠨      6ª Oitava: ⠰      7ª Oitava: ⠠

2. PAUSAS (Silêncios)
   Semibreve (Inteira)  : ⠍      Mínima (Metade)      : ⠥
   Semínima (1/4)       : ⠧      Colcheia (1/8)       : ⠦
   Semicolcheia (1/16)  : ⠴

3. NOTAS E DURAÇÕES (Exemplo prático com a nota Dó / C)
   Na musicografia Braille, a altura da nota e sua duração estão no mesmo símbolo:
   Dó Semibreve (4T) : ⠽        Dó Mínima (2T)       : ⠝
   Dó Semínima (1T)  : ⠹        Dó Colcheia (1/2T)   : ⠙
   Dó Semicolch.     : ⠊        Dó Fusa              : ⠑
   * A lógica visual se adapta para D (Ré), E (Mi), F (Fá), G (Sol), A (Lá), B (Si).

4. CIFRAS, ACORDES E ARMADURA DE CLAVE
   Sinal de Maiúscula : ⠨ (Avisa que a letra a seguir é maiúscula)
   Notas de Cifra     : C:⠉ | D:⠙ | E:⠑ | F:⠋ | G:⠛ | A:⠁ | B:⠃
   Acorde Menor       : ⠍ (Acompanha a cifra, ex: Cm)
   Sustenido (#)      : ⠩ (Usado também para armaduras com sustenidos)
   Bemol (b)          : ⠣ (Usado também para armaduras com bemóis)

5. RITMO, COMPASSO E REPETIÇÕES
   Sinal Numérico     : ⠼ (Indica que os símbolos a seguir são números)
   Ponto de Aumento   : ⠄ (Aumenta a nota em metade de seu valor)
   Início Repetição   : ⠣⠆ (Ritornello para frente)
   Fim de Repetição   : ⠰⠜ (Ritornello para trás)
   Casas (Ex: Casa 1) : ⠩⠼⠁ (Indica o final alternativo da repetição)
   Barra Final        : ⠣⠅ (Fim da música)

======================================================================
"""
    print(legenda)


def remover_acentos(texto: str) -> str:
    if not texto:
        return "Sem_Titulo"
    normalizado = unicodedata.normalize("NFKD", texto)
    return normalizado.encode("ASCII", "ignore").decode("utf-8").strip()


def indice_diatonico(nota: str, oitava: int) -> int:
    escala = {'C': 1, 'D': 2, 'E': 3, 'F': 4, 'G': 5, 'A': 6, 'B': 7}
    return (oitava * 7) + escala[nota]


def precisa_sinal_oitava(nota_ant, oitava_ant, nota_atual, oitava_atual) -> bool:
    if nota_ant is None:
        return True
    idx_ant = indice_diatonico(nota_ant, oitava_ant)
    idx_atual = indice_diatonico(nota_atual, oitava_atual)
    intervalo = abs(idx_atual - idx_ant) + 1
    if intervalo <= 3:
        return False
    elif intervalo <= 5:
        return oitava_ant != oitava_atual
    else:
        return True


def nota_tem_pontos_123(braille_char: str) -> bool:
    if not braille_char:
        return False
    c = braille_char[0]
    bits = ord(c) - 0x2800
    return bool(bits & 0b00000111)

# =============================================================================
# 3. MOTOR DE PROCESSAMENTO XML
# =============================================================================


def transcrever_musicxml(caminho_arquivo: str) -> None:
    tree = ET.parse(caminho_arquivo)
    root = tree.getroot()

    el_titulo = root.find('.//work-title')
    titulo_original = el_titulo.text if el_titulo is not None else "Sem Titulo"
    titulo = remover_acentos(titulo_original)

    beats, beat_type, fifths = '4', '4', 0
    attr = root.find('.//attributes')
    if attr is not None:
        time = attr.find('time')
        if time is not None:
            beats = time.find('beats').text
            beat_type = time.find('beat-type').text
        key = attr.find('key')
        if key is not None:
            fifths = int(key.find('fifths').text)

    if fifths > 0:
        armadura = '⠩' * fifths
    elif fifths < 0:
        armadura = '⠣' * abs(fifths)
    else:
        armadura = ''

    tempo_braille = f"{SINAL_NUMERICO}{NUMERADOR.get(beats, '?')}{
        DENOMINADOR.get(beat_type, '?')}"
    cabecalho_braille = f"{armadura}{tempo_braille}".strip()

    compassos_braille = []
    compassos_cifras = []

    nota_anterior = None
    oitava_anterior = None
    primeiro_apos_inicio_repeat = False
    primeiro_apos_barra_dupla = False

    todos_os_compassos = root.findall('.//measure')
    indice_barra_final = len(todos_os_compassos)
    for idx_m, m in enumerate(todos_os_compassos):
        for bl in m.findall('barline'):
            bs = bl.find('bar-style')
            rp = bl.find('repeat')
            if bs is not None and bs.text == 'light-heavy':
                if rp is None or rp.get('direction') != 'backward':
                    indice_barra_final = idx_m + 1
                    break

    compassos_a_processar = todos_os_compassos[:indice_barra_final]

    for measure_idx, measure in enumerate(compassos_a_processar):
        compasso_str = ""
        cifras_do_compasso = ""
        prefixo_compasso = ""
        sufixo_compasso = ""

        for element in measure:

            # ── ACORDES / CIFRAS (HARMONY) ─────────────────────────────────
            if element.tag == 'harmony':
                root_step_el = element.find('root/root-step')
                if root_step_el is not None:
                    letra = root_step_el.text
                    cifra_atual = f"{SINAL_MAIUSCULA}{
                        LETRAS_CIFRAS.get(letra, '?')}"

                    alter_el = element.find('root/root-alter')
                    if alter_el is not None:
                        if alter_el.text == '1':
                            cifra_atual += "⠩"
                        elif alter_el.text == '-1':
                            cifra_atual += "⠣"

                    kind_el = element.find('kind')
                    if kind_el is not None and kind_el.text == 'minor':
                        cifra_atual += SINAL_MENOR

                    if cifras_do_compasso:
                        cifras_do_compasso += " "
                    cifras_do_compasso += cifra_atual

            # ── NOTAS E PAUSAS ─────────────────────────────────────────────
            elif element.tag == 'note':
                is_rest = element.find('rest') is not None
                is_dotted = element.find('dot') is not None
                el_tipo = element.find('type')
                tipo_val = el_tipo.text if el_tipo is not None else None

                if is_rest:
                    simbolo_pausa = PAUSAS.get(
                        tipo_val, '⠍') if tipo_val else '⠍'
                    compasso_str += simbolo_pausa
                    if is_dotted:
                        compasso_str += PONTO3
                else:
                    pitch = element.find('pitch')
                    if pitch is not None:
                        step = pitch.find('step').text
                        octave = int(pitch.find('octave').text)
                        dur = tipo_val if tipo_val else 'quarter'

                        if (primeiro_apos_inicio_repeat or primeiro_apos_barra_dupla or
                                precisa_sinal_oitava(nota_anterior, oitava_anterior, step, octave)):
                            compasso_str += OCTAVAS.get(octave, '')
                            primeiro_apos_inicio_repeat = False
                            primeiro_apos_barra_dupla = False

                        compasso_str += NOTAS[step].get(dur, '?')
                        if is_dotted:
                            compasso_str += PONTO3

                        nota_anterior = step
                        oitava_anterior = octave

            # ── BARLINES ───────────────────────────────────────────────────
            elif element.tag == 'barline':
                repeat = element.find('repeat')
                bar_style = element.find('bar-style')
                ending = element.find('ending')

                if ending is not None and ending.get('type') == 'start':
                    num_casa = ending.get('number', '1')
                    braille_num = CASAS.get(num_casa, '⠁')
                    sinal_casa = f"⠩⠼{braille_num}"
                    prefixo_compasso = sinal_casa
                    primeiro_apos_inicio_repeat = True

                if repeat is not None and repeat.get('direction') == 'forward':
                    prefixo_compasso = INICIO_REPEAT
                    primeiro_apos_inicio_repeat = True

                elif repeat is not None and repeat.get('direction') == 'backward':
                    sufixo_compasso = FIM_REPEAT

                elif bar_style is not None and bar_style.text == 'light-heavy':
                    if repeat is None:
                        sufixo_compasso = BARRA_FINAL
                        primeiro_apos_barra_dupla = True

        conteudo = compasso_str
        if prefixo_compasso:
            primeiro_char = conteudo[0] if conteudo else ''
            if '⠩⠼' in prefixo_compasso and nota_tem_pontos_123(primeiro_char):
                conteudo = PONTO3 + conteudo
            compasso_final = prefixo_compasso + conteudo
        else:
            compasso_final = conteudo

        compasso_final += sufixo_compasso

        compassos_braille.append(compasso_final)
        compassos_cifras.append(cifras_do_compasso)

    # ==========================================================================
    # 4. MONTAGEM DA SAÍDA FINAL (Com Alinhamento Preciso)
    # ==========================================================================
    saida_linhas = [titulo, "", cabecalho_braille, ""]

    for i in range(0, len(compassos_braille), 4):
        grupo_musica = compassos_braille[i:i+4]
        grupo_cifras = compassos_cifras[i:i+4]

        tem_acorde = any(cifra.strip() for cifra in grupo_cifras)

        if tem_acorde:
            linha_cifras = []
            linha_musica = []

            for m_musica, m_cifra in zip(grupo_musica, grupo_cifras):
                # Descobre o maior componente do bloco (música ou cifra)
                tamanho_maximo = max(len(m_musica), len(m_cifra))

                # Preenche AMBOS com espaços para garantir alinhamento idêntico
                linha_cifras.append(m_cifra.ljust(tamanho_maximo))
                linha_musica.append(m_musica.ljust(tamanho_maximo))

            # rstrip() remove os espaços sobressalentes do fim da linha global
            saida_linhas.append("  " + "  ".join(linha_cifras).rstrip())
            saida_linhas.append("  " + "  ".join(linha_musica).rstrip())
        else:
            # Se não tem acorde, imprime só a música sem padding extra
            saida_linhas.append("  " + "  ".join(grupo_musica))

        saida_linhas.append("")  # Linha extra

    saida_final = "\n".join(saida_linhas) + "\n"

    print(saida_final)

    pasta_saida = "TXT"
    os.makedirs(pasta_saida, exist_ok=True)
    nome_arquivo = os.path.join(pasta_saida, f"{titulo}.txt")
    with open(nome_arquivo, "w", encoding="utf-8") as f:
        f.write(saida_final)

    print("-" * 50)
    print(f"✓ Salvo em: '{nome_arquivo}'")


# =============================================================================
# 5. EXECUÇÃO
# =============================================================================
if __name__ == "__main__":
    # Imprime o guia de leitura para o usuário
    imprimir_legenda_braille()

    pasta_entrada = "XML"
    os.makedirs(pasta_entrada, exist_ok=True)
    padrao_busca = os.path.join(pasta_entrada, "*.xml")
    arquivos_xml = glob.glob(padrao_busca)

    if not arquivos_xml:
        print(f"Erro: Nenhum arquivo .xml encontrado em '{pasta_entrada}'.")
        sys.exit(1)

    print(f"Encontrados {len(arquivos_xml)} arquivo(s) para conversão.\n")
    print("=" * 50)

    for idx, arquivo in enumerate(arquivos_xml, 1):
        print(f"[{idx}/{len(arquivos_xml)}] Processando: {arquivo}")
        try:
            transcrever_musicxml(arquivo)
            print("✓ Concluído com sucesso.\n")
        except Exception as e:
            print(f"✗ Erro ao processar {arquivo}: {e}\n")
        print("-" * 30)

    print("=" * 50)
    print("Processamento finalizado!")
