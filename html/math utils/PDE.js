let standardPrecision = 15;
class equation {
    terms = [];
    baseVariables = [];
    cachedGradient = [];
    precision = 15;
    gradientTemplate = [];
    optimizer = {
        learningRate:1e-10,
        momentumRate:0,
        logging:true,
        scrambling:false,
        scrambleThreshold:1e5
    }
    unit;
    varUnits;
    units = []
    //NEED TO FIX ERROR FUNCTION
    constructor(variables, defaultTerms = []){ 
        let diffVarCount = 0;
        for(let i = 0; i<variables.length; i++) diffVarCount = Math.max(diffVarCount, variables[i].inputID);
        diffVarCount++;
        this.unit = new variable(0, 0, this.precision); 
        this.varUnits = [];
        for(let i = 0; i<diffVarCount; i++){
            let n = new variable(1, i, this.precision);
            n.coefficients[1] = 1;
            n.modify = false;
            this.varUnits.push(n);
        }
        this.unit.coefficients[0] = 1;
        this.unit.modify = false;
        this.units = [this.unit, ...this.varUnits];
        this.baseVariables = [this.unit, ...this.varUnits];
        this.baseVariables.push(...variables);
        for(let j = 0; j<defaultTerms.length; j++) this.terms[j] = defaultTerms[j];
        for(let i = 0; i<this.baseVariables.length; i++) this.gradientTemplate[i] = (new Array(this.baseVariables[i].coefficients.length)).fill(0);
    }
    push(t){
        this.terms.push(t);
        this.cachedGradient = [];
    }
    eval(values){ 
        let x = 0;
        for(let i = 0; i<this.terms.length; i++){
            let ev = this.terms[i].eval(values);
            x+=ev;
        } 
        return x;
    }
    evaluateGradient(values){
        let total = new Array(this.baseVariables.length);
        for(let i = 0; i<total.length; i++) total[i] = (new Array(this.precision)).fill(0);
        for(let i = 0; i<this.terms.length; i++){
            let evaled = this.terms[i].evaluateGradient(values);
            total = addGradients(total, evaled);
        }
        return total;
    }
    solve(min, max, epochs){ 
        let t = performance.now();
        let momentum = new Array(this.baseVariables.length);
        for(let i = 0; i<momentum.length; i++) momentum[i] = (new Array(this.precision)).fill(0);
        let lastError = Infinity;
        let eoffset = 1;
        for(let i = 0; i<min.length; i++){
            eoffset *= Math.abs(min[i] - max[i]) + 1
        }
        for(let i = 0; i<epochs; i++){
            let {error, grad} = this.errorGrad(min, max);
            error /= eoffset;
            if(this.optimizer.logging == true && i % 1000 == 0) console.log(error, grad, i)
            if(Math.abs(error) > this.optimizer.scrambleThreshold){
                this.scramble();
                continue;
            }
            if(this.optimizer.scrambling == true){
                if(Math.abs(error) > Math.abs(lastError) + 1e-5){
                    if(Math.abs(error) > 0.01){
                        this.scramble();
                        continue;
                    } else if(Math.abs(error - lastError) > 0.05){
                        console.warn('Stopping early - error increasing too fast at good epoch')
                        break;
                    }
                }
            }
            for(let i = 0; i<this.baseVariables.length; i++){
                if(this.baseVariables[i].modify == false) continue;
                for(let j = 0; j<this.baseVariables[i].coefficients.length; j++){
                    let diff = -error*(grad[i][j]+momentum[i][j]*this.optimizer.momentumRate)*this.optimizer.learningRate;
                    this.baseVariables[i].coefficients[j] += diff;
                }
            }
            for(let i = 0; i<this.terms.length; i++){
                this.terms[i].update(this.baseVariables);
            }
            momentum = grad;
            lastError = error;
        }
       return {error:lastError,time:performance.now() - t,results:this.baseVariables};
    }
    errorGrad(min, max, current = []){
        let error = 0;
        let grad = this.gradientTemplate.slice();
        if(min.length == 1){
            for(let i = min[0]; i<=max[0]; i+=0.25){
                error += this.eval([...current, i]);
                grad = addGradients(grad, this.evaluateGradient([...current, i]));
            }
        } else {
            for(let i = min[0]; i<=max[0]; i+=0.25){
                let eg = this.errorGrad(min.slice().splice(1),max.slice().splice(1),[...current,i])
                error += eg.error;
                grad = addGradients(grad, eg.grad);
            }
        }
        return {error, grad};
    }
    scramble(){
        for(let j = 0; j<this.baseVariables.length; j++){
            if(this.baseVariables[j].modify == false) continue;
            for(let k = 0; k<this.baseVariables[j].coefficients.length; k++){
                this.baseVariables[j].coefficients[k] = Math.random()*2 - 1;
            }
        }
        for(let j = 0; j<this.terms.length; j++){
            this.terms[j].update(this.baseVariables);
        }
    }
}

class term {
    baseVariables = [];
    variables = [];
    pushLog = [];
    units = []
    coefficient = 1;
    cachedGradient = [];
    constructor(varis, coeff, unis, defaultVaris = []){
        this.baseVariables = varis;
        this.units = unis;
        this.coefficient = coeff;
        this.baseVariables.push(...this.units)
        for(let i = 0; i<defaultVaris.length; i++) this.variables[i] = defaultVaris[i];
        return this;
    }
    push(nth,which){
        this.variables.push(which.derive(nth));
        this.pushLog.push([which,nth]);
    }
    update(newBaseVars){
        this.baseVariables = newBaseVars;
        this.variables = [];
        for(let i = 0; i<this.pushLog.length; i++){
            let entry = this.pushLog[i];
            this.variables.push(this.baseVariables[entry[0].id].derive(entry[1]));
        }
    }
    gradient(){
        let coeffPartials = new Array(this.baseVariables.length); 
        this.baseVariables.sort((a,b) => a.id - b.id);
        for(let i = 0; i<this.baseVariables.length; i++){
            coeffPartials[i] = new Array(this.baseVariables[i].coefficients.length);
            for(let j = 0; j<coeffPartials[i].length; j++) coeffPartials[i][j] = [];
            if(this.baseVariables[i].modify == false) continue;
            for(let j = 0; j<this.variables.length; j++){
                if(this.variables[j].id != this.baseVariables[i].id) continue;
                let nth = this.variables[j].derivative;
                let otherVars = [];
                for(let k = 0; k<this.variables.length; k++) if(k!=j) otherVars.push(this.variables[k]);
                let otherTerms = new term(this.baseVariables,this.coefficient,[],otherVars)
                for(let k = 0; k<coeffPartials[i].length - nth; k++){
                    coeffPartials[i][k+nth].push([this.variables[j].coefficients[k],k,otherTerms]);
                }
            }
        }
        if(this.cachedGradient.length == 0) this.cachedGradient = coeffPartials;
        return coeffPartials;
    }
    eval(values){
        let v = 1;
        for(let i = 0; i<this.variables.length; i++){
            v*=this.variables[i].eval(values[this.variables[i].inputID]);
        }
        return v*this.coefficient;
    }
    evaluateGradient(values){ 
        if(this.cachedGradient.length == 0) this.gradient();
        let output = []
        for(let i = 0; i<this.cachedGradient.length; i++){
            output[i] = [];
            for(let j = 0; j<this.cachedGradient[i].length; j++){
                output[i][j] = 0;
                for(let k = 0; k<this.cachedGradient[i][j].length; k++){
                    let entry = this.cachedGradient[i][j][k];
                    output[i][j] += entry[0]*values[this.baseVariables[i].inputID]**entry[1]*entry[2].eval(values);
                }
            }
        }
        return output;
    }
}

class variable {
    coefficients = [];
    derivative = 0;
    id;
    modify = true;
    inputID = 0;
    constructor(iden, inid = 0, precision = standardPrecision){
        this.id = iden;
        this.coefficients = new Array(precision);
        this.coefficients.fill(0);
        this.inputID = inid;
        return this;
    }
    firstDerivative(){
        let n = new variable(this.id, this.inputID,this.coefficients.length);
        for(let i = 0; i<n.coefficients.length - 1; i++){
            n.coefficients[i] = (i+1)*this.coefficients[i+1];
        }
        n.derivative++;
        return n;
    }
    derive(nth){
        let x = new variable(this.id, this.inputID, this.coefficients.length);
        for(let i = 0; i<x.coefficients.length; i++) x.coefficients[i] = this.coefficients[i];
        for(let j = 0; j<nth; j++) x = x.firstDerivative();
        return x;
    }
    eval(x){
        let t = 0;
        for(let i = 0; i<this.coefficients.length; i++) t+=this.coefficients[i]*(x**i);
        return t;
    }
    coeffGrad(){
        let x = new variable(this.id, this.inputID, this.coefficients.length);
        for(let i = 0; i<standardPrecision - this.derivative; i++){
            x.coefficients[i+this.derivative] += this.coefficients[i+this.derivative]*product(i+1,i+this.derivative); 
        }
        return x;
    }
    clone(){
        let x = new variable(this.id, this.inputID, this.precision);
        x.derivative = this.derivative;
        x.modify = this.modify;
        x.coefficients = this.coefficients;
        return x;
    }
}

function product(a,b){
    let t = 1;
    for(let i = a; i<=b; i++) t*=i;
    return t;
}

function addGradients(p1, p2){
    let n = [];
    for(let i = 0; i<p1.length; i++){
        n[i] = [];
        for(let j = 0; j<p1[0].length; j++){
            n[i][j] = p1[i][j] + p2[i][j];
        }
    }
    return n;
}


//include basic function applied to each term/variable w/ descriptor of how it changes derivative/gradient -> just apply that function to the gradient?
//nested functions??
//F(G(x,y)) = H(x,y)
//but then no connection to others
//-> linkedfunctions variable?
//difference equations