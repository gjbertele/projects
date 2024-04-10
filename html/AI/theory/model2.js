class Activation {
    reg;
    prime;
    constructor(value) {
        this.reg = value.reg;
        this.prime = value.prime;
        return this;
    }
}
class Vector {
    column = [];
    constructor(n, randomValues = false, fillValues = null) {
        this.column.length = n;
        if (randomValues == true) {
            for (let i = 0; i < n; i++) {
                this.column[i] = new complex(Math.random(),Math.random());
            }
        } else {
            if (fillValues != null) {
                for (let i = 0; i < n; i++) {
                    this.column[i] = fillValues;
                }
            } else {
                for (let i = 0; i < n; i++) {
                    this.column[i] = new complex(1,0);
                }
            }
        }
        return this;
    }
}
class Matrix {
    rows = [];
    constructor(n, m, randomValues = false, fillValues = null) {
        this.rows.length = n;
        for (let i = 0; i < n; i++) {
            this.rows[i] = new Vector(m, randomValues, fillValues);
        }
        return this;
    }
}
class Layer {
    size = 0;
    activation = '';
    constructor(size) {
        this.size = size;
        return this
    }
}
class InputLayer {
    size = 0;
    constructor(length) {
        this.size = length;
        return this;
    }
}
class model {
    constructor() {
        return this;
    }
    network = [];
    layerSizes = [];
    activations = [];
    biases = [];
    activationsPrime = [];
    optimizer = {
        decay: new complex(0.999, 0.999),
        learningRate: new complex(1e-5,1e-5),
        momentum: new complex(0.5, 0.5),
        momentumDecay: new complex(0.9,0.9),
        momentumCap: new complex(0.5,5),
        dropout: 0,
        clip: [-1e2, 1e2],
        clipDecay: 0.9,
        bias: false,
        biasClamp: [-1, 1]
    }
    compiled = false;
    add = function(input) {
        if (this.compiled) throw new SyntaxError('Cannot change network after already being compiled!');
        const type = input.constructor.name;
        switch (type) {
            case 'InputLayer':
                if (this.layerSizes != 0) throw new SyntaxError('Cannot have multiple input layers!');
                this.layerSizes.push(input.size)
                this.activations.push(null)
                break;
            case 'Layer':
                if (this.layerSizes.length == 0) throw new SyntaxError('Need InputLayer first!');
                this.layerSizes.push(input.size)
                this.activations.push(null)
                break;
            case 'Activation':
                if (this.layerSizes.length == 0) throw new SyntaxError('No layer to apply activation to!');
                this.activations[this.layerSizes.length - 1] = input.reg;
                this.activationsPrime[this.layerSizes.length - 1] = input.prime;
                break;
            default:
                throw new ReferenceError('Layer type \'' + type + '\' unknown');
        }
    }
    compile = function(optimizer = null) {
        if (this.compiled == true) throw new SyntaxError('Cannot compile more than once');
        for (let i = 0; i < this.layerSizes.length - 1; i++) {
            this.network[i] = new Matrix(this.layerSizes[i], this.layerSizes[i + 1], true);
            if (this.optimizer.bias) {
                this.biases[i] = new Matrix(1, this.layerSizes[i], true);
            } else {
                this.biases[i] = new Matrix(1, this.layerSizes[i], false, new complex(0,0));
            }
        }
        this.network[this.layerSizes.length - 1] = new Matrix(this.layerSizes[this.layerSizes.length - 1], 1, true);
        if (this.optimizer.bias == true) {
            this.biases[this.layerSizes.length - 1] = new Matrix(1, this.layerSizes[this.layerSizes.length - 1], true);
        } else {
            this.biases[this.layerSizes.length - 1] = new Matrix(1, this.layerSizes[this.layerSizes.length - 1], false, new complex(0,0));

        }
        for (let i = 0; i < this.layerSizes.length; i++) {
            if (this.activations[i] == null) {
                this.network[i].activation = complexRelu;
                this.network[i].activationPrime = complexReluPrimeEval;
            } else {
                this.network[i].activation = this.activations[i];
                this.network[i].activationPrime = this.activationsPrime[i];
            }
        }
        this.compiled = true;
        if (optimizer != null) this.optimizer = optimizer;
    }
    predict = function(inputs) {
        return this.evaluate(inputs).pop().rows[0];
    }
    evaluate = function(inputs) {
        if (!this.compiled) throw new SyntaxError('Must compile before evaluating');
        let cLayer = [applyComplexFunctionToMatrix(addMatC(asMatrix([inputs]), this.biases[0]), this.network[0].activation)];
        for (let i = 1; i < this.network.length; i++) {
            let temp = matrixDotProductC(cLayer[i - 1], this.network[i - 1]);
            if (this.optimizer.bias == true) temp = addMatC(temp, this.biases[i]);
            cLayer[i] = applyComplexFunctionToMatrix(temp, this.network[i].activation);
        }
        return cLayer
    }
    backwardsPass = function(inputs, outputs, clip) {
        let deltas = [];
        let gradients = [];
        let evaluated = this.evaluate(inputs);
        //console.log(evaluated);
        deltas[this.network.length - 1] = new Matrix(outputs.length, 1, false, new complex(0,0));
        gradients[this.network.length - 1] = new Matrix(outputs.length, 1, false, new complex(0,0));
        for (let i = 0; i < outputs.length; i++) {
            deltas[deltas.length - 1].rows[i].column[0] = subtractC(evaluated[evaluated.length - 1].rows[0].column[i],outputs[i]);
            gradients[deltas.length - 1].rows[i].column[0] = multC(deltas[deltas.length - 1].rows[i].column[0],evaluated[evaluated.length - 1].rows[0].column[i]);
        }
        console.log('gradients',gradients);
        console.log('deltas',deltas)
        for (let i = this.network.length - 2; i > -1; i--) {
            let activationsPrimeVector = transpose(evaluated[i]);
            let prod1 = matrixDotProductC(this.network[i], deltas[i + 1]);
            deltas[i] = hadamardC(prod1, activationsPrimeVector);
        }

        console.log('deltas2',deltas)
        console.log('gradients2',gradients)
        for (let i = 0; i < deltas.length - 1; i++) {
            gradients[i] = transpose(matrixDotProductC(deltas[i + 1], evaluated[i]));
            console.log('grad'+i,gradients[i])
            gradients[i] = clampMatC(gradients[i], clip[0], clip[1]);
        }
        return {
            gradients,
            deltas
        };
    }
    epoch = function(dataset, learningRate, cmomentum, cbiasMomentum, clip, mv) {
        let momentum = cmomentum;
        let biasMomentum = cbiasMomentum;
        let totalGradients = [];
        let totalDeltas = [];
        for (let i = 0; i < this.network.length; i++) {
            totalGradients[i] = new Matrix(this.network[i].rows.length, this.network[i].rows[0].column.length, false, new complex(0,0));
            totalDeltas[i] = new Matrix(this.network[i].rows.length, 1, false, new complex(0,0));
        }
        console.log('t0',totalGradients);
        for (let i = 0; i < dataset.length; i++) {
            let { gradients, deltas } = this.backwardsPass(dataset[i].inputs, dataset[i].outputs, clip);
            console.log('gradsout'+i,gradients)
            for (let j = 0; j < gradients.length; j++) {
                if (Math.random() >= this.optimizer.dropout) {
                    totalGradients[j] = addMatC(gradients[j], totalGradients[j]);
                    totalDeltas[j] = addMatC(deltas[j], totalDeltas[j]);
                }
            }
        }
        console.log('t1',totalGradients)
        return;
        for (let j = 0; j < this.network.length; j++) {
            totalGradients[j] = multMatC(totalGradients[j], new complex(1 / dataset.length));
            totalGradients[j] = addMatC(totalGradients[j], multMatC(momentum[j], subtractC(0,mv)));
            totalGradients[j] = multMatC(totalGradients[j], subtractC(0,learningRate));
            this.network[j].rows = addMatC(totalGradients[j], this.network[j]).rows;
            if (this.optimizer.bias == true) {
                totalDeltas[j] = multMatC(addMatC(totalDeltas[j], multMatC(biasMomentum[j], subtractC(0,mv))), subtractC(0,learningRate));
                this.biases[j] = addMatC(transpose(totalDeltas[j]), this.biases[j]);

            }
        }
        console.log('t2',totalGradients)
        for (let i = 0; i < this.biases.length; i++) {
            this.biases[i] = clampMatC(this.biases[i], this.optimizer.biasClamp[0], this.optimizer.biasClamp[1]);
        }
        return {
            momentum: totalGradients,
            biasMomentum: totalDeltas
        };
    }
    train = function(dataset, epochs, logging = false) {
        let start = performance.now();
        let learningRate = this.optimizer.learningRate;
        let momentumVal = this.optimizer.momentum;
        let momentum = [];
        let biasMomentum = [];
        let clip = [this.optimizer.clip[0], this.optimizer.clip[1]]
        for (let i = 0; i < this.network.length; i++) {
            momentum[i] = new Matrix(this.network[i].rows.length, this.network[i].rows[0].column.length, false, new complex(0,0));
            biasMomentum[i] = new Matrix(this.network[i].rows.length, 1, false, new complex(0,0));
        }
        for (let i = 0; i < epochs; i++) {
            let totalChange = this.epoch(dataset, learningRate, momentum, biasMomentum, clip, momentumVal);
            console.log(totalChange);
            momentum = totalChange.momentum;
            biasMomentum = totalChange.biasMomentum;
            momentumVal.a *= this.optimizer.momentumDecay.a;
            momentumVal.b *= this.optimizer.momentumDecay.b;
            if (compareC(momentumVal,this.optimizer.momentumCap)) momentumVal = this.optimizer.momentumCap;
            learningRate.a *= this.optimizer.decay.a;
            learningRate.b *= this.optimizer.decay.b;
            clip[0] *= this.optimizer.clipDecay;
            clip[1] *= this.optimizer.clipDecay;
            if (logging == true) console.log('lr', learningRate, 'clip', clip, 'momentum', momentumVal, 'epoch', i)
            if (learningRate == 0 || clip[0] == 0) break;
        }
        if (logging == true) console.log('time', performance.now() - start)
    }
    /*optimize = function(input, epochs) {
        epochs/=10;
        if (input == undefined) throw new Error("Dataset is undefined");
        if (this.compiled == false) throw new Error("Must be compiled before optimizing");
        if (input.length == 0) return;
        let largestError = 0;
        for (let i = 0; i < input.length; i++) {
            let prediction = this.predict(input[i].inputs).column;
            let err = 0;
            for (let j = 0; j < prediction.length; j++) {
                err += Math.abs(prediction[j] - input[i].outputs[j]);
            }
            if (err > largestError) largestError = err;
        }
        this.optimizer.bias = false;
        let biasArr = input.filter(i => i.inputs.filter(j => j != 0).length == 0);
        if (biasArr.length > 0 && biasArr[0].outputs.filter(j => j!=0).length > 0) {
            let means = (new Array(input[0].length)).fill(0);
            for (let i = 0; i < input.length; i++) {
                for (let j = 0; j < input[i].outputs.length; j++) {
                    means[j] += input[i].outputs[j];
                }
            }
            for (let i = 0; i < means.length; i++) means[i] /= input.length;
            let SD = 0;
            for (let i = 0; i < input.length; i++) {
                for (let j = 0; j < input[i].outputs.length; j++) {
                    SD += (input[i].outputs[j] - means[j]) ** 2;
                }
            }
            SD /= input.length * input[0].outputs.length;
            SD **= 0.5;

            this.optimizer.biasClamp = [-SD, SD];
            this.optimizer.bias = true;
        }
        this.optimizer.learningRate = largestError / epochs;
        this.optimizer.decay = (1e-100 / this.optimizer.learningRate) ** (1 / epochs);
        this.optimizer.clipDecay = this.optimizer.decay * (1 - this.optimizer.learningRate);
        this.optimizer.momentumDecay = 1 / this.optimizer.clipDecay;

    }*/
}