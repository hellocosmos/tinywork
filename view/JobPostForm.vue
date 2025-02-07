<template>
  <div class="form-container">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">제목</label>
        <input
          type="text"
          id="title"
          v-model="formData.title"
          placeholder="구인 제목을 입력하세요"
          required
        />
      </div>

      <div class="form-group">
        <label for="company_name">업체명</label>
        <input
          type="text"
          id="company_name"
          v-model="formData.company_name"
          placeholder="업체명을 입력하세요"
          required
        />
      </div>

      <div class="form-group">
        <label for="location">근무지</label>
        <input
          type="text"
          id="location"
          v-model="formData.location"
          placeholder="근무지를 입력하세요"
          required
        />
      </div>

      <div class="form-group">
        <label for="tel">연락처</label>
        <input
          type="tel"
          id="tel"
          v-model="formData.tel"
          placeholder="연락처를 입력하세요"
          required
        />
      </div>

      <div class="form-group">
        <label for="pay">급여</label>
        <div class="pay-input-group">
          <select v-model="formData.pay_rule">
            <option value="시급">시급</option>
            <option value="일급">일급</option>
            <option value="월급">월급</option>
          </select>
          <input
            type="number"
            id="pay"
            v-model="formData.pay"
            placeholder="급여를 입력하세요"
            required
          />
          <span class="currency">원</span>
        </div>
      </div>

      <div class="form-group">
        <label for="desc">상세내용</label>
        <textarea
          id="desc"
          v-model="formData.desc"
          placeholder="상세 내용을 입력하세요"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="image">이미지</label>
        <input
          type="file"
          id="image"
          @change="handleImageUpload"
          accept="image/*"
        />
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="미리보기"
          class="preview-image"
        />
      </div>

      <button type="submit" :disabled="isSubmitting">
        {{ isEdit ? '수정하기' : '등록하기' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import supabase from '../supabase';
import { useAuth } from '../auth/auth';
import { useErrorHandler } from '../composables/error-handle';

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false,
  },
  jobId: {
    type: String,
    default: '',
  },
});

const router = useRouter();
const { user } = useAuth();
const { handleError } = useErrorHandler();
const isSubmitting = ref(false);
const previewUrl = ref('');

const formData = ref({
  title: '',
  company_name: '',
  location: '',
  tel: '',
  pay_rule: '시급',
  pay: '',
  desc: '',
  img_url: '',
});

// 이미지 업로드 처리
const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 미리보기 URL 생성
  previewUrl.value = URL.createObjectURL(file);

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('job-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('job-images').getPublicUrl(filePath);

    formData.value.img_url = publicUrl;
  } catch (error) {
    handleError('이미지 업로드 실패');
    console.error(error);
  }
};

// 폼 제출 처리
const handleSubmit = async () => {
  try {
    isSubmitting.value = true;

    const postData = {
      ...formData.value,
      author: user.value.id,
    };

    if (props.isEdit) {
      const { error } = await supabase
        .from('job_posts')
        .update(postData)
        .eq('id', props.jobId);

      if (error) throw error;
      alert('수정이 완료되었습니다.');
    } else {
      const { error } = await supabase.from('job_posts').insert(postData);

      if (error) throw error;
      alert('등록이 완료되었습니다.');
    }

    router.push('/job-list');
  } catch (error) {
    handleError(error);
  } finally {
    isSubmitting.value = false;
  }
};

// 기존 데이터 불러오기 (수정 모드)
onMounted(async () => {
  if (props.isEdit && props.jobId) {
    try {
      const { data, error } = await supabase
        .from('job_posts')
        .select()
        .eq('id', props.jobId)
        .single();

      if (error) throw error;

      formData.value = { ...data };
      if (data.img_url) {
        previewUrl.value = data.img_url;
      }
    } catch (error) {
      handleError('데이터 불러오기 실패');
      console.error(error);
    }
  }
});
</script>

<style lang="scss" scoped>
.form-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 12px;
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

.pay-input-group {
  display: flex;
  gap: 12px;
  align-items: center;

  select {
    width: 100px;
  }

  .currency {
    color: #666;
  }
}

.preview-image {
  margin-top: 12px;
  max-width: 100%;
  border-radius: 8px;
}

button {
  width: 100%;
  padding: 14px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
}
</style>
