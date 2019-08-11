const tabs = document.getElementById("tabs");
let context = {name: 'Songs', index: 1};


tabs.addEventListener('click', tabsClick);


function tabsClick() {

  if (!event.target.classList.contains('active')) {
    for (let i = 0; i < tabs.children.length; i++) {
      if (tabs.children[i].children[0].classList.contains('active')) {
        tabs.children[i].children[0].classList.remove('active')
      }
    }
    event.target.classList.add('active');
    context.name = event.target.textContent;
  }
  if (context.name === 'Radios') {
    songsList.style.display = 'none';
    radiosList.style.display = 'table-row-group';
    context.index = 2;
  } else {
    songsList.style.display = 'table-row-group';
    radiosList.style.display = 'none';
    context.index = 1;
  }
}