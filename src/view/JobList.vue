<template>
  <ul class="job-list" v-if="posts.length > 0">
    <li class="job-item" v-for="post in posts" :key="post.id">
      <router-link :to="`/job-detail/${post.id}`">
        <div class="header">
          <h3>{{ post.title }}</h3>
          <!-- 업체명 추가해 주세요 -->
          <span>{{ post.company_name }}</span>
          <span>&middot;</span>
          <address>{{ post.location }}</address>
          <span>&middot;</span>
          <time>{{ format(new Date(post.created_at), 'yyyy-MM-dd') }}</time>
        </div>
        <div class="bottom-info">
          <p class="pay">
            {{ post.pay_rule }}: {{ post.pay.toLocaleString() }}원
          </p>
          <img
            v-if="post.img_url"
            :src="post.img_url"
            alt="image"
            width="64"
            height="64"
          />
        </div>
      </router-link>
    </li>
  </ul>
  <p v-else class="loading_info">구인 목록을 불러오는 중입니다...</p>
</template>

<script setup>
import supabase from '../supabase';
import { ref, onMounted } from 'vue';
import { format } from 'date-fns';

const posts = ref([]);

// 구인목록 가져오기
onMounted(async () => {
  const { data, error } = await supabase
    .from('job_posts')
    .select()
    .order('created_at', { ascending: false });

  posts.value = data;
  // console.log(posts.value);

  if (error) {
    alert('구인목록 가져오기 실패');
  }
});
</script>

<style lang="scss" scoped>
.job-list {
  list-style: none;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  gap: 20px;
}

.job-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  a {
    text-decoration: none;
    color: inherit;
    padding: 20px;
    display: block;
  }
}

.header {
  h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    color: #2c3e50;
    font-weight: 600;
  }

  address,
  time,
  span {
    font-style: normal;
    display: inline;
    font-size: 13px;
    color: #666;
    margin-right: 6px;
  }
}

.bottom-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;

  .pay {
    font-size: 15px;
    font-weight: 600;
    color: #3498db;
    background: rgba(52, 152, 219, 0.1);
    padding: 6px 12px;
    border-radius: 20px;
  }

  img {
    width: 72px;
    height: 72px;
    border-radius: 8px;
    object-fit: cover;
  }
}

.loading_info {
  text-align: center;
  color: #666;
  margin-top: 40px;
  font-size: 15px;
}

@media (min-width: 768px) {
  .job-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
