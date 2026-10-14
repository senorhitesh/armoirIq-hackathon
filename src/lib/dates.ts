export function isOverdue(dueDate?: string | null, isDone: boolean = false): boolean {
  if (!dueDate || isDone) return false;
  const now = typeof window === 'undefined' ? 1776200000000 : Date.now();
  return new Date(dueDate).getTime() < now;
}

export function dueInfo(dueDate?: string | null, isDone: boolean = false) {
  if (!dueDate) return { label: 'No date', isOverdue: false, overdue: false, isNear: false };
  if (isDone) return { label: 'Done', isOverdue: false, overdue: false, isNear: false };
  
  const due = new Date(dueDate);
  const now = typeof window === 'undefined' ? new Date(1776200000000) : new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: 'Overdue', isOverdue: true, overdue: true, isNear: false };
  if (diffDays === 0) return { label: 'Due today', isOverdue: false, overdue: false, isNear: true };
  if (diffDays === 1) return { label: 'Due tomorrow', isOverdue: false, overdue: false, isNear: true };
  return { label: `In ${diffDays} days`, isOverdue: false, overdue: false, isNear: false };
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatShort(dateString?: string | Date | null): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function timeAgo(timestamp?: string | number | Date | null): string {
  if (!timestamp) return 'recently';
  const time = new Date(timestamp).getTime();
  const now = typeof window === 'undefined' ? 1776200000000 : Date.now();
  const diff = Math.floor((now - time) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export function dayKeyFromNow(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}
