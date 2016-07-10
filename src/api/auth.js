const request = require('request'),
    log = require('../base/dependency').log;

const publicAppId = '517748650499-0tjip61r48krpgbq9d52qc0a3b0s1rpv.apps.googleusercontent.com';

module.exports = (req, res, next) => {
    var token = req.get('Authorization');
    
    if(token) {
        request({
            uri: 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + token,
            json: true
        }, (error, response, body) => {
            if(!error && response.statusCode == 200 && validateToken(body)) {
                //next();
                unauthorized(res);
            } else {
                unauthorized(res);
            }
        });
    } else {
        unauthorized(res);
    }
}

function validateToken(auth) {
    if(auth.aud === publicAppId) {
        return true;
    }
}

function unauthorized(res) {
    res.status(401).json({message: 'always unauthorized until switched to local OAuth'});
}
