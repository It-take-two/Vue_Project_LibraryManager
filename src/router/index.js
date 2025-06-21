import { createRouter, createWebHashHistory } from 'vue-router'
import Home from "../components/Home.vue";
import Login from '../components/Login.vue';


const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem("refreshToken") !== null;
    const publicPaths = ['/login'];

    if (!isLoggedIn && !publicPaths.includes(to.path)) {
        next('/login');
    } else {
        next();
    }
});

export default router;