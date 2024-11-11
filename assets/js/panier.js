function openDB() {
  const dbRequest = indexedDB.open("CoffeeShopDB", 1);
  return dbRequest;
}

function loadProductsFromCart() {
  const dbRequest = openDB();
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction("cart", "readonly");
    const store = tx.objectStore("cart");
    const request = store.getAll();

    request.onsuccess = () => {
      displayCartItems(request.result);
    };
  };
}

function displayCartItems(cartItems) {
  const cartContainer = document.getElementById("cart-items");
  cartContainer.innerHTML = "";
  let grandTotal = 0;

  cartItems.forEach((item) => {
    const row = createCartItemRow(item);
    cartContainer.appendChild(row);
    grandTotal += item.price * item.quantity;
  });

  document.getElementById("grand-total").textContent = grandTotal.toFixed(2);
}

function createCartItemRow(item) {
  const row = document.createElement("tr");

  row.innerHTML = `
      <td> <img src="${item.image_url}" alt="${item.name}" width="50"> ${
    item.name
  }</td>
      
      <td>${item.price} DH</td>
      <td>
        <button onclick="decreaseQuantity(${item.id})">-</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQuantity(${item.id})">+</button>
      </td>
      <td id="total-${item.id}">${(item.price * item.quantity).toFixed(
    2
  )} DH</td>
      <td>
        <button class="button-24" onclick="removeFromCart(${
          item.id
        })">×</button>
      </td>
    `;

  return row;
}

function increaseQuantity(itemId) {
  updateQuantity(itemId, 1);
}

function decreaseQuantity(itemId) {
  updateQuantity(itemId, -1);
}

function updateQuantity(itemId, change) {
  const dbRequest = openDB();
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction("cart", "readwrite");
    const store = tx.objectStore("cart");

    const getRequest = store.get(itemId);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      item.quantity += change;

      if (item.quantity <= 0) {
        removeFromCart(itemId);
      } else {
        store.put(item);
        loadProductsFromCart();
      }
    };
  };
}

function removeFromCart(itemId) {
  const dbRequest = openDB();
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction("cart", "readwrite");
    const store = tx.objectStore("cart");
    store.delete(itemId);

    loadProductsFromCart();
  };
}

loadProductsFromCart();
