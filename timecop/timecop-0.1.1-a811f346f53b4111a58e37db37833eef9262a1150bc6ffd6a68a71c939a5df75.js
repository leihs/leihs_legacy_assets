!function(){function defineDelegate(method){Timecop.MockDate.prototype[method]=function(){return this._underlyingDate[method].apply(this._underlyingDate,arguments)}}var Timecop,root=this,slice=Array.prototype.slice,timeStack=[];timeStack.peek=function(){return this.length>0?this[this.length-1]:null},timeStack.clear=function(){this.splice(0,this.length)};var extractFunction=function(args){if(args.length>0&&"function"==typeof args[args.length-1]){var fn=args.pop();return fn}return null},takeTrip=function(type,args){var fn=extractFunction(args),date=Timecop.buildNativeDate.apply(Timecop,args);if(isNaN(date.getYear()))throw'Could not parse date: "'+args.join(", ")+'"';if(timeStack.push(new Timecop.TimeStackItem(type,date)),fn)try{fn()}finally{Timecop.returnToPresent()}};Timecop={NativeDate:root.Date,buildNativeDate:function(){return 0===arguments.length?new Timecop.NativeDate:1===arguments.length?new Timecop.NativeDate(arguments[0]):2===arguments.length?new Timecop.NativeDate(arguments[0],arguments[1]):3===arguments.length?new Timecop.NativeDate(arguments[0],arguments[1],arguments[2]):4===arguments.length?new Timecop.NativeDate(arguments[0],arguments[1],arguments[2],arguments[3]):5===arguments.length?new Timecop.NativeDate(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]):6===arguments.length?new Timecop.NativeDate(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]):7===arguments.length?new Timecop.NativeDate(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]):void 0},install:function(){root.Date=Timecop.MockDate},uninstall:function(){root.Date=Timecop.NativeDate},travel:function(){takeTrip("travel",slice.call(arguments))},freeze:function(){takeTrip("freeze",slice.call(arguments))},returnToPresent:function(){timeStack.clear()},topOfStack:function(){return timeStack.peek()}},"undefined"!=typeof module&&module.exports?(module.exports=Timecop,Timecop.Timecop=Timecop):root.Timecop=Timecop,Timecop.MockDate=function(){arguments.length>0||!Timecop.topOfStack()?this._underlyingDate=Timecop.buildNativeDate.apply(Timecop,Array.prototype.slice.apply(arguments)):this._underlyingDate=Timecop.topOfStack().date()},Timecop.MockDate.UTC=function(){return Timecop.NativeDate.UTC.apply(Timecop.NativeDate,arguments)},Timecop.MockDate.parse=function(dateString){return Timecop.NativeDate.parse(dateString)},Timecop.MockDate.prototype={},defineDelegate("toDateString"),defineDelegate("toGMTString"),defineDelegate("toISOString"),defineDelegate("toJSON"),defineDelegate("toLocaleDateString"),defineDelegate("toLocaleString"),defineDelegate("toLocaleTimeString"),defineDelegate("toString"),defineDelegate("toTimeString"),defineDelegate("toUTCString"),defineDelegate("valueOf");for(var delegatedAspects=["Date","Day","FullYear","Hours","Milliseconds","Minutes","Month","Seconds","Time","TimezoneOffset","UTCDate","UTCDay","UTCFullYear","UTCHours","UTCMilliseconds","UTCMinutes","UTCMonth","UTCSeconds","Year"],delegatedActions=["get","set"],i=0;i<delegatedActions.length;i++)for(var j=0;j<delegatedAspects.length;j++)defineDelegate(delegatedActions[i]+delegatedAspects[j]);Timecop.TimeStackItem=function(mockType,time){if("freeze"!==mockType&&"travel"!==mockType)throw"Unknown mock_type "+mockType;this.mockType=mockType,this._time=time,this._travelOffset=this._computeTravelOffset()},Timecop.TimeStackItem.prototype={date:function(){return this.time()},time:function(){return null===this._travelOffset?this._time:new Timecop.NativeDate((new Timecop.NativeDate).getTime()+this._travelOffset)},_computeTravelOffset:function(){return"freeze"===this.mockType?null:this._time.getTime()-(new Timecop.NativeDate).getTime()}}}();