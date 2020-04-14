var App = (function (exports) {
	'use strict';

	/***
	 * Replace hyphens by spaces
	 * @param s
	 */
	function addSpaces(s) {
	    return s.replace(/-/g, " ");
	}
	/**
	 * Select n characters from the left side of string s
	 * @param s
	 * @param n
	 */
	function left(s, n) {
	    return s.slice(0, Math.abs(n));
	}
	/**
	 * Select n characters from the right side of string s
	 * @param s
	 * @param n
	 */
	function right(s, n) {
	    return s.slice(-1 * n);
	}
	/***
	 * Replace spaces by hyphens
	 * @param s
	 */
	function stripSpaces(s) {
	    return s.replace(/\s/g, "-");
	}

	// Computes the decimal coefficient and exponent of the specified number x with
	// significant digits p, where x is positive and p is in [1, 21] or undefined.
	// For example, formatDecimal(1.23) returns ["123", 0].
	function formatDecimal(x, p) {
	  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
	  var i, coefficient = x.slice(0, i);

	  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
	  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
	  return [
	    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
	    +x.slice(i + 1)
	  ];
	}

	function exponent(x) {
	  return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
	}

	function formatGroup(grouping, thousands) {
	  return function(value, width) {
	    var i = value.length,
	        t = [],
	        j = 0,
	        g = grouping[0],
	        length = 0;

	    while (i > 0 && g > 0) {
	      if (length + g + 1 > width) g = Math.max(1, width - length);
	      t.push(value.substring(i -= g, i + g));
	      if ((length += g + 1) > width) break;
	      g = grouping[j = (j + 1) % grouping.length];
	    }

	    return t.reverse().join(thousands);
	  };
	}

	function formatNumerals(numerals) {
	  return function(value) {
	    return value.replace(/[0-9]/g, function(i) {
	      return numerals[+i];
	    });
	  };
	}

	// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
	var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

	function formatSpecifier(specifier) {
	  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
	  var match;
	  return new FormatSpecifier({
	    fill: match[1],
	    align: match[2],
	    sign: match[3],
	    symbol: match[4],
	    zero: match[5],
	    width: match[6],
	    comma: match[7],
	    precision: match[8] && match[8].slice(1),
	    trim: match[9],
	    type: match[10]
	  });
	}

	formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

	function FormatSpecifier(specifier) {
	  this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
	  this.align = specifier.align === undefined ? ">" : specifier.align + "";
	  this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
	  this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
	  this.zero = !!specifier.zero;
	  this.width = specifier.width === undefined ? undefined : +specifier.width;
	  this.comma = !!specifier.comma;
	  this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
	  this.trim = !!specifier.trim;
	  this.type = specifier.type === undefined ? "" : specifier.type + "";
	}

	FormatSpecifier.prototype.toString = function() {
	  return this.fill
	      + this.align
	      + this.sign
	      + this.symbol
	      + (this.zero ? "0" : "")
	      + (this.width === undefined ? "" : Math.max(1, this.width | 0))
	      + (this.comma ? "," : "")
	      + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
	      + (this.trim ? "~" : "")
	      + this.type;
	};

	// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
	function formatTrim(s) {
	  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
	    switch (s[i]) {
	      case ".": i0 = i1 = i; break;
	      case "0": if (i0 === 0) i0 = i; i1 = i; break;
	      default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
	    }
	  }
	  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
	}

	var prefixExponent;

	function formatPrefixAuto(x, p) {
	  var d = formatDecimal(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1],
	      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
	      n = coefficient.length;
	  return i === n ? coefficient
	      : i > n ? coefficient + new Array(i - n + 1).join("0")
	      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
	      : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
	}

	function formatRounded(x, p) {
	  var d = formatDecimal(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1];
	  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
	      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
	      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
	}

	var formatTypes = {
	  "%": function(x, p) { return (x * 100).toFixed(p); },
	  "b": function(x) { return Math.round(x).toString(2); },
	  "c": function(x) { return x + ""; },
	  "d": function(x) { return Math.round(x).toString(10); },
	  "e": function(x, p) { return x.toExponential(p); },
	  "f": function(x, p) { return x.toFixed(p); },
	  "g": function(x, p) { return x.toPrecision(p); },
	  "o": function(x) { return Math.round(x).toString(8); },
	  "p": function(x, p) { return formatRounded(x * 100, p); },
	  "r": formatRounded,
	  "s": formatPrefixAuto,
	  "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
	  "x": function(x) { return Math.round(x).toString(16); }
	};

	function identity(x) {
	  return x;
	}

	var map = Array.prototype.map,
	    prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

	function formatLocale(locale) {
	  var group = locale.grouping === undefined || locale.thousands === undefined ? identity : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
	      currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
	      currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
	      decimal = locale.decimal === undefined ? "." : locale.decimal + "",
	      numerals = locale.numerals === undefined ? identity : formatNumerals(map.call(locale.numerals, String)),
	      percent = locale.percent === undefined ? "%" : locale.percent + "",
	      minus = locale.minus === undefined ? "-" : locale.minus + "",
	      nan = locale.nan === undefined ? "NaN" : locale.nan + "";

	  function newFormat(specifier) {
	    specifier = formatSpecifier(specifier);

	    var fill = specifier.fill,
	        align = specifier.align,
	        sign = specifier.sign,
	        symbol = specifier.symbol,
	        zero = specifier.zero,
	        width = specifier.width,
	        comma = specifier.comma,
	        precision = specifier.precision,
	        trim = specifier.trim,
	        type = specifier.type;

	    // The "n" type is an alias for ",g".
	    if (type === "n") comma = true, type = "g";

	    // The "" type, and any invalid type, is an alias for ".12~g".
	    else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

	    // If zero fill is specified, padding goes after sign and before digits.
	    if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

	    // Compute the prefix and suffix.
	    // For SI-prefix, the suffix is lazily computed.
	    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
	        suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

	    // What format function should we use?
	    // Is this an integer type?
	    // Can this type generate exponential notation?
	    var formatType = formatTypes[type],
	        maybeSuffix = /[defgprs%]/.test(type);

	    // Set the default precision if not specified,
	    // or clamp the specified precision to the supported range.
	    // For significant precision, it must be in [1, 21].
	    // For fixed precision, it must be in [0, 20].
	    precision = precision === undefined ? 6
	        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
	        : Math.max(0, Math.min(20, precision));

	    function format(value) {
	      var valuePrefix = prefix,
	          valueSuffix = suffix,
	          i, n, c;

	      if (type === "c") {
	        valueSuffix = formatType(value) + valueSuffix;
	        value = "";
	      } else {
	        value = +value;

	        // Determine the sign. -0 is not less than 0, but 1 / -0 is!
	        var valueNegative = value < 0 || 1 / value < 0;

	        // Perform the initial formatting.
	        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

	        // Trim insignificant zeros.
	        if (trim) value = formatTrim(value);

	        // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
	        if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

	        // Compute the prefix and suffix.
	        valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
	        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

	        // Break the formatted value into the integer “value” part that can be
	        // grouped, and fractional or exponential “suffix” part that is not.
	        if (maybeSuffix) {
	          i = -1, n = value.length;
	          while (++i < n) {
	            if (c = value.charCodeAt(i), 48 > c || c > 57) {
	              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
	              value = value.slice(0, i);
	              break;
	            }
	          }
	        }
	      }

	      // If the fill character is not "0", grouping is applied before padding.
	      if (comma && !zero) value = group(value, Infinity);

	      // Compute the padding.
	      var length = valuePrefix.length + value.length + valueSuffix.length,
	          padding = length < width ? new Array(width - length + 1).join(fill) : "";

	      // If the fill character is "0", grouping is applied after padding.
	      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

	      // Reconstruct the final output based on the desired alignment.
	      switch (align) {
	        case "<": value = valuePrefix + value + valueSuffix + padding; break;
	        case "=": value = valuePrefix + padding + value + valueSuffix; break;
	        case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
	        default: value = padding + valuePrefix + value + valueSuffix; break;
	      }

	      return numerals(value);
	    }

	    format.toString = function() {
	      return specifier + "";
	    };

	    return format;
	  }

	  function formatPrefix(specifier, value) {
	    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
	        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
	        k = Math.pow(10, -e),
	        prefix = prefixes[8 + e / 3];
	    return function(value) {
	      return f(k * value) + prefix;
	    };
	  }

	  return {
	    format: newFormat,
	    formatPrefix: formatPrefix
	  };
	}

	var locale;
	var format;
	var formatPrefix;

	defaultLocale({
	  decimal: ".",
	  thousands: ",",
	  grouping: [3],
	  currency: ["$", ""],
	  minus: "-"
	});

	function defaultLocale(definition) {
	  locale = formatLocale(definition);
	  format = locale.format;
	  formatPrefix = locale.formatPrefix;
	  return locale;
	}

	/**
	 * returns short date format based on data key "daymonth" e.g. "0102" being 1st Feb
	 * @param day
	 */
	function getScreenDate(day) {
	    const today = new Date(new Date().getFullYear(), parseInt(day.substr(2, 2)) - 1, parseInt(day.substr(0, 2)));
	    return today.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
	}
	const format2 = format(",.2f"), format1 = format(",.1f"), format0 = format(",.0f");
	/**
	 * Formats a number
	 * @param v
	 */
	function formatNumber(v) {
	    return v < 1 ? format2(v) : v < 10 ? format1(v) : format0(v);
	}

	/**
	 * Returns TURLHash object with values from current URL hash value
	 */
	function getQueryHash() {
	    const re = /\w+\$[\w\-]+/gmi;
	    let m, result = { call: "", day: "", stp: "" };
	    while ((m = re.exec(window.location.hash)) !== null) {
	        let p = m[0].split("$");
	        // @ts-ignore
	        switch (p[0]) {
	            case "call":
	                result.call = p[1];
	                break;
	            case "day":
	                result.day = p[1];
	                break;
	            case "stp":
	                result.stp = addSpaces(p[1]);
	                break;
	        }
	    }
	    return result;
	}
	/**
	 * Sets the URL hash value based on UI element values
	 */
	function setQueryHash() {
	    const calls = document.querySelector("input[name='r1']:checked");
	    const day = document.getElementById("day");
	    const stp = document.getElementById("stp");
	    let myhash = "";
	    myhash = "call$" + calls.value + "+";
	    myhash += "day$" + day.options[day.selectedIndex].value + "+";
	    myhash += "stp$" + stripSpaces(stp.options[stp.selectedIndex].value);
	    window.location.hash = myhash;
	}

	/**
	 * Advises on optimal screen size and removes splash screen after 500ms delay
	 */
	function updateSplash() {
	    if (window.innerWidth < 800 || window.innerHeight < 600) {
	        alert("The recommended minimum resolution is 800 x 600.\n Yours is " + window.innerWidth + " x " + window.innerHeight + ".");
	    }
	    setTimeout(() => {
	        const loading = document.querySelector(".loading");
	        if (loading) {
	            document.body.removeChild(loading);
	        }
	        const content = document.getElementById("content");
	        content.style.visibility = "visible";
	        content.style.opacity = "1";
	    }, 500);
	}

	/**
	 * Renders title bar components
	 */
	function initTitleBar() {
	    const titlebar = document.getElementById("titlebar-right");
	    const stp = document.createElement("span");
	    stp.id = "stp-in-title";
	    const day = document.createElement("span");
	    day.id = "day-in-title";
	    const call = document.createElement("span");
	    call.id = "call-in-title";
	    if (titlebar) {
	        const parent = document.createElement("span");
	        parent.classList.add("pagetitle", "th-fg-color");
	        titlebar.appendChild(parent);
	        parent.appendChild(stp);
	        parent.appendChild(sep());
	        parent.appendChild(day);
	        parent.appendChild(sep());
	        parent.appendChild(call);
	    }
	    window.addEventListener("stp-selection", (e) => stp.textContent = e.detail.text);
	    window.addEventListener("day-selection", (e) => day.textContent = e.detail.text);
	    window.addEventListener("call-selection", (e) => call.textContent = e.detail.text);
	    function sep() {
	        const sep = document.createElement("span");
	        sep.style.marginLeft = "5px";
	        sep.style.marginRight = "5px";
	        sep.textContent = "|";
	        return sep;
	    }
	}

	const themeLabels = ["light", "dark"];
	/**
	 * Gets the selected value from user's theme choice
	 */
	function getThemeId() {
	    let choice = 0;
	    const el = document.getElementById("theme_choice");
	    const v = el === null || el === void 0 ? void 0 : el.options[el.selectedIndex].value;
	    if (v) {
	        choice = parseInt(v);
	    }
	    return choice;
	}
	/**
	 * Sets theme-based stylesheet
	 * @param i
	 */
	function changeStyle(i) {
	    const styles = document.createElement("link");
	    styles.id = "theme_stylesheet";
	    styles.type = "text/css";
	    styles.rel = "stylesheet";
	    styles.href = "./css/themes/" + themeLabels[i] + ".css";
	    const old = document.getElementById("theme_stylesheet");
	    if (old) {
	        document.head.removeChild(old);
	    }
	    document.head.appendChild(styles);
	}
	/**
	 * Creates user control
	 */
	function initUIThemes() {
	    const select = document.getElementById("theme_choice");
	    if (select) {
	        select.title = "Select a color scheme for this page";
	        themeLabels.forEach(function (label, n) {
	            const opt = document.createElement("option");
	            opt.value = "" + n;
	            opt.text = label;
	            select.appendChild(opt);
	        });
	        select.addEventListener("click", e => e.stopImmediatePropagation());
	        select.addEventListener("input", () => {
	            const i = getThemeId();
	            changeStyle(i);
	        });
	        changeStyle(0);
	    }
	}

	/**
	 * Appends <td> to parent, returns DOM node
	 * @param parent
	 */
	function td(parent) {
	    const cell = document.createElement("td");
	    parent.appendChild(cell);
	    return cell;
	}
	/**
	 * Appends <tr> to parent, returns DOM node
	 * @param parent
	 */
	function tr(parent) {
	    const row = document.createElement("tr");
	    parent.appendChild(row);
	    return row;
	}
	/**
	 * @param data
	 */
	function draw(data) {
	    const interpolated = data.interpolated[data.day];
	    const quality = document.getElementById("quality");
	    let qualitytooltip = "<table style='font-size:12px;'><tr><td style='border-bottom:solid 1px #888;'>Data availability for <b>";
	    if (quality) {
	        qualitytooltip += data.day + ": </b>";
	        if ((interpolated.length < 1) && (data.missing.length < 1) && (data.estimated.length < 1)) {
	            quality.textContent = "▪▪▪▪▪▪▪▪▪▪";
	            qualitytooltip += "<b style='color:#2a2;'>Complete</b></td></tr><tr><td>All data is available in the database.</td></tr>";
	        }
	        else {
	            quality.textContent = "▪▪▪▪▪▪▪▪▪▫";
	            if ((interpolated.length + data.estimated.length < 3) && (data.missing.length < 3)) {
	                qualitytooltip += "<b style='color:#2a2;'>Very High</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 5) && (data.missing.length < 1)) {
	                qualitytooltip += "<b style='color:#2a2;'>Very High</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 7) && (data.missing.length < 1)) {
	                quality.textContent = "▪▪▪▪▪▪▪▪▫▫";
	                qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 5) && (data.missing.length < 3)) {
	                quality.textContent = "▪▪▪▪▪▪▪▪▫▫";
	                qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 3) && (data.missing.length < 5)) {
	                quality.textContent = "▪▪▪▪▪▪▪▪▫▫";
	                qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 5) && (data.missing.length < 5)) {
	                quality.textContent = "▪▪▪▪▪▪▪▫▫▫";
	                quality.style.color = "#ff6600";
	                qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 7) && (data.missing.length < 3)) {
	                quality.textContent = "▪▪▪▪▪▪▪▫▫▫";
	                quality.style.color = "#ff6600";
	                qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 9) && (data.missing.length < 1)) {
	                quality.textContent = "▪▪▪▪▪▪▪▫▫▫";
	                quality.style.color = "#ff6600";
	                qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 11) && (data.missing.length < 1)) {
	                quality.textContent = "▪▪▪▪▪▪▫▫▫▫";
	                quality.style.color = "#ff6600";
	                qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 9) && (data.missing.length < 3)) {
	                quality.textContent = "▪▪▪▪▪▪▫▫▫▫";
	                quality.style.color = "#ff6600";
	                qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 7) && (data.missing.length < 5)) {
	                quality.textContent = "▪▪▪▪▪▪▫▫▫▫";
	                quality.style.color = "#ff6600";
	                qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 5) && (data.missing.length < 7)) {
	                quality.textContent = "▪▪▪▪▪▪▫▫▫▫";
	                quality.style.color = "#ff6600";
	                qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 13) && (data.missing.length < 1)) {
	                quality.textContent = "▪▪▪▪▪▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 11) && (data.missing.length < 3)) {
	                quality.textContent = "▪▪▪▪▪▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 9) && (data.missing.length < 5)) {
	                quality.textContent = "▪▪▪▪▪▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 9) && (data.missing.length < 7)) {
	                quality.textContent = "▪▪▪▪▫▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 11) && (data.missing.length < 5)) {
	                quality.textContent = "▪▪▪▪▫▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 13) && (data.missing.length < 3)) {
	                quality.textContent = "▪▪▪▪▫▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 15) && (data.missing.length < 1)) {
	                quality.textContent = "▪▪▪▪▫▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 17) && (data.missing.length < 1)) {
	                quality.textContent = "▪▪▪▫▫▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'>Low</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 15) && (data.missing.length < 3)) {
	                quality.textContent = "▪▪▪▫▫▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'>Low</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 13) && (data.missing.length < 5)) {
	                quality.textContent = "▪▪▪▫▫▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'>Low</b></td></tr>";
	            }
	            else if ((interpolated.length + data.estimated.length < 11) && (data.missing.length < 7)) {
	                quality.textContent = "▪▪▪▫▫▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'" + ">Low</b></td></tr>";
	            }
	            else {
	                quality.textContent = "▪▪▫▫▫▫▫▫▫▫";
	                quality.style.color = "#D90000";
	                qualitytooltip += "<b style='color:#D90000;'" + ">Low</b></td></tr>";
	            }
	            if (data.missing.length > 0) {
	                qualitytooltip += "<tr><td><b>Missing data:</b></td></tr><tr><td>";
	                qualitytooltip += JSON.stringify(data.missing)
	                    .replace(/\"/g, "")
	                    .replace(/\,/g, "</td></tr><tr><td>")
	                    .replace(/\[/g, "")
	                    .replace(/\]/g, "") + "</td></tr>";
	            }
	            if (data.estimated.length > 0) {
	                qualitytooltip += "<tr><td><b>Estimated data:</b></td></tr><tr><td>";
	                qualitytooltip += JSON.stringify(data.estimated)
	                    .replace(/\"/g, "")
	                    .replace(/\,/g, "</td></tr><tr><td>")
	                    .replace(/\[/g, "")
	                    .replace(/\]/g, "") + "</td></tr>";
	            }
	            if (interpolated.length > 0) {
	                qualitytooltip += "<tr><td><b>Interpolated data:</b></td></tr><tr><td>";
	                qualitytooltip += JSON.stringify(interpolated)
	                    .replace(/\"/g, "")
	                    .replace(/\,/g, "</td></tr><tr><td>")
	                    .replace(/\[/g, "")
	                    .replace(/\]/g, "") + "</td></tr>";
	            }
	        }
	        qualitytooltip += "</table>";
	    }
	    quality.dataset.tip = qualitytooltip;
	}
	/**
	 * Initialises Data Quality chart
	 */
	function initDataQualityChart() {
	    const container = document.getElementById("miniDQChart");
	    const tbl = document.createElement("table");
	    if (container) {
	        tbl.classList.add("pagetitle", "th-fg-color", "data-quality");
	        tbl.cellPadding = "0";
	        tbl.cellSpacing = "0";
	        container.appendChild(tbl);
	        let row = tr(tbl);
	        let cell = td(row);
	        cell.textContent = "Data Availability";
	        row = tr(tbl);
	        cell = td(row);
	        cell.id = "quality";
	        cell.style.color = "#2a2";
	        container.addEventListener("click", function (e) {
	            e.stopImmediatePropagation();
	            window.dispatchEvent(new CustomEvent("hide-menu"));
	            const quality = document.getElementById("quality");
	            if (quality.dataset.tip) {
	                window.dispatchEvent(new CustomEvent("show-tip", { detail: { chart: false, mouseX: e.clientX, text: quality.dataset.tip } }));
	            }
	        });
	    }
	    window.addEventListener("data-quality", (e) => draw(e.detail));
	}

	exports.formatNumber = formatNumber;
	exports.getQueryHash = getQueryHash;
	exports.getScreenDate = getScreenDate;
	exports.initDataQualityChart = initDataQualityChart;
	exports.initTitleBar = initTitleBar;
	exports.initUIThemes = initUIThemes;
	exports.left = left;
	exports.right = right;
	exports.setQueryHash = setQueryHash;
	exports.updateSplash = updateSplash;

	return exports;

}({}));
