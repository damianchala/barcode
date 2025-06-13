/**
 * Barcode functionality for CampusWork
 */
document.addEventListener("DOMContentLoaded", () => {
  // Load JsBarcode library
  const script = document.createElement("script")
  script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"
  script.onload = initBarcodes
  document.head.appendChild(script)

  let JsBarcode // Declare JsBarcode variable

  function initBarcodes() {
    // Initialize barcode generator for product form
    initBarcodeGenerator()

    // Render all product barcodes on the page
    renderProductBarcodes()
  }

  function initBarcodeGenerator() {
    const generateBarcodeBtn = document.getElementById("generateBarcodeBtn")
    const barcodeInput = document.getElementById("barcodeProducto")
    const barcodePreview = document.getElementById("barcodePreview")

    if (!generateBarcodeBtn || !barcodeInput || !barcodePreview) return

    // Generate random barcode when button is clicked
    generateBarcodeBtn.addEventListener("click", () => {
      // Generate a random barcode in format PRD + 8 digits
      const randomBarcode = "PRD" + Math.floor(10000000 + Math.random() * 90000000)
      barcodeInput.value = randomBarcode

      // Generate barcode preview
      renderBarcode(barcodePreview, randomBarcode)
    })

    // Update barcode preview when input changes
    barcodeInput.addEventListener("input", function () {
      if (this.value.length > 0) {
        renderBarcode(barcodePreview, this.value)
      }
    })
  }

  function renderProductBarcodes() {
    // Find all barcode canvases
    const barcodeElements = document.querySelectorAll(".product-barcode")

    barcodeElements.forEach((canvas) => {
      const barcode = canvas.getAttribute("data-barcode")
      if (barcode) {
        renderBarcode(canvas, barcode)
      }
    })
  }

  function renderBarcode(canvas, value) {
    try {
      JsBarcode(canvas, value, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 5,
      })
    } catch (e) {
      console.error("Error rendering barcode:", e)
    }
  }

  window.JsBarcode = window.JsBarcode || {} // Import or declare JsBarcode variable
})
