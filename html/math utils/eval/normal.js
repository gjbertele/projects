evaluator.normalEval = function(query, parsed, definitions, functionPatch = {}){
let evaled = evaluator.evaluateEquation(parsed, definitions, functionPatch);
output.innerHTML = evaluator.equationToString(evaled) + `<br>`;
if (evaled.type == 'Number') {
    let factored = Math.factor(BigInt(Math.round(evaled.values + 0)));
    let fs = 'Factoring of ' + Math.round(evaled.values + 0) + ': ';
    for (let i in factored) {
        if (factored[i] != 1) {
            fs += i + '^' + parseInt(factored[i]) + ' ';
        } else {
            fs += i + ' ';
        }
    }
    output.innerHTML += fs + `<br>`;
    let closedForms = evaluator.closedForms(evaled.values + 0);
    if (closedForms.length != 0 && evaled.values % 1 != 0) {
        output.innerHTML += 'Possible Closed Forms:<br>';
        for (let i = 0; i < closedForms.length; i++) {
            let entry = closedForms[i];
            if (entry[0] == 0 && evaled.values.toString().split('.')[1].length > 1 ) {
                output.innerHTML += entry[2] + '^(1/' + entry[1] + ') = '+(entry[2]**(1/entry[1]))+'<br>';
            } else if (entry[0] == 1) {
                let sta = entry[2] + '/' + entry[1] + ' = '+(entry[3]+entry[2]/entry[1]);
                if(entry[3] != 0) sta = entry[3] + ' + ' + sta;
                output.innerHTML+=sta+'<br>'
            } else if(entry[0] == 2){
                let sta = entry[2]+'sqrt('+entry[1]+') = '+(entry[3]+entry[2]*Math.sqrt(entry[1]));
                if(entry[3] != 0) sta = entry[3] + ' + ' + sta ;
                output.innerHTML+=sta+'<br>'
            }
        }
    }
    
}
}