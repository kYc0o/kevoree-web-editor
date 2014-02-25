var AbstractCommand = require('../AbstractCommand'),
    CloseModal      = require('./CloseModal'),
    LocalStorage    = require('../../util/LocalStorageHelper'),
    LSKeys          = require('../../config/local-storage-keys'),
    DefaultConf     = require('../../config/defaults');

/**
 * Created by leiko on 27/01/14.
 */
var ServerSettings = AbstractCommand.extend({
    toString: 'ServerSettings',
    
    construct: function (editor) {
        this.closeModal = new CloseModal(editor);
    },

    execute: function () {
        $('#modal-content').html(EditorTemplates['server-settings'].render({
            host: LocalStorage.get(LSKeys.HOST) || DefaultConf.HOST,
            port: LocalStorage.get(LSKeys.PORT) || DefaultConf.PORT
        }));

        $('#default-settings').off('click');
        $('#default-settings').on('click', function () {
            $('#remote-host').val(DefaultConf.HOST);
            $('#remote-port').val(DefaultConf.PORT);
        });

        $('#modal-save').off('click');
        $('#modal-save').on('click', function () {
            var remoteHost = $('#remote-host').val();
            if (remoteHost.length > 0) LocalStorage.set(LSKeys.HOST, remoteHost);

            var remotePort = $('#remote-port').val();
            if (remotePort.length > 0) LocalStorage.set(LSKeys.PORT, remotePort);
            
            this.closeModal.execute();
        }.bind(this));

        $('#modal').modal();
    }
});

module.exports = ServerSettings;