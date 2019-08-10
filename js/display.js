const tabs = document.getElementById("tabs");
let context = 'Songs'


tabs.addEventListener('click', tabsClick);


function tabsClick() {

  if (!event.target.classList.contains('active')) {
    for (let i = 0; i < tabs.children.length; i++) {
      if (tabs.children[i].children[0].classList.contains('active')) {
        tabs.children[i].children[0].classList.remove('active')
      }
    }
    event.target.classList.add('active');
    context = event.target.textContent;
  }
}