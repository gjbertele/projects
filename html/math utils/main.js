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
        let queryString = query[0].split('=');
        let parsed = parseEq(queryString[0]);
        deEvaluate.style.display = 'none';
        deInput.style.display = 'none';
        let type = evaluator.quantifyEquation(parsed, queryString);
        if(type == 0) evaluator.normalEval(queryString, parsed, definitions);
        if(type == 1) evaluator.differentialEquationEval(queryString, parsed, definitions);
        if(type == 2) evaluator.polynomialEval(queryString, parsed, definitions);
        
    }
}

let lookuptableSqrt = [];
let lookuptableLogInt = [];
for (let i = 1; i < 100; i++) {
    lookuptableSqrt[i] = Math.sqrt(i);
    lookuptableLogInt[i] = Math.log(i + 1);
}