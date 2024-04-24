const evaluator = new Evaluator();

document.body.onkeydown = function(e) {
    if (e.key == 'Enter') {
        canvas.style.display = 'none'
        let query = textbox.value.split("where");
        if (query[0].toLowerCase() == 'help') {
            output.innerHTML = helpString;
            return;
        }
        let definitions = {
            e: 2.718,
            pi: 3.14159265358979323846264
        }
        if (query.length > 1) {
            let j = query[1].replaceAll(' ', '').split("and");
            for (let k = 0; k < j.length; k++) {
                let n = j[k].split('=');
                definitions[n[0]] = parseFloat(n[1]);
            }
        }
        let parsed = parseEq(query[0]);
        let evaled = evaluator.evaluateEquation(parsed, definitions);
        output.innerHTML = equationToString(evaled) + `<br>`;
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
                        output.innerHTML += entry[2] + '^(1/' + entry[1] + ')<br>';
                    } else if (entry[0] == 1) {
                        let sta = entry[2] + '/' + entry[1] + ' = '+(entry[3]+entry[2]/entry[1]);
                        if(entry[3] != 0) sta = entry[3] + ' + ' + sta;
                        output.innerHTML+=sta+'<br>'
                    }
                }
            }
        }
    }
}

let lookuptableSqrt = [];
let lookuptableLogInt = [];
for (let i = 1; i < 100; i++) {
    lookuptableSqrt[i] = Math.sqrt(i);
    lookuptableLogInt[i] = Math.log(i + 1);
}