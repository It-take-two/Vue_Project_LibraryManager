// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

import LoginView from '../components/LoginView.vue'
import UserLayout from '../components/UserLayout.vue'
import HomeView from '../components/HomeView.vue'
import BorrowView from '../components/BorrowView.vue'
import MyBorrowedBooksView from '../components/MyBorrowedBooksView.vue'
import UserCenterView from '../components/UserCenterView.vue'

import AdminLayout from '../components/AdminLayout.vue'
import DashboardView from '../components/DashboardView.vue'
import BooksView from '../components/BooksView.vue'
import RecordsView from '../components/RecordsView.vue'
import UsersView from '../components/UsersView.vue'
import AdminsView from '../components/AdminsView.vue'

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
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: DashboardView },
      { path: 'records', component: RecordsView },
      { path: 'books', component: BooksView },
      { path: 'users', component: UsersView },
      { path: 'admins', component: AdminsView },
      { path: 'profile', component: UserCenterView },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('refreshToken')
  const role = localStorage.getItem('roleName')
  const isAdmin = role === 'admin'
  const isAdminRoute = to.path.startsWith('/admin')
  const publicPaths = ['/login']

  if (!isLoggedIn && !publicPaths.includes(to.path)) {
    return next('/login')
  }

  if (isAdminRoute && !isAdmin) {
    return next('/')
  }

  if (to.path === '/login' && isLoggedIn) {
    return next(isAdmin ? '/admin/dashboard' : '/')
  }

  next()
})

export default router