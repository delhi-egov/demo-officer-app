var angular = require("angular");

require("angular-ui-router");
require("ng-file-upload");
require('angular-ui-router-styles');
require('angular-block-ui');
var angularUtilsPagination = require('angular-utils-pagination');

var angularOfficerClient = require("angular-officer-client");
var routes = require("./routes");

var userController = require("./controllers/user_controller");
var loginController = require("./controllers/login_controller");
var dashboardController = require("./controllers/dashboard_controller");
var taskController = require("./controllers/task_controller");
var scrutinyController = require("./controllers/scrutiny_controller");
var applicationController = require("./controllers/application_controller");

var app = angular.module("app", ['ui.router', 'ngFileUpload', 'uiRouterStyles', 'blockUI', angularUtilsPagination]);

//Filters
app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});
app.filter('attachmentFilter', function() {
	return function(input, taskType) {
		var out = {};
		angular.forEach(input, function(value, key) {
			if(taskType === 'scrutiny') {
				if(key !== 'ALC Report') {
					out[key] = value;
				}
			}
		});
		return out;
	}
});

//Interceptors registration
app.factory("authenticationInterceptor", ['$q', '$location', '$injector', 'authInfo', angularOfficerClient.authenticationInterceptor]);

//Services registration
app.factory("authInfo", angularOfficerClient.infoHolder);
app.factory("taskInfo", angularOfficerClient.infoHolder);
app.factory("applicationInfo", angularOfficerClient.infoHolder);
app.factory("backendClient", ['$http', 'Upload', angularOfficerClient.backendClient]);
app.factory("userService", ['$state', 'backendClient', 'authInfo', angularOfficerClient.userService]);
app.factory("taskService", ['$state', 'backendClient', 'authInfo', 'taskInfo', angularOfficerClient.taskService]);
app.factory("applicationService", ['$state', 'backendClient', 'authInfo', 'applicationInfo', angularOfficerClient.applicationService]);

//Controller registration
app.controller("userController", ['userService', userController]);
app.controller("loginController", ['userService', loginController]);
app.controller("taskController", ['$scope', '$state', '$sce', 'taskService', 'userService', 'taskInfo', 'authInfo', taskController]);
app.controller("applicationController", ['$scope', '$state', '$sce', 'applicationService', 'userService', 'applicationInfo', 'authInfo', applicationController]);
app.controller("dashboardController", ['userService', 'taskService', 'applicationService', 'authInfo', '$state', '$scope', '$timeout', dashboardController]);
app.controller("scrutinyController", ['taskService', 'taskInfo', scrutinyController]);

//Configuration
app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
	$httpProvider.interceptors.push('authenticationInterceptor');
	$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
	routes($stateProvider, $urlRouterProvider, $locationProvider);
}]);

//Run on load
app.run(['backendClient', 'authInfo', function(backendClient, authInfo) {
	backendClient.me().then(function(response) {
		console.log("User data loaded");
	}, function(response) {
		console.error("Could not load user information");
	});
}]);
