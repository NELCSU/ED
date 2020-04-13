function initMenu() {
  var menu = document.querySelector(".panel-right");
  var menuButton = document.querySelector(".panel-right-control");
  if (menu && menuButton) {
    menuButton.addEventListener("click", function(e) {
      e.stopImmediatePropagation();
      // @ts-ignore
      menu.classList.toggle("ready");
    });
  }
}

initMenu();