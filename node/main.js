const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()
const port = 3001


app.get('/', (req,res) => {
    res.sendFile(__dirname+'/acnechecker.html')
})
function getObject(theObject) {
    var result = null;
    if(theObject instanceof Array) {
        for(var i = 0; i < theObject.length; i++) {
            result = getObject(theObject[i]);
        }
    }
    else
    {
        for(var prop in theObject) {
            console.log(prop + ': ' + theObject[prop]);
            if(prop == 'ingredientDesc') {
                    return theObject[prop];
            }
            if(theObject[prop] instanceof Object || theObject[prop] instanceof Array)
                result = getObject(theObject[prop]);
        }
    }
    return result;
}

app.get('/api/*', (req, res) => {
    let query = req.url.split('/api/')[1]
    let urlEncoded = query
    console.log(1)
    let url = "https://www.sephora.com/api/v2/catalog/search/?type=keyword&q="+urlEncoded+"&sddZipcode=20009&pickupStoreId=1208"
    console.log(url)
    console.log(urlEncoded)
    axios.get(url, {
        "headers": {
            "Referer": "https://www.sephora.com/search?keyword="+urlEncoded,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    }).then((response) => {
        let objectResponse = response.data.products[0]
        let newUrl = objectResponse.targetUrl
        console.log(objectResponse)
        setTimeout(function(){
            axios.get(newUrl).then(function(html){
                res.set('Access-Control-Allow-Origin','*')
                let $ = cheerio.load(html.data)
                let ingredientsListjson = JSON.parse($('#linkStore').text())
                let ingredientsList = ingredientsListjson.page.product.currentSku.ingredientDesc
                console.log(ingredientsList)
                if(ingredientsList.includes('<')){
                    ingredientsList = ingredientsList.split('<').map(i => i = i.split('>')[1]).filter(i => i && i.length>5 && (i.includes('Water') || i.includes('+/-') || i.includes('peut') || i.includes('talc')))[0]
                }
                ingredientsList = ingredientsList.split(', ').map(i => i = i.split(']')[0].replaceAll('May Contain','').replaceAll('Peut Contenir',''))
                res.send({ingredients:ingredientsList,name:objectResponse.productName})
            })
    },100)
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

      //bad gal bang mascara
      //nars radiant concealer
      //saie liquid blush

      //rare beauty liquid blush