# Steven Scanner

## Descripción
Aplicación web para gestión de inventario, ventas y automatización de mensajería WhatsApp. Plataforma para negocios de compra-venta que integra escaneo de productos, cálculo de márgenes e intereses, y envío masivo personalizado por WhatsApp (AutoWhat).

## Stack principal
- Vue 3.4
- Vite 5.3
- Pinia 2.3
- Vue Router 4.3
- Axios 1.7
- Socket.IO Client 4.8
- Tailwind CSS 3.4
- TypeScript 5.9
- vite-plugin-pwa 0.20
- xlsx 0.18
- dayjs 1.11
- vue3-toastify 0.2
- Font Awesome 6.x

## URLs de API
- Backend principal: https://steven.multimarcas.app
- AutoWhat API (local): http://localhost:3300

## Estructura del proyecto
```
src/
├── main.js                    # Entrada de la app
├── App.vue                    # Componente raíz
├── router/index.js            # 11 rutas, guard con requiresAuth
├── store/                     # Stores Pinia (7 stores activos)
├── stores/                    # Store de ejemplo (no usado)
├── composables/               # Lógica reutilizable y clientes HTTP
├── views/                     # 11 vistas
├── components/                # Componentes organizados por módulo
└── assets/main.css            # Estilos globales
```

## Reglas generales
- No meter lógica de negocio pesada en las vistas
- Reutilizar componentes cuando tenga sentido
- Mantener separada la lógica de API, sockets, estado global y UI
- Los stores deben concentrar el estado compartido sin duplicación
- Las peticiones HTTP deben seguir un patrón consistente
- La conexión Socket.IO no debe dispersarse por toda la app
- La autenticación JWT debe aplicarse de manera consistente
- Los errores del backend deben traducirse a mensajes útiles para el usuario
- Limpiar intervalos y listeners en onUnmounted

## Autenticación
- JWT almacenado en localStorage (clave: "token")
- Guard en router.beforeEach valida requiresAuth
- Headers se envían manualmente en cada composable (sin interceptor global)
- También se almacena: user_uuid, username, verificado, rol

## Convenciones de nombres
- Composables: use* (useAutowat, useMenuAutowhat)
- Stores: store* (storeMenuAutowhat, storeCargarBase)
- Componentes: PascalCase
- Variables: camelCase
- Eventos socket (pendiente): session:*, message:*, auth:*, error:*

## Módulos principales
- **Inventario**: Carga Excel, escaneo QR, exportación
- **Ventas**: Cálculo de márgenes y precios
- **Intereses**: Cálculo financiero
- **AutoWhat**: Envío masivo WhatsApp con plantillas, personalización y categorías

## Comandos
- desarrollo: npm run dev
- build: npm run build
- preview: npm run preview

## Riesgos a evitar
- Vistas monolíticas con lógica inline
- Duplicación de headers/token en cada petición
- setInterval sin limpieza (memory leaks)
- Mezcla de convenciones entre store/ y stores/
- URLs hardcodeadas fuera de getRoutes.js
- Inconsistencia entre eventos del backend y listeners del frontend
- Token expirado sin manejo
