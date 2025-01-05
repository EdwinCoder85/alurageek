document
  .getElementById("add-product-form")
  .addEventListener("submit", handleFormSubmit);

// Manejo del formulario: agregar o actualizar producto
async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const productData = {
    nombre: form.nombre.value,
    precio: form.precio.value,
    imagen: form.imagen.value,
  };
  const productId = form["product-id"].value;

  const url = productId
    ? `https://6779bafa671ca03068325c41.mockapi.io/api/v1/products/${productId}`
    : "https://6779bafa671ca03068325c41.mockapi.io/api/v1/products";

  const method = productId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    if (response.ok) {
      const product = await response.json();
      productId ? updateProductInUI(product) : renderProduct(product);
      // Cambiar el texto del <h2> cuando se edita un producto
      document.querySelector("aside.agregar-producto h2").textContent =
        "Agregar Producto";
      resetForm(form);
    } else {
      console.error(
        `Error al ${productId ? "actualizar" : "agregar"} el producto`
      );
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
  }
}

// Resetea el formulario y limpia el campo de ID
function resetForm(form) {
  form.reset();
  form["product-id"].value = "";
}

// Valida y formatea el precio en tiempo real
const precioInput = document.getElementById("precio");
precioInput.addEventListener("input", formatPrice);

function formatPrice() {
  const value = this.value.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
  this.value = value ? `S/ ${value}` : "";
}

function openModal(imageSrc, title, price) {
  const modal = document.getElementById("modal");
  const modalImage = modal.querySelector("#modal-image"); // Asegúrate de que exista un elemento con este ID
  const modalTitle = modal.querySelector("#modal-title"); // Asegúrate de que exista un elemento con este ID
  const modalPrice = modal.querySelector("#modal-price"); // Asegúrate de que exista un elemento con este ID

  if (modalImage && modalTitle) {
    modalImage.src = imageSrc;
    modalTitle.textContent = title;
    modalPrice.textContent = price;
    modal.classList.add("show");
  } else {
    console.error("No se encontró el modal o sus elementos.");
  }
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
}

document.getElementById("modal").addEventListener("click", function (e) {
  if (e.target.id === "modal") closeModal();
});

// Carga de productos desde el servidor
async function loadProducts() {
  try {
    const response = await fetch(
      "https://6779bafa671ca03068325c41.mockapi.io/api/v1/products"
    );
    if (response.ok) {
      const products = await response.json();
      products.forEach(renderProduct);
    } else {
      console.error("Error al obtener los productos");
    }
  } catch (error) {
    console.error("Error al obtener los productos", error);
  }
}

loadProducts();

// Renderizar producto
function renderProduct(product) {
  const template = document.querySelector(".producto-nuevo");
  const productElement = template.cloneNode(true);

  productElement.classList.remove("producto-nuevo");
  productElement.removeAttribute("hidden");
  productElement.classList.add("producto");
  productElement.dataset.productId = product.id;

  // Configuración de los datos del producto
  const [img, title, price, id] = [
    productElement.querySelector("img"),
    productElement.querySelector("h3"),
    productElement.querySelector("p"),
    productElement.querySelector("h4"),
  ];

  img.src = product.imagen;
  img.alt = product.nombre;
  title.textContent = product.nombre;
  price.textContent = product.precio;
  id.textContent = product.id;

  img.addEventListener("click", () =>
    openModal(product.imagen, product.nombre, product.precio)
  );
  productElement
    .querySelector(".eliminar")
    .addEventListener("click", () => deleteProduct(product.id, productElement));
  productElement
    .querySelector(".editar")
    .addEventListener("click", () => loadProductToForm(product));

  document.querySelector(".grid-productos").appendChild(productElement);
}

// Cargar producto en el formulario para edición
function loadProductToForm(product) {
  const form = document.getElementById("add-product-form");
  form.nombre.value = product.nombre;
  form.precio.value = product.precio;
  form.imagen.value = product.imagen;
  form["product-id"].value = product.id;

  // Cambiar el texto del <h2> cuando se edita un producto
  document.querySelector("aside.agregar-producto h2").textContent =
    "Editar Producto";
}

// Eliminar producto
async function deleteProduct(productId, productElement) {
  try {
    const response = await fetch(
      `https://6779bafa671ca03068325c41.mockapi.io/api/v1/products/${productId}`,
      { method: "DELETE" }
    );
    if (response.ok) {
      productElement.remove();
    } else {
      console.error("Error al eliminar el producto");
    }
  } catch (error) {
    console.error("Error al eliminar el producto", error);
  }
}

// Actualizar producto en la UI
function updateProductInUI(updatedProduct) {
  const productElement = document.querySelector(
    `[data-product-id='${updatedProduct.id}']`
  );
  if (productElement) {
    const [img, title, price] = [
      productElement.querySelector("img"),
      productElement.querySelector("h3"),
      productElement.querySelector("p"),
    ];

    img.src = updatedProduct.imagen;
    title.textContent = updatedProduct.nombre;
    price.textContent = updatedProduct.precio;
  }
}
