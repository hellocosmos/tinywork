<template>
  <div class="loading_info" v-if="isLoading">
    <p>로그인 처리중...</p>
  </div>
  <div class="form-container">
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="이메일 입력"
          required
          v-model="email"
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="비밀번호 입력"
          required
          v-model="password"
        />
      </div>
      <div class="separator"></div>
      <button type="submit">
        <Icon icon="mdi:login" width="20" height="20" class="login-icon" />
        로그인
      </button>
      <router-link to="/signup">회원가입</router-link>
    </form>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import supabase from '../supabase';
import { ref } from 'vue';
import { useErrorHandler } from '../composables/error-handle';
import { Icon } from '@iconify/vue';

const email = ref('');
const password = ref('');

const router = useRouter();
const isLoading = ref(false);
const { handleError } = useErrorHandler();

const handleLogin = async () => {
  console.log(email.value, password.value);
  isLoading.value = true;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    handleError(error);
    isLoading.value = false;
    router.push('/');
  } else {
    alert('로그인 성공');
    console.log(data);
    isLoading.value = false;
    router.push('/job-list');
  }
};
</script>

<style lang="scss" scoped>
.form-container {
  max-width: 420px;
  margin: 40px auto;
  padding: 32px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
    }

    input,
    textarea {
      padding: 12px 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 15px;
      transition: all 0.2s;

      &:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
      }
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }
  }

  .separator {
    height: 1px;
    background-color: #e0e0e0;
    margin: 4px 0;
  }

  button {
    margin-top: 8px;
    background: #3498db;
    color: white;
    padding: 14px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .login-icon {
      color: currentColor;
    }

    &:hover {
      background: #2980b9;
      .login-icon {
        color: white;
      }
    }
  }

  a {
    text-align: center;
    color: #666;
    text-decoration: none;
    font-size: 14px;
    margin-top: 16px;

    &:hover {
      color: #3498db;
    }
  }
}

.loading_info {
  position: fixed;
  inset: 0;
  background: rgba(44, 62, 80, 0.85);
  display: grid;
  place-items: center;
  color: white;
  font-size: 16px;
  z-index: 1000;

  p {
    background: rgba(52, 152, 219, 0.1);
    padding: 16px 32px;
    border-radius: 8px;
    font-weight: 500;
  }
}

.iconify {
  font-size: 20px;
  vertical-align: middle;
}
</style>
