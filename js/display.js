const tabs = document.getElementById("tabs");
let context = {name: 'Songs', index: 3};


tabs.addEventListener('click', tabsClick);

if (context.name === 'Radios') {
  songsThead.style.display = 'none';
  songsList.style.display = 'none';
  tabs.children[0].children[0].classList.add('active');
} else {
  radiosThead.style.display = 'none';
  radiosList.style.display = 'none';
  tabs.children[1].children[0].classList.add('active');
}


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
    songsThead.style.display = 'none';
    songsList.style.display = 'none';
    radiosThead.style.display = 'table-row-group';
    radiosList.style.display = 'table-row-group';
    context.index = 1;
  } else {
    songsThead.style.display = 'table-row-group';
    songsList.style.display = 'table-row-group';
    radiosThead.style.display = 'none';
    radiosList.style.display = 'none';
    context.index = 3;
  }
}