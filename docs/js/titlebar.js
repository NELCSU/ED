function sep() {
  var sep = document.createElement("span");
  sep.style.marginLeft = "5px";
  sep.style.marginRight = "5px";
  sep.textContent = "|";
  return sep;
}

function initTitleBar() {
  var titlebar = document.getElementById("titlebar-right");
  var stp = document.createElement("span");
  stp.id = "stp-in-title";
  var day = document.createElement("span");
  day.id = "day-in-title";
  var call = document.createElement("span");
  call.id = "call-in-title";
  if (titlebar) {
    var parent = document.createElement("span");
    parent.classList.add("pagetitle", "th-fg-color");
    titlebar.appendChild(parent);
    parent.appendChild(stp);
    parent.appendChild(sep());
    parent.appendChild(day);
    parent.appendChild(sep());
    parent.appendChild(call);
  }

  window.addEventListener("stp-selection", function(e) {
    // @ts-ignore
    stp.textContent = e.detail.text;
  });

  window.addEventListener("day-selection", function(e) {
    // @ts-ignore
    day.textContent = e.detail.text;
  });

  window.addEventListener("call-selection", function(e) {
    // @ts-ignore
    call.textContent = e.detail.text;
  });
}

initTitleBar();