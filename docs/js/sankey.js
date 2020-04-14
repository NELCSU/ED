d3.sankey = function () {
  var sankey = {},
    alignment = "horizontal",
    nodeWidth = 24,
    nodePadding = 8,
    size = [1, 1],
    // @ts-ignore
    nodes = [], links = [], components = [];

  sankey.alignHorizontal = function () {
    alignment = "horizontal";
    return sankey;
  };

  sankey.alignVertical = function () {
    alignment = "vertical";
    return sankey;
  };

  // @ts-ignore
  sankey.nodeWidth = function (_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  // @ts-ignore
  sankey.nodePadding = function (_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  // @ts-ignore
  sankey.nodes = function (_) {
    // @ts-ignore
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  // @ts-ignore
  sankey.links = function (_) {
    // @ts-ignore
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  // @ts-ignore
  sankey.size = function (_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  // @ts-ignore
  sankey.layout = function (iterations) {
    computeNodeLinks();
    computeNodeValues();

    computeNodeStructure();

    if (alignment === "horizontal") {
      computeNodeBreadthsHorizontal();
      computeNodeDepthsHorizontal(iterations);
    } else {
      computeNodeDepthsVertical();
      // @ts-ignore
      computeNodeBreadthsVertical(iterations);
    }

    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function () {
    computeLinkDepths();
    return sankey;
  };

  /**
   * @description A more involved path generator that requires 3 elements to render.
   * It draws a starting element, intermediate and end element that are useful
   * while drawing reverse links to get an appropriate fill.
   * Each link is now an area and not a basic spline and no longer guarantees
   * fixed width throughout.
   * @example
   * linkNodes = this._svg.append("g")
   *    .selectAll(".link")
   *    .data(this.links)
   *    .enter().append("g")
   *      .attr("fill", "none")
   *      .attr("class", ".link")
   *      .sort(function(a, b) { return b.dy - a.dy; });
   * 
   * linkNodePieces = [];
   * for (var i = 0; i < 3; i++) {
   *    linkNodePieces[i] = linkNodes.append("path")
   *       .attr("class", ".linkPiece")
   *       .attr("d", path(i))
   *       .attr("fill", ...)
   * }
   */
  sankey.reversibleLink = function () {
    var curvature = .5;

    // Used when source is behind target, the first and last paths are simple
    // lines at the start and end node while the second path is the spline
    // @ts-ignore
    function forwardLink(part, d) {
      var x0 = d.source.x + d.source.dx,
        x1 = d.target.x,
        // @ts-ignore
        xi = d3.interpolateNumber(x0, x1),
        x2 = xi(curvature),
        x3 = xi(1 - curvature),
        y0 = d.source.y + d.sy,
        y1 = d.target.y + d.ty,
        y2 = d.source.y + d.sy + d.dy,
        y3 = d.target.y + d.ty + d.dy;

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

    // Used for self loops and when the source is actually in front of the 
    // target; the first element is a turning path from the source to the 
    // destination, the second element connects the two twists and the last 
    // twists into the target element.
    //
    // 
    //  /--Target
    //  \----------------------\
    //                 Source--/
    // @ts-ignore
    function backwardLink(part, d) {
      var curveExtension = 30;
      var curveDepth = 15;

      // @ts-ignore
      function getDir(d) {
        return d.source.y + d.sy > d.target.y + d.ty ? -1 : 1;
      }

      // @ts-ignore
      function p(x, y) {
        return x + "," + y + " ";
      }

      var dt = getDir(d) * curveDepth,
        x0 = d.source.x + d.source.dx,
        y0 = d.source.y + d.sy,
        x1 = d.target.x,
        y1 = d.target.y + d.ty;

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

    // @ts-ignore
    return function (part) {
      // @ts-ignore
      return function (d) {
        if (d.source.x < d.target.x) {
          return forwardLink(part, d);
        } else {
          return backwardLink(part, d);
        }
      }
    }
  };

  /**
   * 
   */
  sankey.link = function () {
    var curvature = .5;

    /**
     * 
     * @param {any} d 
     */
    function link(d) {
      var x0, x1, i, y0, y1;
      if (alignment === "horizontal") {
        var x2, x3;
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
      } else {
        var y2, y3;
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

    // @ts-ignore
    link.curvature = function (_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    // @ts-ignore
    nodes.forEach(function (node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });

    // @ts-ignore
    links.forEach(function (link) {
      var source = link.source,
        target = link.target;
      // @ts-ignore
      if (typeof source === "number") source = link.source = nodes[link.source];
      // @ts-ignore
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  /**
   * Compute the value (size) of each node by summing the associated links.
   */
  function computeNodeValues() {
    // @ts-ignore
    nodes.forEach(function (node) {
      if (!(node.value)) {
        node.value = Math.max(
          // @ts-ignore
          d3.sum(node.sourceLinks, value),
          // @ts-ignore
          d3.sum(node.targetLinks, value)
        );
      }
    });
  }

  /**
   * @description
   * Take the list of nodes and create a DAG of supervertices, each consisting of a strongly connected component of the graph
   * @see http://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm
   */
  function computeNodeStructure() {
    // @ts-ignore
    var nodeStack = [],
      index = 0;

    // @ts-ignore
    nodes.forEach(function (node) {
      if (!node.index) {
        connect(node);
      }
    });

    // @ts-ignore
    function connect(node) {
      node.index = index++;
      node.lowIndex = node.index;
      node.onStack = true;
      nodeStack.push(node);

      if (node.sourceLinks) {
        // @ts-ignore
        node.sourceLinks.forEach(function (sourceLink) {
          var target = sourceLink.target;
          if (!target.hasOwnProperty('index')) {
            connect(target);
            node.lowIndex = Math.min(node.lowIndex, target.lowIndex);
          } else if (target.onStack) {
            node.lowIndex = Math.min(node.lowIndex, target.index);
          }
        });

        if (node.lowIndex === node.index) {
          var component = [],
            currentNode;
          do {
            // @ts-ignore
            currentNode = nodeStack.pop()
            currentNode.onStack = false;
            component.push(currentNode);
          } while (currentNode != node);
          components.push({
            root: node,
            scc: component
          });
        }
      }
    }

    // @ts-ignore
    components.forEach(function (component, i) {
      component.index = i;
      // @ts-ignore
      component.scc.forEach(function (node) {
        node.component = i;
      });
    });
  }

  // Assign the breadth (x-position) for each strongly connected component,
  // followed by assigning breadth within the component.
  function computeNodeBreadthsHorizontal() {

    layerComponents();

    // @ts-ignore
    components.forEach(function (component, i) {
      // @ts-ignore
      bfs(component.root, function (node) {
        var result = node.sourceLinks
          // @ts-ignore
          .filter(function (sourceLink) {
            return sourceLink.target.component == i;
          })
          // @ts-ignore
          .map(function (sourceLink) {
            return sourceLink.target;
          });
        return result;
      });
    });

    var max = 0;
    // @ts-ignore
    var componentsByBreadth = d3.nest()
      // @ts-ignore
      .key(function (d) {
        return d.x;
      })
      // @ts-ignore
      .sortKeys(d3.ascending)
      // @ts-ignore
      .entries(components)
      // @ts-ignore
      .map(function (d) {
        return d.values;
      });

    var max = -1,
      nextMax = -1;
    // @ts-ignore
    componentsByBreadth.forEach(function (c) {
      // @ts-ignore
      c.forEach(function (component) {
        component.x = max + 1;
        // @ts-ignore
        component.scc.forEach(function (node) {
          if (node.layer) node.x = node.layer;
          else node.x = component.x + node.x;
          nextMax = Math.max(nextMax, node.x);
        });
      });
      max = nextMax;
    });

    // @ts-ignore
    nodes.filter(function (node) {
        // @ts-ignore
        var outLinks = node.sourceLinks.filter(function (link) {
          return link.source.name != link.target.name;
        });
        return (outLinks.length == 0);
      })
      .forEach(function (node) {
        node.x = max;
      })

    scaleNodeBreadths((size[0] - nodeWidth) / Math.max(max, 1));

    // @ts-ignore
    function flatten(a) {
      return [].concat.apply([], a);
    }

    function layerComponents() {
      // @ts-ignore
      var remainingComponents = components, nextComponents, visitedIndex, x = 0;

      while (remainingComponents.length) {
        nextComponents = [];
        visitedIndex = {};

        remainingComponents.forEach(function (component) {
          component.x = x;

          // @ts-ignore
          component.scc.forEach(function (n) {
            // @ts-ignore
            n.sourceLinks.forEach(function (l) {
              // @ts-ignore
              if (!visitedIndex.hasOwnProperty(l.target.component) &&
                l.target.component != component.index) {
                // @ts-ignore
                nextComponents.push(components[l.target.component]);
                visitedIndex[l.target.component] = true;
              }
            })
          });
        });

        // @ts-ignore
        remainingComponents = nextComponents;
        ++x;
      }
    }

    // @ts-ignore
    function bfs(node, extractTargets) {
      var queue = [node],
        currentCount = 1,
        nextCount = 0;
      var x = 0;

      while (currentCount > 0) {
        var currentNode = queue.shift();
        currentCount--;

        if (!currentNode.hasOwnProperty('x')) {
          currentNode.x = x;
          currentNode.dx = nodeWidth;

          var targets = extractTargets(currentNode);

          queue = queue.concat(targets);
          nextCount += targets.length;
        }


        if (currentCount == 0) { // level change
          x++;
          currentCount = nextCount;
          nextCount = 0;
        }

      }
    }
  }

  // @ts-ignore
  function computeNodeBreadthsVertical(iterations) {
    // @ts-ignore
    var nodesByBreadth = d3.nest()
      // @ts-ignore
      .key(function (d) {
        return d.y;
      })
      // @ts-ignore
      .sortKeys(d3.ascending)
      // @ts-ignore
      .entries(nodes)
      // @ts-ignore
      .map(function (d) {
        return d.values;
      }); // values! we are using the values also as a way to seperate nodes (not just stroke width)?

    // this bit is actually the node sizes (widths)
    //var ky = (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value)
    // this should be only source nodes surely (level 1)
    // @ts-ignore
    var ky = (size[0] - (nodesByBreadth[0].length - 1) * nodePadding) / d3.sum(nodesByBreadth[0], value);
    // I'd like them to be much bigger, this calc doesn't seem to fill the space!?
    // @ts-ignore
    nodesByBreadth.forEach(function (nodes) {
      // @ts-ignore
      nodes.forEach(function (node, i) {
        node.x = i;
        node.dy = node.value * ky;
      });
    });

    // @ts-ignore
    links.forEach(function (link) {
      link.dy = link.value * ky;
    });

    resolveCollisions();

    for (var alpha = 1; iterations > 0; --iterations) {
      relaxLeftToRight(alpha);
      resolveCollisions();

      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
    }

    // these relax methods should probably be operating on one level of the nodes, not all!?

    // @ts-ignore
    function relaxLeftToRight(alpha) {
      // @ts-ignore
      nodesByBreadth.forEach(function (nodes, breadth) {
        // @ts-ignore
        nodes.forEach(function (node) {
          if (node.targetLinks.length) {
            // @ts-ignore
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.x += (y - center(node)) * alpha;
          }
        });
      });

      // @ts-ignore
      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    // @ts-ignore
    function relaxRightToLeft(alpha) {
      // @ts-ignore
      nodesByBreadth.slice().reverse().forEach(function (nodes) {
        // @ts-ignore
        nodes.forEach(function (node) {
          if (node.sourceLinks.length) {
            // @ts-ignore
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.x += (y - center(node)) * alpha;
          }
        });
      });

      // @ts-ignore
      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      // @ts-ignore
      nodesByBreadth.forEach(function (nodes) {
        var node,
          dy,
          x0 = 0,
          n = nodes.length,
          i;

        // Push any overlapping nodes right.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = x0 - node.x;
          if (dy > 0) node.x += dy;
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
            if (dy > 0) node.x -= dy;
            x0 = node.x;
          }
        }
      });
    }

    // @ts-ignore
    function ascendingDepth(a, b) {
      //return a.y - b.y; // flows go up
      return b.x - a.x; // flows go down
      //return a.x - b.x;
    }
  }

  /**
   * 
   * @param {number} kx 
   */
  function scaleNodeBreadths(kx) {
    // @ts-ignore
    nodes.forEach(function (node) {
      if (alignment === "horizontal") {
        node.x *= kx;
      } else {
        node.y *= kx;
      }
    });
  }

  /**
   * 
   * @param {number} iterations 
   */
  function computeNodeDepthsHorizontal(iterations) {
    // @ts-ignore
    var nodesByBreadth = d3.nest()
      // @ts-ignore
      .key(function (d) {
        return d.x;
      })
      // @ts-ignore
      .sortKeys(d3.ascending)
      // @ts-ignore
      .entries(nodes)
      // @ts-ignore
      .map(function (d) {
        return d.values;
      });

    initializeNodeDepth();
    resolveCollisions();

    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      // @ts-ignore
      var ky = d3.min(nodesByBreadth, function (nodes) {
        // @ts-ignore
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      // @ts-ignore
      nodesByBreadth.forEach(function (nodes) {
        // @ts-ignore
        nodes.forEach(function (node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      // @ts-ignore
      links.forEach(function (link) {
        link.dy = link.value * ky;
      });
    }

    // @ts-ignore
    function relaxLeftToRight(alpha) {
      // @ts-ignore
      nodesByBreadth.forEach(function (nodes, breadth) {
        // @ts-ignore
        nodes.forEach(function (node) {
          if (node.targetLinks.length) {
            // @ts-ignore
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      // @ts-ignore
      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    // @ts-ignore
    function relaxRightToLeft(alpha) {
      // @ts-ignore
      nodesByBreadth.slice().reverse().forEach(function (nodes) {
        // @ts-ignore
        nodes.forEach(function (node) {
          if (node.sourceLinks.length) {
            // @ts-ignore
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      // @ts-ignore
      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      // @ts-ignore
      nodesByBreadth.forEach(function (nodes) {
        var node,
          dy,
          y0 = 0,
          n = nodes.length,
          i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
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
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    // @ts-ignore
    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  /**
   * 
   */
  function computeNodeDepthsVertical() {
    // @ts-ignore
    var remainingNodes = nodes, nextNodes, y = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function (node) {
        node.y = y;
        //node.dx = nodeWidth;
        // @ts-ignore
        node.sourceLinks.forEach(function (link) {
          // @ts-ignore
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target);
          }
        });
      });
      // @ts-ignore
      remainingNodes = nextNodes;
      ++y;
    }

    // move end points to the very bottom
    moveSinksDown(y);

    scaleNodeBreadths((size[1] - nodeWidth) / (y - 1));
  }

  // this moves all end points (sinks!) to the most extreme bottom
  // @ts-ignore
  function moveSinksDown(y) {
    // @ts-ignore
    nodes.forEach(function (node) {
      if (!node.sourceLinks.length) {
        node.y = y - 1;
      }
    });
  }

  /**
   * 
   */
  function computeLinkDepths() {
    // @ts-ignore
    nodes.forEach(function (node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });

    // @ts-ignore
    nodes.forEach(function (node) {
      var sy = 0,
        ty = 0;
      // @ts-ignore
      node.sourceLinks.forEach(function (link) {
        link.sy = sy;
        sy += link.dy;
      });
      // @ts-ignore
      node.targetLinks.forEach(function (link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    /**
     * 
     * @param {any} a 
     * @param {any} b 
     */
    function ascendingSourceDepth(a, b) {
      return alignment === "horizontal" ?
        a.source.y - b.source.y :
        a.source.x - b.source.x;
    }

    /**
     * 
     * @param {*} a 
     * @param {*} b 
     */
    function ascendingTargetDepth(a, b) {
      return alignment === "horizontal" ?
        a.target.y - b.target.y :
        a.target.x - b.target.x;
    }
  }

  /**
   * 
   * @param {any} node 
   */
  function center(node) {
    return node.y + node.dy / 2;
  }

  /**
   * 
   * @param {any} link 
   */
  function value(link) {
    return link.value;
  }

  return sankey;
};