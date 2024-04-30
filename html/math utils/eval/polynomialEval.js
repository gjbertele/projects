evaluator.polynomialEval = function(query, parsed, definitions){
    let factored = evaluator.polyFactor(parsed);
    let terms = factored[1];
    let eq = factored[0];
    output.innerHTML = evaluator.equationToString(eq)+'<br>';
    let derivative = [];
    for(let i = 1; i<terms.length; i++){
        derivative[i-1] = terms[i]*i;
    }
    let outputEq = {type:'Number',values:derivative[0]};
    for(let i = 1; i<derivative.length; i++){
        if(derivative[i] == 0) continue;
        let currentTerm = {type:'*',values:[{type:'Number',values:derivative[i]},{type:'^',values:[{type:'Variable',values:'x'},{type:'Number',values:i}]}]};
        outputEq = {type:'+',values:[outputEq,currentTerm]};
    }
    output.innerHTML += 'Derivative: <br>'+evaluator.equationToString(outputEq)+'<br>';
    //evaluator.plot2D()
    //minima, maxima
    //plot
    //integral
}