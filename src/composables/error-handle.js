import { ref } from 'vue';

// 에러 메시지 매핑 객체
const errorMessages = {
  'Invalid login credentials': '계정정보가 잘못입력되었습니다.',
  'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
  'User already registered': '이미 등록된 이메일입니다.',
  'Invalid email': '유효하지 않은 이메일 형식입니다.',
};

export const handleError = (error) => {
  console.error('Error:', error);
  
  let message = '오류가 발생했습니다.';
  
  if (error.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  alert(message); // 또는 다른 알림 방식 사용
};

// 에러 처리를 위한 composable
export function useErrorHandler() {
  const lastError = ref(null);

  // 에러 메시지 처리 함수
  const handleError = (error) => {
    if (error?.message) {
      const koreanMessage = errorMessages[error.message];
      lastError.value = koreanMessage 
        ? `${koreanMessage} (${error.message})`
        : error.message;
    } else if (typeof error === 'string') {
      const koreanMessage = errorMessages[error];
      lastError.value = koreanMessage 
        ? `${koreanMessage} (${error})`
        : error;
    } else {
      lastError.value = '알 수 없는 에러가 발생했습니다.';
    }
    
    // 에러 메시지 alert 표시
    alert(lastError.value);
    return lastError.value;
  };

  // 에러 초기화
  const clearError = () => {
    lastError.value = null;
  };

  return {
    lastError,
    handleError,
    clearError
  };
} 