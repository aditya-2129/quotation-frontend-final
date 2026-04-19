import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard';
import { approvedQuotationService } from '@/services/quotations-approved';

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

/**
 * Hook for quotations awaiting admin approval (status = "Completed"), oldest first.
 */
export const useReviewQueue = (limit = 5) => {
  return useQuery({
    queryKey: ['review-queue', limit],
    queryFn: () => dashboardService.getReviewQueue(limit),
  });
};

/**
 * Mutation to approve a quotation from the dashboard review queue.
 * Invalidates dashboard-stats, review-queue, and recent-quotations on success.
 */
export const useApproveQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quotationId) =>
      approvedQuotationService.updateStatus(quotationId, 'Approved'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-quotations'] });
    },
  });
};
