let c = 0;
for(let z = -999; z<=999; z++){
    for(let w = -999; w<=999; w++){
        for(let y = -999; y<=999; y++){
            let s = y + z + w;
            let s2 = z*y + z*w + y*w;
            let s3 = y*z*w;
            if(Math.abs(s) < 1000 && Math.abs(s2) < 1000 && Math.abs(s3) < 1000){
                c++;
            }
        }
    }
}
console.log(c);