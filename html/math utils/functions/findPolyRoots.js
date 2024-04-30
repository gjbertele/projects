evaluator.polyFactor = function(tree){
    let terms = evaluator.polyTreeToTerms(tree);
    let copyterms = terms.slice();
    let leadingCoeff = terms[terms.length - 1];
    while(leadingCoeff == 0){
        terms.length--;
        leadingCoeff = terms[terms.length - 1];
    }
    let inLength = terms.length;
    let outputs = [];
    for(let i = 0; i<inLength; i++){
        let t1 = 0;
        let t2 = 0;
        let s = 0;
        let cauchyBound = 0;
        for(let i = terms.length - 1; i>-1; i--){
            if(terms[i] != 0){
                terms.length = i+1;
                break;
            }
        }
        for(let i = 0; i<terms.length; i++){
            let t = Math.abs(terms[i]/terms[terms.length - 1])
            cauchyBound = Math.max(t,cauchyBound);
        }
        cauchyBound++;
        while(evaluator.polyHandler.polyEval(terms,t1) > 0 && s < 10000){
            t1 = Math.random()*2*cauchyBound - cauchyBound;
            s++;
        }

        //console.log(s,cauchyBound)
        let g1 = 2**63;
        let g1e = g1;
        if(s < 10000){
            while(evaluator.polyHandler.polyEval(terms,t2) < 0 && s < 20000){
                t2 = Math.random()*2*cauchyBound - cauchyBound;
                s++;
            }
            if(s<20000){
                g1 = evaluator.polyHandler.recurseRoot(terms,t1,t2);
                g1e = evaluator.polyHandler.polyEval(terms,g1);
            }
        }
        //console.log(s,cauchyBound)
        let g2  = evaluator.polyHandler.solveRoot(terms,cauchyBound);
        let g2e = evaluator.polyHandler.polyEval(terms,g2);
        let j = g2;
        console.log(g1,g2)
        if(Math.abs(g1e) < Math.abs(g2e)) j = g1;
        if(isNaN(j)) break;
        let nt = [-j,1];
        outputs.push(j);

        terms = evaluator.polyHandler.polyDivide(terms,nt);
        for(let i = 0; i<terms.length; i++){
            if(Math.abs(Math.round(terms[i]) - terms[i]) < 1e-5 || Math.abs(terms[i]) < 1e-5) terms[i] = Math.round(terms[i]);
        }
        if(terms[1] != 0){
            let last = true;
            for(let i = 2; i<terms.length; i++){
                if(terms[i] != 0){
                    last = false;
                    break;
                }
            }
            if(last){
                outputs.push(-terms[0]/terms[1]);
                terms = [];
                break;
            }
        }
    }
    for(let i = 0; i<outputs.length; i++) if(Math.abs(Math.round(outputs[i]) - outputs[i]) < 1e-10) outputs[i] = Math.round(outputs[i]);
    let outputEquation = {type:'Number',values:leadingCoeff};
    for(let i = 0; i<outputs.length; i++){
        let tSub = {type:'Parenthesis',values:[{type:'-',values:[{type:'Variable',values:'x'},{type:'Number',values:outputs[i]}]}]}
        if(outputs[i] < 0) tSub.values[0] = {type:'+',values:[{type:'Variable',values:'x'},{type:'Number',values:-outputs[i]}]}
        outputEquation = {type:'*',values:[outputEquation,tSub]}
    }
    if(terms.length != 0){
        let addOn ={type:'Number',values:terms[0]};
        for(let i = 1; i<terms.length; i++){
            addOn = {type:'+',values:[addOn,{type:'*',values:[{type:'Number',values:terms[i]},{type:'^',values:[{type:"Variable",values:'x'},{type:'Number',values:i}]}]}]};
        }
        outputEquation = {type:'*',values:[outputEquation,{type:'Parenthesis',values:[addOn]}]}

    }
    return [outputEquation, copyterms];
}