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
            { path: pathCircle(2.5, 2.5, 2.5), name: "circle" },
            { path: pathTriangle([0, 6], [6, 6], [3, 0]), name: "triangle" },
            { path: pathCross(3.5, 3.5, 2.25), name: "cross" },
            { path: pathSquare(2.5, 2.5, 5), name: "square" },
            { path: pathDiamond(3, 3, 6, 6), name: "diamond" },
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

export { Plot };
