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
  }

  class AmountWidget {
    constructor(amountElement) {
      const thisWidget = this;
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.getElements(amountElement);
      thisWidget.setValue(thisWidget.inputElement.value);
      thisWidget.initActions();
      // console.log('AmountWidget:', thisWidget);
    }
    getElements(element) {
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.increaseButton = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
      thisWidget.decreaseButton = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.inputElement = thisWidget.element.querySelector(
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
        thisWidget.inputElement.value = thisWidget.value;
        thisWidget.announce();
      } else {
        thisWidget.inputElement.value = thisWidget.value;
      }
    }
    initActions() {
      const thisWidget = this;
      thisWidget.inputElement.addEventListener('change', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.inputElement.value);
      });
      thisWidget.increaseButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
      thisWidget.decreaseButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
    }
    announce() {
      const thisWidget = this;
      const event = new CustomEvent('updated', {
        bubbles: true,
      });
      thisWidget.element.dispatchEvent(event);
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

    initMenu: function () {},

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
