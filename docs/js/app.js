var App = (function (exports) {
  'use strict';

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
   * Creates user control
   * @param config
   */
  function initUIThemes(config) {
      const select = document.getElementById("Colors");
      if (select) {
          select.title = "Select a color scheme for this page";
          config.themes.forEach(function (theme, n) {
              const opt = document.createElement("option");
              opt.value = "" + n;
              opt.text = theme;
              select.appendChild(opt);
          });
          select.addEventListener("input", () => {
              const i = getThemeId();
              changeStyle(i);
          });
          changeStyle(0);
      }
      /**
       * Sets theme-based stylesheet
       * @param i
       */
      function changeStyle(i) {
          const styles = document.createElement("link");
          styles.id = "theme-stylesheet";
          styles.type = "text/css";
          styles.rel = "stylesheet";
          styles.href = "./css/themes/" + config.themes[i] + ".css";
          const old = document.getElementById("theme-stylesheet");
          if (old) {
              document.head.removeChild(old);
          }
          document.head.appendChild(styles);
      }
      /**
       * Gets the selected value from user's theme choice
       */
      function getThemeId() {
          let choice = 0;
          const v = select === null || select === void 0 ? void 0 : select.options[select.selectedIndex].value;
          if (v) {
              choice = parseInt(v);
          }
          return choice;
      }
  }

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

  /**
   * Returns TURLHash object with values from current URL hash value
   */
  function getQueryHash(config) {
      if (config.querystring === undefined) {
          config.querystring = { call: "", day: "", organisation: "" };
      }
      const re = /\w+\$[\w\-]+/gmi;
      let m;
      while ((m = re.exec(window.location.hash)) !== null) {
          let p = m[0].split("$");
          switch (p[0]) {
              case "call":
                  config.querystring.call = p[1];
                  break;
              case "day":
                  config.querystring.day = p[1];
                  break;
              case "stp":
                  config.querystring.organisation = addSpaces(p[1]);
                  break;
          }
      }
  }
  /**
   * Sets the URL hash value based on UI element values
   * @param config
   */
  function setQueryHash(config) {
      const call = document.querySelector("input[name='r1']:checked");
      const day = document.getElementById("Day");
      const org = document.getElementById("Organisation");
      let myhash = "";
      if (call && call.value) {
          myhash = "call$" + call.value + "+";
      }
      if (day && config.filters.days) {
          myhash += "day$" + config.filters.days[day.value] + "+";
      }
      if (org && org.value) {
          myhash += "stp$" + stripSpaces(org.options[org.selectedIndex].value);
      }
      window.location.hash = myhash;
      getQueryHash(config);
  }

  /**
   * Creates call options. All options are available initially.
   * @param config
   */
  function initCallList(config) {
      getQueryHash(config);
      const parent = document.querySelector(".call-options");
      if (parent) {
          parent.innerHTML = "";
          let group = "", grpdiv, label;
          let control;
          config.filters.calls.forEach(function (call) {
              if (group !== call.group) {
                  group = call.group;
                  grpdiv = document.createElement("div");
                  grpdiv.classList.add("panel-row");
                  parent.appendChild(grpdiv);
                  label = document.createElement("label");
                  label.textContent = group + ":";
                  grpdiv.appendChild(label);
                  control = document.createElement("div");
                  grpdiv.appendChild(control);
              }
              let option = document.createElement("input");
              option.type = "radio";
              option.id = call.id;
              option.value = call.value;
              option.name = call.name;
              option.title = call.title;
              if (config.querystring.call === option.value) {
                  option.checked = true;
              }
              option.addEventListener("click", () => {
                  window.dispatchEvent(new CustomEvent("call-selected", { detail: option.title }));
                  window.dispatchEvent(new CustomEvent("filter-action"));
              });
              control.appendChild(option);
          });
      }
  }
  /**
   * Scans for first valid file and select corresponding call menu choice
   * @param config
   */
  function updateCallList(config) {
      const files = Object.keys(config.db.zip.files);
      let ctrl;
      config.filters.calls.forEach(function (call) {
          ctrl = document.getElementById(call.id);
          if (ctrl) {
              ctrl.disabled = true;
              ctrl.checked = false;
          }
      });
      let selected = false;
      for (let i = 0; i < files.length; i++) {
          let key = right(files[i], 7);
          key = left(key, 2);
          let found = config.filters.calls.findIndex((e) => e.value === key);
          if (found > -1) {
              ctrl = document.getElementById(config.filters.calls[found].id);
              if (ctrl) {
                  ctrl.disabled = false;
                  if (!selected) {
                      selected = true;
                      ctrl.checked = true;
                      window.dispatchEvent(new CustomEvent("call-selected", { detail: ctrl.title }));
                  }
              }
          }
      }
  }

  /**
   * @param config
   */
  function initDensitySlider(config) {
      const density = document.getElementById("Density");
      config.filters.density = 5;
      density.addEventListener("change", (e) => {
          config.filters.density = e.target.value;
          window.dispatchEvent(new CustomEvent("filter-action"));
      });
  }

  /**
   * @param config
   */
  function initOpacitySlider(config) {
      config.filters.lowopacity = 0.3;
      config.filters.highopacity = 0.9;
      const opacity = document.getElementById("Opacity");
      opacity.addEventListener("change", (e) => {
          config.filters.lowopacity = e.target.value;
          window.dispatchEvent(new CustomEvent("filter-action"));
      });
  }

  /**
   * @param config
   */
  function initSankeyLegend(config) {
      const leg = document.getElementById("Legend");
      leg.addEventListener("input", e => leg.checked ? show() : hide());
      window.addEventListener("show-legend", () => {
          if (!leg.checked) {
              return;
          }
          show();
      });
      function hide() {
          // @ts-ignore
          const svg = d3.select("#chart > svg");
          svg.select(".chart-legend")
              .transition()
              .style("opacity", 0)
              .transition()
              .remove();
      }
      function show() {
          // @ts-ignore
          const svg = d3.select("#chart > svg");
          const legend = svg.append("g")
              .datum({ x: config.chart.width - 200, y: config.chart.height - 140 })
              .style("opacity", 0)
              .attr("x", function (d) { return d.x; })
              .attr("y", function (d) { return d.y; })
              .classed("chart-legend", true)
              .attr("transform", function (d) { return "translate(" + [d.x, d.y] + ")"; });
          legend.transition()
              .duration(500)
              .style("opacity", 1);
          // @ts-ignore
          legend.call(d3.behavior.drag()
              .on("drag", function (d) {
              // @ts-ignore
              d.x += d3.event.dx;
              // @ts-ignore
              d.y += d3.event.dy;
              // @ts-ignore
              d3.select(this)
                  .attr("transform", function (d) {
                  return "translate(" + [d.x, d.y] + ")";
              });
          }));
          legend.append("rect")
              .attr("width", "200px")
              .attr("height", "140px")
              .attr("x", 0)
              .attr("y", 0)
              .classed("chart-legend", true);
          config.legend.colors.forEach((item, n) => {
              const g = legend.append("g")
                  .style("transform", "translate(10px, " + (20 + (25 * n)) + "px)");
              g.append("circle")
                  .style("fill", item)
                  .style("opacity", config.filters.lowopacity)
                  .attr("r", 10)
                  .attr("cx", 10)
                  .attr("cy", 10 + (1 * n));
              g.append("text")
                  .classed("chart-legend", true)
                  .attr("x", 25)
                  .attr("y", 15 + (1 * n))
                  .text(config.legend.labels[n]);
          });
      }
  }

  /**
   * @param config
   */
  function initSankeyNodeMovement(config) {
      const x = document.getElementById("MoveX");
      const y = document.getElementById("MoveY");
      if (config.chart === undefined) {
          config.chart = {};
      }
      config.chart.moveX = true;
      config.chart.moveY = true;
      x.addEventListener("input", () => config.chart.moveX = x.checked);
      y.addEventListener("input", () => config.chart.moveY = y.checked);
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
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

  const day = document.getElementById("Day");
  const label = document.getElementById("lblDay");
  /**
   * @param config
   */
  function initDayList(config) {
      day.addEventListener("change", e => {
          const raw = config.filters.days[parseInt(day.value)];
          const fdate = getScreenDate(raw);
          window.dispatchEvent(new CustomEvent("day-selected", { detail: fdate }));
          label.textContent = `Day: ${fdate}`;
          window.dispatchEvent(new CustomEvent("filter-action"));
      });
  }
  /**
   * @param config
   */
  function updateDayList(config) {
      setQueryHash(config);
      day.max = config.filters.days.length - 1 + "";
      const i = config.filters.days.findIndex((e) => e === config.querystring.day);
      day.value = (i > -1 ? i : 0) + "";
      const raw = config.filters.days[parseInt(day.value)];
      const fdate = getScreenDate(raw);
      label.textContent = `Day: ${fdate}`;
      window.dispatchEvent(new CustomEvent("day-selected", { detail: fdate }));
  }

  /**
   * @param config
   */
  function fetchDataStore(config) {
      return __awaiter(this, void 0, void 0, function* () {
          const p = (file) => {
              return new Promise((resolve, reject) => {
                  // @ts-ignore
                  JSZipUtils.getBinaryContent(file, (err, rawdata) => {
                      if (err) {
                          reject(err);
                      }
                      resolve(rawdata);
                  });
              });
          };
          return p(config.db.path + config.db.file)
              .then((raw) => __awaiter(this, void 0, void 0, function* () {
              // @ts-ignore
              return yield JSZip.loadAsync(raw);
          }))
              .then((zipfile) => {
              config.db.zip = zipfile;
              return zipfile;
          });
      });
  }
  /**
   * @param config
   */
  function openDataFile(config) {
      return __awaiter(this, void 0, void 0, function* () {
          return config.db.zip.file(config.db.file).async("string");
      });
  }
  /**
   * @param data
   * @param config
   */
  function processDayFile(data, config) {
      config.db.dq = JSON.parse(data);
      config.filters.days = [];
      for (let key in config.db.dq.interpolated) {
          config.filters.days.push(key);
      }
      updateDayList(config);
      updateCallList(config);
      setQueryHash(config);
      window.dispatchEvent(new CustomEvent("filter-action"));
  }

  /**
   * @param config
   */
  function initMenu(config) {
      const menu = document.querySelector(".panel-right");
      const menuButton = document.querySelector(".panel-right-control");
      if (menu && menuButton) {
          menuButton.addEventListener("click", e => {
              e.stopImmediatePropagation();
              menu.classList.toggle("ready");
              window.dispatchEvent(new CustomEvent("hide-breakdown"));
          });
          menu.addEventListener("click", e => e.stopImmediatePropagation());
      }
      initDayList(config);
      initCallList(config);
      initDensitySlider(config);
      initOpacitySlider(config);
      initSankeyLegend(config);
      initSankeyNodeMovement(config);
      initUIThemes(config);
      window.addEventListener("hide-menu", () => menu.classList.add("ready"));
      window.addEventListener("filter-action", () => {
          window.dispatchEvent(new CustomEvent("data-quality"));
          setQueryHash(config);
          config.db.file = config.querystring.organisation + config.querystring.day + config.querystring.call + ".json";
          openDataFile(config)
              .then((content) => {
              config.db.sankey = JSON.parse(content);
              window.dispatchEvent(new CustomEvent("sankey-chart"));
          });
      });
  }

  /**
   * @param config
   */
  function initBreakdown(config) {
      const body = document.querySelector("body");
      const container = document.createElement("div");
      container.classList.add("breakdown", "left");
      container.style.opacity = "0";
      container.addEventListener("click", e => e.stopImmediatePropagation());
      body.appendChild(container);
      const close = document.createElement("div");
      close.classList.add("breakdown-close");
      close.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          hide(config);
      });
      container.appendChild(close);
      const text = document.createElement("div");
      text.classList.add("breakdown-message");
      container.appendChild(text);
      const chartContainer = document.createElement("div");
      chartContainer.classList.add("breakdown-charts");
      chartContainer.style.height = Math.min(config.height - 100, config.width) + "px";
      container.appendChild(chartContainer);
      const chart1 = document.createElement("div");
      chart1.classList.add("breakdown-primary");
      chart1.style.display = "none";
      chartContainer.appendChild(chart1);
      const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg1.style.height = "200px";
      svg1.style.width = "200px";
      chart1.appendChild(svg1);
      const chart2 = document.createElement("div");
      chart2.classList.add("breakdown-secondary");
      chart2.style.display = "none";
      chartContainer.appendChild(chart2);
      const svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg2.style.height = "200px";
      svg2.style.width = "200px";
      chart2.appendChild(svg2);
      /**
       * @param config
       */
      function hide(config) {
          container.style.opacity = "0";
          container.style.zIndex = "-10";
          if (config.chart.highlightedItem) {
              config.chart.highlightedItem.style('opacity', config.filters.lowopacity);
              config.chart.highlightedItem = undefined;
          }
          svg1.innerHTML = "";
          svg2.innerHTML = "";
      }
      /**
       * @param d
       */
      function show(d) {
          if (d.x || d.y) {
              container.classList.remove("right");
              container.classList.remove("left");
              container.style.left = d.x + "px";
              container.style.top = d.y + "px";
          }
          else if (d.mouseX > window.innerWidth * 0.5) {
              container.classList.remove("right");
              container.classList.add("left");
          }
          else {
              container.classList.add("right");
              container.classList.remove("left");
          }
          chartContainer.style.display = d.chart ? "" : "none";
          container.style.opacity = "1";
          container.style.zIndex = "10";
          text.innerHTML = `<table style="text-align:center;">${d.text}</table>`;
      }
      window.addEventListener("show-breakdown", (e) => show(e.detail));
      window.addEventListener("hide-breakdown", () => hide(config));
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
   * @param config
   */
  function draw(config) {
      const i = config.db.dq.interpolated[config.querystring.day];
      const es = config.db.dq.estimated;
      const ms = config.db.dq.missing;
      const q = document.getElementById("quality");
      let qt = "<table style='font-size:12px;'><tr><td style='border-bottom:solid 1px #888;'>Data availability for <b>";
      if (q) {
          qt += getScreenDate(config.querystring.day) + ": </b>";
          if ((i.length < 1) && (ms.length < 1) && (es.length < 1)) {
              q.textContent = "▪▪▪▪▪▪▪▪▪▪";
              qt += "<b style='color:#2a2;'>Complete</b></td></tr><tr><td>All data is available in the database.</td></tr>";
          }
          else {
              q.textContent = "▪▪▪▪▪▪▪▪▪▫";
              if ((i.length + es.length < 3) && (ms.length < 3)) {
                  qt += "<b style='color:#2a2;'>Very High</b></td></tr>";
              }
              else if ((i.length + es.length < 5) && (ms.length < 1)) {
                  qt += "<b style='color:#2a2;'>Very High</b></td></tr>";
              }
              else if ((i.length + es.length < 7) && (ms.length < 1)) {
                  q.textContent = "▪▪▪▪▪▪▪▪▫▫";
                  qt += "<b style='color:#2a2;'>High</b></td></tr>";
              }
              else if ((i.length + es.length < 5) && (ms.length < 3)) {
                  q.textContent = "▪▪▪▪▪▪▪▪▫▫";
                  qt += "<b style='color:#2a2;'>High</b></td></tr>";
              }
              else if ((i.length + es.length < 3) && (ms.length < 5)) {
                  q.textContent = "▪▪▪▪▪▪▪▪▫▫";
                  qt += "<b style='color:#2a2;'>High</b></td></tr>";
              }
              else if ((i.length + es.length < 5) && (ms.length < 5)) {
                  q.textContent = "▪▪▪▪▪▪▪▫▫▫";
                  q.style.color = "#ff6600";
                  qt += "<b style='color:#f60;'>Medium</b></td></tr>";
              }
              else if ((i.length + es.length < 7) && (ms.length < 3)) {
                  q.textContent = "▪▪▪▪▪▪▪▫▫▫";
                  q.style.color = "#ff6600";
                  qt += "<b style='color:#f60;'>Medium</b></td></tr>";
              }
              else if ((i.length + es.length < 9) && (ms.length < 1)) {
                  q.textContent = "▪▪▪▪▪▪▪▫▫▫";
                  q.style.color = "#ff6600";
                  qt += "<b style='color:#f60;'>Medium</b></td></tr>";
              }
              else if ((i.length + es.length < 11) && (ms.length < 1)) {
                  q.textContent = "▪▪▪▪▪▪▫▫▫▫";
                  q.style.color = "#ff6600";
                  qt += "<b style='color:#f60;'>Medium</b></td></tr>";
              }
              else if ((i.length + es.length < 9) && (ms.length < 3)) {
                  q.textContent = "▪▪▪▪▪▪▫▫▫▫";
                  q.style.color = "#ff6600";
                  qt += "<b style='color:#f60;'>Medium</b></td></tr>";
              }
              else if ((i.length + es.length < 7) && (ms.length < 5)) {
                  q.textContent = "▪▪▪▪▪▪▫▫▫▫";
                  q.style.color = "#ff6600";
                  qt += "<b style='color:#f60;'>Medium</b></td></tr>";
              }
              else if ((i.length + es.length < 5) && (ms.length < 7)) {
                  q.textContent = "▪▪▪▪▪▪▫▫▫▫";
                  q.style.color = "#ff6600";
                  qt += "<b style='color:#f60;'>Medium</b></td></tr>";
              }
              else if ((i.length + es.length < 13) && (ms.length < 1)) {
                  q.textContent = "▪▪▪▪▪▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
              }
              else if ((i.length + es.length < 11) && (ms.length < 3)) {
                  q.textContent = "▪▪▪▪▪▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
              }
              else if ((i.length + es.length < 9) && (ms.length < 5)) {
                  q.textContent = "▪▪▪▪▪▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
              }
              else if ((i.length + es.length < 9) && (ms.length < 7)) {
                  q.textContent = "▪▪▪▪▫▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
              }
              else if ((i.length + es.length < 11) && (ms.length < 5)) {
                  q.textContent = "▪▪▪▪▫▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
              }
              else if ((i.length + es.length < 13) && (ms.length < 3)) {
                  q.textContent = "▪▪▪▪▫▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
              }
              else if ((i.length + es.length < 15) && (ms.length < 1)) {
                  q.textContent = "▪▪▪▪▫▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
              }
              else if ((i.length + es.length < 17) && (ms.length < 1)) {
                  q.textContent = "▪▪▪▫▫▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'>Low</b></td></tr>";
              }
              else if ((i.length + es.length < 15) && (ms.length < 3)) {
                  q.textContent = "▪▪▪▫▫▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'>Low</b></td></tr>";
              }
              else if ((i.length + es.length < 13) && (ms.length < 5)) {
                  q.textContent = "▪▪▪▫▫▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'>Low</b></td></tr>";
              }
              else if ((i.length + es.length < 11) && (ms.length < 7)) {
                  q.textContent = "▪▪▪▫▫▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'" + ">Low</b></td></tr>";
              }
              else {
                  q.textContent = "▪▪▫▫▫▫▫▫▫▫";
                  q.style.color = "#D90000";
                  qt += "<b style='color:#D90000;'" + ">Low</b></td></tr>";
              }
              if (ms.length > 0) {
                  qt += "<tr><td><b>Missing data:</b></td></tr><tr><td>";
                  qt += JSON.stringify(ms)
                      .replace(/\"/g, "")
                      .replace(/\,/g, "</td></tr><tr><td>")
                      .replace(/\[/g, "")
                      .replace(/\]/g, "") + "</td></tr>";
              }
              if (es.length > 0) {
                  qt += "<tr><td><b>Estimated data:</b></td></tr><tr><td>";
                  qt += JSON.stringify(es)
                      .replace(/\"/g, "")
                      .replace(/\,/g, "</td></tr><tr><td>")
                      .replace(/\[/g, "")
                      .replace(/\]/g, "") + "</td></tr>";
              }
              if (i.length > 0) {
                  qt += "<tr><td><b>Interpolated data:</b></td></tr><tr><td>";
                  qt += JSON.stringify(i)
                      .replace(/\"/g, "")
                      .replace(/\,/g, "</td></tr><tr><td>")
                      .replace(/\[/g, "")
                      .replace(/\]/g, "") + "</td></tr>";
              }
          }
          qt += "</table>";
      }
      q.dataset.tip = qt;
  }
  /**
   * Initialises Data Quality chart
   * @param config
   */
  function initDataQualityChart(config) {
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
                  const d = {
                      chart: false,
                      x: 10,
                      y: e.clientY + 50,
                      text: quality.dataset.tip
                  };
                  window.dispatchEvent(new CustomEvent("show-breakdown", { detail: d }));
              }
          });
      }
      window.addEventListener("data-quality", () => draw(config));
  }

  function sankeyModel() {
      const sankey = {
          alignHorizontal: () => {
              alignment = "horizontal";
              return sankey;
          },
          alignVertical: () => {
              alignment = "vertical";
              return sankey;
          },
          layout: (iterations) => {
              computeNodeLinks();
              computeNodeValues();
              computeNodeStructure();
              if (alignment === "horizontal") {
                  computeNodeBreadthsHorizontal();
                  computeNodeDepthsHorizontal(iterations);
              }
              else {
                  computeNodeDepthsVertical();
                  computeNodeBreadthsVertical(iterations);
              }
              computeLinkDepths();
              return sankey;
          },
          link: () => {
              let curvature = .5;
              function link(d) {
                  let x0, x1, i, y0, y1;
                  if (alignment === "horizontal") {
                      let x2, x3;
                      x0 = d.source.x + d.source.dx;
                      x1 = d.target.x;
                      // @ts-ignore
                      i = d3.interpolateNumber(x0, x1);
                      x2 = i(curvature);
                      x3 = i(1 - curvature);
                      y0 = d.source.y + d.sy + d.dy / 2;
                      y1 = d.target.y + d.ty + d.dy / 2;
                      return "M" + x0 + "," + y0 +
                          "C" + x2 + "," + y0 +
                          " " + x3 + "," + y1 +
                          " " + x1 + "," + y1;
                  }
                  else {
                      let y2, y3;
                      x0 = d.source.x + d.sy + d.dy / 2;
                      x1 = d.target.x + d.ty + d.dy / 2;
                      y0 = d.source.y + nodeWidth,
                          y1 = d.target.y,
                          // @ts-ignore
                          i = d3.interpolateNumber(y0, y1),
                          y2 = i(curvature),
                          y3 = i(1 - curvature);
                      return "M" + x0 + "," + y0 +
                          "C" + x0 + "," + y2 +
                          " " + x1 + "," + y3 +
                          " " + x1 + "," + y1;
                  }
              }
              link.curvature = function (n) {
                  if (!arguments.length) {
                      return curvature;
                  }
                  if (n !== undefined) {
                      curvature = +n;
                  }
                  return link;
              };
              return link;
          },
          links: (n) => {
              if (n === undefined) {
                  return links;
              }
              links = n;
              return sankey;
          },
          nodePadding: (n) => {
              if (n === undefined) {
                  return nodePadding;
              }
              nodePadding = +n;
              return sankey;
          },
          nodes: (n) => {
              if (n === undefined) {
                  return nodes;
              }
              nodes = n;
              return sankey;
          },
          nodeWidth: (n) => {
              if (n === undefined) {
                  return nodeWidth;
              }
              nodeWidth = +n;
              return sankey;
          },
          relayout: () => {
              computeLinkDepths();
              return sankey;
          },
          reversibleLink: () => {
              let curvature = .5;
              /**
               * @param part
               * @param d
               */
              function forwardLink(part, d) {
                  let x0 = d.source.x + d.source.dx, x1 = d.target.x, 
                  // @ts-ignore
                  xi = d3.interpolateNumber(x0, x1), x2 = xi(curvature), x3 = xi(1 - curvature), y0 = d.source.y + d.sy, y1 = d.target.y + d.ty, y2 = d.source.y + d.sy + d.dy, y3 = d.target.y + d.ty + d.dy;
                  switch (part) {
                      case 0:
                          return "M" + x0 + "," + y0 + "L" + x0 + "," + (y0 + d.dy);
                      case 1:
                          return "M" + x0 + "," + y0 +
                              "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " + x1 + "," + y1 +
                              "L" + x1 + "," + y3 +
                              "C" + x3 + "," + y3 + " " + x2 + "," + y2 + " " + x0 + "," + y2 +
                              "Z";
                      case 2:
                          return "M" + x1 + "," + y1 + "L" + x1 + "," + (y1 + d.dy);
                  }
              }
              /**
               * @description
               * Used for self loops and when the source is actually in front of the
               * target; the first element is a turning path from the source to the
               * destination, the second element connects the two twists and the last
               * twists into the target element.
               *  /--Target
               *  \----------------------\
               *                 Source--/
               * @param part
               * @param d
               */
              function backwardLink(part, d) {
                  let curveExtension = 30;
                  let curveDepth = 15;
                  function getDir(d) {
                      return d.source.y + d.sy > d.target.y + d.ty ? -1 : 1;
                  }
                  function p(x, y) {
                      return x + "," + y + " ";
                  }
                  let dt = getDir(d) * curveDepth, x0 = d.source.x + d.source.dx, y0 = d.source.y + d.sy, x1 = d.target.x, y1 = d.target.y + d.ty;
                  switch (part) {
                      case 0:
                          return "M" + p(x0, y0) +
                              "C" + p(x0, y0) +
                              p(x0 + curveExtension, y0) +
                              p(x0 + curveExtension, y0 + dt) +
                              "L" + p(x0 + curveExtension, y0 + dt + d.dy) +
                              "C" + p(x0 + curveExtension, y0 + d.dy) +
                              p(x0, y0 + d.dy) +
                              p(x0, y0 + d.dy) +
                              "Z";
                      case 1:
                          return "M" + p(x0 + curveExtension, y0 + dt) +
                              "C" + p(x0 + curveExtension, y0 + 3 * dt) +
                              p(x1 - curveExtension, y1 - 3 * dt) +
                              p(x1 - curveExtension, y1 - dt) +
                              "L" + p(x1 - curveExtension, y1 - dt + d.dy) +
                              "C" + p(x1 - curveExtension, y1 - 3 * dt + d.dy) +
                              p(x0 + curveExtension, y0 + 3 * dt + d.dy) +
                              p(x0 + curveExtension, y0 + dt + d.dy) +
                              "Z";
                      case 2:
                          return "M" + p(x1 - curveExtension, y1 - dt) +
                              "C" + p(x1 - curveExtension, y1) +
                              p(x1, y1) +
                              p(x1, y1) +
                              "L" + p(x1, y1 + d.dy) +
                              "C" + p(x1, y1 + d.dy) +
                              p(x1 - curveExtension, y1 + d.dy) +
                              p(x1 - curveExtension, y1 + d.dy - dt) +
                              "Z";
                  }
              }
              return function (part) {
                  return function (d) {
                      if (d.source.x < d.target.x) {
                          return forwardLink(part, d);
                      }
                      else {
                          return backwardLink(part, d);
                      }
                  };
              };
          },
          size: (n) => {
              if (n === undefined) {
                  return size;
              }
              size = n;
              return sankey;
          }
      };
      let alignment = "horizontal";
      let nodeWidth = 24;
      let nodePadding = 8;
      let size = [1, 1];
      let nodes = [];
      let links = [];
      const components = [];
      /**
       * @description
       * Populate the sourceLinks and targetLinks for each node.
       * Also, if the source and target are not objects, assume they are indices.
       */
      function computeNodeLinks() {
          nodes.forEach(function (node) {
              node.sourceLinks = [];
              node.targetLinks = [];
          });
          links.forEach(function (link) {
              let source = link.source, target = link.target;
              if (typeof source === "number") {
                  source = link.source = nodes[link.source];
              }
              if (typeof target === "number") {
                  target = link.target = nodes[link.target];
              }
              source.sourceLinks.push(link);
              target.targetLinks.push(link);
          });
      }
      /**
       * Compute the value (size) of each node by summing the associated links.
       */
      function computeNodeValues() {
          nodes.forEach(function (node) {
              if (!(node.value)) {
                  node.value = Math.max(
                  // @ts-ignore
                  d3.sum(node.sourceLinks, value), d3.sum(node.targetLinks, value));
              }
          });
      }
      /**
       * @description
       * Take the list of nodes and create a DAG of supervertices, each consisting of a strongly connected component of the graph
       * @see http://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm
       */
      function computeNodeStructure() {
          let nodeStack = [], index = 0;
          nodes.forEach(function (node) {
              if (!node.index) {
                  connect(node);
              }
          });
          function connect(node) {
              node.index = index++;
              node.lowIndex = node.index;
              node.onStack = true;
              nodeStack.push(node);
              if (node.sourceLinks) {
                  node.sourceLinks.forEach(function (sourceLink) {
                      let target = sourceLink.target;
                      if (!target.hasOwnProperty('index')) {
                          connect(target);
                          node.lowIndex = Math.min(node.lowIndex, target.lowIndex);
                      }
                      else if (target.onStack) {
                          node.lowIndex = Math.min(node.lowIndex, target.index);
                      }
                  });
                  if (node.lowIndex === node.index) {
                      let component = [], currentNode;
                      do {
                          currentNode = nodeStack.pop();
                          currentNode.onStack = false;
                          component.push(currentNode);
                      } while (currentNode !== node);
                      components.push({
                          root: node,
                          scc: component
                      });
                  }
              }
          }
          components.forEach(function (component, i) {
              component.index = i;
              component.scc.forEach(function (node) {
                  node.component = i;
              });
          });
      }
      // Assign the breadth (x-position) for each strongly connected component,
      // followed by assigning breadth within the component.
      function computeNodeBreadthsHorizontal() {
          layerComponents();
          components.forEach(function (component, i) {
              bfs(component.root, function (node) {
                  let result = node.sourceLinks
                      .filter(function (sourceLink) {
                      return sourceLink.target.component === i;
                  })
                      .map(function (sourceLink) {
                      return sourceLink.target;
                  });
                  return result;
              });
          });
          // @ts-ignore
          let componentsByBreadth = d3.nest()
              .key(function (d) {
              return d.x;
          })
              // @ts-ignore
              .sortKeys(d3.ascending)
              .entries(components)
              .map(function (d) {
              return d.values;
          });
          let max = -1, nextMax = -1;
          componentsByBreadth.forEach(function (c) {
              c.forEach(function (component) {
                  component.x = max + 1;
                  component.scc.forEach(function (node) {
                      if (node.layer) {
                          node.x = node.layer;
                      }
                      else {
                          node.x = component.x + node.x;
                      }
                      nextMax = Math.max(nextMax, node.x);
                  });
              });
              max = nextMax;
          });
          nodes.filter(function (node) {
              let outLinks = node.sourceLinks.filter(function (link) {
                  return link.source.name !== link.target.name;
              });
              return (outLinks.length === 0);
          })
              .forEach(function (node) {
              node.x = max;
          });
          scaleNodeBreadths((size[0] - nodeWidth) / Math.max(max, 1));
          function layerComponents() {
              let remainingComponents = components, nextComponents, visitedIndex, x = 0;
              while (remainingComponents.length) {
                  nextComponents = [];
                  visitedIndex = {};
                  remainingComponents.forEach(function (component) {
                      component.x = x;
                      component.scc.forEach(function (n) {
                          n.sourceLinks.forEach(function (l) {
                              if (!visitedIndex.hasOwnProperty(l.target.component) &&
                                  l.target.component !== component.index) {
                                  nextComponents.push(components[l.target.component]);
                                  visitedIndex[l.target.component] = true;
                              }
                          });
                      });
                  });
                  remainingComponents = nextComponents;
                  ++x;
              }
          }
          function bfs(node, extractTargets) {
              let queue = [node], currentCount = 1, nextCount = 0, x = 0;
              while (currentCount > 0) {
                  let currentNode = queue.shift();
                  currentCount--;
                  if (!currentNode.hasOwnProperty('x')) {
                      currentNode.x = x;
                      currentNode.dx = nodeWidth;
                      let targets = extractTargets(currentNode);
                      queue = queue.concat(targets);
                      nextCount += targets.length;
                  }
                  if (currentCount === 0) { // level change
                      x++;
                      currentCount = nextCount;
                      nextCount = 0;
                  }
              }
          }
      }
      function computeNodeBreadthsVertical(iterations) {
          // @ts-ignore
          let nodesByBreadth = d3.nest()
              .key(function (d) {
              return d.y;
          })
              // @ts-ignore
              .sortKeys(d3.ascending)
              .entries(nodes)
              .map(function (d) {
              return d.values;
          });
          // this bit is actually the node sizes (widths)
          //var ky = (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value)
          // this should be only source nodes surely (level 1)
          // @ts-ignore
          let ky = (size[0] - (nodesByBreadth[0].length - 1) * nodePadding) / d3.sum(nodesByBreadth[0], value);
          nodesByBreadth.forEach(function (nodes) {
              nodes.forEach(function (node, i) {
                  node.x = i;
                  node.dy = node.value * ky;
              });
          });
          links.forEach(function (link) {
              link.dy = link.value * ky;
          });
          resolveCollisions();
          for (let alpha = 1; iterations > 0; --iterations) {
              relaxLeftToRight(alpha);
              resolveCollisions();
              relaxRightToLeft(alpha *= .99);
              resolveCollisions();
          }
          // these relax methods should probably be operating on one level of the nodes, not all!?
          function relaxLeftToRight(alpha) {
              nodesByBreadth.forEach(function (nodes, breadth) {
                  nodes.forEach(function (node) {
                      if (node.targetLinks.length) {
                          // @ts-ignore
                          let y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
                          node.x += (y - center(node)) * alpha;
                      }
                  });
              });
              function weightedSource(link) {
                  return center(link.source) * link.value;
              }
          }
          function relaxRightToLeft(alpha) {
              nodesByBreadth.slice().reverse()
                  .forEach(function (nodes) {
                  nodes.forEach(function (node) {
                      if (node.sourceLinks.length) {
                          // @ts-ignore
                          let y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
                          node.x += (y - center(node)) * alpha;
                      }
                  });
              });
              function weightedTarget(link) {
                  return center(link.target) * link.value;
              }
          }
          function resolveCollisions() {
              nodesByBreadth.forEach(function (nodes) {
                  let node, dy, x0 = 0, n = nodes.length, i;
                  // Push any overlapping nodes right.
                  nodes.sort(ascendingDepth);
                  for (i = 0; i < n; ++i) {
                      node = nodes[i];
                      dy = x0 - node.x;
                      if (dy > 0) {
                          node.x += dy;
                      }
                      x0 = node.x + node.dy + nodePadding;
                  }
                  // If the rightmost node goes outside the bounds, push it left.
                  dy = x0 - nodePadding - size[0]; // was size[1]
                  if (dy > 0) {
                      x0 = node.x -= dy;
                      // Push any overlapping nodes left.
                      for (i = n - 2; i >= 0; --i) {
                          node = nodes[i];
                          dy = node.x + node.dy + nodePadding - x0; // was y0
                          if (dy > 0) {
                              node.x -= dy;
                          }
                          x0 = node.x;
                      }
                  }
              });
          }
          function ascendingDepth(a, b) {
              //return a.y - b.y; // flows go up
              return b.x - a.x; // flows go down
              //return a.x - b.x;
          }
      }
      /**
       * @param kx
       */
      function scaleNodeBreadths(kx) {
          nodes.forEach(function (node) {
              if (alignment === "horizontal") {
                  node.x *= kx;
              }
              else {
                  node.y *= kx;
              }
          });
      }
      /**
       * @param iterations
       */
      function computeNodeDepthsHorizontal(iterations) {
          // @ts-ignore
          let nodesByBreadth = d3.nest()
              .key(function (d) {
              return d.x;
          })
              // @ts-ignore
              .sortKeys(d3.ascending)
              .entries(nodes)
              .map(function (d) {
              return d.values;
          });
          initializeNodeDepth();
          resolveCollisions();
          for (let alpha = 1; iterations > 0; --iterations) {
              relaxRightToLeft(alpha *= .99);
              resolveCollisions();
              relaxLeftToRight(alpha);
              resolveCollisions();
          }
          function initializeNodeDepth() {
              // @ts-ignore
              let ky = d3.min(nodesByBreadth, function (nodes) {
                  // @ts-ignore
                  return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
              });
              nodesByBreadth.forEach(function (nodes) {
                  nodes.forEach(function (node, i) {
                      if (ky !== undefined) {
                          node.y = i;
                          node.dy = node.value * ky;
                      }
                  });
              });
              links.forEach(function (link) {
                  if (ky !== undefined) {
                      link.dy = link.value * ky;
                  }
              });
          }
          function relaxLeftToRight(alpha) {
              nodesByBreadth.forEach(function (nodes, breadth) {
                  nodes.forEach(function (node) {
                      if (node.targetLinks.length) {
                          // @ts-ignore
                          let y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
                          node.y += (y - center(node)) * alpha;
                      }
                  });
              });
              function weightedSource(link) {
                  return center(link.source) * link.value;
              }
          }
          function relaxRightToLeft(alpha) {
              nodesByBreadth.slice().reverse().forEach(function (nodes) {
                  nodes.forEach(function (node) {
                      if (node.sourceLinks.length) {
                          // @ts-ignore
                          let y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
                          node.y += (y - center(node)) * alpha;
                      }
                  });
              });
              function weightedTarget(link) {
                  return center(link.target) * link.value;
              }
          }
          function resolveCollisions() {
              nodesByBreadth.forEach(function (nodes) {
                  let node, dy, y0 = 0, n = nodes.length, i;
                  // Push any overlapping nodes down.
                  nodes.sort(ascendingDepth);
                  for (i = 0; i < n; ++i) {
                      node = nodes[i];
                      dy = y0 - node.y;
                      if (dy > 0) {
                          node.y += dy;
                      }
                      y0 = node.y + node.dy + nodePadding;
                  }
                  // If the bottommost node goes outside the bounds, push it back up.
                  dy = y0 - nodePadding - size[1];
                  if (dy > 0) {
                      y0 = node.y -= dy;
                      // Push any overlapping nodes back up.
                      for (i = n - 2; i >= 0; --i) {
                          node = nodes[i];
                          dy = node.y + node.dy + nodePadding - y0;
                          if (dy > 0) {
                              node.y -= dy;
                          }
                          y0 = node.y;
                      }
                  }
              });
          }
          function ascendingDepth(a, b) {
              return a.y - b.y;
          }
      }
      function computeNodeDepthsVertical() {
          let remainingNodes = nodes, nextNodes, y = 0;
          while (remainingNodes.length) {
              nextNodes = [];
              remainingNodes.forEach(function (node) {
                  node.y = y;
                  //node.dx = nodeWidth;
                  node.sourceLinks.forEach(function (link) {
                      if (nextNodes.indexOf(link.target) < 0) {
                          nextNodes.push(link.target);
                      }
                  });
              });
              remainingNodes = nextNodes;
              ++y;
          }
          // move end points to the very bottom
          moveSinksDown(y);
          scaleNodeBreadths((size[1] - nodeWidth) / (y - 1));
      }
      // this moves all end points (sinks!) to the most extreme bottom
      function moveSinksDown(y) {
          nodes.forEach(function (node) {
              if (!node.sourceLinks.length) {
                  node.y = y - 1;
              }
          });
      }
      function computeLinkDepths() {
          nodes.forEach(function (node) {
              node.sourceLinks.sort(ascendingTargetDepth);
              node.targetLinks.sort(ascendingSourceDepth);
          });
          nodes.forEach(function (node) {
              let sy = 0, ty = 0;
              node.sourceLinks.forEach(function (link) {
                  link.sy = sy;
                  sy += link.dy;
              });
              node.targetLinks.forEach(function (link) {
                  link.ty = ty;
                  ty += link.dy;
              });
          });
          function ascendingSourceDepth(a, b) {
              return alignment === "horizontal" ?
                  a.source.y - b.source.y :
                  a.source.x - b.source.x;
          }
          function ascendingTargetDepth(a, b) {
              return alignment === "horizontal" ?
                  a.target.y - b.target.y :
                  a.target.x - b.target.x;
          }
      }
      function center(node) {
          return node.y + node.dy / 2;
      }
      function value(link) {
          return link.value;
      }
      return sankey;
  }

  /**
   * @param config
   */
  function initSankeyChart(config) {
      if (config.chart === undefined) {
          config.chart = {};
      }
      config.chart.margin = { top: 70, right: 10, bottom: 12, left: 40 };
      const chart = document.getElementById("chart");
      if (chart) {
          config.chart.width = chart.offsetWidth - config.chart.margin.left - config.chart.margin.right;
          config.chart.height = chart.offsetHeight - config.chart.margin.bottom - 130;
      }
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.style.width = config.chart.width + config.chart.margin.left + config.chart.margin.right;
      svg.style.height = config.chart.height + config.chart.margin.top + config.chart.margin.bottom;
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.style.transform = "translate(" + config.chart.margin.left + "," + config.chart.margin.top + ")";
      svg.appendChild(g);
      chart === null || chart === void 0 ? void 0 : chart.appendChild(svg);
      // @ts-ignore
      config.chart.svg = d3.select(svg);
      window.addEventListener("sankey-chart", () => loadSankeyChart(config));
  }
  function loadSankeyChart(config) {
      // @ts-ignore
      const svg = config.chart.svg;
      svg.selectAll("g").remove();
      config.chart.sankey = sankeyModel()
          .alignHorizontal()
          .nodeWidth(30)
          .nodePadding(config.filters.density)
          .size([config.chart.width, config.chart.height]);
      config.chart.sankey.nodes(config.db.sankey.nodes)
          .links(config.db.sankey.links)
          .layout(32);
      const linkCollection = svg.append("g")
          .selectAll(".link")
          .data(config.db.sankey.links)
          .enter()
          .append("g")
          .attr("class", "link")
          .sort(function (j, i) { return i.dy - j.dy; });
      const path = config.chart.sankey.reversibleLink();
      let h, f, e;
      if (path) {
          h = linkCollection.append("path") //path0
              .attr("d", path(0));
          f = linkCollection.append("path") //path1
              .attr("d", path(1));
          e = linkCollection.append("path") //path2
              .attr("d", path(2));
      }
      linkCollection.attr("fill", function (i) {
          return i.fill ? i.fill : i.source.fill;
      })
          .attr("opacity", config.filters.lowopacity)
          .on("click", function (d) {
          // @ts-ignore
          d3.event.stopPropagation();
          // @ts-ignore
          displayLinkBreakdown(this, d, config);
      });
      const nodeCollection = svg.append("g")
          .selectAll(".node")
          .data(config.db.sankey.nodes)
          .enter()
          .append("g")
          .attr("class", "node")
          .attr("transform", function (i) { return "translate(" + i.x + "," + i.y + ")"; })
          // @ts-ignore
          .call(d3.behavior.drag()
          .origin(function (i) { return i; })
          .on("dragstart", function (d) {
          // @ts-ignore
          this.parentNode.appendChild(this);
          // @ts-ignore
          d.initialPosition = d3.select(this).attr("transform");
      })
          .on("drag", dragged)
          .on("dragend", function (d) {
          // @ts-ignore
          if (d.initialPosition === d3.select(this).attr("transform")) {
              displayNodeBreakdown(d, config);
          }
      }));
      nodeCollection.append("rect")
          .attr("height", function (i) { return i.dy; })
          .attr("width", config.chart.sankey.nodeWidth())
          .style("fill", function (i) { return i.color = i.fill; })
          // @ts-ignore
          .style("stroke", function (i) { return d3.rgb(i.color).darker(2); });
      nodeCollection.append("text")
          .classed("node-label-outer", true)
          .attr("x", -6)
          .attr("y", function (i) { return i.dy / 2; })
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .attr("transform", null)
          .text(function (i) { return i.name; })
          .filter(function (i) { return i.x < config.chart.width / 2; })
          .attr("x", 6 + config.chart.sankey.nodeWidth())
          .attr("text-anchor", "start");
      nodeCollection.append("text")
          .classed("node-label", true)
          .attr("x", function (i) { return -i.dy / 2; })
          .attr("y", function (i) { return i.dx / 2 + 6; })
          .attr("transform", "rotate(270)")
          .text((i) => {
          if (i.dy > 50) {
              return formatNumber(i.value);
          }
      });
      window.dispatchEvent(new CustomEvent("show-legend"));
      function dragged(i) {
          if (config.chart.moveY) {
              if (config.chart.moveX) {
                  // @ts-ignore
                  d3.select(this)
                      // @ts-ignore
                      .attr("transform", "translate(" + (i.x = Math.max(0, Math.min(config.chart.width - i.dx, d3.event.x))) + "," + (i.y = Math.max(0, Math.min(config.chart.height - i.dy, d3.event.y))) + ")");
              }
              else {
                  // @ts-ignore
                  d3.select(this)
                      // @ts-ignore
                      .attr("transform", "translate(" + i.x + "," + (i.y = Math.max(0, Math.min(config.chart.height - i.dy, d3.event.y))) + ")");
              }
          }
          else {
              if (config.chart.moveX) {
                  // @ts-ignore
                  d3.select(this)
                      // @ts-ignore
                      .attr("transform", "translate(" + (i.x = Math.max(0, Math.min(config.chart.width - i.dx, d3.event.x))) + "," + i.y + ")");
              }
          }
          config.chart.sankey.relayout();
          const path = config.chart.sankey.reversibleLink();
          if (path) {
              f.attr("d", path(1));
              h.attr("d", path(0));
              e.attr("d", path(2));
          }
      }
  }
  /**
   * @param a
   * @param d
   * @param config
   */
  function displayLinkBreakdown(a, d, config) {
      if (config.chart.highlightedItem) {
          config.chart.highlightedItem.style('opacity', config.filters.lowopacity);
      }
      // @ts-ignore
      d3.select(".breakdown-secondary")
          .style("display", "none");
      // @ts-ignore
      config.chart.highlightedItem = d3.select(a);
      config.chart.highlightedItem.style('opacity', config.filters.highopacity);
      let tiptext = "<tr><td style='font-weight:bold;'>" + d.source.name;
      tiptext += "</td><td style='font-size:24px;'>→</td><td style='font-weight:bold;'>";
      tiptext += d.target.name + "</td></tr><tr><td>Calls</td><td>";
      tiptext += formatNumber(d.value) + "</td><td> Calls</td></tr>";
      // @ts-ignore
      const container = d3.select(".breakdown-charts");
      let h = parseInt(container.style("height"));
      let w = parseInt(container.style("width"));
      h = w = Math.max(h, w);
      const containerPrimary = container.select(".breakdown-primary");
      const svgPrimary = containerPrimary.select("svg");
      const containerSecondary = container.select(".breakdown-secondary");
      const svgSecondary = containerSecondary.select("svg");
      svgPrimary.style("height", h + "px").style("width", w + "px");
      svgSecondary.style("height", h + "px").style("width", w + "px");
      // @ts-ignore
      setTimeout(function () {
          containerPrimary.style("display", null);
          svgPrimary.style("display", null);
          containerSecondary.style("display", "none");
          svgSecondary.style("display", "none");
          // @ts-ignore
          updatepie(d.supply, containerPrimary, d.source.name, d.target.name, d.value);
      }, 500);
      const tipData = {
          chart: true,
          // @ts-ignore
          mouseX: d3.event.sourceEvent ? d3.event.sourceEvent.pageX : d3.event.pageX,
          text: tiptext
      };
      window.dispatchEvent(new CustomEvent("show-breakdown", { detail: tipData }));
      window.dispatchEvent(new CustomEvent("hide-menu"));
  }
  /**
   * @param d
   * @param config
   */
  function displayNodeBreakdown(d, config) {
      if (config.chart.highlightedItem) {
          config.chart.highlightedItem.style('opacity', config.filters.lowopacity);
      }
      config.chart.highlightedItem = config.chart.svg.selectAll(".link")
          // @ts-ignore
          .filter(function (l) { return l.source === d || l.target === d; });
      config.chart.highlightedItem.transition()
          .style('opacity', config.filters.highopacity);
      const nodesource = [], nodetarget = [];
      config.chart.svg.selectAll(".link")
          .filter((l) => l.target === d)[0]
          .forEach((l) => nodesource.push({ label: l.__data__.source.name, value: l.__data__.value }));
      config.chart.svg.selectAll(".link")
          .filter((l) => l.source === d)[0]
          .forEach((l) => nodetarget.push({ label: l.__data__.target.name, value: l.__data__.value }));
      if (nodesource.length === 0) {
          nodesource.push({ label: "None", value: 0 });
      }
      if (nodetarget.length === 0) {
          nodetarget.push({ label: "None", value: 0 });
      }
      let tiptext = "<tr><td colspan=2 style='font-weight:bold;'>" + d.name;
      tiptext += "</td></tr><tr><td>Incoming</td><td>";
      // @ts-ignore
      tiptext += formatNumber(d3.sum(nodesource, function (d) { return d.value; }));
      tiptext += " Calls</td></tr><tr><td>Outgoing</td><td>";
      // @ts-ignore
      tiptext += formatNumber(d3.sum(nodetarget, function (d) { return d.value; })) + " Calls</td></tr>";
      // @ts-ignore
      let outin = formatNumber(d3.sum(nodetarget, function (d) { return d.value; }) / d3.sum(nodesource, function (d) { return d.value; }));
      // @ts-ignore
      if ((d3.sum(nodesource, function (d) { return d.value; }) === 0) ||
          // @ts-ignore
          (d3.sum(nodetarget, function (d) { return d.value; }) === 0)) {
          outin = "--";
      }
      tiptext += "<tr><td>OUT / IN</td><td>" + outin + "</td></tr>";
      // @ts-ignore
      const container = d3.select(".breakdown-charts");
      let h = parseInt(container.style("height"));
      let w = parseInt(container.style("width"));
      h = w = Math.max(h, w);
      const containerPrimary = container.select(".breakdown-primary");
      const svgPrimary = containerPrimary.select("svg");
      const containerSecondary = container.select(".breakdown-secondary");
      const svgSecondary = containerSecondary.select("svg");
      if (nodesource[0].label !== "None" && nodetarget[0].label !== "None") {
          svgPrimary.style("height", (h / 2) + "px").style("width", w + "px");
          svgSecondary.style("height", (h / 2) + "px").style("width", w + "px");
      }
      else {
          svgPrimary.style("height", h + "px").style("width", w + "px");
          svgSecondary.style("height", h + "px").style("width", w + "px");
      }
      // @ts-ignore
      setTimeout(function () {
          // @ts-ignore
          if (nodesource[0].label !== "None") {
              containerPrimary.style("display", null);
              svgPrimary.style("display", null);
              // @ts-ignore
              updatepie(nodesource, containerPrimary, "Incoming", d.name, d3.sum(nodesource, function (d) { return d.value; }));
          }
          else {
              containerPrimary.style("display", "none");
              svgPrimary.style("display", "none");
          }
          // @ts-ignore
          if (nodetarget[0].label !== "None") {
              containerSecondary.style("display", null);
              svgSecondary.style("display", null);
              // @ts-ignore
              updatepie(nodetarget, containerSecondary, d.name, "Outgoing", d3.sum(nodetarget, function (d) { return d.value; }));
          }
          else {
              containerSecondary.style("display", "none");
              svgSecondary.style("display", "none");
          }
      }, 500);
      const tipData = {
          chart: true,
          // @ts-ignore
          mouseX: d3.event.sourceEvent ? d3.event.sourceEvent.pageX : d3.event.pageX,
          text: tiptext
      };
      window.dispatchEvent(new CustomEvent("show-breakdown", { detail: tipData }));
      window.dispatchEvent(new CustomEvent("hide-menu"));
  }
  /**
   * @param data
   * @param placeholder
   * @param placelabel1
   * @param placelabel2
   * @param pievalue
   */
  function updatepie(data, placeholder, placelabel1, placelabel2, pievalue) {
      // @ts-ignore
      nv.addGraph(function () {
          // @ts-ignore
          const chart = nv.models.pieChart()
              // @ts-ignore
              .x(function (d) { return d.label; })
              // @ts-ignore
              .y(function (d) { return d.value; })
              .showLabels(true) //Display pie labels
              .labelThreshold(0.05) //Configure the minimum slice size for labels to show up
              .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
              .donut(true) //Turn on Donut mode.
              .donutRatio(0.35); //Configure how big you want the donut hole size to be.
          const svg = placeholder.select("svg");
          svg.selectAll(".centerpielabel").remove();
          const cx = parseInt(placeholder.style("width")) / 2;
          const cy = parseInt(placeholder.style("height")) / 2 + 20;
          svg.datum(data).transition().duration(350).call(chart);
          svg.append("text")
              .transition().duration(400)
              .attr("x", cx)
              .attr("y", cy - 10)
              .attr("class", "centerpielabel")
              .text(placelabel1);
          svg.append("text")
              .transition().duration(400)
              .attr("x", cx)
              .attr("y", cy + 4)
              .attr("class", "centerpielabel")
              .text(placelabel2);
          const pietext = formatNumber(pievalue);
          svg.append("text")
              .transition().duration(400)
              .attr("x", cx)
              .attr("y", cy + 18)
              .attr("class", "centerpielabel")
              .text(pietext);
          return chart;
      });
  }

  /**
   * @param config
   */
  function initCharts(config) {
      initBreakdown(config);
      initDataQualityChart(config);
      initSankeyChart(config);
  }

  /**
   * Renders title bar components
   */
  function initTitleBar() {
      const titlebar = document.getElementById("titlebar-right");
      const org = document.createElement("span");
      org.id = "org-in-title";
      const day = document.createElement("span");
      day.id = "day-in-title";
      const call = document.createElement("span");
      call.id = "call-in-title";
      if (titlebar) {
          const parent = document.createElement("span");
          parent.classList.add("pagetitle", "th-fg-color");
          titlebar.appendChild(parent);
          parent.appendChild(org);
          parent.appendChild(sep());
          parent.appendChild(day);
          parent.appendChild(sep());
          parent.appendChild(call);
      }
      window.addEventListener("org-selected", (e) => org.textContent = e.detail);
      window.addEventListener("day-selected", (e) => day.textContent = e.detail);
      window.addEventListener("call-selected", (e) => call.textContent = e.detail);
      function sep() {
          const sep = document.createElement("span");
          sep.style.marginLeft = "5px";
          sep.style.marginRight = "5px";
          sep.textContent = "|";
          return sep;
      }
  }

  /**
   * Updates the STP user control
   * @param config
   */
  function initOrganisationList(config) {
      const org = document.getElementById("Organisation");
      org.innerHTML = "";
      for (let key in config.filters.organisations) {
          const option = document.createElement("option");
          option.textContent = config.filters.organisations[key];
          org.appendChild(option);
      }
      getQueryHash(config);
      if (config.querystring.organisation) {
          org.value = config.querystring.organisation;
      }
      org.addEventListener("change", () => __awaiter(this, void 0, void 0, function* () {
          window.dispatchEvent(new CustomEvent("org-selected", { detail: org.value }));
          config.db.file = org.options[org.selectedIndex].value + ".zip";
          yield fetchDataStore(config)
              .then(() => {
              config.db.file = config.db.file.replace(/\.zip$/, "m.json");
              return openDataFile(config);
          })
              .then(file => processDayFile(file, config));
      }));
      if (org) {
          org.dispatchEvent(new Event("change"));
      }
  }

  /**
   * @param config
   */
  function initEnvironment(config) {
      config.environment = window.location.hostname === "localhost" ? "DEVELOPMENT" : "PRODUCTION";
      if (config.environment === "DEVELOPMENT") {
          const dev = document.createElement("div");
          dev.classList.add("dev-mode");
          dev.textContent = config.environment;
          document.body.appendChild(dev);
      }
  }

  var prefix = "$";

  function Map() {}

  Map.prototype = map$1.prototype = {
    constructor: Map,
    has: function(key) {
      return (prefix + key) in this;
    },
    get: function(key) {
      return this[prefix + key];
    },
    set: function(key, value) {
      this[prefix + key] = value;
      return this;
    },
    remove: function(key) {
      var property = prefix + key;
      return property in this && delete this[property];
    },
    clear: function() {
      for (var property in this) if (property[0] === prefix) delete this[property];
    },
    keys: function() {
      var keys = [];
      for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
      return keys;
    },
    values: function() {
      var values = [];
      for (var property in this) if (property[0] === prefix) values.push(this[property]);
      return values;
    },
    entries: function() {
      var entries = [];
      for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
      return entries;
    },
    size: function() {
      var size = 0;
      for (var property in this) if (property[0] === prefix) ++size;
      return size;
    },
    empty: function() {
      for (var property in this) if (property[0] === prefix) return false;
      return true;
    },
    each: function(f) {
      for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
    }
  };

  function map$1(object, f) {
    var map = new Map;

    // Copy constructor.
    if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

    // Index array by numeric index or specified key function.
    else if (Array.isArray(object)) {
      var i = -1,
          n = object.length,
          o;

      if (f == null) while (++i < n) map.set(i, object[i]);
      else while (++i < n) map.set(f(o = object[i], i, object), o);
    }

    // Convert object to map.
    else if (object) for (var key in object) map.set(key, object[key]);

    return map;
  }

  function Set() {}

  var proto = map$1.prototype;

  Set.prototype = set.prototype = {
    constructor: Set,
    has: proto.has,
    add: function(value) {
      value += "";
      this[prefix + value] = value;
      return this;
    },
    remove: proto.remove,
    clear: proto.clear,
    values: proto.keys,
    size: proto.size,
    empty: proto.empty,
    each: proto.each
  };

  function set(object, f) {
    var set = new Set;

    // Copy constructor.
    if (object instanceof Set) object.each(function(value) { set.add(value); });

    // Otherwise, assume it’s an array.
    else if (object) {
      var i = -1, n = object.length;
      if (f == null) while (++i < n) set.add(object[i]);
      else while (++i < n) set.add(f(object[i], i, object));
    }

    return set;
  }

  var noop = {value: function() {}};

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {type: t, name: name};
    });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._,
          T = parseTypenames(typename + "", _),
          t,
          i = -1,
          n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
      }

      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };

  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set$1(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({name: name, value: callback});
    return type;
  }

  function request(url, callback) {
    var request,
        event = dispatch("beforesend", "progress", "load", "error"),
        mimeType,
        headers = map$1(),
        xhr = new XMLHttpRequest,
        user = null,
        password = null,
        response,
        responseType,
        timeout = 0;

    // If IE does not support CORS, use XDomainRequest.
    if (typeof XDomainRequest !== "undefined"
        && !("withCredentials" in xhr)
        && /^(http(s)?:)?\/\//.test(url)) xhr = new XDomainRequest;

    "onload" in xhr
        ? xhr.onload = xhr.onerror = xhr.ontimeout = respond
        : xhr.onreadystatechange = function(o) { xhr.readyState > 3 && respond(o); };

    function respond(o) {
      var status = xhr.status, result;
      if (!status && hasResponse(xhr)
          || status >= 200 && status < 300
          || status === 304) {
        if (response) {
          try {
            result = response.call(request, xhr);
          } catch (e) {
            event.call("error", request, e);
            return;
          }
        } else {
          result = xhr;
        }
        event.call("load", request, result);
      } else {
        event.call("error", request, o);
      }
    }

    xhr.onprogress = function(e) {
      event.call("progress", request, e);
    };

    request = {
      header: function(name, value) {
        name = (name + "").toLowerCase();
        if (arguments.length < 2) return headers.get(name);
        if (value == null) headers.remove(name);
        else headers.set(name, value + "");
        return request;
      },

      // If mimeType is non-null and no Accept header is set, a default is used.
      mimeType: function(value) {
        if (!arguments.length) return mimeType;
        mimeType = value == null ? null : value + "";
        return request;
      },

      // Specifies what type the response value should take;
      // for instance, arraybuffer, blob, document, or text.
      responseType: function(value) {
        if (!arguments.length) return responseType;
        responseType = value;
        return request;
      },

      timeout: function(value) {
        if (!arguments.length) return timeout;
        timeout = +value;
        return request;
      },

      user: function(value) {
        return arguments.length < 1 ? user : (user = value == null ? null : value + "", request);
      },

      password: function(value) {
        return arguments.length < 1 ? password : (password = value == null ? null : value + "", request);
      },

      // Specify how to convert the response content to a specific type;
      // changes the callback value on "load" events.
      response: function(value) {
        response = value;
        return request;
      },

      // Alias for send("GET", …).
      get: function(data, callback) {
        return request.send("GET", data, callback);
      },

      // Alias for send("POST", …).
      post: function(data, callback) {
        return request.send("POST", data, callback);
      },

      // If callback is non-null, it will be used for error and load events.
      send: function(method, data, callback) {
        xhr.open(method, url, true, user, password);
        if (mimeType != null && !headers.has("accept")) headers.set("accept", mimeType + ",*/*");
        if (xhr.setRequestHeader) headers.each(function(value, name) { xhr.setRequestHeader(name, value); });
        if (mimeType != null && xhr.overrideMimeType) xhr.overrideMimeType(mimeType);
        if (responseType != null) xhr.responseType = responseType;
        if (timeout > 0) xhr.timeout = timeout;
        if (callback == null && typeof data === "function") callback = data, data = null;
        if (callback != null && callback.length === 1) callback = fixCallback(callback);
        if (callback != null) request.on("error", callback).on("load", function(xhr) { callback(null, xhr); });
        event.call("beforesend", request, xhr);
        xhr.send(data == null ? null : data);
        return request;
      },

      abort: function() {
        xhr.abort();
        return request;
      },

      on: function() {
        var value = event.on.apply(event, arguments);
        return value === event ? request : value;
      }
    };

    if (callback != null) {
      if (typeof callback !== "function") throw new Error("invalid callback: " + callback);
      return request.get(callback);
    }

    return request;
  }

  function fixCallback(callback) {
    return function(error, xhr) {
      callback(error == null ? xhr : null);
    };
  }

  function hasResponse(xhr) {
    var type = xhr.responseType;
    return type && type !== "text"
        ? xhr.response // null on error
        : xhr.responseText; // "" on error
  }

  function type(defaultMimeType, response) {
    return function(url, callback) {
      var r = request(url).mimeType(defaultMimeType).response(response);
      if (callback != null) {
        if (typeof callback !== "function") throw new Error("invalid callback: " + callback);
        return r.get(callback);
      }
      return r;
    };
  }

  var json = type("application/json", function(xhr) {
    return JSON.parse(xhr.responseText);
  });

  function start() {
      const datapath = window.location.hostname === "localhost"
          ? "./json/"
          : "https://raw.githubusercontent.com/NELCSU/ED/master/docs/json/";
      json(datapath + "config.json", function (d) {
          const config = d;
          config.db = { path: datapath };
          initEnvironment(config);
          initTitleBar();
          initMenu(config);
          initCharts(config);
          initOrganisationList(config);
          updateSplash();
          document.body.addEventListener("click", function (e) {
              e.stopImmediatePropagation();
              window.dispatchEvent(new CustomEvent("hide-breakdown", { detail: config }));
              window.dispatchEvent(new CustomEvent("hide-menu"));
          });
      });
  }

  exports.start = start;

  return exports;

}({}));
