import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';

export default class AmountWidget extends BaseWidget {
  constructor(amountElement) {
    super(amountElement, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements();
    thisWidget.setValue(thisWidget.dom.inputElement.value);
    thisWidget.initActions();

    // console.log('AmountWidget:', thisWidget);
  }
  getElements() {
    const thisWidget = this;
    thisWidget.dom.increaseButton = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
    thisWidget.dom.decreaseButton = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.inputElement = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
  }

  parseValue(value) {
    return parseInt(value);
  }
  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.inputElement.value = thisWidget.value;
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
}
