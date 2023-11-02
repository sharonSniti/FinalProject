import config from '../frontend/config';
const cron = require('cron');
const { config } = require('dotenv');
const https = require('https');

//Execute every 14 minutes
const job = new cron.CronJob('*/14 * * * *', function() {
    console.log("keeping backend alive");

    //Perform HTTPS GET request to backend
    https.get(config.baseUrl,(res)=>{
        if(res.statusCode == 200) 
            console.log("alive");
        else
            console.error("failed to keep alive");
            
        
    }).on('error',(err)=> {
        console.error('Error during keeping alive',err.message);
    });
});

module.exports = {job,};