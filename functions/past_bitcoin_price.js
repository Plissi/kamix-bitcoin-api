const https = require('https')

const headers ={
    "content-type": "application/json"
};

const options = {
    method: "GET",
    headers: headers
};

exports.pastBtcPrice = (date)=>{
    let day, month, year;
    year = date.getFullYear();
    month = date.getMonth()+1;
    day = date.getDate();

    if (month <10) month += '0'+toString(month);
    if (day <10) day += '0'+toString(day);

    let date_string = year+'-'+month+'-'+day
    new Promise(resolve=>{
        const url = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${date_string}&end=${date_string}&currency=eur`
        var httpsRequest = https.request(options, url, (response)=>{
            response.on('end', data=>{
                resolve(data.bpi.date_string);
            })
        })

        httpsRequest.on('error', function(e) {
            console.log('problem with price request: ' + e.message);
            console.log(dataString);
            
            fs.appendFile('logs/error.log', e.toString()+'\n', 'utf8', (error) => {
                if (error) throw error;
            });
          });
    
        httpsRequest.write(dataString)
        httpsRequest.end()
    })
}