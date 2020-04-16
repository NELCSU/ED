import type { TLink, TNode, TSankey } from "../../typings/ED";

export function sankeyModel() {
  const sankey: TSankey = {
    alignHorizontal: () => {
      alignment = "horizontal";
      return sankey;
    },
    alignVertical: () => {
      alignment = "vertical";
      return sankey;
    },
    layout: (iterations: number) => {
      computeNodeLinks();
      computeNodeValues();
      computeNodeStructure();
      if (alignment === "horizontal") {
        computeNodeBreadthsHorizontal();
        computeNodeDepthsHorizontal(iterations);
      } else {
        computeNodeDepthsVertical();
        computeNodeBreadthsVertical(iterations);
      }
      computeLinkDepths();
      return sankey;
    },
    link: () => {
      let curvature = .5;
  
      function link(d: TLink) {
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
        } else {
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
      
      link.curvature = function (n: number | undefined) {
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
    links: (n: TLink[] | undefined) => {
      if (n === undefined) {
        return links;
      }
      links = n;
      return sankey;
    },
    nodePadding: (n: number | undefined) => {
      if (n === undefined) {
        return nodePadding;
      }
      nodePadding = +n;
      return sankey;
    },
    nodes: (n: any[] | undefined) => {
      if (n === undefined) {
        return nodes;
      }
      nodes = n;
      return sankey;
    },
    nodeWidth: (n: number | undefined) => {
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
      function forwardLink(part: number, d: TLink) {
        let x0 = d.source.x + d.source.dx,
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
      function backwardLink(part: number, d: any) {
        let curveExtension = 30;
        let curveDepth = 15;
  
        function getDir(d: any): number {
          return d.source.y + d.sy > d.target.y + d.ty ? -1 : 1;
        }
  
        function p(x: number, y: number): string {
          return x + "," + y + " ";
        }
  
        let dt = getDir(d) * curveDepth,
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
  
      return function (part: any) {
        return (d: TLink) => (d.source.x < d.target.x) ? forwardLink(part, d) : backwardLink(part, d);
      };
    },
    size: (n: number[] | undefined) => {
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
  let nodes: TNode[] = [];
  let links: TLink[] = [];
  const components: any[] = [];

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
      let source = link.source,
          target = link.target;
      if (typeof source === "number") {
        const key = link.source as any;
        source = link.source = nodes[key];
      }
      if (typeof target === "number") {
        const key = link.target as any;
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
        node.value = Math.max(
          // @ts-ignore
          d3.sum(node.sourceLinks, value), d3.sum(node.targetLinks, value)
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
    let nodeStack: any[] = [], index = 0;

    nodes.forEach((node: TNode) => {
      if (!node.index) {
        connect(node);
      }
    });

    function connect(node: TNode) {
      node.index = index++;
      node.lowIndex = node.index;
      node.onStack = true;
      nodeStack.push(node);
      if (node.sourceLinks) {        
        node.sourceLinks.forEach((sourceLink: TLink) => {
          let target = sourceLink.target;
          if (!target.hasOwnProperty('index')) {
            connect(target);
            node.lowIndex = Math.min(node.lowIndex, target.lowIndex);
          } else if (target.onStack) {
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
      component.scc.forEach(function (node: any) {
        node.component = i;
      });
    });
  }

  // Assign the breadth (x-position) for each strongly connected component,
  // followed by assigning breadth within the component.
  function computeNodeBreadthsHorizontal() {
    layerComponents();

    components.forEach(function (component, i) {
      bfs(component.root, function (node: any) {
        let result = node.sourceLinks
          .filter((sourceLink: any) => sourceLink.target.component === i)
          .map((sourceLink: any) => sourceLink.target);
        return result;
      });
    });

    // @ts-ignore
    let componentsByBreadth = d3.nest()
      .key((d: any) => d.x)
      // @ts-ignore
      .sortKeys(d3.ascending)  
      .entries(components)
      .map(d => d.values);

    let max = -1, nextMax = -1;
    
    componentsByBreadth.forEach((c: any[]) => {
      c.forEach(function (component: any) {
        component.x = max + 1;
        component.scc.forEach(function (node: any) {
          if (node.layer) {
            node.x = node.layer;
          } else {
            node.x = component.x + node.x;
          }
          nextMax = Math.max(nextMax, node.x);
        });
      });
      max = nextMax;
    });

    nodes.filter((node) => {
      let outLinks = node.sourceLinks.filter((link: TLink) => link.source.name !== link.target.name);
      return (outLinks.length === 0);
    })
    .forEach((node) => node.x = max);

    scaleNodeBreadths((size[0] - nodeWidth) / Math.max(max, 1));

    function layerComponents() {    
      let remainingComponents = components, nextComponents: any[], visitedIndex: any, x = 0;

      while (remainingComponents.length) {
        nextComponents = [];
        visitedIndex = {};
        remainingComponents.forEach(function (component) {
          component.x = x;
          component.scc.forEach(function (n: any) {
            n.sourceLinks.forEach(function (l: any) {
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

    function bfs(node: any, extractTargets: any) {
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
  
  function computeNodeBreadthsVertical(iterations: number) {
    // @ts-ignore
    let nodesByBreadth = d3.nest()
      .key((d: any) => d.y)
      // @ts-ignore
      .sortKeys(d3.ascending)
      .entries(nodes)
      .map(d => d.values);

    // this bit is actually the node sizes (widths)
    //var ky = (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value)
    // this should be only source nodes surely (level 1)
    // @ts-ignore
    let ky = (size[0] - (nodesByBreadth[0].length - 1) * nodePadding) / d3.sum(nodesByBreadth[0], value);
    nodesByBreadth.forEach((nodes) => {
      nodes.forEach((node: TNode, i: number) => {
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
    function relaxLeftToRight(alpha: number) {
      nodesByBreadth.forEach(function (nodes, breadth) {
        nodes.forEach(function (node: TNode) {
          if (node.targetLinks.length) {
            // @ts-ignore
            let y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.x += (y - center(node)) * alpha;
          }
        });
      });
      
      function weightedSource(link: TLink) {
        return center(link.source) * link.value;
      }
    }

    
    function relaxRightToLeft(alpha: number) {
      nodesByBreadth.slice().reverse()
        .forEach(function (nodes) {
          nodes.forEach(function (node: TNode) {
            if (node.sourceLinks.length) {
              // @ts-ignore
              let y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
              node.x += (y - center(node)) * alpha;
            }
          });
        });
      
      function weightedTarget(link: TLink) {
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
    
    function ascendingDepth(a: TNode, b: TNode): number {
      return b.x - a.x;
    }
  }

  /**
   * @param kx 
   */
  function scaleNodeBreadths(kx: number) {
    nodes.forEach((node: TNode) => {
      if (alignment === "horizontal") {
        node.x *= kx;
      } else {
        node.y *= kx;
      }
    });
  }

  /**
   * @param iterations 
   */
  function computeNodeDepthsHorizontal(iterations: number) {
    // @ts-ignore
    let nodesByBreadth = d3.nest()
      .key((d: any) => d.x)
      // @ts-ignore
      .sortKeys(d3.ascending)
      .entries(nodes)  
      .map((d: any) => d.values);

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
        nodes.forEach(function (node: any, i: number) {
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

    function relaxLeftToRight(alpha: number) {
      nodesByBreadth.forEach(function (nodes, breadth) {
        nodes.forEach(function (node: any) {
          if (node.targetLinks.length) {
            // @ts-ignore
            let y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });
      
      function weightedSource(link: TLink): number {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha: number) {
      nodesByBreadth.slice().reverse()
        .forEach((nodes: TNode[]) => {
          nodes.forEach(function (node: TNode) {
            if (node.sourceLinks.length) {
              // @ts-ignore
              let y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });

      
      function weightedTarget(link: any) {
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
    
    function ascendingDepth(a: TNode, b: TNode): number {
      return a.y - b.y;
    }
  }

  function computeNodeDepthsVertical() {
    let remainingNodes = nodes, nextNodes: TNode[], y = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach((node: TNode) => {
        node.y = y;
        node.sourceLinks.forEach(function (link: TLink) {
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
  function moveSinksDown(y: number) {
    nodes.forEach((node: TNode) => {
      if (!node.sourceLinks.length) {
        node.y = y - 1;
      }
    });
  }

  function computeLinkDepths() {  
    nodes.forEach((node: TNode) => {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });

    nodes.forEach((node: TNode) => {
      let sy = 0, ty = 0;
      
      node.sourceLinks.forEach((link: TLink) => {
        link.sy = sy;
        sy += link.dy;
      });
      
      node.targetLinks.forEach((link: TLink) => {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a: any, b: any) {
      return alignment === "horizontal"
        ? a.source.y - b.source.y
        : a.source.x - b.source.x;
    }

    function ascendingTargetDepth(a: any, b: any) {
      return alignment === "horizontal" 
        ? a.target.y - b.target.y
        : a.target.x - b.target.x;
    }
  }

  function center(node: TNode): number {
    return node.y + node.dy / 2;
  }

  function value(link: TLink): number {
    return link.value;
  }

  return sankey;
}