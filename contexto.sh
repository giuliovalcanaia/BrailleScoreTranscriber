#!/bin/bash

# Nome do arquivo de saída
OUTPUT_FILE="contexto.md"

# Limpa ou cria o arquivo de saída
> "$OUTPUT_FILE"

echo "Iniciando geração do contexto..."

# ==============================================================================
# 1. ESTRUTURA DE DIRETÓRIOS (TREE)
# ==============================================================================
echo "## Estrutura de Diretórios" >> "$OUTPUT_FILE"
echo '```text' >> "$OUTPUT_FILE"

if command -v tree >/dev/null 2>&1; then
    tree -I '.git|target|build|.idea|*.class|*.jar|node_modules|.DS_Store' >> "$OUTPUT_FILE" 2>/dev/null
else
    echo "Comando 'tree' não encontrado. Usando 'find' como alternativa..." >&2
    find . -not -path '*/\.git/*' -not -path '*/target/*' -not -path '*/build/*' -not -name '*.class' -not -name '*.jar' | sed -e 's/[^-][^\/]*\//  |/g' -e 's/|\([^ ]\)/|- \1/' >> "$OUTPUT_FILE"
fi

echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# ==============================================================================
# 2. PROCESSAMENTO DOS ARQUIVOS JAVA
# ==============================================================================
echo "## Código Fonte Java" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

find . -type f -name "*.java" | sort | while IFS= read -r file; do
    echo "Processando: $file" >&2

    echo "### Arquivo: \`$file\`" >> "$OUTPUT_FILE"
    echo '```java' >> "$OUTPUT_FILE"

    # PIPELINE DE LIMPEZA:
    # 1. perl: Remove comentários de bloco /* ... */
    # 2. tr -d '\r': Remove quebras de linha do Windows (CRLF) para evitar bugs
    # 3. sed: Remove comentários de linha //
    # 4. sed: Remove linhas totalmente vazias ou com apenas espaços
    perl -0777 -pe 's|/\*.*?\*/||gs' "$file" | \
    tr -d '\r' | \
    sed 's|//.*||g' | \
    sed '/^[[:space:]]*$/d' >> "$OUTPUT_FILE"

    # CORREÇÃO: Garante uma quebra de linha antes de fechar o bloco.
    # Isso impede que os backticks fiquem na mesma linha do último caractere
    # caso o arquivo original não termine com uma quebra de linha.
    echo "" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

echo "Concluído! O arquivo '$OUTPUT_FILE' foi gerado com sucesso."