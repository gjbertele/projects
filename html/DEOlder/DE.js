class variable {
    constants = [];
    constructor(precision, c = []){
        this.constants = c;
        if(this.constants.length == 0) this.constants = (new Array(precision)).fill(0);
        return this;
    }
    derivative = function(){
        let shiftedConstants = [];
        for(let i = 0; i<this.constants.length - 1; i++){
            shiftedConstants[i] = (i+1)*this.constants[i+1];
        }
        shiftedConstants.push(0);
        return new variable(this.constants.length, shiftedConstants);
    }
    add = function(var2){
        let y = new variable(var2.constants.length);
        for(let i = 0; i<y.constants.length; i++){
            y.constants[i] = var2.constants[i] + this.constants[i];
        }
        return y;
    }
    eval = function(x){
        let val = 0;
        for(let i = 0; i<this.constants.length; i++) val+=this.constants[i]*(x**i);
        return val;
    }
}

class equation {
    coefficients = {};
    function = new variable(0);
    total = new variable(0);
    approxRate = 1e-7;
    constructor(y){
        this.function = y;
        return this;
    }
    push = function(nth,coefficient){
        if(this.coefficients[nth] == undefined) this.coefficients[nth] = 0;
        this.coefficients[nth] += coefficient;
    }
    gradients = function(a, b){
        let gradient = new variable(this.function.constants.length);
        for(let nth in this.coefficients){
            for(let i = nth; i<this.function.constants.length; i++){
                gradient.constants[i] += this.coefficients[nth]*product(i-nth+1,i)*this.function.constants[i];
            }
        }
        //console.log(gradient)
        let error = 0;
        for(let i = a; i<=b; i+=0.125){
            let e = this.eval(i);
            error += e;
        }
        if(!isNaN(error)){
            for(let i = 0; i<this.function.constants.length; i++){
                this.function.constants[i] += -error*this.approxRate*gradient.constants[i];
            }
        }
        this.total = new variable(0);
        //console.log(error)
        return error;
    }
    solve = function(a,b){
        let x = this.gradients(a,b);
        let counts = 0;
        while(Math.abs(x) >= 0.01 && counts < 1e6){
            let a = this.gradients(a,b);
            if(!isNaN(a)){
                x = n;
            } else {
                for(let i in this.coefficients){
                    this.coefficients[i] = Math.random();
                }
            }
            if(counts % 10000 == 0) console.log(x)
            counts++;
        }
        this.total = this.totalEquation();
        return counts;
    }
    totalEquation = function(){
        let total = new variable(this.function.constants.length);
        for(let nth in this.coefficients){
            for(let i = nth; i<this.function.constants.length; i++){
                total.constants[i - nth] += this.coefficients[nth]*product(i-nth+1,i)*this.function.constants[i];
            }
        }
        return total;
    }
    eval = function(x){
        if(this.total.constants.length == 0) this.total = this.totalEquation();
        return this.total.eval(x);
    }
}

function product(a,b){
    let v = 1;
    for(let i = a; i<=b; i++) v*=i;
    return v;
}

let ex = new variable(100);
ex.constants[0] = 1;
for(let i = 1; i<100; i++){
    ex.constants[i] = 1/i//ex.constants[i-1]/i;
}