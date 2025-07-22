import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export const useAuth = () => {
  const { user, isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
  };
};
