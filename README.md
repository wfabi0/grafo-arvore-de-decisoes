<div align="center">
  <img src="public/icon.jpeg" alt="Ícone" width="20%" style="margin-bottom: 10px;">
  
  <h1>Visualizador de Árvore de Decisões</h1>
</div>

Uma aplicação de grafos/árvore para Matemática Discreta que permite criar árvores de decisão hierárquicas.

## Funcionalidades

### 1. **Adicionar Itens**

- Crie uma árvore hierárquica com categorias e itens
- Cada nó tem ID único, categoria e nome
- Possibilidade de adicionar filhos a qualquer nó existente

### 2. **Visualização Interativa**

- Layout de árvore que cresce para baixo
- Cores diferentes por nível para melhor organização
- Clique em um nó para selecioná-lo como pai para novos itens

### 3. **Interface Intuitiva**

- Navegação simples e responsiva
- Formulário claro para adicionar novos nós
- Visualização em tempo real das mudanças na árvore

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

## Tecnologias

- TypeScript
- Vite
- vis-network (visualização de grafos)

## Como Executar

```bash
npm install
npm run dev
```

## Deploy

Este projeto está configurado para deploy no GitHub Pages.

**URL de produção:** `https://wfabi0.github.io/grafo-arvore-de-decisoes/`

Para deploy manual:

```bash
npm run deploy
```
