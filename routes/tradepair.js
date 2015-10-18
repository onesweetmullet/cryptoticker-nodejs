var request = require('request')
,	requestify = require('requestify')
,   async = require('async');

var getRequestOptions = function(_exchange, _prefix, _suffix) {
    var _options = { };

    switch (_exchange) {
        case "anxbtc":
            _options.uri = "https://anxpro.com/api/2/" + _prefix + _suffix + "/money/ticker";
            break;
        case "bitstamp":
            if (_prefix.toLowerCase() === 'btc' && _suffix.toLocaleLowerCase() === "usd")
                _options.uri = "https://www.bitstamp.net/api/ticker/";
            break;
        case "btce":
            _options.uri = "https://btc-e.com/api/3/ticker/" + _prefix.toLowerCase() + "_" + _suffix.toLowerCase();
            break;
        case "bter":
            _options.uri = "http://data.bter.com/api/1/ticker/" + _prefix + "_" + _suffix;
            break;
        case "coinbase":
            if (_prefix.toLowerCase() === 'btc' && _suffix.toLocaleLowerCase() === "usd") {
                _options.uri = "https://api.coinbase.com/v2/prices/buy";
                _options.headers = {
                    "CB-VERSION": "2015-10-11"
                };
            }
            break;
        case "cryptsy":
            _options.uri = "http://pubapi2.cryptsy.com/api.php?method=singlemarketdata&marketid=" + getMarketId(_prefix, _suffix);
            break;
        case "vircurex":
            _options.uri = "https://api.vircurex.com/api/get_info_for_1_currency.json?base=" + _prefix + "&alt=" + _suffix
            break;
        default:
            _options.uri = "https://btc-e.com/api/3/ticker/" + _prefix + "_" + _suffix;
            break;
    }

    return _options;
};

exports.getRaw = function(req, res) {
    var _options = getRequestOptions(req.params.exchange, req.params.prefix, req.params.suffix);

    requestify.get(_options.uri).then(function(response) {
        var _response = response.getBody();
        var _headers = response.getHeaders();

        var _json = "";
        try {
            _json = JSON.parse(_response);
        } catch (err) {
            console.log(err);
            _json = _response;
        }

        res.json(response.code, _json);
    });
};

exports.getFormatted = function(req, res) {
    var _options = getRequestOptions(req.params.exchange, req.params.prefix, req.params.suffix);

    requestify.get(_options.uri).then(function(response) {
        var _response = response.getBody();
        var _headers = response.getHeaders();

        var _return = {
            exchange: req.params.exchange,
            exchangeFormatted: getExchangeFormatted(req.params.exchange),
            prefix: req.params.prefix,
            suffix: req.params.suffix,
            lastPrice: "",
            lastUpdated: new Date()// _headers["date"]
        };

        _return.lastPrice = getFormattedPrice(req.params.exchange, req.params.prefix, req.params.suffix, _response).toString();

        res.json(200, { data: _return });
    });
};

exports.getAll = function(req, res) {

    var _responses = {};
    var _prefix = req.params.prefix;
    var _suffix = req.params.suffix;

    async.series([

        function(callback) {
            var _options = getRequestOptions('anxbtc', _prefix, _suffix);

            requestify.get(_options.uri).then(function(response) {
                if (response.getBody().result.toString() !== 'error')
                    _responses.anxbtc = response.getBody();
                callback();
            });
        },

        function(callback) {
            var _options = getRequestOptions('btce', _prefix, _suffix);

            requestify.get(_options.uri).then(function(response) {
                var _json = JSON.parse(response.getBody());
                if (_json.success !== 0)
                    _responses.btce = JSON.parse(response.getBody());
                callback();
            });
        },

        function(callback) {
            var _options = getRequestOptions('bitstamp', _prefix, _suffix);

            if (_options.uri) {
                requestify.get(_options.uri).then(function(response) {
                    _responses.bitstamp = response.getBody();
                    callback();
                });
            } else {
                callback();
            }
        },

        function(callback) {
            var _options = getRequestOptions('bter', _prefix, _suffix);

            if (_options.uri) {
                requestify.get(_options.uri).then(function(response) {
                    if (response.getBody().result.toString() !== 'false')
                        _responses.bter = response.getBody();
                    callback();
                });
            } else {
                callback();
            }
        },

        function(callback) {
            var _options = getRequestOptions('coinbase', _prefix, _suffix);

            if (_options.uri) {
                requestify.get(_options.uri).then(function(response) {
                    _responses.coinbase = response.getBody();
                    callback();
                });
            } else {
                callback();
            }
        },

        function(callback) {
            var _options = getRequestOptions('cryptsy', _prefix, _suffix);

            if (_options.uri) {
                requestify.get(_options.uri).then(function(response) {
                    var _json = JSON.parse(response.body);
                    if (_json.success !== 0)
                        _responses.cryptsy = _json;
                    callback();
                });
            } else {
                callback();
            }
        },

        function(callback) {
            var _options = getRequestOptions('vircurex', _prefix, _suffix);

            if (_options.uri) {
                requestify.get(_options.uri).then(function(response) {
                    _responses.vircurex = response.getBody();
                    callback();
                });
            } else {
                callback();
            }
        },

    ], function(err) {
        if (err) {
            res.json(500, { message: err});
        } else {
            res.json(200, _responses);
        }

    });


};

var getExchangeFormatted = function(exchange) {
    switch (exchange) {
        case "anxbtc":
            return "ANXBTC";
        case "bitstamp":
            return "Bitstamp";
        case "btce":
            return "BTC-E";
        case "coinbase":
            return "Coinbase";
        case "vircurex":
            return "Vircurex";
        case "cryptsy":
            return "Cryptsy";
    }
};

var getFormattedPrice = function(exchange, prefix, suffix, data) {
    if (!data)
        return 0;

    if (data === "")
        return 0;

    try
    {
        //var _json = JSON.parse(data);
        switch (exchange) {
            case "anxbtc":
                return data.data.last.value;
                break;
            case "bitstamp":
                return data.last;
                break;
            case "btce":
                var _json = JSON.parse(data);
                return _json[prefix.toLowerCase() + "_" + suffix.toLowerCase()].last;
                break;
            case "bter":
                return data.last;
                break;
            case "coinbase":
                return data.data.amount;
                break;
            case "cryptsy":
                return data.return.markets[prefix.toUpperCase()].lasttradeprice;
                break;
            case "vircurex":
                return data.last_trade;
                break;
            default:
                break;
        }
    } catch (err) {
        console.log(">>>> err: " + err);
        return 0;
    }
};

var getMarketId = function(prefix, suffix) {
    var _markets =
    {
        "ADT/LTC": 94,
        "ADT/XPM": 113,
        "ALF/BTC": 57,
        "AMC/BTC": 43,
        "ANC/BTC": 66,
        "ANC/LTC": 121,
        "ARG/BTC": 48,
        "ASC/LTC": 111,
        "ASC/XPM": 112,
        "BET/BTC": 129,
        "BQC/BTC": 10,
        "BTB/BTC": 23,
        "BTE/BTC": 49,
        "BTG/BTC": 50,
        "BUK/BTC": 102,
        "CAP/BTC": 53,
        "CENT/LTC": 97,
        "CENT/XPM": 118,
        "CGB/BTC": 70,
        "CGB/LTC": 123,
        "CLR/BTC": 95,
        "CMC/BTC": 74,
        "CNC/BTC": 8,
        "CNC/LTC": 17,
        "COL/LTC": 109,
        "COL/XPM": 110,
        "CPR/LTC": 91,
        "CRC/BTC": 58,
        "CSC/BTC": 68,
        "DBL/LTC": 46,
        "DEM/BTC": 131,
        "DGC/BTC": 26,
        "DGC/LTC": 96,
        "DMD/BTC": 72,
        "DOGE/BTC": 132,
        "DVC/LTC": 52,
        "DVC/XPM": 122,
        "ELC/BTC": 12,
        "ELP/LTC": 93,
        "EMD/BTC": 69,
        "EZC/LTC": 55,
        "FLO/LTC": 61,
        "FRC/BTC": 39,
        "FRK/BTC": 33,
        "FST/BTC": 44,
        "FST/LTC": 124,
        "FTC/BTC": 5,
        "GDC/BTC": 82,
        "GLC/BTC": 76,
        "GLD/BTC": 30,
        "GLD/LTC": 36,
        "GLX/BTC": 78,
        "GME/LTC": 84,
        "HBN/BTC": 80,
        "IFC/LTC": 60,
        "IFC/XPM": 105,
        "IXC/BTC": 38,
        "JKC/LTC": 35,
        "KGC/BTC": 65,
        "LK7/BTC": 116,
        "LKY/BTC": 34,
        "LTC/BTC": 3,
        "MEC/BTC": 45,
        "MEC/LTC": 100,
        "MEM/LTC": 56,
        "MNC/BTC": 7,
        "MST/LTC": 62,
        "NBL/BTC": 32,
        "NEC/BTC": 90,
        "NET/LTC": 108,
        "NET/XPM": 104,
        "NMC/BTC": 29,
        "NRB/BTC": 54,
        "NVC/BTC": 13,
        "ORB/BTC": 75,
        "PHS/BTC": 86,
        "PPC/BTC": 28,
        "PPC/LTC": 125,
        "PTS/BTC": 119,
        "PXC/BTC": 31,
        "PXC/LTC": 101,
        "PYC/BTC": 92,
        "Points/BTC": 120,
        "QRK/BTC": 71,
        "QRK/LTC": 126,
        "RED/LTC": 87,
        "RYC/LTC": 37,
        "SBC/BTC": 51,
        "SBC/LTC": 128,
        "SPT/BTC": 81,
        "SRC/BTC": 88,
        "SXC/LTC": 98,
        "TAG/BTC": 117,
        "TEK/BTC": 114,
        "TGC/BTC": 130,
        "TIX/LTC": 107,
        "TIX/XPM": 103,
        "TRC/BTC": 27,
        "UNO/BTC": 133,
        "WDC/BTC": 14,
        "WDC/LTC": 21,
        "XJO/BTC": 115,
        "XNC/LTC": 67,
        "XPM/BTC": 63,
        "XPM/LTC": 106,
        "YAC/BTC": 11,
        "YAC/LTC": 22,
        "ZET/BTC": 85,
        "ZET/LTC": 127
    }

    var _searchTerm = prefix.toUpperCase() + "/" + suffix.toUpperCase();
    return _markets[_searchTerm];
    // for (var prop in _markets) {
    // 	if (_markets.hasOwnProperty(_searchTerm)) {
    // 		if (_markets[prop] === _searchTerm)
    // 			return prop;
    // 	}
    // }
}


