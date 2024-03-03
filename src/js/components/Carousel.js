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
    $('.play').on('click', function () {
      owl.trigger('play.owl.autoplay', [5000]);
    });
    $('.stop').on('click', function () {
      owl.trigger('stop.owl.autoplay');
    });

    console.log('thisCarousel:', thisCarousel);
    $(document).ready(function () {
      owl.owlCarousel();
    });
  }
}
