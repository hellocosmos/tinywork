<template>
  <nav>
    <div class="nav-container">
      <router-link :to="isLogin ? '/job-list' : '/'" class="logo">
        <Icon icon="emojione:peanuts" width="24" height="24" />
        <span>띵콩알바</span>
      </router-link>

      <div class="nav-links">
        <router-link to="/job-list" class="nav-link">
          <Icon icon="material-symbols:format-list-bulleted" />
          <span>구인목록</span>
        </router-link>
        <template v-if="isLogin">
          <router-link to="/job-post" class="nav-link">
            <Icon icon="material-symbols:edit-square-outline" />
            <span>구인등록</span>
          </router-link>
          <router-link to="/user-profile" class="profile-link">
            <div class="avatar">
              <Icon
                icon="material-symbols:person"
                width="24"
                height="24"
                class="profile-icon"
              />
            </div>
          </router-link>
        </template>
        <router-link to="/" class="nav-link" v-else>
          <Icon icon="mdi:login" width="20" height="20" />
          <span>로그인</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { useAuth } from '../auth/auth';
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const { isLogin, checkLoginStatus } = useAuth();
const router = useRouter();

// 컴포넌트 마운트 시 로그인 상태 확인
onMounted(async () => {
  await checkLoginStatus();
});

// 라우트 변경 시마다 로그인 상태 확인
watch(
  () => router.currentRoute.value.path,
  async () => {
    await checkLoginStatus();
  }
);
</script>

<style lang="scss" scoped>
nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #2c3e50;
  font-weight: 600;
  font-size: 18px;
}

.nav-links {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.2s;

  .iconify {
    font-size: 20px;
  }

  &:hover {
    background: rgba(52, 152, 219, 0.1);
    color: #3498db;
  }

  &.router-link-active {
    background: #3498db;
    color: white;
  }
}

.profile-link {
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 50%;
  transition: all 0.2s;
  margin-left: 8px;

  &:hover {
    background: rgba(52, 152, 219, 0.1);
  }
}

.avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #3498db;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(52, 152, 219, 0.1);

  .profile-icon {
    color: #3498db;
  }
}

@media (max-width: 640px) {
  .nav-container {
    padding: 0 16px;
  }

  .nav-link {
    padding: 8px 12px;

    span {
      display: none;
    }

    .iconify {
      font-size: 24px;
    }
  }

  .avatar {
    width: 32px;
    height: 32px;
  }
}
</style>
