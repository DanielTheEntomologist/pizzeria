import { select, templates, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';

import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

export default class Booking {
  constructor(bookingWrapper) {
    const thisBooking = this;
    // console.log('Booking:', thisBooking);
    thisBooking.render(bookingWrapper);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initTables();
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
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
  }
  initTables() {
    const thisBooking = this;
    // add event listener to the floor plan
    thisBooking.dom.wrapper.addEventListener('click', function (event) {
      event.preventDefault();
      const clickedElement = event.target;
      console.log('clickedElement', clickedElement);
      if (clickedElement.classList.contains(classNames.booking.table)) {
        thisBooking.bookTable(clickedElement);
      }
    });
  }

  getData() {
    const thisBooking = this;
    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(
      new Date()
    )}`;
    const endDateParam = `${settings.db.dateEndParamKey}=${thisBooking.datePicker.value}`;

    const params = {
      bookings: [startDateParam, endDateParam, settings.db.notRepeatParam],
      eventsCurrent: [startDateParam, endDateParam, settings.db.notRepeatParam],
      eventsRepeat: [endDateParam, settings.db.repeatParam],
    };

    const urls = {
      bookings: {
        getBookings: `${settings.db.url}/${
          settings.db.bookings
        }?${params.bookings.join('&')}`,
      },
      eventsCurrent: {
        getEvents: `${settings.db.url}/${
          settings.db.events
        }?${params.eventsCurrent.join('&')}`,
      },
      eventsRepeat: {
        getEvents: `${settings.db.url}/${
          settings.db.events
        }?${params.eventsRepeat.join('&')}`,
      },
    };
    // console.log('urls', urls);

    Promise.all([
      fetch(urls.bookings.getBookings),
      fetch(urls.eventsCurrent.getEvents),
      fetch(urls.eventsRepeat.getEvents),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};

    const timeChunk = settings.hours.reservationtTimeChunk;

    const oneTimeBookings = [...bookings, ...eventsCurrent];

    for (let item of oneTimeBookings) {
      // console.log('item', item);
      thisBooking.makeBooked(
        item.date,
        Number(item.table),
        Number(utils.hourToNumber(item.hour)),
        Number(item.duration),
        Number(timeChunk)
      );
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let date = minDate;
          date <= maxDate;
          date = utils.addDays(date, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(date),
            Number(item.table),
            Number(utils.hourToNumber(item.hour)),
            Number(item.duration),
            Number(timeChunk)
          );
        }
      }
    }

    // console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, table, hour, duration, timestep) {
    const thisBooking = this;

    if (!thisBooking.booked[date]) {
      thisBooking.booked[date] = {};
    }
    const bookedOnDate = thisBooking.booked[date];

    for (
      let timeToBook = hour;
      timeToBook < hour + duration;
      timeToBook = timeToBook + timestep
    ) {
      if (!bookedOnDate[timeToBook]) {
        bookedOnDate[timeToBook] = [];
      }
      bookedOnDate[timeToBook].push(table);
    }
  }
  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;
    if (
      !thisBooking.booked[thisBooking.date] ||
      !thisBooking.booked[thisBooking.date][thisBooking.hour]
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      thisBooking.unselectTablesExcept();

      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  bookTable(tableElement) {
    const thisBooking = this;
    const tableId = parseInt(
      tableElement.getAttribute(settings.booking.tableIdAttribute)
    );
    // if table is already booked display fading red shadow and do nothing
    if (tableElement.classList.contains(classNames.booking.tableBooked)) {
      tableElement.style.boxShadow = '0 0 10px red';
      setTimeout(function () {
        tableElement.style.boxShadow = '';
      }, 250);
      return;
    }
    // if table is available book it
    if (!tableElement.classList.contains(classNames.booking.tableSelected)) {
      tableElement.classList.add(classNames.booking.tableSelected);
      thisBooking.table = tableId;

      // unselect all other tables
      thisBooking.unselectTablesExcept(tableId);
    }
    // if table is already selected unselect it
    else {
      tableElement.classList.remove(classNames.booking.tableSelected);
      thisBooking.table = null;
    }
  }
  unselectTablesExcept(tableId) {
    const thisBooking = this;
    for (let table of thisBooking.dom.tables) {
      if (table.getAttribute(settings.booking.tableIdAttribute) != tableId) {
        table.classList.remove(classNames.booking.tableSelected);
      }
    }
  }
}
