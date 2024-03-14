class complex {
    a;
    b;
    constructor(a,b){
        this.a = a;
        this.b = b;
    }
}

function addC(C1,C2){
    return {
        a:C1.a+C2.a,
        b:C1.b+C2.b
    };
}
function subtractC(C1,C2){
    return {
        a:C1.a-C2.a,
        b:C1.b-C2.b
    };

}

function multC(C1,C2){
    return {
        a:C1.a*C2.a - C1.b*C2.b,
        b:C1.a*C2.b + C1.b*C2.a
    };
}

function complexRelu(C){
    return {
        a: (C.a + Math.abs(C.a))/2,
        b: (C.b + Math.abs(C.b))/2
    }
}
function complexReluPrimeEval(C){
    return {
        a:+(C.a > 0),
        b:+(C.b > 0)
    }
}
function applyComplexFunctionToMatrix(mat, f){
    for(let i = 0; i<mat.rows.length; i++) for(let j = 0; j<mat.rows[i].column.length; j++){
        mat.rows[i].column[j] = f(mat.rows[i].column[j]);
    }
}

function matrixDotProductC(mat1, mat2){
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
            res[i][j] = new complex(0,0);
            for (x = 0; x < m2; x++)  
            { 
                let val = multC(mat1.rows[i].column[x], mat2.rows[x].column[j]);
                res[i][j] = addC(res[i][j],val); 
            } 
        } 
    } 
    return asMatrix(res);
}
function hadamardC(A, B){
    let n = new Matrix(A.rows.length, A.rows[0].column.length)
    for(let i = 0; i<n.rows.length; i++){
        for(let j = 0; j<n.rows[0].column.length; j++){
            n.rows[i].column[j] = multC(A.rows[i].column[j],B.rows[i].column[j])
        }
    }
    return n;
}
function addMatC(m1, m2){
    for(let i = 0; i<m1.rows.length; i++){
        for(let j = 0; j<m1.rows[i].column.length; j++){
            m1.rows[i].column[j] = addC(m1.rows[i].column[j],m2.rows[i].column[j]);
        }
    }
    return m1;
}
function multMatC(m1, m2){
    for(let i = 0; i<m1.rows.length; i++){
        for(let j = 0; j<m1.rows[i].column.length; j++){
            m1.rows[i].column[j] = multC(m1.rows[i].column[j],m2.rows[i].column[j]);
        }
    }
    return m1;
}
//addMatC
//multMatC