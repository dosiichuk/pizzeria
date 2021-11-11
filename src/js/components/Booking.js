import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

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
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function() {
      console.log('peopleAmountWidget widget has been updated');
    });
    thisBooking.dom.hoursAmount.addEventListener('updated', function() {
      console.log('hoursAmountWidget widget has been updated');
    });
  }

}
export default Booking;