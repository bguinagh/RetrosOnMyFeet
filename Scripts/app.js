var RetrosApp = angular.module('RetrosApp', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'ajoslin.promise-tracker']);

RetrosApp.config(['$routeProvider', '$locationProvider', function($routes, $location) {
    $location.hashPrefix('!');

    $routes
		.when('/ogs',
			{
				controller: 'RetrosController',
				templateUrl: '/RetrosPartials/OGs.html'
			})
		.when('/retros',
			{
				controller: 'RetrosController',
				templateUrl: '/RetrosPartials/Retros.html'
			})
		.when('/releases',
			{
				controller: 'RetrosController',
				templateUrl: '/RetrosPartials/Releases.html'
			})
        .when('/modelretros',
			{
			    controller: 'RetrosController',
			    templateUrl: '/RetrosPartials/ModelRetros.html'
			})
        .when('/about',
			{
			    controller: 'AboutController',
			    templateUrl: '/RetrosPartials/About.html'
			})
        .when('/retrodetail',
			{
			    controller: 'DetailController',
			    templateUrl: '/RetrosPartials/RetroDetail.html'
			})
        .when('/ogdetail',
			{
			    controller: 'DetailController',
			    templateUrl: '/RetrosPartials/OGDetail.html'
			})
        .when('/releasedetail',
			{
			    controller: 'DetailController',
			    templateUrl: '/RetrosPartials/ReleaseDetail.html'
			})
		.otherwise({redirectTo: '/ogs'});
}]);

/**
 * backToTop Directive
 * @param  {Function} $anchorScroll
 *
 * @description Ensure that the browser scrolls when the anchor is clicked
*/
RetrosApp.directive('backToTop', ['$anchorScroll', '$location', function ($anchorScroll, $location) {
    return function link(scope, element) {
        element.on('click', function (event) {
            $location.hash('');
            scope.$apply($anchorScroll);
        });
    };
}])


RetrosApp.filter('utc', [function () {
    return function (dt) {
        var localDate = new Date(dt);
        var localTime = localDate.getTime();
        var localOffset = localDate.getTimezoneOffset() * 60000;
        return new Date(localTime + localOffset);
    }
}]);

RetrosApp.factory('dataFactory', ['$http', function($http) {

	var urlBase = '/api/sneaker';
	var dataFactory = {};

	dataFactory.getSneakers = function () {
		return $http.get(urlBase);
	};

	dataFactory.postSneakerComment = function (comment) {
	    return $http.post(urlBase, comment);
	};

	dataFactory.getRetroSamples = function () {
	    return $http.get(urlBase + '?type=retro');
	};

	//dataFactory.getSneaker = function (id) {
	//	return $http.get(urlBase + '/' + id);
	//};
	
	//dataFactory.getSneakerByModel = function (id) {
	//	return $http.get(urlBase + '?model=' + id);
	//};

	//dataFactory.insertSneaker = function (sneaker) {
	//	return $http.post(urlBase, sneaker);
	//};

	//dataFactory.updateSneaker = function (sneaker) {
	//	return $http.put(urlBase + '/' + sneaker.ID, sneaker)
	//};

	//dataFactory.deleteSneaker = function (id) {
	//	return $http.delete(urlBase + '/' + id);
	//};

	return dataFactory;
}]);

RetrosApp.factory('sneakerFactory', function () {
    var selectedSneaker;
    var selectedModel;
    var releaseYear;
    var releaseMonth;

    var sneakerFactory = {};

    sneakerFactory.addSelectedSneaker = function (sneaker) {
        selectedSneaker = sneaker;
    };
    sneakerFactory.getSelectedSneaker = function () {
        return selectedSneaker;
    };

    sneakerFactory.addSelectedModel = function (model) {
        selectedModel = model;
    };
    sneakerFactory.getSelectedModel = function () {
        return selectedModel;
    };

    sneakerFactory.setReleaseYear = function (year) {
        releaseYear = year;
    };
    sneakerFactory.getReleaseYear = function () {
        if (releaseYear == null) {
            releaseYear = new Date().getFullYear();
        }
        return releaseYear;
    };

    sneakerFactory.setReleaseMonth = function (month) {
        releaseMonth = month;
    };
    sneakerFactory.getReleaseMonth = function () {
        if (releaseMonth == null) {
            releaseMonth = new Date().getMonth() + 1;
        }
        return releaseMonth;
    };
    return sneakerFactory;
});

RetrosApp.controller('RetrosController', ['$scope', '$location', 'sneakerFactory', 'dataFactory',
	function ($scope, $location, sneakerFactory, dataFactory) {

	    $scope.sneakers;
    
	    $scope.releases = [];
	    $scope.retros;
	
	    $scope.filterOG = { OG: "True" };
	    $scope.filterRetro = { OG: "False" };
	    $scope.filter = { Model: "1" };

	    if (sneakerFactory.getSelectedModel() != null) {
	        $scope.filter = { Model: sneakerFactory.getSelectedModel() };
	    }
	    $scope.year = sneakerFactory.getReleaseYear();
	    $scope.month = sneakerFactory.getReleaseMonth();
	    $scope.releaseDateStart = new Date($scope.year, $scope.month - 1, 1);

	    setup();
	    
	    function setup() {
	        dataFactory.getSneakers()
			    .success(function (sneakerList) {
			        $scope.sneakers = sneakerList;

			        angular.forEach(sneakerList, function (sneaker, key) {
			            if (new Date(sneaker.ReleaseDate) > $scope.releaseDateStart) {
			                $scope.releases.push(sneaker);
			            }
			        })
			    })
			    .error(function (error) {
			        $scope.status = 'Unable to load sneaker data: ' + error.message;
			    });
	        
	        dataFactory.getRetroSamples()
                .success(function (retroList) {
                    $scope.retros = retroList;
                })
			    .error(function (error) {
			        $scope.status = 'Unable to load retro data: ' + error.message;
			    });

	    }

	    $scope.getOGDetails = function (sneaker) {
	        //set selectedSneaker = sneakerId
	        sneakerFactory.addSelectedSneaker(sneaker);
	        //redirect to OGDetail.html
	        $location.path('/ogdetail');
	    };

	    $scope.getRetroModels = function (model) {
	        //set filter = model
	        sneakerFactory.addSelectedModel(model);
	        //redirect to RetroDetail.html
	        $location.path('/modelretros');
	    };

	    $scope.getRetroDetails = function (sneaker) {
	        //set selectedSneaker = sneakerId
	        sneakerFactory.addSelectedSneaker(sneaker);
	        //redirect to RetroDetail.html
	        $location.path('/retrodetail');
	    };

	    $scope.getReleaseDetails = function (sneaker) {
	        //set selectedSneaker = sneakerId
	        sneakerFactory.addSelectedSneaker(sneaker);
	        //redirect to RetroDetail.html
	        $location.path('/releasedetail');
	    };

        $scope.getReleases = function () {
            $scope.releases = [];
            sneakerFactory.setReleaseMonth($scope.month);
            sneakerFactory.setReleaseYear($scope.year);
            $scope.releaseDateStart = new Date($scope.year, $scope.month - 1, 1);
            angular.forEach($scope.sneakers, function (sneaker, key) {
                if (new Date(sneaker.ReleaseDate) > $scope.releaseDateStart) {
                    sneaker.ReleaseDate = new Date(sneaker.ReleaseDate);
                    $scope.releases.push(sneaker);
                }
            })
        };

        $scope.retros;
        $scope.getRetros = function () {
            $scope.retros = [];

            angular.forEach($scope.sneakers, function (sneaker, key) {
                if (new Date(sneaker.ReleaseDate) > $scope.releaseDateStart) {
                    $scope.releases.push(sneaker);
                }
            })
        };

}]);

RetrosApp.controller('DetailController', ['$scope', '$location', 'sneakerFactory',
	function ($scope, $location, sneakerFactory) {
	    $scope.sneaker = sneakerFactory.getSelectedSneaker();
	    if ($scope.sneaker == null) {
	        $location.path('/ogs');
	    }

	}]);

RetrosApp.controller('AboutController', ['$scope', '$location', '$log', 'promiseTracker', '$timeout', 'dataFactory', 
    function ($scope, $location, $log, promiseTracker, $timeout, dataFactory) {

	    $scope.submit = function (form) {
	        // Trigger validation flag.
	        $scope.submitted = true;

	        // If form is invalid, return and let AngularJS show validation errors.
	        if (form.$invalid) {
	            return;
	        }

	        // Default values for the request.
	        $scope.progress = promiseTracker('progress');

	        var comment = {
	            'name': $scope.name,
	            'email': $scope.email,
	            'comments': $scope.comments
	        };

	        dataFactory.postSneakerComment(comment)
                .success(function (result) {
                    if (result == "true") {
                        $scope.name = null;
                        $scope.email = null;
                        $scope.comments = null;
                        $scope.messages = 'Your comment has been sent!  Thanks!';
                        $scope.submitted = false;
                    } else {
                        $scope.messages = 'Oops, we received your request, but there was an error.';
                    }
                })
			    .error(function (error) {
			        $scope.messages = 'There was a network error. Try again later.';
			        $log.error(error.message);
			    });


	        // Hide the status message which was set above after 3 seconds.
	        $timeout(function () {
	            $scope.messages = null;
	        }, 3000);
	    }

}]);