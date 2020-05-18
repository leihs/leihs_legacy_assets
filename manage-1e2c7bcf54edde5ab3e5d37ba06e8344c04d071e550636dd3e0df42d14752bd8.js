/**
 * jqBarGraph - jQuery plugin - Extended
 * @version: 1.2 (2011/10/12)
 * @requires jQuery v1.2.2 or later 
 * @author Ivan Lazarevic
 ** @author Sebastian Pape
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 * 
 * @param data: arrayOfData                     // array of data for your graph
 * @param title: false                          // title of your graph, accept HTML
 * @param barSpace: 10                          // this is default space between bars in pixels
 * @param width: 400                            // default width of your graph ghhjgjhg
 * @param height: 200                                   //default height of your graph
 * @param color: '#000000'                      // if you don't send colors for your data this will be default bars color
 * @param colors: false                         // array of colors that will be used for your bars and legends
 * @param lbl: ''                               // if there is no label in your array
 * @param sort: false                           // sort your data before displaying graph, you can sort as 'asc' or 'desc'
 * @param position: 'bottom'                    // position of your bars, can be 'bottom' or 'top'. 'top' doesn't work for multi type
 * @param prefix: ''                            // text that will be shown before every label
 * @param postfix: ''                           // text that will be shown after every label
 * @param animate: true                         // if you don't need animated appereance change to false
 * @param speed: 2                              // speed of animation in seconds
 * @param legendWidth: 100                      // width of your legend box
 * @param legend: false                         // if you want legend change to true
 * @param legends: false                        // array for legend. for simple graph type legend will be extracted from labels if you don't set this
 * @param type: false                           // for multi array data default graph type is stacked, you can change to 'multi' for multi bar type
 * @param showValues: true                      // you can use this for multi and stacked type and it will show values of every bar part
 * @param showValuesColor: '#fff'               // color of font for values 
 * 
 * new params through extension
 * 
 * @param grid: true                            // enable or disable grid
 * @param gridSpace: 20                         // space between gridtext and graphs
 * @param gridAtMax: false                      // if enabled the highest grid starts at the highest value of given data
 * @param gridSections: 1                       // number of gridSections (space between to grid lines having value text)
 * @param gridColors: ["#444444", "#AAAAAA"]    // colors for the grid. second one is for intermediate grids.
 * @param interGrids: 1                         // number of intermediate grids (without value text) inside a grid section
 *
 * ***** EXAMPLE ****
 * 
 * $('#divForGraph').jqBarGraph({ data: arrayOfData });  
 * 
 * ******************
 * 
**/


(function($) {
	var opts = new Array;
	var level = new Array;
	
	$.fn.jqBarGraph = $.fn.jqbargraph = function(options){
	
	init = function(el){

		opts[el.id] = $.extend({}, $.fn.jqBarGraph.defaults, options);
		$(el).css({ 'width': opts[el.id].width, 'height': opts[el.id].height, 'position':'relative', 'text-align':'center' });
		doGraph(el);
    doGrid(el);

	};
	
	// sum of array elements
	sum = function(ar){
		total = 0;
		for(val in ar){
			total += ar[val];
		}
		return total.toFixed(2);
	};
	
	// count max value of array
	maxVal = function(ar){
		maxvalue = 0;
		for(var val in ar){
			value = ar[val][0];
			if(value instanceof Array) value = sum(value);	
			if (parseFloat(value) > parseFloat(maxvalue)) maxvalue=value;
		}	
		return maxvalue;	
	};

	// max value of multi array
	maxMulti = function(ar){
		maxvalue = 0;
		maxvalue2 = 0;
		
		for(var val in ar){
			ar2 = ar[val][0];
			
			for(var val2 in ar2){
				if(ar2[val2]>maxvalue2) maxvalue2 = ar2[val2];
			}

			if (maxvalue2>maxvalue) maxvalue=maxvalue2;
		}	
		return maxvalue;		
	};
	
	doGraph = function(el){
		
		arr = opts[el.id];
		data = arr.data;
		
		//check if array is bad or empty
		if(data == undefined) {
			$(el).html('There is not enought data for graph');
			return;
		}
		
		//sorting ascending or descending
		if(arr.sort == 'asc') data.sort(sortNumberAsc);
		if(arr.sort == 'desc') data.sort(sortNumberDesc);
		
		legend = '';
		prefix = arr.prefix;
		postfix = arr.postfix;
		space = arr.barSpace; //space between bars
		legendWidth = arr.legend ? arr.legendWidth : 0; //width of legend box
		gridSpace = arr.gridSpace;
		fieldWidth = ($(el).width()-legendWidth-gridSpace)/data.length; //width of bar
		totalHeight =  $(el).height(); //total height of graph box
		var leg = new Array(); //legends array
		
		//max value in data, I use this to calculate height of bar
		max = maxVal(data);
		colPosition = 0; // for printing colors on simple bar graph

 		for(var val in data){
 			
 			valueData = data[val][0];
 			if (valueData instanceof Array) 
 				value = parseFloat(sum(valueData));
 			else
 				value = parseFloat(valueData);
 			
 			lbl = data[val][1];
 			color = data[val][2];
			unique = val+el.id; //unique identifier
			
 			if (color == undefined && arr.colors == false) 
 				color = arr.color;
 				
 			if (arr.colors && !color){
 				colorsCounter = arr.colors.length;
 				if (colorsCounter == colPosition) colPosition = 0;
 				color = arr.colors[colPosition];
 				colPosition++;
 			}
 			
 			if(arr.type == 'multi') color = 'none';
 				
 			if (lbl == undefined) lbl = arr.lbl;
 		
 			out  = "<div class='graphField"+el.id+"' id='graphField"+unique+"' style='position: absolute'>";
 			
 			if(lbl.value) {
 			  out += "<div class='graphValue"+el.id+"' id='graphValue"+unique+"'>"+lbl.value+"</div>";
 			} else {
        out += "<div class='graphValue"+el.id+"' id='graphValue"+unique+"'>"+prefix+value+postfix+"</div>"; 			  
 			}
 			out += "<div class='graphBar"+el.id+"' id='graphFieldBar"+unique+"' style='background-color:"+color+";position: relative; overflow: hidden;'></div>";

			// if there is no legend or exist legends display lbl at the bottom
 			if(!arr.legend || arr.legends)
 				out += "<div class='graphLabel"+el.id+"' id='graphLabel"+unique+"'>"+lbl.name+"</div>";
 			out += "</div>";
 			
			$(el).append(out);
 			
 			//size of bar
 			totalHeightBar = totalHeight - $('.graphLabel'+el.id).outerHeight() - $('.graphValue'+el.id).outerHeight(); 
 			fieldHeight = (totalHeightBar*value)/max;	
 			$('#graphField'+unique).css({ 
 				'left': (fieldWidth)*val+gridSpace, 
 				'width': fieldWidth-space, 
 				'margin-left': space/2,
 				'margin-right': space/2});
 	
 			// multi array
 			if(valueData instanceof Array){
 				
				if(arr.type=="multi"){
					maxe = maxMulti(data);
					totalHeightBar = fieldHeight = totalHeight - $('.graphLabel'+el.id).height();
					$('.graphValue'+el.id).remove();
				} else {
					maxe = max;
				}
				
 				for (i in valueData){
 					heig = totalHeightBar*valueData[i]/maxe;
 					wid = parseInt((fieldWidth-space)/valueData.length);
 					sv = ''; // show values
 					fs = 0; // font size
 					valueElement = '';
 					if (arr.showValues && valueData[i] != 0 && sum(valueData) != valueData[i]){
 						sv = arr.prefix+valueData[i]+arr.postfix;
 						fs = 12; // font-size is 0 if showValues = false
 						valueElement = "<span class='text'>"+sv+"</span>";
 					}
 					o = "<div class='subBars"+el.id+"' style='height:"+heig+"px; background-color: "+arr.colors[i]+"; left:"+wid*i+"px; color:"+arr.showValuesColor+"; font-size:"+fs+"px' ></div>";
 					$('#graphFieldBar'+unique).prepend(o);
 				}
 			}
 			
 			if(arr.type=='multi')
 				$('.subBars'+el.id).css({ 'width': wid, 'position': 'absolute', 'bottom': 0 });
 
 			//position of bars
 			if(arr.position == 'bottom') $('.graphField'+el.id).css('bottom',0);

			//creating legend array from lbl if there is no legends param
 			if(!arr.legends)
 				leg.push([ color, lbl, el.id, unique ]); 
 			
 			// animated apearing
 			if(arr.animate){
 				$('#graphFieldBar'+unique).css({ 'height' : 0 });
 				$('#graphFieldBar'+unique).animate({'height': fieldHeight},arr.speed*1000);
 			} else {
 				$('#graphFieldBar'+unique).css({'height': fieldHeight});
 			}
 			
 		}
 			
 		//creating legend array from legends param
 		for(var l in arr.legends){
 			leg.push([ arr.colors[l], arr.legends[l], el.id, l ]);
 		}
 		
 		createLegend(leg); // create legend from array
 		
 		//position of legend
 		if(arr.legend){
			$(el).append("<div id='legendHolder"+unique+"'></div>");
	 		$('#legendHolder'+unique).css({ 'width': legendWidth, 'float': 'right', 'text-align' : 'left'});
	 		$('#legendHolder'+unique).append(legend);
	 		$('.legendBar'+el.id).css({ 'float':'left', 'margin': 3, 'height': 12, 'width': 20, 'font-size': 0});
 		}
 		
 		//position of title
 		if(arr.title){
 			$(el).wrap("<div id='graphHolder"+unique+"'></div>");
 			$('#graphHolder'+unique).prepend(arr.title).css({ 'width' : arr.width+'px', 'text-align' : 'center' });
 		}
 		
	};

	doGrid = function(el){
	  
    //check options
	  options = opts[el.id];
    if(!options.grid) {return}
    
    //prepare data
    arr = opts[el.id];
    data = arr.data;
    
    //get highest value in data array
    var max = parseFloat(maxVal(data));
    
    //compute highest data grid value
    var highest = Math.floor( max / Math.pow(10, max.toString().length-1) );
        highest = highest * Math.pow(10, max.toString().length-1);
        highest = (arr.gridAtMax) ? max : highest;
    
    //preparing grid lines
    var gridstep = highest / arr.gridSections;
    var gridlines = [];
    var interstep = highest / arr.gridSections / (arr.interGrids+1)
    var intergrids = [];
    
        for(var i = 0; i < arr.gridSections; i++){
         gridlines.push( Math.round(gridstep*i) );
         
         for(var i2 = 1; i2 <= arr.interGrids; i2++) {
           intergrids.push( gridlines[i] + interstep*i2 );
         }
        }
        
        gridlines.push(highest);
    var gridColors = arr.gridColors;
        
    //compute margins
    var marginb = $(el).find(".graphLabel").first().outerHeight();
    var margint = $(el).find(".graphValue").first().outerHeight();
        
    //generating grid
    var grid = "<div class='bar-grid' style='position:absolute; height:"+options.height+"px; width:"+options.width+"px;'>";
        
        for(var i = 0; i < gridlines.length; i++){
          
          y = (max - gridlines[i]) / max;
          y = (y === -Infinity) ? 0 : y;
          y = y * (options.height-marginb-margint) + margint;
          
          grid += "<div class='grid-line' style='border-top: 1px solid "+gridColors[0]+";display:block; width: "+options.width+"px;position:absolute; top:"+y+"px'>";
          grid += "<span class='grid-text' style='position: absolute; left: 0; top:-5px;'></span>";
          grid += "<hr/>";
          grid += "</div>";
        }
        
        for(var i = 0; i < intergrids.length; i++){
          
          y = (max - intergrids[i]) / max;
          y = (y === -Infinity) ? 0 : y;
          y = y * (options.height-marginb-margint) + margint;
          
          grid += "<div class='grid-line grid-intermediate' style='border-top: 1px solid "+gridColors[1]+";opacity: 0.5;block; width: "+options.width+"px;position:absolute; top:"+y+"px'>";
          grid += "<hr/>";
          grid += "</div>";
        }
        
        grid +="</div>"
        
    //add grid to destinated element
    $(el).prepend(grid);
	};

	//creating legend from array
	createLegend = function(legendArr){
		legend = '';
		for(var val in legendArr){
	 			legend += "<div id='legend"+legendArr[val][3]+"' style='overflow: hidden; zoom: 1;'>";
	 			legend += "<div class='legendBar"+legendArr[val][2]+"' id='legendColor"+legendArr[val][3]+"' style='background-color:"+legendArr[val][0]+"'></div>";
	 			legend += "<div class='legendLabel"+legendArr[val][2]+"' id='graphLabel"+unique+"'>"+legendArr[val][1]+"</div>";
	 			legend += "</div>";			
		}
	};

	this.each (
		function()
		{ init(this); }
	)
	
};

	// default values
	$.fn.jqBarGraph.defaults = {	
		barSpace: 10,
		width: 400,
		height: 300,
		color: '#000000',
		colors: false,
		lbl: '',
		sort: false, // 'asc' or 'desc'
		position: 'bottom', // or 'top' doesn't work for multi type
		prefix: '',
		postfix: '',
		animate: true,
		speed: 1.5,
		legendWidth: 100,
		legend: false,
		legends: false,
		type: false, // or 'multi'
		showValues: true,
		showValuesColor: '#fff',
		title: false,
		grid: true,
		gridSpace: 20,
		gridAtMax: false,
		gridSections: 2,
    gridColors: ["#444444", "#AAAAAA"],
		interGrids: 1
	};
	
	
	//sorting functions
	function sortNumberAsc(a,b){
		if (a[0]<b[0]) return -1;
		if (a[0]>b[0]) return 1;
		return 0;
	}
	
	function sortNumberDesc(a,b){
		if (a[0]>b[0]) return -1;
		if (a[0]<b[0]) return 1;
		return 0;
	}	

})(jQuery);
/*!
	Autosize 1.18.18
	license: MIT
	http://www.jacklmoore.com/autosize
*/

(function ($) {
	var
	defaults = {
		className: 'autosizejs',
		id: 'autosizejs',
		append: '\n',
		callback: false,
		resizeDelay: 10,
		placeholder: true
	},

	// line-height is conditionally included because IE7/IE8/old Opera do not return the correct value.
	typographyStyles = [
		'fontFamily',
		'fontSize',
		'fontWeight',
		'fontStyle',
		'letterSpacing',
		'textTransform',
		'wordSpacing',
		'textIndent',
		'whiteSpace'
	],

	// to keep track which textarea is being mirrored when adjust() is called.
	mirrored,

	// the mirror element, which is used to calculate what size the mirrored element should be.
	mirror = $('<textarea tabindex="-1"/>').data('autosize', true)[0];

	// border:0 is unnecessary, but avoids a bug in Firefox on OSX
	mirror.style.cssText = "position:absolute; top:-999px; left:0; right:auto; bottom:auto; border:0; padding: 0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden; transition:none; -webkit-transition:none; -moz-transition:none;";

	// test that line-height can be accurately copied.
	mirror.style.lineHeight = '99px';
	if ($(mirror).css('lineHeight') === '99px') {
		typographyStyles.push('lineHeight');
	}
	mirror.style.lineHeight = '';

	$.fn.autosize = function (options) {
		if (!this.length) {
			return this;
		}

		options = $.extend({}, defaults, options || {});

		if (mirror.parentNode !== document.body) {
			$(document.body).append(mirror);
		}

		return this.each(function () {
			var
			ta = this,
			$ta = $(ta),
			maxHeight,
			minHeight,
			boxOffset = 0,
			callback = $.isFunction(options.callback),
			originalStyles = {
				height: ta.style.height,
				overflow: ta.style.overflow,
				overflowY: ta.style.overflowY,
				wordWrap: ta.style.wordWrap,
				resize: ta.style.resize
			},
			timeout,
			width = $ta.width(),
			taResize = $ta.css('resize');

			if ($ta.data('autosize')) {
				// exit if autosize has already been applied, or if the textarea is the mirror element.
				return;
			}
			$ta.data('autosize', true);

			if ($ta.css('box-sizing') === 'border-box' || $ta.css('-moz-box-sizing') === 'border-box' || $ta.css('-webkit-box-sizing') === 'border-box'){
				boxOffset = $ta.outerHeight() - $ta.height();
			}

			// IE8 and lower return 'auto', which parses to NaN, if no min-height is set.
			minHeight = Math.max(parseFloat($ta.css('minHeight')) - boxOffset || 0, $ta.height());

			$ta.css({
				overflow: 'hidden',
				overflowY: 'hidden',
				wordWrap: 'break-word' // horizontal overflow is hidden, so break-word is necessary for handling words longer than the textarea width
			});

			if (taResize === 'vertical') {
				$ta.css('resize','none');
			} else if (taResize === 'both') {
				$ta.css('resize', 'horizontal');
			}

			// getComputedStyle is preferred here because it preserves sub-pixel values, while jQuery's .width() rounds to an integer.
			function setWidth() {
				var width;
				var style = window.getComputedStyle ? window.getComputedStyle(ta, null) : null;

				if (style) {
					width = parseFloat(style.width);
					if (style.boxSizing === 'border-box' || style.webkitBoxSizing === 'border-box' || style.mozBoxSizing === 'border-box') {
						$.each(['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'], function(i,val){
							width -= parseFloat(style[val]);
						});
					}
				} else {
					width = $ta.width();
				}

				mirror.style.width = Math.max(width,0) + 'px';
			}

			function initMirror() {
				var styles = {};

				mirrored = ta;
				mirror.className = options.className;
				mirror.id = options.id;
				maxHeight = parseFloat($ta.css('maxHeight'));

				// mirror is a duplicate textarea located off-screen that
				// is automatically updated to contain the same text as the
				// original textarea.  mirror always has a height of 0.
				// This gives a cross-browser supported way getting the actual
				// height of the text, through the scrollTop property.
				$.each(typographyStyles, function(i,val){
					styles[val] = $ta.css(val);
				});

				$(mirror).css(styles).attr('wrap', $ta.attr('wrap'));

				setWidth();

				// Chrome-specific fix:
				// When the textarea y-overflow is hidden, Chrome doesn't reflow the text to account for the space
				// made available by removing the scrollbar. This workaround triggers the reflow for Chrome.
				if (window.chrome) {
					var width = ta.style.width;
					ta.style.width = '0px';
					var ignore = ta.offsetWidth;
					ta.style.width = width;
				}
			}

			// Using mainly bare JS in this function because it is going
			// to fire very often while typing, and needs to very efficient.
			function adjust() {
				var height, originalHeight;

				if (mirrored !== ta) {
					initMirror();
				} else {
					setWidth();
				}

				if (!ta.value && options.placeholder) {
					// If the textarea is empty, copy the placeholder text into
					// the mirror control and use that for sizing so that we
					// don't end up with placeholder getting trimmed.
					mirror.value = ($ta.attr("placeholder") || '');
				} else {
					mirror.value = ta.value;
				}

				mirror.value += options.append || '';
				mirror.style.overflowY = ta.style.overflowY;
				originalHeight = parseFloat(ta.style.height) || 0;

				// Setting scrollTop to zero is needed in IE8 and lower for the next step to be accurately applied
				mirror.scrollTop = 0;

				mirror.scrollTop = 9e4;

				// Using scrollTop rather than scrollHeight because scrollHeight is non-standard and includes padding.
				height = mirror.scrollTop;

				if (maxHeight && height > maxHeight) {
					ta.style.overflowY = 'scroll';
					height = maxHeight;
				} else {
					ta.style.overflowY = 'hidden';
					if (height < minHeight) {
						height = minHeight;
					}
				}

				height += boxOffset;

				if (Math.abs(originalHeight - height) > 1/100) {
					ta.style.height = height + 'px';

					// Trigger a repaint for IE8 for when ta is nested 2 or more levels inside an inline-block
					mirror.className = mirror.className;

					if (callback) {
						options.callback.call(ta,ta);
					}
					$ta.trigger('autosize.resized');
				}
			}

			function resize () {
				clearTimeout(timeout);
				timeout = setTimeout(function(){
					var newWidth = $ta.width();

					if (newWidth !== width) {
						width = newWidth;
						adjust();
					}
				}, parseInt(options.resizeDelay,10));
			}

			if ('onpropertychange' in ta) {
				if ('oninput' in ta) {
					// Detects IE9.  IE9 does not fire onpropertychange or oninput for deletions,
					// so binding to onkeyup to catch most of those occasions.  There is no way that I
					// know of to detect something like 'cut' in IE9.
					$ta.on('input.autosize keyup.autosize', adjust);
				} else {
					// IE7 / IE8
					$ta.on('propertychange.autosize', function(){
						if(event.propertyName === 'value'){
							adjust();
						}
					});
				}
			} else {
				// Modern Browsers
				$ta.on('input.autosize', adjust);
			}

			// Set options.resizeDelay to false if using fixed-width textarea elements.
			// Uses a timeout and width check to reduce the amount of times adjust needs to be called after window resize.

			if (options.resizeDelay !== false) {
				$(window).on('resize.autosize', resize);
			}

			// Event for manual triggering if needed.
			// Should only be needed when the value of the textarea is changed through JavaScript rather than user input.
			$ta.on('autosize.resize', adjust);

			// Event for manual triggering that also forces the styles to update as well.
			// Should only be needed if one of typography styles of the textarea change, and the textarea is already the target of the adjust method.
			$ta.on('autosize.resizeIncludeStyle', function() {
				mirrored = null;
				adjust();
			});

			$ta.on('autosize.destroy', function(){
				mirrored = null;
				clearTimeout(timeout);
				$(window).off('resize', resize);
				$ta
					.off('autosize')
					.off('.autosize')
					.css(originalStyles)
					.removeData('autosize');
			});

			// Call adjust in case the textarea already contains text.
			adjust();
		});
	};
}(jQuery || $)); // jQuery or jQuery-like library, such as Zepto
;
(function() {


}).call(this);
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

/*jslint unparam: true, nomen: true */
/*global define, window, document */


(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery'], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    var counter = 0,
        names = [
            'accepts',
            'cache',
            'contents',
            'contentType',
            'crossDomain',
            'data',
            'dataType',
            'headers',
            'ifModified',
            'mimeType',
            'password',
            'processData',
            'timeout',
            'traditional',
            'type',
            'url',
            'username'
        ],
        convert = function (p) {
            return p;
        };

    $.ajaxSetup({
        converters: {
            'postmessage text': convert,
            'postmessage json': convert,
            'postmessage html': convert
        }
    });

    $.ajaxTransport('postmessage', function (options) {
        if (options.postMessage && window.postMessage) {
            var iframe,
                loc = $('<a>').prop('href', options.postMessage)[0],
                target = loc.protocol + '//' + loc.host,
                xhrUpload = options.xhr().upload;
            return {
                send: function (_, completeCallback) {
                    counter += 1;
                    var message = {
                            id: 'postmessage-transport-' + counter
                        },
                        eventName = 'message.' + message.id;
                    iframe = $(
                        '<iframe style="display:none;" src="' +
                            options.postMessage + '" name="' +
                            message.id + '"></iframe>'
                    ).bind('load', function () {
                        $.each(names, function (i, name) {
                            message[name] = options[name];
                        });
                        message.dataType = message.dataType.replace('postmessage ', '');
                        $(window).bind(eventName, function (e) {
                            e = e.originalEvent;
                            var data = e.data,
                                ev;
                            if (e.origin === target && data.id === message.id) {
                                if (data.type === 'progress') {
                                    ev = document.createEvent('Event');
                                    ev.initEvent(data.type, false, true);
                                    $.extend(ev, data);
                                    xhrUpload.dispatchEvent(ev);
                                } else {
                                    completeCallback(
                                        data.status,
                                        data.statusText,
                                        {postmessage: data.result},
                                        data.headers
                                    );
                                    iframe.remove();
                                    $(window).unbind(eventName);
                                }
                            }
                        });
                        iframe[0].contentWindow.postMessage(
                            message,
                            target
                        );
                    }).appendTo(document.body);
                },
                abort: function () {
                    if (iframe) {
                        iframe.remove();
                    }
                }
            };
        }
    });

}));
/*
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

/*jslint unparam: true */
/*global define, window, XDomainRequest */


(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery'], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';
    if (window.XDomainRequest && !$.support.cors) {
        $.ajaxTransport(function (s) {
            if (s.crossDomain && s.async) {
                if (s.timeout) {
                    s.xdrTimeout = s.timeout;
                    delete s.timeout;
                }
                var xdr;
                return {
                    send: function (headers, completeCallback) {
                        var addParamChar = /\?/.test(s.url) ? '&' : '?';
                        function callback(status, statusText, responses, responseHeaders) {
                            xdr.onload = xdr.onerror = xdr.ontimeout = $.noop;
                            xdr = null;
                            completeCallback(status, statusText, responses, responseHeaders);
                        }
                        xdr = new XDomainRequest();
                        // XDomainRequest only supports GET and POST:
                        if (s.type === 'DELETE') {
                            s.url = s.url + addParamChar + '_method=DELETE';
                            s.type = 'POST';
                        } else if (s.type === 'PUT') {
                            s.url = s.url + addParamChar + '_method=PUT';
                            s.type = 'POST';
                        } else if (s.type === 'PATCH') {
                            s.url = s.url + addParamChar + '_method=PATCH';
                            s.type = 'POST';
                        }
                        xdr.open(s.type, s.url);
                        xdr.onload = function () {
                            callback(
                                200,
                                'OK',
                                {text: xdr.responseText},
                                'Content-Type: ' + xdr.contentType
                            );
                        };
                        xdr.onerror = function () {
                            callback(404, 'Not Found');
                        };
                        if (s.xdrTimeout) {
                            xdr.ontimeout = function () {
                                callback(0, 'timeout');
                            };
                            xdr.timeout = s.xdrTimeout;
                        }
                        xdr.send((s.hasContent && s.data) || null);
                    },
                    abort: function () {
                        if (xdr) {
                            xdr.onerror = $.noop();
                            xdr.abort();
                        }
                    }
                };
            }
        });
    }
}));
/*
 * jQuery File Upload Plugin 5.37.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, document, location, File, Blob, FormData */


(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'jquery.ui.widget'
        ], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    // Detect file input support, based on
    // http://viljamis.com/blog/2012/file-upload-support-on-mobile/
    $.support.fileInput = !(new RegExp(
        // Handle devices which give false positives for the feature detection:
        '(Android (1\\.[0156]|2\\.[01]))' +
            '|(Windows Phone (OS 7|8\\.0))|(XBLWP)|(ZuneWP)|(WPDesktop)' +
            '|(w(eb)?OSBrowser)|(webOS)' +
            '|(Kindle/(1\\.0|2\\.[05]|3\\.0))'
    ).test(window.navigator.userAgent) ||
        // Feature detection for all other devices:
        $('<input type="file">').prop('disabled'));

    // The FileReader API is not actually used, but works as feature detection,
    // as some Safari versions (5?) support XHR file uploads via the FormData API,
    // but not non-multipart XHR file uploads.
    // window.XMLHttpRequestUpload is not available on IE10, so we check for
    // window.ProgressEvent instead to detect XHR2 file upload capability:
    $.support.xhrFileUpload = !!(window.ProgressEvent && window.FileReader);
    $.support.xhrFormDataFileUpload = !!window.FormData;

    // Detect support for Blob slicing (required for chunked uploads):
    $.support.blobSlice = window.Blob && (Blob.prototype.slice ||
        Blob.prototype.webkitSlice || Blob.prototype.mozSlice);

    // The fileupload widget listens for change events on file input fields defined
    // via fileInput setting and paste or drop events of the given dropZone.
    // In addition to the default jQuery Widget methods, the fileupload widget
    // exposes the "add" and "send" methods, to add or directly send files using
    // the fileupload API.
    // By default, files added via file input selection, paste, drag & drop or
    // "add" method are uploaded immediately, but it is possible to override
    // the "add" callback option to queue file uploads.
    $.widget('blueimp.fileupload', {

        options: {
            // The drop target element(s), by the default the complete document.
            // Set to null to disable drag & drop support:
            dropZone: $(document),
            // The paste target element(s), by the default the complete document.
            // Set to null to disable paste support:
            pasteZone: $(document),
            // The file input field(s), that are listened to for change events.
            // If undefined, it is set to the file input fields inside
            // of the widget element on plugin initialization.
            // Set to null to disable the change listener.
            fileInput: undefined,
            // By default, the file input field is replaced with a clone after
            // each input field change event. This is required for iframe transport
            // queues and allows change events to be fired for the same file
            // selection, but can be disabled by setting the following option to false:
            replaceFileInput: true,
            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty,
            // can be a string or an array of strings:
            paramName: undefined,
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            // To limit the number of files uploaded with one XHR request,
            // set the following option to an integer greater than 0:
            limitMultiFileUploads: undefined,
            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            // To limit the number of concurrent uploads,
            // set the following option to an integer greater than 0:
            limitConcurrentUploads: undefined,
            // Set the following option to true to force iframe transport uploads:
            forceIframeTransport: false,
            // Set the following option to the location of a redirect url on the
            // origin server, for cross-domain iframe transport uploads:
            redirect: undefined,
            // The parameter name for the redirect url, sent as part of the form
            // data and set to 'redirect' if this option is empty:
            redirectParamName: undefined,
            // Set the following option to the location of a postMessage window,
            // to enable postMessage transport uploads:
            postMessage: undefined,
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
            // Interval in milliseconds to calculate and trigger progress events:
            progressInterval: 100,
            // Interval in milliseconds to calculate progress bitrate:
            bitrateInterval: 500,
            // By default, uploads are started automatically when adding files:
            autoUpload: true,

            // Error and info messages:
            messages: {
                uploadedBytes: 'Uploaded bytes exceed file size'
            },

            // Translation function, gets the message key to be translated
            // and an object with context specific data as arguments:
            i18n: function (message, context) {
                message = this.messages[message] || message.toString();
                if (context) {
                    $.each(context, function (key, value) {
                        message = message.replace('{' + key + '}', value);
                    });
                }
                return message;
            },

            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function (form) {
                return form.serializeArray();
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop, paste or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uploads, else
            // once for each file selection.
            //
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows you to override plugin options as well as define ajax settings.
            //
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            //
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function (e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                if (data.autoUpload || (data.autoUpload !== false &&
                        $(this).fileupload('option', 'autoUpload'))) {
                    data.process().done(function () {
                        data.submit();
                    });
                }
            },

            // Other callbacks:

            // Callback for the submit event of each file upload:
            // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);

            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);

            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);

            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);

            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);

            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);

            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);

            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);

            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);

            // Callback for change events of the fileInput(s):
            // change: function (e, data) {}, // .bind('fileuploadchange', func);

            // Callback for paste events to the pasteZone(s):
            // paste: function (e, data) {}, // .bind('fileuploadpaste', func);

            // Callback for drop events of the dropZone(s):
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);

            // Callback for dragover events of the dropZone(s):
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);

            // Callback for the start of each chunk upload request:
            // chunksend: function (e, data) {}, // .bind('fileuploadchunksend', func);

            // Callback for successful chunk uploads:
            // chunkdone: function (e, data) {}, // .bind('fileuploadchunkdone', func);

            // Callback for failed (abort or error) chunk uploads:
            // chunkfail: function (e, data) {}, // .bind('fileuploadchunkfail', func);

            // Callback for completed (success, abort or error) chunk upload requests:
            // chunkalways: function (e, data) {}, // .bind('fileuploadchunkalways', func);

            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false
        },

        // A list of options that require reinitializing event listeners and/or
        // special initialization code:
        _specialOptions: [
            'fileInput',
            'dropZone',
            'pasteZone',
            'multipart',
            'forceIframeTransport'
        ],

        _blobSlice: $.support.blobSlice && function () {
            var slice = this.slice || this.webkitSlice || this.mozSlice;
            return slice.apply(this, arguments);
        },

        _BitrateTimer: function () {
            this.timestamp = ((Date.now) ? Date.now() : (new Date()).getTime());
            this.loaded = 0;
            this.bitrate = 0;
            this.getBitrate = function (now, loaded, interval) {
                var timeDiff = now - this.timestamp;
                if (!this.bitrate || !interval || timeDiff > interval) {
                    this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                    this.loaded = loaded;
                    this.timestamp = now;
                }
                return this.bitrate;
            };
        },

        _isXHRUpload: function (options) {
            return !options.forceIframeTransport &&
                ((!options.multipart && $.support.xhrFileUpload) ||
                $.support.xhrFormDataFileUpload);
        },

        _getFormData: function (options) {
            var formData;
            if (typeof options.formData === 'function') {
                return options.formData(options.form);
            }
            if ($.isArray(options.formData)) {
                return options.formData;
            }
            if ($.type(options.formData) === 'object') {
                formData = [];
                $.each(options.formData, function (name, value) {
                    formData.push({name: name, value: value});
                });
                return formData;
            }
            return [];
        },

        _getTotal: function (files) {
            var total = 0;
            $.each(files, function (index, file) {
                total += file.size || 1;
            });
            return total;
        },

        _initProgressObject: function (obj) {
            var progress = {
                loaded: 0,
                total: 0,
                bitrate: 0
            };
            if (obj._progress) {
                $.extend(obj._progress, progress);
            } else {
                obj._progress = progress;
            }
        },

        _initResponseObject: function (obj) {
            var prop;
            if (obj._response) {
                for (prop in obj._response) {
                    if (obj._response.hasOwnProperty(prop)) {
                        delete obj._response[prop];
                    }
                }
            } else {
                obj._response = {};
            }
        },

        _onProgress: function (e, data) {
            if (e.lengthComputable) {
                var now = ((Date.now) ? Date.now() : (new Date()).getTime()),
                    loaded;
                if (data._time && data.progressInterval &&
                        (now - data._time < data.progressInterval) &&
                        e.loaded !== e.total) {
                    return;
                }
                data._time = now;
                loaded = Math.floor(
                    e.loaded / e.total * (data.chunkSize || data._progress.total)
                ) + (data.uploadedBytes || 0);
                // Add the difference from the previously loaded state
                // to the global loaded counter:
                this._progress.loaded += (loaded - data._progress.loaded);
                this._progress.bitrate = this._bitrateTimer.getBitrate(
                    now,
                    this._progress.loaded,
                    data.bitrateInterval
                );
                data._progress.loaded = data.loaded = loaded;
                data._progress.bitrate = data.bitrate = data._bitrateTimer.getBitrate(
                    now,
                    loaded,
                    data.bitrateInterval
                );
                // Trigger a custom progress event with a total data property set
                // to the file size(s) of the current upload and a loaded data
                // property calculated accordingly:
                this._trigger(
                    'progress',
                    $.Event('progress', {delegatedEvent: e}),
                    data
                );
                // Trigger a global progress event for all current file uploads,
                // including ajax calls queued for sequential file uploads:
                this._trigger(
                    'progressall',
                    $.Event('progressall', {delegatedEvent: e}),
                    this._progress
                );
            }
        },

        _initProgressListener: function (options) {
            var that = this,
                xhr = options.xhr ? options.xhr() : $.ajaxSettings.xhr();
            // Accesss to the native XHR object is required to add event listeners
            // for the upload progress event:
            if (xhr.upload) {
                $(xhr.upload).bind('progress', function (e) {
                    var oe = e.originalEvent;
                    // Make sure the progress event properties get copied over:
                    e.lengthComputable = oe.lengthComputable;
                    e.loaded = oe.loaded;
                    e.total = oe.total;
                    that._onProgress(e, options);
                });
                options.xhr = function () {
                    return xhr;
                };
            }
        },

        _isInstanceOf: function (type, obj) {
            // Cross-frame instanceof check
            return Object.prototype.toString.call(obj) === '[object ' + type + ']';
        },

        _initXHRData: function (options) {
            var that = this,
                formData,
                file = options.files[0],
                // Ignore non-multipart setting if not supported:
                multipart = options.multipart || !$.support.xhrFileUpload,
                paramName = options.paramName[0];
            options.headers = $.extend({}, options.headers);
            if (options.contentRange) {
                options.headers['Content-Range'] = options.contentRange;
            }
            if (!multipart || options.blob || !this._isInstanceOf('File', file)) {
                options.headers['Content-Disposition'] = 'attachment; filename="' +
                    encodeURI(file.name) + '"';
            }
            if (!multipart) {
                options.contentType = file.type;
                options.data = options.blob || file;
            } else if ($.support.xhrFormDataFileUpload) {
                if (options.postMessage) {
                    // window.postMessage does not allow sending FormData
                    // objects, so we just add the File/Blob objects to
                    // the formData array and let the postMessage window
                    // create the FormData object out of this array:
                    formData = this._getFormData(options);
                    if (options.blob) {
                        formData.push({
                            name: paramName,
                            value: options.blob
                        });
                    } else {
                        $.each(options.files, function (index, file) {
                            formData.push({
                                name: options.paramName[index] || paramName,
                                value: file
                            });
                        });
                    }
                } else {
                    if (that._isInstanceOf('FormData', options.formData)) {
                        formData = options.formData;
                    } else {
                        formData = new FormData();
                        $.each(this._getFormData(options), function (index, field) {
                            formData.append(field.name, field.value);
                        });
                    }
                    if (options.blob) {
                        formData.append(paramName, options.blob, file.name);
                    } else {
                        $.each(options.files, function (index, file) {
                            // This check allows the tests to run with
                            // dummy objects:
                            if (that._isInstanceOf('File', file) ||
                                    that._isInstanceOf('Blob', file)) {
                                formData.append(
                                    options.paramName[index] || paramName,
                                    file,
                                    file.uploadName || file.name
                                );
                            }
                        });
                    }
                }
                options.data = formData;
            }
            // Blob reference is not needed anymore, free memory:
            options.blob = null;
        },

        _initIframeSettings: function (options) {
            var targetHost = $('<a></a>').prop('href', options.url).prop('host');
            // Setting the dataType to iframe enables the iframe transport:
            options.dataType = 'iframe ' + (options.dataType || '');
            // The iframe transport accepts a serialized array as form data:
            options.formData = this._getFormData(options);
            // Add redirect url to form data on cross-domain uploads:
            if (options.redirect && targetHost && targetHost !== location.host) {
                options.formData.push({
                    name: options.redirectParamName || 'redirect',
                    value: options.redirect
                });
            }
        },

        _initDataSettings: function (options) {
            if (this._isXHRUpload(options)) {
                if (!this._chunkedUpload(options, true)) {
                    if (!options.data) {
                        this._initXHRData(options);
                    }
                    this._initProgressListener(options);
                }
                if (options.postMessage) {
                    // Setting the dataType to postmessage enables the
                    // postMessage transport:
                    options.dataType = 'postmessage ' + (options.dataType || '');
                }
            } else {
                this._initIframeSettings(options);
            }
        },

        _getParamName: function (options) {
            var fileInput = $(options.fileInput),
                paramName = options.paramName;
            if (!paramName) {
                paramName = [];
                fileInput.each(function () {
                    var input = $(this),
                        name = input.prop('name') || 'files[]',
                        i = (input.prop('files') || [1]).length;
                    while (i) {
                        paramName.push(name);
                        i -= 1;
                    }
                });
                if (!paramName.length) {
                    paramName = [fileInput.prop('name') || 'files[]'];
                }
            } else if (!$.isArray(paramName)) {
                paramName = [paramName];
            }
            return paramName;
        },

        _initFormSettings: function (options) {
            // Retrieve missing options from the input field and the
            // associated form, if available:
            if (!options.form || !options.form.length) {
                options.form = $(options.fileInput.prop('form'));
                // If the given file input doesn't have an associated form,
                // use the default widget file input's form:
                if (!options.form.length) {
                    options.form = $(this.options.fileInput.prop('form'));
                }
            }
            options.paramName = this._getParamName(options);
            if (!options.url) {
                options.url = options.form.prop('action') || location.href;
            }
            // The HTTP request method must be "POST" or "PUT":
            options.type = (options.type ||
                ($.type(options.form.prop('method')) === 'string' &&
                    options.form.prop('method')) || ''
                ).toUpperCase();
            if (options.type !== 'POST' && options.type !== 'PUT' &&
                    options.type !== 'PATCH') {
                options.type = 'POST';
            }
            if (!options.formAcceptCharset) {
                options.formAcceptCharset = options.form.attr('accept-charset');
            }
        },

        _getAJAXSettings: function (data) {
            var options = $.extend({}, this.options, data);
            this._initFormSettings(options);
            this._initDataSettings(options);
            return options;
        },

        // jQuery 1.6 doesn't provide .state(),
        // while jQuery 1.8+ removed .isRejected() and .isResolved():
        _getDeferredState: function (deferred) {
            if (deferred.state) {
                return deferred.state();
            }
            if (deferred.isResolved()) {
                return 'resolved';
            }
            if (deferred.isRejected()) {
                return 'rejected';
            }
            return 'pending';
        },

        // Maps jqXHR callbacks to the equivalent
        // methods of the given Promise object:
        _enhancePromise: function (promise) {
            promise.success = promise.done;
            promise.error = promise.fail;
            promise.complete = promise.always;
            return promise;
        },

        // Creates and returns a Promise object enhanced with
        // the jqXHR methods abort, success, error and complete:
        _getXHRPromise: function (resolveOrReject, context, args) {
            var dfd = $.Deferred(),
                promise = dfd.promise();
            context = context || this.options.context || promise;
            if (resolveOrReject === true) {
                dfd.resolveWith(context, args);
            } else if (resolveOrReject === false) {
                dfd.rejectWith(context, args);
            }
            promise.abort = dfd.promise;
            return this._enhancePromise(promise);
        },

        // Adds convenience methods to the data callback argument:
        _addConvenienceMethods: function (e, data) {
            var that = this,
                getPromise = function (args) {
                    return $.Deferred().resolveWith(that, args).promise();
                };
            data.process = function (resolveFunc, rejectFunc) {
                if (resolveFunc || rejectFunc) {
                    data._processQueue = this._processQueue =
                        (this._processQueue || getPromise([this])).pipe(
                            function () {
                                if (data.errorThrown) {
                                    return $.Deferred()
                                        .rejectWith(that, [data]).promise();
                                }
                                return getPromise(arguments);
                            }
                        ).pipe(resolveFunc, rejectFunc);
                }
                return this._processQueue || getPromise([this]);
            };
            data.submit = function () {
                if (this.state() !== 'pending') {
                    data.jqXHR = this.jqXHR =
                        (that._trigger(
                            'submit',
                            $.Event('submit', {delegatedEvent: e}),
                            this
                        ) !== false) && that._onSend(e, this);
                }
                return this.jqXHR || that._getXHRPromise();
            };
            data.abort = function () {
                if (this.jqXHR) {
                    return this.jqXHR.abort();
                }
                this.errorThrown = 'abort';
                return that._getXHRPromise();
            };
            data.state = function () {
                if (this.jqXHR) {
                    return that._getDeferredState(this.jqXHR);
                }
                if (this._processQueue) {
                    return that._getDeferredState(this._processQueue);
                }
            };
            data.processing = function () {
                return !this.jqXHR && this._processQueue && that
                    ._getDeferredState(this._processQueue) === 'pending';
            };
            data.progress = function () {
                return this._progress;
            };
            data.response = function () {
                return this._response;
            };
        },

        // Parses the Range header from the server response
        // and returns the uploaded bytes:
        _getUploadedBytes: function (jqXHR) {
            var range = jqXHR.getResponseHeader('Range'),
                parts = range && range.split('-'),
                upperBytesPos = parts && parts.length > 1 &&
                    parseInt(parts[1], 10);
            return upperBytesPos && upperBytesPos + 1;
        },

        // Uploads a file in multiple, sequential requests
        // by splitting the file up in multiple blob chunks.
        // If the second parameter is true, only tests if the file
        // should be uploaded in chunks, but does not invoke any
        // upload requests:
        _chunkedUpload: function (options, testOnly) {
            options.uploadedBytes = options.uploadedBytes || 0;
            var that = this,
                file = options.files[0],
                fs = file.size,
                ub = options.uploadedBytes,
                mcs = options.maxChunkSize || fs,
                slice = this._blobSlice,
                dfd = $.Deferred(),
                promise = dfd.promise(),
                jqXHR,
                upload;
            if (!(this._isXHRUpload(options) && slice && (ub || mcs < fs)) ||
                    options.data) {
                return false;
            }
            if (testOnly) {
                return true;
            }
            if (ub >= fs) {
                file.error = options.i18n('uploadedBytes');
                return this._getXHRPromise(
                    false,
                    options.context,
                    [null, 'error', file.error]
                );
            }
            // The chunk upload method:
            upload = function () {
                // Clone the options object for each chunk upload:
                var o = $.extend({}, options),
                    currentLoaded = o._progress.loaded;
                o.blob = slice.call(
                    file,
                    ub,
                    ub + mcs,
                    file.type
                );
                // Store the current chunk size, as the blob itself
                // will be dereferenced after data processing:
                o.chunkSize = o.blob.size;
                // Expose the chunk bytes position range:
                o.contentRange = 'bytes ' + ub + '-' +
                    (ub + o.chunkSize - 1) + '/' + fs;
                // Process the upload data (the blob and potential form data):
                that._initXHRData(o);
                // Add progress listeners for this chunk upload:
                that._initProgressListener(o);
                jqXHR = ((that._trigger('chunksend', null, o) !== false && $.ajax(o)) ||
                        that._getXHRPromise(false, o.context))
                    .done(function (result, textStatus, jqXHR) {
                        ub = that._getUploadedBytes(jqXHR) ||
                            (ub + o.chunkSize);
                        // Create a progress event if no final progress event
                        // with loaded equaling total has been triggered
                        // for this chunk:
                        if (currentLoaded + o.chunkSize - o._progress.loaded) {
                            that._onProgress($.Event('progress', {
                                lengthComputable: true,
                                loaded: ub - o.uploadedBytes,
                                total: ub - o.uploadedBytes
                            }), o);
                        }
                        options.uploadedBytes = o.uploadedBytes = ub;
                        o.result = result;
                        o.textStatus = textStatus;
                        o.jqXHR = jqXHR;
                        that._trigger('chunkdone', null, o);
                        that._trigger('chunkalways', null, o);
                        if (ub < fs) {
                            // File upload not yet complete,
                            // continue with the next chunk:
                            upload();
                        } else {
                            dfd.resolveWith(
                                o.context,
                                [result, textStatus, jqXHR]
                            );
                        }
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        o.jqXHR = jqXHR;
                        o.textStatus = textStatus;
                        o.errorThrown = errorThrown;
                        that._trigger('chunkfail', null, o);
                        that._trigger('chunkalways', null, o);
                        dfd.rejectWith(
                            o.context,
                            [jqXHR, textStatus, errorThrown]
                        );
                    });
            };
            this._enhancePromise(promise);
            promise.abort = function () {
                return jqXHR.abort();
            };
            upload();
            return promise;
        },

        _beforeSend: function (e, data) {
            if (this._active === 0) {
                // the start callback is triggered when an upload starts
                // and no other uploads are currently running,
                // equivalent to the global ajaxStart event:
                this._trigger('start');
                // Set timer for global bitrate progress calculation:
                this._bitrateTimer = new this._BitrateTimer();
                // Reset the global progress values:
                this._progress.loaded = this._progress.total = 0;
                this._progress.bitrate = 0;
            }
            // Make sure the container objects for the .response() and
            // .progress() methods on the data object are available
            // and reset to their initial state:
            this._initResponseObject(data);
            this._initProgressObject(data);
            data._progress.loaded = data.loaded = data.uploadedBytes || 0;
            data._progress.total = data.total = this._getTotal(data.files) || 1;
            data._progress.bitrate = data.bitrate = 0;
            this._active += 1;
            // Initialize the global progress values:
            this._progress.loaded += data.loaded;
            this._progress.total += data.total;
        },

        _onDone: function (result, textStatus, jqXHR, options) {
            var total = options._progress.total,
                response = options._response;
            if (options._progress.loaded < total) {
                // Create a progress event if no final progress event
                // with loaded equaling total has been triggered:
                this._onProgress($.Event('progress', {
                    lengthComputable: true,
                    loaded: total,
                    total: total
                }), options);
            }
            response.result = options.result = result;
            response.textStatus = options.textStatus = textStatus;
            response.jqXHR = options.jqXHR = jqXHR;
            this._trigger('done', null, options);
        },

        _onFail: function (jqXHR, textStatus, errorThrown, options) {
            var response = options._response;
            if (options.recalculateProgress) {
                // Remove the failed (error or abort) file upload from
                // the global progress calculation:
                this._progress.loaded -= options._progress.loaded;
                this._progress.total -= options._progress.total;
            }
            response.jqXHR = options.jqXHR = jqXHR;
            response.textStatus = options.textStatus = textStatus;
            response.errorThrown = options.errorThrown = errorThrown;
            this._trigger('fail', null, options);
        },

        _onAlways: function (jqXHRorResult, textStatus, jqXHRorError, options) {
            // jqXHRorResult, textStatus and jqXHRorError are added to the
            // options object via done and fail callbacks
            this._trigger('always', null, options);
        },

        _onSend: function (e, data) {
            if (!data.submit) {
                this._addConvenienceMethods(e, data);
            }
            var that = this,
                jqXHR,
                aborted,
                slot,
                pipe,
                options = that._getAJAXSettings(data),
                send = function () {
                    that._sending += 1;
                    // Set timer for bitrate progress calculation:
                    options._bitrateTimer = new that._BitrateTimer();
                    jqXHR = jqXHR || (
                        ((aborted || that._trigger(
                            'send',
                            $.Event('send', {delegatedEvent: e}),
                            options
                        ) === false) &&
                        that._getXHRPromise(false, options.context, aborted)) ||
                        that._chunkedUpload(options) || $.ajax(options)
                    ).done(function (result, textStatus, jqXHR) {
                        that._onDone(result, textStatus, jqXHR, options);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        that._onFail(jqXHR, textStatus, errorThrown, options);
                    }).always(function (jqXHRorResult, textStatus, jqXHRorError) {
                        that._onAlways(
                            jqXHRorResult,
                            textStatus,
                            jqXHRorError,
                            options
                        );
                        that._sending -= 1;
                        that._active -= 1;
                        if (options.limitConcurrentUploads &&
                                options.limitConcurrentUploads > that._sending) {
                            // Start the next queued upload,
                            // that has not been aborted:
                            var nextSlot = that._slots.shift();
                            while (nextSlot) {
                                if (that._getDeferredState(nextSlot) === 'pending') {
                                    nextSlot.resolve();
                                    break;
                                }
                                nextSlot = that._slots.shift();
                            }
                        }
                        if (that._active === 0) {
                            // The stop callback is triggered when all uploads have
                            // been completed, equivalent to the global ajaxStop event:
                            that._trigger('stop');
                        }
                    });
                    return jqXHR;
                };
            this._beforeSend(e, options);
            if (this.options.sequentialUploads ||
                    (this.options.limitConcurrentUploads &&
                    this.options.limitConcurrentUploads <= this._sending)) {
                if (this.options.limitConcurrentUploads > 1) {
                    slot = $.Deferred();
                    this._slots.push(slot);
                    pipe = slot.pipe(send);
                } else {
                    this._sequence = this._sequence.pipe(send, send);
                    pipe = this._sequence;
                }
                // Return the piped Promise object, enhanced with an abort method,
                // which is delegated to the jqXHR object of the current upload,
                // and jqXHR callbacks mapped to the equivalent Promise methods:
                pipe.abort = function () {
                    aborted = [undefined, 'abort', 'abort'];
                    if (!jqXHR) {
                        if (slot) {
                            slot.rejectWith(options.context, aborted);
                        }
                        return send();
                    }
                    return jqXHR.abort();
                };
                return this._enhancePromise(pipe);
            }
            return send();
        },

        _onAdd: function (e, data) {
            var that = this,
                result = true,
                options = $.extend({}, this.options, data),
                limit = options.limitMultiFileUploads,
                paramName = this._getParamName(options),
                paramNameSet,
                paramNameSlice,
                fileSet,
                i;
            if (!(options.singleFileUploads || limit) ||
                    !this._isXHRUpload(options)) {
                fileSet = [data.files];
                paramNameSet = [paramName];
            } else if (!options.singleFileUploads && limit) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < data.files.length; i += limit) {
                    fileSet.push(data.files.slice(i, i + limit));
                    paramNameSlice = paramName.slice(i, i + limit);
                    if (!paramNameSlice.length) {
                        paramNameSlice = paramName;
                    }
                    paramNameSet.push(paramNameSlice);
                }
            } else {
                paramNameSet = paramName;
            }
            data.originalFiles = data.files;
            $.each(fileSet || data.files, function (index, element) {
                var newData = $.extend({}, data);
                newData.files = fileSet ? element : [element];
                newData.paramName = paramNameSet[index];
                that._initResponseObject(newData);
                that._initProgressObject(newData);
                that._addConvenienceMethods(e, newData);
                result = that._trigger(
                    'add',
                    $.Event('add', {delegatedEvent: e}),
                    newData
                );
                return result;
            });
            return result;
        },

        _replaceFileInput: function (input) {
            var inputClone = input.clone(true);
            $('<form></form>').append(inputClone)[0].reset();
            // Detaching allows to insert the fileInput on another form
            // without loosing the file input value:
            input.after(inputClone).detach();
            // Avoid memory leaks with the detached file input:
            $.cleanData(input.unbind('remove'));
            // Replace the original file input element in the fileInput
            // elements set with the clone, which has been copied including
            // event handlers:
            this.options.fileInput = this.options.fileInput.map(function (i, el) {
                if (el === input[0]) {
                    return inputClone[0];
                }
                return el;
            });
            // If the widget has been initialized on the file input itself,
            // override this.element with the file input clone:
            if (input[0] === this.element[0]) {
                this.element = inputClone;
            }
        },

        _handleFileTreeEntry: function (entry, path) {
            var that = this,
                dfd = $.Deferred(),
                errorHandler = function (e) {
                    if (e && !e.entry) {
                        e.entry = entry;
                    }
                    // Since $.when returns immediately if one
                    // Deferred is rejected, we use resolve instead.
                    // This allows valid files and invalid items
                    // to be returned together in one set:
                    dfd.resolve([e]);
                },
                dirReader;
            path = path || '';
            if (entry.isFile) {
                if (entry._file) {
                    // Workaround for Chrome bug #149735
                    entry._file.relativePath = path;
                    dfd.resolve(entry._file);
                } else {
                    entry.file(function (file) {
                        file.relativePath = path;
                        dfd.resolve(file);
                    }, errorHandler);
                }
            } else if (entry.isDirectory) {
                dirReader = entry.createReader();
                dirReader.readEntries(function (entries) {
                    that._handleFileTreeEntries(
                        entries,
                        path + entry.name + '/'
                    ).done(function (files) {
                        dfd.resolve(files);
                    }).fail(errorHandler);
                }, errorHandler);
            } else {
                // Return an empy list for file system items
                // other than files or directories:
                dfd.resolve([]);
            }
            return dfd.promise();
        },

        _handleFileTreeEntries: function (entries, path) {
            var that = this;
            return $.when.apply(
                $,
                $.map(entries, function (entry) {
                    return that._handleFileTreeEntry(entry, path);
                })
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },

        _getDroppedFiles: function (dataTransfer) {
            dataTransfer = dataTransfer || {};
            var items = dataTransfer.items;
            if (items && items.length && (items[0].webkitGetAsEntry ||
                    items[0].getAsEntry)) {
                return this._handleFileTreeEntries(
                    $.map(items, function (item) {
                        var entry;
                        if (item.webkitGetAsEntry) {
                            entry = item.webkitGetAsEntry();
                            if (entry) {
                                // Workaround for Chrome bug #149735:
                                entry._file = item.getAsFile();
                            }
                            return entry;
                        }
                        return item.getAsEntry();
                    })
                );
            }
            return $.Deferred().resolve(
                $.makeArray(dataTransfer.files)
            ).promise();
        },

        _getSingleFileInputFiles: function (fileInput) {
            fileInput = $(fileInput);
            var entries = fileInput.prop('webkitEntries') ||
                    fileInput.prop('entries'),
                files,
                value;
            if (entries && entries.length) {
                return this._handleFileTreeEntries(entries);
            }
            files = $.makeArray(fileInput.prop('files'));
            if (!files.length) {
                value = fileInput.prop('value');
                if (!value) {
                    return $.Deferred().resolve([]).promise();
                }
                // If the files property is not available, the browser does not
                // support the File API and we add a pseudo File object with
                // the input value as name with path information removed:
                files = [{name: value.replace(/^.*\\/, '')}];
            } else if (files[0].name === undefined && files[0].fileName) {
                // File normalization for Safari 4 and Firefox 3:
                $.each(files, function (index, file) {
                    file.name = file.fileName;
                    file.size = file.fileSize;
                });
            }
            return $.Deferred().resolve(files).promise();
        },

        _getFileInputFiles: function (fileInput) {
            if (!(fileInput instanceof $) || fileInput.length === 1) {
                return this._getSingleFileInputFiles(fileInput);
            }
            return $.when.apply(
                $,
                $.map(fileInput, this._getSingleFileInputFiles)
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },

        _onChange: function (e) {
            var that = this,
                data = {
                    fileInput: $(e.target),
                    form: $(e.target.form)
                };
            this._getFileInputFiles(data.fileInput).always(function (files) {
                data.files = files;
                if (that.options.replaceFileInput) {
                    that._replaceFileInput(data.fileInput);
                }
                if (that._trigger(
                        'change',
                        $.Event('change', {delegatedEvent: e}),
                        data
                    ) !== false) {
                    that._onAdd(e, data);
                }
            });
        },

        _onPaste: function (e) {
            var items = e.originalEvent && e.originalEvent.clipboardData &&
                    e.originalEvent.clipboardData.items,
                data = {files: []};
            if (items && items.length) {
                $.each(items, function (index, item) {
                    var file = item.getAsFile && item.getAsFile();
                    if (file) {
                        data.files.push(file);
                    }
                });
                if (this._trigger(
                        'paste',
                        $.Event('paste', {delegatedEvent: e}),
                        data
                    ) !== false) {
                    this._onAdd(e, data);
                }
            }
        },

        _onDrop: function (e) {
            e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
            var that = this,
                dataTransfer = e.dataTransfer,
                data = {};
            if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {
                e.preventDefault();
                this._getDroppedFiles(dataTransfer).always(function (files) {
                    data.files = files;
                    if (that._trigger(
                            'drop',
                            $.Event('drop', {delegatedEvent: e}),
                            data
                        ) !== false) {
                        that._onAdd(e, data);
                    }
                });
            }
        },

        _onDragOver: function (e) {
            e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
            var dataTransfer = e.dataTransfer;
            if (dataTransfer && $.inArray('Files', dataTransfer.types) !== -1 &&
                    this._trigger(
                        'dragover',
                        $.Event('dragover', {delegatedEvent: e})
                    ) !== false) {
                e.preventDefault();
                dataTransfer.dropEffect = 'copy';
            }
        },

        _initEventHandlers: function () {
            if (this._isXHRUpload(this.options)) {
                this._on(this.options.dropZone, {
                    dragover: this._onDragOver,
                    drop: this._onDrop
                });
                this._on(this.options.pasteZone, {
                    paste: this._onPaste
                });
            }
            if ($.support.fileInput) {
                this._on(this.options.fileInput, {
                    change: this._onChange
                });
            }
        },

        _destroyEventHandlers: function () {
            this._off(this.options.dropZone, 'dragover drop');
            this._off(this.options.pasteZone, 'paste');
            this._off(this.options.fileInput, 'change');
        },

        _setOption: function (key, value) {
            var reinit = $.inArray(key, this._specialOptions) !== -1;
            if (reinit) {
                this._destroyEventHandlers();
            }
            this._super(key, value);
            if (reinit) {
                this._initSpecialOptions();
                this._initEventHandlers();
            }
        },

        _initSpecialOptions: function () {
            var options = this.options;
            if (options.fileInput === undefined) {
                options.fileInput = this.element.is('input[type="file"]') ?
                        this.element : this.element.find('input[type="file"]');
            } else if (!(options.fileInput instanceof $)) {
                options.fileInput = $(options.fileInput);
            }
            if (!(options.dropZone instanceof $)) {
                options.dropZone = $(options.dropZone);
            }
            if (!(options.pasteZone instanceof $)) {
                options.pasteZone = $(options.pasteZone);
            }
        },

        _getRegExp: function (str) {
            var parts = str.split('/'),
                modifiers = parts.pop();
            parts.shift();
            return new RegExp(parts.join('/'), modifiers);
        },

        _isRegExpOption: function (key, value) {
            return key !== 'url' && $.type(value) === 'string' &&
                /^\/.*\/[igm]{0,3}$/.test(value);
        },

        _initDataAttributes: function () {
            var that = this,
                options = this.options;
            // Initialize options set via HTML5 data-attributes:
            $.each(
                $(this.element[0].cloneNode(false)).data(),
                function (key, value) {
                    if (that._isRegExpOption(key, value)) {
                        value = that._getRegExp(value);
                    }
                    options[key] = value;
                }
            );
        },

        _create: function () {
            this._initDataAttributes();
            this._initSpecialOptions();
            this._slots = [];
            this._sequence = this._getXHRPromise(true);
            this._sending = this._active = 0;
            this._initProgressObject(this);
            this._initEventHandlers();
        },

        // This method is exposed to the widget API and allows to query
        // the number of active uploads:
        active: function () {
            return this._active;
        },

        // This method is exposed to the widget API and allows to query
        // the widget upload progress.
        // It returns an object with loaded, total and bitrate properties
        // for the running uploads:
        progress: function () {
            return this._progress;
        },

        // This method is exposed to the widget API and allows adding files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files property and can contain additional options:
        // .fileupload('add', {files: filesList});
        add: function (data) {
            var that = this;
            if (!data || this.options.disabled) {
                return;
            }
            if (data.fileInput && !data.files) {
                this._getFileInputFiles(data.fileInput).always(function (files) {
                    data.files = files;
                    that._onAdd(null, data);
                });
            } else {
                data.files = $.makeArray(data.files);
                this._onAdd(null, data);
            }
        },

        // This method is exposed to the widget API and allows sending files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files or fileInput property and can contain additional options:
        // .fileupload('send', {files: filesList});
        // The method returns a Promise object for the file upload call.
        send: function (data) {
            if (data && !this.options.disabled) {
                if (data.fileInput && !data.files) {
                    var that = this,
                        dfd = $.Deferred(),
                        promise = dfd.promise(),
                        jqXHR,
                        aborted;
                    promise.abort = function () {
                        aborted = true;
                        if (jqXHR) {
                            return jqXHR.abort();
                        }
                        dfd.reject(null, 'abort', 'abort');
                        return promise;
                    };
                    this._getFileInputFiles(data.fileInput).always(
                        function (files) {
                            if (aborted) {
                                return;
                            }
                            if (!files.length) {
                                dfd.reject();
                                return;
                            }
                            data.files = files;
                            jqXHR = that._onSend(null, data).then(
                                function (result, textStatus, jqXHR) {
                                    dfd.resolve(result, textStatus, jqXHR);
                                },
                                function (jqXHR, textStatus, errorThrown) {
                                    dfd.reject(jqXHR, textStatus, errorThrown);
                                }
                            );
                        }
                    );
                    return this._enhancePromise(promise);
                }
                data.files = $.makeArray(data.files);
                if (data.files.length) {
                    return this._onSend(null, data);
                }
            }
            return this._getXHRPromise(false, data && data.context);
        }

    });

}));
/*
 * jQuery File Upload Processing Plugin 1.3.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true */
/*global define, window */


(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            './jquery.fileupload'
        ], factory);
    } else {
        // Browser globals:
        factory(
            window.jQuery
        );
    }
}(function ($) {
    'use strict';

    var originalAdd = $.blueimp.fileupload.prototype.options.add;

    // The File Upload Processing plugin extends the fileupload widget
    // with file processing functionality:
    $.widget('blueimp.fileupload', $.blueimp.fileupload, {

        options: {
            // The list of processing actions:
            processQueue: [
                /*
                {
                    action: 'log',
                    type: 'debug'
                }
                */
            ],
            add: function (e, data) {
                var $this = $(this);
                data.process(function () {
                    return $this.fileupload('process', data);
                });
                originalAdd.call(this, e, data);
            }
        },

        processActions: {
            /*
            log: function (data, options) {
                console[options.type](
                    'Processing "' + data.files[data.index].name + '"'
                );
            }
            */
        },

        _processFile: function (data, originalData) {
            var that = this,
                dfd = $.Deferred().resolveWith(that, [data]),
                chain = dfd.promise();
            this._trigger('process', null, data);
            $.each(data.processQueue, function (i, settings) {
                var func = function (data) {
                    if (originalData.errorThrown) {
                        return $.Deferred()
                                .rejectWith(that, [originalData]).promise();
                    }
                    return that.processActions[settings.action].call(
                        that,
                        data,
                        settings
                    );
                };
                chain = chain.pipe(func, settings.always && func);
            });
            chain
                .done(function () {
                    that._trigger('processdone', null, data);
                    that._trigger('processalways', null, data);
                })
                .fail(function () {
                    that._trigger('processfail', null, data);
                    that._trigger('processalways', null, data);
                });
            return chain;
        },

        // Replaces the settings of each processQueue item that
        // are strings starting with an "@", using the remaining
        // substring as key for the option map,
        // e.g. "@autoUpload" is replaced with options.autoUpload:
        _transformProcessQueue: function (options) {
            var processQueue = [];
            $.each(options.processQueue, function () {
                var settings = {},
                    action = this.action,
                    prefix = this.prefix === true ? action : this.prefix;
                $.each(this, function (key, value) {
                    if ($.type(value) === 'string' &&
                            value.charAt(0) === '@') {
                        settings[key] = options[
                            value.slice(1) || (prefix ? prefix +
                                key.charAt(0).toUpperCase() + key.slice(1) : key)
                        ];
                    } else {
                        settings[key] = value;
                    }

                });
                processQueue.push(settings);
            });
            options.processQueue = processQueue;
        },

        // Returns the number of files currently in the processsing queue:
        processing: function () {
            return this._processing;
        },

        // Processes the files given as files property of the data parameter,
        // returns a Promise object that allows to bind callbacks:
        process: function (data) {
            var that = this,
                options = $.extend({}, this.options, data);
            if (options.processQueue && options.processQueue.length) {
                this._transformProcessQueue(options);
                if (this._processing === 0) {
                    this._trigger('processstart');
                }
                $.each(data.files, function (index) {
                    var opts = index ? $.extend({}, options) : options,
                        func = function () {
                            if (data.errorThrown) {
                                return $.Deferred()
                                        .rejectWith(that, [data]).promise();
                            }
                            return that._processFile(opts, data);
                        };
                    opts.index = index;
                    that._processing += 1;
                    that._processingQueue = that._processingQueue.pipe(func, func)
                        .always(function () {
                            that._processing -= 1;
                            if (that._processing === 0) {
                                that._trigger('processstop');
                            }
                        });
                });
            }
            return this._processingQueue;
        },

        _create: function () {
            this._super();
            this._processing = 0;
            this._processingQueue = $.Deferred().resolveWith(this)
                .promise();
        }

    });

}));
(function() {


}).call(this);

/*

  Autocomplete

  This script provides functionalities for autocompleting things 
  for Item editing (flexible fields)
 */

(function() {
  var AutoComplete,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  jQuery(function() {
    return $(document).on("focus", "input[data-type='autocomplete']", function(event) {
      var el;
      if (!$(this).hasClass("ui-autocomplete-input")) {
        new AutoComplete($(this));
      }
      el = $(this);
      return (function(el) {
        var search;
        search = function() {
          if (el.val().length && el.is(":focus")) {
            return el.autocomplete("search");
          }
        };
        return setTimeout(search, 150);
      })(el);
    });
  });

  AutoComplete = (function() {
    function AutoComplete(input_field) {
      this.setExtendedValue = bind(this.setExtendedValue, this);
      this.onChange = bind(this.onChange, this);
      this.focus = bind(this.focus, this);
      this.select = bind(this.select, this);
      this.remote_source = bind(this.remote_source, this);
      this.setup = bind(this.setup, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      this.setup(input_field);
      this.delegateEvents();
    }

    AutoComplete.prototype.delegateEvents = function() {
      this.el.bind("blur", (function(_this) {
        return function(event) {
          if (_this.current_ajax != null) {
            return _this.current_ajax.abort();
          }
        };
      })(this));
      return this.el.bind("change", this.onChange);
    };

    AutoComplete.prototype.setup = function(input_field, source) {
      this.el = $(input_field);
      this.el.data("_autocomplete", this["this"]);
      this.data = this.el.data();
      this.el.autocomplete({
        source: source != null ? source : this.data.autocomplete_data != null ? this.data.autocomplete_data : this.data.url ? this.remote_source : void 0,
        select: this.select,
        focus: this.focus,
        appendTo: this.el.closest(".modal").length ? this.el.closest(".modal") : this.el.closest("form")
      });
      this.el.autocomplete("widget").addClass(this.data.autocomplete_class);
      if (this.data.autocomplete_search_on_focus === true) {
        this.el.bind("focus", (function(_this) {
          return function(event) {
            _this.el.autocomplete("option", "minLength", 0);
            _this.el.autocomplete("search", "");
            _this.el.autocomplete("widget").position({
              of: _this.el,
              my: "right top",
              at: "right bottom"
            });
            return window.setTimeout(function() {
              if (_this.el.is(":focus")) {
                return _this.el.select();
              }
            }, 100);
          };
        })(this));
      }
      if (this.data.autocomplete_element_tmpl != null) {
        return this.el.data("uiAutocomplete")._renderItem = (function(_this) {
          return function(ul, item) {
            return $(App.Render(_this.data.autocomplete_element_tmpl, item)).data("value", item).appendTo(ul);
          };
        })(this);
      }
    };

    AutoComplete.prototype.remote_source = function(request, response) {
      var data, ref;
      data = {
        format: "json"
      };
      data[(ref = this.data.autocomplete_search_attr) != null ? ref : "term"] = request.term;
      if (this.data.autocomplete_with != null) {
        data = $.extend(true, data, {
          "with": this.data.autocomplete_with
        });
      }
      this.el.autocomplete("widget").scrollTop(0);
      if (this.current_ajax != null) {
        this.current_ajax.abort();
      }
      return this.current_ajax = $.ajax({
        url: this.data.url,
        data: data,
        dataType: "json",
        success: (function(_this) {
          return function(data) {
            var entries, ref1;
            if ((ref1 = data.entries) != null ? ref1.length : void 0) {
              data = data.entries;
            }
            entries = $.map(data, function(element) {
              var l;
              element.label = _this.data.autocomplete_display_attribute != null ? (l = element[_this.data.autocomplete_display_attribute], _this.data.autocomplete_display_attribute_ext != null ? l = [l, element[_this.data.autocomplete_display_attribute_ext]].join(" ") : void 0, l) : element.label;
              if (_this.data.autocomplete_value_attribute != null) {
                element.value = element[_this.data.autocomplete_value_attribute];
              }
              return element;
            });
            if ((_this.data.autocomplete_search_only_on_focus != null) || (_this.data.autocomplete_search_only_once != null)) {
              _this.setup(_this.el, entries);
              _this.el.bind("blur", function() {
                return _this.setup(_this.el, _this.source);
              });
            }
            return response(entries);
          };
        })(this)
      });
    };

    AutoComplete.prototype.select = function(event, element) {
      var callback, el, labelValue, value;
      if (this.data.autocomplete_clear_input_value_on_select === true) {
        this.el.val("");
      } else {
        labelValue = element.item[this.data.autocomplete_display_attribute];
        if (element.item[this.data.autocomplete_display_attribute_ext] != null) {
          labelValue += " " + element.item[this.data.autocomplete_display_attribute_ext];
        }
        this.el.val(labelValue);
      }
      value = this.data.autocomplete_value_attribute != null ? element.item[this.data.autocomplete_value_attribute] : element.item.value;
      if (this.data.autocomplete_blur_on_select === true) {
        this.el.blur();
      }
      if (this.data.autocomplete_value_target != null) {
        this.el.prevAll("input[name='" + this.data.autocomplete_value_target + "']").val(value).change();
      }
      if (this.data.autocomplete_select_callback != null) {
        el = $(event.currentTarget);
        callback = eval(this.data.autocomplete_select_callback);
        if (callback != null) {
          callback(element, event);
        }
      }
      this.setExtendedValue();
      return false;
    };

    AutoComplete.prototype.focus = function(event, ui) {
      return false;
    };

    AutoComplete.prototype.onChange = function(e) {
      var target;
      target = $(e.currentTarget);
      this.setExtendedValue();
      return $("input[name='" + this.data.autocomplete_value_target + "']").val(null);
    };

    AutoComplete.prototype.setExtendedValue = function() {
      if (this.el.data("autocomplete_extensible")) {
        return this.el.prevAll("input[name='" + this.data.autocomplete_extended_key_target + "'][data-type='extended-value']").val(this.el.val());
      }
    };

    return AutoComplete;

  })();

  window.AutoComplete = AutoComplete;

}).call(this);

/*

  Datepicker

  This script provides functionalities for datepicker things 
  for Item editing (flexible fields)
 */

(function() {
  jQuery(function() {
    return $(document).on("focus", "input[data-type='datepicker']", function(event) {
      var $this, value_el;
      $this = $(this);
      if (!$this.hasClass("hasDatepicker")) {
        $this.datepicker();
        value_el = $this.prev("input[type=hidden]");
        if (value_el.val().length) {
          $this.val(moment(value_el.val()).format(i18n.date.L));
        }
        return $this.on("change", function() {
          var value;
          value = $this.val();
          if (!_.isEmpty(value)) {
            value = moment(value, i18n.date.L).format("YYYY-MM-DD");
          }
          return value_el.val(value);
        });
      }
    });
  });

}).call(this);

/*

  ManageBookingCalendar

  This script setups the jquery FullCalendar plugin and adds functionalities

  for booking processes, used for the manage section (managers)
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ManageBookingCalendar = (function(superClass) {
    extend(ManageBookingCalendar, superClass);

    function ManageBookingCalendar() {
      this.isClosedDay = bind(this.isClosedDay, this);
      this.getInventoryPool = bind(this.getInventoryPool, this);
      this.selectedPartitions = bind(this.selectedPartitions, this);
      this.setupPartitionSelector = bind(this.setupPartitionSelector, this);
      this.getHolidays = bind(this.getHolidays, this);
      this.setQuantityText = bind(this.setQuantityText, this);
      this.setDayElement = bind(this.setDayElement, this);
      this.getGroupIds = bind(this.getGroupIds, this);
      return ManageBookingCalendar.__super__.constructor.apply(this, arguments);
    }

    ManageBookingCalendar.prototype.setup = function(options) {
      this.partitionSelector_el = this.el.find("select#booking-calendar-partitions");
      if (options.startDateDisabled) {
        this.startDate_el.prop("disabled", true);
        this.startDate_el.val(moment().format("YYYY-MM-DD"));
      }
      this.reservations = options.reservations;
      this.models = options.models;
      return this.setupPartitionSelector();
    };

    ManageBookingCalendar.prototype.getGroupIds = function() {
      var value;
      value = this.partitionSelector_el.find("option:selected").data("value");
      if (value.constructor === Array) {
        return value.map((function(_this) {
          return function(v) {
            if (v.indexOf('[') > -1) {
              return v.replace('[', '').replace(']', '');
            } else {
              return v;
            }
          };
        })(this));
      } else if (typeof value === 'string') {
        if (value.indexOf('[') > -1) {
          return [value.replace('[', '').replace(']', '')];
        } else {
          return [value];
        }
      } else {
        return [value];
      }
    };

    ManageBookingCalendar.prototype.setDayElement = function(date, dayElement, holidays) {
      var availability, available, availableInTotal, availableQuantity, i, len, model, ref, requiredQuantity, totalQuantity;
      available = true;
      ref = this.models;
      for (i = 0, len = ref.length; i < len; i++) {
        model = ref[i];
        availability = model.availability().withoutLines(this.reservations, true);
        requiredQuantity = this.quantity_el.val().length ? parseInt(this.quantity_el.val()) : _.reduce(this.reservations, function(mem, l) {
          if (l.model_id === model.id) {
            return mem + l.quantity;
          } else {
            return mem;
          }
        }, 0);
        totalQuantity = availability.maxAvailableInTotal(date, date);
        availableQuantity = availability.maxAvailableForGroups(date, date, this.getGroupIds());
        console.log('date = ' + new Date(date).toString() + ' total = ' + totalQuantity + ' available = ' + availableQuantity + ' required = ' + requiredQuantity);
        console.log('group ids = ' + this.getGroupIds());
        available = availableQuantity >= requiredQuantity && available;
        availableInTotal = totalQuantity >= requiredQuantity && availableInTotal;
      }
      if (this.models.length > 1) {
        this.setQuantityText(dayElement, (available ? 1 : 0), (availableInTotal ? 1 : 0));
      } else {
        this.setQuantityText(dayElement, availableQuantity, totalQuantity);
      }
      this.setAvailability(dayElement, available);
      return this.setSelected(dayElement, date);
    };

    ManageBookingCalendar.prototype.setQuantityText = function(dayElement, availableQuantity, totalQuantity) {
      if (this.models.length > 1) {
        availableQuantity = availableQuantity <= 0 ? "x" : "✓";
        totalQuantity = totalQuantity <= 0 ? "x" : "✓";
      }
      dayElement.find(".fc-day-content > div").text(availableQuantity);
      if (totalQuantity != null) {
        if (dayElement.find(".fc-day-content .total_quantity").length) {
          return dayElement.find(".fc-day-content .total_quantity").text("/" + totalQuantity);
        } else {
          return dayElement.find(".fc-day-content").append("<span class='total_quantity'>/" + totalQuantity + "</span>");
        }
      }
    };

    ManageBookingCalendar.prototype.getHolidays = function() {
      return App.InventoryPool.current.holidays().all();
    };

    ManageBookingCalendar.prototype.setupPartitionSelector = function() {
      if (this.quantity_el.val().length) {
        if ((this.partitionSelector_el == null) || this.partitionSelector_el.find("option").length === 0) {
          return false;
        }
        this.partitionSelector_el.find("option:first").select();
        return this.partitionSelector_el.bind("change", (function(_this) {
          return function(e) {
            return _this.render();
          };
        })(this));
      } else {
        return this.partitionSelector_el.prop("disabled", true);
      }
    };

    ManageBookingCalendar.prototype.selectedPartitions = function() {
      if ((this.partitionSelector_el != null) && this.partitionSelector_el.find("option").length && this.partitionSelector_el.find("option:selected").val().length) {
        return JSON.parse(this.partitionSelector_el.find("option:selected").val());
      } else {
        return null;
      }
    };

    ManageBookingCalendar.prototype.getInventoryPool = function() {
      return App.InventoryPool.current;
    };

    ManageBookingCalendar.prototype.isClosedDay = function(date) {
      var ip;
      ip = this.getInventoryPool();
      return ManageBookingCalendar.__super__.isClosedDay.apply(this, arguments) || !ip.isVisitPossible(moment(date));
    };

    return ManageBookingCalendar;

  })(App.BookingCalendar);

}).call(this);
(function() {
  window.App.Modules.LineProblems = {
    anyProblems: function() {
      return !!this.getProblems().length;
    },
    getProblems: function() {
      var days, maxAvailableForUser, maxAvailableInTotal, problems, quantity, reservationsToExclude;
      problems = [];
      if (this.model_id != null) {
        reservationsToExclude = this.subreservations != null ? this.subreservations : [this];
        maxAvailableForUser = this.model().availability().withoutLines(reservationsToExclude).maxAvailableForGroups(this.start_date, this.end_date, this.user().groupIds);
        quantity = this.subreservations != null ? _.reduce(this.subreservations, (function(mem, l) {
          return mem + l.quantity;
        }), 0) : this.quantity;
      }
      if (moment(this.start_date).endOf("day").diff(moment().endOf("day"), "days") < 0 && _.include(["approved", "submitted"], this.status) || moment(this.end_date).endOf("day").diff(moment().endOf("day"), "days") < 0 && this.status === "signed") {
        days = _.include(["approved", "submitted"], this.status) ? Math.abs(moment(this.start_date).diff(moment().endOf("day"), "days")) : Math.abs(moment(this.end_date).diff(moment().endOf("day"), "days"));
        problems.push({
          type: "overdue",
          message: (_jed("Overdue")) + " " + (_jed("since")) + " " + days + " " + (_jed(days, "day"))
        });
      } else if ((maxAvailableForUser != null) && maxAvailableForUser < quantity) {
        maxAvailableInTotal = this.model().availability().withoutLines(reservationsToExclude, true).maxAvailableInTotal(this.start_date, this.end_date);
        problems.push({
          type: "availability",
          message: (_jed("Not available")) + " " + maxAvailableForUser + "(" + maxAvailableInTotal + ")/" + (this.model().availability().total_rentable)
        });
      }
      if (this.item()) {
        if (!this.item().is_borrowable) {
          problems.push({
            type: "unborrowable",
            message: _jed("Item not borrowable")
          });
        }
        if (this.item().is_broken) {
          problems.push({
            type: "broken",
            message: _jed("Item is defective")
          });
        }
        if (this.item().is_incomplete) {
          problems.push({
            type: "incomplete",
            message: _jed("Item is incomplete")
          });
        }
      }
      return problems;
    }
  };

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.AccessRight = (function(superClass) {
    extend(AccessRight, superClass);

    function AccessRight() {
      return AccessRight.__super__.constructor.apply(this, arguments);
    }

    AccessRight.configure("AccessRight", "id", "role", "user_id", "inventory_pool_id", "suspended_until");

    AccessRight.belongsTo("users", "App.User", "user_id");

    AccessRight.extend(Spine.Model.Ajax);

    AccessRight.url = function() {
      if (App.InventoryPool.current != null) {
        return "/manage/" + App.InventoryPool.current.id + "/access_rights";
      } else {
        return "/admin/access_rights";
      }
    };

    AccessRight.rolesHierarchy = ["customer", "group_manager", "lending_manager", "inventory_manager"];

    AccessRight.prototype.name = function() {
      switch (this.role) {
        case "customer":
          return _jed("Customer");
        case "group_manager":
          return _jed("Group manager");
        case "lending_manager":
          return _jed("Lending manager");
        case "inventory_manager":
          return _jed("Inventory manager");
      }
    };

    AccessRight.atLeastRole = function(checkRole, atLeastRole) {
      if (checkRole !== "admin") {
        return _.indexOf(this.rolesHierarchy, checkRole) >= _.indexOf(this.rolesHierarchy, atLeastRole);
      }
    };

    return AccessRight;

  })(Spine.Model);

}).call(this);
(function() {
  window.App.Availability.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/availabilities";
    };
  })(this);

}).call(this);
(function() {
  window.App.Building.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/buildings";
    };
  })(this);

}).call(this);
(function() {
  window.App.Category.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/categories";
    };
  })(this);

}).call(this);
(function() {
  window.App.Contract.url = (function(_this) {
    return function() {
      return App.InventoryPool.url + "/" + App.InventoryPool.current.id + "/contracts";
    };
  })(this);

  window.App.Contract.create = function(data) {
    return $.post(App.InventoryPool.url + "/" + App.InventoryPool.current.id + "/contracts", data);
  };

}).call(this);

/*
  
  Field is needed to edit/insert data of an item to the system
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Field = (function(superClass) {
    extend(Field, superClass);

    Field.configure("Field", "id", "attribute", "default", "display_attr", "display_attr_ext", "forPackage", "extended_key", "extensible", "form_name", "group", "label", "permissions", "required", "search_attr", "search_path", "type", "value_attr", "item_value_label", "item_value_label_ext", "values", "visibility_dependency_field_id", "visibility_dependency_value", "exclude_from_submit", "values_dependency_field_id", "values_url", "values_label_method");

    Field.extend(Spine.Model.Ajax);

    Field.url = function() {
      return "/manage/" + App.InventoryPool.current.id + "/fields";
    };

    function Field() {
      this.getItemValueLabel = bind(this.getItemValueLabel, this);
      Field.__super__.constructor.apply(this, arguments);
    }

    Field.prototype.getLabel = function() {
      return _jed(this.label);
    };

    Field.prototype.isEditable = function(item) {
      var editable;
      editable = true;
      if ((this.permissions != null) && (item != null)) {
        if ((this.permissions.role != null) && !App.AccessRight.atLeastRole(App.User.current.role, this.permissions.role)) {
          editable = false;
        }
        if ((this.permissions.owner != null) && this.permissions.owner && (item.owner != null) && App.InventoryPool.current.id !== item.owner.id) {
          editable = false;
        }
      }
      return editable;
    };

    Field.prototype.getValue = function(item, attribute, defaultFallback) {
      var value;
      if (item != null) {
        value = attribute instanceof Array ? _.reduce(attribute, function(hash, attr) {
          if ((hash != null) && (hash[attr] != null)) {
            return hash[attr];
          } else {
            return null;
          }
        }, item) : item[attribute];
      }
      if (attribute === "retired") {
        value = !!value;
      }
      if (value != null) {
        if (this.currency != null) {
          value = accounting.formatMoney(value, {
            format: "%v"
          });
        }
        return value;
      } else if ((this["default"] != null) && defaultFallback) {
        return this["default"];
      } else {
        return null;
      }
    };

    Field.prototype.getItemValueLabel = function(item_value_label, item) {
      var item_value_label_ext, reduceHelper, result;
      if (item != null) {
        reduceHelper = function(valueLabel) {
          if (valueLabel instanceof Array) {
            return _.reduce(valueLabel, function(hash, attr) {
              if ((hash != null) && (hash[attr] != null)) {
                return hash[attr];
              } else {
                return null;
              }
            }, item);
          } else {
            return item[valueLabel];
          }
        };
        result = reduceHelper(item_value_label);
        if (item_value_label_ext = reduceHelper(this.item_value_label_ext)) {
          result = [result, item_value_label_ext].join(" ");
        }
        return result;
      }
    };

    Field.prototype.getFormName = function(attribute, formName, asArray) {
      if (attribute == null) {
        attribute = this.attribute;
      }
      if (formName == null) {
        formName = this.form_name;
      }
      if (asArray == null) {
        asArray = null;
      }
      if (formName != null) {
        return "item[" + formName + "]";
      } else if (attribute instanceof Array) {
        formName = _.reduce(attribute, function(name, attr) {
          return name + "[" + attr + "]";
        }, "item");
        if (asArray != null) {
          formName += "[]";
        }
        return formName;
      } else {
        return "item[" + attribute + "]";
      }
    };

    Field.prototype.getExtendedKeyFormName = function() {
      return this.getFormName(this.extended_key, this.form_name);
    };

    Field.prototype.children = function() {
      return _.filter(App.Field.all(), (function(_this) {
        return function(field) {
          return field.visibility_dependency_field_id === _this.id;
        };
      })(this));
    };

    Field.prototype.childrenWithValueDependency = function() {
      return _.filter(App.Field.all(), (function(_this) {
        return function(field) {
          return field.values_dependency_field_id === _this.id;
        };
      })(this));
    };

    Field.prototype.descendants = function() {
      var children;
      children = this.children();
      if (_.isEmpty(children)) {
        return children;
      } else {
        return _.union(children, _.flatten(_.map(children, function(field) {
          return field.descendants();
        })));
      }
    };

    Field.prototype.parent = function() {
      if (this.visibility_dependency_field_id != null) {
        return App.Field.find(this.visibility_dependency_field_id);
      }
    };

    Field.prototype.parentWithValueDependency = function() {
      if (this.values_dependency_field_id != null) {
        return App.Field.find(this.values_dependency_field_id);
      }
    };

    Field.prototype.getValueLabel = function(values, value) {
      if (value === void 0) {
        value = null;
      }
      value = _.find(values, function(v) {
        return String(v.value) === value || v.value === value;
      });
      if (value) {
        return value.label;
      } else {
        return "";
      }
    };

    Field.getValue = function(target) {
      var field;
      field = App.Field.find(target.data("id"));
      if (target.find("[data-value]").length) {
        return target.find("[data-value]").attr("data-value");
      } else {
        switch (field.type) {
          case "radio":
            return target.find("input:checked").val();
          case "date":
            return target.find("input[type=hidden]").val();
          case "autocomplete":
            return target.find("input[type=hidden]").val();
          case "autocomplete-search":
            return target.find("input[type=hidden]").val();
          case "text":
            return target.find("input[type=text]").val();
          case "textarea":
            return target.find("textarea").val();
          case "select":
            return target.find("option:selected").val();
        }
      }
    };

    Field.validate = function(form) {
      var i, len, ref, requiredField, valid, value;
      valid = true;
      form.find(".error").removeClass("error");
      ref = form.find("[data-required='true'][data-editable='true']:visible");
      for (i = 0, len = ref.length; i < len; i++) {
        requiredField = ref[i];
        value = App.Field.getValue($(requiredField));
        if ((value == null) || value.length === 0) {
          valid = false;
          $(requiredField).addClass("error");
        }
      }
      return valid;
    };

    Field.toggleChildren = function(target, form, options, forPackage) {
      var child, child_el, children, dep_value, element, field, i, len, results;
      field = App.Field.find(target.data("id"));
      form = $(form);
      if (field.children != null) {
        children = field.children();
      }
      if ((children != null) && children.length) {
        results = [];
        for (i = 0, len = children.length; i < len; i++) {
          child = children[i];
          dep_value = child.visibility_dependency_value;
          if ((App.Field.getValue(target) === dep_value || _.contains(dep_value, App.Field.getValue(target))) || (_.isUndefined(dep_value) && App.Field.isPresent(App.Field.find(child.visibility_dependency_field_id), form))) {
            if (!App.Field.isPresent(child, form)) {
              if ((forPackage && child.forPackage) || !forPackage) {
                target.after(App.Render("manage/views/items/field", {}, $.extend(options, {
                  field: child
                })));
                child_el = $("[data-type='field'][data-id='" + child.id + "']");
                if (child.type === "composite") {
                  new App.CompositeFieldController({
                    el: child_el,
                    data: options
                  });
                }
                if (child.children != null) {
                  children = child.children();
                }
                if ((children != null) && children.length) {
                  results.push(Field.toggleChildren(child_el, form, options, forPackage));
                } else {
                  results.push(void 0);
                }
              } else {
                results.push(void 0);
              }
            } else {
              results.push(void 0);
            }
          } else {
            results.push((function() {
              var j, len1, ref, results1;
              ref = [child].concat(child.descendants());
              results1 = [];
              for (j = 0, len1 = ref.length; j < len1; j++) {
                element = ref[j];
                results1.push(form.find("[data-type='field'][data-id='" + element.id + "']").remove());
              }
              return results1;
            })());
          }
        }
        return results;
      }
    };

    Field.isPresent = function(field, form) {
      return !!$(form).find("[data-id='" + field.id + "']").length;
    };

    Field.grouped = function(fields) {
      return _.groupBy(fields, function(field) {
        if (field.group === null) {
          return "";
        } else {
          return field.group;
        }
      });
    };

    return Field;

  })(Spine.Model);

}).call(this);
(function() {
  window.App.Group.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/groups";
    };
  })(this);

}).call(this);
(function() {
  window.App.Holiday.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/holidays";
    };
  })(this);

}).call(this);
(function() {
  window.App.Inventory.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/inventory";
    };
  })(this);

  window.App.Inventory.findByInventoryCode = (function(_this) {
    return function(inventory_code) {
      return $.get("/manage/" + App.InventoryPool.current.id + "/inventory/" + inventory_code);
    };
  })(this);

  window.App.Inventory.fetch = (function(_this) {
    return function(params) {
      return $.get(App.Inventory.url() + ".json", params);
    };
  })(this);

}).call(this);
(function() {
  window.App.InventoryPool.url = "/manage";

  window.App.InventoryPool.prototype.isOwnerOrResponsibleFor = function(item) {
    return this.id === item.owner_id || this.id === item.inventory_pool_id;
  };

}).call(this);
(function() {
  _.invoke([window.App.Item, window.App.License], function() {
    return this.url = function() {
      return "/manage/" + App.InventoryPool.current.id + "/items";
    };
  });

  _.invoke([window.App.Item, window.App.License], function() {
    return this.prototype.updateWithFieldData = function(data) {
      return $.ajax({
        url: this.url(),
        data: data,
        type: "PUT"
      });
    };
  });

  _.invoke([window.App.Item, window.App.License], function() {
    return this.prototype.inspect = function(data) {
      var k, v;
      for (k in data) {
        v = data[k];
        this[k] = v;
      }
      App.Item.addRecord(this);
      App.Item.trigger("refresh");
      return $.post((window.App.Item.url()) + "/" + this.id + "/inspect", data);
    };
  });

}).call(this);
(function() {
  _.invoke([window.App.Model, window.App.Software], function() {
    return this.url = function() {
      return "/manage/" + App.InventoryPool.current.id + "/models";
    };
  });

}).call(this);
(function() {
  window.App.ModelLink.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/model_links";
    };
  })(this);

}).call(this);
(function() {
  window.App.Option.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/options";
    };
  })(this);

}).call(this);
(function() {
  window.App.Order.url = (function(_this) {
    return function() {
      return App.InventoryPool.url + "/" + App.InventoryPool.current.id + "/orders";
    };
  })(this);

  window.App.Order.prototype.approve = function(comment) {
    return $.post("/manage/" + App.InventoryPool.current.id + "/orders/" + this.id + "/approve", {
      comment: comment
    });
  };

  window.App.Order.prototype.approve_anyway = function(comment) {
    return $.post("/manage/" + App.InventoryPool.current.id + "/orders/" + this.id + "/approve", {
      force: true,
      comment: comment
    });
  };

  window.App.Order.prototype.reject = function(comment) {
    return $.post("/manage/" + App.InventoryPool.current.id + "/orders/" + this.id + "/reject", {
      comment: comment
    });
  };

  window.App.Order.prototype.swapUser = function(user_id, delegated_user_id) {
    return $.post("/manage/" + App.InventoryPool.current.id + "/orders/" + this.id + "/swap_user", {
      user_id: user_id,
      delegated_user_id: delegated_user_id
    });
  };

  window.App.Order.prototype.sign = function(data) {
    return $.post(App.InventoryPool.url + "/" + App.InventoryPool.current.id + "/orders/" + this.id + "/sign", data);
  };

  window.App.Order.prototype.editPath = function() {
    return (App.Order.url()) + "/" + this.id + "/edit";
  };

  window.App.Order.prototype.handOverPath = function() {
    return (App.Order.url()) + "/" + this.id + "/hand_over";
  };

}).call(this);
(function() {
  window.App.Partition.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/partitions";
    };
  })(this);

}).call(this);
(function() {
  window.App.Reservation.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/reservations";
    };
  })(this);

  window.App.Reservation.createOne = function(data) {
    return $.post("/manage/" + App.InventoryPool.current.id + "/reservations", data).done(function(reservation) {
      App.Reservation.addRecord(new App.Reservation(reservation));
      App.Reservation.trigger("refresh");
      return App.Order.trigger("refresh");
    });
  };

  window.App.Reservation.createForTemplate = function(data) {
    return $.ajax({
      url: "/manage/" + App.InventoryPool.current.id + "/reservations/for_template",
      data: data,
      method: "POST",
      success: function(reservations) {
        var records, reservation;
        records = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = reservations.length; i < len; i++) {
            reservation = reservations[i];
            results.push(App.Reservation.addRecord(new App.Reservation(reservation)));
          }
          return results;
        })();
        return $.ajax({
          url: App.Model.url(),
          data: $.param({
            template_id: data.template_id,
            paginate: false
          }),
          success: function(models) {
            var i, len, model;
            for (i = 0, len = models.length; i < len; i++) {
              model = models[i];
              App.Model.addRecord(new App.Model(model));
            }
            App.Model.trigger("refresh");
            App.Reservation.trigger("refresh");
            return App.Order.trigger("refresh");
          }
        });
      }
    });
  };

  window.App.Reservation.destroyMultiple = function(ids) {
    var i, id, len;
    for (i = 0, len = ids.length; i < len; i++) {
      id = ids[i];
      App.Reservation.find(id).remove();
    }
    return $.ajax({
      url: "/manage/" + App.InventoryPool.current.id + "/reservations/",
      type: "post",
      data: {
        line_ids: ids,
        _method: "delete"
      }
    }).done(function() {
      App.Reservation.trigger("destroy", ids);
      return App.Order.trigger("refresh");
    });
  };

  window.App.Reservation.changeTimeRange = (function(_this) {
    return function(reservations, startDate, endDate) {
      if (startDate) {
        startDate = moment(startDate).format("YYYY-MM-DD");
      }
      endDate = moment(endDate).format("YYYY-MM-DD");
      return $.post("/manage/" + App.InventoryPool.current.id + "/reservations/change_time_range", {
        line_ids: _.map(reservations, function(l) {
          return l.id;
        }),
        start_date: startDate,
        end_date: endDate
      }).done(function() {
        var data, i, len, line;
        for (i = 0, len = reservations.length; i < len; i++) {
          line = reservations[i];
          data = {
            end_date: endDate
          };
          if (startDate) {
            data["start_date"] = startDate;
          }
          line.refresh(data);
        }
        App.Reservation.trigger("refresh");
        return App.Order.trigger("refresh");
      });
    };
  })(this);

  window.App.Reservation.assignOrCreate = function(data) {
    return $.post("/manage/" + App.InventoryPool.current.id + "/reservations/assign_or_create", data);
  };

  window.App.Reservation.takeBack = function(reservations, returnedQuantity) {
    var line;
    return $.post("/manage/" + App.InventoryPool.current.id + "/reservations/take_back", {
      ids: (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = reservations.length; i < len; i++) {
          line = reservations[i];
          results.push(line.id);
        }
        return results;
      })(),
      returned_quantity: returnedQuantity
    });
  };

  window.App.Reservation.swapUser = function(reservations, userId) {
    var line;
    return $.post("/manage/" + App.InventoryPool.current.id + "/reservations/swap_user", {
      line_ids: (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = reservations.length; i < len; i++) {
          line = reservations[i];
          results.push(line.id);
        }
        return results;
      })(),
      user_id: userId
    });
  };

  Spine.Model.include.call(App.Reservation, App.Modules.LineProblems);

  window.App.Reservation.prototype.assign = function(item, callback) {
    if (callback == null) {
      callback = null;
    }
    return $.post("/manage/" + App.InventoryPool.current.id + "/reservations/" + this.id + "/assign", {
      inventory_code: item.inventory_code
    }).fail((function(_this) {
      return function(e) {
        var msg, ref;
        msg = ((ref = e.responseJSON) != null ? ref.message : void 0) || e.responseText;
        return App.Flash({
          type: "error",
          message: msg
        });
      };
    })(this)).done((function(_this) {
      return function(data) {
        var ref;
        _this.refresh(data);
        App.Reservation.trigger("update", _this);
        App.Flash({
          type: "success",
          message: _jed("%s assigned to %s", [item.inventory_code, ((ref = item.model()) != null ? ref : item.software()).name()])
        });
        return typeof callback === "function" ? callback() : void 0;
      };
    })(this));
  };

  window.App.Reservation.prototype.removeAssignment = function() {
    $.post("/manage/" + App.InventoryPool.current.id + "/reservations/" + this.id + "/remove_assignment");
    this.refresh({
      item_id: null
    });
    return App.Reservation.trigger("update", this);
  };

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Role = (function(superClass) {
    extend(Role, superClass);

    function Role() {
      return Role.__super__.constructor.apply(this, arguments);
    }

    Role.configure("Role", "id", "name");

    Role.extend(Spine.Model.Ajax);

    Role.url = function() {
      return "/manage/roles";
    };

    return Role;

  })(Spine.Model);

}).call(this);
(function() {
  window.App.Template.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/templates";
    };
  })(this);

}).call(this);
(function() {
  window.App.User.url = (function(_this) {
    return function() {
      if (App.InventoryPool.current != null) {
        return "/manage/" + App.InventoryPool.current.id + "/users";
      } else {
        return "/admin/users";
      }
    };
  })(this);

  window.App.User.prototype.isSuspended = function() {
    return _.include(App.InventoryPool.current.suspended_user_ids, this.id);
  };

}).call(this);
(function() {
  window.App.Workday.url = (function(_this) {
    return function() {
      return "/manage/" + App.InventoryPool.current.id + "/workdays";
    };
  })(this);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.CategoriesFilterController = (function(superClass) {
    extend(CategoriesFilterController, superClass);

    CategoriesFilterController.prototype.elements = {
      "#category-list": "list",
      "#category-root": "rootContainer",
      "#category-current": "currentContainer",
      "#category-search": "input"
    };

    CategoriesFilterController.prototype.events = {
      "click [data-type='category-filter']": "clickCategory",
      "click [data-type='category-root']": "goRoot",
      "click [data-type='category-current']": "goBack",
      "preChange #category-search": "search"
    };

    function CategoriesFilterController() {
      this.search = bind(this.search, this);
      this.goBack = bind(this.goBack, this);
      this.goRoot = bind(this.goRoot, this);
      this.select = bind(this.select, this);
      this.getCurrent = bind(this.getCurrent, this);
      this.getRoot = bind(this.getRoot, this);
      this.clickCategory = bind(this.clickCategory, this);
      this.renderSearch = bind(this.renderSearch, this);
      this.renderLast = bind(this.renderLast, this);
      this.renderRoot = bind(this.renderRoot, this);
      this.renderList = bind(this.renderList, this);
      this.render = bind(this.render, this);
      this.fetchCategoryLinks = bind(this.fetchCategoryLinks, this);
      this.fetchCategories = bind(this.fetchCategories, this);
      CategoriesFilterController.__super__.constructor.apply(this, arguments);
      this.categoryPath = [];
      this.searchTerm = "";
      this.fetchCategories().done((function(_this) {
        return function() {
          return _this.render();
        };
      })(this));
      this.fetchCategoryLinks().done((function(_this) {
        return function() {
          return _this.render();
        };
      })(this));
      this.input.preChange();
    }

    CategoriesFilterController.prototype.fetchCategories = function() {
      return App.Category.ajaxFetch().done((function(_this) {
        return function(data) {
          var datum;
          return _this.categories = (function() {
            var i, len, results1;
            results1 = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results1.push(App.Category.find(datum.id));
            }
            return results1;
          })();
        };
      })(this));
    };

    CategoriesFilterController.prototype.fetchCategoryLinks = function() {
      return App.CategoryLink.ajaxFetch().done((function(_this) {
        return function(data) {
          var datum;
          return _this.categoryLinks = (function() {
            var i, len, results1;
            results1 = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results1.push(App.CategoryLink.find(datum.id));
            }
            return results1;
          })();
        };
      })(this));
    };

    CategoriesFilterController.prototype.render = function(category) {
      var categories;
      categories = category != null ? category.children() : (this.categories != null) && (this.categoryLinks != null) ? this.roots != null ? this.roots : this.roots = App.Category.roots() : void 0;
      if (categories != null) {
        this.renderList(categories);
      }
      this.renderRoot();
      return this.renderLast();
    };

    CategoriesFilterController.prototype.renderList = function(categories) {
      return this.list.html(App.Render("manage/views/categories/filter_list_entry", categories));
    };

    CategoriesFilterController.prototype.renderRoot = function() {
      if (this.searchTerm.length) {
        return false;
      }
      if (this.getRoot() != null) {
        return this.rootContainer.html(App.Render("manage/views/categories/filter_list_root", this.getRoot()));
      } else {
        return this.rootContainer.html("");
      }
    };

    CategoriesFilterController.prototype.renderLast = function() {
      if (this.getCurrent() != null) {
        return this.currentContainer.html(App.Render("manage/views/categories/filter_list_current", this.getCurrent()));
      } else {
        return this.currentContainer.html("");
      }
    };

    CategoriesFilterController.prototype.renderSearch = function(searchTerm, results) {
      this.rootContainer.html(App.Render("manage/views/categories/filter_list_search", {
        search_term: this.input.val()
      }));
      this.currentContainer.html("");
      if (results.length) {
        return this.list.html(App.Render("manage/views/categories/filter_list_entry", results));
      } else {
        return this.list.html("");
      }
    };

    CategoriesFilterController.prototype.clickCategory = function(e) {
      var category, target;
      target = $(e.currentTarget);
      category = App.Category.find(target.data("id"));
      return this.select(category);
    };

    CategoriesFilterController.prototype.getRoot = function() {
      if (this.categoryPath.length > 1) {
        return _.first(this.categoryPath);
      }
    };

    CategoriesFilterController.prototype.getCurrent = function() {
      if (this.categoryPath.length > 0) {
        return _.last(this.categoryPath);
      }
    };

    CategoriesFilterController.prototype.select = function(category) {
      this.categoryPath.push(category);
      this.render(category);
      if (this.filter != null) {
        return this.filter();
      }
    };

    CategoriesFilterController.prototype.goRoot = function(e) {
      this.categoryPath = this.categoryPath.splice(0, 1);
      this.render(this.categoryPath[0]);
      if (this.filter != null) {
        return this.filter();
      }
    };

    CategoriesFilterController.prototype.goBack = function(e) {
      var category;
      this.categoryPath = this.categoryPath.length > 1 ? this.categoryPath.splice(0, this.categoryPath.length - 1) : this.categoryPath = [];
      if (this.categoryPath.length > 1) {
        category = _.last(this.categoryPath);
      }
      if (this.searchTerm.length && this.categoryPath.length === 0) {
        this.search();
      } else {
        this.render(category);
      }
      if (this.filter != null) {
        return this.filter();
      }
    };

    CategoriesFilterController.prototype.search = function() {
      var results;
      if (this.searchTerm !== this.input.val()) {
        this.searchTerm = this.input.val();
        if (this.searchTerm.length) {
          results = _.filter(App.Category.all(), (function(_this) {
            return function(c) {
              return c.name.match(RegExp(_this.searchTerm, "i"));
            };
          })(this));
          return this.renderSearch(this.searchTerm, results);
        } else {
          return this.render();
        }
      }
    };

    return CategoriesFilterController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.CategoriesIndexController = (function(superClass) {
    extend(CategoriesIndexController, superClass);

    CategoriesIndexController.prototype.elements = {
      "#list": "list"
    };

    function CategoriesIndexController() {
      this.renderList = bind(this.renderList, this);
      this.fetchCategoryLinks = bind(this.fetchCategoryLinks, this);
      this.fetchCategories = bind(this.fetchCategories, this);
      this.showLoading = bind(this.showLoading, this);
      this.localSearch = bind(this.localSearch, this);
      this.resetAndRender = bind(this.resetAndRender, this);
      CategoriesIndexController.__super__.constructor.apply(this, arguments);
      this.showLoading();
      this.fetchCategories().done((function(_this) {
        return function() {
          return _this.fetchCategoryLinks().done(function() {
            return _this.renderList(App.Category.roots());
          });
        };
      })(this));
      new App.CategoriesIndexExpandController({
        el: this.el.find("#list")
      });
      this.search = new App.ListSearchController({
        el: this.el.find("#list-search"),
        reset: this.resetAndRender
      });
    }

    CategoriesIndexController.prototype.resetAndRender = function() {
      var searchTerm;
      this.categories = {};
      this.showLoading();
      if (searchTerm = this.search.term()) {
        return this.localSearch(searchTerm);
      } else {
        return this.renderList(App.Category.roots());
      }
    };

    CategoriesIndexController.prototype.localSearch = function(searchTerm) {
      var regex;
      regex = new RegExp(searchTerm, "i");
      this.categories = _.filter(App.Category.all(), function(c) {
        return c.name.match(regex);
      });
      return this.renderList(this.categories);
    };

    CategoriesIndexController.prototype.showLoading = function() {
      return this.list.html(App.Render("manage/views/lists/loading"));
    };

    CategoriesIndexController.prototype.fetchCategories = function() {
      return App.Category.ajaxFetch({
        data: $.param({
          include: {
            'used?': true
          }
        })
      }).done((function(_this) {
        return function(data) {
          var datum;
          return _this.categories = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Category.find(datum.id));
            }
            return results;
          })();
        };
      })(this));
    };

    CategoriesIndexController.prototype.fetchCategoryLinks = function() {
      return App.CategoryLink.ajaxFetch().done((function(_this) {
        return function(data) {
          var datum;
          return _this.categoryLinks = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.CategoryLink.find(datum.id));
            }
            return results;
          })();
        };
      })(this));
    };

    CategoriesIndexController.prototype.renderList = function(categories) {
      return this.list.html(App.Render("manage/views/categories/line", categories));
    };

    return CategoriesIndexController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.CategoriesIndexExpandController = (function(superClass) {
    extend(CategoriesIndexExpandController, superClass);

    function CategoriesIndexExpandController() {
      this.close = bind(this.close, this);
      this.open = bind(this.open, this);
      this.toggle = bind(this.toggle, this);
      return CategoriesIndexExpandController.__super__.constructor.apply(this, arguments);
    }

    CategoriesIndexExpandController.prototype.events = {
      "click [data-type='expander']": "toggle"
    };

    CategoriesIndexExpandController.prototype.toggle = function(e) {
      var target;
      target = $(e.currentTarget);
      if ((target.data("_expanded") != null) && target.data("_expanded") === true) {
        return this.close(target);
      } else {
        return this.open(target);
      }
    };

    CategoriesIndexExpandController.prototype.open = function(target) {
      var children, childrenContainer, line;
      target.data("_expanded", true);
      target.find(".arrow").removeClass("down right").addClass("down");
      line = target.closest("[data-id]");
      if (line.data("childrenContainer") != null) {
        childrenContainer = line.data("childrenContainer");
      } else {
        children = _(App.Category.find(line.data("id")).children()).sortBy((function(_this) {
          return function(c) {
            return c.name;
          };
        })(this));
        childrenContainer = $("<div class='group-of-lines level-padding'></div>");
        childrenContainer.append(App.Render("manage/views/categories/line", children));
        line.data("childrenContainer", childrenContainer);
      }
      return line.after(childrenContainer);
    };

    CategoriesIndexExpandController.prototype.close = function(target) {
      var childrenContainer, line;
      target.data("_expanded", false);
      target.find(".arrow").removeClass("down right").addClass("right");
      line = target.closest("[data-id]");
      childrenContainer = line.next();
      return childrenContainer.detach();
    };

    return CategoriesIndexExpandController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.AddInlineEntryController = (function(superClass) {
    extend(AddInlineEntryController, superClass);

    function AddInlineEntryController() {
      this.select = bind(this.select, this);
      this.fetch = bind(this.fetch, this);
      this.source = bind(this.source, this);
      this.setupAutocomplete = bind(this.setupAutocomplete, this);
      return AddInlineEntryController.__super__.constructor.apply(this, arguments);
    }

    AddInlineEntryController.prototype.events = {
      "focus input[data-type='autocomplete']": "setupAutocomplete"
    };

    AddInlineEntryController.prototype.elements = {
      "input[data-type='autocomplete']": "input",
      ".list-of-lines": "list"
    };

    AddInlineEntryController.prototype.setupAutocomplete = function(groups) {
      this.input.autocomplete({
        source: this.source,
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        select: this.select,
        minLength: 0
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("views/autocomplete/element", item)).data("value", item).appendTo(ul);
        };
      })(this);
      return this.input.autocomplete("search");
    };

    AddInlineEntryController.prototype.source = function(request, response) {
      return this.fetch(request.term).done((function(_this) {
        return function(data) {
          data = _.map(data, function(datum) {
            var ref;
            return {
              label: (ref = typeof _this.customLabelFn === "function" ? _this.customLabelFn(datum) : void 0) != null ? ref : datum.name,
              record: App[_this.model].find(datum.id)
            };
          });
          if (_this.input.is(":focus")) {
            return response(data);
          }
        };
      })(this));
    };

    AddInlineEntryController.prototype.fetch = function(term) {
      return App[this.model].ajaxFetch({
        data: $.param({
          search_term: term
        })
      });
    };

    AddInlineEntryController.prototype.select = function(e, ui) {
      var record;
      record = ui.item.record;
      this.input.val("").blur();
      this.input.autocomplete("destroy");
      if (!this.list.find(this.getExistingEntry(record)).length) {
        this.list.prepend(App.Render(this.templatePath, record, {
          uid: App[this.model].uid("uid")
        }));
      }
      e.preventDefault();
      return false;
    };

    return AddInlineEntryController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.CategoriesLinksController = (function(superClass) {
    extend(CategoriesLinksController, superClass);

    function CategoriesLinksController() {
      this.select = bind(this.select, this);
      this.source = bind(this.source, this);
      this.getExistingEntry = bind(this.getExistingEntry, this);
      CategoriesLinksController.__super__.constructor.apply(this, arguments);
      this.model = "Category";
      this.templatePath = "manage/views/categories/category_link_inline_entry";
    }

    CategoriesLinksController.prototype.getExistingEntry = function(record) {
      return this.list.find("input[name*='parent_id'][value='" + record.id + "']");
    };

    CategoriesLinksController.prototype.source = function(request, response) {
      return this.fetch(request.term).done((function(_this) {
        return function(data) {
          if (_this.category) {
            data = _.filter(data, function(datum) {
              return datum.id !== _this.category.id;
            });
          }
          data = _.map(data, function(datum) {
            return {
              label: datum.name,
              record: App[_this.model].find(datum.id)
            };
          });
          return response(data);
        };
      })(this));
    };

    CategoriesLinksController.prototype.select = function(e, ui) {
      var record;
      record = ui.item.record;
      this.input.autocomplete("destroy");
      this.input.val("").blur();
      if (!this.list.find(this.getExistingEntry(record)).length) {
        this.list.prepend(App.Render(this.templatePath, record, {
          uid: App[this.model].uid("uid"),
          label: this.labelInput.val()
        }));
      }
      return false;
    };

    return CategoriesLinksController;

  })(App.AddInlineEntryController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.FormWithUploadController = (function(superClass) {
    extend(FormWithUploadController, superClass);

    function FormWithUploadController() {
      this.setupErrorModal = bind(this.setupErrorModal, this);
      this.setupImageRestrictionsErrorModel = bind(this.setupImageRestrictionsErrorModel, this);
      this.collectErrorMessages = bind(this.collectErrorMessages, this);
      this.showError = bind(this.showError, this);
      this.hideLoading = bind(this.hideLoading, this);
      this.showLoading = bind(this.showLoading, this);
      this.save = bind(this.save, this);
      this.done = bind(this.done, this);
      this.errorHandler = bind(this.errorHandler, this);
      this.submit = bind(this.submit, this);
      this.preventDefaultSubmit = bind(this.preventDefaultSubmit, this);
      return FormWithUploadController.__super__.constructor.apply(this, arguments);
    }

    FormWithUploadController.prototype.elements = {
      "#form": "form",
      "#save": "saveButton"
    };

    FormWithUploadController.prototype.events = {
      "click #save": "submit",
      "submit #form": "preventDefaultSubmit"
    };

    FormWithUploadController.prototype.preventDefaultSubmit = function(e) {
      return e.preventDefault();
    };

    FormWithUploadController.prototype.submit = function(event, saveAction, errorHandler) {
      var result;
      if (saveAction == null) {
        saveAction = this.save;
      }
      if (errorHandler == null) {
        errorHandler = this.errorHandler;
      }
      this.showLoading();
      if (result = saveAction()) {
        return result.fail((function(_this) {
          return function(e) {
            return errorHandler(e);
          };
        })(this)).done((function(_this) {
          return function(data) {
            return _this.done(data);
          };
        })(this));
      }
    };

    FormWithUploadController.prototype.errorHandler = function(e) {
      this.showError(e.responseText);
      return this.hideLoading();
    };

    FormWithUploadController.prototype.done = function() {};

    FormWithUploadController.prototype.save = function() {};

    FormWithUploadController.prototype.showLoading = function() {
      var loadingTemplate;
      loadingTemplate = $(App.Render("views/loading", {
        size: "micro"
      }));
      this.saveButton.data("origin", this.saveButton.html());
      this.saveButton.html(loadingTemplate);
      return this.saveButton.prop("disabled", true);
    };

    FormWithUploadController.prototype.hideLoading = function() {
      this.saveButton.html(this.saveButton.data("origin"));
      return this.saveButton.prop("disabled", false);
    };

    FormWithUploadController.prototype.showError = function(text) {
      return App.Flash({
        type: "error",
        message: text
      });
    };

    FormWithUploadController.prototype.collectErrorMessages = function() {};

    FormWithUploadController.prototype.setupImageRestrictionsErrorModel = function(entity, message) {
      var modal, tmpl;
      tmpl = App.Render("manage/views/templates/upload/upload_image_type_errors_dialog", {
        url: entity.url("edit"),
        headlineMessage: message,
        buttonLabel: _jed("Edit %s", _jed(entity.constructor.name))
      });
      modal = new App.Modal(tmpl);
      return modal.undestroyable();
    };

    FormWithUploadController.prototype.setupErrorModal = function(entity) {
      var errors, modal, tmpl;
      errors = this.collectErrorMessages();
      tmpl = App.Render("manage/views/templates/upload/upload_errors_dialog", {
        errors: errors,
        url: entity.url("edit"),
        headlineMessage: _jed("%s was saved, but there were problems uploading files", _jed(entity.constructor.name)),
        buttonLabel: _jed("Edit %s", _jed(entity.constructor.name))
      });
      modal = new App.Modal(tmpl);
      return modal.undestroyable();
    };

    return FormWithUploadController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.CategoryController = (function(superClass) {
    extend(CategoryController, superClass);

    function CategoryController() {
      this.collectErrorMessages = bind(this.collectErrorMessages, this);
      this.finish = bind(this.finish, this);
      this.done = bind(this.done, this);
      CategoryController.__super__.constructor.apply(this, arguments);
      this.imagesController = new App.ImagesController({
        el: this.el.find("#images"),
        url: this.category.url("upload/image"),
        click: function() {
          if (this.list.find(".line:not(.striked)").length || this.uploadList.length) {
            return alert(_jed("Category can have only one image."));
          } else {
            return this.el.find("input[type='file']").trigger("click");
          }
        }
      });
      new App.InlineEntryRemoveController({
        el: this.el
      });
      new App.CategoriesLinksController({
        el: this.el.find("#categories"),
        labelInput: this.el.find("#name-input"),
        category: this.category
      });
    }

    CategoryController.prototype.done = function() {
      return this.imagesController.upload((function(_this) {
        return function() {
          return _this.finish();
        };
      })(this));
    };

    CategoryController.prototype.finish = function() {
      if (this.imagesController.uploadErrors.length) {
        return this.setupErrorModal(this.category);
      } else {
        return window.location = App.Category.url() + ("?flash[success]=" + (_jed('Category saved')));
      }
    };

    CategoryController.prototype.collectErrorMessages = function() {
      return this.imagesController.uploadErrors.join(", ");
    };

    return CategoryController;

  })(App.FormWithUploadController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.EditCategoryController = (function(superClass) {
    extend(EditCategoryController, superClass);

    function EditCategoryController() {
      this.save = bind(this.save, this);
      return EditCategoryController.__super__.constructor.apply(this, arguments);
    }

    EditCategoryController.prototype.save = function() {
      return $.ajax({
        url: this.category.url(),
        data: this.form.serializeArray(),
        type: "PUT"
      });
    };

    return EditCategoryController;

  })(App.CategoryController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.NewCategoryController = (function(superClass) {
    extend(NewCategoryController, superClass);

    function NewCategoryController() {
      this.updateUploadURL = bind(this.updateUploadURL, this);
      this.save = bind(this.save, this);
      return NewCategoryController.__super__.constructor.apply(this, arguments);
    }

    NewCategoryController.prototype.save = function() {
      return $.post(App.Category.url(), this.form.serializeArray()).done((function(_this) {
        return function(data) {
          _this.category.id = data.id;
          return _this.updateUploadURL();
        };
      })(this));
    };

    NewCategoryController.prototype.updateUploadURL = function() {
      return this.imagesController.url = this.category.url("upload/image");
    };

    return NewCategoryController;

  })(App.CategoryController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ContractsIndexController = (function(superClass) {
    extend(ContractsIndexController, superClass);

    ContractsIndexController.prototype.elements = {
      "#contracts": "list"
    };

    function ContractsIndexController() {
      this.render = bind(this.render, this);
      this.fetchUsers = bind(this.fetchUsers, this);
      this.fetchReservations = bind(this.fetchReservations, this);
      this.fetchContracts = bind(this.fetchContracts, this);
      this.fetch = bind(this.fetch, this);
      this.reset = bind(this.reset, this);
      ContractsIndexController.__super__.constructor.apply(this, arguments);
      new App.LinesCellTooltipController({
        el: this.el
      });
      new App.UserCellTooltipController({
        el: this.el
      });
      this.pagination = new App.OrdersPaginationController({
        el: this.list,
        fetch: this.fetch
      });
      this.search = new App.ListSearchController({
        el: this.el.find("#list-search"),
        reset: this.reset
      });
      this.filter = new App.ListFiltersController({
        el: this.el.find("#list-filters"),
        reset: this.reset
      });
      this.range = new App.ListRangeController({
        el: this.el.find("#list-range"),
        reset: this.reset
      });
      this.tabs = new App.ListTabsController({
        el: this.el.find("#list-tabs"),
        reset: this.reset,
        data: {
          status: this.status
        }
      });
      this.reset();
    }

    ContractsIndexController.prototype.reset = function() {
      this.contracts = {};
      this.finished = false;
      this.list.html(App.Render("manage/views/lists/loading"));
      this.fetch(1, this.list);
      return this.pagination.page = 1;
    };

    ContractsIndexController.prototype.fetch = function(page, target) {
      return this.fetchContracts(page).done((function(_this) {
        return function() {
          return _this.fetchUsers(page).done(function() {
            return _this.fetchReservations(page, function() {
              return _this.render(target, _this.contracts[page], page);
            });
          });
        };
      })(this));
    };

    ContractsIndexController.prototype.fetchContracts = function(page) {
      var data;
      data = $.extend(this.tabs.getData(), $.extend(this.filter.getData(), {
        disable_total_count: true,
        search_term: this.search.term(),
        page: page,
        range: this.range.get()
      }));
      if (!data['to_be_verified'] && App.User.current.role === "group_manager") {
        data = $.extend(data, {
          from_verifiable_users: true
        });
      }
      if (!data['no_verification_required'] && App.User.current.role !== "group_manager") {
        data = $.extend(data, {
          to_be_verified: true
        });
      }
      return App.Contract.ajaxFetch({
        data: $.param(data)
      }).done((function(_this) {
        return function(data, status, xhr) {
          var contracts, datum;
          _this.pagination.set(JSON.parse(xhr.getResponseHeader("X-Pagination")));
          if (data.length === 0) {
            _this.finished = true;
          }
          contracts = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Contract.find(datum.id));
            }
            return results;
          })();
          return _this.contracts[page] = contracts;
        };
      })(this));
    };

    ContractsIndexController.prototype.fetchReservations = function(page, callback) {
      var done, ids;
      ids = _.map(this.contracts[page], function(o) {
        return o.id;
      });
      if (!ids.length) {
        callback();
      }
      done = _.after(Math.ceil(ids.length / 50), callback);
      return _(ids).each_slice(50, (function(_this) {
        return function(slice) {
          return App.Reservation.ajaxFetch({
            data: $.param({
              contract_ids: slice
            })
          }).done(done);
        };
      })(this));
    };

    ContractsIndexController.prototype.fetchUsers = function(page) {
      var ids;
      ids = _.filter(_.map(this.contracts[page], function(c) {
        return c.user_id;
      }), function(id) {
        return App.User.exists(id) == null;
      });
      if (!ids.length) {
        return {
          done: (function(_this) {
            return function(c) {
              return c();
            };
          })(this)
        };
      }
      return App.User.ajaxFetch({
        data: $.param({
          ids: _.uniq(ids),
          all: true
        })
      }).done((function(_this) {
        return function(data) {
          var datum, users;
          users = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.find(datum.id));
            }
            return results;
          })();
          return App.User.fetchDelegators(users);
        };
      })(this));
    };

    ContractsIndexController.prototype.render = function(target, data, page) {
      var nextPage;
      target.removeClass('loading-page');
      target.html(App.Render("manage/views/contracts/line", data, {
        accessRight: App.AccessRight,
        currentUserRole: App.User.current.role
      }));
      if (!this.finished && $('.loading-page').length === 0) {
        nextPage = page + 1;
        return this.list.append(App.Render("manage/views/lists/loading_page", nextPage, {
          page: nextPage
        }));
      }
    };

    return ContractsIndexController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.DocumentsAfterHandOverController = (function(superClass) {
    extend(DocumentsAfterHandOverController, superClass);

    function DocumentsAfterHandOverController() {
      this.printContract = bind(this.printContract, this);
      this.setupModal = bind(this.setupModal, this);
      DocumentsAfterHandOverController.__super__.constructor.apply(this, arguments);
      this.setupModal();
      this.printContract();
    }

    DocumentsAfterHandOverController.prototype.setupModal = function() {
      var modal, tmpl;
      tmpl = App.Render("manage/views/users/hand_over_documents_dialog", {
        contract: this.contract,
        itemsCount: this.itemsCount
      });
      modal = new App.Modal(tmpl);
      modal.undestroyable();
      return this.el = modal.el;
    };

    DocumentsAfterHandOverController.prototype.printContract = function() {
      if (App.InventoryPool.current.print_contracts) {
        return window.open(this.contract.url() + "?print=true");
      }
    };

    return DocumentsAfterHandOverController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchOverviewController = (function(superClass) {
    extend(SearchOverviewController, superClass);

    SearchOverviewController.prototype.elements = {
      "#models": "models",
      "#software": "software",
      "#items": "items",
      "#licenses": "licenses",
      "#users": "users",
      "#delegations": "delegations",
      "#contracts": "contracts",
      "#orders": "orders",
      "#options": "options"
    };

    function SearchOverviewController() {
      this.searchOptions = bind(this.searchOptions, this);
      this.searchOrders = bind(this.searchOrders, this);
      this.fetchReservationsForOrders = bind(this.fetchReservationsForOrders, this);
      this.fetchReservationsForContracts = bind(this.fetchReservationsForContracts, this);
      this.fetchUsers = bind(this.fetchUsers, this);
      this.searchContracts = bind(this.searchContracts, this);
      this.searchUsers = bind(this.searchUsers, this);
      this.searchDelegations = bind(this.searchDelegations, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.searchLicenses = bind(this.searchLicenses, this);
      this.searchItems = bind(this.searchItems, this);
      this.fetchAvailability = bind(this.fetchAvailability, this);
      this.render = bind(this.render, this);
      this.searchSoftware = bind(this.searchSoftware, this);
      this.searchModels = bind(this.searchModels, this);
      SearchOverviewController.__super__.constructor.apply(this, arguments);
      this.previewAmount = 5;
      this.searchModels();
      this.searchSoftware();
      this.searchItems();
      this.searchLicenses();
      this.searchOptions();
      this.searchUsers();
      this.searchDelegations();
      this.searchContracts();
      this.searchOrders();
      new App.LatestReminderTooltipController({
        el: this.el
      });
      new App.LinesCellTooltipController({
        el: this.el
      });
      new App.UserCellTooltipController({
        el: this.el
      });
      new App.HandOversDeleteController({
        el: this.el
      });
      new App.OrdersApproveController({
        el: this.el
      });
      new App.TakeBacksSendReminderController({
        el: this.el
      });
      new App.OrdersRejectController({
        el: this.el,
        async: true,
        callback: this.orderRejected
      });
      new App.TimeLineController({
        el: this.el
      });
    }

    SearchOverviewController.prototype.removeLoading = function(el) {
      return el.find("[data-loading]").remove();
    };

    SearchOverviewController.prototype.searchModels = function() {
      return $.ajax({
        url: App.Model.url(),
        type: "GET",
        dataType: "json",
        data: {
          type: "model",
          per_page: this.previewAmount,
          search_term: this.searchTerm
        }
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, models;
          models = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Model.addRecord(new App.Model(datum)));
            }
            return results;
          })();
          return _this.fetchAvailability(models).done(function() {
            return _this.render(_this.models, "manage/views/models/line", models, xhr);
          });
        };
      })(this));
    };

    SearchOverviewController.prototype.searchSoftware = function() {
      return $.ajax({
        url: App.Software.url(),
        type: "GET",
        dataType: "json",
        data: {
          type: "software",
          per_page: this.previewAmount,
          search_term: this.searchTerm
        }
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, software;
          software = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Software.addRecord(new App.Software(datum)));
            }
            return results;
          })();
          return _this.fetchAvailability(software).done(function() {
            return _this.render(_this.software, "manage/views/software/line", software, xhr);
          });
        };
      })(this));
    };

    SearchOverviewController.prototype.render = function(el, templatePath, records, xhr) {
      var totalCount;
      totalCount = JSON.parse(xhr.getResponseHeader("X-Pagination")).total_count;
      this.removeLoading(el);
      if (records.length) {
        el.find(".list-of-lines").html(App.Render(templatePath, records, {
          currentInventoryPool: App.InventoryPool.current,
          accessRight: App.AccessRight,
          currentUserRole: App.User.current.role
        }));
        el.removeClass("hidden");
      } else {
        el.addClass("hidden");
      }
      if (totalCount > this.previewAmount) {
        return el.find("[data-type='show-all']").removeClass("hidden").append($("<span class='badge margin-left-s'>" + totalCount + "</span>"));
      }
    };

    SearchOverviewController.prototype.fetchAvailability = function(models) {
      var ids;
      ids = _.map(models, function(m) {
        return m.id;
      });
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return $.ajax({
        url: App.Availability.url() + "/in_stock",
        type: "GET",
        dataType: "json",
        data: {
          model_ids: ids
        }
      }).done((function(_this) {
        return function(data) {
          var datum, i, len, results;
          results = [];
          for (i = 0, len = data.length; i < len; i++) {
            datum = data[i];
            results.push(App.Availability.addRecord(new App.Availability(datum)));
          }
          return results;
        };
      })(this));
    };

    SearchOverviewController.prototype.searchItems = function() {
      return $.ajax({
        url: App.Item.url(),
        type: "GET",
        dataType: "json",
        data: {
          type: "item",
          per_page: this.previewAmount,
          search_term: this.searchTerm,
          current_inventory_pool: false
        }
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, items;
          items = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Item.addRecord(new App.Item(datum)));
            }
            return results;
          })();
          return _this.fetchModels(items).done(function() {
            return _this.render(_this.items, "manage/views/items/line", items, xhr);
          });
        };
      })(this));
    };

    SearchOverviewController.prototype.searchLicenses = function() {
      return $.ajax({
        url: App.License.url(),
        type: "GET",
        dataType: "json",
        data: {
          type: "license",
          per_page: this.previewAmount,
          search_term: this.searchTerm,
          current_inventory_pool: false
        }
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, licenses;
          licenses = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.License.addRecord(new App.License(datum)));
            }
            return results;
          })();
          return _this.fetchModels(licenses).done(function(data) {
            return _this.render(_this.licenses, "manage/views/licenses/line", licenses, xhr);
          });
        };
      })(this));
    };

    SearchOverviewController.prototype.fetchModels = function(items) {
      var ids;
      ids = _.uniq(_.map(items, function(m) {
        return m.model_id;
      }));
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return $.ajax({
        url: App.Model.url(),
        type: "GET",
        dataType: "json",
        data: {
          ids: ids,
          paginate: false,
          include_package_models: true
        }
      }).done((function(_this) {
        return function(data) {
          var datum, i, len, results;
          results = [];
          for (i = 0, len = data.length; i < len; i++) {
            datum = data[i];
            results.push(App.Model.addRecord(new App.Model(datum)));
          }
          return results;
        };
      })(this));
    };

    SearchOverviewController.prototype.searchDelegations = function() {
      return $.ajax({
        url: App.User.url(),
        type: "GET",
        dataType: "json",
        data: {
          per_page: this.previewAmount,
          search_term: this.searchTerm,
          type: 'delegation'
        }
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, delegations;
          delegations = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.addRecord(new App.User(datum)));
            }
            return results;
          })();
          return App.User.fetchDelegators(delegations, function() {
            return _this.render(_this.delegations, "manage/views/users/search_result_line", delegations, xhr);
          });
        };
      })(this));
    };

    SearchOverviewController.prototype.searchUsers = function() {
      return $.ajax({
        url: App.User.url(),
        type: "GET",
        dataType: "json",
        data: {
          per_page: this.previewAmount,
          search_term: this.searchTerm,
          type: 'user',
          content_type: "application/json"
        }
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, users;
          users = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.addRecord(new App.User(datum)));
            }
            return results;
          })();
          return _this.render(_this.users, "manage/views/users/search_result_line", users, xhr);
        };
      })(this));
    };

    SearchOverviewController.prototype.searchContracts = function() {
      return $.ajax({
        url: App.Contract.url(),
        type: "GET",
        dataType: "json",
        data: {
          per_page: this.previewAmount,
          global_contracts_search: true,
          search_term: this.searchTerm,
          status: ["open", "closed"]
        }
      }).done((function(_this) {
        return function(data, status, xhr) {
          var contracts, datum;
          contracts = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Contract.addRecord(new App.Contract(datum)));
            }
            return results;
          })();
          return _this.fetchUsers(contracts, "all").done(function() {
            return _this.fetchReservationsForContracts(contracts).done(function() {
              return _this.render(_this.contracts, "manage/views/contracts/line", contracts, xhr);
            });
          });
        };
      })(this));
    };

    SearchOverviewController.prototype.fetchUsers = function(records, all) {
      var data, ids;
      if (all == null) {
        all = false;
      }
      ids = _.uniq(_.map(records, function(r) {
        return r.user_id;
      }));
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      data = {
        ids: ids,
        paginate: false
      };
      if (all === "all") {
        $.extend(data, {
          all: true
        });
      }
      return $.ajax({
        url: App.User.url(),
        type: "GET",
        dataType: "json",
        data: data
      }).done((function(_this) {
        return function(data) {
          var datum, users;
          users = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.addRecord(new App.User(datum)));
            }
            return results;
          })();
          return App.User.fetchDelegators(users);
        };
      })(this));
    };

    SearchOverviewController.prototype.fetchReservationsForContracts = function(records) {
      var ids;
      ids = _.flatten(_.map(records, function(r) {
        return r.id;
      }));
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return $.ajax({
        url: App.Reservation.url(),
        type: "GET",
        dataType: "json",
        data: {
          contract_ids: ids,
          paginate: false
        }
      }).done((function(_this) {
        return function(data) {
          var datum, i, len, results;
          results = [];
          for (i = 0, len = data.length; i < len; i++) {
            datum = data[i];
            results.push(App.Reservation.addRecord(new App.Reservation(datum)));
          }
          return results;
        };
      })(this));
    };

    SearchOverviewController.prototype.fetchReservationsForOrders = function(records) {
      var ids;
      ids = _.flatten(_.map(records, function(r) {
        return r.id;
      }));
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return $.ajax({
        url: App.Reservation.url(),
        type: "GET",
        dataType: "json",
        data: {
          order_ids: ids,
          paginate: false
        }
      }).done((function(_this) {
        return function(data) {
          var datum, i, len, results;
          results = [];
          for (i = 0, len = data.length; i < len; i++) {
            datum = data[i];
            results.push(App.Reservation.addRecord(new App.Reservation(datum)));
          }
          return results;
        };
      })(this));
    };

    SearchOverviewController.prototype.searchOrders = function() {
      return $.ajax({
        url: App.Order.url(),
        type: "GET",
        dataType: "json",
        data: {
          per_page: this.previewAmount,
          search_term: this.searchTerm,
          status: ["approved", "submitted", "rejected"]
        }
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, orders;
          orders = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Order.addRecord(new App.Order(datum)));
            }
            return results;
          })();
          return _this.fetchUsers(orders, "all").done(function(data) {
            return _this.fetchReservationsForOrders(orders).done(function(data) {
              return _this.render(_this.orders, "manage/views/orders/line", orders, xhr);
            });
          });
        };
      })(this));
    };

    SearchOverviewController.prototype.searchOptions = function() {
      return $.ajax({
        url: App.Option.url(),
        type: "GET",
        dataType: "json",
        data: {
          per_page: this.previewAmount,
          search_term: this.searchTerm
        }
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, options;
          options = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Option.addRecord(new App.Option(datum)));
            }
            return results;
          })();
          return _this.render(_this.options, "manage/views/options/line", options, xhr);
        };
      })(this));
    };

    return SearchOverviewController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchResultsController = (function(superClass) {
    extend(SearchResultsController, superClass);

    SearchResultsController.prototype.elements = {
      ".list-of-lines": "list"
    };

    function SearchResultsController() {
      this.render = bind(this.render, this);
      this._fetch = bind(this._fetch, this);
      this.reset = bind(this.reset, this);
      SearchResultsController.__super__.constructor.apply(this, arguments);
      this.additionalData = {
        accessRight: App.AccessRight,
        currentUserRole: App.User.current.role,
        currentInventoryPool: App.InventoryPool.current
      };
      this.pagination = new App.ListPaginationController({
        el: this.list,
        fetch: this._fetch
      });
      this.reset();
    }

    SearchResultsController.prototype.reset = function() {
      this.records = {};
      this.list.html(App.Render("manage/views/lists/loading"));
      return this._fetch(1, this.list);
    };

    SearchResultsController.prototype._fetch = function(page, target) {
      var callback;
      callback = _.after(2, (function(_this) {
        return function() {
          return _this.render(target, _this.records[page], page, _this.additionalData);
        };
      })(this));
      return this.fetch(page, target, callback).done((function(_this) {
        return function(data, status, xhr) {
          var datum, records;
          _this.pagination.set(JSON.parse(xhr.getResponseHeader("X-Pagination")));
          records = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App[this.model].find(datum.id));
            }
            return results;
          }).call(_this);
          _this.records[page] = records;
          return callback();
        };
      })(this));
    };

    SearchResultsController.prototype.render = function(target, data, page, additionalData) {
      if (page === 1 && ((data == null) || data.length === 0)) {
        return target.html(App.Render("manage/views/lists/no_results"));
      } else {
        target.html(App.Render(this.templatePath, data, additionalData));
        if (page === 1) {
          return this.pagination.renderPlaceholders();
        }
      }
    };

    return SearchResultsController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchResultsContractsController = (function(superClass) {
    extend(SearchResultsContractsController, superClass);

    SearchResultsContractsController.prototype.model = "Contract";

    SearchResultsContractsController.prototype.templatePath = "manage/views/contracts/line";

    function SearchResultsContractsController() {
      this.fetchReservations = bind(this.fetchReservations, this);
      this.fetchUsers = bind(this.fetchUsers, this);
      this.fetchContracts = bind(this.fetchContracts, this);
      this.fetch = bind(this.fetch, this);
      SearchResultsContractsController.__super__.constructor.apply(this, arguments);
      new App.LinesCellTooltipController({
        el: this.el
      });
      new App.UserCellTooltipController({
        el: this.el
      });
      new App.TakeBacksSendReminderController({
        el: this.el
      });
    }

    SearchResultsContractsController.prototype.fetch = function(page, target, callback) {
      return this.fetchContracts(page).done((function(_this) {
        return function(data) {
          var contracts, datum;
          contracts = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Contract.find(datum.id));
            }
            return results;
          })();
          return _this.fetchUsers(contracts).done(function() {
            return _this.fetchReservations(contracts).done(function() {
              return callback();
            });
          });
        };
      })(this));
    };

    SearchResultsContractsController.prototype.fetchContracts = function(page) {
      return App.Contract.ajaxFetch({
        data: $.param({
          search_term: this.searchTerm,
          global_contracts_search: true,
          page: page,
          status: ["open", "closed"]
        })
      });
    };

    SearchResultsContractsController.prototype.fetchUsers = function(contracts) {
      var ids;
      ids = _.uniq(_.map(contracts, function(r) {
        return r.user_id;
      }));
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.User.ajaxFetch({
        data: $.param({
          ids: ids,
          all: true,
          paginate: false
        })
      }).done((function(_this) {
        return function(data) {
          var datum, users;
          users = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.find(datum.id));
            }
            return results;
          })();
          return App.User.fetchDelegators(users);
        };
      })(this));
    };

    SearchResultsContractsController.prototype.fetchReservations = function(contracts) {
      var ids;
      ids = _.flatten(_.map(contracts, function(r) {
        return r.id;
      }));
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.Reservation.ajaxFetch({
        data: $.param({
          contract_ids: ids
        })
      });
    };

    return SearchResultsContractsController;

  })(App.SearchResultsController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchResultsItemsController = (function(superClass) {
    extend(SearchResultsItemsController, superClass);

    function SearchResultsItemsController() {
      this.fetchModels = bind(this.fetchModels, this);
      this.fetchItems = bind(this.fetchItems, this);
      this.fetch = bind(this.fetch, this);
      return SearchResultsItemsController.__super__.constructor.apply(this, arguments);
    }

    SearchResultsItemsController.prototype.model = "Item";

    SearchResultsItemsController.prototype.dependingOnModel = "Model";

    SearchResultsItemsController.prototype.templatePath = "manage/views/items/line";

    SearchResultsItemsController.prototype.type = "item";

    SearchResultsItemsController.prototype.fetch = function(page, target, callback) {
      return this.fetchItems(page).done((function(_this) {
        return function(data) {
          var datum, items;
          items = (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = data.length; j < len; j++) {
              datum = data[j];
              results.push(App[this.model].find(datum.id));
            }
            return results;
          }).call(_this);
          return _this.fetchModels(items).done(function() {
            return callback();
          });
        };
      })(this));
    };

    SearchResultsItemsController.prototype.fetchItems = function(page) {
      return App[this.model].ajaxFetch({
        data: $.param({
          search_term: this.searchTerm,
          type: this.type,
          page: page,
          current_inventory_pool: false
        })
      });
    };

    SearchResultsItemsController.prototype.fetchModels = function(items) {
      var ids;
      ids = _.uniq(_.map(items, function(i) {
        return i.model_id;
      }));
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App[this.dependingOnModel].ajaxFetch({
        data: $.param({
          ids: ids,
          paginate: false,
          include_package_models: true
        })
      });
    };

    return SearchResultsItemsController;

  })(App.SearchResultsController);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchResultsLicensesController = (function(superClass) {
    extend(SearchResultsLicensesController, superClass);

    function SearchResultsLicensesController() {
      return SearchResultsLicensesController.__super__.constructor.apply(this, arguments);
    }

    SearchResultsLicensesController.prototype.model = "License";

    SearchResultsLicensesController.prototype.templatePath = "manage/views/licenses/line";

    SearchResultsLicensesController.prototype.type = "license";

    return SearchResultsLicensesController;

  })(App.SearchResultsItemsController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchResultsModelsController = (function(superClass) {
    extend(SearchResultsModelsController, superClass);

    SearchResultsModelsController.prototype.model = "Model";

    SearchResultsModelsController.prototype.templatePath = "manage/views/models/line";

    SearchResultsModelsController.prototype.type = "model";

    function SearchResultsModelsController() {
      this.fetchAvailability = bind(this.fetchAvailability, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.fetch = bind(this.fetch, this);
      SearchResultsModelsController.__super__.constructor.apply(this, arguments);
      new App.TimeLineController({
        el: this.el
      });
    }

    SearchResultsModelsController.prototype.fetch = function(page, target, callback) {
      return this.fetchModels(page).done((function(_this) {
        return function(data) {
          var datum, models;
          models = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App[this.model].find(datum.id));
            }
            return results;
          }).call(_this);
          return _this.fetchAvailability(models).done(function() {
            return callback();
          });
        };
      })(this));
    };

    SearchResultsModelsController.prototype.fetchModels = function(page) {
      return App[this.model].ajaxFetch({
        data: $.param({
          search_term: this.searchTerm,
          type: this.type,
          page: page
        })
      });
    };

    SearchResultsModelsController.prototype.fetchAvailability = function(models) {
      var ids;
      ids = _.map(models, function(m) {
        return m.id;
      });
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.Availability.ajaxFetch({
        url: App.Availability.url() + "/in_stock",
        data: $.param({
          model_ids: ids
        })
      });
    };

    return SearchResultsModelsController;

  })(App.SearchResultsController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchResultsOptionsController = (function(superClass) {
    extend(SearchResultsOptionsController, superClass);

    SearchResultsOptionsController.prototype.model = "Option";

    SearchResultsOptionsController.prototype.templatePath = "manage/views/options/line";

    function SearchResultsOptionsController() {
      this.fetchOptions = bind(this.fetchOptions, this);
      this.fetch = bind(this.fetch, this);
      SearchResultsOptionsController.__super__.constructor.apply(this, arguments);
      new App.TimeLineController({
        el: this.el
      });
    }

    SearchResultsOptionsController.prototype.fetch = function(page, target, callback) {
      return this.fetchOptions(page).done((function(_this) {
        return function(data) {
          var datum, options;
          options = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Option.find(datum.id));
            }
            return results;
          })();
          return callback();
        };
      })(this));
    };

    SearchResultsOptionsController.prototype.fetchOptions = function(page) {
      return App.Option.ajaxFetch({
        data: $.param({
          search_term: this.searchTerm,
          page: page
        })
      });
    };

    return SearchResultsOptionsController;

  })(App.SearchResultsController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchResultsOrdersController = (function(superClass) {
    extend(SearchResultsOrdersController, superClass);

    SearchResultsOrdersController.prototype.model = "Order";

    SearchResultsOrdersController.prototype.templatePath = "manage/views/orders/line";

    function SearchResultsOrdersController() {
      this.fetchReservations = bind(this.fetchReservations, this);
      this.fetchUsers = bind(this.fetchUsers, this);
      this.fetchOrders = bind(this.fetchOrders, this);
      this.fetch = bind(this.fetch, this);
      SearchResultsOrdersController.__super__.constructor.apply(this, arguments);
      new App.LinesCellTooltipController({
        el: this.el
      });
      new App.UserCellTooltipController({
        el: this.el
      });
      new App.OrdersApproveController({
        el: this.el
      });
      new App.ContractsRejectController({
        el: this.el,
        async: true,
        callback: this.orderRejected
      });
    }

    SearchResultsOrdersController.prototype.fetch = function(page, target, callback) {
      return this.fetchOrders(page).done((function(_this) {
        return function(data) {
          var datum, orders;
          orders = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Order.find(datum.id));
            }
            return results;
          })();
          return _this.fetchUsers(orders).done(function() {
            return _this.fetchReservations(orders).done(function() {
              return callback();
            });
          });
        };
      })(this));
    };

    SearchResultsOrdersController.prototype.fetchOrders = function(page) {
      return App.Order.ajaxFetch({
        data: $.param({
          page: page,
          search_term: this.searchTerm,
          status: ["approved", "submitted", "rejected"]
        })
      });
    };

    SearchResultsOrdersController.prototype.fetchUsers = function(orders) {
      var ids;
      ids = _.uniq(_.map(orders, function(r) {
        return r.user_id;
      }));
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.User.ajaxFetch({
        data: $.param({
          ids: ids,
          paginate: false
        })
      }).done((function(_this) {
        return function(data) {
          var datum, users;
          users = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.find(datum.id));
            }
            return results;
          })();
          return App.User.fetchDelegators(users);
        };
      })(this));
    };

    SearchResultsOrdersController.prototype.fetchReservations = function(orders) {
      var ids;
      ids = _.flatten(_.map(orders, function(r) {
        return r.id;
      }));
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.Reservation.ajaxFetch({
        data: $.param({
          order_ids: ids
        })
      });
    };

    return SearchResultsOrdersController;

  })(App.SearchResultsController);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchResultsSoftwareController = (function(superClass) {
    extend(SearchResultsSoftwareController, superClass);

    function SearchResultsSoftwareController() {
      return SearchResultsSoftwareController.__super__.constructor.apply(this, arguments);
    }

    SearchResultsSoftwareController.prototype.model = "Software";

    SearchResultsSoftwareController.prototype.templatePath = "manage/views/software/line";

    SearchResultsSoftwareController.prototype.type = "software";

    return SearchResultsSoftwareController;

  })(App.SearchResultsModelsController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchResultsUsersController = (function(superClass) {
    extend(SearchResultsUsersController, superClass);

    function SearchResultsUsersController() {
      this.fetchUsers = bind(this.fetchUsers, this);
      this.fetch = bind(this.fetch, this);
      return SearchResultsUsersController.__super__.constructor.apply(this, arguments);
    }

    SearchResultsUsersController.prototype.model = "User";

    SearchResultsUsersController.prototype.templatePath = "manage/views/users/search_result_line";

    SearchResultsUsersController.prototype.fetch = function(page, target, callback) {
      return this.fetchUsers(page).done((function(_this) {
        return function() {
          return callback();
        };
      })(this));
    };

    SearchResultsUsersController.prototype.fetchUsers = function(page) {
      return App.User.ajaxFetch({
        data: $.param({
          search_term: this.searchTerm,
          page: page
        })
      }).done((function(_this) {
        return function(data) {
          var datum, users;
          users = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.find(datum.id));
            }
            return results;
          })();
          return App.User.fetchDelegators(users);
        };
      })(this));
    };

    return SearchResultsUsersController;

  })(App.SearchResultsController);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.GroupController = (function(superClass) {
    extend(GroupController, superClass);

    function GroupController() {
      GroupController.__super__.constructor.apply(this, arguments);
      new App.GroupPartitionsController({
        el: this.el.find("#models-allocations"),
        removeHandler: this.removePartitionHandler
      });
      new App.ManageUsersViaAutocompleteController({
        el: this.el.find("#users"),
        removeHandler: this.removeUserHandler,
        paramName: "group[users][][id]"
      });
    }

    GroupController.removeHandler = function(e) {
      e.preventDefault();
      return $(e.currentTarget).closest(".line").remove();
    };

    GroupController.prototype.removeUserHandler = GroupController.removeHandler;

    GroupController.prototype.removePartitionHandler = GroupController.removeHandler;

    return GroupController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.GroupEditController = (function(superClass) {
    extend(GroupEditController, superClass);

    function GroupEditController() {
      this.removePartitionHandler = bind(this.removePartitionHandler, this);
      return GroupEditController.__super__.constructor.apply(this, arguments);
    }

    GroupEditController.include(App.Modules.InlineEntryHandlers);

    GroupEditController.prototype.removeUserHandler = GroupEditController.prototype.strikeRemoveUserHandler;

    GroupEditController.prototype.removePartitionHandler = function(e) {
      var line, modelName, removeButton;
      e.preventDefault();
      removeButton = $(e.currentTarget);
      line = removeButton.closest(".line");
      modelName = line.find("[data-model-name]");
      if (modelName.hasClass("striked")) {
        modelName.removeClass("striked");
        line.find("[data-quantities]").removeClass("hidden");
        removeButton.text(_jed("Remove"));
        return line.find("[name*='_destroy']").val(null);
      } else {
        modelName.addClass("striked");
        line.find("[data-quantities]").addClass("hidden");
        removeButton.text(_jed("undo"));
        return line.find("[name*='_destroy']").val(1);
      }
    };

    return GroupEditController;

  })(App.GroupController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.GroupPartitionsController = (function(superClass) {
    extend(GroupPartitionsController, superClass);

    GroupPartitionsController.prototype.elements = {
      "input[data-search-models]": "input",
      "[data-models-list]": "modelsList"
    };

    GroupPartitionsController.prototype.events = {
      "preChange input[data-search-models]": "search",
      "click [data-remove-group]": "removeHandler"
    };

    function GroupPartitionsController() {
      this.select = bind(this.select, this);
      this.setupAutocomplete = bind(this.setupAutocomplete, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.search = bind(this.search, this);
      GroupPartitionsController.__super__.constructor.apply(this, arguments);
      this.input.preChange();
    }

    GroupPartitionsController.prototype.search = function() {
      if (!this.input.val().length) {
        return false;
      }
      return this.fetchModels().done((function(_this) {
        return function(data) {
          var datum;
          return _this.setupAutocomplete((function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Model.find(datum.id));
            }
            return results;
          })());
        };
      })(this));
    };

    GroupPartitionsController.prototype.fetchModels = function() {
      return App.Model.ajaxFetch({
        data: $.param({
          search_term: this.input.val(),
          borrowable: true
        })
      });
    };

    GroupPartitionsController.prototype.setupAutocomplete = function(models) {
      this.input.autocomplete({
        source: (function(_this) {
          return function(request, response) {
            return response(models);
          };
        })(this),
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        select: this.select
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("manage/views/groups/partitions/autocomplete_element", item)).data("value", item).appendTo(ul);
        };
      })(this);
      return this.input.autocomplete("search");
    };

    GroupPartitionsController.prototype.select = function(e, ui) {
      return App.Availability.ajaxFetch({
        url: App.Availability.url() + "/in_stock",
        data: $.param({
          model_ids: ui.item.id
        })
      }).done((function(_this) {
        return function(data) {
          var modelElement;
          modelElement = _this.modelsList.find("input[name='group[partitions_attributes][][model_id]'][value='" + ui.item.id + "']").closest(".line");
          if (modelElement.length) {
            return _this.modelsList.prepend(modelElement);
          } else {
            return _this.modelsList.prepend(App.Render("manage/views/groups/partitions/model_allocation_entry", App.Model.find(ui.item.id), {
              currentInventoryPool: App.InventoryPool.current
            }));
          }
        };
      })(this));
    };

    return GroupPartitionsController;

  })(Spine.Controller);

}).call(this);
(function() {
  window.App.HandOverAutocompleteController = (function() {
    function HandOverAutocompleteController(props, container, opts) {
      this.props = props;
      this.container = container;
      this.opts = opts;
    }

    HandOverAutocompleteController.prototype._render = function() {
      this.instance = ReactDOM.render(React.createElement(HandoverAutocomplete, this.props), this.container);
      return window.reactBarcodeScannerTarget = this.instance;
    };

    HandOverAutocompleteController.prototype.setProps = function(newProps) {
      _.extend(this.props, newProps);
      return this._render();
    };

    HandOverAutocompleteController.prototype.getInstance = function() {
      return this.instance;
    };

    return HandOverAutocompleteController;

  })();

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.HandOverController = (function(superClass) {
    extend(HandOverController, superClass);

    HandOverController.prototype.elements = {
      "#status": "status",
      "#lines": "reservationsContainer"
    };

    HandOverController.prototype.events = {
      "click [data-hand-over-selection]": "handOver",
      "click #swap-user": "swapUser"
    };

    function HandOverController() {
      this.validate = bind(this.validate, this);
      this.swapUser = bind(this.swapUser, this);
      this.handOver = bind(this.handOver, this);
      this.render = bind(this.render, this);
      this.fetchFunctionsSetup = bind(this.fetchFunctionsSetup, this);
      this.getLines = bind(this.getLines, this);
      this.fetchAvailability = bind(this.fetchAvailability, this);
      this.initalFetch = bind(this.initalFetch, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      HandOverController.__super__.constructor.apply(this, arguments);
      this.lineSelection = new App.LineSelectionController({
        el: this.el,
        markVisitLinesController: new App.MarkVisitLinesController({
          el: this.el
        })
      });
      this.fetchFunctionsSetup({
        "Model": "Item",
        "Software": "License"
      });
      this.initalFetch();
      new App.SwapModelController({
        el: this.el,
        user: this.user
      });
      new App.ReservationsDestroyController({
        el: this.el
      });
      new App.ReservationAssignItemController({
        el: this.el
      });
      new App.TimeLineController({
        el: this.el
      });
      new App.ReservationAssignOrCreateController({
        el: this.el.find("#assign-or-add"),
        user: this.user
      });
      new App.ReservationsEditController({
        el: this.el,
        user: this.user,
        hand_over: true
      });
      new App.OptionLineChangeController({
        el: this.el
      });
      new App.ModelCellTooltipController({
        el: this.el
      });
    }

    HandOverController.prototype.delegateEvents = function() {
      HandOverController.__super__.delegateEvents.apply(this, arguments);
      App.Reservation.on("change destroy refresh", (function(_this) {
        return function(data) {
          if ((data != null ? data.option_id : void 0) != null) {
            return _this.render(true);
          } else {
            return _this.fetchAvailability();
          }
        };
      })(this));
      return App.Reservation.on("update", (function(_this) {
        return function(data) {
          var fi, fl;
          if (_this.notFetchedItemIds().length) {
            fi = _this.fetchItems();
          }
          if (_this.notFetchedLicenseIds().length) {
            fl = _this.fetchLicenses();
          }
          if (fi || fl) {
            return $.when(fi, fl).done(function() {
              return _this.render(_this.initialAvailabilityFetched != null);
            });
          } else {
            return _this.render(_this.initialAvailabilityFetched != null);
          }
        };
      })(this));
    };

    HandOverController.prototype.initalFetch = function() {
      if (this.getLines().length) {
        if (this.notFetchedItemIds().length) {
          this.fetchItems();
        }
        if (this.notFetchedLicenseIds().length) {
          this.fetchLicenses();
        }
        return this.fetchAvailability();
      }
    };

    HandOverController.prototype.fetchAvailability = function() {
      var ids;
      this.render(false);
      ids = _.uniq(_.map(_.filter(this.getLines(), function(l) {
        return l.model_id != null;
      }), function(l) {
        return l.model().id;
      }));
      if (ids.length) {
        this.status.html(App.Render("manage/views/availabilities/loading"));
        return App.Availability.ajaxFetch({
          data: $.param({
            model_ids: ids,
            user_id: this.user.id
          })
        }).done((function(_this) {
          return function(data) {
            _this.initialAvailabilityFetched = true;
            _this.status.html(App.Render("manage/views/availabilities/loaded"));
            return _this.render(true);
          };
        })(this));
      } else {
        return this.status.html(App.Render("manage/views/users/hand_over/no_handover_found"));
      }
    };

    HandOverController.prototype.getLines = function() {
      return App.Reservation.all();
    };

    HandOverController.prototype.fetchFunctionsSetup = function(classTypePairs) {
      var fetchHelper, filterHelper;
      filterHelper = (function(_this) {
        return function(modelClass, itemClass) {
          return _.filter(_.compact(_.map(_this.getLines(), function(l) {
            if (l.model().constructor.name === modelClass) {
              return l.item_id;
            } else {
              return null;
            }
          })), function(id) {
            return App[itemClass].exists(id) == null;
          });
        };
      })(this);
      fetchHelper = (function(_this) {
        return function(className, ids) {
          return App[className].ajaxFetch({
            data: $.param({
              ids: ids,
              paginate: 'false'
            })
          });
        };
      })(this);
      return _.each(classTypePairs, (function(_this) {
        return function(itemClassName, modelClassName) {
          var filterFunctionName;
          filterFunctionName = "notFetched" + itemClassName + "Ids";
          _this[filterFunctionName] = function() {
            return filterHelper(modelClassName, itemClassName);
          };
          return _this["fetch" + itemClassName + "s"] = function() {
            return fetchHelper(itemClassName, _this[filterFunctionName]());
          };
        };
      })(this));
    };

    HandOverController.prototype.render = function(renderAvailability) {
      this.reservationsContainer.html(App.Render("manage/views/reservations/grouped_lines_with_action_date", App.Modules.HasLines.groupByDateRange(this.getLines(), false, "start_date"), {
        linePartial: "manage/views/reservations/hand_over_line",
        renderAvailability: renderAvailability
      }));
      return this.lineSelection.restore();
    };

    HandOverController.prototype.handOver = function() {
      var id;
      if (this.validate()) {
        return HandOverDialogUtil.loadHandOverDialogData({
          user: this.user,
          reservations: (function() {
            var i, len, ref, results;
            ref = App.LineSelectionController.selected;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              id = ref[i];
              results.push(App.Reservation.find(id));
            }
            return results;
          })()
        }, (function(_this) {
          return function(reservations, purpose) {
            return new App.HandOverDialogController(reservations, _this.user, purpose);
          };
        })(this));
      } else {
        return App.Flash({
          type: "error",
          message: _jed('End Date cannot be in the past')
        });
      }
    };

    HandOverController.prototype.swapUser = function() {
      var id, reservations;
      reservations = (function() {
        var i, len, ref, results;
        ref = App.LineSelectionController.selected;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          id = ref[i];
          results.push(App.Reservation.find(id));
        }
        return results;
      })();
      return new App.SwapUsersController({
        reservations: reservations,
        user: this.user
      });
    };

    HandOverController.prototype.validate = function() {
      var id, reservations;
      reservations = (function() {
        var i, len, ref, results;
        ref = App.LineSelectionController.selected;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          id = ref[i];
          results.push(App.Reservation.find(id));
        }
        return results;
      })();
      return _.all(reservations, function(line) {
        return !moment(line.end_date).isBefore(moment().format("YYYY-MM-DD"));
      });
    };

    return HandOverController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.HandOverDialogController = (function(superClass) {
    extend(HandOverDialogController, superClass);

    HandOverDialogController.prototype.events = {
      "click [data-hand-over]": "handOver"
    };

    HandOverDialogController.prototype.elements = {
      "#purpose": "purposeTextArea",
      "#note": "noteTextArea",
      "#error": "errorContainer"
    };

    function HandOverDialogController(reservations, user, purpose) {
      this.validateDelegatedUser = bind(this.validateDelegatedUser, this);
      this.toggleAddPurpose = bind(this.toggleAddPurpose, this);
      this.validatePurpose = bind(this.validatePurpose, this);
      this.handOver = bind(this.handOver, this);
      this.setupModal = bind(this.setupModal, this);
      this.autoFocus = bind(this.autoFocus, this);
      this.reservations = reservations;
      this.user = user;
      this.purpose = purpose;
      this.setupModal();
      HandOverDialogController.__super__.constructor.apply(this, arguments);
      this.delegatedUser = null;
      this.autoFocus();
    }

    HandOverDialogController.prototype.autoFocus = function() {
      if (this.purposeTextArea.length) {
        return this.purposeTextArea.focus();
      } else {
        return this.noteTextArea.focus();
      }
    };

    HandOverDialogController.prototype.setupModal = function() {
      var data, jModal, reservations;
      reservations = _.map(this.reservations, function(line) {
        line.start_date = moment().format("YYYY-MM-DD");
        return line;
      });
      this.itemsCount = _.reduce(reservations, (function(mem, l) {
        return l.quantity + mem;
      }), 0);
      data = {
        groupedLines: App.Modules.HasLines.groupByDateRange(reservations, true),
        user: this.user,
        itemsCount: this.itemsCount,
        purpose: this.purpose
      };
      jModal = $("<div class='modal ui-modal medium' role='dialog' tabIndex='-1' />");
      this.modal = new App.Modal(jModal, (function(_this) {
        return function() {
          return ReactDOM.unmountComponentAtNode(jModal.get()[0]);
        };
      })(this));
      this.handOverDialog = ReactDOM.render(React.createElement(HandOverDialog, {
        data: data,
        other: {
          showAddPurpose: _.any(this.reservations, function(l) {
            return l.purpose_id == null;
          }),
          currentInventoryPool: App.InventoryPool.current
        },
        onDelegatedUser: (function(_this) {
          return function(delegatedUser) {
            return _this.delegatedUser = delegatedUser;
          };
        })(this)
      }), this.modal.el.get()[0]);
      return this.el = this.modal.el;
    };

    HandOverDialogController.prototype.handOver = function() {
      var ref;
      if (this.purpose.length) {
        if (this.purposeTextArea.val()) {
          this.purpose = this.purpose + "; " + (this.purposeTextArea.val());
        }
      } else {
        this.purpose = this.purposeTextArea.val();
      }
      if (this.validatePurpose() && this.validateDelegatedUser()) {
        return App.Contract.create({
          user_id: this.user.id,
          line_ids: _.map(this.reservations, function(l) {
            return l.id;
          }),
          purpose: this.purpose,
          note: this.noteTextArea.val(),
          delegated_user_id: (ref = this.delegatedUser) != null ? ref.id : void 0
        }).fail((function(_this) {
          return function(e) {
            _this.errorContainer.find("strong").html(e.responseText);
            return _this.errorContainer.removeClass("hidden");
          };
        })(this)).done((function(_this) {
          return function(data) {
            _this.modal.undestroyable();
            _this.modal.el.detach();
            return new App.DocumentsAfterHandOverController({
              contract: new App.Contract(data),
              itemsCount: _this.itemsCount
            });
          };
        })(this));
      }
    };

    HandOverDialogController.prototype.validatePurpose = function() {
      if (App.InventoryPool.current.required_purpose && !this.purpose.length) {
        this.errorContainer.find("strong").html(_jed("Specification of the purpose is required"));
        this.errorContainer.removeClass("hidden");
        this.purposeTextArea.focus();
        return false;
      }
      return true;
    };

    HandOverDialogController.prototype.toggleAddPurpose = function() {};

    HandOverDialogController.prototype.validateDelegatedUser = function() {
      if (this.user.isDelegation() && !this.delegatedUser) {
        this.errorContainer.find("strong").html(_jed("Specification of the contact person is required"));
        this.errorContainer.removeClass("hidden");
        return false;
      } else {
        return true;
      }
    };

    return HandOverDialogController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.HandOversDeleteController = (function(superClass) {
    extend(HandOversDeleteController, superClass);

    function HandOversDeleteController() {
      this.onClick = bind(this.onClick, this);
      return HandOversDeleteController.__super__.constructor.apply(this, arguments);
    }

    HandOversDeleteController.prototype.events = {
      "click [data-hand-over-delete]": "onClick"
    };

    HandOversDeleteController.prototype.onClick = function(e) {
      var id, trigger;
      trigger = $(e.currentTarget);
      id = trigger.closest("[data-id]").data('id');
      return $.ajax({
        url: "/manage/" + App.InventoryPool.current.id + "/visits/" + id,
        type: "post",
        data: {
          _method: "delete"
        },
        success: (function(_this) {
          return function(response) {
            var button;
            button = trigger.closest(".line-actions");
            return button.html(App.Render("manage/views/hand_overs/deleted"));
          };
        })(this)
      });
    };

    return HandOversDeleteController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.InventoryExpandController = (function(superClass) {
    extend(InventoryExpandController, superClass);

    function InventoryExpandController() {
      this.renderChildren = bind(this.renderChildren, this);
      this.updateChildren = bind(this.updateChildren, this);
      this.setupChildren = bind(this.setupChildren, this);
      this.fetchPackageModels = bind(this.fetchPackageModels, this);
      this.fetchPackageItems = bind(this.fetchPackageItems, this);
      this.fetchData = bind(this.fetchData, this);
      this.open = bind(this.open, this);
      this.close = bind(this.close, this);
      this.toggle = bind(this.toggle, this);
      return InventoryExpandController.__super__.constructor.apply(this, arguments);
    }

    InventoryExpandController.prototype.events = {
      "click [data-type='inventory-expander']": "toggle"
    };

    InventoryExpandController.prototype.toggle = function(e) {
      var target;
      target = $(e.currentTarget);
      if ((target.data("_expanded") != null) && target.data("_expanded") === true) {
        return this.close(target);
      } else {
        return this.open(target);
      }
    };

    InventoryExpandController.prototype.close = function(target) {
      var line;
      target.data("_expanded", false);
      target.find(".arrow").removeClass("down right").addClass("right");
      line = target.closest("[data-id]");
      return line.data("_children").detach();
    };

    InventoryExpandController.prototype.open = function(target) {
      var line;
      target.data("_expanded", true);
      target.find(".arrow").removeClass("down right").addClass("down");
      line = target.closest("[data-id]");
      if (_.contains(["model", "software"], line.data("type")) && (line.data("_children") == null)) {
        this.fetchData(line, this.updateChildren);
      }
      return this.setupChildren(line);
    };

    InventoryExpandController.prototype.fetchData = function(line, callback) {
      var itemIds, model, ref, software;
      if (line.data("type") === "model") {
        model = App.Model.find(line.data("id"));
      }
      if (line.data("type") === "software") {
        software = App.Software.find(line.data("id"));
      }
      itemIds = _.map(((ref = model != null ? model.items() : void 0) != null ? ref : software != null ? software.licenses() : void 0).all(), function(i) {
        return i.id;
      });
      return this.fetchPackageItems(line, itemIds).done((function(_this) {
        return function(data) {
          return _this.fetchPackageModels(line, itemIds).done(function() {
            return callback(line);
          });
        };
      })(this));
    };

    InventoryExpandController.prototype.fetchPackageItems = function(line, itemIds) {
      if (line.data("is_package") === true) {
        return App.Item.ajaxFetch({
          data: $.param({
            package_ids: itemIds,
            paginate: false
          })
        });
      } else {
        return {
          done: function(c) {
            return c();
          }
        };
      }
    };

    InventoryExpandController.prototype.fetchPackageModels = function(line, itemIds) {
      var children, id, items, modelIds;
      if (line.data("is_package") === true) {
        items = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = itemIds.length; j < len; j++) {
            id = itemIds[j];
            results.push(App.Item.find(id));
          }
          return results;
        })();
        children = _.flatten(_.map(items, function(i) {
          return i.children().all();
        }));
        modelIds = _.uniq(_.map(children, function(c) {
          return c.model_id;
        }));
        return App.Model.ajaxFetch({
          data: $.param({
            ids: modelIds,
            paginate: false,
            include_package_models: true
          })
        });
      } else {
        return {
          done: function(c) {
            return c();
          }
        };
      }
    };

    InventoryExpandController.prototype.setupChildren = function(line) {
      if (line.data("_children") == null) {
        this.renderChildren(line);
      }
      return line.after(line.data("_children"));
    };

    InventoryExpandController.prototype.updateChildren = function(line) {
      var currentContainer;
      currentContainer = line.data("_children");
      this.renderChildren(line, "additionalDataFetched");
      return currentContainer != null ? currentContainer.replaceWith(line.data("_children")) : void 0;
    };

    InventoryExpandController.prototype.renderChildren = function(line, additionalDataFetched) {
      var childrenContainer, data, record;
      if (additionalDataFetched == null) {
        additionalDataFetched = false;
      }
      record = App[_.string.classify(line.data("type"))].find(line.data("id"));
      data = (function() {
        switch (line.data("type")) {
          case "model":
            return record.items().all();
          case "software":
            return record.licenses().all();
          case "item":
            return record.children().all();
        }
      })();
      childrenContainer = $("<div class='group-of-lines'></div>");
      childrenContainer.html($(App.Render("manage/views/inventory/line", data, {
        additionalDataFetched: additionalDataFetched,
        accessRight: App.AccessRight,
        currentUserRole: App.User.current.role
      })));
      return line.data("_children", childrenContainer);
    };

    return InventoryExpandController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  App.InventoryHelperController = (function(superClass) {
    extend(InventoryHelperController, superClass);

    InventoryHelperController.prototype.elements = {
      "#field-selection": "fieldSelection",
      "#field-input": "fieldInput",
      "#item-selection": "itemSelection",
      "#flexible-fields": "flexibleFields",
      "#item-section": "itemSection",
      "#item-input": "itemInput",
      "#item-edit": "editButton",
      "#save-edit": "saveButton",
      "#cancel-edit": "cancelButton",
      "#notifications": "notifications",
      "#no-fields-message": "noFieldsMessage",
      "#field-form-left-side": "formLeftSide",
      "#field-form-right-side": "formRightSide"
    };

    InventoryHelperController.prototype.events = {
      "focus #field-input": "setupFieldAutocomplete",
      "click [data-type='remove-field']": "removeField",
      "change #field-selection [data-type='field']": "toggleChildren",
      "submit #item-selection": "applyFields",
      "click #item-edit": "editItem",
      "click #cancel-edit": "cancelEdit",
      "click #save-edit": "saveItem",
      "change #field-selection input[name='item[owner][id]']": "showOwnerChangeNotification"
    };

    function InventoryHelperController() {
      this.showOwnerChangeNotification = bind(this.showOwnerChangeNotification, this);
      this.disableFlexibleFields = bind(this.disableFlexibleFields, this);
      this.setupSavedItem = bind(this.setupSavedItem, this);
      this.saveItem = bind(this.saveItem, this);
      this.cancelEdit = bind(this.cancelEdit, this);
      this.editItem = bind(this.editItem, this);
      this.updateItem = bind(this.updateItem, this);
      this.fetchItemWithFlexibleFields = bind(this.fetchItemWithFlexibleFields, this);
      this.fetchItem = bind(this.fetchItem, this);
      this.setupItemEdit = bind(this.setupItemEdit, this);
      this.highlightChangedFields = bind(this.highlightChangedFields, this);
      this.setupAppliedItem = bind(this.setupAppliedItem, this);
      this.prepareRequestData = bind(this.prepareRequestData, this);
      this.applyFields = bind(this.applyFields, this);
      this.addField = bind(this.addField, this);
      this.fetchItems = bind(this.fetchItems, this);
      this.setupItemAutocomplete = bind(this.setupItemAutocomplete, this);
      this.toggleChildren = bind(this.toggleChildren, this);
      this.removeField = bind(this.removeField, this);
      this.selectField = bind(this.selectField, this);
      this.getFields = bind(this.getFields, this);
      this.fetchFields = bind(this.fetchFields, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      InventoryHelperController.__super__.constructor.apply(this, arguments);
      this.fetchFields().done((function(_this) {
        return function() {
          if (_this.fieldInput.is(":focus")) {
            return _this.setupFieldAutocomplete();
          }
        };
      })(this));
      this.setupItemAutocomplete();
    }

    InventoryHelperController.prototype.delegateEvents = function() {
      InventoryHelperController.__super__.delegateEvents.apply(this, arguments);
      return this.el.on("submit", "form", (function(_this) {
        return function(e) {
          return e.preventDefault();
        };
      })(this));
    };

    InventoryHelperController.prototype.fetchFields = function() {
      return App.Field.ajaxFetch({
        data: $.param({
          target_type: "item"
        })
      });
    };

    InventoryHelperController.prototype.setupFieldAutocomplete = function() {
      this.fieldInput.autocomplete({
        source: this.getFields,
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        select: this.selectField,
        minLength: 0
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("views/autocomplete/element", item)).data("value", item).appendTo(ul);
        };
      })(this);
      return this.fieldInput.autocomplete("search");
    };

    InventoryHelperController.prototype.getFields = function(request, response) {
      var fields;
      fields = _.filter(App.Field.all(), (function(_this) {
        return function(field) {
          return (field.getLabel().match(new RegExp(request.term, "i")) != null) && !App.Field.isPresent(field, _this.fieldSelection) && (field.visibility_dependency_field_id == null) && (field.values_dependency_field_id == null) && field.id !== 'attachments';
        };
      })(this));
      return response(_.map(_.sortBy(fields, function(field) {
        return field.getLabel();
      }), function(field) {
        return {
          label: field.getLabel(),
          value: field.value,
          field: field
        };
      }));
    };

    InventoryHelperController.prototype.selectField = function(e, ui) {
      var childrenWithValueDependency, field, i, len;
      this.addField(ui.item.field);
      this.fieldInput.val("").autocomplete("destroy").blur();
      childrenWithValueDependency = _.filter(App.Field.all(), function(f) {
        return f.values_dependency_field_id === ui.item.field.id;
      });
      for (i = 0, len = childrenWithValueDependency.length; i < len; i++) {
        field = childrenWithValueDependency[i];
        new App.ValuesDependencyFieldController({
          el: this.el,
          renderData: {
            writeable: true,
            removeable: true,
            fieldColor: "white"
          },
          parentField: ui.item.field,
          childField: field
        });
      }
      return false;
    };

    InventoryHelperController.prototype.removeField = function(e) {
      var child, field, i, j, len, len1, parent, ref, ref1, target;
      target = $(e.currentTarget).closest("[data-type='field']");
      field = App.Field.find(target.data("id"));
      ref = field.children();
      for (i = 0, len = ref.length; i < len; i++) {
        child = ref[i];
        this.fieldSelection.find("[name='" + (child.getFormName()) + "']").closest("#" + child.id).remove();
      }
      ref1 = field.childrenWithValueDependency();
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        child = ref1[j];
        this.fieldSelection.find("[name='" + (child.getFormName()) + "']").closest("#" + child.id).remove();
      }
      if (parent = field.parentWithValueDependency()) {
        this.fieldSelection.find("[name='" + (parent.getFormName()) + "']").closest("#" + parent.id).remove();
      }
      target.closest("#" + field.id).remove();
      if (!this.fieldSelection.find("[data-type='field']").length) {
        return this.noFieldsMessage.removeClass("hidden");
      }
    };

    InventoryHelperController.prototype.toggleChildren = function(e) {
      var field, ref;
      field = (ref = e.field) != null ? ref : $(e.currentTarget).closest("[data-type='field']");
      return App.Field.toggleChildren(field, this.fieldSelection, {
        writeable: true,
        removeable: true,
        fieldColor: "white"
      });
    };

    InventoryHelperController.prototype.setupItemAutocomplete = function() {
      return this.itemInput.autocomplete({
        source: (function(_this) {
          return function(request, response) {
            return _this.fetchItems(request.term).done(function(data) {
              var datum, items;
              items = (function() {
                var i, len, results;
                results = [];
                for (i = 0, len = data.length; i < len; i++) {
                  datum = data[i];
                  results.push(App.Item.find(datum.id));
                }
                return results;
              })();
              return response(items);
            });
          };
        })(this),
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        select: (function(_this) {
          return function(e, ui) {
            _this.itemInput.val(ui.item.inventory_code);
            return _this.applyFields();
          };
        })(this),
        minLength: 0
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("manage/views/inventory/helper/item_autocomplete_element", item)).data("value", item).appendTo(ul);
        };
      })(this);
    };

    InventoryHelperController.prototype.fetchItems = function(term) {
      return App.Item.ajaxFetch({
        data: $.param({
          search_term: term
        })
      });
    };

    InventoryHelperController.prototype.addField = function(field) {
      var target, template;
      if (App.Field.isPresent(field, this.fieldSelection)) {
        return true;
      }
      if (!this.fieldSelection.find("[data-type='field']").length) {
        this.noFieldsMessage.addClass("hidden");
      }
      target = this.formLeftSide.find("[data-type='field']").length <= this.formRightSide.find("[data-type='field']").length ? this.formLeftSide : this.formRightSide;
      template = $(App.Render("manage/views/items/field", {}, {
        field: field,
        writeable: true,
        removeable: true,
        fieldColor: "white"
      }));
      target.append(template);
      return this.toggleChildren({
        field: target.find("[data-type='field']")
      });
    };

    InventoryHelperController.prototype.applyFields = function() {
      var data, inventoryCode;
      this.resetNotifications();
      inventoryCode = this.itemInput.val();
      this.itemInput.val("").blur();
      App.Flash.reset();
      if (!inventoryCode.length) {
        return App.Flash({
          type: "error",
          message: _jed('Please provide an inventory code')
        });
      } else if (!App.Field.validate(this.fieldSelection)) {
        return App.Flash({
          type: "error",
          message: _jed('Please provide all required fields')
        });
      } else {
        data = this.prepareRequestData();
        return this.fetchItem(inventoryCode, (function(_this) {
          return function(item) {
            return _this.updateItem(item, data).fail(function(e, status) {
              return _this.fetchItemWithFlexibleFields(item).done(function(itemData) {
                _this.currentItemData = itemData;
                return _this.setupAppliedItem("error");
              });
            }).done(function(data) {
              _this.currentItemData = data;
              return _this.setupAppliedItem("success");
            });
          };
        })(this));
      }
    };

    InventoryHelperController.prototype.prepareRequestData = function() {
      var field, i, len, ref, serial;
      serial = this.fieldSelection.serializeArray();
      ref = _.filter(App.Field.all(), function(f) {
        return f.exclude_from_submit;
      });
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        serial = _.reject(serial, function(s) {
          return s.name === field.getFormName();
        });
      }
      return serial.concat([
        {
          name: "item[skip_serial_number_validation]",
          value: true
        }
      ]);
    };

    InventoryHelperController.prototype.setupAppliedItem = function(status) {
      var callback;
      callback = (function(_this) {
        return function() {
          if (_this.currentItemData.owner_id === App.InventoryPool.current.id || _this.currentItemData.inventory_pool_id === App.InventoryPool.current.id) {
            _this.editButton.removeClass("hidden");
            _this.saveButton.addClass("hidden");
            _this.cancelButton.addClass("hidden");
          }
          _this.highlightChangedFields(_this.fieldSelection.find(".field"), status);
          return $(document).scrollTop(_this.itemSection.offset().top);
        };
      })(this);
      return this.setupItemEdit(false, callback);
    };

    InventoryHelperController.prototype.highlightChangedFields = function(fields, status) {
      var fieldEl, i, len, results;
      results = [];
      for (i = 0, len = fields.length; i < len; i++) {
        fieldEl = fields[i];
        results.push(this.flexibleFields.find(".field[data-id='" + ($(fieldEl).data("id")) + "']").addClass(status));
      }
      return results;
    };

    InventoryHelperController.prototype.setupItemEdit = function(writeable, callback) {
      var replacement;
      if (this.flexibleFieldsController != null) {
        replacement = this.flexibleFields.clone(false);
        this.flexibleFields.replaceWith(replacement);
        this.flexibleFieldsController.release();
        this.flexibleFields = replacement;
      }
      return this.flexibleFieldsController = new App.ItemFlexibleFieldsController({
        el: this.flexibleFields,
        itemData: this.currentItemData,
        writeable: writeable,
        hideable: true,
        excludeIds: ['attachments'],
        dependencyValuesCallback: callback,
        showInitialFlashNotice: true
      });
    };

    InventoryHelperController.prototype.fetchItem = function(inventoryCode, callback) {
      return App.Item.ajaxFetch({
        data: $.param({
          inventory_code: inventoryCode
        })
      }).done((function(_this) {
        return function(data) {
          if (data.length) {
            return callback(App.Item.find(data[0].id));
          } else {
            return App.Flash({
              type: "error",
              message: _jed("The Inventory Code %s was not found.", inventoryCode)
            });
          }
        };
      })(this));
    };

    InventoryHelperController.prototype.fetchItemWithFlexibleFields = function(item) {
      return App.Item.ajax().find(item.id, {
        data: $.param({
          "for": "flexibleFields"
        })
      });
    };

    InventoryHelperController.prototype.updateItem = function(item, data) {
      var h;
      if (!data.length) {
        h = {
          always: function(c) {
            return c();
          },
          fail: function(c) {
            return c();
          },
          done: function(c) {
            return c();
          }
        };
        return h;
      } else {
        return item.updateWithFieldData(data).fail((function(_this) {
          return function(e) {
            return _this.setNotification(e.responseJSON.message, "error");
          };
        })(this));
      }
    };

    InventoryHelperController.prototype.setNotification = function(text, status) {
      return this.notifications.html(App.Render("manage/views/inventory/helper/" + status, {
        text: text
      }));
    };

    InventoryHelperController.prototype.resetNotifications = function() {
      this.notifications.html("");
      return App.Flash.reset();
    };

    InventoryHelperController.prototype.editItem = function() {
      this.editButton.addClass("hidden");
      this.saveButton.removeClass("hidden");
      this.cancelButton.removeClass("hidden");
      this.setupItemEdit(true);
      this.resetNotifications();
      if (this.currentItemData.owner_id !== App.InventoryPool.current.id) {
        return this.setNotification((_jed("You are not the owner of this item")) + " " + (_jed("therefore you may not be able to change some of these fields")), "error");
      }
    };

    InventoryHelperController.prototype.cancelEdit = function() {
      this.editButton.removeClass("hidden");
      this.saveButton.addClass("hidden");
      this.cancelButton.addClass("hidden");
      this.setupItemEdit(false);
      this.resetNotifications();
      return this.resetNotifications();
    };

    InventoryHelperController.prototype.saveItem = function() {
      var item;
      if (this.flexibleFieldsController.validate()) {
        item = App.Item.find(this.currentItemData.id);
        this.updateItem(item, this.prepareRequestData()).done((function(_this) {
          return function() {
            return _this.fetchItemWithFlexibleFields(item).done(function(itemData) {
              _this.currentItemData = itemData;
              return _this.setupSavedItem();
            });
          };
        })(this));
        return this.disableFlexibleFields();
      }
    };

    InventoryHelperController.prototype.setupSavedItem = function() {
      this.setupItemEdit(false);
      this.editButton.removeClass("hidden");
      this.saveButton.addClass("hidden");
      this.cancelButton.addClass("hidden");
      this.resetNotifications();
      return this.setNotification(_jed("%s successfully saved", _jed("Item")), "success");
    };

    InventoryHelperController.prototype.disableFlexibleFields = function() {
      return this.flexibleFields.find("input,textarea,select").prop("disabled", true);
    };

    InventoryHelperController.prototype.showOwnerChangeNotification = function() {
      return App.Flash({
        type: "notice",
        message: _jed("If you transfer an item to a different inventory pool it's not visible for you anymore.")
      });
    };

    return InventoryHelperController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.InventoryIndexController = (function(superClass) {
    extend(InventoryIndexController, superClass);

    InventoryIndexController.prototype.elements = {
      "#inventory": "list",
      "#csv-export": "csvExportButton",
      "#excel-export": "excelExportButton",
      "#categories": "categoriesContainer",
      "[data-filter]": "filterElement"
    };

    InventoryIndexController.prototype.events = {
      "click #categories-toggle": "toggleCategories"
    };

    function InventoryIndexController() {
      this.toggleFiltersVisibility = bind(this.toggleFiltersVisibility, this);
      this.closeCategories = bind(this.closeCategories, this);
      this.openCategories = bind(this.openCategories, this);
      this.toggleCategories = bind(this.toggleCategories, this);
      this.render = bind(this.render, this);
      this.getData = bind(this.getData, this);
      this.fetchLicenses = bind(this.fetchLicenses, this);
      this.fetchItems = bind(this.fetchItems, this);
      this.fetchAvailability = bind(this.fetchAvailability, this);
      this.fetchInventory = bind(this.fetchInventory, this);
      this.fetch = bind(this.fetch, this);
      this.updateExportButtons = bind(this.updateExportButtons, this);
      this.reset = bind(this.reset, this);
      InventoryIndexController.__super__.constructor.apply(this, arguments);
      this.pagination = new App.ListPaginationController({
        el: this.list,
        fetch: this.fetch
      });
      this.search = new App.ListSearchController({
        el: this.el.find("#list-search"),
        reset: this.reset
      });
      this.tabs = new App.ListTabsController({
        el: this.el.find("#list-tabs"),
        reset: this.reset
      });
      this.filter = new App.ListFiltersController({
        el: this.filterElement,
        reset: this.reset
      });
      this.range = new App.ListRangeController({
        el: this.filterElement,
        reset: this.reset
      });
      new App.TimeLineController({
        el: this.el
      });
      new App.InventoryExpandController({
        el: this.el
      });
      [this.csvExportButton, this.excelExportButton].map(function(exportButton) {
        return exportButton.data("href", exportButton.attr("href"));
      });
      this.reset();
    }

    InventoryIndexController.prototype.reset = function() {
      this.toggleFiltersVisibility();
      this.inventory = {};
      _.invoke([App.Item, App.License, App.Model, App.Software, App.Option], function() {
        return this.deleteAll();
      });
      this.updateExportButtons();
      this.list.html(App.Render("manage/views/lists/loading"));
      return this.fetch(1, this.list);
    };

    InventoryIndexController.prototype.updateExportButtons = function() {
      var data, ref;
      data = this.getData();
      if (data.software) {
        data.type = "license";
      }
      if ((ref = this.search.term()) != null ? ref.length : void 0) {
        data.search_term = this.search.term();
      }
      return [this.csvExportButton, this.excelExportButton].map(function(exportButton) {
        return exportButton.attr("href", URI(exportButton.data("href")).query(data).toString());
      });
    };

    InventoryIndexController.prototype.fetch = function(page, target) {
      return this.fetchInventory(page).done((function(_this) {
        return function() {
          return _this.fetchAvailability(page).done(function() {
            return _this.fetchItems(page).done(function() {
              return _this.fetchLicenses(page).done(function() {
                return _this.render(target, _this.inventory[page], page);
              });
            });
          });
        };
      })(this));
    };

    InventoryIndexController.prototype.fetchInventory = function(page) {
      var ref, ref1;
      return App.Inventory.fetch($.extend(this.getData(), {
        page: page,
        search_term: this.search.term(),
        category_id: (ref = this.categoriesFilter) != null ? (ref1 = ref.getCurrent()) != null ? ref1.id : void 0 : void 0,
        include_package_models: true,
        sort: "name",
        order: "ASC"
      })).done((function(_this) {
        return function(data, status, xhr) {
          var datum, inventory, j, len;
          _this.pagination.set(JSON.parse(xhr.getResponseHeader("X-Pagination")));
          inventory = [];
          for (j = 0, len = data.length; j < len; j++) {
            datum = data[j];
            inventory.push(new App.Inventory.findOrCreate(datum));
          }
          return _this.inventory[page] = inventory;
        };
      })(this));
    };

    InventoryIndexController.prototype.fetchAvailability = function(page) {
      var ids, models;
      models = _.filter(this.inventory[page], function(i) {
        return _.contains(["Model", "Software"], i.constructor.className);
      });
      ids = _.map(models, function(m) {
        return m.id;
      });
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.Availability.ajaxFetch({
        url: App.Availability.url() + "/in_stock",
        data: $.param({
          model_ids: ids
        })
      });
    };

    InventoryIndexController.prototype.fetchItems = function(page) {
      var ids, models;
      models = _.filter(this.inventory[page], function(i) {
        return i.constructor.className === "Model";
      });
      ids = _.map(models, function(m) {
        return m.id;
      });
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.Item.ajaxFetch({
        data: $.param($.extend(this.getData(), {
          model_ids: ids,
          paginate: false,
          search_term: this.search.term(),
          all: true
        }))
      });
    };

    InventoryIndexController.prototype.fetchLicenses = function(page) {
      var ids, software;
      software = _.filter(this.inventory[page], function(i) {
        return i.constructor.className === "Software";
      });
      ids = _.map(software, function(s) {
        return s.id;
      });
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.License.ajaxFetch({
        data: $.param($.extend(this.getData(), {
          model_ids: ids,
          paginate: false,
          search_term: this.search.term(),
          all: true
        }))
      });
    };

    InventoryIndexController.prototype.getData = function() {
      return _.clone($.extend(this.tabs.getData(), this.filter.getData()));
    };

    InventoryIndexController.prototype.render = function(target, data, page) {
      if (data != null) {
        if (data.length) {
          target.html(App.Render("manage/views/inventory/line", data, {
            accessRight: App.AccessRight,
            currentUserRole: App.User.current.role
          }));
          if (page === 1) {
            return this.pagination.renderPlaceholders();
          }
        } else {
          return target.html(App.Render("manage/views/lists/no_results"));
        }
      }
    };

    InventoryIndexController.prototype.toggleCategories = function() {
      if (this.categoriesFilter == null) {
        this.categoriesFilter = new App.CategoriesFilterController({
          el: this.categoriesContainer,
          filter: this.reset
        });
      }
      if (this.categoriesContainer.hasClass("hidden")) {
        return this.openCategories();
      } else {
        return this.closeCategories();
      }
    };

    InventoryIndexController.prototype.openCategories = function() {
      this.list.addClass("col4of5");
      return this.categoriesContainer.addClass("col1of5").removeClass("hidden");
    };

    InventoryIndexController.prototype.closeCategories = function() {
      this.list.removeClass("col4of5");
      return this.categoriesContainer.removeClass("col1of5").addClass("hidden");
    };

    InventoryIndexController.prototype.toggleFiltersVisibility = function() {
      var arr;
      if (this.tabs.getData().type === "option") {
        return this.filterElement.addClass("hidden");
      } else {
        this.filterElement.removeClass("hidden");
        if (this.filterElement.find("select[name='used']").val() === "false") {
          return this.filterElement.find("select[name!='used'], label.button:has(input[type='checkbox'])").hide();
        } else {
          this.filterElement.find("select[name!='used'], label.button:has(input[type='checkbox'])").show();
          arr = this.filterElement.find("select[name!='used'], input[type='checkbox']").serializeArray();
          if (_.any(arr, function(x) {
            return x.value !== "";
          })) {
            return this.filterElement.find("select[name='used']").hide();
          } else {
            return this.filterElement.find("select[name='used']").show();
          }
        }
      }
    };

    return InventoryIndexController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.InventoryPoolDailyController = (function(superClass) {
    extend(InventoryPoolDailyController, superClass);

    InventoryPoolDailyController.prototype.events = {
      "click #datepicker": "toggleDatepicker"
    };

    InventoryPoolDailyController.prototype.elements = {
      "#datepicker-input": "datepickerInput",
      "#daily-navigation": "dailyNavigation",
      "#workload": "workloadContainer"
    };

    function InventoryPoolDailyController() {
      this.updateNavigationLinks = bind(this.updateNavigationLinks, this);
      this.toggleDatepicker = bind(this.toggleDatepicker, this);
      this.renderWorkload = bind(this.renderWorkload, this);
      this.fetchWorkload = bind(this.fetchWorkload, this);
      this.fetchData = bind(this.fetchData, this);
      InventoryPoolDailyController.__super__.constructor.apply(this, arguments);
      this.visits = [];
      this.datepickerOpen = false;
      this.fetchData();
    }

    InventoryPoolDailyController.prototype.fetchData = function() {
      return this.fetchWorkload();
    };

    InventoryPoolDailyController.prototype.fetchWorkload = function() {
      if (this.workload != null) {
        return true;
      }
      return App.Workload.ajaxFetch({
        data: $.param({
          date: this.date
        })
      }).done((function(_this) {
        return function(workload) {
          _this.workload = new App.Workload(workload);
          return _this.renderWorkload();
        };
      })(this));
    };

    InventoryPoolDailyController.prototype.renderWorkload = function() {
      this.workloadContainer.html(App.Render("manage/views/inventory_pools/daily/workload"));
      return this.workloadContainer.find(".bar-chart").jqBarGraph({
        data: this.workload.data,
        colors: ['#999999', '#cccccc'],
        gridColors: ['#bbbbbb', '#dddddd'],
        width: 960,
        height: 300,
        barSpace: 105,
        animate: false,
        interGrids: 0
      });
    };

    InventoryPoolDailyController.prototype.toggleDatepicker = function() {
      if (this.datepicker == null) {
        this.datepicker = this.datepickerInput.datepicker({
          defaultDate: moment(this.date).toDate(),
          onSelect: (function(_this) {
            return function(dateText, inst) {
              var uri;
              uri = URI(window.location.href).removeQuery("date").addQuery("date", moment(dateText, i18n.date.L).format("YYYY-MM-DD"));
              return window.location = uri;
            };
          })(this)
        });
      }
      this.datepickerOpen = !this.datepickerOpen;
      if (this.datepickerOpen) {
        return this.datepickerInput.focus();
      } else {
        return this.datepickerInput.datepicker("hide");
      }
    };

    InventoryPoolDailyController.prototype.updateNavigationLinks = function(e, tabTarget) {
      var el, i, len, ref, results, uri;
      ref = this.dailyNavigation.find("a[href]");
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        el = ref[i];
        el = $(el);
        uri = URI(el.attr("href")).removeQuery("tab").addQuery("tab", tabTarget);
        results.push(el.attr("href", uri));
      }
      return results;
    };

    return InventoryPoolDailyController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.InventoryPoolHolidaysController = (function(superClass) {
    extend(InventoryPoolHolidaysController, superClass);

    InventoryPoolHolidaysController.prototype.events = {
      "click [data-add-holiday]": "addHoliday",
      "click [data-remove-holiday]": "removeHoliday"
    };

    InventoryPoolHolidaysController.prototype.elements = {
      "[data-holidays-list]": "holidaysList"
    };

    function InventoryPoolHolidaysController() {
      this.removeHoliday = bind(this.removeHoliday, this);
      this.addHoliday = bind(this.addHoliday, this);
      this.setupHolidaysDatepickers = bind(this.setupHolidaysDatepickers, this);
      InventoryPoolHolidaysController.__super__.constructor.apply(this, arguments);
      this.setupHolidaysDatepickers();
    }

    InventoryPoolHolidaysController.prototype.setupHolidaysDatepickers = function() {
      return this.el.find("#holiday-start-date, #holiday-end-date").datepicker();
    };

    InventoryPoolHolidaysController.prototype.addHoliday = function(e) {
      var end_date, last_holiday_index, name, start_date;
      e.preventDefault();
      start_date = moment(this.el.find("#holiday-start-date").val(), i18n.date.L).format("DD.MM.YYYY");
      end_date = moment(this.el.find("#holiday-end-date").val(), i18n.date.L).format("DD.MM.YYYY");
      name = this.el.find("#holiday-name").val();
      last_holiday_index = _.last(_.sortBy(_.map(this.holidaysList.find(".line"), function(e) {
        return $(e).data("index");
      }), function(e) {
        return Number(e);
      }));
      return $("[data-holidays-list]").append(App.Render("manage/views/inventory_pools/admin/holiday_entry", {
        start_date: start_date,
        end_date: end_date,
        name: name,
        i: last_holiday_index != null ? last_holiday_index + 1 : 0
      }));
    };

    InventoryPoolHolidaysController.prototype.removeHoliday = function(e) {
      var i, line;
      e.preventDefault();
      line = $(e.currentTarget).closest(".line");
      i = line.data("index");
      if (line.find("input[name='inventory_pool[holidays_attributes][" + i + "][_destroy]']").length) {
        line.find(".line-col").removeClass("striked");
        return line.find("input[name='inventory_pool[holidays_attributes][" + i + "][_destroy]']").remove();
      } else {
        line.find(".line-col").addClass("striked");
        return line.prepend("<input type='hidden' name='inventory_pool[holidays_attributes][" + i + "][_destroy]' value='1' />");
      }
    };

    return InventoryPoolHolidaysController;

  })(Spine.Controller);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.CompositeFieldController = (function(superClass) {
    extend(CompositeFieldController, superClass);

    function CompositeFieldController() {
      CompositeFieldController.__super__.constructor.apply(this, arguments);
      if (this.data.field.label === "Quantity allocations") {
        new App.LicenseQuantityPartitionsController({
          el: this.el,
          data: this.data
        });
      }
    }

    return CompositeFieldController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ItemFlexibleFieldsController = (function(superClass) {
    extend(ItemFlexibleFieldsController, superClass);

    ItemFlexibleFieldsController.prototype.events = {
      "change input[name='item[owner][id]']": "showOwnerChangeNotification",
      "submit": "validate",
      "change [data-type='field']": "toggleChildren"
    };

    function ItemFlexibleFieldsController() {
      this.toggleChildren = bind(this.toggleChildren, this);
      this.validate = bind(this.validate, this);
      this.showOwnerChangeNotification = bind(this.showOwnerChangeNotification, this);
      this.setupFieldsWithValuesDependency = bind(this.setupFieldsWithValuesDependency, this);
      this.setupFields = bind(this.setupFields, this);
      this.renderForm = bind(this.renderForm, this);
      this.fetchFields = bind(this.fetchFields, this);
      this.getFieldsWithValuesDependency = bind(this.getFieldsWithValuesDependency, this);
      this.setupInitialFlashNotice = bind(this.setupInitialFlashNotice, this);
      ItemFlexibleFieldsController.__super__.constructor.apply(this, arguments);
      this.fetchFields().done((function(_this) {
        return function() {
          var field, i, len, ref;
          _this.renderForm();
          _this.setupFields();
          ref = _this.el.find("[data-type='field']");
          for (i = 0, len = ref.length; i < len; i++) {
            field = ref[i];
            _this.toggleChildren({
              currentTarget: field
            });
          }
          if ($(".hidden.field").length) {
            $("#show-all-fields").show();
          }
          if (_this.getFieldsWithValuesDependency().length > 0) {
            _this.setupFieldsWithValuesDependency(_this.dependencyValuesCallback);
          }
          return typeof _this.fetchFieldsCallback === "function" ? _this.fetchFieldsCallback() : void 0;
        };
      })(this));
      this.setupInitialFlashNotice();
    }

    ItemFlexibleFieldsController.prototype.setupInitialFlashNotice = function() {
      if (this.showInitialFlashNotice && !this.itemData['unique_serial_number?']) {
        return App.Flash({
          type: "notice",
          message: _jed("Same or similar serial number already exists.")
        });
      }
    };

    ItemFlexibleFieldsController.prototype.getFieldsWithValuesDependency = function() {
      return _.filter(App.Field.all(), function(f) {
        return f.values_dependency_field_id;
      });
    };

    ItemFlexibleFieldsController.prototype.fetchFields = function() {
      if (App.Field.all().length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.Field.ajaxFetch({
        data: $.param({
          target_type: this.itemType
        })
      });
    };

    ItemFlexibleFieldsController.prototype.renderForm = function() {
      this.el.html(App.Render("manage/views/items/form"));
      this.formLeftSide = this.el.find("#item-form-left-side");
      return this.formRightSide = this.el.find("#item-form-right-side");
    };

    ItemFlexibleFieldsController.prototype.setupFields = function() {
      var field, fields, group, groupName, i, len, ref, results, target, template;
      fields = _.filter(App.Field.all(), (function(_this) {
        return function(f) {
          return !_.contains(_this.excludeIds, f.id);
        };
      })(this));
      fields = _.filter(fields, function(f) {
        return f.visibility_dependency_field_id == null;
      });
      if (this.forPackage) {
        fields = _.filter(fields, function(f) {
          return f.forPackage;
        });
      }
      ref = App.Field.grouped(fields);
      results = [];
      for (groupName in ref) {
        fields = ref[groupName];
        template = $(App.Render("manage/views/items/group_of_fields", {
          name: groupName
        }));
        group = template.find(".group-of-fields");
        for (i = 0, len = fields.length; i < len; i++) {
          field = fields[i];
          group.append(App.Render("manage/views/items/field", {}, {
            field: field,
            itemData: this.itemData,
            writeable: this.writeable,
            hideable: this.hideable
          }));
        }
        target = this.formLeftSide.find("[data-type='field']").length <= this.formRightSide.find("[data-type='field']").length ? this.formLeftSide : this.formRightSide;
        results.push(target.append(template));
      }
      return results;
    };

    ItemFlexibleFieldsController.prototype.setupFieldsWithValuesDependency = function(dependencyValuesCallback) {
      var field, i, len, ref, results;
      ref = this.getFieldsWithValuesDependency();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        results.push(new App.ValuesDependencyFieldController({
          el: this.el,
          renderData: {
            itemData: this.itemData,
            writeable: this.writeable,
            hideable: this.hideable
          },
          parentField: App.Field.find(field.values_dependency_field_id),
          childField: field,
          callback: dependencyValuesCallback
        }));
      }
      return results;
    };

    ItemFlexibleFieldsController.prototype.showOwnerChangeNotification = function() {
      return App.Flash({
        type: "notice",
        message: _jed("If you transfer an item to a different inventory pool it's not visible for you anymore.")
      });
    };

    ItemFlexibleFieldsController.prototype.validate = function(e) {
      if (!App.Field.validate(this.el)) {
        App.Flash({
          type: "error",
          message: _jed('Please provide all required fields')
        });
        if (e != null) {
          e.preventDefault();
        }
        return false;
      } else {
        return true;
      }
    };

    ItemFlexibleFieldsController.prototype.toggleChildren = function(e) {
      return App.Field.toggleChildren($(e.currentTarget), this.el, {
        itemData: this.itemData,
        writeable: this.writeable
      }, this.forPackage);
    };

    return ItemFlexibleFieldsController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ItemInspectDialogController = (function(superClass) {
    extend(ItemInspectDialogController, superClass);

    ItemInspectDialogController.prototype.events = {
      "submit form": "submit"
    };

    ItemInspectDialogController.prototype.elements = {
      "form": "form"
    };

    function ItemInspectDialogController(data) {
      this.submit = bind(this.submit, this);
      this.setupModal = bind(this.setupModal, this);
      this.setupModal(data.item);
      ItemInspectDialogController.__super__.constructor.apply(this, arguments);
    }

    ItemInspectDialogController.prototype.setupModal = function(item) {
      this.el = $(App.Render("manage/views/items/inspect_dialog", item));
      return this.modal = new App.Modal(this.el);
    };

    ItemInspectDialogController.prototype.submit = function(e) {
      var data, datum, i, len, ref;
      e.preventDefault();
      data = {};
      ref = this.form.serializeArray();
      for (i = 0, len = ref.length; i < len; i++) {
        datum = ref[i];
        data[datum.name] = datum.value === "true" || datum.value === "false" ? JSON.parse(datum.value) : datum.value;
      }
      return this.item.inspect(data).done((function(_this) {
        return function() {
          return _this.modal.destroy(true);
        };
      })(this));
    };

    return ItemInspectDialogController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.LicenseQuantityPartitionsController = (function(superClass) {
    extend(LicenseQuantityPartitionsController, superClass);

    LicenseQuantityPartitionsController.prototype.events = {
      "click #add-inline-entry": "add",
      "preChange [data-quantity-allocation]": "updateRemainingQuantity"
    };

    LicenseQuantityPartitionsController.prototype.elements = {
      "#remaining-total-quantity": "remainingQuantityElement"
    };

    function LicenseQuantityPartitionsController() {
      this.updateRemainingQuantity = bind(this.updateRemainingQuantity, this);
      this.getRemainingQuantity = bind(this.getRemainingQuantity, this);
      this.render = bind(this.render, this);
      this.add = bind(this.add, this);
      this.registerEventHandlers = bind(this.registerEventHandlers, this);
      LicenseQuantityPartitionsController.__super__.constructor.apply(this, arguments);
      this.el.append("<div class='row list-of-lines even'></div>");
      this.list = this.el.find(".list-of-lines");
      this.dataSourceElement = $(".field[data-id='" + this.data.field.data_dependency_field_id + "'] [data-type='value'] input").preChange();
      this.dataSourceElement.on("preChange", this.updateRemainingQuantity);
      this.allocations = this.data.itemData.properties.quantity_allocations;
      this.render(this.allocations);
      this.allocationElements = this.el.find("[data-quantity-allocation]").preChange();
      this.updateRemainingQuantity();
      new App.InlineEntryRemoveController({
        el: this.list,
        removeCallback: (function(_this) {
          return function(entry) {
            _this.allocationElements = _.reject(_.map(_this.allocationElements, $), function(el) {
              return el.get(0) === entry.find("[data-quantity-allocation]").get(0);
            });
            return _this.updateRemainingQuantity();
          };
        })(this),
        strikeCallback: function(entry) {
          return this.removeCallback(entry);
        },
        unstrikeCallback: (function(_this) {
          return function(entry) {
            _this.allocationElements.push(entry.find("[data-quantity-allocation]"));
            return _this.updateRemainingQuantity();
          };
        })(this)
      });
    }

    LicenseQuantityPartitionsController.prototype.registerEventHandlers = function() {};

    LicenseQuantityPartitionsController.prototype.add = function(e) {
      var lineElement;
      e.preventDefault();
      lineElement = $(App.Render("manage/views/items/fields/writeable/composite_partials/license_quantity_allocation", {
        field: this.data.field
      }));
      this.list.prepend(lineElement);
      lineElement.data("new", true);
      return this.allocationElements.push(lineElement.find("[data-quantity-allocation]").preChange());
    };

    LicenseQuantityPartitionsController.prototype.render = function(allocations) {
      var allocation, i, len, results;
      if (allocations) {
        results = [];
        for (i = 0, len = allocations.length; i < len; i++) {
          allocation = allocations[i];
          results.push(this.list.append(App.Render("manage/views/items/fields/writeable/composite_partials/license_quantity_allocation", {
            field: this.data.field,
            allocation: allocation
          })));
        }
        return results;
      }
    };

    LicenseQuantityPartitionsController.prototype.getRemainingQuantity = function() {
      var dataSourceValue;
      dataSourceValue = parseInt(this.dataSourceElement.val());
      return (_.isNaN(dataSourceValue) ? 0 : dataSourceValue) - _.reduce(_.map(this.allocationElements, function(el) {
        var v;
        v = parseInt($(el).val());
        if (_.isNaN(v)) {
          return 0;
        } else {
          return v;
        }
      }), function(memo, num) {
        return memo + num;
      }, 0);
    };

    LicenseQuantityPartitionsController.prototype.updateRemainingQuantity = function() {
      return this.remainingQuantityElement.text((_jed('remaining')) + " " + (this.getRemainingQuantity()));
    };

    return LicenseQuantityPartitionsController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ValuesDependencyFieldController = (function(superClass) {
    extend(ValuesDependencyFieldController, superClass);

    function ValuesDependencyFieldController() {
      this.transformResponseData = bind(this.transformResponseData, this);
      this.updateChildValues = bind(this.updateChildValues, this);
      this.renderChildElement = bind(this.renderChildElement, this);
      this.removeChildElement = bind(this.removeChildElement, this);
      this.rerenderChildElement = bind(this.rerenderChildElement, this);
      ValuesDependencyFieldController.__super__.constructor.apply(this, arguments);
      this.parentElement = this.el.find("#" + this.parentField.id);
      if (!this.renderData.itemData) {
        this.renderData.itemData = {};
      }
      this.rerenderChildElement();
      this.parentElement.change((function(_this) {
        return function() {
          _this.renderData.itemData[_this.childField.id] = null;
          return _this.rerenderChildElement();
        };
      })(this));
    }

    ValuesDependencyFieldController.prototype.rerenderChildElement = function() {
      this.removeChildElement();
      return this.renderChildElement();
    };

    ValuesDependencyFieldController.prototype.removeChildElement = function() {
      return this.el.find("#" + this.childField.id).remove();
    };

    ValuesDependencyFieldController.prototype.renderChildElement = function() {
      return this.updateChildValues({
        callback: (function(_this) {
          return function() {
            return _this.parentElement.after(App.Render("manage/views/items/field", {}, $.extend(_this.renderData, {
              field: _this.childField
            })));
          };
        })(this)
      });
    };

    ValuesDependencyFieldController.prototype.updateChildValues = function(arg) {
      var callback, parentValue, url;
      callback = arg.callback;
      parentValue = App.Field.getValue(this.parentElement.find(".field[data-id]"));
      if (parentValue) {
        url = this.childField.values_url.replace("$$$parent_value$$$", parentValue);
        return $.ajax({
          url: url,
          success: (function(_this) {
            return function(data) {
              _this.childField.values = _this.transformResponseData(data);
              callback();
              return typeof _this.callback === "function" ? _this.callback() : void 0;
            };
          })(this)
        });
      }
    };

    ValuesDependencyFieldController.prototype.transformResponseData = function(data) {
      return _.map(data, (function(_this) {
        return function(el) {
          return {
            value: el.id,
            label: el[_this.childField.values_label_method]
          };
        };
      })(this));
    };

    return ValuesDependencyFieldController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelCellTooltipController = (function(superClass) {
    extend(ModelCellTooltipController, superClass);

    function ModelCellTooltipController() {
      this.onEnter = bind(this.onEnter, this);
      return ModelCellTooltipController.__super__.constructor.apply(this, arguments);
    }

    ModelCellTooltipController.prototype.events = {
      "mouseenter [data-type='model-cell']": "onEnter"
    };

    ModelCellTooltipController.prototype.onEnter = function(e) {
      var trigger;
      trigger = $(e.currentTarget);
      return new App.Tooltip({
        el: trigger.closest("[data-type='model-cell']"),
        content: App.Render("manage/views/models/tooltip", App.Model.findOrBuild(trigger.data()))
      });
    };

    return ModelCellTooltipController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsAccessoriesController = (function(superClass) {
    extend(ModelsAccessoriesController, superClass);

    function ModelsAccessoriesController() {
      this.add = bind(this.add, this);
      this.enter = bind(this.enter, this);
      return ModelsAccessoriesController.__super__.constructor.apply(this, arguments);
    }

    ModelsAccessoriesController.prototype.events = {
      "click #add-accessory": "add",
      "keypress #accessory-name": "enter"
    };

    ModelsAccessoriesController.prototype.elements = {
      "input#accessory-name": "input",
      ".list-of-lines": "list"
    };

    ModelsAccessoriesController.prototype.enter = function(e) {
      if (e.keyCode === $.ui.keyCode.ENTER) {
        e.preventDefault();
        return this.add({
          preventDefault: function() {
            return null;
          }
        });
      }
    };

    ModelsAccessoriesController.prototype.add = function(e) {
      var name;
      e.preventDefault();
      name = this.input.val();
      if (!this.list.find("[data-name='" + name + "']").length) {
        this.list.prepend(App.Render("manage/views/models/form/accessory_inline_entry", {
          name: name
        }, {
          uid: App.Model.uid("uid")
        }));
      }
      return this.input.val("").blur();
    };

    return ModelsAccessoriesController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsAllocationsController = (function(superClass) {
    extend(ModelsAllocationsController, superClass);

    function ModelsAllocationsController() {
      this.getExistingEntry = bind(this.getExistingEntry, this);
      ModelsAllocationsController.__super__.constructor.apply(this, arguments);
      this.model = "Group";
      this.templatePath = "manage/views/models/form/allocation_inline_entry";
    }

    ModelsAllocationsController.prototype.getExistingEntry = function(record) {
      return this.list.find("input[name*='[group_id]'][value='" + record.id + "']");
    };

    return ModelsAllocationsController;

  })(App.AddInlineEntryController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.UploadController = (function(superClass) {
    extend(UploadController, superClass);

    UploadController.prototype.elements = {
      ".list-of-lines": "list"
    };

    UploadController.prototype.events = {
      "click [data-type='select']": "click",
      "fileuploadadd": "add",
      "click [data-type='inline-entry'][data-new] [data-remove]": "remove"
    };

    UploadController.prototype.click = function() {
      return this.el.find("input[type='file']").trigger("click");
    };

    function UploadController() {
      this.remove = bind(this.remove, this);
      this.showUploading = bind(this.showUploading, this);
      this.upload = bind(this.upload, this);
      this.setupPreviewImage = bind(this.setupPreviewImage, this);
      this.renderFile = bind(this.renderFile, this);
      this.processNewFile = bind(this.processNewFile, this);
      this.add = bind(this.add, this);
      this.click = bind(this.click, this);
      UploadController.__super__.constructor.apply(this, arguments);
      this.uploadList = [];
      this.uploadErrors = [];
      this.el.fileupload({
        autoUpload: false
      });
    }

    UploadController.prototype.add = function(e, uploadData) {
      var file, i, len, ref, results;
      this.uploadList.push(uploadData);
      ref = uploadData.files;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        results.push(this.processNewFile(this.renderFile(file, uploadData), file));
      }
      return results;
    };

    UploadController.prototype.processNewFile = function(template, file) {};

    UploadController.prototype.renderFile = function(file, uploadData) {
      var template;
      template = $(App.Render(this.templatePath, file));
      template.data("uploadData", uploadData);
      this.list.prepend(template);
      return template;
    };

    UploadController.prototype.setupPreviewImage = function(entry, file) {
      var reader;
      reader = new FileReader();
      reader.onload = (function(_this) {
        return function(e) {
          return entry.find("img").attr("src", e.target.result);
        };
      })(this);
      return reader.readAsDataURL(file);
    };

    UploadController.prototype.upload = function(callback) {
      var always, fail, i, len, ref, results, upload;
      if (!this.uploadList.length) {
        callback();
        return;
      }
      this.showUploading();
      this.el.data("blueimpFileupload").options.url = this.url;
      always = _.after(this.uploadList.length, (function(_this) {
        return function() {
          return callback();
        };
      })(this));
      fail = (function(_this) {
        return function(e) {
          return _this.uploadErrors.push(e.responseText);
        };
      })(this);
      ref = this.uploadList;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        upload = ref[i];
        results.push(upload.submit().fail(fail).always(always));
      }
      return results;
    };

    UploadController.prototype.showUploading = function() {
      if (this.modal != null) {
        return true;
      }
      this.modal = new App.Modal($("<div></div>"));
      this.modal.undestroyable();
      return App.Flash({
        type: "notice",
        message: _jed("Uploading files - please wait"),
        loading: true
      }, 9999);
    };

    UploadController.prototype.remove = function(e) {
      var entry;
      entry = $(e.currentTarget).closest("[data-type='inline-entry']");
      return this.uploadList = _.filter(this.uploadList, function(e) {
        return e !== entry.data("uploadData");
      });
    };

    return UploadController;

  })(Spine.Controller);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsAttachmentsController = (function(superClass) {
    extend(ModelsAttachmentsController, superClass);

    function ModelsAttachmentsController() {
      ModelsAttachmentsController.__super__.constructor.apply(this, arguments);
      this.type = "attachment";
      this.templatePath = "manage/views/models/form/attachment_inline_entry";
      this.url = this.model.url("upload/" + this.type);
    }

    return ModelsAttachmentsController;

  })(App.UploadController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsCategoriesController = (function(superClass) {
    extend(ModelsCategoriesController, superClass);

    function ModelsCategoriesController() {
      this.getExistingEntry = bind(this.getExistingEntry, this);
      ModelsCategoriesController.__super__.constructor.apply(this, arguments);
      this.model = "Category";
      this.templatePath = "manage/views/models/form/category_inline_entry";
    }

    ModelsCategoriesController.prototype.getExistingEntry = function(record) {
      return this.list.find("input[name='model[category_ids][]'][value='" + record.id + "']");
    };

    return ModelsCategoriesController;

  })(App.AddInlineEntryController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsCompatiblesController = (function(superClass) {
    extend(ModelsCompatiblesController, superClass);

    function ModelsCompatiblesController() {
      this.getExistingEntry = bind(this.getExistingEntry, this);
      ModelsCompatiblesController.__super__.constructor.apply(this, arguments);
      this.model = "Model";
      this.templatePath = "manage/views/models/form/compatible_inline_entry";
    }

    ModelsCompatiblesController.prototype.getExistingEntry = function(record) {
      return this.list.find("input[name*='[compatible_ids]'][value='" + record.id + "']");
    };

    return ModelsCompatiblesController;

  })(App.AddInlineEntryController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsEditController = (function(superClass) {
    extend(ModelsEditController, superClass);

    ModelsEditController.prototype.elements = {
      "input[name='model[manufacturer]']": "manufacturer"
    };

    function ModelsEditController() {
      this.collectErrorMessages = bind(this.collectErrorMessages, this);
      this.save = bind(this.save, this);
      this.finishForwardUrl = bind(this.finishForwardUrl, this);
      this.finish = bind(this.finish, this);
      this.done = bind(this.done, this);
      this.setupManufacturer = bind(this.setupManufacturer, this);
      ModelsEditController.__super__.constructor.apply(this, arguments);
      new App.ModelsAllocationsController({
        el: this.el.find("#allocations")
      });
      new App.ModelsCategoriesController({
        el: this.el.find("#categories")
      });
      new App.ModelsAccessoriesController({
        el: this.el.find("#accessories")
      });
      new App.ModelsCompatiblesController({
        el: this.el.find("#compatibles"),
        customLabelFn: function(datum) {
          var label;
          label = datum.product;
          if (datum.version) {
            label = [label, datum.version].join(" ");
          }
          return label;
        }
      });
      new App.ModelsPropertiesController({
        el: this.el.find("#properties")
      });
      if (this.el.find("#packages").length) {
        new App.ModelsPackagesController({
          el: this.el.find("#packages")
        });
      }
      this.imagesController = new App.ImagesController({
        el: this.el.find("#images"),
        url: this.model.url("upload/image")
      });
      this.attachmentsController = new App.ModelsAttachmentsController({
        el: this.el.find("#attachments"),
        model: this.model
      });
      new App.InlineEntryRemoveController({
        el: this.el
      });
      this.setupManufacturer();
    }

    ModelsEditController.prototype.setupManufacturer = function() {
      this.manufacturer.autocomplete({
        source: this.manufacturers,
        minLength: 0,
        delay: 0
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("views/autocomplete/element", item)).data("value", item).appendTo(ul);
        };
      })(this);
      return this.manufacturer.focus(function() {
        return $(this).autocomplete("search");
      });
    };

    ModelsEditController.prototype.done = function() {
      return this.imagesController.upload((function(_this) {
        return function() {
          return _this.attachmentsController.upload(function() {
            return _this.finish();
          });
        };
      })(this));
    };

    ModelsEditController.prototype.finish = function() {
      var expectedErrors, onlyExpectedErrors;
      if (this.imagesController.uploadErrors.length > 0) {
        expectedErrors = _.filter(this.imagesController.uploadErrors, (function(_this) {
          return function(e) {
            return _.string.include(e, _jed('Unallowed content type')) || _.string.include(e, _jed('Uploaded file must be less than 8MB'));
          };
        })(this));
        onlyExpectedErrors = _.size(expectedErrors) > 0 && _.size(expectedErrors) === _.size(this.imagesController.uploadErrors);
        if (onlyExpectedErrors) {
          return this.setupImageRestrictionsErrorModel(this.model, _jed("%s was saved, but there were problems uploading some images. Only images smaller than 8MB and of type png, gif and jpg are allowed.", _jed(this.model.constructor.name)));
        } else {
          return this.setupErrorModal(this.model);
        }
      } else if (this.attachmentsController.uploadErrors.length) {
        return this.setupErrorModal(this.model);
      } else {
        return window.location = this.finishForwardUrl();
      }
    };

    ModelsEditController.prototype.finishForwardUrl = function() {
      return App.Inventory.url() + ("?flash[success]=" + (_jed('Model saved')));
    };

    ModelsEditController.prototype.save = function() {
      return $.ajax({
        url: this.model.url(),
        data: this.form.serializeArray(),
        type: "PUT"
      });
    };

    ModelsEditController.prototype.collectErrorMessages = function() {
      return this.imagesController.uploadErrors.concat(this.attachmentsController.uploadErrors).join(", ");
    };

    return ModelsEditController;

  })(App.FormWithUploadController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsNewController = (function(superClass) {
    extend(ModelsNewController, superClass);

    function ModelsNewController() {
      this.finishForwardUrl = bind(this.finishForwardUrl, this);
      this.updateUploadURL = bind(this.updateUploadURL, this);
      this.save = bind(this.save, this);
      return ModelsNewController.__super__.constructor.apply(this, arguments);
    }

    ModelsNewController.prototype.save = function() {
      return $.post(App.Model.url(), this.form.serializeArray()).done((function(_this) {
        return function(data) {
          _this.model.id = data.id;
          return _this.updateUploadURL();
        };
      })(this));
    };

    ModelsNewController.prototype.updateUploadURL = function() {
      this.imagesController.url = this.model.url("upload/image");
      return this.attachmentsController.url = this.model.url("upload/attachment");
    };

    ModelsNewController.prototype.finishForwardUrl = function() {
      return ModelsNewController.__super__.finishForwardUrl.apply(this, arguments) + '&filters=all_models';
    };

    return ModelsNewController;

  })(App.ModelsEditController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsPackageDialogController = (function(superClass) {
    extend(ModelsPackageDialogController, superClass);

    ModelsPackageDialogController.prototype.elements = {
      "#notifications": "notifications",
      "#item-form": "itemForm",
      "#search-item": "searchItemInput",
      "#items": "childrenContainer"
    };

    ModelsPackageDialogController.prototype.events = {
      "focus #search-item": "setupAutocomplete",
      "inline-entry-remove [data-type='inline-entry']": "removeItem",
      "click #save-package": "save"
    };

    function ModelsPackageDialogController() {
      this.save = bind(this.save, this);
      this.prepareRequestData = bind(this.prepareRequestData, this);
      this.removeItem = bind(this.removeItem, this);
      this.addItem = bind(this.addItem, this);
      this.select = bind(this.select, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.fetchItems = bind(this.fetchItems, this);
      this.setupAutocomplete = bind(this.setupAutocomplete, this);
      this.setupFlexibleFields = bind(this.setupFlexibleFields, this);
      this.el = $(App.Render("manage/views/models/packages/package_dialog"));
      ModelsPackageDialogController.__super__.constructor.apply(this, arguments);
      this.searchItemInput.preChange();
      this.childrenContainer.html(App.Render("manage/views/models/packages/item", this.children));
      this.modal = new App.Modal(this.el);
      new App.InlineEntryRemoveController({
        el: this.el
      });
      this.setupFlexibleFields();
    }

    ModelsPackageDialogController.prototype.setupFlexibleFields = function() {
      return this.flexibleFieldsController = new App.ItemFlexibleFieldsController({
        el: this.itemForm.find("#flexible-fields"),
        itemData: this.item,
        itemType: "item",
        forPackage: true,
        writeable: true,
        hideable: false
      });
    };

    ModelsPackageDialogController.prototype.setupAutocomplete = function(e) {
      var input;
      input = $(e.currentTarget);
      input.autocomplete({
        source: (function(_this) {
          return function(request, response) {
            response([]);
            return _this.fetchItems(request.term).done(function(data) {
              var datum, items;
              items = (function() {
                var j, len, results;
                results = [];
                for (j = 0, len = data.length; j < len; j++) {
                  datum = data[j];
                  results.push(App.Item.find(datum.id));
                }
                return results;
              })();
              return _this.fetchModels(items).done(function() {
                if (input.is(":focus")) {
                  return response(items);
                }
              });
            });
          };
        })(this),
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        select: (function(_this) {
          return function(e, ui) {
            return _this.select(e, ui) && input.val("") && input.blur();
          };
        })(this),
        appendTo: this.modal.el,
        minLength: 1
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("manage/views/models/packages/item_autocomplete_element", item)).data("value", item).appendTo(ul);
        };
      })(this);
      return input.autocomplete("search");
    };

    ModelsPackageDialogController.prototype.fetchItems = function(searchTerm) {
      return App.Item.ajaxFetch({
        data: $.param({
          search_term: searchTerm,
          not_packaged: true,
          packages: false,
          retired: false
        })
      });
    };

    ModelsPackageDialogController.prototype.fetchModels = function(items) {
      var ids;
      ids = _.uniq(_.map(items, function(i) {
        return i.model_id;
      }));
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.Model.ajaxFetch({
        data: $.param({
          ids: ids,
          paginate: false
        })
      });
    };

    ModelsPackageDialogController.prototype.select = function(e, ui) {
      return this.addItem(ui.item);
    };

    ModelsPackageDialogController.prototype.addItem = function(item) {
      if (_.find(this.children, function(i) {
        return i.id === item.id;
      })) {
        return true;
      }
      this.children.push(item);
      return this.modal.el.find("#items").append(App.Render("manage/views/models/packages/item", item));
    };

    ModelsPackageDialogController.prototype.removeItem = function(e) {
      var entry;
      entry = $(e.currentTarget).closest("[data-type='inline-entry']");
      return this.children = _.filter(this.children, function(i) {
        return i.id !== entry.data("id");
      });
    };

    ModelsPackageDialogController.prototype.prepareRequestData = function() {
      var field, j, len, ref, serial;
      serial = this.itemForm.serializeArray();
      ref = _.filter(App.Field.all(), function(f) {
        return f.exclude_from_submit;
      });
      for (j = 0, len = ref.length; j < len; j++) {
        field = ref[j];
        serial = _.reject(serial, function(s) {
          return s.name === field.getFormName();
        });
      }
      return _.map(serial, function(datum) {
        return {
          name: datum.name.replace(/item/, ""),
          value: datum.value
        };
      });
    };

    ModelsPackageDialogController.prototype.save = function() {
      this.notifications.addClass("hidden").html("");
      if (!this.children.length) {
        return this.notifications.removeClass("hidden").html(App.Render("manage/views/models/packages/no_items_error"));
      } else if (!App.Field.validate(this.itemForm)) {
        return this.notifications.removeClass("hidden").html(App.Render("manage/views/models/packages/missing_data_error"));
      } else {
        this.modal.destroy(true);
        return this.done(this.prepareRequestData(), this.children, this.entry);
      }
    };

    return ModelsPackageDialogController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsPackagesController = (function(superClass) {
    extend(ModelsPackagesController, superClass);

    ModelsPackagesController.prototype.events = {
      "click #add-package": "createPackage",
      "click [data-edit-package]": "editPackage"
    };

    ModelsPackagesController.prototype.elements = {
      ".list-of-lines": "list",
      "#add-package": "addPackageButton"
    };

    function ModelsPackagesController() {
      this.editNewPackage = bind(this.editNewPackage, this);
      this.saveExistingPackage = bind(this.saveExistingPackage, this);
      this.fetchChildren = bind(this.fetchChildren, this);
      this.fetchItem = bind(this.fetchItem, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.getRemoteItemData = bind(this.getRemoteItemData, this);
      this.editExistingPackage = bind(this.editExistingPackage, this);
      this.editPackage = bind(this.editPackage, this);
      this.saveNotExistingPackage = bind(this.saveNotExistingPackage, this);
      this.createPackage = bind(this.createPackage, this);
      ModelsPackagesController.__super__.constructor.apply(this, arguments);
    }

    ModelsPackagesController.prototype.createPackage = function() {
      return new App.ModelsPackageDialogController({
        item: new App.Item($(this.addPackageButton).data()),
        done: this.saveNotExistingPackage,
        children: []
      });
    };

    ModelsPackagesController.prototype.saveNotExistingPackage = function(data, children, entry) {
      if (entry != null) {
        entry.remove();
      }
      return this.list.prepend(App.Render("manage/views/models/form/package_inline_entry", {
        children: children,
        data: data
      }, {
        uid: App.Model.uid("uid")
      }));
    };

    ModelsPackagesController.prototype.editPackage = function(e) {
      var inlineEntry, target;
      target = $(e.currentTarget);
      inlineEntry = target.closest("[data-type='inline-entry']");
      if (inlineEntry.data("id") != null) {
        return this.editExistingPackage(inlineEntry);
      } else {
        return this.editNewPackage(inlineEntry);
      }
    };

    ModelsPackagesController.prototype.editExistingPackage = function(entry) {
      var modal;
      modal = new App.Modal("<div>");
      modal.undestroyable();
      return this.getRemoteItemData(entry, (function(_this) {
        return function(item, children) {
          modal.destroyable().destroy();
          return new App.ModelsPackageDialogController({
            item: item,
            children: children,
            done: _this.saveExistingPackage,
            entry: entry
          });
        };
      })(this));
    };

    ModelsPackagesController.prototype.getRemoteItemData = function(entry, callback) {
      var id;
      id = entry.data("id");
      return this.fetchItem(id).done((function(_this) {
        return function(itemData) {
          return _this.fetchChildren(id).done(function(data) {
            var children, datum;
            children = (function() {
              var i, len, results;
              results = [];
              for (i = 0, len = data.length; i < len; i++) {
                datum = data[i];
                results.push(App.Item.find(datum.id));
              }
              return results;
            })();
            return _this.fetchModels(children).done(function() {
              return callback(itemData, children);
            });
          });
        };
      })(this));
    };

    ModelsPackagesController.prototype.fetchModels = function(items) {
      var ids, item;
      ids = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = items.length; i < len; i++) {
          item = items[i];
          results.push(item.model_id);
        }
        return results;
      })();
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.Model.ajaxFetch({
        data: $.param({
          ids: ids,
          paginate: false,
          include_package_models: true
        })
      });
    };

    ModelsPackagesController.prototype.fetchItem = function(id) {
      return $.get(App.Item.url() + ("/" + id), {
        "for": "flexibleFields"
      });
    };

    ModelsPackagesController.prototype.fetchChildren = function(id) {
      return App.Item.ajaxFetch({
        data: $.param({
          package_ids: [id],
          paginate: false
        })
      });
    };

    ModelsPackagesController.prototype.saveExistingPackage = function(itemData, children, entry) {
      this.list.prepend(entry);
      entry.find("[data-type='updated-text']").removeClass("hidden");
      return entry.find("[data-type='form-data']").html(function() {
        return App.Render("manage/views/models/form/package_inline_entry/updated_package_form_data", {
          children: children,
          data: itemData
        }, {
          uid: entry.data("id")
        });
      });
    };

    ModelsPackagesController.prototype.editNewPackage = function(entry) {
      var data;
      data = App.ElementFormDataAsObject(entry);
      return new App.ModelsPackageDialogController({
        item: data,
        done: this.saveNotExistingPackage,
        children: _.map(data.children, function(c) {
          return App.Item.find(c.id);
        }),
        entry: entry
      });
    };

    return ModelsPackagesController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsPropertiesController = (function(superClass) {
    extend(ModelsPropertiesController, superClass);

    ModelsPropertiesController.prototype.events = {
      "click #add-property": "add"
    };

    ModelsPropertiesController.prototype.elements = {
      ".list-of-lines": "list"
    };

    function ModelsPropertiesController() {
      this.add = bind(this.add, this);
      ModelsPropertiesController.__super__.constructor.apply(this, arguments);
      this.list.sortable({
        handle: "[data-type='sort-handle']"
      });
    }

    ModelsPropertiesController.prototype.add = function(e) {
      e.preventDefault();
      this.list.prepend(App.Render("manage/views/models/form/property_inline_entry", {}, {
        uid: App.Model.uid("uid")
      }));
      return this.list.find("input[type='text']:first").focus();
    };

    return ModelsPropertiesController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.OptionLineChangeController = (function(superClass) {
    extend(OptionLineChangeController, superClass);

    OptionLineChangeController.prototype.events = {
      "change [data-line-type='option_line'] [data-line-quantity]": "change",
      "focus [data-line-type='option_line'] [data-line-quantity]": "focus"
    };

    function OptionLineChangeController() {
      this.change = bind(this.change, this);
      this.focus = bind(this.focus, this);
      OptionLineChangeController.__super__.constructor.apply(this, arguments);
      new PreChange("[data-line-type='option_line'] [data-line-quantity]");
    }

    OptionLineChangeController.prototype.focus = function(e) {
      var target;
      target = $(e.currentTarget);
      return target.select();
    };

    OptionLineChangeController.prototype.change = function(e) {
      var new_quantity, reservation, target;
      target = $(e.currentTarget);
      reservation = App.Reservation.find(target.closest("[data-id]").data("id"));
      new_quantity = parseInt(target.val());
      if (new_quantity > 0 && new_quantity !== reservation.quantity) {
        reservation.updateAttributes({
          quantity: new_quantity
        });
        if (e.type === "preChange") {
          return $("[data-line-type='option_line'][data-id='" + reservation.id + "'] [data-line-quantity]:first").focus();
        }
      } else {
        return target.val(reservation.quantity);
      }
    };

    return OptionLineChangeController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.OrdersApproveController = (function(superClass) {
    extend(OrdersApproveController, superClass);

    function OrdersApproveController() {
      this.fetchOptions = bind(this.fetchOptions, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.fetchData = bind(this.fetchData, this);
      this.approve = bind(this.approve, this);
      return OrdersApproveController.__super__.constructor.apply(this, arguments);
    }

    OrdersApproveController.prototype.events = {
      "click [data-order-approve]": "approve"
    };

    OrdersApproveController.prototype.approve = function(e) {
      var comment, done, fail, order, ref, ref1, ref2, trigger;
      trigger = $(e.currentTarget);
      App.Button.disable(trigger);
      order = (ref = this.order) != null ? ref : App.Order.findOrBuild(trigger.closest("[data-id]").data());
      done = (ref1 = this.done) != null ? ref1 : (function(_this) {
        return function() {
          var line;
          line = trigger.closest(".line");
          if (line != null) {
            return line.html(App.Render("manage/views/orders/line_approved", order, {
              accessRight: App.AccessRight,
              currentUserRole: App.User.current.role
            }));
          }
        };
      })(this);
      fail = (ref2 = this.fail) != null ? ref2 : (function(_this) {
        return function(response) {
          var callback;
          callback = function() {
            var line;
            line = trigger.closest(".line");
            new App.OrdersApproveFailedController({
              order: order,
              line: line,
              trigger: trigger,
              error: response.responseText,
              done: _this.done
            });
            return App.Button.enable(trigger);
          };
          return _this.fetchData(order, callback);
        };
      })(this);
      comment = this.comment != null ? typeof this.comment === "function" ? this.comment() : this.comment : void 0;
      return order.approve(comment).done(done).fail(fail);
    };

    OrdersApproveController.prototype.fetchData = function(record, callback) {
      var i, len, line, modelIds, optionIds, ref;
      modelIds = [];
      optionIds = [];
      ref = record.reservations().all();
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
        if (line.model_id != null) {
          if (App.Model.exists(line.model_id) == null) {
            modelIds.push(line.model_id);
          }
        } else if (line.option_id != null) {
          if (App.Option.exists(line.option_id) == null) {
            optionIds.push(line.option_id);
          }
        }
      }
      return this.fetchModels(_.uniq(modelIds)).done((function(_this) {
        return function() {
          return _this.fetchOptions(_.uniq(optionIds)).done(function() {
            return callback();
          });
        };
      })(this));
    };

    OrdersApproveController.prototype.fetchModels = function(ids) {
      if (ids.length) {
        return App.Model.ajaxFetch({
          data: $.param({
            ids: ids,
            paginate: false
          })
        });
      } else {
        return {
          done: function(c) {
            return c();
          }
        };
      }
    };

    OrdersApproveController.prototype.fetchOptions = function(ids) {
      if (ids.length) {
        return App.Option.ajaxFetch({
          data: $.param({
            ids: ids,
            paginate: false
          })
        });
      } else {
        return {
          done: function(c) {
            return c();
          }
        };
      }
    };

    return OrdersApproveController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.OrdersApproveFailedController = (function(superClass) {
    extend(OrdersApproveFailedController, superClass);

    OrdersApproveFailedController.prototype.elements = {
      "#comment": "commentEl"
    };

    OrdersApproveFailedController.prototype.events = {
      "click [data-approve-anyway]": "approveAnyway"
    };

    function OrdersApproveFailedController(options) {
      this.approveAnyway = bind(this.approveAnyway, this);
      var tmpl;
      this.trigger = $(options.trigger);
      this.order = options.order;
      this.order.error = options.error;
      tmpl = App.Render("manage/views/orders/approval_failed_modal", this.order, {
        comment: options.comment,
        accessRight: App.AccessRight,
        currentUserRole: App.User.current.role
      });
      this.modal = new App.Modal(tmpl);
      this.el = this.modal.el;
      OrdersApproveFailedController.__super__.constructor.apply(this, arguments);
    }

    OrdersApproveFailedController.prototype.approveAnyway = function() {
      var comment;
      comment = this.commentEl.val().length ? this.commentEl.val() : void 0;
      this.modal.destroy(false);
      this.modal.undestroyable();
      return this.order.approve_anyway(comment).done((function(_this) {
        return function() {
          _this.modal.destroyable().destroy(true);
          if (_this.done) {
            return _this.done();
          } else {
            return _this.line.html(App.Render("manage/views/orders/line_approved", _this.order, {
              accessRight: App.AccessRight,
              currentUserRole: App.User.current.role
            }));
          }
        };
      })(this));
    };

    return OrdersApproveFailedController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.OrdersApproveWithCommentController = (function(superClass) {
    extend(OrdersApproveWithCommentController, superClass);

    OrdersApproveWithCommentController.prototype.elements = {
      "#comment": "comment"
    };

    function OrdersApproveWithCommentController(options) {
      this.approved = bind(this.approved, this);
      var tmpl;
      this.trigger = options.trigger;
      this.order = options.order;
      tmpl = App.Render("manage/views/orders/approve_with_comment_modal", this.order);
      this.modal = new App.Modal(tmpl);
      this.el = this.modal.el;
      OrdersApproveWithCommentController.__super__.constructor.apply(this, arguments);
      new App.OrdersApproveController({
        el: this.el,
        done: this.approved,
        comment: (function(_this) {
          return function() {
            return _this.comment.val();
          };
        })(this)
      });
    }

    OrdersApproveWithCommentController.prototype.approved = function() {
      return window.location = "/manage/" + App.InventoryPool.current.id + "/daily?flash[success]=" + (_jed('Order approved'));
    };

    return OrdersApproveWithCommentController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.OrdersEditController = (function(superClass) {
    extend(OrdersEditController, superClass);

    OrdersEditController.prototype.elements = {
      "#status": "status",
      "#lines": "reservationsContainer",
      "#purpose": "purposeContainer",
      "#reject-order": "rejectButton",
      "#approve-order": "approveButton"
    };

    OrdersEditController.prototype.events = {
      "click #edit-purpose.button": "editPurpose",
      "click #swap-user": "swapUser",
      "click #approve-with-comment": "approveOrderWithComment",
      "click [data-destroy-line]": "validateLineDeletion",
      "click [data-destroy-lines]": "validateLineDeletion",
      "click [data-destroy-selected-lines]": "validateLineDeletion",
      "click [data-open-time-line]": "showTimeline"
    };

    function OrdersEditController() {
      this.orderApproved = bind(this.orderApproved, this);
      this.approveOrderWithComment = bind(this.approveOrderWithComment, this);
      this.renderPurpose = bind(this.renderPurpose, this);
      this.swapUser = bind(this.swapUser, this);
      this.editPurpose = bind(this.editPurpose, this);
      this.render = bind(this.render, this);
      this.fetchAvailability = bind(this.fetchAvailability, this);
      this.validateLineDeletion = bind(this.validateLineDeletion, this);
      this.setupLineSelection = bind(this.setupLineSelection, this);
      this.setupAddLine = bind(this.setupAddLine, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      OrdersEditController.__super__.constructor.apply(this, arguments);
      this.setupLineSelection();
      this.fetchAvailability();
      this.setupAddLine();
      new App.SwapModelController({
        el: this.el,
        user: this.order.user()
      });
      new App.OrdersApproveController({
        el: this.el,
        done: this.orderApproved
      });
      new App.OrdersRejectController({
        el: this.el,
        async: false
      });
      new App.ReservationsDestroyController({
        el: this.el,
        callback: (function(_this) {
          return function() {
            return _this.render(true);
          };
        })(this)
      });
      new App.ReservationsEditController({
        el: this.el,
        user: this.order.user(),
        order: this.order
      });
      new App.ModelCellTooltipController({
        el: this.el
      });
    }

    OrdersEditController.prototype.delegateEvents = function() {
      OrdersEditController.__super__.delegateEvents.apply(this, arguments);
      App.Reservation.on("change destroy", this.fetchAvailability);
      return App.Order.on("refresh", this.fetchAvailability);
    };

    OrdersEditController.prototype.showTimeline = function(e) {
      var id, model, trigger;
      trigger = $(e.currentTarget);
      id = trigger.data("model-id");
      model = App.Model.exists(id) || App.Software.find(id);
      return window.open(model.url() + '/timeline', '_blank');
    };

    OrdersEditController.prototype.setupAddLine = function() {
      var onChangeCallback, props, reservationsAddController, that;
      that = this;
      reservationsAddController = new App.ReservationsAddController({
        el: this.el.find("#add"),
        user: this.order.user(),
        status: this.status,
        order: this.order,
        modelsPerPage: 20,
        callback: (function(_this) {
          return function() {
            return _this.render(true);
          };
        })(this)
      });
      onChangeCallback = function(value) {
        console.log('onChangeCallback');
        that.inputValue = value;
        that.autocompleteController.setProps({
          isLoading: true
        });
        return reservationsAddController.search(value, function(data) {
          return that.autocompleteController.setProps({
            searchResults: data,
            isLoading: false
          });
        });
      };
      props = {
        onChange: _.debounce(onChangeCallback, 300),
        onSelect: reservationsAddController.select,
        isLoading: false,
        placeholder: _jed("Inventory code, model name, search term")
      };
      this.autocompleteController = new App.HandOverAutocompleteController(props, this.el.find("#add-input")[0]);
      this.autocompleteController._render();
      window.autocompleteController = this.autocompleteController;
      return reservationsAddController.setupAutocomplete(this.autocompleteController);
    };

    OrdersEditController.prototype.setupLineSelection = function() {
      return this.lineSelection = new App.LineSelectionController({
        el: this.el
      });
    };

    OrdersEditController.prototype.validateLineDeletion = function(e) {
      var ids;
      ids = $(e.currentTarget).closest("[data-id]").length ? [$(e.currentTarget).closest("[data-id]").data("id")] : $(e.currentTarget).data("ids") != null ? $(e.currentTarget).data("ids") : App.LineSelectionController.selected;
      if (this.order.reservations().all().length <= ids.length) {
        App.Flash({
          type: "error",
          message: _jed("You cannot delete all reservations of an order. Perhaps you want to reject it instead?")
        });
        e.stopImmediatePropagation();
        return false;
      }
    };

    OrdersEditController.prototype.fetchAvailability = function() {
      this.render(false);
      this.status.html(App.Render("manage/views/availabilities/loading"));
      return App.Availability.ajaxFetch({
        data: $.param({
          model_ids: _.uniq(_.map(this.order.reservations().all(), function(l) {
            return l.model().id;
          })),
          user_id: this.order.user_id
        })
      }).done((function(_this) {
        return function(data) {
          _this.status.html(App.Render("manage/views/availabilities/loaded"));
          return _this.render(true);
        };
      })(this));
    };

    OrdersEditController.prototype.render = function(renderAvailability) {
      this.reservationsContainer.html(App.Render("manage/views/reservations/grouped_lines", this.order.groupedLinesByDateRange(true), {
        linePartial: "manage/views/reservations/order_line",
        renderAvailability: renderAvailability
      }));
      return this.lineSelection.restore();
    };

    OrdersEditController.prototype.editPurpose = function() {
      return new App.OrdersEditPurposeController({
        order: this.order,
        callback: this.renderPurpose
      });
    };

    OrdersEditController.prototype.swapUser = function() {
      var jModal;
      jModal = $("<div class='modal medium hide fade ui-modal padding-inset-m padding-horizontal-l' role='dialog' tabIndex='-1' />");
      this.modal = new App.Modal(jModal, (function(_this) {
        return function() {
          return ReactDOM.unmountComponentAtNode(jModal.get()[0]);
        };
      })(this));
      this.swapOrderUserDialog = ReactDOM.render(React.createElement(SwapOrderUserDialog, {
        data: {},
        other: {
          order: this.order,
          manageContactPerson: true
        }
      }), this.modal.el.get()[0]);
      return this.el = this.modal.el;
    };

    OrdersEditController.prototype.renderPurpose = function() {
      return this.purposeContainer.html(this.order.purpose);
    };

    OrdersEditController.prototype.approveOrderWithComment = function() {
      return new App.OrdersApproveWithCommentController({
        trigger: this.approveButton,
        order: this.order
      });
    };

    OrdersEditController.prototype.orderApproved = function() {
      return window.location = "/manage/" + App.InventoryPool.current.id + "/daily?flash[success]=" + (_jed('Order approved'));
    };

    return OrdersEditController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.OrdersEditPurposeController = (function(superClass) {
    extend(OrdersEditPurposeController, superClass);

    OrdersEditPurposeController.prototype.elements = {
      "textarea": "textarea",
      "#errors": "errorsContainer"
    };

    OrdersEditPurposeController.prototype.events = {
      "submit form": "submit"
    };

    function OrdersEditPurposeController(data) {
      this.delegateEvents = bind(this.delegateEvents, this);
      this.order = data.order;
      this.modal = new App.Modal(App.Render("manage/views/orders/edit/purpose_modal", {
        description: this.order.purpose
      }));
      this.el = this.modal.el;
      OrdersEditPurposeController.__super__.constructor.apply(this, arguments);
    }

    OrdersEditPurposeController.prototype.delegateEvents = function() {
      return OrdersEditPurposeController.__super__.delegateEvents.apply(this, arguments);
    };

    OrdersEditPurposeController.prototype.submit = function(e) {
      e.preventDefault();
      this.order.updateAttribute("purpose", _.string.clean(this.textarea.val()));
      this.errorsContainer.addClass("hidden");
      return $.ajax({
        url: "/manage/" + App.InventoryPool.current.id + "/orders/" + this.order.id,
        type: "PUT",
        data: {
          purpose: this.order.purpose
        },
        success: (function(_this) {
          return function(data) {
            App.Order.trigger("refresh");
            _this.modal.destroy(true);
            return typeof _this.callback === "function" ? _this.callback() : void 0;
          };
        })(this),
        error: (function(_this) {
          return function(e) {
            _this.errorsContainer.removeClass("hidden");
            return _this.errorsContainer.find("strong").text(e.responseText);
          };
        })(this)
      });
    };

    return OrdersEditPurposeController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.OrdersIndexController = (function(superClass) {
    extend(OrdersIndexController, superClass);

    OrdersIndexController.prototype.elements = {
      "#contracts": "list"
    };

    function OrdersIndexController() {
      this.render = bind(this.render, this);
      this.fetchUsers = bind(this.fetchUsers, this);
      this.fetchReservations = bind(this.fetchReservations, this);
      this.fetchOrders = bind(this.fetchOrders, this);
      this.fetch = bind(this.fetch, this);
      this.reset = bind(this.reset, this);
      OrdersIndexController.__super__.constructor.apply(this, arguments);
      new App.LinesCellTooltipController({
        el: this.el
      });
      new App.UserCellTooltipController({
        el: this.el
      });
      new App.OrdersApproveController({
        el: this.el
      });
      new App.OrdersRejectController({
        el: this.el,
        async: true,
        callback: this.orderRejected
      });
      this.pagination = new App.OrdersPaginationController({
        el: this.list,
        fetch: this.fetch
      });
      this.search = new App.ListSearchController({
        el: this.el.find("#list-search"),
        reset: this.reset
      });
      this.filter = new App.ListFiltersController({
        el: this.el.find("#list-filters"),
        reset: this.reset
      });
      this.range = new App.ListRangeController({
        el: this.el.find("#list-range"),
        reset: this.reset
      });
      this.tabs = new App.ListTabsController({
        el: this.el.find("#list-tabs"),
        reset: this.reset,
        data: {
          status: this.status
        }
      });
      this.reset();
    }

    OrdersIndexController.prototype.reset = function() {
      this.orders = {};
      this.finished = false;
      this.list.html(App.Render("manage/views/lists/loading"));
      this.fetch(1, this.list);
      return this.pagination.page = 1;
    };

    OrdersIndexController.prototype.fetch = function(page, target) {
      return this.fetchOrders(page).done((function(_this) {
        return function() {
          return _this.fetchUsers(page).done(function() {
            return _this.fetchReservations(page, function() {
              if (_this.orders[page]) {
                return _this.render(target, _this.orders[page], page);
              }
            });
          });
        };
      })(this));
    };

    OrdersIndexController.prototype.fetchOrders = function(page) {
      var data;
      data = $.extend(this.tabs.getData(), $.extend(this.filter.getData(), {
        disable_total_count: true,
        search_term: this.search.term(),
        page: page,
        range: this.range.get(),
        order_by_created_at_group_by_user: true
      }));
      if (!data['to_be_verified'] && App.User.current.role === "group_manager") {
        data = $.extend(data, {
          from_verifiable_users: true
        });
      }
      if (!data['no_verification_required'] && App.User.current.role !== "group_manager") {
        data = $.extend(data, {
          to_be_verified: true
        });
      }
      return App.Order.ajaxFetch({
        data: $.param(data)
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, orders;
          _this.pagination.set(JSON.parse(xhr.getResponseHeader("X-Pagination")));
          if (data.length === 0) {
            _this.finished = true;
          }
          orders = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Order.find(datum.id));
            }
            return results;
          })();
          return _this.orders[page] = orders;
        };
      })(this));
    };

    OrdersIndexController.prototype.fetchReservations = function(page, callback) {
      var done, ids;
      ids = _.map(this.orders[page], function(o) {
        return o.id;
      });
      if (!ids.length) {
        callback();
      }
      done = _.after(Math.ceil(ids.length / 50), callback);
      return _(ids).each_slice(50, (function(_this) {
        return function(slice) {
          return App.Reservation.ajaxFetch({
            data: $.param({
              order_ids: slice
            })
          }).done(done);
        };
      })(this));
    };

    OrdersIndexController.prototype.fetchUsers = function(page) {
      var ids;
      ids = _.filter(_.map(this.orders[page], function(c) {
        return c.user_id;
      }), function(id) {
        return App.User.exists(id) == null;
      });
      if (!ids.length) {
        return {
          done: (function(_this) {
            return function(c) {
              return c();
            };
          })(this)
        };
      }
      return App.User.ajaxFetch({
        data: $.param({
          ids: _.uniq(ids),
          all: true
        })
      }).done((function(_this) {
        return function(data) {
          var datum, users;
          users = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.find(datum.id));
            }
            return results;
          })();
          return App.User.fetchDelegators(users);
        };
      })(this));
    };

    OrdersIndexController.prototype.render = function(target, data, page) {
      var nextPage;
      target.removeClass('loading-page');
      target.html(App.Render("manage/views/orders/line", data, {
        accessRight: App.AccessRight,
        currentUserRole: App.User.current.role
      }));
      if (!this.finished && $('.loading-page').length === 0) {
        nextPage = page + 1;
        return this.list.append(App.Render("manage/views/lists/loading_page", nextPage, {
          page: nextPage
        }));
      }
    };

    return OrdersIndexController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.OrdersRejectController = (function(superClass) {
    extend(OrdersRejectController, superClass);

    function OrdersRejectController() {
      this.fetchOptions = bind(this.fetchOptions, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.fetchData = bind(this.fetchData, this);
      this.reject = bind(this.reject, this);
      this.setupModal = bind(this.setupModal, this);
      return OrdersRejectController.__super__.constructor.apply(this, arguments);
    }

    OrdersRejectController.prototype.events = {
      "click [data-order-reject]": "setupModal"
    };

    OrdersRejectController.prototype.setupModal = function(e) {
      var callback;
      this.trigger = $(e.currentTarget);
      this.order = App.Order.findOrBuild(this.trigger.closest("[data-id]").data());
      callback = (function(_this) {
        return function() {
          _this.modal = new App.Modal(App.Render("manage/views/orders/reject_modal", _this.order));
          if (_this.async) {
            return _this.modal.el.on("submit", "form", _this.reject);
          }
        };
      })(this);
      return this.fetchData(this.order, callback);
    };

    OrdersRejectController.prototype.reject = function(e) {
      var callback, comment, ref;
      e.preventDefault();
      comment = this.modal.el.find("#rejection-comment").val();
      this.order.reject(comment);
      this.modal.destroy(true);
      callback = (ref = this.callback) != null ? ref : (function(_this) {
        return function() {
          var buttons;
          buttons = $(_this.trigger).closest(".line-actions-column");
          if (buttons) {
            return buttons.replaceWith('<div class="col2of8 line-col line-actions-column"><strong>' + _jed("Rejected") + '</strong></div>');
          }
        };
      })(this);
      return callback.call(this);
    };

    OrdersRejectController.prototype.fetchData = function(record, callback) {
      var i, len, line, modelIds, optionIds, ref;
      modelIds = [];
      optionIds = [];
      ref = record.reservations().all();
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
        if (line.model_id != null) {
          if (App.Model.exists(line.model_id) == null) {
            modelIds.push(line.model_id);
          }
        } else if (line.option_id != null) {
          if (App.Option.exists(line.option_id) == null) {
            optionIds.push(line.option_id);
          }
        }
      }
      return this.fetchModels(modelIds).done((function(_this) {
        return function() {
          return _this.fetchOptions(optionIds).done(function() {
            return callback();
          });
        };
      })(this));
    };

    OrdersRejectController.prototype.fetchModels = function(ids) {
      if (ids.length) {
        return App.Model.ajaxFetch({
          data: $.param({
            ids: ids,
            paginate: false
          })
        });
      } else {
        return {
          done: function(c) {
            return c();
          }
        };
      }
    };

    OrdersRejectController.prototype.fetchOptions = function(ids) {
      if (ids.length) {
        return App.Option.ajaxFetch({
          data: $.param({
            ids: ids,
            paginate: false
          })
        });
      } else {
        return {
          done: function(c) {
            return c();
          }
        };
      }
    };

    return OrdersRejectController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ManageBookingCalendarDialogController = (function(superClass) {
    extend(ManageBookingCalendarDialogController, superClass);

    function ManageBookingCalendarDialogController() {
      this.store = bind(this.store, this);
      this.valid = bind(this.valid, this);
      this.validationAlerts = bind(this.validationAlerts, this);
      this.getSelectedInventoryPool = bind(this.getSelectedInventoryPool, this);
      this.calendarRendered = bind(this.calendarRendered, this);
      this.setupBookingCalendar = bind(this.setupBookingCalendar, this);
      this.setupPartitions = bind(this.setupPartitions, this);
      this.initalizeDialog = bind(this.initalizeDialog, this);
      this.fetchGroups = bind(this.fetchGroups, this);
      this.fetchPartitions = bind(this.fetchPartitions, this);
      this.fetchAvailability = bind(this.fetchAvailability, this);
      this.fetchData = bind(this.fetchData, this);
      this.setupDates = bind(this.setupDates, this);
      this.setupModal = bind(this.setupModal, this);
      return ManageBookingCalendarDialogController.__super__.constructor.apply(this, arguments);
    }

    ManageBookingCalendarDialogController.prototype.setupModal = function() {
      this.dialog = $(App.Render("manage/views/booking_calendar/calendar_dialog", {
        user: this.user
      }, {
        startDateDisabled: this.startDateDisabled,
        quantityDisabled: this.quantityDisabled
      }));
      this.listOfLines = this.dialog.find("#booking-calendar-lines .list-of-lines");
      this.partitionsEl = this.dialog.find("#booking-calendar-partitions");
      return ManageBookingCalendarDialogController.__super__.setupModal.apply(this, arguments);
    };

    ManageBookingCalendarDialogController.prototype.setupDates = function() {
      this.startDateEl.val((_.min(this.reservations, function(l) {
        return Date.parse(l.start_date);
      })).start_date);
      return this.endDateEl.val((_.max(this.reservations, function(l) {
        return Date.parse(l.end_date);
      })).end_date);
    };

    ManageBookingCalendarDialogController.prototype.fetchData = function() {
      this.fetchWorkdays().done((function(_this) {
        return function() {
          return _this.initalizeDialog();
        };
      })(this));
      this.fetchHolidays().done((function(_this) {
        return function() {
          return _this.initalizeDialog();
        };
      })(this));
      this.fetchPartitions().done((function(_this) {
        return function() {
          return _this.fetchGroups().done(function() {
            return _this.initalizeDialog();
          });
        };
      })(this));
      if (_.any(this.models, function(m) {
        return (typeof m.availability === "function" ? m.availability() : void 0) == null;
      })) {
        return this.fetchAvailability().done((function(_this) {
          return function() {
            return _this.initalizeDialog();
          };
        })(this));
      } else {
        return this.availabilities = true;
      }
    };

    ManageBookingCalendarDialogController.prototype.fetchAvailability = function() {
      return App.Availability.ajaxFetch({
        data: $.param({
          model_ids: _.map(this.models, function(m) {
            return m.id;
          }),
          user_id: this.user.id
        })
      }).done((function(_this) {
        return function() {
          return _this.availabilities = true;
        };
      })(this));
    };

    ManageBookingCalendarDialogController.prototype.fetchPartitions = function() {
      return App.Partition.ajaxFetch({
        data: $.param({
          model_ids: _.map(this.models, function(m) {
            return m.id;
          })
        })
      }).done((function(_this) {
        return function(data) {
          var datum;
          return _this.partitions = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Partition.find("" + datum.model_id + datum.inventory_pool_id + datum.group_id));
            }
            return results;
          })();
        };
      })(this));
    };

    ManageBookingCalendarDialogController.prototype.fetchGroups = function() {
      return App.Group.ajaxFetch({
        data: $.param({
          group_ids: _.compact(_.uniq(_.map(this.partitions, function(p) {
            return p.group_id;
          })))
        })
      }).done((function(_this) {
        return function(data) {
          var datum;
          _this.groups = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Group.find(datum.id));
            }
            return results;
          })();
          return _this.setupPartitions();
        };
      })(this));
    };

    ManageBookingCalendarDialogController.prototype.initalizeDialog = function() {
      if (!(this.workdays && this.holidays && this.availabilities && this.partitions && this.groups)) {
        return false;
      }
      return ManageBookingCalendarDialogController.__super__.initalizeDialog.apply(this, arguments);
    };

    ManageBookingCalendarDialogController.prototype.setupPartitions = function() {
      var data, i, len, partition, ref;
      data = {
        user: [],
        userGroups: [],
        otherGroups: []
      };
      data.user = this.user.groupIds;
      ref = this.partitions;
      for (i = 0, len = ref.length; i < len; i++) {
        partition = ref[i];
        if (partition.group_id != null) {
          if (_.include(this.user.groupIds, partition.group_id)) {
            data.userGroups.push(partition.group());
          } else {
            data.otherGroups.push(partition.group());
          }
        }
      }
      return this.partitionsEl.html(App.Render("manage/views/booking_calendar/partitions", data));
    };

    ManageBookingCalendarDialogController.prototype.setupBookingCalendar = function() {
      return new App.ManageBookingCalendar({
        calendarEl: this.dialog.find("#booking-calendar"),
        startDateEl: this.startDateEl,
        startDateDisabled: this.startDateDisabled,
        endDateEl: this.endDateEl,
        quantityEl: this.dialog.find("#booking-calendar-quantity"),
        groupIds: this.user.groupIds,
        partitions: this.partitions,
        reservations: this.reservations,
        models: this.models,
        renderFunctionCallback: this.calendarRendered
      });
    };

    ManageBookingCalendarDialogController.prototype.calendarRendered = function() {
      var options;
      options = {
        groupIds: this.user.groupIds,
        start_date: moment(this.startDateEl.val(), i18n.date.L),
        end_date: moment(this.endDateEl.val(), i18n.date.L),
        quantity: this.getQuantity()
      };
      return this.listOfLines.html(App.Render("manage/views/booking_calendar/line", this.mergedLines, options));
    };

    ManageBookingCalendarDialogController.prototype.getSelectedInventoryPool = function() {
      return App.InventoryPool.current;
    };

    ManageBookingCalendarDialogController.prototype.validationAlerts = function() {
      var errors, ip;
      ip = this.getSelectedInventoryPool();
      errors = [];
      if (!ip.isVisitPossible(this.getStartDate())) {
        errors.push(_jed("Booking is no longer possible on this start date"));
      }
      if (!ip.isVisitPossible(this.getEndDate())) {
        errors.push(_jed("Booking is no longer possible on this end date"));
      }
      if (ip.isClosedOn(this.getStartDate())) {
        errors.push(_jed("Inventory pool is closed on start date"));
      }
      if (ip.isClosedOn(this.getEndDate())) {
        errors.push(_jed("Inventory pool is closed on end date"));
      }
      if (errors.length) {
        return this.showError(errors.join(", "));
      } else {
        return this.errorsContainer.html("");
      }
    };

    ManageBookingCalendarDialogController.prototype.valid = function() {
      return true;
    };

    ManageBookingCalendarDialogController.prototype.store = function() {};

    return ManageBookingCalendarDialogController;

  })(App.BookingCalendarDialogController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ReservationAssignOrCreateController = (function(superClass) {
    extend(ReservationAssignOrCreateController, superClass);

    ReservationAssignOrCreateController.prototype.elements = {
      "#add-start-date": "addStartDate",
      "#add-end-date": "addEndDate"
    };

    function ReservationAssignOrCreateController() {
      this.assignedOrCreated = bind(this.assignedOrCreated, this);
      this.submit = bind(this.submit, this);
      this.getEndDate = bind(this.getEndDate, this);
      this.getStartDate = bind(this.getStartDate, this);
      var onChangeCallback, props, reservationsAddController, that;
      ReservationAssignOrCreateController.__super__.constructor.apply(this, arguments);
      that = this;
      reservationsAddController = new App.ReservationsAddController({
        el: this.el,
        user: this.user,
        status: this.status,
        order: this.order,
        optionsEnabled: true,
        modelsPerPage: 30,
        optionsPerPage: 100,
        onSubmitInventoryCode: this.submit,
        addModelForHandOver: true
      });
      onChangeCallback = function(value) {
        that.inputValue = value;
        that.autocompleteController.setProps({
          isLoading: true
        });
        return reservationsAddController.search(value, function(data) {
          return that.autocompleteController.setProps({
            searchResults: data,
            isLoading: false
          });
        });
      };
      props = {
        onChange: _.debounce(onChangeCallback, 300),
        onSelect: reservationsAddController.select,
        isLoading: false,
        placeholder: _jed("Inventory code, model name, search term")
      };
      this.autocompleteController = new App.HandOverAutocompleteController(props, this.el.find("#assign-or-add-input")[0]);
      this.autocompleteController._render();
      window.autocompleteController = this.autocompleteController;
      reservationsAddController.setupAutocomplete(this.autocompleteController);
    }

    ReservationAssignOrCreateController.prototype.getStartDate = function() {
      return moment(this.addStartDate.val(), i18n.date.L);
    };

    ReservationAssignOrCreateController.prototype.getEndDate = function() {
      return moment(this.addEndDate.val(), i18n.date.L);
    };

    ReservationAssignOrCreateController.prototype.submit = function(inventoryCode) {
      var ref, ref1, ref2;
      if (!(inventoryCode != null ? inventoryCode.length : void 0)) {
        return false;
      }
      App.Reservation.assignOrCreate({
        start_date: this.getStartDate().format("YYYY-MM-DD"),
        end_date: this.getEndDate().format("YYYY-MM-DD"),
        code: inventoryCode,
        order_id: (ref = this.order) != null ? ref.id : void 0,
        user_id: ((ref1 = this.order) != null ? ref1.user_id : void 0) || this.user.id,
        inventory_pool_id: ((ref2 = this.order) != null ? ref2.inventory_pool_id : void 0) || App.InventoryPool.current.id
      }).done((function(_this) {
        return function(data) {
          return _this.assignedOrCreated(inventoryCode, data);
        };
      })(this)).error((function(_this) {
        return function(e) {
          return App.Flash({
            type: "error",
            message: e.responseText
          });
        };
      })(this));
      return this.autocompleteController.getInstance().resetInput();
    };

    ReservationAssignOrCreateController.prototype.assignedOrCreated = function(inventoryCode, data) {
      var done;
      done = (function(_this) {
        return function() {
          var line;
          if (App.Reservation.exists(data.id)) {
            line = App.Reservation.update(data.id, data);
            if (line.model_id != null) {
              App.Flash({
                type: "success",
                message: _jed("%s assigned to %s", [inventoryCode, line.model().name()])
              });
            } else if (line.option_id != null) {
              App.Flash({
                type: "notice",
                message: _jed("%s quantity increased to %s", [line.option().name(), line.quantity])
              });
            }
          } else {
            line = App.Reservation.addRecord(new App.Reservation(data));
            App.Order.trigger("refresh", _this.order);
            App.Reservation.trigger("refresh");
            App.Flash({
              type: "success",
              message: _jed("Added %s", line.model().name())
            });
          }
          return App.LineSelectionController.add(line.id);
        };
      })(this);
      if (data.model_id != null) {
        return App.Item.ajaxFetch({
          data: $.param({
            ids: [data.item_id]
          })
        }).done((function(_this) {
          return function() {
            return App.Model.ajaxFetch({
              data: $.param({
                ids: [data.model_id]
              })
            }).done(done);
          };
        })(this));
      } else if (data.option_id != null) {
        return App.Option.ajaxFetch({
          data: $.param({
            ids: [data.option_id]
          })
        }).done(done);
      }
    };

    return ReservationAssignOrCreateController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ReservationsAddController = (function(superClass) {
    extend(ReservationsAddController, superClass);

    ReservationsAddController.prototype.elements = {
      "#add-start-date": "addStartDate",
      "#add-end-date": "addEndDate"
    };

    ReservationsAddController.prototype.events = {
      "click [type='submit']": "handleEvents",
      "submit": "handleEvents"
    };

    ReservationsAddController.prototype.handleEvents = function(e) {
      var focused, value;
      if (e != null) {
        e.preventDefault();
      }
      focused = document.querySelector(':focus');
      value = this.getInputValue();
      if (value.length === 0) {
        if (!focused || focused.nodeName === 'BUTTON') {
          return this.showExplorativeSearch(e);
        } else if (focused.nodeName === 'INPUT') {
          return this.submit(e);
        }
      } else {
        return this.submit(e);
      }
    };

    function ReservationsAddController(onSubmitInventoryCode) {
      this.onSubmitInventoryCode = onSubmitInventoryCode;
      this.showExplorativeSearch = bind(this.showExplorativeSearch, this);
      this.addTemplate = bind(this.addTemplate, this);
      this.addOption = bind(this.addOption, this);
      this.addModel = bind(this.addModel, this);
      this.add = bind(this.add, this);
      this.addInventoryItem = bind(this.addInventoryItem, this);
      this.submit = bind(this.submit, this);
      this.getInputValue = bind(this.getInputValue, this);
      this.fetchAvailabilities = bind(this.fetchAvailabilities, this);
      this.searchTemplates = bind(this.searchTemplates, this);
      this.searchOptions = bind(this.searchOptions, this);
      this.searchModels = bind(this.searchModels, this);
      this.pushOptionsTo = bind(this.pushOptionsTo, this);
      this.pushTemplatesTo = bind(this.pushTemplatesTo, this);
      this.pushModelsTo = bind(this.pushModelsTo, this);
      this.getEndDate = bind(this.getEndDate, this);
      this.getStartDate = bind(this.getStartDate, this);
      this.setupDatepickers = bind(this.setupDatepickers, this);
      this.select = bind(this.select, this);
      this.search = bind(this.search, this);
      this.setupAutocomplete = bind(this.setupAutocomplete, this);
      this.handleEvents = bind(this.handleEvents, this);
      ReservationsAddController.__super__.constructor.apply(this, arguments);
      this.preventSubmit = false;
      this.setupDatepickers();
    }

    ReservationsAddController.prototype.setupAutocomplete = function(autocompleteController) {
      return this.autocompleteController = autocompleteController;
    };

    ReservationsAddController.prototype.search = function(value, response) {
      var handleResponses;
      if (!value.length) {
        return false;
      }
      this.models = this.options = this.templates = this.availabilities = this.options = null;
      handleResponses = (function(_this) {
        return function() {
          var data;
          if ((_this.models != null) && (_this.templates != null) && (_this.availabilities != null) && (_this.optionsEnabled ? _this.options != null : true)) {
            data = [];
            _this.pushModelsTo(data);
            if (_this.optionsEnabled) {
              _this.pushOptionsTo(data);
            }
            _this.pushTemplatesTo(data);
            return response(data);
          }
        };
      })(this);
      this.searchModels(value, handleResponses);
      this.searchTemplates(value, handleResponses);
      if (this.optionsEnabled) {
        return this.searchOptions(value, handleResponses);
      }
    };

    ReservationsAddController.prototype.select = function(item) {
      this.add(item.record, this.getStartDate(), this.getEndDate());
      return this.autocompleteController._render();
    };

    ReservationsAddController.prototype.setupDatepickers = function() {
      var date, i, len, ref;
      ref = [this.addStartDate, this.addEndDate];
      for (i = 0, len = ref.length; i < len; i++) {
        date = ref[i];
        $(date).datepicker();
      }
      this.addStartDate.datepicker("option", "minDate", moment().startOf("day").toDate());
      this.addEndDate.datepicker("option", "minDate", {
        getTime: (function(_this) {
          return function() {
            return moment(_this.addStartDate.val(), i18n.date.L).startOf("day").toDate();
          };
        })(this)
      });
      return this.addStartDate.datepicker("option", "onSelect", (function(_this) {
        return function(newStartDate) {
          var endDate;
          newStartDate = moment(newStartDate, i18n.date.L).startOf("day");
          endDate = moment(_this.addEndDate.val(), i18n.date.L).startOf("day");
          if (newStartDate.toDate() > endDate.toDate()) {
            return _this.addEndDate.val(newStartDate.format(i18n.date.L));
          }
        };
      })(this));
    };

    ReservationsAddController.prototype.getStartDate = function() {
      return moment(this.addStartDate.val(), i18n.date.L);
    };

    ReservationsAddController.prototype.getEndDate = function() {
      return moment(this.addEndDate.val(), i18n.date.L);
    };

    ReservationsAddController.prototype.pushModelsTo = function(data) {
      var i, len, maxAvailableForUser, maxAvailableInTotal, model, ref, results;
      ref = this.models;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        model = ref[i];
        if (model.availability() != null) {
          maxAvailableForUser = model.availability().maxAvailableForGroups(this.getStartDate(), this.getEndDate(), this.user.groupIds);
          maxAvailableInTotal = model.availability().maxAvailableInTotal(this.getStartDate(), this.getEndDate());
          results.push(data.push({
            name: model.name(),
            availability: maxAvailableForUser + "(" + maxAvailableInTotal + ")/" + (model.availability().total_rentable),
            available: maxAvailableForUser > 0,
            type: _jed("Model"),
            record: model
          }));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ReservationsAddController.prototype.pushTemplatesTo = function(data) {
      var i, len, ref, results, template;
      ref = this.templates;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        template = ref[i];
        results.push(data.push({
          name: template.name,
          available: true,
          type: _jed("Template"),
          record: template
        }));
      }
      return results;
    };

    ReservationsAddController.prototype.pushOptionsTo = function(data) {
      var i, len, option, ref, results;
      ref = this.options;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        option = ref[i];
        results.push(data.push({
          name: option.name(),
          available: true,
          type: _jed("Option"),
          record: option
        }));
      }
      return results;
    };

    ReservationsAddController.prototype.searchModels = function(value, callback) {
      return App.Model.ajaxFetch({
        data: $.param({
          search_term: value,
          used: true,
          as_responsible_only: true,
          per_page: this.modelsPerPage || 5
        })
      }).done((function(_this) {
        return function(data) {
          var datum;
          _this.models = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Model.find(datum.id));
            }
            return results;
          })();
          return _this.fetchAvailabilities(function() {
            return callback();
          });
        };
      })(this));
    };

    ReservationsAddController.prototype.searchOptions = function(value, callback) {
      return App.Option.ajaxFetch({
        data: $.param({
          search_term: value,
          per_page: this.optionsPerPage || 5
        })
      }).done((function(_this) {
        return function(data) {
          var datum;
          _this.options = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Option.find(datum.id));
            }
            return results;
          })();
          return callback();
        };
      })(this));
    };

    ReservationsAddController.prototype.searchTemplates = function(value, callback) {
      return App.Template.ajaxFetch({
        data: $.param({
          search_term: value,
          per_page: this.templatesPerPage || 5
        })
      }).done((function(_this) {
        return function(data) {
          var datum;
          _this.templates = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Template.find(datum.id));
            }
            return results;
          })();
          return callback();
        };
      })(this));
    };

    ReservationsAddController.prototype.fetchAvailabilities = function(callback) {
      if ((this.models != null) && this.models.length) {
        return App.Availability.ajaxFetch({
          data: $.param({
            model_ids: _.map(this.models, function(m) {
              return m.id;
            }),
            user_id: this.user.id
          })
        }).done((function(_this) {
          return function(data) {
            var datum;
            _this.availabilities = (function() {
              var i, len, results;
              results = [];
              for (i = 0, len = data.length; i < len; i++) {
                datum = data[i];
                results.push(App.Availability.find(datum.id));
              }
              return results;
            })();
            return callback();
          };
        })(this));
      } else {
        this.availabilities = [];
        return callback();
      }
    };

    ReservationsAddController.prototype.getInputValue = function() {
      return this.autocompleteController.getInstance().state.value;
    };

    ReservationsAddController.prototype.submit = function(e) {
      var inventoryCode;
      if (this.preventSubmit) {
        return false;
      }
      inventoryCode = this.getInputValue();
      if (inventoryCode.length) {
        App.Inventory.findByInventoryCode(inventoryCode).done((function(_this) {
          return function(data) {
            return _this.addInventoryItem(data, inventoryCode);
          };
        })(this));
      }
      return this.autocompleteController.getInstance().resetInput();
    };

    ReservationsAddController.prototype.addInventoryItem = function(data, inventoryCode) {
      var option;
      if (data != null) {
        if (data.error == null) {
          if (data.model_id != null) {
            return App.Model.ajaxFetch({
              id: data.model_id
            }).done((function(_this) {
              return function(data) {
                return _this.add(App.Model.find(data.id), _this.getStartDate(), _this.getEndDate(), inventoryCode);
              };
            })(this));
          } else {
            option = App.Option.addRecord(new App.Option(data));
            return this.add(option, this.getStartDate(), this.getEndDate());
          }
        } else {
          return App.Flash({
            type: "error",
            message: data.error
          });
        }
      } else {
        return App.Flash({
          type: "error",
          message: _jed("The Inventory Code %s was not found.", inventoryCode)
        });
      }
    };

    ReservationsAddController.prototype.add = function(record, startDate, endDate, inventoryCode) {
      if (record instanceof App.Model) {
        this.addModel(record, startDate, endDate, inventoryCode);
      } else if (record instanceof App.Option) {
        this.addOption(record, startDate, endDate);
      } else if (record instanceof App.Template) {
        this.addTemplate(record, startDate, endDate);
      }
      App.Reservation.trigger("refresh");
      return App.Order.trigger("refresh");
    };

    ReservationsAddController.prototype.addModel = function(model, startDate, endDate, inventoryCode) {
      var ref, ref1, ref2;
      if (this.addModelForHandOver && inventoryCode) {
        return typeof this.onSubmitInventoryCode === "function" ? this.onSubmitInventoryCode(inventoryCode) : void 0;
      } else {
        return App.Reservation.createOne({
          inventory_pool_id: App.InventoryPool.current.id,
          start_date: moment(startDate).format("YYYY-MM-DD"),
          end_date: moment(endDate).format("YYYY-MM-DD"),
          order_id: (ref = this.order) != null ? ref.id : void 0,
          user_id: ((ref1 = this.order) != null ? ref1.user_id : void 0) || this.user.id,
          inventory_pool_id: ((ref2 = this.order) != null ? ref2.inventory_pool_id : void 0) || App.InventoryPool.current.id,
          quantity: 1,
          model_id: model.id
        }).done((function(_this) {
          return function(line) {
            App.Reservation.trigger("refresh");
            App.Order.trigger("refresh");
            App.LineSelectionController.add(line.id);
            if (typeof _this.onSubmitInventoryCode === "function") {
              _this.onSubmitInventoryCode(inventoryCode);
            }
            App.Flash({
              type: "notice",
              message: _jed("Added %s", model.name())
            });
            return typeof _this.callback === "function" ? _this.callback() : void 0;
          };
        })(this)).fail(function(e) {
          return App.Flash({
            type: "error",
            message: e.responseText
          });
        });
      }
    };

    ReservationsAddController.prototype.addOption = function(option, startDate, endDate) {
      var line, quantity, ref, ref1, ref2;
      line = _.find(App.Reservation.all(), function(l) {
        return l.option_id === option.id && moment(l.start_date).diff(startDate, "days") === 0 && moment(l.end_date).diff(endDate, "days") === 0;
      });
      if (line) {
        quantity = line.quantity + 1;
        line.updateAttributes({
          quantity: quantity
        });
        App.Flash({
          type: "notice",
          message: _jed("%s quantity increased to %s", [option.name(), quantity])
        });
        return App.LineSelectionController.add(line.id);
      } else {
        return App.Reservation.create({
          inventory_pool_id: App.InventoryPool.current.id,
          start_date: moment(startDate).format("YYYY-MM-DD"),
          end_date: moment(endDate).format("YYYY-MM-DD"),
          order_id: (ref = this.order) != null ? ref.id : void 0,
          user_id: ((ref1 = this.order) != null ? ref1.user_id : void 0) || this.user.id,
          inventory_pool_id: ((ref2 = this.order) != null ? ref2.inventory_pool_id : void 0) || App.InventoryPool.current.id,
          quantity: 1,
          option_id: option.id
        }, {
          done: function() {
            App.LineSelectionController.add(this.id);
            return App.Flash({
              type: "notice",
              message: _jed("Added %s", option.name())
            });
          }
        });
      }
    };

    ReservationsAddController.prototype.addTemplate = function(template, startDate, endDate) {
      var ref, ref1, ref2;
      return App.Reservation.createForTemplate({
        inventory_pool_id: App.InventoryPool.current.id,
        start_date: moment(startDate).format("YYYY-MM-DD"),
        end_date: moment(endDate).format("YYYY-MM-DD"),
        order_id: (ref = this.order) != null ? ref.id : void 0,
        user_id: ((ref1 = this.order) != null ? ref1.user_id : void 0) || this.user.id,
        inventory_pool_id: ((ref2 = this.order) != null ? ref2.inventory_pool_id : void 0) || App.InventoryPool.current.id,
        template_id: template.id
      }).done((function(_this) {
        return function(reservations) {
          var i, len, line;
          for (i = 0, len = reservations.length; i < len; i++) {
            line = reservations[i];
            App.LineSelectionController.add(line.id);
          }
          return App.Flash({
            type: "notice",
            message: _jed("Added %s", template.name)
          });
        };
      })(this)).fail(function(e) {
        return App.Flash({
          type: "error",
          message: e.responseText
        });
      });
    };

    ReservationsAddController.prototype.showExplorativeSearch = function(e) {
      return new App.ReservationsExplorativeAddController({
        order: this.order,
        startDate: this.getStartDate(),
        endDate: this.getEndDate(),
        addModel: this.addModel,
        user: this.user
      });
    };

    return ReservationsAddController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ReservationAssignItemController = (function(superClass) {
    extend(ReservationAssignItemController, superClass);

    ReservationAssignItemController.prototype.events = {
      "focus [data-assign-item]": "searchItems",
      "submit [data-assign-item-form]": "submitAssignment",
      "click [data-remove-assignment]": "removeAssignment"
    };

    function ReservationAssignItemController() {
      this.submitAssignment = bind(this.submitAssignment, this);
      this.removeAssignment = bind(this.removeAssignment, this);
      this.assignItem = bind(this.assignItem, this);
      this.fetchWithIds = bind(this.fetchWithIds, this);
      this.fetchItemsOrLicences = bind(this.fetchItemsOrLicences, this);
      this.searchItems = bind(this.searchItems, this);
      ReservationAssignItemController.__super__.constructor.apply(this, arguments);
    }

    ReservationAssignItemController.prototype.searchItems = function(e) {
      var model, target;
      target = $(e.currentTarget);
      model = App.Reservation.find(target.closest("[data-id]").data("id")).model();
      return (model.constructor === App.Model ? this.fetchItems(model) : model.constructor === App.Software ? this.fetchLicenses(model) : void 0).done((function(_this) {
        return function(data) {
          var datum, items;
          items = (function() {
            var j, len, ref, results;
            results = [];
            for (j = 0, len = data.length; j < len; j++) {
              datum = data[j];
              results.push((ref = App.Item.exists(datum.id)) != null ? ref : App.License.find(datum.id));
            }
            return results;
          })();
          if (items.length) {
            return _this.setupAutocomplete(target, items);
          }
        };
      })(this));
    };

    ReservationAssignItemController.prototype.setupAutocomplete = function(input, items) {
      if (!input.is(":focus") || input.is(":disabled")) {
        return false;
      }
      input.autocomplete({
        appendTo: input.closest(".line"),
        source: (function(_this) {
          return function(request, response) {
            var data;
            data = _.map(items, function(u) {
              u.value = u.id;
              return u;
            });
            data = _.filter(data, function(i) {
              return i.inventory_code.match(request.term);
            });
            return response(data);
          };
        })(this),
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        minLength: 0,
        select: (function(_this) {
          return function(e, ui) {
            _this.assignItem(input, ui.item);
            return false;
          };
        })(this)
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("manage/views/items/autocomplete_element", item)).data("value", item).appendTo(ul);
        };
      })(this);
      return input.autocomplete("search", "");
    };

    ReservationAssignItemController.prototype.fetchItemsOrLicences = function(klass, model) {
      return klass.ajaxFetch({
        data: $.param({
          model_ids: [model.id],
          in_stock: true,
          responsible_inventory_pool_id: App.InventoryPool.current.id,
          retired: false
        })
      });
    };

    ReservationAssignItemController.prototype.fetchItems = _.partial(ReservationAssignItemController.prototype.fetchItemsOrLicences, App.Item);

    ReservationAssignItemController.prototype.fetchLicenses = _.partial(ReservationAssignItemController.prototype.fetchItemsOrLicences, App.License);

    ReservationAssignItemController.prototype.fetchWithIds = function(klass, ids) {
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return klass.ajaxFetch({
        data: $.param({
          ids: ids
        })
      });
    };

    ReservationAssignItemController.prototype.fetchBuildings = _.partial(ReservationAssignItemController.prototype.fetchWithIds, App.Building);

    ReservationAssignItemController.prototype.assignItem = function(input, item) {
      var reservation;
      input.blur();
      input.autocomplete("destroy");
      reservation = App.Reservation.find(input.closest("[data-id]").data("id"));
      return reservation.assign(item, (function(_this) {
        return function() {
          input.val(item.inventory_code);
          input.prop("disabled", true);
          return App.LineSelectionController.add(reservation.id);
        };
      })(this));
    };

    ReservationAssignItemController.prototype.removeAssignment = function(e) {
      var reservation, target;
      target = $(e.currentTarget);
      reservation = App.Reservation.find(target.closest("[data-id]").data("id"));
      reservation.removeAssignment();
      return App.Flash({
        type: "notice",
        message: _jed("The assignment for %s was removed", reservation.model().name())
      });
    };

    ReservationAssignItemController.prototype.submitAssignment = function(e) {
      var inventoryCode, model, reservation, spineModel, target;
      e.preventDefault();
      target = $(e.currentTarget).find("[data-assign-item]");
      reservation = App.Reservation.find(target.closest("[data-id]").data("id"));
      inventoryCode = target.val();
      model = reservation.model();
      spineModel = model.constructor === App.Model ? App.Item : model.constructor === App.Software ? App.License : void 0;
      return spineModel.ajaxFetch({
        data: $.param({
          inventory_code: inventoryCode
        })
      }).done((function(_this) {
        return function(data) {
          if (data.length === 1) {
            return _this.assignItem(target, spineModel.find(data[0].id));
          } else {
            return App.Flash({
              type: "error",
              message: _jed("The Inventory Code %s was not found for %s", [inventoryCode, reservation.model().name()])
            });
          }
        };
      })(this));
    };

    return ReservationAssignItemController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ReservationsChangeController = (function(superClass) {
    extend(ReservationsChangeController, superClass);

    function ReservationsChangeController() {
      this.changeRange = bind(this.changeRange, this);
      this.storeOptionLine = bind(this.storeOptionLine, this);
      this.storeItemLine = bind(this.storeItemLine, this);
      this.store = bind(this.store, this);
      this.done = bind(this.done, this);
      this.createReservation = bind(this.createReservation, this);
      return ReservationsChangeController.__super__.constructor.apply(this, arguments);
    }

    ReservationsChangeController.prototype.createReservation = function() {
      var ref, ref1, ref2, ref3, ref4, ref5;
      return App.Reservation.createOne({
        model_id: _.first(this.models).id,
        start_date: this.getStartDate().format("YYYY-MM-DD"),
        end_date: this.getEndDate().format("YYYY-MM-DD"),
        order_id: (ref = this.order) != null ? ref.id : void 0,
        user_id: ((ref1 = this.order) != null ? (ref2 = ref1.user) != null ? ref2.id : void 0 : void 0) || this.user.id,
        inventory_pool_id: ((ref3 = this.order) != null ? (ref4 = ref3.inventory_pool) != null ? ref4.id : void 0 : void 0) || App.InventoryPool.current.id,
        state: ((ref5 = this.order) != null ? ref5.state : void 0) || "approved",
        quantity: 1
      }).fail((function(_this) {
        return function(e) {
          return _this.fail(e);
        };
      })(this));
    };

    ReservationsChangeController.prototype.done = function(data) {
      var datum;
      App.Reservation.trigger("refresh", (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = data.length; i < len; i++) {
          datum = data[i];
          results.push(App.Reservation.find(datum.id));
        }
        return results;
      })());
      App.Order.trigger("refresh");
      return ReservationsChangeController.__super__.done.apply(this, arguments);
    };

    ReservationsChangeController.prototype.store = function() {
      if ((this.order != null) || (this.hand_over != null)) {
        if (this.models.length === 1) {
          return this.storeItemLine();
        } else if (this.models.length === 0) {
          return this.storeOptionLine();
        } else {
          return this.changeRange();
        }
      } else {
        return this.changeRange();
      }
    };

    ReservationsChangeController.prototype.storeItemLine = function() {
      var deletionDone, difference, finish, i, j, len, line, ref, reservationsToBeDestroyed, results, results1, time;
      difference = this.getQuantity() - this.quantity;
      if (difference < 0) {
        reservationsToBeDestroyed = this.reservations.slice(0, +(Math.abs(difference) - 1) + 1 || 9e9);
        deletionDone = _.after(reservationsToBeDestroyed.length, this.changeRange);
        this.reservations = _.reject(this.reservations, function(l) {
          return _.include(reservationsToBeDestroyed, l);
        });
        results = [];
        for (i = 0, len = reservationsToBeDestroyed.length; i < len; i++) {
          line = reservationsToBeDestroyed[i];
          results.push((function(line) {
            return App.Reservation.ajaxChange(line, "destroy", {}).done((function(_this) {
              return function() {
                line.remove();
                return deletionDone();
              };
            })(this));
          })(line));
        }
        return results;
      } else if (difference > 0) {
        finish = _.after(difference, this.changeRange);
        results1 = [];
        for (time = j = 1, ref = difference; 1 <= ref ? j <= ref : j >= ref; time = 1 <= ref ? ++j : --j) {
          results1.push(this.createReservation().done((function(_this) {
            return function(datum) {
              _this.reservations.push(App.Reservation.find(datum.id));
              App.Reservation.trigger("refresh");
              App.Order.trigger("refresh");
              return finish();
            };
          })(this)));
        }
        return results1;
      } else {
        return this.changeRange();
      }
    };

    ReservationsChangeController.prototype.storeOptionLine = function() {
      var line;
      if (this.getQuantity() != null) {
        line = _.first(this.reservations);
        line.updateAttributes({
          quantity: this.getQuantity(),
          start_date: this.getStartDate().format("YYYY-MM-DD"),
          end_date: this.getEndDate().format("YYYY-MM-DD")
        });
        return this.done(line.order());
      } else {
        return this.changeRange();
      }
    };

    ReservationsChangeController.prototype.changeRange = function() {
      if (this.getStartDate().format("YYYY-MM-DD") !== this.startDate || this.getEndDate().format("YYYY-MM-DD") !== this.endDate) {
        return App.Reservation.changeTimeRange(this.reservations, (!this.startDateDisabled ? this.getStartDate() : void 0), this.getEndDate()).done(this.done).fail(this.fail);
      } else {
        return this.done();
      }
    };

    return ReservationsChangeController;

  })(window.App.ManageBookingCalendarDialogController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ReservationsDestroyController = (function(superClass) {
    extend(ReservationsDestroyController, superClass);

    function ReservationsDestroyController() {
      this.destroyReservations = bind(this.destroyReservations, this);
      this.destroySelectedLines = bind(this.destroySelectedLines, this);
      this.destroyLines = bind(this.destroyLines, this);
      this.destroyLine = bind(this.destroyLine, this);
      return ReservationsDestroyController.__super__.constructor.apply(this, arguments);
    }

    ReservationsDestroyController.prototype.events = {
      "click [data-destroy-line]": "destroyLine",
      "click [data-destroy-lines]": "destroyLines",
      "click [data-destroy-selected-lines]": "destroySelectedLines"
    };

    ReservationsDestroyController.prototype.destroyLine = function(e) {
      return this.destroyReservations($(e.currentTarget), [$(e.currentTarget).closest("[data-id]").data("id")]);
    };

    ReservationsDestroyController.prototype.destroyLines = function(e) {
      return this.destroyReservations($(e.currentTarget), $(e.currentTarget).data("ids"));
    };

    ReservationsDestroyController.prototype.destroySelectedLines = function(e) {
      return this.destroyReservations($(e.currentTarget), App.LineSelectionController.selected);
    };

    ReservationsDestroyController.prototype.destroyReservations = function(trigger, ids) {
      App.LineSelectionController.selected = _.difference(App.LineSelectionController.selected, ids);
      return App.Reservation.destroyMultiple(ids);
    };

    return ReservationsDestroyController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ReservationsEditController = (function(superClass) {
    extend(ReservationsEditController, superClass);

    function ReservationsEditController() {
      this.editLines = bind(this.editLines, this);
      return ReservationsEditController.__super__.constructor.apply(this, arguments);
    }

    ReservationsEditController.prototype.events = {
      "click [data-edit-lines]": "editLines"
    };

    ReservationsEditController.prototype.editLines = function(e) {
      var id, ids, mergedLines, models, quantity, reservations, selectedLines, trigger;
      trigger = $(e.currentTarget);
      selectedLines = trigger.data("edit-lines") === "selected-lines";
      ids = selectedLines ? App.LineSelectionController.selected : trigger.data("ids");
      reservations = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = ids.length; i < len; i++) {
          id = ids[i];
          results.push(App.Reservation.find(id));
        }
        return results;
      })();
      mergedLines = App.Modules.HasLines.mergeLinesByModel(reservations);
      quantity = selectedLines ? null : _.reduce(mergedLines, function(mem, l) {
        return mem + (l.subreservations != null ? _.reduce(l.subreservations, (function(mem, l) {
          return mem + l.quantity;
        }), 0) : l.quantity);
      }, 0);
      models = _.unique(_.map(_.filter(mergedLines, function(l) {
        return l.model_id != null;
      }), function(l) {
        return l.model();
      }), false, function(m) {
        return m.id;
      });
      return new App.ReservationsChangeController({
        mergedLines: mergedLines,
        reservations: reservations,
        user: this.user,
        models: models,
        quantity: quantity,
        order: this.order,
        hand_over: this.hand_over,
        startDateDisabled: this.startDateDisabled,
        quantityDisabled: this.quantityDisabled
      });
    };

    return ReservationsEditController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ReservationsExplorativeAddController = (function(superClass) {
    extend(ReservationsExplorativeAddController, superClass);

    ReservationsExplorativeAddController.prototype.elements = {
      "#categories": "categoriesContainer",
      "#models": "list"
    };

    ReservationsExplorativeAddController.prototype.events = {
      "click [data-type='select']": "select"
    };

    function ReservationsExplorativeAddController(data) {
      this.select = bind(this.select, this);
      this.render = bind(this.render, this);
      this.fetchAvailability = bind(this.fetchAvailability, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.fetch = bind(this.fetch, this);
      this.reset = bind(this.reset, this);
      this.setupModal = bind(this.setupModal, this);
      this.startDate = data.startDate;
      this.endDate = data.endDate;
      this.user = data.user;
      this.setupModal();
      ReservationsExplorativeAddController.__super__.constructor.apply(this, arguments);
      this.categoriesFilter = new App.CategoriesFilterController({
        el: this.categoriesContainer,
        filter: this.reset
      });
      this.pagination = new App.ListPaginationController({
        el: this.list,
        fetch: this.fetch
      });
      this.reset();
    }

    ReservationsExplorativeAddController.prototype.setupModal = function() {
      this.el = $(App.Render("manage/views/reservations/explorative_add_dialog", {
        startDate: this.startDate,
        endDate: this.endDate
      }));
      return this.modal = new App.Modal(this.el);
    };

    ReservationsExplorativeAddController.prototype.reset = function() {
      this.models = {};
      this.list.html(App.Render("manage/views/lists/loading"));
      return this.fetch(1, this.list);
    };

    ReservationsExplorativeAddController.prototype.fetch = function(page, target) {
      return this.fetchModels(page).done((function(_this) {
        return function() {
          return _this.fetchAvailability(page).done(function() {
            return _this.render(target, _this.models[page], page);
          });
        };
      })(this));
    };

    ReservationsExplorativeAddController.prototype.fetchModels = function(page) {
      var ref;
      return App.Model.ajaxFetch({
        data: $.param({
          page: page,
          category_id: (ref = this.categoriesFilter.getCurrent()) != null ? ref.id : void 0,
          used: true,
          borrowable: true,
          responsible_inventory_pool_id: App.InventoryPool.current.id
        })
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, models;
          _this.pagination.set(JSON.parse(xhr.getResponseHeader("X-Pagination")));
          models = (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = data.length; j < len; j++) {
              datum = data[j];
              results.push(App.Model.find(datum.id));
            }
            return results;
          })();
          return _this.models[page] = models;
        };
      })(this));
    };

    ReservationsExplorativeAddController.prototype.fetchAvailability = function(page) {
      var ids, models;
      models = _.filter(this.models[page], function(i) {
        return i.constructor.className === "Model";
      });
      ids = _.map(models, function(m) {
        return m.id;
      });
      if (!ids.length) {
        return {
          done: function(c) {
            return c();
          }
        };
      }
      return App.Availability.ajaxFetch({
        url: App.Availability.url(),
        data: $.param({
          model_ids: ids,
          user_id: this.user.id
        })
      });
    };

    ReservationsExplorativeAddController.prototype.render = function(target, data, page) {
      if (data != null) {
        if (data.length) {
          target.html(App.Render("manage/views/models/explorative_add_line", data, {
            startDate: this.startDate,
            endDate: this.endDate,
            groupIds: this.user.groupIds
          }));
          if (page === 1) {
            return this.pagination.renderPlaceholders();
          }
        } else {
          return target.html(App.Render("manage/views/lists/no_results"));
        }
      }
    };

    ReservationsExplorativeAddController.prototype.select = function(e) {
      var model, target;
      target = $(e.currentTarget);
      model = App.Model.find(target.closest("[data-id]").data("id"));
      this.addModel(model, this.startDate, this.endDate);
      return this.modal.destroy(true);
    };

    return ReservationsExplorativeAddController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SwapModelController = (function(superClass) {
    extend(SwapModelController, superClass);

    function SwapModelController() {
      this.exploreModels = bind(this.exploreModels, this);
      this.swapModel = bind(this.swapModel, this);
      return SwapModelController.__super__.constructor.apply(this, arguments);
    }

    SwapModelController.prototype.events = {
      "click [data-swap-model]": "exploreModels"
    };

    SwapModelController.prototype.swapModel = function(model, startDate, endDate) {
      var line;
      return $.post("/manage/" + App.InventoryPool.current.id + "/reservations/swap_model", {
        line_ids: (function() {
          var i, len, ref, results;
          ref = this.reservations;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            line = ref[i];
            results.push(line.id);
          }
          return results;
        }).call(this),
        model_id: model.id
      }, function(data) {
        var i, len, results;
        results = [];
        for (i = 0, len = data.length; i < len; i++) {
          line = data[i];
          results.push(App.Reservation.update(line.id, line));
        }
        return results;
      });
    };

    SwapModelController.prototype.exploreModels = function(e) {
      var reservation;
      this.reservations = $(e.currentTarget).closest("[data-ids]").length ? _.map($(e.currentTarget).closest("[data-ids]").data("ids"), function(id) {
        return App.Reservation.find(id);
      }) : [App.Reservation.find($(e.currentTarget).closest("[data-id]").data("id"))];
      reservation = this.reservations[0];
      return new App.ReservationsExplorativeAddController({
        startDate: reservation.start_date,
        endDate: reservation.end_date,
        addModel: this.swapModel,
        user: this.user
      });
    };

    return SwapModelController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ReturnedQuantityController = (function(superClass) {
    extend(ReturnedQuantityController, superClass);

    function ReturnedQuantityController() {
      this.updateWith = bind(this.updateWith, this);
      this.restore = bind(this.restore, this);
      return ReturnedQuantityController.__super__.constructor.apply(this, arguments);
    }

    ReturnedQuantityController.prototype.returnedQuantities = [];

    ReturnedQuantityController.prototype.restore = function() {
      return _.each(this.returnedQuantities, (function(_this) {
        return function(inputField) {
          var ref;
          return (ref = _this.el.find(".line[data-id='" + inputField["id"] + "'] [data-quantity-returned]")) != null ? ref.val(inputField["quantity"]) : void 0;
        };
      })(this));
    };

    ReturnedQuantityController.prototype.updateWith = function(id, quantity) {
      this.returnedQuantities = _.reject(this.returnedQuantities, function(el) {
        return el["id"] === id;
      });
      return this.returnedQuantities.push({
        id: id,
        quantity: quantity
      });
    };

    return ReturnedQuantityController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchSetUserController = (function(superClass) {
    extend(SearchSetUserController, superClass);

    SearchSetUserController.prototype.events = {
      "preChange #user-id": "searchUser",
      "click #remove-user": "removeUser"
    };

    SearchSetUserController.prototype.elements = {
      "#user-id": "input",
      "#selected-user": "selectedUser"
    };

    function SearchSetUserController(options) {
      this.removeUser = bind(this.removeUser, this);
      SearchSetUserController.__super__.constructor.apply(this, arguments);
      if (this.localSearch === true) {
        this.setupAutocomplete();
        this.input.on("focus", function() {
          return $(this).autocomplete("search");
        });
        this.input.autocomplete("search");
      } else {
        this.input.preChange({
          delay: 200
        });
      }
    }

    SearchSetUserController.prototype.setupAutocomplete = function(users) {
      var autocompleteOptions;
      autocompleteOptions = {
        appendTo: this.el,
        source: (function(_this) {
          return function(request, response) {
            var data;
            data = _.map(users, function(u) {
              u.value = u.id;
              return u;
            });
            return response(data);
          };
        })(this),
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        select: (function(_this) {
          return function(e, ui) {
            _this.selectUser(ui.item);
            return false;
          };
        })(this)
      };
      $.extend(autocompleteOptions, this.customAutocompleteOptions);
      return this.input.autocomplete(autocompleteOptions).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("manage/views/users/autocomplete_element", item)).data("value", item).appendTo(ul);
        };
      })(this);
    };

    SearchSetUserController.prototype.searchUser = function() {
      var data, term;
      term = this.input.val();
      if (term.length === 0) {
        return false;
      }
      data = {
        search_term: term
      };
      $.extend(data, this.additionalSearchParams);
      return App.User.ajaxFetch({
        data: $.param(data)
      }).done((function(_this) {
        return function(data) {
          var datum;
          _this.setupAutocomplete((function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.find(datum.id));
            }
            return results;
          })());
          return _this.input.autocomplete("search");
        };
      })(this));
    };

    SearchSetUserController.prototype.selectUser = function(user) {
      this.input.hide().autocomplete("disable").attr("value", user.id);
      this.selectedUserId = user.id;
      this.selectedUser.html(App.Render("manage/views/orders/edit/swapped_user", user));
      return typeof this.selectCallback === "function" ? this.selectCallback() : void 0;
    };

    SearchSetUserController.prototype.removeUser = function() {
      this.input.show().autocomplete("enable").val("").focus();
      this.selectedUserId = null;
      this.selectedUser.html("");
      return typeof this.removeCallback === "function" ? this.removeCallback() : void 0;
    };

    return SearchSetUserController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ImagesController = (function(superClass) {
    extend(ImagesController, superClass);

    ImagesController.prototype.templatePath = "manage/views/templates/upload/image_inline_entry";

    function ImagesController() {
      this.processNewFile = bind(this.processNewFile, this);
      ImagesController.__super__.constructor.apply(this, arguments);
    }

    ImagesController.prototype.processNewFile = function(template, file) {
      var reader;
      reader = new FileReader();
      reader.onload = (function(_this) {
        return function(e) {
          return template.find("img").attr("src", e.target.result);
        };
      })(this);
      return reader.readAsDataURL(file);
    };

    return ImagesController;

  })(App.UploadController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.InlineEntryRemoveController = (function(superClass) {
    extend(InlineEntryRemoveController, superClass);

    function InlineEntryRemoveController() {
      this.toggleDestroy = bind(this.toggleDestroy, this);
      this.remove = bind(this.remove, this);
      return InlineEntryRemoveController.__super__.constructor.apply(this, arguments);
    }

    InlineEntryRemoveController.prototype.events = {
      "click [data-type='inline-entry'] [data-remove]": "remove"
    };

    InlineEntryRemoveController.prototype.remove = function(e) {
      var line;
      e.preventDefault();
      line = $(e.currentTarget).closest("[data-type='inline-entry']");
      line.trigger("inline-entry-remove", line);
      if (line.data("new") != null) {
        line.remove();
        return typeof this.removeCallback === "function" ? this.removeCallback(line) : void 0;
      } else {
        return this.toggleDestroy(line, $(e.currentTarget));
      }
    };

    InlineEntryRemoveController.prototype.toggleDestroy = function(line, target) {
      var destroyInput, removeButton, template;
      removeButton = target;
      destroyInput = line.find("[name*='_destroy']");
      if (line.data("destroyOnSave") != null) {
        line.removeClass("striked");
        line.find("input:visible").prop("disabled", false);
        line.data("removedOnSaveInfo").remove();
        line.find("[data-disable-on-remove]").prop("disabled", false);
        if (destroyInput.length) {
          destroyInput.val(null);
        }
        line.data("destroyOnSave", null);
        target.text(_jed("Remove"));
        return typeof this.unstrikeCallback === "function" ? this.unstrikeCallback(line) : void 0;
      } else {
        line.addClass("striked");
        line.find("input:visible").prop("disabled", true);
        template = $(App.Render("manage/views/inline_entries/removed_on_save_info"));
        line.data("removedOnSaveInfo", template);
        line.prepend(template);
        line.find("[data-disable-on-remove]").prop("disabled", true);
        if (destroyInput.length) {
          destroyInput.val(1);
        }
        line.data("destroyOnSave", true);
        target.text(_jed("undo"));
        return typeof this.strikeCallback === "function" ? this.strikeCallback(line) : void 0;
      }
    };

    return InlineEntryRemoveController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.LatestReminderTooltipController = (function(superClass) {
    extend(LatestReminderTooltipController, superClass);

    function LatestReminderTooltipController() {
      this.onEnter = bind(this.onEnter, this);
      return LatestReminderTooltipController.__super__.constructor.apply(this, arguments);
    }

    LatestReminderTooltipController.prototype.events = {
      "mouseenter .latest-reminder-cell": "onEnter"
    };

    LatestReminderTooltipController.prototype.onEnter = function(e) {
      var tooltip, trigger;
      trigger = $(e.currentTarget);
      tooltip = new App.Tooltip({
        el: trigger,
        content: App.Render("views/loading", {
          size: "micro"
        })
      });
      return App.LatestReminder.ajaxFetch({
        url: "/manage/" + App.InventoryPool.current.id + "/latest_reminder",
        data: $.param({
          user_id: trigger.data("user-id"),
          visit_id: trigger.data("visit-id")
        })
      }).done((function(_this) {
        return function(data) {
          if (data.length) {
            return tooltip.update(App.Render("manage/views/inventory_pools/latest_reminder/tooltip", data));
          } else {
            return tooltip.update(_jed("No reminder yet"));
          }
        };
      })(this));
    };

    return LatestReminderTooltipController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.LinesCellTooltipController = (function(superClass) {
    extend(LinesCellTooltipController, superClass);

    function LinesCellTooltipController() {
      this.fetchOptions = bind(this.fetchOptions, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.sliceFetchOptions = bind(this.sliceFetchOptions, this);
      this.sliceFetchModels = bind(this.sliceFetchModels, this);
      this.fetchData = bind(this.fetchData, this);
      this.onEnter = bind(this.onEnter, this);
      return LinesCellTooltipController.__super__.constructor.apply(this, arguments);
    }

    LinesCellTooltipController.prototype.events = {
      "mouseenter [data-type='lines-cell']": "onEnter"
    };

    LinesCellTooltipController.prototype.onEnter = function(e) {
      var record, tooltip, trigger;
      trigger = $(e.currentTarget);
      record = trigger.closest(".line[data-type='contract']").length ? App.Contract.findOrBuild(trigger.closest(".line[data-type='contract']").data()) : trigger.closest(".line[data-type='order']").length ? App.Order.findOrBuild(trigger.closest(".line[data-type='order']").data()) : trigger.closest(".line[data-type='take_back']").length ? App.Visit.findOrBuild(trigger.closest(".line[data-type='take_back']").data()) : trigger.closest(".line[data-type='hand_over']").length ? App.Visit.findOrBuild(trigger.closest(".line[data-type='hand_over']").data()) : void 0;
      tooltip = new App.Tooltip({
        el: trigger.closest(".line-col"),
        content: App.Render("views/loading", {
          size: "micro"
        })
      });
      return this.fetchData(record, (function(_this) {
        return function() {
          return tooltip.update(App.Render("manage/views/reservations/tooltip", record));
        };
      })(this));
    };

    LinesCellTooltipController.prototype.fetchData = function(record, callback) {
      var i, len, line, modelIds, optionIds, ref;
      modelIds = [];
      optionIds = [];
      ref = record.reservations().all();
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
        if (line.model_id != null) {
          if (App.Model.exists(line.model_id) == null) {
            modelIds.push(line.model_id);
          }
        } else if (line.option_id != null) {
          if (App.Option.exists(line.option_id) == null) {
            optionIds.push(line.option_id);
          }
        }
      }
      if (modelIds.length > 0) {
        return this.sliceFetchModels(modelIds, (function(_this) {
          return function() {
            if (optionIds.length > 0) {
              return _this.sliceFetchOptions(optionIds, callback);
            } else {
              return _this.fetchOptions(optionIds).done(function() {
                return callback();
              });
            }
          };
        })(this));
      } else {
        return this.fetchModels(modelIds).done((function(_this) {
          return function() {
            if (optionIds.length > 0) {
              return _this.sliceFetchOptions(optionIds, callback);
            } else {
              return _this.fetchOptions(optionIds).done(function() {
                return callback();
              });
            }
          };
        })(this));
      }
    };

    LinesCellTooltipController.prototype.sliceFetchModels = function(modelIds, callback) {
      var callback_after;
      callback_after = _.after(Math.ceil(modelIds.length / 50), callback);
      return _(modelIds).each_slice(50, (function(_this) {
        return function(slice) {
          return _this.fetchModels(slice).done(callback_after);
        };
      })(this));
    };

    LinesCellTooltipController.prototype.sliceFetchOptions = function(optionIds, callback) {
      var callback_after;
      callback_after = _.after(Math.ceil(optionIds.length / 50), callback);
      return _(optionIds).each_slice(50, (function(_this) {
        return function(slice) {
          return _this.fetchOptions(slice).done(callback_after);
        };
      })(this));
    };

    LinesCellTooltipController.prototype.fetchModels = function(ids) {
      if (ids.length) {
        return App.Model.ajaxFetch({
          data: $.param({
            ids: ids,
            paginate: false
          })
        });
      } else {
        return {
          done: function(c) {
            return c();
          }
        };
      }
    };

    LinesCellTooltipController.prototype.fetchOptions = function(ids) {
      if (ids.length) {
        return App.Option.ajaxFetch({
          data: $.param({
            ids: ids,
            paginate: false
          })
        });
      } else {
        return {
          done: function(c) {
            return c();
          }
        };
      }
    };

    return LinesCellTooltipController;

  })(Spine.Controller);

}).call(this);

/*

  Selected Lines
 
  This script sets up functionalities for selection based functionalities for multiple reservations.
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.LineSelectionController = (function(superClass) {
    extend(LineSelectionController, superClass);

    LineSelectionController.selected = [];

    LineSelectionController.Singleton = null;

    LineSelectionController.prototype.elements = {
      "#line-selection-counter": "lineSelectionCounter"
    };

    function LineSelectionController() {
      this.storeIdsToInputValues = bind(this.storeIdsToInputValues, this);
      this.storeIdsToHrefs = bind(this.storeIdsToHrefs, this);
      this.storeIds = bind(this.storeIds, this);
      this.disable = bind(this.disable, this);
      this.enable = bind(this.enable, this);
      this.restore = bind(this.restore, this);
      this.update = bind(this.update, this);
      this.blurLines = bind(this.blurLines, this);
      this.focusLines = bind(this.focusLines, this);
      this.toggleContainerAbove = bind(this.toggleContainerAbove, this);
      this.toggleLinesIn = bind(this.toggleLinesIn, this);
      this.toggleContainer = bind(this.toggleContainer, this);
      this.toggleLine = bind(this.toggleLine, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      LineSelectionController.__super__.constructor.apply(this, arguments);
      this.delegateEvents();
      App.LineSelectionController.Singleton = this;
    }

    LineSelectionController.prototype.delegateEvents = function() {
      this.el.on("change", "input[data-select-line]", this.toggleLine);
      this.el.on("change", "input[data-select-lines]", this.toggleContainer);
      this.el.on("change", "input[data-select-lines], input[data-select-line]", this.update);
      this.el.on("mouseenter", "input[data-select-lines]", this.focusLines);
      this.el.on("mouseleave", "input[data-select-lines]", this.blurLines);
      App.Reservation.on("destroy", this.update);
      return App.Contract.on("refresh", this.update);
    };

    LineSelectionController.prototype.toggleLine = function(e) {
      var line;
      line = $(e.currentTarget).closest(".line");
      return this.toggleContainerAbove(line);
    };

    LineSelectionController.prototype.toggleContainer = function(e) {
      var container;
      container = $(e.currentTarget).closest("[data-selected-lines-container]");
      return this.toggleLinesIn(container);
    };

    LineSelectionController.prototype.toggleLinesIn = function(container) {
      var checked, input, j, len, ref, results;
      checked = container.find("[data-select-lines]").is(":checked");
      ref = container.find("[data-select-line]");
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        input = ref[j];
        results.push($(input).prop("checked", checked));
      }
      return results;
    };

    LineSelectionController.prototype.toggleContainerAbove = function(line) {
      var container;
      container = line.closest("[data-selected-lines-container]");
      if (container.find("[data-select-line]:not(:checked)").length) {
        return container.find("[data-select-lines]").prop("checked", false);
      } else {
        return container.find("[data-select-lines]").prop("checked", true);
      }
    };

    LineSelectionController.prototype.focusLines = function(e) {
      return $(e.currentTarget).closest(".emboss").addClass("focus-thin");
    };

    LineSelectionController.prototype.blurLines = function(e) {
      return $(e.currentTarget).closest(".emboss").removeClass("focus-thin");
    };

    LineSelectionController.prototype.update = function() {
      var ref, reservations;
      reservations = $("[data-select-line]:checked").closest(".line");
      this.store(reservations);
      if ((ref = this.markVisitLinesController) != null) {
        ref.update(App.LineSelectionController.selected);
      }
      this.lineSelectionCounter.html(reservations.length);
      if (reservations.length) {
        this.enable();
      } else {
        this.disable();
      }
      return this.storeIds();
    };

    LineSelectionController.prototype.store = function(reservations) {
      var ids;
      ids = _.flatten(_.map(reservations, function(line) {
        var ref;
        return (ref = $(line).data("ids")) != null ? ref : [$(line).data("id")];
      }));
      return App.LineSelectionController.selected = ids;
    };

    LineSelectionController.prototype.restore = function() {
      var ids, input, j, len, line, ref, ref1, ref2;
      ref = $("[data-select-line]");
      for (j = 0, len = ref.length; j < len; j++) {
        input = ref[j];
        input = $(input);
        line = input.closest(".line");
        ids = (ref1 = $(line).data("ids")) != null ? ref1 : [$(line).data("id")];
        if (ids.length && _.all(ids, function(id) {
          return _.include(App.LineSelectionController.selected, id);
        })) {
          input.prop("checked", true);
          this.toggleContainerAbove(line);
        }
      }
      ids = App.LineSelectionController.selected;
      if ((ref2 = this.markVisitLinesController) != null) {
        ref2.update(App.LineSelectionController.selected);
      }
      this.lineSelectionCounter.html(ids.length);
      if (ids.length) {
        this.enable();
      } else {
        this.disable();
      }
      return this.storeIds();
    };

    LineSelectionController.prototype.enable = function() {
      var button, j, len, ref, results;
      ref = $(".button[data-selection-enabled]");
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        button = ref[j];
        results.push(App.Button.enable($(button)));
      }
      return results;
    };

    LineSelectionController.prototype.disable = function() {
      var button, j, len, ref, results;
      ref = $(".button[data-selection-enabled]");
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        button = ref[j];
        results.push(App.Button.disable($(button)));
      }
      return results;
    };

    LineSelectionController.prototype.storeIds = function() {
      this.storeIdsToHrefs();
      return this.storeIdsToInputValues();
    };

    LineSelectionController.prototype.storeIdsToHrefs = function() {
      var j, len, link, ref, results, uri;
      ref = $("a[data-update-href]");
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        link = ref[j];
        link = $(link);
        uri = URI(link.attr("href")).removeQuery("ids[]").addQuery("ids[]", App.LineSelectionController.selected);
        results.push(link.attr("href", uri.toString()));
      }
      return results;
    };

    LineSelectionController.prototype.storeIdsToInputValues = function() {
      var appendTo, id, j, len, ref, results;
      this.el.find("[data-input-fields-container]").remove();
      this.el.find("[data-insert-before]").before("<div data-input-fields-container></div>");
      appendTo = this.el.find("[data-input-fields-container]");
      ref = App.LineSelectionController.selected;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        id = ref[j];
        results.push(appendTo.append("<input type='hidden' name='ids[]' data-store-id value='" + id + "'>"));
      }
      return results;
    };

    LineSelectionController.add = function(id) {
      if (!_.find(LineSelectionController.selected, function(i) {
        return i === id;
      })) {
        LineSelectionController.selected.push(id);
        return LineSelectionController.Singleton.restore();
      }
    };

    return LineSelectionController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ListFiltersController = (function(superClass) {
    extend(ListFiltersController, superClass);

    function ListFiltersController() {
      this.getData = bind(this.getData, this);
      this.reset = bind(this.reset, this);
      return ListFiltersController.__super__.constructor.apply(this, arguments);
    }

    ListFiltersController.prototype.events = {
      "change": "reset"
    };

    ListFiltersController.prototype.reset = function() {
      return this.reset();
    };

    ListFiltersController.prototype.getData = function() {
      var data, datum, i, len, ref;
      data = {};
      ref = $(':visible', this.el).serializeArray();
      for (i = 0, len = ref.length; i < len; i++) {
        datum = ref[i];
        if (datum.value.length && datum.value !== "0") {
          data[datum.name] = datum.value;
        }
      }
      return data;
    };

    return ListFiltersController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ListPaginationController = (function(superClass) {
    extend(ListPaginationController, superClass);

    function ListPaginationController() {
      this.inview = bind(this.inview, this);
      this.renderPlaceholders = bind(this.renderPlaceholders, this);
      this.totalPages = bind(this.totalPages, this);
      this.set = bind(this.set, this);
      return ListPaginationController.__super__.constructor.apply(this, arguments);
    }

    ListPaginationController.prototype.events = {
      "inview .page:not(.fetched)": "inview"
    };

    ListPaginationController.prototype.set = function(data) {
      this.totalCount = data.total_count;
      return this.perPage = data.per_page;
    };

    ListPaginationController.prototype.totalPages = function() {
      return Math.ceil(this.totalCount / this.perPage);
    };

    ListPaginationController.prototype.renderPlaceholders = function() {
      var notLoadedPages;
      notLoadedPages = this.totalPages() - 1;
      if (notLoadedPages > 0) {
        return _.each(_.range(1, notLoadedPages + 1), (function(_this) {
          return function(page) {
            var template;
            page = page + 1;
            template = $(App.Render("manage/views/lists/page", page, {
              entries: _.range(_this.perPage),
              page: page
            }));
            return _this.el.append(template);
          };
        })(this));
      }
    };

    ListPaginationController.prototype.inview = function(e) {
      var target;
      target = $(e.currentTarget);
      target.addClass("fetched");
      return this.fetch(target.data("page"), target);
    };

    return ListPaginationController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ListRangeController = (function(superClass) {
    extend(ListRangeController, superClass);

    ListRangeController.prototype.elements = {
      "input[name='start_date']": "startDate",
      "input[name='end_date']": "endDate",
      "input[name='before_last_check']": "beforeLastCheck"
    };

    ListRangeController.prototype.events = {
      "change input[name='start_date']": "reset",
      "change input[name='end_date']": "reset",
      "change input[name='before_last_check']": "reset"
    };

    function ListRangeController() {
      this.getBeforeLastCheck = bind(this.getBeforeLastCheck, this);
      this.getEndDate = bind(this.getEndDate, this);
      this.getStartDate = bind(this.getStartDate, this);
      this.get = bind(this.get, this);
      this.setupInputs = bind(this.setupInputs, this);
      ListRangeController.__super__.constructor.apply(this, arguments);
      this.setupInputs();
    }

    ListRangeController.prototype.setupInputs = function() {
      var i, input, len, ref, results;
      ref = [this.startDate, this.endDate, this.beforeLastCheck];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        input = ref[i];
        if ($(input).length) {
          if ($(input).val().length) {
            $(input).val(moment($(input).val()).format(i18n.date.L));
          }
          results.push($(input).datepicker({
            dateFormat: i18n.datepicker.L
          }));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ListRangeController.prototype.get = function() {
      var data;
      data = {};
      if (this.getStartDate() != null) {
        data.start_date = this.getStartDate().format("YYYY-MM-DD");
      }
      if (this.getEndDate() != null) {
        data.end_date = this.getEndDate().format("YYYY-MM-DD");
      }
      if (this.getBeforeLastCheck() != null) {
        data.before_last_check = this.getBeforeLastCheck().format("YYYY-MM-DD");
      }
      return data;
    };

    ListRangeController.prototype.getStartDate = function() {
      if (this.startDate.val() !== "") {
        return moment(this.startDate.val(), i18n.date.L);
      }
    };

    ListRangeController.prototype.getEndDate = function() {
      if (this.endDate.val() !== "") {
        return moment(this.endDate.val(), i18n.date.L);
      }
    };

    ListRangeController.prototype.getBeforeLastCheck = function() {
      if (this.beforeLastCheck.val() !== "") {
        return moment(this.beforeLastCheck.val(), i18n.date.L);
      }
    };

    return ListRangeController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ListSearchController = (function(superClass) {
    extend(ListSearchController, superClass);

    ListSearchController.prototype.events = {
      "change": "search",
      "preChange": "search"
    };

    function ListSearchController() {
      this.term = bind(this.term, this);
      this.search = bind(this.search, this);
      ListSearchController.__super__.constructor.apply(this, arguments);
      this.el.preChange();
    }

    ListSearchController.prototype.search = function() {
      if (this.currentSearch !== this.term()) {
        this.reset();
      }
      return this.currentSearch = this.term();
    };

    ListSearchController.prototype.term = function() {
      if (this.el.val().length) {
        return this.el.val();
      } else {
        return null;
      }
    };

    return ListSearchController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ListTabsController = (function(superClass) {
    extend(ListTabsController, superClass);

    ListTabsController.prototype.events = {
      "click .inline-tab-item": "switch"
    };

    function ListTabsController() {
      this.getData = bind(this.getData, this);
      this["switch"] = bind(this["switch"], this);
      ListTabsController.__super__.constructor.apply(this, arguments);
      this.data = this.el.find(".active").data();
    }

    ListTabsController.prototype["switch"] = function(e) {
      var target;
      target = $(e.currentTarget);
      this.data = target.data();
      this.el.find(".inline-tab-item.active").removeClass("active");
      target.addClass("active");
      return this.reset();
    };

    ListTabsController.prototype.getData = function() {
      return _.clone(this.data);
    };

    return ListTabsController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.OrdersPaginationController = (function(superClass) {
    extend(OrdersPaginationController, superClass);

    function OrdersPaginationController() {
      this.inview = bind(this.inview, this);
      this.set = bind(this.set, this);
      return OrdersPaginationController.__super__.constructor.apply(this, arguments);
    }

    OrdersPaginationController.prototype.events = {
      "inview .page:not(.fetched)": "inview"
    };

    OrdersPaginationController.prototype.set = function(data) {
      return this.perPage = data.per_page;
    };

    OrdersPaginationController.prototype.inview = function(e) {
      var target;
      target = $(e.currentTarget);
      target.addClass("fetched");
      return this.fetch(target.data("page"), target);
    };

    return OrdersPaginationController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ManageUsersViaAutocompleteController = (function(superClass) {
    extend(ManageUsersViaAutocompleteController, superClass);

    ManageUsersViaAutocompleteController.prototype.elements = {
      "input[data-search-users]": "input",
      "[data-users-list]": "usersList"
    };

    ManageUsersViaAutocompleteController.prototype.events = {
      "preChange input[data-search-users]": "search",
      "click [data-remove-user]": "removeHandler"
    };

    function ManageUsersViaAutocompleteController() {
      this.select = bind(this.select, this);
      this.setupAutocomplete = bind(this.setupAutocomplete, this);
      this.fetchUsers = bind(this.fetchUsers, this);
      this.search = bind(this.search, this);
      ManageUsersViaAutocompleteController.__super__.constructor.apply(this, arguments);
      this.input.preChange();
    }

    ManageUsersViaAutocompleteController.prototype.search = function() {
      if (!this.input.val().length) {
        return false;
      }
      return this.fetchUsers().done((function(_this) {
        return function(data) {
          var datum;
          return _this.setupAutocomplete((function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.find(datum.id));
            }
            return results;
          })());
        };
      })(this));
    };

    ManageUsersViaAutocompleteController.prototype.fetchUsers = function() {
      var data;
      data = {
        search_term: this.input.val()
      };
      $.extend(data, this.fetchUsersParams);
      return App.User.ajaxFetch({
        data: $.param(data)
      });
    };

    ManageUsersViaAutocompleteController.prototype.setupAutocomplete = function(users) {
      this.input.autocomplete({
        source: (function(_this) {
          return function(request, response) {
            return response(users);
          };
        })(this),
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        select: this.select
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("manage/views/templates/users/autocomplete_element", item)).data("value", item).appendTo(ul);
        };
      })(this);
      return this.input.autocomplete("search");
    };

    ManageUsersViaAutocompleteController.prototype.select = function(e, ui) {
      var userElement;
      userElement = this.usersList.find("input[value='" + ui.item.id + "']").closest(".line");
      if (userElement.length) {
        return this.usersList.prepend(userElement);
      } else {
        return this.usersList.prepend(App.Render("manage/views/templates/users/user_inline_entry", App.User.find(ui.item.id), {
          paramName: this.paramName
        }));
      }
    };

    return ManageUsersViaAutocompleteController;

  })(Spine.Controller);

}).call(this);

/*

  Marked Lines
 
  This script sets up functionalities for marking selected visit reservations
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.MarkVisitLinesController = (function(superClass) {
    extend(MarkVisitLinesController, superClass);

    function MarkVisitLinesController() {
      this.markSelectedLines = bind(this.markSelectedLines, this);
      this.unmarkAllLines = bind(this.unmarkAllLines, this);
      this.update = bind(this.update, this);
      return MarkVisitLinesController.__super__.constructor.apply(this, arguments);
    }

    MarkVisitLinesController.prototype.update = function(ids) {
      this.unmarkAllLines();
      return this.markSelectedLines(ids);
    };

    MarkVisitLinesController.prototype.unmarkAllLines = function() {
      var i, len, line, ref, results;
      ref = this.el.find(".line[data-id]");
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
        results.push($(line).removeClass("green").addClass("light"));
      }
      return results;
    };

    MarkVisitLinesController.prototype.markSelectedLines = function(ids) {
      var c_status, cl, i, id, len, line, results;
      results = [];
      for (i = 0, len = ids.length; i < len; i++) {
        id = ids[i];
        cl = App.Reservation.find(id);
        if (cl.item()) {
          line = this.el.find(".line[data-id='" + id + "']");
          results.push(line.removeClass("light").addClass("green"));
        } else if (cl.option()) {
          line = this.el.find(".line[data-id='" + id + "']");
          c_status = cl.status;
          if (c_status === "approved") {
            if (Number(line.find("input[data-line-quantity]").val()) >= 1) {
              results.push(line.removeClass("light").addClass("green"));
            } else {
              results.push(void 0);
            }
          } else if (c_status === "signed") {
            if (Number(line.find("input[data-quantity-returned]").val()) === cl.quantity) {
              results.push(line.removeClass("light").addClass("green"));
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return MarkVisitLinesController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TimeLineController = (function(superClass) {
    extend(TimeLineController, superClass);

    function TimeLineController() {
      this.onload = bind(this.onload, this);
      return TimeLineController.__super__.constructor.apply(this, arguments);
    }

    TimeLineController.prototype.events = {
      "click [data-open-time-line]": "show"
    };

    TimeLineController.prototype.show = function(e) {
      var id, model, tmpl, trigger;
      trigger = $(e.currentTarget);
      id = trigger.data("model-id");
      model = App.Model.exists(id) || App.Software.find(id);
      tmpl = App.Render("manage/views/models/timeline_modal", model);
      this.modal = new App.Modal(tmpl);
      return this.modal.el.find("iframe").load(this.onload);
    };

    TimeLineController.prototype.onload = function() {
      return this.modal.el.find("#loading").remove();
    };

    return TimeLineController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SwapUsersController = (function(superClass) {
    extend(SwapUsersController, superClass);

    SwapUsersController.prototype.events = {
      "submit form": "submit"
    };

    SwapUsersController.prototype.elements = {
      "form": "form",
      "#errors": "errorsContainer",
      "button[type='submit']": "submitButton"
    };

    function SwapUsersController(data) {
      this.setupContactPerson = bind(this.setupContactPerson, this);
      this.renderContactPerson = bind(this.renderContactPerson, this);
      this.swapReservations = bind(this.swapReservations, this);
      this.swapOrder = bind(this.swapOrder, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      this.order = data.reservations != null ? data.reservations[0].order() : data.order;
      this.user = data.user;
      this.modal = new App.Modal(App.Render("manage/views/orders/edit/swap_user_modal", this.user));
      this.el = this.modal.el;
      SwapUsersController.__super__.constructor.apply(this, arguments);
      this.disableForm();
      this.searchSetUserController = new App.SearchSetUserController({
        el: this.el.find("#user #swapped-person"),
        selectCallback: (function(_this) {
          return function() {
            _this.enableForm();
            if (_this.manageContactPerson) {
              return _this.setupContactPerson();
            }
          };
        })(this),
        removeCallback: (function(_this) {
          return function() {
            return _this.disableForm();
          };
        })(this)
      });
      if (this.manageContactPerson) {
        this.setupContactPerson();
      }
    }

    SwapUsersController.prototype.delegateEvents = function() {
      return SwapUsersController.__super__.delegateEvents.apply(this, arguments);
    };

    SwapUsersController.prototype.disableForm = function() {
      return this.submitButton.attr('disabled', true);
    };

    SwapUsersController.prototype.enableForm = function() {
      return this.submitButton.attr('disabled', false);
    };

    SwapUsersController.prototype.isDisabledForm = function() {
      return !!this.submitButton.attr('disabled');
    };

    SwapUsersController.prototype.submit = function(e) {
      e.preventDefault();
      if (this.isDisabledForm()) {
        return;
      }
      this.errorsContainer.addClass("hidden");
      App.Button.disable(this.submitButton);
      if (this.reservations != null) {
        return this.swapReservations();
      } else {
        return this.swapOrder();
      }
    };

    SwapUsersController.prototype.swapOrder = function() {
      var ref, ref1, userId;
      userId = (ref = this.searchSetUserController.selectedUserId) != null ? ref : this.order.user().id;
      return this.order.swapUser(userId, (ref1 = this.searchSetContactPersonController) != null ? ref1.selectedUserId : void 0).done((function(_this) {
        return function() {
          return window.location = _this.order.editPath();
        };
      })(this)).fail((function(_this) {
        return function(e) {
          _this.errorsContainer.removeClass("hidden");
          App.Button.enable(_this.submitButton);
          return _this.errorsContainer.find("strong").text(e.responseText);
        };
      })(this));
    };

    SwapUsersController.prototype.swapReservations = function() {
      return App.Reservation.swapUser(this.reservations, this.searchSetUserController.selectedUserId).done((function(_this) {
        return function() {
          return window.location = App.User.find(_this.searchSetUserController.selectedUserId).url("hand_over");
        };
      })(this)).fail((function(_this) {
        return function(e) {
          _this.errorsContainer.removeClass("hidden");
          App.Button.enable(_this.submitButton);
          return _this.errorsContainer.find("strong").text(e.responseText);
        };
      })(this));
    };

    SwapUsersController.prototype.renderContactPerson = function() {
      return this.form.append(App.Render("manage/views/orders/edit/contact_person", this.order));
    };

    SwapUsersController.prototype.setupContactPerson = function() {
      var ref, user_id;
      this.el.find("#contact-person").remove();
      this.searchSetContactPersonController = null;
      user_id = (ref = this.searchSetUserController.selectedUserId) != null ? ref : this.order.user().id;
      if (App.User.find(user_id).isDelegation()) {
        this.renderContactPerson();
        return App.User.ajaxFetch({
          data: $.param({
            delegation_id: user_id
          })
        }).done((function(_this) {
          return function(data) {
            var datum;
            return _this.searchSetContactPersonController = new App.SearchSetUserController({
              el: _this.el.find("#contact-person #swapped-person"),
              localSearch: true,
              customAutocompleteOptions: {
                source: (function() {
                  var i, len, results;
                  results = [];
                  for (i = 0, len = data.length; i < len; i++) {
                    datum = data[i];
                    results.push($.extend(App.User.find(datum.id), {
                      label: datum.name
                    }));
                  }
                  return results;
                })(),
                minLength: 0
              },
              selectCallback: function() {
                return _this.enableForm();
              },
              removeCallback: function() {
                return _this.disableForm();
              }
            });
          };
        })(this));
      }
    };

    return SwapUsersController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TakeBackController = (function(superClass) {
    extend(TakeBackController, superClass);

    TakeBackController.prototype.elements = {
      "#status": "status",
      "#lines": "reservationsContainer",
      "form#assign": "form",
      "#assign-input": "input"
    };

    TakeBackController.prototype.events = {
      "click [data-take-back-selection]": "takeBack",
      "click [data-inspect-item]": "inspectItem",
      "submit form#assign": "assign",
      "focus #assign-input": "showAutocomplete",
      "change [data-quantity-returned]": "changeQuantity",
      "preChange [data-quantity-returned]": "changeQuantity"
    };

    function TakeBackController() {
      this.inspectItem = bind(this.inspectItem, this);
      this.changeQuantity = bind(this.changeQuantity, this);
      this.showAutocomplete = bind(this.showAutocomplete, this);
      this.select = bind(this.select, this);
      this.setupAutocomplete = bind(this.setupAutocomplete, this);
      this.increaseOption = bind(this.increaseOption, this);
      this.getQuantity = bind(this.getQuantity, this);
      this.getCheckLineFunction = bind(this.getCheckLineFunction, this);
      this.assign = bind(this.assign, this);
      this.takeBack = bind(this.takeBack, this);
      this.render = bind(this.render, this);
      this.getLines = bind(this.getLines, this);
      this.fetchAvailability = bind(this.fetchAvailability, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      TakeBackController.__super__.constructor.apply(this, arguments);
      App.TakeBackController.readyForTakeBack = [];
      this.lineSelection = new App.LineSelectionController({
        el: this.el,
        markVisitLinesController: new App.MarkVisitLinesController({
          el: this.el
        })
      });
      this.returnedQuantitiesController = new App.ReturnedQuantityController({
        el: this.el
      });
      if (this.getLines().length) {
        this.fetchAvailability();
      }
      this.setupAutocomplete();
      new App.TimeLineController({
        el: this.el
      });
      new App.ReservationsEditController({
        el: this.el,
        user: this.user,
        contract: this.contract,
        startDateDisabled: true,
        quantityDisabled: true
      });
      new PreChange("[data-quantity-returned]");
      new App.ModelCellTooltipController({
        el: this.el
      });
    }

    TakeBackController.prototype.delegateEvents = function() {
      TakeBackController.__super__.delegateEvents.apply(this, arguments);
      App.Reservation.on("refresh", this.fetchAvailability);
      return App.Item.on("refresh", (function(_this) {
        return function() {
          return _this.render(true);
        };
      })(this));
    };

    TakeBackController.prototype.fetchAvailability = function() {
      var done, ids;
      this.render(false);
      ids = _.uniq(_.map(_.filter(this.getLines(), function(l) {
        return l.model_id != null;
      }), function(l) {
        return l.model().id;
      }));
      done = (function(_this) {
        return function(data) {
          _this.initalAvailabilityFetched = true;
          _this.status.html(App.Render("manage/views/availabilities/loaded"));
          return _this.render(true);
        };
      })(this);
      if (ids.length) {
        this.status.html(App.Render("manage/views/availabilities/loading"));
        return App.Availability.ajaxFetch({
          data: $.param({
            model_ids: ids,
            user_id: this.user.id
          })
        }).done(done);
      } else {
        return done();
      }
    };

    TakeBackController.prototype.getLines = function() {
      return _.flatten(_.map(this.user.contracts().all(), function(c) {
        return c.reservations().all();
      }));
    };

    TakeBackController.prototype.render = function(renderAvailability) {
      this.reservationsContainer.html(App.Render("manage/views/reservations/grouped_lines_with_action_date", App.Modules.HasLines.groupByDateRange(this.getLines(), false, "end_date"), {
        linePartial: "manage/views/reservations/take_back_line",
        renderAvailability: renderAvailability
      }));
      this.returnedQuantitiesController.restore();
      return this.lineSelection.restore();
    };

    TakeBackController.prototype.takeBack = function() {
      var i, id, len, line, quantity, reservations, returnedQuantity;
      returnedQuantity = {};
      reservations = (function() {
        var i, len, ref, results;
        ref = App.LineSelectionController.selected;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          id = ref[i];
          results.push(App.Reservation.find(id));
        }
        return results;
      })();
      for (i = 0, len = reservations.length; i < len; i++) {
        line = reservations[i];
        if (line.option_id != null) {
          quantity = this.getQuantity(line);
          if (quantity === 0) {
            App.Flash({
              type: "error",
              message: _jed("You have to provide the quantity for the things you want to return")
            });
            return false;
          } else {
            returnedQuantity[line.id] = this.getQuantity(line);
          }
        }
      }
      return new App.TakeBackDialogController({
        user: this.user,
        reservations: reservations,
        returnedQuantity: returnedQuantity
      });
    };

    TakeBackController.prototype.assign = function(e) {
      var inventoryCode, line, ref;
      if (e != null) {
        e.preventDefault();
      }
      inventoryCode = this.input.val();
      line = _.find(this.getLines(), this.getCheckLineFunction(inventoryCode));
      if (line) {
        App.Flash({
          type: "success",
          message: _jed("%s selected for take back", line.model().name())
        });
        App.LineSelectionController.add(line.id);
        if (line.option_id) {
          this.increaseOption(line);
        }
      } else if (App.Reservation.findByAttribute("option_id", (ref = App.Option.findByAttribute("inventory_code", inventoryCode)) != null ? ref.id : void 0)) {
        App.Flash({
          type: "error",
          message: _jed("You can not take back more options then you handed over")
        });
      } else {
        App.Flash({
          type: "error",
          message: _jed("%s was not found for this take back", inventoryCode)
        });
      }
      return this.input.val("").blur();
    };

    TakeBackController.prototype.getCheckLineFunction = function(inv_code) {
      var el;
      el = this.el;
      return function(line) {
        return line.inventoryCode().toLowerCase() === inv_code.toLowerCase() && (line.option() ? el.find(".line[data-id='" + line.id + "'] input[data-quantity-returned]").val() < line.quantity : true);
      };
    };

    TakeBackController.prototype.getQuantity = function(line) {
      var input, quantity;
      input = this.el.find(".line[data-id='" + line.id + "'] input[data-quantity-returned]");
      quantity = !input.val().length ? 0 : parseInt(input.val());
      if (_.isNaN(quantity)) {
        quantity = 1;
      }
      return quantity;
    };

    TakeBackController.prototype.increaseOption = function(line) {
      var input, quantity;
      quantity = this.getQuantity(line) + 1;
      input = this.el.find(".line[data-id='" + line.id + "'] input[data-quantity-returned]");
      input.val(quantity);
      App.Flash({
        type: "success",
        message: _jed("%s quantity increased to %s", [line.model().name(), quantity])
      });
      return this.changeQuantity({
        currentTarget: input
      });
    };

    TakeBackController.prototype.setupAutocomplete = function() {
      return this.input.autocomplete({
        appendTo: this.el,
        source: (function(_this) {
          return function(request, response) {
            var data, line, regexp;
            data = (function() {
              var i, len, ref, results;
              ref = this.getLines();
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                line = ref[i];
                results.push({
                  name: line.model().name(),
                  inventoryCode: line.inventoryCode(),
                  record: line
                });
              }
              return results;
            }).call(_this);
            regexp = RegExp(request.term, "i");
            data = _.filter(data, function(d) {
              var ref;
              return d.name.match(regexp) || ((ref = d.inventoryCode) != null ? ref.match(regexp) : void 0);
            });
            return response(data);
          };
        })(this),
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        select: this.select
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("manage/views/reservations/assign/autocomplete_element", item)).data("value", item).appendTo(ul);
        };
      })(this);
    };

    TakeBackController.prototype.select = function(e, ui) {
      this.input.val(ui.item.record.inventoryCode());
      return this.assign();
    };

    TakeBackController.prototype.showAutocomplete = function() {
      return this.input.autocomplete("search");
    };

    TakeBackController.prototype.changeQuantity = function(e) {
      var line, quantity, ref, ref1, target;
      target = $(e.currentTarget);
      line = App.Reservation.find(target.closest("[data-id]").data("id"));
      App.LineSelectionController.add(line.id);
      if ((ref = this.lineSelection.markVisitLinesController) != null) {
        ref.update(App.LineSelectionController.selected);
      }
      quantity = parseInt(target.val());
      if (_.isNaN(quantity)) {
        target.val(0);
      }
      if (quantity < 0) {
        target.val(0);
      }
      if (line.quantity < quantity) {
        App.Flash({
          type: "error",
          message: _jed("You can not take back more items then you handed over")
        });
        target.val(line.quantity);
        return (ref1 = this.lineSelection.markVisitLinesController) != null ? ref1.update(App.LineSelectionController.selected) : void 0;
      } else {
        return this.returnedQuantitiesController.updateWith(line.id, quantity);
      }
    };

    TakeBackController.prototype.inspectItem = function(e) {
      var item;
      item = App.Item.find($(e.currentTarget).data("item-id"));
      return new App.ItemInspectDialogController({
        item: item
      });
    };

    return TakeBackController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TakeBackDialogController = (function(superClass) {
    extend(TakeBackDialogController, superClass);

    function TakeBackDialogController() {
      this.showDocuments = bind(this.showDocuments, this);
      this.takeBack = bind(this.takeBack, this);
      this.getItemsCount = bind(this.getItemsCount, this);
      this.setupModal = bind(this.setupModal, this);
      TakeBackDialogController.__super__.constructor.apply(this, arguments);
      this.setupModal();
      this.el.on("click", "[data-take-back]", this.takeBack);
    }

    TakeBackDialogController.prototype.setupModal = function() {
      var data, options, reservations;
      reservations = _.map(this.reservations, function(line) {
        line.end_date = moment().format("YYYY-MM-DD");
        return line;
      });
      data = {
        groupedLines: App.Modules.HasLines.groupByDateRange(reservations, true),
        user: this.user,
        itemsCount: this.getItemsCount()
      };
      options = {
        returnedQuantity: this.returnedQuantity
      };
      this.modal = new App.Modal(App.Render("manage/views/users/take_back_dialog", data, options));
      return this.el = this.modal.el;
    };

    TakeBackDialogController.prototype.getItemsCount = function() {
      return _.reduce(this.reservations, ((function(_this) {
        return function(mem, l) {
          return (_this.returnedQuantity[l.id] || l.quantity) + mem;
        };
      })(this)), 0);
    };

    TakeBackDialogController.prototype.takeBack = function() {
      this.modal.undestroyable();
      this.modal.el.detach();
      return App.Reservation.takeBack(this.reservations, this.returnedQuantity).done((function(_this) {
        return function(data) {
          return _this.showDocuments(_this.reservations);
        };
      })(this));
    };

    TakeBackDialogController.prototype.showDocuments = function(reservations) {
      var contracts, modal, tmpl;
      contracts = _.uniq(_.map(reservations, function(l) {
        return l.contract();
      }), function(c) {
        return c.id;
      });
      tmpl = App.Render("manage/views/users/take_back_documents_dialog", {
        user: this.user,
        contracts: contracts,
        itemsCount: this.getItemsCount()
      });
      modal = new App.Modal(tmpl);
      return modal.undestroyable();
    };

    return TakeBackDialogController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TakeBacksSendReminderController = (function(superClass) {
    extend(TakeBacksSendReminderController, superClass);

    function TakeBacksSendReminderController() {
      this.send = bind(this.send, this);
      return TakeBacksSendReminderController.__super__.constructor.apply(this, arguments);
    }

    TakeBacksSendReminderController.prototype.events = {
      "click [data-send-takeback-reminder]": "send"
    };

    TakeBacksSendReminderController.prototype.send = function(e) {
      var line, takeBack, trigger;
      trigger = $(e.currentTarget);
      takeBack = App.Visit.findOrBuild(trigger.closest("[data-id]").data());
      takeBack.remind();
      line = trigger.closest(".line");
      if (line.length) {
        line.find(".latest-reminder-cell").html(App.Render("manage/views/take_backs/reminder_send"));
      }
      return trigger.closest(".dropdown").hide();
    };

    return TakeBacksSendReminderController;

  })(Spine.Controller);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TemplateController = (function(superClass) {
    extend(TemplateController, superClass);

    function TemplateController() {
      TemplateController.__super__.constructor.apply(this, arguments);
      new App.TemplateModelsController({
        el: this.el.find("#models")
      });
      new App.InlineEntryRemoveController({
        el: this.el
      });
    }

    return TemplateController;

  })(Spine.Controller);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TemplateEditController = (function(superClass) {
    extend(TemplateEditController, superClass);

    function TemplateEditController() {
      return TemplateEditController.__super__.constructor.apply(this, arguments);
    }

    return TemplateEditController;

  })(App.TemplateController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TemplateModelsController = (function(superClass) {
    extend(TemplateModelsController, superClass);

    TemplateModelsController.prototype.elements = {
      "input[data-search-models]": "input",
      "[data-models-list]": "modelsList"
    };

    TemplateModelsController.prototype.events = {
      "preChange input[data-search-models]": "search"
    };

    function TemplateModelsController() {
      this.select = bind(this.select, this);
      this.setupAutocomplete = bind(this.setupAutocomplete, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.search = bind(this.search, this);
      TemplateModelsController.__super__.constructor.apply(this, arguments);
      this.input.preChange();
    }

    TemplateModelsController.prototype.search = function() {
      if (!this.input.val().length) {
        return false;
      }
      return this.fetchModels().done((function(_this) {
        return function(data) {
          var datum;
          return _this.setupAutocomplete((function() {
            var j, len, results;
            results = [];
            for (j = 0, len = data.length; j < len; j++) {
              datum = data[j];
              results.push(App.Model.find(datum.id));
            }
            return results;
          })());
        };
      })(this));
    };

    TemplateModelsController.prototype.fetchModels = function() {
      return App.Model.ajaxFetch({
        data: $.param({
          search_term: this.input.val(),
          borrowable: true,
          per_page: 5
        })
      });
    };

    TemplateModelsController.prototype.setupAutocomplete = function(models) {
      this.input.autocomplete({
        source: (function(_this) {
          return function(request, response) {
            return response(models);
          };
        })(this),
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        select: this.select
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("manage/views/templates/models/autocomplete_element", item)).data("value", item).appendTo(ul);
        };
      })(this);
      return this.input.autocomplete("search");
    };

    TemplateModelsController.prototype.select = function(e, ui) {
      return App.Availability.ajaxFetch({
        url: App.Availability.url() + "/in_stock",
        data: $.param({
          model_ids: ui.item.id
        })
      }).done((function(_this) {
        return function(data) {
          if (!_.any(_this.modelsList.find("input[name*='model_id']"), function(i) {
            return Number($(i).val()) === Number(ui.item.id);
          })) {
            return _this.modelsList.prepend(App.Render("manage/views/templates/models/model_allocation_entry", App.Model.find(ui.item.id), {
              currentInventoryPool: App.InventoryPool.current
            }));
          }
        };
      })(this));
    };

    return TemplateModelsController;

  })(Spine.Controller);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TemplateNewController = (function(superClass) {
    extend(TemplateNewController, superClass);

    function TemplateNewController() {
      return TemplateNewController.__super__.constructor.apply(this, arguments);
    }

    return TemplateNewController;

  })(App.TemplateController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TopBarController = (function(superClass) {
    extend(TopBarController, superClass);

    function TopBarController() {
      this.checkStartScreenState = bind(this.checkStartScreenState, this);
      this.changeStartScreen = bind(this.changeStartScreen, this);
      return TopBarController.__super__.constructor.apply(this, arguments);
    }

    TopBarController.prototype.events = {
      "change #start_screen_checkbox": "changeStartScreen"
    };

    TopBarController.prototype.elements = {
      "#start_screen_checkbox": "startScreenCheckbox"
    };

    TopBarController.prototype.changeStartScreen = function() {
      var path;
      path = window.location.pathname + window.location.search + window.location.hash;
      if (this.startScreenCheckbox.is(":checked")) {
        return App.User.current.setStartScreen(path);
      } else {
        return App.User.current.setStartScreen(null);
      }
    };

    TopBarController.prototype.checkStartScreenState = function() {
      var path;
      path = window.location.pathname + window.location.search + window.location.hash;
      if (App.User.current.start_screen === path) {
        return this.startScreenCheckbox.prop("checked", true);
      } else {
        return this.startScreenCheckbox.prop("checked", false);
      }
    };

    return TopBarController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ChangeUserGroupsController = (function(superClass) {
    extend(ChangeUserGroupsController, superClass);

    ChangeUserGroupsController.prototype.elements = {
      "input[name='name']": "input",
      "[data-group-list]": "groupList"
    };

    ChangeUserGroupsController.prototype.events = {
      "focus input[name='name']": "search",
      "preChange input[name='name']": "search",
      "click [data-remove-group]": "removeGroup"
    };

    function ChangeUserGroupsController() {
      this.select = bind(this.select, this);
      this.setupAutocomplete = bind(this.setupAutocomplete, this);
      this.searchGroups = bind(this.searchGroups, this);
      this.search = bind(this.search, this);
      ChangeUserGroupsController.__super__.constructor.apply(this, arguments);
      this.input.preChange();
    }

    ChangeUserGroupsController.prototype.search = function() {
      return this.searchGroups().done((function(_this) {
        return function(data) {
          var datum;
          return _this.setupAutocomplete((function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Group.find(datum.id));
            }
            return results;
          })());
        };
      })(this));
    };

    ChangeUserGroupsController.prototype.searchGroups = function() {
      return App.Group.ajaxFetch({
        data: $.param({
          search_term: this.input.val()
        })
      });
    };

    ChangeUserGroupsController.prototype.setupAutocomplete = function(groups) {
      this.input.autocomplete({
        source: (function(_this) {
          return function(request, response) {
            return response(groups);
          };
        })(this),
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        select: this.select,
        minLength: 0
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          return $(App.Render("manage/views/groups/autocomplete_element", item)).data("value", item).appendTo(ul);
        };
      })(this);
      return this.input.autocomplete("search");
    };

    ChangeUserGroupsController.prototype.select = function(e, ui) {
      return this.groupList.append(App.Render("manage/views/groups/group_entry", ui.item));
    };

    ChangeUserGroupsController.prototype.removeGroup = function(e) {
      e.preventDefault();
      return $(e.currentTarget).closest(".line").remove();
    };

    return ChangeUserGroupsController;

  })(Spine.Controller);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.DelegationController = (function(superClass) {
    extend(DelegationController, superClass);

    function DelegationController() {
      DelegationController.__super__.constructor.apply(this, arguments);
      new App.ManageUsersViaAutocompleteController({
        el: this.el.find("#users"),
        removeHandler: this.removeUserHandler,
        paramName: "user[users][][id]",
        fetchUsersParams: {
          type: "user"
        }
      });
    }

    DelegationController.removeHandler = function(e) {
      e.preventDefault();
      return $(e.currentTarget).closest(".line").remove();
    };

    DelegationController.prototype.removeUserHandler = DelegationController.removeHandler;

    return DelegationController;

  })(Spine.Controller);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.DelegationEditController = (function(superClass) {
    extend(DelegationEditController, superClass);

    function DelegationEditController() {
      return DelegationEditController.__super__.constructor.apply(this, arguments);
    }

    DelegationEditController.include(App.Modules.InlineEntryHandlers);

    DelegationEditController.prototype.removeUserHandler = DelegationEditController.prototype.strikeRemoveUserHandler;

    return DelegationEditController;

  })(App.DelegationController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.UserCellTooltipController = (function(superClass) {
    extend(UserCellTooltipController, superClass);

    function UserCellTooltipController() {
      this.onEnter = bind(this.onEnter, this);
      return UserCellTooltipController.__super__.constructor.apply(this, arguments);
    }

    UserCellTooltipController.prototype.events = {
      "mouseenter [data-type='user-cell']": "onEnter"
    };

    UserCellTooltipController.prototype.onEnter = function(e) {
      var trigger;
      trigger = $(e.currentTarget);
      return new App.Tooltip({
        el: trigger.closest("[data-type='user-cell']"),
        content: App.Render("manage/views/users/tooltip", App.User.findOrBuild(trigger.data()))
      });
    };

    return UserCellTooltipController;

  })(Spine.Controller);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.UserController = (function(superClass) {
    extend(UserController, superClass);

    function UserController() {
      UserController.__super__.constructor.apply(this, arguments);
      new App.ChangeUserGroupsController({
        el: this.el.find("#change-groups")
      });
      new App.UserSuspendedUntilController({
        el: this.el
      });
    }

    return UserController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.UserSuspendedUntilController = (function(superClass) {
    extend(UserSuspendedUntilController, superClass);

    UserSuspendedUntilController.prototype.elements = {
      "input[data-suspended-until-input]": "input",
      "#suspended-reason": "suspendedReason"
    };

    UserSuspendedUntilController.prototype.events = {
      "change input[data-suspended-until-input]": "toggleSuspendedReason"
    };

    function UserSuspendedUntilController() {
      this.hideSuspendedReason = bind(this.hideSuspendedReason, this);
      this.showSuspendedReason = bind(this.showSuspendedReason, this);
      this.toggleSuspendedReason = bind(this.toggleSuspendedReason, this);
      UserSuspendedUntilController.__super__.constructor.apply(this, arguments);
      this.input.datepicker();
    }

    UserSuspendedUntilController.prototype.toggleSuspendedReason = function() {
      if (_.isEmpty(this.input.val())) {
        return this.hideSuspendedReason();
      } else {
        return this.showSuspendedReason();
      }
    };

    UserSuspendedUntilController.prototype.showSuspendedReason = function() {
      return this.suspendedReason.removeClass("hidden");
    };

    UserSuspendedUntilController.prototype.hideSuspendedReason = function() {
      return this.suspendedReason.addClass("hidden");
    };

    return UserSuspendedUntilController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.UsersIndexController = (function(superClass) {
    extend(UsersIndexController, superClass);

    UsersIndexController.prototype.elements = {
      "#user-list": "list"
    };

    function UsersIndexController(options) {
      this.render = bind(this.render, this);
      this.fetchAccessRights = bind(this.fetchAccessRights, this);
      this.fetchUsers = bind(this.fetchUsers, this);
      this.fetch = bind(this.fetch, this);
      this.reset = bind(this.reset, this);
      UsersIndexController.__super__.constructor.apply(this, arguments);
      this.users = {};
      new App.UserCellTooltipController({
        el: this.list
      });
      this.pagination = new App.ListPaginationController({
        el: this.list,
        fetch: this.fetch
      });
      this.search = new App.ListSearchController({
        el: this.el.find("#list-search"),
        reset: this.reset
      });
      this.filter = new App.ListFiltersController({
        el: this.el.find("#list-filters"),
        reset: this.reset
      });
      this.reset();
    }

    UsersIndexController.prototype.reset = function() {
      this.users = {};
      this.list.html(App.Render("manage/views/lists/loading"));
      return this.fetch(1, this.list);
    };

    UsersIndexController.prototype.fetch = function(page, target) {
      return this.fetchUsers(page).done((function(_this) {
        return function() {
          return _this.fetchAccessRights(page).done(function() {
            return _this.render(target, _this.users[page], page);
          });
        };
      })(this));
    };

    UsersIndexController.prototype.fetchUsers = function(page) {
      return App.User.ajaxFetch({
        data: $.param($.extend(this.filter.getData(), {
          page: page,
          search_term: this.search.term(),
          role: this.role,
          all: _.isEmpty(this.role) ? true : void 0
        }))
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, users;
          _this.pagination.set(JSON.parse(xhr.getResponseHeader("X-Pagination")));
          users = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.find(datum.id));
            }
            return results;
          })();
          _this.users[page] = users;
          return App.User.fetchDelegators(users);
        };
      })(this));
    };

    UsersIndexController.prototype.fetchAccessRights = function(page) {
      var ids;
      ids = _.map(this.users[page], function(u) {
        return u.id;
      });
      if (ids.length) {
        return App.AccessRight.ajaxFetch({
          data: $.param({
            user_ids: ids
          })
        });
      } else {
        return {
          done: function(c) {
            return c();
          }
        };
      }
    };

    UsersIndexController.prototype.render = function(target, data, page) {
      target.html(App.Render("manage/views/users/line", data, {
        currentInventoryPool: App.InventoryPool.current
      }));
      if (page === 1) {
        return this.pagination.renderPlaceholders();
      }
    };

    return UsersIndexController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.VisitsIndexController = (function(superClass) {
    extend(VisitsIndexController, superClass);

    VisitsIndexController.prototype.elements = {
      "#visits": "list"
    };

    function VisitsIndexController() {
      this.render = bind(this.render, this);
      this.fetchUsers = bind(this.fetchUsers, this);
      this.fetchReservations = bind(this.fetchReservations, this);
      this.fetchVisits = bind(this.fetchVisits, this);
      this.fetch = bind(this.fetch, this);
      this.reset = bind(this.reset, this);
      VisitsIndexController.__super__.constructor.apply(this, arguments);
      new App.LinesCellTooltipController({
        el: this.el
      });
      new App.UserCellTooltipController({
        el: this.el
      });
      new App.LatestReminderTooltipController({
        el: this.el
      });
      new App.HandOversDeleteController({
        el: this.el
      });
      new App.TakeBacksSendReminderController({
        el: this.el
      });
      this.pagination = new App.ListPaginationController({
        el: this.list,
        fetch: this.fetch
      });
      this.search = new App.ListSearchController({
        el: this.el.find("#list-search"),
        reset: this.reset
      });
      this.range = new App.ListRangeController({
        el: this.el.find("#list-range"),
        reset: this.reset
      });
      this.tabs = new App.ListTabsController({
        el: this.el.find("#list-tabs"),
        reset: this.reset,
        data: {
          status: ["approved", "signed"]
        }
      });
      this.reset();
    }

    VisitsIndexController.prototype.reset = function() {
      this.visits = {};
      this.list.html(App.Render("manage/views/lists/loading"));
      return this.fetch(1, this.list);
    };

    VisitsIndexController.prototype.fetch = function(page, target) {
      return this.fetchVisits(page).done((function(_this) {
        return function() {
          return _this.fetchReservations(page, function() {
            return _this.fetchUsers(page).done(function() {
              return _this.render(target, _this.visits[page], page);
            });
          });
        };
      })(this));
    };

    VisitsIndexController.prototype.fetchVisits = function(page) {
      return App.Visit.ajaxFetch({
        data: $.param($.extend(this.tabs.getData(), {
          search_term: this.search.term(),
          page: page,
          range: this.range.get()
        }))
      }).done((function(_this) {
        return function(data, status, xhr) {
          var datum, visits;
          _this.pagination.set(JSON.parse(xhr.getResponseHeader("X-Pagination")));
          visits = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Visit.find(datum.id));
            }
            return results;
          })();
          return _this.visits[page] = visits;
        };
      })(this));
    };

    VisitsIndexController.prototype.fetchReservations = function(page, callback) {
      var done, ids;
      ids = _.flatten(_.map(this.visits[page], function(v) {
        return v.reservation_ids;
      }));
      if (!ids.length) {
        callback();
      }
      done = _.after(Math.ceil(ids.length / 50), callback);
      return _(ids).each_slice(50, (function(_this) {
        return function(slice) {
          return App.Reservation.ajaxFetch({
            data: $.param({
              ids: slice
            })
          }).done(done);
        };
      })(this));
    };

    VisitsIndexController.prototype.fetchUsers = function(page) {
      var ids;
      ids = _.filter(_.map(this.visits[page], function(c) {
        return c.user_id;
      }), function(id) {
        return App.User.exists(id) == null;
      });
      if (!ids.length) {
        return {
          done: (function(_this) {
            return function(c) {
              return c();
            };
          })(this)
        };
      }
      return App.User.ajaxFetch({
        data: $.param({
          ids: ids
        })
      }).done((function(_this) {
        return function(data) {
          var datum, users;
          users = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.User.find(datum.id));
            }
            return results;
          })();
          return App.User.fetchDelegators(users);
        };
      })(this));
    };

    VisitsIndexController.prototype.render = function(target, data, page) {
      target.html(App.Render("manage/views/visits/line", data));
      if (page === 1) {
        return this.pagination.renderPlaceholders();
      }
    };

    return VisitsIndexController;

  })(Spine.Controller);

}).call(this);
(function($) {$.views.templates("manage/views/availabilities/loaded", "<div class=\'emboss padding-inset-s\'>\n  <p class=\'paragraph-s\'>\n    <i class=\'fa fa-check margin-right-m\'><\/i>\n    {{jed \"Availability loaded\"/}}\n  <\/p>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/availabilities/loading", "<div class=\'emboss blue padding-inset-s\'>\n  <p class=\'paragraph-s\'>\n    <img class=\'margin-right-s max-width-micro\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n    <strong>{{jed \"Loading availability\"/}}<\/strong>\n  <\/p>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/booking_calendar/calendar_dialog", "<div class=\'modal fade ui-modal medium\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'modal-header row\'>\n    <div class=\'col3of5\'>\n      <h2 class=\'headline-l\'>{{jed \"Edit reservation\"/}}<\/h2>\n      <h3 class=\'headline-m\'>\n        {{>user.firstname}}\n        {{>user.lastname}}\n      <\/h3>\n    <\/div>\n    <div class=\'col2of5 text-align-right\'>\n      <div class=\'modal-close\'>{{jed \"Cancel\"/}}<\/div>\n      <button class=\'button green\' disabled=\'disabled\' id=\'submit-booking-calendar\'>{{jed \"Save\"/}}<\/button>\n    <\/div>\n  <\/div>\n  <div id=\'booking-calendar-errors\'><\/div>\n  <div class=\'modal-body\'>\n    <form class=\'padding-inset-m\'>\n      <div class=\'hidden\' id=\'booking-calendar-controls\'>\n        <div class=\'col5of8 float-right\'>\n          <div class=\'row grey padding-bottom-xxs\'>\n            <div class=\'col1of2\'>\n              <div class=\'col1of2 padding-right-xs text-align-left\'>\n                <div class=\'row {{if ~startDateDisabled}} hidden{{/if}}\'>\n                  <span>{{jed \"Start date\"/}}<\/span>\n                  <a class=\'grey fa fa-eye position-absolute-right padding-right-xxs\' id=\'jump-to-start-date\'><\/a>\n                <\/div>\n              <\/div>\n              <div class=\'col1of2 padding-right-xs text-align-left\'>\n                <div class=\'row\'>\n                  <span>{{jed \"End date\"/}}<\/span>\n                  <a class=\'grey fa fa-eye position-absolute-right padding-right-xxs\' id=\'jump-to-end-date\'><\/a>\n                <\/div>\n              <\/div>\n            <\/div>\n            <div class=\'col1of2\'>\n              <div class=\'col2of8 text-align-left\'>{{jed \"Quantity\"/}}<\/div>\n              <div class=\'col6of8 padding-left-xs text-align-left\'>{{jed \"Availability\"/}}<\/div>\n            <\/div>\n          <\/div>\n          <div class=\'row\'>\n            <div class=\'col1of2\'>\n              <div class=\'col1of2 padding-right-xs\'>\n                <div class=\'row {{if ~startDateDisabled}} hidden{{/if}}\'>\n                  <input autocomplete=\'off\' id=\'booking-calendar-start-date\' type=\'text\'>\n                <\/div>\n              <\/div>\n              <div class=\'col1of2 padding-right-xs\'>\n                <input autocomplete=\'off\' id=\'booking-calendar-end-date\' type=\'text\'>\n              <\/div>\n            <\/div>\n            <div class=\'col1of2\'>\n              <div class=\'col2of8\'>\n                {{if ~quantityDisabled}}\n                <input autocomplete=\'off\' class=\'text-align-center\' disabled=\'disabled\' id=\'booking-calendar-quantity\' type=\'text\' value=\'1\'>\n                {{else}}\n                <input autocomplete=\'off\' class=\'text-align-center\' id=\'booking-calendar-quantity\' type=\'text\' value=\'1\'>\n                {{/if}}\n              <\/div>\n              <div class=\'col6of8 padding-left-xs\'>\n                <select class=\'width-full\' id=\'booking-calendar-partitions\'><\/select>\n              <\/div>\n            <\/div>\n          <\/div>\n        <\/div>\n      <\/div>\n      <div class=\'booking-calendar padding-top-xs\' id=\'booking-calendar\'><\/div>\n      <img class=\'loading margin-horziontal-auto margin-vertical-xl\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n    <\/form>\n    <div id=\'booking-calendar-lines\'>\n      <div class=\'list-of-lines separated-top\'><\/div>\n    <\/div>\n  <\/div>\n  <div class=\'modal-footer\'><\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/booking_calendar/line", "<div class=\'line row\'>\n  {{if model().availability}}\n  <div class=\'line-info{{if model().availability().withoutLines([#view.data]).maxAvailableForGroups(~start_date, ~end_date, ~groupIds) < (~quantity||quantity)}} red{{/if}}\'><\/div>\n  {{/if}}\n  <div class=\'col1of10 line-col text-align-center\'>\n    <span>\n      {{if ~quantity}}\n      {{>~quantity}}\n      {{else subreservations}}\n      {{sum subreservations \"quantity\"/}}\n      {{else}}\n      {{>quantity}}\n      {{/if}}\n    <\/span>\n    {{if model().availability}}\n    <span class=\'grey-text\'>\n      /\n      {{if subreservations}}\n      {{>model().availability().withoutLines(subreservations).maxAvailableForGroups(~start_date, ~end_date, ~groupIds)}}\n      {{else}}\n      {{>model().availability().withoutLines([#view.data]).maxAvailableForGroups(~start_date, ~end_date, ~groupIds)}}\n      {{/if}}\n    <\/span>\n    {{/if}}\n  <\/div>\n  <div class=\'col5of10 line-col text-align-left\'>\n    <strong>{{>model().name()}}<\/strong>\n  <\/div>\n  <div class=\'col4of10 line-col\'>\n    {{if model().availability}}\n    {{for model().availability().withoutLines([#view.data]).unavailableRanges((~quantity||quantity), ~groupIds, ~start_date, ~end_date)}}\n    <strong class=\'darkred-text\'>{{date startDate/}}-{{date endDate/}}<\/strong>\n    {{/for}}\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/booking_calendar/partitions", "<option data-value=\'[{{>user}}]\'>{{jed \"Borrower\"/}}<\/option>\n{{if userGroups.length}}\n<optgroup label=\'{{jed \'Entiltement-Groups of this customer\'/}}\'>\n  {{for userGroups}}\n  <option data-value=\'[{{>id}}]\'>{{>name}}<\/option>\n  {{/for}}\n<\/optgroup>\n{{/if}}\n{{if otherGroups.length}}\n<optgroup label=\'{{jed \'Other entitlement-groups\'/}}\'>\n  {{for otherGroups}}\n  <option data-value=\'[{{>id}}]\'>{{>name}}<\/option>\n  {{/for}}\n<\/optgroup>\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/categories/category_link_inline_entry", "<div class=\'row line font-size-xs focus-hover-thin\' data-new data-type=\'inline-entry\'>\n  <input name=\'category[links][{{>~uid}}][parent_id]\' type=\'hidden\' value=\'{{>id}}\'>\n  <div class=\'line-col col3of10 text-align-left\'>\n    {{>name}}\n  <\/div>\n  <div class=\'line-col col1of10 text-align-center\' title=\'{{jed \'Subordinate to %s\' name/}}\'>\n    <i class=\'fa fa-sitemap\'><\/i>\n  <\/div>\n  <div class=\'line-col col3of10 text-align-left\'>\n    <input autocomplete=\'off\' class=\'small width-full\' name=\'category[links][{{>~uid}}][label]\' placeholder=\'{{jed \'Label\'/}}\' type=\'text\' value=\'{{>~label}}\'>\n  <\/div>\n  <div class=\'line-col col3of10 text-align-right\'>\n    <button class=\'button small inset\' data-remove>\n      {{jed \'Remove\'/}}\n    <\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/categories/filter_list_current", "<a class=\'emboss links black row focus-hover-thin font-size-m padding-horizontal-s padding-vertical-xs round-border-on-hover\' data-id=\'{{>id}}\' data-type=\'category-current\'>\n  <i class=\'arrow left\'><\/i>\n  {{>name}}\n<\/a>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/categories/filter_list_entry", "<a class=\'links black row focus-hover-thin font-size-m padding-horizontal-s padding-vertical-xs round-border-on-hover\' data-id=\'{{>id}}\' data-type=\'category-filter\'>\n  {{>name}}\n<\/a>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/categories/filter_list_root", "<a class=\'emboss links black row focus-hover-thin font-size-m padding-horizontal-s padding-vertical-xs round-border-on-hover\' data-id=\'{{>id}}\' data-type=\'category-root\'>\n  <strong>{{>name}}<\/strong>\n<\/a>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/categories/filter_list_search", "<a class=\'emboss links black row focus-hover-thin font-size-m padding-horizontal-s padding-vertical-xs round-border-on-hover\' data-id=\'{{>id}}\' data-type=\'category-search\'>\n  <strong>\n    <i class=\'fa fa-search icon-xxs vertical-align-top\'><\/i>\n    {{>search_term}}\n  <\/strong>\n<\/a>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/categories/line", "<div class=\'row line\' data-id=\'{{>id}}\' data-parent>\n  <div class=\'col1of9 line-col\'>\n    {{if children().length}}\n    <button class=\'button inset small min-width-xs\' data-type=\'expander\'>\n      <i class=\'arrow right\'><\/i>\n      <span>\n        {{>children().length}}\n      <\/span>\n    <\/button>\n    {{/if}}\n  <\/div>\n  <div class=\'col3of9 line-col text-align-left\'>\n    <strong>\n      {{>name}}\n    <\/strong>\n  <\/div>\n  <div class=\'col2of9 line-col\'>\n    {{if !is_used()}}\n    <strong class=\'darkred-text\'>\n      {{jed \"not used\"/}}\n    <\/strong>\n    {{/if}}\n  <\/div>\n  <div class=\'col3of9 line-col line-actions\'>\n    {{if is_used()}}\n    <a class=\'button white\' href=\'{{>url(\'edit\')}}\'>\n      {{jed \"Edit\"/}}\n    <\/a>\n    {{else}}\n    <div class=\'multibutton\'>\n      <a class=\'button white\' href=\'{{>url(\'edit\')}}\'>\n        {{jed \"Edit\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item red\' data-method=\'delete\' href=\'{{>url()}}\'>\n              <i class=\'fa fa-trash\'><\/i>\n              {{jed \"Delete\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/contracts/line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-type=\'contract\'>\n  {{include tmpl=\"manage/views/contracts/line_\"+state /}}\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/contracts/line_closed", "{{partial \'manage/views/users/cell\' user() \'{\"grid\":\"col1of8\"}\'/}}\n<div class=\'col1of8 line-col\'>{{diffToday created_at/}}<\/div>\n<div class=\'col1of8 line-col text-align-center\' data-type=\'lines-cell\'>{{include tmpl=\'manage/views/reservations/cell\'/}}<\/div>\n<div class=\'col1of8 line-col\'>\n  {{>getMaxRange()}}\n  {{jed getMaxRange() \"day\" \"days\"/}}\n<\/div>\n<div class=\'col2of8 line-col text-align-left\'>\n  <strong>{{jed \"Closed\"/}}<\/strong>\n  {{jed \"Contract\"/}}\n  {{>compact_id}}\n<\/div>\n<div class=\'col2of8 line-col line-actions\'>\n  <div class=\'multibutton\'>\n    <a class=\'button white text-ellipsis\' href=\'{{>url()}}\' target=\'_blank\'>\n      <i class=\'fa fa-file\'><\/i>\n      {{jed \"Contract\"/}}\n    <\/a>\n    <div class=\'dropdown-holder inline-block\'>\n      <div class=\'button white dropdown-toggle\'>\n        <div class=\'arrow down\'><\/div>\n      <\/div>\n      <ul class=\'dropdown right\'>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'value_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Value List\"/}}\n          <\/a>\n        <\/li>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'picking_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Picking List\"/}}\n          <\/a>\n        <\/li>\n      <\/ul>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/contracts/line_open", "{{partial \'manage/views/users/cell\' user() \'{\"grid\":\"col1of8\"}\'/}}\n<div class=\'col1of8 line-col\'>{{diffToday created_at/}}<\/div>\n<div class=\'col1of8 line-col text-align-center\' data-type=\'lines-cell\'>{{include tmpl=\'manage/views/reservations/cell\'/}}<\/div>\n<div class=\'col1of8 line-col\'>\n  {{>getMaxRange()}}\n  {{jed getMaxRange() \"day\" \"days\"/}}\n<\/div>\n<div class=\'col2of8 line-col text-align-left\'>\n  <strong>{{jed \"Signed\"/}}<\/strong>\n  {{jed \"Contract\"/}}\n  {{>compact_id}}\n<\/div>\n<div class=\'col2of8 line-col line-actions\'>\n  <div class=\'multibutton\'>\n    {{if ~accessRight.atLeastRole(~currentUserRole, \"lending_manager\") }}\n    <a class=\'button white text-ellipsis\' href=\'{{>user().url(\'take_back\')}}\'>\n      <i class=\'fa fa-mail-reply\'><\/i>\n      {{jed \"Take Back\"/}}\n    <\/a>\n    <div class=\'dropdown-holder inline-block\'>\n      <div class=\'button white dropdown-toggle\'>\n        <div class=\'arrow down\'><\/div>\n      <\/div>\n      <ul class=\'dropdown right\'>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url()}}\' target=\'_blank\'>\n            <i class=\'fa fa-file-alt\'><\/i>\n            {{jed \"Contract\"/}}\n          <\/a>\n        <\/li>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'value_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Value List\"/}}\n          <\/a>\n        <\/li>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'picking_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Picking List\"/}}\n          <\/a>\n        <\/li>\n      <\/ul>\n    <\/div>\n    {{else}}\n    <a class=\'button white text-ellipsis\' href=\'{{>url()}}\' target=\'_blank\'>\n      <i class=\'fa fa-file-alt\'><\/i>\n      {{jed \"Contract\"/}}\n    <\/a>\n    <div class=\'dropdown-holder inline-block\'>\n      <div class=\'button white dropdown-toggle\'>\n        <div class=\'arrow down\'><\/div>\n      <\/div>\n      <ul class=\'dropdown right\'>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'value_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Value List\"/}}\n          <\/a>\n        <\/li>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'picking_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Picking List\"/}}\n          <\/a>\n        <\/li>\n      <\/ul>\n    <\/div>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/groups/autocomplete_element", "<li class=\'separated-bottom exclude-last-child\'>\n  <a>\n    <div class=\'row\'>\n      {{>name}}\n    <\/div>\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/groups/group_entry", "<div class=\'row line font-size-xs\'>\n  <input name=\'user[groups][][id]\' type=\'hidden\' value=\'{{>id}}\'>\n  <div class=\'line-col col1of2 text-align-left\'>\n    {{>name}}\n  <\/div>\n  <div class=\'line-col col1of2 text-align-right\'>\n    <button class=\'button inset small\' data-remove-group>{{jed \"Remove\"/}}<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/groups/partitions/autocomplete_element", "<li class=\'separated-bottom exclude-last-child\'>\n  <a>\n    <div class=\'row\'>\n      {{>name()}}\n    <\/div>\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/groups/partitions/model_allocation_entry", "<div class=\'row line font-size-xs\'>\n  <input name=\'group[partitions_attributes][][id]\' type=\'hidden\'>\n  <input name=\'group[partitions_attributes][][model_id]\' type=\'hidden\' value=\'{{>id}}\'>\n  <div class=\'line-col col3of6 text-align-left\' data-model-name>\n    <a class=\'blue\' href=\'{{>url()}}/edit\'>\n      {{>name()}}\n    <\/a>\n  <\/div>\n  <div class=\'line-col col2of6\'>\n    <div class=\'line-col col2of4\' data-quantities>\n      <input class=\'width-full small text-align-center\' min=\'1\' name=\'group[partitions_attributes][][quantity]\' type=\'text\' value=\'1\'>\n    <\/div>\n    <div class=\'line-col col1of4 padding-left-xs text-align-left\' title=\'{{jed \"Allocations in other groups considered - still available quantity of borrowable and not retired items\"/}}\' data-quantities>\n      / {{>availability().total_rentable - availability().entitled_in_groups}}\n    <\/div>\n    <div class=\'line-col col1of4 padding-left-xs text-align-left\' title=\'{{jed \"Total quantity of borrowable and not retired items\"/}}\' data-quantities>\n      / {{>availability().total_rentable}}\n    <\/div>\n  <\/div>\n  <div class=\'line-col col1of6 text-align-right\'>\n    <button class=\'button inset small\' data-remove-group>{{jed \"Remove\"/}}<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/hand_overs/deleted", "<strong>\n  {{jed \"Deleted\"/}}\n  <i class=\'fa fa-trash\'><\/i>\n<\/strong>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/hand_overs/line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-type=\'hand_over\'>\n  {{if isOverdue()}}\n  <div class=\'line-info red\'><\/div>\n  {{/if}}\n  {{partial \'manage/views/users/cell\' user() \'{\"grid\":\"col1of5\"}\'/}}\n  <div class=\'col1of5 line-col\'>\n    {{if isOverdue()}}\n    <strong>{{diffToday date/}}<\/strong>\n    {{else}}\n    {{diffToday date/}}\n    {{/if}}\n  <\/div>\n  <div class=\'col1of5 line-col text-align-center\' data-type=\'lines-cell\'>{{include tmpl=\'manage/views/reservations/cell\'/}}<\/div>\n  <div class=\'col1of5 line-col text-align-center\'>\n    {{>getMaxRange()}}\n    {{jed getMaxRange() \"day\" \"days\"/}}\n  <\/div>\n  <div class=\'col1of5 line-col line-actions\'>\n    <div class=\'multibutton\'>\n      <a class=\'button white text-ellipsis\' href=\'/manage/{{current_inventory_pool_id/}}/users/{{>user().id}}/hand_over\'>\n        <i class=\'fa fa-mail-forward\'><\/i>\n        {{jed \"Hand Over\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item red\' data-hand-over-delete>\n              <i class=\'fa fa-trash\'><\/i>\n              {{jed \"Delete\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inline_entries/removed_on_save_info", "<div class=\'line-col\' title=\'{{jed \'Removed on save\'/}}\'>\n  <i class=\'fa fa-trash\'><\/i>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory/helper/error", "<div class=\'row emboss red text-align-center font-size-m padding-inset-s\'>\n  <strong>{{>text}}<\/strong>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory/helper/item_autocomplete_element", "<li class=\'separated-bottom exclude-last-child\'>\n  <a>\n    <div class=\'row text-ellipsis\'>\n      <div class=\'col1of3\'>\n        <strong>{{>inventory_code}}<\/strong>\n      <\/div>\n      <div class=\'col2of3 text-ellipsis\' title=\'{{>current_location}}\'>\n        {{>current_location}}\n      <\/div>\n    <\/div>\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory/helper/success", "<div class=\'row emboss green text-align-center font-size-m padding-inset-s\'>\n  <strong>{{>text}}<\/strong>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory/item_line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-type=\'item\'>\n  <div class=\'col1of5 line-col\'>\n    {{if model().is_package}}\n    <div class=\'row\'>\n      <div class=\'col1of2\'><\/div>\n      <div class=\'col1of2\'>\n        <button class=\'button inset small width-full\' data-type=\'inventory-expander\'>\n          {{if children().count()>0}}\n          <i class=\'arrow right\'><\/i>\n          {{/if}}\n          <span>{{>children().count()}}<\/span>\n        <\/button>\n      <\/div>\n    <\/div>\n    {{/if}}\n  <\/div>\n  <div class=\'col2of5 line-col text-align-left\'>\n    <div class=\'row\'>{{>inventory_code}}<\/div>\n    {{if parent_id}}\n    <strong class=\'grey-text\'>{{>model().name()}}<\/strong>\n    <div class=\'row grey-text text-ellipsis width-full\' title=\'{{jed \"is part of a package\"/}}\'>\n      {{jed \"is part of a package\"/}}\n    <\/div>\n    {{else}}\n    <div class=\'row grey-text\'>\n      {{if ~additionalDataFetched}}\n      {{>current_location}}\n      {{else}}\n      {{partial \"views/loading\" {\"size\":\"micro\"}/}}\n      {{/if}}\n    <\/div>\n    {{/if}}\n  <\/div>\n  <div class=\'col1of5 line-col text-align-center\'>\n    <strong class=\'darkred-text\'>{{>getProblems()}}<\/strong>\n  <\/div>\n  <div class=\'col1of5 line-col line-actions padding-right-xs\'>\n    {{if ~accessRight.atLeastRole(~currentUserRole, \"lending_manager\") }}\n    <div class=\'multibutton width-full text-align-right\'>\n      <a class=\'button white text-ellipsis col4of5 negative-margin-right-xxs\' href=\'{{>url(\'edit\')}}\' title=\'{{jed \'Edit Item\'/}}\'>\n        {{jed \"Edit Item\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block col1of5\'>\n        <div class=\'button white dropdown-toggle width-full no-padding text-align-center\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' href=\'{{>url(\'copy\')}}\'>\n              <i class=\'fa fa-copy\'><\/i>\n              {{jed \"Copy Item\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory/license_line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-type=\'license\'>\n  <div class=\'col1of5 line-col\'><\/div>\n  <div class=\'col2of5 line-col text-align-left\'>\n    <div class=\'row\'>\n      {{>inventory_code}}\n    <\/div>\n    <div class=\'row grey-text\'>\n      {{if item_version}}\n        {{>itemVersion() + \', \'}}\n      {{/if}}\n      {{if ~additionalDataFetched}}\n        {{if current_location}}\n          {{>current_location + \', \'}}\n        {{/if}}\n      {{else}}\n      <span>\n        {{partial \"views/loading\" {\"size\":\"micro\"}/}}\n      <\/span>\n      {{/if}}\n      {{>licenseInformation()}}\n    <\/div>\n  <\/div>\n  <div class=\'col1of5 line-col\'><\/div>\n  <div class=\'col1of5 line-col line-actions padding-right-xs\'>\n    {{if ~accessRight.atLeastRole(~currentUserRole, \"lending_manager\") }}\n    <div class=\'multibutton width-full text-align-right\'>\n      <a class=\'button white text-ellipsis col4of5 negative-margin-right-xxs\' href=\'{{>url(\'edit\')}}\' title=\'{{jed \'Edit License\'/}}\'>\n        {{jed \"Edit License\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block col1of5\'>\n        <div class=\'button white dropdown-toggle width-full no-padding text-align-center\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' href=\'{{>url(\'copy\')}}\'>\n              <i class=\'fa fa-copy\'><\/i>\n              {{jed \"Copy License\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory/line", "{{include tmpl=\"manage/views/inventory/\"+constructor.className.toLowerCase()+\"_line\" /}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory/model_line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-is_package=\'{{>is_package}}\' data-type=\'model\'>\n  <div class=\'col1of5 line-col\'>\n    <div class=\'row\'>\n      <div class=\'col1of2\'>\n        <button class=\'button inset small width-full\' data-type=\'inventory-expander\' title=\'{{if is_package}}{{jed \'Packages\'/}}{{else}}{{jed \'Items\'/}}{{/if}}\'>\n          {{if items().count()>0}}\n          <i class=\'arrow right\'><\/i>\n          {{/if}}\n          <span>{{>items().count()}}<\/span>\n        <\/button>\n      <\/div>\n      <div class=\'col1of2 text-align-center height-xxs\'>\n        <div class=\'table\'>\n          <div class=\'table-row\'>\n            <div class=\'table-cell vertical-align-middle\'>\n              <img class=\'max-width-xxs max-height-xxs\' src=\'/models/{{>id}}/image_thumb\'>\n            <\/div>\n          <\/div>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'col2of5 line-col text-align-left\'>\n    {{if is_package}}\n    <div class=\'grey-text\'>{{jed \'Package\'/}}<\/div>\n    {{/if}}\n    <strong class=\'test-fix-timeline\'>\n      {{> name()}}\n    <\/strong>\n  <\/div>\n  <div class=\'col1of5 line-col text-align-center\'>\n    <span title=\'{{jed \'in stock\'/}}\'>{{> availability().in_stock}}<\/span>\n    /\n    <span title=\'{{jed \'rentable\'/}}\'>{{> availability().total_rentable}}<\/span>\n  <\/div>\n  <div class=\'col1of5 line-col line-actions padding-right-xs\'>\n    {{if ~accessRight.atLeastRole(~currentUserRole, \"lending_manager\") }}\n    <div class=\'multibutton width-full text-align-right\'>\n      <a class=\'button white text-ellipsis col4of5 negative-margin-right-xxs\' href=\'{{>url(\'edit\')}}\' title=\'{{jed \'Edit Model\'/}}\'>\n        {{jed \"Edit Model\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block col1of5\'>\n        <div class=\'button white dropdown-toggle width-full no-padding text-align-center\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' data-model-id=\'{{>id}}\' data-open-time-line>\n              <i class=\'fa fa-align-left\'><\/i>\n              {{jed \"Timeline\"/}}\n            <\/a>\n          <\/li>\n          {{if items().count() == 0}}\n          <li>\n            <a class=\'dropdown-item red\' data-method=\'delete\' href=\'{{>url()}}\'>\n              <i class=\'fa fa-trash\'><\/i>\n              {{jed \"Delete\"/}}\n            <\/a>\n          <\/li>\n          {{/if}}\n        <\/ul>\n      <\/div>\n    <\/div>\n    {{else}}\n    <a class=\'button white text-ellipsis\' data-model-id=\'{{>id}}\' data-open-time-line>\n      <i class=\'fa fa-align-left\'><\/i>\n      {{jed \"Timeline\"/}}\n    <\/a>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory/option_line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-type=\'option\'>\n  <div class=\'col1of5 line-col text-align-center\'>{{>inventory_code}}<\/div>\n  <div class=\'col2of5 line-col text-align-left\'>\n    <strong class=\'test-fix-timeline\'>{{> name()}}<\/strong>\n  <\/div>\n  <div class=\'col1of5 line-col text-align-center\'>\n    {{money price/}}\n  <\/div>\n  <div class=\'col1of5 line-col line-actions padding-right-xs\'>\n    {{if ~accessRight.atLeastRole(~currentUserRole, \"lending_manager\") }}\n    <a class=\'button white text-ellipsis\' href=\'{{>url(\'edit\')}}\'>\n      {{jed \"Edit Option\"/}}\n    <\/a>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory/software_line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-is_package=\'{{>is_package}}\' data-type=\'software\'>\n  <div class=\'col1of5 line-col\'>\n    <div class=\'row\'>\n      <div class=\'col1of2\'>\n        <button class=\'button inset small width-full\' data-type=\'inventory-expander\' title=\'{{if is_package}}{{jed \'Packages\'/}}{{else}}{{jed \'Items\'/}}{{/if}}\'>\n          {{if licenses().count()>0}}\n          <i class=\'arrow right\'><\/i>\n          {{/if}}\n          <span>{{>licenses().count()}}<\/span>\n        <\/button>\n      <\/div>\n      <div class=\'col1of2 text-align-center height-xxs\'>\n        <div class=\'table\'>\n          <div class=\'table-row\'>\n            <div class=\'table-cell vertical-align-middle\'>\n              <img class=\'max-width-xxs max-height-xxs\' src=\'/models/{{>id}}/image_thumb\'>\n            <\/div>\n          <\/div>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'col2of5 line-col text-align-left\'>\n    {{if is_package}}\n    <div class=\'grey-text\'>{{jed \'Package\'/}}<\/div>\n    {{/if}}\n    <strong class=\'test-fix-timeline\'>\n      {{> name()}}\n    <\/strong>\n  <\/div>\n  <div class=\'col1of5 line-col text-align-center\'>\n    <span title=\'{{jed \'in stock\'/}}\'>{{> availability().in_stock}}<\/span>\n    /\n    <span title=\'{{jed \'rentable\'/}}\'>{{> availability().total_rentable}}<\/span>\n  <\/div>\n  <div class=\'col1of5 line-col line-actions padding-right-xs\'>\n    {{if ~accessRight.atLeastRole(~currentUserRole, \"lending_manager\") }}\n    <div class=\'multibutton width-full text-align-right\'>\n      <a class=\'button white text-ellipsis col4of5 negative-margin-right-xxs\' href=\'{{>url(\'edit\')}}\' title=\'{{jed \'Edit Software\'/}}\'>\n        {{jed \"Edit Software\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block col1of5\'>\n        <div class=\'button white dropdown-toggle width-full no-padding text-align-center\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' data-model-id=\'{{>id}}\' data-open-time-line>\n              <i class=\'fa fa-align-left\'><\/i>\n              {{jed \"Timeline\"/}}\n            <\/a>\n          <\/li>\n          {{if licenses().count() == 0}}\n          <li>\n            <a class=\'dropdown-item red\' data-method=\'delete\' href=\'{{>url()}}\'>\n              <i class=\'fa fa-trash\'><\/i>\n              {{jed \"Delete\"/}}\n            <\/a>\n          <\/li>\n          {{/if}}\n        <\/ul>\n      <\/div>\n    <\/div>\n    {{else}}\n    <a class=\'button white text-ellipsis\' data-model-id=\'{{>id}}\' data-open-time-line>\n      <i class=\'fa fa-align-left\'><\/i>\n      {{jed \"Timeline\"/}}\n    <\/a>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory_pools/admin/holiday_entry", "<div class=\'row line font-size-xs\' data-index=\'{{>i}}\'>\n  <input name=\'inventory_pool[holidays_attributes][{{>i}}][name]\' type=\'hidden\' value=\'{{>name}}\'>\n  <input name=\'inventory_pool[holidays_attributes][{{>i}}][start_date]\' type=\'hidden\' value=\'{{>start_date}}\'>\n  <input name=\'inventory_pool[holidays_attributes][{{>i}}][end_date]\' type=\'hidden\' value=\'{{>end_date}}\'>\n  <div class=\'line-col col1of4 text-align-left\'>\n    <strong>{{>name}}<\/strong>\n  <\/div>\n  <div class=\'line-col col2of4 text-align-left\'>\n    {{>start_date}} - {{>end_date}}\n  <\/div>\n  <div class=\'line-col col1of4\'>\n    <button class=\'button inset small\' data-remove-holiday>{{jed \"Delete\"/}}<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory_pools/daily/workload", "<div class=\'row margin-top-l padding-bottom-m\'>\n  <div class=\'text-align-right margin-right-m\'>\n    <span class=\'badge medium padding-inset-xs text-shadow\' style=\'background-color: #999999\'>{{jed \"Take Backs\"/}}<\/span>\n    <span class=\'badge medium padding-inset-xs text-shadow\' style=\'background-color: #cccccc\'>{{jed \"Hand Overs\"/}}<\/span>\n  <\/div>\n<\/div>\n<div class=\'bar-chart\'><\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/inventory_pools/latest_reminder/tooltip", "<div class=\'row width-l\'>\n  <div class=\'paragraph-s\'>\n    <strong>{{dateAndTime created_at/}}<\/strong>\n    {{>title}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/autocomplete_element", "<li class=\'separated-bottom exclude-last-child width-xxl\'>\n  <a class=\'row{{if hasProblems()}} light-red{{/if}}\' title=\'{{>inventory_code}}{{if location}} {{>location}}{{/if}}\'>\n    <div class=\'col1of4 text-ellipsis\'>\n      <strong>{{>inventory_code}}<\/strong>\n    <\/div>\n    {{if type == \'Item\'}}\n    <div class=\'col3of4 text-ellipsis\'>\n      {{>location}}\n    <\/div>\n    {{else}}\n    <div class=\'col3of4\'>\n      <strong>{{>serial_number}}<\/strong>\n    <\/div>\n    {{/if}}\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/field", "<div id=\'{{>~field.id}}\'>\n  <div class=\'{{if ~fieldColor}}{{>~fieldColor}} {{/if}}{{if ~field.hidden}}hidden {{/if}}field row emboss padding-inset-xs margin-vertical-xxs margin-right-xs\' data-editable=\'{{>~field.isEditable(~itemData)}}\' data-id=\'{{>~field.id}}\' data-required=\'{{>~field.required}}\' data-type=\'field\'>\n    <div class=\'row\'>\n      <div class=\'col1of2 padding-vertical-xs\' data-type=\'key\'>\n        {{if !~field.visibility_dependency_field_id && (~removeable || (~hideable && !~field.required) )}}\n        <a class=\'font-size-m link grey padding-inset-xs\' data-placement=\'top\' data-toggle=\'tooltip\' data-type=\'remove-field\' title=\'{{jed \'Hide this field from all item forms\'/}}\'>\n          <i class=\'fa fa-times-circle\'><\/i>\n        <\/a>\n        {{/if}}\n        <strong class=\'font-size-m inline-block\'>\n          {{>~field.getLabel()}}\n          {{if ~field.required}}*{{/if}}\n        <\/strong>\n      <\/div>\n      <div class=\'col1of2\' data-type=\'value\'>\n        {{if (~writeable && !~itemData) || (~writeable && ~field.isEditable(~itemData))}}\n        {{include tmpl=\"manage/views/items/fields/writeable/\"+~field.type/}}\n        {{else}}\n        <div class=\'padding-vertical-xs font-size-m\' data-value=\'{{>~field.getValue(~itemData, ~field.attribute)}}\'>\n          {{include tmpl=\"manage/views/items/fields/readonly/\"+~field.type/}}\n        <\/div>\n        {{/if}}\n      <\/div>\n    <\/div>\n    {{if ~field.id == \'inventory_code\' && ~itemData && !~itemData.created_at}}\n    <div class=\'row text-align-right\' id=\'switch\'>\n      <button class=\'button small green\' data-inventory_code=\'{{>~itemData.inventory_code}}\'>\n        {{jed \'last used +1\'/}}\n      <\/button>\n      <button class=\'button small white\' data-inventory_code=\'{{>~itemData.lowest_proposed_inventory_code}}\'>\n        {{jed \'fill up gaps\'/}}\n      <\/button>\n      <button class=\'button small white\' data-inventory_code=\'{{>~itemData.highest_proposed_inventory_code}}\'>\n        {{jed \'assign highest available\'/}}\n      <\/button>\n    <\/div>\n    {{/if}}\n    {{if ~field.id == \'attachments\'}}\n    <div class=\'list-of-lines even padding-bottom-xxs\'>\n      {{if ~writeable && ~field.isEditable(~itemData)}}\n      {{partial \'manage/views/items/fields/writeable/partials/uploaded_attachment\' ~itemData.attachments/}}\n      {{else}}\n      {{partial \'manage/views/items/fields/readonly/partials/uploaded_attachment\' ~itemData.attachments/}}\n      {{/if}}\n    <\/div>\n    {{/if}}\n  <\/div>\n<\/div>\n<script>\n  (function() {\n    $(document).ready(function() {\n      if (!window.defined_once) {\n        $(\'[data-toggle=\"tooltip\"]\').tooltip();\n        $(\'body\').on(\'click\', \'#switch button[data-inventory_code]\', function() {\n          $(\'input[name=\"item[inventory_code]\"]\').val($(this).data(\'inventory_code\'));\n          $(\'#switch button[data-inventory_code]\').removeClass(\'green\').addClass(\'white\');\n          $(this).removeClass(\'white\').addClass(\'green\');\n          return false;\n        });\n        return window.defined_once = true;\n      }\n    });\n  \n  }).call(this);\n<\/script>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/readonly/attachment", "");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/readonly/autocomplete-search", "{{if ~field.getValue(~itemData, ~field.attribute)}}\n<span>{{>~field.getItemValueLabel(~field.item_value_label, ~itemData)}}<\/span>\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/readonly/autocomplete", "{{if ~field.getValue(~itemData, ~field.attribute)}}\n<span>{{>~field.getValueLabel(~field.values, ~field.getValue(~itemData, ~field.attribute))}}<\/span>\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/readonly/date", "{{if ~field.getValue(~itemData, ~field.attribute)}}\n<span>{{date ~field.getValue(~itemData, ~field.attribute)/}}<\/span>\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/readonly/partials/uploaded_attachment", "<div class=\'row line font-size-xs focus-hover-thin\' data-type=\'inline-entry\'>\n  <div class=\'line-col col7of10 text-align-left\'>\n    <a class=\'blue\' href=\'{{>public_filename}}\' target=\'_blank\'>\n      {{>filename}}\n    <\/a>\n  <\/div>\n  <div class=\'line-col col3of10 text-align-right\'><\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/readonly/radio", "{{for ~field.values}}\n{{if ~field.getValue(~itemData, ~field.attribute) == value}}\n<span>{{jed label/}}<\/span>\n{{/if}}\n{{/for}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/readonly/select", "{{for ~field.values}}\n{{if ~field.getValue(~itemData, ~field.attribute) == value}}\n<span>{{jed label/}}<\/span>\n{{/if}}\n{{/for}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/readonly/text", "{{if ~field.getValue(~itemData, ~field.attribute)}}\n<span>{{>~field.getValue(~itemData, ~field.attribute)}}<\/span>\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/readonly/textarea", "{{if ~field.getValue(~itemData, ~field.attribute)}}\n<span>{{>~field.getValue(~itemData, ~field.attribute)}}<\/span>\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/attachment", "<button class=\'button inset width-full\' data-type=\'select\'>\n  {{jed \"Select File\"/}}\n<\/button>\n<input autocomplete=\'false\' class=\'invisible height-full width-full position-absolute-topleft\' type=\'file\'>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/autocomplete-search", "<label class=\'row\'>\n  {{if ~field.getValue(~itemData, ~field.attribute, true)}}\n  <input name=\'{{>~field.getFormName()}}\' type=\'hidden\' value=\'{{>~field.getValue(~itemData, ~field.attribute, true)}}\'>\n  <input autocomplete=\'off\' class=\'has-addon width-full\' data-autocomplete_blur_on_select=\'true\' data-autocomplete_display_attribute=\'{{>~field.display_attr}}\' data-autocomplete_display_attribute_ext=\'{{>~field.display_attr_ext}}\' data-autocomplete_element_tmpl=\'views/autocomplete/element\' data-autocomplete_search_attr=\'{{>~field.search_attr}}\' data-autocomplete_value_attribute=\'{{>~field.value_attr}}\' data-autocomplete_value_target=\'{{>~field.getFormName()}}\' data-type=\'autocomplete\' data-url=\'{{>~field.search_path}}\' placeholder=\'{{>~field.getLabel()}}\' title=\'{{>~field.getLabel()}}\' type=\'text\' value=\'{{>~field.getItemValueLabel(~field.item_value_label, ~itemData)}}\'>\n  {{else}}\n  <input name=\'{{>~field.getFormName()}}\' type=\'hidden\'>\n  <input autocomplete=\'off\' class=\'has-addon width-full\' data-autocomplete_blur_on_select=\'true\' data-autocomplete_display_attribute=\'{{>~field.display_attr}}\' data-autocomplete_display_attribute_ext=\'{{>~field.display_attr_ext}}\' data-autocomplete_element_tmpl=\'views/autocomplete/element\' data-autocomplete_search_attr=\'{{>~field.search_attr}}\' data-autocomplete_value_attribute=\'{{>~field.value_attr}}\' data-autocomplete_value_target=\'{{>~field.getFormName()}}\' data-type=\'autocomplete\' data-url=\'{{>~field.search_path}}\' placeholder=\'{{>~field.getLabel()}}\' title=\'{{>~field.getLabel()}}\' type=\'text\'>\n  {{/if}}\n  <div class=\'addon transparent\'>\n    <i class=\'arrow down\'><\/i>\n  <\/div>\n<\/label>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/autocomplete", "<label class=\'row\'>\n  {{if ~field.extensible}}\n  <input data-type=\'extended-value\' name=\'{{>~field.getExtendedKeyFormName()}}\' type=\'hidden\' value=\'{{>~field.getValue(~itemData, ~field.extended_key, true)}}\'>\n  {{/if}}\n  {{if ~field.getValue(~itemData, ~field.attribute, true)}}\n  <input name=\'{{>~field.getFormName()}}\' type=\'hidden\' value=\'{{>~field.getValue(~itemData, ~field.attribute, true)}}\'>\n  <input autocomplete=\'off\' class=\'has-addon width-full\' data-autocomplete_blur_on_select=\'true\' data-autocomplete_data=\'{{stringify ~field.values/}}\' data-autocomplete_display_attribute=\'label\' data-autocomplete_element_tmpl=\'views/autocomplete/element\' data-autocomplete_extended_key_target=\'{{>~field.getExtendedKeyFormName()}}\' data-autocomplete_extensible=\'{{>~field.extensible}}\' data-autocomplete_search_on_focus=\'true\' data-autocomplete_value_target=\'{{>~field.getFormName()}}\' data-type=\'autocomplete\' placeholder=\'{{>~field.getLabel()}}\' title=\'{{>~field.getLabel()}}\' type=\'text\' value=\'{{>~field.getValueLabel(~field.values, ~field.getValue(~itemData, ~field.attribute, true))}}\'>\n  {{else}}\n  <input name=\'{{>~field.getFormName()}}\' type=\'hidden\'>\n  <input autocomplete=\'off\' class=\'has-addon width-full\' data-autocomplete_blur_on_select=\'true\' data-autocomplete_data=\'{{stringify ~field.values/}}\' data-autocomplete_display_attribute=\'label\' data-autocomplete_element_tmpl=\'views/autocomplete/element\' data-autocomplete_extended_key_target=\'{{>~field.getExtendedKeyFormName()}}\' data-autocomplete_extensible=\'{{>~field.extensible}}\' data-autocomplete_search_on_focus=\'true\' data-autocomplete_value_target=\'{{>~field.getFormName()}}\' data-type=\'autocomplete\' placeholder=\'{{>~field.getLabel()}}\' title=\'{{>~field.getLabel()}}\' type=\'text\'>\n  {{/if}}\n  <div class=\'addon transparent\'>\n    <i class=\'arrow down\'><\/i>\n  <\/div>\n<\/label>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/checkbox", "<div class=\'padding-inset-xxs\'>\n  {{:~setvar(\"values\", ~field.getValue(~itemData, ~field.attribute, true))}}\n  {{for ~field.values}}\n  <label class=\'padding-inset-xxs\'>\n    {{if ~getvar(\"values\") != null && ~getvar(\"values\").indexOf(value) >= 0}}\n    <input checked name=\'{{>~field.getFormName(~field.attribute, ~field.form_name, \'asArray\')}}\' type=\'checkbox\' value=\'{{>value}}\'>\n    {{else}}\n    <input name=\'{{>~field.getFormName(~field.attribute, ~field.form_name, \'asArray\')}}\' type=\'checkbox\' value=\'{{>value}}\'>\n    {{/if}}\n    <span class=\'font-size-m\'>{{jed label/}}<\/span>\n  <\/label>\n  {{/for}}\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/composite", "<div class=\'row\'>\n  <div class=\'col7of8 padding-vertical-xs\' id=\'remaining-total-quantity\'><\/div>\n  <div class=\'col1of8\'>\n    <button class=\'button inset float-right\' id=\'add-inline-entry\'>\n      <i class=\'fa fa-plus\'><\/i>\n    <\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/composite_partials/license_quantity_allocation", "<div class=\'row line font-size-xs focus-hover-thin\' data-type=\'inline-entry\'>\n  <div class=\'line-col col1of10 text-align-center\'>Quantity:<\/div>\n  <div class=\'line-col col2of10\'>\n    <input class=\'width-full small text-align-center\' data-quantity-allocation=\'true\' name=\'{{>field.getFormName()}}[][quantity]\' type=\'text\' value=\'{{if allocation}}{{>allocation.quantity}}{{/if}}\'>\n  <\/div>\n  <div class=\'line-col col1of10 text-align-center\'>Location:<\/div>\n  <div class=\'line-col col5of10\'>\n    <input class=\'width-full small text-align-center\' data-room-allocation=\'true\' name=\'{{>field.getFormName()}}[][room]\' type=\'text\' value=\'{{if allocation}}{{>allocation.room}}{{/if}}\'>\n  <\/div>\n  <div class=\'line-col col1of10\'>\n    <button class=\'button inset small\' data-remove>Remove<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/date", "<input name=\'{{>~field.getFormName()}}\' type=\'hidden\' value=\'{{>~field.getValue(~itemData, ~field.attribute, true)}}\'>\n{{if ~field.getValue(~itemData, ~field.attribute, true)}}\n<input autocomplete=\'off\' class=\'width-full\' data-type=\'datepicker\' type=\'text\' value=\'{{date ~field.getValue(~itemData, ~field.attribute, true)/}}\'>\n{{else}}\n<input autocomplete=\'off\' class=\'width-full\' data-type=\'datepicker\' type=\'text\'>\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/partials/attachment_inline_entry", "<div class=\'row line font-size-xs focus-hover-thin\' data-new data-type=\'inline-entry\'>\n  <div class=\'line-col text-align-center\' title=\'{{jed \'File has to be uploaded on save\'/}}\'>\n    <i class=\'fa fa-cloud-upload\'><\/i>\n  <\/div>\n  <div class=\'line-col col7of10 text-align-left\'>\n    {{>name}}\n  <\/div>\n  <div class=\'line-col col3of10 text-align-right\'>\n    <button class=\'button small inset\' data-remove type=\'button\'>\n      {{jed \"Remove\"/}}\n    <\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/partials/uploaded_attachment", "<div class=\'row line font-size-xs focus-hover-thin\' data-type=\'inline-entry\'>\n  <input name=\'item[attachments_attributes][{{>id}}][id]\' type=\'hidden\' value=\'{{>id}}\'>\n  <input name=\'item[attachments_attributes][{{>id}}][_destroy]\' type=\'hidden\'>\n  <div class=\'line-col col7of10 text-align-left\'>\n    <a class=\'blue\' href=\'{{>public_filename}}\' target=\'_blank\'>\n      {{>filename}}\n    <\/a>\n  <\/div>\n  <div class=\'line-col col3of10 text-align-right\'>\n    <button class=\'button small inset\' data-remove type=\'button\'>\n      {{jed \"Remove\"/}}\n    <\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/radio", "<div class=\'padding-inset-xxs\'>\n  {{for ~field.values}}\n  <label class=\'padding-inset-xxs\'>\n    {{if ~field.getValue(~itemData, ~field.attribute, true) == value}}\n    <input checked name=\'{{>~field.getFormName()}}\' type=\'radio\' value=\'{{>value}}\'>\n    {{else}}\n    <input name=\'{{>~field.getFormName()}}\' type=\'radio\' value=\'{{>value}}\'>\n    {{/if}}\n    <span class=\'font-size-m\'>{{jed label/}}<\/span>\n  <\/label>\n  {{/for}}\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/select", "<select class=\'width-full\' name=\'{{>~field.getFormName()}}\'>\n  {{for ~field.values}}\n  {{if ~field.getValue(~itemData, ~field.attribute, true) == value}}\n  <option selected value=\'{{>value}}\'>\n    {{jed label/}}\n  <\/option>\n  {{else}}\n  <option value=\'{{>value}}\'>\n    {{jed label/}}\n  <\/option>\n  {{/if}}\n  {{/for}}\n<\/select>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/text", "{{if ~field.getValue(~itemData, ~field.attribute, true)}}\n<input autocomplete=\'off\' class=\'width-full\' name=\'{{>~field.getFormName()}}\' type=\'text\' value=\'{{>~field.getValue(~itemData, ~field.attribute, true)}}\'>\n{{else}}\n<input autocomplete=\'off\' class=\'width-full\' name=\'{{>~field.getFormName()}}\' type=\'text\'>\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/fields/writeable/textarea", "<textarea autocomplete=\'off\' class=\'width-full\' name=\'{{>~field.getFormName()}}\' rows=\'5\' value=\'\'>{{>~field.getValue(~itemData, ~field.attribute, true)}}<\/textarea>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/form", "<div class=\'col1of2 padding-right-xs\' id=\'item-form-left-side\'><\/div>\n<div class=\'col1of2\' id=\'item-form-right-side\'><\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/group_of_fields", "<section class=\'padding-bottom-l\'>\n  {{if name}}\n  <h2 class=\'headline-m padding-bottom-m\'>\n    {{jed name/}}\n  <\/h2>\n  {{/if}}\n  <div class=\'row group-of-fields\'><\/div>\n<\/section>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/inspect_dialog", "<div class=\'modal medium hide fade ui-modal padding-inset-m padding-horizontal-l\' role=\'dialog\' tabindex=\'-1\'>\n  <form>\n    <div class=\'row padding-vertical-m\'>\n      <div class=\'col1of2\'>\n        <h3 class=\'headline-l\'>\n          {{jed \"Inspect Item\"/}}\n          {{>inventory_code}}\n        <\/h3>\n        <h4 class=\'headline-m light\'>{{>model().name()}}<\/h4>\n      <\/div>\n      <div class=\'col1of2\'>\n        <div class=\'float-right\'>\n          <a aria-hidden=\'true\' class=\'modal-close weak\' data-dismiss=\'modal\' title=\'{{jed \"close dialog\"/}}\' type=\'button\'>\n            {{jed \"Cancel\"/}}\n          <\/a>\n          <button class=\'button green\' type=\'submit\'>\n            {{jed \"Save\"/}}\n          <\/button>\n        <\/div>\n      <\/div>\n      <div class=\'row padding-vertical-m\'>\n        <div class=\'row padding-top-m\'>\n          <label class=\'col1of3 padding-right-s\'>\n            <div class=\'row\'>{{jed \'Status\'/}}<\/div>\n            <div class=\'row\'>\n              <select class=\'width-full\' name=\'is_broken\'>\n                {{if is_broken}}\n                <option value=\'false\'>{{jed \'Functional\'/}}<\/option>\n                <option selected value=\'true\'>{{jed \'Defective\'/}}<\/option>\n                {{else}}\n                <option selected value=\'false\'>{{jed \'Functional\'/}}<\/option>\n                <option value=\'true\'>{{jed \'Defective\'/}}<\/option>\n                {{/if}}\n              <\/select>\n            <\/div>\n          <\/label>\n          <label class=\'col1of3 padding-right-s\'>\n            <div class=\'row\'>{{jed \'Completeness\'/}}<\/div>\n            <div class=\'row\'>\n              <select class=\'width-full\' name=\'is_incomplete\'>\n                {{if is_incomplete}}\n                <option value=\'false\'>{{jed \'Complete\'/}}<\/option>\n                <option selected value=\'true\'>{{jed \'Incomplete\'/}}<\/option>\n                {{else}}\n                <option selected value=\'false\'>{{jed \'Complete\'/}}<\/option>\n                <option value=\'true\'>{{jed \'Incomplete\'/}}<\/option>\n                {{/if}}\n              <\/select>\n            <\/div>\n          <\/label>\n          <div class=\'col1of3 padding-right-s\'>\n            <div class=\'row\'>{{jed \'Borrowable\'/}}<\/div>\n            <div class=\'row\'>\n              <select class=\'width-full\' name=\'is_borrowable\'>\n                {{if is_borrowable}}\n                <option selected value=\'true\'>{{jed \'Borrowable\'/}}<\/option>\n                <option value=\'false\'>{{jed \'Unborrowable\'/}}<\/option>\n                {{else}}\n                <option value=\'true\'>{{jed \'Borrowable\'/}}<\/option>\n                <option selected value=\'false\'>{{jed \'Unborrowable\'/}}<\/option>\n                {{/if}}\n              <\/select>\n            <\/div>\n          <\/div>\n        <\/div>\n        <div class=\'row padding-top-m\'>\n          <label class=\'col1of1 padding-right-s\'>\n            <div class=\'row\'>{{jed \'Status note\'/}}<\/div>\n            <div class=\'row\'>\n              <textarea class=\'width-full\' name=\'status_note\'>{{> status_note}}<\/textarea>\n            <\/div>\n          <\/label>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/form>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/items/line", "<div class=\'line row focus-hover-thin{{if !~currentInventoryPool.isOwnerOrResponsibleFor(#view.data)}} grayed-out{{/if}}\' data-id=\'{{>id}}\' data-type=\'item\'>\n  <div class=\'col1of8 line-col\'>\n    <strong>{{>inventory_code}}<\/strong>\n  <\/div>\n  <div class=\'col3of8 line-col text-align-left\'>\n    {{>model().name()}}\n    <strong class=\'block darkred-text\'>{{>getProblems()}}<\/strong>\n  <\/div>\n  <div class=\'col2of8 line-col text-align-left padding-right-s\'>\n    {{>current_location}}\n  <\/div>\n  <div class=\'col2of8 line-col line-actions padding-right-xs\'>\n    {{if ~currentInventoryPool.isOwnerOrResponsibleFor(#view.data) && ~accessRight.atLeastRole(~currentUserRole, \"lending_manager\") }}\n    <div class=\'multibutton\'>\n      <a class=\'button white\' href=\'{{>url(\'edit\')}}\' title=\'{{jed \'Edit Item\'/}}\'>\n        {{jed \"Edit Item\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' href=\'{{>url(\'copy\')}}\'>\n              <i class=\'fa fa-copy\'><\/i>\n              {{jed \"Copy Item\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/licenses/line", "<div class=\'line row focus-hover-thin{{if !~currentInventoryPool.isOwnerOrResponsibleFor(#view.data)}} grayed-out{{/if}}\' data-id=\'{{>id}}\' data-type=\'license\'>\n  <div class=\'col1of8 line-col\'>\n    <strong>{{>inventory_code}}<\/strong>\n  <\/div>\n  <div class=\'col3of8 line-col text-align-left\'>\n    {{>model().name()}}\n    {{if ~currentInventoryPool.isOwnerOrResponsibleFor(#view.data) }}\n    <strong class=\'block darkred-text\'>{{>getProblems()}}<\/strong>\n    {{/if}}\n  <\/div>\n  <div class=\'col2of8 line-col text-align-left padding-right-s\'>\n    {{>current_location}}\n  <\/div>\n  <div class=\'col2of8 line-col line-actions padding-right-xs\'>\n    {{if ~currentInventoryPool.isOwnerOrResponsibleFor(#view.data) && ~accessRight.atLeastRole(~currentUserRole, \"lending_manager\") }}\n    <div class=\'multibutton\'>\n      <a class=\'button white\' href=\'{{>url(\'edit\')}}\' title=\'{{jed \'Edit License\'/}}\'>\n        {{jed \"Edit License\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' href=\'{{>url(\'copy\')}}\'>\n              <i class=\'fa fa-copy\'><\/i>\n              {{jed \"Copy License\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/lists/loading", "<div class=\'height-s\'><\/div>\n<img class=\'margin-horziontal-auto margin-top-xxl margin-bottom-xxl\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n<div class=\'height-s\'><\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/lists/loading_page", "<span class=\'page loading-page\' data-page=\'{{> ~page}}\'>\n  <div class=\'height-s\'><\/div>\n  <img class=\'margin-horziontal-auto margin-top-xxl margin-bottom-xxl\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n  <div class=\'height-s\'><\/div>\n<\/span>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/lists/no_results", "<div class=\'height-s\'><\/div>\n<h3 class=\'headline-s light padding-inset-xl text-align-center\'>\n  {{jed \"No entries found\"/}}\n<\/h3>\n<div class=\'height-s\'><\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/lists/page", "<span class=\'page\' data-page=\'{{> ~page}}\'>\n  {{for ~entries}}\n  <div class=\'line\'><\/div>\n  {{/for}}\n<\/span>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/explorative_add_line", "<div class=\'line row focus-hover-thin{{if availability().maxAvailableForGroups(~startDate, ~endDate, ~groupIds) <= 0}} grayed-out{{/if}}\' data-id=\'{{>id}}\' data-type=\'model\'>\n  <div class=\'col1of10 line-col no-padding text-align-center\'>\n    <div class=\'table\'>\n      <div class=\'table-row\'>\n        <div class=\'table-cell vertical-align-middle\'>\n          <img class=\'max-width-xxs max-height-xxs\' src=\'/models/{{>id}}/image_thumb\'>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'col5of10 line-col text-align-left\'>\n    {{if is_package}}\n    <div class=\'grey-text\'>{{jed \'Package\'/}}<\/div>\n    {{/if}}\n    <strong>\n      {{> name()}}\n    <\/strong>\n  <\/div>\n  <div class=\'col2of10 line-col no-padding text-align-center\'>\n    <span title=\'{{jed \'Available for borrower\'/}}\'>{{>availability().maxAvailableForGroups(~startDate, ~endDate, ~groupIds)}}<\/span>\n    <span title=\'{{jed \'Available in total\'/}}\'>({{>availability().maxAvailableInTotal(~startDate, ~endDate)}})<\/span>\n    /\n    <span title=\'{{jed \'Borrowable items\'/}}\'>{{>availability().total_rentable}}<\/span>\n  <\/div>\n  <div class=\'col2of10 line-col line-actions padding-right-s text-align-center\'>\n    <a class=\'button white\' data-type=\'select\'>\n      {{jed \"Select\"/}}\n    <\/a>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/form/accessory_inline_entry", "<div class=\'row line font-size-xs focus-hover-thin\' data-new data-type=\'inline-entry\'>\n  <input name=\'model[accessories_attributes][{{>~uid}}][inventory_pool_toggle]\' type=\'hidden\' value=\'0,{{current_inventory_pool_id/}}\'>\n  <label class=\'line-col col1of10 text-align-center no-padding\'>\n    <input autocomplete=\'off\' checked name=\'model[accessories_attributes][{{>~uid}}][inventory_pool_toggle]\' type=\'checkbox\' value=\'1,{{current_inventory_pool_id/}}\'>\n  <\/label>\n  <div class=\'line-col col6of10 text-align-left\'>\n    {{>name}}\n    <input name=\'model[accessories_attributes][{{>~uid}}][name]\' type=\'hidden\' value=\'{{>name}}\'>\n  <\/div>\n  <div class=\'line-col col3of10 text-align-right\'>\n    <button class=\'button small inset\' data-remove>Remove<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/form/allocation_inline_entry", "<div class=\'row line font-size-xs focus-hover-thin\' data-new data-type=\'inline-entry\'>\n  <input name=\'model[partitions_attributes][{{>~uid}}][group_id]\' type=\'hidden\' value=\'{{>id}}\'>\n  <div class=\'line-col col3of5 text-align-left\' data-name=\'{{>name}}\'>\n    <a class=\'blue\' href=\'{{>url()}}/edit\'>\n      {{>name}}\n    <\/a>\n  <\/div>\n  <div class=\'line-col col1of5 text-align-center\'>\n    <input autocomplete=\'off\' class=\'width-xs small text-align-center\' name=\'model[partitions_attributes][{{>~uid}}][quantity]\' type=\'text\' value=\'1\'>\n  <\/div>\n  <div class=\'line-col col1of5 text-align-right\'>\n    <button class=\'button small inset\' data-remove>{{jed \"Remove\"/}}<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/form/attachment_inline_entry", "<div class=\'row line font-size-xs focus-hover-thin\' data-new data-type=\'inline-entry\'>\n  <div class=\'line-col text-align-center\' title=\'{{jed \'File has to be uploaded on save\'/}}\'>\n    <i class=\'fa fa-cloud-upload\'><\/i>\n  <\/div>\n  <div class=\'line-col col7of10 text-align-left\'>\n    {{>name}}\n  <\/div>\n  <div class=\'line-col col3of10 text-align-right\'>\n    <button class=\'button small inset\' data-remove type=\'button\'>Remove<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/form/category_inline_entry", "<div class=\'row line font-size-xs focus-hover-thin\' data-new data-type=\'inline-entry\'>\n  <input data-disable-on-remove name=\'model[category_ids][]\' type=\'hidden\' value=\'{{>id}}\'>\n  <div class=\'line-col col2of3 text-align-left\'>\n    {{>name}}\n  <\/div>\n  <div class=\'line-col col1of3 text-align-right\'>\n    <button class=\'button small inset\' data-remove>Remove<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/form/compatible_inline_entry", "<div class=\'row line font-size-xs focus-hover-thin\' data-new data-type=\'inline-entry\'>\n  <input data-disable-on-remove name=\'model[compatible_ids][]\' type=\'hidden\' value=\'{{>id}}\'>\n  <div class=\'line-col col2of3 text-align-left\'>\n    {{>name()}}\n  <\/div>\n  <div class=\'line-col col1of3 text-align-right\'>\n    <button class=\'button small inset\' data-remove type=\'button\'>Remove<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/form/package_inline_entry", "<div class=\'row line font-size-xs focus-hover-thin\' data-new data-type=\'inline-entry\'>\n  {{for data}}\n  <input name=\'model[packages][{{>~uid}}]{{>name}}\' type=\'hidden\' value=\'{{>value}}\'>\n  {{/for}}\n  {{for children}}\n  <input name=\'model[packages][{{>~uid}}][children][id][]\' type=\'hidden\' value=\'{{>id}}\'>\n  {{/for}}\n  <div class=\'line-col col1of4 text-align-left\'>\n    {{jed \'Prepackaged\'/}}\n  <\/div>\n  <div class=\'line-col col1of4 text-align-left\'>\n    <span class=\'grey-text\'>{{jed \'not yet saved\'/}}<\/span>\n  <\/div>\n  <div class=\'line-col col1of2 text-align-right\'>\n    <button class=\'button small inset\' data-remove title=\'Remove\' type=\'button\'>\n      <i class=\'fa fa-trash\'><\/i>\n    <\/button>\n    <button class=\'button small inset\' data-edit-package type=\'button\'>Edit<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/form/package_inline_entry/updated_package_form_data", "{{for data}}\n<input name=\'model[packages][{{>~uid}}]{{>name}}\' type=\'hidden\' value=\'{{>value}}\'>\n{{/for}}\n{{for children}}\n<input name=\'model[packages][{{>~uid}}][children][id][]\' type=\'hidden\' value=\'{{>id}}\'>\n{{/for}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/form/property_inline_entry", "<div class=\'row line font-size-xs focus-hover-thin\' data-type=\'inline-entry\' date-new>\n  <div class=\'line-col col1of10 text-align-left no-padding text-align-center cursor-move\' data-type=\'sort-handle\'>\n    <i class=\'fa fa-resize-vertical\'><\/i>\n  <\/div>\n  <div class=\'line-col col4of10 no-padding\'>\n    <input class=\'small width-full\' name=\'model[properties_attributes][][key]\' type=\'text\'>\n  <\/div>\n  <div class=\'line-col col4of10\'>\n    <input class=\'small width-full\' name=\'model[properties_attributes][][value]\' type=\'text\'>\n  <\/div>\n  <div class=\'line-col col1of10 text-align-right\'>\n    <button class=\'button small inset\' data-remove title=\'Remove\'>\n      <i class=\'fa fa-trash\'><\/i>\n    <\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-is_package=\'{{>is_package}}\' data-type=\'model\'>\n  <div class=\'col1of10 line-col text-align-center no-padding\'>\n    <div class=\'table\'>\n      <div class=\'table-row\'>\n        <div class=\'table-cell vertical-align-middle\'>\n          <img class=\'max-width-xxs max-height-xxs\' src=\'/models/{{>id}}/image_thumb\'>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'col4of10 line-col text-align-left\'>\n    {{if is_package}}\n    <div class=\'grey-text\'>{{jed \'Package\'/}}<\/div>\n    {{/if}}\n    <strong class=\'test-fix-timeline\'>\n      {{> name()}}\n    <\/strong>\n  <\/div>\n  <div class=\'col3of10 line-col text-align-center\'>\n    <span title=\'{{jed \'in stock\'/}}\'>{{> availability().in_stock}}<\/span>\n    /\n    <span title=\'{{jed \'rentable\'/}}\'>{{> availability().total_rentable}}<\/span>\n  <\/div>\n  <div class=\'col2of8 line-col line-actions padding-right-xs\'>\n    <div class=\'multibutton width-full text-align-right\'>\n      <a class=\'button white text-ellipsis col4of5 negative-margin-right-xxs\' href=\'{{>url(\'edit\')}}\' title=\'{{jed \'Edit Model\'/}}\'>\n        {{jed \"Edit Model\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block col1of5\'>\n        <div class=\'button white dropdown-toggle width-full no-padding text-align-center\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' data-model-id=\'{{>id}}\' data-open-time-line>\n              <i class=\'fa fa-align-left\'><\/i>\n              {{jed \"Timeline\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/packages/item", "<div class=\'row emboss padding-bottom-xxs margin-bottom-xxs\' data-id=\'{{>id}}\' data-new data-type=\'inline-entry\'>\n  <div class=\'row padding-inset-xxs\'>\n    <div class=\'col1of4 padding-left-s padding-top-xs\'>\n      <strong class=\'font-size-m inline-block\'>\n        {{>inventory_code}}\n      <\/strong>\n    <\/div>\n    <div class=\'col2of4 padding-top-xs\'>\n      {{>model().name()}}\n    <\/div>\n    <div class=\'col1of4 text-align-right\'>\n      <button class=\'button small inset\' data-remove type=\'button\'>Remove<\/button>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/packages/item_autocomplete_element", "<li class=\'separated-bottom exclude-last-child\'>\n  <a>\n    <div class=\'row text-ellipsis\'>\n      <div class=\'col1of3\'>\n        <strong>{{>inventory_code}}<\/strong>\n      <\/div>\n      <div class=\'col2of3\'>\n        {{>model().name()}}\n      <\/div>\n    <\/div>\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/packages/missing_data_error", "<div class=\'padding-horizontal-m padding-bottom-m\'>\n  <div class=\'row emboss red text-align-center font-size-m padding-inset-s\'>\n    <strong>{{jed \'Please provide all required fields\'/}}<\/strong>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/packages/no_items_error", "<div class=\'padding-horizontal-m padding-bottom-m\'>\n  <div class=\'row emboss red text-align-center font-size-m padding-inset-s\'>\n    <strong>{{jed \'You can not create a package without any item\'/}}<\/strong>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/packages/package_dialog", "<div class=\'modal medium hide fade ui-modal padding-vertical-m\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'row padding-vertical-m padding-horizontal-l\'>\n    <div class=\'col1of2\'>\n      <h3 class=\'headline-l\'>{{jed \"Package\"/}}<\/h3>\n    <\/div>\n    <div class=\'col1of2\'>\n      <div class=\'float-right\'>\n        <a aria-hidden=\'true\' class=\'modal-close weak\' data-dismiss=\'modal\' title=\'{{jed \"close dialog\"/}}\' type=\'button\'>\n          {{jed \"Cancel\"/}}\n        <\/a>\n        <button class=\'button green\' id=\'save-package\' type=\'button\'>\n          {{jed \"Save Package\"/}}\n        <\/button>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'hidden\' id=\'notifications\'><\/div>\n  <div class=\'modal-body row padding-horizontal-l\'>\n    <div class=\'margin-bottom-m\'>\n      <h2 class=\'headline-m padding-bottom-m\'>{{jed \'Items\'/}}<\/h2>\n      <div class=\'row emboss margin-vertical-xxs margin-right-xs\'>\n        <div class=\'row padding-inset-xs\'>\n          <div class=\'col1of2 padding-vertical-xs\'>\n            <strong class=\'font-size-m inline-block\'>{{jed \'Add item\'/}}<\/strong>\n          <\/div>\n          <div class=\'col1of2\'>\n            <div class=\'row\'>\n              <input autocomplete=\'off\' class=\'width-full has-addon\' data-barcode-scanner-target id=\'search-item\' type=\'text\'>\n              <div class=\'addon transparent\'>\n                <span class=\'arrow down\'><\/span>\n              <\/div>\n            <\/div>\n          <\/div>\n        <\/div>\n      <\/div>\n      <div class=\'row\' id=\'items\'><\/div>\n    <\/div>\n    <form class=\'padding-top-s\' id=\'item-form\'>\n      <div id=\'flexible-fields\'>\n        <div class=\'height-s\'><\/div>\n        <img class=\'margin-horziontal-auto margin-top-xxl margin-bottom-xxl\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n        <div class=\'height-s\'><\/div>\n      <\/div>\n    <\/form>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/timeline_modal", "<div class=\'modal large hide fade ui-modal padding-inset-m padding-horizontal-l\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'row padding-vertical-m\'>\n    <div class=\'col1of2\'>\n      <h3 class=\'headline-l\'>{{jed \"Availability Timeline\"/}}<\/h3>\n      <h3 class=\'headline-s light\'>{{>name()}}<\/h3>\n    <\/div>\n    <div class=\'col1of2\'>\n      <div class=\'float-right\'>\n        <a aria-hidden=\'true\' class=\'modal-close weak\' data-dismiss=\'modal\' title=\'{{jed \"close dialog\"/}}\' type=\'button\'>\n          {{jed \"Cancel\"/}}\n        <\/a>\n        <button aria-hidden=\'true\' class=\'button modal-close text-ellipsis weak white\' data-dismiss=\'modal\' title=\'{{jed \"close dialog\"/}}\' type=\'button\'>\n          {{jed \"Close\"/}}\n        <\/button>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'row margin-top-m\'>\n    <div class=\'modal-body no-padding\'>\n      <div class=\'row\'>\n        <div class=\'position-absolute-topright width-full text-align-center\'>\n          <div id=\'loading\'>\n            <div class=\'height-m\'><\/div>\n            {{partial \"views/loading\"/}}\n          <\/div>\n        <\/div>\n        <iframe height=\'500px\' id=\'timeline\' src=\'/manage/{{current_inventory_pool_id/}}/models/{{>id}}/timeline\' width=\'100%\'><\/iframe>\n      <\/div>\n      <div class=\'row text-align-right\'>\n        <a class=\'button white modal-close\' href=\'/manage/{{current_inventory_pool_id/}}/models/{{>id}}/timeline\' target=\'_blank\'>\n          <i class=\'fa fa-resize-full\'><\/i>\n        <\/a>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/models/tooltip", "<div class=\'row width-xxl font-size-m\'>\n  {{if image_url}}\n  <p>\n    <img class=\'max-size-xxs margin-horziontal-auto\' src=\'{{>image_url/}} style=\'max-width: 100px; max-height: 100px\'>\n  <\/p>\n  {{/if}}\n  <div class=\'row\'>\n    <div class=\'col1of3 text-align-right padding-right-s\'>\n      {{jed \"Product\"/}}:\n    <\/div>\n    <div class=\'col2of3\'>\n      <strong>{{>product}}<\/strong>\n    <\/div>\n  <\/div>\n  <div class=\'row\'>\n    <div class=\'col1of3 text-align-right padding-right-s\'>\n      {{jed \"Version\"/}}:\n    <\/div>\n    <div class=\'col2of3\'>\n      <strong>{{>version}}<\/strong>\n    <\/div>\n  <\/div>\n  <div class=\'row\'>\n    <div class=\'col1of3 text-align-right padding-right-s\'>\n      {{jed \"Manufacturer\"/}}:\n    <\/div>\n    <div class=\'col2of3\'>\n      <strong>{{>manufacturer}}<\/strong>\n    <\/div>\n  <\/div>\n  <div class=\'row\'>\n    <div class=\'col1of3 text-align-right padding-right-s\'>\n      {{jed \"Description\"/}}:\n    <\/div>\n    <div class=\'col2of3\'>\n      <strong>{{>description}}<\/strong>\n    <\/div>\n  <\/div>\n  <div class=\'row\'>\n    <div class=\'col1of3 text-align-right padding-right-s\'>\n      {{jed \"Internal Description\"/}}:\n    <\/div>\n    <div class=\'col2of3\'>\n      <strong>{{>internal_description}}<\/strong>\n    <\/div>\n  <\/div>\n  <div class=\'row\'>\n    <div class=\'col1of3 text-align-right padding-right-s\'>\n      {{jed \"Technical Details\"/}}:\n    <\/div>\n    <div class=\'col2of3\'>\n      <strong>{{>technical_detail}}<\/strong>\n    <\/div>\n  <\/div>\n  <div class=\'row\'>\n    <div class=\'col1of3 text-align-right padding-right-s\'>\n      {{jed \"Important notes for hand over\"/}}:\n    <\/div>\n    <div class=\'col2of3\'>\n      <strong>{{>hand_over_note}}<\/strong>\n    <\/div>\n  <\/div>\n  <div class=\'row\'>\n    <div class=\'col1of3 text-align-right padding-right-s\'>\n      {{jed \"Accessories\"/}}:\n    <\/div>\n    <div class=\'col2of3\'>\n      <strong>{{>accessory_names}}<\/strong>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/options/line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-type=\'option\'>\n  <div class=\'col1of5 line-col text-align-center\'>{{>inventory_code}}<\/div>\n  <div class=\'col2of5 line-col text-align-left\'>\n    <strong>{{> name()}}<\/strong>\n  <\/div>\n  <div class=\'col1of5 line-col text-align-center\'>\n    {{money price/}}\n  <\/div>\n  <div class=\'col1of5 line-col line-actions padding-right-xs\'>\n    <a class=\'button white text-ellipsis\' href=\'{{>url(\'edit\')}}\'>\n      {{jed \"Edit Option\"/}}\n    <\/a>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/approval_failed_modal", "<div class=\'modal medium hide fade ui-modal padding-inset-m padding-horizontal-l\' role=\'dialog\' tabindex=\'-1\'>\n  <form>\n    <div class=\'row padding-vertical-m\'>\n      <div class=\'col1of2\'>\n        <h3 class=\'headline-l\'>{{jed \"Approval failed\"/}}<\/h3>\n        <h3 class=\'headline-s light\'>\n          {{>user().firstname}}\n          {{>user().lastname}}\n        <\/h3>\n      <\/div>\n      <div class=\'col1of2\'>\n        <div class=\'float-right\'>\n          <a aria-hidden=\'true\' class=\'modal-close weak\' data-dismiss=\'modal\' title=\'{{jed \"close dialog\"/}}\' type=\'button\'>\n            {{jed \"Cancel\"/}}\n          <\/a>\n          {{if ~accessRight.atLeastRole(~currentUserRole, \"lending_manager\") }}\n          <div class=\'multibutton\'>\n            <a class=\'button white text-ellipsis\' href=\'/manage/{{current_inventory_pool_id/}}/orders/{{>id}}/edit\'>\n              {{jed \"Edit Order\"/}}\n            <\/a>\n            <div class=\'dropdown-holder inline-block\'>\n              <div class=\'button white dropdown-toggle\'>\n                <div class=\'arrow down\'><\/div>\n              <\/div>\n              <ul class=\'dropdown right\'>\n                <li>\n                  <a class=\'dropdown-item\' data-approve-anyway>\n                    <i class=\'fa fa-thumbs-up\'><\/i>\n                    {{jed \"Approve anyway\"/}}\n                  <\/a>\n                <\/li>\n              <\/ul>\n            <\/div>\n          <\/div>\n          {{else}}\n          <a class=\'button white text-ellipsis\' href=\'/manage/{{current_inventory_pool_id/}}/orders/{{>id}}/edit\'>\n            {{jed \"Edit Order\"/}}\n          <\/a>\n          {{/if}}\n        <\/div>\n      <\/div>\n    <\/div>\n    <div class=\'row margin-top-m\'>\n      <div class=\'separated-bottom padding-bottom-m margin-bottom-m\'>\n        <div class=\'row margin-bottom-s emboss red padding-inset-s\'>\n          <p class=\'paragraph-s\'>\n            <strong>{{>error}}<\/strong>\n          <\/p>\n        <\/div>\n      <\/div>\n      <div class=\'modal-body\'>\n        {{for groupedLinesByDateRange(true)}}\n        <div class=\'padding-bottom-m margin-bottom-m no-last-child-margin\'>\n          <div class=\'row margin-bottom-s\'>\n            <div class=\'col1of2\'>\n              <p>\n                {{date start_date/}}\n                -\n                {{date end_date/}}\n              <\/p>\n            <\/div>\n            <div class=\'col1of2 text-align-right\'>\n              <strong>{{diffDatesInDays start_date end_date/}}<\/strong>\n            <\/div>\n          <\/div>\n          {{for reservations}}\n          <div class=\'row\'>\n            <div class=\'col1of8 text-align-center\'>\n              <div class=\'paragraph-s\'>\n                {{if subreservations}}\n                {{sum subreservations \"quantity\"/}}\n                {{else}}\n                {{> quantity}}\n                {{/if}}\n              <\/div>\n            <\/div>\n            <div class=\'col7of8\'>\n              <div class=\'paragraph-s\'>\n                <strong>{{>model().name()}}<\/strong>\n              <\/div>\n            <\/div>\n          <\/div>\n          {{/for}}\n        <\/div>\n        {{/for}}\n      <\/div>\n    <\/div>\n    <div class=\'row separated-top padding-top-m\'>\n      <div class=\'col1of1 padding-bottom-s\'>\n        <p>{{jed \"Write a comment... (your comment will be part of the confirmation e-mail)\"/}}<\/p>\n      <\/div>\n      <textarea autofocus=\'autofocus\' class=\'col1of1 height-s\' id=\'comment\' name=\'comment\'>{{>~comment}}<\/textarea>\n    <\/div>\n  <\/form>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/approve_with_comment_modal", "<div class=\'modal medium hide fade ui-modal padding-inset-m padding-horizontal-l\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'row padding-vertical-m\'>\n    <div class=\'col1of2\'>\n      <h3 class=\'headline-l\'>{{jed \"Approve order\"/}}<\/h3>\n      <h3 class=\'headline-s light\'>\n        {{>user().firstname}}\n        {{>user().lastname}}\n      <\/h3>\n    <\/div>\n    <div class=\'col1of2\'>\n      <div class=\'float-right\'>\n        <a aria-hidden=\'true\' class=\'modal-close weak\' data-dismiss=\'modal\' title=\'{{jed \"close dialog\"/}}\' type=\'button\'>\n          {{jed \"Cancel\"/}}\n        <\/a>\n        <button class=\'button green text-ellipsis\' data-id=\'{{>id}}\' data-order-approve>\n          <i class=\'fa fa-thumbs-up\'><\/i>\n          {{jed \"Approve\"/}}\n        <\/button>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'row margin-top-m\'>\n    <div class=\'modal-body\'>\n      {{for groupedLinesByDateRange(true)}}\n      <div class=\'padding-bottom-m margin-bottom-m no-last-child-margin\'>\n        <div class=\'row margin-bottom-s\'>\n          <div class=\'col1of2\'>\n            <p>\n              {{date start_date/}}\n              -\n              {{date end_date/}}\n            <\/p>\n          <\/div>\n          <div class=\'col1of2 text-align-right\'>\n            <strong>{{diffDatesInDays start_date end_date/}}<\/strong>\n          <\/div>\n        <\/div>\n        {{for reservations}}\n        <div class=\'row\'>\n          <div class=\'col1of8 text-align-center\'>\n            <div class=\'paragraph-s\'>\n              {{if subreservations}}\n              {{sum subreservations \"quantity\"/}}\n              {{else}}\n              {{> quantity}}\n              {{/if}}\n            <\/div>\n          <\/div>\n          <div class=\'col7of8\'>\n            <div class=\'paragraph-s\'>\n              <strong>{{>model().name()}}<\/strong>\n            <\/div>\n          <\/div>\n        <\/div>\n        {{/for}}\n      <\/div>\n      {{/for}}\n    <\/div>\n  <\/div>\n  <div class=\'row separated-top padding-top-m\'>\n    <div class=\'col1of1 padding-bottom-s\'>\n      <p>{{jed \"Write a comment... (your comment will be part of the confirmation e-mail)\"/}}<\/p>\n    <\/div>\n    <textarea autofocus=\'autofocus\' class=\'col1of1 height-s\' id=\'comment\' name=\'comment\'><\/textarea>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/approved_button", "<div class=\'padding-inset-s inline-block\' title=\'{{jed \'Order approved\'/}}\'>\n  <i class=\'fa fa-thumbs-up\'><\/i>\n<\/div>\n<a class=\'button white\' href=\'{{>url(\'hand_over\')}}\'>\n  <i class=\'fa fa-mail-forward\'><\/i>\n  {{jed \'Hand Over\'/}}\n<\/a>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/edit/contact_person", "<div class=\'row padding-vertical-m\' id=\'contact-person\'>\n  <div class=\'row emboss padding-inset-m\'>\n    <div class=\'col4of9 text-align-center\' id=\'swapped-person\'>\n      <input autocomplete=\'off\' class=\'width-m\' id=\'user-id\' placeholder=\'{{jed \'Contact person\'/}} {{jed \'Name / ID\'/}}\' type=\'text\'>\n      <div id=\'selected-user\'><\/div>\n    <\/div>\n    <div class=\'col1of9 text-align-center\'>\n      <i class=\'fa fa-exchange icon-xxl\'><\/i>\n    <\/div>\n    <div class=\'col4of9 text-align-center\'>\n      {{if delegatedUser()}}\n      <p class=\'paragraph-s padding-top-xxs margin-top-xxs\'>\n        <strong>\n          {{>delegatedUser().firstname}}\n          {{>delegatedUser().lastname}}\n        <\/strong>\n      <\/p>\n      {{/if}}\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/edit/purpose_modal", "<div class=\'modal medium hide fade ui-modal padding-inset-m padding-horizontal-l\' role=\'dialog\' tabindex=\'-1\'>\n  <form>\n    <div class=\'row padding-vertical-m\'>\n      <div class=\'col1of2\'>\n        <h3 class=\'headline-l\'>{{jed \"Edit Purpose\"/}}<\/h3>\n      <\/div>\n      <div class=\'col1of2\'>\n        <div class=\'float-right\'>\n          <a aria-hidden=\'true\' class=\'modal-close weak\' data-dismiss=\'modal\' title=\'{{jed \"close dialog\"/}}\' type=\'button\'>\n            {{jed \"Cancel\"/}}\n          <\/a>\n          <button class=\'button white text-ellipsis\' type=\'submit\'>\n            {{jed \"Save\"/}}\n          <\/button>\n        <\/div>\n      <\/div>\n    <\/div>\n    <div class=\'padding-vertical-m hidden\' id=\'errors\'>\n      <div class=\'row emboss red text-align-center font-size-m padding-inset-s\'>\n        <strong><\/strong>\n      <\/div>\n    <\/div>\n    <div class=\'row padding-top-m\'>\n      <textarea autofocus=\'autofocus\' class=\'col1of1 height-s\' name=\'purpose\'>{{>description}}<\/textarea>\n    <\/div>\n  <\/form>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/edit/swap_user_modal", "<div class=\'modal medium hide fade ui-modal padding-inset-m padding-horizontal-l\' role=\'dialog\' tabindex=\'-1\'>\n  <form>\n    <div class=\'row padding-vertical-m\'>\n      <div class=\'col1of2\'>\n        <h3 class=\'headline-l\'>{{jed \"Change orderer\"/}}<\/h3>\n      <\/div>\n      <div class=\'col1of2\'>\n        <div class=\'float-right\'>\n          <a aria-hidden=\'true\' class=\'modal-close weak\' data-dismiss=\'modal\' title=\'{{jed \"close dialog\"/}}\' type=\'button\'>\n            {{jed \"Cancel\"/}}\n          <\/a>\n          <button class=\'button white text-ellipsis\' type=\'submit\'>\n            {{jed \"Change orderer\"/}}\n          <\/button>\n        <\/div>\n      <\/div>\n    <\/div>\n    <div class=\'padding-vertical-m hidden\' id=\'errors\'>\n      <div class=\'row emboss red text-align-center font-size-m padding-inset-s\'>\n        <strong><\/strong>\n      <\/div>\n    <\/div>\n    <div class=\'row padding-vertical-m\' id=\'user\'>\n      <div class=\'row emboss padding-inset-m\'>\n        <div class=\'col4of9 text-align-center\' id=\'swapped-person\'>\n          <input autocomplete=\'off\' autofocus=\'autofocus\' class=\'width-m\' data-barcode-scanner-target data-prevent-barcode-scanner-submit id=\'user-id\' placeholder=\'{{jed \'Name / ID\'/}}\' type=\'text\'>\n          <div id=\'selected-user\'><\/div>\n        <\/div>\n        <div class=\'col1of9 text-align-center\'>\n          <i class=\'fa fa-exchange icon-xxl\'><\/i>\n        <\/div>\n        <div class=\'col4of9 text-align-center\'>\n          <p class=\'paragraph-s padding-top-xxs margin-top-xxs\'>\n            <strong>\n              {{>firstname}}\n              {{>lastname}}\n            <\/strong>\n          <\/p>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/form>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/edit/swapped_user", "<div class=\'emboss white padding-inset-xxs\'>\n  <div class=\'row\'>\n    <p class=\'paragraph-s\'>\n      <strong>\n        {{>firstname}}\n        {{>lastname}}\n      <\/strong>\n    <\/p>\n    <div class=\'position-absolute-topright padding-inset-xxs\'>\n      <a class=\'grey padding-inset-xxs\' id=\'remove-user\'>\n        <i class=\'fa fa-times-circle icon-m\'><\/i>\n      <\/a>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-type=\'order\'>\n  {{include tmpl=\"manage/views/orders/line_\"+state /}}\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/line_approved", "{{partial \'manage/views/users/cell\' user() \'{\"grid\":\"col1of8\"}\'/}}\n<div class=\'col1of8 line-col\'>{{diffToday created_at/}}<\/div>\n<div class=\'col1of8 line-col text-align-center\' data-type=\'lines-cell\'>{{include tmpl=\'manage/views/reservations/cell\'/}}<\/div>\n<div class=\'col1of8 line-col\'>\n  {{>getMaxRange()}}\n  {{jed getMaxRange() \"day\" \"days\"/}}\n<\/div>\n<div class=\'col2of8 line-col text-align-left\'>\n  <strong>{{jed \"Approved\"/}}<\/strong>\n<\/div>\n<div class=\'col2of8 line-col line-actions\'>\n  <a class=\'button white text-ellipsis\' href=\'{{>user().url(\'hand_over\')}}\'>\n    {{if ~accessRight.atLeastRole(~currentUserRole, \"lending_manager\") }}\n    <i class=\'fa fa-mail-forward\'><\/i>\n    {{jed \"Hand Over\"/}}\n    {{else}}\n    {{jed \"Edit\"/}}\n    {{/if}}\n  <\/a>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/line_closed", "{{partial \'manage/views/users/cell\' user() \'{\"grid\":\"col1of8\"}\'/}}\n<div class=\'col1of8 line-col\'>{{diffToday created_at/}}<\/div>\n<div class=\'col1of8 line-col text-align-center\' data-type=\'lines-cell\'>{{include tmpl=\'manage/views/reservations/cell\'/}}<\/div>\n<div class=\'col1of8 line-col\'>\n  {{>getMaxRange()}}\n  {{jed getMaxRange() \"day\" \"days\"/}}\n<\/div>\n<div class=\'col2of8 line-col text-align-left\'>\n  <strong>{{jed \"Closed\"/}}<\/strong>\n  {{jed \"Contract\"/}}\n  {{>compact_id}}\n<\/div>\n<div class=\'col2of8 line-col line-actions\'>\n  <div class=\'multibutton\'>\n    <a class=\'button white text-ellipsis\' href=\'{{>url()}}\' target=\'_blank\'>\n      <i class=\'fa fa-file\'><\/i>\n      {{jed \"Contract\"/}}\n    <\/a>\n    <div class=\'dropdown-holder inline-block\'>\n      <div class=\'button white dropdown-toggle\'>\n        <div class=\'arrow down\'><\/div>\n      <\/div>\n      <ul class=\'dropdown right\'>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'value_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Value List\"/}}\n          <\/a>\n        <\/li>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'picking_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Picking List\"/}}\n          <\/a>\n        <\/li>\n      <\/ul>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/line_rejected", "{{partial \'manage/views/users/cell\' user() \'{\"grid\":\"col1of8\"}\'/}}\n<div class=\'col1of8 line-col\'>{{diffToday created_at/}}<\/div>\n<div class=\'col1of8 line-col text-align-center\' data-type=\'lines-cell\'>{{include tmpl=\'manage/views/reservations/cell\'/}}<\/div>\n<div class=\'col1of8 line-col\'>\n  {{>getMaxRange()}}\n  {{jed getMaxRange() \"day\" \"days\"/}}\n<\/div>\n<div class=\'col1of8 line-col text-align-left\'>\n  <strong>{{jed \"Rejected\"/}}<\/strong>\n<\/div>\n<div class=\'col3of8 line-col line-actions\' style=\'text-align: left\'>{{>reject_reason}}<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/line_signed", "{{partial \'manage/views/users/cell\' user() \'{\"grid\":\"col1of8\"}\'/}}\n<div class=\'col1of8 line-col\'>{{diffToday created_at/}}<\/div>\n<div class=\'col1of8 line-col text-align-center\' data-type=\'lines-cell\'>{{include tmpl=\'manage/views/reservations/cell\'/}}<\/div>\n<div class=\'col1of8 line-col\'>\n  {{>getMaxRange()}}\n  {{jed getMaxRange() \"day\" \"days\"/}}\n<\/div>\n<div class=\'col2of8 line-col text-align-left\'>\n  <strong>{{jed \"Signed\"/}}<\/strong>\n  {{jed \"Contract\"/}}\n  {{>compact_id}}\n<\/div>\n<div class=\'col2of8 line-col line-actions\'>\n  <div class=\'multibutton\'>\n    {{if ~accessRight.atLeastRole(~currentUserRole, \"lending_manager\") }}\n    <a class=\'button white text-ellipsis\' href=\'{{>user().url(\'take_back\')}}\'>\n      <i class=\'fa fa-mail-reply\'><\/i>\n      {{jed \"Take Back\"/}}\n    <\/a>\n    <div class=\'dropdown-holder inline-block\'>\n      <div class=\'button white dropdown-toggle\'>\n        <div class=\'arrow down\'><\/div>\n      <\/div>\n      <ul class=\'dropdown right\'>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url()}}\' target=\'_blank\'>\n            <i class=\'fa fa-file-alt\'><\/i>\n            {{jed \"Contract\"/}}\n          <\/a>\n        <\/li>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'value_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Value List\"/}}\n          <\/a>\n        <\/li>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'picking_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Picking List\"/}}\n          <\/a>\n        <\/li>\n      <\/ul>\n    <\/div>\n    {{else}}\n    <a class=\'button white text-ellipsis\' href=\'{{>url()}}\' target=\'_blank\'>\n      <i class=\'fa fa-file-alt\'><\/i>\n      {{jed \"Contract\"/}}\n    <\/a>\n    <div class=\'dropdown-holder inline-block\'>\n      <div class=\'button white dropdown-toggle\'>\n        <div class=\'arrow down\'><\/div>\n      <\/div>\n      <ul class=\'dropdown right\'>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'value_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Value List\"/}}\n          <\/a>\n        <\/li>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>url(\'picking_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Picking List\"/}}\n          <\/a>\n        <\/li>\n      <\/ul>\n    <\/div>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/line_submitted", "{{partial \'manage/views/users/cell\' user() \'{\"grid\":\"col1of8\"}\'/}}\n<div class=\'col1of8 line-col\'>{{diffToday created_at/}}<\/div>\n<div class=\'col1of8 line-col text-align-center\' data-type=\'lines-cell\'>{{include tmpl=\'manage/views/reservations/cell\'/}}<\/div>\n<div class=\'col1of8 line-col\'>\n  {{>getMaxRange()}}\n  {{jed getMaxRange() \"day\" \"days\"/}}\n<\/div>\n<div class=\'col2of8 line-col text-align-left\'>{{include tmpl=\'manage/views/purposes/cell\'/}}<\/div>\n<div class=\'col2of8 line-col line-actions line-actions-column\'>\n  <div class=\'multibutton\'>\n    <a class=\'button white text-ellipsis\' data-order-approve>\n      <i class=\'fa fa-thumbs-up\'><\/i>\n      {{if to_be_verified()}}\n      {{jed \"Verify\"/}} + {{jed \"Approve\"/}}\n      {{else}}\n      {{jed \"Approve\"/}}\n      {{/if}}\n    <\/a>\n    <div class=\'dropdown-holder inline-block\'>\n      <div class=\'button white dropdown-toggle\'>\n        <div class=\'arrow down\'><\/div>\n      <\/div>\n      <ul class=\'dropdown right\'>\n        <li>\n          <a class=\'dropdown-item\' href=\'{{>editPath()}}\'>\n            <i class=\'fa fa-edit\'><\/i>\n            {{jed \"Edit\"/}}\n          <\/a>\n        <\/li>\n        <li>\n          <a class=\'dropdown-item red\' data-order-reject>\n            <i class=\'fa fa-thumbs-down\'><\/i>\n            {{jed \"Reject\"/}}\n          <\/a>\n        <\/li>\n      <\/ul>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/reject_modal", "<div class=\'modal medium hide fade ui-modal padding-inset-m padding-horizontal-l\' role=\'dialog\' tabindex=\'-1\'>\n  <form action=\'/manage/{{current_inventory_pool_id/}}/orders/{{>id}}/reject\' method=\'post\'>\n    {{csrf_token/}}\n    <div class=\'row padding-vertical-m\'>\n      <div class=\'col1of2\'>\n        <h3 class=\'headline-l\'>{{jed \"Reject order\"/}}<\/h3>\n        <h3 class=\'headline-s light\'>\n          {{>user().firstname}}\n          {{>user().lastname}}\n        <\/h3>\n      <\/div>\n      <div class=\'col1of2\'>\n        <div class=\'float-right\'>\n          <a aria-hidden=\'true\' class=\'modal-close weak\' data-dismiss=\'modal\' title=\'{{jed \"close dialog\"/}}\' type=\'button\'>\n            {{jed \"Cancel\"/}}\n          <\/a>\n          <button class=\'button red\' type=\'submit\'>\n            <i class=\'fa fa-thumbs-down\'><\/i>\n            {{jed \'Reject\'/}}\n          <\/button>\n        <\/div>\n      <\/div>\n    <\/div>\n    <div class=\'row margin-top-m\'>\n      <div class=\'separated-bottom padding-bottom-m margin-bottom-m\'>\n        <div class=\'row margin-bottom-s emboss padding-inset-s\'>\n          <p class=\'paragraph-s\'>{{>concatenatedPurposes()}}<\/p>\n        <\/div>\n      <\/div>\n      <div class=\'modal-body\'>\n        {{for groupedLinesByDateRange(true)}}\n        <div class=\'padding-bottom-m margin-bottom-m no-last-child-margin\'>\n          <div class=\'row margin-bottom-s\'>\n            <div class=\'col1of2\'>\n              <p>\n                {{date start_date/}}\n                -\n                {{date end_date/}}\n              <\/p>\n            <\/div>\n            <div class=\'col1of2 text-align-right\'>\n              <strong>{{diffDatesInDays start_date end_date/}}<\/strong>\n            <\/div>\n          <\/div>\n          {{for reservations}}\n          <div class=\'row\'>\n            <div class=\'col1of8 text-align-center\'>\n              <div class=\'paragraph-s\'>\n                {{if subreservations}}\n                {{sum subreservations \"quantity\"/}}\n                {{else}}\n                {{> quantity}}\n                {{/if}}\n              <\/div>\n            <\/div>\n            <div class=\'col7of8\'>\n              <div class=\'paragraph-s\'>\n                <strong>{{>model().name()}}<\/strong>\n              <\/div>\n            <\/div>\n          <\/div>\n          {{/for}}\n        <\/div>\n        {{/for}}\n      <\/div>\n    <\/div>\n    <div class=\'row separated-top padding-top-m\'>\n      <div class=\'col1of1 padding-bottom-s\'>\n        <p>{{jed \"Write a comment. The comment will be part of the rejection e-mail.\"/}}<\/p>\n      <\/div>\n      <textarea autofocus=\'autofocus\' class=\'col1of1 height-s\' id=\'rejection-comment\' name=\'comment\'><\/textarea>\n    <\/div>\n  <\/form>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/orders/rejected_button", "{{jed \"Rejected\"/}}\n<i class=\'fa fa-thumbs-down\'><\/i>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/purposes/cell", "{{if concatenatedPurposes().length > 60}}\n<span class=\'tooltip\' data-tooltip-template=\'manage/views/purposes/tooltip\' title=\'{{>concatenatedPurposes()}}\'>\n  {{truncate concatenatedPurposes() 60 \"...\"/}}\n<\/span>\n{{else}}\n{{> concatenatedPurposes()}}\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/purposes/tooltip", "<div class=\'width-xl padding-inset-s\'>\n  <p class=\'paragraph-s\'>{{>content}}<\/p>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/add/adding", "<div class=\'emboss blue padding-inset-s\'>\n  <p class=\'paragraph-s\'>\n    <img class=\'margin-right-s max-width-micro\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n    <strong>\n      {{jed \"Adding item\"/}}\n    <\/strong>\n  <\/p>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/add/autocomplete_element", "<li class=\'separated-bottom exclude-last-child\'>\n  <a class=\'row{{if available}}{{else}} light-red{{/if}}\' title=\'{{>name}}\'>\n    <div class=\'row\'>\n      <div class=\'col3of4\' title=\'{{>name}}\'>\n        <strong class=\'wrap\'>\n          {{>name}}\n        <\/strong>\n      <\/div>\n      <div class=\'col1of4 text-align-right\'>\n        <div class=\'row\'>\n          {{if availability}}\n          {{>availability}}\n          {{/if}}\n        <\/div>\n        <div class=\'row\'>\n          <span class=\'grey-text\'>{{>type}}<\/span>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/assign/autocomplete_element", "<li class=\'separated-bottom exclude-last-child width-xl\'>\n  <a>\n    <div class=\'row\'>\n      <div class=\'col1of3\'>\n        <strong>\n          {{>inventoryCode}}\n        <\/strong>\n      <\/div>\n      <div class=\'col2of3 text-ellipsis\' title=\'{{>name}}\'>\n        <span class=\'grey-text\'>{{>name}}<\/span>\n      <\/div>\n    <\/div>\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/cell", "{{>quantity()}}\n{{jed quantity() \"Item\" \"Items\"/}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/explorative_add_dialog", "<div class=\'modal fade ui-modal medium\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'modal-header row padding-bottom-s\'>\n    <div class=\'col4of5\'>\n      <h2 class=\'headline-l\'>{{jed \'Models\'/}} {{jed \'by browsing categories\'/}}<\/h2>\n      <h3 class=\'headline-m light\'>({{date startDate/}} - {{date endDate/}})<\/h3>\n    <\/div>\n    <div class=\'col1of5 text-align-right\'>\n      <div class=\'modal-close\'>{{jed \"Cancel\"/}}<\/div>\n    <\/div>\n  <\/div>\n  <div class=\'modal-body separated-top\'>\n    <div class=\'table\'>\n      <div class=\'table-row\'>\n        <div class=\'col1of4 table-cell separated-right padding-inset-m\' id=\'categories\'>\n          <div class=\'row padding-inset-s\'>\n            <input autocomplete=\'off\' class=\'small\' id=\'category-search\' placeholder=\'{{jed \'Search category\'/}}\' type=\'text\'>\n          <\/div>\n          <div id=\'category-root\'><\/div>\n          <div id=\'category-current\'><\/div>\n          <div class=\'row padding-bottom-s\' id=\'category-list\'>\n            <div class=\'height-xs\'><\/div>\n            <img class=\'margin-horziontal-auto margin-top-xxl margin-bottom-xxl\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n          <\/div>\n        <\/div>\n        <div class=\'table-cell col3of4 list-of-lines even min-height-l\' id=\'models\'>\n          <div class=\'height-s\'><\/div>\n          <img class=\'margin-horziontal-auto margin-top-xxl margin-bottom-xxl\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n          <div class=\'height-s\'><\/div>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'modal-footer\'><\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/grouped_lines", "<div class=\'emboss deep padding-bottom-s margin-bottom-m\' data-selected-lines-container>\n  <div class=\'row\'>\n    <div class=\'col1of2 padding-vertical-s\'>\n      <label class=\'padding-inset-s inline\'>\n        <input autocomplete=\'off\' data-select-lines type=\'checkbox\'>\n      <\/label>\n      <p class=\'paragraph-s inline\'>\n        {{day start_date/}}\n        {{date start_date/}}\n        -\n        {{day end_date/}}\n        {{date end_date/}}\n      <\/p>\n    <\/div>\n    <div class=\'col1of2 padding-inset-s text-align-right\'>\n      <p class=\'paragraph-s inline\'>\n        {{diffDatesInDays start_date end_date/}}\n      <\/p>\n    <\/div>\n  <\/div>\n  <div class=\'row\'>\n    {{partial ~linePartial reservations #view.ctx/}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/grouped_lines_with_action_date", "<h3 class=\'headline-s padding-inset-s\'>\n  {{if ~moment(date).endOf(\"day\").diff(~moment().endOf(\"day\"), \"days\") == 0}}\n  <strong>{{jed \"Today\"/}}<\/strong>\n  {{else}}\n  {{day date/}}\n  {{date date/}}\n  {{/if}}\n<\/h3>\n{{partial \"manage/views/reservations/grouped_lines\" groups #view.ctx/}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/hand_over_line", "{{if model_id}}\n{{partial \'manage/views/reservations/hand_over_line/item_line\' #view.data #view.ctx/}}\n{{else option_id}}\n{{partial \'manage/views/reservations/hand_over_line/option_line\' #view.data #view.ctx/}}\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/hand_over_line/assigned_item", "<input autocomplete=\'off\' class=\'small width-full has-addon text-align-center\' data-assign-item disabled id=\'assigned-item-{{>id}}\' type=\'text\' value=\'{{>item().inventory_code}}\'>\n<label class=\'addon small transparent no-padding\' data-remove-assignment for=\'assigned-item-{{>id}}\'>\n  <span class=\'link grey padding-inset-xs vertical-align-middle\'>\n    <i class=\'fa fa-times-circle\'><\/i>\n  <\/span>\n<\/label>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/hand_over_line/item_line", "<div class=\'line light row focus-hover-thin\' data-id=\'{{>id}}\' data-line-type=\'item_line\'>\n  <div class=\'{{if ~renderAvailability && anyProblems()}}line-info red{{/if}}\'><\/div>\n  <div class=\'line-col padding-left-xs\'>\n    <div class=\'row\'>\n      <div class=\'col1of4\'>\n        <label class=\'padding-inset-s\'>\n          <input autocomplete=\'off\' data-select-line type=\'checkbox\'>\n        <\/label>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'col2of10 line-col text-align-center\'>\n    <div class=\'row\'>\n      {{if item()}}\n      {{partial \'manage/views/reservations/hand_over_line/assigned_item\' #view.data/}}\n      {{else}}\n      {{partial \'manage/views/reservations/hand_over_line/unassigned_item\' #view.data/}}\n      {{/if}}\n    <\/div>\n  <\/div>\n  <div class=\'col4of10 line-col text-align-left\'>\n    <strong class=\'test-fix-timeline\' data-id=\'{{>model().id}}\' data-type=\'model-cell\'>\n      {{>model().name()}}\n    <\/strong>\n    {{if item() && item().children().all().length}}\n    <ul style=\'font-size: 0.8em; list-style-type: disc; margin-left: 1.5em;\'>\n      {{for item().children().all()}}\n      <li>\n        {{>to_s}}\n      <\/li>\n      {{/for}}\n    <\/ul>\n    {{/if}}\n    {{if model().accessory_names && model().accessory_names.length}}\n    <br>\n    <span>{{>model().accessory_names}}<\/span>\n    {{/if}}\n    {{if model().hand_over_note}}\n    <br>\n    <span class=\'grey-text\'>{{>model().hand_over_note}}<\/span>\n    {{/if}}\n  <\/div>\n  <div class=\'col1of10 line-col text-align-center\'>\n    {{if order()}}\n    <div class=\'tooltip\' data-tooltip-template=\'manage/views/purposes/tooltip\' title=\'{{>order().purpose}}\'>\n      <i class=\'fa fa-comment grey\'><\/i>\n    <\/div>\n    {{/if}}\n  <\/div>\n  <div class=\'col1of10 line-col text-align-center\'>\n    {{if ~renderAvailability && anyProblems()}}\n    <div class=\'emboss red padding-inset-xxs-alt text-align-center tooltip\' data-tooltip-data=\'{{JSON getProblems()/}}\' data-tooltip-template=\'manage/views/reservations/problems_tooltip\'>\n      <strong>{{>getProblems().length}}<\/strong>\n    <\/div>\n    {{/if}}\n  <\/div>\n  <div class=\'col2of10 line-col line-actions padding-left-xxs padding-right-s\'>\n    <div class=\'multibutton\'>\n      <button class=\'button white text-ellipsis\' data-edit-lines data-ids=\'{{JSON [id]/}}\'>{{jed \"Change entry\"/}}<\/button>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' data-model-id=\'{{>model().id}}\' data-open-time-line>\n              <i class=\'fa fa-align-left\'><\/i>\n              {{jed \"Timeline\"/}}\n            <\/a>\n          <\/li>\n          <li>\n            <a class=\'dropdown-item\' data-swap-model>\n              <i class=\'fa fa-exchange\'><\/i>\n              {{jed \"Swap Model\"/}}\n            <\/a>\n          <\/li>\n          <li>\n            <a class=\'dropdown-item red\' data-destroy-line>\n              <i class=\'fa fa-trash\'><\/i>\n              {{jed \"Delete\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/hand_over_line/option_line", "<div class=\'line light row focus-hover-thin\' data-id=\'{{>id}}\' data-line-type=\'option_line\'>\n  <div class=\'line-info{{if ~renderAvailability && anyProblems()}} red{{/if}}\'><\/div>\n  <div class=\'line-col padding-left-xs\'>\n    <div class=\'row\'>\n      <div class=\'col1of4\'>\n        <label class=\'padding-inset-s\'>\n          <input autocomplete=\'off\' data-select-line type=\'checkbox\'>\n        <\/label>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'col1of10 line-col\'>\n    <input class=\'small width-full text-align-center\' data-line-quantity type=\'text\' value=\'{{>quantity}}\'>\n  <\/div>\n  <div class=\'col1of10 line-col text-align-center\'>\n    <span class=\'grey-text\'>{{>option().inventory_code}}<\/span>\n  <\/div>\n  <div class=\'col4of10 line-col text-align-left\'>\n    <strong class=\'test-fix-timeline\'>{{>option().name()}}<\/strong>\n  <\/div>\n  <div class=\'col1of10 line-col text-align-center\'>\n    {{if order()}}\n    <div class=\'tooltip\' data-tooltip-template=\'manage/views/purposes/tooltip\' title=\'{{>order().purpose}}\'>\n      <i class=\'fa fa-comment grey\'><\/i>\n    <\/div>\n    {{/if}}\n  <\/div>\n  <div class=\'col1of10 line-col text-align-center\'>\n    {{if ~renderAvailability && anyProblems()}}\n    <div class=\'emboss red padding-inset-xxs-alt text-align-center tooltip\' data-tooltip-data=\'{{JSON getProblems()/}}\' data-tooltip-template=\'manage/views/reservations/problems_tooltip\'>\n      <strong>{{>getProblems().length}}<\/strong>\n    <\/div>\n    {{else ~renderAvailability && !anyProblems()}}\n    <div class=\'padding-inset-xxs-alt text-align-center\'>\n      <i class=\'fa fa-check\'><\/i>\n    <\/div>\n    {{/if}}\n  <\/div>\n  <div class=\'col2of10 line-col line-actions padding-left-xxs padding-right-s\'>\n    <div class=\'multibutton\'>\n      <button class=\'button white text-ellipsis\' data-edit-lines data-ids=\'{{JSON [id]/}}\'>{{jed \'Change entry\'/}}<\/button>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' data-model-id=\'{{>model().id}}\' data-open-time-line>\n              <i class=\'fa fa-align-left\'><\/i>\n              {{jed \"Timeline\"/}}\n            <\/a>\n          <\/li>\n          <li>\n            <a class=\'dropdown-item red\' data-destroy-line>\n              <i class=\'fa fa-trash\'><\/i>\n              {{jed \"Delete\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/hand_over_line/unassigned_item", "<form data-assign-item-form>\n  <input autocomplete=\'off\' class=\'small width-full has-addon text-align-center\' data-assign-item id=\'assigned-item-{{>id}}\' type=\'text\'>\n  <label class=\'addon small transparent padding-right-s\' for=\'assigned-item-{{>id}}\'>\n    <div class=\'arrow down\'><\/div>\n  <\/label>\n<\/form>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/order_line", "<div class=\'order-line line light row focus-hover-thin\' data-ids=\'{{JSON ids/}}\'>\n  <div class=\'line-info{{if ~renderAvailability && anyProblems()}} red{{/if}}\'><\/div>\n  <div class=\'line-col padding-left-xs\'>\n    <div class=\'row\'>\n      <div class=\'col1of4\'>\n        <label class=\'padding-inset-s\'>\n          <input autocomplete=\'off\' data-select-line type=\'checkbox\'>\n        <\/label>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'col1of10 line-col text-align-center\'>\n    <span>\n      {{if subreservations}}\n      {{sum subreservations \"quantity\"/}}\n      {{else}}\n      {{>quantity}}\n      {{/if}}\n    <\/span>\n    {{if ~renderAvailability}}\n    <span class=\'grey-text\'>\n      /\n      {{if subreservations}}\n      {{>model().availability().withoutLines(subreservations).maxAvailableForGroups(start_date, end_date, user().groupIds)}}\n      {{else}}\n      {{>model().availability().withoutLines([#view.data]).maxAvailableForGroups(start_date, end_date, user().groupIds)}}\n      {{/if}}\n    <\/span>\n    {{/if}}\n  <\/div>\n  <div class=\'col6of10 line-col text-align-left\'>\n    <strong class=\'test-fix-timeline\' data-id=\'{{>model().id}}\' data-type=\'model-cell\'>\n      {{>model().name()}}\n    <\/strong>\n  <\/div>\n  <div class=\'col1of10 line-col text-align-left padding-horizontal-m\'>\n    {{if ~renderAvailability && anyProblems()}}\n    <div class=\'emboss red padding-inset-xxs-alt text-align-center tooltip\' data-tooltip-data=\'{{JSON getProblems()/}}\' data-tooltip-template=\'manage/views/reservations/problems_tooltip\'>\n      <strong>{{>getProblems().length}}<\/strong>\n    <\/div>\n    {{/if}}\n  <\/div>\n  <div class=\'col2of10 line-col line-actions\'>\n    <div class=\'multibutton\'>\n      <button class=\'button white text-ellipsis\' data-edit-lines data-ids=\'{{JSON ids/}}\'>\n        {{jed \"Change entry\"/}}\n      <\/button>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' data-model-id=\'{{>model_id}}\' data-open-time-line>\n              <i class=\'fa fa-align-left\'><\/i>\n              {{jed \"Timeline\"/}}\n            <\/a>\n          <\/li>\n          <li>\n            <a class=\'dropdown-item\' data-swap-model>\n              <i class=\'fa fa-exchange\'><\/i>\n              {{jed \"Swap Model\"/}}\n            <\/a>\n          <\/li>\n          <li>\n            <a class=\'dropdown-item red\' data-destroy-lines data-ids=\'{{JSON ids/}}\'>\n              <i class=\'fa fa-trash\'><\/i>\n              {{jed \"Delete\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/problems_tooltip", "<div class=\'width-m\'>\n  {{for content}}\n  <div class=\'padding-vertical-xxs\'>\n    <div class=\'padding-inset-s emboss\'>\n      <strong class=\'font-size-m\'>{{>message}}<\/strong>\n    <\/div>\n  <\/div>\n  {{/for}}\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/removing", "<div class=\'emboss blue padding-inset-s\'>\n  <p class=\'paragraph-s\'>\n    <img class=\'margin-right-s max-width-micro\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n    <strong>\n      {{jed \"Removing items\"/}}\n    <\/strong>\n  <\/p>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/take_back_line", "{{if model_id}}\n{{partial \'manage/views/reservations/take_back_line/item_line\' #view.data #view.ctx/}}\n{{else option_id}}\n{{partial \'manage/views/reservations/take_back_line/option_line\' #view.data #view.ctx/}}\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/take_back_line/item_line", "<div class=\'line light row focus-hover-thin\' data-id=\'{{>id}}\' data-line-type=\'item_line\'>\n  <div class=\'line-info{{if ~renderAvailability && anyProblems()}} red{{/if}}\'><\/div>\n  <div class=\'line-col padding-left-xs\'>\n    <div class=\'row\'>\n      <div class=\'col1of4\'>\n        <label class=\'padding-inset-s\'>\n          <input autocomplete=\'off\' data-select-line type=\'checkbox\'>\n        <\/label>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'col2of10 line-col text-align-center\'>\n    <div class=\'row\'>{{>item().inventory_code}}<\/div>\n  <\/div>\n  <div class=\'col4of10 line-col text-align-left\'>\n    <strong class=\'test-fix-timeline\' data-id=\'{{>model().id}}\' data-type=\'model-cell\'>\n      {{>model().name()}}\n    <\/strong>\n    {{if model().accessory_names && model().accessory_names.length}}\n    <br>\n    <span>{{>model().accessory_names}}<\/span>\n    {{/if}}\n  <\/div>\n  <div class=\'col1of10 line-col text-align-center\'>\n    <div class=\'tooltip\' data-tooltip-template=\'manage/views/purposes/tooltip\' title=\'{{>contract().purpose}}\'>\n      <i class=\'fa fa-comment grey\'><\/i>\n    <\/div>\n  <\/div>\n  <div class=\'col1of10 line-col text-align-center\'>\n    {{if ~renderAvailability && anyProblems()}}\n    <div class=\'emboss red padding-inset-xxs-alt text-align-center tooltip\' data-tooltip-data=\'{{JSON getProblems()/}}\' data-tooltip-template=\'manage/views/reservations/problems_tooltip\'>\n      <strong>{{>getProblems().length}}<\/strong>\n    <\/div>\n    {{else ~renderAvailability && !anyProblems() && item()}}\n    <div class=\'padding-inset-xxs-alt text-align-center\'>\n      <i class=\'fa fa-check\'><\/i>\n    <\/div>\n    {{/if}}\n  <\/div>\n  <div class=\'col2of10 line-col line-actions padding-left-xxs padding-right-s\'>\n    <div class=\'multibutton\'>\n      <button class=\'button white text-ellipsis\' data-edit-lines data-ids=\'{{JSON [id]/}}\'>{{jed \"Change entry\"/}}<\/button>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' href=\'{{>contract().url()}}\' target=\'_blank\'>\n              <i class=\'fa fa-file-alt\'><\/i>\n              {{jed \"Contract\"/}}\n              {{>contract().compact_id}}\n            <\/a>\n          <\/li>\n          <li>\n            <a class=\'dropdown-item\' data-model-id=\'{{>model().id}}\' data-open-time-line>\n              <i class=\'fa fa-align-left\'><\/i>\n              {{jed \"Timeline\"/}}\n            <\/a>\n          <\/li>\n          <li>\n            <a class=\'dropdown-item\' data-inspect-item data-item-id=\'{{>item_id}}\'>\n              <i class=\'fa fa-search\'><\/i>\n              {{jed \"Inspect\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/take_back_line/option_line", "<div class=\'line light row focus-hover-thin\' data-id=\'{{>id}}\' data-line-type=\'option_line\'>\n  <div class=\'line-info{{if ~renderAvailability && anyProblems()}} red{{/if}}\'><\/div>\n  <div class=\'line-col padding-left-xs\'>\n    <div class=\'row\'>\n      <div class=\'col1of4\'>\n        <label class=\'padding-inset-s\'>\n          <input autocomplete=\'off\' data-select-line type=\'checkbox\'>\n        <\/label>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'col1of10 line-col\'>\n    <div class=\'row table\'>\n      <div class=\'table-row\'>\n        <div class=\'col2of3 table-cell vertical-align-middle line-height-xxl\'>\n          <input autocomplete=\'off\' class=\'small width-full text-align-center\' data-quantity-returned inputmode=\'numeric\' type=\'text\'>\n        <\/div>\n        <div class=\'col1of3 table-cell vertical-align-middle line-height-xxl\'>\n          <span>/{{>quantity}}<\/span>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'col1of10 line-col text-align-center\'>\n    <span class=\'grey-text\'>{{>option().inventory_code}}<\/span>\n  <\/div>\n  <div class=\'col4of10 line-col text-align-left\'>\n    <strong class=\'test-fix-timeline\'>{{>option().name()}}<\/strong>\n  <\/div>\n  <div class=\'col1of10 line-col text-align-center\'>\n    <div class=\'tooltip\' data-tooltip-template=\'manage/views/purposes/tooltip\' title=\'{{>contract().purpose}}\'>\n      <i class=\'fa fa-comment grey\'><\/i>\n    <\/div>\n  <\/div>\n  <div class=\'col1of10 line-col text-align-center\'>\n    {{if ~renderAvailability && anyProblems()}}\n    <div class=\'emboss red padding-inset-xxs-alt text-align-center tooltip\' data-tooltip-data=\'{{JSON getProblems()/}}\' data-tooltip-template=\'manage/views/reservations/problems_tooltip\'>\n      <strong>{{>getProblems().length}}<\/strong>\n    <\/div>\n    {{else ~renderAvailability && !anyProblems()}}\n    <div class=\'padding-inset-xxs-alt text-align-center\'>\n      <i class=\'fa fa-check\'><\/i>\n    <\/div>\n    {{/if}}\n  <\/div>\n  <div class=\'col2of10 line-col line-actions padding-left-xxs padding-right-s\'>\n    <div class=\'multibutton\'>\n      <button class=\'button white text-ellipsis\' data-edit-lines data-ids=\'{{JSON [id]/}}\'>{{jed \"Change entry\"/}}<\/button>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' href=\'{{>contract().url()}}\' target=\'_blank\'>\n              <i class=\'fa fa-file-alt\'><\/i>\n              {{jed \"Contract\"/}}\n              {{>contract().compact_id}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/reservations/tooltip", "<div class=\'min-width-l\'>\n  {{for groupedLinesByDateRange(true)}}\n  <div class=\'exclude-last-child padding-bottom-m margin-bottom-m no-last-child-margin\'>\n    <div class=\'row margin-bottom-s\'>\n      <div class=\'col1of2\'>\n        <span>\n          {{date start_date/}}\n          -\n          {{date end_date/}}\n        <\/span>\n      <\/div>\n      <div class=\'col1of2 text-align-right\'>\n        <strong>{{diffDatesInDays start_date end_date/}}<\/strong>\n      <\/div>\n    <\/div>\n    {{for reservations}}\n    <div class=\'row padding-top-xs\'>\n      <div class=\'col1of8 text-align-center\'>\n        <div class=\'paragraph-s line-height-s\'>\n          {{if ~quantity}}\n          {{>~quantity}}\n          {{else subreservations}}\n          {{sum subreservations \"quantity\"/}}\n          {{else}}\n          {{>quantity}}\n          {{/if}}\n        <\/div>\n      <\/div>\n      <div class=\'col7of8\'>\n        <div class=\'paragraph-s line-height-s text-ellipsis width-full padding-right-s\'>\n          <strong>{{>model().name()}}<\/strong>\n        <\/div>\n      <\/div>\n    <\/div>\n    {{/for}}\n  <\/div>\n  {{/for}}\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/software/line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-is_package=\'{{>is_package}}\' data-type=\'model\'>\n  <div class=\'col1of10 line-col text-align-center no-padding\'>\n    <div class=\'table\'>\n      <div class=\'table-row\'>\n        <div class=\'table-cell vertical-align-middle\'>\n          <img class=\'max-width-xxs max-height-xxs\' src=\'/models/{{>id}}/image_thumb\'>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'col4of10 line-col text-align-left\'>\n    {{if is_package}}\n    <div class=\'grey-text\'>{{jed \'Package\'/}}<\/div>\n    {{/if}}\n    <strong class=\'test-fix-timeline\'>\n      {{> name()}}\n    <\/strong>\n  <\/div>\n  <div class=\'col3of10 line-col text-align-center\'>\n    <span title=\'{{jed \'in stock\'/}}\'>{{> availability().in_stock}}<\/span>\n    /\n    <span title=\'{{jed \'rentable\'/}}\'>{{> availability().total_rentable}}<\/span>\n  <\/div>\n  <div class=\'col2of8 line-col line-actions padding-right-xs\'>\n    <div class=\'multibutton width-full text-align-right\'>\n      <a class=\'button white text-ellipsis col4of5 negative-margin-right-xxs\' href=\'{{>url(\'edit\')}}\' title=\'{{jed \'Edit Software\'/}}\'>\n        {{jed \"Edit Software\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block col1of5\'>\n        <div class=\'button white dropdown-toggle width-full no-padding text-align-center\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' data-model-id=\'{{>id}}\' data-open-time-line>\n              <i class=\'fa fa-align-left\'><\/i>\n              {{jed \"Timeline\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function() {
  $.views.tags({
    current_inventory_pool_id: function() {
      return App.InventoryPool.current.id;
    }
  });

}).call(this);
(function() {
  $.views.tags({
    dailyPath: function() {
      return App.InventoryPool.current.url("daily");
    }
  });

}).call(this);
(function($) {$.views.templates("manage/views/take_backs/line", "<div class=\'line row focus-hover-thin\' data-id=\'{{>id}}\' data-type=\'take_back\'>\n  {{if isOverdue()}}\n  <div class=\'line-info red\'><\/div>\n  {{/if}}\n  {{partial \'manage/views/users/cell\' user() \'{\"grid\":\"col1of5\"}\'/}}\n  <div class=\'col1of5 line-col\'>\n    {{if isOverdue()}}\n    <strong>{{diffToday date/}}<\/strong>\n    {{else}}\n    {{diffToday date/}}\n    {{/if}}\n  <\/div>\n  <div class=\'col1of5 line-col text-align-center\' data-type=\'lines-cell\'>{{include tmpl=\'manage/views/reservations/cell\'/}}<\/div>\n  {{if isOverdue()}}\n  <div class=\'col1of5 line-col latest-reminder-cell text-align-center\' data-user-id=\'{{>user().id}}\' data-visit-id=\'{{>id}}\'>\n    {{jed \"Latest reminder\"/}}\n    <i class=\'fa fa-envelope-alt\'><\/i>\n  <\/div>\n  {{else}}\n  <div class=\'col1of5 line-col text-align-center\'>\n    {{>getMaxRange()}}\n    {{jed getMaxRange() \"day\" \"days\"/}}\n  <\/div>\n  {{/if}}\n  <div class=\'col1of5 line-col line-actions\'>\n    {{if isOverdue()}}\n    <div class=\'multibutton\'>\n      <a class=\'button white text-ellipsis\' href=\'/manage/{{>inventory_pool_id}}/users/{{>user().id}}/take_back\'>\n        <i class=\'fa fa-mail-reply\'><\/i>\n        {{jed \"Take Back\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' data-send-takeback-reminder data-user-id=\'{{>user().id}}\'>\n              <i class=\'fa fa-envelope\'><\/i>\n              {{jed \"Send reminder\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n    {{else}}\n    <a class=\'button white text-ellipsis\' href=\'/manage/{{>inventory_pool_id}}/users/{{>user().id}}/take_back\'>\n      <i class=\'fa fa-mail-reply\'><\/i>\n      {{jed \"Take Back\"/}}\n    <\/a>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/take_backs/reminder_send", "<strong>{{jed \"Reminder sent\"/}}<\/strong>\n<i class=\'fa fa-envelope\'><\/i>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/templates/models/autocomplete_element", "<li class=\'separated-bottom exclude-last-child\'>\n  <a>\n    <div class=\'row\'>\n      {{>name()}}\n    <\/div>\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/templates/models/model_allocation_entry", "<div class=\'row line font-size-xs\' data-new data-type=\'inline-entry\'>\n  <input name=\'template[model_links_attributes][][model_id]\' type=\'hidden\' value=\'{{>id}}\'>\n  <div class=\'line-col col2of6 no-padding\'>\n    <div class=\'line-col col1of2\' data-quantities>\n      <input autocomplete=\'off\' class=\'width-full small text-align-center\' max=\'{{>availability().total_rentable}}\' min=\'1\' name=\'template[model_links_attributes][][quantity]\' type=\'text\' value=\'1\'>\n    <\/div>\n    <div class=\'line-col col1of2 padding-left-xs text-align-left\' data-quantities>\n      / {{>availability().total_rentable}}\n    <\/div>\n  <\/div>\n  <div class=\'line-col col3of6 text-align-left\' data-model-name>\n    {{>name()}}\n  <\/div>\n  <div class=\'line-col col1of6 text-align-right\'>\n    <button class=\'button inset small\' data-remove>{{jed \"Remove\"/}}<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/templates/upload/image_inline_entry", "<div class=\'row line font-size-xs focus-hover-thin\' data-new data-type=\'inline-entry\'>\n  <div class=\'line-col text-align-center\' title=\'{{jed \'File has to be uploaded on save\'/}}\'>\n    <i class=\'fa fa-cloud-upload\'><\/i>\n  <\/div>\n  <div class=\'line-col col1of10 text-align-center\'>\n    <img class=\'max-height-xxs max-width-xxs\'>\n  <\/div>\n  <div class=\'line-col col6of10 text-align-left\'>\n    {{>name}}\n  <\/div>\n  <div class=\'line-col col3of10 text-align-right\'>\n    <button class=\'button small inset\' data-remove type=\'button\'>Remove<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/templates/upload/upload_errors_dialog", "<div class=\'modal medium hide fade ui-modal padding-inset-m padding-horizontal-l\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'row padding-vertical-m\'>\n    <div class=\'col2of3\'>\n      <h3 class=\'headline-l\'>{{jed \"Upload problems\"/}}<\/h3>\n      <h3 class=\'headline-s light\'>\n        {{>headlineMessage}}\n      <\/h3>\n    <\/div>\n    <div class=\'col1of3\'>\n      <div class=\'float-right\'>\n        <a class=\'button white\' href=\'{{>url}}\'>\n          {{>buttonLabel}}\n        <\/a>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'modal-body row margin-top-m\'>\n    <div class=\'emboss error padding-inset-s\'>\n      <p class=\'paragraph-s\'>{{>errors}}<\/p>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/templates/upload/upload_image_type_errors_dialog", "<div class=\'modal medium hide fade ui-modal padding-inset-m padding-horizontal-l\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'row padding-vertical-m\'>\n    <div class=\'col2of3\'>\n      <h3 class=\'headline-l\' style=\'color: #f00;\'>{{jed \"Upload problems\"/}}<\/h3>\n      <h3 class=\'headline-s light\' style=\'color: #f00;\'>\n        {{>headlineMessage}}\n      <\/h3>\n    <\/div>\n    <div class=\'col1of3\'>\n      <div class=\'float-right\'>\n        <a class=\'button white\' href=\'{{>url}}\'>\n          {{>buttonLabel}}\n        <\/a>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/templates/users/autocomplete_element", "<li class=\'separated-bottom exclude-last-child\'>\n  <a>\n    <div class=\'row\'>\n      {{>name()}}\n    <\/div>\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/templates/users/user_inline_entry", "<div class=\'row line font-size-xs\'>\n  <input name=\'{{>~paramName}}\' type=\'hidden\' value=\'{{>id}}\'>\n  <div class=\'line-col col5of6 text-align-left\' data-user-name>\n    {{>name()}}\n  <\/div>\n  <div class=\'line-col col1of6 text-align-right\'>\n    <button class=\'button inset small\' data-remove-user>{{jed \"Remove\"/}}<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/users/autocomplete_element", "<li class=\'separated-bottom exclude-last-child\'>\n  <a class=\'row\' title=\'{{>firstname}} {{>lastname}}\'>\n    <div class=\'row text-ellipsis\'>\n      <strong>\n        {{>firstname}}\n        {{>lastname}}\n      <\/strong>\n    <\/div>\n    {{if address || city}}\n    <div class=\'row text-ellipsis\'>\n      {{>address}}, {{>city}}\n    <\/div>\n    {{/if}}\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/users/cell", "<div class=\'line-col {{>~grid}}\'>\n  <strong data-address=\'{{>address}}\' data-badge_id=\'{{>badge_id}}\' data-city=\'{{>city}}\' data-email=\'{{>email}}\' data-firstname=\'{{>firstname}}\' data-id=\'{{>id}}\' data-image_url=\'{{>image_url}}\' data-lastname=\'{{>lastname}}\' data-phone=\'{{>phone}}\' data-type=\'user-cell\' data-zip=\'{{>zip}}\'>\n    {{>firstname}} {{>lastname}}\n    {{if isSuspended()}}\n    <span class=\'darkred-text\'>{{jed \"Suspended\"/}}!<\/span>\n    {{/if}}\n  <\/strong>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/users/hand_over/no_handover_found", "<div class=\'emboss padding-inset-s\'>\n  <p class=\'paragraph-s\'>\n    <strong>\n      {{jed \"No hand overs found\"/}}\n    <\/strong>\n  <\/p>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/users/hand_over_dialog", "<div class=\'modal fade ui-modal medium\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'modal-header row\'>\n    <div class=\'col3of5\'>\n      <h2 class=\'headline-l\'>{{jed itemsCount \"Hand over of %s item\" \"Hand over of %s items\" itemsCount/}}<\/h2>\n      <h3 class=\'headline-m light\'>\n        {{>user.firstname}} {{>user.lastname}}\n      <\/h3>\n    <\/div>\n    <div class=\'col2of5 text-align-right\'>\n      <div class=\'modal-close\'>{{jed \"Cancel\"/}}<\/div>\n      <button class=\'button green\' data-hand-over>\n        <i class=\'fa fa-mail-forward\'><\/i>\n        {{jed \"Hand Over\"/}}\n      <\/button>\n    <\/div>\n  <\/div>\n  <div class=\'row margin-top-s padding-horizontal-l\'>\n    <div class=\'separated-bottom padding-bottom-m margin-bottom-m\'>\n      <p class=\'emboss red padding-inset-s hidden paragraph-s margin-bottom-s\' id=\'error\'>\n        <strong><\/strong>\n      <\/p>\n      {{if user.isDelegation()}}\n      <div class=\'row margin-bottom-l\'>\n        <div class=\'col1of3\' id=\'contact-person\'>\n          <input autocomplete=\'off\' autofocus=\'autofocus\' class=\'width-full\' data-barcode-scanner-target data-prevent-barcode-scanner-submit id=\'user-id\' placeholder=\'{{jed \'Contact person\'/}} {{jed \'Name / ID\'/}}\' type=\'text\'>\n          <div id=\'selected-user\'><\/div>\n        <\/div>\n      <\/div>\n      {{/if}}\n      {{if purpose}}\n      <div class=\'row margin-bottom-s emboss padding-inset-s\'>\n        <div class=\'col3of4\'>\n          <p class=\'paragraph-s\'>{{>purpose}}<\/p>\n        <\/div>\n        <div class=\'col1of4 text-align-right\'>\n          {{if ~showAddPurpose}}\n          <button class=\'button inset\' id=\'add-purpose\'>{{jed \'Add Purpose\'/}}<\/button>\n          {{/if}}\n        <\/div>\n      <\/div>\n      {{/if}}\n      <div class=\'{{if purpose}}hidden{{/if}}\' id=\'purpose-input\'>\n        <div class=\'row padding-bottom-s\'>\n          <p>{{jed \"Please provide a purpose...\"/}}<\/p>\n        <\/div>\n        <textarea class=\'row height-xs\' id=\'purpose\' name=\'purpose\'><\/textarea>\n      <\/div>\n    <\/div>\n    <div class=\'modal-body\'>\n      {{for groupedLines}}\n      <div class=\'padding-bottom-m margin-bottom-m no-last-child-margin\'>\n        <div class=\'row margin-bottom-s\'>\n          <div class=\'col1of2\'>\n            <p>\n              {{date start_date/}}\n              -\n              {{date end_date/}}\n            <\/p>\n          <\/div>\n          <div class=\'col1of2 text-align-right\'>\n            <strong>{{diffDatesInDays start_date end_date/}}<\/strong>\n          <\/div>\n        <\/div>\n        {{for reservations}}\n        <div class=\'row\'>\n          <div class=\'col1of8 text-align-center\'>\n            <div class=\'paragraph-s\'>\n              {{if subreservations}}\n              {{sum subreservations \"quantity\"/}}\n              {{else}}\n              {{> quantity}}\n              {{/if}}\n            <\/div>\n          <\/div>\n          <div class=\'col7of8\'>\n            <div class=\'paragraph-s\'>\n              <strong>{{>model().name()}}<\/strong>\n            <\/div>\n          <\/div>\n        <\/div>\n        {{/for}}\n      <\/div>\n      {{/for}}\n    <\/div>\n    <div class=\'row separated-top padding-top-m padding-bottom-m\'>\n      <div class=\'col1of1 padding-bottom-s\'>\n        <p>{{jed \"Write a note... the note will be part of the contract\"/}}<\/p>\n      <\/div>\n      <textarea class=\'col1of1 height-xs\' id=\'note\' name=\'note\'>{{>~currentInventoryPool.default_contract_note}}<\/textarea>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/users/hand_over_documents_dialog", "<div class=\'modal fade ui-modal medium min-height-m\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'modal-header row\'>\n    <div class=\'col3of5\'>\n      <h2 class=\'headline-l\'>{{jed \"Hand over completed\"/}}<\/h2>\n      <h3 class=\'headline-m light\'>\n        {{jed itemsCount \"%s item\" \"%s items\" itemsCount/}}\n        {{jed \"to %s\" contract.user().name()/}}\n      <\/h3>\n    <\/div>\n    <div class=\'col2of5 text-align-right\'>\n      <div class=\'multibutton\'>\n        <a class=\'button white text-ellipsis\' href=\'{{dailyPath/}}\'>{{jed \"Finish this hand over\"/}}<\/a>\n        <div class=\'dropdown-holder inline-block\'>\n          <div class=\'button white dropdown-toggle\'>\n            <div class=\'arrow down\'><\/div>\n          <\/div>\n          <ul class=\'dropdown right\'>\n            <li>\n              <a class=\'dropdown-item\' href=\'\'>\n                <i class=\'fa fa-undo\'><\/i>\n                {{jed \"Back to this user\"/}}\n              <\/a>\n            <\/li>\n          <\/ul>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'modal-body\'>\n    <div class=\'padding-inset-l margin-top-s\'>\n      <div class=\'row emboss padding-inset-s margin-bottom-s\'>\n        <div class=\'col1of3\'><\/div>\n        <div class=\'col1of3\'>\n          <a class=\'button white width-full\' href=\'{{>contract.url()}}\' target=\'_blank\'>\n            <i class=\'fa fa-file-alt\'><\/i>\n            {{jed \"Contract\"/}}\n          <\/a>\n        <\/div>\n        <div class=\'col1of3\'><\/div>\n      <\/div>\n      <div class=\'row emboss padding-inset-s margin-bottom-s\'>\n        <div class=\'col1of3\'><\/div>\n        <div class=\'col1of3\'>\n          <a class=\'button white width-full\' href=\'{{>contract.url(\'value_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Value List\"/}}\n          <\/a>\n        <\/div>\n        <div class=\'col1of3\'><\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/users/line", "<div class=\'row line\'>\n  <div class=\'col1of5 line-col\'>\n    <strong data-address=\'{{>address}}\' data-badge_id=\'{{>badge_id}}\' data-city=\'{{>city}}\' data-email=\'{{>email}}\' data-firstname=\'{{>firstname}}\' data-id=\'{{>id}}\' data-image_url=\'{{>image_url}}\' data-lastname=\'{{>lastname}}\' data-phone=\'{{>phone}}\' data-type=\'user-cell\' data-zip=\'{{>zip}}\'>\n      {{>name()}}\n    <\/strong>\n  <\/div>\n  <div class=\'col1of5 line-col text-align-left\'>\n    {{>phone}}\n  <\/div>\n  <div class=\'col1of5 line-col text-align-left\'>\n    {{>roleName()}}\n  <\/div>\n  <div class=\'col1of5 line-col text-align-left darkred-text\'>\n    {{if suspended()}}\n    {{jed \"Suspended until\"/}} {{date suspendedUntil()/}}\n    {{/if}}\n  <\/div>\n  <div class=\'col1of5 line-col line-actions\'>\n    <div class=\'multibutton\'>\n      {{if ~currentInventoryPool && accessRight()}}\n      <a class=\'button white\' href=\'{{>url(\'hand_over\')}}\'>\n        <i class=\'fa fa-mail-forward\'><\/i>\n        {{jed \"Hand Over\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' href=\'{{>url(\'edit\')}}\'>\n              <i class=\'fa fa-edit\'><\/i>\n              {{jed \"Edit\"/}}\n            <\/a>\n          <\/li>\n          <li>\n            <a class=\'dropdown-item\' href=\'mailto:{{>email}}\'>\n              <i class=\'fa fa-envelope\'><\/i>\n              {{jed \"E-Mail\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n      {{else}}\n      <a class=\'button white\' href=\'{{>url(\'edit\')}}\'>\n        {{jed \"Edit\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' href=\'mailto:{{>email}}\'>\n              <i class=\'fa fa-envelope\'><\/i>\n              {{jed \"E-Mail\"/}}\n            <\/a>\n          <\/li>\n          {{if !~currentInventoryPool}}\n          <li>\n            <a class=\'dropdown-item red\' data-method=\'delete\' href=\'{{>url()}}\'>\n              <i class=\'fa fa-trash\'><\/i>\n              {{jed \"Delete\"/}}\n            <\/a>\n          <\/li>\n          {{/if}}\n        <\/ul>\n      <\/div>\n      {{/if}}\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/users/search_result_line", "<div class=\'row line\'>\n  <div class=\'col2of8 line-col\'>\n    <strong data-address=\'{{>address}}\' data-badge_id=\'{{>badge_id}}\' data-city=\'{{>city}}\' data-email=\'{{>email}}\' data-firstname=\'{{>firstname}}\' data-id=\'{{>id}}\' data-image_url=\'{{>image_url}}\' data-lastname=\'{{>lastname}}\' data-phone=\'{{>phone}}\' data-type=\'user-cell\' data-zip=\'{{>zip}}\'>\n      {{>name()}}\n      {{if isSuspended()}}\n      <span class=\'darkred-text\'>{{jed \"Suspended\"/}}!<\/span>\n      {{/if}}\n    <\/strong>\n  <\/div>\n  <div class=\'col2of8 line-col text-align-left\'>\n    {{>city}}\n  <\/div>\n  <div class=\'col1of8 line-col text-align-left\'>\n    {{if phone}}\n    <div class=\'row grey-text\'>{{jed \'Phone\'/}}<\/div>\n    {{>phone}}\n    {{/if}}\n  <\/div>\n  <div class=\'col1of8 line-col text-align-left\'>\n    {{if badge_id}}\n    <div class=\'row grey-text\'>{{jed \'Badge\'/}}<\/div>\n    {{>badge_id}}\n    {{/if}}\n  <\/div>\n  <div class=\'col2of8 line-col line-actions\'>\n    <div class=\'multibutton\'>\n      <a class=\'button white\' href=\'{{>url(\'hand_over\')}}\'>\n        <i class=\'fa fa-mail-forward\'><\/i>\n        {{jed \"Hand Over\"/}}\n      <\/a>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <div class=\'arrow down\'><\/div>\n        <\/div>\n        <ul class=\'dropdown right\'>\n          <li>\n            <a class=\'dropdown-item\' href=\'{{>url(\'edit\')}}\'>\n              <i class=\'fa fa-edit\'><\/i>\n              {{jed \"Edit\"/}}\n            <\/a>\n          <\/li>\n          <li>\n            <a class=\'dropdown-item\' href=\'mailto:{{>email}}\'>\n              <i class=\'fa fa-envelope\'><\/i>\n              {{jed \"E-Mail\"/}}\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/users/take_back_dialog", "<div class=\'modal fade ui-modal medium\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'modal-header row\'>\n    <div class=\'col3of5\'>\n      <h2 class=\'headline-l\'>{{jed itemsCount \"Take back of %s item\" \"Take back of %s items\" itemsCount/}}<\/h2>\n      <h3 class=\'headline-m light\'>\n        {{>user.firstname}} {{>user.lastname}}\n      <\/h3>\n    <\/div>\n    <div class=\'col2of5 text-align-right\'>\n      <div class=\'modal-close\'>{{jed \"Cancel\"/}}<\/div>\n      <button class=\'button green\' data-take-back>\n        <i class=\'fa fa-mail-reply\'><\/i>\n        {{jed \"Take Back\"/}}\n      <\/button>\n    <\/div>\n  <\/div>\n  <div class=\'row margin-top-s padding-horizontal-l\'>\n    <div class=\'modal-body\'>\n      {{for groupedLines}}\n      <div class=\'padding-bottom-m margin-bottom-m no-last-child-margin\'>\n        <div class=\'row margin-bottom-s\'>\n          <div class=\'col1of2\'>\n            <p>\n              {{date start_date/}}\n              -\n              {{date end_date/}}\n            <\/p>\n          <\/div>\n          <div class=\'col1of2 text-align-right\'>\n            <strong>{{diffDatesInDays start_date end_date/}}<\/strong>\n          <\/div>\n        <\/div>\n        {{for reservations}}\n        <div class=\'row\'>\n          <div class=\'col1of8 text-align-center\'>\n            <div class=\'paragraph-s\'>\n              {{if ~returnedQuantity[id]}}\n              {{> ~returnedQuantity[id]}}/{{>quantity}}\n              {{else}}\n              {{if subreservations}}\n              {{sum subreservations \"quantity\"/}}\n              {{else}}\n              {{> quantity}}\n              {{/if}}\n              {{/if}}\n            <\/div>\n          <\/div>\n          <div class=\'col7of8\'>\n            <div class=\'paragraph-s\'>\n              <strong>{{>model().name()}}<\/strong>\n            <\/div>\n          <\/div>\n        <\/div>\n        {{/for}}\n      <\/div>\n      {{/for}}\n    <\/div>\n  <\/div>\n  <div class=\'modal-footer\'><\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/users/take_back_documents_dialog", "<div class=\'modal fade ui-modal medium min-height-m\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'modal-header row\'>\n    <div class=\'col3of5\'>\n      <h2 class=\'headline-l\'>{{jed \"Take back completed\"/}}<\/h2>\n      <h3 class=\'headline-m light\'>\n        {{jed itemsCount \"%s item\" \"%s items\" itemsCount/}}\n        {{jed \"from %s\" user.name()/}}\n      <\/h3>\n    <\/div>\n    <div class=\'col2of5 text-align-right\'>\n      <div class=\'multibutton\'>\n        <a class=\'button white text-ellipsis\' href=\'{{dailyPath/}}\'>{{jed \"Finish this take back\"/}}<\/a>\n        <div class=\'dropdown-holder inline-block\'>\n          <div class=\'button white dropdown-toggle\'>\n            <div class=\'arrow down\'><\/div>\n          <\/div>\n          <ul class=\'dropdown right\'>\n            <li>\n              <a class=\'dropdown-item\' href=\'\'>\n                <i class=\'fa fa-undo\'><\/i>\n                {{jed \"Back to this user\"/}}\n              <\/a>\n            <\/li>\n          <\/ul>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n  <div class=\'modal-body\'>\n    <div class=\'padding-inset-l margin-top-s\'>\n      {{for contracts}}\n      <div class=\'row emboss padding-inset-s margin-bottom-s\'>\n        <div class=\'col1of6\'><\/div>\n        <div class=\'col2of6 padding-inset-s\'>\n          <a class=\'button white width-full\' href=\'{{>url()}}\' target=\'_blank\'>\n            <i class=\'fa fa-file-alt\'><\/i>\n            {{jed \"Contract\"/}}\n            {{>compact_id}}\n          <\/a>\n        <\/div>\n        <div class=\'col2of6 padding-inset-s\'>\n          <a class=\'button white width-full\' href=\'{{>url(\'value_list\')}}\' target=\'_blank\'>\n            <i class=\'fa fa-list-ol\'><\/i>\n            {{jed \"Value List\"/}}\n          <\/a>\n        <\/div>\n        <div class=\'col1of6\'><\/div>\n      <\/div>\n      {{/for}}\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/users/tooltip", "<div class=\'row width-xl min-height-s padding-right-s padding-left-s\'>\n  <div class=\'col3of4\'>\n    <div class=\'row\'>\n      <h3 class=\'headline-l\'>{{>firstname}} {{>lastname}}<\/h3>\n      <h3 class=\'headline-s light\'>{{>email}}<\/h3>\n    <\/div>\n    {{if delegator_user()}}\n    <div class=\'row margin-top-m\'>\n      <p class=\'paragraph-s line-height-s\'>{{jed \"Responsible\"/}}: {{>delegator_user().name()}}<\/p>\n    <\/div>\n    {{/if}}\n    {{if address}}\n    <div class=\'row margin-top-m\'>\n      <p class=\'paragraph-xs line-height-s\'>{{jed \"Address\"/}}<\/p>\n      <p class=\'paragraph-s line-height-s\'>{{>address}}{{>zip}} {{>city}}<\/p>\n    <\/div>\n    {{/if}}\n    {{if phone}}\n    <div class=\'row margin-top-m\'>\n      <p class=\'paragraph-xs line-height-s\'>{{jed \"Phone\"/}}<\/p>\n      <p class=\'paragraph-s line-height-s\'>{{>phone}}<\/p>\n    <\/div>\n    {{/if}}\n    {{if badge_id}}\n    <div class=\'row margin-top-m\'>\n      <p class=\'paragraph-xs line-height-s\'>{{jed \"Badge\"/}}<\/p>\n      <p class=\'paragraph-s line-height-s\'>{{>badge_id}}<\/p>\n    <\/div>\n    {{/if}}\n  <\/div>\n  <div class=\'col1of4\'>\n    {{if image_url}}\n    <img class=\'max-size-xxs margin-horziontal-auto\' src=\'{{>image_url/}}\' style=\'max-width: 100px; max-height: 100px\'>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("manage/views/visits/line", "{{include tmpl=\"manage/views/\"+action+\"s/line\" /}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
