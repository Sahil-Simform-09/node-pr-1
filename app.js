const fs = require('fs');

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
const validCurrentTime = input => {
    const pattern = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)/;
    return pattern.test(input);
}
const getOffset = currentTimeZone => {
    try{
        const buffer =  fs.readFileSync('timezones.json');
        const zones = JSON.parse(buffer);
        let offset = -1;
        zones.forEach( zone => {
            const timeZone = zone.abbr;
            if(currentTimeZone === timeZone) {
                offset = zone.offset;
                return;
            }
        });
        return offset;
    } catch(err) {
        throw new Error(err);
    }
}
 const startApp = async() => {
    const currentTime = await readLineAsync('CURRENT_TIME: ');
    if(!validCurrentTime(currentTime)) {
        readline.close();
        throw new Error('Invalid Current Time');
    }

    const sourceTimeZone = await readLineAsync('CURRENT_TIMEZONE: ');
    const convertTimeZone = await readLineAsync('CONVERT_TO_TIMEZONE: ');
    
    const [timePart, meridiem] = currentTime.split(' ');

    const currentDate = new Date();
    const [hours, minutes] = timePart.split(':');
    let utcHours = Number(hours);
    let utcMinutes = Number(minutes);

    if (meridiem === 'PM') {
        utcHours += 12;
    } else if (meridiem === 'AM' && utcHours === 12) {
        utcHours = 0;
    }
 
    const sourceOffset = getOffset(sourceTimeZone);
    const destinationOffset = getOffset(convertTimeZone);

    if(sourceOffset === -1 || destinationOffset === -1) {
        throw new Error('Invalid Time zone');
    }
    const diff = destinationOffset - sourceOffset;

    let [ digitBeforedecimal, digitAfterDecimal] = diff.toString().split('.');
    switch (digitAfterDecimal) {
        case '5':
            digitAfterDecimal = '30';
            break;
        case '75':
            digitAfterDecimal = '45';
            break;
        case '25':
            digitAfterDecimal = '15';
            break;
        default:
            digitAfterDecimal = '0';
            break;
    }

    const symbol = digitBeforedecimal.charAt(0) === '-' ? '-' : '+';
    let hr, minute;
    if(symbol === '-') {
        digitBeforedecimal = digitBeforedecimal.substring(1, digitBeforedecimal.length);
        hr = utcHours - Number(digitBeforedecimal);
        minute = utcMinutes - Number(digitAfterDecimal);
    } else {
        hr = utcHours + Number(digitBeforedecimal);
        minute = utcMinutes + Number(digitAfterDecimal);
    }

    if(minute > 59) {
        hr += 1;
        minute -= 60;
    } else if(minute < 0) {
        hr -= 1;
        minute = 60 + minute;
    }

    let isAMorPM;
    if(hr >= 12) {
        hr = hr === 12 ? 1 : hr - 12 ;
        isAMorPM = 'PM';
    } else {
        isAMorPM = 'AM';
    }
    console.log('CONVERTED_TIME = ' + hr + ":" + minute +  " " + isAMorPM);
}
startApp(); 