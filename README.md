# Implementação do Desafio: [Adriano Fernandes / adriano.p.f@outlook.com]

Esta seção detalha a estrutura e as funcionalidades implementadas para atender aos requisitos obrigatórios do desafio de Front-end da Cadastra.

## Estrutura e Tecnologia

O projeto foi desenvolvido utilizando HTML, CSS puro e TypeScript, seguindo os princípios de Vanilla JS para garantir alto desempenho e baixo acoplamento de dependências, conforme solicitado. O código TypeScript é compilado para JavaScript através de um processo de build (assumindo Gulp/Grunt) no arquivo `bundle.js`, que é referenciado no `index.html`.

## Funcionalidades Implementadas

O principal ponto de entrada é o `src/ts/index.ts`, onde toda a lógica de aplicação é gerenciada, promovendo a separação de responsabilidades (JavaScript para dados/lógica, HTML para estrutura, CSS para estilo).

### 1. Consumo de API e Gerenciamento de Dados

- **API:** A função assíncrona `loadProducts()` é responsável por buscar a lista completa de produtos na API mockada (`http://localhost:5000/products`), garantindo o tratamento de erros.
- **Estado Global:** Variáveis de estado (`allProducts`, `displayedProducts`, `currentProductCount`) gerenciam a lista completa de produtos e a lista atualmente visível para o usuário.

### 2. Filtros e Ordenação Dinâmica

A função mestra `applyFiltersAndSort()` é disparada em cada interação do usuário (mudança de filtro ou ordenação).

- **Filtragem em Tempo Real:**
  - **Cor, Tamanho e Faixa de Preço:** A função coleta o estado atual de todos os _checkboxes_ e botões de filtro (`.size-pill.is-selected`) e aplica uma cadeia de filtros (`.filter()`) na lista de produtos.
- **Ordenação:** Implementação de ordenação por **Preço (Crescente/Decrescente)** e **Data de Lançamento**, utilizando `.sort()`.

### 3. Paginação e Carregamento Contínuo

- **`renderProducts()`:** Responsável por renderizar apenas um lote de `PRODUCTS_PER_LOAD` (9 produtos) por vez.
- **"Carregar Mais":** O botão **CARREGAR MAIS** utiliza a função `renderProducts(true)` para adicionar produtos à grid sem limpar o conteúdo anterior. A visibilidade do botão é controlada por `updateLoadMoreButton()`.

### 4. Funcionalidade de Carrinho (Badge de Notificação)

- **Contador:** A variável `cartCount` armazena a quantidade de itens.
- **Interação:** Um listener de evento (`setupBuyButtonListeners()`) é anexado a todos os botões **COMPRAR**, incluindo os carregados dinamicamente.
- **Feedback Visual:** A função `addToCart()` incrementa a contagem e chama `updateCartBadge()`, que exibe um **Badge (círculo laranja)** com a quantidade de itens no canto superior direito do ícone do carrinho, seguindo o design solicitado. Uma pequena animação de pulso (`.pulse` no CSS) foi adicionada para feedback imediato ao usuário.

### 5. Responsividade e Boas Práticas (Ponto de Atenção)

- **Responsividade:** Devido a urgências e restrições de tempo com meu trabalho atual, a adaptação completa do layout para dispositivos móveis (_Responsividade_) **não pôde ser concluída** dentro do prazo ideal. O CSS base para o layout principal (desktop) está estruturado, mas a implementação das _media queries_ para _viewports_ menores (mobile/tablet) está pendente.
- **Semântica:** Uso de elementos HTML semânticos (`<header>`, `<main>`, `<aside>`, `<footer>`) e atributos `data-*` para manipulação limpa via JavaScript.

## Como Rodar o Código

Para testar o projeto, siga os passos abaixo:

1.  **Pré-requisitos:** Certifique-se de ter o **Node.js (v14 ou superior)** instalado.

2.  **Instalação de Dependências:**

    ```bash
    npm install
    ```

3.  **Execução do Projeto:**
    O comando abaixo inicia o servidor local (`http://localhost:3000`) e o servidor da API (`http://localhost:5000`) simultaneamente:

    ```bash
    gulp default
    ```

4.  **Acesso:**
    Abra a URL no seu navegador: **http://localhost:3000**
