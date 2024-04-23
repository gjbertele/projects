class equation {
    terms = [];
    baseVariables = [];
    unit;
    varUnits = [];
    variableIDs = [];
    varsInTermOf = [];
    gradTemplate = [];
    optimizer = {
        learningRate:1e-7,
        momentum:0.5,
        scramble:false,
        scrambleThreshold:1e3,
        prestop: false
    }
    constructor(bvs){
        this.baseVariables.length = bvs.length;
        for(let i = 0; i<bvs.length; i++){
            bvs[i].derivative = (new Array(this.varUnits.length)).fill(0);
            bvs[i].subterms = this.generateSubterms(bvs[i].varOf, 7);
            bvs[i].equation = this;
            bvs[i].baseVariables = this.baseVariables;
            bvs[i].varId = i+1;
            this.varsInTermOf.push(...bvs[i].varOf);
        }
        this.baseVariables = bvs;
        this.varsInTermOf = this.varsInTermOf.filter((i,v) => v == this.varsInTermOf.indexOf(i));

        let unitVar = new variable([0],this,(new Array(this.varsInTermOf.length)).fill(0));
        unitVar.varId = 0;
        unitVar.coefficients.fill(0);
        unitVar.coefficients[0] = 1;
        unitVar.modify = false;
        this.unit = unitVar;
        this.baseVariables.push(unitVar);

        for(let i = 0; i<this.varsInTermOf.length; i++){
            let uv = new variable([this.varsInTermOf[i]],this,(new Array(this.varsInTermOf.length)).fill(0));
            uv.varId = this.baseVariables.length;
            uv.coefficients.fill(0);
            uv.coefficients[1] = 1;
            uv.modify = false;
            this.varUnits.push(uv);
            this.baseVariables.push(uv);
        }
        this.baseVariables.sort((a,b) => a.varId - b.varId);

        for(let i = 0; i<this.baseVariables.length; i++) this.gradTemplate[i] = (new Array(this.baseVariables[i].coefficients.length)).fill(0);
        return this;
    }
    eval(values){
        let k = 0;
        for(let i = 0; i<this.terms.length; i++) k+=this.terms[i].eval(values);
        return k;
    }
    push(t){
        this.terms.push(t);
    }
    generateSubterms(vars, max){
        let output = [];
        let terms = this.permute(vars.length,max);
        for(let i = 0; i<terms.length; i++){
            let exponents = (new Array(this.baseVariables.length)).fill(0);
            for(let j = 0; j<vars.length; j++){
                exponents[vars[j]] = terms[i][j];
            }
            output.push(exponents)
        }
        return output;
    }
    permute(count, max, current = []){
        let permutations = [];
        if(count == 1){
            for(let i = 0; i<max; i++) permutations.push([...current, i]);
        } else {
            for(let i = 0; i<max; i++) permutations.push(...this.permute(count-1,max,[...current, i]));
        }
        return permutations;
    }
    solve(a,b,epochs){
        let volume = 1;
        for(let i = 0; i<a.length; i++) if(a[i] != b[i]) volume*=4*(a[i] - b[i]);
        volume**=2;
        let lerror = 0;
        let momentum = this.gradTemplate.slice(0);
        for(let i = 0; i<epochs; i++){
            let eg = this.errorGrad(a, b);
            let error = eg.v;
            if(this.optimizer.prestop == true && error/(1+this.optimizer.momentum) > lerror && error*lerror > 0){
                console.warn('Increasing error at epoch '+i);
                break;
            } 
            lerror = error;
            if(error/volume**2 > this.optimizer.scrambleThreshold && this.optimizer.scramble == true){
                for(let j = 0; j<this.baseVariables.length; j++){
                    j.scramble(0.5);
                }
                for(let j = 0; j<this.terms.length; j++){
                    this.terms[j].update(this.baseVariables);
                }
                continue;
            }
            let grad = eg.totalGrad;
            if(i % 100 == 0) console.log("Error: "+error+" Epoch: "+ (i+1) +"/"+epochs+" Gradient:",grad);
            for(let j = 0; j<this.baseVariables.length; j++){
                if(this.baseVariables[j].modify == false) continue;
                for(let k = 0; k<this.baseVariables[j].coefficients.length; k++){
                    let d = -error*(grad[j][k]+this.optimizer.momentum*momentum[j][k])*this.optimizer.learningRate/volume;
                    //if(d != 0) console.log(i,d)
                    this.baseVariables[j].coefficients[k] += -error*(grad[j][k]+this.optimizer.momentum*momentum[j][k])*this.optimizer.learningRate/volume;
                }
            }
            for(let j = 0; j<this.terms.length; j++){
                this.terms[j].update(this.baseVariables);
            }
            momentum = grad;
        }
    }
    evaluateGradient(values){
        let k = this.gradTemplate.slice();
        for(let i = 0; i<this.terms.length; i++){
            k = addGradients(this.terms[i].evaluateGradient(values),k);
        }
        return k;
    }
    errorGrad(min, max, current = [], index = 0){
        if(min.length - index == 1){
            let totalGrad = this.gradTemplate.slice();
            let v = 0;
            for(let i = min[index]; i<=max[index]; i+=0.25){
                v += this.eval([...current, i]);
                totalGrad = addGradients(this.evaluateGradient([...current, i]), totalGrad);
            }
            return {v, totalGrad};
        } else {
            let v = 0;
            let totalGrad = this.gradTemplate.slice();
            for(let i = min[index]; i<=max[index]; i+=0.25){
                let eg = this.errorGrad(min, max, [...current, i], index + 1);
                v+=eg.v;
                totalGrad = addGradients(eg.totalGrad, totalGrad);
            }
            return {v, totalGrad};
        }
    }
}

class variable {
    subterms = [];
    derivative = [];
    coefficients = [];
    varOf = [];
    varId;
    equation;
    baseVariables;
    modify;
    constructor(vars, eq = 'na', nth = [], which = -1){
        this.varOf = vars;
        this.derivative = nth;
        this.varId = which;
        this.coefficients = (new Array(7**vars.length)).fill(0);
        this.modify = true;
        if(eq !== 'na'){
            this.subterms = eq.generateSubterms(vars, 7);
            this.equation = eq;
            this.baseVariables = eq.baseVariables;
            if(which != -1) this.coefficients = eq.baseVariables[which].derive(nth);
        }
        return this;
    }
    derive(partials){
        let coeffs = (new Array(this.coefficients.length)).fill(0)
        main: for(let i = 0; i<this.subterms.length; i++){
            let newTerms = this.subterms[i].slice();
            let gradProd = 1;
            for(let j = 0; j<partials.length; j++){
                gradProd *= product(newTerms[j]-partials[j]+1,newTerms[j]);
                newTerms[j] = newTerms[j] - partials[j];
                if(newTerms[j] < 0) continue main;
            }
            let ni = subtermToIndex(this.varOf,newTerms,7);
            coeffs[ni] += this.coefficients[i]*gradProd;
        }
        return coeffs;
    }
    eval(values){
        let v = 0;
        for(let i = 0; i<this.coefficients.length; i++){
            let exp = 1;
            for(let j = 0; j<this.baseVariables.length; j++) exp*=values[j]**this.subterms[i][j];
            v+=exp*this.coefficients[i];
        }
        return v;
    }
    scramble(radius = 1){
        for(let i = 0; i<this.coefficients.length; i++) this.coefficients[i] = radius*(Math.random()*2 - 1);
    }
}

class term {
    baseVariables = [];
    variables = [];
    pushLog = [];
    varUnits = [];
    unit;
    coefficient = 1;
    cachedGradient = [];
    equation;
    constructor(eq){
        this.equation = eq;
        this.varUnits = eq.varUnits;
        this.unit = eq.unit;
        this.baseVariables = eq.baseVariables;
        return this;
    }
    push(which, nth){
        this.pushLog.push([which, nth]);
        let tvariable = this.baseVariables[which];
        this.variables.push(new variable(tvariable.varOf, this.equation, nth, which));
    }
    update(bvs){
        this.baseVariables = bvs;
        this.variables = [];
        for(let i = 0; i<this.pushLog.length; i++){
            let entry = this.pushLog[i];
            let tv = bvs[entry[0]];
            this.variables.push(new variable(tv.varOf, this.equation, entry[1], entry[0]));
        }
    }
    evaluateGradient(values){
        if(this.cachedGradient.length == 0) this.gradient();
        let output = new Array(this.baseVariables.length);
        for(let i = 0; i<output.length; i++){
            output[i] = (new Array(this.baseVariables[i].coefficients.length)).fill(0);
            if(this.baseVariables[i].modify == false) continue;
            for(let j = 0; j<this.baseVariables[i].coefficients.length; j++){
                let arr = this.cachedGradient[i][j];
                output[i][j] = 0;
                for(let k = 0; k<arr.length; k++){
                    let entry = arr[k];
                    let expprod = 1;
                    for(let l = 0; l<entry[1].length; l++) expprod*=values[l]**entry[1][l];
                    for(let l = 0; l<entry[2].length; l++) expprod*=entry[2][l].eval(values);
                    output[i][j] += this.coefficient*entry[0]*expprod;
                }
            }
        }
        return output;
    }
    eval(values){
        let k = this.coefficient;
        for(let i = 0; i<this.variables.length; i++) k*=this.variables[i].eval(values);
        return k;
    }
    gradient(){
        let coeffGradients = new Array(this.baseVariables.length);
        for(let i = 0; i<coeffGradients.length; i++){
            coeffGradients[i] = new Array(this.baseVariables[i].coefficients.length);
            for(let j = 0; j<coeffGradients[i].length; j++){
                coeffGradients[i][j] = [];
            }
        }
        for(let i = 0; i<this.variables.length; i++){
            let vi = this.variables[i];
            //if(this.baseVariables[vi.varId].modify == false) continue;
            let otherTerms = [];
            for(let j = 0; j<this.variables.length; j++) if(j != i) otherTerms.push(this.variables[j]);
            outer: for(let j = 0; j<vi.coefficients.length; j++){
                let upd = vi.subterms[j].slice();
                let gradProd = 1;
                for(let k = 0; k<vi.derivative.length; k++){
                    gradProd*=product(upd[k]+1,upd[k]+vi.derivative[k]);
                    upd[k] += vi.derivative[k];
                    if(upd[k] > 6) continue outer;
                }
                let ni = subtermToIndex(vi.varOf,upd,7);
                coeffGradients[vi.varId][ni].push([gradProd,vi.subterms[j],otherTerms])
            }
        }
        this.cachedGradient = coeffGradients;
        return coeffGradients;
    }
}

function product(a,b){
    let v = 1;
    for(let i = a; i<=b; i++) v*=i;
    return v;
}

function addArray(m1, m2){
    let n = [];
    for(let i = 0; i<Math.max(m1.length,m2.length); i++) n[i] = (m1[i] ? m1[i] : 0) + (m2[i] ? m2[i] : 0);
    return n;
 }
 function addGradients(g1, g2){
    let output = [];
    for(let i = 0; i<g1.length; i++){
        output[i] = [];
        for(let j = 0; j<g1[i].length; j++){
            output[i][j] = g1[i][j] + g2[i][j];
        }
    }
    return output;
 }
 function subtermToIndex(varof,subterm,max){
    let index = 0;
    let exp = 0;
    for(let i = 0; i<subterm.length; i++){
        if(!varof.includes(i)) continue;
        index+=subterm[i]*max**exp;
        exp++;
    }
    return index;
 }


 //do a model w backward passes that backward passes for every point in the space
 //equations parsing
 //better optimizer