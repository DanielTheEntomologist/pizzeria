import { select, templates } from '../settings.js';
import { utils } from '../utils.js';

import AmountWidget from './AmountWidget.js';

export default class Booking {
  constructor(bookingWrapper) {
    const thisBooking = this;
    console.log('Booking:', thisBooking);
    thisBooking.render(bookingWrapper);
    thisBooking.initWidgets();
  }
  render(bookingElement) {
    const thisBooking = this;
    const bookingElementHTML = templates.bookingWidget();
    const bookingWidgetElement = utils.createDOMFromHTML(bookingElementHTML);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingElement;
    thisBooking.dom.wrapper.appendChild(bookingWidgetElement);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}
