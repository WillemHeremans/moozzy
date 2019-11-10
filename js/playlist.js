const tabs = document.getElementById("tabs");
let context = { name: 'Songs', index: 3 };
let playListIDs = [];


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

  if (!tag.classList.contains('badge-light')) {
    if (context.name === 'Playlist') {
      if (tag.parentNode.dataset.musicUrl) {
        for (const item of playList.children) {
          for (const badge of item.children[0].children) {
            if (badge.textContent === tag.textContent) {
              badge.classList.replace('badge-info', 'badge-light');
            }
          }
        }
      } else {
        for (const item of playList.children) {
          for (const badge of item.children[1].children) {
            if (badge.textContent === tag.textContent) {
              badge.classList.replace('badge-info', 'badge-light');
            }
          }
        }
      }
    }
    if (tag.parentNode.dataset.musicUrl) {
      for (const item of songsList.children) {
        if (!playListIDs.includes(item.children[2].id)) {
          for (const badge of item.children[0].children) {
            if (badge.textContent === tag.textContent) {
              if (!playListIDs.includes(item.children[2].id)) {
                playListIDs.push(item.children[2].id);
                let clone = item.cloneNode(true);
                if (clone.id) {
                  clone.removeAttribute('class');
                  clone.removeAttribute('id');
                }
                clone.children[0].id = 'list-' + playListIDs.length;
                clone.children[2].title = 'Remove this item';
                clone.children[2].children[0].classList.replace('fa-bars', 'fa-times');
                for (const badge of clone.children[0].children) {
                  if (badge.textContent === tag.textContent) {
                    badge.classList.replace('badge-info', 'badge-light');
                  }
                }
                playList.insertAdjacentElement('afterbegin', clone);
              }
            }
          }
        }
      }
    } else {
      for (const item of songsList.children) {
        if (!playListIDs.includes(item.children[2].id)) {
          for (const badge of item.children[1].children) {
            if (badge.textContent === tag.textContent) {
              if (!playListIDs.includes(item.children[2].id)) {
                playListIDs.push(item.children[2].id);
                let clone = item.cloneNode(true);
                if (clone.id) {
                  clone.removeAttribute('class');
                  clone.removeAttribute('id');
                }
                clone.children[0].id = 'list-' + playListIDs.length;
                clone.children[2].title = 'Remove this item';
                clone.children[2].children[0].classList.replace('fa-bars', 'fa-times');
                for (const badge of clone.children[1].children) {
                  if (badge.textContent === tag.textContent) {
                    badge.classList.replace('badge-info', 'badge-light');
                  }
                }
                playList.insertAdjacentElement('afterbegin', clone);
              }
            }
          }
        }
      }
    }

    tabsClick('Playlist');
    songsList.style.display = 'none';
    songsThead.style.display = 'none';
    playListThead.style.display = 'table-row-group';
    playList.style.display = 'table-row-group';
    context.index = 5;

  } else {

    if (tag.parentNode.dataset.musicUrl) {
      let i = playList.children.length;
      while (i--) {
        for (const badge of playList.children[i].children[0].children) {
          if ((badge.textContent === tag.textContent) && playList.children[i]) {
            if (playListIDs.includes(playList.children[i].children[2].id)) {
              const index = playListIDs.indexOf(playList.children[i].children[2].id);
              index !== -1 ? playListIDs.splice(index, 1) : undefined;
            }
            playList.children[i].remove();
          }
        }
      }
    } else {
      let i = playList.children.length
      while (i--) {
        for (const badge of playList.children[i].children[1].children) {
          if (badge.textContent === tag.textContent) {
            if (playListIDs.includes(playList.children[i].children[2].id)) {
              const index = playListIDs.indexOf(playList.children[i].children[2].id);
              index !== -1 ? playListIDs.splice(index, 1) : undefined;
            }
            playList.children[i].remove();
          }
        }
      }
    }

  }

}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.target.id ? ev.target.id : ev.target.id = 'OnDrag';
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  if (ev.dataTransfer.files.length > 0) {
    addFile(ev);
  } else {
    let data = ev.dataTransfer.getData("text");
    if (ev.target.textContent === 'Playlist') {
      if (!playListIDs.includes(document.getElementById(data).children[2].id)) {
        let clone = (document.getElementById(data)).cloneNode(true);
        playListIDs.push(clone.children[2].id);
        if (clone.id) {
          clone.removeAttribute('class');
          clone.removeAttribute('id');
        }
        clone.children[0].id = 'list-' + playListIDs.length;
        clone.children[2].title = 'Remove this item';
        clone.children[2].children[0].classList.replace('fa-bars', 'fa-times');
        playList.insertAdjacentElement('afterbegin', clone);
      }
    } else {
      if (ev.target.classList.contains('badge')) {
        ev.target.parentNode.parentNode.insertAdjacentElement('afterend', document.getElementById(data));
      } else {
        ev.target.parentNode.insertAdjacentElement('afterend', document.getElementById(data));
      }
    }
    document.getElementById('OnDrag') ? document.getElementById('OnDrag').removeAttribute('id') : undefined;
  }
}



// cookie:
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