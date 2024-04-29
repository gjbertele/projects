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
            let depth = -1;
            while (i < str.length && depth != 0){
                if(str[i] == '(') depth--;
                if(str[i] == ')') depth++;
                if(depth == 0) break;
                i++;
            }
            parts.push({
                type: 'Parenthesis',
                values: parseEquation(string.substring(v, i))
            });
        } else if(str[i] == '['){
            let v = i + 1;
            i++;
            let depth = -1;
            let values = [];
            while (i < str.length && depth != 0){
                if(str[i] == '[') depth--;
                if(str[i] == ']') depth++;
                if(str[i] == ',' && depth == -1){
                    values.push(parseEquation(string.substring(v,i))[0]);
                    v = i+1;
                }
                i++;
            }
            values.push(string.substring(v,i));
            parts.push({
                type:'List',
                values:values
            });
        } else if (isOperator(str[i])) {
            parts.push({
                type: str[i],
                value: str[i]
            });
        } else if(str[i] == '!'){
            parts.push({
                type:str[i],
                value:str[i]
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
        if(parts[i].type == '-' &&(i == 0 || isOperator(parts[i-1].type))){
            parts[i] = {type:'*',values:[{type:'Number',values:-1},parts[i+1]],finished:true};
            parts[i+1] = '_';
            parts = parts.filter(i => i != '_');
        }
        i++;

    }
    let operationsOrder = ['^','*','/','%','-','+'];
    for(let k = 0; k<operationsOrder.length; k++){
        let index = 0; 
        while (index < parts.length) {
            if (parts[index].finished == true) {
                index++;
                continue;
            }
            if (parts[index].type == operationsOrder[k]) { 
                parts[index] = {
                    type: parts[index].type,
                    values: [parts[index-1],parts[index+1]],
                    finished: true
                };
                parts[index - 1] = '_';
                parts[index + 1] = '_'
                parts = parts.filter(j => j != '_');
                index--;
            }
            index++;
        }
    }
    parts = parts.filter(j => j != '_');
    i = 0;
    while (i < parts.length) {
        if (parts[i].finished == true) {
            i++;
            continue;
        }
        if (parts[i].type == '!') { 
            parts[i] = {
                type: parts[i].type,
                values: [parts[i-1]],
                finished: true
            };
            parts[i - 1] = '_';
            parts = parts.filter(i => i != '_');
            i--;
        }
        i++;
    }
    parts = parts.filter(j => j != '_');

    return parts;

}

function parseEq(str) {
    return parseEquation(str)[0];
}

evaluator.evaluateEquation = function(ntree, variables = {}, functionPatch = [], varMap = []) {
    let tree = evaluator.simplify(structuredClone(ntree))
    if (tree.type == 'Variable' && variables[tree.values] != undefined) return {
        type: "Number",
        values: variables[tree.values]
    };
    if (tree.type == 'Parenthesis' && tree.values.length == 1) return evaluator.evaluateEquation(tree.values[0], variables, functionPatch);
    if (isOperator(tree.type)) {
        return evaluator.operation(tree, canvas, ctx, variables, functionPatch);
        
    } else if(tree.type == '!'){
        let evaled = tree.values[0];
        if(evaled.type == 'Number'){
            let i = 1;
            for(let j = 1; j<=evaled.values; j++) i*=j;
            return {type:'Number',values:i};
        }
    } else if (tree.type == 'Function') {
        let defaultMathFunctions = ['sin', 'cos', 'acos', 'asin', 'tan', 'atan', 'log', 'sqrt', 'abs', 'floor', 'ceil', 'round']
        let complexFunctions = [evaluator.complexTools.complexSin, evaluator.complexTools.complexCos, evaluator.complexTools.complexACos, evaluator.complexTools.complexASin, evaluator.complexTools.complexTan, evaluator.complexTools.complexATan, evaluator.complexTools.lnC, evaluator.complexTools.complexSqrt, evaluator.complexTools.complexAbs, evaluator.complexTools.complexFloor, evaluator.complexTools.complexCeil, evaluator.complexTools.complexRound]
        for (let i = 1; i < tree.values.length; i++) tree.values[i] = evaluator.evaluateEquation(tree.values[i], variables, functionPatch);
        if(functionPatch[tree.values[0]] != undefined){
            let args = tree.values.slice(1).map(i => i = i.values);
            let outputArgs = (new Array(varMap.length)).fill(0);
            for(let i = 0; i<args.length; i++){
                outputArgs[functionPatch[tree.values[0]].varOf[i]] = args[i]; 
            }
            console.log(outputArgs)
            return {
                type:'Number',
                values: functionPatch[tree.values[0]].eval(outputArgs)
            }
        } else if (defaultMathFunctions.includes(tree.values[0])) {
            let x = tree.values[1];
            if (x.type == 'Number') {
                return {
                    type: 'Number',
                    values: Math[tree.values[0]](x.values)
                };
            } else if(x.type == 'Complex'){
                return {
                    type:'Complex',
                    values: complexFunctions[defaultMathFunctions.indexOf(tree.values[0])](...x.values)
                }
            } else {
                tree.values[1] = x;
                return tree;
            }
        } else if (tree.values[0] == 'Factor') {
           return evaluator.Factor(tree, canvas, ctx, variables)
        } else if (tree.values[0] == 'Integrate') {
            return evaluator.integrateNum(tree, canvas, ctx, variables)
        } else if (tree.values[0] == 'Plot') {
            return evaluator.plot2D(tree, canvas, ctx, variables)
        } else if (tree.values[0] == 'ContourPlot') {
            return evaluator.contourPlot(tree, canvas, ctx, variables)
        } else if (tree.values[0] == 'Plot3D') {
            return evaluator.plot3D(tree, canvas, ctx, variables);
        } else if(tree.values[0] == 'Gamma'){
            return evaluator.gamma(tree);
        } else if(tree.values[0] == 'Simplify'){
            return evaluator.simplify(ntree.values[1],variables);
        } else if(tree.values[0] == 'Zeta'){
            return evaluator.zeta(tree.values[1],variables);
        } else if(tree.values[0] == 'Re'){
            return evaluator.complexTools.re(tree,variables);
        } else if(tree.values[0] == 'Im'){
            return evaluator.complexTools.im(tree,variables);
        } else if(tree.values[0] == 'PolyFactor'){
            return evaluator.polyFactor(tree.values[1]);;
        } else if(tree.values[0] == 'Plot5D'){
            return evaluator.plot5D(tree,canvas,ctx,variables);
        } else {
            canvas.style.display = 'none'
        }
    }
    return tree;
}
