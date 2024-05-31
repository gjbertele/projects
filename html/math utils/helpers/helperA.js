const textbox = document.querySelector('.textinput');
const deInput = document.querySelector('.DEInput');
const deEvaluate = document.querySelector('.DEEvaluate');
const output = document.querySelector('.textOutput');
const mUtils = new mathUtils();
let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let helpString;
evaluator.buildDESolver = function(tree){
    let terms = evaluator.findAddition(tree);
    let d = evaluator.findFunctions(tree);
    let functions = d.functions;
    for(let i = 0; i<functions.length; i++){
        while(functions[i].values[0].startsWith('d')){
            functions[i].values[0] = functions[i].values[0].substring(1);
        }
    }
    for(let i = 0; i<functions.length; i++){
        if(functions[i] == '_') continue;
        for(let j = i + 1; j<functions.length; j++){
            if(functions[j].values[0] == functions[i].values[0]) functions[j] = '_';
        }
    }
    functions = functions.filter((i,v) => i != '_')
    let originalVariablesOf = d.varsOf.slice();
    let variablesOf = originalVariablesOf.filter((i,v) => v == originalVariablesOf.indexOf(i));
    let baseVariables = [];
    let functionNames = functions.map(i => i = i.values[0]);
    for(let i = 0; i<functions.length; i++){
        let varsof = functions[i].values.slice().splice(1);
        for(let j = 0; j<varsof.length; j++){
            varsof[j] = variablesOf.indexOf(varsof[j].values[0]);
        }
        let n = new variable(varsof);
        n.varId = i+1;
        n.scramble();
        baseVariables.push(n);
    }
    let eq = new equation(baseVariables);
    for(let i = 0; i<terms.length; i++){
        let ti = terms[i];
        if(ti.type == '/'){
            let func = ti.values[0].values[0];
            let by = ti.values[1].values.split('d').splice(1).map(i => i = variablesOf.indexOf(i));
            let count = (new Array(variablesOf.length)).fill(0);
            for(let j = 0; j<by.length; j++) count[by[j]]++;
            let t = new term(eq);
            t.push(functionNames.indexOf(func) + 1,count)
            eq.push(t);
        } else if(ti.type == '*'){
            let data = processMultiplication(ti, variablesOf);
            let variableList = data.terms;
            let t = new term(eq);
            for(let j = 0; j<variableList.length; j++){
                let c = variableList[j];
                if(c[2] == 0){
                    t.push(functionNames.indexOf(variableList[j][0]) + 1,variableList[j][1]);
                } else {
                    t.push(functionNames.length + variablesOf.indexOf(variableList[j][0]) + 1,(new Array(variablesOf.length)).fill(0));
                }
            }
            t.coefficient *= data.coefficient;
            eq.push(t);
        } else if(ti.type == 'Variable'){
            let vn = ti.values[0];
            let t = new term(eq);
            t.push(variablesOf.indexOf(vn)+1+functionNames.length,(new Array(variablesOf.length)).fill(0));
            eq.push(t);
        } else if(ti.type == 'Function'){
            let func = ti.values[0];
            let t = new term(eq);
            t.push(functionNames.indexOf(func),(new Array(variablesOf.length)).fill(0));
            eq.push(t);
        }
    }
    return {eq,functionNames,terms,originalVariablesOf};
}

function processMultiplication(tree, variablesOf){
    let terms = [];
    let coefficient = 1;
    if(tree.type == 'Number'){
        coefficient = tree.values;
    } else if(tree.type == 'Function'){
        let func = tree.values[0];
        let count = (new Array(variablesOf.length)).fill(0);
        terms.push([func, count]);
    } else if(tree.type == '/'){
        let func = tree.values[0].values[0];
        let by = tree.values[1].values.split('d').splice(1).map(i => i = variablesOf.indexOf(i));
        let count = (new Array(variablesOf.length)).fill(0);
        for(let j = 0; j<by.length; j++) count[by[j]]++;
        terms.push([func, count]);
    } else if(tree[0] != undefined && tree[0].type == 'Variable') {
        let func = tree[0].values;
        let count = (new Array(variablesOf.length)).fill(0);
        if(func.startsWith('d') == false) terms.push([func, count,0])
    } else if(tree.type == 'Variable'){
        let func = tree.values;
        let count = (new Array(variablesOf.length)).fill(0);
        if(func.startsWith('d') == false) terms.push([func, count,1])
    } else {
        let a = processMultiplication(tree.values[0], variablesOf);
        let b = processMultiplication(tree.values[1], variablesOf);
        coefficient*=a.coefficient*b.coefficient;
        terms.push(...a.terms);
        terms.push(...b.terms);
    }
    return {terms,coefficient};
}

evaluator.findAddition = function(tree){
    if(tree.type == 'Number') return [tree];
    let additions = [];
    if(tree.type != '+' && tree.type != 'Parenthesis' && tree.type != '-') return [tree];
    if(tree.type == 'Parenthesis'){
        return evaluator.findAddition(tree.values[0]);
    }
    additions.push(...evaluator.findAddition(tree.values[1]));
    additions.push(...evaluator.findAddition(tree.values[0]));
    return additions;
}
evaluator.findFunctions = function(tree){
    let varsOf = [];
    let functions = [];
    if(tree.type == 'Function'){
        functions.push(tree)
        varsOf.push(...tree.values.slice(1).map(i => i = i.values));
    } else if(typeof tree.values != 'string' && tree.values.length != undefined){
        for(let i = 0; i<tree.values.length; i++){
            let d = evaluator.findFunctions(tree.values[i]);
            varsOf.push(...d.varsOf);
            functions.push(...d.functions);
        }
    } else if(tree.type == 'Variable'){
        varsOf.push(tree.values);
    }
    return {varsOf,functions};
}
//need solveexpr w/ regular regression and solveeq

function isNumber(x){
    if(!isNaN(parseInt(x)) || x == '.') return true;
    return false;
}
function isOperator(x){
    if(x == '*' || x == '+' || x == '-' || x == '/' || x == '^' || x == '%') return true;
    return false;
}
function hexToRgb(col){
    let r = parseInt(col[1]+col[2],16);
    let g = parseInt(col[3]+col[4],16);
    let b = parseInt(col[5]+col[6],16);
    return [r,g,b]
}
function fade(current, min, max, array){
    let progress = (current - min)/(max - min);
    let currentBetween = Math.floor(progress*(array.length - 1));
    let cb = currentBetween/(array.length - 1);
    let next = (currentBetween+1)/(array.length - 1);
    let n = (progress - cb)/(next - cb);
    return (1-n)*array[currentBetween] + n*array[currentBetween+1]
}
evaluator.equationToString = function(eq){
    console.log(eq)
    if(eq.type == 'Number') return eq.values;
    if(eq.type == '*' && eq.values[1].type == 'Number' && eq.values[1].values == 1) return evaluator.equationToString(eq.values[0]);
    if(eq.type == '*' && eq.values[0].type == 'Number' && eq.values[0].values == 1) return evaluator.equationToString(eq.values[1]);
    if(eq.type == '*' && eq.values[1].type == 'Number' && eq.values[1].values == -1) return '-'+evaluator.equationToString(eq.values[0]);
    if(eq.type == '*' && eq.values[0].type == 'Number' && eq.values[0].values == -1) return '-'+evaluator.equationToString(eq.values[1]);
    if(eq.type != 'Parenthesis' && eq.values[0] && (eq.values[0].type == '+' || eq.values[0].type == '-')){
        eq.values[0] = {type:'Parenthesis',values:[eq.values[0]]};
    }
    if(eq.type != 'Parenthesis' && eq.values[1] && (eq.values[1].type == '+' || eq.values[1].type == '-')){
        eq.values[1] = {type:'Parenthesis',values:[eq.values[1]]};
    }
    if(eq.type == 'List') return eq.values.map(i => i = i.values).join(', ')
    if(isOperator(eq.type)) return (evaluator.equationToString(eq.values[0]) + ' ' + eq.type + ' ' + evaluator.equationToString(eq.values[1])).replaceAll('+ -','- ');
    if(eq.type == 'Variable') return eq.values[0];
    if(eq.type == 'Complex'){
        if(eq.values[0] == 0) return eq.values[1]+'i';
        if(eq.values[1] == 0) return eq.values[0].toString();
        return eq.values[0] + ' + '+eq.values[1]+'i';
    }
    if(eq.type == 'Function'){
        let s = eq.values[0]+'(';
        for(let i = 1; i<eq.values.length; i++){
            s+=evaluator.equationToString(eq.values[i]);
            if(i != eq.values.length - 1) s+=', ';
        }
        return s+')';
    }
    if(eq.type == 'Parenthesis'){
        return '(' + evaluator.equationToString(eq.values[0]) + ')';
    }
}



//[-210, -300, -260, 0.8953539062730909, -2.4582962514340134, 0]

 
/*
let A = new variable([0,1]);
let B = new variable([0]);
A.scramble();
B.scramble();
let x = new equation([A,B]);
let term2 = new term(x);
term2.push(3,[0,0]);
term2.coefficient = -1;
let term3 = new term(x);
term3.push(2,[0,0],templateFunctions['ln']);
term3.coefficient = 1;

x.push(term2);
x.push(term3);*/

evaluator.complexTools = {};

evaluator.complexTools.complexMult = function(a,b,c,d){
    return [a*c-b*d,b*c+a*d];
}

evaluator.complexTools.expC = function(a,b){
    return evaluator.complexTools.complexMult(Math.cos(b),Math.sin(b),Math.exp(a),0)
}
evaluator.complexTools.lnC = function(a,b){
    return [Math.log(a**2 + b**2)/2, Math.atan2(b,a)];
}
evaluator.complexTools.divC = function(a,b,c,d){
    let div = c ** 2 + d ** 2;
    let newx = a * c + b * d;
    let newy = -a * d + b * c;
    return [newx / div, newy / div];
}
evaluator.complexTools.powC = function(a,b,c,d){
    if(c == 0 && d == 0) return [1,0];
    if(a == 0 && b == 0) return [0,0];
    let ln = evaluator.complexTools.lnC(a,b);
    let mult = evaluator.complexTools.complexMult(ln[0],ln[1],c,d);
    return evaluator.complexTools.expC(mult[0],mult[1]);
}
let xRot = Math.PI/8;
let yRot = -Math.PI/16;
let zRot = 0;
let sin = Math.sin;
let cos = Math.cos;
let rotMat = [
    [cos(yRot)*cos(zRot),sin(xRot)*sin(yRot)*cos(zRot)-cos(xRot)*sin(zRot),cos(xRot)*sin(yRot)*cos(zRot)+sin(xRot)*sin(zRot)],
    [cos(yRot)*sin(zRot),sin(xRot)*sin(yRot)*sin(zRot)+cos(xRot)*cos(zRot),cos(xRot)*sin(yRot)*sin(zRot)-sin(xRot)*cos(zRot)],
    [-sin(yRot),sin(xRot)*cos(yRot),cos(xRot)*cos(yRot)]
]

evaluator.complexTools.matrixByVector = function(mat,vec){
    let output = [];
    for(let i = 0; i<mat.length; i++){
        output[i] = 0;
        for(let j = 0; j<vec.length; j++){
            output[i] += mat[i][j]*vec[j];
        }
    }
    return output;
}

evaluator.complexTools.complexSin = function(a,b){
    let ex = evaluator.complexTools.expC(-b,a);
    let enx = evaluator.complexTools.expC(b,-a);
    return evaluator.complexTools.divC(ex[0] - enx[0],ex[1] - enx[1], 0, 2);
}
evaluator.complexTools.complexCos = function(a,b){
    let ex = evaluator.complexTools.expC(-b,a);
    let enx = evaluator.complexTools.expC(b,-a);
    return evaluator.complexTools.divC(ex[0] + enx[0],ex[1] + enx[1], 2, 0);
}
evaluator.complexTools.complexASin = function(a,b){
    let square = evaluator.complexTools.complexMult(a,b,a,b);
    let lncradical = evaluator.complexTools.lnC(1-square[0],-square[1]);
    let sqrt = evaluator.complexTools.expC(lncradical[0]/2,lncradical[1]/2);
    let bigln = evaluator.complexTools.lnC(sqrt[0]-b,sqrt[1]+a);
    return [bigln[1],-bigln[0]];
}
evaluator.complexTools.complexACos = function(a,b){
    let square = evaluator.complexTools.complexMult(a,b,a,b);
    let lnradical = evaluator.complexTools.lnC(square[0] - 1, square[1]);
    let sqrt = evaluator.complexTools.expC(lnradical[0]/2, lnradical[1]/2);
    let bigln = evaluator.complexTools.lnC(sqrt[0]+a,sqrt[1]+b);
    return [bigln[1],-bigln[0]]
}
evaluator.complexTools.complexTan = function(a,b){
    return evaluator.complexTools.divC(...evaluator.complexTools.complexSin(a,b),...evaluator.complexTools.complexCos(a,b))
}
evaluator.complexTools.complexATan = function(a,b){
    let square = evaluator.complexTools.complexMult(a,b,a,b);
    let div = evaluator.complexTools.divC(square[0],square[1],square[0]+1,square[1]);
    let lnradical = evaluator.complexTools.lnC(div[0],div[1]);
    let sqrt = evaluator.complexTools.expC(lnradical[0]/2,lnradical[1]/2);
    return evaluator.complexTools.complexASin(sqrt[0],sqrt[1]);
}
evaluator.complexTools.complexFloor = function(a,b){
    return [Math.floor(a),Math.floor(b)];
}
evaluator.complexTools.complexRound = function(a,b){
    return [Math.round(a), Math.round(b)];
}
evaluator.complexTools.complexCeil = function(a,b){
    return [Math.ceil(a),Math.ceil(b)];
}
evaluator.complexTools.complexAbs = function(a,b){
    return a**2 + b**2;
}
evaluator.complexTools.complexSqrt = function(a,b){
    let logged = lnC(a,b);
    return expC(logged[0]/2,logged[1]/2);
}
evaluator.complexTools.re = function(tree){
    if(tree.values[1].type == 'Number') return tree.values[1];
    if(tree.values[1].type == 'Complex') return {type:'Number',values:tree.values[1].values[0]};
    return tree;
}
evaluator.complexTools.im = function(tree){
    if(tree.values[1].type == 'Number') return {type:'Complex',values:[0,0]};
    if(tree.values[1].type == 'Complex') return {type:'Complex',values:[0,tree.values[1].values[1]]};
    return tree;
}
evaluator.polyTreeToTerms = function(tree){
    if(tree.type == 'Parenthesis') return evaluator.polyTreeToTerms(tree.values[0])
    if(tree.type == 'Number') return [tree.values];
    if(tree.type == 'Variable') return [0,1]
    if(tree.type == '^'){
        let k = (new Array(tree.values[1].values + 1)).fill(0);
        k[k.length - 1] = 1;
        return k;
    }
    if(tree.type == '+' || tree.type == '-'){
        let t1 = tree.values[0];
        let t2 = tree.values[1];
        t1 = evaluator.polyTreeToTerms(t1);
        t2 = evaluator.polyTreeToTerms(t2);

        if(tree.type == '-'){
            if(tree.values[1].type == '*' || tree.values[1].type == '^' || tree.values[1].type == 'Variable' || tree.values[1].type == 'Number'){
                for(let i = 0; i<t2.length-1; i++) t2[i] *= -1;
                t2[t2.length - 1] *= -1;
            } 
        }
        return evaluator.polyHandler.polyAdd(t1,t2);
        
    }
    if(tree.type == '*'){
        let A = tree.values[0];
        let B = tree.values[1]
        if(tree.values[1].type == 'Number'){
            A = B;
            B = tree.values[0];
        }
        if(A.type == 'Number' && B.type == 'Variable' || B.type == '^'){
            let k = evaluator.polyTreeToTerms(B);
            for(let i = 0; i<k.length; i++) k[i]*=A.values;
            return k;
        }
        A = evaluator.polyTreeToTerms(A);
        B = evaluator.polyTreeToTerms(B);
        return evaluator.polyHandler.polyMultiply(A,B);
    }
}
evaluator.polyHandler = {};
evaluator.polyHandler.polyMultiply = function(p1,p2){
    let output = (new Array(p1.length+p2.length)).fill(0);
    for(let i = 0; i<p1.length; i++){
        for(let j = 0; j<p2.length; j++){
            output[(i+j)] += p1[i]*p2[j];
        }
    }
    return output;
}
evaluator.polyHandler.polyAdd = function(p1,p2){
    let output = p2.slice();
    for(let i = 0; i<p1.length; i++){
        if(output.length <= i) output[i] = 0;
        output[i] += p1[i];
    }
    return output;
}
evaluator.polyHandler.polyEval = function(pol,x){
    let v = 0;
    for(let i = 0; i<pol.length; i++) v+=pol[i]*(x**i);
    return v;
}
evaluator.polyHandler.recurseRoot = function(terms,p1,p2){
    let ep1 = evaluator.polyHandler.polyEval(terms, p1);
    for(let i = 0; i<30000; i++){
        let k = evaluator.polyHandler.polyEval(terms, (p1+p2)/2);
        if(k >= 0){
            if(ep1 >= 0){
                p1 = (p1+p2)/2;
            } else {
                p2 = (p1+p2)/2;
            }
        } else {
            if(ep1 >= 0){
                p2 = (p1+p2)/2;
            } else {
                p1 = (p1+p2)/2;
            }
        }
    }
    if(Math.abs(p2 - Math.round(p2)) < 1e-5) p2 = Math.round(p2); 
    return p2;
}
evaluator.polyHandler.polyDivide = function(p1, p2){
    for(let i = 0; i<p1.length; i++){
        if(Math.abs(1 - Math.round(p1[i])/p1[i]) < 0.01 || Math.abs(p1[i]) < 1e-5) p1[i] = Math.round(p1[i]);
    }
    for(let i = 0; i<p2.length; i++){
        if(Math.abs(1 - Math.round(p2[i])/p2[i]) < 0.01 || Math.abs(p2[i]) < 1e-5) p2[i] = Math.round(p2[i]);
    }
    let output = (new Array(100)).fill(0);
    let p2Operating = p2.slice();
    for(let i = 0; i<20; i++){
        output[i] += p1[i]/p2[0];
        let subterm = evaluator.polyHandler.polyMultiply([-output[i]],p2Operating);
        p1 = evaluator.polyHandler.polyAdd(p1,subterm);
        p2Operating = [0,...p2Operating];
    }
    
    for(let i = 0; i<output.length; i++){
        if(Math.abs(output[i]) < 1e-5) output[i] = Math.round(output[i]);
    }
    return output;
}
evaluator.convexHull = function(points){
    if(points.length == 0) return;
    let starting = points.sort((a,b) => a.x - b.x)[0];
    let currentPoint = structuredClone(starting);
    let i = 0;
    let endpoint;
    let pts = [];
    while(endpoint != starting){
        pts[i] = currentPoint;
        endpoint = points[0];
        for(let j = 0; j<points.length; j++){
            if(evaluator.compt(endpoint,currentPoint) || evaluator.isLeft(currentPoint,endpoint,points[j])){
                endpoint = points[j];
            }
        }
        currentPoint = endpoint;
        i++;
    }
    return pts;
    
}
evaluator.compt = function(a,b){
    return a.x == b.x && a.y == b.y;
}
evaluator.distance = function(p1,p2){
    return (p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2;
}
evaluator.isLeft = function(a,b,c){
    return (b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x) > 0;
} 

//complex contour plot
//support for parametric functions -> Parametric(t,fx,fy,fz) handler
//automatic differentiator
//sum function
//classify equation function
//test for multiple different exponents & fractional multiplier constants
//numerical differentiation for the rootfinder algorithm to find complex roots too
//automatic closed forms for everything


helpString = `Type in an integer to see its factorization<br>
<br>
Functions:<br>
Trig:<br>
sin, cos, tan, atan, acos, atan<br>
Other:<br>
log (natural log), sqrt, abs, floor, ceil, round<br>
Custom:<br>
Integrate(f(x),xmin,xmax)<br>
Numerically integrates f(x) from x=xmin to x=xmax<br>
e.g. Integrate(x^2, 0, 2) = 2.66...<br>
Plot(f(x,y), xmin, xmax, ymin, ymax)<br>
Plots all points (x,y) s.t. xmin<=x<=xmax, ymin<=y<=ymax, f(x,y) ~= 0<br>
e.g. Plot(x - y, -5, 5, -3, 3) plots y = x from x = -5 to 5 and y = -3 to 3<br>
ContourPlot(f(x,y), xmin, xmax, ymin, ymax)<br>
Plots a contour of f(x,y) for all (x,y) s.t. xmin<=x<=xmax, ymin<=y<=ymax, f(x,y) ~= 0<br>
e.g. ContourPlot(x/y, -5, 5, -3, 3)<br>
Plot3D(f(x,y), xmin, xmax, ymin, ymax)<br>
Generates a 3D graph of f(x,y) over all points (x,y) s.t. xmin<=x<=xmax, ymin<=y<=ymax, f(x,y) ~= 0<br>
e.g. Plot3D(sin(x)^2 + cos(y)^2, -1, 1, -1, 2)

`