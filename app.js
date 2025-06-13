const express = require("express")
const path = require("path")
const db = require("./config/database") // Importamos la conexión a la base de datos MySQL

const app = express()

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Ruta principal: muestra perfiles
app.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM usuarios") // Consultamos todos los usuarios
    res.render("profiles", { usuarios: rows })
  } catch (err) {
    console.error("Error al cargar perfiles:", err)
    res.status(500).send("Error al cargar perfiles")
  }
})

// Login con selección de perfil
app.get("/login/:id", async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.execute("SELECT * FROM usuarios WHERE id = ?", [id])
    const usuario = rows[0]
    if (!usuario) return res.status(404).send("Usuario no encontrado")

    // Si es un superadmin, redirigir a la vista superadmin.ejs
    if (usuario.rol === "superadmin") {
      // Obtener todos los usuarios para mostrarlos en la tabla
      const [usuarios] = await db.execute("SELECT * FROM usuarios")
      return res.render("superadmin", { usuario, usuarios })
    }

    // Si es un admin, redirigir a la vista admin.ejs
    if (usuario.rol === "admin") {
      // Obtener conteo de oportunidades y usuarios para el dashboard
      const [oportunidades] = await db.execute("SELECT COUNT(*) as total FROM oportunidades")
      const [usuarios] = await db.execute("SELECT COUNT(*) as total FROM usuarios")

      return res.render("admin", {
        usuario,
        totalOportunidades: oportunidades[0].total,
        totalUsuarios: usuarios[0].total,
      })
    }

    // Si no es superadmin ni admin, renderizar el login normal
    res.render("login", { perfilId: usuario.id, email: usuario.email })
  } catch (err) {
    console.error("Error al cargar login:", err)
    res.status(500).send("Error al cargar login")
  }
})

// API para login con perfil seleccionado
app.post("/api/usuarios/login-perfil", async (req, res) => {
  const { email, password, perfilId } = req.body
  try {
    const [rows] = await db.execute("SELECT * FROM usuarios WHERE id = ? AND email = ?", [perfilId, email])
    const usuario = rows[0]
    if (!usuario) return res.status(403).json({ error: "No autorizado" })

    // Simulando validación de contraseña
    const passwordCorrecta = password === usuario.password // Cambiar por bcrypt en producción
    if (!passwordCorrecta) return res.status(401).json({ error: "Contraseña incorrecta" })

    // Si es superadmin, redirigir a la vista superadmin
    if (usuario.rol === "superadmin") {
      return res.json({
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        redirectUrl: "/superadmin", // Redirigir a la página de superadmin
      })
    }

    // Si es admin, redirigir a la vista admin
    if (usuario.rol === "admin") {
      return res.json({
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        redirectUrl: "/admin", // Redirigir a la página de admin
      })
    }

    // Si es usuario normal, redirigir a la página principal o dashboard
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      redirectUrl: "/campuswork", // Redirigir al dashboard general
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

app.get("/superadmin", async (req, res) => {
  try {
    const [usuarios] = await db.execute("SELECT * FROM usuarios")
    console.log(usuarios) // Verifica el contenido de usuarios
    // Asegúrate de que usuarios siempre sea un arreglo, incluso si está vacío
    res.render("superadmin", { usuarios: usuarios || [] })
  } catch (err) {
    console.error("Error al cargar el panel de superadmin:", err)
    res.status(500).send("Error al cargar el panel de superadmin")
  }
})

// Ruta para crear un nuevo usuario (normal, admin, superadmin)
app.post("/superadmin/crear", async (req, res) => {
  const { nombre, email, password, rol } = req.body
  try {
    // Insertar el nuevo usuario en la base de datos
    await db.execute("INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)", [
      nombre,
      email,
      password,
      rol,
    ])
    // Redirigir al panel de administración
    res.redirect("/superadmin")
  } catch (err) {
    console.error("Error al crear usuario:", err)
    res.status(500).send("Error al crear usuario")
  }
})

// Ruta para editar un usuario (normal, admin, superadmin)
app.put("/api/usuarios/editar/:id", async (req, res) => {
  const { id } = req.params
  const { nombre, email, password, rol } = req.body
  try {
    const [result] = await db.execute("UPDATE usuarios SET nombre = ?, email = ?, password = ?, rol = ? WHERE id = ?", [
      nombre,
      email,
      password,
      rol,
      id,
    ])
    res.status(200).json({ message: "Usuario actualizado correctamente" })
  } catch (err) {
    console.error("Error al editar usuario:", err)
    res.status(500).json({ error: "Error al editar usuario" })
  }
})

// Ruta para eliminar un usuario
app.delete("/api/usuarios/eliminar/:id", async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.execute("DELETE FROM usuarios WHERE id = ?", [id])
    res.status(200).json({ message: "Usuario eliminado correctamente" })
  } catch (err) {
    console.error("Error al eliminar usuario:", err)
    res.status(500).json({ error: "Error al eliminar usuario" })
  }
})

// Ruta para la página principal de CampusWork
app.get("/campuswork", async (req, res) => {
  try {
    // Consultamos todas las oportunidades activas
    const [oportunidades] = await db.execute(
      "SELECT * FROM oportunidades WHERE estado = 'activa' ORDER BY fecha_publicacion DESC",
    )

    res.render("campuswork", { oportunidades })
  } catch (err) {
    console.error("Error al cargar oportunidades:", err)
    res.status(500).send("Error al cargar oportunidades")
  }
})

// Ruta para buscar oportunidades por nombre
app.get("/campuswork/buscar", async (req, res) => {
  try {
    const { query } = req.query

    // Si no hay consulta, redirigir a la página principal
    if (!query) {
      return res.redirect("/campuswork")
    }

    // Buscar oportunidades que coincidan con el título (usando LIKE para búsqueda parcial)
    const [oportunidades] = await db.execute(
      "SELECT * FROM oportunidades WHERE titulo LIKE ? AND estado = 'activa' ORDER BY fecha_publicacion DESC",
      [`%${query}%`],
    )

    // Renderizar la misma vista pero con los resultados filtrados
    res.render("campuswork", {
      oportunidades,
      searchQuery: query,
    })
  } catch (err) {
    console.error("Error al buscar oportunidades:", err)
    res.status(500).send("Error al buscar oportunidades")
  }
})

// Ruta para el panel de administrador
app.get("/admin", async (req, res) => {
  try {
    // Obtener conteo de oportunidades y usuarios para el dashboard
    const [oportunidades] = await db.execute("SELECT COUNT(*) as total FROM oportunidades")
    const [usuarios] = await db.execute("SELECT COUNT(*) as total FROM usuarios")

    // Obtener las últimas 5 oportunidades para mostrar en la tabla
    const [ultimasOportunidades] = await db.execute(
      "SELECT * FROM oportunidades ORDER BY fecha_publicacion DESC LIMIT 5",
    )

    res.render("admin", {
      totalOportunidades: oportunidades[0].total,
      totalUsuarios: usuarios[0].total,
      oportunidades: ultimasOportunidades,
    })
  } catch (err) {
    console.error("Error al cargar el panel de administrador:", err)
    res.status(500).send("Error al cargar el panel de administrador")
  }
})

// Ruta para crear un nuevo producto (para administradores)
app.post("/admin/productos/crear", async (req, res) => {
  try {
    const { titulo, descripcion, precio, estado, categoria, imagen, ubicacion, barcode } = req.body

    // Generar un código de barras si no se proporciona uno
    const codigoBarras = barcode || `PRD${Math.floor(10000000 + Math.random() * 90000000)}`

    // Insertar el nuevo producto en la base de datos
    await db.execute(
      "INSERT INTO productos (titulo, descripcion, precio, estado, categoria, imagen, ubicacion, barcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        titulo,
        descripcion,
        precio,
        estado,
        categoria,
        imagen || "https://via.placeholder.com/300x200",
        ubicacion,
        codigoBarras,
      ],
    )

    res.status(201).json({ success: true, message: "Producto creado con éxito" })
  } catch (err) {
    console.error("Error al crear producto:", err)
    res.status(500).json({ success: false, message: "Error al crear el producto" })
  }
})

// Ruta para crear un nuevo producto (para usuarios regulares)
app.post("/ecommerce/productos/crear", async (req, res) => {
  try {
    const { titulo, descripcion, precio, estado, categoria, imagen, ubicacion, barcode, vendedor_id } = req.body

    // Generar un código de barras si no se proporciona uno
    const codigoBarras = barcode || `PRD${Math.floor(10000000 + Math.random() * 90000000)}`

    // Insertar el nuevo producto en la base de datos
    await db.execute(
      "INSERT INTO productos (titulo, descripcion, precio, estado, categoria, imagen, ubicacion, barcode, vendedor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        titulo,
        descripcion,
        precio,
        estado,
        categoria,
        imagen || "https://via.placeholder.com/300x200",
        ubicacion,
        codigoBarras,
        vendedor_id,
      ],
    )

    res.status(201).json({ success: true, message: "Producto publicado con éxito" })
  } catch (err) {
    console.error("Error al crear producto:", err)
    res.status(500).json({ success: false, message: "Error al publicar el producto" })
  }
})

// Ruta para obtener todos los productos con filtros
app.get("/api/productos", async (req, res) => {
  try {
    // Parámetros de paginación
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 100
    const offset = (page - 1) * limit

    // Parámetros de filtros
    const { categoria, estado, ubicacion, precioMin, precioMax } = req.query

    // Construir la consulta SQL dinámicamente
    let query =
      "SELECT p.*, u.nombre as vendedor_nombre FROM productos p LEFT JOIN usuarios u ON p.vendedor_id = u.id WHERE p.disponible = 1"
    const params = []

    // Aplicar filtros
    if (categoria) {
      const categorias = categoria.split(",")
      const placeholders = categorias.map(() => "?").join(",")
      query += ` AND p.categoria IN (${placeholders})`
      params.push(...categorias)
    }

    if (estado) {
      const estados = estado.split(",")
      const placeholders = estados.map(() => "?").join(",")
      query += ` AND p.estado IN (${placeholders})`
      params.push(...estados)
    }

    if (ubicacion) {
      const ubicaciones = ubicacion.split(",")
      const placeholders = ubicaciones.map(() => "?").join(",")
      query += ` AND p.ubicacion IN (${placeholders})`
      params.push(...ubicaciones)
    }

    if (precioMin) {
      query += " AND p.precio >= ?"
      params.push(Number.parseFloat(precioMin))
    }

    if (precioMax) {
      query += " AND p.precio <= ?"
      params.push(Number.parseFloat(precioMax))
    }

    // Agregar ordenamiento y paginación
    query += " ORDER BY p.fecha_publicacion DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    // Ejecutar la consulta
    const [productos] = await db.execute(query, params)

    res.json(productos)
  } catch (err) {
    console.error("Error al obtener productos:", err)
    res.status(500).json({ error: "Error al obtener productos" })
  }
})

// Ruta para eliminar un producto
app.delete("/api/productos/eliminar/:id", async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.execute("DELETE FROM productos WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" })
    }

    res.status(200).json({ message: "Producto eliminado correctamente" })
  } catch (err) {
    console.error("Error al eliminar producto:", err)
    res.status(500).json({ error: "Error al eliminar producto" })
  }
})

// Ruta para obtener todas las oportunidades
app.get("/api/oportunidades", async (req, res) => {
  try {
    // Parámetros de paginación
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Consulta con paginación
    const [oportunidades] = await db.execute(
      "SELECT * FROM oportunidades WHERE estado = 'activa' ORDER BY fecha_publicacion DESC LIMIT ? OFFSET ?",
      [limit, offset],
    )

    res.json(oportunidades)
  } catch (err) {
    console.error("Error al obtener oportunidades:", err)
    res.status(500).json({ error: "Error al obtener oportunidades" })
  }
})

// Ruta para crear una nueva oportunidad
app.post("/admin/oportunidades/crear", async (req, res) => {
  try {
    const { titulo, empresa, descripcion, requisitos, ubicacion, area_estudio, modalidad, horario, estado } = req.body

    // Insertar la nueva oportunidad en la base de datos
    const [result] = await db.execute(
      "INSERT INTO oportunidades (titulo, empresa, descripcion, requisitos, ubicacion, area_estudio, modalidad, horario, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [titulo, empresa, descripcion, requisitos, ubicacion, area_estudio, modalidad, horario, estado || "activa"],
    )

    res.status(201).json({
      success: true,
      message: "Oportunidad creada con éxito",
      id: result.insertId,
    })
  } catch (err) {
    console.error("Error al crear oportunidad:", err)
    res.status(500).json({
      success: false,
      message: "Error al crear la oportunidad",
    })
  }
})

// Ruta para obtener todos los usuarios (para administradores)
app.get("/api/usuarios", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id, nombre, email, rol, fecha_creacion FROM usuarios")
    res.json(rows)
  } catch (err) {
    console.error("Error al obtener usuarios:", err)
    res.status(500).json({ error: "Error al obtener usuarios" })
  }
})

// Ruta para la página de ecommerce
app.get("/ecommerce", async (req, res) => {
  try {
    // Consultamos todos los productos disponibles
    const [productos] = await db.execute(
      "SELECT p.*, u.nombre as vendedor_nombre FROM productos p LEFT JOIN usuarios u ON p.vendedor_id = u.id WHERE p.disponible = 1 ORDER BY p.fecha_publicacion DESC",
    )

    // Formatear los precios para mostrarlos en pesos colombianos
    const productosFormateados = productos.map((producto) => {
      return {
        ...producto,
        precioFormateado: new Intl.NumberFormat("es-CO").format(producto.precio),
      }
    })

    res.render("ecommerce", { oportunidades: productosFormateados })
  } catch (err) {
    console.error("Error al cargar la página de ecommerce:", err)
    res.status(500).send("Error al cargar la página de ecommerce")
  }
})

app.get("/ecommerce/buscar", async (req, res) => {
  try {
    const { query } = req.query

    // Si no hay consulta, redirigir a la página principal
    if (!query) {
      return res.redirect("/ecommerce")
    }

    // Buscar productos que coincidan con el título (usando LIKE para búsqueda parcial)
    const [productos] = await db.execute(
      "SELECT p.*, u.nombre as vendedor_nombre FROM productos p LEFT JOIN usuarios u ON p.vendedor_id = u.id WHERE p.titulo LIKE ? AND p.disponible = 1 ORDER BY p.fecha_publicacion DESC",
      [`%${query}%`],
    )

    // Renderizar la misma vista pero con los resultados filtrados
    res.render("ecommerce", {
      oportunidades: productos,
      searchQuery: query,
    })
  } catch (err) {
    console.error("Error al buscar productos:", err)
    res.status(500).send("Error al buscar productos")
  }
})

app.post("/api/checkout", async (req, res) => {
  try {
    const { items, total, customerInfo } = req.body

    // Aquí se procesaría el pago y se registraría la venta
    // Por ahora solo devolvemos una respuesta exitosa

    res.status(200).json({
      success: true,
      message: "Compra procesada correctamente",
      orderNumber: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      currency: "COP",
      total: total,
    })
  } catch (err) {
    console.error("Error al procesar el checkout:", err)
    res.status(500).json({
      success: false,
      message: "Error al procesar la compra",
    })
  }
})

// Ruta para obtener productos de un vendedor específico
app.get("/api/productos/vendedor/:id", async (req, res) => {
  try {
    const { id } = req.params

    const [productos] = await db.execute(
      "SELECT * FROM productos WHERE vendedor_id = ? ORDER BY fecha_publicacion DESC",
      [id],
    )

    res.json(productos)
  } catch (err) {
    console.error("Error al obtener productos del vendedor:", err)
    res.status(500).json({ error: "Error al obtener productos del vendedor" })
  }
})

const PORT = 3000 // Puerto en el que se ejecuta el servidor
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`))
