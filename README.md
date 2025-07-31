# Visualizador de Árvore de Decisões

Uma aplicação de grafos/árvore para Matemática Discreta que permite criar árvores de decisão hierárquicas.

## Funcionalidades

### 1. **Adicionar Itens**
- Crie uma árvore hierárquica com categorias e itens
- Cada nó tem ID único, categoria e nome
- Possibilidade de adicionar filhos a qualquer nó existente

### 2. **Busca em Profundidade**
- Encontra o menor caminho (menor número de decisões)
- Destaca visualmente o caminho encontrado
- Útil para encontrar a combinação mais simples

### 3. **Interface Intuitiva**
- Layout de árvore que cresce para baixo
- Cores diferentes por nível
- Clique em um nó para selecioná-lo como pai

## Como Usar

### Exemplo: Combinações de Roupa

1. **Primeiro nível (já existe):** "Início"

2. **Segundo nível - Tipos de Roupa:**
   - Nó Pai: (vazio ou "Início")
   - Categoria: "Blusa"
   - Nome: "Opções de Blusa"

3. **Terceiro nível - Opções específicas:**
   - Nó Pai: "2" (ou "Opções de Blusa")
   - Categoria: "Blusa"
   - Nome: "Rosa"
   
   - Nó Pai: "2"
   - Categoria: "Blusa" 
   - Nome: "Amarela"

4. **Continue adicionando:**
   - Calças (Jeans, Social)
   - Sapatos (Tênis, Social)
   - etc.

### Buscar Menor Caminho
Clique em "Buscar Menor Caminho" para encontrar a combinação com menos escolhas.

## Tecnologias
- TypeScript
- Vite
- vis-network (visualização de grafos)

## Como Executar
```bash
npm install
npm run dev
```
