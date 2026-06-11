package br.com.braille.model;

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

    // Construtor
    public Score(String filePath) {
        this.filePath = filePath;
        loadXMLToBuffer(filePath);
        this.title = extractTitle();
        this.measures = extractMeasures();
    }

    /**
     * Método usado para ler o arquivo de texto que está em formato XML e então
     * convertê-lo para formato DOM ->  interface padrão definida pela W3C para acessar, ler, manipular ou alterar documentos XML
     * em formato hierárquico de nós
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
     * Método usado para capturar a String que contém o nome da obra
     * @return String
     */
    private String extractTitle() {
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

    /**
     * Método usado para extrair os compassos e convertê-los em objetos
     * @return List
     */
    private List<Measure> extractMeasures() {
        List<Measure> extractedMeasures = new ArrayList<>();

        // Verifica se o buffer XML foi carregado corretamente
        if (this.domXMLBuffer == null) {
            return extractedMeasures;
        }

        // Busca todas as tags <measure> do arquivo XML
        NodeList measureNodes = domXMLBuffer.getElementsByTagName("measure");
        // Busca o bloco <attributes> dentro do compasso atual
        NodeList attributesList = domXMLBuffer.getElementsByTagName("attributes");

        // Itera sobre cada compasso encontrado
        for (int i = 0; i < measureNodes.getLength(); i++) {
            Element measureElement = (Element) measureNodes.item(i);
            Measure currentMeasure = new Measure();

            // ----- measure number -----
            // Extrai o número do compasso (atributo 'number' da tag <measure>)
            String number = measureElement.getAttribute("number");
            currentMeasure.setNumber(number);

            // ----- divisions -----
            // Verifica se o compasso atual possui a tag <attributes>
            if (attributesList.getLength() > 0) {
                Element attributesElement = (Element) attributesList.item(0);

                // Busca a tag <divisions> dentro do bloco de atributos
                NodeList divisionsList = attributesElement.getElementsByTagName("divisions");

                if (divisionsList.getLength() > 0) {
                    // Extrai o texto, remove espaços em branco (trim) e converte para Inteiro
                    String divisionsStr = divisionsList.item(0).getTextContent().trim();
                    currentMeasure.setDivisions(Integer.parseInt(divisionsStr));
                }
            }

            // --- AQUI ENTRA A LÓGICA FUTURA ---
            // Exemplo: Buscar a tag <attributes> dentro deste compasso para pegar <divisions>, <clef>, etc.
            // NodeList attributesNodes = measureElement.getElementsByTagName("attributes");
            // Se existir, extrair e preencher currentMeasure.setDivisions(...), etc.

            // Exemplo: Buscar tags <note> dentro deste compasso
            // NodeList noteNodes = measureElement.getElementsByTagName("note");
            // Iterar sobre noteNodes, criar objetos Note e adicionar em currentMeasure.getNotes().add(...)

            // Adiciona o compasso preenchido na lista
            extractedMeasures.add(currentMeasure);
        }



        return extractedMeasures;
    }

    public List<Measure> getMeasures() {
        return measures;
    }
}