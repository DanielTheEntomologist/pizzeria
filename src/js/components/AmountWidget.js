import { select, settings } from '../settings.js';

export default class AmountWidget {
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
