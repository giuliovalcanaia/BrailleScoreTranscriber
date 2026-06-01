package main.java.br.com.braille.model;

import org.junit.jupiter.api.Test;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ScoreTest {

    // 1 Verificação de título
    @Test
    void getTitle() {
        // 1. Monta o caminho para a pasta resources de teste.
        String filePath = Paths.get("src", "test", "resources", "Asa-Branca.musicxml").toAbsolutePath().toString();

        // 2. Executa a ação: Instancia o Score, que vai ler o XML no construtor
        Score score = new Score(filePath);

        // 3. Verifica se a extração do título funcionou
        assertEquals("Asa branca", score.getTitle(), "O título extraído do XML está incorreto");
    }
}