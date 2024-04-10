let standardPrecision = 15;
class equation {
    terms = [];
    baseVariables = [];
    cachedGradient = [];
    precision = 15;
    gradientTemplate = [];
    optimizer = {
        learningRate:1e-10,
        momentumRate:0.2,
        logging:true,
        scrambling:true
    }
    unit;
    varUnit;
    units = []
    //NEED TO FIX ERROR FUNCTION
    constructor(variables, defaultTerms = []){
        this.unit = new variable(0, this.precision);
        this.varUnit = new variable(1, this.precision);
        this.unit.coefficients[0] = 1;
        this.varUnit.coefficients[1] = 1;
        this.unit.modify = false;
        this.varUnit.modify = false;
        this.units = [this.unit, this.varUnit];
        this.baseVariables = this.units;
        this.baseVariables.push(...variables)
        for(let j = 0; j<defaultTerms.length; j++) this.terms[j] = defaultTerms[j];
        for(let i = 0; i<this.baseVariables.length; i++) this.gradientTemplate[i] = (new Array(this.baseVariables[i].coefficients.length)).fill(0);
    }
    push(t){
        this.terms.push(t);
        this.cachedGradient = [];
    }
    eval(value){
        let x = 0;
        for(let i = 0; i<this.terms.length; i++) x+=this.terms[i].eval(value);
        return x;
    }
    evaluateGradient(value){
        let total = new Array(this.baseVariables.length);
        for(let i = 0; i<total.length; i++) total[i] = (new Array(this.precision)).fill(0);
        for(let i = 0; i<this.terms.length; i++){
            let evaled = this.terms[i].evaluateGradient(value);
            total = addGradients(total, evaled);
        }
        return total;
    }
    solve(min, max, epochs){ 
        let t = performance.now();
        let momentum = new Array(this.baseVariables.length);
        for(let i = 0; i<momentum.length; i++) momentum[i] = (new Array(this.precision)).fill(0);
        let lastError = Infinity;
        for(let i = 0; i<epochs; i++){
            let {error, grad} = this.errorGrad(min, max);
            if(Math.abs(error) > this.optimizer.scrambleThreshold){
                this.scramble();
                i--;
                continue;
            }
            if(this.optimizer.scrambling == true){
                if(Math.abs(error) > Math.abs(lastError) + this.optimizer.learningRate){
                    if(Math.abs(error) > 0.01){
                        this.scramble();
                        i--;
                        continue;
                    } else {
                        console.warn('Stopped early - increasing error at low values',i,error)
                        break;
                    }
                }
            }
            if(this.optimizer.logging == true && i % 1000 == 0) console.log(error, grad, i)
            for(let i = 0; i<this.baseVariables.length; i++){
                if(this.baseVariables[i].modify == false) continue;
                for(let j = 0; j<this.baseVariables[i].coefficients.length; j++){
                    this.baseVariables[i].coefficients[j] += -error*(grad[i][j]+momentum[i][j]*this.optimizer.momentumRate)*this.optimizer.learningRate;
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
    errorGrad(min, max){
        let error = 0;
        let grad = this.gradientTemplate.slice();
        for(let i = min; i<=max; i+=0.25){
            error += this.eval(i)**2;
            grad = addGradients(grad, this.evaluateGradient(i));
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
        this.baseVariables = unis.concat(varis);
        this.units = unis;
        this.coefficient = coeff;
        for(let i = 0; i<defaultVaris.length; i++) this.variables[i] = defaultVaris[i];
        return this;
    }
    push(nth,which){
        this.variables.push(this.baseVariables[which].derive(nth));
        this.pushLog.push([which,nth]);
    }
    update(newBaseVars){
        this.baseVariables = newBaseVars;
        this.variables = [];
        for(let i = 0; i<this.pushLog.length; i++){
            let entry = this.pushLog[i];
            this.variables.push(this.baseVariables[entry[0]].derive(entry[1]));
        }
    }
    gradient(){
        let coeffPartials = new Array(this.baseVariables.length); 
        for(let i = 0; i<this.baseVariables.length; i++){
            coeffPartials[i] = new Array(this.baseVariables[i].coefficients.length);
            for(let j = 0; j<coeffPartials[i].length; j++) coeffPartials[i][j] = [];
            for(let j = 0; j<this.variables.length; j++){
                if(this.variables[j].id != this.baseVariables[i].id) continue;
                let nth = this.variables[j].derivative;
                let otherVars = [];
                for(let k = 0; k<this.variables.length; k++) if(k!=j) otherVars.push(this.variables[k]);
                let otherTerms = new term(this.baseVariables,this.coefficient,this.units,otherVars)
                for(let k = 0; k<coeffPartials[i].length - nth; k++){
                    coeffPartials[i][k+nth].push([this.baseVariables[j].coefficients[k],k,otherTerms]);
                }
            }
        }
        if(this.cachedGradient.length == 0) this.cachedGradient = coeffPartials;
        return coeffPartials;
    }
    eval(value){
        let v = 1;
        for(let i = 0; i<this.variables.length; i++){
            v*=this.variables[i].eval(value);
        }
        return v*this.coefficient;
    }
    evaluateGradient(value){
        if(this.cachedGradient.length == 0) this.gradient();
        let output = []
        for(let i = 0; i<this.cachedGradient.length; i++){
            output[i] = [];
            for(let j = 0; j<this.cachedGradient[i].length; j++){
                output[i][j] = 0;
                for(let k = 0; k<this.cachedGradient[i][j].length; k++){
                    let entry = this.cachedGradient[i][j][k];
                    output[i][j] += entry[0]*this.coefficient*value**entry[1]*entry[2].eval(value);
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
    constructor(iden, precision = standardPrecision){
        this.id = iden;
        this.coefficients = new Array(precision);
        this.coefficients.fill(0);
        return this;
    }
    firstDerivative(){
        let n = new variable(this.id,this.coefficients.length);
        for(let i = 0; i<n.coefficients.length - 1; i++){
            n.coefficients[i] = (i+1)*this.coefficients[i+1];
        }
        n.derivative++;
        return n;
    }
    derive(nth){
        let x = new variable(this.id, this.coefficients.length);
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
        let x = new variable(this.id, this.coefficients.length);
        for(let i = 0; i<standardPrecision - this.derivative; i++){
            x.coefficients[i+this.derivative] += this.coefficients[i+this.derivative]*product(i+1,i+this.derivative); 
        }
        return x;
    }
    clone(){
        let x = new variable(this.id, this.precision);
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

