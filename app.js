const fs = require('fs/promises');

//configuration for readline
const { createInterface } = require('readline');
const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});
const readLineAsync = msg => {
    return new Promise(resolve => {
      readline.question(msg, userRes => {
        resolve(userRes);
      });
    });
}

// validate user string
const validCurrentTime = (input) => {
    const pattern = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)/;
    return pattern.test(input);
}
const getOffset = async (currentTimeZone) => {
    const buffer = await fs.readFile('timezones.json');
    const zones = JSON.parse(buffer);
    console.log(zones);
    zones.forEach( zone => {
        const timeZone = zone.abbr;
        if(currentTimeZone === timeZone) {
            return zone.offset;
        }
    });
    return -1;
}
 const startApp = async() => {
    const currentTime = await readLineAsync('CURRENT_TIME: ');
    if(!validCurrentTime(currentTime)) {
        readline.close();
        throw new Error('Invalid Current Time');
    }

    const currentTimeZone = await readLineAsync('CURRENT_TIMEZONE: ');
    const convertTimeZone = await readLineAsync('CONVERT_TO_TIMEZONE: ');
    
    console.log(currentTimeZone);
    const currentOffset = await getOffset(currentTimeZone);
    console.log(currentOffset);
    // console.log('Your currentTime: ', currentTime);
}
startApp(); 

  
  