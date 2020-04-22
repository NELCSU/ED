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
          myhash += "day$" + config.filters.days[parseInt(day.value)] + "+";
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
          config.filters.calls.forEach((call) => {
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
      config.filters.calls.forEach((call) => {
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
          config.filters.density = +e.target.value;
          window.dispatchEvent(new CustomEvent("filter-action"));
      });
  }

  /**
   * @param config
   */
  function initOpacitySlider(config) {
      const opacity = document.getElementById("Opacity");
      opacity.addEventListener("change", (e) => {
          config.filters.opacity.low = +e.target.value;
          window.dispatchEvent(new CustomEvent("filter-action"));
      });
  }

  var xhtml = "http://www.w3.org/1999/xhtml";

  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  function namespace(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
  }

  function creatorInherit(name) {
    return function() {
      var document = this.ownerDocument,
          uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml
          ? document.createElement(name)
          : document.createElementNS(uri, name);
    };
  }

  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }

  function creator(name) {
    var fullname = namespace(name);
    return (fullname.local
        ? creatorFixed
        : creatorInherit)(fullname);
  }

  function none() {}

  function selector(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  function selection_select(select) {
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function empty() {
    return [];
  }

  function selectorAll(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  function selection_selectAll(select) {
    if (typeof select !== "function") select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }

    return new Selection(subgroups, parents);
  }

  function matcher(selector) {
    return function() {
      return this.matches(selector);
    };
  }

  function selection_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function sparse(update) {
    return new Array(update.length);
  }

  function selection_enter() {
    return new Selection(this._enter || this._groups.map(sparse), this._parents);
  }

  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }

  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
    insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
    querySelector: function(selector) { return this._parent.querySelector(selector); },
    querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
  };

  function constant(x) {
    return function() {
      return x;
    };
  }

  var keyPrefix = "$"; // Protect against keys like “__proto__”.

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
        node,
        groupLength = group.length,
        dataLength = data.length;

    // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Put any non-null nodes that don’t fit into exit.
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }

  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
        node,
        nodeByKeyValue = {},
        groupLength = group.length,
        dataLength = data.length,
        keyValues = new Array(groupLength),
        keyValue;

    // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
        if (keyValue in nodeByKeyValue) {
          exit[i] = node;
        } else {
          nodeByKeyValue[keyValue] = node;
        }
      }
    }

    // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.
    for (i = 0; i < dataLength; ++i) {
      keyValue = keyPrefix + key.call(parent, data[i], i, data);
      if (node = nodeByKeyValue[keyValue]) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue[keyValue] = null;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Add any remaining nodes that were not bound to data to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
        exit[i] = node;
      }
    }
  }

  function selection_data(value, key) {
    if (!value) {
      data = new Array(this.size()), j = -1;
      this.each(function(d) { data[++j] = d; });
      return data;
    }

    var bind = key ? bindKey : bindIndex,
        parents = this._parents,
        groups = this._groups;

    if (typeof value !== "function") value = constant(value);

    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
          group = groups[j],
          groupLength = group.length,
          data = value.call(parent, parent && parent.__data__, j, parents),
          dataLength = data.length,
          enterGroup = enter[j] = new Array(dataLength),
          updateGroup = update[j] = new Array(dataLength),
          exitGroup = exit[j] = new Array(groupLength);

      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null;
        }
      }
    }

    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  function selection_exit() {
    return new Selection(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_join(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
    if (onupdate != null) update = onupdate(update);
    if (onexit == null) exit.remove(); else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  function selection_merge(selection) {

    for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Selection(merges, this._parents);
  }

  function selection_order() {

    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }

    return this;
  }

  function selection_sort(compare) {
    if (!compare) compare = ascending;

    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }

    return new Selection(sortgroups, this._parents).order();
  }

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes() {
    var nodes = new Array(this.size()), i = -1;
    this.each(function() { nodes[++i] = this; });
    return nodes;
  }

  function selection_node() {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }

    return null;
  }

  function selection_size() {
    var size = 0;
    this.each(function() { ++size; });
    return size;
  }

  function selection_empty() {
    return !this.node();
  }

  function selection_each(callback) {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }

    return this;
  }

  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }

  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }

  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }

  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }

  function selection_attr(name, value) {
    var fullname = namespace(name);

    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local
          ? node.getAttributeNS(fullname.space, fullname.local)
          : node.getAttribute(fullname);
    }

    return this.each((value == null
        ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
        ? (fullname.local ? attrFunctionNS : attrFunction)
        : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
  }

  function defaultView(node) {
    return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
        || (node.document && node) // node is a Window
        || node.defaultView; // node is a Document
  }

  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }

  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }

  function selection_style(name, value, priority) {
    return arguments.length > 1
        ? this.each((value == null
              ? styleRemove : typeof value === "function"
              ? styleFunction
              : styleConstant)(name, value, priority == null ? "" : priority))
        : styleValue(this.node(), name);
  }

  function styleValue(node, name) {
    return node.style.getPropertyValue(name)
        || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }

  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }

  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }

  function selection_property(name, value) {
    return arguments.length > 1
        ? this.each((value == null
            ? propertyRemove : typeof value === "function"
            ? propertyFunction
            : propertyConstant)(name, value))
        : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }

  function classList(node) {
    return node.classList || new ClassList(node);
  }

  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }

  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };

  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }

  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }

  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }

  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }

  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }

  function selection_classed(name, value) {
    var names = classArray(name + "");

    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }

    return this.each((typeof value === "function"
        ? classedFunction : value
        ? classedTrue
        : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }

  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }

  function selection_text(value) {
    return arguments.length
        ? this.each(value == null
            ? textRemove : (typeof value === "function"
            ? textFunction
            : textConstant)(value))
        : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }

  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }

  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }

  function selection_html(value) {
    return arguments.length
        ? this.each(value == null
            ? htmlRemove : (typeof value === "function"
            ? htmlFunction
            : htmlConstant)(value))
        : this.node().innerHTML;
  }

  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }

  function selection_raise() {
    return this.each(raise);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }

  function selection_lower() {
    return this.each(lower);
  }

  function selection_append(name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function() {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }

  function selection_insert(name, before) {
    var create = typeof name === "function" ? name : creator(name),
        select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function() {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }

  function selection_remove() {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_clone(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum(value) {
    return arguments.length
        ? this.property("__data__", value)
        : this.node().__data__;
  }

  var filterEvents = {};

  var event = null;

  if (typeof document !== "undefined") {
    var element = document.documentElement;
    if (!("onmouseenter" in element)) {
      filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
    }
  }

  function filterContextListener(listener, index, group) {
    listener = contextListener(listener, index, group);
    return function(event) {
      var related = event.relatedTarget;
      if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
        listener.call(this, event);
      }
    };
  }

  function contextListener(listener, index, group) {
    return function(event1) {
      var event0 = event; // Events can be reentrant (e.g., focus).
      event = event1;
      try {
        listener.call(this, this.__data__, index, group);
      } finally {
        event = event0;
      }
    };
  }

  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return {type: t, name: name};
    });
  }

  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.capture);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }

  function onAdd(typename, value, capture) {
    var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
    return function(d, i, group) {
      var on = this.__on, o, listener = wrap(value, i, group);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.capture);
          this.addEventListener(o.type, o.listener = listener, o.capture = capture);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, capture);
      o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }

  function selection_on(typename, value, capture) {
    var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }

    on = value ? onAdd : onRemove;
    if (capture == null) capture = false;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
    return this;
  }

  function customEvent(event1, listener, that, args) {
    var event0 = event;
    event1.sourceEvent = event;
    event = event1;
    try {
      return listener.apply(that, args);
    } finally {
      event = event0;
    }
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
        event = window.CustomEvent;

    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type, false, false);
    }

    node.dispatchEvent(event);
  }

  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }

  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }

  function selection_dispatch(type, params) {
    return this.each((typeof params === "function"
        ? dispatchFunction
        : dispatchConstant)(type, params));
  }

  var root = [null];

  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }

  function selection() {
    return new Selection([[document.documentElement]], root);
  }

  Selection.prototype = selection.prototype = {
    constructor: Selection,
    select: selection_select,
    selectAll: selection_selectAll,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    join: selection_join,
    merge: selection_merge,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch
  };

  function select(selector) {
    return typeof selector === "string"
        ? new Selection([[document.querySelector(selector)]], [document.documentElement])
        : new Selection([[selector]], root);
  }

  function sourceEvent() {
    var current = event, source;
    while (source = current.sourceEvent) current = source;
    return current;
  }

  function point(node, event) {
    var svg = node.ownerSVGElement || node;

    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }

    var rect = node.getBoundingClientRect();
    return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
  }

  function mouse(node) {
    var event = sourceEvent();
    if (event.changedTouches) event = event.changedTouches[0];
    return point(node, event);
  }

  function touch(node, touches, identifier) {
    if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;

    for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
      if ((touch = touches[i]).identifier === identifier) {
        return point(node, touch);
      }
    }

    return null;
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

  function parseTypenames$1(typenames, types) {
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
          T = parseTypenames$1(typename + "", _),
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
        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
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

  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({name: name, value: callback});
    return type;
  }

  function nopropagation() {
    event.stopImmediatePropagation();
  }

  function noevent() {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function nodrag(view) {
    var root = view.document.documentElement,
        selection = select(view).on("dragstart.drag", noevent, true);
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", noevent, true);
    } else {
      root.__noselect = root.style.MozUserSelect;
      root.style.MozUserSelect = "none";
    }
  }

  function yesdrag(view, noclick) {
    var root = view.document.documentElement,
        selection = select(view).on("dragstart.drag", null);
    if (noclick) {
      selection.on("click.drag", noevent, true);
      setTimeout(function() { selection.on("click.drag", null); }, 0);
    }
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", null);
    } else {
      root.style.MozUserSelect = root.__noselect;
      delete root.__noselect;
    }
  }

  function constant$1(x) {
    return function() {
      return x;
    };
  }

  function DragEvent(target, type, subject, id, active, x, y, dx, dy, dispatch) {
    this.target = target;
    this.type = type;
    this.subject = subject;
    this.identifier = id;
    this.active = active;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this._ = dispatch;
  }

  DragEvent.prototype.on = function() {
    var value = this._.on.apply(this._, arguments);
    return value === this._ ? this : value;
  };

  // Ignore right-click, since that should open the context menu.
  function defaultFilter() {
    return !event.ctrlKey && !event.button;
  }

  function defaultContainer() {
    return this.parentNode;
  }

  function defaultSubject(d) {
    return d == null ? {x: event.x, y: event.y} : d;
  }

  function defaultTouchable() {
    return navigator.maxTouchPoints || ("ontouchstart" in this);
  }

  function drag() {
    var filter = defaultFilter,
        container = defaultContainer,
        subject = defaultSubject,
        touchable = defaultTouchable,
        gestures = {},
        listeners = dispatch("start", "drag", "end"),
        active = 0,
        mousedownx,
        mousedowny,
        mousemoving,
        touchending,
        clickDistance2 = 0;

    function drag(selection) {
      selection
          .on("mousedown.drag", mousedowned)
        .filter(touchable)
          .on("touchstart.drag", touchstarted)
          .on("touchmove.drag", touchmoved)
          .on("touchend.drag touchcancel.drag", touchended)
          .style("touch-action", "none")
          .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }

    function mousedowned() {
      if (touchending || !filter.apply(this, arguments)) return;
      var gesture = beforestart("mouse", container.apply(this, arguments), mouse, this, arguments);
      if (!gesture) return;
      select(event.view).on("mousemove.drag", mousemoved, true).on("mouseup.drag", mouseupped, true);
      nodrag(event.view);
      nopropagation();
      mousemoving = false;
      mousedownx = event.clientX;
      mousedowny = event.clientY;
      gesture("start");
    }

    function mousemoved() {
      noevent();
      if (!mousemoving) {
        var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
        mousemoving = dx * dx + dy * dy > clickDistance2;
      }
      gestures.mouse("drag");
    }

    function mouseupped() {
      select(event.view).on("mousemove.drag mouseup.drag", null);
      yesdrag(event.view, mousemoving);
      noevent();
      gestures.mouse("end");
    }

    function touchstarted() {
      if (!filter.apply(this, arguments)) return;
      var touches = event.changedTouches,
          c = container.apply(this, arguments),
          n = touches.length, i, gesture;

      for (i = 0; i < n; ++i) {
        if (gesture = beforestart(touches[i].identifier, c, touch, this, arguments)) {
          nopropagation();
          gesture("start");
        }
      }
    }

    function touchmoved() {
      var touches = event.changedTouches,
          n = touches.length, i, gesture;

      for (i = 0; i < n; ++i) {
        if (gesture = gestures[touches[i].identifier]) {
          noevent();
          gesture("drag");
        }
      }
    }

    function touchended() {
      var touches = event.changedTouches,
          n = touches.length, i, gesture;

      if (touchending) clearTimeout(touchending);
      touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
      for (i = 0; i < n; ++i) {
        if (gesture = gestures[touches[i].identifier]) {
          nopropagation();
          gesture("end");
        }
      }
    }

    function beforestart(id, container, point, that, args) {
      var p = point(container, id), s, dx, dy,
          sublisteners = listeners.copy();

      if (!customEvent(new DragEvent(drag, "beforestart", s, id, active, p[0], p[1], 0, 0, sublisteners), function() {
        if ((event.subject = s = subject.apply(that, args)) == null) return false;
        dx = s.x - p[0] || 0;
        dy = s.y - p[1] || 0;
        return true;
      })) return;

      return function gesture(type) {
        var p0 = p, n;
        switch (type) {
          case "start": gestures[id] = gesture, n = active++; break;
          case "end": delete gestures[id], --active; // nobreak
          case "drag": p = point(container, id), n = active; break;
        }
        customEvent(new DragEvent(drag, type, s, id, n, p[0] + dx, p[1] + dy, p[0] - p0[0], p[1] - p0[1], sublisteners), sublisteners.apply, sublisteners, [type, that, args]);
      };
    }

    drag.filter = function(_) {
      return arguments.length ? (filter = typeof _ === "function" ? _ : constant$1(!!_), drag) : filter;
    };

    drag.container = function(_) {
      return arguments.length ? (container = typeof _ === "function" ? _ : constant$1(_), drag) : container;
    };

    drag.subject = function(_) {
      return arguments.length ? (subject = typeof _ === "function" ? _ : constant$1(_), drag) : subject;
    };

    drag.touchable = function(_) {
      return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$1(!!_), drag) : touchable;
    };

    drag.on = function() {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? drag : value;
    };

    drag.clickDistance = function(_) {
      return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
    };

    return drag;
  }

  var frame = 0, // is an animation frame pending?
      timeout = 0, // is a timeout pending?
      interval = 0, // are any timers active?
      pokeDelay = 1000, // how frequently we check for clock skew
      taskHead,
      taskTail,
      clockLast = 0,
      clockNow = 0,
      clockSkew = 0,
      clock = typeof performance === "object" && performance.now ? performance : Date,
      setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }

  function clearNow() {
    clockNow = 0;
  }

  function Timer() {
    this._call =
    this._time =
    this._next = null;
  }

  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };

  function timer(callback, delay, time) {
    var t = new Timer;
    t.restart(callback, delay, time);
    return t;
  }

  function timerFlush() {
    now(); // Get the current time, if not already set.
    ++frame; // Pretend we’ve set an alarm, if we haven’t already.
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
      t = t._next;
    }
    --frame;
  }

  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }

  function poke() {
    var now = clock.now(), delay = now - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
  }

  function nap() {
    var t0, t1 = taskHead, t2, time = Infinity;
    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time);
  }

  function sleep(time) {
    if (frame) return; // Soonest alarm already set, or will be.
    if (timeout) timeout = clearTimeout(timeout);
    var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
    if (delay > 24) {
      if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  function timeout$1(callback, delay, time) {
    var t = new Timer;
    delay = delay == null ? 0 : +delay;
    t.restart(function(elapsed) {
      t.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t;
  }

  var emptyOn = dispatch("start", "end", "cancel", "interrupt");
  var emptyTween = [];

  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;

  function schedule(node, name, id, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};
    else if (id in schedules) return;
    create(node, id, {
      name: name,
      index: index, // For context during callback.
      group: group, // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }

  function init(node, id) {
    var schedule = get$1(node, id);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }

  function set$1(node, id) {
    var schedule = get$1(node, id);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }

  function get$1(node, id) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
    return schedule;
  }

  function create(node, id, self) {
    var schedules = node.__transition,
        tween;

    // Initialize the self timer when the transition is created.
    // Note the actual delay is not known until the first callback!
    schedules[id] = self;
    self.timer = timer(schedule, 0, self.time);

    function schedule(elapsed) {
      self.state = SCHEDULED;
      self.timer.restart(start, self.delay, self.time);

      // If the elapsed delay is less than our first sleep, start immediately.
      if (self.delay <= elapsed) start(elapsed - self.delay);
    }

    function start(elapsed) {
      var i, j, n, o;

      // If the state is not SCHEDULED, then we previously errored on start.
      if (self.state !== SCHEDULED) return stop();

      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self.name) continue;

        // While this element already has a starting transition during this frame,
        // defer starting an interrupting transition until that transition has a
        // chance to tick (and possibly end); see d3/d3-transition#54!
        if (o.state === STARTED) return timeout$1(start);

        // Interrupt the active transition, if any.
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }

        // Cancel any pre-empted transitions.
        else if (+i < id) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }

      // Defer the first tick to end of the current frame; see d3/d3#1576.
      // Note the transition may be canceled after start and before the first tick!
      // Note this must be scheduled before the start event; see d3/d3-transition#16!
      // Assuming this is successful, subsequent callbacks go straight to tick.
      timeout$1(function() {
        if (self.state === STARTED) {
          self.state = RUNNING;
          self.timer.restart(tick, self.delay, self.time);
          tick(elapsed);
        }
      });

      // Dispatch the start event.
      // Note this must be done before the tween are initialized.
      self.state = STARTING;
      self.on.call("start", node, node.__data__, self.index, self.group);
      if (self.state !== STARTING) return; // interrupted
      self.state = STARTED;

      // Initialize the tween, deleting null tween.
      tween = new Array(n = self.tween.length);
      for (i = 0, j = -1; i < n; ++i) {
        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }

    function tick(elapsed) {
      var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
          i = -1,
          n = tween.length;

      while (++i < n) {
        tween[i].call(node, t);
      }

      // Dispatch the end event.
      if (self.state === ENDING) {
        self.on.call("end", node, node.__data__, self.index, self.group);
        stop();
      }
    }

    function stop() {
      self.state = ENDED;
      self.timer.stop();
      delete schedules[id];
      for (var i in schedules) return; // eslint-disable-line no-unused-vars
      delete node.__transition;
    }
  }

  function interrupt(node, name) {
    var schedules = node.__transition,
        schedule,
        active,
        empty = true,
        i;

    if (!schedules) return;

    name = name == null ? null : name + "";

    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }

    if (empty) delete node.__transition;
  }

  function selection_interrupt(name) {
    return this.each(function() {
      interrupt(this, name);
    });
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}

  var darker = 0.7;
  var brighter = 1 / darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
      reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      reHex = /^#([0-9a-f]{3,8})$/,
      reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
      reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
      reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
      reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
      reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
      reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };

  define(Color, color, {
    copy: function(channels) {
      return Object.assign(new this.constructor, this, channels);
    },
    displayable: function() {
      return this.rgb().displayable();
    },
    hex: color_formatHex, // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });

  function color_formatHex() {
    return this.rgb().formatHex();
  }

  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }

  function color_formatRgb() {
    return this.rgb().formatRgb();
  }

  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
        : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
        : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
        : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
        : null) // invalid hex
        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
        : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
        : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb: function() {
      return this;
    },
    displayable: function() {
      return (-0.5 <= this.r && this.r < 255.5)
          && (-0.5 <= this.g && this.g < 255.5)
          && (-0.5 <= this.b && this.b < 255.5)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex, // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));

  function rgb_formatHex() {
    return "#" + hex(this.r) + hex(this.g) + hex(this.b);
  }

  function rgb_formatRgb() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(")
        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
        + (a === 1 ? ")" : ", " + a + ")");
  }

  function hex(value) {
    value = Math.max(0, Math.min(255, Math.round(value) || 0));
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl;
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    displayable: function() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
          && (0 <= this.l && this.l <= 1)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl: function() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "hsl(" : "hsla(")
          + (this.h || 0) + ", "
          + (this.s || 0) * 100 + "%, "
          + (this.l || 0) * 100 + "%"
          + (a === 1 ? ")" : ", " + a + ")");
    }
  }));

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60
        : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
        : m1) * 255;
  }

  function constant$2(x) {
    return function() {
      return x;
    };
  }

  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant$2(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant$2(isNaN(a) ? b : a);
  }

  var interpolateRgb = (function rgbGamma(y) {
    var color = gamma(y);

    function rgb$1(start, end) {
      var r = color((start = rgb(start)).r, (end = rgb(end)).r),
          g = color(start.g, end.g),
          b = color(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb$1.gamma = rgbGamma;

    return rgb$1;
  })(1);

  function numberArray(a, b) {
    if (!b) b = [];
    var n = a ? Math.min(b.length, a.length) : 0,
        c = b.slice(),
        i;
    return function(t) {
      for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
      return c;
    };
  }

  function isNumberArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }

  function genericArray(a, b) {
    var nb = b ? b.length : 0,
        na = a ? Math.min(nb, a.length) : 0,
        x = new Array(na),
        c = new Array(nb),
        i;

    for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
    for (; i < nb; ++i) c[i] = b[i];

    return function(t) {
      for (i = 0; i < na; ++i) c[i] = x[i](t);
      return c;
    };
  }

  function date(a, b) {
    var d = new Date;
    return a = +a, b = +b, function(t) {
      return d.setTime(a * (1 - t) + b * t), d;
    };
  }

  function interpolateNumber(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  function object(a, b) {
    var i = {},
        c = {},
        k;

    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};

    for (k in b) {
      if (k in a) {
        i[k] = interpolate(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }

    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function() {
      return b;
    };
  }

  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }

  function interpolateString(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
        am, // current match in a
        bm, // current match in b
        bs, // string preceding current number in b, if any
        i = -1, // index in s
        s = [], // string constants and placeholders
        q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a))
        && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) { // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else { // interpolate non-matching numbers
        s[++i] = null;
        q.push({i: i, x: interpolateNumber(am, bm)});
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? (q[0]
        ? one(q[0].x)
        : zero(b))
        : (b = q.length, function(t) {
            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          });
  }

  function interpolate(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant$2(b)
        : (t === "number" ? interpolateNumber
        : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
        : b instanceof color ? interpolateRgb
        : b instanceof Date ? date
        : isNumberArray(b) ? numberArray
        : Array.isArray(b) ? genericArray
        : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
        : interpolateNumber)(a, b);
  }

  function interpolateRound(a, b) {
    return a = +a, b = +b, function(t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }

  var degrees = 180 / Math.PI;

  var identity = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };

  function decompose(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees,
      skewX: Math.atan(skewX) * degrees,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

  var cssNode,
      cssRoot,
      cssView,
      svgNode;

  function parseCss(value) {
    if (value === "none") return identity;
    if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
    cssNode.style.transform = value;
    value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
    cssRoot.removeChild(cssNode);
    value = value.slice(7, -1).split(",");
    return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
  }

  function parseSvg(value) {
    if (value == null) return identity;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
    value = value.matrix;
    return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  function interpolateTransform(parse, pxComma, pxParen, degParen) {

    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }

    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }

    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
        q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }

    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }

    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }

    return function(a, b) {
      var s = [], // string constants and placeholders
          q = []; // number interpolators
      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null; // gc
      return function(t) {
        var i = -1, n = q.length, o;
        while (++i < n) s[(o = q[i]).i] = o.x(t);
        return s.join("");
      };
    };
  }

  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  function tweenRemove(id, name) {
    var tween0, tween1;
    return function() {
      var schedule = set$1(this, id),
          tween = schedule.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }

      schedule.tween = tween1;
    };
  }

  function tweenFunction(id, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error;
    return function() {
      var schedule = set$1(this, id),
          tween = schedule.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }
        if (i === n) tween1.push(t);
      }

      schedule.tween = tween1;
    };
  }

  function transition_tween(name, value) {
    var id = this._id;

    name += "";

    if (arguments.length < 2) {
      var tween = get$1(this.node(), id).tween;
      for (var i = 0, n = tween.length, t; i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }
      return null;
    }

    return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
  }

  function tweenValue(transition, name, value) {
    var id = transition._id;

    transition.each(function() {
      var schedule = set$1(this, id);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });

    return function(node) {
      return get$1(node, id).value[name];
    };
  }

  function interpolate$1(a, b) {
    var c;
    return (typeof b === "number" ? interpolateNumber
        : b instanceof color ? interpolateRgb
        : (c = color(b)) ? (b = c, interpolateRgb)
        : interpolateString)(a, b);
  }

  function attrRemove$1(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS$1(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant$1(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrConstantNS$1(fullname, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrFunction$1(name, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function attrFunctionNS$1(fullname, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function transition_attr(name, value) {
    var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate$1;
    return this.attrTween(name, typeof value === "function"
        ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value))
        : value == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname)
        : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value));
  }

  function attrInterpolate(name, i) {
    return function(t) {
      this.setAttribute(name, i.call(this, t));
    };
  }

  function attrInterpolateNS(fullname, i) {
    return function(t) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    };
  }

  function attrTweenNS(fullname, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function attrTween(name, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function transition_attrTween(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    var fullname = namespace(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  function delayFunction(id, value) {
    return function() {
      init(this, id).delay = +value.apply(this, arguments);
    };
  }

  function delayConstant(id, value) {
    return value = +value, function() {
      init(this, id).delay = value;
    };
  }

  function transition_delay(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? delayFunction
            : delayConstant)(id, value))
        : get$1(this.node(), id).delay;
  }

  function durationFunction(id, value) {
    return function() {
      set$1(this, id).duration = +value.apply(this, arguments);
    };
  }

  function durationConstant(id, value) {
    return value = +value, function() {
      set$1(this, id).duration = value;
    };
  }

  function transition_duration(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? durationFunction
            : durationConstant)(id, value))
        : get$1(this.node(), id).duration;
  }

  function easeConstant(id, value) {
    if (typeof value !== "function") throw new Error;
    return function() {
      set$1(this, id).ease = value;
    };
  }

  function transition_ease(value) {
    var id = this._id;

    return arguments.length
        ? this.each(easeConstant(id, value))
        : get$1(this.node(), id).ease;
  }

  function transition_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  function transition_merge(transition) {
    if (transition._id !== this._id) throw new Error;

    for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Transition(merges, this._parents, this._name, this._id);
  }

  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t) {
      var i = t.indexOf(".");
      if (i >= 0) t = t.slice(0, i);
      return !t || t === "start";
    });
  }

  function onFunction(id, name, listener) {
    var on0, on1, sit = start(name) ? init : set$1;
    return function() {
      var schedule = sit(this, id),
          on = schedule.on;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

      schedule.on = on1;
    };
  }

  function transition_on(name, listener) {
    var id = this._id;

    return arguments.length < 2
        ? get$1(this.node(), id).on.on(name)
        : this.each(onFunction(id, name, listener));
  }

  function removeFunction(id) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition) if (+i !== id) return;
      if (parent) parent.removeChild(this);
    };
  }

  function transition_remove() {
    return this.on("end.remove", removeFunction(this._id));
  }

  function transition_select(select) {
    var name = this._name,
        id = this._id;

    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
        }
      }
    }

    return new Transition(subgroups, this._parents, name, id);
  }

  function transition_selectAll(select) {
    var name = this._name,
        id = this._id;

    if (typeof select !== "function") select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children = select.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
            if (child = children[k]) {
              schedule(child, name, id, k, children, inherit);
            }
          }
          subgroups.push(children);
          parents.push(node);
        }
      }
    }

    return new Transition(subgroups, parents, name, id);
  }

  var Selection$1 = selection.prototype.constructor;

  function transition_selection() {
    return new Selection$1(this._groups, this._parents);
  }

  function styleNull(name, interpolate) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }

  function styleRemove$1(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant$1(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function styleFunction$1(name, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          value1 = value(this),
          string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function styleMaybeRemove(id, name) {
    var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
    return function() {
      var schedule = set$1(this, id),
          on = schedule.on,
          listener = schedule.value[key] == null ? remove || (remove = styleRemove$1(name)) : undefined;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

      schedule.on = on1;
    };
  }

  function transition_style(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate$1;
    return value == null ? this
        .styleTween(name, styleNull(name, i))
        .on("end.style." + name, styleRemove$1(name))
      : typeof value === "function" ? this
        .styleTween(name, styleFunction$1(name, i, tweenValue(this, "style." + name, value)))
        .each(styleMaybeRemove(this._id, name))
      : this
        .styleTween(name, styleConstant$1(name, i, value), priority)
        .on("end.style." + name, null);
  }

  function styleInterpolate(name, i, priority) {
    return function(t) {
      this.style.setProperty(name, i.call(this, t), priority);
    };
  }

  function styleTween(name, value, priority) {
    var t, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }
    tween._value = value;
    return tween;
  }

  function transition_styleTween(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  function textConstant$1(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction$1(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }

  function transition_text(value) {
    return this.tween("text", typeof value === "function"
        ? textFunction$1(tweenValue(this, "text", value))
        : textConstant$1(value == null ? "" : value + ""));
  }

  function textInterpolate(i) {
    return function(t) {
      this.textContent = i.call(this, t);
    };
  }

  function textTween(value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function transition_textTween(value) {
    var key = "text";
    if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    return this.tween(key, textTween(value));
  }

  function transition_transition() {
    var name = this._name,
        id0 = this._id,
        id1 = newId();

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit = get$1(node, id0);
          schedule(node, name, id1, i, group, {
            time: inherit.time + inherit.delay + inherit.duration,
            delay: 0,
            duration: inherit.duration,
            ease: inherit.ease
          });
        }
      }
    }

    return new Transition(groups, this._parents, name, id1);
  }

  function transition_end() {
    var on0, on1, that = this, id = that._id, size = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = {value: reject},
          end = {value: function() { if (--size === 0) resolve(); }};

      that.each(function() {
        var schedule = set$1(this, id),
            on = schedule.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }

        schedule.on = on1;
      });
    });
  }

  var id = 0;

  function Transition(groups, parents, name, id) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id;
  }

  function transition(name) {
    return selection().transition(name);
  }

  function newId() {
    return ++id;
  }

  var selection_prototype = selection.prototype;

  Transition.prototype = transition.prototype = {
    constructor: Transition,
    select: transition_select,
    selectAll: transition_selectAll,
    filter: transition_filter,
    merge: transition_merge,
    selection: transition_selection,
    transition: transition_transition,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: transition_on,
    attr: transition_attr,
    attrTween: transition_attrTween,
    style: transition_style,
    styleTween: transition_styleTween,
    text: transition_text,
    textTween: transition_textTween,
    remove: transition_remove,
    tween: transition_tween,
    delay: transition_delay,
    duration: transition_duration,
    ease: transition_ease,
    end: transition_end
  };

  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }

  var defaultTiming = {
    time: null, // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };

  function inherit(node, id) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id])) {
      if (!(node = node.parentNode)) {
        return defaultTiming.time = now(), defaultTiming;
      }
    }
    return timing;
  }

  function selection_transition(name) {
    var id,
        timing;

    if (name instanceof Transition) {
      id = name._id, name = name._name;
    } else {
      id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule(node, name, id, i, group, timing || inherit(node, id));
        }
      }
    }

    return new Transition(groups, this._parents, name, id);
  }

  selection.prototype.interrupt = selection_interrupt;
  selection.prototype.transition = selection_transition;

  const EPSILON = Math.pow(2, -52);
  const EDGE_STACK = new Uint32Array(512);

  class Delaunator {

      static from(points, getX = defaultGetX, getY = defaultGetY) {
          const n = points.length;
          const coords = new Float64Array(n * 2);

          for (let i = 0; i < n; i++) {
              const p = points[i];
              coords[2 * i] = getX(p);
              coords[2 * i + 1] = getY(p);
          }

          return new Delaunator(coords);
      }

      constructor(coords) {
          const n = coords.length >> 1;
          if (n > 0 && typeof coords[0] !== 'number') throw new Error('Expected coords to contain numbers.');

          this.coords = coords;

          // arrays that will store the triangulation graph
          const maxTriangles = Math.max(2 * n - 5, 0);
          this._triangles = new Uint32Array(maxTriangles * 3);
          this._halfedges = new Int32Array(maxTriangles * 3);

          // temporary arrays for tracking the edges of the advancing convex hull
          this._hashSize = Math.ceil(Math.sqrt(n));
          this._hullPrev = new Uint32Array(n); // edge to prev edge
          this._hullNext = new Uint32Array(n); // edge to next edge
          this._hullTri = new Uint32Array(n); // edge to adjacent triangle
          this._hullHash = new Int32Array(this._hashSize).fill(-1); // angular edge hash

          // temporary arrays for sorting points
          this._ids = new Uint32Array(n);
          this._dists = new Float64Array(n);

          this.update();
      }

      update() {
          const {coords, _hullPrev: hullPrev, _hullNext: hullNext, _hullTri: hullTri, _hullHash: hullHash} =  this;
          const n = coords.length >> 1;

          // populate an array of point indices; calculate input data bbox
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;

          for (let i = 0; i < n; i++) {
              const x = coords[2 * i];
              const y = coords[2 * i + 1];
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
              this._ids[i] = i;
          }
          const cx = (minX + maxX) / 2;
          const cy = (minY + maxY) / 2;

          let minDist = Infinity;
          let i0, i1, i2;

          // pick a seed point close to the center
          for (let i = 0; i < n; i++) {
              const d = dist(cx, cy, coords[2 * i], coords[2 * i + 1]);
              if (d < minDist) {
                  i0 = i;
                  minDist = d;
              }
          }
          const i0x = coords[2 * i0];
          const i0y = coords[2 * i0 + 1];

          minDist = Infinity;

          // find the point closest to the seed
          for (let i = 0; i < n; i++) {
              if (i === i0) continue;
              const d = dist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
              if (d < minDist && d > 0) {
                  i1 = i;
                  minDist = d;
              }
          }
          let i1x = coords[2 * i1];
          let i1y = coords[2 * i1 + 1];

          let minRadius = Infinity;

          // find the third point which forms the smallest circumcircle with the first two
          for (let i = 0; i < n; i++) {
              if (i === i0 || i === i1) continue;
              const r = circumradius(i0x, i0y, i1x, i1y, coords[2 * i], coords[2 * i + 1]);
              if (r < minRadius) {
                  i2 = i;
                  minRadius = r;
              }
          }
          let i2x = coords[2 * i2];
          let i2y = coords[2 * i2 + 1];

          if (minRadius === Infinity) {
              // order collinear points by dx (or dy if all x are identical)
              // and return the list as a hull
              for (let i = 0; i < n; i++) {
                  this._dists[i] = (coords[2 * i] - coords[0]) || (coords[2 * i + 1] - coords[1]);
              }
              quicksort(this._ids, this._dists, 0, n - 1);
              const hull = new Uint32Array(n);
              let j = 0;
              for (let i = 0, d0 = -Infinity; i < n; i++) {
                  const id = this._ids[i];
                  if (this._dists[id] > d0) {
                      hull[j++] = id;
                      d0 = this._dists[id];
                  }
              }
              this.hull = hull.subarray(0, j);
              this.triangles = new Uint32Array(0);
              this.halfedges = new Uint32Array(0);
              return;
          }

          // swap the order of the seed points for counter-clockwise orientation
          if (orient(i0x, i0y, i1x, i1y, i2x, i2y)) {
              const i = i1;
              const x = i1x;
              const y = i1y;
              i1 = i2;
              i1x = i2x;
              i1y = i2y;
              i2 = i;
              i2x = x;
              i2y = y;
          }

          const center = circumcenter(i0x, i0y, i1x, i1y, i2x, i2y);
          this._cx = center.x;
          this._cy = center.y;

          for (let i = 0; i < n; i++) {
              this._dists[i] = dist(coords[2 * i], coords[2 * i + 1], center.x, center.y);
          }

          // sort the points by distance from the seed triangle circumcenter
          quicksort(this._ids, this._dists, 0, n - 1);

          // set up the seed triangle as the starting hull
          this._hullStart = i0;
          let hullSize = 3;

          hullNext[i0] = hullPrev[i2] = i1;
          hullNext[i1] = hullPrev[i0] = i2;
          hullNext[i2] = hullPrev[i1] = i0;

          hullTri[i0] = 0;
          hullTri[i1] = 1;
          hullTri[i2] = 2;

          hullHash.fill(-1);
          hullHash[this._hashKey(i0x, i0y)] = i0;
          hullHash[this._hashKey(i1x, i1y)] = i1;
          hullHash[this._hashKey(i2x, i2y)] = i2;

          this.trianglesLen = 0;
          this._addTriangle(i0, i1, i2, -1, -1, -1);

          for (let k = 0, xp, yp; k < this._ids.length; k++) {
              const i = this._ids[k];
              const x = coords[2 * i];
              const y = coords[2 * i + 1];

              // skip near-duplicate points
              if (k > 0 && Math.abs(x - xp) <= EPSILON && Math.abs(y - yp) <= EPSILON) continue;
              xp = x;
              yp = y;

              // skip seed triangle points
              if (i === i0 || i === i1 || i === i2) continue;

              // find a visible edge on the convex hull using edge hash
              let start = 0;
              for (let j = 0, key = this._hashKey(x, y); j < this._hashSize; j++) {
                  start = hullHash[(key + j) % this._hashSize];
                  if (start !== -1 && start !== hullNext[start]) break;
              }

              start = hullPrev[start];
              let e = start, q;
              while (q = hullNext[e], !orient(x, y, coords[2 * e], coords[2 * e + 1], coords[2 * q], coords[2 * q + 1])) {
                  e = q;
                  if (e === start) {
                      e = -1;
                      break;
                  }
              }
              if (e === -1) continue; // likely a near-duplicate point; skip it

              // add the first triangle from the point
              let t = this._addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);

              // recursively flip triangles from the point until they satisfy the Delaunay condition
              hullTri[i] = this._legalize(t + 2);
              hullTri[e] = t; // keep track of boundary triangles on the hull
              hullSize++;

              // walk forward through the hull, adding more triangles and flipping recursively
              let n = hullNext[e];
              while (q = hullNext[n], orient(x, y, coords[2 * n], coords[2 * n + 1], coords[2 * q], coords[2 * q + 1])) {
                  t = this._addTriangle(n, i, q, hullTri[i], -1, hullTri[n]);
                  hullTri[i] = this._legalize(t + 2);
                  hullNext[n] = n; // mark as removed
                  hullSize--;
                  n = q;
              }

              // walk backward from the other side, adding more triangles and flipping
              if (e === start) {
                  while (q = hullPrev[e], orient(x, y, coords[2 * q], coords[2 * q + 1], coords[2 * e], coords[2 * e + 1])) {
                      t = this._addTriangle(q, i, e, -1, hullTri[e], hullTri[q]);
                      this._legalize(t + 2);
                      hullTri[q] = t;
                      hullNext[e] = e; // mark as removed
                      hullSize--;
                      e = q;
                  }
              }

              // update the hull indices
              this._hullStart = hullPrev[i] = e;
              hullNext[e] = hullPrev[n] = i;
              hullNext[i] = n;

              // save the two new edges in the hash table
              hullHash[this._hashKey(x, y)] = i;
              hullHash[this._hashKey(coords[2 * e], coords[2 * e + 1])] = e;
          }

          this.hull = new Uint32Array(hullSize);
          for (let i = 0, e = this._hullStart; i < hullSize; i++) {
              this.hull[i] = e;
              e = hullNext[e];
          }

          // trim typed triangle mesh arrays
          this.triangles = this._triangles.subarray(0, this.trianglesLen);
          this.halfedges = this._halfedges.subarray(0, this.trianglesLen);
      }

      _hashKey(x, y) {
          return Math.floor(pseudoAngle(x - this._cx, y - this._cy) * this._hashSize) % this._hashSize;
      }

      _legalize(a) {
          const {_triangles: triangles, _halfedges: halfedges, coords} = this;

          let i = 0;
          let ar = 0;

          // recursion eliminated with a fixed-size stack
          while (true) {
              const b = halfedges[a];

              /* if the pair of triangles doesn't satisfy the Delaunay condition
               * (p1 is inside the circumcircle of [p0, pl, pr]), flip them,
               * then do the same check/flip recursively for the new pair of triangles
               *
               *           pl                    pl
               *          /||\                  /  \
               *       al/ || \bl            al/    \a
               *        /  ||  \              /      \
               *       /  a||b  \    flip    /___ar___\
               *     p0\   ||   /p1   =>   p0\---bl---/p1
               *        \  ||  /              \      /
               *       ar\ || /br             b\    /br
               *          \||/                  \  /
               *           pr                    pr
               */
              const a0 = a - a % 3;
              ar = a0 + (a + 2) % 3;

              if (b === -1) { // convex hull edge
                  if (i === 0) break;
                  a = EDGE_STACK[--i];
                  continue;
              }

              const b0 = b - b % 3;
              const al = a0 + (a + 1) % 3;
              const bl = b0 + (b + 2) % 3;

              const p0 = triangles[ar];
              const pr = triangles[a];
              const pl = triangles[al];
              const p1 = triangles[bl];

              const illegal = inCircle(
                  coords[2 * p0], coords[2 * p0 + 1],
                  coords[2 * pr], coords[2 * pr + 1],
                  coords[2 * pl], coords[2 * pl + 1],
                  coords[2 * p1], coords[2 * p1 + 1]);

              if (illegal) {
                  triangles[a] = p1;
                  triangles[b] = p0;

                  const hbl = halfedges[bl];

                  // edge swapped on the other side of the hull (rare); fix the halfedge reference
                  if (hbl === -1) {
                      let e = this._hullStart;
                      do {
                          if (this._hullTri[e] === bl) {
                              this._hullTri[e] = a;
                              break;
                          }
                          e = this._hullPrev[e];
                      } while (e !== this._hullStart);
                  }
                  this._link(a, hbl);
                  this._link(b, halfedges[ar]);
                  this._link(ar, bl);

                  const br = b0 + (b + 1) % 3;

                  // don't worry about hitting the cap: it can only happen on extremely degenerate input
                  if (i < EDGE_STACK.length) {
                      EDGE_STACK[i++] = br;
                  }
              } else {
                  if (i === 0) break;
                  a = EDGE_STACK[--i];
              }
          }

          return ar;
      }

      _link(a, b) {
          this._halfedges[a] = b;
          if (b !== -1) this._halfedges[b] = a;
      }

      // add a new triangle given vertex indices and adjacent half-edge ids
      _addTriangle(i0, i1, i2, a, b, c) {
          const t = this.trianglesLen;

          this._triangles[t] = i0;
          this._triangles[t + 1] = i1;
          this._triangles[t + 2] = i2;

          this._link(t, a);
          this._link(t + 1, b);
          this._link(t + 2, c);

          this.trianglesLen += 3;

          return t;
      }
  }

  // monotonically increases with real angle, but doesn't need expensive trigonometry
  function pseudoAngle(dx, dy) {
      const p = dx / (Math.abs(dx) + Math.abs(dy));
      return (dy > 0 ? 3 - p : 1 + p) / 4; // [0..1]
  }

  function dist(ax, ay, bx, by) {
      const dx = ax - bx;
      const dy = ay - by;
      return dx * dx + dy * dy;
  }

  // return 2d orientation sign if we're confident in it through J. Shewchuk's error bound check
  function orientIfSure(px, py, rx, ry, qx, qy) {
      const l = (ry - py) * (qx - px);
      const r = (rx - px) * (qy - py);
      return Math.abs(l - r) >= 3.3306690738754716e-16 * Math.abs(l + r) ? l - r : 0;
  }

  // a more robust orientation test that's stable in a given triangle (to fix robustness issues)
  function orient(rx, ry, qx, qy, px, py) {
      const sign = orientIfSure(px, py, rx, ry, qx, qy) ||
      orientIfSure(rx, ry, qx, qy, px, py) ||
      orientIfSure(qx, qy, px, py, rx, ry);
      return sign < 0;
  }

  function inCircle(ax, ay, bx, by, cx, cy, px, py) {
      const dx = ax - px;
      const dy = ay - py;
      const ex = bx - px;
      const ey = by - py;
      const fx = cx - px;
      const fy = cy - py;

      const ap = dx * dx + dy * dy;
      const bp = ex * ex + ey * ey;
      const cp = fx * fx + fy * fy;

      return dx * (ey * cp - bp * fy) -
             dy * (ex * cp - bp * fx) +
             ap * (ex * fy - ey * fx) < 0;
  }

  function circumradius(ax, ay, bx, by, cx, cy) {
      const dx = bx - ax;
      const dy = by - ay;
      const ex = cx - ax;
      const ey = cy - ay;

      const bl = dx * dx + dy * dy;
      const cl = ex * ex + ey * ey;
      const d = 0.5 / (dx * ey - dy * ex);

      const x = (ey * bl - dy * cl) * d;
      const y = (dx * cl - ex * bl) * d;

      return x * x + y * y;
  }

  function circumcenter(ax, ay, bx, by, cx, cy) {
      const dx = bx - ax;
      const dy = by - ay;
      const ex = cx - ax;
      const ey = cy - ay;

      const bl = dx * dx + dy * dy;
      const cl = ex * ex + ey * ey;
      const d = 0.5 / (dx * ey - dy * ex);

      const x = ax + (ey * bl - dy * cl) * d;
      const y = ay + (dx * cl - ex * bl) * d;

      return {x, y};
  }

  function quicksort(ids, dists, left, right) {
      if (right - left <= 20) {
          for (let i = left + 1; i <= right; i++) {
              const temp = ids[i];
              const tempDist = dists[temp];
              let j = i - 1;
              while (j >= left && dists[ids[j]] > tempDist) ids[j + 1] = ids[j--];
              ids[j + 1] = temp;
          }
      } else {
          const median = (left + right) >> 1;
          let i = left + 1;
          let j = right;
          swap(ids, median, i);
          if (dists[ids[left]] > dists[ids[right]]) swap(ids, left, right);
          if (dists[ids[i]] > dists[ids[right]]) swap(ids, i, right);
          if (dists[ids[left]] > dists[ids[i]]) swap(ids, left, i);

          const temp = ids[i];
          const tempDist = dists[temp];
          while (true) {
              do i++; while (dists[ids[i]] < tempDist);
              do j--; while (dists[ids[j]] > tempDist);
              if (j < i) break;
              swap(ids, i, j);
          }
          ids[left + 1] = ids[j];
          ids[j] = temp;

          if (right - i + 1 >= j - left) {
              quicksort(ids, dists, i, right);
              quicksort(ids, dists, left, j - 1);
          } else {
              quicksort(ids, dists, left, j - 1);
              quicksort(ids, dists, i, right);
          }
      }
  }

  function swap(arr, i, j) {
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
  }

  function defaultGetX(p) {
      return p[0];
  }
  function defaultGetY(p) {
      return p[1];
  }

  const epsilon = 1e-6;

  class Path {
    constructor() {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null; // end of current subpath
      this._ = "";
    }
    moveTo(x, y) {
      this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
    }
    closePath() {
      if (this._x1 !== null) {
        this._x1 = this._x0, this._y1 = this._y0;
        this._ += "Z";
      }
    }
    lineTo(x, y) {
      this._ += `L${this._x1 = +x},${this._y1 = +y}`;
    }
    arc(x, y, r) {
      x = +x, y = +y, r = +r;
      const x0 = x + r;
      const y0 = y;
      if (r < 0) throw new Error("negative radius");
      if (this._x1 === null) this._ += `M${x0},${y0}`;
      else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) this._ += "L" + x0 + "," + y0;
      if (!r) return;
      this._ += `A${r},${r},0,1,1,${x - r},${y}A${r},${r},0,1,1,${this._x1 = x0},${this._y1 = y0}`;
    }
    rect(x, y, w, h) {
      this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${+w}v${+h}h${-w}Z`;
    }
    value() {
      return this._ || null;
    }
  }

  class Polygon {
    constructor() {
      this._ = [];
    }
    moveTo(x, y) {
      this._.push([x, y]);
    }
    closePath() {
      this._.push(this._[0].slice());
    }
    lineTo(x, y) {
      this._.push([x, y]);
    }
    value() {
      return this._.length ? this._ : null;
    }
  }

  class Voronoi {
    constructor(delaunay, [xmin, ymin, xmax, ymax] = [0, 0, 960, 500]) {
      if (!((xmax = +xmax) >= (xmin = +xmin)) || !((ymax = +ymax) >= (ymin = +ymin))) throw new Error("invalid bounds");
      this.delaunay = delaunay;
      this._circumcenters = new Float64Array(delaunay.points.length * 2);
      this.vectors = new Float64Array(delaunay.points.length * 2);
      this.xmax = xmax, this.xmin = xmin;
      this.ymax = ymax, this.ymin = ymin;
      this._init();
    }
    update() {
      this.delaunay.update();
      this._init();
      return this;
    }
    _init() {
      const {delaunay: {points, hull, triangles}, vectors} = this;

      // Compute circumcenters.
      const circumcenters = this.circumcenters = this._circumcenters.subarray(0, triangles.length / 3 * 2);
      for (let i = 0, j = 0, n = triangles.length, x, y; i < n; i += 3, j += 2) {
        const t1 = triangles[i] * 2;
        const t2 = triangles[i + 1] * 2;
        const t3 = triangles[i + 2] * 2;
        const x1 = points[t1];
        const y1 = points[t1 + 1];
        const x2 = points[t2];
        const y2 = points[t2 + 1];
        const x3 = points[t3];
        const y3 = points[t3 + 1];

        const dx = x2 - x1;
        const dy = y2 - y1;
        const ex = x3 - x1;
        const ey = y3 - y1;
        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        const ab = (dx * ey - dy * ex) * 2;

        if (!ab) {
          // degenerate case (collinear diagram)
          x = (x1 + x3) / 2 - 1e8 * ey;
          y = (y1 + y3) / 2 + 1e8 * ex;
        }
        else if (Math.abs(ab) < 1e-8) {
          // almost equal points (degenerate triangle)
          x = (x1 + x3) / 2;
          y = (y1 + y3) / 2;
        } else {
          const d = 1 / ab;
          x = x1 + (ey * bl - dy * cl) * d;
          y = y1 + (dx * cl - ex * bl) * d;
        }
        circumcenters[j] = x;
        circumcenters[j + 1] = y;
      }

      // Compute exterior cell rays.
      let h = hull[hull.length - 1];
      let p0, p1 = h * 4;
      let x0, x1 = points[2 * h];
      let y0, y1 = points[2 * h + 1];
      vectors.fill(0);
      for (let i = 0; i < hull.length; ++i) {
        h = hull[i];
        p0 = p1, x0 = x1, y0 = y1;
        p1 = h * 4, x1 = points[2 * h], y1 = points[2 * h + 1];
        vectors[p0 + 2] = vectors[p1] = y0 - y1;
        vectors[p0 + 3] = vectors[p1 + 1] = x1 - x0;
      }
    }
    render(context) {
      const buffer = context == null ? context = new Path : undefined;
      const {delaunay: {halfedges, inedges, hull}, circumcenters, vectors} = this;
      if (hull.length <= 1) return null;
      for (let i = 0, n = halfedges.length; i < n; ++i) {
        const j = halfedges[i];
        if (j < i) continue;
        const ti = Math.floor(i / 3) * 2;
        const tj = Math.floor(j / 3) * 2;
        const xi = circumcenters[ti];
        const yi = circumcenters[ti + 1];
        const xj = circumcenters[tj];
        const yj = circumcenters[tj + 1];
        this._renderSegment(xi, yi, xj, yj, context);
      }
      let h0, h1 = hull[hull.length - 1];
      for (let i = 0; i < hull.length; ++i) {
        h0 = h1, h1 = hull[i];
        const t = Math.floor(inedges[h1] / 3) * 2;
        const x = circumcenters[t];
        const y = circumcenters[t + 1];
        const v = h0 * 4;
        const p = this._project(x, y, vectors[v + 2], vectors[v + 3]);
        if (p) this._renderSegment(x, y, p[0], p[1], context);
      }
      return buffer && buffer.value();
    }
    renderBounds(context) {
      const buffer = context == null ? context = new Path : undefined;
      context.rect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin);
      return buffer && buffer.value();
    }
    renderCell(i, context) {
      const buffer = context == null ? context = new Path : undefined;
      const points = this._clip(i);
      if (points === null) return;
      context.moveTo(points[0], points[1]);
      let n = points.length;
      while (points[0] === points[n-2] && points[1] === points[n-1] && n > 1) n -= 2;
      for (let i = 2; i < n; i += 2) {
        if (points[i] !== points[i-2] || points[i+1] !== points[i-1])
          context.lineTo(points[i], points[i + 1]);
      }
      context.closePath();
      return buffer && buffer.value();
    }
    *cellPolygons() {
      const {delaunay: {points}} = this;
      for (let i = 0, n = points.length / 2; i < n; ++i) {
        const cell = this.cellPolygon(i);
        if (cell) yield cell;
      }
    }
    cellPolygon(i) {
      const polygon = new Polygon;
      this.renderCell(i, polygon);
      return polygon.value();
    }
    _renderSegment(x0, y0, x1, y1, context) {
      let S;
      const c0 = this._regioncode(x0, y0);
      const c1 = this._regioncode(x1, y1);
      if (c0 === 0 && c1 === 0) {
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
      } else if (S = this._clipSegment(x0, y0, x1, y1, c0, c1)) {
        context.moveTo(S[0], S[1]);
        context.lineTo(S[2], S[3]);
      }
    }
    contains(i, x, y) {
      if ((x = +x, x !== x) || (y = +y, y !== y)) return false;
      return this.delaunay._step(i, x, y) === i;
    }
    *neighbors(i) {
      const ci = this._clip(i);
      if (ci) for (const j of this.delaunay.neighbors(i)) {
        const cj = this._clip(j);
        // find the common edge
        if (cj) loop: for (let ai = 0, li = ci.length; ai < li; ai += 2) {
          for (let aj = 0, lj = cj.length; aj < lj; aj += 2) {
            if (ci[ai] == cj[aj]
            && ci[ai + 1] == cj[aj + 1]
            && ci[(ai + 2) % li] == cj[(aj + lj - 2) % lj]
            && ci[(ai + 3) % li] == cj[(aj + lj - 1) % lj]
            ) {
              yield j;
              break loop;
            }
          }
        }
      }
    }
    _cell(i) {
      const {circumcenters, delaunay: {inedges, halfedges, triangles}} = this;
      const e0 = inedges[i];
      if (e0 === -1) return null; // coincident point
      const points = [];
      let e = e0;
      do {
        const t = Math.floor(e / 3);
        points.push(circumcenters[t * 2], circumcenters[t * 2 + 1]);
        e = e % 3 === 2 ? e - 2 : e + 1;
        if (triangles[e] !== i) break; // bad triangulation
        e = halfedges[e];
      } while (e !== e0 && e !== -1);
      return points;
    }
    _clip(i) {
      // degenerate case (1 valid point: return the box)
      if (i === 0 && this.delaunay.hull.length === 1) {
        return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
      }
      const points = this._cell(i);
      if (points === null) return null;
      const {vectors: V} = this;
      const v = i * 4;
      return V[v] || V[v + 1]
          ? this._clipInfinite(i, points, V[v], V[v + 1], V[v + 2], V[v + 3])
          : this._clipFinite(i, points);
    }
    _clipFinite(i, points) {
      const n = points.length;
      let P = null;
      let x0, y0, x1 = points[n - 2], y1 = points[n - 1];
      let c0, c1 = this._regioncode(x1, y1);
      let e0, e1;
      for (let j = 0; j < n; j += 2) {
        x0 = x1, y0 = y1, x1 = points[j], y1 = points[j + 1];
        c0 = c1, c1 = this._regioncode(x1, y1);
        if (c0 === 0 && c1 === 0) {
          e0 = e1, e1 = 0;
          if (P) P.push(x1, y1);
          else P = [x1, y1];
        } else {
          let S, sx0, sy0, sx1, sy1;
          if (c0 === 0) {
            if ((S = this._clipSegment(x0, y0, x1, y1, c0, c1)) === null) continue;
            [sx0, sy0, sx1, sy1] = S;
          } else {
            if ((S = this._clipSegment(x1, y1, x0, y0, c1, c0)) === null) continue;
            [sx1, sy1, sx0, sy0] = S;
            e0 = e1, e1 = this._edgecode(sx0, sy0);
            if (e0 && e1) this._edge(i, e0, e1, P, P.length);
            if (P) P.push(sx0, sy0);
            else P = [sx0, sy0];
          }
          e0 = e1, e1 = this._edgecode(sx1, sy1);
          if (e0 && e1) this._edge(i, e0, e1, P, P.length);
          if (P) P.push(sx1, sy1);
          else P = [sx1, sy1];
        }
      }
      if (P) {
        e0 = e1, e1 = this._edgecode(P[0], P[1]);
        if (e0 && e1) this._edge(i, e0, e1, P, P.length);
      } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
        return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
      }
      return P;
    }
    _clipSegment(x0, y0, x1, y1, c0, c1) {
      while (true) {
        if (c0 === 0 && c1 === 0) return [x0, y0, x1, y1];
        if (c0 & c1) return null;
        let x, y, c = c0 || c1;
        if (c & 0b1000) x = x0 + (x1 - x0) * (this.ymax - y0) / (y1 - y0), y = this.ymax;
        else if (c & 0b0100) x = x0 + (x1 - x0) * (this.ymin - y0) / (y1 - y0), y = this.ymin;
        else if (c & 0b0010) y = y0 + (y1 - y0) * (this.xmax - x0) / (x1 - x0), x = this.xmax;
        else y = y0 + (y1 - y0) * (this.xmin - x0) / (x1 - x0), x = this.xmin;
        if (c0) x0 = x, y0 = y, c0 = this._regioncode(x0, y0);
        else x1 = x, y1 = y, c1 = this._regioncode(x1, y1);
      }
    }
    _clipInfinite(i, points, vx0, vy0, vxn, vyn) {
      let P = Array.from(points), p;
      if (p = this._project(P[0], P[1], vx0, vy0)) P.unshift(p[0], p[1]);
      if (p = this._project(P[P.length - 2], P[P.length - 1], vxn, vyn)) P.push(p[0], p[1]);
      if (P = this._clipFinite(i, P)) {
        for (let j = 0, n = P.length, c0, c1 = this._edgecode(P[n - 2], P[n - 1]); j < n; j += 2) {
          c0 = c1, c1 = this._edgecode(P[j], P[j + 1]);
          if (c0 && c1) j = this._edge(i, c0, c1, P, j), n = P.length;
        }
      } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
        P = [this.xmin, this.ymin, this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax];
      }
      return P;
    }
    _edge(i, e0, e1, P, j) {
      while (e0 !== e1) {
        let x, y;
        switch (e0) {
          case 0b0101: e0 = 0b0100; continue; // top-left
          case 0b0100: e0 = 0b0110, x = this.xmax, y = this.ymin; break; // top
          case 0b0110: e0 = 0b0010; continue; // top-right
          case 0b0010: e0 = 0b1010, x = this.xmax, y = this.ymax; break; // right
          case 0b1010: e0 = 0b1000; continue; // bottom-right
          case 0b1000: e0 = 0b1001, x = this.xmin, y = this.ymax; break; // bottom
          case 0b1001: e0 = 0b0001; continue; // bottom-left
          case 0b0001: e0 = 0b0101, x = this.xmin, y = this.ymin; break; // left
        }
        if ((P[j] !== x || P[j + 1] !== y) && this.contains(i, x, y)) {
          P.splice(j, 0, x, y), j += 2;
        }
      }
      if (P.length > 4) {
        for (let i = 0; i < P.length; i+= 2) {
          const j = (i + 2) % P.length, k = (i + 4) % P.length;
          if (P[i] === P[j] && P[j] === P[k]
          || P[i + 1] === P[j + 1] && P[j + 1] === P[k + 1])
            P.splice(j, 2), i -= 2;
        }
      }
      return j;
    }
    _project(x0, y0, vx, vy) {
      let t = Infinity, c, x, y;
      if (vy < 0) { // top
        if (y0 <= this.ymin) return null;
        if ((c = (this.ymin - y0) / vy) < t) y = this.ymin, x = x0 + (t = c) * vx;
      } else if (vy > 0) { // bottom
        if (y0 >= this.ymax) return null;
        if ((c = (this.ymax - y0) / vy) < t) y = this.ymax, x = x0 + (t = c) * vx;
      }
      if (vx > 0) { // right
        if (x0 >= this.xmax) return null;
        if ((c = (this.xmax - x0) / vx) < t) x = this.xmax, y = y0 + (t = c) * vy;
      } else if (vx < 0) { // left
        if (x0 <= this.xmin) return null;
        if ((c = (this.xmin - x0) / vx) < t) x = this.xmin, y = y0 + (t = c) * vy;
      }
      return [x, y];
    }
    _edgecode(x, y) {
      return (x === this.xmin ? 0b0001
          : x === this.xmax ? 0b0010 : 0b0000)
          | (y === this.ymin ? 0b0100
          : y === this.ymax ? 0b1000 : 0b0000);
    }
    _regioncode(x, y) {
      return (x < this.xmin ? 0b0001
          : x > this.xmax ? 0b0010 : 0b0000)
          | (y < this.ymin ? 0b0100
          : y > this.ymax ? 0b1000 : 0b0000);
    }
  }

  const tau = 2 * Math.PI;

  function pointX(p) {
    return p[0];
  }

  function pointY(p) {
    return p[1];
  }

  // A triangulation is collinear if all its triangles have a non-null area
  function collinear(d) {
    const {triangles, coords} = d;
    for (let i = 0; i < triangles.length; i += 3) {
      const a = 2 * triangles[i],
            b = 2 * triangles[i + 1],
            c = 2 * triangles[i + 2],
            cross = (coords[c] - coords[a]) * (coords[b + 1] - coords[a + 1])
                  - (coords[b] - coords[a]) * (coords[c + 1] - coords[a + 1]);
      if (cross > 1e-10) return false;
    }
    return true;
  }

  function jitter(x, y, r) {
    return [x + Math.sin(x + y) * r, y + Math.cos(x - y) * r];
  }

  class Delaunay {
    static from(points, fx = pointX, fy = pointY, that) {
      return new Delaunay("length" in points
          ? flatArray(points, fx, fy, that)
          : Float64Array.from(flatIterable(points, fx, fy, that)));
    }
    constructor(points) {
      this._delaunator = new Delaunator(points);
      this.inedges = new Int32Array(points.length / 2);
      this._hullIndex = new Int32Array(points.length / 2);
      this.points = this._delaunator.coords;
      this._init();
    }
    update() {
      this._delaunator.update();
      this._init();
      return this;
    }
    _init() {
      const d = this._delaunator, points = this.points;

      // check for collinear
      if (d.hull && d.hull.length > 2 && collinear(d)) {
        this.collinear = Int32Array.from({length: points.length/2}, (_,i) => i)
          .sort((i, j) => points[2 * i] - points[2 * j] || points[2 * i + 1] - points[2 * j + 1]); // for exact neighbors
        const e = this.collinear[0], f = this.collinear[this.collinear.length - 1],
          bounds = [ points[2 * e], points[2 * e + 1], points[2 * f], points[2 * f + 1] ],
          r = 1e-8 * Math.sqrt((bounds[3] - bounds[1])**2 + (bounds[2] - bounds[0])**2);
        for (let i = 0, n = points.length / 2; i < n; ++i) {
          const p = jitter(points[2 * i], points[2 * i + 1], r);
          points[2 * i] = p[0];
          points[2 * i + 1] = p[1];
        }
        this._delaunator = new Delaunator(points);
      } else {
        delete this.collinear;
      }

      const halfedges = this.halfedges = this._delaunator.halfedges;
      const hull = this.hull = this._delaunator.hull;
      const triangles = this.triangles = this._delaunator.triangles;
      const inedges = this.inedges.fill(-1);
      const hullIndex = this._hullIndex.fill(-1);

      // Compute an index from each point to an (arbitrary) incoming halfedge
      // Used to give the first neighbor of each point; for this reason,
      // on the hull we give priority to exterior halfedges
      for (let e = 0, n = halfedges.length; e < n; ++e) {
        const p = triangles[e % 3 === 2 ? e - 2 : e + 1];
        if (halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
      }
      for (let i = 0, n = hull.length; i < n; ++i) {
        hullIndex[hull[i]] = i;
      }

      // degenerate case: 1 or 2 (distinct) points
      if (hull.length <= 2 && hull.length > 0) {
        this.triangles = new Int32Array(3).fill(-1);
        this.halfedges = new Int32Array(3).fill(-1);
        this.triangles[0] = hull[0];
        this.triangles[1] = hull[1];
        this.triangles[2] = hull[1];
        inedges[hull[0]] = 1;
        if (hull.length === 2) inedges[hull[1]] = 0;
      }
    }
    voronoi(bounds) {
      return new Voronoi(this, bounds);
    }
    *neighbors(i) {
      const {inedges, hull, _hullIndex, halfedges, triangles, collinear} = this;

      // degenerate case with several collinear points
      if (collinear) {
        const l = collinear.indexOf(i);
        if (l > 0) yield collinear[l - 1];
        if (l < collinear.length - 1) yield collinear[l + 1];
        return;
      }

      const e0 = inedges[i];
      if (e0 === -1) return; // coincident point
      let e = e0, p0 = -1;
      do {
        yield p0 = triangles[e];
        e = e % 3 === 2 ? e - 2 : e + 1;
        if (triangles[e] !== i) return; // bad triangulation
        e = halfedges[e];
        if (e === -1) {
          const p = hull[(_hullIndex[i] + 1) % hull.length];
          if (p !== p0) yield p;
          return;
        }
      } while (e !== e0);
    }
    find(x, y, i = 0) {
      if ((x = +x, x !== x) || (y = +y, y !== y)) return -1;
      const i0 = i;
      let c;
      while ((c = this._step(i, x, y)) >= 0 && c !== i && c !== i0) i = c;
      return c;
    }
    _step(i, x, y) {
      const {inedges, hull, _hullIndex, halfedges, triangles, points} = this;
      if (inedges[i] === -1 || !points.length) return (i + 1) % (points.length >> 1);
      let c = i;
      let dc = (x - points[i * 2]) ** 2 + (y - points[i * 2 + 1]) ** 2;
      const e0 = inedges[i];
      let e = e0;
      do {
        let t = triangles[e];
        const dt = (x - points[t * 2]) ** 2 + (y - points[t * 2 + 1]) ** 2;
        if (dt < dc) dc = dt, c = t;
        e = e % 3 === 2 ? e - 2 : e + 1;
        if (triangles[e] !== i) break; // bad triangulation
        e = halfedges[e];
        if (e === -1) {
          e = hull[(_hullIndex[i] + 1) % hull.length];
          if (e !== t) {
            if ((x - points[e * 2]) ** 2 + (y - points[e * 2 + 1]) ** 2 < dc) return e;
          }
          break;
        }
      } while (e !== e0);
      return c;
    }
    render(context) {
      const buffer = context == null ? context = new Path : undefined;
      const {points, halfedges, triangles} = this;
      for (let i = 0, n = halfedges.length; i < n; ++i) {
        const j = halfedges[i];
        if (j < i) continue;
        const ti = triangles[i] * 2;
        const tj = triangles[j] * 2;
        context.moveTo(points[ti], points[ti + 1]);
        context.lineTo(points[tj], points[tj + 1]);
      }
      this.renderHull(context);
      return buffer && buffer.value();
    }
    renderPoints(context, r = 2) {
      const buffer = context == null ? context = new Path : undefined;
      const {points} = this;
      for (let i = 0, n = points.length; i < n; i += 2) {
        const x = points[i], y = points[i + 1];
        context.moveTo(x + r, y);
        context.arc(x, y, r, 0, tau);
      }
      return buffer && buffer.value();
    }
    renderHull(context) {
      const buffer = context == null ? context = new Path : undefined;
      const {hull, points} = this;
      const h = hull[0] * 2, n = hull.length;
      context.moveTo(points[h], points[h + 1]);
      for (let i = 1; i < n; ++i) {
        const h = 2 * hull[i];
        context.lineTo(points[h], points[h + 1]);
      }
      context.closePath();
      return buffer && buffer.value();
    }
    hullPolygon() {
      const polygon = new Polygon;
      this.renderHull(polygon);
      return polygon.value();
    }
    renderTriangle(i, context) {
      const buffer = context == null ? context = new Path : undefined;
      const {points, triangles} = this;
      const t0 = triangles[i *= 3] * 2;
      const t1 = triangles[i + 1] * 2;
      const t2 = triangles[i + 2] * 2;
      context.moveTo(points[t0], points[t0 + 1]);
      context.lineTo(points[t1], points[t1 + 1]);
      context.lineTo(points[t2], points[t2 + 1]);
      context.closePath();
      return buffer && buffer.value();
    }
    *trianglePolygons() {
      const {triangles} = this;
      for (let i = 0, n = triangles.length / 3; i < n; ++i) {
        yield this.trianglePolygon(i);
      }
    }
    trianglePolygon(i) {
      const polygon = new Polygon;
      this.renderTriangle(i, polygon);
      return polygon.value();
    }
  }

  function flatArray(points, fx, fy, that) {
    const n = points.length;
    const array = new Float64Array(n * 2);
    for (let i = 0; i < n; ++i) {
      const p = points[i];
      array[i * 2] = fx.call(that, p, i, points);
      array[i * 2 + 1] = fy.call(that, p, i, points);
    }
    return array;
  }

  function* flatIterable(points, fx, fy, that) {
    let i = 0;
    for (const p of points) {
      yield fx.call(that, p, i, points);
      yield fy.call(that, p, i, points);
      ++i;
    }
  }

  function polygonCentroid(polygon) {
    var i = -1,
        n = polygon.length,
        x = 0,
        y = 0,
        a,
        b = polygon[n - 1],
        c,
        k = 0;

    while (++i < n) {
      a = b;
      b = polygon[i];
      k += c = a[0] * b[1] - b[0] * a[1];
      x += (a[0] + b[0]) * c;
      y += (a[1] + b[1]) * c;
    }

    return k *= 3, [x / k, y / k];
  }

  function polygonLength(polygon) {
    var i = -1,
        n = polygon.length,
        b = polygon[n - 1],
        xa,
        ya,
        xb = b[0],
        yb = b[1],
        perimeter = 0;

    while (++i < n) {
      xa = xb;
      ya = yb;
      b = polygon[i];
      xb = b[0];
      yb = b[1];
      xa -= xb;
      ya -= yb;
      perimeter += Math.sqrt(xa * xa + ya * ya);
    }

    return perimeter;
  }

  /**
   * @param config
   */
  function initSankeyLegend(config) {
      const leg = document.getElementById("Legend");
      leg.addEventListener("input", () => leg.checked ? show() : hide());
      window.addEventListener("show-legend", () => {
          if (!leg.checked) {
              return;
          }
          show();
      });
      function hide() {
          const svg = select("#chart > svg");
          svg.select(".chart-legend")
              .transition()
              .style("opacity", 0)
              .transition()
              .remove();
      }
      /**
       * @link https://observablehq.com/@d3/voronoi-labels
       */
      function show() {
          const svg = select("#chart > svg");
          const rh = config.legend.labels.length * 32;
          const rw = 150;
          // determine the least node dense area of chart
          let xy = [];
          let nw = config.chart.sankey.nodeWidth() / 2;
          svg.selectAll("g.node").each((d) => {
              xy.push([d.x + nw, d.y + (d.dy / 2)]);
          });
          const delaunay = Delaunay.from(xy);
          const voronoi = delaunay.voronoi([-1, -1, config.chart.width + 1, config.chart.height + 1]);
          const cells = xy.map((d, i) => [d, voronoi.cellPolygon(i)]);
          let box, area = 0;
          cells.forEach((cell) => {
              const a = polygonLength(cell[1]);
              if (a > area) {
                  area = a;
                  box = cell[1];
              }
          });
          let [x, y] = polygonCentroid(box);
          x = x > config.chart.width / 2 ? config.chart.width - rw : 0;
          y = y > config.chart.height / 2 ? config.chart.height - rh : 0;
          //
          const legend = svg.append("g")
              .datum({ x: x, y: y })
              .style("opacity", 0)
              .classed("chart-legend", true);
          /* DEBUG
          svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "#900")
        .attr("d", voronoi.render());

          svg.append("path")
        .attr("d", delaunay.renderPoints(undefined, 2));*/
          const t = transition()
              .duration(500);
          legend.transition(t).style("opacity", 1);
          legend.call(drag()
              // @ts-ignore
              .on("drag", function (d) {
              d.x += event.dx;
              d.y += event.dy;
              select(this)
                  .attr("transform", (d) => `translate(${[d.x, d.y]})`);
          }));
          legend.append("rect")
              .attr("width", rw + "px")
              .attr("height", rh + "px")
              .attr("x", 0)
              .attr("y", 0)
              .classed("chart-legend", true);
          config.legend.colors.forEach((item, n) => {
              const g = legend.append("g")
                  .style("transform", `translate(10px, ${20 + (25 * n)}px)`);
              g.append("circle")
                  .style("fill", item)
                  .style("opacity", config.filters.opacity.high)
                  .attr("r", 10)
                  .attr("cx", 10)
                  .attr("cy", 10 + (1 * n));
              g.append("text")
                  .classed("chart-legend", true)
                  .attr("x", 25)
                  .attr("y", 15 + (1 * n))
                  .text(config.legend.labels[n]);
          });
          legend.attr("transform", (d) => `translate(${[x, y]})`);
      }
  }

  /**
   * @param config
   */
  function initSankeyNodeMovement(config) {
      const x = document.getElementById("MoveX");
      const y = document.getElementById("MoveY");
      config.filters.move.x = true;
      config.filters.move.y = true;
      x.addEventListener("input", () => config.filters.move.x = x.checked);
      y.addEventListener("input", () => config.filters.move.y = y.checked);
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

  function identity$1(x) {
    return x;
  }

  var map = Array.prototype.map,
      prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

  function formatLocale(locale) {
    var group = locale.grouping === undefined || locale.thousands === undefined ? identity$1 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
        currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
        currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
        decimal = locale.decimal === undefined ? "." : locale.decimal + "",
        numerals = locale.numerals === undefined ? identity$1 : formatNumerals(map.call(locale.numerals, String)),
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

  function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }

  function precisionPrefix(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }

  function precisionRound(step, max) {
    step = Math.abs(step), max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
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
      config.filters.days.sort((a, b) => parseInt("1" + a) - parseInt("1" + b));
      updateDayList(config);
      updateCallList(config);
      setQueryHash(config);
      window.dispatchEvent(new CustomEvent("filter-action"));
  }

  /**
   * @param config
   */
  function initMenu(config) {
      const menu = document.querySelector(".menu");
      const menuButton = document.querySelector(".menu-button");
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

  function ascending$1(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function bisector(compare) {
    if (compare.length === 1) compare = ascendingComparator(compare);
    return {
      left: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }
    };
  }

  function ascendingComparator(f) {
    return function(d, x) {
      return ascending$1(f(d), x);
    };
  }

  var ascendingBisect = bisector(ascending$1);
  var bisectRight = ascendingBisect.right;

  function identity$2(x) {
    return x;
  }

  function rollup(values, reduce, ...keys) {
    return nest(values, identity$2, reduce, keys);
  }

  function nest(values, map, reduce, keys) {
    return (function regroup(values, i) {
      if (i >= keys.length) return reduce(values);
      const groups = new Map();
      const keyof = keys[i++];
      let index = -1;
      for (const value of values) {
        const key = keyof(value, ++index, values);
        const group = groups.get(key);
        if (group) group.push(value);
        else groups.set(key, [value]);
      }
      for (const [key, values] of groups) {
        groups.set(key, regroup(values, i));
      }
      return map(groups);
    })(values, 0);
  }

  function sequence(start, stop, step) {
    start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

    var i = -1,
        n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
        range = new Array(n);

    while (++i < n) {
      range[i] = start + i * step;
    }

    return range;
  }

  var e10 = Math.sqrt(50),
      e5 = Math.sqrt(10),
      e2 = Math.sqrt(2);

  function ticks(start, stop, count) {
    var reverse,
        i = -1,
        n,
        ticks,
        step;

    stop = +stop, start = +start, count = +count;
    if (start === stop && count > 0) return [start];
    if (reverse = stop < start) n = start, start = stop, stop = n;
    if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

    if (step > 0) {
      start = Math.ceil(start / step);
      stop = Math.floor(stop / step);
      ticks = new Array(n = Math.ceil(stop - start + 1));
      while (++i < n) ticks[i] = (start + i) * step;
    } else {
      start = Math.floor(start * step);
      stop = Math.ceil(stop * step);
      ticks = new Array(n = Math.ceil(start - stop + 1));
      while (++i < n) ticks[i] = (start - i) / step;
    }

    if (reverse) ticks.reverse();

    return ticks;
  }

  function tickIncrement(start, stop, count) {
    var step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log(step) / Math.LN10),
        error = step / Math.pow(10, power);
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
  }

  function tickStep(start, stop, count) {
    var step0 = Math.abs(stop - start) / Math.max(0, count),
        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
        error = step0 / step1;
    if (error >= e10) step1 *= 10;
    else if (error >= e5) step1 *= 5;
    else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
  }

  function max(values, valueof) {
    let max;
    if (valueof === undefined) {
      for (const value of values) {
        if (value != null
            && (max < value || (max === undefined && value >= value))) {
          max = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null
            && (max < value || (max === undefined && value >= value))) {
          max = value;
        }
      }
    }
    return max;
  }

  function min(values, valueof) {
    let min;
    if (valueof === undefined) {
      for (const value of values) {
        if (value != null
            && (min > value || (min === undefined && value >= value))) {
          min = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null
            && (min > value || (min === undefined && value >= value))) {
          min = value;
        }
      }
    }
    return min;
  }

  function sum(values, valueof) {
    let sum = 0;
    if (valueof === undefined) {
      for (let value of values) {
        if (value = +value) {
          sum += value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if (value = +valueof(value, ++index, values)) {
          sum += value;
        }
      }
    }
    return sum;
  }

  function initRange(domain, range) {
    switch (arguments.length) {
      case 0: break;
      case 1: this.range(domain); break;
      default: this.range(range).domain(domain); break;
    }
    return this;
  }

  const implicit = Symbol("implicit");

  function ordinal() {
    var index = new Map(),
        domain = [],
        range = [],
        unknown = implicit;

    function scale(d) {
      var key = d + "", i = index.get(key);
      if (!i) {
        if (unknown !== implicit) return unknown;
        index.set(key, i = domain.push(d));
      }
      return range[(i - 1) % range.length];
    }

    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [], index = new Map();
      for (const value of _) {
        const key = value + "";
        if (index.has(key)) continue;
        index.set(key, domain.push(value));
      }
      return scale;
    };

    scale.range = function(_) {
      return arguments.length ? (range = Array.from(_), scale) : range.slice();
    };

    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    scale.copy = function() {
      return ordinal(domain, range).unknown(unknown);
    };

    initRange.apply(scale, arguments);

    return scale;
  }

  function band() {
    var scale = ordinal().unknown(undefined),
        domain = scale.domain,
        ordinalRange = scale.range,
        r0 = 0,
        r1 = 1,
        step,
        bandwidth,
        round = false,
        paddingInner = 0,
        paddingOuter = 0,
        align = 0.5;

    delete scale.unknown;

    function rescale() {
      var n = domain().length,
          reverse = r1 < r0,
          start = reverse ? r1 : r0,
          stop = reverse ? r0 : r1;
      step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
      if (round) step = Math.floor(step);
      start += (stop - start - step * (n - paddingInner)) * align;
      bandwidth = step * (1 - paddingInner);
      if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
      var values = sequence(n).map(function(i) { return start + step * i; });
      return ordinalRange(reverse ? values.reverse() : values);
    }

    scale.domain = function(_) {
      return arguments.length ? (domain(_), rescale()) : domain();
    };

    scale.range = function(_) {
      return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
    };

    scale.rangeRound = function(_) {
      return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
    };

    scale.bandwidth = function() {
      return bandwidth;
    };

    scale.step = function() {
      return step;
    };

    scale.round = function(_) {
      return arguments.length ? (round = !!_, rescale()) : round;
    };

    scale.padding = function(_) {
      return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
    };

    scale.paddingInner = function(_) {
      return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
    };

    scale.paddingOuter = function(_) {
      return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
    };

    scale.align = function(_) {
      return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
    };

    scale.copy = function() {
      return band(domain(), [r0, r1])
          .round(round)
          .paddingInner(paddingInner)
          .paddingOuter(paddingOuter)
          .align(align);
    };

    return initRange.apply(rescale(), arguments);
  }

  function constant$3(x) {
    return function() {
      return x;
    };
  }

  function number(x) {
    return +x;
  }

  var unit = [0, 1];

  function identity$3(x) {
    return x;
  }

  function normalize(a, b) {
    return (b -= (a = +a))
        ? function(x) { return (x - a) / b; }
        : constant$3(isNaN(b) ? NaN : 0.5);
  }

  function clamper(a, b) {
    var t;
    if (a > b) t = a, a = b, b = t;
    return function(x) { return Math.max(a, Math.min(b, x)); };
  }

  // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
  // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
  function bimap(domain, range, interpolate) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
    else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
    return function(x) { return r0(d0(x)); };
  }

  function polymap(domain, range, interpolate) {
    var j = Math.min(domain.length, range.length) - 1,
        d = new Array(j),
        r = new Array(j),
        i = -1;

    // Reverse descending domains.
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }

    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r[i] = interpolate(range[i], range[i + 1]);
    }

    return function(x) {
      var i = bisectRight(domain, x, 1, j) - 1;
      return r[i](d[i](x));
    };
  }

  function copy(source, target) {
    return target
        .domain(source.domain())
        .range(source.range())
        .interpolate(source.interpolate())
        .clamp(source.clamp())
        .unknown(source.unknown());
  }

  function transformer() {
    var domain = unit,
        range = unit,
        interpolate$1 = interpolate,
        transform,
        untransform,
        unknown,
        clamp = identity$3,
        piecewise,
        output,
        input;

    function rescale() {
      var n = Math.min(domain.length, range.length);
      if (clamp !== identity$3) clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }

    function scale(x) {
      return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
    }

    scale.invert = function(y) {
      return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
    };

    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
    };

    scale.range = function(_) {
      return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
    };

    scale.rangeRound = function(_) {
      return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
    };

    scale.clamp = function(_) {
      return arguments.length ? (clamp = _ ? true : identity$3, rescale()) : clamp !== identity$3;
    };

    scale.interpolate = function(_) {
      return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
    };

    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    return function(t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }

  function continuous() {
    return transformer()(identity$3, identity$3);
  }

  function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count),
        precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }

  function linearish(scale) {
    var domain = scale.domain;

    scale.ticks = function(count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };

    scale.tickFormat = function(count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };

    scale.nice = function(count) {
      if (count == null) count = 10;

      var d = domain(),
          i0 = 0,
          i1 = d.length - 1,
          start = d[i0],
          stop = d[i1],
          step;

      if (stop < start) {
        step = start, start = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }

      step = tickIncrement(start, stop, count);

      if (step > 0) {
        start = Math.floor(start / step) * step;
        stop = Math.ceil(stop / step) * step;
        step = tickIncrement(start, stop, count);
      } else if (step < 0) {
        start = Math.ceil(start * step) / step;
        stop = Math.floor(stop * step) / step;
        step = tickIncrement(start, stop, count);
      }

      if (step > 0) {
        d[i0] = Math.floor(start / step) * step;
        d[i1] = Math.ceil(stop / step) * step;
        domain(d);
      } else if (step < 0) {
        d[i0] = Math.ceil(start * step) / step;
        d[i1] = Math.floor(stop * step) / step;
        domain(d);
      }

      return scale;
    };

    return scale;
  }

  function linear$1() {
    var scale = continuous();

    scale.copy = function() {
      return copy(scale, linear$1());
    };

    initRange.apply(scale, arguments);

    return linearish(scale);
  }

  var slice = Array.prototype.slice;

  function identity$4(x) {
    return x;
  }

  var top = 1,
      right$1 = 2,
      bottom = 3,
      left$1 = 4,
      epsilon$1 = 1e-6;

  function translateX(x) {
    return "translate(" + (x + 0.5) + ",0)";
  }

  function translateY(y) {
    return "translate(0," + (y + 0.5) + ")";
  }

  function number$1(scale) {
    return function(d) {
      return +scale(d);
    };
  }

  function center(scale) {
    var offset = Math.max(0, scale.bandwidth() - 1) / 2; // Adjust for 0.5px offset.
    if (scale.round()) offset = Math.round(offset);
    return function(d) {
      return +scale(d) + offset;
    };
  }

  function entering() {
    return !this.__axis;
  }

  function axis(orient, scale) {
    var tickArguments = [],
        tickValues = null,
        tickFormat = null,
        tickSizeInner = 6,
        tickSizeOuter = 6,
        tickPadding = 3,
        k = orient === top || orient === left$1 ? -1 : 1,
        x = orient === left$1 || orient === right$1 ? "x" : "y",
        transform = orient === top || orient === bottom ? translateX : translateY;

    function axis(context) {
      var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
          format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity$4) : tickFormat,
          spacing = Math.max(tickSizeInner, 0) + tickPadding,
          range = scale.range(),
          range0 = +range[0] + 0.5,
          range1 = +range[range.length - 1] + 0.5,
          position = (scale.bandwidth ? center : number$1)(scale.copy()),
          selection = context.selection ? context.selection() : context,
          path = selection.selectAll(".domain").data([null]),
          tick = selection.selectAll(".tick").data(values, scale).order(),
          tickExit = tick.exit(),
          tickEnter = tick.enter().append("g").attr("class", "tick"),
          line = tick.select("line"),
          text = tick.select("text");

      path = path.merge(path.enter().insert("path", ".tick")
          .attr("class", "domain")
          .attr("stroke", "currentColor"));

      tick = tick.merge(tickEnter);

      line = line.merge(tickEnter.append("line")
          .attr("stroke", "currentColor")
          .attr(x + "2", k * tickSizeInner));

      text = text.merge(tickEnter.append("text")
          .attr("fill", "currentColor")
          .attr(x, k * spacing)
          .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

      if (context !== selection) {
        path = path.transition(context);
        tick = tick.transition(context);
        line = line.transition(context);
        text = text.transition(context);

        tickExit = tickExit.transition(context)
            .attr("opacity", epsilon$1)
            .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d) : this.getAttribute("transform"); });

        tickEnter
            .attr("opacity", epsilon$1)
            .attr("transform", function(d) { var p = this.parentNode.__axis; return transform(p && isFinite(p = p(d)) ? p : position(d)); });
      }

      tickExit.remove();

      path
          .attr("d", orient === left$1 || orient == right$1
              ? (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H0.5V" + range1 + "H" + k * tickSizeOuter : "M0.5," + range0 + "V" + range1)
              : (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V0.5H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + ",0.5H" + range1));

      tick
          .attr("opacity", 1)
          .attr("transform", function(d) { return transform(position(d)); });

      line
          .attr(x + "2", k * tickSizeInner);

      text
          .attr(x, k * spacing)
          .text(format);

      selection.filter(entering)
          .attr("fill", "none")
          .attr("font-size", 10)
          .attr("font-family", "sans-serif")
          .attr("text-anchor", orient === right$1 ? "start" : orient === left$1 ? "end" : "middle");

      selection
          .each(function() { this.__axis = position; });
    }

    axis.scale = function(_) {
      return arguments.length ? (scale = _, axis) : scale;
    };

    axis.ticks = function() {
      return tickArguments = slice.call(arguments), axis;
    };

    axis.tickArguments = function(_) {
      return arguments.length ? (tickArguments = _ == null ? [] : slice.call(_), axis) : tickArguments.slice();
    };

    axis.tickValues = function(_) {
      return arguments.length ? (tickValues = _ == null ? null : slice.call(_), axis) : tickValues && tickValues.slice();
    };

    axis.tickFormat = function(_) {
      return arguments.length ? (tickFormat = _, axis) : tickFormat;
    };

    axis.tickSize = function(_) {
      return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
    };

    axis.tickSizeInner = function(_) {
      return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
    };

    axis.tickSizeOuter = function(_) {
      return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
    };

    axis.tickPadding = function(_) {
      return arguments.length ? (tickPadding = +_, axis) : tickPadding;
    };

    return axis;
  }

  function axisBottom(scale) {
    return axis(bottom, scale);
  }

  var SlicerModifier;
  (function (SlicerModifier) {
      SlicerModifier[SlicerModifier["NO_KEY"] = 0] = "NO_KEY";
      SlicerModifier[SlicerModifier["CTRL_KEY"] = 1] = "CTRL_KEY";
      SlicerModifier[SlicerModifier["SHIFT_KEY"] = 2] = "SHIFT_KEY";
  })(SlicerModifier || (SlicerModifier = {}));
  class Slicer {
      constructor(list) {
          this._ = new Map();
          this._selectionCount = 0;
          if (list) {
              if (Array.isArray(list)) {
                  list.forEach((item) => {
                      if (!this._.has(item)) {
                          this._.set(item, { filtered: false, selected: false });
                      }
                  });
              }
              else if (!this._.has(list)) {
                  this._.set(list, { filtered: false, selected: false });
              }
          }
      }
      get members() {
          const result = [];
          this._.forEach((value, key) => {
              result.push(key);
          });
          return result;
      }
      get selection() {
          const result = [];
          if (this._selectionCount > 0) {
              this._.forEach((value, key) => {
                  if (value.selected) {
                      result.push(key);
                  }
              });
          }
          return result;
      }
      add(key) {
          if (!this._.has(key)) {
              let state = { filtered: false, selected: false };
              if (this._selectionCount > 0) {
                  state.filtered = true;
              }
              this._.set(key, state);
          }
          return this;
      }
      clear() {
          this._.forEach((_, key) => {
              this._.set(key, { filtered: false, selected: false });
          });
          this._selectionCount = 0;
          this.lastSelection = undefined;
          return this;
      }
      has(key) {
          return this._.has(key);
      }
      isFiltered(key) {
          const item = this._.get(key);
          return item ? item.filtered : false;
      }
      isSelected(key) {
          const item = this._.get(key);
          return item ? item.selected : false;
      }
      remove(key) {
          const state = this._.get(key);
          if (state && state.selected) {
              --this._selectionCount;
          }
          this._.delete(key);
          if (this._selectionCount === 0) {
              this.clear();
          }
          else if (this.lastSelection === key) {
              this.lastSelection = this.selection[0];
          }
          return this;
      }
      toggle(item, modifier = SlicerModifier.NO_KEY) {
          if (modifier === SlicerModifier.SHIFT_KEY) {
              return this.toggleRange(item);
          }
          else if (modifier === SlicerModifier.CTRL_KEY) {
              return this.toggleCumulative(item);
          }
          else {
              return this.toggleSingle(item);
          }
      }
      toggleCumulative(key) {
          const state = this._.get(key);
          if (state) {
              state.selected = !state.selected;
              if (state.selected) {
                  ++this._selectionCount;
              }
              else {
                  --this._selectionCount;
              }
              this._.set(key, state);
          }
          if (this._selectionCount === 0 || this._selectionCount === this._.size) {
              this.clear();
          }
          else {
              this._.forEach((value, key) => {
                  value.filtered = !value.selected;
                  this._.set(key, value);
              });
              this.lastSelection = key;
          }
          return this;
      }
      toggleRange(item) {
          if (item === this.lastSelection) {
              this.clear();
          }
          else {
              let state = 0;
              this._selectionCount = 0;
              this._.forEach((value, key) => {
                  if (state === 1) {
                      if (item === key || this.lastSelection === key) {
                          state = -1;
                      }
                      if (this.lastSelection === undefined) {
                          state = -1;
                          value = { filtered: true, selected: false };
                      }
                      else {
                          value = { filtered: false, selected: true };
                          ++this._selectionCount;
                      }
                  }
                  else if (state === 0) {
                      if (item === key || this.lastSelection === key) {
                          state = 1;
                          value = { filtered: false, selected: true };
                          ++this._selectionCount;
                      }
                      else {
                          value = { filtered: true, selected: false };
                      }
                  }
                  else {
                      value = { filtered: true, selected: false };
                  }
                  this._.set(key, value);
              });
              this.lastSelection = item;
              if (this._selectionCount === 0 || this._selectionCount === this._.size) {
                  this.clear();
              }
          }
          return this;
      }
      toggleSingle(item) {
          const state = this._.get(item);
          if (state) {
              if (state.selected) {
                  this.clear();
              }
              else {
                  this._.forEach((value, key) => {
                      if (item === key) {
                          value.selected = !value.selected;
                          value.filtered = !value.selected;
                      }
                      else {
                          value = { filtered: true, selected: false };
                      }
                      this._.set(key, value);
                  });
                  this._selectionCount = 1;
                  this.lastSelection = item;
              }
          }
          return this;
      }
  }

  /**
   * @param selection - passed by D3 call() API
   * @example
   * const svg = container.call(
   *  svg()
   *    .height(50)
   *    .width(50)
   *    .margin({bottom: 5, left: 10, right: 5, top: 20})
   * );
   * @returns - object containing SVG D3 selection object
   */
  function svg() {
      let _h = 200, _w = 200, _m = { bottom: 10, left: 10, right: 10, top: 10 };
      function _svg(selection) {
          const svg = selection.append("svg")
              .attr("x", 0)
              .attr("y", 0)
              .attr("viewBox", `0 0 ${_w} ${_h}`)
              .attr("xmlns", "http://www.w3.org/2000/svg")
              .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
          svg.append("defs");
          svg.append("g")
              .attr("class", "canvas")
              .attr("transform", `translate(${_m.left},${_m.top})`);
          return svg;
      }
      _svg.height = (n) => {
          if (n === undefined) {
              return _h;
          }
          else {
              _h = n;
              return _svg;
          }
      };
      _svg.margin = (m) => {
          if (m === undefined) {
              return _m;
          }
          else {
              _m = m;
              return _svg;
          }
      };
      _svg.width = (n) => {
          if (n === undefined) {
              return _w;
          }
          else {
              _w = n;
              return _svg;
          }
      };
      return _svg;
  }

  function drawColumnChart(node, data) {
      const s = new Slicer(data.map(d => d.label));
      const total = Math.round(sum(data, (d) => d.value));
      const f = (total === 1) ? format(".0%") : format(".0f");
      const margin = { top: 30, right: 10, bottom: 45, left: 20 };
      const width = node.clientWidth;
      const rw = width - margin.left - margin.right;
      const height = node.clientHeight;
      const rh = height - margin.top - margin.bottom;
      const x = band().range([0, rw]).padding(0.1);
      const y = linear$1().range([rh, 0]);
      const sg = select(node).call(svg().height(height).width(width).margin(margin));
      const canvas = sg.select(".canvas");
      x.domain(data.map((d) => d.label));
      y.domain([0, max(data, (d) => d.value)]);
      const xAxis = axisBottom(x)
          .tickValues(x.domain().filter((d, i) => data.length < 10 ? true : !(i % 3) || i === data.length - 1));
      const gAxis = canvas.append("g")
          .attr("class", "x axis")
          .attr("transform", `translate(0,${rh})`)
          .call(xAxis);
      const ticks = gAxis.selectAll(".tick");
      ticks.style("cursor", "pointer")
          .on("click", function () {
          const tick = select(this);
          tick.style("cursor", null);
          tick.select("text").text((d) => d);
          tick.on("click", null);
          tick.select("title").text((d) => d);
      });
      ticks.selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-45)");
      ticks.append("title")
          .text((d) => `${d}\nClick to expand the text on this label`);
      ticks.selectAll("text")
          .text((d) => d.length > 5 ? d.substring(0, 3) + " ..." : d);
      const gbar = canvas.selectAll(".bar")
          .data(data).enter()
          .append("g")
          .attr("transform", (d) => `translate(${x(d.label)},${y(d.value)})`)
          .on("click", (d) => {
          if (event.ctrlKey) {
              s.toggleCumulative(d.label);
          }
          else if (event.shiftKey) {
              s.toggleRange(d.label);
          }
          else {
              s.toggle(d.label);
          }
          gbar.each(function (d) {
              const filtered = s.isFiltered(d.label);
              return select(this).classed("filtered", filtered);
          });
      });
      const rbar = gbar.append("rect")
          .attr("class", "bar")
          .attr("fill", (d) => d.color ? d.color : "steelblue")
          .attr("x", 0)
          .attr("width", x.bandwidth())
          .attr("y", 0)
          .attr("height", (d) => rh - y(d.value));
      rbar.append("title")
          .text((d) => `${d.label}: ${f(d.value)} calls`);
      gbar.append("text")
          .classed("bar", true)
          .attr("x", x.bandwidth() / 2)
          .attr("y", -2)
          .text((d) => `${f(d.value)}`);
  }

  /**
   * @param config
   */
  function initBreakdown(config) {
      const container = document.querySelector(".breakdown");
      container === null || container === void 0 ? void 0 : container.addEventListener("click", e => e.stopImmediatePropagation());
      const action = container === null || container === void 0 ? void 0 : container.querySelector(".breakdown-action");
      const message = container === null || container === void 0 ? void 0 : container.querySelector(".breakdown-message");
      const chart1 = container === null || container === void 0 ? void 0 : container.querySelector(".breakdown-chart1");
      const chart2 = container === null || container === void 0 ? void 0 : container.querySelector(".breakdown-chart2");
      const close = document.querySelector(".breakdown-close");
      close.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          hide(config);
      });
      function clear() {
          if (message) {
              message.innerHTML = "";
          }
          if (chart1) {
              chart1.innerHTML = "";
              chart1.style.display = "";
          }
          if (chart2) {
              chart2.innerHTML = "";
              chart1.style.display = "";
          }
      }
      /**
       * @param config
       */
      function hide(config) {
          container === null || container === void 0 ? void 0 : container.classList.add("ready");
          if (config.chart.highlighted) {
              config.chart.highlighted.style('opacity', config.filters.opacity.low);
              config.chart.highlighted = undefined;
          }
          setTimeout(() => clear(), 500);
      }
      /**
       * @param config
       */
      function displayBreakdown(config) {
          message.innerHTML = config.breakdown.message;
          chart2.innerHTML = "";
          if (config.breakdown.chart2.length === 0) {
              chart2.style.display = "none";
          }
          else {
              chart2.style.display = "";
          }
          chart1.innerHTML = "";
          if (config.breakdown.chart1.length === 0) {
              chart1.style.display = "none";
          }
          else {
              chart1.style.display = "";
          }
          action.style.display = (config.breakdown.chart1.length === 0 && config.breakdown.chart2.length === 0) ? "none" : "";
          if (chart2 && config.breakdown.chart2.length > 0) {
              if (config.breakdown.chart2.length === 1) {
                  const d = config.breakdown.chart2[0];
                  chart2.innerHTML = `<div><h2 style="color:${d.color}">${d.label}</h2><h2>${d.value} calls 100%</h2></div>`;
              }
              else {
                  chart2.innerHTML = " ";
                  drawColumnChart(chart2, config.breakdown.chart2);
              }
          }
          if (chart1 && config.breakdown.chart1.length > 0) {
              if (config.breakdown.chart1.length === 1) {
                  const d = config.breakdown.chart1[0];
                  chart1.innerHTML = `<div><h2 style="color:${d.color}">${d.label}</h2><h2>${d.value} calls 100%</h2></div>`;
              }
              else {
                  chart1.innerHTML = " ";
                  drawColumnChart(chart1, config.breakdown.chart1);
              }
          }
          container === null || container === void 0 ? void 0 : container.classList.remove("ready");
          window.dispatchEvent(new CustomEvent("hide-menu"));
      }
      /**
       * @param config
       */
      function displayStatus(config) {
          clear();
          if (message) {
              message.innerHTML = config.status.message;
          }
          action.style.display = "none";
          chart2.style.display = "none";
          chart1.style.display = "none";
          container === null || container === void 0 ? void 0 : container.classList.remove("ready");
          window.dispatchEvent(new CustomEvent("hide-menu"));
      }
      window.addEventListener("hide-breakdown", () => hide(config));
      window.addEventListener("show-status", () => displayStatus(config));
      window.addEventListener("show-breakdown", () => displayBreakdown(config));
  }

  /**
   * Initialises Data Quality chart
   * @param config
   */
  function initDataQualityChart(config) {
      const container = document.getElementById("lblDQStatus");
      const status = container.querySelector("img");
      container.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          window.dispatchEvent(new CustomEvent("hide-menu"));
          window.dispatchEvent(new CustomEvent("show-status"));
      });
      window.addEventListener("data-quality", () => {
          const i = config.db.dq.interpolated[config.querystring.day];
          const es = config.db.dq.estimated;
          const ms = config.db.dq.missing;
          let state = i.length + es.length + ms.length;
          status.src = state < 10 ? config.status.green.src : state < 15 ? config.status.amber.src : config.status.red.src;
          container.title = state < 10 ? config.status.green.title : state < 15 ? config.status.amber.title : config.status.red.title;
          let qt = `<div class="data-quality">Data availability for <b>${getScreenDate(config.querystring.day)}</b>: `;
          if (state === 0) {
              qt += `Complete.<br>All data is available in the database.`;
          }
          else if (state < 5) {
              qt += `Very High`;
          }
          else if (state < 10) {
              qt += `High`;
          }
          else if (state < 15) {
              qt += `Medium`;
          }
          else if (state < 20) {
              qt += `Fair`;
          }
          else {
              qt += `Low`;
          }
          if (ms.length > 0) {
              qt += `<br><br>Missing data: `;
              qt += JSON.stringify(ms)
                  .replace(/\"/g, "")
                  .replace(/\,/g, ", ")
                  .replace(/\[/g, "")
                  .replace(/\]/g, "") + ".";
          }
          if (es.length > 0) {
              qt += `<br>Estimated data: `;
              qt += JSON.stringify(es)
                  .replace(/\"/g, "")
                  .replace(/\,/g, ", ")
                  .replace(/\[/g, "")
                  .replace(/\]/g, "") + ".";
          }
          if (i.length > 0) {
              qt += `<br>Interpolated data: `;
              qt += JSON.stringify(i)
                  .replace(/\"/g, "")
                  .replace(/\,/g, ", ")
                  .replace(/\[/g, "")
                  .replace(/\]/g, "") + ".";
          }
          qt += `</div>`;
          config.status.message = qt;
      });
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
                      i = interpolateNumber(x0, x1);
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
                          i = interpolateNumber(y0, y1),
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
                  let x0 = d.source.x + d.source.dx, x1 = d.target.x, xi = interpolateNumber(x0, x1), x2 = xi(curvature), x3 = xi(1 - curvature), y0 = d.source.y + d.sy, y1 = d.target.y + d.ty, y2 = d.source.y + d.sy + d.dy, y3 = d.target.y + d.ty + d.dy;
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
                  return (d) => (d.source.x < d.target.x) ? forwardLink(part, d) : backwardLink(part, d);
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
                  const key = link.source;
                  source = link.source = nodes[key];
              }
              if (typeof target === "number") {
                  const key = link.target;
                  target = link.target = nodes[key];
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
                  node.value = Math.max(sum(node.sourceLinks, value), sum(node.targetLinks, value));
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
          nodes.forEach((node) => {
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
                  node.sourceLinks.forEach((sourceLink) => {
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
                          if (currentNode) {
                              currentNode.onStack = false;
                              component.push(currentNode);
                          }
                      } while (currentNode !== node);
                      components.push({
                          index: 0,
                          root: node,
                          scc: component,
                          x: 0
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
                      .filter((sourceLink) => sourceLink.target.component === i)
                      .map((sourceLink) => sourceLink.target);
                  return result;
              });
          });
          let componentsByBreadth = Array.from(rollup(components.sort((a, b) => a.x - b.x), item => item, d => d.x).values());
          let max = -1, nextMax = -1;
          componentsByBreadth.forEach((c) => {
              c.forEach((component) => {
                  component.x = max + 1;
                  component.scc.forEach((node) => {
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
          nodes.filter((node) => {
              let outLinks = node.sourceLinks.filter((link) => link.source.name !== link.target.name);
              return (outLinks.length === 0);
          })
              .forEach((node) => node.x = max);
          scaleNodeBreadths((size[0] - nodeWidth) / Math.max(max, 1));
          function layerComponents() {
              let remainingComponents = components;
              let nextComponents;
              let visitedIndex = new Set();
              let x = 0;
              while (remainingComponents.length) {
                  nextComponents = [];
                  visitedIndex.clear();
                  remainingComponents.forEach((component) => {
                      component.x = x;
                      component.scc.forEach((n) => {
                          n.sourceLinks.forEach((l) => {
                              if (!visitedIndex.has(l.target.component) &&
                                  l.target.component !== component.index) {
                                  nextComponents.push(components[l.target.component]);
                                  visitedIndex.add(l.target.component);
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
                  if (currentNode) {
                      if (!currentNode.hasOwnProperty('x')) {
                          currentNode.x = x;
                          currentNode.dx = nodeWidth;
                          let targets = extractTargets(currentNode);
                          queue = queue.concat(targets);
                          nextCount += targets.length;
                      }
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
          let nodesByBreadth = Array.from(rollup(nodes.sort((a, b) => a.x - b.x), item => item, d => d.y).values());
          let ky = (size[0] - (nodesByBreadth[0].length - 1) * nodePadding) / sum(nodesByBreadth[0], value);
          nodesByBreadth.forEach((nodes) => {
              nodes.forEach((node, i) => {
                  node.x = i;
                  node.dy = node.value * ky;
              });
          });
          links.forEach((link) => link.dy = link.value * ky);
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
                          let y = sum(node.targetLinks, weightedSource) / sum(node.targetLinks, value);
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
                          let y = sum(node.sourceLinks, weightedTarget) / sum(node.sourceLinks, value);
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
              return b.x - a.x;
          }
      }
      /**
       * @param kx
       */
      function scaleNodeBreadths(kx) {
          nodes.forEach((node) => {
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
          let nodesByBreadth = Array.from(rollup(nodes.sort((a, b) => a.x - b.x), item => item, d => d.x).values());
          initializeNodeDepth();
          resolveCollisions();
          for (let alpha = 1; iterations > 0; --iterations) {
              relaxRightToLeft(alpha *= .99);
              resolveCollisions();
              relaxLeftToRight(alpha);
              resolveCollisions();
          }
          function initializeNodeDepth() {
              let ky = min(nodesByBreadth, function (nodes) {
                  return (size[1] - (nodes.length - 1) * nodePadding) / sum(nodes, value);
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
              nodesByBreadth.forEach(function (nodes) {
                  nodes.forEach(function (node) {
                      if (node.targetLinks.length) {
                          let y = sum(node.targetLinks, weightedSource) / sum(node.targetLinks, value);
                          node.y += (y - center(node)) * alpha;
                      }
                  });
              });
              function weightedSource(link) {
                  return center(link.source) * link.value;
              }
          }
          function relaxRightToLeft(alpha) {
              nodesByBreadth.slice().reverse()
                  .forEach((nodes) => {
                  nodes.forEach(function (node) {
                      if (node.sourceLinks.length) {
                          // @ts-ignore
                          let y = sum(node.sourceLinks, weightedTarget) / sum(node.sourceLinks, value);
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
              remainingNodes.forEach((node) => {
                  node.y = y;
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
          nodes.forEach((node) => {
              if (!node.sourceLinks.length) {
                  node.y = y - 1;
              }
          });
      }
      function computeLinkDepths() {
          nodes.forEach((node) => {
              node.sourceLinks.sort(ascendingTargetDepth);
              node.targetLinks.sort(ascendingSourceDepth);
          });
          nodes.forEach((node) => {
              let sy = 0, ty = 0;
              node.sourceLinks.forEach((link) => {
                  link.sy = sy;
                  sy += link.dy;
              });
              node.targetLinks.forEach((link) => {
                  link.ty = ty;
                  ty += link.dy;
              });
          });
          function ascendingSourceDepth(a, b) {
              return alignment === "horizontal"
                  ? a.source.y - b.source.y
                  : a.source.x - b.source.x;
          }
          function ascendingTargetDepth(a, b) {
              return alignment === "horizontal"
                  ? a.target.y - b.target.y
                  : a.target.x - b.target.x;
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
      const chart = document.getElementById("chart");
      const m = config.chart.margin;
      if (chart) {
          config.chart.width = chart.clientWidth - m.left - m.right;
          config.chart.height = chart.clientHeight - m.bottom - 130;
      }
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.style.width = config.chart.width + m.left + m.right + "px";
      svg.style.height = config.chart.height + m.top + m.bottom + "px";
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.style.transform = "translate(" + m.left + "," + m.top + ")";
      svg.appendChild(g);
      chart === null || chart === void 0 ? void 0 : chart.appendChild(svg);
      // @ts-ignore
      config.chart.svg = d3.select(svg);
      window.addEventListener("sankey-chart", () => loadSankeyChart(config));
  }
  function loadSankeyChart(config) {
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
          .attr("class", "link");
      const path = config.chart.sankey.reversibleLink();
      let h, f, e;
      if (path) {
          h = linkCollection.append("path")
              .attr("d", path(0));
          f = linkCollection.append("path")
              .attr("d", path(1));
          e = linkCollection.append("path")
              .attr("d", path(2));
      }
      linkCollection.
          attr("fill", (i) => i.fill ? i.fill : i.source.fill)
          .attr("opacity", config.filters.opacity.low)
          .on("click", function (d) {
          // @ts-ignore
          d3.event.stopPropagation();
          if (config.chart.highlighted) {
              config.chart.highlighted.style('opacity', config.filters.opacity.low);
          }
          // @ts-ignore
          config.chart.highlighted = d3.select(this);
          config.chart.highlighted.style('opacity', config.filters.opacity.high);
          let text = `<p>${d.source.name} → ${d.target.name} calls</p>`;
          text += `<p>Outgoing: ${formatNumber(d.value)} calls</p>`;
          config.breakdown.message = text;
          config.breakdown.chart1 = d.supply;
          config.breakdown.chart2 = [];
          window.dispatchEvent(new CustomEvent("show-breakdown"));
      });
      const nodeCollection = svg.append("g")
          .selectAll(".node")
          .data(config.db.sankey.nodes)
          .enter()
          .append("g")
          .attr("class", "node")
          .attr("transform", (i) => `translate(${i.x},${i.y})`)
          // @ts-ignore
          .call(d3.behavior.drag()
          .origin((i) => i)
          .on("dragstart", function (d) {
          var _a;
          (_a = this.parentNode) === null || _a === void 0 ? void 0 : _a.appendChild(this);
          // @ts-ignore
          d.initialPosition = d3.select(this).attr("transform");
      })
          .on("drag", dragged)
          .on("dragend", function (d) {
          var _a;
          // @ts-ignore
          if (d.initialPosition === d3.select(this).attr("transform")) {
              if (config.chart.highlighted) {
                  config.chart.highlighted.style('opacity', config.filters.opacity.low);
              }
              config.chart.highlighted = config.chart.svg.selectAll(".link")
                  .filter((l) => l.source === d || l.target === d);
              (_a = config.chart.highlighted) === null || _a === void 0 ? void 0 : _a.transition().style('opacity', config.filters.opacity.high);
              const nodesource = [], nodetarget = [];
              config.chart.svg.selectAll(".link")
                  .filter((l) => l.target === d)[0]
                  .forEach((l) => nodesource.push({
                  color: "steelblue",
                  label: l.__data__.source.name,
                  value: l.__data__.value
              }));
              config.chart.svg.selectAll(".link")
                  .filter((l) => l.source === d)[0]
                  .forEach((l) => nodetarget.push({
                  color: "steelblue",
                  label: l.__data__.target.name,
                  value: l.__data__.value
              }));
              // @ts-ignore
              let src = d3.sum(nodesource, d => d.value);
              // @ts-ignore
              let tgt = d3.sum(nodetarget, d => d.value);
              let text = `<p>${d.name}</p><p>Incoming: ${formatNumber(src)} calls</p>`;
              text += `<p>Outgoing: ${formatNumber(tgt)} calls</p>`;
              text += `Out/In: ${(src === 0 || tgt === 0) ? "---" : formatNumber(tgt / src)}`;
              config.breakdown.message = text;
              config.breakdown.chart1 = nodesource;
              config.breakdown.chart2 = nodetarget;
              window.dispatchEvent(new CustomEvent("show-breakdown"));
          }
      }));
      nodeCollection.append("rect")
          .attr("height", (d) => d.dy)
          .attr("width", config.chart.sankey.nodeWidth())
          .style("fill", (d) => d.fill)
          .style("stroke", (d) => rgb(d.fill).darker(2))
          .append("title")
          .text((d) => d.name);
      nodeCollection.append("text")
          .classed("node-label-outer", true)
          .attr("x", -6)
          .attr("y", (i) => i.dy / 2)
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .attr("transform", null)
          .text((i) => i.name)
          .filter((i) => i.x < config.chart.width / 2)
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
          if (config.filters.move.y) {
              if (config.filters.move.x) {
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
              if (config.filters.move.x) {
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
      const org = document.getElementById("lblOrganisationStatus");
      const day = document.getElementById("lblDayStatus");
      const call = document.getElementById("lblCallStatus");
      window.addEventListener("org-selected", (e) => org.textContent = e.detail + " |");
      window.addEventListener("day-selected", (e) => day.textContent = e.detail + " |");
      window.addEventListener("call-selected", (e) => call.textContent = e.detail);
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
          if (option.textContent === "SEL") {
              org.insertAdjacentElement("afterbegin", option);
          }
          else {
              org.appendChild(option);
          }
      }
      getQueryHash(config);
      org.value = "SEL";
      /*if (config.querystring.organisation) {
          org.value = config.querystring.organisation;
      }*/
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

  function Map$1() {}

  Map$1.prototype = map$1.prototype = {
    constructor: Map$1,
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
    var map = new Map$1;

    // Copy constructor.
    if (object instanceof Map$1) object.each(function(value, key) { map.set(key, value); });

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

  function Set$1() {}

  var proto = map$1.prototype;

  Set$1.prototype = set$2.prototype = {
    constructor: Set$1,
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

  function set$2(object, f) {
    var set = new Set$1;

    // Copy constructor.
    if (object instanceof Set$1) object.each(function(value) { set.add(value); });

    // Otherwise, assume it’s an array.
    else if (object) {
      var i = -1, n = object.length;
      if (f == null) while (++i < n) set.add(object[i]);
      else while (++i < n) set.add(f(object[i], i, object));
    }

    return set;
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

  function start$1() {
      const datapath = window.location.hostname === "localhost"
          ? "./json/"
          : "https://raw.githubusercontent.com/NELCSU/ED/master/docs/json/";
      json(datapath + "config.json", function (d) {
          const config = d;
          config.db.path = datapath;
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

  exports.start = start$1;

  return exports;

}({}));
