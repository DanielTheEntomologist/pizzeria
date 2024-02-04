'use strict';
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
  };

  /* declare Product class */
  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
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
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      // add element to menu
      menuContainer.insertAdjacentElement('beforeend', thisProduct.element);

      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
    }

    initAccordion() {
      const thisProduct = this;

      thisProduct.element.classList.remove('active');

      const allProducts = document.querySelectorAll(select.all.menuProducts);

      for (let product in allProducts) {
        if (product.element !== undefined)
          product.element.classList.remove('active');
      }

      const clickableTrigger = thisProduct.accordionTrigger;

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
          productElement !== thisProduct.element &&
          productElement !== undefined
        ) {
          productElement.classList.remove('active');
        }
      }
      thisProduct.element.classList.toggle('active');
    }

    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let select of thisProduct.formInputs) {
        select.addEventListener('change', function (event) {
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);

      let price = thisProduct.data.price;

      // for each customizable parameter in product
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        const selectedParamOptions = formData[paramId];
        // console.log(selectedParamOptions);

        // for each option in parameter
        for (let optionId in param.options) {
          const option = param.options[optionId];

          // modify price if default was removed or non-defualt was added
          if (
            option.default === true &&
            selectedParamOptions.indexOf(optionId) === -1
          ) {
            price = price - option.price;
          }
          if (
            (option.default === undefined || option.default === false) &
            (selectedParamOptions.indexOf(optionId) !== -1)
          ) {
            price = price + option.price;
          }
        }
      }

      const amount = Number(formData.amount[0]);
      thisProduct.priceElem.innerHTML = price * amount;
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
