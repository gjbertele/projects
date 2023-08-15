const axios = require('axios')
const fs = require('fs')
let obj = []
let products = 0;
function urlGenerate(n,query){
    return 'https://www.sephora.com/api/v2/catalog/search/?type=keyword&q='+query+'&sddZipcode=20009&pickupStoreId=1208&content=true&includeRegionsMap=true&page='+n*60+'&currentPage=1'
}

function a(index){
let letter = String.fromCharCode(Math.floor(index/7)+65)
axios.get(urlGenerate(0,letter)).then(data => {if(data.data && data.data.products){
    obj = obj.concat(data.data.products);
    products+=data.data.products.length; 
}}).catch(function (err) {
    console.log(err);
    return;
})
console.log(products/450 + '% | '+letter + ' | ' + index)
setTimeout(function(){
    if(index+1 < 26*7 + 1){
    a(index+1)
    } else {
    fs.writeFileSync('data.json',JSON.stringify(obj));
    }
},1000)
}

a(0)