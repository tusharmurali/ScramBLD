var letter_pairs = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X"];

// Binds events
function initUI(){
    $('#go').click( solveAndDisplay );
    $('#scramble').keyup(function () {
        var scramble = $(this).val().trim();
        localStorage.setItem('scramble', scramble); // Update localStorage with new scramble
        solveAndDisplay();
    });

    // Solving style options
    $('#op-corners').click(function(){
        corner_style = OP;
        localStorage.setItem('corner_style', 'OP');
        $('#op-corners').addClass('active-btn').removeClass('inactive-btn');
        $('#3style-corners').addClass('inactive-btn').removeClass('active-btn');
        solveAndDisplay();
    });
    $('#3style-corners').click(function(){
        corner_style = BH;
        localStorage.setItem('corner_style', 'BH');
        $('#op-corners').addClass('inactive-btn').removeClass('active-btn');
        $('#3style-corners').addClass('active-btn').removeClass('inactive-btn');
        solveAndDisplay();
    });
    $('#op-edges').click(function(){
        edge_style = OP;
        localStorage.setItem('edge_style', 'OP');
        $('#op-edges').addClass('active-btn').removeClass('inactive-btn');
        $('#m2-edges').addClass('inactive-btn').removeClass('active-btn');
        $('#3style-edges').addClass('inactive-btn').removeClass('active-btn');
        solveAndDisplay();
    });
    $('#m2-edges').click(function(){
        edge_style = M2;
        localStorage.setItem('edge_style', 'M2');
        $('#op-edges').addClass('inactive-btn').removeClass('active-btn');
        $('#m2-edges').addClass('active-btn').removeClass('inactive-btn');
        $('#3style-edges').addClass('inactive-btn').removeClass('active-btn');
        solveAndDisplay();
    });
    $('#3style-edges').click(function(){
        edge_style = BH;
        localStorage.setItem('edge_style', 'BH');
        $('#op-edges').addClass('inactive-btn').removeClass('active-btn');
        $('#m2-edges').addClass('inactive-btn').removeClass('active-btn');
        $('#3style-edges').addClass('active-btn').removeClass('inactive-btn');
        solveAndDisplay();
    });
    $('#orient-y-').click(function(){
        changeOrientation("y'");
        solveAndDisplay();
    });
    $('#orient-y').click(function(){
        changeOrientation("y");
        solveAndDisplay();
    });
    $('#orient-x-').click(function(){
        changeOrientation("x'");
        solveAndDisplay();
    });
    $('#orient-x').click(function(){
        changeOrientation("x");
        solveAndDisplay();
    });

    // Initialize scramble generator
    scramblers["333"].initialize(null, Math);

    // Solving style options
    $('#get-scramble').click(function(){
        $('#scramble').val(scramblers["333"].getRandomScramble().scramble_string.replace(/  /g, ' '));
        solveAndDisplay();
    });

    // Inits and renders the cube in its solved state
    initCube();
    initCubeCanvas('cube_canvas');
    renderCube();

    // If a scramble param is found in the URL, it is applied to the cube and solved
    // Otherwise, load scramble from localStorage if no scramble param in URL
    if ( !applyUrlScramble() ) {
        var savedScramble = localStorage.getItem('scramble');
        if (savedScramble) {
            $('#scramble').val(savedScramble);
            solveAndDisplay();
        }
    }

    // Load corner style preference from localStorage
    var savedCornerStyle = localStorage.getItem('corner_style');
    if (savedCornerStyle === 'OP') {
        $('#op-corners').click();
    } else if (savedCornerStyle === 'BH') {
        $('#3style-corners').click();
    }

    // Load edge style preference from localStorage
    var savedEdgeStyle = localStorage.getItem('edge_style');
    if (savedEdgeStyle === 'OP') {
        $('#op-edges').click();
    } else if (savedEdgeStyle === 'M2') {
        $('#m2-edges').click();
    } else if (savedEdgeStyle === 'BH') {
        $('#3style-edges').click();
    }
}

// Figures out a solution for the cube and displays it
function solveAndDisplay(){
    // Scramble the cube
    var scramble_str = $('#scramble').val();
    var is_valid_scramble = true;

    var valid_permutations = ["U","U'","U2","L","L'","L2","F","F'","F2","R","R'","R2","B","B'","B2","D","D'","D2","M","M'","M2","S","S'","S2","E","E'","E2","u","u'","u2","l","l'","l2","f","f'","f2","r","r'","r2","b","b'","b2","d","d'","d2","x","x'","x2","y","y'","y2","z","z'","z2"];
    var scramble = scramble_str.split(" ");
    var permutations = [];
    for (var i=0; i<scramble.length; i++ ){
        if ( valid_permutations.indexOf(scramble[i]) != -1 ){
            permutations.push(scramble[i]);
        }
        else if ( scramble[i] != '' ) {
            is_valid_scramble = false;
        }
    }

    // Invalid permutations are removed from the scramble
    var valid_scramble = permutations.join(" ");
    if ( !is_valid_scramble ){
        $('#scramble').val(valid_scramble + " ");
    }

    // URL is updated
    setScrambleInUrl(valid_scramble);

    // Cube is scrambled
    scrambleCube(valid_scramble);

    // Cube with the applied moves is rendered
    renderCube();

    // Solve the cube
    solveCube();

    // Solution to the scramble
    var edgeCyclesLength = edge_cycles.length;
    var cornerCyclesLength = corner_cycles.length;
    var solution = '';
    var edges_solution = '';
    var corners_solution = '';

    // Orientation
    if ( rotations.length != 0 ){
        solution += "// Orientation <br>";
        for (var i=0; i<rotations.length; i++){
            solution += rotations[i] + ' ';
        }
        solution += '<br><br>';
    }

    // TODO: Indicate when this is being done for both edges and corners

    // Add flipped edges as edge cycles
    if ( edge_style == OP ) {
        for (var i=0; i<flipped_edges.length; i++){
            for (var j = 0; j<12; j++) {
                if ( edge_cubies[j][0] == flipped_edges[i] ) {
                    // To flip an edge, append the cycle given by both stickers of that edge
                    edge_cycles.push(flipped_edges[i], edge_cubies[j][1]);
                }
            }
        }
    }

    // Edges
    var edge_pairs = '';
    if ( edge_cycles.length != 0 || flipped_edges.length != 0 ) {
        solution += "// Edges <br>";
        for (var i=0; i<edge_cycles.length; i++){
            if (i >= edgeCyclesLength && (i - edgeCyclesLength) % 2 == 0) {
                solution += "// Flip " + letter_pairs[edge_cycles[i]] + "<br>";
                if (edgeCyclesLength != 0 || i != 0) {
                    edge_pairs += "<br>";
                }
                edge_pairs += "<b>Flip " + letter_pairs[edge_cycles[i]] + "&nbsp;&nbsp;</b>";
            }
            edge_pairs += letter_pairs[edge_cycles[i]];
            if ( i%2==1 && i < edgeCyclesLength ){
                edge_pairs += " ";
            }

            // Display OP solution
            if ( edge_style == OP ) {
                if ( edge_cycles[i] != 3 ){
                    solution += "[" + op_setups_edges[edge_cycles[i]] + ": " + t_perm + "]" + " // " + letter_pairs[edge_cycles[i]] + "<br>";
                    edge_solution = "[" + op_setups_edges[edge_cycles[i]] + ": " + t_perm + "]";
                    edges_solution += "<b>" + letter_pairs[edge_cycles[i]] + "&nbsp;&nbsp;</b>" + buildAlgCubingLink(edge_solution) + "<br>";
                }
                else {
                    solution += t_perm + " // " + letter_pairs[edge_cycles[i]] +  "<br>";
                    edges_solution += "<b>" + letter_pairs[edge_cycles[i]] + "&nbsp;&nbsp;</b>" + buildAlgCubingLink(t_perm) +  "<br>";
                }
            }
            // Display M2 solution
            else if ( edge_style == M2 ) {
                if ( i%2==1 && (edge_cycles[i]==I || edge_cycles[i]==S || edge_cycles[i]==C || edge_cycles[i]==W) ){
                    solution += m2_edges[m2_mappings[edge_cycles[i]]] + " // " + letter_pairs[edge_cycles[i]] + "<br>";
                    edges_solution += "<b>" + letter_pairs[edge_cycles[i]] + " </b>" + buildAlgCubingLink(m2_edges[m2_mappings[edge_cycles[i]]]) + "<br>";
                }
                else {
                    solution += m2_edges[edge_cycles[i]] + " // " + letter_pairs[edge_cycles[i]] + "<br>";
                    edges_solution += "<b>" + letter_pairs[edge_cycles[i]] + " </b>" + buildAlgCubingLink(m2_edges[edge_cycles[i]]) + "<br>";
                }
            }
            // Display 3-style solution
            else if ( i%2==0 ){
                solution += bh_edges[edge_cycles[i]][edge_cycles[i+1]] + " // " + letter_pairs[edge_cycles[i]] + letter_pairs[edge_cycles[i+1]] + "<br>";
                edges_solution += "<b>" + letter_pairs[edge_cycles[i]] + letter_pairs[edge_cycles[i+1]] + " </b>" + buildAlgCubingLink(bh_edges[edge_cycles[i]][edge_cycles[i+1]]) + "<br>";
            }
        }

        if (edge_style != OP && flipped_edges.length != 0){
            edge_pairs += "<br>Flip: ";
            for (var i=0; i<flipped_edges.length; i++){
                edge_pairs += letter_pairs[flipped_edges[i]] + " ";
                if ( edge_flip_setups[flipped_edges[i]] == "" ){
                    solution += edge_flip_alg + " // Flip " + letter_pairs[flipped_edges[i]] + "<br>";
                    edges_solution += "<b>Flip " + letter_pairs[flipped_edges[i]] + " </b>" + buildAlgCubingLink(edge_flip_alg) + "<br>";
                }
                else{
                    solution += "[" + edge_flip_setups[flipped_edges[i]] + ": " + edge_flip_alg + "] // Flip " + letter_pairs[flipped_edges[i]] + "<br>";
                    edge_solution = "[" + edge_flip_setups[flipped_edges[i]] + ": " + edge_flip_alg + "]";
                    edges_solution += "<b>Flip " + letter_pairs[flipped_edges[i]] + " </b>" + buildAlgCubingLink(edge_solution) + "<br>";
                }
            }
        }
        solution += "<br>";
    }

    // Display parity algorithm if there is parity
    if ( edge_style == OP && edge_cycles.length%2 == 1 ) {
        solution += "// Parity Algorithm <br>";
        solution += ra_perm + "<br><br>";
        $('#parity-algorithm').html("<b>Ra Perm&nbsp;&nbsp;</b><br>" + buildAlgCubingLink(ra_perm));
        $('#parity').show()
    } else {
        $('#parity').hide()
    }

    // Add flipped corners as corner cycles
    if ( corner_style == OP ) {
        for (var i=0; i<cw_corners.length; i++){
            for (var j = 0; j<8; j++) {
                if ( corner_cubies[j][0] == cw_corners[i] ) {
                    // To rotate a corner, append the cycle given by two CW stickers of that corner
                    corner_cycles.push(cw_corners[i], corner_cubies[j][1]);
                }
            }
        }
        for (var i=0; i<ccw_corners.length; i++){
            for (var j = 0; j<8; j++) {
                if ( corner_cubies[j][0] == ccw_corners[i] ) {
                    // To rotate a corner, append the cycle given by two CCW stickers of that corner
                    corner_cycles.push(ccw_corners[i], corner_cubies[j][2]);
                }
            }
        }
    }

    // Corners
    var corner_pairs = '';
    if ( corner_cycles.length != 0 || cw_corners.length != 0 || ccw_corners.length != 0 ) {
        solution += "// Corners <br>";
        for (var i=0; i<corner_cycles.length; i++){
            if (i >= cornerCyclesLength && (i - cornerCyclesLength) % 2 == 0) {
                solution += "// Twist " + letter_pairs[corner_cycles[i]] + "<br>";
                if (cornerCyclesLength != 0 || i != 0) {
                    corner_pairs += "<br>";
                }
                corner_pairs += "<b>Twist " + (i < cornerCyclesLength + cw_corners.length * 2 ? "Clockwise " : "Counterclockwise ")
                    + letter_pairs[corner_cycles[i]] + "&nbsp;&nbsp;</b>";
            }
            corner_pairs += letter_pairs[corner_cycles[i]];
            if ( i%2==1 && i < cornerCyclesLength ){
                corner_pairs += " ";
            }

            // Display OP solution
            if ( corner_style == OP || (i%2==0 && i==(corner_cycles.length-1)) ) {
                if ( corner_cycles[i] != 15 ){
                    solution += "[" + op_setups[corner_cycles[i]] + ": " + y_perm + "]" + " // " + letter_pairs[corner_cycles[i]] + "<br>";
                    corner_solution = "[" + op_setups[corner_cycles[i]] + ": " + y_perm + "]";
                    corners_solution += "<b>" + letter_pairs[corner_cycles[i]] + "&nbsp;&nbsp;</b>" + buildAlgCubingLink(corner_solution) + "<br>";
                }
                else {
                    solution += y_perm + " // " + letter_pairs[corner_cycles[i]] +  "<br>";
                    corners_solution += "<b>" + letter_pairs[corner_cycles[i]] + "&nbsp;&nbsp;</b>" + buildAlgCubingLink(y_perm) +  "<br>";
                }
            }
            // Display 3-style solution
            else if ( i%2==0 ){
                solution += bh_corners[corner_cycles[i]][corner_cycles[i+1]] + " // " + letter_pairs[corner_cycles[i]] + letter_pairs[corner_cycles[i+1]] + "<br>";
                corners_solution += "<b>" + letter_pairs[corner_cycles[i]] + letter_pairs[corner_cycles[i+1]] + " </b>" + buildAlgCubingLink(bh_corners[corner_cycles[i]][corner_cycles[i+1]]) + "<br>";
            }
        }
        if (corner_style != OP && cw_corners.length != 0){
            corner_pairs += "<br>Twist Clockwise: ";
            for (var i=0; i<cw_corners.length; i++){
                corner_pairs += letter_pairs[cw_corners[i]] + " ";

                if ( corner_flip_setups[cw_corners[i]] == "" ){
                    solution += cw_corner_flip_alg + " // Flip " + letter_pairs[cw_corners[i]] + "<br>";
                    corners_solution += "<b>Flip " + letter_pairs[cw_corners[i]] + " </b>" + buildAlgCubingLink(cw_corner_flip_alg) + "<br>";
                }
                else {
                    solution += "[" + corner_flip_setups[cw_corners[i]] + ": " + cw_corner_flip_alg + "] // Flip " + letter_pairs[cw_corners[i]] + "<br>";
                    corner_solution = "[" + corner_flip_setups[cw_corners[i]] + ": " + cw_corner_flip_alg + "]";
                    corners_solution +=  "<b>Flip " + letter_pairs[cw_corners[i]] + " </b>" + buildAlgCubingLink(corner_solution) + "<br>";
                }
            }
        }
        if (corner_style != OP && ccw_corners.length != 0){
            corner_pairs += "<br>Twist Counterclockwise: ";
            for (var i=0; i<ccw_corners.length; i++){
                corner_pairs += letter_pairs[ccw_corners[i]] + " ";

                if ( corner_flip_setups[ccw_corners[i]] == "" ){
                    solution += ccw_corner_flip_alg + " // Flip " + letter_pairs[ccw_corners[i]] + "<br>";
                    corners_solution += "<b>Flip " + letter_pairs[ccw_corners[i]] + " </b>" + buildAlgCubingLink(ccw_corner_flip_alg) + "<br>";
                }
                else {
                    solution += "[" + corner_flip_setups[ccw_corners[i]] + ": " + ccw_corner_flip_alg + "] // Flip " + letter_pairs[ccw_corners[i]] + "<br>";
                    corner_solution = "[" + corner_flip_setups[ccw_corners[i]] + ": " + ccw_corner_flip_alg + "]";
                    corners_solution +=  "<b>Flip " + letter_pairs[ccw_corners[i]] + " </b>"+ buildAlgCubingLink(corner_solution) +"<br>";
                }
            }
        }
    }

    // Solution is displayed
    $('#edges').html(edge_pairs);
    $('#corners').html(corner_pairs);
    $('#edges-solution').html(edges_solution);
    $('#corners-solution').html(corners_solution);

    // Alg.cubing.net url is set
    $('#algcubing').attr("href", buildAlgCubingUrl(solution, valid_scramble));
}

// If a scramble param is found in the URL, it is applied to the cube and solved
function applyUrlScramble(){
    var url = window.location.search.substring(1);
    var url_vars = url.split('&');
    for (var i = 0; i < url_vars.length; i++) {
        var param = url_vars[i].split('=');
        if (param[0] == 'scramble') {
            var scramble = param[1].replace(/_/g," ").replace(/-/g,"'");
            $('#scramble').val(scramble);
            localStorage.setItem('scramble', scramble);
            solveAndDisplay();
            return true;
        }
    }
    return false;
}

// Adds scramble to url as a param
// Assumes the scramble is valid
function setScrambleInUrl( scramble ){
    // Scramble is converted for url
    scramble = scramble.replace(/ /g,"_").replace(/\'/g,"-");

    // Added seperately to append ? before params
    var loc = window.location;
    var url = loc.protocol + '//' + loc.host + loc.pathname + "?scramble=" + scramble;

    // URL is updated
    history.pushState('data', '', url);
}

// Generates a full link to alg.cubing.net for the algorithm
function buildAlgCubingLink( algorithm ){
    return $('<div />').append($('<a>').attr("href",buildAlgCubingUrl(algorithm)).attr("target","_blank").text(algorithm)).html();
}

// Generates an alg.cubing.net url for the algorithm with 
function buildAlgCubingUrl( algorithm, setup ){
    var url = "https://alg.cubing.net/?alg="+encodeURIComponent(algorithm.replace(/<br>/g,"\n"));
    if ( typeof(setup) != 'undefined' ){
        url += '&setup='+encodeURIComponent(setup);
    }
    return url;
}

$( document ).ready(initUI);
