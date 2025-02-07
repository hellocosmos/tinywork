<template>
  <section v-if="isLogin && post">
    <!-- 이미지 섹션 -->
    <figure v-if="post.img_url" class="image-container">
      <img :src="post.img_url" alt="head image" />
    </figure>

    <!-- 상세정보 -->
    <div class="container" v-if="post">
      <!-- 제목 섹션 -->
      <div class="content-section">
        <div class="section-header">
          <h2>{{ post.title }}</h2>
          <div class="company-info">
            <p class="company-name">{{ post.company_name }}</p>
            <span class="divider">&middot;</span>
            <p class="location">{{ post.location }}</p>
          </div>
        </div>
      </div>

      <!-- 급여 섹션 -->
      <div class="content-section">
        <div class="section-title">
          <Icon icon="material-symbols:payments-outline" />
          <h3>급여 정보</h3>
        </div>
        <div class="section-content">
          <p class="pay">
            <span class="label">{{ post.pay_rule }}</span>
            <b>{{ post.pay.toLocaleString() }}원</b>
          </p>
        </div>
      </div>

      <!-- 상세설명 섹션 -->
      <div class="content-section">
        <div class="section-title">
          <Icon icon="material-symbols:description-outline" />
          <h3>상세 설명</h3>
        </div>
        <div class="section-content">
          <p class="desc">{{ post.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 하단 버튼 그룹 -->
    <div class="bottom-btn-group" v-if="post && post.author !== user.id">
      <a class="btn-tel" :href="`tel:${post.tel}`">
        <Icon icon="material-symbols:call" />
        전화문의
      </a>
      <button class="btn-apply-disable" v-if="isApplied">
        <Icon icon="material-symbols:check-circle" />
        지원완료
      </button>
      <button class="btn-apply" @click="handleApply" v-if="!isApplied">
        <Icon icon="material-symbols:edit-document" />
        지원하기
      </button>
    </div>
    <div class="bottom-btn-group" v-if="post && post.author === user.id">
      <router-link class="btn-tel" :to="`/job-post-update/${post.id}`">
        <Icon icon="material-symbols:edit" />
        수정
      </router-link>
      <button class="btn-delete" @click="handelDelete">
        <Icon icon="material-symbols:delete" />
        삭제
      </button>
    </div>
  </section>
</template>

<script setup>
import { useAuth } from '../auth/auth';
import { useRoute, useRouter } from 'vue-router';
import supabase from '../supabase';
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';

const { isLogin, user, checkLoginStatus } = useAuth(); // 로그인 상태 확인 함수 가져오기
const route = useRoute();
const router = useRouter();
const id = route.params.id;
const post = ref(null); // 글 데이터 저장 변수
const isApplied = ref(false); // 지원내역 확인 변수
const employer_email = ref('');
console.log(route.params.id);

// 지원내역 확인 함수
const checkApply = async () => {
  const { data, error } = await supabase
    .from('job_apply_list')
    .select()
    .eq('applicant_id', user.value.id)
    .eq('post_id', id);

  if (error) {
    alert('오류가 발생했습니다');
    return;
  }

  if (data.length > 0) {
    isApplied.value = true;
  }
};

// 지원하기 함수
const handleApply = async () => {
  // 유저 데이터에서 이름과 전화번호 가져오기(user_table에서 가져와야 됨)
  const { data, error } = await supabase
    .from('user_table')
    .select()
    .eq('id', user.value.id)
    .single();

  if (error) {
    alert('오류가 발생했습니다');
    return;
  }
  console.log('user data:', data);

  // 지원내역 저장
  const { error: err } = await supabase.from('job_apply_list').insert({
    job_title: post.value.title, // 글 제목
    employer_id: post.value.author, // 고용주: 글 작성자 ID
    applicant_id: user.value.id, // 지원자: 현재 로그인한 사용자 ID
    applicant_name: data.name, // 지원자: 현재 로그인한 사용자 이름
    applicant_tel: data.tel, // 지원자: 현재 로그인한 사용자 전화번호
    post_id: post.value.id, // 고용주가 게시한 글 ID
  });

  if (err) {
    alert('오류가 발생했습니다');
  } else {
    alert('지원이 완료되었습니다.');
    router.push('/job-list');
  }

  // 지원이 완료되면 글목록으로 이동
};

// 이미지 삭제 함수
const deleteImage = async () => {
  if (post.value.img_url) {
    const { data, error } = await supabase.storage
      .from('images')
      .remove([post.value.img_url.split('/').pop()]);
    if (error) console.log('이미지 삭제 실패');
  }
};

// 글삭제 함수
const handelDelete = async () => {
  const conf = confirm('정말 삭제하시겠습니까?');

  if (!conf) return;

  // 이미지 삭제
  await deleteImage();

  // 글 삭제
  const { error } = await supabase.from('job_posts').delete().eq('id', id);

  if (error) {
    alert('글삭제 실패');
  } else {
    alert('삭제 완료');
    router.push('/job-list');
  }
};

// DB에서 글 가져오기
onMounted(async () => {
  await checkLoginStatus();

  // 로그인 상태일 때만 데이터 가져오기
  if (user.value) {
    const { data, error } = await supabase
      .from('job_posts')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      alert('글 가져오기 실패');
      return;
    }

    post.value = data;

    // 작성자의 이메일 가져오기
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', post.value.author)
      .single();

    if (!userError && userData) {
      employer_email.value = userData.email;
    }
  }

  // 지원내역 확인
  checkApply();
});
</script>

<style scoped lang="scss">
section {
  padding: 20px;
  max-width: 768px;
  margin: 0 auto;
  padding-bottom: 120px;
}

.image-container {
  aspect-ratio: 16 / 9;
  max-height: 400px;
  border-radius: 16px;
  overflow: hidden;
  margin: 0 0 24px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-section {
  padding: 24px;
  border-bottom: 1px solid #eef2f6;

  &:last-child {
    border-bottom: none;
  }

  .section-header {
    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .company-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 15px;

      .company-name {
        color: #3498db;
        font-weight: 600;
      }

      .divider {
        color: #ddd;
      }
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;

    .iconify {
      color: #3498db;
      font-size: 24px;
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }
  }

  .section-content {
    padding: 0 4px;
  }
}

.pay {
  display: inline-flex;
  align-items: center;
  background: rgba(52, 152, 219, 0.1);
  padding: 16px 24px;
  border-radius: 12px;
  color: #2980b9;
  font-size: 16px;

  .label {
    font-weight: 500;
    margin-right: 8px;
    color: #666;
  }

  b {
    font-weight: 700;
    color: #2980b9;
  }
}

.desc {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  padding: 4px 0;
}

.bottom-btn-group {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 16px;
  gap: 12px;
  background: white;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;

  button,
  .btn-tel {
    height: 56px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;

    .iconify {
      font-size: 20px;
    }
  }

  .btn-tel {
    background-color: #3498db;
    color: white;

    &:hover {
      background-color: #2980b9;
      transform: translateY(-2px);
    }
  }

  .btn-apply {
    background-color: #3498db;
    color: white;

    &:hover {
      background-color: #2980b9;
      transform: translateY(-2px);
    }
  }

  .btn-delete {
    background-color: #e74c3c;
    color: white;

    &:hover {
      background-color: #c0392b;
      transform: translateY(-2px);
    }
  }

  .btn-apply-disable {
    background-color: #95a5a6;
    color: white;
    cursor: not-allowed;
    opacity: 0.8;
  }
}

@media (min-width: 768px) {
  .bottom-btn-group {
    max-width: 768px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 16px 16px 0 0;
  }
}

@media (max-width: 640px) {
  section {
    padding: 16px;
    padding-bottom: 100px;
  }

  .content-section {
    padding: 20px;

    .section-header {
      h2 {
        font-size: 20px;
      }
    }

    .section-title {
      margin-bottom: 16px;

      h3 {
        font-size: 16px;
      }

      .iconify {
        font-size: 20px;
      }
    }
  }

  .desc {
    font-size: 15px;
  }

  .bottom-btn-group {
    button,
    .btn-tel {
      height: 48px;
      font-size: 15px;
    }
  }

  .contact {
    font-size: 14px;
    padding: 12px 20px;
  }
}
</style>
