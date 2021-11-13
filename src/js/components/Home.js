import {templates} from '../settings.js';
class Home{
  constructor(wrapperElement){
    const thisHomePage = this;
    thisHomePage.render(wrapperElement);
  }
  render(wrapperElement){
    const thisHomePage = this;
    const generatedHtml = templates.homepage();
    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = wrapperElement;
    thisHomePage.dom.wrapper.innerHTML = generatedHtml;
  }
    
}

export default Home;