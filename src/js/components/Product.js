import { select, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

/* declare Product class */
export default class Product {
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

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: productSummary,
      },
    });
    thisProduct.dom.element.dispatchEvent(event);
  }
}
