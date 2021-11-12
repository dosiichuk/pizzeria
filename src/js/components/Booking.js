import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(bookingContainer){
    const thisBooking = this;
    thisBooking.render(bookingContainer);
    thisBooking.initWidgets();
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
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePickerWrapper);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPickerWrapper);
    thisBooking.dom.peopleAmount.addEventListener('updated', function() {
      console.log('peopleAmountWidget widget has been updated');
    });
    thisBooking.dom.hoursAmount.addEventListener('updated', function() {
      console.log('hoursAmountWidget widget has been updated');
    });
  }

}
export default Booking;