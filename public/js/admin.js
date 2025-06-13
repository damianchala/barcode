document.addEventListener("DOMContentLoaded", () => {
  // Función para cargar las oportunidades recientes
  async function loadRecentOportunidades() {
    try {
      // Obtener datos reales de la API
      const response = await fetch("/api/oportunidades?limit=5")
      if (!response.ok) {
        throw new Error("Error al cargar oportunidades: " + response.status)
      }

      const oportunidades = await response.json()

      // Actualizar contador
      const totalOportunidadesElement = document.getElementById("totalOportunidades")
      if (totalOportunidadesElement) {
        totalOportunidadesElement.textContent = oportunidades.length
      }

      // Limpiar tabla
      const tableBody = document.getElementById("recentOportunidadesTableBody")
      if (!tableBody) {
        console.warn("No se encontró el elemento recentOportunidadesTableBody")
        return
      }

      tableBody.innerHTML = ""

      // Agregar filas
      oportunidades.forEach((op) => {
        const row = document.createElement("tr")
        row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${op.titulo}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-500">${op.empresa}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ${op.modalidad}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(op.fecha_publicacion).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ${op.estado}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" class="text-primary hover:text-red-700 mr-3">Editar</a>
                        <a href="#" class="text-gray-600 hover:text-gray-900">Ver</a>
                    </td>
                `
        tableBody.appendChild(row)
      })
    } catch (error) {
      console.error("Error al cargar oportunidades:", error)
      // No lanzar el error para evitar que se propague
    }
  }

  // Cargar datos iniciales
  loadRecentOportunidades()

  // Cargar usuarios (simulado)
  document.getElementById("totalUsuarios").textContent = "42"

  // Modal para nueva oportunidad
  const nuevaOportunidadBtn = document.getElementById("nuevaOportunidadBtn")
  const crearOportunidadModal = document.getElementById("crearOportunidadModal")
  const closeModalBtn = document.getElementById("closeModalBtn")

  // Modal para nuevo producto
  const nuevoProductoBtn = document.getElementById("nuevoProductoBtn")
  const crearProductoModal = document.getElementById("crearProductoModal")
  const closeProductoModalBtn = document.getElementById("closeProductoModalBtn")

  // Referencias a elementos del DOM para productos
  const verProductosBtn = document.getElementById("verProductosBtn")
  const productosModal = document.getElementById("productosModal")
  const cerrarProductosModalBtn = document.getElementById("cerrarProductosModalBtn")
  const productosTableBody = document.getElementById("productosTableBody")

  // Modal de detalles del producto
  const detalleProductoModal = document.getElementById("detalleProductoModal")
  const cerrarDetalleProductoBtn = document.getElementById("cerrarDetalleProductoBtn")
  const detalleProductoTitulo = document.getElementById("detalleProductoTitulo")
  const detalleProductoContenido = document.getElementById("detalleProductoContenido")

  // Modal de confirmación de eliminación
  const confirmarEliminarModal = document.getElementById("confirmarEliminarModal")
  const cancelarEliminarBtn = document.getElementById("cancelarEliminarBtn")
  const confirmarEliminarBtn = document.getElementById("confirmarEliminarBtn")
  let productoIdAEliminar = null

  // Función para cerrar todos los modales
  function cerrarTodosLosModales() {
    if (crearOportunidadModal) crearOportunidadModal.classList.add("hidden")
    if (crearProductoModal) crearProductoModal.classList.add("hidden")
    if (productosModal) productosModal.classList.add("hidden")
    if (detalleProductoModal) detalleProductoModal.classList.add("hidden")
    if (confirmarEliminarModal) confirmarEliminarModal.classList.add("hidden")
  }

  // Event listeners para modal de nueva oportunidad
  if (nuevaOportunidadBtn) {
    nuevaOportunidadBtn.addEventListener("click", (e) => {
      e.preventDefault()
      cerrarTodosLosModales()
      crearOportunidadModal.classList.remove("hidden")
    })
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      crearOportunidadModal.classList.add("hidden")
    })
  }

  // Event listeners para modal de nuevo producto
  if (nuevoProductoBtn) {
    nuevoProductoBtn.addEventListener("click", (e) => {
      e.preventDefault()
      cerrarTodosLosModales()
      crearProductoModal.classList.remove("hidden")
    })
  }

  if (closeProductoModalBtn) {
    closeProductoModalBtn.addEventListener("click", () => {
      crearProductoModal.classList.add("hidden")
    })
  }

  // Cerrar modal al hacer clic fuera del contenido
  if (crearProductoModal) {
    crearProductoModal.addEventListener("click", (e) => {
      if (e.target === crearProductoModal) {
        crearProductoModal.classList.add("hidden")
      }
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

      try {
        const response = await fetch("/admin/productos/crear", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productoData),
        })

        const data = await response.json()

        if (data.success) {
          alert("Producto creado con éxito")
          crearProductoModal.classList.add("hidden")
          crearProductoForm.reset()
        } else {
          alert("Error al crear el producto: " + data.message)
        }
      } catch (error) {
        console.error("Error al crear producto:", error)
        alert("Error al crear el producto. Por favor, intenta de nuevo.")
      }
    })
  }

  // Abrir modal de productos al hacer clic en el botón
  if (verProductosBtn) {
    verProductosBtn.addEventListener("click", (e) => {
      e.preventDefault()
      cerrarTodosLosModales()
      cargarProductos()
      productosModal.classList.remove("hidden")
    })
  }

  // Cerrar modal de productos
  if (cerrarProductosModalBtn) {
    cerrarProductosModalBtn.addEventListener("click", () => {
      productosModal.classList.add("hidden")
    })
  }

  // Cerrar modal de productos al hacer clic fuera del contenido
  if (productosModal) {
    productosModal.addEventListener("click", (e) => {
      if (e.target === productosModal) {
        productosModal.classList.add("hidden")
      }
    })
  }

  // Cerrar modal de detalles del producto
  if (cerrarDetalleProductoBtn) {
    cerrarDetalleProductoBtn.addEventListener("click", () => {
      detalleProductoModal.classList.add("hidden")
    })
  }

  // Cerrar modal de detalles al hacer clic fuera del contenido
  if (detalleProductoModal) {
    detalleProductoModal.addEventListener("click", (e) => {
      if (e.target === detalleProductoModal) {
        detalleProductoModal.classList.add("hidden")
      }
    })
  }

  // Cerrar modal de confirmación de eliminación
  if (cancelarEliminarBtn) {
    cancelarEliminarBtn.addEventListener("click", () => {
      confirmarEliminarModal.classList.add("hidden")
    })
  }

  // Cerrar modal de confirmación al hacer clic fuera del contenido
  if (confirmarEliminarModal) {
    confirmarEliminarModal.addEventListener("click", (e) => {
      if (e.target === confirmarEliminarModal) {
        confirmarEliminarModal.classList.add("hidden")
      }
    })
  }

  // Confirmar eliminación de producto
  if (confirmarEliminarBtn) {
    confirmarEliminarBtn.addEventListener("click", () => {
      if (productoIdAEliminar) {
        eliminarProducto(productoIdAEliminar)
      }
    })
  }

  // Función para cargar productos
  async function cargarProductos() {
    try {
      const response = await fetch("/api/productos")
      if (!response.ok) {
        throw new Error("Error al cargar productos")
      }

      const productos = await response.json()

      // Limpiar tabla
      productosTableBody.innerHTML = ""

      // Agregar filas
      productos.forEach((producto) => {
        const row = document.createElement("tr")
        row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${producto.titulo}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-500">$${producto.precio}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ${producto.estado}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${producto.categoria || "Sin categoría"}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900 mr-3 ver-detalle" data-id="${producto.id}">
                            <i class="ri-eye-line"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900 eliminar-producto" data-id="${producto.id}">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </td>
                `
        productosTableBody.appendChild(row)
      })

      // Agregar event listeners a los botones de ver detalle
      document.querySelectorAll(".ver-detalle").forEach((btn) => {
        btn.addEventListener("click", function () {
          const productoId = this.getAttribute("data-id")
          mostrarDetalleProducto(productoId, productos)
        })
      })

      // Agregar event listeners a los botones de eliminar
      document.querySelectorAll(".eliminar-producto").forEach((btn) => {
        btn.addEventListener("click", function () {
          const productoId = this.getAttribute("data-id")
          productoIdAEliminar = productoId
          confirmarEliminarModal.classList.remove("hidden")
        })
      })
    } catch (error) {
      console.error("Error al cargar productos:", error)
      alert("Error al cargar los productos. Por favor, intenta de nuevo.")
    }
  }

  // Función para mostrar detalle de producto
  function mostrarDetalleProducto(id, productos) {
    const producto = productos.find((p) => p.id == id)

    if (producto) {
      detalleProductoTitulo.textContent = producto.titulo

      detalleProductoContenido.innerHTML = `
                <div class="mb-4">
                    <img src="${producto.imagen}" alt="${producto.titulo}" class="w-full h-48 object-cover rounded">
                </div>
                <div class="mb-4">
                    <canvas class="product-barcode" data-barcode="${producto.barcode || `PRD${String(producto.id).padStart(8, "0")}`}"></canvas>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-500">Precio</p>
                        <p class="font-medium">$${producto.precio}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Estado</p>
                        <p class="font-medium">${producto.estado}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Categoría</p>
                        <p class="font-medium">${producto.categoria || "Sin categoría"}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Ubicación</p>
                        <p class="font-medium">${producto.ubicacion || "No especificada"}</p>
                    </div>
                </div>
                <div class="mt-4">
                    <p class="text-sm text-gray-500">Descripción</p>
                    <p class="text-sm mt-1">${producto.descripcion}</p>
                </div>
                <div class="mt-4">
                    <p class="text-sm text-gray-500">Disponibilidad</p>
                    <p class="font-medium">${producto.disponible ? "Disponible" : "No disponible"}</p>
                </div>
                <div class="mt-4">
                    <p class="text-sm text-gray-500">Fecha de publicación</p>
                    <p class="font-medium">${new Date(producto.fecha_publicacion).toLocaleDateString()}</p>
                </div>
            `

      detalleProductoModal.classList.remove("hidden")

      // Initialize barcode after modal is shown
      setTimeout(() => {
        const barcodeCanvas = detalleProductoContenido.querySelector(".product-barcode")
        if (barcodeCanvas && window.JsBarcode) {
          const barcode = barcodeCanvas.getAttribute("data-barcode")
          if (barcode) {
            window.JsBarcode(barcodeCanvas, barcode, {
              format: "CODE128",
              lineColor: "#000",
              width: 2,
              height: 40,
              displayValue: true,
              fontSize: 12,
              margin: 5,
            })
          }
        }
      }, 100)
    }
  }

  // Función para eliminar producto
  async function eliminarProducto(id) {
    try {
      const response = await fetch(`/api/productos/eliminar/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el producto")
      }

      // Cerrar modal de confirmación
      confirmarEliminarModal.classList.add("hidden")

      // Recargar la lista de productos
      cargarProductos()

      // Mostrar mensaje de éxito
      alert("Producto eliminado correctamente")
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      alert("Error al eliminar el producto. Por favor, intenta de nuevo.")
    }
  }
})

// Manejar envío del formulario de oportunidad
const crearOportunidadForm = document.getElementById("crearOportunidadForm")
if (crearOportunidadForm) {
  crearOportunidadForm.addEventListener("submit", async function (e) {
    e.preventDefault()

    const formData = new FormData(this)
    const oportunidadData = {}

    for (const [key, value] of formData.entries()) {
      oportunidadData[key] = value
    }

    try {
      const response = await fetch("/admin/oportunidades/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(oportunidadData),
      })

      const data = await response.json()

      if (data.success) {
        alert("Oportunidad creada con éxito")
        const crearOportunidadModal = document.getElementById("crearOportunidadModal")
        if (crearOportunidadModal) {
          crearOportunidadModal.classList.add("hidden")
        }
        crearOportunidadForm.reset()

        // Recargar las oportunidades recientes con manejo de errores
        try {
          await window.loadRecentOportunidades()
        } catch (loadError) {
          console.error("Error al recargar oportunidades:", loadError)
          // No mostrar alerta de error aquí para evitar confusión
        }
      } else {
        alert("Error al crear la oportunidad: " + data.message)
      }
    } catch (error) {
      console.error("Error al crear oportunidad:", error)
      alert("Error al crear la oportunidad. Por favor, intenta de nuevo.")
    }
  })
}
