const fs = require('fs');
const beowulf = fs.readFileSync('beowulf.txt','utf-8');
const words = beowulf.toLowerCase().replaceAll(/![a-zA-Z]+/g,"").split(" ");
let wordcountlist = [];
let wordcount = [];
for(let v = 0; v<words.length; v++){
    let ind = wordcountlist.indexOf(words[v]);
    if(ind == -1){
        wordcountlist.push(words[v]);
        wordcount.push(1);
    } else {
        wordcount[ind]++;
    }
}
let wordout = [];
for(let v = 0; v<wordcountlist.length; v++){
    wordout.push([wordcountlist[v],wordcount[v]]);
}
wordout.sort((a,b) => { return b[1] - a[1]});
console.log(wordout.map(i => i = i.join(", ")).join("\n"))
