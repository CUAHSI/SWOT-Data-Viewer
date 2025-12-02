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
      path: '/notebooks',
      name: 'notebooks',
      component: () => import('../views/NotebooksView.vue')
    },
    {
      path: '/api',
      name: 'api',
      component: ApiView
    },
    {
      path: '/plots/:featureId?',
      name: 'plots',
      component: () => import('../views/ChartsView.vue'),
      props: true
    },
    {
      path: '/feature/:featureId?',
      name: 'feature',
      props: true,
      component: () => import('../views/FeatureView.vue')
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

export default router
