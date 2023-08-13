const axios = require('axios')

const express = require('express')
const app = express()
const port = 80




app.get('/api/*', (req, res) => {
    let query = req.url.split('/api/')[1]
    let urlEncoded = query
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
                let ingredientsList = html.data.split('ingredientDesc":"')[1].split('<br>').filter(i => i.includes('(Ci'))[0].split('>').filter(i => i.includes('(Ci'))[0].split('<')[0].replaceAll('May Contain','').split(', ').filter(i => !i.includes(':'))
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