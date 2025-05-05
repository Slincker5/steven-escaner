import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        requiresAuth: true,
        title: "Panel de administracion",
      },
    },
    {
      path: '/escaneados',
      name: 'escaneado',
      component: () => import('../views/EscaneadosView.vue'),
      meta: {
        requiresAuth: true,
        title: "Productos escaneados",
      },
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: () => import('../views/InventarioView.vue'),
      meta: {
        requiresAuth: true,
        title: "Modulo de inventario",
      },
    },
    {
      path: '/precio-venta',
      name: 'precioventa',
      component: () => import('../views/PrecioVentaView.vue'),
      meta: {
        requiresAuth: true,
        title: "Precio venta",
      },
    },
    {
      path: '/calcular-interes',
      name: 'calcular',
      component: () => import('../views/CalcularView.vue'),
      meta: {
        requiresAuth: true,
        title: "Calcular interes",
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        requiresAuth: false,
        title: "Iniciar sesion",
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: {
        requiresAuth: false,
        title: "Registro",
      },
    },
    {
      path: '/lista-de-aprobacion',
      name: 'aprobacion',
      component: () => import('../views/UsuariosNoAprobadosView.vue'),
      meta: {
        requiresAuth: true,
        title: "Lista de aprobacion",
      },
    },
    {
      path: '/api-connect',
      name: 'aprobacion',
      component: () => import('../views/WhatsappApiConnectView.vue'),
      meta: {
        requiresAuth: true,
        title: "Conectar Whatsapp",
      },
    }
  ]
})

router.beforeEach((to, from, next) => {
  // Lógica para manejar la autenticación
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!localStorage.getItem("token")) {
      next({
        path: "/login",
      });
      return; // Asegúrate de retornar aquí para evitar que se ejecute el código siguiente
    }
  } else {
    if (
      (to.path === "/register" && localStorage.getItem("token")) ||
      (to.path === "/login" && localStorage.getItem("token"))
    ) {
      next("/");
      return; // Asegúrate de retornar aquí para evitar que se ejecute el código siguiente
    }
  }

  // Lógica para establecer el título
  const pageTitle = to.meta.title;
  if (pageTitle) {
    document.title = pageTitle;
  }

  next();
});

export default router
