export const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

export const timeAgo = (dateStr: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return `Hôm qua`;
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
  return `${Math.floor(diffInDays / 365)} năm trước`;
};
