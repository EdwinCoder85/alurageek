// Selección de elementos del DOM
const form = document.getElementById("add-product-form");
const priceInput = document.getElementById("precio");
const modal = document.getElementById("modal");
const gridProductos = document.querySelector(".grid-productos");

// Configuración inicial
document.addEventListener("DOMContentLoaded", loadProducts);

// Event Listeners
form.addEventListener("submit", handleFormSubmit);
priceInput.addEventListener("input", formatPriceInput);
modal.addEventListener("click", handleModalClick);

// Función para manejar el envío del formulario
async function handleFormSubmit(e) {
  e.preventDefault();

  const productId = form["product-id"].value;
  const productData = getProductDataFromForm();

  try {
    if (productId) {
      // Actualizar producto existente
      await updateProduct(productId, productData);
    } else {
      // Crear nuevo producto
      await createProduct(productData);
    }
    resetForm();
  } catch (error) {
    console.error("Error al procesar el formulario:", error);
  }
}

// Obtiene datos del formulario
function getProductDataFromForm() {
  return {
    nombre: form.nombre.value.trim(),
    precio: form.precio.value.trim(),
    imagen: form.imagen.value.trim(),
  };
}

// Crea un nuevo producto
async function createProduct(productData) {
  try {
    const response = await fetch("https://6779bafa671ca03068325c41.mockapi.io/api/v1/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    if (!response.ok) throw new Error("Error al crear el producto");
    const newProduct = await response.json();
    renderProduct(newProduct);
  } catch (error) {
    console.error("Error en la creación del producto:", error);
  }
}

// Actualiza un producto existente
async function updateProduct(productId, productData) {
  try {
    const response = await fetch(
      `https://6779bafa671ca03068325c41.mockapi.io/api/v1/products/${productId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      }
    );

    if (!response.ok) throw new Error("Error al actualizar el producto");
    const updatedProduct = await response.json();
    updateProductInUI(updatedProduct);
  } catch (error) {
    console.error("Error en la actualización del producto:", error);
  }
}

// Carga los productos del servidor
async function loadProducts() {
  try {
    const response = await fetch("https://6779bafa671ca03068325c41.mockapi.io/api/v1/products");
    if (!response.ok) throw new Error("Error al cargar los productos");

    const products = await response.json();
    products.forEach(renderProduct);
  } catch (error) {
    console.error("Error en la carga de productos:", error);
  }
}

// Renderiza un producto en la lista
function renderProduct(product) {
  const template = document.querySelector(".producto-nuevo");
  const productElement = template.cloneNode(true);

  productElement.classList.remove("producto-nuevo");
  productElement.removeAttribute("hidden");
  productElement.dataset.productId = product.id;

  // Configuración del contenido del producto
  productElement.querySelector("img").src = product.imagen;
  productElement.querySelector("img").alt = product.nombre;
  productElement.querySelector("h3").textContent = product.nombre;
  productElement.querySelector("p").textContent = product.precio;

  // Eventos de acciones
  productElement.querySelector("img").addEventListener("click", () => openModal(product));
  productElement.querySelector(".eliminar").addEventListener("click", () => deleteProduct(product.id, productElement));
  productElement.querySelector(".editar").addEventListener("click", () => loadProductToForm(product));

  gridProductos.appendChild(productElement);
}

// Actualiza el producto en la interfaz
function updateProductInUI(updatedProduct) {
  const productElement = document.querySelector(`[data-product-id='${updatedProduct.id}']`);
  if (productElement) {
    productElement.querySelector("img").src = updatedProduct.imagen;
    productElement.querySelector("h3").textContent = updatedProduct.nombre;
    productElement.querySelector("p").textContent = updatedProduct.precio;
  }
}

// Borra un producto del servidor y de la UI
async function deleteProduct(productId, productElement) {
  try {
    const response = await fetch(
      `https://6779bafa671ca03068325c41.mockapi.io/api/v1/products/${productId}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error("Error al eliminar el producto");

    productElement.remove();
  } catch (error) {
    console.error("Error en la eliminación del producto:", error);
  }
}

// Carga un producto en el formulario para editar
function loadProductToForm(product) {
  form.nombre.value = product.nombre;
  form.precio.value = product.precio;
  form.imagen.value = product.imagen;
  form["product-id"].value = product.id;
}

// Resetea el formulario
function resetForm() {
  form.reset();
  form["product-id"].value = "";
}

// Formatea el precio mientras el usuario escribe
function formatPriceInput() {
  const value = this.value.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
  this.value = value ? `US$ ${value}` : "";
}

// Abre el modal con detalles del producto
function openModal({ imagen, nombre, precio }) {
  modal.querySelector("#modal-img").src = imagen;
  modal.querySelector("#modal-title").textContent = nombre;
  modal.classList.add("show");
}

// Maneja el clic en el modal para cerrarlo
function handleModalClick(e) {
  if (e.target.id === "modal") closeModal();
}

// Cierra el modal
function closeModal() {
  modal.classList.remove("show");
}
