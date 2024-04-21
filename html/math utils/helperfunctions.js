const textbox = document.querySelector('.textinput');
const output = document.querySelector('.textOutput');
const mUtils = new mathUtils();
let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
function buildDESolver(tree){
    let terms = findAddition(tree);
    let d = findFunctions(tree);
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
    let variablesOf = d.varsOf;
    variablesOf = variablesOf.filter((i,v) => v == variablesOf.indexOf(i));
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
                t.push(functionNames.indexOf(variableList[j][0]) + 1,variableList[j][1]);
            }
            eq.push(t);
        }
    }
    return eq;
}

function processMultiplication(tree, variablesOf){
    let terms = [];
    let coefficient = 1;
    if(typeof tree.values == 'string') return [];
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
    } else {
        let a = processMultiplication(tree.values[0], variablesOf);
        let b = processMultiplication(tree.values[1], variablesOf);
        coefficient*=a.coefficient*b.coefficient;
        terms.push(...a.terms);
        terms.push(...b.terms);
    }
    return {terms,coefficient};
}

function findAddition(tree){
    if(tree.type == 'Number') return [tree];
    let additions = [];
    if(tree.type != '+' && tree.type != 'Parenthesis') return [tree];
    if(tree.type == 'Parenthesis'){
        return findAddition(tree.values[0]);
    }
    additions.push(...findAddition(tree.values[1]));
    additions.push(...findAddition(tree.values[0]));
    return additions;
}
function findFunctions(tree){
    let varsOf = [];
    let functions = [];
    if(tree.type == 'Function'){
        functions.push(tree)
        varsOf.push(...tree.values.slice(1).map(i => i = i.values));
    } else if(typeof tree.values != 'string' && tree.values.length != undefined){
        for(let i = 0; i<tree.values.length; i++){
            let d = findFunctions(tree.values[i]);
            varsOf.push(...d.varsOf);
            functions.push(...d.functions);
        }
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
function equationToString(eq){
    if(eq.type == 'Number') return eq.values;
    if(isOperator(eq.type)) return equationToString(eq.values[0]) + ' ' + eq.type + ' ' + equationToString(eq.values[1]);
    if(eq.type == 'Variable') return eq.values[0];
    if(eq.type == 'Complex') return eq.values[0] + ' + i'+eq.values[1];
    if(eq.type == 'Function'){
        let s = eq.values[0]+'(';
        for(let i = 1; i<eq.values.length; i++){
            s+=equationToString(eq.values[i]);
            if(i != eq.values.length - 1) s+=', ';
        }
        return s+')';
    }
    if(eq.type == 'Parenthesis'){
        return '(' + equationToString(eq.values[0]) + ')';
    }
}
document.body.onkeydown = function(e){
    if(e.key == 'Enter'){
        canvas.style.display = 'none'
        let query = textbox.value.split("where");
        let definitions = {
            e:2.718,
            pi:3.14159265358979323846264
        }
        if(query.length > 1){
            let j = query[1].replaceAll(' ','').split("and");
            for(let k = 0; k<j.length; k++){
                let n = j[k].split('=');
                definitions[n[0]] = parseFloat(n[1]);
            }
        }
        let parsed = parseEq(query[0]);
        let evaled = evaluateEquation(parsed, definitions);
        output.innerHTML = equationToString(evaled)+`<br>`;
        if(evaled.type == 'Number'){
            let factored = Math.factor(BigInt(Math.round(evaled.values + 0)));
            let fs = 'Factoring of '+Math.round(evaled.values + 0)+': ';
            for(let i in factored){
                if(factored[i] != 1){
                    fs+=i+'^'+parseInt(factored[i])+' ';
                } else {
                    fs+=i+' ';
                }
            }
            output.innerHTML+=fs+`<br>`;
            let closedForms = [];
            let x = evaled.values + 0;
            for(let i = 2; i<5; i++){
                let k = x**i;
                if(Math.abs(Math.round(k) - k) <= 0.05){
                    closedForms.push([1/i,Math.round(k)]);
                }
            }
            //IMPLEMENT CLOSED FORMS
        }
    }
}
//[-210, -300, -260, 0.8953539062730909, -2.4582962514340134, 0]

let lookuptableSqrt = [];
let lookuptableLogInt = [];
for(let i = 1; i<100; i++){
    lookuptableSqrt[i] = Math.sqrt(i);
    lookuptableLogInt[i] = Math.log(i+1);
}
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


function complexMult(a,b,c,d){
    return [a*c-b*d,b*c+a*d];
}

function expC(a,b){
    return complexMult(Math.cos(b),Math.sin(b),Math.exp(a),0)
}
function lnC(a,b){
    return [Math.log(a**2 + b**2)/2, Math.atan2(b,a)];
}

function powC(a,b,c,d){
    let ln = lnC(a,b);
    let mult = complexMult(ln[0],ln[1],c,d);
    return expC(mult[0],mult[1]);
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

function matrixByVector(mat,vec){
    let output = [];
    for(let i = 0; i<mat.length; i++){
        output[i] = 0;
        for(let j = 0; j<vec.length; j++){
            output[i] += mat[i][j]*vec[j];
        }
    }
    return output;
}