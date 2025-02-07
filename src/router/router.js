import { createRouter, createWebHistory } from 'vue-router';
import Login from '../view/Login.vue'
import SignUp from '../view/SignUp.vue'
import JobPost from '../view/JobPost.vue'
import JobList from '../view/JobList.vue'
import JobDetail from '../view/JobDetail.vue'
import UserProfile from '../view/UserProfile.vue'
import JobPostUpdate from '../view/JobPostUpdate.vue'
import { useAuth } from '../auth/auth';

const routes = [
  // 로그인이 필요하지 않은 라우트
  {
    path: '/',
    name: 'Home',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignUp,
    meta: { requiresAuth: false }  // 회원가입 페이지는 로그인 불필요
  },
  {
    path: '/job-list',
    name: 'JobList',
    component: JobList,
    meta: { requiresAuth: false }  // 구인목록은 누구나 볼 수 있게
  },
  // 로그인이 필요한 라우트
  {
    path: '/job-post',
    name: 'JobPost',
    component: JobPost,
    meta: { requiresAuth: true }  // 구인등록은 로그인 필요
  },
  {
    path: '/user-profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }  // 프로필은 로그인 필요
  },
  { 
    path: '/job-detail/:id', 
    component: JobDetail,
    meta: { requiresAuth: true }  // 상세보기는 로그인 필요
  },
  { 
    path: '/job-post-update/:id', 
    component: JobPostUpdate
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 전역 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const { checkLoginStatus } = useAuth();
  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = await checkLoginStatus();

  // 로그인 상태에서 루트 페이지나 로그인 페이지로 접근하면 job-list로 리다이렉트
  if (isAuthenticated && (to.path === '/' || to.path === '/login')) {
    next('/job-list');
    return;
  }

  if (requiresAuth && !isAuthenticated) {
    alert('로그인 후에 이용해 주세요!');
    next('/');
  } else {
    next();
  }
});

export default router