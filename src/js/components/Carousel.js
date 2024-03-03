import { select } from '../settings.js';
// import { utils } from '../utils.js';

export default class Carousel {
  constructor() {
    const thisCarousel = this;
    thisCarousel.dom = {};
    thisCarousel.dom.wrapper = document.querySelector(
      select.widgets.carousel.wrapper
    );
    thisCarousel.dom.slides = thisCarousel.dom.wrapper.querySelectorAll(
      select.widgets.carousel.slides
    );
    thisCarousel.initPlugin();
  }
  initPlugin() {
    const thisCarousel = this;

    // eslint-disable-next-line no-undef
    var owl = $('.owl-carousel');
    owl.owlCarousel({
      items: 1,
      loop: true,
      margin: 0,
      //   nav: true,
      //   autoHeight: true,
      autoplay: true,
      autoplayTimeout: 5000,
      autoplayHoverPause: true,
    });
    // eslint-disable-next-line no-undef
    $('.play').on('click', function () {
      owl.trigger('play.owl.autoplay', [5000]);
    });
    // eslint-disable-next-line no-undef
    $('.stop').on('click', function () {
      owl.trigger('stop.owl.autoplay');
    });

    console.log('thisCarousel:', thisCarousel);
    // eslint-disable-next-line no-undef
    $(document).ready(function () {
      owl.owlCarousel();
    });
  }
}
