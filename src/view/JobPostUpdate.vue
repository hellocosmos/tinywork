<template>
  <JobPostForm :is-edit="true" :job-id="jobId" />
</template>

<script setup>
import JobPostForm from './JobPostForm.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const jobId = route.params.id;
</script>
