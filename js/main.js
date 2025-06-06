const swiper = new Swiper(".mySwiper", {
  slidesPerView: 1,
  spaceBetween: 20,
  loop: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  centeredSlides: true,  // خليها مفعلة للهواتف فقط
  breakpoints: {
    768: {
      slidesPerView: 2,
      centeredSlides: false, // الغيها للشاشات الكبيرة عشان السلايدات تمشي عادي
    },
    992: {
      slidesPerView: 3,
      centeredSlides: false,
    },
    1200: {
      slidesPerView: 4,
      centeredSlides: false,
    },
  },
});
