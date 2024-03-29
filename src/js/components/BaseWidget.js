export default class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }
  get value() {
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(value) {
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);

    if (thisWidget.isValid(newValue) && newValue !== thisWidget.correctValue) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();
  }

  parseValue(value) {
    return parseInt(value);
  }
  isValid(value) {
    return !isNaN(value);
  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  setValue(value) {
    const thisWidget = this;
    thisWidget.value = value;
  }
  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}
