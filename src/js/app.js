import { settings, select, classNames, templates } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initData: function () {
    const thisApp = this;

    const url = settings.db.url + '/' + settings.db.products;

    thisApp.data = {};
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },

  initMenu: function () {
    const thisApp = this;
    thisApp.products = [];
    for (let productData in thisApp.data.products) {
      // add new product to thisApp.data.products array
      thisApp.products.push(
        new Product(
          thisApp.data.products[productData].id,
          thisApp.data.products[productData]
        )
      );
    }
  },

  initCart() {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
  },

  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    // get url hash
    const idFromHash = window.location.hash.replace('#/', '');

    // find if any page is matching hash from url
    let pageHashCorrect = false;
    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageHashCorrect = true;
        break;
      }
    }

    // if no page is matching hash from url, set first page as active
    let id = idFromHash;
    if (!pageHashCorrect) {
      id = thisApp.pages[0].id;
      window.location.hash = '#/' + id;
    }

    thisApp.activatePage(id);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        const clickedElement = this;
        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();
    thisApp.initPages();
    thisApp.initCart();
  },
};

app.init();
