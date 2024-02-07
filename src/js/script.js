'use strict';
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    // CODE ADDED START
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
    // CODE ADDED END
  };

  /* declare Product class */
  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.dom = {};
      console.log('new Product:', thisProduct);
      thisProduct.priceSingle = data.price;
      thisProduct.renderInMenu();
    }
    renderInMenu() {
      const thisProduct = this;
      // generate HTML based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);
      // find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      // generate DOM element
      thisProduct.dom.element = utils.createDOMFromHTML(generatedHTML);
      // add element to menu
      menuContainer.insertAdjacentElement('beforeend', thisProduct.dom.element);

      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    getElements() {
      const thisProduct = this;

      thisProduct.dom.accordionTrigger = thisProduct.dom.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.dom.form = thisProduct.dom.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.dom.cartButton = thisProduct.dom.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.dom.priceElem = thisProduct.dom.element.querySelector(
        select.menuProduct.priceElem
      );
      thisProduct.dom.imageWrapper = thisProduct.dom.element.querySelector(
        select.menuProduct.imageWrapper
      );
      thisProduct.dom.amountWidgetElem = thisProduct.dom.element.querySelector(
        select.menuProduct.amountWidget
      );
      // thisProduct.imagesVisible = thisProduct.element.querySelectorAll(
      //   select.menuProduct.imageVisible
      // );
    }

    initAccordion() {
      const thisProduct = this;

      thisProduct.dom.element.classList.remove(
        classNames.menuProduct.wrapperActive
      );

      const allProducts = document.querySelectorAll(select.all.menuProducts);

      for (let product in allProducts) {
        if (product.element !== undefined)
          product.dom.element.classList.remove(
            classNames.menuProduct.wrapperActive
          );
      }

      const clickableTrigger = thisProduct.dom.accordionTrigger;

      clickableTrigger.addEventListener('click', function (event) {
        // prevent default action for event
        event.preventDefault();
        // toggle active class on element of thisProduct
        thisProduct.toggleAccordion();
      });
      // on
    }

    toggleAccordion() {
      const thisProduct = this;
      const allProducts = document.querySelectorAll(select.all.menuProducts);
      for (let productElement of allProducts) {
        if (
          productElement !== thisProduct.dom.element &&
          productElement !== undefined
        ) {
          productElement.classList.remove(classNames.menuProduct.wrapperActive);
        }
      }
      thisProduct.dom.element.classList.toggle(
        classNames.menuProduct.wrapperActive
      );
    }

    initOrderForm() {
      const thisProduct = this;

      thisProduct.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let select of thisProduct.dom.formInputs) {
        select.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);

      let price = thisProduct.data.price;

      // for each customizable parameter in product
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        const selectedParamOptions = formData[paramId];

        // for each option in parameter
        for (let optionId in param.options) {
          const option = param.options[optionId];

          const optionImage = thisProduct.dom.imageWrapper.querySelector(
            `.${paramId}-${optionId}`
          );

          // console.log(`image .${paramId}-${optionId}`, optionImage);

          // reset display to default options
          if (optionImage) {
            if (option.default === true) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

          // modify price if default was removed or non-default was added
          if (
            option.default === true &&
            selectedParamOptions.indexOf(optionId) === -1
          ) {
            price = price - option.price;

            // remove option to display
            if (optionImage) {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
          if (
            (option.default === undefined || option.default === false) &
            (selectedParamOptions.indexOf(optionId) !== -1)
          ) {
            price = price + option.price;

            // add option to display
            if (optionImage) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      thisProduct.priceSingle = price;
      const amount = thisProduct.amountWidget.value;
      thisProduct.dom.priceElem.innerHTML = price * amount;
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(
        thisProduct.dom.amountWidgetElem
      );
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {},
        };
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected =
            formData[paramId] && formData[paramId].indexOf(optionId) > -1;
          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }

    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }

    addToCart() {
      const thisProduct = this;
      const productSummary = thisProduct.prepareCartProduct();
      app.cart.add(productSummary);
    }
  }

  class AmountWidget {
    constructor(amountElement) {
      const thisWidget = this;
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.dom = {};
      thisWidget.getElements(amountElement);
      thisWidget.setValue(thisWidget.dom.inputElement.value);
      thisWidget.initActions();
      // console.log('AmountWidget:', thisWidget);
    }
    getElements(element) {
      const thisWidget = this;
      thisWidget.dom.element = element;
      thisWidget.dom.increaseButton = thisWidget.dom.element.querySelector(
        select.widgets.amount.linkIncrease
      );
      thisWidget.dom.decreaseButton = thisWidget.dom.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.dom.inputElement = thisWidget.dom.element.querySelector(
        select.widgets.amount.input
      );
    }
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      if (
        !isNaN(newValue) &&
        newValue != thisWidget.value &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax
      ) {
        thisWidget.value = newValue;
        thisWidget.dom.inputElement.value = thisWidget.value;
        thisWidget.announce();
      } else {
        thisWidget.dom.inputElement.value = thisWidget.value;
      }
    }
    initActions() {
      const thisWidget = this;
      thisWidget.dom.inputElement.addEventListener('change', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.dom.inputElement.value);
      });
      thisWidget.dom.increaseButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
      thisWidget.dom.decreaseButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
    }
    announce() {
      const thisWidget = this;
      const event = new CustomEvent('updated', {
        bubbles: true,
      });
      thisWidget.dom.element.dispatchEvent(event);
    }
  }

  class Cart {
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
    }
  }

  class CartProduct {
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
      productList.insertAdjacentElement(
        'beforeend',
        thisCartProduct.dom.element
      );
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
  }

  const app = {
    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
      console.log('thisApp.data:', thisApp.data);

      thisApp.products = [];
      for (let productData in thisApp.data.products) {
        // add new product to thisApp.data.products array
        thisApp.products.push(
          new Product(productData, thisApp.data.products[productData])
        );
      }
      console.log('thisApp.products:', thisApp.products);
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
}
