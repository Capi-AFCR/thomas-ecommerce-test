E-Commerce App

Descripción

Esta aplicación es un sistema de comercio electrónico desarrollado como parte de un desafío técnico para evaluar conocimientos en desarrollo full-stack. Utiliza Spring Boot para el backend y Angular con TypeScript y Angular Material para el frontend. La aplicación permite gestionar productos, inventarios, órdenes, usuarios y reportes, con funcionalidades como autenticación, búsqueda de productos, creación de órdenes con descuentos, y auditoría.

Características Principales





Autenticación y Registro:





Login de usuarios con validación de credenciales.



Creación de nuevos usuarios con campos para nombre de usuario, contraseña, email y rol (Usuario o Admin).



Gestión de usuarios (CRUD) con acciones para ver detalles, desactivar y eliminar (restringido a administradores).



Gestión de Productos:





CRUD de productos (crear, leer, actualizar, eliminar).



Búsqueda de productos por nombre, precio mínimo y máximo.



Modal para crear nuevos productos (restringido a administradores).



Gestión de Órdenes:





Creación de órdenes con selección de productos y cantidades.



Opción para generar pedidos aleatorios.



Cálculo de total estimado con soporte para descuentos:





10% de descuento en órdenes dentro de un rango de tiempo parametrizado.



50% de descuento para pedidos aleatorios (si se registran en el rango de tiempo).



5% de descuento adicional para clientes frecuentes.



Gestión de Inventarios:





Visualización y actualización de niveles de inventario (integrado con productos).



Reportes:





Productos activos.



Top 5 productos más vendidos.



Top 5 clientes frecuentes.



Seguridad:





Autenticación con JWT mediante un interceptor que agrega el token a las solicitudes HTTP.



Auditoría:





Registro de acciones de usuarios (creación, actualización, eliminación) en el backend.



Pruebas Unitarias:





Pruebas completas para componentes frontend (LoginComponent, RegisterComponent, ProductsComponent, UsersComponent, NewOrderComponent, NewUserComponent) y el interceptor JWT.

Requisitos Previos





Backend:





Java 17+



Maven 3.8+



Spring Boot 3.x



Frontend:





Node.js 18+



Angular CLI 17.x



TypeScript 5.2+



Base de Datos:





MySQL/PostgreSQL (o cualquier base de datos configurada en el backend).

Instalación





Clonar el Repositorio:

git clone <URL_DEL_REPOSITORIO>
cd e-commerce-app



Configurar el Backend:





Navega al directorio del backend:

cd backend



Configura la base de datos en src/main/resources/application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce
spring.datasource.username=<TU_USUARIO>
spring.datasource.password=<TU_CONTRASEÑA>
spring.jpa.hibernate.ddl-auto=update



Compila y ejecuta el backend:

mvn spring-boot:run



Configurar el Frontend:





Navega al directorio del frontend:

cd frontend



Instala las dependencias:

npm install



Configura el proxy para evitar problemas de CORS en src/proxy.conf.json:

{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}



Actualiza angular.json para usar el proxy:

"serve": {
  "options": {
    "proxyConfig": "src/proxy.conf.json"
  }
}



Ejecutar el Frontend:





Inicia el servidor de desarrollo:

ng serve



Acceder a la Aplicación:





Abre el navegador en http://localhost:4200.

Estructura del Proyecto

e-commerce-app/
├── backend/
│   ├── src/main/java/com/example/ecommerce/
│   │   ├── controllers/    # Controladores REST (UserController, ProductController, etc.)
│   │   ├── services/       # Servicios de negocio (ApiService, AuthService)
│   │   ├── repositories/   # Repositorios JPA
│   │   └── models/         # Entidades (User, Product, Order)
│   └── src/main/resources/
│       └── application.properties  # Configuración de base de datos
├── frontend/
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── login/              # LoginComponent (autenticación)
│   │   │   ├── register/           # RegisterComponent (creación de usuario)
│   │   │   ├── products/           # ProductsComponent (gestión de productos)
│   │   │   ├── users/              # UsersComponent (gestión de usuarios)
│   │   │   ├── new-user/           # NewUserComponent (modal para crear usuario)
│   │   │   ├── new-order/          # NewOrderComponent (modal para crear orden)
│   │   │   ├── orders/             # OrdersComponent (gestión de órdenes)
│   │   │   ├── inventory/          # InventoryComponent (gestión de inventarios)
│   │   │   └── reports/            # ReportsComponent (reportes)
│   │   ├── services/
│   │   │   ├── api.service.ts      # Comunicación con backend
│   │   │   └── auth.service.ts     # Autenticación y roles
│   │   └── interceptors/
│   │       └── jwt.interceptor.ts  # Interceptor JWT
│   ├── src/proxy.conf.json         # Configuración de proxy
│   └── angular.json                # Configuración de Angular
└── README.md

Uso





Iniciar Sesión:





Navega a /login e ingresa credenciales válidas.



Los administradores pueden acceder a funciones adicionales (gestión de usuarios, inventarios, reportes).



Registrar Usuario:





En /register, completa el formulario con nombre de usuario, contraseña, email y rol.



Gestionar Productos:





En /products, busca productos por nombre y rango de precios, crea nuevos productos, o elimina/actualiza existentes (solo administradores).



Crear Órdenes:





En /orders, crea una nueva orden seleccionando productos y cantidades, o genera un pedido aleatorio.



Los descuentos se aplican automáticamente según el rango de tiempo, tipo de pedido, y estado de cliente frecuente.



Gestionar Usuarios:





En /users, visualiza, desactiva, elimina o crea usuarios (solo administradores).



Ver Reportes:





En /reports, consulta reportes de productos activos, top 5 productos más vendidos y top 5 clientes frecuentes.

Pruebas Unitarias

El proyecto incluye pruebas unitarias para todos los componentes y el interceptor JWT, utilizando Jasmine y Karma. Para ejecutar las pruebas:

cd frontend
ng test

Cobertura:





LoginComponent: Formulario, autenticación, navegación, y renderizado.



RegisterComponent: Formulario, registro, cancelación, y renderizado.



ProductsComponent: CRUD, búsqueda, modal de creación, y renderizado.



UsersComponent: CRUD, modal de creación de usuario, y renderizado.



NewUserComponent: Formulario y renderizado.



NewOrderComponent: Formulario, adición de productos, pedidos aleatorios, y renderizado.



jwtInterceptor: Adición de encabezado Authorization.

Casos Especiales





Descuentos:





10% de descuento: Aplicado a todas las órdenes dentro de un rango de tiempo parametrizado (definido en el backend).



50% de descuento: Aplicado a pedidos aleatorios registrados en el rango de tiempo.



5% adicional: Aplicado a clientes frecuentes (identificados en reportes).



Auditoría:





Registro de acciones (crear, actualizar, eliminar) en el backend (pendiente de implementación detallada).

Metodología de Versionamiento

El proyecto utiliza Git para control de versiones, con ramas:





main: Código estable para producción.



develop: Integración de nuevas funcionalidades.



feature/*: Desarrollo de características específicas.

Requisitos Pendientes





Auditoría: Implementar registro de acciones en el backend (e.g., tabla de auditoría).



Reportes: Completar pruebas unitarias para ReportsComponent tras resolver errores.



Backend: Compartir código para verificar soporte de APIs y descuentos.

Contribuciones





Crea una rama feature/nueva-funcionalidad.



Realiza cambios y escribe pruebas unitarias.



Envía un pull request a develop.

Licencia

MIT License © 2025
