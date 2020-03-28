dojo.provide("lucid.apps.Messenger.sound");

dojo.extend(lucid.apps.Messenger, {
    sounds: {
        send: null,
        receive: null
    },
    initSounds: function(){
        var s = this.sounds = {};
        s.send = new lucid.Sound({
            src: dojo.moduleUrl("lucid.apps.Messenger.resources", "send.mp3").uri
        });
        s.receive = new lucid.Sound({
            src: dojo.moduleUrl("lucid.apps.Messenger.resources", "receive.mp3").uri
        });
        s.send.stop();
        s.receive.stop();
        
    },
    cleanupSounds: function(){
        for(var s in this.sounds){
            this.sounds[s].destroy();
        }
    },
    playSend: function(){
        var s = this.sounds.send;
        s.stop();
        s.play();
    },
    playReceive: function(){
        var s = this.sounds.receive;
        s.stop();
        s.play();
    }
});
