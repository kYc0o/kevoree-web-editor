'use strict';

angular.module('editorApp')
  .controller('InstanceNetworkModalCtrl', function ($scope, $modalInstance, $timeout, node, net, kFactory) {
    $scope.node = node;
    $scope.net = net;
    $scope.newVal = {
      name: null,
      value: null
    };

    $scope.addNewVal = function () {
      if ($scope.newVal.name && $scope.newVal.value) {
        var val = kFactory.createValue();
        val.name = $scope.newVal.name;
        val.value = $scope.newVal.value;
        $scope.net.addValues(val);
        $scope.newVal.name = null;
        $scope.newVal.value = null;
        angular.element('input#newValName').focus();
      }
    };

    $scope.add = function () {
      node.addNetworkInformation($scope.net);
      $modalInstance.close();
    };

    $scope.delete = function () {
      $scope.net.delete();
      $modalInstance.close();
    };

    $scope.canSave = function () {
      return net.values.array.length > 0;
    };
  });
