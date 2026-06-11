## Estrutura de Diretórios
```text
.
├── contexto.md
├── contexto.sh
├── LICENSE
├── NOTICE
├── out
│   └── production
│       └── braille-xml
│           ├── main
│           │   └── java
│           │       └── br
│           │           └── com
│           │               └── braille
│           │                   └── model
│           └── test
│               └── resources
│                   └── Asa-Branca.musicxml
├── pom.xml
├── README.md
└── src
    ├── main
    │   ├── java
    │   │   └── br
    │   │       └── com
    │   │           └── braille
    │   │               └── model
    │   │                   ├── Clef.java
    │   │                   ├── ClefSign.java
    │   │                   ├── KeySignature.java
    │   │                   ├── Measure.java
    │   │                   ├── Mode.java
    │   │                   ├── Note.java
    │   │                   ├── Pitch.java
    │   │                   ├── Score.java
    │   │                   ├── ScoreTest.java
    │   │                   ├── Step.java
    │   │                   └── TimeSignature.java
    │   └── resources
    └── test
        ├── java
        └── resources
            └── Asa-Branca.musicxml

23 directories, 19 files
```

## Código Fonte Java

### Arquivo: `./src/main/java/br/com/braille/model/Clef.java`
```java
package main.java.br.com.braille.model;
public class Clef {
    private Integer line;
    private Integer octaveChange;
    private ClefSign clefSign;
    public Integer getLine() {
        return line;
    }
    public void setLine(Integer line) {
        this.line = line;
    }
    public Integer getOctaveChange() {
        return octaveChange;
    }
    public void setOctaveChange(Integer octaveChange) {
        this.octaveChange = octaveChange;
    }
    public ClefSign getClefSign() {
        return clefSign;
    }
    public void setClefSign(ClefSign clefSign) {
        this.clefSign = clefSign;
    }
}

```

### Arquivo: `./src/main/java/br/com/braille/model/ClefSign.java`
```java
package main.java.br.com.braille.model;
public enum ClefSign {
    G,
    F,
    C,
    PERCUSSION,
    TAB,
    JIANPU,
    NONE
}

```

### Arquivo: `./src/main/java/br/com/braille/model/KeySignature.java`
```java
package main.java.br.com.braille.model;
public class KeySignature {
    private Integer fifths;
    private Mode mode;
    public Integer getFifths() {
        return fifths;
    }
    public void setFifths(Integer fifths) {
        this.fifths = fifths;
    }
    public Mode getMode() {
        return mode;
    }
    public void setMode(Mode mode) {
        this.mode = mode;
    }
}

```

### Arquivo: `./src/main/java/br/com/braille/model/Measure.java`
```java
package main.java.br.com.braille.model;
import java.util.ArrayList;
import java.util.List;
public class Measure {
    private String number;
    private Integer divisions;
    private Clef clef;
    private KeySignature keySignature;
    private List<Note> notes = new ArrayList<>();
    private TimeSignature timeSignature;
    public Integer getDivisions() {
        return divisions;
    }
    public void setDivisions(Integer divisions) {
        this.divisions = divisions;
    }
    public Clef getClef() {
        return clef;
    }
    public void setClef(Clef clef) {
        this.clef = clef;
    }
    public KeySignature getKeySignature() {
        return keySignature;
    }
    public void setKeySignature(KeySignature keySignature) {
        this.keySignature = keySignature;
    }
    public List<Note> getNotes() {
        return notes;
    }
    public void setNotes(List<Note> notes) {
        this.notes = notes;
    }
    public TimeSignature getTimeSignature() {
        return timeSignature;
    }
    public void setTimeSignature(TimeSignature timeSignature) {
        this.timeSignature = timeSignature;
    }
    public String getNumber() {
        return number;
    }
    public void setNumber(String number) {
        this.number = number;
    }
}
```

### Arquivo: `./src/main/java/br/com/braille/model/Mode.java`
```java
package main.java.br.com.braille.model;
public enum Mode {
    MAJOR,
    MINOR,
    DORIAN,
    PHRYGIAN,
    LYDIAN,
    MIXOLYDIAN,
    AEOLIAN,
    IONIAN,
    LOCRIAN,
    NONE
}

```

### Arquivo: `./src/main/java/br/com/braille/model/Note.java`
```java
package main.java.br.com.braille.model;
public class Note {
    private Double duration;
    private Pitch pitch;
    public Double getDuration() {
        return duration;
    }
    public void setDuration(Double duration) {
        this.duration = duration;
    }
    public Pitch getPitch() {
        return pitch;
    }
    public void setPitch(Pitch pitch) {
        this.pitch = pitch;
    }
}

```

### Arquivo: `./src/main/java/br/com/braille/model/Pitch.java`
```java
package main.java.br.com.braille.model;
public class Pitch {
    private Integer alter;
    private Integer octave;
    private Step step;
    public Integer getAlter() {
        return alter;
    }
    public void setAlter(Integer alter) {
        this.alter = alter;
    }
    public Integer getOctave() {
        return octave;
    }
    public void setOctave(Integer octave) {
        this.octave = octave;
    }
    public Step getStep() {
        return step;
    }
    public void setStep(Step step) {
        this.step = step;
    }
}

```

### Arquivo: `./src/main/java/br/com/braille/model/Score.java`
```java
package main.java.br.com.braille.model;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
public class Score {
    private final String title;
    private Document domXMLBuffer;
    private final String filePath;
    private List<Measure> measures = new ArrayList<>();
    public Score(String filePath) {
        this.filePath = filePath;
        loadXMLToBuffer(filePath);
        this.title = extractTitle();
        this.measures = extractMeasures();
    }
    private void loadXMLToBuffer(String filepath) {
        try {
            File inputFile = new File(filePath);
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            dbFactory.setValidating(false);
            dbFactory.setFeature("http:
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            this.domXMLBuffer = dBuilder.parse(inputFile);
            this.domXMLBuffer.getDocumentElement().normalize();
        } catch (Exception e) {
            System.err.println("Erro ao carregar e processar o arquivo XML: " + e.getMessage());
            this.domXMLBuffer = null;
        }
    }
    private String extractTitle() {
        NodeList creditList = domXMLBuffer.getElementsByTagName("credit");
        for (int i = 0; i < creditList.getLength(); i++) {
            Element creditElement = (Element) creditList.item(i);
            NodeList typeList = creditElement.getElementsByTagName("credit-type");
            if (typeList.getLength() > 0) {
                String creditType = typeList.item(0).getTextContent().trim();
                if ("title".equalsIgnoreCase(creditType)) {
                    NodeList wordsList = creditElement.getElementsByTagName("credit-words");
                    if (wordsList.getLength() > 0) {
                        return wordsList.item(0).getTextContent().trim();
                    }
                }
            }
        }
        NodeList workTitleList = domXMLBuffer.getElementsByTagName("work-title");
        if (workTitleList.getLength() > 0) {
            return workTitleList.item(0).getTextContent().trim();
        }
        return "Título não encontrado";
    }
    public String getTitle() {
        return title;
    }
    private List<Measure> extractMeasures() {
        List<Measure> extractedMeasures = new ArrayList<>();
        if (this.domXMLBuffer == null) {
            return extractedMeasures;
        }
        NodeList measureNodes = domXMLBuffer.getElementsByTagName("measure");
        NodeList attributesList = domXMLBuffer.getElementsByTagName("attributes");
        for (int i = 0; i < measureNodes.getLength(); i++) {
            Element measureElement = (Element) measureNodes.item(i);
            Measure currentMeasure = new Measure();
            String number = measureElement.getAttribute("number");
            currentMeasure.setNumber(number);
            if (attributesList.getLength() > 0) {
                Element attributesElement = (Element) attributesList.item(0);
                NodeList divisionsList = attributesElement.getElementsByTagName("divisions");
                if (divisionsList.getLength() > 0) {
                    String divisionsStr = divisionsList.item(0).getTextContent().trim();
                    currentMeasure.setDivisions(Integer.parseInt(divisionsStr));
                }
            }
            extractedMeasures.add(currentMeasure);
        }
        return extractedMeasures;
    }
    public List<Measure> getMeasures() {
        return measures;
    }
}
```

### Arquivo: `./src/main/java/br/com/braille/model/ScoreTest.java`
```java
package main.java.br.com.braille.model;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
class ScoreTest {
    private String testFilePath;
    private List<String> expectedMeasureNumbers;
    private Integer expectedDivision = 2;
    @BeforeEach
    public void setUp() {
        this.testFilePath = "src/test/resources/Asa-Branca.musicxml";
        this.expectedMeasureNumbers = new ArrayList<>();
        this.expectedMeasureNumbers.add("1");
        this.expectedMeasureNumbers.add("2");
        this.expectedMeasureNumbers.add("3");
        this.expectedMeasureNumbers.add("4");
        this.expectedMeasureNumbers.add("5");
    }
    @Test
    @DisplayName("Verifica título")
    void testIfGetTitleIsWorkingInContructor() {
        Score score = new Score(testFilePath);
        assertEquals("Asa branca", score.getTitle(), "O título extraído do XML está incorreto");
    }
    @Test
    @DisplayName("Verifica atribuição de compassos")
    public void testExtractFirstFiveMeasures() {
        Score score = new Score(testFilePath);
        List<Measure> measures = score.getMeasures();
        assertNotNull(measures, "A lista de compassos não deveria ser nula.");
        assertTrue(measures.size() >= 5, "O XML de teste deve conter pelo menos 5 compassos para este teste.");
        for (int i = 0; i < 5; i++) {
            assertEquals(
                    expectedMeasureNumbers.get(i),
                    measures.get(i).getNumber(),
                    "O número do compasso no índice " + i + " está incorreto."
            );
        }
    }
    @Test
    @DisplayName("Verifica atribuição de divisões")
    public void testExtractDivisions() {
        Score score = new Score(testFilePath);
        List<Measure> measures = score.getMeasures();
        assertNotNull(measures, "A lista de compassos não deveria ser nula.");
        for (int i = 0; i < 5; i++) {
            assertEquals(
                    String.valueOf(expectedDivision),
                    String.valueOf(measures.get(i).getDivisions()),
                    "A divisão do compasso no índice " + i + " está incorreto."
            );
        }
    }
}
```

### Arquivo: `./src/main/java/br/com/braille/model/Step.java`
```java
package main.java.br.com.braille.model;
public enum Step {
    A,
    B,
    C,
    D,
    E,
    F,
    G
}

```

### Arquivo: `./src/main/java/br/com/braille/model/TimeSignature.java`
```java
package main.java.br.com.braille.model;
public class TimeSignature {
    private Integer beats;
    private Integer beatType;
    public Integer getBeats() {
        return beats;
    }
    public void setBeats(Integer beats) {
        this.beats = beats;
    }
    public Integer getBeatType() {
        return beatType;
    }
    public void setBeatType(Integer beatType) {
        this.beatType = beatType;
    }
}

```

