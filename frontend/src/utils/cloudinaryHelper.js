export const optimizeCloudinaryImage = (url, { width='auto', height='auto', quality='auto', format='auto' } = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  const parts = [`q_${quality}`, `f_${format}`];
  if (width !== 'auto') parts.push(`w_${width}`);
  if (height !== 'auto') parts.push(`h_${height}`);
  parts.push('c_fill','g_auto');
  return url.replace('/upload/', `/upload/${parts.join(',')}/`);
};

export const getCloudinaryBlurUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_50,e_blur:1000/');
};