import { Product, Database } from "./Product";

let allProducts: Product[] = [];
let displayedProducts: Product[] = [];
const PRODUCTS_PER_LOAD = 9;
let currentProductCount = 0;
let cartCount: number = 0;

const productGrid = document.querySelector(".product-grid");
const loadMoreButton = document.querySelector(".btn-load-more");
const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;
const filtersSidebar = document.querySelector(".filters-sidebar");
const cartBadge = document.getElementById("cart-badge");

// Função de formatação para moeda BRL
const formatPrice = (price: number): string => {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

// Carrega os dados do db.json.
async function loadProducts(): Promise<void> {
  try {
    const response = await fetch("./db.json");
    if (!response.ok) {
      throw new Error(`Erro ao carregar db.json: ${response.statusText}`);
    }
    const data: Database = await response.json();
    allProducts = data.products;
    setupEventListeners();
    applyFiltersAndSort();
    updateCartBadge();
  } catch (error) {
    console.error("Falha ao carregar ou processar produtos:", error);
    if (productGrid) {
      productGrid.innerHTML =
        '<p class="text-error">Não foi possível carregar os produtos. Verifique o arquivo db.json.</p>';
    }
  }
}

// Cria o HTML de um Card de Produto (Adaptado ao seu JSON original).
function createProductCardHTML(product: Product): string {
  const numParcelas = product.parcelamento[0];
  const valorParcela = product.parcelamento[1];

  const priceFormatted = formatPrice(product.price);
  const parcelaFormatted = formatPrice(valorParcela);

  return `
        <div class="product-card" data-id="${product.id}" data-color="${product.color}">
            <img 
                src="${product.image}" 
                alt="${product.name}" 
                class="product-image" 
                onerror="this.onerror=null;this.src='https://placehold.co/300x400/CCCCCC/333333?text=Imagem+Faltando';" 
            />
            <div class="product-info">
                <span class="product-title">${product.name}</span>
                <strong class="product-price">${priceFormatted}</strong>
                <span class="product-price-installments">até ${numParcelas}x de ${parcelaFormatted}</span>
                <!-- CORREÇÃO AQUI: Agora é um BUTTON com o ID do produto para o JS -->
                <button class="btn-buy" data-product-id="${product.id}">COMPRAR</button>
            </div>
        </div>
    `;
}

// Renderiza os Produtos na Grid (com Paginação).
function renderProducts(append: boolean = false): void {
  if (!productGrid) return;

  if (!append) {
    productGrid.innerHTML = "";
    currentProductCount = 0;
  }

  // Calcula quantos produtos carregar nesta iteração
  const productsToLoad = displayedProducts.slice(
    currentProductCount,
    currentProductCount + PRODUCTS_PER_LOAD
  );

  // Se não houver produtos e não for um append, mostra mensagem
  if (productsToLoad.length === 0 && currentProductCount === 0 && !append) {
    productGrid.innerHTML =
      '<p class="w-full text-center py-10 text-gray-500">Nenhum produto encontrado com os filtros aplicados.</p>';
  }

  const newHTML = productsToLoad.map(createProductCardHTML).join("");
  productGrid.insertAdjacentHTML("beforeend", newHTML);

  // Adiciona o listener de click aos novos botões "COMPRAR"
  setupBuyButtonListeners();

  // Atualiza o contador e o botão "Carregar Mais"
  currentProductCount += productsToLoad.length;
  updateLoadMoreButton();
}

// Controla o botão "Carregar Mais".
function updateLoadMoreButton(): void {
  if (loadMoreButton) {
    if (currentProductCount < displayedProducts.length) {
      (loadMoreButton as HTMLElement).style.display = "block";
    } else {
      (loadMoreButton as HTMLElement).style.display = "none";
    }
  }
}

// Funções de Carrinho
// Atualiza o badge do carrinho (o círculo laranja).
function updateCartBadge(): void {
  if (cartBadge) {
    if (cartCount > 0) {
      cartBadge.textContent = cartCount.toString();
      (cartBadge as HTMLElement).style.display = "flex";
      cartBadge.classList.add("pulse");
      setTimeout(() => cartBadge.classList.remove("pulse"), 500);
    } else {
      (cartBadge as HTMLElement).style.display = "none";
    }
  }
}

// Adiciona um produto ao carrinho e atualiza o badge.
function addToCart(productId: number): void {
  cartCount++;
  updateCartBadge();
  console.log(
    `Produto ID ${productId} adicionado. Total no carrinho: ${cartCount}`
  );
}

// Adiciona listeners de clique aos botões COMPRAR recém-renderizados.
function setupBuyButtonListeners(): void {
  productGrid?.querySelectorAll(".btn-buy").forEach((button) => {
    button.removeEventListener("click", handleBuyClick);
    button.addEventListener("click", handleBuyClick);
  });
}

// Função de tratamento de clique para os botões COMPRAR
function handleBuyClick(e: Event): void {
  e.preventDefault();
  const button = e.currentTarget as HTMLButtonElement;
  const productId = button.getAttribute("data-product-id");

  if (productId) {
    addToCart(parseInt(productId, 10));
  } else {
    console.error("Botão COMPRAR clicado sem data-product-id!");
  }
}

// FUNÇÃO MESTRA (Filtros e Ordenação).
function applyFiltersAndSort(): void {
  let tempProducts = [...allProducts];

  // Filtro de Cor
  const selectedColors = Array.from(
    filtersSidebar?.querySelectorAll(
      'input[data-filter-type="color"]:checked'
    ) ?? []
  ).map((input) => (input as HTMLInputElement).value);

  if (selectedColors.length > 0) {
    tempProducts = tempProducts.filter((product) =>
      selectedColors.includes(product.color)
    );
  }

  // Filtro de Tamanho
  const selectedSizes = Array.from(
    filtersSidebar?.querySelectorAll(".size-pill.is-selected") ?? []
  ).map((pill) => pill.getAttribute("data-size") ?? "");

  if (selectedSizes.length > 0) {
    tempProducts = tempProducts.filter((product) =>
      product.size.some((size) => selectedSizes.includes(size))
    );
  }

  // Filtro de Faixa de Preço
  const selectedPrices = Array.from(
    filtersSidebar?.querySelectorAll(
      'input[data-filter-type="price"]:checked'
    ) ?? []
  ).map((input) => (input as HTMLInputElement).value);

  if (selectedPrices.length > 0) {
    tempProducts = tempProducts.filter((product) => {
      return selectedPrices.some((range) => {
        const [minStr, maxStr] = range.split("-");
        const min = parseFloat(minStr);
        const max = maxStr === "max" ? Infinity : parseFloat(maxStr);

        return product.price >= min && product.price <= max;
      });
    });
  }

  // Ordenação
  const sortValue = sortSelect?.value ?? "date";

  if (sortValue === "price-asc") {
    tempProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-desc") {
    tempProducts.sort((a, b) => b.price - a.price);
  } else if (sortValue === "date") {
    tempProducts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // Atualizar e Renderizar
  displayedProducts = tempProducts;
  renderProducts(false);
}

// Configura os Event Listeners (Carregar Mais, Ordenação e Filtros).
function setupEventListeners(): void {
  // Evento de "Carregar Mais"
  loadMoreButton?.addEventListener("click", () => renderProducts(true));

  // Evento de Ordenação
  sortSelect?.addEventListener("change", applyFiltersAndSort);

  // Evento de Filtros (Checkboxes - Cores e Preço)
  filtersSidebar?.addEventListener("change", (e) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" &&
      target.getAttribute("type") === "checkbox"
    ) {
      applyFiltersAndSort();
    }
  });

  // Evento de Clique nas Pílulas de Tamanho
  filtersSidebar?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("size-pill")) {
      target.classList.toggle("is-selected");
      applyFiltersAndSort();
    }
  });
}

// Inicia o carregamento dos produtos ao carregar o script
loadProducts();
