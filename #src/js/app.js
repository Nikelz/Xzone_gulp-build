@@include('vendors/YoutubeApi.js', {});
// Lazy Loading
@@include('vendors/yall.js', {});
document.addEventListener("DOMContentLoaded", yall);
// Scroll Animation
@@include('vendors/scroll-animation.js', {});

const navButton = document.querySelector('.menu-icon');
if (navButton) {
    const nav = document.querySelector('.nav');
    navButton.addEventListener("click", function (e) {
        navButton.classList.toggle('_active');
        if (!nav.classList.contains('nav--active')) {
            nav.classList.add('nav--active');
        } else {
            nav.classList.remove('nav--active');
        }
    });
};