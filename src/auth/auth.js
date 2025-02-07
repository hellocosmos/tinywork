import { ref } from 'vue';
import supabase from '../supabase';

const isLogin = ref(false);
const user = ref(null);

export function useAuth() {
  const checkLoginStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        isLogin.value = true;
        user.value = session.user;
        console.log('로그인 상태');
        return true;
      } else {
        isLogin.value = false;
        user.value = null;
        console.log('로그아웃 상태');
        return false;
      }
    } catch (error) {
      console.error('로그인 상태 확인 중 에러:', error.message);
      return false;
    }
  };

  return {
    isLogin,
    user,
    checkLoginStatus
  };
}