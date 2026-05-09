import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/main-layout.vue';

const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('@/authorization/pages/login-content.component.vue')
    },
    {
        path: '/signup',
        name: 'signup',
        component: () => import('@/authorization/pages/sign-up.component.vue')
    },
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/',
        component: MainLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/dashboard/pages/dashboard.component.vue')
            },
            {
                path: 'profesionales',
                name: 'profesionales',
                component: () => import('@/professionals/pages/professionals-list.component.vue')
            },
            {
                path: 'profesionales/:id',
                name: 'professional-detail',
                component: () => import('@/professionals/pages/professional-detail.component.vue')
            },
            {
                path: 'reservas',
                name: 'reservas',
                component: () => import('@/reservations/pages/reservations-list.component.vue')
            },
            {
                path: 'mensajes',
                name: 'mensajes',
                component: () => import('@/messages/pages/messages-view.vue')
            },
            {
                path: 'perfil',
                name: 'perfil',
                component: () => import('@/profile/pages/profile-view.component.vue')
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to) => {
    const isAuthenticated = !!localStorage.getItem('auth_token');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !isAuthenticated) {
        return { name: 'login' };
    }

    return true;
});

export default router;