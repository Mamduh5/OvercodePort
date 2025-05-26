const { DateTime } = require("luxon");
const config = require('config')
const cookieTiming = config.get('cookie')




const ExtendCookie = async () => {
    const expireDuration = cookieTiming.resetTime.minute * cookieTiming.resetTime.multiplierSecond * cookieTiming.resetTime.multiplierMilisecond;
    const nowUTC = DateTime.utc();
    const nowBangkok = nowUTC.setZone("Asia/Bangkok");
    const expireUTC = nowUTC.plus({ milliseconds: expireDuration });
    const expireBangkok = nowBangkok.plus({ milliseconds: expireDuration });
    const extendDuration = cookieTiming.extendTime.minute * cookieTiming.extendTime.multiplierSecond * cookieTiming.extendTime.multiplierMilisecond;
    const extendUTC = expireUTC.minus({ milliseconds: extendDuration });
    const extendBangkok = expireBangkok.minus({ milliseconds: extendDuration });
    const response = {
        currentTime: {
            utc: {
                unixTimestamp: nowUTC.toMillis(),
                isoString: nowUTC.toFormat("yyyy-MM-dd HH:mm:ss")
            },
            asiaBangkok: {
                unixTimestamp: nowBangkok.toMillis(),
                isoString: nowBangkok.toFormat("yyyy-MM-dd HH:mm:ss")
            }
        },
        extendTime: {
            utc: {
                unixTimestamp: extendUTC.toMillis(),
                isoString: extendUTC.toFormat("yyyy-MM-dd HH:mm:ss")
            },
            asiaBangkok: {
                unixTimestamp: extendBangkok.toMillis(),
                isoString: extendBangkok.toFormat("yyyy-MM-dd HH:mm:ss")
            }
        },
        expireTime: {
            utc: {
                unixTimestamp: expireUTC.toMillis(),
                isoString: expireUTC.toFormat("yyyy-MM-dd HH:mm:ss")
            },
            asiaBangkok: {
                unixTimestamp: expireBangkok.toMillis(),
                isoString: expireBangkok.toFormat("yyyy-MM-dd HH:mm:ss")
            }
        }
    };

    return response
}



module.exports = { ExtendCookie }