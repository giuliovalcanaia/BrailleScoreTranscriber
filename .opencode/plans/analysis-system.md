# Plan: Advanced Braille Analysis System

## Overview
Add an interactive analysis feature that breaks down braille music notation symbol-by-symbol, grouped by measure, with hover highlighting.

## Files to Modify

### 1. `index.html`
**Changes:**
- Add "Analisar" button next to "Copiar" button in `.output-header`
- Add new `.analysis-section` div after `.output-section` to contain the analysis panel
- Analysis panel structure:
  ```html
  <div id="analysisPanel" class="analysis-panel hidden">
      <div class="measure-group" data-measure="1">
          <h3>Compasso 1</h3>
          <div class="analysis-item" data-start="0" data-end="5">
              <span class="analysis-desc">Compasso 4/4:</span>
              <span class="analysis-braille">⠼⠃⠲</span>
          </div>
          ...
      </div>
  </div>
  ```

### 2. `style.css`
**New styles to add:**
- `.analysis-panel` - container for analysis (dark background, rounded corners)
- `.analysis-panel.hidden` - display: none
- `.measure-group` - groups analysis items by measure (border, padding)
- `.measure-group h3` - measure header styling
- `.analysis-item` - individual analysis row (flex layout, hover effect)
- `.analysis-item:hover` - highlight background
- `.analysis-desc` - description text (color: #b0b0b0)
- `.analysis-braille` - braille characters (larger font, monospace)
- `.analysis-item.highlighted` - class for JS to apply on hover
- `.braille-char.highlighted` - span wrapper for individual braille chars when highlighted

### 3. `app.js`
**New data structures:**
```javascript
// Analysis element types
const ANALYSIS_TYPES = {
    TIME_SIGNATURE: 'time_signature',
    KEY_SIGNATURE: 'key_signature',
    CHORD: 'chord',
    OCTAVE: 'octave',
    NOTE: 'note',
    REST: 'rest',
    DOT: 'dot',
    REPEAT_START: 'repeat_start',
    REPEAT_END: 'repeat_end',
    ENDING: 'ending',
    FINAL_BAR: 'final_bar'
};
```

**New function: `analisarBraille(compassosBraille, compassosCifras, cabecalhoBraille)`**
- Input: Arrays from conversion process + header
- Output: Array of measure analysis objects
- Each measure object contains array of analysis items with:
  - `type`: element type
  - `braille`: braille text
  - `description`: Portuguese description
  - `startPos`, `endPos`: character positions in final output (for highlighting)

**Parsing logic:**
1. Parse header braille (key + time signature)
2. For each measure:
   - Parse chord symbols (if present)
   - Parse music braille character by character
   - Identify multi-char symbols first (⠣⠆, ⠰⠜, ⠣⠅, ⠩⠼)
   - Identify octave markers (⠈, ⠘, ⠸, ⠐, ⠨, ⠰, ⠠)
   - Identify note symbols by matching against NOTAS dictionary
   - Identify rests by matching against PAUSAS dictionary
   - Identify dot (⠄)

**Description generation:**
- Time signature: "Compasso {beats}/{beatType}:"
- Key signature: "Armadura: {fifths} sustenidos/bemóis"
- Chord: "{chordName}:" (e.g., "G:", "Cm:")
- Octave: "{n}ª oitava:"
- Note: "Nota {noteName} {duration}:"
- Rest: "Pausa de {duration}:"
- Dot: "Ponto de aumento:"
- Repeat start: "Início de repetição:"
- Repeat end: "Fim de repetição:"
- Ending: "Casa {number}:"
- Final bar: "Barra final:"

**New function: `renderAnalysis(analysisData)`**
- Generate HTML for analysis panel
- Add data-start/data-end attributes for hover highlighting
- Group by measure

**Hover interaction:**
- Mouse enter on `.analysis-item`: 
  - Add `.highlighted` class to corresponding braille chars in output
- Mouse leave:
  - Remove `.highlighted` class

**DOM manipulation:**
- Wrap each braille character in output in `<span class="braille-char" data-pos="N">`
- This enables precise highlighting

**Event listeners:**
- Add click listener for "Analisar" button
- Add mouseenter/mouseleave listeners for analysis items
- Store analysis state (whether panel is visible)

## Implementation Details

### Braille Character Position Tracking
The challenge is mapping analysis items to positions in the displayed output. Solution:
1. When rendering output, wrap each character in a span with position index
2. Store start/end positions in analysis items
3. Use these positions to find and highlight corresponding spans

### Multi-character Symbol Detection
Check for 2-char symbols first before single-char:
```javascript
const twoCharSymbols = ['⠣⠆', '⠰⠜', '⠣⠅', '⠩⠼'];
if (braille.substring(i, i+2) is in twoCharSymbols) {
    // Process as 2-char symbol
    i += 2;
} else {
    // Process as 1-char symbol
    i += 1;
}
```

### Duration Mapping
Reverse lookup from braille to duration name:
```javascript
const DURACAO_REVERSO = {
    '⠍': 'semibreve', '⠥': 'mínima', '⠧': 'semínima',
    '⠦': 'colcheia', '⠴': 'semicolcheia'
};
```

### Note Name Detection
Reverse lookup from braille to note name (need to check all octaves):
```javascript
function getNotaNome(brailleChar) {
    for (const [nota, duracoes] of Object.entries(NOTAS)) {
        for (const duracaoBraille of Object.values(duracoes)) {
            if (duracaoBraille === brailleChar) return nota;
        }
    }
    return null;
}
```

## UI Flow
1. User uploads XML → conversion runs → braille output displayed
2. User clicks "Analisar" button → analysis panel appears below output
3. User hovers over analysis item → corresponding braille chars highlight in output
4. User clicks "Analisar" again → panel hides (toggle behavior)

## Tradeoffs Considered
- **Span wrapping for every char**: Adds DOM complexity but enables precise highlighting
- **Position tracking**: Requires careful indexing but makes hover interaction smooth
- **Analysis on-demand vs automatic**: On-demand (button) is better for performance with long scores
