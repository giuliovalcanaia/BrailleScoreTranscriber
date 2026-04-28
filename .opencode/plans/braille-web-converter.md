# Plan: MusicXML to Braille Web Converter

## Files to Create

### 1. `index.html`
- File upload input for .xml/.musicxml files
- Status display area (loading/error/success)
- Output section with `<pre>` for braille display + copy button
- Collapsible braille legend with all symbols

### 2. `style.css`
- Dark theme UI with centered layout
- Monospace font for braille output (Segoe UI Symbol)
- Styled file upload area with dashed border
- Responsive grid for legend symbols

### 3. `app.js` — Full algorithm port from main.py

#### Dictionaries (identical to Python):
- OCTAVAS, PAUSAS, NOTAS, LETRAS_CIFRAS
- SINAL_MAIUSCULA, SINAL_MENOR
- NUMERADOR, DENOMINADOR, CASAS, PONTO3
- INICIO_REPEAT, FIM_REPEAT, BARRA_FINAL, SINAL_NUMERICO

#### Utility functions:
- `removerAcentos(text)` — remove accents (Unicode NFKD → ASCII)
- `indiceDiatonico(nota, oitava)` — diatonic index calculation
- `precisaSinalOitava(notaAnt, oitavaAnt, notaAtual, oitavaAtual)` — octave signal logic
- `notaTemPontos123(brailleChar)` — detect dots-1-2-3 braille chars

#### Core conversion — `transcreverMusicXML(xmlString)`:
1. Parse XML with DOMParser
2. Extract title from `<credit>` or `<work-title>`
3. Extract key signature (fifths), time signature (beats, beat-type) from `<attributes>`
4. Build header: key signature + time signature in braille
5. Iterate all `<measure>` elements:
   - Process `<harmony>` → chord symbols (cifras)
   - Process `<note>` → notes/rests with octave signals
   - Process `<barline>` → repeats, endings, final bar
6. Track: nota_anterior, oitava_anterior, primeiro_apos_inicio_repeat, primeiro_apos_barra_dupla
7. Find final bar (light-heavy style) to trim measures
8. Assemble output: group measures in rows of 4, pair chords above music

#### Browser-specific:
- FileReader API to read uploaded file
- DOMParser instead of xml.etree.ElementTree
- querySelector/getElementsByTagName instead of find()
- Copy to clipboard API for copy button
