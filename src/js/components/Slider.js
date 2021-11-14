import { select, classNames } from '../settings.js';

class Slider{
  constructor(){
    const thisSlider = this;
    thisSlider.getElements();
    thisSlider.initActions();
    thisSlider.curSlide = 0;
    thisSlider.maxSlide = thisSlider.dom.slides.length;
    thisSlider.goToSlide(thisSlider.curSlide);
    thisSlider.activateDot(thisSlider.curSlide);
    setInterval(() => thisSlider.nextSlide(), 3000);
  }
  getElements(){
    const thisSlider = this;
    thisSlider.dom = {};
    thisSlider.dom.slides = document.querySelectorAll(select.all.slides);
    thisSlider.dom.btnLeft = document.querySelector(select.slider.buttonLeft);
    thisSlider.dom.btnRight = document.querySelector(select.slider.buttonRight);
    thisSlider.dom.dotContainer = document.querySelector(select.slider.dotContainer);
    thisSlider.dom.dots = document.querySelectorAll(select.slider.dots);
  }
  initActions(){
    const thisSlider = this;
    thisSlider.dom.slides.forEach((element, index) => {
      element.style.transform = `translateX(${100 * index}%)`;     
    });
    thisSlider.dom.btnRight.addEventListener('click', () => thisSlider.nextSlide());
    thisSlider.dom.btnLeft.addEventListener('click', () => thisSlider.prevSlide());
    thisSlider.dom.dotContainer.addEventListener('click', (event) => {
      if(event.target.classList.contains(classNames.dot)){
        const {slide} = event.target.dataset;
        thisSlider.goToSlide(slide);
        thisSlider.activateDot(slide);
      }
    });
    
  }
  goToSlide(slide){
    const thisSlider = this;
    thisSlider.dom.slides.forEach((element, index) => {
      element.style.transform = `translateX(${100 * (index - slide)}%)`;     
    });
  }
  nextSlide(){
    const thisSlider = this;
    if(thisSlider.curSlide === thisSlider.maxSlide - 1){
      thisSlider.curSlide = 0;
    }else{
      thisSlider.curSlide++;
    }
    thisSlider.goToSlide(thisSlider.curSlide);
    thisSlider.activateDot(thisSlider.curSlide);
  }
  prevSlide(){
    const thisSlider = this;
    if(thisSlider.curSlide === 0){
      thisSlider.curSlide = thisSlider.maxSlide - 1;
    }else{
      thisSlider.curSlide--;
    }
    thisSlider.goToSlide(thisSlider.curSlide);
    thisSlider.activateDot(thisSlider.curSlide);
  }
  activateDot(slide){
    const thisSlider = this;
    thisSlider.dom.dots.forEach(dot => {
      dot.classList.remove(classNames.dotActive);
    });
    document.querySelector(`.${classNames.dot}[data-slide="${slide}"]`).classList.add(classNames.dotActive);

  }  

}
export default Slider;