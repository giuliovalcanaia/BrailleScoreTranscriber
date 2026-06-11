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
        // Define o caminho para um arquivo XML de teste.
        this.testFilePath = "src/test/resources/Asa-Branca.musicxml";

        // Define as saídas esperadas para os 5 primeiros compassos
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

        // Verifica se a extração do título funcionou
        assertEquals("Asa branca", score.getTitle(), "O título extraído do XML está incorreto");
    }

    @Test
    @DisplayName("Verifica atribuição de compassos")
    public void testExtractFirstFiveMeasures() {
        Score score = new Score(testFilePath);

        // Recupera a lista de compassos gerada pelo construtor/extractMeasures
        List<Measure> measures = score.getMeasures();

        // Assert: Validações de segurança iniciais
        assertNotNull(measures, "A lista de compassos não deveria ser nula.");
        assertTrue(measures.size() >= 5, "O XML de teste deve conter pelo menos 5 compassos para este teste.");

        // Assert: Valida se os 5 primeiros elementos correspondem a 1, 2, 3, 4 e 5
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

        // Recupera a lista de compassos gerada pelo construtor/extractMeasures
        List<Measure> measures = score.getMeasures();

        // Assert: Validações de segurança iniciais
        assertNotNull(measures, "A lista de compassos não deveria ser nula.");

        // Assert: Valida se as divisões dos 5 primeiros compassos correspondem a 2
        for (int i = 0; i < 5; i++) {
            assertEquals(
                    String.valueOf(expectedDivision),
                    String.valueOf(measures.get(i).getDivisions()),
                    "A divisão do compasso no índice " + i + " está incorreto."
            );
        }
    }
}