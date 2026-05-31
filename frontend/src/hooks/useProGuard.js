import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useProGuard = () => {
  const { user } = useAuth();

  const checkPro = (callback) => {
    if (user?.subscriptionPlan !== 'pro') {
      toast.error('This feature is only available on the Pro plan. Please upgrade.');
      return false;
    }
    callback?.();
    return true;
  };

  const isPro = user?.subscriptionPlan === 'pro';

  return { isPro, checkPro };
};