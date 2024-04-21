const step = 0.03;
let colorScheme = ['#47E5BC', '#81E4DA', '#AECFDF', '#9F9FAD', '#93748A'];
let rArr = [];
let gArr = [];
let bArr = [];
let fovInv;
let pointsToRender;
for (let i = 0; i < colorScheme.length; i++) {
    let [r, g, b] = hexToRgb(colorScheme[i]);
    rArr.push(r);
    gArr.push(g);
    bArr.push(b);
}


function parseEquation(string) {
    let parts = [];
    let str = string.split('');
    let i = 0;
    while (i < str.length) {
        if (str[i] == ' ') {
            i++;
            continue;
        }
        if (isNumber(str[i])) {
            let v = i;
            while (i < str.length && isNumber(str[i])) {
                i++;
            }
            if (str[i] == 'i') {
                parts.push({
                    type: 'Complex',
                    values: [0, parseFloat(string.substring(v, i))]
                })
            } else {
                parts.push({
                    type: 'Number',
                    values: parseFloat(string.substring(v, i))
                });
                i--;
            }
        } else if (str[i] == '(') {
            let v = i + 1;
            i++;
            while (i < str.length && str[i] != ')') i++;
            parts.push({
                type: 'Parenthesis',
                values: parseEquation(string.substring(v, i))
            });
        } else if (isOperator(str[i])) {
            parts.push({
                type: str[i],
                value: str[i]
            });
        } else {
            let v = i;
            let isVariable = false;
            while (i < str.length && str[i] != '(') {
                if (isOperator(str[i]) || str[i] == ' ' || str[i] == ')' || i == str.length - 1) {
                    isVariable = true;
                    if (i != str.length - 1) i--;
                    break;
                }
                i++;
            }
            if (isVariable == false) {
                let functionName = string.substring(v, i);
                i++;
                v = i;
                let functionValues = [functionName];
                let depth = -1;
                while (i < str.length && depth != 0) {
                    if (str[i] == '(') depth--;
                    if (str[i] == ')') depth++;
                    if (depth == 0) break;
                    if (str[i] == ',' && depth == -1) {
                        let eq = parseEquation(string.substring(v, i))[0];
                        functionValues.push(eq);
                        v = i + 1;
                    }
                    i++;
                }
                functionValues.push(parseEquation(string.substring(v, i))[0]);
                parts.push({
                    type: 'Function',
                    values: functionValues
                });
            } else {
                let vname = string.substring(v, i + 1).replaceAll(' ', '');
                if (vname == 'i') {
                    parts.push({
                        type: 'Complex',
                        values: [0, 1]
                    })
                } else {
                    parts.push({
                        type: 'Variable',
                        values: vname
                    });
                }

                //if(i == str.length - 1) break;
                //i--;
            }

        }
        i++;
    }
    i = 0;
    while (i < parts.length) {
        if (parts[i].finished == true) {
            i++;
            continue;
        }
        if (parts[i].type == '^') { // || parts[i].type == '*' || parts[i].type == '/'){
            parts[i] = {
                type: parts[i].type,
                values: [parts[i - 1], parts[i + 1]],
                finished: true
            };
            parts[i - 1] = '_';
            parts[i + 1] = '_';
            parts = parts.filter(i => i != '_');
            i = 0;
        }
        i++;
    }
    i = 0;
    while (i < parts.length) {
        if (parts[i].finished == true) {
            i++;
            continue;
        }
        if (parts[i].type == '/') {
            parts[i] = {
                type: parts[i].type,
                values: [parts[i - 1], parts[i + 1]],
                finished: true
            };
            parts[i - 1] = '_';
            parts[i + 1] = '_';
            parts = parts.filter(i => i != '_');
            i = 0;
        }
        i++;
    }
    i = 0;
    while (i < parts.length) {
        if (parts[i].finished == true) {
            i++;
            continue;
        }
        if (parts[i].type == '*') {
            parts[i] = {
                type: parts[i].type,
                values: [parts[i - 1], parts[i + 1]],
                finished: true
            };
            parts[i - 1] = '_';
            parts[i + 1] = '_';
            parts = parts.filter(i => i != '_');
            i = 0;
        }
        i++;
    }
    i = 0;
    while (i < parts.length) {
        if (parts[i].finished == true) {
            i++;
            continue;
        }
        if (parts[i].type == '-') {
            if (i == 0) {
                parts[i] = {
                    type: parts[i].type,
                    values: [{
                        type: "Number",
                        values: 0
                    }, parts[i + 1]],
                    finished: true
                };
            } else {
                parts[i] = {
                    type: parts[i].type,
                    values: [parts[i - 1], parts[i + 1]],
                    finished: true
                };
                parts[i - 1] = '_';
            }
            parts[i + 1] = '_';
            parts = parts.filter(i => i != '_');
        } else if (parts[i].type == '+' || parts[i].type == '%') {
            parts[i] = {
                type: parts[i].type,
                values: [parts[i - 1], parts[i + 1]],
                finished: true
            };
            parts[i - 1] = '_';
            parts[i + 1] = '_';
            parts = parts.filter(i => i != '_');
            i = 0;
        }
        i++;
    }
    return parts;

}

function parseEq(str) {
    return parseEquation(str)[0];
}

function evaluateEquation(ntree, variables = {}) {
    let tree = structuredClone(ntree)
    if (tree.type == 'Variable' && variables[tree.values] != undefined) return {
        type: "Number",
        values: variables[tree.values]
    };
    if (tree.type == 'Parenthesis' && tree.values.length == 1) return evaluateEquation(tree.values[0], variables);
    if (isOperator(tree.type)) {
        let v = [evaluateEquation(tree.values[0], variables), evaluateEquation(tree.values[1], variables)];
        if (v[0].type == 'Number' && v[1].type == 'Number') {
            switch (tree.type) {
                case '*':
                    return {
                        type: 'Number', values: v[0].values * v[1].values
                    };
                case '+':
                    return {
                        type: 'Number', values: v[0].values + v[1].values
                    };
                case '-':
                    return {
                        type: 'Number', values: v[0].values - v[1].values
                    };
                case '/':
                    return {
                        type: 'Number', values: v[0].values / v[1].values
                    };
                case '^':
                    return {
                        type: 'Number', values: v[0].values ** v[1].values
                    };
                case '%':
                    return {
                        type: 'Number', values: v[0].values % v[1].values
                    };
            }
        } else if (v[0].type == 'Complex' && v[1].type == 'Number') {
            switch (tree.type) {
                case '*':
                    return {
                        type: 'Complex', values: [v[0].values[0] * v[1].values, v[0].values[1] * v[1].values]
                    };
                case '+':
                    return {
                        type: 'Complex', values: [v[0].values[0] + v[1].values, v[0].values[1]]
                    };
                case '-':
                    return {
                        type: 'Complex', values: [v[0].values[0] - v[1].values, v[0].values[1]]
                    };
                case '/':
                    return {
                        type: 'Complex', values: [v[0].values[0] / v[1].values, v[0].values[1] / v[1].values]
                    };
                case '^':
                    let x = v[0].values;
                    let abs = Math.sqrt(x[0] ** 2 + x[1] ** 2) ** v[1].values;
                    let angle = v[1].values * Math.atan2(x[1], x[0]);
                    let nx = abs * Math.cos(angle);
                    let ny = abs * Math.sin(angle);
                    return {
                        type: 'Complex', values: [nx, ny]
                    };
                case '%':
                    return tree;
            }
        } else if (v[1].type == 'Complex' && v[0].type == 'Number') {
            switch (tree.type) {
                case '*':
                    return {
                        type: 'Complex', values: [v[1].values[0] * v[0].values, v[1].values[1] * v[0].values]
                    };
                case '+':
                    return {
                        type: 'Complex', values: [v[1].values[0] + v[0].values, v[1].values[1]]
                    };
                case '-':
                    return {
                        type: 'Complex', values: [v[1].values[0] - v[0].values, v[1].values[1]]
                    };
                case '/':
                    let div = v[1].values[0] ** 2 + v[1].values[1] ** 2;
                    return {
                        type: 'Complex', values: [v[0].values * v[1].values[0] / div, v[0].values * v[1].values[1] / div]
                    }
                case '^':
                    let x = powC(v[0].values, 0, v[1].values[0], v[1].values[1]);
                    return {
                        type: 'Complex', values: x
                    };
                case '%':
                    return tree;
            }
        } else if (v[0].type == 'Complex' && v[1].type == 'Complex') {
            switch (tree.type) {
                case '*':
                    let nx = v[0].values[0] * v[1].values[0] - v[0].values[1] * v[1].values[1];
                    let ny = v[0].values[0] * v[1].values[1] + v[0].values[1] * v[1].values[0];
                    return {
                        type: 'Complex', values: [nx, ny]
                    };
                case '+':
                    return {
                        type: 'Complex', values: [v[0].values[0] + v[1].values[0], v[0].values[1] + v[1].values[1]]
                    };
                case '-':
                    return {
                        type: 'Complex', values: [v[0].values[0] - v[1].values[0], v[0].values[1] - v[1].values[1]]
                    };

                case '/':
                    let div = v[1].values[0] ** 2 + v[1].values[1] ** 2;
                    let newx = v[0].values[0] * v[1].values[0] + v[0].values[1] * v[1].values[1];
                    let newy = -v[0].values[0] * v[1].values[1] + v[0].values[1] * v[1].values[0];
                    return {
                        type: 'Complex', values: [newx / div, newy / div]
                    };

                case '^':
                    let x = powC(v[0].values[0], v[0].values[1], v[1].values[0], v[1].values[1]);
                    return {
                        type: "Complex", values: x
                    };

                case '%':
                    return tree;
            }
        }
        tree.values[0] = v[0];
        tree.values[1] = v[1];
    }
    if (tree.type == 'Function') {
        let defaultMathFunctions = ['sin', 'cos', 'acos', 'asin', 'tan', 'atan', 'log', 'sqrt', 'abs']
        for (let i = 1; i < tree.values.length; i++) tree.values[i] = evaluateEquation(tree.values[i], variables)
        if (defaultMathFunctions.includes(tree.values[0])) {
            let x = tree.values[1];
            if (x.type == 'Number') {
                return {
                    type: 'Number',
                    values: Math[tree.values[0]](x.values)
                };
            } else {
                tree.values[1] = x;
                return tree;
            }
        }
        if (tree.values[0] == 'Factor') {
            let evaled = tree.values[1];
            if (evaled.type != 'Number') return tree;
            let j = Math.factor(Math.round(evaled.values));
            let newList = [];
            for (let i in j) {
                for (let k = 0; k < j[i]; k++) {
                    newList.push({
                        type: "Number",
                        values: parseInt(i)
                    });
                }
            }
            return {
                type: 'List',
                values: newList
            };
        }

        if (tree.values[0] == 'Integrate') {
            let v = 0;
            let lb = tree.values[2];
            let ub = tree.values[3];
            if (lb.type != 'Number' || lb.type != 'Number') {
                tree.values[2] = lb.values;
                tree.values[3] = ub.values;
                return tree;
            }
            let tvariables = structuredClone(variables);
            let evable = true;
            for (let i = lb.values; i < ub.values; i += 0.01) {
                tvariables['t'] = i;
                let k = evaluateEquation(tree.values[1], tvariables);
                if (k.type == 'Number') {
                    v += k.values * 0.01;
                } else {
                    evable = false;
                    break;
                }
            }
            if (evable) {
                return {
                    type: 'Number',
                    values: v
                }
            } else {
                tree.values[2] = lb.values;
                tree.values[3] = ub.values;
                return tree;
            }
        }
        if (tree.values[0] == 'Plot') {
            let func = tree.values[1];
            let xmin = tree.values[2];
            let xmax = tree.values[3];
            let ymin = tree.values[4];
            let ymax = tree.values[5];
            let pts = [];
            canvas.style.display = 'inline-block';
            if (xmin.type == 'Number' && xmin.type == ymin.type && ymin.type == xmax.type && xmax.type == ymax.type) {
                ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                let newvars = structuredClone(variables);
                let dx = xmax.values - xmin.values;
                let dy = ymax.values - ymin.values;
                let ratio = dx / dy;
                let nw = 0;
                let nh = 0;
                if (ratio < 1) {
                    nw = document.body.clientHeight / 2;
                    nh = nw * ratio;
                } else {
                    nh = document.body.clientHeight / 2;
                    nw = nh / ratio;
                }
                canvas.width = nw;
                canvas.height = nh;
                for (let x = 0; x <= nw; x += 3) {
                    newvars['x'] = (x / nw) * dx + xmin.values;
                    for (let y = 0; y <= nh; y += 3) {
                        newvars['y'] = (y / nh) * dy + ymin.values;
                        let evaled = evaluateEquation(func, newvars);
                        if (evaled.type != 'Number') return tree;
                        if (Math.abs(evaled.values) < 0.05) pts.push([x, y]);
                    }
                }
                ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                ctx.fillStyle = colorScheme[0];
                for (let i = 0; i < pts.length; i++) {
                    let cp = pts[i];
                    ctx.fillRect(cp[0], nh - cp[1], 3, 3);
                }
                let xAxis = -xmin.values * nw / (xmax.values - xmin.values);
                if (xAxis < nw && xAxis > 0) {
                    //ctx.fillRect(xAxis, 0, )
                }
            } else {
                return tree;
            }
        } else if (tree.values[0] == 'ContourPlot') {
            let func = tree.values[1];
            let xmin = tree.values[2];
            let xmax = tree.values[3];
            let ymin = tree.values[4];
            let ymax = tree.values[5];
            canvas.style.display = 'inline-block';
            let pts = [];
            if (xmin.type == 'Number' && xmin.type == ymin.type && ymin.type == xmax.type && xmax.type == ymax.type) {
                let newvars = structuredClone(variables);
                let minv = 2 ** 63 - 1;
                let maxv = -minv;
                let dy = (ymax.values - ymin.values);
                let dx = (xmax.values - xmin.values);
                let ratio = dx / dy;
                let nw = 0;
                let nh = 0;
                if (ratio < 1) {
                    nw = document.body.clientHeight / 2;
                    nh = nw * ratio;
                } else {
                    nh = document.body.clientHeight / 2;
                    nw = nh / ratio;
                }
                canvas.width = parseInt(nw);
                canvas.height = parseInt(nh);


                for (let x = 0; x <= nw; x += 3) {
                    newvars['x'] = (x / nw) * dx + xmin.values;
                    for (let y = 0; y <= nh; y += 3) {
                        newvars['y'] = (y / nh) * dy + ymin.values;
                        let evaled = evaluateEquation(func, newvars);
                        if (evaled.type != 'Number') return tree;
                        if (!isNaN(evaled.values)) {
                            pts.push([x, y, evaled.values]); //change step to be according to stepW or set resolution instead
                            if (evaled.values > maxv) maxv = evaled.values;
                            if (evaled.values < minv) minv = evaled.values;
                        }
                    }
                }
                ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

                for (let i = 0; i < pts.length; i++) {
                    let x = pts[i][0];
                    let y = pts[i][1];
                    let cr = fade(pts[i][2], minv, maxv, rArr);
                    let cg = fade(pts[i][2], minv, maxv, gArr);
                    let cb = fade(pts[i][2], minv, maxv, bArr);
                    ctx.fillStyle = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
                    ctx.fillRect(x, y, 3, 3)
                }
                ctx.fillStyle = '#000'
                let xAxis = -xmin.values * nw / dx;
                if (xAxis > 0 && xAxis < nw) {
                    ctx.fillRect(xAxis - 1, 0, 3, nh);
                }
                let yAxis = -ymin.values * nh / dy;
                if (yAxis > 0 && yAxis < nh) {
                    ctx.fillRect(0, yAxis - 1, nw, 3);
                }
                ctx.strokeStyle = '#000';
                ctx.textAlign = 'left'
                ctx.fillText('(' + xmin.values + ',' + ymin.values + ')', 5, nh - 5);
                ctx.fillText('(' + xmin.values + ',' + ymax.values + ')', 5, 10);
                ctx.textAlign = 'right'
                ctx.fillText('(' + xmax.values + ',' + ymin.values + ')', nw - 5, nh - 5);
                ctx.fillText('(' + xmax.values + ',' + ymax.values + ')', nw - 5, 10);
                return tree;
            } else {
                return tree;
            }
        } else if (tree.values[0] == 'Plot3D') {
            let func = tree.values[1];
            let xmin = tree.values[2];
            let xmax = tree.values[3];
            let ymin = tree.values[4];
            let ymax = tree.values[5];
            if (xmin.type == 'Number' && xmin.type == ymin.type && ymin.type == xmax.type && xmax.type == ymax.type) {
                canvas.style.display = 'inline-block';
                let newvars = structuredClone(variables);
                let nw = document.body.clientHeight / 1.5;
                let nh = document.body.clientHeight / 1.5;
                canvas.width = nw;
                canvas.height = nh;
                
                eqf = function(x,y){
                    newvars['x'] = xmin.values + (x + worldWidth/2)*(xmax.values - xmin.values)/(worldWidth);
                    newvars['y'] = ymin.values + (y + worldHeight/2)*(ymax.values - ymin.values)/(worldHeight);
                    let j = evaluateEquation(func, newvars);
                    if(j.type != 'Number') return 0;
                    return -j.values*terrainDetail;
                }
                generatePictureFromEquation(eqf, newvars, nw, nh)

                return tree;
            } else {
                return tree;
            }
        } else {
            canvas.style.display = 'none'
        }
    }
    return tree;
}

let eqf;