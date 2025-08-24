# Cute Shop - E-commerce de Joyas

## Descripción del Proyecto

**Cute Shop** es una aplicación web de e-commerce especializada en joyas y accesorios, desarrollada como proyecto educativo para demostrar la implementación de conceptos fundamentales de JavaScript moderno, Programación Orientada a Objetos (OOP), manipulación del DOM y programación asíncrona.

### Objetivos de Aprendizaje

Este proyecto implementa y demuestra:
- **Programación Orientada a Objetos (OOP)** en JavaScript
- **Características ES6+** (Clases, Arrow Functions, Destructuring, Template Literals)
- **Manipulación del DOM** y gestión de eventos
- **Programación asíncrona** con Fetch API y async/await
- **Integración con APIs externas** y manejo de errores
- **Diseño responsivo** y UX moderna

## Arquitectura del Proyecto

### Estructura de Archivos
```
cute-shop/
├── index.html              # Estructura HTML5 semántica
├── assets/
│   ├── css/
│   │   └── styles.css      # Estilos CSS3 con diseño responsivo
│   ├── js/
│   │   └── app.js          # Lógica principal de la aplicación
│   └── img/                # Recursos de imágenes
└── README.md               # Documentación del proyecto
```

## Implementación Técnica

### 1. Programación Orientada a Objetos (OOP)

#### Clase `Producto`
```javascript
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

    // Métodos de instancia usando arrow functions
    mostrarInformacion = () => {
        return `
            <strong>${this.nombre}</strong><br>
            <span class="price">$${this.precio.toFixed(2)}</span><br>
            <small>${this.categoria}</small>
        `;
    };

    getPrecioFormateado = () => `$${this.precio.toFixed(2)}`;
    estaDisponible = () => this.stock > 0;
    reducirStock = (cantidad = 1) => {
        if (this.stock >= cantidad) {
            this.stock -= cantidad;
            return true;
        }
        return false;
    };
}
```

**Características ES6+ implementadas:**
- **Constructor con destructuring**: `{ id, nombre, precio, ... }`
- **Arrow functions**: Métodos de instancia
- **Template literals**: Para formateo de strings
- **Default parameters**: `stock = 10`

#### Clase `Carrito`
```javascript
class Carrito {
    constructor() {
        this.items = new Map(); // Estructura de datos moderna
        this.total = 0;
    }

    // Desestructuración en parámetros
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

    // Métodos de array modernos
    calcularTotal = () => {
        this.total = Array.from(this.items.values())
            .reduce((sum, item) => sum + item.subtotal, 0);
    };
}
```

**Características implementadas:**
- **Map**: Estructura de datos moderna para items del carrito
- **Destructuring**: Extracción eficiente de propiedades
- **Array.from()**: Conversión de Map a Array
- **reduce()**: Cálculo de totales
- **LocalStorage**: Persistencia de datos

### 2. Programación Asíncrona

#### Clase `ProductoService`
```javascript
class ProductoService {
    constructor() {
        this.baseURL = 'https://jewelry-api.vercel.app/api';
        this.productos = [];
        this.categorias = [];
    }

    // Async/await para manejo de promesas
    async obtenerProductos() {
        try {
            console.log('Cargando joyas desde Jewelry API...');
            
            const response = await fetch(`${this.baseURL}/jewelry`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Cargadas ${data.length} joyas desde Jewelry API`);
            
            this.productos = this.transformarDatosJewelryAPI(data);
            this.extraerCategorias();
            return this.productos;
            
        } catch (error) {
            console.error('Error al obtener productos:', error);
            // Fallback a datos mock
            this.productos = this.obtenerDatosMock();
            this.extraerCategorias();
            return this.productos;
        }
    }

    // Transformación de datos con métodos modernos
    transformarDatosJewelryAPI = (data) => {
        return data.map((item, index) => {
            const nombre = item.name || item.title || `Joya ${index + 1}`;
            const precio = this.parsearPrecio(item.price);
            const categoria = this.mapearCategoriaJewelry(item.category);
            const descripcion = this.generarDescripcion(item, categoria);
            
            return new Producto({
                id: item.id || index + 1,
                nombre,
                precio,
                categoria,
                descripcion,
                imagen: item.image || this.obtenerImagenMock(categoria),
                stock: Math.floor(Math.random() * 20) + 5
            });
        });
    };
}
```

**Características implementadas:**
- **async/await**: Manejo elegante de promesas
- **Fetch API**: Comunicación HTTP moderna
- **Error handling**: Try-catch con fallback
- **Array.map()**: Transformación de datos
- **Template literals**: Logging informativo

### 3. Manipulación del DOM

#### Clase `UI`
```javascript
class UI {
    constructor() {
        this.productoService = new ProductoService();
        this.carrito = new Carrito();
        this.productosActuales = [];
        this.categoriaActual = 'all';
        this.terminoBusqueda = '';
        
        this.inicializar();
    }

    // Event delegation y listeners modernos
    configurarEventListeners = () => {
        // Debounce para búsqueda en tiempo real
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', this.debounce(this.handleBusqueda.bind(this), 300));

        // Event delegation para categorías
        const categoriesGrid = document.getElementById('categoriesGrid');
        categoriesGrid.addEventListener('click', this.handleCategoriaClick.bind(this));
    };

    // Debounce function para optimización
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

    // Creación dinámica de elementos DOM
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
}
```

**Características implementadas:**
- **Event delegation**: Manejo eficiente de eventos
- **Debounce**: Optimización de búsqueda en tiempo real
- **Template literals**: Generación dinámica de HTML
- **Event.stopPropagation()**: Control de propagación de eventos
- **Loading lazy**: Optimización de imágenes

## Diseño y UX

### CSS3 Moderno
```css
/* Variables CSS para consistencia */
:root {
    --primary-color: #ff6b9d;
    --secondary-color: #c44569;
    --accent-color: #ff4757;
}

/* Flexbox y Grid para layouts */
.categories-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
}

/* Animaciones CSS */
@keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* Media queries para responsive design */
@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        gap: 1rem;
    }
}
```

### Características de Diseño
- **Responsive Design**: Mobile-first approach
- **CSS Grid y Flexbox**: Layouts modernos
- **Animaciones CSS**: Transiciones suaves
- **Variables CSS**: Consistencia de colores
- **Media Queries**: Adaptación a dispositivos

## Funcionalidades Implementadas

### Requerimientos Cumplidos

#### 1. **Programación Orientada a Objetos**
- Clase `Producto` con propiedades y métodos
- Clase `Carrito` para gestión del carrito
- Clase `ProductoService` para manejo de datos
- Clase `UI` para control de interfaz

#### 2. **Características ES6+**
- **Clases**: Sintaxis moderna de clases
- **Arrow Functions**: Funciones de flecha en métodos
- **Destructuring**: Extracción eficiente de datos
- **Template Literals**: Cadenas dinámicas
- **Async/Await**: Programación asíncrona moderna
- **Map y Set**: Estructuras de datos modernas

#### 3. **Manipulación del DOM**
- Creación dinámica de elementos HTML
- Event delegation para eficiencia
- Actualización en tiempo real de la UI
- Modales y notificaciones

#### 4. **Programación Asíncrona**
- Fetch API para comunicación HTTP
- Async/await para manejo de promesas
- Error handling robusto
- Loading states y feedback

#### 5. **API Externa**
- Integración con Jewelry API
- Transformación de datos
- Fallback a datos mock
- Manejo de errores de red

## Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para cargar productos desde API)

### Instalación
1. Clona o descarga el proyecto
2. Abre `index.html` en tu navegador
3. ¡La aplicación está lista para usar!

### Uso
1. **Navegar**: Usa las categorías para filtrar joyas
2. **Buscar**: Escribe en el campo de búsqueda
3. **Ver detalles**: Haz clic en cualquier joya
4. **Agregar al carrito**: Selecciona cantidad y haz clic en "Agregar"
5. **Finalizar compra**: Completa tu compra desde el carrito

## Estructura de Datos

### Producto
```javascript
{
    id: number,
    nombre: string,
    precio: number,
    categoria: string,
    descripcion: string,
    imagen: string,
    stock: number
}
```

### Item del Carrito
```javascript
{
    producto: { id, nombre, precio, imagen },
    cantidad: number,
    subtotal: number
}
```

## Conceptos Técnicos Demostrados

### JavaScript Moderno
- **ES6+ Features**: Clases, arrow functions, destructuring
- **Async Programming**: Promesas, async/await, Fetch API
- **DOM Manipulation**: Event handling, dynamic content
- **Data Structures**: Map, Array methods, Object destructuring

### Programación Orientada a Objetos
- **Encapsulation**: Propiedades y métodos encapsulados
- **Inheritance**: Herencia implícita de Object
- **Polymorphism**: Métodos con diferentes implementaciones
- **Abstraction**: Interfaces claras entre clases

### Web APIs
- **Fetch API**: Comunicación HTTP moderna
- **LocalStorage**: Persistencia de datos del cliente
- **DOM API**: Manipulación de elementos HTML
- **Event API**: Gestión de eventos del usuario

## Mejoras Futuras

- [ ] Sistema de autenticación
- [ ] Wishlist de productos
- [ ] Sistema de reseñas y calificaciones
- [ ] Integración con pasarela de pagos
- [ ] PWA (Progressive Web App)
- [ ] Filtros avanzados (precio, marca, etc.)

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## Autor

**Magdalena Inalaf G.**  
Desarrolladora Full Stack especializada en JavaScript y tecnologías web modernas.

### Contacto
- Sitio web: [https://inalaf.ca](https://inalaf.ca)
- GitHub: [MagdaIG](https://github.com/MagdaIG)
- LinkedIn: [minalaf](https://www.linkedin.com/in/minalaf/)
- Email: contacto@inalaf.ca

---

