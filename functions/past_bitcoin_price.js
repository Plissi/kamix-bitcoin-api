const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const https = require('https')

const headers ={
    "content-type": "application/json"
};

const options = {
    method: "GET",
    headers: headers
};

exports.pastBtcPrice = (date)=>{
    return new Promise(resolve=>{
        if (date > new Date(2013, 4, 27).getTime() && date > new Date(2010, 7, 18).getTime()) {
            date = new Date(date);
            let day, month, year;
            year = date.getFullYear();
            month = date.getMonth()+1;
            day = date.getDate();

            if (month <10) month = '0'+month;
            if (day <10) day = '0'+day;

            let date_string = year+'-'+month+'-'+day
            let url = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${date_string}&end=${date_string}&currency=eur`
            var httpsRequest = https.request(url, options, (response)=>{
                let tab =[];
                response.on('data', result=>{
                    tab.push(result)
                }).on('end', ()=>{
                    let data = Buffer.concat(tab)
                    let stringData = data.toString().trim()
                    let fin = JSON.parse(stringData)
                    if (fin.bpi.EUR == undefined){
                        resolve(fin.bpi[date_string]);
                    } else {
                        resolve(fin.bpi.EUR.rate_float);
                    }
                })
            })

            httpsRequest.on('error', function(e) {
                console.log('problem with price request: ' + e.message);
                fs.appendFile('logs/error.log', e.toString()+'\n', 'utf8', (error) => {
                    if (error) throw error;
                });
              });

            httpsRequest.end()
        } else if (date < new Date(2010, 7, 18).getTime()){
            resolve(0.0858)
        } else {
            date = new Date(date);
            let day, month, year;
            year = date.getFullYear();
            month = date.getMonth()+1;
            day = date.getDate();

            if (month <10) month = '0'+month;
            if (day <10) day = '0'+day;

            let date_string = day+'-'+month+'-'+year

            CoinGeckoClient.coins.fetchHistory('bitcoin', {
                date: date_string,
                localization: false
            }).then(data =>{
                resolve(data.data.market_data.current_price.eur)
            }).catch(error => {
                console.log('problem with price request: ' + error.message);
            })
        }
    })
}
