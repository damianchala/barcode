/**
 * Barcode Scanner functionality for CampusWork
 * Fixed version with better error handling and compatibility
 */
document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on a page that needs barcode scanning
  const scanBarcodeBtn = document.getElementById("scanBarcodeBtn")
  const inventoryScanBtn = document.getElementById("inventoryScanBtn")

  // Only initialize if we have scan buttons
  if (!scanBarcodeBtn && !inventoryScanBtn) return

  let isScanning = false
  let currentStream = null

  // Create scanner modal elements
  createScannerModal()

  // Initialize scanner when button is clicked
  if (scanBarcodeBtn) {
    scanBarcodeBtn.addEventListener("click", (e) => {
      e.preventDefault()
      openScannerModal()
    })
  }

  if (inventoryScanBtn) {
    inventoryScanBtn.addEventListener("click", (e) => {
      e.preventDefault()
      openScannerModal()
    })
  }

  function createScannerModal() {
    // Check if modal already exists
    if (document.getElementById("scannerModal")) return

    // Create modal container
    const modal = document.createElement("div")
    modal.id = "scannerModal"
    modal.className = "fixed inset-0 bg-gray-900 bg-opacity-50 hidden items-center justify-center z-50"

    // Create modal content
    modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-900">Escanear Código de Barras</h2>
                    <button id="closeScannerBtn" class="text-gray-500 hover:text-gray-700">
                        <i class="ri-close-line ri-lg"></i>
                    </button>
                </div>
                <div class="mb-4">
                    <div id="scanner-container" class="relative bg-black rounded">
                        <video id="scanner-video" class="w-full h-64 bg-black rounded"></video>
                        <div class="absolute inset-0 border-2 border-red-500 opacity-50 pointer-events-none rounded"></div>
                        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-white opacity-75 pointer-events-none"></div>
                    </div>
                </div>
                <div class="mb-4">
                    <p class="text-sm text-gray-500 text-center">Coloca el código de barras dentro del marco para escanear</p>
                </div>
                <div id="scanner-result" class="mb-4 hidden">
                    <div class="bg-green-50 border border-green-200 rounded p-3">
                        <p class="font-medium text-green-800">Código escaneado:</p>
                        <p id="scanned-code" class="text-primary font-bold text-lg"></p>
                    </div>
                </div>
                <div id="scanner-error" class="mb-4 hidden">
                    <div class="bg-red-50 border border-red-200 rounded p-3">
                        <p class="text-red-800 text-sm"></p>
                    </div>
                </div>
                <div class="flex justify-between gap-2">
                    <button id="cancelScanBtn" class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded">
                        Cancelar
                    </button>
                    <button id="useBarcodeBtn" class="flex-1 bg-primary text-white px-4 py-2 rounded hidden">
                        Usar Código
                    </button>
                </div>
            </div>
        `

    // Append modal to body
    document.body.appendChild(modal)

    // Add event listeners
    document.getElementById("closeScannerBtn").addEventListener("click", closeScannerModal)
    document.getElementById("cancelScanBtn").addEventListener("click", closeScannerModal)
    document.getElementById("useBarcodeBtn").addEventListener("click", useScannedBarcode)

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeScannerModal()
      }
    })
  }

  function openScannerModal() {
    const modal = document.getElementById("scannerModal")
    if (!modal) return

    // Reset UI state
    document.getElementById("scanner-result").classList.add("hidden")
    document.getElementById("scanner-error").classList.add("hidden")
    document.getElementById("useBarcodeBtn").classList.add("hidden")

    modal.classList.remove("hidden")
    modal.classList.add("flex")

    // Check for camera permissions and start scanner
    checkCameraPermissions()
  }

  function closeScannerModal() {
    const modal = document.getElementById("scannerModal")
    if (!modal) return

    modal.classList.remove("flex")
    modal.classList.add("hidden")

    // Stop scanner and camera
    stopScanner()
  }

  async function checkCameraPermissions() {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError("Tu navegador no soporta acceso a la cámara")
        return
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      // If we get here, permission was granted
      stream.getTracks().forEach((track) => track.stop()) // Stop the test stream

      // Load Quagga and start scanning
      loadQuaggaAndStart()
    } catch (error) {
      console.error("Camera permission error:", error)
      if (error.name === "NotAllowedError") {
        showError("Permiso de cámara denegado. Por favor, permite el acceso a la cámara y recarga la página.")
      } else if (error.name === "NotFoundError") {
        showError("No se encontró ninguna cámara en tu dispositivo.")
      } else {
        showError("Error al acceder a la cámara: " + error.message)
      }
    }
  }

  function loadQuaggaAndStart() {
    // Load Quagga.js dynamically if not already loaded
    if (!window.Quagga) {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js"
      script.onload = () => {
        console.log("Quagga loaded successfully")
        initScanner()
      }
      script.onerror = () => {
        showError("Error al cargar la librería de escaneo. Verifica tu conexión a internet.")
      }
      document.head.appendChild(script)
    } else {
      initScanner()
    }
  }

  function initScanner() {
    if (!window.Quagga) {
      showError("Librería de escaneo no disponible")
      return
    }

    if (isScanning) {
      console.log("Scanner already running")
      return
    }

    const video = document.getElementById("scanner-video")
    if (!video) {
      showError("Elemento de video no encontrado")
      return
    }

    console.log("Initializing Quagga scanner...")

    // Configure Quagga
    const config = {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: video,
        constraints: {
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
          facingMode: "environment",
          aspectRatio: { min: 1, max: 2 },
        },
      },
      locator: {
        patchSize: "medium",
        halfSample: true,
      },
      numOfWorkers: 2,
      frequency: 10,
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader",
        ],
      },
      locate: true,
    }

    // Initialize Quagga
    window.Quagga.init(config, (err) => {
      if (err) {
        console.error("Quagga initialization error:", err)
        showError("Error al inicializar el escáner: " + err.message)
        return
      }

      console.log("Quagga initialized successfully")
      isScanning = true

      // Start scanner
      window.Quagga.start()

      // Register detection callback
      window.Quagga.onDetected(handleBarcodeDetected)
    })
  }

  function handleBarcodeDetected(result) {
    if (!result || !result.codeResult) return

    const code = result.codeResult.code
    console.log("Barcode detected:", code)

    // Validate barcode (basic validation)
    if (!code || code.length < 3) {
      console.log("Invalid barcode detected, ignoring")
      return
    }

    // Stop scanning
    stopScanner()

    // Display result
    document.getElementById("scanned-code").textContent = code
    document.getElementById("scanner-result").classList.remove("hidden")
    document.getElementById("useBarcodeBtn").classList.remove("hidden")

    // Store code for later use
    document.getElementById("useBarcodeBtn").setAttribute("data-code", code)

    // Play success sound (optional)
    playSuccessSound()
  }

  function stopScanner() {
    if (window.Quagga && isScanning) {
      console.log("Stopping Quagga scanner")
      window.Quagga.stop()
      isScanning = false
    }

    // Stop any active video streams
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop())
      currentStream = null
    }
  }

  function useScannedBarcode() {
    const code = document.getElementById("useBarcodeBtn").getAttribute("data-code")
    if (!code) return

    console.log("Using scanned barcode:", code)

    // Try to find barcode input fields and fill them
    const barcodeInputs = [
      document.getElementById("barcodeProducto"),
      document.getElementById("inventorySearchInput"),
      document.querySelector('input[name="barcode"]'),
      document.querySelector('input[placeholder*="barcode"]'),
      document.querySelector('input[placeholder*="código"]'),
    ]

    let inputFound = false
    for (const input of barcodeInputs) {
      if (input) {
        input.value = code
        input.dispatchEvent(new Event("input", { bubbles: true }))
        input.dispatchEvent(new Event("change", { bubbles: true }))
        inputFound = true
        break
      }
    }

    if (!inputFound) {
      console.warn("No barcode input field found")
    }

    // Generate barcode preview if we're in product creation
    const barcodePreview = document.getElementById("barcodePreview")
    if (barcodePreview && window.JsBarcode) {
      try {
        window.JsBarcode(barcodePreview, code, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 40,
          displayValue: true,
          fontSize: 12,
          margin: 5,
        })
      } catch (e) {
        console.error("Error generating barcode preview:", e)
      }
    }

    // If we're on inventory page, trigger search
    if (document.getElementById("inventorySearchInput")) {
      const searchForm = document.getElementById("inventorySearchForm")
      if (searchForm) {
        searchForm.dispatchEvent(new Event("submit"))
      }
    }

    // Close modal
    closeScannerModal()

    // Show success message
    showSuccessMessage("Código de barras escaneado: " + code)
  }

  function showError(message) {
    const errorDiv = document.getElementById("scanner-error")
    if (errorDiv) {
      errorDiv.querySelector("p").textContent = message
      errorDiv.classList.remove("hidden")
    }
    console.error("Scanner error:", message)
  }

  function showSuccessMessage(message) {
    // Create temporary success notification
    const notification = document.createElement("div")
    notification.className = "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  function playSuccessSound() {
    try {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      // Ignore audio errors
      console.log("Could not play success sound:", e.message)
    }
  }

  // Cleanup when page unloads
  window.addEventListener("beforeunload", () => {
    stopScanner()
  })
})
