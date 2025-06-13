-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 13, 2025 at 03:28 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `campuswork`
--

-- --------------------------------------------------------

--
-- Table structure for table `oportunidades`
--

CREATE TABLE `oportunidades` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `empresa` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `requisitos` text DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `area_estudio` varchar(100) DEFAULT NULL,
  `modalidad` varchar(50) DEFAULT NULL,
  `horario` varchar(50) DEFAULT NULL,
  `salario_hora` decimal(10,2) DEFAULT NULL,
  `fecha_publicacion` datetime DEFAULT current_timestamp(),
  `estado` varchar(50) DEFAULT 'activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `oportunidades`
--

INSERT INTO `oportunidades` (`id`, `titulo`, `empresa`, `descripcion`, `requisitos`, `ubicacion`, `area_estudio`, `modalidad`, `horario`, `salario_hora`, `fecha_publicacion`, `estado`) VALUES
(1, '1', '1', '1', '1', '1', 'Ingeniería', 'Presencial', '1', 12.50, '2025-05-05 21:11:49', 'activa'),
(2, '1', '1', '1', '1', '1', 'Ingeniería', 'Presencial', '1', 15.00, '2025-05-05 21:19:33', 'activa'),
(3, 'Desarrollador Web Junior', 'TechSolutions', 'Buscamos un desarrollador web para trabajar en proyectos innovadores. Ideal para estudiantes de últimos años.', 'Conocimientos en HTML, CSS, JavaScript. Valorable experiencia con React.', 'Madrid', 'Ingeniería Informática', 'Remoto', 'Medio Tiempo', 18.75, '2025-05-05 21:39:25', 'activa'),
(4, 'Asistente de Marketing', 'MarketingPro', 'Apoya al equipo de marketing en campañas digitales y análisis de datos.', 'Estudiantes de Marketing o Comunicación. Conocimientos de redes sociales y herramientas de análisis.', 'Barcelona', 'Marketing', 'Presencial', 'Fines de Semana', 14.25, '2025-05-05 21:39:25', 'activa'),
(7, 'Diseñador Gráfico', 'CreativeStudio', 'Diseño de materiales promocionales para redes sociales y web.', 'Conocimientos de Adobe Photoshop e Illustrator. Portfolio de trabajos previos.', 'Madrid', 'Diseño Gráfico', 'Remoto', 'Flexible', 20.00, '2025-05-05 21:39:25', 'activa'),
(8, 'Asistente Administrativo', 'Consultora Empresarial', 'Apoyo en tareas administrativas y atención al cliente.', 'Estudiantes de Administración de Empresas o similar. Buen manejo de Excel.', 'Bilbao', 'Administración', 'Presencial', 'Mañanas', 16.50, '2025-05-05 21:39:25', 'activa'),
(9, '2', '2', '2', '2', '2', '2', 'Remoto', 'Flexible', 22.00, '2025-05-05 22:02:51', 'activa'),
(10, '4', '4', '4', '4', '4', '4', 'Remoto', 'Tiempo Completo', 25.00, '2025-05-05 22:04:17', 'activa');

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `estado` varchar(50) DEFAULT 'Nuevo',
  `categoria` varchar(100) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT 'https://via.placeholder.com/300x200',
  `barcode` varchar(50) DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `vendedor_id` int(11) DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT 1,
  `fecha_publicacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productos`
--

INSERT INTO `productos` (`id`, `titulo`, `descripcion`, `precio`, `estado`, `categoria`, `imagen`, `barcode`, `ubicacion`, `vendedor_id`, `disponible`, `fecha_publicacion`) VALUES
(1, 'Laptop HP Pavilion 15', 'Laptop en excelente estado, 8GB RAM, 512GB SSD, procesador i5 de 10ma generación. Ideal para estudiantes.', 1800000.00, 'Como nuevo', 'Electrónicos', 'https://co-media.hptiendaenlinea.com/catalog/product/4/7/470J5LA-1_T1679066258.png', 'PRD00000001', 'Campus Central', 3, 1, '2025-05-01 10:00:00'),
(2, 'Libro Cálculo de Varias Variables - Stewart', 'Libro de cálculo multivariable, 7ma edición. Tiene algunas anotaciones pero está en buen estado general.', 140000.00, 'Buen estado', 'Libros', 'https://elsolucionario.net/wp-content/archivos/2013/04/calculo-de-varias-variables-james-stewart-7ma-edicion.jpg', 'PRD00000002', 'Facultad de Ciencias', 7, 1, '2025-05-02 15:30:00'),
(3, 'Escritorio Plegable para Estudiantes', 'Escritorio plegable ideal para espacios pequeños. Incluye estante para libros y soporte para laptop.', 340000.00, 'Nuevo', 'Muebles', 'https://m.media-amazon.com/images/I/61GrsDpKkpL._AC_UF894,1000_QL80_.jpg', 'PRD00000003', 'Residencia Universitaria', 8, 1, '2025-05-03 09:15:00'),
(4, 'Calculadora Científica Texas Instruments', 'Calculadora TI-84 Plus, perfecta para clases de matemáticas y estadística. Incluye cable USB y manual.', 260000.00, 'Buen estado', 'Electrónicos', 'https://panamericana.vtexassets.com/arquivos/ids/536932/calculadora-cientifica-ti-30xiis-texas-instruments-33317200849.jpg?v=638479201046770000', 'PRD00000004', 'Facultad de Ingeniería', 3, 1, '2025-05-04 14:20:00'),
(5, 'Bicicleta Urbana', 'Bicicleta de ciudad, 21 velocidades, frenos de disco. Perfecta para moverse por el campus.', 480000.00, 'Usado', 'Deportes', 'https://www.santafixie.com/blog/wp-content/uploads/2020/02/matte-black-perfil-30-1-1-e1621435452985.jpg', 'PRD00000005', 'Pabellón Deportivo', 7, 1, '2025-05-05 11:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('usuario','admin','superadmin') NOT NULL DEFAULT 'usuario',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `fecha_creacion`, `ultima_actualizacion`) VALUES
(1, 'Juan Pérez', 'juan@example.com', '$2b$10$zYwdB9yOyfF7Nqzjmt9f9eryGxxTRr3EJYUeeEFJO0sjwMyZDxuyW', 'superadmin', '2025-04-22 15:49:29', '2025-05-05 11:35:37'),
(3, 'Carlos López', 'carlos@example.com', '$2b$10$CRxV.m9m573pjwdiKIH4T.4oqZjcPpuZT2cwv0ScxnIN.KhI0P28q', 'usuario', '2025-04-22 15:49:29', '2025-04-22 15:49:29'),
(5, 'jaja', 'jaja@gmail.com', '12345', 'admin', '2025-05-06 06:08:42', '2025-05-06 06:08:42'),
(7, 'jumm', 'jumm@gmail.com', '123', 'usuario', '2025-05-06 06:10:56', '2025-05-06 06:10:56'),
(8, 'Juan Cabrera', 'cabrera@gmail.com', '123', 'usuario', '2025-05-06 06:20:29', '2025-05-06 06:20:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `oportunidades`
--
ALTER TABLE `oportunidades`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendedor_id` (`vendedor_id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `oportunidades`
--
ALTER TABLE `oportunidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
