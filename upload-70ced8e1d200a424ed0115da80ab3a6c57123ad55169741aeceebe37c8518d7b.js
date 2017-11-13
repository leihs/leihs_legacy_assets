/*
 * jQuery postMessage Transport Plugin 1.1.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
!function(factory){"use strict";"function"==typeof define&&define.amd?define(["jquery"],factory):factory(window.jQuery)}(function($){"use strict";var counter=0,names=["accepts","cache","contents","contentType","crossDomain","data","dataType","headers","ifModified","mimeType","password","processData","timeout","traditional","type","url","username"],convert=function(p){return p};$.ajaxSetup({converters:{"postmessage text":convert,"postmessage json":convert,"postmessage html":convert}}),$.ajaxTransport("postmessage",function(options){if(options.postMessage&&window.postMessage){var iframe,loc=$("<a>").prop("href",options.postMessage)[0],target=loc.protocol+"//"+loc.host,xhrUpload=options.xhr().upload;return{send:function(_,completeCallback){counter+=1;var message={id:"postmessage-transport-"+counter},eventName="message."+message.id;iframe=$('<iframe style="display:none;" src="'+options.postMessage+'" name="'+message.id+'"></iframe>').bind("load",function(){$.each(names,function(i,name){message[name]=options[name]}),message.dataType=message.dataType.replace("postmessage ",""),$(window).bind(eventName,function(e){e=e.originalEvent;var ev,data=e.data;e.origin===target&&data.id===message.id&&("progress"===data.type?(ev=document.createEvent("Event"),ev.initEvent(data.type,!1,!0),$.extend(ev,data),xhrUpload.dispatchEvent(ev)):(completeCallback(data.status,data.statusText,{postmessage:data.result},data.headers),iframe.remove(),$(window).unbind(eventName)))}),iframe[0].contentWindow.postMessage(message,target)}).appendTo(document.body)},abort:function(){iframe&&iframe.remove()}}}})}),/*
 * jQuery XDomainRequest Transport Plugin 1.1.3
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on Julian Aubourg's ajaxHooks xdr.js:
 * https://github.com/jaubourg/ajaxHooks/
 */
function(factory){"use strict";"function"==typeof define&&define.amd?define(["jquery"],factory):factory(window.jQuery)}(function($){"use strict";window.XDomainRequest&&!$.support.cors&&$.ajaxTransport(function(s){if(s.crossDomain&&s.async){s.timeout&&(s.xdrTimeout=s.timeout,delete s.timeout);var xdr;return{send:function(headers,completeCallback){function callback(status,statusText,responses,responseHeaders){xdr.onload=xdr.onerror=xdr.ontimeout=$.noop,xdr=null,completeCallback(status,statusText,responses,responseHeaders)}var addParamChar=/\?/.test(s.url)?"&":"?";xdr=new XDomainRequest,"DELETE"===s.type?(s.url=s.url+addParamChar+"_method=DELETE",s.type="POST"):"PUT"===s.type?(s.url=s.url+addParamChar+"_method=PUT",s.type="POST"):"PATCH"===s.type&&(s.url=s.url+addParamChar+"_method=PATCH",s.type="POST"),xdr.open(s.type,s.url),xdr.onload=function(){callback(200,"OK",{text:xdr.responseText},"Content-Type: "+xdr.contentType)},xdr.onerror=function(){callback(404,"Not Found")},s.xdrTimeout&&(xdr.ontimeout=function(){callback(0,"timeout")},xdr.timeout=s.xdrTimeout),xdr.send(s.hasContent&&s.data||null)},abort:function(){xdr&&(xdr.onerror=$.noop(),xdr.abort())}}}})}),/*
 * jQuery File Upload Plugin 5.37.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
function(factory){"use strict";"function"==typeof define&&define.amd?define(["jquery","jquery.ui.widget"],factory):factory(window.jQuery)}(function($){"use strict";$.support.fileInput=!(new RegExp("(Android (1\\.[0156]|2\\.[01]))|(Windows Phone (OS 7|8\\.0))|(XBLWP)|(ZuneWP)|(WPDesktop)|(w(eb)?OSBrowser)|(webOS)|(Kindle/(1\\.0|2\\.[05]|3\\.0))").test(window.navigator.userAgent)||$('<input type="file">').prop("disabled")),$.support.xhrFileUpload=!(!window.ProgressEvent||!window.FileReader),$.support.xhrFormDataFileUpload=!!window.FormData,$.support.blobSlice=window.Blob&&(Blob.prototype.slice||Blob.prototype.webkitSlice||Blob.prototype.mozSlice),$.widget("blueimp.fileupload",{options:{dropZone:$(document),pasteZone:$(document),fileInput:void 0,replaceFileInput:!0,paramName:void 0,singleFileUploads:!0,limitMultiFileUploads:void 0,sequentialUploads:!1,limitConcurrentUploads:void 0,forceIframeTransport:!1,redirect:void 0,redirectParamName:void 0,postMessage:void 0,multipart:!0,maxChunkSize:void 0,uploadedBytes:void 0,recalculateProgress:!0,progressInterval:100,bitrateInterval:500,autoUpload:!0,messages:{uploadedBytes:"Uploaded bytes exceed file size"},i18n:function(message,context){return message=this.messages[message]||message.toString(),context&&$.each(context,function(key,value){message=message.replace("{"+key+"}",value)}),message},formData:function(form){return form.serializeArray()},add:function(e,data){return e.isDefaultPrevented()?!1:void((data.autoUpload||data.autoUpload!==!1&&$(this).fileupload("option","autoUpload"))&&data.process().done(function(){data.submit()}))},processData:!1,contentType:!1,cache:!1},_specialOptions:["fileInput","dropZone","pasteZone","multipart","forceIframeTransport"],_blobSlice:$.support.blobSlice&&function(){var slice=this.slice||this.webkitSlice||this.mozSlice;return slice.apply(this,arguments)},_BitrateTimer:function(){this.timestamp=Date.now?Date.now():(new Date).getTime(),this.loaded=0,this.bitrate=0,this.getBitrate=function(now,loaded,interval){var timeDiff=now-this.timestamp;return(!this.bitrate||!interval||timeDiff>interval)&&(this.bitrate=(loaded-this.loaded)*(1e3/timeDiff)*8,this.loaded=loaded,this.timestamp=now),this.bitrate}},_isXHRUpload:function(options){return!options.forceIframeTransport&&(!options.multipart&&$.support.xhrFileUpload||$.support.xhrFormDataFileUpload)},_getFormData:function(options){var formData;return"function"==typeof options.formData?options.formData(options.form):$.isArray(options.formData)?options.formData:"object"===$.type(options.formData)?(formData=[],$.each(options.formData,function(name,value){formData.push({name:name,value:value})}),formData):[]},_getTotal:function(files){var total=0;return $.each(files,function(index,file){total+=file.size||1}),total},_initProgressObject:function(obj){var progress={loaded:0,total:0,bitrate:0};obj._progress?$.extend(obj._progress,progress):obj._progress=progress},_initResponseObject:function(obj){var prop;if(obj._response)for(prop in obj._response)obj._response.hasOwnProperty(prop)&&delete obj._response[prop];else obj._response={}},_onProgress:function(e,data){if(e.lengthComputable){var loaded,now=Date.now?Date.now():(new Date).getTime();if(data._time&&data.progressInterval&&now-data._time<data.progressInterval&&e.loaded!==e.total)return;data._time=now,loaded=Math.floor(e.loaded/e.total*(data.chunkSize||data._progress.total))+(data.uploadedBytes||0),this._progress.loaded+=loaded-data._progress.loaded,this._progress.bitrate=this._bitrateTimer.getBitrate(now,this._progress.loaded,data.bitrateInterval),data._progress.loaded=data.loaded=loaded,data._progress.bitrate=data.bitrate=data._bitrateTimer.getBitrate(now,loaded,data.bitrateInterval),this._trigger("progress",$.Event("progress",{delegatedEvent:e}),data),this._trigger("progressall",$.Event("progressall",{delegatedEvent:e}),this._progress)}},_initProgressListener:function(options){var that=this,xhr=options.xhr?options.xhr():$.ajaxSettings.xhr();xhr.upload&&($(xhr.upload).bind("progress",function(e){var oe=e.originalEvent;e.lengthComputable=oe.lengthComputable,e.loaded=oe.loaded,e.total=oe.total,that._onProgress(e,options)}),options.xhr=function(){return xhr})},_isInstanceOf:function(type,obj){return Object.prototype.toString.call(obj)==="[object "+type+"]"},_initXHRData:function(options){var formData,that=this,file=options.files[0],multipart=options.multipart||!$.support.xhrFileUpload,paramName=options.paramName[0];options.headers=$.extend({},options.headers),options.contentRange&&(options.headers["Content-Range"]=options.contentRange),multipart&&!options.blob&&this._isInstanceOf("File",file)||(options.headers["Content-Disposition"]='attachment; filename="'+encodeURI(file.name)+'"'),multipart?$.support.xhrFormDataFileUpload&&(options.postMessage?(formData=this._getFormData(options),options.blob?formData.push({name:paramName,value:options.blob}):$.each(options.files,function(index,file){formData.push({name:options.paramName[index]||paramName,value:file})})):(that._isInstanceOf("FormData",options.formData)?formData=options.formData:(formData=new FormData,$.each(this._getFormData(options),function(index,field){formData.append(field.name,field.value)})),options.blob?formData.append(paramName,options.blob,file.name):$.each(options.files,function(index,file){(that._isInstanceOf("File",file)||that._isInstanceOf("Blob",file))&&formData.append(options.paramName[index]||paramName,file,file.uploadName||file.name)})),options.data=formData):(options.contentType=file.type,options.data=options.blob||file),options.blob=null},_initIframeSettings:function(options){var targetHost=$("<a></a>").prop("href",options.url).prop("host");options.dataType="iframe "+(options.dataType||""),options.formData=this._getFormData(options),options.redirect&&targetHost&&targetHost!==location.host&&options.formData.push({name:options.redirectParamName||"redirect",value:options.redirect})},_initDataSettings:function(options){this._isXHRUpload(options)?(this._chunkedUpload(options,!0)||(options.data||this._initXHRData(options),this._initProgressListener(options)),options.postMessage&&(options.dataType="postmessage "+(options.dataType||""))):this._initIframeSettings(options)},_getParamName:function(options){var fileInput=$(options.fileInput),paramName=options.paramName;return paramName?$.isArray(paramName)||(paramName=[paramName]):(paramName=[],fileInput.each(function(){for(var input=$(this),name=input.prop("name")||"files[]",i=(input.prop("files")||[1]).length;i;)paramName.push(name),i-=1}),paramName.length||(paramName=[fileInput.prop("name")||"files[]"])),paramName},_initFormSettings:function(options){options.form&&options.form.length||(options.form=$(options.fileInput.prop("form")),options.form.length||(options.form=$(this.options.fileInput.prop("form")))),options.paramName=this._getParamName(options),options.url||(options.url=options.form.prop("action")||location.href),options.type=(options.type||"string"===$.type(options.form.prop("method"))&&options.form.prop("method")||"").toUpperCase(),"POST"!==options.type&&"PUT"!==options.type&&"PATCH"!==options.type&&(options.type="POST"),options.formAcceptCharset||(options.formAcceptCharset=options.form.attr("accept-charset"))},_getAJAXSettings:function(data){var options=$.extend({},this.options,data);return this._initFormSettings(options),this._initDataSettings(options),options},_getDeferredState:function(deferred){return deferred.state?deferred.state():deferred.isResolved()?"resolved":deferred.isRejected()?"rejected":"pending"},_enhancePromise:function(promise){return promise.success=promise.done,promise.error=promise.fail,promise.complete=promise.always,promise},_getXHRPromise:function(resolveOrReject,context,args){var dfd=$.Deferred(),promise=dfd.promise();return context=context||this.options.context||promise,resolveOrReject===!0?dfd.resolveWith(context,args):resolveOrReject===!1&&dfd.rejectWith(context,args),promise.abort=dfd.promise,this._enhancePromise(promise)},_addConvenienceMethods:function(e,data){var that=this,getPromise=function(args){return $.Deferred().resolveWith(that,args).promise()};data.process=function(resolveFunc,rejectFunc){return(resolveFunc||rejectFunc)&&(data._processQueue=this._processQueue=(this._processQueue||getPromise([this])).pipe(function(){return data.errorThrown?$.Deferred().rejectWith(that,[data]).promise():getPromise(arguments)}).pipe(resolveFunc,rejectFunc)),this._processQueue||getPromise([this])},data.submit=function(){return"pending"!==this.state()&&(data.jqXHR=this.jqXHR=that._trigger("submit",$.Event("submit",{delegatedEvent:e}),this)!==!1&&that._onSend(e,this)),this.jqXHR||that._getXHRPromise()},data.abort=function(){return this.jqXHR?this.jqXHR.abort():(this.errorThrown="abort",that._getXHRPromise())},data.state=function(){return this.jqXHR?that._getDeferredState(this.jqXHR):this._processQueue?that._getDeferredState(this._processQueue):void 0},data.processing=function(){return!this.jqXHR&&this._processQueue&&"pending"===that._getDeferredState(this._processQueue)},data.progress=function(){return this._progress},data.response=function(){return this._response}},_getUploadedBytes:function(jqXHR){var range=jqXHR.getResponseHeader("Range"),parts=range&&range.split("-"),upperBytesPos=parts&&parts.length>1&&parseInt(parts[1],10);return upperBytesPos&&upperBytesPos+1},_chunkedUpload:function(options,testOnly){options.uploadedBytes=options.uploadedBytes||0;var jqXHR,upload,that=this,file=options.files[0],fs=file.size,ub=options.uploadedBytes,mcs=options.maxChunkSize||fs,slice=this._blobSlice,dfd=$.Deferred(),promise=dfd.promise();return this._isXHRUpload(options)&&slice&&(ub||fs>mcs)&&!options.data?testOnly?!0:ub>=fs?(file.error=options.i18n("uploadedBytes"),this._getXHRPromise(!1,options.context,[null,"error",file.error])):(upload=function(){var o=$.extend({},options),currentLoaded=o._progress.loaded;o.blob=slice.call(file,ub,ub+mcs,file.type),o.chunkSize=o.blob.size,o.contentRange="bytes "+ub+"-"+(ub+o.chunkSize-1)+"/"+fs,that._initXHRData(o),that._initProgressListener(o),jqXHR=(that._trigger("chunksend",null,o)!==!1&&$.ajax(o)||that._getXHRPromise(!1,o.context)).done(function(result,textStatus,jqXHR){ub=that._getUploadedBytes(jqXHR)||ub+o.chunkSize,currentLoaded+o.chunkSize-o._progress.loaded&&that._onProgress($.Event("progress",{lengthComputable:!0,loaded:ub-o.uploadedBytes,total:ub-o.uploadedBytes}),o),options.uploadedBytes=o.uploadedBytes=ub,o.result=result,o.textStatus=textStatus,o.jqXHR=jqXHR,that._trigger("chunkdone",null,o),that._trigger("chunkalways",null,o),fs>ub?upload():dfd.resolveWith(o.context,[result,textStatus,jqXHR])}).fail(function(jqXHR,textStatus,errorThrown){o.jqXHR=jqXHR,o.textStatus=textStatus,o.errorThrown=errorThrown,that._trigger("chunkfail",null,o),that._trigger("chunkalways",null,o),dfd.rejectWith(o.context,[jqXHR,textStatus,errorThrown])})},this._enhancePromise(promise),promise.abort=function(){return jqXHR.abort()},upload(),promise):!1},_beforeSend:function(e,data){0===this._active&&(this._trigger("start"),this._bitrateTimer=new this._BitrateTimer,this._progress.loaded=this._progress.total=0,this._progress.bitrate=0),this._initResponseObject(data),this._initProgressObject(data),data._progress.loaded=data.loaded=data.uploadedBytes||0,data._progress.total=data.total=this._getTotal(data.files)||1,data._progress.bitrate=data.bitrate=0,this._active+=1,this._progress.loaded+=data.loaded,this._progress.total+=data.total},_onDone:function(result,textStatus,jqXHR,options){var total=options._progress.total,response=options._response;options._progress.loaded<total&&this._onProgress($.Event("progress",{lengthComputable:!0,loaded:total,total:total}),options),response.result=options.result=result,response.textStatus=options.textStatus=textStatus,response.jqXHR=options.jqXHR=jqXHR,this._trigger("done",null,options)},_onFail:function(jqXHR,textStatus,errorThrown,options){var response=options._response;options.recalculateProgress&&(this._progress.loaded-=options._progress.loaded,this._progress.total-=options._progress.total),response.jqXHR=options.jqXHR=jqXHR,response.textStatus=options.textStatus=textStatus,response.errorThrown=options.errorThrown=errorThrown,this._trigger("fail",null,options)},_onAlways:function(jqXHRorResult,textStatus,jqXHRorError,options){this._trigger("always",null,options)},_onSend:function(e,data){data.submit||this._addConvenienceMethods(e,data);var jqXHR,aborted,slot,pipe,that=this,options=that._getAJAXSettings(data),send=function(){return that._sending+=1,options._bitrateTimer=new that._BitrateTimer,jqXHR=jqXHR||((aborted||that._trigger("send",$.Event("send",{delegatedEvent:e}),options)===!1)&&that._getXHRPromise(!1,options.context,aborted)||that._chunkedUpload(options)||$.ajax(options)).done(function(result,textStatus,jqXHR){that._onDone(result,textStatus,jqXHR,options)}).fail(function(jqXHR,textStatus,errorThrown){that._onFail(jqXHR,textStatus,errorThrown,options)}).always(function(jqXHRorResult,textStatus,jqXHRorError){if(that._onAlways(jqXHRorResult,textStatus,jqXHRorError,options),that._sending-=1,that._active-=1,options.limitConcurrentUploads&&options.limitConcurrentUploads>that._sending)for(var nextSlot=that._slots.shift();nextSlot;){if("pending"===that._getDeferredState(nextSlot)){nextSlot.resolve();break}nextSlot=that._slots.shift()}0===that._active&&that._trigger("stop")})};return this._beforeSend(e,options),this.options.sequentialUploads||this.options.limitConcurrentUploads&&this.options.limitConcurrentUploads<=this._sending?(this.options.limitConcurrentUploads>1?(slot=$.Deferred(),this._slots.push(slot),pipe=slot.pipe(send)):(this._sequence=this._sequence.pipe(send,send),pipe=this._sequence),pipe.abort=function(){return aborted=[void 0,"abort","abort"],jqXHR?jqXHR.abort():(slot&&slot.rejectWith(options.context,aborted),send())},this._enhancePromise(pipe)):send()},_onAdd:function(e,data){var paramNameSet,paramNameSlice,fileSet,i,that=this,result=!0,options=$.extend({},this.options,data),limit=options.limitMultiFileUploads,paramName=this._getParamName(options);if((options.singleFileUploads||limit)&&this._isXHRUpload(options))if(!options.singleFileUploads&&limit)for(fileSet=[],paramNameSet=[],i=0;i<data.files.length;i+=limit)fileSet.push(data.files.slice(i,i+limit)),paramNameSlice=paramName.slice(i,i+limit),paramNameSlice.length||(paramNameSlice=paramName),paramNameSet.push(paramNameSlice);else paramNameSet=paramName;else fileSet=[data.files],paramNameSet=[paramName];return data.originalFiles=data.files,$.each(fileSet||data.files,function(index,element){var newData=$.extend({},data);return newData.files=fileSet?element:[element],newData.paramName=paramNameSet[index],that._initResponseObject(newData),that._initProgressObject(newData),that._addConvenienceMethods(e,newData),result=that._trigger("add",$.Event("add",{delegatedEvent:e}),newData)}),result},_replaceFileInput:function(input){var inputClone=input.clone(!0);$("<form></form>").append(inputClone)[0].reset(),input.after(inputClone).detach(),$.cleanData(input.unbind("remove")),this.options.fileInput=this.options.fileInput.map(function(i,el){return el===input[0]?inputClone[0]:el}),input[0]===this.element[0]&&(this.element=inputClone)},_handleFileTreeEntry:function(entry,path){var dirReader,that=this,dfd=$.Deferred(),errorHandler=function(e){e&&!e.entry&&(e.entry=entry),dfd.resolve([e])};return path=path||"",entry.isFile?entry._file?(entry._file.relativePath=path,dfd.resolve(entry._file)):entry.file(function(file){file.relativePath=path,dfd.resolve(file)},errorHandler):entry.isDirectory?(dirReader=entry.createReader(),dirReader.readEntries(function(entries){that._handleFileTreeEntries(entries,path+entry.name+"/").done(function(files){dfd.resolve(files)}).fail(errorHandler)},errorHandler)):dfd.resolve([]),dfd.promise()},_handleFileTreeEntries:function(entries,path){var that=this;return $.when.apply($,$.map(entries,function(entry){return that._handleFileTreeEntry(entry,path)})).pipe(function(){return Array.prototype.concat.apply([],arguments)})},_getDroppedFiles:function(dataTransfer){dataTransfer=dataTransfer||{};var items=dataTransfer.items;return items&&items.length&&(items[0].webkitGetAsEntry||items[0].getAsEntry)?this._handleFileTreeEntries($.map(items,function(item){var entry;return item.webkitGetAsEntry?(entry=item.webkitGetAsEntry(),entry&&(entry._file=item.getAsFile()),entry):item.getAsEntry()})):$.Deferred().resolve($.makeArray(dataTransfer.files)).promise()},_getSingleFileInputFiles:function(fileInput){fileInput=$(fileInput);var files,value,entries=fileInput.prop("webkitEntries")||fileInput.prop("entries");if(entries&&entries.length)return this._handleFileTreeEntries(entries);if(files=$.makeArray(fileInput.prop("files")),files.length)void 0===files[0].name&&files[0].fileName&&$.each(files,function(index,file){file.name=file.fileName,file.size=file.fileSize});else{if(value=fileInput.prop("value"),!value)return $.Deferred().resolve([]).promise();files=[{name:value.replace(/^.*\\/,"")}]}return $.Deferred().resolve(files).promise()},_getFileInputFiles:function(fileInput){return fileInput instanceof $&&1!==fileInput.length?$.when.apply($,$.map(fileInput,this._getSingleFileInputFiles)).pipe(function(){return Array.prototype.concat.apply([],arguments)}):this._getSingleFileInputFiles(fileInput)},_onChange:function(e){var that=this,data={fileInput:$(e.target),form:$(e.target.form)};this._getFileInputFiles(data.fileInput).always(function(files){data.files=files,that.options.replaceFileInput&&that._replaceFileInput(data.fileInput),that._trigger("change",$.Event("change",{delegatedEvent:e}),data)!==!1&&that._onAdd(e,data)})},_onPaste:function(e){var items=e.originalEvent&&e.originalEvent.clipboardData&&e.originalEvent.clipboardData.items,data={files:[]};items&&items.length&&($.each(items,function(index,item){var file=item.getAsFile&&item.getAsFile();file&&data.files.push(file)}),this._trigger("paste",$.Event("paste",{delegatedEvent:e}),data)!==!1&&this._onAdd(e,data))},_onDrop:function(e){e.dataTransfer=e.originalEvent&&e.originalEvent.dataTransfer;var that=this,dataTransfer=e.dataTransfer,data={};dataTransfer&&dataTransfer.files&&dataTransfer.files.length&&(e.preventDefault(),this._getDroppedFiles(dataTransfer).always(function(files){data.files=files,that._trigger("drop",$.Event("drop",{delegatedEvent:e}),data)!==!1&&that._onAdd(e,data)}))},_onDragOver:function(e){e.dataTransfer=e.originalEvent&&e.originalEvent.dataTransfer;var dataTransfer=e.dataTransfer;dataTransfer&&-1!==$.inArray("Files",dataTransfer.types)&&this._trigger("dragover",$.Event("dragover",{delegatedEvent:e}))!==!1&&(e.preventDefault(),dataTransfer.dropEffect="copy")},_initEventHandlers:function(){this._isXHRUpload(this.options)&&(this._on(this.options.dropZone,{dragover:this._onDragOver,drop:this._onDrop}),this._on(this.options.pasteZone,{paste:this._onPaste})),$.support.fileInput&&this._on(this.options.fileInput,{change:this._onChange})},_destroyEventHandlers:function(){this._off(this.options.dropZone,"dragover drop"),this._off(this.options.pasteZone,"paste"),this._off(this.options.fileInput,"change")},_setOption:function(key,value){var reinit=-1!==$.inArray(key,this._specialOptions);reinit&&this._destroyEventHandlers(),this._super(key,value),reinit&&(this._initSpecialOptions(),this._initEventHandlers())},_initSpecialOptions:function(){var options=this.options;void 0===options.fileInput?options.fileInput=this.element.is('input[type="file"]')?this.element:this.element.find('input[type="file"]'):options.fileInput instanceof $||(options.fileInput=$(options.fileInput)),options.dropZone instanceof $||(options.dropZone=$(options.dropZone)),options.pasteZone instanceof $||(options.pasteZone=$(options.pasteZone))},_getRegExp:function(str){var parts=str.split("/"),modifiers=parts.pop();return parts.shift(),new RegExp(parts.join("/"),modifiers)},_isRegExpOption:function(key,value){return"url"!==key&&"string"===$.type(value)&&/^\/.*\/[igm]{0,3}$/.test(value)},_initDataAttributes:function(){var that=this,options=this.options;$.each($(this.element[0].cloneNode(!1)).data(),function(key,value){that._isRegExpOption(key,value)&&(value=that._getRegExp(value)),options[key]=value})},_create:function(){this._initDataAttributes(),this._initSpecialOptions(),this._slots=[],this._sequence=this._getXHRPromise(!0),this._sending=this._active=0,this._initProgressObject(this),this._initEventHandlers()},active:function(){return this._active},progress:function(){return this._progress},add:function(data){var that=this;data&&!this.options.disabled&&(data.fileInput&&!data.files?this._getFileInputFiles(data.fileInput).always(function(files){data.files=files,that._onAdd(null,data)}):(data.files=$.makeArray(data.files),this._onAdd(null,data)))},send:function(data){if(data&&!this.options.disabled){if(data.fileInput&&!data.files){var jqXHR,aborted,that=this,dfd=$.Deferred(),promise=dfd.promise();return promise.abort=function(){return aborted=!0,jqXHR?jqXHR.abort():(dfd.reject(null,"abort","abort"),promise)},this._getFileInputFiles(data.fileInput).always(function(files){if(!aborted){if(!files.length)return void dfd.reject();data.files=files,jqXHR=that._onSend(null,data).then(function(result,textStatus,jqXHR){dfd.resolve(result,textStatus,jqXHR)},function(jqXHR,textStatus,errorThrown){dfd.reject(jqXHR,textStatus,errorThrown)})}}),this._enhancePromise(promise)}if(data.files=$.makeArray(data.files),data.files.length)return this._onSend(null,data)}return this._getXHRPromise(!1,data&&data.context)}})}),/*
 * jQuery File Upload Processing Plugin 1.3.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
function(factory){"use strict";"function"==typeof define&&define.amd?define(["jquery","./jquery.fileupload"],factory):factory(window.jQuery)}(function($){"use strict";var originalAdd=$.blueimp.fileupload.prototype.options.add;$.widget("blueimp.fileupload",$.blueimp.fileupload,{options:{processQueue:[],add:function(e,data){var $this=$(this);data.process(function(){return $this.fileupload("process",data)}),originalAdd.call(this,e,data)}},processActions:{},_processFile:function(data,originalData){var that=this,dfd=$.Deferred().resolveWith(that,[data]),chain=dfd.promise();return this._trigger("process",null,data),$.each(data.processQueue,function(i,settings){var func=function(data){return originalData.errorThrown?$.Deferred().rejectWith(that,[originalData]).promise():that.processActions[settings.action].call(that,data,settings)};chain=chain.pipe(func,settings.always&&func)}),chain.done(function(){that._trigger("processdone",null,data),that._trigger("processalways",null,data)}).fail(function(){that._trigger("processfail",null,data),that._trigger("processalways",null,data)}),chain},_transformProcessQueue:function(options){var processQueue=[];$.each(options.processQueue,function(){var settings={},action=this.action,prefix=this.prefix===!0?action:this.prefix;$.each(this,function(key,value){"string"===$.type(value)&&"@"===value.charAt(0)?settings[key]=options[value.slice(1)||(prefix?prefix+key.charAt(0).toUpperCase()+key.slice(1):key)]:settings[key]=value}),processQueue.push(settings)}),options.processQueue=processQueue},processing:function(){return this._processing},process:function(data){var that=this,options=$.extend({},this.options,data);return options.processQueue&&options.processQueue.length&&(this._transformProcessQueue(options),0===this._processing&&this._trigger("processstart"),$.each(data.files,function(index){var opts=index?$.extend({},options):options,func=function(){return data.errorThrown?$.Deferred().rejectWith(that,[data]).promise():that._processFile(opts,data)};opts.index=index,that._processing+=1,that._processingQueue=that._processingQueue.pipe(func,func).always(function(){that._processing-=1,0===that._processing&&that._trigger("processstop")})})),this._processingQueue},_create:function(){this._super(),this._processing=0,this._processingQueue=$.Deferred().resolveWith(this).promise()}})}),function(){}.call(this);