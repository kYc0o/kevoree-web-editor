'use strict';

angular.module('editorApp')
  .directive('tabCreate', function ($filter, kFactory, kEditor, kInstance, kModelHelper, util, KWE_TAG) {
    return {
      restrict: 'AE',
      scope: {
        updateTree: '='
      },
      templateUrl: 'scripts/app/treeview/tab-create/tab-create.html',
      link: function (scope) {
        scope.namePattern = '{metatype}{index}';

        function createTdefItem(tdef) {
          return {
            name: kModelHelper.genPkgName(tdef.eContainer()) + '.' + tdef.name + '/' + tdef.version,
            tdef: tdef
          };
        }

        function process() {
          var model = kEditor.getModel();
          scope.name = '';
          scope.types = [ 'node', 'group', 'channel', 'component' ];
          scope.instanceTypes = {
            node: kModelHelper.getNodeTypes(model).map(createTdefItem),
            group: kModelHelper.getGroupTypes(model).map(createTdefItem),
            channel: kModelHelper.getChannelTypes(model).map(createTdefItem),
            component: kModelHelper.getComponentTypes(model).map(createTdefItem)
          };
          scope.selectedType = scope.types[0];
          if (scope.instanceTypes[scope.selectedType].length > 0) {
            scope.selectedInstanceType = scope.instanceTypes[scope.selectedType][0];
          }
          scope.availableNodes = model.nodes.array;
          scope.selectedNode = model.nodes.array[0];
          scope.instancesCount = 1;
          scope.randomNumber = util.randomNumber();
          scope.randomStr = util.randomString();
          scope.tags = '';
        }

        process();
        var unregister = kEditor.addListener('newModel', process);
        scope.$on('$destroy', function () {
          unregister();
        });

        scope.create = function () {
          var model = kEditor.getModel();
          for (var i=0; i < scope.instancesCount; i++) {
            var name = $filter('namingPattern')(scope.namePattern, {
              index: i,
              metatype: scope.selectedType
            });
            var instance;
            switch (scope.selectedType) {
              case 'node':
                instance = kFactory.createContainerNode();
                break;
              case 'group':
                instance = kFactory.createGroup();
                break;
              case 'channel':
                instance = kFactory.createChannel();
                break;
              case 'component':
                instance = kFactory.createComponentInstance();
                break;
            }
            instance.name = name;
            instance.typeDefinition = scope.selectedInstanceType.tdef;
            instance.started = 'true';
            kInstance.initDictionaries(instance);
            var tags = scope.tags.split(',')
                .map(function (tag) {
                  return tag.trim();
                })
                .filter(function (tag) {
                  return tag.length > 0;
                }).join(',');
            var tagsMeta = kFactory.createValue();
            tagsMeta.name = KWE_TAG;
            tagsMeta.value = tags;
            instance.addMetaData(tagsMeta);

            switch (scope.selectedType) {
              case 'node':
                model.addNodes(instance);
                break;
              case 'group':
                model.addGroups(instance);
                break;
              case 'channel':
                model.addHubs(instance);
                break;
              case 'component':
                scope.selectedNode.addComponents(instance);
                break;
            }
          }
          scope.updateTree();
        };

        scope.onTypeChange = function () {
          if (scope.instanceTypes[scope.selectedType].length > 0) {
            scope.selectedInstanceType = scope.instanceTypes[scope.selectedType][0];
          }
        };

        scope.transform = function (namePattern, index) {
          return namePattern
              .replace(/\{metatype\}/g, scope.selectedType)
              .replace(/\{index\}/g, index+'')
              .replace(/\{randomInt\}/g, util.randomNumber())
              .replace(/\{randomStr\}/g, util.randomString());
        };

        scope.isValid = function () {
          if (scope.selectedType === 'component') {
            if (scope.availableNodes.length === 0) {
              return false;
            }
          }
          return scope.namePattern.trim().length > 0 &&
                 scope.selectedType.length > 0 &&
                 scope.instancesCount > 0 &&
                 scope.selectedInstanceType !== null;
        };
      }
    };
  });