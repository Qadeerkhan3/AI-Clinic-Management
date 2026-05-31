import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useProGuard = () => {
  const { user } = useAuth();

  const checkPro = (callback) => {
    if (user?.subscriptionPlan !== 'pro') {
      toast.error('Yeh feature Pro plan mein hai! Upgrade karein.');
      return false;
    }
    callback?.();
    return true;
  };

  const isPro = user?.subscriptionPlan === 'pro';

  return { isPro, checkPro };
};