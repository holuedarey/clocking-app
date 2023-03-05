const EventEmitter = require('events');
import sendEmailSms from '../helpers/emailSender';


class ClockingEvent extends EventEmitter {

    constructor(){

        super();
        this.on('complete', (payload) => {
        console.log("Payload Data,", payload)

            setImmediate(async () => {
               sendEmailSms(payload)
            });
        });
    }

}

export default ClockingEvent;