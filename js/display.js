const tabs = document.getElementById("tabs");
let context = { name: 'Songs', index: 3 };


tabs.addEventListener('click', tabsClick);

if (context.name === 'Radios') {
  songsThead.style.display = 'none';
  songsList.style.display = 'none';
  tabs.children[0].children[0].classList.add('active');
  playListThead.style.display = 'none';
  playList.style.display = 'none';
} else {
  radiosThead.style.display = 'none';
  radiosList.style.display = 'none';
  tabs.children[1].children[0].classList.add('active');
  playListThead.style.display = 'none';
  playList.style.display = 'none';
}


function tabsClick(tab) {

  if (tab != event) {
    for (let i = 0; i < tabs.children.length; i++) {
      if (tabs.children[i].children[0].classList.contains('active')) {
        tabs.children[i].children[0].classList.remove('active')
      }
    }
    tabs.children[2].children[0].classList.add('active');
    context.name = tab;
  } else {

    if (!event.target.classList.contains('active')) {
      for (let i = 0; i < tabs.children.length; i++) {
        if (tabs.children[i].children[0].classList.contains('active')) {
          tabs.children[i].children[0].classList.remove('active')
        }
      }
      event.target.classList.add('active');
      context.name = event.target.textContent;
    }
  }

  if (context.name === 'Radios') {
    songsThead.style.display = 'none';
    songsList.style.display = 'none';
    playListThead.style.display = 'none';
    playList.style.display = 'none';
    radiosThead.style.display = 'table-row-group';
    radiosList.style.display = 'table-row-group';
    context.index = 1;
  } else if (context.name === 'Songs') {
    playListThead.style.display = 'none';
    playList.style.display = 'none';
    radiosThead.style.display = 'none';
    radiosList.style.display = 'none';
    songsThead.style.display = 'table-row-group';
    songsList.style.display = 'table-row-group';
    context.index = 3;
  } else {
    songsThead.style.display = 'none';
    songsList.style.display = 'none';
    radiosThead.style.display = 'none';
    radiosList.style.display = 'none';
    playListThead.style.display = 'table-row-group';
    playList.style.display = 'table-row-group';
    context.index = 5;
  }
}

function setPlayList(tag) {
  for (const item of songsList.children) {
    if (item.children[1].textContent === tag || item.children[2].textContent === tag ) {
      playList.insertAdjacentElement('afterbegin', item.cloneNode(true));
    }
  }
 
  tabsClick('Playlists');
  songsList.style.display = 'none';
  songsThead.style.display = 'none';
  playListThead.style.display = 'table-row-group';
  playList.style.display = 'table-row-group';
  context.index = 5;
}

function setCookie(name, value) {
  let date = new Date();
  let expire = new Date(date.getTime() + 10000 * 60 * 60 * 24 * 365);
  document.cookie = `${name}=${value};expires=${expire};path=/`;
}

function getCookie(name) {
  name = name + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}