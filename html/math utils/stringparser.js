let mUtils = new mathUtils();

function parseEquation(string){
    let parts = [];
    let str = string.split('');
    let i = 0;
    while(i < str.length){
        if(str[i] == ' '){
            i++;
            continue;
        }
        if(isNumber(str[i])){
            let v = i;
            while(i < str.length && isNumber(str[i])) i++;
            parts.push({type:'Number',values:parseInt(string.substring(v,i))});
            i--;
        } else if(str[i] == '('){
            let v = i+1;
            i++;
            while(i < str.length && str[i] != ')') i++;
            parts.push({type:'Parenthesis',values:parseEquation(string.substring(v,i))});
        } else if(isOperator(str[i])){
            parts.push({type:str[i],value:str[i]});
        } else {
            let v = i;
            let isVariable = false;
            while(i < str.length && str[i] != '('){
                if(isOperator(str[i]) || str[i] == ' ' || str[i] == ')' || i == str.length - 1){
                    isVariable = true;
                    if(i != str.length - 1) i--;
                    break;
                }
                i++;
            }
            if(isVariable == false){
                let functionName = string.substring(v,i);
                i++;
                v = i;
                let functionValues = [functionName];
                let depth = -1;
                while(i < str.length && depth != 0){
                    if(str[i] == '(') depth--;
                    if(str[i] == ')') depth++;
                    if(depth == 0) break;
                    if(str[i] == ',' && depth == -1){
                        functionValues.push(parseEquation(string.substring(v, i))[0]);
                        v = i + 1;
                    }
                    i++;
                }
                functionValues.push(parseEquation(string.substring(v, i))[0]);
                parts.push({type:'Function',values:functionValues});
            } else {
                parts.push({type:'Variable',values:string.substring(v,i + 1).replaceAll(' ','')});
                //if(i == str.length - 1) break;
                //i--;
            }
            
        }
        i++;
    }
    i = 0;
    while(i < parts.length){
        if(parts[i].finished == true){
            i++;
            continue;
        }
        if(parts[i].type == '^'){// || parts[i].type == '*' || parts[i].type == '/'){
            parts[i] = {type:parts[i].type,values:[parts[i-1],parts[i+1]],finished:true};
            parts[i-1] = '_';
            parts[i+1] = '_';
            parts = parts.filter(i => i != '_');
            i = 0;
        }
        i++;
    }
    i = 0;
    while(i < parts.length){
        if(parts[i].finished == true){
            i++;
            continue;
        }
        if(parts[i].type == '/'){
            parts[i] = {type:parts[i].type,values:[parts[i-1],parts[i+1]],finished:true};
            parts[i-1] = '_';
            parts[i+1] = '_';
            parts = parts.filter(i => i != '_');
            i = 0;
        }
        i++;
    }
    i = 0;
    while(i < parts.length){
        if(parts[i].finished == true){
            i++;
            continue;
        }
        if(parts[i].type == '*'){
            parts[i] = {type:parts[i].type,values:[parts[i-1],parts[i+1]],finished:true};
            parts[i-1] = '_';
            parts[i+1] = '_';
            parts = parts.filter(i => i != '_');
            i = 0;
        }
        i++;
    }
    i = 0;
    while(i < parts.length){
        if(parts[i].finished == true){
            i++;
            continue;
        }
        if(parts[i].type == '+' || parts[i].type == '-' || parts[i].type == '%'){
            parts[i] = {type:parts[i].type,values:[parts[i-1],parts[i+1]],finished:true};
            parts[i-1] = '_';
            parts[i+1] = '_';
            parts = parts.filter(i => i != '_');
            i = 0;
        }
        i++;
    }
    return parts;
   
}
function parseEq(str){
    return parseEquation(str)[0];
}

function evaluateEquation(ntree, variables = {}){
    let tree = structuredClone(ntree)
    if(tree.type == 'Variable' && variables[tree.values] != undefined) return {type:"Number",values:variables[tree.values]};
    if(tree.type == 'Parenthesis' && tree.values.length == 1) return evaluateEquation(tree.values[0], variables);
    if(isOperator(tree.type)){
        let v = [ evaluateEquation(tree.values[0], variables),evaluateEquation(tree.values[1], variables)];
        if(v[0].type == 'Number' && v[1].type == 'Number'){
            v[0] = v[0].values;
            v[1] = v[1].values;
            switch (tree.type) {
                case '*':
                    return { type:'Number',values:v[0]*v[1]};
                case '+':
                    return { type:'Number',values:v[0]+v[1]};
                case '-':
                    return { type:'Number',values:v[0]-v[1]};
                case '/':
                    return { type:'Number',values:v[0]/v[1]};
                case '^':
                    return { type:'Number',values:v[0]**v[1]};
                case '%':
                    return { type:'Number',values:v[0]%v[1]};
            }   
        }
    }
    if(tree.type == 'Function'){
        let defaultMathFunctions = ['sin','cos','acos','asin','tan','atan','log']
        if(defaultMathFunctions.includes(tree.values[0])){
            let x = evaluateEquation(tree.values[1], variables);
            if(x.type == 'Number'){
                return {type:'Number',values:Math[tree.values[0]](x.values)};
            } else {
                tree.values[1] = x;
                return tree;
            }
        }
        if(tree.values[0] == 'Factor'){
            let evaled = evaluateEquation(tree.values[1],variables);
            if(evaled.type != 'Number') return tree;
            let j = Math.factor(Math.round(evaled.values));
            let newList = [];
            for(let i in j){
                for(let k = 0; k<j[i]; k++){
                    newList.push({type:"Number",values:parseInt(i)});
                }
            }
            return {type:'List',values:newList};
        }
        
        if(tree.values[0] == 'Integrate'){
            let v = 0;
            let lb = evaluateEquation(tree.values[2], variables);
            let ub = evaluateEquation(tree.values[3], variables);
            if(lb.type != 'Number' || lb.type != 'Number'){
                tree.values[2] = lb.values;
                tree.values[3] = ub.values;
                return tree;
            }
            let tvariables = structuredClone(variables);
            let evable = true;
            for(let i = lb.values; i<ub.values; i+=0.01){
                tvariables['t'] = i;
                let k = evaluateEquation(tree.values[1],tvariables);
                if(k.type == 'Number'){
                    v+=k.values*0.01;
                } else {
                    evable = false;
                    break;
                }
            }
            if(evable){
                return {type:'Number',values:v}
            } else {
                tree.values[2] = lb.values;
                tree.values[3] = ub.values;
                return tree;
            }
        }
    }
    return tree;
}

function solveDE(tree){
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