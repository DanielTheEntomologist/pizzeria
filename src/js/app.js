import { settings, select, classNames, templates } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

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

  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
