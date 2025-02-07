import supabase from '../supabase';

// 구인글 생성
export const createJob = async (jobData) => {
  const { data, error } = await supabase.from('job_posts').insert([jobData]);
  
  if (error) throw error;
  return data;
};

// 구인글 수정
export const updateJob = async (id, jobData) => {
  const { data, error } = await supabase
    .from('job_posts')
    .update(jobData)
    .eq('id', id);
    
  if (error) throw error;
  return data;
};

// 구인글 조회
export const getJob = async (id) => {
  const { data, error } = await supabase
    .from('job_posts')
    .select()
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

// 구인글 목록 조회
export const getJobs = async () => {
  const { data, error } = await supabase
    .from('job_posts')
    .select()
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

// 구인글 삭제
export const deleteJob = async (id) => {
  const { error } = await supabase
    .from('job_posts')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}; 