angular.module("lightmeasurer",[]).controller("myController", function ($rootScope, $scope, $http, $interval)
    {
        //$scope.currentuserid = 0;
//        console.log("Controller loaded!");
        LoadUser();
        $scope.datearray = [];
        $scope.totalarray = [];
        $scope.temparray = [];
        $scope.lightarray = [];
        $scope.rharray = [];
        $scope.co2array = [];
        $scope.vocarray = [];
        
        $scope.locationsarray = [];
        $interval(LoadData(), 10000);
        function LoadData(){
            function endianness16(val){
                var splitarray1 = val.toString().split("");
                var splitarray2 = splitarray1.splice(0,2);
                var splitarray3 = splitarray1.splice(0,2);
                var splitarray4 = splitarray1.splice(0,2);
                var reversedendianarray = splitarray1.concat(splitarray4, splitarray3, splitarray2).join("");
                return reversedendianarray;
            }
            function endianness8(val){
                var splitarray1 = val.toString().split("");
                var splitarray2 = splitarray1.splice(0,2);
                var reversedendianarray = splitarray1.concat(splitarray2).join("");
                return reversedendianarray;
            }
            function hex2float(num) {
                    var sign = (num & 0x80000000) ? -1 : 1;
                    var exponent = ((num >> 23) & 0xff) - 127;
                    var mantissa = 1 + ((num & 0x7fffff) / 0x7fffff);
                    return sign * mantissa * Math.pow(2, exponent);
            }
            $http({
            method: 'GET',
            url: 'http://localhost:443/api/data'
            }).then (function successCallback(response) {
//                console.log("JSON loaded!");
                //console.log(angular.toJson(response,true));
                var json = response;

                //console.log(json);
                $scope.lightdata = 0;
                $scope.lightdata = json;
                for(var i = 0; i >= 0; i++)
                {                    
                    var temp, light, rh, co2, voc, lat, long;
                    var temp = hex2float("0x" + endianness16($scope.lightdata.data[0].events[i].value.substring(36, 44))).toFixed(3);
                        $scope.temparray.push(temp);
                        
                    var light = hex2float("0x" + endianness16($scope.lightdata.data[0].events[i].value.substring(44, 52))).toFixed(3);
                        $scope.lightarray.push(light);
                        
                    var rh = parseInt("0x" + endianness8($scope.lightdata.data[0].events[i].value.substring(52, 56)));
                        $scope.rharray.push(rh);
                        
                    var co2 = parseInt("0x" + endianness8($scope.lightdata.data[0].events[i].value.substring(56, 60)));
                        $scope.co2array.push(co2);
                        
                    var voc = parseInt("0x" + endianness8($scope.lightdata.data[0].events[i].value.substring(60, 64)));
                        $scope.vocarray.push(voc);
                    
                    $scope.datepoint = $scope.lightdata.data[0].events[i].when;
                    $scope.datearray.push($scope.datepoint);
                    
                    var lat = hex2float("0x" + endianness16($scope.lightdata.data[0].events[i].value.substring(66, 74)));
                        $scope.locationsarray.push(lat);
                    
                    var long = hex2float("0x" + endianness16($scope.lightdata.data[0].events[i].value.substring(74, 82)));
                        $scope.locationsarray.push(long);
                    
                    var object = {temp: temp, light: light, rh: rh, co2: co2, voc: voc, lat: lat, long: long, time: $scope.datepoint};
                    
                    var location = {lat: lat, lng: long};
                    
                    $scope.locationsarray.push(location);
                    
                    $scope.totalarray.push(object);
                    
//                    console.log($scope.totalarray);
                    
                    if ($scope.temparray.length > 25)
                        {
                            $scope.temparray.shift($scope.temparray[0]);
                            $scope.lightarray.shift($scope.lightarray[0]);
                            $scope.rharray.shift($scope.rharray[0]);
                            $scope.co2array.shift($scope.co2array[0]);
                            $scope.vocarray.shift($scope.vocarray[0]);
                        }
                    //console.log($scope.datearray, $scope.temparray, $scope.lightarray, $scope.rharray, $scope.co2array, $scope.vocarray);
                $rootScope.$broadcast('lightcast', $scope.lightdata);
                $rootScope.$broadcast('voccast', $scope.vocarray);
                $rootScope.$broadcast('co2cast', $scope.co2array);
                $rootScope.$broadcast('rhcast', $scope.rharray);
                $rootScope.$broadcast('lightacast', $scope.lightarray);
                $rootScope.$broadcast('tempcast', $scope.temparray);
                } 
                
            }, function errorCallback(response) {
            //alert("An error occured while fetching the sensor data!")
            });
        };
        function LoadUser(){
            $http({
            method: 'GET',
            url: 'http://localhost:443/user'
            }).then (function successCallback(response) {
//                console.log("User loaded!");
//                console.log(response);
                $scope.currentuserid = 0;
                $scope.currentuser = response;
                $scope.currentuserid = response.data.deviceid;
//                console.log($scope.currentuserid);
            }, function errorCallback(response) {
            //alert("An error occured while fetching the user data!")
            });
        };
         
    
    });


angular.module("chart1", ["chart.js"]).controller("LineCtrl1", ['$scope', '$timeout', function ($scope, $timeout) {

  $scope.datearray = [];
  $scope.temparray = [];
  $scope.lightarray = [];
  $scope.rharray = [];
  $scope.co2array = [];
  $scope.vocarray = [];
    $scope.$on('lightcast', function lightCast(events, args){
      $scope.lightdata = args;
      for(var i = 0; i >= 0; i++)
          {
              $scope.datepoint = $scope.lightdata.data[0].events[i].when;
              $scope.datearray.push($scope.datepoint);
              
              
              if ($scope.datearray.length > 25)
                  {
                      $scope.datearray.shift($scope.datearray[0]);
                  }
          }
  });
  $scope.$on('lightacast', function lightCast(events, args){
      $scope.lightarray = args;
      });
  $scope.$on('tempcast', function lightCast(events, args){
      $scope.temparray = args;
      });
  $scope.$on('voccast', function lightCast(events, args){
      $scope.vocarray = args;
      });
  $scope.$on('rhcast', function lightCast(events, args){
      $scope.rharray = args;
      });
  $scope.$on('co2cast', function lightCast(events, args){
      $scope.co2array = args;
      });
  console.log($scope.datearray, $scope.temparray, $scope.lightarray, $scope.rharray, $scope.co2array, $scope.vocarray);
  $timeout(function(){
    $scope.labels = $scope.datearray;
    $scope.series = ['Temperature', 'Light', 'RH', 'CO2', 'VOC'];
    $scope.data = [$scope.temparray, $scope.lightarray, $scope.rharray, $scope.co2array, $scope.vocarray];
    $scope.onClick = function (points, evt) {
  };
})
//  // Simulate async data update
//  $timeout(function () {
//    $scope.data = [
//      [900, 670, 760, 943, 913, 879, 900, 122]
//    ];
//  }, 3000);
}]);

angular.module("chart2", ["chart.js"]).controller("LineCtrl2", ['$scope', '$timeout', function ($scope, $timeout) {

  $scope.datearray = [];
  $scope.temparray = [];
  $scope.lightarray = [];
  $scope.rharray = [];
  $scope.co2array = [];
  $scope.vocarray = [];
    $scope.$on('lightcast', function lightCast(events, args){
      $scope.lightdata = args;
      for(var i = 0; i >= 0; i++)
          {
              $scope.datepoint = $scope.lightdata.data[0].events[i].when;
              $scope.datearray.push($scope.datepoint);
              
//              var temp, light, rh, co2, voc, lat, long;
//                    var temp = parseInt("0x" + $scope.lightdata.data[0].events[i].value.substring(36, 44));
//                        $scope.temparray.push(temp);
//                        
//                    var light = parseInt("0x" + $scope.lightdata.data[0].events[i].value.substring(44, 52));
//                        $scope.lightarray.push(light);
//                        
//                    var rh = parseInt("0x" + $scope.lightdata.data[0].events[i].value.substring(52, 56));
//                        $scope.rharray.push(rh);
//                        
//                    var co2 = parseInt("0x" + $scope.lightdata.data[0].events[i].value.substring(56, 60));
//                        $scope.co2array.push(co2);
//                        
//                    var voc = parseInt("0x" + $scope.lightdata.data[0].events[i].value.substring(60, 64));
//                        $scope.vocarray.push(voc);
//                    
//                    var lat = swap32("0x" + $scope.lightdata.data[0].events[i].value.substring(66, 74));
//                    var long = swap32("0x" + $scope.lightdata.data[0].events[i].value.substring(74, 82));
              
              if ($scope.datearray.length > 25)
                  {
                      $scope.datearray.shift($scope.datearray[0]);
//                      $scope.temparray.shift($scope.temparray[0]);
//                      $scope.lightarray.shift($scope.lightarray[0]);
//                      $scope.rharray.shift($scope.rharray[0]);
//                      $scope.co2array.shift($scope.co2array[0]);
//                      $scope.vocarray.shift($scope.vocarray[0]);
                  }
          }
  });
  $scope.$on('lightacast', function lightCast(events, args){
      $scope.lightarray = args;
      });
  $scope.$on('tempcast', function lightCast(events, args){
      $scope.temparray = args;
      });
  $scope.$on('voccast', function lightCast(events, args){
      $scope.vocarray = args;
      });
  $scope.$on('rhcast', function lightCast(events, args){
      $scope.rharray = args;
      });
  $scope.$on('co2cast', function lightCast(events, args){
      $scope.co2array = args;
      });
  console.log($scope.datearray, $scope.temparray, $scope.lightarray, $scope.rharray, $scope.co2array, $scope.vocarray);
  $timeout(function(){
    $scope.labels = $scope.datearray;
    $scope.series = ['RH'];
    $scope.data = [$scope.rharray];
    $scope.onClick = function (points, evt) {
  };
})
//  // Simulate async data update
//  $timeout(function () {
//    $scope.data = [
//      [900, 670, 760, 943, 913, 879, 900, 122]
//    ];
//  }, 3000);
}]);

angular.module("chart3", ["chart.js"]).controller("LineCtrl3", ['$scope', '$timeout', function ($scope, $timeout) {

  $scope.datearray = [];
  $scope.temparray = [];
  $scope.lightarray = [];
  $scope.rharray = [];
  $scope.co2array = [];
  $scope.vocarray = [];
    $scope.$on('lightcast', function lightCast(events, args){
      $scope.lightdata = args;
      for(var i = 0; i >= 0; i++)
          {
              $scope.datepoint = $scope.lightdata.data[0].events[i].when;
              $scope.datearray.push($scope.datepoint);
              
              if ($scope.datearray.length > 25)
                  {
                      $scope.datearray.shift($scope.datearray[0]);
//                      $scope.temparray.shift($scope.temparray[0]);
//                      $scope.lightarray.shift($scope.lightarray[0]);
//                      $scope.rharray.shift($scope.rharray[0]);
//                      $scope.co2array.shift($scope.co2array[0]);
//                      $scope.vocarray.shift($scope.vocarray[0]);
                  }
          }
  });
  $scope.$on('lightacast', function lightCast(events, args){
      $scope.lightarray = args;
      });
  $scope.$on('tempcast', function lightCast(events, args){
      $scope.temparray = args;
      });
  $scope.$on('voccast', function lightCast(events, args){
      $scope.vocarray = args;
      });
  $scope.$on('rhcast', function lightCast(events, args){
      $scope.rharray = args;
      });
  $scope.$on('co2cast', function lightCast(events, args){
      $scope.co2array = args;
      });
  console.log($scope.datearray, $scope.temparray, $scope.lightarray, $scope.rharray, $scope.co2array, $scope.vocarray);
  $timeout(function(){
    $scope.labels = $scope.datearray;
    $scope.series = ['CO2', 'VOC', 'RH'];
    $scope.data = [$scope.co2array, $scope.vocarray];
    $scope.onClick = function (points, evt) {
  };
})
//  // Simulate async data update
//  $timeout(function () {
//    $scope.data = [
//      [900, 670, 760, 943, 913, 879, 900, 122]
//    ];
//  }, 3000);
}]);

angular.module('googlemApp', []).directive('myMap', function() {
    // directive link function
    var link = function(scope, element, attrs) {
        var map, infoWindow;
        var markers = [];
        
        // map config
        var mapOptions = {
            center: new google.maps.LatLng(50, 2),
            zoom: 4,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false
        };
        
        // init the map
        function initMap() {
            if (map === void 0) {
                map = new google.maps.Map(element[0], mapOptions);
            }
        }    
        
        // place a marker
        function setMarker(map, position, title, content) {
            var marker;
            var markerOptions = {
                position: position,
                map: map,
                title: title,
                icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            };

            marker = new google.maps.Marker(markerOptions);
            markers.push(marker); // add marker to array
            
            google.maps.event.addListener(marker, 'click', function () {
                // close window if not undefined
                if (infoWindow !== void 0) {
                    infoWindow.close();
                }
                // create new window
                var infoWindowOptions = {
                    content: content
                };
                infoWindow = new google.maps.InfoWindow(infoWindowOptions);
                infoWindow.open(map, marker);
            });
        }
        
        // show the map and place some markers
        initMap();
        
        setMarker(map, new google.maps.LatLng(51.508515, -0.125487), 'London', 'Just some content');
        setMarker(map, new google.maps.LatLng(52.370216, 4.895168), 'Amsterdam', 'More content');
        setMarker(map, new google.maps.LatLng(48.856614, 2.352222), 'Paris', 'Text here');
    };
    
    return {
        restrict: 'A',
        template: '<div id="gmaps"></div>',
        replace: true,
        link: link
    };
});

angular.module('app', ['lightmeasurer', 'chart1', 'chart2', 'chart3', 'googlemApp']);