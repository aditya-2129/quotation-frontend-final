import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard';

/**
 * Hook for dashboard statistics
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getDashboardStats(),
  });
};

/**
 * Hook for recent quotations
 */
export const useRecentQuotations = (limit = 6) => {
  return useQuery({
    queryKey: ['recent-quotations', limit],
    queryFn: () => dashboardService.getRecentQuotations(limit),
  });
};
