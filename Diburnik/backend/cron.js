
const cron = require('cron');
const { config } = require('dotenv');
const https = require('https');

//const backendUrl = config.baseUrl;
const backendUrl = 'https://diburnik.onrender.com';

const webUrl = 'https://webdiburnik.onrender.com';


//Execute every 14 minutes
const job = new cron.CronJob('*/14 * * * *', function() {
    console.log("keeping backend alive");

    //Perform HTTPS GET request to backend
    https.get(backendUrl,(res)=>{
        console.log("alive")
            
        
    }).on('error',(err)=> {
        console.error('Error during keeping alive',err.message);
    });
});

const webJob = new cron.CronJob('*/14 * * * *', function() {
    console.log("Keeping web service alive");

    // Perform HTTPS GET request to the web service
    https.get(webUrl, (res) => {
        console.log("Web service is alive");
    }).on('error', (err) => {
        console.error('Error during keeping web service alive:', err.message);
    });
});

module.exports = {job,webJob};