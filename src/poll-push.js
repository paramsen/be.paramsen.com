'use strict';

const FCM_KEY = 'AIzaSyCqWqiIcPn1MuNzH1ZpyF1x76hWfNAb1eE';

const dep = require('./dependency'),
    schedule = require('node-schedule'),
    log = dep.log,
    request = require('request'),
    fs = require('fs'),
    zlib = require('zlib'),
    redis = require('./redis-db').instance,
    ENVIRONMENT = dep.ENVIRONMENT;

const pollSchedule = new schedule.RecurrenceRule();

pollSchedule.minute = [0, 10, 20, 30, 40, 50];

module.exports = () => {
    return new Promise((resolve, reject) => {
        scheduledPoll();
        schedule.scheduleJob(pollSchedule, scheduledPoll);

        resolve();
    });
};

function scheduledPoll() {
    log.info('scheduledPoll -> Start');

    pollSmhi()
        .then(applyGeo)
        .then(structure)
        .then(render)
        .then(updated)
        .then(cache)
        .then(fcmPush)
        .then(success => log.info('scheduledPoll -> Finished'))
        .catch(error => log.warning('scheduledPoll -> Failed with error: ' + error));
}

function pollSmhi() {
    return new Promise((resolve, reject) => {
        request('http://opendata-download-warnings.smhi.se/api/alerts.json', (error, response, body) => {
            if (!error && response.statusCode == 200) {
                log.info('GET http://opendata-download-warnings.smhi.se/api/alerts.json -> success');

                var alerts = JSON.parse(body);

                var relevant = [];

                alerts.alert.forEach(alert => {
                    if (isAlertRelevant(alert)) {
                        relevant.push(alert);
                    }
                });

                if (relevant.length >= 1) {
                    resolve(relevant);
                } else if (alerts.length == 0) {
                    resetRender()
                        .then(success => reject('No warnings found'))
                        .catch(error => reject(error));
                } else {
                    reject('No relevant warnings');
                }
            } else {
                log.warning('GET http://opendata-download-warnings.smhi.se/api/alerts.json > Failed with error %s', JSON.stringify(error));
                reject(error);
            }
        });
    });
}

function applyGeo(alerts) {
    return new Promise((resolve, reject) => {
        log.info('applyGeo -> get district for alerts and apply location data to the alert objects');

        request('http://opendata-download-warnings.smhi.se/api/districts.json', (error, response, body) => {
            if (!error && response.statusCode == 200) {
                log.info('GET http://opendata-download-warnings.smhi.se/api/districts.json -> success');

                var areas = [];

                JSON.parse(body).district.forEach(d => {
                    areas[d.id] = parseLocation(d.geometry.representation_point);
                });

                alerts.forEach(alert => {
                    alert.loc = areas[alert.info.area.areaDesc];

                });

                resolve(alerts);
            } else {
                log.warning('GET http://opendata-download-warnings.smhi.se/api/districts.json > Failed with error %s', JSON.stringify(error));
                reject(error);
            }
        });
    });
}

/**
 * :minimized is for push payload (max 4kb data), :structured for hosted data to be retrieved by pushed clients
 *
 * minimized:
 * i: id
 * a: latitude
 * o: longitude
 * u: updated timestamp
 * l: locationName
 * d: description
 * e: event type
 */
function structure(alerts) {
    return new Promise((resolve, reject) => {
        log.info('structure -> format and optimize data for push and better data representation');

        var structured = alerts.map(raw => {
            return {
                id: raw.identifier,
                loc: raw.loc,
                sent: Date.parse(raw.sent),
                updated: Date.parse(raw.code[1].split(' ')[1]),
                systemEventTitle: raw.info.eventCode[1].value,
                locName: raw.info.headline,
                description: raw.info.description,
                districtId: raw.info.area.areaDesc
            };
        });

        var minimized = structured.map(raw => {
            return {
                i: raw.id,
                a: raw.loc.lat,
                o: raw.loc.lon,
                u: raw.updated,
                l: raw.locName,
                d: raw.description,
                e: raw.systemEventTitle
            };
        });

        resolve({
            structured: structured,
            minimized: minimized
        });
    });
}

function render(optimized) {
    return new Promise((resolve, reject) => {
        log.info('render -> render smhi alerts to static resource on host');

        var render = {
            warnings: optimized.structured
        };

        fs.writeFile('/www/public/alerts.json', JSON.stringify(render), 'utf8', error => {
            if (error) {
                reject(error);
            }

            resolve(optimized);
        });
    });
}

function resetRender() {
    return new Promise((resolve, reject) => {
        log.info('resetRender -> render empty warnings into static resource on host');

        var render = {
            warnings: []
        };

        fs.writeFile('/www/public/alerts.json', JSON.stringify(render), 'utf8', error => {
            if (error) {
                reject(error);
            }

            resolve();
        });
    });
}

function updated(optimized) {
    return new Promise((resolve, reject) => {
        log.info('updated -> check if alerts have updated since last poll');

        new Promise((resolve1, reject1) => {
            redis.send_command('scan', ['0', 'match', 'alert:*', 'count', '1000'], (error, success) => {
                resolve1(success);
            });
        })
            .then(keys => {
                return new Promise((resolve2, reject2) => {
                    var multi = redis.multi();

                    keys[1].forEach(e => {
                        multi.get(e);
                    });

                    multi.exec((err, re) => {
                        resolve2(re);
                    });
                });
            })
            .then(cached => {
                var updated;
                var hasCache = cached.length > 0;

                for (var i = optimized.structured.length - 1; i >= 0; i--) {
                    var alert = optimized.structured[i];
                    cached.forEach(raw => {
                        var parsed = JSON.parse(raw);
                        if (parsed.id === alert.id) {
                            if (!(parsed.updated === alert.updated)) {
                                updated = true;
                            }
                        }
                    });
                }

                if (!hasCache || updated || isDevel()) {
                    log.info('updated -> Alerts changed since last poll');
                    resolve(optimized);
                } else {
                    reject('updated -> No new alerts since last poll');
                }
            });
    });
}

function cache(optimized) {
    return new Promise((resolve, reject) => {
        log.info('cache -> store');

        optimized.structured.forEach(alert => {
            redis.set('alert:' + alert.id, JSON.stringify(alert));
            redis.expire('alert:' + alert.id, 2592000); //30 days expiration time
        });

        resolve(optimized);
    });
}

function fcmPush(optimized) {
    return new Promise((resolve, reject) => {
        log.info('fcmPush -> push to topic');

        return compress(JSON.stringify({
                alerts: optimized.minimized
            }))
            .then(compressed => {
                var payload = {
                    collapse_key: 'always',
                    data: {
                        compressed: compressed
                    },
                    time_to_live: 86400,
                    to: '/topics/warnings'
                };

                request.post('https://fcm.googleapis.com/fcm/send', {
                    headers: {
                        'Authorization': ('key=' + FCM_KEY),
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        resolve(optimized);
                    } else {
                        reject(response);
                    }
                });
            });
    });
}

/** 
 * Compress data so that we can make it below FCM:s 4kb data limit
 */
function compress(text) {
    return new Promise((resolve, reject) => {
        log.info('compress -> compress & base64 encode');

        var buf = new Buffer(text, 'utf-8');

        zlib.gzip(buf, function(error, result) {
            if (error) {
                return reject(error);
            }

            resolve(result.toString('base64'));
        });
    });
}

function isAlertRelevant({
    info: {
        eventCode: eventCode
    }
}) {
    return eventCode[1] && eventCode[1].value.match(/(Medelvind\ till\ havs)|(Byvind)|(Åska)|(Stora\ regnmängder)/);
}

function parseLocation(point) {
    var [lat, lon] = point.replace(/([^0-9|\.\ ])/g, '').split(' ');

    return {
        lat: lat,
        lon: lon
    }
}

function isDevel() {
    return ENVIRONMENT === 'development';
}