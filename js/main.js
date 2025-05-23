document.querySelectorAll('.interactive-section').forEach(section => {
  section.addEventListener('mousedown', () => {
    section.style.transition = 'color 0.2s ease';
    section.style.color = '#ffd700';
  });

  section.addEventListener('mouseup', () => {
    section.style.color = ''; // ترجع للون الأصلي
  });

  section.addEventListener('mouseleave', () => {
    section.style.color = ''; // لو خرج الماوس قبل رفع الزر
  });
});