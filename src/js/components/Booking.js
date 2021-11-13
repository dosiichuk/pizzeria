import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(bookingContainer){
    const thisBooking = this;
    thisBooking.render(bookingContainer);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.selectedTable = false;
  }
  getData(){
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    const urls = {
      booking:       settings.db.url + '/'+ settings.db.bookings + '?' 
                     + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/'+ settings.db.events + '?' 
                     + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/'+ settings.db.events + '?' 
                     + params.eventsRepeat.join('&'),
    };
    
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData([bookings, eventsCurrent, eventsRepeat]);
      });
  }
  parseData([bookings, eventsCurrent, eventsRepeat]){
    const thisBooking = this;
    thisBooking.booked = {};
    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = thisBooking.datePickerWidget.minDate;
    const maxDate = thisBooking.datePickerWidget.maxDate;
    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    // console.log(thisBooking.booked);
    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  updateDOM(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePickerWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);
    thisBooking.duration = thisBooking.hoursAmountWidget.value;
    thisBooking.ppl = thisBooking.peopleAmountWidget.value;
    let allAvailable = false;
    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) == true
      ){
        table.classList.add(classNames.booking.tableBooked);
      }else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  render(bookingContainer){
    const thisBooking = this;
    const generatedHtml = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingContainer;
    thisBooking.dom.wrapper.innerHTML = generatedHtml;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePickerWrapper = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerWrapper = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);
    thisBooking.dom.bookingForm = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.starters = Array.from(thisBooking.dom.wrapper.querySelectorAll(select.booking.starter));
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePickerWrapper);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPickerWrapper);
    thisBooking.dom.wrapper.addEventListener('updated', function(event) {
      thisBooking.updateDOM();
      thisBooking.initTables(event);
    });
    thisBooking.dom.floorPlan.addEventListener('click', (event)=>thisBooking.initTables(event));
    thisBooking.dom.bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
  initTables(event){
    const thisBooking = this;
    if(event.type == 'updated'){
      if(thisBooking.selectedTable > 0){
        thisBooking.dom.selectedTables = Array.from(thisBooking.dom.wrapper.querySelectorAll(select.booking.newlyBookedTables));
        thisBooking.dom.selectedTables.forEach(element => {
          element.classList.remove(classNames.booking.newlyBooked);
        });
        thisBooking.selectedTable = false;
      }
    }
    if(event.target.classList.contains(classNames.booking.tableBooked)){
      alert('Sorry, this table is booked, please choose another one.');
    } else if (event.target.classList.contains(classNames.booking.newlyBooked)){
      event.target.classList.remove(classNames.booking.newlyBooked);
    }else if(event.target.classList.contains(classNames.booking.table)){
      if(thisBooking.selectedTable > 0){
        thisBooking.dom.selectedTables = Array.from(thisBooking.dom.wrapper.querySelectorAll(select.booking.newlyBookedTables));
        thisBooking.dom.selectedTables.forEach(element => {
          element.classList.remove(classNames.booking.newlyBooked);
        });
      }
      thisBooking.selectedTable = event.target.getAttribute(settings.booking.tableIdAttribute);
      event.target.classList.add(classNames.booking.newlyBooked);      
    }
  }
  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;
    const payload = {};
    payload.date = thisBooking.date;
    payload.hour = utils.numberToHour(thisBooking.hour);
    payload.table = parseInt(thisBooking.selectedTable);
    payload.duration = parseInt(thisBooking.duration);
    payload.ppl = parseInt(thisBooking.ppl);
    payload.starters = [];
    for (let starter of thisBooking.dom.starters){
      if (starter.checked) payload.starters.push(starter.value);
    }
    payload.phone = thisBooking.dom.phone.value;
    payload.address = thisBooking.dom.address.value;
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response) {
        return response.json();
      }).then(function() {
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        console.log(thisBooking.booked);
      });
  }
}
export default Booking;