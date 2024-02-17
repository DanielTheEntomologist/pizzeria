import { select, classNames, settings } from '../settings.js';
import CartProduct from './CartProduct.js';

export default class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.dom = {};
    thisCart.getElements(element);
    thisCart.initActions();
    console.log('new Cart:', thisCart);
  }

  getElements(element) {
    const thisCart = this;
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrices = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.formSubmit = thisCart.dom.wrapper.querySelector(
      select.cart.formSubmit
    );
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
  }

  toggleCart() {
    const thisCart = this;
    thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
  }

  add(menuProduct) {
    const thisCart = this;

    const cartProduct = new CartProduct(menuProduct);

    thisCart.products.push(cartProduct);
    thisCart.update();
  }
  update() {
    const thisCart = this;
    // console.log('thisCart.update()');
    // console.log('thisCart.products', thisCart.products);
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.deliveryFee = 0;
    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.priceSingle * product.amount;
    }
    if (thisCart.totalNumber > 0) {
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    for (let totalPrice of thisCart.dom.totalPrices) {
      totalPrice.innerHTML = thisCart.totalPrice;
    }
  }
  remove(cartProduct) {
    const thisCart = this;
    const indexOfProduct = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(indexOfProduct, 1);

    thisCart.update();
  }
  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    console.log('sending order with thisCart:', thisCart);
    // {
    //   address: adres klienta wpisany w koszyku,
    //   phone: numer telefonu wpisany w koszyku,
    //   totalPrice: całkowita cena za zamówienie,
    //   subtotalPrice: cena całkowita - koszt dostawy,
    //   totalNumber: całkowita liczba sztuk,
    //   deliveryFee: koszt dostawy,
    //   products: tablica obecnych w koszyku produktów
    // }
    thisCart.payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };
    for (let product of thisCart.products) {
      console.log('product:', product);
      thisCart.payload.products.push(product.getData());
    }
    console.log('thisCart.payload:', thisCart.payload);

    const jsonPayload = JSON.stringify(thisCart.payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonPayload,
    };
    fetch(url, options).then(function (response) {
      console.log('response:', response.json());
    });
  }

  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      thisCart.toggleCart();
    });
    thisCart.dom.productList.addEventListener('updated', function (event) {
      event.preventDefault();
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function (event) {
      event.preventDefault();
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });

    const productList = document.querySelector(select.containerOf.menu);

    productList.addEventListener('add-to-cart', function (event) {
      thisCart.add(event.detail.product);
    });
  }
}
