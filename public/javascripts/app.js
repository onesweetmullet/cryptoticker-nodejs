'use strict';

angular.module('myApp', [])
    .controller('mainController', function($scope, $http) {

        $scope.btc_usd = [];
        $scope.ltc_usd = [];
        $scope.doge_btc = [];

        var intervalTick = function() {

            $http.get('http://localhost:3000/tradepair/getall/btc/usd/formatted')
                .success(function(response) {
                    $scope.btc_usd = [];
                    angular.forEach(response, function(value, key) {
                        $scope.btc_usd.push({
                            'exchange': value.exchange,
                            'exchangeFormatted': value.exchangeFormatted,
                            'lastPrice': value.lastPrice,
                            'lastUpdated': getFuzzyDate(value.lastUpdated)
                        });
                    });
                });

            $http.get('http://localhost:3000/tradepair/getall/ltc/usd/formatted')
                .success(function(response) {
                    $scope.ltc_usd = [];
                    angular.forEach(response, function(value, key) {
                        $scope.ltc_usd.push({
                            'exchange': value.exchange,
                            'exchangeFormatted': value.exchangeFormatted,
                            'lastPrice': value.lastPrice,
                            'lastUpdated': getFuzzyDate(value.lastUpdated)
                        });
                    });
                });

            $http.get('http://localhost:3000/tradepair/getall/doge/btc/formatted')
                .success(function(response) {
                    $scope.doge_btc = [];
                    angular.forEach(response, function(value, key) {
                        $scope.doge_btc.push({
                            'exchange': value.exchange,
                            'exchangeFormatted': value.exchangeFormatted,
                            'lastPrice': value.lastPrice,
                            'lastUpdated': getFuzzyDate(value.lastUpdated)
                        });
                    });
                });
        };

        var getFuzzyDate = function(date) {
            //var newDate = new Date(date);
            var _dataDate = moment(new Date(date).getTime());
            var _currentDate = moment(new Date().getTime());
            var _return = moment.duration(_currentDate - _dataDate).seconds().toString() + " seconds ago"

            return _return;
        };

        var _interval = setInterval(intervalTick, 5000);
        intervalTick();
    });