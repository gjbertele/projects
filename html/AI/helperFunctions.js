var activations = ['x']
var dW = 0.01;
var activationsprime = [1]
function sigmoid(x){
    return 1/(1+Math.E**(-x))
}
function sigmoidPrime(x){
    return sigmoid(x)*(1-sigmoid(x))
}


function asMatrix(N){
    let newmat = new Matrix(N.length, N[0].length, false);
    for(let i = 0; i<N.length; i++){
        for(let j = 0; j<N[0].length; j++){
            newmat.rows[i].column[j] = N[i][j];
        }
    }
    return newmat;
}
function matrixDotProduct(mat1,mat2){
    let x, i, j; 
    let m1 = mat1.rows.length;
    let m2 = mat1.rows[0].column.length;
    let n1 = mat2.rows.length;
    let n2 = mat2.rows[0].column.length;
    let res = new Array(m1); 
    for (i = 0; i < m1; i++)  
    { 
        res[i] = []
        for (j = 0; j < n2; j++)  
        { 
            res[i][j] = 0; 
            for (x = 0; x < m2; x++)  
            { 
                res[i][j] += mat1.rows[i].column[x] * mat2.rows[x].column[j]; 
            } 
        } 
    } 
    return asMatrix(res);
}
function transpose(A){
    let newmat = new Matrix(A.rows[0].column.length, A.rows.length)
    for(let i = 0; i<A.rows.length; i++){
        for(let j = 0; j<A.rows[0].column.length; j++){
            newmat.rows[j].column[i] = A.rows[i].column[j]
        }
    }
    return newmat;
}
function hadamardProduct(A,B){
    let n = new Matrix(A.rows.length, A.rows[0].column.length)
    for(let i = 0; i<n.rows.length; i++){
        for(let j = 0; j<n.rows[0].column.length; j++){
            n.rows[i].column[j] = A.rows[i].column[j] * B.rows[i].column[j];
        }
    }
    return n;
}
function sigmoidPrimeEval(x){
    return x - x**2;
}
function applyFunctionToMatrix(mat, f){
    let newmat = new Matrix(mat.rows.length, mat.rows[0].column.length, false, 0)
    for(let i = 0; i<mat.rows.length; i++) for(let j = 0; j<mat.rows[0].column.length; j++){
        newmat.rows[i].column[j] = f(mat.rows[i].column[j]);
    }
    return newmat;
}

function cloneMatrix(mat, keepvals = false){
    let m = new Matrix(mat.rows.length, mat.rows[0].column.length, false, 0);
    if(keepvals) for(let i = 0; i<mat.rows.length; i++) for(let j = 0; j<mat.rows[0].column.length; j++){
        m.rows[i].column[j] = mat.rows[i].column[j];
    }
    return m;
}
function add(m1, m2){
    for(let i = 0; i<m1.rows.length; i++){
        for(let j = 0; j<m1.rows[i].column.length; j++){
            m1.rows[i].column[j] += m2.rows[i].column[j];
        }
    }
    return m1;
}
function mult(mat, constant){
    let newmat = cloneMatrix(mat);
    for(let i = 0; i<mat.rows.length; i++){
        for(let j = 0; j<mat.rows[i].column.length; j++){
            newmat.rows[i].column[j] = mat.rows[i].column[j]*constant;
        }
    }
    return newmat;
}
function relu(x){
    return (x + Math.abs(x))/2;
}
function reluPrimeEval(x){
    return +(x > 0);
}