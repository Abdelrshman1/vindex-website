const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');

// تفعيل/تعطيل القائمة عند الضغط على زرار الهامبرجر
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // عشان الضغط ما يوصلش للوثيقة وينفذ إغلاق
  menu.classList.toggle('active');
});

// لما تضغط على أي رابط داخل القائمة، إقفل القائمة
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('active');
  });
});

// لما تضغط في أي مكان في الصفحة خارج القائمة، إقفل القائمة لو مفتوحة
document.addEventListener('click', (e) => {
  if (menu.classList.contains('active')) {
    // تأكد الضغط مش جوا القائمة ولا على زرار الهامبرجر
    if (!menu.contains(e.target) && e.target !== menuBtn) {
      menu.classList.remove('active');
    }
  }
});

// لو عندك سكشنات interactive-section وعايز إقفال القائمة لما تضغط عليهم:
document.querySelectorAll('.interactive-section').forEach(section => {
  section.addEventListener('click', () => {
    menu.classList.remove('active');
  });
});
