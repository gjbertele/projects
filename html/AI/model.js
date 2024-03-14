class Activation{
    reg;
    prime;
    constructor(value){
        this.reg = value.reg;
        this.prime = value.prime;
        return this;
    }
}
class Vector {
    column = [];
    constructor(n, randomValues = false, fillValues = null){
        this.column.length = n;
        if(randomValues == true) {
            for(let i = 0; i<n; i++){
                this.column[i] = Math.random();
            }
        } else {
            if(fillValues != null){
                for(let i = 0; i<n; i++){
                    this.column[i] = fillValues;
                }
            } else {
                for(let i = 0; i<n; i++){
                    this.column[i] = 1;
                }
            }
        }
        return this;
    }
}
class Matrix {
    rows = [];
    constructor(n,m, randomValues = false, fillValues = null){
        this.rows.length = n;
        for(let i = 0; i<n; i++){
            this.rows[i] = new Vector(m, randomValues, fillValues);
        }
        return this;
    }
}
class Layer {
    size = 0;
    activation = '';
    constructor(size){
        this.size = size;
        return this
    }
}
class InputLayer {
    size = 0;
    constructor(length){
        this.size = length;
        return this;
    }
}
class model {
    constructor(){
        return this;
    }
    network = [];
    layerSizes = [];
    activations = [];
    biases = [];
    activationsPrime = [];
    optimizer = {
        decay: 0.9,
        learningRate:1e-2
    }
    compiled = false;
    add = function(input){
        if(this.compiled) throw new SyntaxError('Cannot change network after already being compiled!');
        const type = input.constructor.name;
        switch(type){
            case 'InputLayer':
                if(this.layerSizes != 0) throw new SyntaxError('Cannot have multiple input layers!');
                this.layerSizes.push(input.size)
                this.activations.push(null)
                break;
            case 'Layer':
                if(this.layerSizes.length == 0) throw new SyntaxError('Need InputLayer first!');
                this.layerSizes.push(input.size)
                this.activations.push(null)
                break;
            case 'Activation':
                if(this.layerSizes.length == 0) throw new SyntaxError('No layer to apply activation to!');
                this.activations[this.layerSizes.length - 1] = input.reg;
                this.activationsPrime[this.layerSizes.length - 1] = input.prime;
                console.log(input)
                break;
            default:
                throw new ReferenceError('Layer type \''+type+'\' unknown');
        }
    }
    compile = function(optimizer=null){
        if(this.compiled == true) throw new SyntaxError('Cannot compile more than once');
        for(let i = 0; i<this.layerSizes.length - 1; i++){
            this.network[i] = new Matrix(this.layerSizes[i],this.layerSizes[i+1], true);
            this.biases[i] = new Matrix(1,this.layerSizes[i], true);
        }
        this.network[this.layerSizes.length - 1] = new Matrix(this.layerSizes[this.layerSizes.length - 1], 1, true);
        this.biases[this.layerSizes.length - 1] = new Matrix(1,this.layerSizes[this.layerSizes.length - 1], true);
        for(let i = 0; i<this.layerSizes.length; i++){
            if(this.activations[i] == null){
                this.network[i].activation = relu;
                this.network[i].activationPrime = reluPrimeEval;
            } else {
                this.network[i].activation = this.activations[i];
                this.network[i].activationPrime = this.activationsPrime[i];
            }
        }
        this.compiled = true;
        if(optimizer != null) this.optimizer = optimizer;
    }
    predict = function(inputs){
        return this.evaluate(inputs).pop().rows[0];
    }
    evaluate = function(inputs){
        if(!this.compiled) throw new SyntaxError('Must compile before evaluating');
        let cLayer = [applyFunctionToMatrix(add(asMatrix([inputs]),this.biases[0]),this.network[0].activation)];
        for(let i = 1; i<this.network.length; i++){
            cLayer[i] = applyFunctionToMatrix(add(matrixDotProduct(cLayer[i-1],this.network[i-1]),this.biases[i]),this.network[i].activation)
        }
        return cLayer
    }
    backwardsPass = function(inputs, outputs, learningRate){
        let evaluated = this.evaluate(inputs);
        let gradients = new Array(this.network.length);
        let deltas = new Array(this.network.length);
        deltas[deltas.length - 1] = new Matrix(outputs.length,1);
        gradients[gradients.length - 1] = new Matrix(outputs.length,1);

        //base case for delta
        for(let i = 0; i<outputs.length; i++){
            deltas[deltas.length - 1].rows[i].column[0] = evaluated[evaluated.length - 1].rows[0].column[i] - outputs[i]
            gradients[gradients.length - 1].rows[i].column[0] = deltas[deltas.length - 1].rows[i].column[0] * this.network[this.network.length-1].activationPrime(evaluated[evaluated.length - 1].rows[0].column[i]);
        }
        for(let i = deltas.length - 2; i > -1; i--){
            //create activations of layer
            let activationsPrimeVector =  new Matrix(this.network[i].rows.length, 1, false, 0);
            for(let j = 0; j<this.network[i].rows.length; j++){
                activationsPrimeVector.rows[j].column[0] = evaluated[i].rows[0].column[j]*(1-evaluated[i].rows[0].column[j]);
            }

            let prod1 = matrixDotProduct((this.network[i]),deltas[i+1]); //this.network[i] * deltas[i+1]
            let prod2 = hadamardProduct(prod1,activationsPrimeVector); //(this.network[i] * deltas[i+1]) O activationsVector
            //this.network[i] = transpose(W l+1)
            deltas[i] = prod2;
        }


        for(let i = 1; i<this.network.length; i++){
            gradients[i-1] = transpose(matrixDotProduct(deltas[i],(evaluated[i-1]))); //transposed b/c this solves for input weights but need output weights
            
        }
        for(let i = 0; i<this.network.length; i++){
            this.network[i] = add(this.network[i],mult(gradients[i],-learningRate));
            this.biases[i] = add(this.biases[i],mult(transpose(deltas[i]),-learningRate));
        }
        return gradients;
    }
    epoch = function(dataset, learningRate){
        for(let i = 0; i<dataset.length; i++){
            this.backwardsPass(dataset[i].inputs, dataset[i].outputs, learningRate);
        }
    }
    train = function(dataset, epochs){
        let learningRate = this.optimizer.learningRate;
        for(let i = 0; i<epochs; i++){
            this.epoch(dataset, learningRate);
            learningRate*=this.optimizer.decay;
            if(learningRate == 0) break;
        }
    }
}