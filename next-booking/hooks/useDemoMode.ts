import { usePublicSettings } from './usePublicSettings';

export function useDemoMode() {
  const { data: settings, ...rest } = usePublicSettings();
  
  return {
    ...rest,
    data: settings?.demoMode ?? false
  };
}


