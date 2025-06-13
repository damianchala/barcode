document.addEventListener("DOMContentLoaded", () => {
    // Inicializar el carrito desde localStorage o crear uno nuevo
    let cart = JSON.parse(localStorage.getItem("cart")) || []
    updateCartCount()
  
    // Cargar productos con filtros por defecto
    cargarProductos()
  
    // Mostrar/ocultar el modal del carrito
    const cartButton = document.getElementById("cartButton")
    const cartModal = document.getElementById("cartModal")
    const closeCartBtn = document.getElementById("closeCartBtn")
    const invoiceModal = document.getElementById("invoiceModal")
    const closeInvoiceBtn = document.getElementById("closeInvoiceBtn")
  
    // Manejar el envío del formulario de filtros
    const filtrosForm = document.getElementById("filtrosForm")
    if (filtrosForm) {
      filtrosForm.addEventListener("submit", (e) => {
        e.preventDefault()
        cargarProductos()
      })
    }
  
    // Manejar el cambio en el slider de precio
    const precioRangeFilter = document.getElementById("precioRangeFilter")
    const precioMaxFilter = document.getElementById("precioMaxFilter")
    if (precioRangeFilter && precioMaxFilter) {
      precioRangeFilter.addEventListener("input", function () {
        precioMaxFilter.value = this.value
        // Auto-aplicar filtros cuando cambie el slider
        setTimeout(() => cargarProductos(), 300)
      })
    }
  
    // Manejar cambios en los inputs de precio mínimo y máximo
    const precioMinFilter = document.getElementById("precioMinFilter")
    if (precioMinFilter) {
      precioMinFilter.addEventListener("change", () => {
        cargarProductos()
      })
    }
    if (precioMaxFilter) {
      precioMaxFilter.addEventListener("change", () => {
        cargarProductos()
      })
    }
  
    // Manejar cambios en los checkboxes de filtros
    const filterCheckboxes = document.querySelectorAll('input[type="checkbox"]')
    filterCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        cargarProductos()
      })
    })
  
    // Función para cargar productos con filtros
    async function cargarProductos() {
      try {
        // Obtener valores de los filtros
        const categorias = getSelectedCheckboxValues("categoriaFilter")
        const estados = getSelectedCheckboxValues("estadoFilter")
        const ubicaciones = getSelectedCheckboxValues("ubicacionFilter")
        const precioMin = document.getElementById("precioMinFilter")?.value || ""
        const precioMax = document.getElementById("precioMaxFilter")?.value || ""
  
        // Construir URL con parámetros de filtro
        let url = "/api/productos?"
        const params = new URLSearchParams()
  
        if (categorias.length > 0) params.append("categoria", categorias.join(","))
        if (estados.length > 0) params.append("estado", estados.join(","))
        if (ubicaciones.length > 0) params.append("ubicacion", ubicaciones.join(","))
        if (precioMin) params.append("precioMin", precioMin)
        if (precioMax) params.append("precioMax", precioMax)
  
        url += params.toString()
  
        // Realizar la petición
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Error al cargar productos")
        }
  
        const productos = await response.json()
  
        // Renderizar productos
        renderizarProductos(productos)
      } catch (error) {
        console.error("Error al cargar productos:", error)
        mostrarNotificacion("Error al cargar los productos. Por favor, intenta de nuevo.")
      }
    }
  
    // Función para obtener valores de checkboxes seleccionados
    function getSelectedCheckboxValues(name) {
      const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`)
      return Array.from(checkboxes).map((cb) => cb.value)
    }
  
    // Función para renderizar productos en la página
    function renderizarProductos(productos) {
      const productListings = document.getElementById("productListings")
      if (!productListings) return
  
      if (productos.length === 0) {
        productListings.innerHTML = `
                  <div class="col-span-3 text-center py-8">
                      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                          <i class="ri-search-line text-gray-400 text-4xl mb-4"></i>
                          <p class="text-gray-500 text-lg mb-2">No se encontraron productos</p>
                          <p class="text-gray-400 text-sm">Intenta ajustar los filtros para ver más resultados</p>
                          <button onclick="limpiarFiltros()" class="mt-4 bg-primary text-white px-4 py-2 rounded">
                              Limpiar filtros
                          </button>
                      </div>
                  </div>
              `
        return
      }
  
      let html = ""
      productos.forEach((producto) => {
        html += `
                  <div class="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                      <div class="h-48 overflow-hidden">
                          <img src="${producto.imagen || "https://via.placeholder.com/300x200"}" alt="${producto.titulo}" class="w-full h-full object-cover">
                      </div>
                      <div class="p-4">
                          <div class="flex justify-between items-start mb-2">
                              <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">${producto.titulo}</h3>
                              <span class="inline-block px-2 py-1 bg-red-50 text-primary text-xs rounded-full">${producto.estado || "Nuevo"}</span>
                          </div>
                          <p class="text-primary font-medium text-xl mb-2">COP ${new Intl.NumberFormat("es-CO").format(producto.precio || 0)}</p>
                          <p class="text-gray-600 text-sm mb-4 line-clamp-3">${producto.descripcion || ""}</p>
                          <div class="flex flex-wrap gap-2 mb-4">
                              <span class="inline-flex items-center text-xs text-gray-600">
                                  <i class="ri-map-pin-line mr-1"></i> ${producto.ubicacion || "Sin ubicación"}
                              </span>
                              <span class="inline-flex items-center text-xs text-gray-600">
                                  <i class="ri-time-line mr-1"></i> ${new Date(producto.fecha_publicacion).toLocaleDateString()}
                              </span>
                              ${
                                producto.vendedor_nombre
                                  ? `
                                  <span class="inline-flex items-center text-xs text-gray-600">
                                      <i class="ri-user-line mr-1"></i> ${producto.vendedor_nombre}
                                  </span>
                              `
                                  : ""
                              }
                          </div>
                          ${
                            producto.barcode
                              ? `
                              <div class="mb-4">
                                  <canvas class="product-barcode w-full h-8" data-barcode="${producto.barcode}"></canvas>
                              </div>
                          `
                              : ""
                          }
                          <div class="flex justify-between items-center">
                              <button class="bg-primary text-white px-4 py-2 rounded-full text-sm add-to-cart-btn w-full" 
                                      data-id="${producto.id}" 
                                      data-title="${producto.titulo}" 
                                      data-price="COP ${new Intl.NumberFormat("es-CO").format(producto.precio)}" 
                                      data-image="${producto.imagen || "https://via.placeholder.com/300x200"}">
                                  Agregar al carrito
                              </button>
                          </div>
                      </div>
                  </div>
              `
      })
  
      productListings.innerHTML = html
  
      // Inicializar códigos de barras para los nuevos productos
      setTimeout(() => {
        const barcodeElements = document.querySelectorAll(".product-barcode")
        barcodeElements.forEach((canvas) => {
          const barcode = canvas.getAttribute("data-barcode")
          if (barcode && window.JsBarcode) {
            try {
              window.JsBarcode(canvas, barcode, {
                format: "CODE128",
                lineColor: "#000",
                width: 1,
                height: 30,
                displayValue: true,
                fontSize: 10,
                margin: 2,
              })
            } catch (e) {
              console.error("Error rendering barcode:", e)
            }
          }
        })
      }, 100)
  
      // Volver a añadir event listeners a los botones de agregar al carrito
      document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const id = this.getAttribute("data-id")
          const title = this.getAttribute("data-title")
          const price = this.getAttribute("data-price")
          const image = this.getAttribute("data-image")
  
          // Verificar si el producto ya está en el carrito
          const existingItem = cart.find((item) => item.id === id)
  
          if (existingItem) {
            existingItem.quantity += 1
          } else {
            cart.push({
              id: id,
              title: title,
              price: price,
              image: image,
              quantity: 1,
            })
          }
  
          // Guardar en localStorage y actualizar la interfaz
          localStorage.setItem("cart", JSON.stringify(cart))
          updateCartCount()
  
          // Mostrar una notificación
          mostrarNotificacion("Producto agregado al carrito")
        })
      })
    }
  
    // Función global para limpiar filtros
    window.limpiarFiltros = () => {
      // Desmarcar todos los checkboxes
      document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
        checkbox.checked = false
      })
  
      // Limpiar inputs de precio
      const precioMinFilter = document.getElementById("precioMinFilter")
      const precioMaxFilter = document.getElementById("precioMaxFilter")
      const precioRangeFilter = document.getElementById("precioRangeFilter")
  
      if (precioMinFilter) precioMinFilter.value = ""
      if (precioMaxFilter) precioMaxFilter.value = ""
      if (precioRangeFilter) precioRangeFilter.value = precioRangeFilter.max
  
      // Recargar productos sin filtros
      cargarProductos()
    }
  
    // Función para mostrar notificaciones
    function mostrarNotificacion(message) {
      const notification = document.createElement("div")
      notification.className =
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50"
      notification.textContent = message
      document.body.appendChild(notification)
  
      setTimeout(() => {
        notification.remove()
      }, 3000)
    }
  
    // Botón para vender un producto
    const sellProductBtn = document.getElementById("sellProductBtn")
    if (sellProductBtn) {
      sellProductBtn.addEventListener("click", () => {
        document.getElementById("crearProductoModal").classList.remove("hidden")
        document.getElementById("crearProductoModal").classList.add("flex")
      })
    }
  
    // Cerrar modal de crear producto
    const closeProductoModalBtn = document.getElementById("closeProductoModalBtn")
    if (closeProductoModalBtn) {
      closeProductoModalBtn.addEventListener("click", () => {
        document.getElementById("crearProductoModal").classList.add("hidden")
        document.getElementById("crearProductoModal").classList.remove("flex")
      })
    }
  
    // Generar código de barras aleatorio
    const generateBarcodeBtn = document.getElementById("generateBarcodeBtn")
    if (generateBarcodeBtn) {
      generateBarcodeBtn.addEventListener("click", () => {
        const randomBarcode = `PRD${Math.floor(10000000 + Math.random() * 90000000)}`
        document.getElementById("barcodeProducto").value = randomBarcode
      })
    }
  
    // Manejar envío del formulario de producto
    const crearProductoForm = document.getElementById("crearProductoForm")
    if (crearProductoForm) {
      crearProductoForm.addEventListener("submit", async function (e) {
        e.preventDefault()
  
        const formData = new FormData(this)
        const productoData = {}
  
        for (const [key, value] of formData.entries()) {
          productoData[key] = value
        }
  
        // Obtener el ID del usuario del localStorage (asumiendo que se guarda al iniciar sesión)
        const userId = localStorage.getItem("userId")
        if (userId) {
          productoData.vendedor_id = userId
        }
  
        try {
          const response = await fetch("/ecommerce/productos/crear", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(productoData),
          })
  
          const data = await response.json()
  
          if (data.success) {
            mostrarNotificacion("Producto publicado con éxito")
            document.getElementById("crearProductoModal").classList.add("hidden")
            document.getElementById("crearProductoModal").classList.remove("flex")
            crearProductoForm.reset()
  
            // Recargar productos para mostrar el nuevo
            cargarProductos()
          } else {
            mostrarNotificacion("Error al publicar el producto: " + data.message)
          }
        } catch (error) {
          console.error("Error al crear producto:", error)
          mostrarNotificacion("Error al publicar el producto. Por favor, intenta de nuevo.")
        }
      })
    }
  
    if (cartButton) {
      cartButton.addEventListener("click", () => {
        cartModal.classList.remove("hidden")
        cartModal.classList.add("flex")
        renderCartItems()
      })
    }
  
    if (closeCartBtn) {
      closeCartBtn.addEventListener("click", () => {
        cartModal.classList.remove("flex")
        cartModal.classList.add("hidden")
      })
    }
  
    // Cerrar el modal al hacer clic fuera de él
    if (cartModal) {
      cartModal.addEventListener("click", (e) => {
        if (e.target === cartModal) {
          cartModal.classList.remove("flex")
          cartModal.classList.add("hidden")
        }
      })
    }
  
    // Cerrar el modal de factura al hacer clic fuera de él
    if (invoiceModal) {
      invoiceModal.addEventListener("click", (e) => {
        if (e.target === invoiceModal) {
          invoiceModal.classList.remove("flex")
          invoiceModal.classList.add("hidden")
        }
      })
    }
  
    if (closeInvoiceBtn) {
      closeInvoiceBtn.addEventListener("click", () => {
        invoiceModal.classList.remove("flex")
        invoiceModal.classList.add("hidden")
      })
    }
  
    // Función para actualizar el contador del carrito
    function updateCartCount() {
      const cartCount = document.getElementById("cartCount")
      const mobileCartCount = document.getElementById("mobileCartCount")
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  
      if (cartCount) cartCount.textContent = totalItems
      if (mobileCartCount) mobileCartCount.textContent = totalItems
    }
  
    // Función para renderizar los items del carrito
    function renderCartItems() {
      const cartItems = document.getElementById("cartItems")
      const emptyCartMessage = document.getElementById("emptyCartMessage")
      const cartSummary = document.getElementById("cartSummary")
  
      // Limpiar el contenido actual
      cartItems.innerHTML = ""
  
      if (cart.length === 0) {
        emptyCartMessage.classList.remove("hidden")
        cartSummary.classList.add("hidden")
        return
      }
  
      emptyCartMessage.classList.add("hidden")
      cartSummary.classList.remove("hidden")
  
      let subtotal = 0
  
      // Crear elementos para cada item del carrito
      cart.forEach((item) => {
        const itemPrice = Number.parseFloat(item.price.replace("COP", "").replace(/\./g, "").replace(",", "."))
        const itemTotal = itemPrice * item.quantity
        subtotal += itemTotal
  
        const cartItem = document.createElement("div")
        cartItem.className = "flex items-center border-b border-gray-100 pb-4"
        cartItem.innerHTML = `
                  <div class="w-16 h-16 overflow-hidden rounded mr-4">
                      <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1">
                      <h3 class="text-sm font-medium">${item.title}</h3>
                      <p class="text-primary text-sm">${item.price}</p>
                      <div class="flex items-center mt-2">
                          <button class="decrease-quantity" data-id="${item.id}">
                              <i class="ri-subtract-line text-gray-500"></i>
                          </button>
                          <span class="mx-2 text-sm">${item.quantity}</span>
                          <button class="increase-quantity" data-id="${item.id}">
                              <i class="ri-add-line text-gray-500"></i>
                          </button>
                      </div>
                  </div>
                  <div class="text-right">
                      <p class="font-medium">COP ${formatNumber(itemTotal)}</p>
                      <button class="remove-item text-red-500 text-sm mt-2" data-id="${item.id}">
                          <i class="ri-delete-bin-line"></i> Eliminar
                      </button>
                  </div>
              `
  
        cartItems.appendChild(cartItem)
      })
  
      // Actualizar el subtotal y total
      document.getElementById("cartSubtotal").textContent = `COP ${formatNumber(subtotal)}`
      document.getElementById("cartTotal").textContent = `COP ${formatNumber(subtotal)}`
  
      // Agregar event listeners para los botones de cantidad
      document.querySelectorAll(".decrease-quantity").forEach((button) => {
        button.addEventListener("click", function () {
          const id = this.getAttribute("data-id")
          const item = cart.find((item) => item.id === id)
  
          if (item.quantity > 1) {
            item.quantity -= 1
          } else {
            cart = cart.filter((item) => item.id !== id)
          }
  
          localStorage.setItem("cart", JSON.stringify(cart))
          updateCartCount()
          renderCartItems()
        })
      })
  
      document.querySelectorAll(".increase-quantity").forEach((button) => {
        button.addEventListener("click", function () {
          const id = this.getAttribute("data-id")
          const item = cart.find((item) => item.id === id)
          item.quantity += 1
  
          localStorage.setItem("cart", JSON.stringify(cart))
          updateCartCount()
          renderCartItems()
        })
      })
  
      document.querySelectorAll(".remove-item").forEach((button) => {
        button.addEventListener("click", function () {
          const id = this.getAttribute("data-id")
          cart = cart.filter((item) => item.id !== id)
  
          localStorage.setItem("cart", JSON.stringify(cart))
          updateCartCount()
          renderCartItems()
        })
      })
    }
  
    // Función para mostrar la factura
    function showInvoice() {
      const invoiceItems = document.getElementById("invoiceItems")
      const invoiceDate = document.getElementById("invoiceDate")
      const invoiceNumber = document.getElementById("invoiceNumber")
      const invoiceSubtotal = document.getElementById("invoiceSubtotal")
      const invoiceTax = document.getElementById("invoiceTax")
      const invoiceTotal = document.getElementById("invoiceTotal")
  
      // Establecer la fecha actual
      const currentDate = new Date()
      invoiceDate.textContent = currentDate.toLocaleDateString("es-ES")
  
      // Generar un número de factura aleatorio
      invoiceNumber.textContent = "FACT-" + Math.floor(100000 + Math.random() * 900000)
  
      // Limpiar los items anteriores
      invoiceItems.innerHTML = ""
  
      // Calcular el subtotal
      let subtotal = 0
  
      // Agregar los items a la factura
      cart.forEach((item) => {
        const itemPrice = Number.parseFloat(item.price.replace("COP", "").replace(/\./g, "").replace(",", "."))
        const itemTotal = itemPrice * item.quantity
        subtotal += itemTotal
  
        const invoiceItem = document.createElement("div")
        invoiceItem.className = "flex justify-between text-sm"
        invoiceItem.innerHTML = `
                  <span>${item.title} x ${item.quantity}</span>
                  <span>COP ${formatNumber(itemTotal)}</span>
              `
  
        invoiceItems.appendChild(invoiceItem)
      })
  
      // Calcular impuestos y total
      const tax = subtotal * 0.19 // IVA en Colombia es 19%
      const total = subtotal + tax
  
      // Actualizar los valores en la factura
      invoiceSubtotal.textContent = `COP ${formatNumber(subtotal)}`
      invoiceTax.textContent = `COP ${formatNumber(tax)}`
      invoiceTotal.textContent = `COP ${formatNumber(total)}`
  
      // Mostrar el modal de factura
      invoiceModal.classList.remove("hidden")
      invoiceModal.classList.add("flex")
    }
  
    // Función para formatear números en formato de moneda colombiana
    function formatNumber(number) {
      return new Intl.NumberFormat("es-CO").format(number)
    }
  
    // Event listener para el botón de checkout
    const checkoutBtn = document.getElementById("checkoutBtn")
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        // Cerrar el modal del carrito
        cartModal.classList.remove("flex")
        cartModal.classList.add("hidden")
  
        // Mostrar el modal de factura
        showInvoice()
      })
    }
  
    // Event listener para imprimir la factura
    const printInvoiceBtn = document.getElementById("printInvoiceBtn")
    if (printInvoiceBtn) {
      printInvoiceBtn.addEventListener("click", () => {
        window.print()
      })
    }
  
    // Event listener para descargar la factura como PDF
    const downloadInvoiceBtn = document.getElementById("downloadInvoiceBtn")
    if (downloadInvoiceBtn) {
      downloadInvoiceBtn.addEventListener("click", () => {
        alert("Funcionalidad de descarga de PDF en desarrollo")
        // Aquí se implementaría la generación y descarga del PDF
      })
    }
  })
  