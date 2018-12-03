(function (d3$1) {
    'use strict';

    function pathArc(x1, y1, x2, y2, r1, r2) {
        r1 = r1 || 0;
        r2 = r2 || 0;
        const theta = Math.atan((x2 - x1) / (y2 - y1));
        const phi = Math.atan((y2 - y1) / (x2 - x1));
        const sinTheta = r1 * Math.sin(theta);
        const cosTheta = r1 * Math.cos(theta);
        const sinPhi = r2 * Math.sin(phi);
        const cosPhi = r2 * Math.cos(phi);
        if (y2 > y1) {
            x1 = x1 + sinTheta;
            y1 = y1 + cosTheta;
        }
        else {
            x1 = x1 - sinTheta;
            y1 = y1 - cosTheta;
        }
        if (x1 > x2) {
            x2 = x2 + cosPhi;
            y2 = y2 + sinPhi;
        }
        else {
            x2 = x2 - cosPhi;
            y2 = y2 - sinPhi;
        }
        const dx = x2 - x1, dy = y2 - y1;
        const dr = Math.sqrt(dx * dx + dy * dy);
        return `M${x1},${y1}A${dr},${dr} 0 0,1 ${x2},${y2}`;
    }

    function pathEllipse(cx, cy, rx = 1, ry = 1) {
        let output = `M${cx - rx},${cy}`;
        output += ` a${rx},${ry} 0 1,0 ${2 * rx},0`;
        output += ` a${rx},${ry} 0 1,0 ${-2 * rx},0`;
        return output;
    }

    function pathCircle(cx, cy, r = 1) {
        return pathEllipse(cx, cy, r, r);
    }

    function pathCross(x, y, l) {
        let output = `M${x - l * 0.5}, ${y - l * 1.25}`;
        output += ` h${l} v${l} h${l} v${l} h-${l} v${l} h-${l} v-${l} h-${l} v-${l} h${l}z`;
        return output;
    }

    function pathDiamond(x, y, h, w) {
        const sw = w / 2.0;
        const sh = h / 2.0;
        let output = `M${x - sw},${y}`;
        output += ` L${x},${y + sh} L${x + sw},${y} L${x},${y - sh}z`;
        return output;
    }

    function pathLine(x1, y1, x2, y2, r1, r2) {
        r1 = r1 || 0;
        r2 = r2 || 0;
        const theta = Math.atan((x2 - x1) / (y2 - y1));
        const phi = Math.atan((y2 - y1) / (x2 - x1));
        const sinTheta = r1 * Math.sin(theta);
        const cosTheta = r1 * Math.cos(theta);
        const sinPhi = r2 * Math.sin(phi);
        const cosPhi = r2 * Math.cos(phi);
        if (y2 > y1) {
            x1 = x1 + sinTheta;
            y1 = y1 + cosTheta;
        }
        else {
            x1 = x1 - sinTheta;
            y1 = y1 - cosTheta;
        }
        if (x1 > x2) {
            x2 = x2 + cosPhi;
            y2 = y2 + sinPhi;
        }
        else {
            x2 = x2 - cosPhi;
            y2 = y2 - sinPhi;
        }
        return `M${x1},${y1}L${x2},${y2}`;
    }

    function pathRectangle(x, y, h, w) {
        const sx = x - (w / 2.0);
        const sy = y - (h / 2.0);
        let output = `M${sx},${sy}`;
        output += ` L${sx},${sy + h} L${sx + w},${sy + h} L${sx + w},${sy}z`;
        return output;
    }

    function pathSquare(x, y, l) {
        return pathRectangle(x, y, l, l);
    }

    function pathTriangle(a, b, c) {
        let output = `M${a[0]},${a[1]}`;
        output += ` L${b[0]},${b[1]} L${c[0]},${c[1]}z`;
        return output;
    }

    var p = {
        pathArc,
        pathCircle,
        pathCross,
        pathDiamond,
        pathEllipse,
        pathLine,
        pathRectangle,
        pathSquare,
        pathTriangle
    };

    var Legend = (function () {
        function Legend(chart) {
            var _this = this;
            this._color = function (n) {
                var d = _this.datum(n);
                return d.fill;
            };
            this._open = false;
            this._icon = function () { return "circle"; };
            this._chart = chart;
            window.addEventListener("drawn", function (e) {
                if (e.detail.id === chart.id) {
                    _this.draw();
                }
            });
        }
        Legend.prototype.color = function (cb) {
            this._color = cb;
            return this;
        };
        Legend.prototype.datum = function (node) {
            return d3.select(node).datum();
        };
        Legend.prototype.draw = function () {
            var _this = this;
            var self = this;
            var data = [];
            if (!this._style) {
                var def = this._chart.svg.select("defs");
                this._style = def.append("style")
                    .attr("type", "text/css")
                    .text(".legend { font-family: Arial; font-size: 0.9em; transition: transform 500ms ease-in }\n        .legend-link { fill: #999; font-size: 0.9em; cursor: pointer; stroke-linecap: round; user-select: none }\n        .legend:hover .heading { fill: #333 }\n        .item > .label { font-size: 0.7em }");
            }
            if (this.el && !this.el.empty()) {
                this.el.remove();
            }
            this.el = this._chart.svg
                .append("g")
                .attr("class", "legend")
                .style("display", "none");
            this.el.append("text")
                .classed("legend-link", true)
                .attr("transform", "rotate(90)")
                .attr("x", 0)
                .attr("y", 0)
                .text("LEGEND")
                .on("click", function () { return _this.toggle(); });
            this._chart.svg.selectAll(this._selector)
                .each(function () {
                data.push({
                    fill: self._color(this),
                    label: self._label(this),
                    icon: self._icon(this)
                });
            });
            var items = this.el.selectAll("g.item")
                .data(data);
            items.selectAll(".label").text(function (d) { return d.label; });
            items.selectAll(".icon").attr("fill", function (d) { return d.fill; });
            var item = items.enter();
            var g = item.append("g")
                .classed("item", true)
                .attr("transform", function (d, i) { return "translate(25 " + i * 20 + ")"; });
            g.append("path")
                .attr("class", "icon")
                .attr("d", function (d) {
                if (d.icon === "triangle") {
                    return p.pathTriangle([1, 11], [11, 11], [6, 1]);
                }
                else if (d.icon === "diamond") {
                    return p.pathDiamond(6, 6, 10, 10);
                }
                else if (d.icon === "square") {
                    return p.pathSquare(6, 6, 5, 5);
                }
                else {
                    return p.pathCircle(6, 6, 5);
                }
            })
                .attr("transform", "translate(-13 0)")
                .style("opacity", 0.6)
                .style("fill", function (d) { return d.fill; })
                .style("stroke", "none");
            g.append("text")
                .attr("class", "label")
                .attr("x", 0)
                .attr("y", 9)
                .text(function (d) { return d.label; })
                .append("title")
                .text(function (d) { return d.label; });
            items.merge(items);
            items.exit().remove();
            var box = this._chart.svg.node().getBoundingClientRect();
            var hbox = this._chart.svg.select("text.legend-link").node().getBoundingClientRect();
            this._width = box.width - hbox.width + 2;
            this.el.attr("transform", "translate(" + this._width + " 4)");
            setTimeout(function () { return _this.el.style("display", null); }, 1000);
            return this;
        };
        Legend.prototype.icon = function (cb) {
            this._icon = cb;
            return this;
        };
        Legend.prototype.label = function (cb) {
            this._label = cb;
            return this;
        };
        Legend.prototype.node = function (selector) {
            this._selector = selector;
            return this;
        };
        Legend.prototype.toggle = function () {
            this._open = !this._open;
            this._nudge();
            return this;
        };
        Legend.prototype._nudge = function () {
            var container = this._chart.svg.select("g.legend");
            var link = container.select("text.legend-link");
            var lbox = container.node().getBoundingClientRect();
            var hbox = link.node().getBoundingClientRect();
            this.el.attr("transform", "translate(" + (this._width - (this._open ? lbox.width : hbox.width) + 15) + " 4)");
        };
        return Legend;
    }());

    var Contour = (function () {
        function Contour(chart) {
            var _this = this;
            this._chart = chart;
            var defs = this._chart.svg.select("defs");
            defs.append("style")
                .attr("type", "text/css")
                .text(".contour { fill: none; stroke: #999; stroke-dasharray: 1 }");
            window.addEventListener("drawn", function (e) {
                if (e.detail.id === _this._chart.id) {
                    _this.draw();
                }
            });
        }
        Contour.prototype.data = function (d) {
            this._data = d;
            return this;
        };
        Contour.prototype.draw = function () {
            var _this = this;
            var canvas = this._chart.svg.select(".canvas");
            var box = canvas.node().getBoundingClientRect();
            canvas.append("g")
                .attr("class", "contours")
                .selectAll("path.contour")
                .data(d3.contourDensity()
                .x(function (d) { return _this._chart.scale.x(d[0]); })
                .y(function (d) { return _this._chart.scale.y(d[1]); })
                .size([box.width, box.height])
                .bandwidth(40)(this._data))
                .enter()
                .append("path")
                .attr("class", "contour")
                .attr("stroke-linejoin", "round")
                .attr("d", d3.geoPath());
            return this;
        };
        return Contour;
    }());

    function reset(id) {
        var s = d3.select("#" + id);
        var canvas = s.select("g.canvas");
        if (canvas && !canvas.empty()) {
            canvas.selectAll("*").remove();
            canvas.attr("transform", null);
            s.select("g.pending")
                .style("display", null);
        }
    }

    function toNodes(template, isSVG = false) {
        try {
            const d = new DOMParser();
            let root;
            if (isSVG) {
                root = d.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${template}</svg>`, "image/svg+xml");
                return root.documentElement.children[0];
            }
            else {
                root = d.parseFromString(template, "text/html");
                return root.body.childNodes[0];
            }
        }
        catch (_a) {
            throw new Error("Error parsing templates string");
        }
    }

    function style(id, css) {
        var s = document.getElementById(id);
        s.querySelector("defs")
            .appendChild(toNodes("<style type=\"text/css\">" + css + "</style>", true));
    }

    function svg(id, width, height) {
        return toNodes("<svg id =\"" + id + "\"\n    aria-labelledBy=\"title\" role=\"presentation\"\n    preserveAspectRatio=\"xMinYMin meet\"\n    height=\"100%\" width=\"100%\" viewBox=\"0 0 " + width + " " + height + "\"\n    xmlns=\"http://www.w3.org/2000/svg\"\n    xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <title class=\"accessibleTitle\" lang=\"en\">Chart</title>\n    <defs>\n      <style type=\"text/css\">\n        svg {\n          font-family: Arial, Helvetica, sans-serif;\n          font-size: 1em;\n          user-select: none\n        }\n        .heading {\n          cursor: move;\n          font-size: 1.4em\n        }\n      </style>\n    </defs>\n    <g class=\"canvas\"></g>\n    <g class=\"pending\">\n      <rect height=\"100%\" width=\"100%\" fill=\"#eee\" stroke=\"#ccc\"></rect>\n      <text y=\"50%\" x=\"50%\" alignment-baseline=\"central\" fill=\"#666\" style=\"font-size:1.1em\" text-anchor=\"middle\">Data pending</text>\n    </g>\n  </svg>", true);
    }

    function title(id, msg) {
        var s = d3.select("#" + id);
        s.select(".accessibleTitle")
            .text(msg);
        var canvas = s.select(".canvas");
        if (!canvas.empty()) {
            canvas.append("text")
                .attr("class", "heading")
                .attr("x", 20)
                .attr("y", 20)
                .text(msg)
                .call(d3.drag()
                .on("drag", function () {
                d3.select(this)
                    .attr("x", d3.event.x)
                    .attr("y", d3.event.y);
            }));
        }
    }

    function pathEllipse$1(cx, cy, rx = 1, ry = 1) {
        let output = `M${cx - rx},${cy}`;
        output += ` a${rx},${ry} 0 1,0 ${2 * rx},0`;
        output += ` a${rx},${ry} 0 1,0 ${-2 * rx},0`;
        return output;
    }

    function pathCircle$1(cx, cy, r = 1) {
        return pathEllipse$1(cx, cy, r, r);
    }

    function pathCross$1(x, y, l) {
        let output = `M${x - l * 0.5}, ${y - l * 1.25}`;
        output += ` h${l} v${l} h${l} v${l} h-${l} v${l} h-${l} v-${l} h-${l} v-${l} h${l}z`;
        return output;
    }

    function pathDiamond$1(x, y, h, w) {
        const sw = w / 2.0;
        const sh = h / 2.0;
        let output = `M${x - sw},${y}`;
        output += ` L${x},${y + sh} L${x + sw},${y} L${x},${y - sh}z`;
        return output;
    }

    function pathRectangle$1(x, y, h, w) {
        const sx = x - (w / 2.0);
        const sy = y - (h / 2.0);
        let output = `M${sx},${sy}`;
        output += ` L${sx},${sy + h} L${sx + w},${sy + h} L${sx + w},${sy}z`;
        return output;
    }

    function pathSquare$1(x, y, l) {
        return pathRectangle$1(x, y, l, l);
    }

    function pathTriangle$1(a, b, c) {
        let output = `M${a[0]},${a[1]}`;
        output += ` L${b[0]},${b[1]} L${c[0]},${c[1]}z`;
        return output;
    }

    var Plot = (function () {
        function Plot(parentId, id) {
            this._boundCharts = [];
            this.addon = [];
            this.domain = { c: undefined, r: [3, 3], s: undefined, x: undefined, y: undefined };
            this.event = { drawn: undefined };
            this.margin = { top: 8, right: 8, bottom: 8, left: 5 };
            this.scale = {
                c: d3.scaleOrdinal(d3.schemeCategory10),
                r: undefined, s: undefined,
                x: undefined, y: undefined
            };
            this.shapes = [
                { path: pathCircle$1(2.5, 2.5, 2.5), name: "circle" },
                { path: pathTriangle$1([0, 6], [6, 6], [3, 0]), name: "triangle" },
                { path: pathCross$1(3.5, 3.5, 2.25), name: "cross" },
                { path: pathSquare$1(2.5, 2.5, 5), name: "square" },
                { path: pathDiamond$1(3, 3, 6, 6), name: "diamond" },
            ];
            this.title = { heading: undefined, x: undefined, y: undefined };
            this.id = id;
            this.event.drawn = new CustomEvent("drawn", { detail: { id: this.id } });
            var parent = document.getElementById(parentId);
            var b = parent.getBoundingClientRect();
            parent.appendChild(svg(id, b.width, b.height));
            this.svg = d3.select("#" + this.id).classed("plot", true);
            style(this.id, ".data-item { cursor: pointer }\n    .fade { fill-opacity: 0.05 }");
        }
        Plot.prototype.add = function (feature) {
            var _this = this;
            if (Array.isArray(feature)) {
                feature.forEach(function (f) { return _this.addon.push(f); });
            }
            else {
                this.addon.push(feature);
            }
            return this;
        };
        Plot.prototype.bind = function (charts) {
            var _this = this;
            if (Array.isArray(charts)) {
                charts.forEach(function (c) { return _this._boundCharts.push(c); });
            }
            else {
                this._boundCharts.push(charts);
            }
            return this;
        };
        Plot.prototype.data = function (data) {
            var _this = this;
            this._data = data;
            if (this._data.labels) {
                this.title.heading = this._data.labels.title;
                this.title.x = this._data.labels.x;
                this.title.y = this._data.labels.y;
            }
            if (this._data) {
                if (!data.series[0].fill) {
                    var c_1 = [];
                    this._data.series
                        .forEach(function (s) { return c_1.push(s.label); });
                    this.domain.c = c_1.filter(function (v, i, a) { return a.indexOf(v) === i; });
                    this._data.series
                        .forEach(function (s) { return s.fill = _this.scale.c(s.label); });
                }
                if (data.series[0].shape) {
                    var t_1 = [];
                    this._data.series
                        .forEach(function (s) { return t_1.push(s.shape); });
                    this.domain.s = t_1.filter(function (v, i, a) { return a.indexOf(v) === i; });
                }
                else {
                    this.domain.s = ["circle"];
                }
                if (data.series[0].values[0][2]) {
                    var r_1 = [];
                    this._data.series
                        .forEach(function (s) { return s.values.forEach(function (v) { return r_1.push(v[2]); }); });
                    this.domain.r = d3.extent(r_1);
                }
                if (data.series[0].values[0][0]) {
                    var x_1 = [];
                    this._data.series
                        .forEach(function (s) { return s.values.forEach(function (v) { return x_1.push(v[0]); }); });
                    this.domain.x = d3.extent(x_1);
                    this.domain.x[0] -= (this.domain.x[0] * 0.1);
                    this.domain.x[1] *= 1.1;
                }
                if (data.series[0].values[0][1]) {
                    var y_1 = [];
                    this._data.series
                        .forEach(function (s) { return s.values.forEach(function (v) { return y_1.push(v[1]); }); });
                    this.domain.y = d3.extent(y_1);
                    this.domain.y[0] -= (this.domain.y[0] * 0.1);
                    this.domain.y[1] *= 1.1;
                }
            }
            return this;
        };
        Plot.prototype.draw = function () {
            var _this = this;
            if (this._data === undefined) {
                return this;
            }
            var self = this;
            var canvas = this.svg.select(".canvas");
            canvas.attr("transform", "translate(" + this.margin.left + " " + this.margin.top + ")");
            this.svg
                .select("g.pending")
                .style("display", "none");
            title(this.id, this.title.heading);
            if (this.domain.r[0] >= 0 && this.domain.r[1] > 0) {
                this.scale.r = d3.scaleLinear()
                    .domain(this.domain.r)
                    .range([1, 20]);
            }
            this.scale.s = d3.scaleOrdinal()
                .domain(this.domain.s)
                .range(this.shapes.map(function (sh) { return sh.path; }));
            this.scale.x = d3.scaleLinear()
                .domain(this.domain.x)
                .range([0, this.innerWidth()]);
            this.scale.y = d3.scaleLinear()
                .domain(this.domain.y)
                .range([this.innerHeight(), 0]);
            var points = canvas.selectAll("g")
                .data(this._data.series);
            var gEnter = points.enter()
                .append("g")
                .attr("class", "series")
                .attr("id", function (d, i) { return _this.id + "_s" + i; });
            gEnter.selectAll(".data-item")
                .data(function (d) { return d.values; })
                .enter()
                .append("path")
                .classed("data-item", true)
                .attr("id", function (d, i) { return this.parentNode.id + "_p" + i; })
                .attr("d", function () {
                var parent = d3.select(this.parentNode);
                var d = parent.datum();
                return self.scale.s(d.shape);
            })
                .attr("transform", function (dt, i, n) {
                var node = d3.select(n[i]).node();
                var box = node.getBoundingClientRect();
                var x = self.scale.x(dt[0]) - (box.width / 2.0);
                var y = self.scale.y(dt[1]) - (box.height / 2.0);
                return "translate(" + x + "," + y + ")";
            })
                .style("fill", function () {
                var parent = d3.select(this.parentNode);
                var d = parent.datum();
                return d.fill;
            })
                .on("click", function () {
                self.select(this, d3.event.ctrlKey);
                var label = self._seriesLabel(self.selected);
                self._boundCharts.forEach(function (bc) {
                    bc.selectSeries(label);
                });
            })
                .append("title")
                .text(function (dt, i, n) {
                var data = d3.select(n[i].parentNode.parentNode).datum();
                return data.label + " " + (data.shape
                    ? "(" + data.shape + ")"
                    : "") + "\nx: " + dt[0] + "\ny: " + dt[1];
            });
            window.dispatchEvent(this.event.drawn);
            return this;
        };
        Plot.prototype.height = function () {
            return this.svg.node().getBoundingClientRect().height;
        };
        Plot.prototype.innerHeight = function () {
            return this.height() - this.margin.top - this.margin.bottom;
        };
        Plot.prototype.innerWidth = function () {
            return this.width() - this.margin.left - this.margin.right;
        };
        Plot.prototype.reset = function () { reset(this.id); return this; };
        Plot.prototype.select = function (node, selectOne) {
            if (selectOne === void 0) { selectOne = false; }
            this.svg.selectAll(".data-item")
                .classed("fade", false);
            if (node === undefined) {
                this.selected = undefined;
                return this;
            }
            var self = this;
            if (this.selected && node) {
                this.selected = node.id === this.selected.id ? null : node || null;
            }
            else {
                this.selected = node;
            }
            if (this.selected) {
                if (selectOne) {
                    this.svg.selectAll(".data-item")
                        .each(function () {
                        var sn = d3.select(this);
                        var n = sn.node();
                        sn.classed("fade", n.id === self.selected.id
                            ? false
                            : true);
                    });
                }
                else {
                    var parent_1 = this.selected.parentNode;
                    this.svg.selectAll(".data-item")
                        .each(function () {
                        var result = this.id !== self.selected.id &&
                            this.parentNode.id !== parent_1.id
                            ? true
                            : false;
                        d3.select(this).classed("fade", result);
                    });
                }
            }
            return this;
        };
        Plot.prototype.width = function () {
            return this.svg.node().getBoundingClientRect().width;
        };
        Plot.prototype.selectSeries = function (label) {
            var self = this;
            var found = false;
            self.select();
            if (label !== "") {
                this.svg.selectAll(".series")
                    .each(function () {
                    var n = self.svg.select("#" + this.id);
                    if (!found && n.datum().label === label) {
                        self.select(n.select(".data-item").node());
                        found = true;
                    }
                });
            }
            return this;
        };
        Plot.prototype._seriesLabel = function (node) {
            if (node) {
                var n = node.nodeName === "g"
                    ? node
                    : node.parentNode;
                return this.svg.select("#" + n.id).datum().label;
            }
            return "";
        };
        return Plot;
    }());

    function reset$1(id) {
        var s = d3.select("#" + id);
        var canvas = s.select("g.canvas");
        if (canvas && !canvas.empty()) {
            canvas.selectAll("*").remove();
            canvas.attr("transform", null);
            s.select("g.pending")
                .style("display", null);
        }
    }

    function toNodes$1(template, isSVG = false) {
        try {
            const d = new DOMParser();
            let root;
            if (isSVG) {
                root = d.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${template}</svg>`, "image/svg+xml");
                return root.documentElement.children[0];
            }
            else {
                root = d.parseFromString(template, "text/html");
                return root.body.childNodes[0];
            }
        }
        catch (_a) {
            throw new Error("Error parsing templates string");
        }
    }

    function style$1(id, css) {
        var s = document.getElementById(id);
        s.querySelector("defs")
            .appendChild(toNodes$1("<style type=\"text/css\">" + css + "</style>", true));
    }

    function svg$1(id, width, height) {
        return toNodes$1("<svg id =\"" + id + "\"\n    aria-labelledBy=\"title\" role=\"presentation\"\n    preserveAspectRatio=\"xMinYMin meet\"\n    height=\"100%\" width=\"100%\" viewBox=\"0 0 " + width + " " + height + "\"\n    xmlns=\"http://www.w3.org/2000/svg\"\n    xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <title class=\"accessibleTitle\" lang=\"en\">Chart</title>\n    <defs>\n      <style type=\"text/css\">\n        svg {\n          font-family: Arial, Helvetica, sans-serif;\n          font-size: 1em;\n          user-select: none\n        }\n        .heading {\n          cursor: move;\n          font-size: 1.4em\n        }\n      </style>\n    </defs>\n    <g class=\"canvas\"></g>\n    <g class=\"pending\">\n      <rect height=\"100%\" width=\"100%\" fill=\"#eee\" stroke=\"#ccc\"></rect>\n      <text y=\"50%\" x=\"50%\" alignment-baseline=\"central\" fill=\"#666\" style=\"font-size:1.1em\" text-anchor=\"middle\">Data pending</text>\n    </g>\n  </svg>", true);
    }

    function title$1(id, msg) {
        var s = d3.select("#" + id);
        s.select(".accessibleTitle")
            .text(msg);
        var canvas = s.select(".canvas");
        if (!canvas.empty()) {
            canvas.append("text")
                .attr("class", "heading")
                .attr("x", 20)
                .attr("y", 20)
                .text(msg)
                .call(d3.drag()
                .on("drag", function () {
                d3.select(this)
                    .attr("x", d3.event.x)
                    .attr("y", d3.event.y);
            }));
        }
    }

    var isBrowser = typeof window !== undefined && typeof document !== undefined;

    function isDate(d) {
        const pd = Date.parse(d);
        const rd = isNaN(d);
        const pdt = !isNaN(pd);
        return d instanceof Date || (rd && pdt);
    }

    const isIE11 = isBrowser &&
        !!(window.MSInputMethodContext && document.documentMode);
    const isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

    function pathEllipse$2(cx, cy, rx = 1, ry = 1) {
        let output = `M${cx - rx},${cy}`;
        output += ` a${rx},${ry} 0 1,0 ${2 * rx},0`;
        output += ` a${rx},${ry} 0 1,0 ${-2 * rx},0`;
        return output;
    }

    function pathCircle$2(cx, cy, r = 1) {
        return pathEllipse$2(cx, cy, r, r);
    }

    function pathCross$2(x, y, l) {
        let output = `M${x - l * 0.5}, ${y - l * 1.25}`;
        output += ` h${l} v${l} h${l} v${l} h-${l} v${l} h-${l} v-${l} h-${l} v-${l} h${l}z`;
        return output;
    }

    function pathDiamond$2(x, y, h, w) {
        const sw = w / 2.0;
        const sh = h / 2.0;
        let output = `M${x - sw},${y}`;
        output += ` L${x},${y + sh} L${x + sw},${y} L${x},${y - sh}z`;
        return output;
    }

    function pathRectangle$2(x, y, h, w) {
        const sx = x - (w / 2.0);
        const sy = y - (h / 2.0);
        let output = `M${sx},${sy}`;
        output += ` L${sx},${sy + h} L${sx + w},${sy + h} L${sx + w},${sy}z`;
        return output;
    }

    function pathSquare$2(x, y, l) {
        return pathRectangle$2(x, y, l, l);
    }

    function pathTriangle$2(a, b, c) {
        let output = `M${a[0]},${a[1]}`;
        output += ` L${b[0]},${b[1]} L${c[0]},${c[1]}z`;
        return output;
    }

    var Line = (function () {
        function Line(parentid, id) {
            this._boundCharts = [];
            this._curveFunction = d3.curveLinear;
            this._flipAxis = false;
            this._showArea = true;
            this._showPoints = false;
            this.domain = { s: undefined, x: undefined, y: undefined };
            this.event = { drawn: undefined };
            this.margin = { top: 5, right: 5, bottom: 5, left: 5 };
            this.parseDate = d3.timeParse("%Y-%m-%d");
            this.scale = {
                c: d3.scaleOrdinal(d3.schemeCategory10),
                x: undefined, y: undefined
            };
            this.shapes = [
                { path: pathCircle$2(2.5, 2.5, 2.5), name: "circle" },
                { path: pathTriangle$2([0, 6], [6, 6], [3, 0]), name: "triangle" },
                { path: pathCross$2(3.5, 3.5, 2.25), name: "cross" },
                { path: pathSquare$2(2.5, 2.5, 5), name: "square" },
                { path: pathDiamond$2(3, 3, 6, 6), name: "diamond" }
            ];
            this.title = { heading: undefined, x: undefined, y: undefined };
            this.id = id;
            this.event.drawn = new CustomEvent("drawn", { detail: { id: this.id } });
            var p = document.getElementById(parentid);
            var b = p.getBoundingClientRect();
            p.appendChild(svg$1(id, b.width, b.height));
            this.svg = d3.select("#" + this.id).classed("line", true);
            style$1(this.id, "path.data-item { cursor: pointer }\n    path.area { fill-opacity: 0.8 }\n    path.line { fill: none; stroke-width: 1.5; stroke-linejoin: round; transition: all 500ms }");
        }
        Line.prototype.area = function (show) {
            if (show === void 0) { show = true; }
            this._showArea = show;
            return this;
        };
        Line.prototype.bind = function (charts) {
            var _this = this;
            if (Array.isArray(charts)) {
                charts.forEach(function (c) { return _this._boundCharts.push(c); });
            }
            else {
                this._boundCharts.push(charts);
            }
            return this;
        };
        Line.prototype.curve = function (show) {
            if (show === void 0) { show = false; }
            this._curveFunction = show ? d3.curveBasis : d3.curveLinear;
            return this;
        };
        Line.prototype.data = function (data) {
            var _this = this;
            this._data = data;
            if (this._data.label) {
                this.title.heading = this._data.label.title;
                this.title.x = this._data.label.x;
                this.title.y = this._data.label.y;
            }
            if (data.series[0].shape) {
                var t_1 = [];
                this._data.series
                    .forEach(function (s) { return t_1.push(s.shape); });
                this.domain.s = t_1.filter(function (v, i, a) { return a.indexOf(v) === i; });
            }
            else {
                this.domain.s = ["circle"];
            }
            var dom = [];
            this._data.series.forEach(function (s) {
                if (s.fill === undefined) {
                    s.fill = _this.scale.c(s.label);
                }
                s.values.forEach(function (v) {
                    if (isDate(v[0])) {
                        v[0] = v[0] instanceof Date ? v[0] : _this.parseDate(v[0]);
                    }
                    else {
                        v[0] = +v[0];
                    }
                    dom.push(v);
                });
            });
            this.domain.x = d3.extent(dom, function (d) { return d[0]; });
            this.domain.y = d3.extent(dom, function (d) { return d[1]; });
            return this;
        };
        Line.prototype.draw = function () {
            if (this._data === undefined) {
                return this;
            }
            var self = this;
            var canvas = this.svg.select(".canvas");
            canvas.attr("transform", "translate(" + this.margin.left + " " + this.margin.top + ")");
            this.svg
                .select("g.pending")
                .style("display", "none");
            title$1(this.id, this.title.heading);
            this._setScale();
            this._setFill();
            this._setLine();
            var g = canvas.selectAll("g")
                .data(this._data.series)
                .enter()
                .append("g");
            g.each(function (d) {
                var grp = d3.select(this);
                self._topLayer = grp;
                if (self._showArea) {
                    grp.append("path")
                        .datum(d.values)
                        .attr("d", self._genFill)
                        .attr("class", "area")
                        .attr("fill", function () { return d.fill; })
                        .on("click", function () {
                        grp.raise();
                        self._topLayer = grp;
                    });
                }
                grp.append("path")
                    .datum(d.values)
                    .attr("d", self._genLine)
                    .attr("class", "line")
                    .attr("stroke", function () { return self._showArea
                    ? d3.color(d.fill).darker(1)
                    : d.fill; })
                    .on("click", function () {
                    grp.raise();
                    self._topLayer = grp;
                });
                if (self._showPoints) {
                    grp.selectAll("path.data-item")
                        .data(d.values)
                        .enter()
                        .append("path")
                        .attr("class", "data-item")
                        .attr("fill", function () { return self._showArea
                        ? d3.color(d.fill).darker(1)
                        : d.fill; })
                        .attr("d", function () {
                        var parent = d3.select(this.parentNode);
                        var dt = parent.datum();
                        return self.scale.s(dt.shape);
                    })
                        .attr("transform", function (dt, i, n) {
                        var node = d3.select(n[i]).node();
                        var box = node.getBoundingClientRect();
                        var x = (self._flipAxis
                            ? self.scale.x(dt[1])
                            : self.scale.x(dt[0])) - (box.width / 2.0);
                        var y = (self._flipAxis
                            ? self.scale.y(dt[0])
                            : self.scale.y(dt[1])) - (box.height / 2.0);
                        return "translate(" + x + "," + y + ")";
                    })
                        .append("title")
                        .text(function (dt, i, n) {
                        var data = d3.select(n[i].parentNode.parentNode).datum();
                        return data.label + " " + (data.shape
                            ? "(" + data.shape + ")"
                            : "") + "\nx: " + dt[0] + "\ny: " + dt[1];
                    });
                }
            });
            window.dispatchEvent(this.event.drawn);
            return this;
        };
        Line.prototype.flipAxis = function (enable) {
            if (enable === void 0) { enable = false; }
            this._flipAxis = enable;
            return this;
        };
        Line.prototype.height = function () {
            return this.svg.node().getBoundingClientRect().height;
        };
        Line.prototype.innerHeight = function () {
            return this.height() - this.margin.top - this.margin.bottom;
        };
        Line.prototype.innerWidth = function () {
            return this.width() - this.margin.left - this.margin.right;
        };
        Line.prototype.points = function (show) {
            if (show === void 0) { show = false; }
            this._showPoints = show;
            return this;
        };
        Line.prototype.reset = function () { reset$1(this.id); return this; };
        Line.prototype.width = function () {
            return this.svg.node().getBoundingClientRect().width;
        };
        Line.prototype._setFill = function () {
            var _this = this;
            if (this._flipAxis) {
                this._genFill = d3.area()
                    .curve(this._curveFunction)
                    .x(function (d) { return _this.scale.x(d[1]); })
                    .y0(this.scale.y(this.domain.y[1]))
                    .y1(function (d) { return _this.scale.y(d[0]); });
            }
            else {
                this._genFill = d3.area()
                    .curve(this._curveFunction)
                    .x(function (d) { return _this.scale.x(d[0]); })
                    .y0(this.scale.y(this.domain.y[0]))
                    .y1(function (d) { return _this.scale.y(d[1]); });
            }
        };
        Line.prototype._setLine = function () {
            var _this = this;
            if (this._flipAxis) {
                this._genLine = d3.line()
                    .curve(this._curveFunction)
                    .x(function (d) { return _this.scale.x(d[1]); })
                    .y(function (d) { return _this.scale.y(d[0]); });
            }
            else {
                this._genLine = d3.line()
                    .curve(this._curveFunction)
                    .x(function (d) { return _this.scale.x(d[0]); })
                    .y(function (d) { return _this.scale.y(d[1]); });
            }
        };
        Line.prototype._setScale = function () {
            this.scale.s = d3.scaleOrdinal()
                .domain(this.domain.s)
                .range(this.shapes.map(function (sh) { return sh.path; }));
            if (this._flipAxis) {
                if (isDate(this.domain.x[0])) {
                    this.scale.y = d3.scaleTime()
                        .domain(this.domain.x)
                        .range([0, this.innerHeight()]);
                }
                else {
                    this.scale.y = d3.scaleLinear()
                        .domain(this.domain.x)
                        .range([0, this.innerHeight()]);
                }
                if (isDate(this.domain.y[0])) {
                    this.scale.x = d3.scaleTime()
                        .domain(this.domain.y)
                        .range([0, this.innerWidth()]);
                }
                else {
                    this.scale.x = d3.scaleLinear()
                        .domain(this.domain.y)
                        .range([0, this.innerWidth()]);
                }
            }
            else {
                if (isDate(this.domain.x[0])) {
                    this.scale.x = d3.scaleTime()
                        .domain(this.domain.x)
                        .range([0, this.innerWidth()]);
                }
                else {
                    this.scale.x = d3.scaleLinear()
                        .domain(this.domain.x)
                        .range([0, this.innerWidth()]);
                }
                if (isDate(this.domain.y[0])) {
                    this.scale.y = d3.scaleTime()
                        .domain(this.domain.y)
                        .range([this.innerHeight(), 0]);
                }
                else {
                    this.scale.y = d3.scaleLinear()
                        .domain(this.domain.y)
                        .range([this.innerHeight(), 0]);
                }
            }
        };
        return Line;
    }());

    function kde(kernel, X) {
        return function (V) {
            return X.map(function (x) { return [x, d3.mean(V, function (v) { return kernel(x - v); })]; });
        };
    }
    function kernelEpanechnikov(bandwidth) {
        return function (v) {
            return Math.abs(v /= bandwidth) <= 1 ? 0.75 * (1 - v * v) / bandwidth : 0;
        };
    }

    function getJSON(url, fn) {
        const xhr = XMLHttpRequest
            ? new XMLHttpRequest()
            : new ActiveXObject("Microsoft.XMLHTTP");
        xhr.open("GET", url);
        xhr.onreadystatechange = () => {
            if (xhr.readyState > 3 && xhr.status === 200) {
                fn(JSON.parse(xhr.responseText));
            }
        };
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send();
        return xhr;
    }

    var plot = new Plot("mainPlot", "scatterPlot");
    var lineTop = new Line("topPlot", "lineTopPlot");
    var lineSide = new Line("sidePlot", "lineSidePlot");
    var legend = new Legend(plot);
    legend
        .node("g.series")
        .icon(function (n) {
        var d = legend.datum(n);
        var path = plot.scale.s(d.shape);
        var shape = plot.shapes.find(function (sh) { return sh.path === path; });
        return shape.name;
    })
        .label(function (n) {
        var d = legend.datum(n);
        return d.label + " " + d.shape;
    });
    var contour = new Contour(plot);
    getJSON("data/slide4.json", function (data) {
        var contourData = flatten(data);
        contour.data(contourData);
        plot.data(data).draw();
        lineTop.margin = plot.margin;
        lineTop
            .data(transformLineX(data, plot.innerWidth()))
            .points()
            .draw();
        lineTop.svg
            .selectAll(".data-item")
            .each(function (dt, j) {
            var node = d3$1.select(this);
            if (j > 0 && j % 9 !== 0) {
                node.remove();
            }
        });
        lineSide
            .area(false)
            .flipAxis(true)
            .points(true)
            .data(transformLineY(data, plot.innerHeight()))
            .draw();
        lineSide.svg
            .selectAll(".data-item")
            .each(function (dt, j) {
            var node = d3$1.select(this);
            if (j > 0 && j % 9 !== 0) {
                node.remove();
            }
        });
        legend.toggle();
    });
    function flatten(data) {
        var f = [];
        data.series.forEach(function (s) { return s.values.forEach(function (v) { return f.push(v); }); });
        return f;
    }
    function transformLineX(data, width) {
        var r = {
            series: [
                { label: "ED-based", shape: "circle", values: [] },
                { label: "UCC-based", shape: "circle", values: [] }
            ]
        };
        data.series.forEach(function (s) {
            var i = s.label === "UCC-based" ? 1 : 0;
            s.values.forEach(function (v) {
                r.series[i].values.push(v[0] * 100.0);
            });
        });
        r.series.forEach(function (s) {
            var scale = d3$1.scaleLinear()
                .domain(d3$1.extent(s.values))
                .range([0, width]);
            var ticks = scale.ticks(s.values.length * 0.2);
            var res = kde(kernelEpanechnikov(7), ticks)(s.values);
            res.forEach(function (re) { return re[0] /= 100.0; });
            s.values = res;
        });
        return r;
    }
    function transformLineY(data, width) {
        var r = {
            series: [
                { fill: "#666", label: "GP", shape: "GP", values: [] },
                { fill: "#666", label: "Nurse", shape: "Nurse", values: [] }
            ]
        };
        data.series.forEach(function (s) {
            var i = s.shape === "Nurse" ? 1 : 0;
            s.values.forEach(function (v) {
                r.series[i].values.push(v[1] * 1000.0);
            });
        });
        r.series.forEach(function (s) {
            var scale = d3$1.scaleLinear()
                .domain(d3$1.extent(s.values))
                .range([0, width]);
            var ticks = scale.ticks(s.values.length * 0.2);
            var res = kde(kernelEpanechnikov(7), ticks)(s.values);
            res.forEach(function (re) { return re[0] /= 1000.0; });
            s.values = res;
        });
        return r;
    }
    document.querySelector(".ask")
        .addEventListener("click", function (e) {
        var note = document.querySelector(".note");
        note.style.display = "block";
        setTimeout(function () { return note.style.opacity = "1"; }, 10);
    });
    document.querySelector(".close")
        .addEventListener("click", function (e) {
        var note = document.querySelector(".note");
        note.style.opacity = null;
        setTimeout(function () { return note.style.display = "none"; }, 600);
    });

}(d3));
