<template>
  <div class="loading_info" v-if="isLoading">
    <p>회원가입 처리중...</p>
  </div>
  <div class="form-container">
    <div class="form-header">
      <h2>회원가입</h2>
      <p>땅콩알바 서비스 이용을 위한 회원가입</p>
    </div>
    <form @submit.prevent="handleSignUp">
      <!-- 계정 정보 섹션 -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-number">1</span>
          <h3>계정 정보</h3>
        </div>
        <div class="form-group">
          <label for="email">이메일</label>
          <input
            type="email"
            id="email"
            placeholder="이메일 입력"
            required
            v-model="email"
          />
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            type="password"
            id="password"
            placeholder="비밀번호 입력 (6자 이상)"
            required
            v-model="password"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="비밀번호 다시 입력"
            required
            v-model="confirmPassword"
            :class="{ 'password-mismatch': passwordMismatch }"
          />
          <span class="error-message" v-if="passwordMismatch">
            비밀번호가 일치하지 않습니다
          </span>
        </div>
      </div>

      <!-- 개인 정보 섹션 -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-number">2</span>
          <h3>기타 정보</h3>
        </div>
        <div class="form-group">
          <label for="name">이름</label>
          <input
            type="text"
            id="name"
            placeholder="이름 입력"
            required
            v-model="name"
          />
        </div>
        <div class="form-group">
          <label for="tel">연락처</label>
          <input
            type="tel"
            id="tel"
            placeholder="010-1234-5678"
            required
            v-model="tel"
          />
        </div>
        <div class="form-group">
          <label for="addr">주소</label>
          <input
            type="text"
            id="addr"
            placeholder="주소 입력"
            required
            v-model="addr"
          />
        </div>
      </div>

      <!-- 추가 정보 섹션 -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-number">3</span>
          <h3>자기소개</h3>
        </div>
        <div class="form-group">
          <textarea
            id="text"
            v-model="text"
            placeholder="자기소개를 입력해주세요"
          ></textarea>
        </div>
      </div>

      <button type="submit" :disabled="passwordMismatch">회원가입 완료</button>
      <router-link to="/" class="login-link">
        <span>이미 계정이 있으신가요?</span>
        <strong>로그인하기</strong>
      </router-link>
    </form>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import supabase from '../supabase';
import { ref, computed } from 'vue';
import { useErrorHandler } from '../composables/error-handle';

const router = useRouter();
const { handleError } = useErrorHandler();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const tel = ref('');
const text = ref('');
const name = ref('');
const addr = ref('');
const isLoading = ref(false);

// 비밀번호 일치 여부 확인
const passwordMismatch = computed(() => {
  return (
    password.value &&
    confirmPassword.value &&
    password.value !== confirmPassword.value
  );
});

const handleSignUp = async () => {
  if (password.value !== confirmPassword.value) {
    handleError('비밀번호가 일치하지 않습니다.');
    return;
  }

  isLoading.value = true;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });

    if (error) {
      handleError(error);
      isLoading.value = false; // 에러 발생 시 로딩 상태 해제
      return; // 에러 발생 시 여기서 종료
    }

    console.log('회원가입 성공');
    const { error: profileError } = await supabase.from('user_table').insert({
      tel: tel.value,
      text: text.value,
      name: name.value,
      addr: addr.value,
    });

    if (profileError) {
      handleError(profileError);
      isLoading.value = false; // 프로필 저장 에러 시 로딩 상태 해제
      return;
    }

    alert('회원가입이 완료되었습니다.!');
    router.push('/');
  } catch (err) {
    handleError(err);
  } finally {
    isLoading.value = false; // 모든 처리가 끝난 후 로딩 상태 해제
  }
};
</script>

<style lang="scss" scoped>
.form-container {
  max-width: 480px;
  margin: 40px auto;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);

  .form-header {
    text-align: center;
    margin-bottom: 40px;

    h2 {
      color: #2c3e50;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    p {
      color: #666;
      font-size: 15px;
    }
  }

  .form-section {
    margin-bottom: 32px;
    background: #f8fafd;
    border: 1px solid #e1e8f5;
    border-radius: 16px;
    padding: 24px;

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e1e8f5;

      .section-number {
        width: 32px;
        height: 32px;
        background: #3498db;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
      }

      h3 {
        color: #2c3e50;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .form-group {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
      }

      input,
      textarea {
        background: white;
        border: 2px solid #e1e8f5;
        width: 100%;
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 15px;
        transition: all 0.2s;

        &:focus {
          background: white;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        &::placeholder {
          color: #999;
        }
      }

      textarea {
        min-height: 120px;
        resize: vertical;
        line-height: 1.6;
      }

      .password-mismatch {
        border-color: #e74c3c;

        &:focus {
          border-color: #e74c3c;
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
        }
      }

      .error-message {
        color: #e74c3c;
        font-size: 13px;
        margin-top: 6px;
      }
    }

    &:last-of-type {
      margin-bottom: 40px;
    }
  }

  button {
    width: 100%;
    background: #3498db;
    color: white;
    padding: 16px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 20px;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);

    &:hover {
      background: #2980b9;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    }

    &:disabled {
      background: #95a5a6;
      box-shadow: none;
      transform: none;
    }
  }

  .login-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
    color: #666;
    text-decoration: none;
    font-size: 14px;

    strong {
      color: #3498db;
      font-weight: 600;
    }

    &:hover strong {
      text-decoration: underline;
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

@media (max-width: 480px) {
  .form-container {
    margin: 20px auto;
    padding: 24px 16px;
    border-radius: 12px;

    .form-section {
      padding: 16px;

      .section-header {
        padding-bottom: 12px;
        margin-bottom: 16px;

        .section-number {
          width: 28px;
          height: 28px;
          font-size: 14px;
        }
      }
    }

    button {
      padding: 12px;
      font-size: 15px;
    }
  }
}
</style>
