evaluator.differentialEquationEval = function(query, parsed, definitions){
    if(query.length > 1){
        let rightSide = {type:'*',values:[{type:'Number',values:-1},parseEq(query[1])]}
        parsed = {type:'+',values:[rightSide,parsed]};
    }

    let eq = evaluator.buildDESolver(parsed);
    let minr = (new Array(eq.eq.varUnits.length)).fill(-1);
    let maxr = (new Array(eq.eq.varUnits.length)).fill(1);
    console.log(eq);
    eq.eq.solve(minr,maxr,1e3);
    deEvaluate.style.display = 'inline-block';
    deInput.style.display = 'block';
    deEvaluate.onclick = function(){
        let k = deInput.value;
        let processed = parseEq(k);
        let functionPatch = {};
        for(let i = 0; i<eq.functionNames.length; i++){
            functionPatch[eq.functionNames[i]] = eq.eq.baseVariables[i+1];
        }
        console.log(processed)
        console.log(evaluator.normalEval(query, processed, {}, functionPatch));
    }
    //build DE ui
    //plot?
}