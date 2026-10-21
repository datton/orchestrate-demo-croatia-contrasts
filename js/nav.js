// Shared navigation behaviour (owner: UI/UX).
document.documentElement.classList.add('js');
(function () {
  var header = document.querySelector('.site-header');
  var links = document.querySelectorAll('.site-header nav a');
  // Mark the current page if the markup did not.
  if (!document.querySelector('.site-header [aria-current]')) {
    var here = location.pathname.replace(/\/$/, '/index.html');
    links.forEach(function (a) { if (a.pathname === here) a.setAttribute('aria-current', 'page'); });
  }
  // Light rule under the sticky header once the page scrolls.
  if (header) {
    var update = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
})();
