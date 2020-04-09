function initMenu() {
  var menu = document.querySelector(".panel-right");
  var menuButton = document.querySelector(".panel-right-control");
  if (menu && menuButton) {
    menuButton.addEventListener("click", function() {
      // @ts-ignore
      menu.classList.toggle("ready");
    });
  }
}

initMenu();