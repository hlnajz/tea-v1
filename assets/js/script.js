document.addEventListener("DOMContentLoaded", function () {
  const productContent = document.getElementById("product-content");
  productContent.classList.add("grid-view");

  getProducts();

  document
    .getElementById("search-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const searchInput = document
        .getElementById("search-input")
        .value.toLowerCase();

      const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchInput)
      );
      displayProducts(filteredProducts);
    });

  document.getElementById("grid").addEventListener("click", () => {
    productContent.classList.remove("list-view");
    productContent.classList.add("grid-view");
  });

  document.getElementById("list").addEventListener("click", () => {
    productContent.classList.remove("grid-view");
    productContent.classList.add("list-view");
  });
});

let products = [];

async function getProducts() {
  try {
    const response = await fetch("https://tea-api-gules.vercel.app"); // Change this URL to your API to coffee
    if (!response.ok) throw new Error("Error fetching products.");
    products = await response.json();
    addProductsToDB(products);
    displayProducts(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    loadProductsFromDB();
  }
}

function addProductsToDB(products) {
  const dbRequest = openDB();
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction("products", "readwrite");
    const store = tx.objectStore("products");
    products.forEach((product) => store.put(product));
  };
}

function loadProductsFromDB() {
  const dbRequest = openDB();
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction("products", "readonly");
    const store = tx.objectStore("products");
    const request = store.getAll();

    request.onsuccess = () => {
      displayProducts(request.result);
    };
  };
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <img src="${product.image_url}" alt="${product.name}">
    <h3>${product.name}</h3>
    <div class="product-info">
      <p class="product-price">${product.price} DH</p>
      <p>${product.description}</p>
      <button onclick="addToCart(${product.id})" class="product-button">+</button>
    </div>
  `;
  return card;
}

function displayProducts(products) {
  const container = document.getElementById("product-content");
  container.innerHTML = "";

  products.forEach((product) => {
    const productCard = createProductCard(product);
    container.appendChild(productCard);
  });
}

function openDB() {
  const dbRequest = indexedDB.open("CoffeeShopDB", 1);

  dbRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("products")) {
      db.createObjectStore("products", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("cart")) {
      db.createObjectStore("cart", { keyPath: "id" });
    }
  };

  return dbRequest;
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);

  const dbRequest = openDB();
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction("cart", "readwrite");
    const store = tx.objectStore("cart");

    const getRequest = store.get(productId);
    getRequest.onsuccess = () => {
      const existingItem = getRequest.result;

      if (existingItem) {
        existingItem.quantity += 1;
        store.put(existingItem);
      } else {
        const cartItem = { ...product, quantity: 1 };
        store.put(cartItem);
      }
    };

    getRequest.onerror = () => {
      const cartItem = { ...product, quantity: 1 };
      store.put(cartItem);
    };
  };
}

getProducts();
