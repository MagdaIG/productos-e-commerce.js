// Clase Producto - Implementación con OOP y ES6+
class Producto {
    constructor({ id, nombre, precio, categoria, descripcion, imagen, stock = 10 }) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.imagen = imagen;
        this.stock = stock;
    }

    // Método para mostrar información del producto usando template literals
    mostrarInformacion = () => {
        return `
            <strong>${this.nombre}</strong><br>
            <span class="price">$${this.precio.toFixed(2)}</span><br>
            <small>${this.categoria}</small><br>
            <p>${this.descripcion}</p>
            <small>Stock: ${this.stock} unidades</small>
        `;
    };

    // Método para obtener precio formateado
    getPrecioFormateado = () => {
        return `$${this.precio.toFixed(2)}`;
    };

    // Método para verificar disponibilidad
    estaDisponible = () => {
        return this.stock > 0;
    };

    // Método para reducir stock
    reducirStock = (cantidad = 1) => {
        if (this.stock >= cantidad) {
            this.stock -= cantidad;
            return true;
        }
        return false;
    };
}

// Clase Carrito - Gestión del carrito de compras
class Carrito {
    constructor() {
        this.items = new Map();
        this.total = 0;
    }

    // Agregar producto al carrito usando desestructuración
    agregarProducto = (producto, cantidad = 1) => {
        const { id, nombre, precio, imagen } = producto;

        if (this.items.has(id)) {
            const item = this.items.get(id);
            item.cantidad += cantidad;
            item.subtotal = item.cantidad * precio;
        } else {
            this.items.set(id, {
                producto: { id, nombre, precio, imagen },
                cantidad,
                subtotal: precio * cantidad
            });
        }

        this.calcularTotal();
        this.actualizarContador();
        this.guardarEnLocalStorage();
    };

    // Remover producto del carrito
    removerProducto = (id) => {
        if (this.items.has(id)) {
            this.items.delete(id);
            this.calcularTotal();
            this.actualizarContador();
            this.guardarEnLocalStorage();
            return true;
        }
        return false;
    };

    // Actualizar cantidad de un producto
    actualizarCantidad = (id, cantidad) => {
        if (this.items.has(id) && cantidad > 0) {
            const item = this.items.get(id);
            item.cantidad = cantidad;
            item.subtotal = cantidad * item.producto.precio;
            this.calcularTotal();
            this.actualizarContador();
            this.guardarEnLocalStorage();
            return true;
        }
        return false;
    };

    // Calcular total del carrito
    calcularTotal = () => {
        this.total = Array.from(this.items.values())
            .reduce((sum, item) => sum + item.subtotal, 0);
    };

    // Obtener total formateado
    getTotalFormateado = () => {
        return `$${this.total.toFixed(2)}`;
    };

    // Limpiar carrito
    limpiar = () => {
        this.items.clear();
        this.total = 0;
        this.actualizarContador();
        this.guardarEnLocalStorage();
    };

    // Obtener cantidad de items
    getCantidadItems = () => {
        return Array.from(this.items.values())
            .reduce((sum, item) => sum + item.cantidad, 0);
    };

    // Actualizar contador en el DOM
    actualizarContador = () => {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = this.getCantidadItems();
        }
    };

    // Guardar en localStorage
    guardarEnLocalStorage = () => {
        const carritoData = {
            items: Array.from(this.items.entries()),
            total: this.total
        };
        localStorage.setItem('cuteShopCarrito', JSON.stringify(carritoData));
    };

    // Cargar desde localStorage
    cargarDesdeLocalStorage = () => {
        const carritoData = localStorage.getItem('cuteShopCarrito');
        if (carritoData) {
            const data = JSON.parse(carritoData);
            this.items = new Map(data.items);
            this.total = data.total;
            this.actualizarContador();
        }
    };
}

// Clase ProductoService - Manejo de API y datos
class ProductoService {
    constructor() {
        this.baseURL = 'https://jewelry-api.vercel.app/api';
        this.productos = [];
        this.categorias = [];
    }

            // Obtener productos desde Jewelry API
    async obtenerProductos() {
        try {
            console.log('🔄 Cargando joyas desde Jewelry API...');

            // Usar Jewelry API como principal
            const response = await fetch(`${this.baseURL}/jewelry`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ Cargadas ${data.length} joyas desde Jewelry API`);

            // Transformar datos de la Jewelry API
            this.productos = this.transformarDatosJewelryAPI(data);
            this.extraerCategorias();
            return this.productos;

        } catch (error) {
            console.error('❌ Error al obtener productos de Jewelry API:', error);
            console.log('🔄 Usando datos mock como fallback...');

            // Fallback a datos mock si la API falla
            this.productos = this.obtenerDatosMock();
            this.extraerCategorias();
            return this.productos;
        }
    }

        // Verificar si es un producto de joyas
    esProductoFemenino = (producto) => {
        const categoriasJoyas = [
            'jewelery', 'jewelry', 'rings', 'necklaces', 'earrings', 'bracelets', 'watches'
        ];
        return categoriasJoyas.some(cat =>
            producto.category.toLowerCase().includes(cat) ||
            producto.title.toLowerCase().includes(cat)
        );
    };

    // Transformar producto de la API a nuestro formato
    transformarProducto = (producto) => {
        const categoriasMap = {
            'jewelery': 'jewelry',
            'jewelry': 'jewelry',
            'rings': 'rings',
            'necklaces': 'necklaces',
            'earrings': 'earrings',
            'bracelets': 'bracelets',
            'watches': 'watches'
        };

        let categoria = 'jewelry';
        const titleLower = producto.title.toLowerCase();
        const categoryLower = producto.category.toLowerCase();

        // Determinar categoría basada en título y categoría
        if (titleLower.includes('ring') || categoryLower.includes('ring')) {
            categoria = 'rings';
        } else if (titleLower.includes('necklace') || categoryLower.includes('necklace')) {
            categoria = 'necklaces';
        } else if (titleLower.includes('earring') || categoryLower.includes('earring')) {
            categoria = 'earrings';
        } else if (titleLower.includes('bracelet') || categoryLower.includes('bracelet')) {
            categoria = 'bracelets';
        } else if (titleLower.includes('watch') || categoryLower.includes('watch')) {
            categoria = 'watches';
        } else if (categoryLower.includes('jewelery') || categoryLower.includes('jewelry')) {
            categoria = 'jewelry';
        }

        return new Producto({
            id: producto.id,
            nombre: producto.title,
            precio: producto.price,
            categoria: categoria,
            descripcion: producto.description,
            imagen: producto.image,
            stock: Math.floor(Math.random() * 20) + 5 // Stock aleatorio
        });
    };

    // Transformar datos de la Jewelry API
    transformarDatosJewelryAPI = (data) => {
        return data.map((item, index) => {
            // Mapear campos de la Jewelry API
            const nombre = item.name || item.title || item.product_name || `Joya ${index + 1}`;
            const precio = this.parsearPrecio(item.price || item.cost || item.retail_price);
            const categoria = this.mapearCategoriaJewelry(item.category || item.type || item.jewelry_type);
            const descripcion = this.generarDescripcion(item, categoria);
            const imagen = item.image || item.photo || item.image_url || this.obtenerImagenMock(categoria);

            return new Producto({
                id: item.id || index + 1,
                nombre: nombre,
                precio: precio,
                categoria: categoria,
                descripcion: descripcion,
                imagen: imagen,
                stock: Math.floor(Math.random() * 20) + 5
            });
        });
    };

    // Parsear precio de diferentes formatos
    parsearPrecio = (precio) => {
        if (typeof precio === 'number') return precio;
        if (typeof precio === 'string') {
            // Remover símbolos de moneda y convertir a número
            const precioLimpio = precio.replace(/[$,€£¥]/g, '').trim();
            const precioNum = parseFloat(precioLimpio);
            return isNaN(precioNum) ? Math.random() * 500 + 50 : precioNum;
        }
        return Math.random() * 500 + 50; // Precio por defecto entre $50-$550
    };

    // Generar descripción basada en la categoría y datos del item
    generarDescripcion = (item, categoria) => {
        const descripciones = {
            'rings': [
                'Hermoso anillo con diseño elegante y acabado de alta calidad.',
                'Anillo de compromiso perfecto para el momento más especial.',
                'Anillo con piedras preciosas y montura de metal noble.'
            ],
            'necklaces': [
                'Collar elegante con diseño atemporal y acabado premium.',
                'Collar de perlas cultivadas con lustre natural excepcional.',
                'Collar con colgante de piedra preciosa y cadena de alta calidad.'
            ],
            'earrings': [
                'Aretes elegantes con diseño sofisticado y acabado fino.',
                'Aretes de diamantes con corte brillante y montura de oro.',
                'Aretes con piedras de colores y diseño contemporáneo.'
            ],
            'bracelets': [
                'Pulsera de metal noble con diseño clásico y elegante.',
                'Pulsera con piedras preciosas engastadas artesanalmente.',
                'Pulsera de diseño moderno perfecta para cualquier ocasión.'
            ],
            'watches': [
                'Reloj de precisión suiza con movimiento automático.',
                'Reloj elegante con caja de acero inoxidable y correa de cuero.',
                'Reloj de lujo con funcionalidad y estilo excepcionales.'
            ],
            'jewelry': [
                'Joya de alta calidad con diseño exclusivo y acabado premium.',
                'Pieza única con materiales nobles y artesanía excepcional.',
                'Joya elegante perfecta para complementar cualquier outfit.'
            ]
        };

        const descripcionesCategoria = descripciones[categoria] || descripciones['jewelry'];
        return descripcionesCategoria[Math.floor(Math.random() * descripcionesCategoria.length)];
    };

    // Mapear categorías de la Jewelry API
    mapearCategoriaJewelry = (categoria) => {
        if (!categoria) return 'jewelry';

        const categoriaLower = categoria.toLowerCase();

        // Mapeo específico para Jewelry API
        if (categoriaLower.includes('ring') || categoriaLower.includes('anillo')) return 'rings';
        if (categoriaLower.includes('necklace') || categoriaLower.includes('collar') || categoriaLower.includes('chain')) return 'necklaces';
        if (categoriaLower.includes('earring') || categoriaLower.includes('arete') || categoriaLower.includes('ear')) return 'earrings';
        if (categoriaLower.includes('bracelet') || categoriaLower.includes('pulsera') || categoriaLower.includes('bangle')) return 'bracelets';
        if (categoriaLower.includes('watch') || categoriaLower.includes('reloj') || categoriaLower.includes('timepiece')) return 'watches';
        if (categoriaLower.includes('pendant') || categoriaLower.includes('colgante')) return 'necklaces';
        if (categoriaLower.includes('brooch') || categoriaLower.includes('broche')) return 'jewelry';
        if (categoriaLower.includes('tiara') || categoriaLower.includes('diadema')) return 'jewelry';

        return 'jewelry';
    };

    // Obtener imagen mock para joyas por categoría
    obtenerImagenMock = (categoria = 'jewelry') => {
        const imagenesPorCategoria = {
            'rings': [
                'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop'
            ],
            'necklaces': [
                'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop'
            ],
            'earrings': [
                'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop'
            ],
            'bracelets': [
                'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop'
            ],
            'watches': [
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop'
            ],
            'jewelry': [
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=400&fit=crop'
            ]
        };

        const imagenes = imagenesPorCategoria[categoria] || imagenesPorCategoria['jewelry'];
        return imagenes[Math.floor(Math.random() * imagenes.length)];
    };

    // Datos mock de joyas de alta calidad
    obtenerDatosMock = () => {
        const joyasMock = [
            {
                id: 1,
                nombre: "Anillo de Diamante Solitario",
                precio: 1299.99,
                categoria: "rings",
                descripcion: "Hermoso anillo de compromiso con diamante solitario de 1 quilate, montado en oro blanco de 18k. Perfecto para el momento más especial de tu vida.",
                imagen: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
                stock: 3
            },
            {
                id: 2,
                nombre: "Collar de Perlas Cultivadas",
                precio: 299.99,
                categoria: "necklaces",
                descripcion: "Elegante collar de perlas cultivadas de agua dulce, perfectamente redondas y lustrosas. Ideal para ocasiones formales y elegantes.",
                imagen: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop",
                stock: 8
            },
            {
                id: 3,
                nombre: "Aretes de Zafiro Azul",
                precio: 450.00,
                categoria: "earrings",
                descripcion: "Pares de aretes con zafiros azules naturales, engastados en plata esterlina. Un toque de elegancia y color para cualquier outfit.",
                imagen: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop",
                stock: 12
            },
            {
                id: 4,
                nombre: "Pulsera de Oro Amarillo",
                precio: 899.99,
                categoria: "bracelets",
                descripcion: "Pulsera de oro amarillo de 18k con diseño trenzado italiano. Un clásico atemporal que complementa cualquier look.",
                imagen: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=400&fit=crop",
                stock: 5
            },
            {
                id: 5,
                nombre: "Reloj Suizo de Lujo",
                precio: 2499.99,
                categoria: "watches",
                descripcion: "Reloj automático suizo con movimiento de precisión, caja de acero inoxidable y correa de cuero genuino. Funcionalidad y elegancia en uno.",
                imagen: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
                stock: 2
            },
            {
                id: 6,
                nombre: "Anillo de Esmeralda Colombiana",
                precio: 1899.99,
                categoria: "rings",
                descripcion: "Anillo con esmeralda colombiana natural de 2.5 quilates, rodeada de diamantes. Un tesoro verde de la naturaleza.",
                imagen: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
                stock: 1
            },
            {
                id: 7,
                nombre: "Collar de Oro Rosa",
                precio: 650.00,
                categoria: "necklaces",
                descripcion: "Collar de oro rosa de 14k con diseño minimalista y colgante de diamante. Perfecto para el uso diario.",
                imagen: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop",
                stock: 15
            },
            {
                id: 8,
                nombre: "Aretes de Diamantes",
                precio: 1200.00,
                categoria: "earrings",
                descripcion: "Aretes de diamantes naturales con corte brillante, montados en oro blanco. Elegancia atemporal para cualquier ocasión.",
                imagen: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop",
                stock: 7
            }
        ];

        return joyasMock.map(joya => new Producto(joya));
    };

    // Extraer categorías únicas
    extraerCategorias = () => {
        this.categorias = [...new Set(this.productos.map(p => p.categoria))];
    };

    // Filtrar productos por categoría
    filtrarPorCategoria = (categoria) => {
        if (categoria === 'all') {
            return this.productos;
        }
        return this.productos.filter(producto => producto.categoria === categoria);
    };

    // Buscar productos
    buscarProductos = (termino) => {
        const terminoLower = termino.toLowerCase();
        return this.productos.filter(producto =>
            producto.nombre.toLowerCase().includes(terminoLower) ||
            producto.descripcion.toLowerCase().includes(terminoLower) ||
            producto.categoria.toLowerCase().includes(terminoLower)
        );
    };
}

// Clase UI - Manejo de la interfaz de usuario
class UI {
    constructor() {
        this.productoService = new ProductoService();
        this.carrito = new Carrito();
        this.productosActuales = [];
        this.categoriaActual = 'all';
        this.terminoBusqueda = '';

        this.inicializar();
    }

    // Inicializar la aplicación
    inicializar = async () => {
        this.carrito.cargarDesdeLocalStorage();
        this.configurarEventListeners();
        await this.cargarProductos();
    };

    // Configurar event listeners
    configurarEventListeners = () => {
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', this.debounce(this.handleBusqueda.bind(this), 300));

        // Categorías
        const categoriesGrid = document.getElementById('categoriesGrid');
        categoriesGrid.addEventListener('click', this.handleCategoriaClick.bind(this));

        // Carrito
        const cartBtn = document.getElementById('cartBtn');
        const closeCartBtn = document.getElementById('closeCartBtn');
        const checkoutBtn = document.getElementById('checkoutBtn');

        cartBtn.addEventListener('click', this.mostrarCarrito.bind(this));
        closeCartBtn.addEventListener('click', this.ocultarCarrito.bind(this));
        checkoutBtn.addEventListener('click', this.finalizarCompra.bind(this));

        // Cerrar modales
        const closeProductBtn = document.getElementById('closeProductBtn');
        closeProductBtn.addEventListener('click', this.ocultarModalProducto.bind(this));

        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.ocultarCarrito();
                this.ocultarModalProducto();
            }
        });
    };

    // Debounce para búsqueda
    debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Manejar búsqueda
    handleBusqueda = (e) => {
        this.terminoBusqueda = e.target.value;
        this.filtrarYMostrarProductos();
    };

    // Manejar clic en categoría
    handleCategoriaClick = (e) => {
        const categoryCard = e.target.closest('.category-card');
        if (!categoryCard) return;

        // Remover clase active de todas las categorías
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });

        // Agregar clase active a la categoría seleccionada
        categoryCard.classList.add('active');

        // Actualizar categoría actual
        this.categoriaActual = categoryCard.dataset.category;
        this.filtrarYMostrarProductos();
    };

    // Cargar productos desde la API
    cargarProductos = async () => {
        try {
            this.mostrarLoading(true);
            this.productosActuales = await this.productoService.obtenerProductos();
            this.mostrarProductos(this.productosActuales);
        } catch (error) {
            this.mostrarError('Error al cargar los productos. Por favor, intenta de nuevo.');
        } finally {
            this.mostrarLoading(false);
        }
    };

    // Filtrar y mostrar productos
    filtrarYMostrarProductos = () => {
        let productosFiltrados = this.productosActuales;

        // Filtrar por categoría
        if (this.categoriaActual !== 'all') {
            productosFiltrados = this.productoService.filtrarPorCategoria(this.categoriaActual);
        }

        // Filtrar por búsqueda
        if (this.terminoBusqueda.trim()) {
            productosFiltrados = this.productoService.buscarProductos(this.terminoBusqueda);
        }

        this.mostrarProductos(productosFiltrados);
    };

    // Mostrar productos en el DOM
    mostrarProductos = (productos) => {
        const productsGrid = document.getElementById('productsGrid');

        if (productos.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron productos</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = productos.map(producto => this.crearProductoCard(producto)).join('');
    };

        // Crear tarjeta de producto
    crearProductoCard = (producto) => {
        const { id, nombre, precio, descripcion, imagen, stock } = producto;

        return `
            <div class="product-card" data-product-id="${id}" onclick="ui.mostrarDetalleProducto(${id})">
                <div class="product-image">
                    <img src="${imagen}" alt="${nombre}" loading="lazy">
                    ${stock < 5 ? '<div class="product-badge">¡Últimas unidades!</div>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${nombre}</h3>
                    <p class="product-description">${descripcion}</p>
                    <div class="product-price">${producto.getPrecioFormateado()}</div>
                    <div class="product-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="event.stopPropagation(); ui.cambiarCantidad(${id}, -1)">-</button>
                            <span class="quantity-display" id="quantity-${id}">1</span>
                            <button class="quantity-btn" onclick="event.stopPropagation(); ui.cambiarCantidad(${id}, 1)">+</button>
                        </div>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); ui.agregarAlCarrito(${id})" ${!producto.estaDisponible() ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            ${producto.estaDisponible() ? 'Agregar' : 'Sin stock'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

    // Cambiar cantidad de producto
    cambiarCantidad = (productoId, cambio) => {
        const quantityDisplay = document.getElementById(`quantity-${productoId}`);
        let cantidad = parseInt(quantityDisplay.textContent) + cambio;

        if (cantidad < 1) cantidad = 1;
        if (cantidad > 10) cantidad = 10; // Límite máximo

        quantityDisplay.textContent = cantidad;
    };

    // Agregar al carrito
    agregarAlCarrito = (productoId) => {
        const producto = this.productosActuales.find(p => p.id === productoId);
        const cantidad = parseInt(document.getElementById(`quantity-${productoId}`).textContent);

        if (!producto || !producto.estaDisponible()) {
            this.mostrarToast('Producto no disponible', 'error');
            return;
        }

        if (producto.reducirStock(cantidad)) {
            this.carrito.agregarProducto(producto, cantidad);
            this.mostrarToast(`${producto.nombre} agregado al carrito`, 'success');
            this.actualizarProductoCard(producto);
        } else {
            this.mostrarToast('Stock insuficiente', 'error');
        }
    };

    // Actualizar tarjeta de producto
    actualizarProductoCard = (producto) => {
        const productCard = document.querySelector(`[data-product-id="${producto.id}"]`);
        if (productCard) {
            const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
            if (!producto.estaDisponible()) {
                addToCartBtn.textContent = 'Sin stock';
                addToCartBtn.disabled = true;
            }
        }
    };

    // Mostrar carrito
    mostrarCarrito = () => {
        const cartModal = document.getElementById('cartModal');
        this.actualizarCarritoUI();
        cartModal.style.display = 'flex';
    };

    // Ocultar carrito
    ocultarCarrito = () => {
        const cartModal = document.getElementById('cartModal');
        cartModal.style.display = 'none';
    };

    // Actualizar UI del carrito
    actualizarCarritoUI = () => {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (this.carrito.items.size === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Tu carrito está vacío</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = Array.from(this.carrito.items.values())
                .map(item => this.crearCartItemHTML(item))
                .join('');
        }

        cartTotal.textContent = this.carrito.getTotalFormateado();
    };

    // Crear HTML para item del carrito
    crearCartItemHTML = (item) => {
        const { producto, cantidad, subtotal } = item;

        return `
            <div class="cart-item" data-product-id="${producto.id}">
                <div class="cart-item-image">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${producto.nombre}</div>
                    <div class="cart-item-price">$${producto.precio.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="ui.cambiarCantidadCarrito(${producto.id}, -1)">-</button>
                        <span>${cantidad}</span>
                        <button class="quantity-btn" onclick="ui.cambiarCantidadCarrito(${producto.id}, 1)">+</button>
                        <button class="remove-btn" onclick="ui.removerDelCarrito(${producto.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-subtotal">
                    $${subtotal.toFixed(2)}
                </div>
            </div>
        `;
    };

    // Cambiar cantidad en carrito
    cambiarCantidadCarrito = (productoId, cambio) => {
        const item = this.carrito.items.get(productoId);
        if (item) {
            const nuevaCantidad = item.cantidad + cambio;
            if (nuevaCantidad > 0) {
                this.carrito.actualizarCantidad(productoId, nuevaCantidad);
                this.actualizarCarritoUI();
            }
        }
    };

    // Remover del carrito
    removerDelCarrito = (productoId) => {
        if (this.carrito.removerProducto(productoId)) {
            this.mostrarToast('Producto removido del carrito', 'success');
            this.actualizarCarritoUI();
        }
    };

    // Finalizar compra
    finalizarCompra = () => {
        if (this.carrito.items.size === 0) {
            this.mostrarToast('Tu carrito está vacío', 'error');
            return;
        }

        this.mostrarToast('¡Compra realizada con éxito!', 'success');
        this.carrito.limpiar();
        this.ocultarCarrito();
    };

    // Mostrar detalle del producto
    mostrarDetalleProducto = (productoId) => {
        const producto = this.productosActuales.find(p => p.id === productoId);
        if (!producto) return;

        const modal = document.getElementById('productModal');
        const content = document.getElementById('productDetailContent');

        content.innerHTML = `
            <div class="product-detail-image-section">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="product-detail-image">
                <button class="favorite-btn" onclick="ui.toggleFavorito(${producto.id})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-detail-content">
                <h2 class="product-detail-title">${producto.nombre}</h2>
                <div class="product-detail-price-section">
                    <div class="product-detail-price">${producto.getPrecioFormateado()}</div>
                    <div class="product-detail-quantity">
                        <button class="quantity-btn" onclick="ui.cambiarCantidadDetalle(${producto.id}, -1)">-</button>
                        <span class="quantity-display" id="detail-quantity-${producto.id}">1</span>
                        <button class="quantity-btn" onclick="ui.cambiarCantidadDetalle(${producto.id}, 1)">+</button>
                    </div>
                </div>
                <div class="product-detail-description-section">
                    <h3>Sobre el Producto</h3>
                    <p class="product-detail-description">${producto.descripcion}</p>
                </div>
                <button class="add-to-cart-detail-btn" onclick="ui.agregarAlCarritoDesdeDetalle(${producto.id})" ${!producto.estaDisponible() ? 'disabled' : ''}>
                    <i class="fas fa-shopping-bag"></i>
                    ${producto.estaDisponible() ? 'Agregar al Carrito' : 'Sin stock'}
                </button>
            </div>
        `;

        modal.style.display = 'flex';
    };

    // Cambiar cantidad en detalle del producto
    cambiarCantidadDetalle = (productoId, cambio) => {
        const quantityDisplay = document.getElementById(`detail-quantity-${productoId}`);
        let cantidad = parseInt(quantityDisplay.textContent) + cambio;

        if (cantidad < 1) cantidad = 1;
        if (cantidad > 10) cantidad = 10;

        quantityDisplay.textContent = cantidad;
    };

    // Agregar al carrito desde detalle
    agregarAlCarritoDesdeDetalle = (productoId) => {
        const producto = this.productosActuales.find(p => p.id === productoId);
        const cantidad = parseInt(document.getElementById(`detail-quantity-${productoId}`).textContent);

        if (!producto || !producto.estaDisponible()) {
            this.mostrarToast('Producto no disponible', 'error');
            return;
        }

        if (producto.reducirStock(cantidad)) {
            this.carrito.agregarProducto(producto, cantidad);
            this.mostrarToast(`${producto.nombre} agregado al carrito`, 'success');
            this.actualizarProductoCard(producto);
            this.ocultarModalProducto();
        } else {
            this.mostrarToast('Stock insuficiente', 'error');
        }
    };

    // Toggle favorito
    toggleFavorito = (productoId) => {
        // Implementación básica de favoritos
        this.mostrarToast('Agregado a favoritos', 'success');
    };

    // Scroll al inicio de la página
    scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Ocultar modal de producto
    ocultarModalProducto = () => {
        const modal = document.getElementById('productModal');
        modal.style.display = 'none';
    };

    // Mostrar loading
    mostrarLoading = (mostrar) => {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const productsGrid = document.getElementById('productsGrid');

        if (mostrar) {
            loadingSpinner.style.display = 'flex';
            productsGrid.style.display = 'none';
        } else {
            loadingSpinner.style.display = 'none';
            productsGrid.style.display = 'grid';
        }
    };

    // Mostrar error
    mostrarError = (mensaje) => {
        const errorMessage = document.getElementById('errorMessage');
        const productsGrid = document.getElementById('productsGrid');

        errorMessage.querySelector('p').textContent = mensaje;
        errorMessage.style.display = 'block';
        productsGrid.style.display = 'none';
    };

    // Mostrar toast notification
    mostrarToast = (mensaje, tipo = 'success') => {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');

        toast.className = `toast ${tipo}`;
        toastMessage.textContent = mensaje;
        toastIcon.className = `toast-icon fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;

        toast.style.display = 'flex';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    };
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UI();
});

// Agregar estilos adicionales para elementos faltantes
const additionalStyles = `
    .no-products {
        text-align: center;
        padding: 3rem;
        color: #7f8c8d;
        grid-column: 1 / -1;
    }

    .no-products i {
        font-size: 3rem;
        margin-bottom: 1rem;
        display: block;
    }

    .empty-cart {
        text-align: center;
        padding: 2rem;
        color: #7f8c8d;
    }

    .empty-cart i {
        font-size: 2rem;
        margin-bottom: 1rem;
        display: block;
    }

    .cart-item-subtotal {
        font-weight: 600;
        color: #c44569;
        font-size: 1.1rem;
    }

    .remove-btn {
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-left: 0.5rem;
    }

    .remove-btn:hover {
        background: #c0392b;
        transform: scale(1.1);
    }
`;

// Agregar estilos al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
