# BrailleScoreTranscriber

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> **[PT-BR]** Ferramenta automatizada para transcrição de partituras digitais no formato MusicXML para a Musicografia Braille. Desenvolvido como projeto acadêmico para a FURB (Universidade Regional de Blumenau) e focado em acessibilidade musical.
>
> **[EN]** An automated tool for transcribing digital sheet music from MusicXML format to Braille Music Notation. Developed as an academic project for FURB (Regional University of Blumenau) with a core focus on musical accessibility.

---

# Documentação de Arquitetura: Parser MusicXML

Este documento detalha o diagrama de classes responsável por mapear a estrutura de um arquivo MusicXML. A arquitetura foi desenhada de forma hierárquica e sequencial, refletindo o fluxo real de leitura da partitura: da configuração global (`Score`), passando pela divisão do tempo (`Measure`), até chegar aos eventos sonoros individuais (`Note`).

## 1. Estrutura Principal (Hierarquia de Tempo)

A espinha dorsal do modelo segue o caminho lógico da partitura.

### `Score` (Partitura)

É a classe raiz do documento. Representa o arquivo musical como um todo e atua como a dona da linha do tempo.

* **Atributos:**
* `title: String` $\rightarrow$ O título da obra musical.


* **Relacionamentos:**
* Contém uma lista de `Measure` (`1..*`). A partitura delega toda a responsabilidade de formatação rítmica e de notas para os seus compassos.



### `Measure` (Compasso)

Representa um compasso individual da partitura. É a classe central para o controle de estado e métrica, pois dita as regras de como as notas dentro dela devem ser interpretadas.

* **Atributos:**
* `divisions: Integer` $\rightarrow$ Define a resolução rítmica do compasso. Indica em quantas partes uma semínima (*quarter note*) é dividida. É o denominador usado para calcular o tempo real das notas.


* **Relacionamentos:**
* Contém uma lista de `Note` (`1..*`), representando os eventos musicais que ocorrem dentro deste compasso.
* Possui associações opcionais (`0..1`) com `KeySignature`, `TimeSignature` e `Clef`.



### `Note` (Nota Musical)

Representa um evento musical único na linha do tempo.

* **Atributos:**
* `duration: BigDecimal` $\rightarrow$ A duração temporal da nota expressa em *ticks* (pulsos). O valor real de tempo depende da divisão (`divisions`) configurada no `Measure` pai. O uso de `BigDecimal` garante precisão matemática, evitando erros de ponto flutuante em subdivisões complexas (como quiálteras).


* **Relacionamentos:**
* Possui exatamente uma altura definida pela classe `Pitch` (`1`).



---

## 2. Atributos do Compasso (Configurações de Pauta)

Estes objetos estão ligados ao `Measure` com multiplicidade **`0..1`**. Eles são opcionais porque no MusicXML eles só são declarados quando ocorre uma **mudança**. Se um compasso não possuir essas instâncias, o sistema subentende que as configurações do compasso anterior continuam em vigor.

### `KeySignature` (Armadura de Clave / Tonalidade)

Define a tonalidade do compasso.

* **Atributos:**
* `fifths: Integer` $\rightarrow$ Representa a quantidade de acidentes na armadura. Números positivos indicam sustenidos (ex: `1` = Sol Maior), números negativos indicam bemóis (ex: `-1` = Fá Maior) e `0` indica Dó Maior/Lá Menor.


* **Relacionamentos:**
* `mode: Mode` $\rightarrow$ Enumeração que define a escala funcional.



### `TimeSignature` (Fórmula de Compasso)

Define a métrica rítmica do compasso (ex: 4/4, 6/8).

* **Atributos:**
* `beats: Integer` $\rightarrow$ O numerador da fórmula. Quantos tempos o compasso possui.
* `beatType: Integer` $\rightarrow$ O denominador da fórmula. Qual figura rítmica equivale a um tempo (ex: `4` = semínima, `8` = colcheia).



### `Clef` (Clave)

Define a âncora de leitura do pentagrama, determinando qual linha corresponde a qual nota.

* **Atributos:**
* `line: Integer [0..1]` $\rightarrow$ Em qual linha do pentagrama a clave é desenhada (contada de baixo para cima).
* `octaveChange: Integer [0..1]` $\rightarrow$ Transposição de oitava (ex: `-1` para clave de violão, que soa uma oitava abaixo da escrita).


* **Relacionamentos:**
* `sign: ClefSign` $\rightarrow$ Enumeração com o símbolo gráfico da clave.



---

## 3. Altura e Afinação (Pitch)

### `Pitch` (Altura da Nota)

Representa a frequência sonora exata da nota musical, isolando essa responsabilidade da classe `Note` (que cuida apenas da duração).

* **Atributos:**
* `alter: Integer [0..1]` $\rightarrow$ (Opcional). Representa os acidentes temporários na nota em semitons. `1` para sustenido, `-1` para bemol, `2` para dobrado sustenido, etc. Só existe se a nota não for natural.
* `octave: Integer` $\rightarrow$ O número da oitava seguindo a Notação Científica de Alturas (ex: `4` para o Dó central do piano).


* **Relacionamentos:**
* `step: Step` $\rightarrow$ Enumeração com a nota fundamental.



---

## 4. Dicionários de Dados (Enumerações)

Os enums foram implementados para evitar "strings mágicas" e garantir a segurança de tipos (Type Safety) baseada na especificação estrita do MusicXML.

* **`«enumeration» Step`**: As 7 notas musicais naturais do sistema ocidental (`A`, `B`, `C`, `D`, `E`, `F`, `G`).
* **`«enumeration» ClefSign`**: Os tipos de símbolos de clave suportados (ex: `G` para Sol, `F` para Fá, `C` para Dó, `PERCUSSION`, `TAB`, `JIANPU`, `NONE`).
* **`«enumeration» Mode`**: Os modos musicais e tonais clássicos (`MAJOR`, `MINOR`, `DORIAN`, `PHRYGIAN`, `LYDIAN`, `MIXOLYDIAN`, `AEOLIAN`, `IONIAN`, `LOCRIAN`, `NONE`).