import { createRouter, createWebHashHistory } from 'vue-router'
import MapView from '../views/MapView.vue'
import ApiView from '../views/ApiView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/map'
    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
      meta: {
        showMap: true
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/api',
      name: 'api',
      component: ApiView
    },
    {
      path: '/plots/:reachId?',
      name: 'plots',
      component: () => import('../views/ChartsView.vue'),
      props: true
    },
    {
      path: "/reach/:reachId",
      name: "reach",
      component: () => import('../views/ReachView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/ChartsDashboardView.vue')
    },
    {
      path: '/auth-redirect',
      name: 'auth-redirect',
      component: () => import('../views/AuthRedirectView.vue'),
      meta: {
        hideNavigation: true
      }
    }
  ]
})

// router.beforeEach(async (to) => {
//   // redirect to login page if not logged in and trying to access a restricted page
//   const publicPages = ['/'];
//   const authRequired = !publicPages.includes(to.path);
//   const auth = useAuthStore();

//   if (authRequired && !auth.user) {
//       auth.returnUrl = to.fullPath;
//       return '/';
//   }
// });

export default router
