// Test environment variable loading
import { OPENAI_API_KEY } from '@env';

console.log('🔑 OPENAI_API_KEY loaded:', OPENAI_API_KEY ? 'YES' : 'NO');
console.log(
  '🔑 First 10 chars:',
  OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT FOUND',
);

export const testEnvLoad = () => {
  return {
    hasKey: !!OPENAI_API_KEY,
    keyPreview: OPENAI_API_KEY
      ? OPENAI_API_KEY.substring(0, 10) + '...'
      : 'NOT FOUND',
  };
};
