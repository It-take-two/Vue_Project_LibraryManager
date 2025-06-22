import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from "../components/LoginView.vue"
import UserLayout from '../components/UserLayout.vue';
import HomeView from '../components/HomeView.vue';
import BorrowView from '../components/BorrowView.vue';
import MyBorrowedBooksView from '../components/MyBorrowedBooksView.vue';
import UserCenterView from '../components/UserCenterView.vue'

const routes = [
  { path: '/login', component: LoginView },
  {
    path: '/',
    component: UserLayout,
    children: [
      { path: '', component: HomeView },
      { path: 'borrow', component: BorrowView },
      { path: 'borrowed', component: MyBorrowedBooksView },
      { path: 'profile', component: UserCenterView },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]



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