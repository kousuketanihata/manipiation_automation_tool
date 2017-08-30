let log = require('log4js');
let logger = exports = module.exports = {};
log. configure({
    appenders : [
        {
            "type" : "file",
            "category" : "request",
            "filename" : "./logs/request.log",
            "pattern" : "-yyyy-MM-dd"
        }
    ]
});

logger.request = log.getLogger('request');
