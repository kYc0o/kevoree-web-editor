'use strict';

/**
 * @ngdoc function
 * @name editorApp.controller:LibrariesCtrl
 * @description
 * # LibrariesCtrl
 * Controller of the editorApp registry libraries page
 */
angular.module('editorApp')
    .controller('LibrariesCtrl', function ($scope, $timeout, kRegistry, kModelHelper, kFactory, kEditor, KEVOREE_REGISTRY_URL) {
        $scope.KEVOREE_REGISTRY_URL = KEVOREE_REGISTRY_URL;
        $scope.loading = true;

        kRegistry
            .init()
            .then(function (tdefs) {
                $scope.tdefs = tdefs;
            })
            .catch(function (err) {
                $scope.error = err.message;
            })
            .finally(function () {
                $scope.loading = false;
            });

        $scope.select = function (evt, tdef) {
            evt.preventDefault();

            if (!evt.ctrlKey) {
                $scope.tdefs.getAll().forEach(function (item) {
                    item.selected = false;
                });
            }

            tdef.selected = !tdef.selected;
            tdef.uiOpen = tdef.selected;
        };

        $scope.changeVersion = function () {
            $scope.closeError();
        };

        $scope.merge = function (tdef) {
            kRegistry.get(kModelHelper.fqnToPath(tdef.package)+'/typeDefinitions[name='+tdef.name+',version='+tdef.version+']')
                .then(function (tdefModel) {
                    try {
                        kEditor.merge(tdefModel);
                        $scope.success = true;
                    } catch (err) {
                        $scope.error = err.message;
                    }
                })
                .catch(function (err) {
                    $scope.error = err.message;
                });
        };

        $scope.mergeAll = function () {
            $scope.tdefs.getAll()
                .forEach(function (item) {
                    if (item.selected && item.version) {
                        $scope.merge(item);
                    }
                });
        };

        $scope.isMergeable = function (tdef) {
            var mergeable = false;

            if (tdef.version) {
                mergeable = !kEditor.getModel().findByPath(kModelHelper.fqnToPath(tdef.package)+'/typeDefinitions[name='+tdef.name+',version='+tdef.version+']');
            }

            return mergeable;
        };

        $scope.closeError = function () {
            $scope.error = null;
        };
    });