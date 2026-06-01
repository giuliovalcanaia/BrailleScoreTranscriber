package main.java.br.com.braille.model;


import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;

public class Score {
    private String title;
    private Document domXMLBuffer;
    private final String filePath;

    // Construtor
    public Score(String filePath) {
        this.filePath = filePath;
        loadXMLToBuffer(filePath);
        this.title = extractTitle();
    }

    /**
    Método usado para ler o arquivo de texto que está em formato XML e então
    convertê-lo para formato DOM ->  interface padrão definida pela W3C para acessar, ler, manipular ou alterar documentos XML
    em formato hierárquico de nós
     */
    private void loadXMLToBuffer(String filepath) {
        try {
            File inputFile = new File(filePath);
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();

            // Desativa a validação ‘online’ para evitar problemas
            dbFactory.setValidating(false);
            dbFactory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);

            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();

            // Lê diretamente do arquivo físico e já monta a árvore estruturada no seu buffer global
            this.domXMLBuffer = dBuilder.parse(inputFile);
            this.domXMLBuffer.getDocumentElement().normalize();

        } catch (Exception e) {
            System.err.println("Erro ao carregar e processar o arquivo XML: " + e.getMessage());
            this.domXMLBuffer = null;
        }
    }

    /**
    Método usado para capturar a String que contém o nome da obra
     */
    private String extractTitle() {
        // Se o buffer estiver nulo (por falha na leitura), retorna a mensagem de erro
        if (this.domXMLBuffer == null) {
            return "Erro na leitura ou arquivo não carregado";
        }

        // Busca todas as tags <credit> diretamente do seu buffer na memória
        NodeList creditList = domXMLBuffer.getElementsByTagName("credit");

        for (int i = 0; i < creditList.getLength(); i++) {
            Element creditElement = (Element) creditList.item(i);
            NodeList typeList = creditElement.getElementsByTagName("credit-type");

            if (typeList.getLength() > 0) {
                String creditType = typeList.item(0).getTextContent().trim();

                if ("title".equalsIgnoreCase(creditType)) {
                    NodeList wordsList = creditElement.getElementsByTagName("credit-words");
                    if (wordsList.getLength() > 0) {
                        // Retorna o título e encerra o método imediatamente
                        return wordsList.item(0).getTextContent().trim();
                    }
                }
            }
        }

        // Fallback caso não encontre na tag <credit> (ou seja, se o loop acima terminou sem dar return)
        NodeList workTitleList = domXMLBuffer.getElementsByTagName("work-title");
        if (workTitleList.getLength() > 0) {
            return workTitleList.item(0).getTextContent().trim();
        }

        // Se chegar até aqui, é porque nenhuma das opções encontrou o título
        return "Título não encontrado";
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}