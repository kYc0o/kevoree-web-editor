var Class           = require('pseudoclass'),
    ModelHelper     = require('./ModelHelper'),
    AddDictionaryValue = require('../command/model/AddDictionaryValue');

// helper function to get whether the current value or the default one if any
function getValue(dictionary, attr) {
    var val = dictionary.findValuesByID(attr.name);
    if (val) return val.value;
    else return attr.defaultValue;
}

module.exports = {
    /**
     * Computes properties data for instance versions
     * @param instance
     * @param model
     * @returns {Array}
     */
    getVersionsData: function (instance, model) {
        // compute data for instance versions
        var versions = [];
        var vers = ModelHelper.findTypeDefinitionVersions(instance.typeDefinition.name, model);
        for (var i in vers) {
            versions.push({
                version: vers[i],
                selected: (instance.typeDefinition.version === vers[i]) ? 'selected' : null
            });
        }
        return versions;
    },

    /**
     * Computes properties data for instance dictionary
     * @param instance
     */
    getDictionaryData: function (instance) {
        var dictionary = [];
        var attrs = instance.typeDefinition.dictionaryType.attributes.iterator();
        while (attrs.hasNext()) {
            var attr = attrs.next();
            if (!attr.fragmentDependant) {
                dictionary.push({
                    name: attr.name,
                    value: getValue(instance.dictionary, attr)
                });
            }
        }
        return dictionary;
    },

    /**
     * Computes properties data for instance fragment dictionaries
     * @param instance
     * @returns {Array}
     */
    getFragDictionariesData: function (instance) {
        // Compute data for instance fragment dictionaries
        var fragDictionaries = [];
        // find fragmentDependant attributes and set their value
        var attrs = instance.typeDefinition.dictionaryType.attributes;
        for (var i=0; i < instance.fragmentDictionary.size(); i++) {
            var dic = [];
            for (var j=0; j < attrs.size(); j++) {
                var attr = attrs.get(j);
                if (attr.fragmentDependant) {
                    dic.push({
                        name: attr.name,
                        value: getValue(instance.fragmentDictionary.get(i), attr)
                    });
                }
            }

            fragDictionaries.push({
                node: instance.fragmentDictionary.get(i).name,
                active: (i === 0) ? 'active' : null,
                dictionary: dic
            });
        }
        return fragDictionaries;
    },

    /**
     * Saves instance's dictionary by reading values from DOM inputs
     * @param instance
     * @param editor
     * @param dictionary Computed dictionary data (from getDictionaryData())
     * @param [nodeName] optional fragmentDictionary node name
     */
    saveDictionary: function (instance, editor, dictionary, nodeName) {
        var addDicValCmd = new AddDictionaryValue(editor);
        // save dictionary function
        for (var i=0; i < dictionary.length; i++) {
            if (nodeName) {
                // frag dictionary
                addDicValCmd.execute(instance.findFragmentDictionaryByID(nodeName), dictionary[i].name, $('#dic-'+nodeName+'-'+dictionary[i].name).val());

            } else {
                // "normal" dictionary
                addDicValCmd.execute(instance.dictionary, dictionary[i].name, $('#dic-'+dictionary[i].name).val());
            }
        }
    },

    /**
     * Adds a "change" listener on "#instance-version" select input in order
     * to reload properties when version changes
     * @param instance
     * @param model
     * @param cmd
     */
    setVersionChangeListener: function (instance, model, cmd) {
        $('#instance-version').on('change', function (e) {
            var selectedVersion = e.currentTarget.options[e.currentTarget.options.selectedIndex].innerHTML;
            if (selectedVersion !== instance.typeDefinition.version) {
                // change typeDefinition according to version
                instance.typeDefinition = model.findTypeDefinitionsByID(instance.typeDefinition.name+'/'+selectedVersion);
                // reset dictionaries
                instance.dictionary.removeAllValues();
                instance.removeAllFragmentDictionary();
                // reload properties
                cmd.execute(instance);
            }
        });
    }
};