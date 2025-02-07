<template>
  <div class="form-container" v-if="isLogin">
    <div class="top-info-box">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <img
            :src="avatarUrl || '/default-avatar.png'"
            alt="프로필 이미지"
            class="avatar-image"
          />
          <label for="avatar-upload" class="avatar-upload-label">
            <Icon icon="material-symbols:photo-camera" />
            <span>이미지 변경</span>
          </label>
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            @change="handleAvatarUpload"
            class="avatar-input"
          />
        </div>
      </div>
      <div class="right-info">
        <span class="name">{{ name }}</span>
        <div class="contact-info">
          <p class="info-item">
            <Icon icon="material-symbols:mail-outline" />
            <span>{{ user?.email }}</span>
          </p>
          <p class="info-item">
            <Icon icon="material-symbols:phone-enabled-outline" />
            <span>{{ tel }}</span>
          </p>
          <address class="info-item">
            <Icon icon="material-symbols:location-on-outline" />
            <span>{{ addr }}</span>
          </address>
        </div>
      </div>
    </div>
    <div class="text-info">
      <h4>자기소개</h4>
      <p>{{ text }}</p>
    </div>
    <details class="job-list">
      <summary>내 지원내역</summary>
      <p v-for="job in job_apply_list" :key="job.id">
        <span>[지원완료] {{ job.job_title }}</span>
        <time>{{ new Date(job.created_at).toLocaleDateString() }}</time>
      </p>
    </details>
    <details class="job-list">
      <summary>받은 지원내역</summary>
      <p v-for="job in job_recieve_list" :key="job.id">
        <span
          >{{ job.applicant_name }}님이 <q>{{ job.job_title }}</q
          >에 지원했습니다.</span
        >
        <time>{{ new Date(job.created_at).toLocaleDateString() }}</time>
      </p>
    </details>
    <div class="button-container">
      <button class="logout" @click="handleLogout">로그아웃</button>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../auth/auth';
import supabase from '../supabase';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

const { isLogin, user, checkLoginStatus } = useAuth(); // 로그인 상태 확인 함수 가져오기
const router = useRouter();
// const isLogin = ref(false); // 화면 표시 상태 변수

const name = ref('사용자 이름');
const addr = ref('사용자 주소');
const text = ref('자기소개 내용');
const tel = ref('사용자 전화번호');

const job_apply_list = ref([]);
const job_recieve_list = ref([]);

const avatarUrl = ref(null);
const isUploading = ref(false);

// 받은 지원내역 가져오는 함수
const getRecieveList = async () => {
  const { data, error } = await supabase
    .from('job_apply_list')
    .select()
    .eq('employer_id', user.value.id);

  if (error) {
    alert('받은 지원내역 가져오기 실패');
  } else {
    job_recieve_list.value = data;
    console.log('job_recieve_list:', job_recieve_list.value);
  }
};

const getApplyList = async () => {
  const { data, error } = await supabase
    .from('job_apply_list')
    .select()
    .eq('applicant_id', user.value.id);

  if (error) {
    alert('지원내역 가져오기 실패');
  } else {
    job_apply_list.value = data;
    console.log('', job_apply_list.value);
  }
};

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert('로그아웃 실패');
  } else {
    alert('로그아웃 성공');
    router.push('/');
  }
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    isUploading.value = true;

    // 파일 이름을 유니크하게 생성
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`; // job-images 버킷의 루트에 저장

    // Storage에 이미지 업로드
    const { error: uploadError } = await supabase.storage
      .from('job-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 이미지 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from('job-images').getPublicUrl(filePath);

    // 사용자 프로필 업데이트
    const { error: updateError } = await supabase
      .from('user_table')
      .update({ avatar_url: publicUrl })
      .eq('id', user.value.id);

    if (updateError) throw updateError;

    avatarUrl.value = publicUrl;
  } catch (error) {
    console.error('Avatar upload error:', error);
    alert('이미지 업로드 중 오류가 발생했습니다.');
  } finally {
    isUploading.value = false;
  }
};

// 마운트시 로그인 상태 확인하기
onMounted(async () => {
  await checkLoginStatus();
  await getApplyList();
  await getRecieveList();

  // user_table에서 사용자 정보 가져오기
  const { data, error } = await supabase
    .from('user_table')
    .select()
    .eq('id', user.value.id)
    .single();

  name.value = data.name;
  addr.value = data.addr;
  text.value = data.text;
  tel.value = data.tel;

  // 프로필 이미지 로드
  if (data?.avatar_url) {
    avatarUrl.value = data.avatar_url;
  }
});
</script>

<style lang="scss" scoped>
.form-container {
  max-width: 600px;
  margin: 32px auto;
  padding: 24px;
}

.top-info-box {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  .right-info {
    margin-left: 32px;

    .name {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 12px;
      display: block;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
      font-style: normal;

      .iconify {
        color: #3498db;
        font-size: 18px;
      }
    }
  }
}

.text-info {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;

  h4 {
    font-size: 16px;
    color: #2c3e50;
    margin-bottom: 16px;
  }

  p {
    font-size: 15px;
    line-height: 1.6;
    color: #444;
  }
}

.job-list {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;

  summary {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    cursor: pointer;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;

    &::-webkit-details-marker {
      color: #3498db;
    }
  }

  p {
    padding: 16px 0;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;

    &:last-child {
      border-bottom: none;
    }

    span {
      font-size: 14px;
      color: #444;
    }

    time {
      font-size: 13px;
      color: #666;
      white-space: nowrap;
    }
  }
}

.button-container {
  margin-top: 32px; // 위 컨텐츠와의 간격
}

.logout {
  width: 100%;
  padding: 14px;
  background: #3498db;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2980b9;
  }
}

.avatar-section {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;

  &:hover .avatar-upload-label {
    opacity: 1;
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload-label {
  position: absolute;
  inset: 0;
  background: rgba(44, 62, 80, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  .iconify {
    font-size: 24px;
    margin-bottom: 4px;
  }

  span {
    font-size: 12px;
  }
}

.avatar-input {
  display: none;
}
</style>
