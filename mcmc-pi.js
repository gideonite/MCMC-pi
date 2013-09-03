//
// takes a dom element and a radius, returns an object with functions start,
// stop, and reset.
//
// *signature:* `dom el, number -> {function start, function stop, function reset}`
function mcmc_pi(dom_el, r) {
    var margin = {
        top: 5,
        left: 5
    };

    var container = d3.select(dom_el);

    var svg = d3.select(dom_el)
        .append('svg')
        .attr('height', 2 * r + margin.top)
        .attr('width', 2 * r + margin.left);

    // *signature:* `number, number -> string`
    function translate(x,y) {
        return "translate(" + x + "," + y + ")";
    }

    // for all practical purposes, everything goes into this <svg:g>, so let's
    // just forget about the original <svg>
    svg = svg.append('g')
        .attr('transform', translate(margin.left, margin.top));

    // set the backdrop : a circle, a square, and a textbox
    svg.append('circle')
        .attr('r', r)
        .attr('cx', r)
        .attr('cy', r)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        ;

    svg.append('rect')
        .attr('height', 2 * r)
        .attr('width', 2 * r)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        ;

    var pi_num_container = container.append('h2');
    pi_num_container.style('font-size', '45px');

    var scale = d3.scale.linear()
        .domain([0,1])          // random numbers between 0 and 1
        .range([0, 2 * r]);

    function update() {
        var x = scale(Math.random());
        var y = scale(Math.random());

        append_circle(x, y);
        pi = next_pi(x, y);
        pi_num_container.text(calculate_pi(pi));

        //console.log(pi);
    }

    // takes the coordinates of a point as [x,y] and tells you whether or not
    // it landed in the circle
    //
    // *signature:* `[number, number] -> boolean`
    function isin_circle(x,y) {
        function sqr(n) {
            return Math.pow(n, 2);
        }

        return sqr(x - r) + sqr(y - r) <= sqr(r);
    }

    // pi state variable
    //
    // keeps track of the number of points in the circle and the total number
    // of points sampled
    var pi = {
        in_circle: 0,
        total: 0
    };

    //*signature:* `{pi state} -> float`
    function calculate_pi(pi) {
        // TODO: improve precision
        return (4 * parseFloat(pi.in_circle) / pi.total).toPrecision(20);
    }

    // takes the coordinates of the next point and creates the next pi state
    //
    // *signature:* `number, number -> {pi state}`
    function next_pi(x, y) {
        return {
            in_circle: pi.in_circle + (isin_circle(x,y) ? 1 : 0),
            total: pi.total + 1
        }
    }

    var point_class = 'point';
    // appends a circle to the `svg` element globally defined with a center at
    // the coordinates (x,y)
    //
    // *signature:* `number, number -> dom el`
    function append_circle(x, y) {
        var circle = svg.append('circle')
            .attr('class', point_class)
            .attr('r', 0)
            .attr('cx', x)
            .attr('cy', y)
            .attr('fill', 'black')
            .attr('stroke', 'none');

        circle.transition().attr('r', 1.5)
            .transition().attr('r', 1);

        return circle[0][0];
    }

    var updating;       // id of updating process

    return {
        start: function() {
                   if (!updating) {
                       // only start updating if not currently updating
                       updating = setInterval(update, 10);
                   }
               },
        stop: function() {
                  clearInterval(updating);
                  // 0 means no longer updating, it's the falsy number
                  updating = 0;
              },
        reset: function() {
            // remove all circles
            svg.selectAll('.' + point_class).remove();

            // reset pi state
            pi = { in_circle: 0, total: 0};

            // remove pi value from text field
            pi_num_container[0][0].innerHTML="";
        }
    }
}
