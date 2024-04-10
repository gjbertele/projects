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

function expC(C){
    return multC(new complex(Math.cos(C.b),Math.sin(C.b)),new complex(Math.exp(C.a),0))
}
function divC(A,B){
    let top = multC(A,new complex(B.a,-B.b));
    let norm = B.a**2 + B.b**2;
    top.a/=norm;
    top.b/=norm;
    return top;
}
function complexSigmoid(C){
    let exp = expC(C);
    return divC(exp,addC(exp,new complex(1,0)));
}

function complexSigmoidPrimeEval(C){
    return multC(C,subtractC(new complex(1,0),C));

}
function applyComplexFunctionToMatrix(mat, f){
    for(let i = 0; i<mat.rows.length; i++) for(let j = 0; j<mat.rows[i].column.length; j++){
        mat.rows[i].column[j] = f(mat.rows[i].column[j]);
    }
    return mat;
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
    let m3 = new Matrix(m1.rows.length,m1.rows[0].column.length,false,new complex(0,0))
    for(let i = 0; i<m1.rows.length; i++){
        for(let j = 0; j<m1.rows[i].column.length; j++){
            m3.rows[i].column[j] = addC(m1.rows[i].column[j],m2.rows[i].column[j]);
        }
    }
    return m3;
}
function multMatC(m1, C1){
    let m2 = new Matrix(m1.rows.length,m1.rows[0].column.length,false,new complex(0,0))
    for(let i = 0; i<m1.rows.length; i++){
        for(let j = 0; j<m1.rows[i].column.length; j++){
            m2.rows[i].column[j] = multC(m1.rows[i].column[j],C1);
        }
    }
    return m1;
}

///


function normal(C){
    return C;
}
function normalEval(C){
    return new complex(1,1);
}
function sqrtC(C){
    let mag = Math.sqrt(C.a**2 + C.b**2);
    let ang = Math.acos(C.a/mag);
    let na = Math.sqrt(mag)*Math.cos(ang/2);
    let nb = Math.sqrt(mag)*Math.sin(ang/2);
    return new complex(na, nb);
}
function normalize(...arr){
    let s = new complex(0,0);
    for(let i in arr) s = addC(s, multC(arr[i],arr[i]));
    s=sqrtC(s);
    for(let i = 0; i<arr.length; i++) arr[i] = divC(arr[i],s);
    return arr;
}

function compareC(z1, z2){
    return z1.a**2 + z1.b **2 > z1.a**2 + z2.b**2;
}

function clampC(x, a, b){
    let mag = Math.sqrt(x.a**2 + x.b**2);
    let ang = Math.acos(x.a/mag);
    if(mag < a) mag = a;
    if(mag > b) mag = b;
    let na = mag*Math.cos(ang);
    let nb = mag*Math.sin(ang);
    return new complex(na, nb);
}

function clampMatC(mat, a, b){
    for(let i = 0; i<mat.rows.length; i++){
        for(let j = 0; j<mat.rows[i].column.length; j++) mat.rows[i].column[j] = clampC(mat.rows[i].column[j],a,b)
    }
    return mat;
}

let complexSigmoidAct = {
    reg:complexSigmoid,
    prime:complexSigmoidPrimeEval
};

function matrixToString(mat){
    let s = "{";
    for(let i = 0; i<mat.rows.length; i++){
        s+='{'+mat.rows[i].column.join(", ")+"}";
        if(i != mat.rows.length - 1) s+=", ";
    }
    return s + "}"
}