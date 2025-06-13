/**
 * Barcode Inventory Management for CampusWork
 * Fixed version with better error handling
 */
document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on the inventory page
  const inventoryContainer = document.getElementById("inventoryContainer")
  if (!inventoryContainer) return

  console.log("Initializing inventory barcode functionality")

  // Initialize inventory search by barcode
  initInventorySearch()

  function initInventorySearch() {
    const searchForm = document.getElementById("inventorySearchForm")
    const searchInput = document.getElementById("inventorySearchInput")
    const searchResults = document.getElementById("inventorySearchResults")

    if (!searchForm || !searchInput || !searchResults) {
      console.warn("Inventory search elements not found")
      return
    }

    // Handle form submission
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const barcode = searchInput.value.trim()
      if (barcode) {
        searchProductByBarcode(barcode)
      }
    })

    // Handle input changes (for real-time search)
    searchInput.addEventListener("input", (e) => {
      const barcode = e.target.value.trim()
      if (barcode.length >= 8) {
        // Minimum barcode length
        searchProductByBarcode(barcode)
      }
    })
  }

  function searchProductByBarcode(barcode) {
    if (!barcode) return

    const searchResults = document.getElementById("inventorySearchResults")
    if (!searchResults) return

    console.log("Searching for product with barcode:", barcode)

    // Show loading state
    searchResults.innerHTML = `
      <div class="text-center py-4">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-2 text-gray-600">Buscando producto...</p>
      </div>
    `

    // Search in current products first (client-side)
    const foundProduct = searchInCurrentProducts(barcode)
    if (foundProduct) {
      displayProductResult(foundProduct)
      return
    }

    // If not found locally, search in database
    fetch(`/api/productos/barcode/${encodeURIComponent(barcode)}`)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Producto no encontrado")
          }
          throw new Error(`Error del servidor: ${response.status}`)
        }
        return response.json()
      })
      .then((product) => {
        displayProductResult(product)
      })
      .catch((error) => {
        console.error("Error searching product:", error)
        searchResults.innerHTML = `
          <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
            <div class="flex items-center">
              <i class="ri-error-warning-line mr-2"></i>
              <p>${error.message || "Error al buscar el producto"}</p>
            </div>
            <button onclick="clearInventorySearch()" class="mt-2 text-sm underline">
              Limpiar búsqueda
            </button>
          </div>
        `
      })
  }

  function searchInCurrentProducts(barcode) {
    // Search in products displayed on the current page
    const productBarcodes = document.querySelectorAll(".product-barcode")

    for (const canvas of productBarcodes) {
      const productBarcode = canvas.getAttribute("data-barcode")
      if (productBarcode === barcode) {
        // Found matching product, extract data from the table row
        const row = canvas.closest("tr")
        if (row) {
          const cells = row.querySelectorAll("td")
          if (cells.length >= 5) {
            return {
              barcode: productBarcode,
              titulo: cells[1].querySelector(".text-sm.font-medium")?.textContent || "Producto",
              categoria: cells[2].textContent.trim(),
              precio: cells[3].textContent.replace("COP ", "").replace(/\./g, ""),
              imagen: cells[1].querySelector("img")?.src || "https://via.placeholder.com/300x200",
              disponible: cells[4].textContent.includes("Disponible"),
            }
          }
        }
      }
    }
    return null
  }

  function displayProductResult(product) {
    const searchResults = document.getElementById("inventorySearchResults")
    if (!searchResults) return

    console.log("Displaying product result:", product)

    searchResults.innerHTML = `
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div class="flex items-start gap-4">
          <div class="w-24 h-24 flex-shrink-0">
            <img src="${product.imagen || "https://via.placeholder.com/300x200"}" 
                 alt="${product.titulo}" 
                 class="w-full h-full object-cover rounded"
                 onerror="this.src='https://via.placeholder.com/300x200'">
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">${product.titulo}</h3>
            <p class="text-primary font-medium">COP ${new Intl.NumberFormat("es-CO").format(product.precio || 0)}</p>
            <p class="text-sm text-gray-600 mt-1">Categoría: ${product.categoria || "Sin categoría"}</p>
            <div class="mt-2">
              <canvas class="result-barcode" data-barcode="${product.barcode}"></canvas>
            </div>
            <div class="mt-3 flex gap-2 flex-wrap">
              <button class="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-red-700" 
                      onclick="updateInventory(${product.id || 0}, 1)">
                <i class="ri-add-line mr-1"></i> Añadir Stock
              </button>
              <button class="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300" 
                      onclick="updateInventory(${product.id || 0}, -1)">
                <i class="ri-subtract-line mr-1"></i> Reducir Stock
              </button>
              <button class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600" 
                      onclick="viewProductDetails(${product.id || 0})">
                <i class="ri-eye-line mr-1"></i> Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Initialize barcode for the result
    setTimeout(() => {
      const barcodeCanvas = searchResults.querySelector(".result-barcode")
      if (barcodeCanvas && window.JsBarcode && product.barcode) {
        try {
          window.JsBarcode(barcodeCanvas, product.barcode, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 40,
            displayValue: true,
            fontSize: 12,
            margin: 5,
          })
        } catch (e) {
          console.error("Error rendering result barcode:", e)
        }
      }
    }, 100)
  }

  // Global functions for inventory management
  window.clearInventorySearch = () => {
    const searchInput = document.getElementById("inventorySearchInput")
    const searchResults = document.getElementById("inventorySearchResults")

    if (searchInput) searchInput.value = ""
    if (searchResults) {
      searchResults.innerHTML = `
        <p class="text-center text-gray-500">Escanea o ingresa un código de barras para buscar un producto</p>
      `
    }
  }

  window.updateInventory = (productId, change) => {
    if (!productId) {
      alert("ID de producto no válido")
      return
    }

    console.log(`Updating inventory for product ${productId} by ${change}`)

    fetch("/api/productos/inventory/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: productId,
        change: change,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showNotification("Inventario actualizado correctamente", "success")
          // Optionally refresh the page or update the UI
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          showNotification("Error al actualizar inventario: " + data.message, "error")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showNotification("Error al actualizar inventario", "error")
      })
  }

  window.viewProductDetails = (productId) => {
    if (!productId) {
      alert("ID de producto no válido")
      return
    }

    // Redirect to product details or open modal
    window.open(`/admin#product-${productId}`, "_blank")
  }

  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"

    notification.className = `fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50`
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }
})
