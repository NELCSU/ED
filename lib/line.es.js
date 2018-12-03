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
            { path: pathCircle(2.5, 2.5, 2.5), name: "circle" },
            { path: pathTriangle([0, 6], [6, 6], [3, 0]), name: "triangle" },
            { path: pathCross(3.5, 3.5, 2.25), name: "cross" },
            { path: pathSquare(2.5, 2.5, 5), name: "square" },
            { path: pathDiamond(3, 3, 6, 6), name: "diamond" }
        ];
        this.title = { heading: undefined, x: undefined, y: undefined };
        this.id = id;
        this.event.drawn = new CustomEvent("drawn", { detail: { id: this.id } });
        var p = document.getElementById(parentid);
        var b = p.getBoundingClientRect();
        p.appendChild(svg(id, b.width, b.height));
        this.svg = d3.select("#" + this.id).classed("line", true);
        style(this.id, "path.data-item { cursor: pointer }\n    path.area { fill-opacity: 0.8 }\n    path.line { fill: none; stroke-width: 1.5; stroke-linejoin: round; transition: all 500ms }");
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
        title(this.id, this.title.heading);
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
    Line.prototype.reset = function () { reset(this.id); return this; };
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

export { Line };
