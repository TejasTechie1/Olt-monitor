
const ping = require('ping');

async function testPing(olt) {
    console.log(`Testing ping for ${olt.name} (${olt.ip})`);

    try {
        const res = await ping.promise.probe(olt.ip, {
            timeout: 10,  // Set the timeout but no extra options
        });
        

        console.log(`Full response: ${JSON.stringify(res)}`);

        if (res.alive || res.output.includes(' 1 received')) {
            console.log(`${olt.name} is ONLINE`);
        } else {
            console.log(`${olt.name} is OFFLINE`);
        }
    } catch (error) {
        console.error(`Error during ping: ${error.message}`);
    }
}

const olt = {
    name: 'Test OLT',
    ip: '192.168.8.123',  // Replace with an actual OLT IP you want to test
};

testPing(olt);
