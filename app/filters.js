angular.module('VcoApp.filters', [])

    .filter('size', [function () {
        return function (num) {
            if (num > 1000000000){
                num = Math.round(num / 1000000000);
                return num + ' GB';
            }
            else if (num > 1000000){
                num = Math.round(num / 1000000);
                return num  + ' MB';
            }
            else if (num > 1000){
                num = Math.round(num / 1000);
                return num  + ' KB';
            }

        }
    }])

    .filter('percent', [function () {
        return function (size,total) {
           return Math.round((1-size/total)*100);
        }
    }])

    .filter('itempercent', [function () {
        return function (size,total) {
            return Math.round((size/total)*100);
        }
    }])

    .filter('online', [function () {
        return function (status) {
            return (status == 'online') ? 'label label-success' : 'label label-danger';
        }
    }])
    .filter('progressStyle', [function () {
        return function (status, total) {
            if (status > 0 && total > 0) {
                status = status / total * 100;
                if (status > 75)return 'progress-bar-danger';
                else if (status <= 75 && status > 50)return 'progress-bar-warning';
                else if (status <= 50 && status > 25)return 'progress-bar-info';
                else return 'progress-bar-success';
            }
        }
    }])
