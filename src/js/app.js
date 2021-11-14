import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';
import Slider from './components/Slider.js';

const app = {
  initPages: function(){
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.homeLinks = document.querySelectorAll(select.all.homeLinks);
    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.pages[0].id;
    console.log(pageMatchingHash);
    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash);
    for(let link of Array.prototype.concat.call(...thisApp.navLinks, ...thisApp.homeLinks)){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* Get page id from fref attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');
        /* Run activatePage function with the retrieved id */
        thisApp.activatePage(id);

        /* change url hash */
        window.location.hash = '#/'+ id;
      });
    }
  },
  activatePage: function(pageId){
    const thisApp = this;
    /* add class "active" to matching pages, remove from non-matching pages */
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    /* add class "active" to matching links, remove from non-matching links */
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }

  },
  initMenu: function(){
    const thisApp = this;
    console.log('thisApp.data:', thisApp.data);
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },
  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  initBooking: function(){
    const bookingContainer = document.querySelector(select.containerOf.booking);
    const booking = new Booking(bookingContainer);
    console.log('booking initiated', booking);
  },
  initHome: function(){
    const homeContainer = document.querySelector(select.containerOf.home);
    new Home(homeContainer);
    new Slider();
  },
  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('settings:', settings);
    thisApp.initHome();
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();

