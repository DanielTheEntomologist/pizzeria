import { select, templates } from '../settings.js';

import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

export default class CartProduct {
  constructor(preparedCartProduct) {
    const thisCartProduct = this;
    thisCartProduct.id = preparedCartProduct.id;
    thisCartProduct.name = preparedCartProduct.name;
    thisCartProduct.amount = preparedCartProduct.amount;
    thisCartProduct.priceSingle = preparedCartProduct.priceSingle;
    thisCartProduct.price = preparedCartProduct.price;
    thisCartProduct.params = preparedCartProduct.params;

    thisCartProduct.dom = {};

    thisCartProduct.renderInMenu();
  }
  getElements() {
    const thisCartProduct = this;
    thisCartProduct.dom.amountWidget =
      thisCartProduct.dom.element.querySelector(
        select.cartProduct.amountWidget
      );
    thisCartProduct.dom.price = thisCartProduct.dom.element.querySelector(
      select.cartProduct.price
    );
    thisCartProduct.dom.edit = thisCartProduct.dom.element.querySelector(
      select.cartProduct.edit
    );
    thisCartProduct.dom.remove = thisCartProduct.dom.element.querySelector(
      select.cartProduct.remove
    );
  }
  renderInMenu() {
    const thisCartProduct = this;
    const generatedHTML = templates.cartProduct(thisCartProduct);
    thisCartProduct.dom.element = utils.createDOMFromHTML(generatedHTML);
    const productList = document.querySelector(select.cart.productList);
    productList.insertAdjacentElement('beforeend', thisCartProduct.dom.element);
    thisCartProduct.getElements();
    thisCartProduct.initActions();
    thisCartProduct.initAmountWidget();
  }

  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );

    thisCartProduct.amountWidget.setValue(thisCartProduct.amount);
    thisCartProduct.amountWidget.dom.element.addEventListener(
      'updated',
      function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price =
          thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      }
    );
  }

  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }
  remove() {
    const thisCartProduct = this;
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.element.dispatchEvent(event);
    thisCartProduct.dom.element.remove();
  }
  getData() {
    //id, amount, price, priceSingle, name, params
    const thisCartProduct = this;
    return {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
    };
  }
}
