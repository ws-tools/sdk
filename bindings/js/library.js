
mergeInto(LibraryManager.library, {
    jsnet_post: function(url, data) {
        url = Module.Pointer_stringify(url);
        data = Module.Pointer_stringify(data);

        var ctx = Module._xhrStack.length;
        while (ctx--) {
            var rs = Module._xhrStack[ctx].readyState;
            if (rs === 4 || rs === 0) {
                break;
            }
        }

        if (ctx < 0) {
            ctx = Module._xhrStack.push(new XMLHttpRequest) - 1;
        }

        try {
            var xhr = Module._xhrStack[ctx];

            if (!Module.cxxnet_progress) {
                Module.cxxnet_progress = Module.cwrap('jsnet_progress', 'number', ['number', 'number']);
                Module.cxxnet_onloadend = Module.cwrap('jsnet_onloadend', 'number', ['number', 'number', 'number', 'number']);
            }

            xhr.onloadend = function(ev) {
                var data = 0, len = 0;
                if (this.status === 200) {
                    var u8 = new Uint8Array(this.response || []);
                    if ((data = Module._malloc(u8.length+1))) {
                        Module.HEAPU8.set(u8, data);
                        len = u8.length;
                    }
                }
                Module.cxxnet_onloadend(Module._ctxStack[ctx], this.status, data | 0, len);
                if (data) {
                    Module._free(data);
                }
                if (this.response) {
                    Module.neuterArrayBuffer(this.response);
                }
            };

            xhr.upload.onprogress =
            xhr.onprogress = function(ev) {
                Module.cxxnet_progress(Module._ctxStack[ctx], ev.loaded);
            };

            xhr.open('POST', url);
            xhr.responseType = 'arraybuffer';

            /*if (Module._useragent) {
                xhr.setRequestHeader('User-Agent', Module._useragent, false);
            }*/

            xhr.send(data);
        }
        catch (ex) {
            console.error(ex);
            return -1;
        }

        return ctx;
    }
});
