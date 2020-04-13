var themeLabels = ["light", "dark"];

/**
 * Gets the selected value from user's theme choice
 */
function getThemeId() {
  var choice = 0;
  var el = document.getElementById("theme_choice");
  if (el) {
    // @ts-ignore
    var v = el.options[el.selectedIndex].value;
    if (v) {
      choice = parseInt(v);
    }
  }
  return choice;
}

/**
 * Sets theme-based stylesheet
 * @param {number} i 
 */
function changeStyle(i) {
  var styles = document.createElement("link");
  styles.id = "theme_stylesheet";
  styles.type = "text/css";
  styles.rel = "stylesheet";
  styles.href = "./css/themes/" + themeLabels[i] + ".css";
  var old = document.getElementById("theme_stylesheet");
  if (old) {
    document.head.removeChild(old);
  }
  document.head.appendChild(styles);
}

/**
 * Creates user control
 */
function createSelection() {
  var select = document.getElementById("theme_choice");
  if (select) {
    select.title = "Select a color scheme for this page";
    themeLabels.forEach(function(label, n) {
      var opt = document.createElement("option");
      opt.value = "" + n;
      opt.text = label;
      // @ts-ignore
      select.appendChild(opt);
    });
    select.addEventListener("click", function(e) { e.stopImmediatePropagation(); })
    select.addEventListener("input", function(e) {
      var i = getThemeId();
      changeStyle(i);
    });
  }
}

createSelection();
changeStyle(0);