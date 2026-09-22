(function() {
  var appPack, base;

  if (window.App == null) {
    window.App = {};
  }

  if (window.Tools == null) {
    window.Tools = {
      inspect: (function(_this) {
        return function(val) {
          console.log(val);
          return val;
        };
      })(this)
    };
  }

  if ((base = window.App).Modules == null) {
    base.Modules = {};
  }

  appPack = window.Packs.application;

  window.React = appPack.React;

  window.ReactDOM = appPack.ReactDOM;

  window.PropTypes = appPack.PropTypes;

  window.createReactClass = appPack.createReactClass;

  window.lodash = appPack.lodash;

  window.setUrlParams = appPack.setUrlParams;

  ['HandoverAutocomplete', 'CalendarDialog'].forEach(function(name) {
    var m;
    m = appPack.requireComponent('./' + name);
    if (typeof m === 'object' && typeof m["default"] === 'function') {
      m = m["default"];
    }
    if (typeof m === 'object' && typeof m[name] === 'function') {
      m = m[name];
    }
    return window[name] = m;
  });

}).call(this);
/*
jed.js
v0.5.0beta

https://github.com/SlexAxton/Jed
-----------
A gettext compatible i18n library for modern JavaScript Applications

by Alex Sexton - AlexSexton [at] gmail - @SlexAxton
WTFPL license for use
Dojo CLA for contributions

Jed offers the entire applicable GNU gettext spec'd set of
functions, but also offers some nicer wrappers around them.
The api for gettext was written for a language with no function
overloading, so Jed allows a little more of that.

Many thanks to Joshua I. Miller - unrtst@cpan.org - who wrote
gettext.js back in 2008. I was able to vet a lot of my ideas
against his. I also made sure Jed passed against his tests
in order to offer easy upgrades -- jsgettext.berlios.de
*/

(function (root, undef) {

  // Set up some underscore-style functions, if you already have
  // underscore, feel free to delete this section, and use it
  // directly, however, the amount of functions used doesn't
  // warrant having underscore as a full dependency.
  // Underscore 1.3.0 was used to port and is licensed
  // under the MIT License by Jeremy Ashkenas.
  var ArrayProto    = Array.prototype,
      ObjProto      = Object.prototype,
      slice         = ArrayProto.slice,
      hasOwnProp    = ObjProto.hasOwnProperty,
      nativeForEach = ArrayProto.forEach,
      breaker       = {};

  // We're not using the OOP style _ so we don't need the
  // extra level of indirection. This still means that you
  // sub out for real `_` though.
  var _ = {
    forEach : function( obj, iterator, context ) {
      var i, l, key;
      if ( obj === null ) {
        return;
      }

      if ( nativeForEach && obj.forEach === nativeForEach ) {
        obj.forEach( iterator, context );
      }
      else if ( obj.length === +obj.length ) {
        for ( i = 0, l = obj.length; i < l; i++ ) {
          if ( i in obj && iterator.call( context, obj[i], i, obj ) === breaker ) {
            return;
          }
        }
      }
      else {
        for ( key in obj) {
          if ( hasOwnProp.call( obj, key ) ) {
            if ( iterator.call (context, obj[key], key, obj ) === breaker ) {
              return;
            }
          }
        }
      }
    },
    extend : function( obj ) {
      this.forEach( slice.call( arguments, 1 ), function ( source ) {
        for ( var prop in source ) {
          obj[prop] = source[prop];
        }
      });
      return obj;
    }
  };
  // END Miniature underscore impl

  // Jed is a constructor function
  var Jed = function ( options ) {
    // Some minimal defaults
    this.defaults = {
      "locale_data" : {
        "messages" : {
          "" : {
            "domain"       : "messages",
            "lang"         : "en",
            "plural_forms" : "nplurals=2; plural=(n != 1);"
          }
          // There are no default keys, though
        }
      },
      // The default domain if one is missing
      "domain" : "messages"
    };

    // Mix in the sent options with the default options
    this.options = _.extend( {}, this.defaults, options );
    this.textdomain( this.options.domain );

    if ( options.domain && ! this.options.locale_data[ this.options.domain ] ) {
      throw new Error('Text domain set to non-existent domain: `' + domain + '`');
    }
  };

  // The gettext spec sets this character as the default
  // delimiter for context lookups.
  // e.g.: context\u0004key
  // If your translation company uses something different,
  // just change this at any time and it will use that instead.
  Jed.context_delimiter = String.fromCharCode( 4 );

  function getPluralFormFunc ( plural_form_string ) {
    return Jed.PF.compile( plural_form_string || "nplurals=2; plural=(n != 1);");
  }

  function Chain( key, i18n ){
    this._key = key;
    this._i18n = i18n;
  }

  // Create a chainable api for adding args prettily
  _.extend( Chain.prototype, {
    onDomain : function ( domain ) {
      this._domain = domain;
      return this;
    },
    withContext : function ( context ) {
      this._context = context;
      return this;
    },
    ifPlural : function ( num, pkey ) {
      this._val = num;
      this._pkey = pkey;
      return this;
    },
    fetch : function ( sArr ) {
      if ( {}.toString.call( sArr ) != '[object Array]' ) {
        sArr = [].slice.call(arguments);
      }
      return ( sArr && sArr.length ? Jed.sprintf : function(x){ return x; } )(
        this._i18n.dcnpgettext(this._domain, this._context, this._key, this._pkey, this._val),
        sArr
      );
    }
  });

  // Add functions to the Jed prototype.
  // These will be the functions on the object that's returned
  // from creating a `new Jed()`
  // These seem redundant, but they gzip pretty well.
  _.extend( Jed.prototype, {
    // The sexier api start point
    translate : function ( key ) {
      return new Chain( key, this );
    },

    textdomain : function ( domain ) {
      if ( ! domain ) {
        return this._textdomain;
      }
      this._textdomain = domain;
    },

    gettext : function ( key ) {
      return this.dcnpgettext.call( this, undef, undef, key );
    },

    dgettext : function ( domain, key ) {
     return this.dcnpgettext.call( this, domain, undef, key );
    },

    dcgettext : function ( domain , key /*, category */ ) {
      // Ignores the category anyways
      return this.dcnpgettext.call( this, domain, undef, key );
    },

    ngettext : function ( skey, pkey, val ) {
      return this.dcnpgettext.call( this, undef, undef, skey, pkey, val );
    },

    dngettext : function ( domain, skey, pkey, val ) {
      return this.dcnpgettext.call( this, domain, undef, skey, pkey, val );
    },

    dcngettext : function ( domain, skey, pkey, val/*, category */) {
      return this.dcnpgettext.call( this, domain, undef, skey, pkey, val );
    },

    pgettext : function ( context, key ) {
      return this.dcnpgettext.call( this, undef, context, key );
    },

    dpgettext : function ( domain, context, key ) {
      return this.dcnpgettext.call( this, domain, context, key );
    },

    dcpgettext : function ( domain, context, key/*, category */) {
      return this.dcnpgettext.call( this, domain, context, key );
    },

    npgettext : function ( context, skey, pkey, val ) {
      return this.dcnpgettext.call( this, undef, context, skey, pkey, val );
    },

    dnpgettext : function ( domain, context, skey, pkey, val ) {
      return this.dcnpgettext.call( this, domain, context, skey, pkey, val );
    },

    // The most fully qualified gettext function. It has every option.
    // Since it has every option, we can use it from every other method.
    // This is the bread and butter.
    // Technically there should be one more argument in this function for 'Category',
    // but since we never use it, we might as well not waste the bytes to define it.
    dcnpgettext : function ( domain, context, singular_key, plural_key, val ) {
      // Set some defaults

      plural_key = plural_key || singular_key;

      // Use the global domain default if one
      // isn't explicitly passed in
      domain = domain || this._textdomain;

      // Default the value to the singular case
      val = typeof val == 'undefined' ? 1 : val;

      var fallback;

      // Handle special cases

      // No options found
      if ( ! this.options ) {
        // There's likely something wrong, but we'll return the correct key for english
        // We do this by instantiating a brand new Jed instance with the default set
        // for everything that could be broken.
        fallback = new Jed();
        return fallback.dcnpgettext.call( fallback, undefined, undefined, singular_key, plural_key, val );
      }

      // No translation data provided
      if ( ! this.options.locale_data ) {
        throw new Error('No locale data provided.');
      }

      if ( ! this.options.locale_data[ domain ] ) {
        throw new Error('Domain `' + domain + '` was not found.');
      }

      if ( ! this.options.locale_data[ domain ][ "" ] ) {
        throw new Error('No locale meta information provided.');
      }

      // Make sure we have a truthy key. Otherwise we might start looking
      // into the empty string key, which is the options for the locale
      // data.
      if ( ! singular_key ) {
        throw new Error('No translation key found.');
      }

      // Handle invalid numbers, but try casting strings for good measure
      if ( typeof val != 'number' ) {
        try {
          val = parseInt( val, 10 );
        }
        catch ( e ) {
          throw new Error('Error parsing the value.');
        }

        if ( isNaN( val ) ) {
          throw new Error('The number that was passed in is not a number.');
        }
      }

      var key  = context ? context + Jed.context_delimiter + singular_key : singular_key,
          locale_data = this.options.locale_data,
          dict = locale_data[ domain ],
          pluralForms = dict[""].plural_forms || (locale_data.messages || this.defaults.locale_data.messages)[""].plural_forms,
          val_idx = getPluralFormFunc(pluralForms)(val) + 1,
          val_list,
          res;

      // Throw an error if a domain isn't found
      if ( ! dict ) {
        throw new Error('No domain named `' + domain + '` could be found.');
      }

      val_list = dict[ key ];

      // If there is no match, then revert back to
      // english style singular/plural with the keys passed in.
      if ( ! val_list || val_idx >= val_list.length ) {
        res = [ null, singular_key, plural_key ];
        return res[ getPluralFormFunc(pluralForms)( val ) + 1 ];
      }

      res = val_list[ val_idx ];

      // This includes empty strings on purpose
      if ( ! res  ) {
        res = [ null, singular_key, plural_key ];
        return res[ getPluralFormFunc(pluralForms)( val ) + 1 ];
      }
      return res;
    }
  });


  // We add in sprintf capabilities for post translation value interolation
  // This is not internally used, so you can remove it if you have this
  // available somewhere else, or want to use a different system.

  // We _slightly_ modify the normal sprintf behavior to more gracefully handle
  // undefined values.

  /**
   sprintf() for JavaScript 0.7-beta1
   http://www.diveintojavascript.com/projects/javascript-sprintf

   Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
   All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions are met:
       * Redistributions of source code must retain the above copyright
         notice, this list of conditions and the following disclaimer.
       * Redistributions in binary form must reproduce the above copyright
         notice, this list of conditions and the following disclaimer in the
         documentation and/or other materials provided with the distribution.
       * Neither the name of sprintf() for JavaScript nor the
         names of its contributors may be used to endorse or promote products
         derived from this software without specific prior written permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
   ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
   DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
   (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
   LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
   ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */
  var sprintf = (function() {
    function get_type(variable) {
      return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }
    function str_repeat(input, multiplier) {
      for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
      return output.join('');
    }

    var str_format = function() {
      if (!str_format.cache.hasOwnProperty(arguments[0])) {
        str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
      }
      return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
    };

    str_format.format = function(parse_tree, argv) {
      var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
      for (i = 0; i < tree_length; i++) {
        node_type = get_type(parse_tree[i]);
        if (node_type === 'string') {
          output.push(parse_tree[i]);
        }
        else if (node_type === 'array') {
          match = parse_tree[i]; // convenience purposes only
          if (match[2]) { // keyword argument
            arg = argv[cursor];
            for (k = 0; k < match[2].length; k++) {
              if (!arg.hasOwnProperty(match[2][k])) {
                throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
              }
              arg = arg[match[2][k]];
            }
          }
          else if (match[1]) { // positional argument (explicit)
            arg = argv[match[1]];
          }
          else { // positional argument (implicit)
            arg = argv[cursor++];
          }

          if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
            throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
          }

          // Jed EDIT
          if ( typeof arg == 'undefined' || arg === null ) {
            arg = '';
          }
          // Jed EDIT

          switch (match[8]) {
            case 'b': arg = arg.toString(2); break;
            case 'c': arg = String.fromCharCode(arg); break;
            case 'd': arg = parseInt(arg, 10); break;
            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
            case 'o': arg = arg.toString(8); break;
            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
            case 'u': arg = Math.abs(arg); break;
            case 'x': arg = arg.toString(16); break;
            case 'X': arg = arg.toString(16).toUpperCase(); break;
          }
          arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
          pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
          pad_length = match[6] - String(arg).length;
          pad = match[6] ? str_repeat(pad_character, pad_length) : '';
          output.push(match[5] ? arg + pad : pad + arg);
        }
      }
      return output.join('');
    };

    str_format.cache = {};

    str_format.parse = function(fmt) {
      var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
      while (_fmt) {
        if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
          parse_tree.push(match[0]);
        }
        else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
          parse_tree.push('%');
        }
        else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
          if (match[2]) {
            arg_names |= 1;
            var field_list = [], replacement_field = match[2], field_match = [];
            if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
              field_list.push(field_match[1]);
              while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else {
                  throw('[sprintf] huh?');
                }
              }
            }
            else {
              throw('[sprintf] huh?');
            }
            match[2] = field_list;
          }
          else {
            arg_names |= 2;
          }
          if (arg_names === 3) {
            throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
          }
          parse_tree.push(match);
        }
        else {
          throw('[sprintf] huh?');
        }
        _fmt = _fmt.substring(match[0].length);
      }
      return parse_tree;
    };

    return str_format;
  })();

  var vsprintf = function(fmt, argv) {
    argv.unshift(fmt);
    return sprintf.apply(null, argv);
  };

  Jed.parse_plural = function ( plural_forms, n ) {
    plural_forms = plural_forms.replace(/n/g, n);
    return Jed.parse_expression(plural_forms);
  };

  Jed.sprintf = function ( fmt, args ) {
    if ( {}.toString.call( args ) == '[object Array]' ) {
      return vsprintf( fmt, [].slice.call(args) );
    }
    return sprintf.apply(this, [].slice.call(arguments) );
  };

  Jed.prototype.sprintf = function () {
    return Jed.sprintf.apply(this, arguments);
  };
  // END sprintf Implementation

  // Start the Plural forms section
  // This is a full plural form expression parser. It is used to avoid
  // running 'eval' or 'new Function' directly against the plural
  // forms.
  //
  // This can be important if you get translations done through a 3rd
  // party vendor. I encourage you to use this instead, however, I
  // also will provide a 'precompiler' that you can use at build time
  // to output valid/safe function representations of the plural form
  // expressions. This means you can build this code out for the most
  // part.
  Jed.PF = {};

  Jed.PF.parse = function ( p ) {
    var plural_str = Jed.PF.extractPluralExpr( p );
    return Jed.PF.parser.parse.call(Jed.PF.parser, plural_str);
  };

  Jed.PF.compile = function ( p ) {
    // Handle trues and falses as 0 and 1
    function imply( val ) {
      return (val === true ? 1 : val ? val : 0);
    }

    var ast = Jed.PF.parse( p );
    return function ( n ) {
      return imply( Jed.PF.interpreter( ast )( n ) );
    };
  };

  Jed.PF.interpreter = function ( ast ) {
    return function ( n ) {
      var res;
      switch ( ast.type ) {
        case 'GROUP':
          return Jed.PF.interpreter( ast.expr )( n );
        case 'TERNARY':
          if ( Jed.PF.interpreter( ast.expr )( n ) ) {
            return Jed.PF.interpreter( ast.truthy )( n );
          }
          return Jed.PF.interpreter( ast.falsey )( n );
        case 'OR':
          return Jed.PF.interpreter( ast.left )( n ) || Jed.PF.interpreter( ast.right )( n );
        case 'AND':
          return Jed.PF.interpreter( ast.left )( n ) && Jed.PF.interpreter( ast.right )( n );
        case 'LT':
          return Jed.PF.interpreter( ast.left )( n ) < Jed.PF.interpreter( ast.right )( n );
        case 'GT':
          return Jed.PF.interpreter( ast.left )( n ) > Jed.PF.interpreter( ast.right )( n );
        case 'LTE':
          return Jed.PF.interpreter( ast.left )( n ) <= Jed.PF.interpreter( ast.right )( n );
        case 'GTE':
          return Jed.PF.interpreter( ast.left )( n ) >= Jed.PF.interpreter( ast.right )( n );
        case 'EQ':
          return Jed.PF.interpreter( ast.left )( n ) == Jed.PF.interpreter( ast.right )( n );
        case 'NEQ':
          return Jed.PF.interpreter( ast.left )( n ) != Jed.PF.interpreter( ast.right )( n );
        case 'MOD':
          return Jed.PF.interpreter( ast.left )( n ) % Jed.PF.interpreter( ast.right )( n );
        case 'VAR':
          return n;
        case 'NUM':
          return ast.val;
        default:
          throw new Error("Invalid Token found.");
      }
    };
  };

  Jed.PF.extractPluralExpr = function ( p ) {
    // trim first
    p = p.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

    if (! /;\s*$/.test(p)) {
      p = p.concat(';');
    }

    var nplurals_re = /nplurals\=(\d+);/,
        plural_re = /plural\=(.*);/,
        nplurals_matches = p.match( nplurals_re ),
        res = {},
        plural_matches;

    // Find the nplurals number
    if ( nplurals_matches.length > 1 ) {
      res.nplurals = nplurals_matches[1];
    }
    else {
      throw new Error('nplurals not found in plural_forms string: ' + p );
    }

    // remove that data to get to the formula
    p = p.replace( nplurals_re, "" );
    plural_matches = p.match( plural_re );

    if (!( plural_matches && plural_matches.length > 1 ) ) {
      throw new Error('`plural` expression not found: ' + p);
    }
    return plural_matches[ 1 ];
  };

  /* Jison generated parser */
  Jed.PF.parser = (function(){

var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"e":4,"EOF":5,"?":6,":":7,"||":8,"&&":9,"<":10,"<=":11,">":12,">=":13,"!=":14,"==":15,"%":16,"(":17,")":18,"n":19,"NUMBER":20,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"?",7:":",8:"||",9:"&&",10:"<",11:"<=",12:">",13:">=",14:"!=",15:"==",16:"%",17:"(",18:")",19:"n",20:"NUMBER"},
productions_: [0,[3,2],[4,5],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,1],[4,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: return { type : 'GROUP', expr: $$[$0-1] }; 
break;
case 2:this.$ = { type: 'TERNARY', expr: $$[$0-4], truthy : $$[$0-2], falsey: $$[$0] }; 
break;
case 3:this.$ = { type: "OR", left: $$[$0-2], right: $$[$0] };
break;
case 4:this.$ = { type: "AND", left: $$[$0-2], right: $$[$0] };
break;
case 5:this.$ = { type: 'LT', left: $$[$0-2], right: $$[$0] }; 
break;
case 6:this.$ = { type: 'LTE', left: $$[$0-2], right: $$[$0] };
break;
case 7:this.$ = { type: 'GT', left: $$[$0-2], right: $$[$0] };
break;
case 8:this.$ = { type: 'GTE', left: $$[$0-2], right: $$[$0] };
break;
case 9:this.$ = { type: 'NEQ', left: $$[$0-2], right: $$[$0] };
break;
case 10:this.$ = { type: 'EQ', left: $$[$0-2], right: $$[$0] };
break;
case 11:this.$ = { type: 'MOD', left: $$[$0-2], right: $$[$0] };
break;
case 12:this.$ = { type: 'GROUP', expr: $$[$0-1] }; 
break;
case 13:this.$ = { type: 'VAR' }; 
break;
case 14:this.$ = { type: 'NUM', val: Number(yytext) }; 
break;
}
},
table: [{3:1,4:2,17:[1,3],19:[1,4],20:[1,5]},{1:[3]},{5:[1,6],6:[1,7],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16]},{4:17,17:[1,3],19:[1,4],20:[1,5]},{5:[2,13],6:[2,13],7:[2,13],8:[2,13],9:[2,13],10:[2,13],11:[2,13],12:[2,13],13:[2,13],14:[2,13],15:[2,13],16:[2,13],18:[2,13]},{5:[2,14],6:[2,14],7:[2,14],8:[2,14],9:[2,14],10:[2,14],11:[2,14],12:[2,14],13:[2,14],14:[2,14],15:[2,14],16:[2,14],18:[2,14]},{1:[2,1]},{4:18,17:[1,3],19:[1,4],20:[1,5]},{4:19,17:[1,3],19:[1,4],20:[1,5]},{4:20,17:[1,3],19:[1,4],20:[1,5]},{4:21,17:[1,3],19:[1,4],20:[1,5]},{4:22,17:[1,3],19:[1,4],20:[1,5]},{4:23,17:[1,3],19:[1,4],20:[1,5]},{4:24,17:[1,3],19:[1,4],20:[1,5]},{4:25,17:[1,3],19:[1,4],20:[1,5]},{4:26,17:[1,3],19:[1,4],20:[1,5]},{4:27,17:[1,3],19:[1,4],20:[1,5]},{6:[1,7],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[1,28]},{6:[1,7],7:[1,29],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16]},{5:[2,3],6:[2,3],7:[2,3],8:[2,3],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[2,3]},{5:[2,4],6:[2,4],7:[2,4],8:[2,4],9:[2,4],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[2,4]},{5:[2,5],6:[2,5],7:[2,5],8:[2,5],9:[2,5],10:[2,5],11:[2,5],12:[2,5],13:[2,5],14:[2,5],15:[2,5],16:[1,16],18:[2,5]},{5:[2,6],6:[2,6],7:[2,6],8:[2,6],9:[2,6],10:[2,6],11:[2,6],12:[2,6],13:[2,6],14:[2,6],15:[2,6],16:[1,16],18:[2,6]},{5:[2,7],6:[2,7],7:[2,7],8:[2,7],9:[2,7],10:[2,7],11:[2,7],12:[2,7],13:[2,7],14:[2,7],15:[2,7],16:[1,16],18:[2,7]},{5:[2,8],6:[2,8],7:[2,8],8:[2,8],9:[2,8],10:[2,8],11:[2,8],12:[2,8],13:[2,8],14:[2,8],15:[2,8],16:[1,16],18:[2,8]},{5:[2,9],6:[2,9],7:[2,9],8:[2,9],9:[2,9],10:[2,9],11:[2,9],12:[2,9],13:[2,9],14:[2,9],15:[2,9],16:[1,16],18:[2,9]},{5:[2,10],6:[2,10],7:[2,10],8:[2,10],9:[2,10],10:[2,10],11:[2,10],12:[2,10],13:[2,10],14:[2,10],15:[2,10],16:[1,16],18:[2,10]},{5:[2,11],6:[2,11],7:[2,11],8:[2,11],9:[2,11],10:[2,11],11:[2,11],12:[2,11],13:[2,11],14:[2,11],15:[2,11],16:[2,11],18:[2,11]},{5:[2,12],6:[2,12],7:[2,12],8:[2,12],9:[2,12],10:[2,12],11:[2,12],12:[2,12],13:[2,12],14:[2,12],15:[2,12],16:[2,12],18:[2,12]},{4:30,17:[1,3],19:[1,4],20:[1,5]},{5:[2,2],6:[1,7],7:[2,2],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[2,2]}],
defaultActions: {6:[2,1]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};/* Jison generated lexer */
var lexer = (function(){

var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parseError) {
            this.yy.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext+=ch;
        this.yyleng++;
        this.match+=ch;
        this.matched+=ch;
        var lines = ch.match(/\n/);
        if (lines) this.yylineno++;
        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        this._input = ch + this._input;
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            match = this._input.match(this.rules[rules[i]]);
            if (match) {
                lines = match[0].match(/\n.*/g);
                if (lines) this.yylineno += lines.length;
                this.yylloc = {first_line: this.yylloc.last_line,
                               last_line: this.yylineno+1,
                               first_column: this.yylloc.last_column,
                               last_column: lines ? lines[lines.length-1].length-1 : this.yylloc.last_column + match[0].length}
                this.yytext += match[0];
                this.match += match[0];
                this.matches = match;
                this.yyleng = this.yytext.length;
                this._more = false;
                this._input = this._input.slice(match[0].length);
                this.matched += match[0];
                token = this.performAction.call(this, this.yy, this, rules[i],this.conditionStack[this.conditionStack.length-1]);
                if (token) return token;
                else return;
            }
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(), 
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 20
break;
case 2:return 19
break;
case 3:return 8
break;
case 4:return 9
break;
case 5:return 6
break;
case 6:return 7
break;
case 7:return 11
break;
case 8:return 13
break;
case 9:return 10
break;
case 10:return 12
break;
case 11:return 14
break;
case 12:return 15
break;
case 13:return 16
break;
case 14:return 17
break;
case 15:return 18
break;
case 16:return 5
break;
case 17:return 'INVALID'
break;
}
};
lexer.rules = [/^\s+/,/^[0-9]+(\.[0-9]+)?\b/,/^n\b/,/^\|\|/,/^&&/,/^\?/,/^:/,/^<=/,/^>=/,/^</,/^>/,/^!=/,/^==/,/^%/,/^\(/,/^\)/,/^$/,/^./];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],"inclusive":true}};return lexer;})()
parser.lexer = lexer;
return parser;
})();
// End parser

  // Handle node, amd, and global systems
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Jed;
    }
    exports.Jed = Jed;
  }
  else {
    if (typeof define === 'function' && define.amd) {
      define('jed', function() {
        return Jed;
      });
    }
    // Leak a global regardless of module system
    root['Jed'] = Jed;
  }

})(this);
/*! JsRender v1.0.0-beta: http://github.com/BorisMoore/jsrender and http://jsviews.com/jsviews */
/*
* Optimized version of jQuery Templates, for rendering to string.
* Does not require jQuery, or HTML DOM
* Integrates with JsViews (http://jsviews.com/jsviews)
* Copyright 2013, Boris Moore
* Released under the MIT License.
*/


(function(global, jQuery, undefined) {
	// global is the this object, which is window when running in the usual browser environment.
	"use strict";

	if (jQuery && jQuery.views || global.jsviews) { return; } // JsRender is already loaded

	//========================== Top-level vars ==========================

	var versionNumber = "v1.0.0-beta",

		$, jsvStoreName, rTag, rTmplString,// nodeJsModule,

//TODO	tmplFnsCache = {},
		delimOpenChar0 = "{", delimOpenChar1 = "{", delimCloseChar0 = "}", delimCloseChar1 = "}", linkChar = "^",

		rPath = /^(?:null|true|false|\d[\d.]*|([\w$]+|\.|~([\w$]+)|#(view|([\w$]+))?)([\w$.^]*?)(?:[.[^]([\w$]+)\]?)?)$/g,
		//                                     object     helper    view  viewProperty pathTokens      leafToken

		rParams = /(\()(?=\s*\()|(?:([([])\s*)?(?:([#~]?[\w$.^]+)?\s*((\+\+|--)|\+|-|&&|\|\||===|!==|==|!=|<=|>=|[<>%*!:?\/]|(=))\s*|([#~]?[\w$.^]+)([([])?)|(,\s*)|(\(?)\\?(?:(')|("))|(?:\s*(([)\]])(?=\s*\.|\s*\^)|[)\]])([([]?))|(\s+)/g,
		//          lftPrn0        lftPrn                  path    operator err                                                eq          path2       prn    comma   lftPrn2   apos quot      rtPrn rtPrnDot                        prn2      space
		// (left paren? followed by (path? followed by operator) or (path followed by left paren?)) or comma or apos or quot or right paren or space

		rNewLine = /\s*\n/g,
		rUnescapeQuotes = /\\(['"])/g,
		rEscapeQuotes = /['"\\]/g, // Escape quotes and \ character
		rBuildHash = /\x08(~)?([^\x08]+)\x08/g,
		rTestElseIf = /^if\s/,
		rFirstElem = /<(\w+)[>\s]/,
		rAttrEncode = /[\x00`><"'&]/g, // Includes > encoding since rConvertMarkers in JsViews does not skip > characters in attribute strings
		rHtmlEncode = rAttrEncode,
		autoTmplName = 0,
		viewId = 0,
		charEntities = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"\x00": "&#0;",
			"'": "&#39;",
			'"': "&#34;",
			"`": "&#96;"
		},
		tmplAttr = "data-jsv-tmpl",

		$render = {},
		jsvStores = {
			template: {
				compile: compileTmpl
			},
			tag: {
				compile: compileTag
			},
			helper: {},
			converter: {}
		},

		// jsviews object ($.views if jQuery is loaded)
		$views = {
			jsviews: versionNumber,
			render: $render,
			settings: {
				delimiters: $viewsDelimiters,
				debugMode: true,
				tryCatch: true
			},
			sub: {
				// subscription, e.g. JsViews integration
				View: View,
				Error: JsViewsError,
				tmplFn: tmplFn,
				parse: parseParams,
				extend: $extend,
				error: error,
				syntaxError: syntaxError
			},
			_cnvt: convertVal,
			_tag: renderTag,

			_err: function(e) {
				// Place a breakpoint here to intercept template rendering errors
				return $viewsSettings.debugMode ? ("Error: " + (e.message || e)) + ". " : '';
			}
		};

		function JsViewsError(message, object) {
			// Error exception type for JsViews/JsRender
			// Override of $.views.sub.Error is possible
			if (object && object.onError) {
				if (object.onError(message) === false) {
					return;
				}
			}
			this.name = "JsRender Error";
			this.message = message || "JsRender error";
		}

		function $extend(target, source) {
			var name;
			target = target || {};
			for (name in source) {
				target[name] = source[name];
			}
			return target;
		}

		(JsViewsError.prototype = new Error()).constructor = JsViewsError;

	//========================== Top-level functions ==========================

	//===================
	// jsviews.delimiters
	//===================
	function $viewsDelimiters(openChars, closeChars, link) {
		// Set the tag opening and closing delimiters and 'link' character. Default is "{{", "}}" and "^"
		// openChars, closeChars: opening and closing strings, each with two characters

		if (!$viewsSub.rTag || arguments.length) {
			delimOpenChar0 = openChars ? openChars.charAt(0) : delimOpenChar0; // Escape the characters - since they could be regex special characters
			delimOpenChar1 = openChars ? openChars.charAt(1) : delimOpenChar1;
			delimCloseChar0 = closeChars ? closeChars.charAt(0) : delimCloseChar0;
			delimCloseChar1 = closeChars ? closeChars.charAt(1) : delimCloseChar1;
			linkChar = link || linkChar;
			openChars = "\\" + delimOpenChar0 + "(\\" + linkChar + ")?\\" + delimOpenChar1;  // Default is "{^{"
			closeChars = "\\" + delimCloseChar0 + "\\" + delimCloseChar1;                   // Default is "}}"
			// Build regex with new delimiters
			//          tag    (followed by / space or })   or cvtr+colon or html or code
			rTag = "(?:(?:(\\w+(?=[\\/\\s\\" + delimCloseChar0 + "]))|(?:(\\w+)?(:)|(>)|!--((?:[^-]|-(?!-))*)--|(\\*)))"
				+ "\\s*((?:[^\\" + delimCloseChar0 + "]|\\" + delimCloseChar0 + "(?!\\" + delimCloseChar1 + "))*?)";

			// make rTag available to JsViews (or other components) for parsing binding expressions
			$viewsSub.rTag = rTag + ")";

			rTag = new RegExp(openChars + rTag + "(\\/)?|(?:\\/(\\w+)))" + closeChars, "g");

			// Default:    bind           tag       converter colon html     comment            code      params            slash   closeBlock
			//           /{(\^)?{(?:(?:(\w+(?=[\/\s}]))|(?:(\w+)?(:)|(>)|!--((?:[^-]|-(?!-))*)--|(\*)))\s*((?:[^}]|}(?!}))*?)(\/)?|(?:\/(\w+)))}}/g

			rTmplString = new RegExp("<.*>|([^\\\\]|^)[{}]|" + openChars + ".*" + closeChars);
			// rTmplString looks for html tags or { or } char not preceded by \\, or JsRender tags {{xxx}}. Each of these strings are considered
			// NOT to be jQuery selectors
		}
		return [delimOpenChar0, delimOpenChar1, delimCloseChar0, delimCloseChar1, linkChar];
	}

	//=========
	// View.get
	//=========

	function getView(inner, type) { //view.get(inner, type)
		if (!type) {
			// view.get(type)
			type = inner;
			inner = undefined;
		}

		var views, i, l, found,
			view = this,
			root = !type || type === "root";
			// If type is undefined, returns root view (view under top view).

		if (inner) {
			// Go through views - this one, and all nested ones, depth-first - and return first one with given type.
			found = view.type === type ? view : undefined;
			if (!found) {
				views = view.views;
				if (view._.useKey) {
					for (i in views) {
						if (found = views[i].get(inner, type)) {
							break;
						}
					}
				} else for (i = 0, l = views.length; !found && i < l; i++) {
					found = views[i].get(inner, type);
				}
			}
		} else if (root) {
			// Find root view. (view whose parent is top view)
			while (view.parent.parent) {
				found = view = view.parent;
			}
		} else while (view && !found) {
			// Go through views - this one, and all parent ones - and return first one with given type.
			found = view.type === type ? view : undefined;
			view = view.parent;
		}
		return found;
	}

	function getIndex() {
		var view = this.get("item");
		return view ? view.index : undefined;
	}

	getIndex.depends = function() {
		return [this.get("item"), "index"];
	};

	//==========
	// View.hlp
	//==========

	function getHelper(helper) {
		// Helper method called as view.hlp(key) from compiled template, for helper functions or template parameters ~foo
		var wrapped,
			view = this,
			res = (view.ctx || {})[helper];

		res = res === undefined ? view.getRsc("helpers", helper) : res;

		if (res) {
			if (typeof res === "function") {
				wrapped = function() {
					// If it is of type function, we will wrap it so it gets called with view as 'this' context.
					// If the helper ~foo() was in a data-link expression, the view will have a 'temporary' linkCtx property too.
					// However note that helper functions on deeper paths will not have access to view and tagCtx.
					// For example, ~util.foo() will have the ~util object as 'this' pointer
					return res.apply(view, arguments);
				};
				$extend(wrapped, res);
			}
		}
		return wrapped || res;
	}

	//==============
	// jsviews._cnvt
	//==============

	function convertVal(converter, view, tagCtx) {
		// self is template object or linkCtx object
		var tmplConverter, tag, value,
			boundTagCtx = +tagCtx === tagCtx && tagCtx, // if value is an integer, then it is the key for the boundTagCtx
			linkCtx = view.linkCtx;

		if (boundTagCtx) {
			// Call compiled function which returns the tagCtxs for current data
			tagCtx = (boundTagCtx = view.tmpl.bnds[boundTagCtx-1])(view.data, view, $views);
		}

		value = tagCtx.args[0];

		if (converter || boundTagCtx) {
			tag = linkCtx && linkCtx.tag || {
				_: {
					inline: !linkCtx
				},
				tagName: converter + ":",
				flow: true,
				_is: "tag"
			};

			tag._.bnd = boundTagCtx;

			if (linkCtx) {
				linkCtx.tag = tag;
				tag.linkCtx = linkCtx;
				tagCtx.ctx = extendCtx(tagCtx.ctx, linkCtx.view.ctx);
			}
			tag.tagCtx = tagCtx;
			tagCtx.view = view;

			tag.ctx = tagCtx.ctx || {};
			delete tagCtx.ctx;
			// Provide this tag on view, for addBindingMarkers on bound tags to add the tag to view._.bnds, associated with the tag id,
			view._.tag = tag;

			converter = converter !== "true" && converter; // If there is a convertBack but no convert, converter will be "true"

			if (converter && ((tmplConverter = view.getRsc("converters", converter)) || error("Unknown converter: {{"+ converter + ":"))) {
				// A call to {{cnvt: ... }} or {^{cnvt: ... }} or data-link="{cnvt: ... }"
				tag.depends = tmplConverter.depends;
				value = tmplConverter.apply(tag, tagCtx.args);
			}
			// Call onRender (used by JsViews if present, to add binding annotations around rendered content)
			value = boundTagCtx && view._.onRender
				? view._.onRender(value, view, boundTagCtx)
				: value;
			view._.tag = undefined;
		}
		return value;
	}

	//=============
	// jsviews._tag
	//=============

	function getResource(resourceType, itemName) {
		var res,
			view = this,
			store = $views[resourceType];

		res = store && store[itemName];
		while ((res === undefined) && view) {
			store = view.tmpl[resourceType];
			res = store && store[itemName];
			view = view.parent;
		}
		return res;
	}

	function renderTag(tagName, parentView, tmpl, tagCtxs) {
		// Called from within compiled template function, to render a template tag
		// Returns the rendered tag

		var render, tag, tags, attr, parentTag, i, l, itemRet, tagCtx, tagCtxCtx, content, boundTagFn, tagDef, callInit,
			ret = "",
			boundTagKey = +tagCtxs === tagCtxs && tagCtxs, // if tagCtxs is an integer, then it is the boundTagKey
			linkCtx = parentView.linkCtx || 0,
			ctx = parentView.ctx,
			parentTmpl = tmpl || parentView.tmpl,
			parentView_ = parentView._;

		if (tagName._is === "tag") {
			tag = tagName;
			tagName = tag.tagName;
		}

		// Provide tagCtx, linkCtx and ctx access from tag
		if (boundTagKey) {
			// if tagCtxs is an integer, we are data binding
			// Call compiled function which returns the tagCtxs for current data
			tagCtxs = (boundTagFn = parentTmpl.bnds[boundTagKey-1])(parentView.data, parentView, $views);
		}

		l = tagCtxs.length;
		tag = tag || linkCtx.tag;
		for (i = 0; i < l; i++) {
			tagCtx = tagCtxs[i];

			// Set the tmpl property to the content of the block tag, unless set as an override property on the tag
			content = tagCtx.tmpl;
			content = tagCtx.content = content && parentTmpl.tmpls[content - 1];
			tmpl = tagCtx.props.tmpl;
			if (!i && (!tmpl || !tag)) {
				tagDef = parentView.getRsc("tags", tagName) || error("Unknown tag: {{"+ tagName + "}}");
			}
			tmpl = tmpl || (tag ? tag._def : tagDef).template || content;
			tmpl = "" + tmpl === tmpl // if a string
				? parentView.getRsc("templates", tmpl) || $templates(tmpl)
				: tmpl;

			$extend( tagCtx, {
				tmpl: tmpl,
				render: renderContent,
				index: i,
				view: parentView,
				ctx: extendCtx(tagCtx.ctx, ctx) // Extend parentView.ctx
			}); // Extend parentView.ctx

			if (!tag) {
				// This will only be hit for initial tagCtx (not for {{else}}) - if the tag instance does not exist yet
				// Instantiate tag if it does not yet exist
				if (tagDef._ctr) {
					// If the tag has not already been instantiated, we will create a new instance.
					// ~tag will access the tag, even within the rendering of the template content of this tag.
					// From child/descendant tags, can access using ~tag.parent, or ~parentTags.tagName
//	TODO provide error handling owned by the tag - using tag.onError
//				try {
					tag = new tagDef._ctr();
					callInit = !!tag.init;
//				}
//				catch(e) {
//					tagDef.onError(e);
//				}
					// Set attr on linkCtx to ensure outputting to the correct target attribute.
					tag.attr = tag.attr || tagDef.attr || undefined;
					// Setting either linkCtx.attr or this.attr in the init() allows per-instance choice of target attrib.
				} else {
					// This is a simple tag declared as a function, or with init set to false. We won't instantiate a specific tag constructor - just a standard instance object.
					tag = {
						// tag instance object if no init constructor
						render: tagDef.render
					};
				}
				tag._ = {
					inline: !linkCtx
				};
				if (linkCtx) {
					// Set attr on linkCtx to ensure outputting to the correct target attribute.
					linkCtx.attr = tag.attr = linkCtx.attr || tag.attr;
					linkCtx.tag = tag;
					tag.linkCtx = linkCtx;
				}
				if (tag._.bnd = boundTagFn || linkCtx) {
					// Bound if {^{tag...}} or data-link="{tag...}"
					tag._.arrVws = {};
				}
				tag.tagName = tagName;
				tag.parent = parentTag = ctx && ctx.tag;
				tag._is = "tag";
				tag._def = tagDef;
				// Provide this tag on view, for addBindingMarkers on bound tags to add the tag to view._.bnds, associated with the tag id,
			}
			parentView_.tag = tag;
			tagCtx.tag = tag;
			tag.tagCtxs = tagCtxs;
			if (!tag.flow) {
				tagCtxCtx = tagCtx.ctx = tagCtx.ctx || {};

				// tags hash: tag.ctx.tags, merged with parentView.ctx.tags,
				tags = tag.parents = tagCtxCtx.parentTags = ctx && extendCtx(tagCtxCtx.parentTags, ctx.parentTags) || {};
				if (parentTag) {
					tags[parentTag.tagName] = parentTag;
				}
				tagCtxCtx.tag = tag;
			}
		}
		tag.rendering = {}; // Provide object for state during render calls to tag and elses. (Used by {{if}} and {{for}}...)
		for (i = 0; i < l; i++) {
			tagCtx = tag.tagCtx = tagCtxs[i];
			tag.ctx = tagCtx.ctx;

			if (!i && callInit) {
				tag.init(tagCtx, linkCtx, tag.ctx);
				callInit = undefined;
			}

			if (render = tag.render) {
				itemRet = render.apply(tag, tagCtx.args);
			}
			ret += itemRet !== undefined
				? itemRet   // Return result of render function unless it is undefined, in which case return rendered template
				: tagCtx.tmpl
					// render template/content on the current data item
					? tagCtx.render()
					: ""; // No return value from render, and no template/content defined, so return ""
		}
		delete tag.rendering;

		tag.tagCtx = tag.tagCtxs[0];
		tag.ctx= tag.tagCtx.ctx;

		if (tag._.inline && (attr = tag.attr) && attr !== "html") {
			ret = attr === "text"
				? $converters.html(ret)
				: "";
		}
		return boundTagKey && parentView._.onRender
			// Call onRender (used by JsViews if present, to add binding annotations around rendered content)
			? parentView._.onRender(ret, parentView, boundTagKey)
			: ret;
	}

	//=================
	// View constructor
	//=================

	function View(context, type, parentView, data, template, key, contentTmpl, onRender) {
		// Constructor for view object in view hierarchy. (Augmented by JsViews if JsViews is loaded)
		var views, parentView_, tag,
			isArray = type === "array",
			self_ = {
				key: 0,
				useKey: isArray ? 0 : 1,
				id: "" + viewId++,
				onRender: onRender,
				bnds: {}
			},
			self = {
				data: data,
				tmpl: template,
				content: contentTmpl,
				views: isArray ? [] : {},
				parent: parentView,
				ctx: context,
				type: type,
				// If the data is an array, this is an 'array view' with a views array for each child 'item view'
				// If the data is not an array, this is an 'item view' with a views 'map' object for any child nested views
				// ._.useKey is non zero if is not an 'array view' (owning a data array). Uuse this as next key for adding to child views map
				get: getView,
				getIndex: getIndex,
				getRsc: getResource,
				hlp: getHelper,
				_: self_,
				_is: "view"
		};
		if (parentView) {
			views = parentView.views;
			parentView_ = parentView._;
			if (parentView_.useKey) {
				// Parent is an 'item view'. Add this view to its views object
				// self._key = is the key in the parent view map
				views[self_.key = "_" + parentView_.useKey++] = self;
				tag = parentView_.tag;
				self_.bnd = isArray && (!tag || !!tag._.bnd && tag); // For array views that are data bound for collection change events, set the
				// view._.bnd property to true for top-level link() or data-link="{for}", or to the tag instance for a data- bound tag, e.g. {^{for ...}}
			} else {
				// Parent is an 'array view'. Add this view to its views array
				views.splice(
					// self._.key = self.index - the index in the parent view array
					self_.key = self.index =
						key !== undefined
							? key
							: views.length,
				0, self);
			}
			// If no context was passed in, use parent context
			// If context was passed in, it should have been merged already with parent context
			self.ctx = context || parentView.ctx;
		}
		return self;
	}

	//=============
	// Registration
	//=============

	function compileChildResources(parentTmpl) {
		var storeName, resources, resourceName, settings, compile;
		for (storeName in jsvStores) {
			settings = jsvStores[storeName];
			if ((compile = settings.compile) && (resources = parentTmpl[storeName + "s"])) {
				for (resourceName in resources) {
					// compile child resource declarations (templates, tags, converters or helpers)
					resources[resourceName] = compile(resourceName, resources[resourceName], parentTmpl, storeName, settings);
				}
			}
		}
	}

	function compileTag(name, tagDef, parentTmpl) {
		var init, tmpl;
		if (typeof tagDef === "function") {
			// Simple tag declared as function. No presenter instantation.
			tagDef = {
				depends: tagDef.depends,
				render: tagDef
			};
		} else {
			// Tag declared as object, used as the prototype for tag instantiation (control/presenter)
			if (tmpl = tagDef.template) {
				tagDef.template = "" + tmpl === tmpl ? ($templates[tmpl] || $templates(tmpl)) : tmpl;
			}
			if (tagDef.init !== false) {
				init = tagDef._ctr = function(tagCtx) {};
				(init.prototype = tagDef).constructor = init;
			}
		}
		if (parentTmpl) {
			tagDef._parentTmpl = parentTmpl;
		}
//TODO	tagDef.onError = function(e) {
//			var error;
//			if (error = this.prototype.onError) {
//				error.call(this, e);
//			} else {
//				throw e;
//			}
//		}
		return tagDef;
	}

	function compileTmpl(name, tmpl, parentTmpl, storeName, storeSettings, options) {
		// tmpl is either a template object, a selector for a template script block, the name of a compiled template, or a template object

		//==== nested functions ====
		function tmplOrMarkupFromStr(value) {
			// If value is of type string - treat as selector, or name of compiled template
			// Return the template object, if already compiled, or the markup string

			if (("" + value === value) || value.nodeType > 0) {
				try {
					elem = value.nodeType > 0
					? value
					: !rTmplString.test(value)
					// If value is a string and does not contain HTML or tag content, then test as selector
						&& jQuery && jQuery(global.document).find(value)[0];
					// If selector is valid and returns at least one element, get first element
					// If invalid, jQuery will throw. We will stay with the original string.
				} catch (e) {}

				if (elem) {
					// Generally this is a script element.
					// However we allow it to be any element, so you can for example take the content of a div,
					// use it as a template, and replace it by the same content rendered against data.
					// e.g. for linking the content of a div to a container, and using the initial content as template:
					// $.link("#content", model, {tmpl: "#content"});

					value = elem.getAttribute(tmplAttr);
					name = name || value;
					value = $templates[value];
					if (!value) {
						// Not already compiled and cached, so compile and cache the name
						// Create a name for compiled template if none provided
						name = name || "_" + autoTmplName++;
						elem.setAttribute(tmplAttr, name);
						// Use tmpl as options
						value = $templates[name] = compileTmpl(name, elem.innerHTML, parentTmpl, storeName, storeSettings, options);
					}
				}
				return value;
			}
			// If value is not a string, return undefined
		}

		var tmplOrMarkup, elem;

		//==== Compile the template ====
		tmpl = tmpl || "";
		tmplOrMarkup = tmplOrMarkupFromStr(tmpl);

		// If options, then this was already compiled from a (script) element template declaration.
		// If not, then if tmpl is a template object, use it for options
		options = options || (tmpl.markup ? tmpl : {});
		options.tmplName = name;
		if (parentTmpl) {
			options._parentTmpl = parentTmpl;
		}
		// If tmpl is not a markup string or a selector string, then it must be a template object
		// In that case, get it from the markup property of the object
		if (!tmplOrMarkup && tmpl.markup && (tmplOrMarkup = tmplOrMarkupFromStr(tmpl.markup))) {
			if (tmplOrMarkup.fn && (tmplOrMarkup.debug !== tmpl.debug || tmplOrMarkup.allowCode !== tmpl.allowCode)) {
				// if the string references a compiled template object, but the debug or allowCode props are different, need to recompile
				tmplOrMarkup = tmplOrMarkup.markup;
			}
		}
		if (tmplOrMarkup !== undefined) {
			if (name && !parentTmpl) {
				$render[name] = function() {
					return tmpl.render.apply(tmpl, arguments);
				};
			}
			if (tmplOrMarkup.fn || tmpl.fn) {
				// tmpl is already compiled, so use it, or if different name is provided, clone it
				if (tmplOrMarkup.fn) {
					if (name && name !== tmplOrMarkup.tmplName) {
						tmpl = extendCtx(options, tmplOrMarkup);
					} else {
						tmpl = tmplOrMarkup;
					}
				}
			} else {
				// tmplOrMarkup is a markup string, not a compiled template
				// Create template object
				tmpl = TmplObject(tmplOrMarkup, options);
				// Compile to AST and then to compiled function
				tmplFn(tmplOrMarkup, tmpl);
			}
			compileChildResources(options);
			return tmpl;
		}
	}
	//==== /end of function compile ====

	function TmplObject(markup, options) {
		// Template object constructor
		var htmlTag,
			wrapMap = $viewsSettings.wrapMap || {},
			tmpl = $extend(
				{
					markup: markup,
					tmpls: [],
					links: {}, // Compiled functions for link expressions
					tags: {}, // Compiled functions for bound tag expressions
					bnds: [],
					_is: "template",
					render: renderContent
				},
				options
			);

		if (!options.htmlTag) {
			// Set tmpl.tag to the top-level HTML tag used in the template, if any...
			htmlTag = rFirstElem.exec(markup);
			tmpl.htmlTag = htmlTag ? htmlTag[1].toLowerCase() : "";
		}
		htmlTag = wrapMap[tmpl.htmlTag];
		if (htmlTag && htmlTag !== wrapMap.div) {
			// When using JsViews, we trim templates which are inserted into HTML contexts where text nodes are not rendered (i.e. not 'Phrasing Content').
			tmpl.markup = $.trim(tmpl.markup);
			tmpl._elCnt = true; // element content model (no rendered text nodes), not phrasing content model
		}

		return tmpl;
	}

	function registerStore(storeName, storeSettings) {

		function theStore(name, item, parentTmpl) {
			// The store is also the function used to add items to the store. e.g. $.templates, or $.views.tags

			// For store of name 'thing', Call as:
			//    $.views.things(items[, parentTmpl]),
			// or $.views.things(name, item[, parentTmpl])

			var onStore, compile, itemName, thisStore;

			if (name && "" + name !== name && !name.nodeType && !name.markup) {
				// Call to $.views.things(items[, parentTmpl]),

				// Adding items to the store
				// If name is a map, then item is parentTmpl. Iterate over map and call store for key.
				for (itemName in name) {
					theStore(itemName, name[itemName], item);
				}
				return $views;
			}
			// Adding a single unnamed item to the store
			if (item === undefined) {
				item = name;
				name = undefined;
			}
			if (name && "" + name !== name) { // name must be a string
				parentTmpl = item;
				item = name;
				name = undefined;
			}
			thisStore = parentTmpl ? parentTmpl[storeNames] = parentTmpl[storeNames] || {} : theStore;
			compile = storeSettings.compile;
			if (onStore = $viewsSub.onBeforeStoreItem) {
				// e.g. provide an external compiler or preprocess the item.
				compile = onStore(thisStore, name, item, compile) || compile;
			}
			if (!name) {
				item = compile(undefined, item);
			} else if (item === null) {
				// If item is null, delete this entry
				delete thisStore[name];
			} else {
				thisStore[name] = compile ? (item = compile(name, item, parentTmpl, storeName, storeSettings)) : item;
			}
			if (item) {
				item._is = storeName;
			}
			if (onStore = $viewsSub.onStoreItem) {
				// e.g. JsViews integration
				onStore(thisStore, name, item, compile);
			}
			return item;
		}

		var storeNames = storeName + "s";

		$views[storeNames] = theStore;
		jsvStores[storeName] = storeSettings;
	}

	//==============
	// renderContent
	//==============

	function renderContent(data, context, parentView, key, isLayout, onRender) {
		// Render template against data as a tree of subviews (nested rendered template instances), or as a string (top-level template).
		// If the data is the parent view, treat as layout template, re-render with the same data context.
		var i, l, dataItem, newView, childView, itemResult, swapContent, tagCtx, contentTmpl, tag_, outerOnRender, tmplName, tmpl,
			self = this,
			allowDataLink = !self.attr || self.attr === "html",
			result = "";

		if (key === true) {
			swapContent = true;
			key = 0;
		}
		if (self.tag) {
			// This is a call from renderTag or tagCtx.render()
			tagCtx = self;
			self = self.tag;
			tag_ = self._;
			tmplName = self.tagName;
			tmpl = tagCtx.tmpl;
			context = extendCtx(context, self.ctx);
			contentTmpl = tagCtx.content; // The wrapped content - to be added to views, below
			if ( tagCtx.props.link === false ) {
				// link=false setting on block tag
				// We will override inherited value of link by the explicit setting link=false taken from props
				// The child views of an unlinked view are also unlinked. So setting child back to true will not have any effect.
				context = context || {};
				context.link = false;
			}
			parentView = parentView || tagCtx.view;
			data = data === undefined ? parentView : data;
		} else {
			tmpl = self.jquery && (self[0] || error('Unknown template: "' + self.selector + '"')) // This is a call from $(selector).render
				|| self;
		}
		if (tmpl) {
			if (!parentView && data && data._is === "view") {
				parentView = data; // When passing in a view to render or link (and not passing in a parent view) use the passed in view as parentView
			}
			if (parentView) {
				contentTmpl = contentTmpl || parentView.content; // The wrapped content - to be added as #content property on views, below
				onRender = onRender || parentView._.onRender;
				if (data === parentView) {
					// Inherit the data from the parent view.
					// This may be the contents of an {{if}} block
					// Set isLayout = true so we don't iterate the if block if the data is an array.
					data = parentView.data;
					isLayout = true;
				}
				context = extendCtx(context, parentView.ctx);
			}
			if (!parentView || parentView.data === undefined) {
				(context = context || {}).root = data; // Provide ~root as shortcut to top-level data.
			}

			// Set additional context on views created here, (as modified context inherited from the parent, and to be inherited by child views)
			// Note: If no jQuery, $extend does not support chained copies - so limit extend() to two parameters

			if (!tmpl.fn) {
				tmpl = $templates[tmpl] || $templates(tmpl);
			}

			if (tmpl) {
				onRender = (context && context.link) !== false && allowDataLink && onRender;
				// If link===false, do not call onRender, so no data-linking marker nodes
				outerOnRender = onRender;
				if (onRender === true) {
					// Used by view.refresh(). Don't create a new wrapper view.
					outerOnRender = undefined;
					onRender = parentView._.onRender;
				}
				if ($.isArray(data) && !isLayout) {
					// Create a view for the array, whose child views correspond to each data item. (Note: if key and parentView are passed in
					// along with parent view, treat as insert -e.g. from view.addViews - so parentView is already the view item for array)
					newView = swapContent
						? parentView :
						(key !== undefined && parentView) || View(context, "array", parentView, data, tmpl, key, contentTmpl, onRender);
					for (i = 0, l = data.length; i < l; i++) {
						// Create a view for each data item.
						dataItem = data[i];
						childView = View(context, "item", newView, dataItem, tmpl, (key || 0) + i, contentTmpl, onRender);
						itemResult = tmpl.fn(dataItem, childView, $views);
						result += newView._.onRender ? newView._.onRender(itemResult, childView) : itemResult;
					}
				} else {
					// Create a view for singleton data object. The type of the view will be the tag name, e.g. "if" or "myTag" except for
					// "item", "array" and "data" views. A "data" view is from programatic render(object) against a 'singleton'.
					newView = swapContent ? parentView : View(context, tmplName||"data", parentView, data, tmpl, key, contentTmpl, onRender);
					if (tag_ && !self.flow) {
						newView.tag = self;
					}
					result += tmpl.fn(data, newView, $views);
				}
				return outerOnRender ? outerOnRender(result, newView) : result;
			}
		}
		return "";
	}

	//===========================
	// Build and compile template
	//===========================

	// Generate a reusable function that will serve to render a template against data
	// (Compile AST then build template function)

	function error(message) {
		throw new $views.sub.Error(message);
	}

	function syntaxError(message) {
		error("Syntax error\n" + message);
	}

	function tmplFn(markup, tmpl, isLinkExpr, convertBack) {
		// Compile markup to AST (abtract syntax tree) then build the template function code from the AST nodes
		// Used for compiling templates, and also by JsViews to build functions for data link expressions

		//==== nested functions ====
		function pushprecedingContent(shift) {
			shift -= loc;
			if (shift) {
				content.push(markup.substr(loc, shift).replace(rNewLine, "\\n"));
			}
		}

		function blockTagCheck(tagName) {
			tagName && syntaxError('Unmatched or missing tag: "{{/' + tagName + '}}" in template:\n' + markup);
		}

		function parseTag(all, bind, tagName, converter, colon, html, comment, codeTag, params, slash, closeBlock, index) {

			//    bind         tag        converter colon html     comment            code      params            slash   closeBlock
			// /{(\^)?{(?:(?:(\w+(?=[\/\s}]))|(?:(\w+)?(:)|(>)|!--((?:[^-]|-(?!-))*)--|(\*)))\s*((?:[^}]|}(?!}))*?)(\/)?|(?:\/(\w+)))}}/g
			// Build abstract syntax tree (AST): [ tagName, converter, params, content, hash, bindings, contentMarkup ]
			if (html) {
				colon = ":";
				converter = "html";
			}
			slash = slash || isLinkExpr;
			var noError, current0,
				pathBindings = bind && [],
				code = "",
				hash = "",
				passedCtx = "",
				// Block tag if not self-closing and not {{:}} or {{>}} (special case) and not a data-link expression
				block = !slash && !colon && !comment;

			//==== nested helper function ====
			tagName = tagName || colon;
			pushprecedingContent(index);
			loc = index + all.length; // location marker - parsed up to here
			if (codeTag) {
				if (allowCode) {
					content.push(["*", "\n" + params.replace(rUnescapeQuotes, "$1") + "\n"]);
				}
			} else if (tagName) {
				if (tagName === "else") {
					if (rTestElseIf.test(params)) {
						syntaxError('for "{{else if expr}}" use "{{else expr}}"');
					}
					pathBindings = current[6];
					current[7] = markup.substring(current[7], index); // contentMarkup for block tag
					current = stack.pop();
					content = current[3];
					block = true;
				}
				if (params) {
					// remove newlines from the params string, to avoid compiled code errors for unterminated strings
					params = params.replace(rNewLine, " ");
					code = parseParams(params, pathBindings, tmpl)
						.replace(rBuildHash, function(all, isCtx, keyValue) {
							if (isCtx) {
								passedCtx += keyValue + ",";
							} else {
								hash += keyValue + ",";
							}
							return "";
						});
				}
				hash = hash.slice(0, -1);
				code = code.slice(0, -1);
				noError = hash && (hash.indexOf("noerror:true") + 1) && hash || "";

				newNode = [
						tagName,
						converter || !!convertBack || "",
						code,
						block && [],
						'params:"' + params + '",props:{' + hash + "}"
							+ (passedCtx ? ",ctx:{" + passedCtx.slice(0, -1) + "}" : ""),
						noError,
						pathBindings || 0
					];
				content.push(newNode);
				if (block) {
					stack.push(current);
					current = newNode;
					current[7] = loc; // Store current location of open tag, to be able to add contentMarkup when we reach closing tag
				}
			} else if (closeBlock) {
				current0 = current[0];
				blockTagCheck(closeBlock !== current0 && current0 !== "else" && closeBlock);
				current[7] = markup.substring(current[7], index); // contentMarkup for block tag
				current = stack.pop();
			}
			blockTagCheck(!current && closeBlock);
			content = current[3];
		}
		//==== /end of nested functions ====

		var newNode,
			allowCode = tmpl && tmpl.allowCode,
			astTop = [],
			loc = 0,
			stack = [],
			content = astTop,
			current = [, , , astTop];

		markup = markup.replace(rEscapeQuotes, "\\$&");

//TODO	result = tmplFnsCache[markup]; // Only cache if template is not named and markup length < ...,
//and there are no bindings or subtemplates?? Consider standard optimization for data-link="a.b.c"
//		if (result) {
//			tmpl.fn = result;
//		} else {

//		result = markup;

		blockTagCheck(stack[0] && stack[0][3].pop()[0]);

		// Build the AST (abstract syntax tree) under astTop
		markup.replace(rTag, parseTag);

		pushprecedingContent(markup.length);

		if (loc = astTop[astTop.length - 1]) {
			blockTagCheck("" + loc !== loc && (+loc[7] === loc[7]) && loc[0]);
		}
//			result = tmplFnsCache[markup] = buildCode(astTop, tmpl);
//		}
		return buildCode(astTop, isLinkExpr ? markup : tmpl, isLinkExpr);
	}

	function buildCode(ast, tmpl, isLinkExpr) {
		// Build the template function code from the AST nodes, and set as property on the passed-in template object
		// Used for compiling templates, and also by JsViews to build functions for data link expressions
		var i, node, tagName, converter, params, hash, hasTag, hasEncoder, getsVal, hasCnvt, useCnvt, tmplBindings, pathBindings,
			nestedTmpls, tmplName, nestedTmpl, tagAndElses, content, markup, nextIsElse, oldCode, isElse, isGetVal, prm, tagCtxFn,
			tmplBindingKey = 0,
			code = "",
			noError = "",
			tmplOptions = {},
			l = ast.length;

		if ("" + tmpl === tmpl) {
			tmplName = isLinkExpr ? 'data-link="' + tmpl.replace(rNewLine, " ").slice(1, -1) + '"' : tmpl;
			tmpl = 0;
		} else {
			tmplName = tmpl.tmplName || "unnamed";
			if (tmpl.allowCode) {
				tmplOptions.allowCode = true;
			}
			if (tmpl.debug) {
				tmplOptions.debug = true;
			}
			tmplBindings = tmpl.bnds;
			nestedTmpls = tmpl.tmpls;
		}
		for (i = 0; i < l; i++) {
			// AST nodes: [ tagName, converter, params, content, hash, noError, pathBindings, contentMarkup, link ]
			node = ast[i];

			// Add newline for each callout to t() c() etc. and each markup string
			if ("" + node === node) {
				// a markup string to be inserted
				code += '\nret+="' + node + '";';
			} else {
				// a compiled tag expression to be inserted
				tagName = node[0];
				if (tagName === "*") {
					// Code tag: {{* }}
					code += "" + node[1];
				} else {
					converter = node[1];
					params = node[2];
					content = node[3];
					hash = node[4];
					noError = node[5];
					markup = node[7];

					if (!(isElse = tagName === "else")) {
						tmplBindingKey = 0;
						if (tmplBindings && (pathBindings = node[6])) { // Array of paths, or false if not data-bound
							tmplBindingKey = tmplBindings.push(pathBindings);
						}
					}
					if (isGetVal = tagName === ":") {
						if (converter) {
							tagName = converter === "html" ? ">" : converter + tagName;
						}
						if (noError) {
							// If the tag includes noerror=true, we will do a try catch around expressions for named or unnamed parameters
							// passed to the tag, and return the empty string for each expression if it throws during evaluation
							//TODO This does not work for general case - supporting noError on multiple expressions, e.g. tag args and properties.
							//Consider replacing with try<a.b.c(p,q) + a.d, xxx> and return the value of the expression a.b.c(p,q) + a.d, or, if it throws, return xxx||'' (rather than always the empty string)
							prm = "prm" + i;
							noError = "try{var " + prm + "=[" + params + "][0];}catch(e){" + prm + '="";}\n';
							params = prm;
						}
					} else {
						if (content) {
							// Create template object for nested template
							nestedTmpl = TmplObject(markup, tmplOptions);
							nestedTmpl.tmplName = tmplName + "/" + tagName;
							// Compile to AST and then to compiled function
							buildCode(content, nestedTmpl);
							nestedTmpls.push(nestedTmpl);
						}

						if (!isElse) {
							// This is not an else tag.
							tagAndElses = tagName;
							// Switch to a new code string for this bound tag (and its elses, if it has any) - for returning the tagCtxs array
							oldCode = code;
							code = "";
						}
						nextIsElse = ast[i + 1];
						nextIsElse = nextIsElse && nextIsElse[0] === "else";
					}

					hash += ",args:[" + params + "]}";

					if (isGetVal && pathBindings || converter && tagName !== ">") {
						// For convertVal we need a compiled function to return the new tagCtx(s)
						tagCtxFn = new Function("data,view,j,u", " // "
									+ tmplName + " " + tmplBindingKey + " " + tagName + "\n" + noError + "return {" + hash + ";");
						tagCtxFn.paths = pathBindings;
						tagCtxFn._ctxs = tagName;
						if (isLinkExpr) {
							return tagCtxFn;
						}
						useCnvt = 1;
					}

					code += (isGetVal
						? "\n" + (pathBindings ? "" : noError) + (isLinkExpr ? "return " : "ret+=") + (useCnvt // Call _cnvt if there is a converter: {{cnvt: ... }} or {^{cnvt: ... }}
							? (useCnvt = 0, hasCnvt = true, 'c("' + converter + '",view,' + (pathBindings
								? ((tmplBindings[tmplBindingKey - 1] = tagCtxFn), tmplBindingKey) // Store the compiled tagCtxFn in tmpl.bnds, and pass the key to convertVal()
								: "{" + hash) + ");")
							: tagName === ">"
								? (hasEncoder = true, "h(" + params + ");")
								: (getsVal = true, "(v=" + params + ")!=" + (isLinkExpr ? "=" : "") + 'u?v:"";') // Strict equality just for data-link="title{:expr}" so expr=null will remove title attribute 
						)
						: (hasTag = true, "{tmpl:" // Add this tagCtx to the compiled code for the tagCtxs to be passed to renderTag()
							+ (content ? nestedTmpls.length: "0") + "," // For block tags, pass in the key (nestedTmpls.length) to the nested content template
							+ hash + ","));

					if (tagAndElses && !nextIsElse) {
						code = "[" + code.slice(0, -1) + "]"; // This is a data-link expression or the last {{else}} of an inline bound tag. We complete the code for returning the tagCtxs array
						if (isLinkExpr || pathBindings) {
							// This is a bound tag (data-link expression or inline bound tag {^{tag ...}}) so we store a compiled tagCtxs function in tmp.bnds
							code = new Function("data,view,j,u", " // " + tmplName + " " + tmplBindingKey + " " + tagAndElses + "\nreturn " + code + ";");
							if (pathBindings) {
								(tmplBindings[tmplBindingKey - 1] = code).paths = pathBindings;
							}
							code._ctxs = tagName;
							if (isLinkExpr) {
								return code; // For a data-link expression we return the compiled tagCtxs function
							}
						}

						// This is the last {{else}} for an inline tag.
						// For a bound tag, pass the tagCtxs fn lookup key to renderTag.
						// For an unbound tag, include the code directly for evaluating tagCtxs array
						code = oldCode + '\nret+=t("' + tagAndElses + '",view,this,' + (tmplBindingKey || code) + ");";
						pathBindings = 0;
						tagAndElses = 0;
					}
				}
			}
		}
		// Include only the var references that are needed in the code
		code = "// " + tmplName
			+ "\nvar j=j||" + (jQuery ? "jQuery." : "js") + "views"
			+ (getsVal ? ",v" : "")                      // gets value
			+ (hasTag ? ",t=j._tag" : "")                // has tag
			+ (hasCnvt ? ",c=j._cnvt" : "")              // converter
			+ (hasEncoder ? ",h=j.converters.html" : "") // html converter
			+ (isLinkExpr ? ";\n" : ',ret="";\n')
			+ ($viewsSettings.tryCatch ? "try{\n" : "")
			+ (tmplOptions.debug ? "debugger;" : "")
			+ code + (isLinkExpr ? "\n" : "\nreturn ret;\n")
			+ ($viewsSettings.tryCatch ? "\n}catch(e){return j._err(e);}" : "");
		try {
			code = new Function("data,view,j,u", code);
		} catch (e) {
			syntaxError("Compiled template code:\n\n" + code, e);
		}
		if (tmpl) {
			tmpl.fn = code;
		}
		return code;
	}

	function parseParams(params, bindings, tmpl) {

		//function pushBindings() { // Consider structured path bindings
		//	if (bindings) {
		//		named ? bindings[named] = bindings.pop(): bindings.push(list = []);
		//	}
		//}

		function parseTokens(all, lftPrn0, lftPrn, path, operator, err, eq, path2, prn, comma, lftPrn2, apos, quot, rtPrn, rtPrnDot, prn2, space, index, full) {
			// rParams = /(\()(?=\s*\()|(?:([([])\s*)?(?:([#~]?[\w$.^]+)?\s*((\+\+|--)|\+|-|&&|\|\||===|!==|==|!=|<=|>=|[<>%*!:?\/]|(=))\s*|([#~]?[\w$.^]+)([([])?)|(,\s*)|(\(?)\\?(?:(')|("))|(?:\s*((\))(?=\s*\.|\s*\^)|\)|\])([([]?))|(\s+)/g,
			//          lftPrn        lftPrn2                 path    operator err                                                eq          path2       prn    comma   lftPrn2   apos quot      rtPrn rtPrnDot           prn2   space
			// (left paren? followed by (path? followed by operator) or (path followed by paren?)) or comma or apos or quot or right paren or space
			var expr;
			operator = operator || "";
			lftPrn = lftPrn || lftPrn0 || lftPrn2;
			path = path || path2;
			prn = prn || prn2 || "";

			function parsePath(all, object, helper, view, viewProperty, pathTokens, leafToken) {
				// rPath = /^(?:null|true|false|\d[\d.]*|([\w$]+|~([\w$]+)|#(view|([\w$]+))?)([\w$.^]*?)(?:[.[^]([\w$]+)\]?)?)$/g,
				//                                        object   helper    view  viewProperty pathTokens       leafToken
				if (object) {
					bindings && !isAlias && bindings.push(path); // Add path binding for paths on props and args,
					// but not within foo=expr (named parameter) or ~foo=expr (passing in template parameter aliases).
//					bindings && !isAlias && list.push(path);
					if (object !== ".") {
						var ret = (helper
								? 'view.hlp("' + helper + '")'
								: view
									? "view"
									: "data")
							+ (leafToken
								? (viewProperty
									? "." + viewProperty
									: helper
										? ""
										: (view ? "" : "." + object)
									) + (pathTokens || "")
								: (leafToken = helper ? "" : view ? viewProperty || "" : object, ""));

						ret = ret + (leafToken ? "." + leafToken : "");

						return ret.slice(0, 9) === "view.data"
							? ret.slice(5) // convert #view.data... to data...
							: ret;
					}
				}
				return all;
			}

			if (err) {
				syntaxError(params);
			} else {
				if (bindings && rtPrnDot) {
					// This is a binding to a path in which an object is returned by a helper/data function/expression, e.g. foo()^x.y or (a?b:c)^x.y
					// We create a compiled function to get the object instance (which will be called when the dependent data of the subexpression changes, to return the new object, and trigger re-binding of the subsequent path)
					expr = pathStart[parenDepth];
					if (full.length - 2 > index - expr) { // We need to compile a subexpression
						expr = full.slice(expr, index + 1);
						rtPrnDot = delimOpenChar1 + ":" + expr + delimCloseChar0; // The parameter or function subexpression
						rtPrnDot = tmplLinks[rtPrnDot] = tmplLinks[rtPrnDot] || tmplFn(delimOpenChar0 + rtPrnDot + delimCloseChar1, tmpl, true); // Compile the expression (or use cached copy already in tmpl.links)
						if (!rtPrnDot.paths) {
							parseParams(expr, rtPrnDot.paths = [], tmpl);
						}
						bindings.push({_jsvOb: rtPrnDot}); // Insert special object for in path bindings, to be used for binding the compiled sub expression ()
						//list.push({_jsvOb: rtPrnDot});
					}
				}
				return (aposed
					// within single-quoted string
					? (aposed = !apos, (aposed ? all : '"'))
					: quoted
					// within double-quoted string
						? (quoted = !quot, (quoted ? all : '"'))
						:
					(
						(lftPrn
								? (parenDepth++, pathStart[parenDepth] = index++, lftPrn)
								: "")
						+ (space
							? (parenDepth
								? ""
								//: (pushBindings(), named
								//	? (named = isAlias = false, "\b")
								//	: ",")
								: named
									? (named = isAlias = false, "\b")
									: ","
							)
							: eq
					// named param
					// Insert backspace \b (\x08) as separator for named params, used subsequently by rBuildHash
								? (parenDepth && syntaxError(params), named = path, /*pushBindings(),*/isAlias = path.charAt(0) === "~", '\b' + path + ':')
								: path
					// path
									? (path.split("^").join(".").replace(rPath, parsePath)
										+ (prn
											? (fnCall[++parenDepth] = true, path.charAt(0) !== "." && (pathStart[parenDepth] = index), prn)
											: operator)
									)
									: operator
										? operator
										: rtPrn
					// function
											? ((fnCall[parenDepth--] = false, rtPrn)
												+ (prn
													? (fnCall[++parenDepth] = true, prn)
													: "")
											)
											: comma
												? (fnCall[parenDepth] || syntaxError(params), ",") // We don't allow top-level literal arrays or objects
												: lftPrn0
													? ""
													: (aposed = apos, quoted = quot, '"')
					))
				);
			}
		}

		var named, isAlias,// list,
			tmplLinks = tmpl.links,
			fnCall = {},
			pathStart = {0:-1},
			parenDepth = 0,
			quoted = false, // boolean for string content in double quotes
			aposed = false; // or in single quotes

		//pushBindings();

		return (params + " ").replace(rParams, parseTokens);
	}

	//==========
	// Utilities
	//==========

	// Merge objects, in particular contexts which inherit from parent contexts
	function extendCtx(context, parentContext) {
		// Return copy of parentContext, unless context is defined and is different, in which case return a new merged context
		// If neither context nor parentContext are undefined, return undefined
		return context && context !== parentContext
			? (parentContext
				? $extend($extend({}, parentContext), context)
				: context)
			: parentContext && $extend({}, parentContext);
	}

	// Get character entity for HTML and Attribute encoding
	function getCharEntity(ch) {
		return charEntities[ch] || (charEntities[ch] = "&#" + ch.charCodeAt(0) + ";");
	}

	//========================== Initialize ==========================

	for (jsvStoreName in jsvStores) {
		registerStore(jsvStoreName, jsvStores[jsvStoreName]);
	}

	var $templates = $views.templates,
		$converters = $views.converters,
		$helpers = $views.helpers,
		$tags = $views.tags,
		$viewsSub = $views.sub,
		$viewsSettings = $views.settings;

	if (jQuery) {
		////////////////////////////////////////////////////////////////////////////////////////////////
		// jQuery is loaded, so make $ the jQuery object
		$ = jQuery;
		$.fn.render = renderContent;

	} else {
		////////////////////////////////////////////////////////////////////////////////////////////////
		// jQuery is not loaded.

		$ = global.jsviews = {};

		$.isArray = Array && Array.isArray || function(obj) {
			return Object.prototype.toString.call(obj) === "[object Array]";
		};

	//	//========================== Future Node.js support ==========================
	//	if ((nodeJsModule = global.module) && nodeJsModule.exports) {
	//		nodeJsModule.exports = $;
	//	}
	}

	$.render = $render;
	$.views = $views;
	$.templates = $templates = $views.templates;

	//========================== Register tags ==========================

	$tags({
		"else": function() {}, // Does nothing but ensures {{else}} tags are recognized as valid
		"if": {
			render: function(val) {
				// This function is called once for {{if}} and once for each {{else}}.
				// We will use the tag.rendering object for carrying rendering state across the calls.
				// If not done (a previous block has not been rendered), look at expression for this block and render the block if expression is truthy
				// Otherwise return ""
				var self = this,
					ret = (self.rendering.done || !val && (arguments.length || !self.tagCtx.index))
						? ""
						: (self.rendering.done = true, self.selected = self.tagCtx.index,
							// Test is satisfied, so render content on current context. We call tagCtx.render() rather than return undefined
							// (which would also render the tmpl/content on the current context but would iterate if it is an array)
							self.tagCtx.render());
				return ret;
			},
			onUpdate: function(ev, eventArgs, tagCtxs) {
				var tci, prevArg, different;
				for (tci = 0; (prevArg = this.tagCtxs[tci]) && prevArg.args.length; tci++) {
					prevArg = prevArg.args[0];
					different = !prevArg !== !tagCtxs[tci].args[0];
					if (!!prevArg || different) {
						return different;
						// If newArg and prevArg are both truthy, return false to cancel update. (Even if values on later elses are different, we still don't want to update, since rendered output would be unchanged)
						// If newArg and prevArg are different, return true, to update
						// If newArg and prevArg are both falsey, move to the next {{else ...}}
					}
				}
				// Boolean value of all args are unchanged (falsey), so return false to cancel update
				return false;
			},
			flow: true
		},
		"for": {
			render: function(val) {
				// This function is called once for {{for}} and once for each {{else}}.
				// We will use the tag.rendering object for carrying rendering state across the calls.
				var self = this,
					tagCtx = self.tagCtx,
					noArg = !arguments.length,
					result = "",
					done = noArg || 0;

				if (!self.rendering.done) {
					if (noArg) {
						result = undefined;
					} else if (val !== undefined) {
						result += tagCtx.render(val);
						// {{for}} (or {{else}}) with no argument will render the block content
						done += $.isArray(val) ? val.length : 1;
					}
					if (self.rendering.done = done) {
						self.selected = tagCtx.index;
					}
					// If nothing was rendered we will look at the next {{else}}. Otherwise, we are done.
				}
				return result;
			},
			//onUpdate: function(ev, eventArgs, tagCtxs) {
				//Consider adding filtering for perf optimization. However the below prevents update on some scenarios which _should_ update - namely when there is another array on which for also depends.
				//var i, l, tci, prevArg;
				//for (tci = 0; (prevArg = this.tagCtxs[tci]) && prevArg.args.length; tci++) {
				//	if (prevArg.args[0] !== tagCtxs[tci].args[0]) {
				//		return true;
				//	}
				//}
				//return false;
			//},
			onArrayChange: function(ev, eventArgs) {
				var arrayView,
					self = this,
					change = eventArgs.change;
				if (this.tagCtxs[1] && ( // There is an {{else}}
						   change === "insert" && ev.target.length === eventArgs.items.length // inserting, and new length is same as inserted length, so going from 0 to n
						|| change === "remove" && !ev.target.length // removing , and new length 0, so going from n to 0
						|| change === "refresh" && !eventArgs.oldItems.length !== !ev.target.length // refreshing, and length is going from 0 to n or from n to 0
					)) {
					this.refresh();
				} else {
					for (arrayView in self._.arrVws) {
						arrayView = self._.arrVws[arrayView];
						if (arrayView.data === ev.target) {
							arrayView._.onArrayChange.apply(arrayView, arguments);
						}
					}
				}
				ev.done = true;
			},
			flow: true
		},
		include: {
			flow: true
		},
		"*": {
			// {{* code... }} - Ignored if template.allowCode is false. Otherwise include code in compiled template
			render: function(value) {
				return value; // Include the code.
			},
			flow: true
		}
	});

	//========================== Register converters ==========================

	$converters({
		html: function(text) {
			// HTML encode: Replace < > & and ' and " by corresponding entities.
			return text != undefined ? String(text).replace(rHtmlEncode, getCharEntity) : ""; // null and undefined return ""
		},
		attr: function(text) {
			// Attribute encode: Replace < > & ' and " by corresponding entities.
			return text != undefined ? String(text).replace(rAttrEncode, getCharEntity) : text === null ? null : ""; // null returns null, e.g. to remove attribute. undefined returns ""
		},
		url: function(text) {
			// URL encoding helper.
			return text != undefined ? encodeURI(String(text)) : text === null ? null : ""; // null returns null, e.g. to remove attribute. undefined returns ""
		}
	});

	//========================== Define default delimiters ==========================
	$viewsDelimiters();

})(this, this.jQuery);
(function(a){"use strict";var b=String.prototype.trim,c=String.prototype.trimRight,d=String.prototype.trimLeft,e=function(a){return a*1||0},f=function(a,b,c){a+="",b=~~b;for(var d=[];b>0;d[--b]=a);return d.join(c==null?"":c)},g=function(a){return Array.prototype.slice.call(a)},h=function(a){return a!=null?"["+m.escapeRegExp(""+a)+"]":"\\s"},i={lt:"<",gt:">",quot:'"',apos:"'",amp:"&"},j={};for(var k in i)j[i[k]]=k;var l=function(){function a(a){return Object.prototype.toString.call(a).slice(8,-1).toLowerCase()}var b=f,c=function(){return c.cache.hasOwnProperty(arguments[0])||(c.cache[arguments[0]]=c.parse(arguments[0])),c.format.call(null,c.cache[arguments[0]],arguments)};return c.format=function(c,d){var e=1,f=c.length,g="",h,i=[],j,k,m,n,o,p;for(j=0;j<f;j++){g=a(c[j]);if(g==="string")i.push(c[j]);else if(g==="array"){m=c[j];if(m[2]){h=d[e];for(k=0;k<m[2].length;k++){if(!h.hasOwnProperty(m[2][k]))throw new Error(l('[_.sprintf] property "%s" does not exist',m[2][k]));h=h[m[2][k]]}}else m[1]?h=d[m[1]]:h=d[e++];if(/[^s]/.test(m[8])&&a(h)!="number")throw new Error(l("[_.sprintf] expecting number but found %s",a(h)));switch(m[8]){case"b":h=h.toString(2);break;case"c":h=String.fromCharCode(h);break;case"d":h=parseInt(h,10);break;case"e":h=m[7]?h.toExponential(m[7]):h.toExponential();break;case"f":h=m[7]?parseFloat(h).toFixed(m[7]):parseFloat(h);break;case"o":h=h.toString(8);break;case"s":h=(h=String(h))&&m[7]?h.substring(0,m[7]):h;break;case"u":h=Math.abs(h);break;case"x":h=h.toString(16);break;case"X":h=h.toString(16).toUpperCase()}h=/[def]/.test(m[8])&&m[3]&&h>=0?"+"+h:h,o=m[4]?m[4]=="0"?"0":m[4].charAt(1):" ",p=m[6]-String(h).length,n=m[6]?b(o,p):"",i.push(m[5]?h+n:n+h)}}return i.join("")},c.cache={},c.parse=function(a){var b=a,c=[],d=[],e=0;while(b){if((c=/^[^\x25]+/.exec(b))!==null)d.push(c[0]);else if((c=/^\x25{2}/.exec(b))!==null)d.push("%");else{if((c=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(b))===null)throw new Error("[_.sprintf] huh?");if(c[2]){e|=1;var f=[],g=c[2],h=[];if((h=/^([a-z_][a-z_\d]*)/i.exec(g))===null)throw new Error("[_.sprintf] huh?");f.push(h[1]);while((g=g.substring(h[0].length))!=="")if((h=/^\.([a-z_][a-z_\d]*)/i.exec(g))!==null)f.push(h[1]);else{if((h=/^\[(\d+)\]/.exec(g))===null)throw new Error("[_.sprintf] huh?");f.push(h[1])}c[2]=f}else e|=2;if(e===3)throw new Error("[_.sprintf] mixing positional and named placeholders is not (yet) supported");d.push(c)}b=b.substring(c[0].length)}return d},c}(),m={VERSION:"2.1.1",isBlank:function(a){return/^\s*$/.test(a)},stripTags:function(a){return(""+a).replace(/<\/?[^>]+>/g,"")},capitalize:function(a){return a+="",a.charAt(0).toUpperCase()+a.substring(1)},chop:function(a,b){a+="",b=~~b||a.length;var c=[];for(var d=0;d<a.length;d+=b)c.push(a.slice(d,d+b));return c},clean:function(a){return m.strip(a).replace(/\s+/g," ")},count:function(a,b){return a+="",b+="",a.split(b).length-1},chars:function(a){return(""+a).split("")},escapeHTML:function(a){return(""+a).replace(/[&<>"']/g,function(a){return"&"+j[a]+";"})},unescapeHTML:function(a){return(""+a).replace(/\&([^;]+);/g,function(a,b){var c;return b in i?i[b]:(c=b.match(/^#x([\da-fA-F]+)$/))?String.fromCharCode(parseInt(c[1],16)):(c=b.match(/^#(\d+)$/))?String.fromCharCode(~~c[1]):a})},escapeRegExp:function(a){return a.replace(/([-.*+?^${}()|[\]\/\\])/g,"\\$1")},insert:function(a,b,c){var d=m.chars(a);return d.splice(~~b,0,""+c),d.join("")},include:function(a,b){return!!~(""+a).indexOf(b)},join:function(){var a=g(arguments);return a.join(a.shift())},lines:function(a){return(""+a).split("\n")},reverse:function(a){return m.chars(a).reverse().join("")},splice:function(a,b,c,d){var e=m.chars(a);return e.splice(~~b,~~c,d),e.join("")},startsWith:function(a,b){return a+="",b+="",a.length>=b.length&&a.substring(0,b.length)===b},endsWith:function(a,b){return a+="",b+="",a.length>=b.length&&a.substring(a.length-b.length)===b},succ:function(a){a+="";var b=m.chars(a);return b.splice(a.length-1,1,String.fromCharCode(a.charCodeAt(a.length-1)+1)),b.join("")},titleize:function(a){return(""+a).replace(/\b./g,function(a){return a.toUpperCase()})},camelize:function(a){return m.trim(a).replace(/[-_\s]+(.)?/g,function(a,b){return b&&b.toUpperCase()})},underscored:function(a){return m.trim(a).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase()},dasherize:function(a){return m.trim(a).replace(/[_\s]+/g,"-").replace(/([A-Z])/g,"-$1").replace(/-+/g,"-").toLowerCase()},classify:function(a){return a+="",m.titleize(a.replace(/_/g," ")).replace(/\s/g,"")},humanize:function(a){return m.capitalize(this.underscored(a).replace(/_id$/,"").replace(/_/g," "))},trim:function(a,c){return a+="",!c&&b?b.call(a):(c=h(c),a.replace(new RegExp("^"+c+"+|"+c+"+$","g"),""))},ltrim:function(a,b){return a+="",!b&&d?d.call(a):(b=h(b),a.replace(new RegExp("^"+b+"+"),""))},rtrim:function(a,b){return a+="",!b&&c?c.call(a):(b=h(b),a.replace(new RegExp(b+"+$"),""))},truncate:function(a,b,c){return a+="",c=c||"...",b=~~b,a.length>b?a.slice(0,b)+c:a},prune:function(a,b,c){a+="",b=~~b,c=c!=null?""+c:"...";var d,e,f=a.replace(/\W/g,function(a){return a.toUpperCase()!==a.toLowerCase()?"A":" "});return e=f.charAt(b),d=f.slice(0,b),e&&e.match(/\S/)&&(d=d.replace(/\s\S+$/,"")),d=m.rtrim(d),(d+c).length>a.length?a:a.substring(0,d.length)+c},words:function(a,b){return m.trim(a,b).split(b||/\s+/)},pad:function(a,b,c,d){a+="";var e=0;b=~~b,c?c.length>1&&(c=c.charAt(0)):c=" ";switch(d){case"right":return e=b-a.length,a+f(c,e);case"both":return e=b-a.length,f(c,Math.ceil(e/2))+a+f(c,Math.floor(e/2));default:return e=b-a.length,f(c,e)+a}},lpad:function(a,b,c){return m.pad(a,b,c)},rpad:function(a,b,c){return m.pad(a,b,c,"right")},lrpad:function(a,b,c){return m.pad(a,b,c,"both")},sprintf:l,vsprintf:function(a,b){return b.unshift(a),l.apply(null,b)},toNumber:function(a,b){a+="";var c=e(e(a).toFixed(~~b));return c===0&&!a.match(/^0+$/)?Number.NaN:c},strRight:function(a,b){a+="",b=b!=null?""+b:b;var c=b?a.indexOf(b):-1;return~c?a.slice(c+b.length,a.length):a},strRightBack:function(a,b){a+="",b=b!=null?""+b:b;var c=b?a.lastIndexOf(b):-1;return~c?a.slice(c+b.length,a.length):a},strLeft:function(a,b){a+="",b=b!=null?""+b:b;var c=b?a.indexOf(b):-1;return~c?a.slice(0,c):a},strLeftBack:function(a,b){a+="",b=b!=null?""+b:b;var c=a.lastIndexOf(b);return~c?a.slice(0,c):a},toSentence:function(a,b,c){b||(b=", "),c||(c=" and ");var d=a.length,e="";for(var f=0;f<d;f++)e+=a[f],f===d-2?e+=c:f<d-1&&(e+=b);return e},slugify:function(a){var b="ąàáäâãćęèéëêìíïîłńòóöôõùúüûñçżź",c="aaaaaaceeeeeiiiilnooooouuuunczz",d=new RegExp(h(b),"g");return a=(""+a).toLowerCase(),a=a.replace(d,function(a){var d=b.indexOf(a);return c.charAt(d)||"-"}),m.trim(a.replace(/[^\w\s-]/g,"").replace(/[-\s]+/g,"-"),"-")},exports:function(){var a={};for(var b in this){if(!this.hasOwnProperty(b)||~m.words("include contains reverse").indexOf(b))continue;a[b]=this[b]}return a},repeat:f};m.strip=m.trim,m.lstrip=m.ltrim,m.rstrip=m.rtrim,m.center=m.lrpad,m.rjust=m.lpad,m.ljust=m.rpad,m.contains=m.include,typeof exports!="undefined"?(typeof module!="undefined"&&module.exports&&(module.exports=m),exports._s=m):typeof define=="function"&&define.amd?define("underscore.string",function(){return m}):(a._=a._||{},a._.string=a._.str=m)})(this||window);
/**
  * Underscore.js mixin to emulate Ruby's Enumerable#each_slice method.
  * http://www.ruby-doc.org/core/classes/Enumerable.html#M001514
  *
  */

 
_.mixin({
  each_slice: function(obj, slice_size, iterator, context) {
    var collection = obj.map(function(item) { return item; });
    
    if (typeof collection.slice !== 'undefined') {
      for (var i = 0, s = Math.ceil(collection.length/slice_size); i < s; i++) {
        iterator.call(context, _(collection).slice(i*slice_size, (i*slice_size)+slice_size), obj);
      }
    }
    return; 
  }
});
 
/* Example:
 
>>> _([1,2,3,4,5,6,7,8,9,10]).each_slice(4, function(slice) { console.log(slice); })
[1, 2, 3, 4]
[5, 6, 7, 8]
[9, 10]
 
*/
;
/* =========================================================
 * bootstrap-modal.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */



!function ($) {

  "use strict"; // jshint ;_;


 /* MODAL CLASS DEFINITION
  * ====================== */

  var Modal = function (element, options) {
    this.options = options
    this.$element = $(element)
      .delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))
    this.options.remote && this.$element.find('.modal-body').load(this.options.remote)
  }

  Modal.prototype = {

      constructor: Modal

    , toggle: function () {
        return this[!this.isShown ? 'show' : 'hide']()
      }

    , show: function () {
        var that = this
          , e = $.Event('show')

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.escape()

        this.backdrop(function () {
          var transition = $.support.transition && that.$element.hasClass('fade')

          if (!that.$element.parent().length) {
            that.$element.appendTo(document.body) //don't move modals dom position
          }

          that.$element
            .show()

          if (transition) {
            that.$element[0].offsetWidth // force reflow
          }

          that.$element
            .addClass('in')
            .attr('aria-hidden', false)

          that.enforceFocus()

          transition ?
            that.$element.one($.support.transition.end, function () { that.$element.focus().trigger('shown') }) :
            that.$element.focus().trigger('shown')

        })
      }

    , hide: function (e) {
        e && e.preventDefault()

        var that = this

        e = $.Event('hide')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        this.escape()

        $(document).off('focusin.modal')

        this.$element
          .removeClass('in')
          .attr('aria-hidden', true)

        $.support.transition && this.$element.hasClass('fade') ?
          this.hideWithTransition() :
          this.hideModal()
      }

    , enforceFocus: function () {
        var that = this
        $(document).on('focusin.modal', function (e) {
          if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
            that.$element.focus()
          }
        })
      }

    , escape: function () {
        var that = this
        if (this.isShown && this.options.keyboard) {
          this.$element.on('keyup.dismiss.modal', function ( e ) {
            e.which == 27 && that.hide()
          })
        } else if (!this.isShown) {
          this.$element.off('keyup.dismiss.modal')
        }
      }

    , hideWithTransition: function () {
        var that = this
          , timeout = setTimeout(function () {
              that.$element.off($.support.transition.end)
              that.hideModal()
            }, 500)

        this.$element.one($.support.transition.end, function () {
          clearTimeout(timeout)
          that.hideModal()
        })
      }

    , hideModal: function (that) {
        this.$element
          .hide()
          .trigger('hidden')

        this.backdrop()
      }

    , removeBackdrop: function () {
        this.$backdrop.remove()
        this.$backdrop = null
      }

    , backdrop: function (callback) {
        var that = this
          , animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
          var doAnimate = $.support.transition && animate

          this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
            .appendTo(document.body)

          this.$backdrop.click(
            this.options.backdrop == 'static' ?
              $.proxy(this.$element[0].focus, this.$element[0])
            : $.proxy(this.hide, this)
          )

          if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

          this.$backdrop.addClass('in')

          doAnimate ?
            this.$backdrop.one($.support.transition.end, callback) :
            callback()

        } else if (!this.isShown && this.$backdrop) {
          this.$backdrop.removeClass('in')

          $.support.transition && this.$element.hasClass('fade')?
            this.$backdrop.one($.support.transition.end, $.proxy(this.removeBackdrop, this)) :
            this.removeBackdrop()

        } else if (callback) {
          callback()
        }
      }
  }


 /* MODAL PLUGIN DEFINITION
  * ======================= */

  $.fn.modal = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('modal')
        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option]()
      else if (options.show) data.show()
    })
  }

  $.fn.modal.defaults = {
      backdrop: true
    , keyboard: true
    , show: true
  }

  $.fn.modal.Constructor = Modal


 /* MODAL DATA-API
  * ============== */

  $(document).on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this)
      , href = $this.attr('href')
      , $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
      , option = $target.data('modal') ? 'toggle' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    $target
      .modal(option)
      .one('hide', function () {
        $this.focus()
      })
  })

}(window.jQuery);
/*!
 * Generated using the Bootstrap Customizer (https://getbootstrap.com/docs/3.4/customize/)
 */

/*!
 * Bootstrap v3.4.1 (https://getbootstrap.com/)
 * Copyright 2011-2026 Twitter, Inc.
 * Licensed under the MIT license
 */


if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery')
}
+function ($) {
  'use strict';
  var version = $.fn.jquery.split(' ')[0].split('.')
  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
    throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
  }
}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.4.1'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector !== '#' ? $(document).find(selector) : null

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);
/**
 * tooltipster http://iamceege.github.io/tooltipster/
 * A rockin' custom tooltip jQuery plugin
 * Developed by Caleb Jacob and Louis Ameline
 * MIT license
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["jquery"], function (a0) {
      return (factory(a0));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("jquery"));
  } else {
    factory(jQuery);
  }
}(this, function ($) {

// This file will be UMDified by a build task.

var defaults = {
		animation: 'fade',
		animationDuration: 350,
		content: null,
		contentAsHTML: false,
		contentCloning: false,
		debug: true,
		delay: 300,
		delayTouch: [300, 500],
		functionInit: null,
		functionBefore: null,
		functionReady: null,
		functionAfter: null,
		functionFormat: null,
		IEmin: 6,
		interactive: false,
		multiple: false,
		// will default to document.body, or must be an element positioned at (0, 0)
		// in the document, typically like the very top views of an app.
		parent: null,
		plugins: ['sideTip'],
		repositionOnScroll: false,
		restoration: 'none',
		selfDestruction: true,
		theme: [],
		timer: 0,
		trackerInterval: 500,
		trackOrigin: false,
		trackTooltip: false,
		trigger: 'hover',
		triggerClose: {
			click: false,
			mouseleave: false,
			originClick: false,
			scroll: false,
			tap: false,
			touchleave: false
		},
		triggerOpen: {
			click: false,
			mouseenter: false,
			tap: false,
			touchstart: false
		},
		updateAnimation: 'rotate',
		zIndex: 9999999
	},
	// we'll avoid using the 'window' global as a good practice but npm's
	// jquery@<2.1.0 package actually requires a 'window' global, so not sure
	// it's useful at all
	win = (typeof window != 'undefined') ? window : null,
	// env will be proxied by the core for plugins to have access its properties
	env = {
		// detect if this device can trigger touch events. Better have a false
		// positive (unused listeners, that's ok) than a false negative.
		// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
		// http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
		hasTouchCapability: !!(
			win
			&&	(	'ontouchstart' in win
				||	(win.DocumentTouch && win.document instanceof win.DocumentTouch)
				||	win.navigator.maxTouchPoints
			)
		),
		hasTransitions: transitionSupport(),
		IE: false,
		// don't set manually, it will be updated by a build task after the manifest
		semVer: '4.2.5',
		window: win
	},
	core = function() {
		
		// core variables
		
		// the core emitters
		this.__$emitterPrivate = $({});
		this.__$emitterPublic = $({});
		this.__instancesLatestArr = [];
		// collects plugin constructors
		this.__plugins = {};
		// proxy env variables for plugins who might use them
		this._env = env;
	};

// core methods
core.prototype = {
	
	/**
	 * A function to proxy the public methods of an object onto another
	 *
	 * @param {object} constructor The constructor to bridge
	 * @param {object} obj The object that will get new methods (an instance or the core)
	 * @param {string} pluginName A plugin name for the console log message
	 * @return {core}
	 * @private
	 */
	__bridge: function(constructor, obj, pluginName) {
		
		// if it's not already bridged
		if (!obj[pluginName]) {
			
			var fn = function() {};
			fn.prototype = constructor;
			
			var pluginInstance = new fn();
			
			// the _init method has to exist in instance constructors but might be missing
			// in core constructors
			if (pluginInstance.__init) {
				pluginInstance.__init(obj);
			}
			
			$.each(constructor, function(methodName, fn) {
				
				// don't proxy "private" methods, only "protected" and public ones
				if (methodName.indexOf('__') != 0) {
					
					// if the method does not exist yet
					if (!obj[methodName]) {
						
						obj[methodName] = function() {
							return pluginInstance[methodName].apply(pluginInstance, Array.prototype.slice.apply(arguments));
						};
						
						// remember to which plugin this method corresponds (several plugins may
						// have methods of the same name, we need to be sure)
						obj[methodName].bridged = pluginInstance;
					}
					else if (defaults.debug) {
						
						console.log('The '+ methodName +' method of the '+ pluginName
							+' plugin conflicts with another plugin or native methods');
					}
				}
			});
			
			obj[pluginName] = pluginInstance;
		}
		
		return this;
	},
	
	/**
	 * For mockup in Node env if need be, for testing purposes
	 *
	 * @return {core}
	 * @private
	 */
	__setWindow: function(window) {
		env.window = window;
		return this;
	},
	
	/**
	 * Returns a ruler, a tool to help measure the size of a tooltip under
	 * various settings. Meant for plugins
	 * 
	 * @see Ruler
	 * @return {object} A Ruler instance
	 * @protected
	 */
	_getRuler: function($tooltip) {
		return new Ruler($tooltip);
	},
	
	/**
	 * For internal use by plugins, if needed
	 *
	 * @return {core}
	 * @protected
	 */
	_off: function() {
		this.__$emitterPrivate.off.apply(this.__$emitterPrivate, Array.prototype.slice.apply(arguments));
		return this;
	},
	
	/**
	 * For internal use by plugins, if needed
	 *
	 * @return {core}
	 * @protected
	 */
	_on: function() {
		this.__$emitterPrivate.on.apply(this.__$emitterPrivate, Array.prototype.slice.apply(arguments));
		return this;
	},
	
	/**
	 * For internal use by plugins, if needed
	 *
	 * @return {core}
	 * @protected
	 */
	_one: function() {
		this.__$emitterPrivate.one.apply(this.__$emitterPrivate, Array.prototype.slice.apply(arguments));
		return this;
	},
	
	/**
	 * Returns (getter) or adds (setter) a plugin
	 *
	 * @param {string|object} plugin Provide a string (in the full form
	 * "namespace.name") to use as as getter, an object to use as a setter
	 * @return {object|core}
	 * @protected
	 */
	_plugin: function(plugin) {
		
		var self = this;
		
		// getter
		if (typeof plugin == 'string') {
			
			var pluginName = plugin,
				p = null;
			
			// if the namespace is provided, it's easy to search
			if (pluginName.indexOf('.') > 0) {
				p = self.__plugins[pluginName];
			}
			// otherwise, return the first name that matches
			else {
				$.each(self.__plugins, function(i, plugin) {
					
					if (plugin.name.substring(plugin.name.length - pluginName.length - 1) == '.'+ pluginName) {
						p = plugin;
						return false;
					}
				});
			}
			
			return p;
		}
		// setter
		else {
			
			// force namespaces
			if (plugin.name.indexOf('.') < 0) {
				throw new Error('Plugins must be namespaced');
			}
			
			self.__plugins[plugin.name] = plugin;
			
			// if the plugin has core features
			if (plugin.core) {
				
				// bridge non-private methods onto the core to allow new core methods
				self.__bridge(plugin.core, self, plugin.name);
			}
			
			return this;
		}
	},
	
	/**
	 * Trigger events on the core emitters
	 * 
	 * @returns {core}
	 * @protected
	 */
	_trigger: function() {
		
		var args = Array.prototype.slice.apply(arguments);
		
		if (typeof args[0] == 'string') {
			args[0] = { type: args[0] };
		}
		
		// note: the order of emitters matters
		this.__$emitterPrivate.trigger.apply(this.__$emitterPrivate, args);
		this.__$emitterPublic.trigger.apply(this.__$emitterPublic, args);
		
		return this;
	},
	
	/**
	 * Returns instances of all tooltips in the page or an a given element
	 *
	 * @param {string|HTML object collection} selector optional Use this
	 * parameter to restrict the set of objects that will be inspected
	 * for the retrieval of instances. By default, all instances in the
	 * page are returned.
	 * @return {array} An array of instance objects
	 * @public
	 */
	instances: function(selector) {
		
		var instances = [],
			sel = selector || '.tooltipstered';
		
		$(sel).each(function() {
			
			var $this = $(this),
				ns = $this.data('tooltipster-ns');
			
			if (ns) {
				
				$.each(ns, function(i, namespace) {
					instances.push($this.data(namespace));
				});
			}
		});
		
		return instances;
	},
	
	/**
	 * Returns the Tooltipster objects generated by the last initializing call
	 *
	 * @return {array} An array of instance objects
	 * @public
	 */
	instancesLatest: function() {
		return this.__instancesLatestArr;
	},
	
	/**
	 * For public use only, not to be used by plugins (use ::_off() instead)
	 *
	 * @return {core}
	 * @public
	 */
	off: function() {
		this.__$emitterPublic.off.apply(this.__$emitterPublic, Array.prototype.slice.apply(arguments));
		return this;
	},
	
	/**
	 * For public use only, not to be used by plugins (use ::_on() instead)
	 *
	 * @return {core}
	 * @public
	 */
	on: function() {
		this.__$emitterPublic.on.apply(this.__$emitterPublic, Array.prototype.slice.apply(arguments));
		return this;
	},
	
	/**
	 * For public use only, not to be used by plugins (use ::_one() instead)
	 * 
	 * @return {core}
	 * @public
	 */
	one: function() {
		this.__$emitterPublic.one.apply(this.__$emitterPublic, Array.prototype.slice.apply(arguments));
		return this;
	},
	
	/**
	 * Returns all HTML elements which have one or more tooltips
	 *
	 * @param {string} selector optional Use this to restrict the results
	 * to the descendants of an element
	 * @return {array} An array of HTML elements
	 * @public
	 */
	origins: function(selector) {
		
		var sel = selector ?
			selector +' ' :
			'';
		
		return $(sel +'.tooltipstered').toArray();
	},
	
	/**
	 * Change default options for all future instances
	 *
	 * @param {object} d The options that should be made defaults
	 * @return {core}
	 * @public
	 */
	setDefaults: function(d) {
		$.extend(defaults, d);
		return this;
	},
	
	/**
	 * For users to trigger their handlers on the public emitter
	 * 
	 * @returns {core}
	 * @public
	 */
	triggerHandler: function() {
		this.__$emitterPublic.triggerHandler.apply(this.__$emitterPublic, Array.prototype.slice.apply(arguments));
		return this;
	}
};

// $.tooltipster will be used to call core methods
$.tooltipster = new core();

// the Tooltipster instance class (mind the capital T)
$.Tooltipster = function(element, options) {
	
	// list of instance variables
	
	// stack of custom callbacks provided as parameters to API methods
	this.__callbacks = {
		close: [],
		open: []
	};
	// the schedule time of DOM removal
	this.__closingTime;
	// this will be the user content shown in the tooltip. A capital "C" is used
	// because there is also a method called content()
	this.__Content;
	// for the size tracker
	this.__contentBcr;
	// to disable the tooltip after destruction
	this.__destroyed = false;
	// we can't emit directly on the instance because if a method with the same
	// name as the event exists, it will be called by jQuery. Se we use a plain
	// object as emitter. This emitter is for internal use by plugins,
	// if needed.
	this.__$emitterPrivate = $({});
	// this emitter is for the user to listen to events without risking to mess
	// with our internal listeners
	this.__$emitterPublic = $({});
	this.__enabled = true;
	// the reference to the gc interval
	this.__garbageCollector;
	// various position and size data recomputed before each repositioning
	this.__Geometry;
	// the tooltip position, saved after each repositioning by a plugin
	this.__lastPosition;
	// a unique namespace per instance
	this.__namespace = 'tooltipster-'+ Math.round(Math.random()*1000000);
	this.__options;
	// will be used to support origins in scrollable areas
	this.__$originParents;
	this.__pointerIsOverOrigin = false;
	// to remove themes if needed
	this.__previousThemes = [];
	// the state can be either: appearing, stable, disappearing, closed
	this.__state = 'closed';
	// timeout references
	this.__timeouts = {
		close: [],
		open: null
	};
	// store touch events to be able to detect emulated mouse events
	this.__touchEvents = [];
	// the reference to the tracker interval
	this.__tracker = null;
	// the element to which this tooltip is associated
	this._$origin;
	// this will be the tooltip element (jQuery wrapped HTML element).
	// It's the job of a plugin to create it and append it to the DOM
	this._$tooltip;
	
	// launch
	this.__init(element, options);
};

$.Tooltipster.prototype = {
	
	/**
	 * @param origin
	 * @param options
	 * @private
	 */
	__init: function(origin, options) {
		
		var self = this;
		
		self._$origin = $(origin);
		self.__options = $.extend(true, {}, defaults, options);
		
		// some options may need to be reformatted
		self.__optionsFormat();
		
		// don't run on old IE if asked no to
		if (	!env.IE
			||	env.IE >= self.__options.IEmin
		) {
			
			// note: the content is null (empty) by default and can stay that
			// way if the plugin remains initialized but not fed any content. The
			// tooltip will just not appear.
			
			// let's save the initial value of the title attribute for later
			// restoration if need be.
			var initialTitle = null;
			
			// it will already have been saved in case of multiple tooltips
			if (self._$origin.data('tooltipster-initialTitle') === undefined) {
				
				initialTitle = self._$origin.attr('title');
				
				// we do not want initialTitle to be "undefined" because
				// of how jQuery's .data() method works
				if (initialTitle === undefined) initialTitle = null;
				
				self._$origin.data('tooltipster-initialTitle', initialTitle);
			}
			
			// If content is provided in the options, it has precedence over the
			// title attribute.
			// Note: an empty string is considered content, only 'null' represents
			// the absence of content.
			// Also, an existing title="" attribute will result in an empty string
			// content
			if (self.__options.content !== null) {
				self.__contentSet(self.__options.content);
			}
			else {
				
				var selector = self._$origin.attr('data-tooltip-content'),
					$el;
				
				if (selector){
					$el = $(selector);
				}
				
				if ($el && $el[0]) {
					self.__contentSet($el.first());
				}
				else {
					self.__contentSet(initialTitle);
				}
			}
			
			self._$origin
				// strip the title off of the element to prevent the default tooltips
				// from popping up
				.removeAttr('title')
				// to be able to find all instances on the page later (upon window
				// events in particular)
				.addClass('tooltipstered');
			
			// set listeners on the origin
			self.__prepareOrigin();
			
			// set the garbage collector
			self.__prepareGC();
			
			// init plugins
			$.each(self.__options.plugins, function(i, pluginName) {
				self._plug(pluginName);
			});
			
			// to detect swiping
			if (env.hasTouchCapability) {
				$(env.window.document.body).on('touchmove.'+ self.__namespace +'-triggerOpen', function(event) {
					self._touchRecordEvent(event);
				});
			}
			
			self
				// prepare the tooltip when it gets created. This event must
				// be fired by a plugin
				._on('created', function() {
					self.__prepareTooltip();
				})
				// save position information when it's sent by a plugin
				._on('repositioned', function(e) {
					self.__lastPosition = e.position;
				});
		}
		else {
			self.__options.disabled = true;
		}
	},
	
	/**
	 * Insert the content into the appropriate HTML element of the tooltip
	 * 
	 * @returns {self}
	 * @private
	 */
	__contentInsert: function() {
		
		var self = this,
			$el = self._$tooltip.find('.tooltipster-content'),
			formattedContent = self.__Content,
			format = function(content) {
				formattedContent = content;
			};
		
		self._trigger({
			type: 'format',
			content: self.__Content,
			format: format
		});
		
		if (self.__options.functionFormat) {
			
			formattedContent = self.__options.functionFormat.call(
				self,
				self,
				{ origin: self._$origin[0] },
				self.__Content
			);
		}
		
		if (typeof formattedContent === 'string' && !self.__options.contentAsHTML) {
			$el.text(formattedContent);
		}
		else {
			$el
				.empty()
				.append(formattedContent);
		}
		
		return self;
	},
	
	/**
	 * Save the content, cloning it beforehand if need be
	 * 
	 * @param content
	 * @returns {self}
	 * @private
	 */
	__contentSet: function(content) {
		
		// clone if asked. Cloning the object makes sure that each instance has its
		// own version of the content (in case a same object were provided for several
		// instances)
		// reminder: typeof null === object
		if (content instanceof $ && this.__options.contentCloning) {
			content = content.clone(true);
		}
		
		this.__Content = content;
		
		this._trigger({
			type: 'updated',
			content: content
		});
		
		return this;
	},
	
	/**
	 * Error message about a method call made after destruction
	 * 
	 * @private
	 */
	__destroyError: function() {
		throw new Error('This tooltip has been destroyed and cannot execute your method call.');
	},
	
	/**
	 * Gather all information about dimensions and available space,
	 * called before every repositioning
	 * 
	 * @private
	 * @returns {object}
	 */
	__geometry: function() {
		
		var	self = this,
			$target = self._$origin,
			originIsArea = self._$origin.is('area');
		
		// if this._$origin is a map area, the target we'll need
		// the dimensions of is actually the image using the map,
		// not the area itself
		if (originIsArea) {
			
			var mapName = self._$origin.parent().attr('name');
			
			$target = $('img[usemap="#'+ mapName +'"]');
		}
		
		var bcr = $target[0].getBoundingClientRect(),
			$document = $(env.window.document),
			$window = $(env.window),
			$parent = $target,
			// some useful properties of important elements
			geo = {
				// available space for the tooltip, see down below
				available: {
					document: null,
					window: null
				},
				document: {
					size: {
						height: $document.height(),
						width: $document.width()
					}
				},
				window: {
					scroll: {
						// the second ones are for IE compatibility
						left: env.window.scrollX || env.window.document.documentElement.scrollLeft,
						top: env.window.scrollY || env.window.document.documentElement.scrollTop
					},
					size: {
						height: $window.height(),
						width: $window.width()
					}
				},
				origin: {
					// the origin has a fixed lineage if itself or one of its
					// ancestors has a fixed position
					fixedLineage: false,
					// relative to the document
					offset: {},
					size: {
						height: bcr.bottom - bcr.top,
						width: bcr.right - bcr.left
					},
					usemapImage: originIsArea ? $target[0] : null,
					// relative to the window
					windowOffset: {
						bottom: bcr.bottom,
						left: bcr.left,
						right: bcr.right,
						top: bcr.top
					}
				}
			},
			geoFixed = false;
		
		// if the element is a map area, some properties may need
		// to be recalculated
		if (originIsArea) {
			
			var shape = self._$origin.attr('shape'),
				coords = self._$origin.attr('coords');
			
			if (coords) {
				
				coords = coords.split(',');
				
				$.map(coords, function(val, i) {
					coords[i] = parseInt(val);
				});
			}
			
			// if the image itself is the area, nothing more to do
			if (shape != 'default') {
				
				switch(shape) {
					
					case 'circle':
						
						var circleCenterLeft = coords[0],
							circleCenterTop = coords[1],
							circleRadius = coords[2],
							areaTopOffset = circleCenterTop - circleRadius,
							areaLeftOffset = circleCenterLeft - circleRadius;
						
						geo.origin.size.height = circleRadius * 2;
						geo.origin.size.width = geo.origin.size.height;
						
						geo.origin.windowOffset.left += areaLeftOffset;
						geo.origin.windowOffset.top += areaTopOffset;
						
						break;
					
					case 'rect':
						
						var areaLeft = coords[0],
							areaTop = coords[1],
							areaRight = coords[2],
							areaBottom = coords[3];
						
						geo.origin.size.height = areaBottom - areaTop;
						geo.origin.size.width = areaRight - areaLeft;
						
						geo.origin.windowOffset.left += areaLeft;
						geo.origin.windowOffset.top += areaTop;
						
						break;
					
					case 'poly':
						
						var areaSmallestX = 0,
							areaSmallestY = 0,
							areaGreatestX = 0,
							areaGreatestY = 0,
							arrayAlternate = 'even';
						
						for (var i = 0; i < coords.length; i++) {
							
							var areaNumber = coords[i];
							
							if (arrayAlternate == 'even') {
								
								if (areaNumber > areaGreatestX) {
									
									areaGreatestX = areaNumber;
									
									if (i === 0) {
										areaSmallestX = areaGreatestX;
									}
								}
								
								if (areaNumber < areaSmallestX) {
									areaSmallestX = areaNumber;
								}
								
								arrayAlternate = 'odd';
							}
							else {
								if (areaNumber > areaGreatestY) {
									
									areaGreatestY = areaNumber;
									
									if (i == 1) {
										areaSmallestY = areaGreatestY;
									}
								}
								
								if (areaNumber < areaSmallestY) {
									areaSmallestY = areaNumber;
								}
								
								arrayAlternate = 'even';
							}
						}
						
						geo.origin.size.height = areaGreatestY - areaSmallestY;
						geo.origin.size.width = areaGreatestX - areaSmallestX;
						
						geo.origin.windowOffset.left += areaSmallestX;
						geo.origin.windowOffset.top += areaSmallestY;
						
						break;
				}
			}
		}
		
		// user callback through an event
		var edit = function(r) {
			geo.origin.size.height = r.height,
				geo.origin.windowOffset.left = r.left,
				geo.origin.windowOffset.top = r.top,
				geo.origin.size.width = r.width
		};
		
		self._trigger({
			type: 'geometry',
			edit: edit,
			geometry: {
				height: geo.origin.size.height,
				left: geo.origin.windowOffset.left,
				top: geo.origin.windowOffset.top,
				width: geo.origin.size.width
			}
		});
		
		// calculate the remaining properties with what we got
		
		geo.origin.windowOffset.right = geo.origin.windowOffset.left + geo.origin.size.width;
		geo.origin.windowOffset.bottom = geo.origin.windowOffset.top + geo.origin.size.height;
		
		geo.origin.offset.left = geo.origin.windowOffset.left + geo.window.scroll.left;
		geo.origin.offset.top = geo.origin.windowOffset.top + geo.window.scroll.top;
		geo.origin.offset.bottom = geo.origin.offset.top + geo.origin.size.height;
		geo.origin.offset.right = geo.origin.offset.left + geo.origin.size.width;
		
		// the space that is available to display the tooltip relatively to the document
		geo.available.document = {
			bottom: {
				height: geo.document.size.height - geo.origin.offset.bottom,
				width: geo.document.size.width
			},
			left: {
				height: geo.document.size.height,
				width: geo.origin.offset.left
			},
			right: {
				height: geo.document.size.height,
				width: geo.document.size.width - geo.origin.offset.right
			},
			top: {
				height: geo.origin.offset.top,
				width: geo.document.size.width
			}
		};
		
		// the space that is available to display the tooltip relatively to the viewport
		// (the resulting values may be negative if the origin overflows the viewport)
		geo.available.window = {
			bottom: {
				// the inner max is here to make sure the available height is no bigger
				// than the viewport height (when the origin is off screen at the top).
				// The outer max just makes sure that the height is not negative (when
				// the origin overflows at the bottom).
				height: Math.max(geo.window.size.height - Math.max(geo.origin.windowOffset.bottom, 0), 0),
				width: geo.window.size.width
			},
			left: {
				height: geo.window.size.height,
				width: Math.max(geo.origin.windowOffset.left, 0)
			},
			right: {
				height: geo.window.size.height,
				width: Math.max(geo.window.size.width - Math.max(geo.origin.windowOffset.right, 0), 0)
			},
			top: {
				height: Math.max(geo.origin.windowOffset.top, 0),
				width: geo.window.size.width
			}
		};
		
		while ($parent[0].tagName.toLowerCase() != 'html') {
			
			if ($parent.css('position') == 'fixed') {
				geo.origin.fixedLineage = true;
				break;
			}
			
			$parent = $parent.parent();
		}
		
		return geo;
	},
	
	/**
	 * Some options may need to be formated before being used
	 * 
	 * @returns {self}
	 * @private
	 */
	__optionsFormat: function() {
		
		if (typeof this.__options.animationDuration == 'number') {
			this.__options.animationDuration = [this.__options.animationDuration, this.__options.animationDuration];
		}
		
		if (typeof this.__options.delay == 'number') {
			this.__options.delay = [this.__options.delay, this.__options.delay];
		}
		
		if (typeof this.__options.delayTouch == 'number') {
			this.__options.delayTouch = [this.__options.delayTouch, this.__options.delayTouch];
		}
		
		if (typeof this.__options.theme == 'string') {
			this.__options.theme = [this.__options.theme];
		}
		
		// determine the future parent
		if (this.__options.parent === null) {
			this.__options.parent = $(env.window.document.body);
		}
		else if (typeof this.__options.parent == 'string') {
			this.__options.parent = $(this.__options.parent);
		}
		
		if (this.__options.trigger == 'hover') {
			
			this.__options.triggerOpen = {
				mouseenter: true,
				touchstart: true
			};
			
			this.__options.triggerClose = {
				mouseleave: true,
				originClick: true,
				touchleave: true
			};
		}
		else if (this.__options.trigger == 'click') {
			
			this.__options.triggerOpen = {
				click: true,
				tap: true
			};
			
			this.__options.triggerClose = {
				click: true,
				tap: true
			};
		}
		
		// for the plugins
		this._trigger('options');
		
		return this;
	},
	
	/**
	 * Schedules or cancels the garbage collector task
	 *
	 * @returns {self}
	 * @private
	 */
	__prepareGC: function() {
		
		var self = this;
		
		// in case the selfDestruction option has been changed by a method call
		if (self.__options.selfDestruction) {
			
			// the GC task
			self.__garbageCollector = setInterval(function() {
				
				var now = new Date().getTime();
				
				// forget the old events
				self.__touchEvents = $.grep(self.__touchEvents, function(event, i) {
					// 1 minute
					return now - event.time > 60000;
				});
				
				// auto-destruct if the origin is gone
				if (!bodyContains(self._$origin)) {
					
					self.close(function(){
						self.destroy();
					});
				}
			}, 20000);
		}
		else {
			clearInterval(self.__garbageCollector);
		}
		
		return self;
	},
	
	/**
	 * Sets listeners on the origin if the open triggers require them.
	 * Unlike the listeners set at opening time, these ones
	 * remain even when the tooltip is closed. It has been made a
	 * separate method so it can be called when the triggers are
	 * changed in the options. Closing is handled in _open()
	 * because of the bindings that may be needed on the tooltip
	 * itself
	 *
	 * @returns {self}
	 * @private
	 */
	__prepareOrigin: function() {
		
		var self = this;
		
		// in case we're resetting the triggers
		self._$origin.off('.'+ self.__namespace +'-triggerOpen');
		
		// if the device is touch capable, even if only mouse triggers
		// are asked, we need to listen to touch events to know if the mouse
		// events are actually emulated (so we can ignore them)
		if (env.hasTouchCapability) {
			
			self._$origin.on(
				'touchstart.'+ self.__namespace +'-triggerOpen ' +
				'touchend.'+ self.__namespace +'-triggerOpen ' +
				'touchcancel.'+ self.__namespace +'-triggerOpen',
				function(event){
					self._touchRecordEvent(event);
				}
			);
		}
		
		// mouse click and touch tap work the same way
		if (	self.__options.triggerOpen.click
			||	(self.__options.triggerOpen.tap && env.hasTouchCapability)
		) {
			
			var eventNames = '';
			if (self.__options.triggerOpen.click) {
				eventNames += 'click.'+ self.__namespace +'-triggerOpen ';
			}
			if (self.__options.triggerOpen.tap && env.hasTouchCapability) {
				eventNames += 'touchend.'+ self.__namespace +'-triggerOpen';
			}
			
			self._$origin.on(eventNames, function(event) {
				if (self._touchIsMeaningfulEvent(event)) {
					self._open(event);
				}
			});
		}
		
		// mouseenter and touch start work the same way
		if (	self.__options.triggerOpen.mouseenter
			||	(self.__options.triggerOpen.touchstart && env.hasTouchCapability)
		) {
			
			var eventNames = '';
			if (self.__options.triggerOpen.mouseenter) {
				eventNames += 'mouseenter.'+ self.__namespace +'-triggerOpen ';
			}
			if (self.__options.triggerOpen.touchstart && env.hasTouchCapability) {
				eventNames += 'touchstart.'+ self.__namespace +'-triggerOpen';
			}
			
			self._$origin.on(eventNames, function(event) {
				if (	self._touchIsTouchEvent(event)
					||	!self._touchIsEmulatedEvent(event)
				) {
					self.__pointerIsOverOrigin = true;
					self._openShortly(event);
				}
			});
		}
		
		// info for the mouseleave/touchleave close triggers when they use a delay
		if (	self.__options.triggerClose.mouseleave
			||	(self.__options.triggerClose.touchleave && env.hasTouchCapability)
		) {
			
			var eventNames = '';
			if (self.__options.triggerClose.mouseleave) {
				eventNames += 'mouseleave.'+ self.__namespace +'-triggerOpen ';
			}
			if (self.__options.triggerClose.touchleave && env.hasTouchCapability) {
				eventNames += 'touchend.'+ self.__namespace +'-triggerOpen touchcancel.'+ self.__namespace +'-triggerOpen';
			}
			
			self._$origin.on(eventNames, function(event) {
				
				if (self._touchIsMeaningfulEvent(event)) {
					self.__pointerIsOverOrigin = false;
				}
			});
		}
		
		return self;
	},
	
	/**
	 * Do the things that need to be done only once after the tooltip
	 * HTML element it has been created. It has been made a separate
	 * method so it can be called when options are changed. Remember
	 * that the tooltip may actually exist in the DOM before it is
	 * opened, and present after it has been closed: it's the display
	 * plugin that takes care of handling it.
	 * 
	 * @returns {self}
	 * @private
	 */
	__prepareTooltip: function() {
		
		var self = this,
			p = self.__options.interactive ? 'auto' : '';
		
		// this will be useful to know quickly if the tooltip is in
		// the DOM or not 
		self._$tooltip
			.attr('id', self.__namespace)
			.css({
				// pointer events
				'pointer-events': p,
				zIndex: self.__options.zIndex
			});
		
		// themes
		// remove the old ones and add the new ones
		$.each(self.__previousThemes, function(i, theme) {
			self._$tooltip.removeClass(theme);
		});
		$.each(self.__options.theme, function(i, theme) {
			self._$tooltip.addClass(theme);
		});
		
		self.__previousThemes = $.merge([], self.__options.theme);
		
		return self;
	},
	
	/**
	 * Handles the scroll on any of the parents of the origin (when the
	 * tooltip is open)
	 *
	 * @param {object} event
	 * @returns {self}
	 * @private
	 */
	__scrollHandler: function(event) {
		
		var self = this;
		
		if (self.__options.triggerClose.scroll) {
			self._close(event);
		}
		else {
			
			// if the origin or tooltip have been removed: do nothing, the tracker will
			// take care of it later
			if (bodyContains(self._$origin) && bodyContains(self._$tooltip)) {
				
				var geo = null;
				
				// if the scroll happened on the window
				if (event.target === env.window.document) {
					
					// if the origin has a fixed lineage, window scroll will have no
					// effect on its position nor on the position of the tooltip
					if (!self.__Geometry.origin.fixedLineage) {
						
						// we don't need to do anything unless repositionOnScroll is true
						// because the tooltip will already have moved with the window
						// (and of course with the origin)
						if (self.__options.repositionOnScroll) {
							self.reposition(event);
						}
					}
				}
				// if the scroll happened on another parent of the tooltip, it means
				// that it's in a scrollable area and now needs to have its position
				// adjusted or recomputed, depending ont the repositionOnScroll
				// option. Also, if the origin is partly hidden due to a parent that
				// hides its overflow, we'll just hide (not close) the tooltip.
				else {
					
					geo = self.__geometry();
					
					var overflows = false;
					
					// a fixed position origin is not affected by the overflow hiding
					// of a parent
					if (self._$origin.css('position') != 'fixed') {
						
						self.__$originParents.each(function(i, el) {
							
							var $el = $(el),
								overflowX = $el.css('overflow-x'),
								overflowY = $el.css('overflow-y');
							
							if (overflowX != 'visible' || overflowY != 'visible') {
								
								var bcr = el.getBoundingClientRect();
								
								if (overflowX != 'visible') {
									
									if (	geo.origin.windowOffset.left < bcr.left
										||	geo.origin.windowOffset.right > bcr.right
									) {
										overflows = true;
										return false;
									}
								}
								
								if (overflowY != 'visible') {
									
									if (	geo.origin.windowOffset.top < bcr.top
										||	geo.origin.windowOffset.bottom > bcr.bottom
									) {
										overflows = true;
										return false;
									}
								}
							}
							
							// no need to go further if fixed, for the same reason as above
							if ($el.css('position') == 'fixed') {
								return false;
							}
						});
					}
					
					if (overflows) {
						self._$tooltip.css('visibility', 'hidden');
					}
					else {
						
						self._$tooltip.css('visibility', 'visible');
						
						// reposition
						if (self.__options.repositionOnScroll) {
							self.reposition(event);
						}
						// or just adjust offset
						else {
							
							// we have to use offset and not windowOffset because this way,
							// only the scroll distance of the scrollable areas are taken into
							// account (the scrolltop value of the main window must be
							// ignored since the tooltip already moves with it)
							var offsetLeft = geo.origin.offset.left - self.__Geometry.origin.offset.left,
								offsetTop = geo.origin.offset.top - self.__Geometry.origin.offset.top;
							
							// add the offset to the position initially computed by the display plugin
							self._$tooltip.css({
								left: self.__lastPosition.coord.left + offsetLeft,
								top: self.__lastPosition.coord.top + offsetTop
							});
						}
					}
				}
				
				self._trigger({
					type: 'scroll',
					event: event,
					geo: geo
				});
			}
		}
		
		return self;
	},
	
	/**
	 * Changes the state of the tooltip
	 *
	 * @param {string} state
	 * @returns {self}
	 * @private
	 */
	__stateSet: function(state) {
		
		this.__state = state;
		
		this._trigger({
			type: 'state',
			state: state
		});
		
		return this;
	},
	
	/**
	 * Clear appearance timeouts
	 *
	 * @returns {self}
	 * @private
	 */
	__timeoutsClear: function() {
		
		// there is only one possible open timeout: the delayed opening
		// when the mouseenter/touchstart open triggers are used
		clearTimeout(this.__timeouts.open);
		this.__timeouts.open = null;
		
		// ... but several close timeouts: the delayed closing when the
		// mouseleave close trigger is used and the timer option
		$.each(this.__timeouts.close, function(i, timeout) {
			clearTimeout(timeout);
		});
		this.__timeouts.close = [];
		
		return this;
	},
	
	/**
	 * Start the tracker that will make checks at regular intervals
	 * 
	 * @returns {self}
	 * @private
	 */
	__trackerStart: function() {
		
		var self = this,
			$content = self._$tooltip.find('.tooltipster-content');
		
		// get the initial content size
		if (self.__options.trackTooltip) {
			self.__contentBcr = $content[0].getBoundingClientRect();
		}
		
		self.__tracker = setInterval(function() {
			
			// if the origin or tooltip elements have been removed.
			// Note: we could destroy the instance now if the origin has
			// been removed but we'll leave that task to our garbage collector
			if (!bodyContains(self._$origin) || !bodyContains(self._$tooltip)) {
				self._close();
			}
			// if everything is alright
			else {
				
				// compare the former and current positions of the origin to reposition
				// the tooltip if need be
				if (self.__options.trackOrigin) {
					
					var g = self.__geometry(),
						identical = false;
					
					// compare size first (a change requires repositioning too)
					if (areEqual(g.origin.size, self.__Geometry.origin.size)) {
						
						// for elements that have a fixed lineage (see __geometry()), we track the
						// top and left properties (relative to window)
						if (self.__Geometry.origin.fixedLineage) {
							if (areEqual(g.origin.windowOffset, self.__Geometry.origin.windowOffset)) {
								identical = true;
							}
						}
						// otherwise, track total offset (relative to document)
						else {
							if (areEqual(g.origin.offset, self.__Geometry.origin.offset)) {
								identical = true;
							}
						}
					}
					
					if (!identical) {
						
						// close the tooltip when using the mouseleave close trigger
						// (see https://github.com/iamceege/tooltipster/pull/253)
						if (self.__options.triggerClose.mouseleave) {
							self._close();
						}
						else {
							self.reposition();
						}
					}
				}
				
				if (self.__options.trackTooltip) {
					
					var currentBcr = $content[0].getBoundingClientRect();
					
					if (	currentBcr.height !== self.__contentBcr.height
						||	currentBcr.width !== self.__contentBcr.width
					) {
						self.reposition();
						self.__contentBcr = currentBcr;
					}
				}
			}
		}, self.__options.trackerInterval);
		
		return self;
	},
	
	/**
	 * Closes the tooltip (after the closing delay)
	 * 
	 * @param event
	 * @param callback
	 * @param force Set to true to override a potential refusal of the user's function
	 * @returns {self}
	 * @protected
	 */
	_close: function(event, callback, force) {
		
		var self = this,
			ok = true;
		
		self._trigger({
			type: 'close',
			event: event,
			stop: function() {
				ok = false;
			}
		});
		
		// a destroying tooltip (force == true) may not refuse to close
		if (ok || force) {
			
			// save the method custom callback and cancel any open method custom callbacks
			if (callback) self.__callbacks.close.push(callback);
			self.__callbacks.open = [];
			
			// clear open/close timeouts
			self.__timeoutsClear();
			
			var finishCallbacks = function() {
				
				// trigger any close method custom callbacks and reset them
				$.each(self.__callbacks.close, function(i,c) {
					c.call(self, self, {
						event: event,
						origin: self._$origin[0]
					});
				});
				
				self.__callbacks.close = [];
			};
			
			if (self.__state != 'closed') {
				
				var necessary = true,
					d = new Date(),
					now = d.getTime(),
					newClosingTime = now + self.__options.animationDuration[1];
				
				// the tooltip may already already be disappearing, but if a new
				// call to close() is made after the animationDuration was changed
				// to 0 (for example), we ought to actually close it sooner than
				// previously scheduled. In that case it should be noted that the
				// browser will not adapt the animation duration to the new
				// animationDuration that was set after the start of the closing
				// animation.
				// Note: the same thing could be considered at opening, but is not
				// really useful since the tooltip is actually opened immediately
				// upon a call to _open(). Since it would not make the opening
				// animation finish sooner, its sole impact would be to trigger the
				// state event and the open callbacks sooner than the actual end of
				// the opening animation, which is not great.
				if (self.__state == 'disappearing') {
					
					if (	newClosingTime > self.__closingTime
						// in case closing is actually overdue because the script
						// execution was suspended. See #679
						&&	self.__options.animationDuration[1] > 0
					) {
						necessary = false;
					}
				}
				
				if (necessary) {
					
					self.__closingTime = newClosingTime;
					
					if (self.__state != 'disappearing') {
						self.__stateSet('disappearing');
					}
					
					var finish = function() {
						
						// stop the tracker
						clearInterval(self.__tracker);
						
						// a "beforeClose" option has been asked several times but would
						// probably useless since the content element is still accessible
						// via ::content(), and because people can always use listeners
						// inside their content to track what's going on. For the sake of
						// simplicity, this has been denied. Bur for the rare people who
						// really need the option (for old browsers or for the case where
						// detaching the content is actually destructive, for file or
						// password inputs for example), this event will do the work.
						self._trigger({
							type: 'closing',
							event: event
						});
						
						// unbind listeners which are no longer needed
						
						self._$tooltip
							.off('.'+ self.__namespace +'-triggerClose')
							.removeClass('tooltipster-dying');
						
						// orientationchange, scroll and resize listeners
						$(env.window).off('.'+ self.__namespace +'-triggerClose');
						
						// scroll listeners
						self.__$originParents.each(function(i, el) {
							$(el).off('scroll.'+ self.__namespace +'-triggerClose');
						});
						// clear the array to prevent memory leaks
						self.__$originParents = null;
						
						$(env.window.document.body).off('.'+ self.__namespace +'-triggerClose');
						
						self._$origin.off('.'+ self.__namespace +'-triggerClose');
						
						self._off('dismissable');
						
						// a plugin that would like to remove the tooltip from the
						// DOM when closed should bind on this
						self.__stateSet('closed');
						
						// trigger event
						self._trigger({
							type: 'after',
							event: event
						});
						
						// call our constructor custom callback function
						if (self.__options.functionAfter) {
							self.__options.functionAfter.call(self, self, {
								event: event,
								origin: self._$origin[0]
							});
						}
						
						// call our method custom callbacks functions
						finishCallbacks();
					};
					
					if (env.hasTransitions) {
						
						self._$tooltip.css({
							'-moz-animation-duration': self.__options.animationDuration[1] + 'ms',
							'-ms-animation-duration': self.__options.animationDuration[1] + 'ms',
							'-o-animation-duration': self.__options.animationDuration[1] + 'ms',
							'-webkit-animation-duration': self.__options.animationDuration[1] + 'ms',
							'animation-duration': self.__options.animationDuration[1] + 'ms',
							'transition-duration': self.__options.animationDuration[1] + 'ms'
						});
						
						self._$tooltip
							// clear both potential open and close tasks
							.clearQueue()
							.removeClass('tooltipster-show')
							// for transitions only
							.addClass('tooltipster-dying');
						
						if (self.__options.animationDuration[1] > 0) {
							self._$tooltip.delay(self.__options.animationDuration[1]);
						}
						
						self._$tooltip.queue(finish);
					}
					else {
						
						self._$tooltip
							.stop()
							.fadeOut(self.__options.animationDuration[1], finish);
					}
				}
			}
			// if the tooltip is already closed, we still need to trigger
			// the method custom callbacks
			else {
				finishCallbacks();
			}
		}
		
		return self;
	},
	
	/**
	 * For internal use by plugins, if needed
	 * 
	 * @returns {self}
	 * @protected
	 */
	_off: function() {
		this.__$emitterPrivate.off.apply(this.__$emitterPrivate, Array.prototype.slice.apply(arguments));
		return this;
	},
	
	/**
	 * For internal use by plugins, if needed
	 *
	 * @returns {self}
	 * @protected
	 */
	_on: function() {
		this.__$emitterPrivate.on.apply(this.__$emitterPrivate, Array.prototype.slice.apply(arguments));
		return this;
	},
	
	/**
	 * For internal use by plugins, if needed
	 *
	 * @returns {self}
	 * @protected
	 */
	_one: function() {
		this.__$emitterPrivate.one.apply(this.__$emitterPrivate, Array.prototype.slice.apply(arguments));
		return this;
	},
	
	/**
	 * Opens the tooltip right away.
	 *
	 * @param event
	 * @param callback Will be called when the opening animation is over
	 * @returns {self}
	 * @protected
	 */
	_open: function(event, callback) {
		
		var self = this;
		
		// if the destruction process has not begun and if this was not
		// triggered by an unwanted emulated click event
		if (!self.__destroying) {
			
			// check that the origin is still in the DOM
			if (	bodyContains(self._$origin)
				// if the tooltip is enabled
				&&	self.__enabled
			) {
				
				var ok = true;
				
				// if the tooltip is not open yet, we need to call functionBefore.
				// otherwise we can jst go on
				if (self.__state == 'closed') {
					
					// trigger an event. The event.stop function allows the callback
					// to prevent the opening of the tooltip
					self._trigger({
						type: 'before',
						event: event,
						stop: function() {
							ok = false;
						}
					});
					
					if (ok && self.__options.functionBefore) {
						
						// call our custom function before continuing
						ok = self.__options.functionBefore.call(self, self, {
							event: event,
							origin: self._$origin[0]
						});
					}
				}
				
				if (ok !== false) {
					
					// if there is some content
					if (self.__Content !== null) {
						
						// save the method callback and cancel close method callbacks
						if (callback) {
							self.__callbacks.open.push(callback);
						}
						self.__callbacks.close = [];
						
						// get rid of any appearance timeouts
						self.__timeoutsClear();
						
						var extraTime,
							finish = function() {
								
								if (self.__state != 'stable') {
									self.__stateSet('stable');
								}
								
								// trigger any open method custom callbacks and reset them
								$.each(self.__callbacks.open, function(i,c) {
									c.call(self, self, {
										origin: self._$origin[0],
										tooltip: self._$tooltip[0]
									});
								});
								
								self.__callbacks.open = [];
							};
						
						// if the tooltip is already open
						if (self.__state !== 'closed') {
							
							// the timer (if any) will start (or restart) right now
							extraTime = 0;
							
							// if it was disappearing, cancel that
							if (self.__state === 'disappearing') {
								
								self.__stateSet('appearing');
								
								if (env.hasTransitions) {
									
									self._$tooltip
										.clearQueue()
										.removeClass('tooltipster-dying')
										.addClass('tooltipster-show');
									
									if (self.__options.animationDuration[0] > 0) {
										self._$tooltip.delay(self.__options.animationDuration[0]);
									}
									
									self._$tooltip.queue(finish);
								}
								else {
									// in case the tooltip was currently fading out, bring it back
									// to life
									self._$tooltip
										.stop()
										.fadeIn(finish);
								}
							}
							// if the tooltip is already open, we still need to trigger the method
							// custom callback
							else if (self.__state == 'stable') {
								finish();
							}
						}
						// if the tooltip isn't already open, open it
						else {
							
							// a plugin must bind on this and store the tooltip in this._$tooltip
							self.__stateSet('appearing');
							
							// the timer (if any) will start when the tooltip has fully appeared
							// after its transition
							extraTime = self.__options.animationDuration[0];
							
							// insert the content inside the tooltip
							self.__contentInsert();
							
							// reposition the tooltip and attach to the DOM
							self.reposition(event, true);
							
							// animate in the tooltip. If the display plugin wants no css
							// animations, it may override the animation option with a
							// dummy value that will produce no effect
							if (env.hasTransitions) {
								
								// note: there seems to be an issue with start animations which
								// are randomly not played on fast devices in both Chrome and FF,
								// couldn't find a way to solve it yet. It seems that applying
								// the classes before appending to the DOM helps a little, but
								// it messes up some CSS transitions. The issue almost never
								// happens when delay[0]==0 though
								self._$tooltip
									.addClass('tooltipster-'+ self.__options.animation)
									.addClass('tooltipster-initial')
									.css({
										'-moz-animation-duration': self.__options.animationDuration[0] + 'ms',
										'-ms-animation-duration': self.__options.animationDuration[0] + 'ms',
										'-o-animation-duration': self.__options.animationDuration[0] + 'ms',
										'-webkit-animation-duration': self.__options.animationDuration[0] + 'ms',
										'animation-duration': self.__options.animationDuration[0] + 'ms',
										'transition-duration': self.__options.animationDuration[0] + 'ms'
									});
								
								setTimeout(
									function() {
										
										// a quick hover may have already triggered a mouseleave
										if (self.__state != 'closed') {
											
											self._$tooltip
												.addClass('tooltipster-show')
												.removeClass('tooltipster-initial');
											
											if (self.__options.animationDuration[0] > 0) {
												self._$tooltip.delay(self.__options.animationDuration[0]);
											}
											
											self._$tooltip.queue(finish);
										}
									},
									0
								);
							}
							else {
								
								// old browsers will have to live with this
								self._$tooltip
									.css('display', 'none')
									.fadeIn(self.__options.animationDuration[0], finish);
							}
							
							// checks if the origin is removed while the tooltip is open
							self.__trackerStart();
							
							// NOTE: the listeners below have a '-triggerClose' namespace
							// because we'll remove them when the tooltip closes (unlike
							// the '-triggerOpen' listeners). So some of them are actually
							// not about close triggers, rather about positioning.
							
							$(env.window)
								// reposition on resize
								.on('resize.'+ self.__namespace +'-triggerClose', function(e) {
									
									var $ae = $(document.activeElement);
									
									// reposition only if the resize event was not triggered upon the opening
									// of a virtual keyboard due to an input field being focused within the tooltip
									// (otherwise the repositioning would lose the focus)
									if (	(!$ae.is('input') && !$ae.is('textarea'))
										||	!$.contains(self._$tooltip[0], $ae[0])
									) {
										self.reposition(e);
									}
								})
								// same as below for parents
								.on('scroll.'+ self.__namespace +'-triggerClose', function(e) {
									self.__scrollHandler(e);
								});
							
							self.__$originParents = self._$origin.parents();
							
							// scrolling may require the tooltip to be moved or even
							// repositioned in some cases
							self.__$originParents.each(function(i, parent) {
								
								$(parent).on('scroll.'+ self.__namespace +'-triggerClose', function(e) {
									self.__scrollHandler(e);
								});
							});
							
							if (	self.__options.triggerClose.mouseleave
								||	(self.__options.triggerClose.touchleave && env.hasTouchCapability)
							) {
								
								// we use an event to allow users/plugins to control when the mouseleave/touchleave
								// close triggers will come to action. It allows to have more triggering elements
								// than just the origin and the tooltip for example, or to cancel/delay the closing,
								// or to make the tooltip interactive even if it wasn't when it was open, etc.
								self._on('dismissable', function(event) {
									
									if (event.dismissable) {
										
										if (event.delay) {
											
											timeout = setTimeout(function() {
												// event.event may be undefined
												self._close(event.event);
											}, event.delay);
											
											self.__timeouts.close.push(timeout);
										}
										else {
											self._close(event);
										}
									}
									else {
										clearTimeout(timeout);
									}
								});
								
								// now set the listeners that will trigger 'dismissable' events
								var $elements = self._$origin,
									eventNamesIn = '',
									eventNamesOut = '',
									timeout = null;
								
								// if we have to allow interaction, bind on the tooltip too
								if (self.__options.interactive) {
									$elements = $elements.add(self._$tooltip);
								}
								
								if (self.__options.triggerClose.mouseleave) {
									eventNamesIn += 'mouseenter.'+ self.__namespace +'-triggerClose ';
									eventNamesOut += 'mouseleave.'+ self.__namespace +'-triggerClose ';
								}
								if (self.__options.triggerClose.touchleave && env.hasTouchCapability) {
									eventNamesIn += 'touchstart.'+ self.__namespace +'-triggerClose';
									eventNamesOut += 'touchend.'+ self.__namespace +'-triggerClose touchcancel.'+ self.__namespace +'-triggerClose';
								}
								
								$elements
									// close after some time spent outside of the elements
									.on(eventNamesOut, function(event) {
										
										// it's ok if the touch gesture ended up to be a swipe,
										// it's still a "touch leave" situation
										if (	self._touchIsTouchEvent(event)
											||	!self._touchIsEmulatedEvent(event)
										) {
											
											var delay = (event.type == 'mouseleave') ?
												self.__options.delay :
												self.__options.delayTouch;
											
											self._trigger({
												delay: delay[1],
												dismissable: true,
												event: event,
												type: 'dismissable'
											});
										}
									})
									// suspend the mouseleave timeout when the pointer comes back
									// over the elements
									.on(eventNamesIn, function(event) {
										
										// it's also ok if the touch event is a swipe gesture
										if (	self._touchIsTouchEvent(event)
											||	!self._touchIsEmulatedEvent(event)
										) {
											self._trigger({
												dismissable: false,
												event: event,
												type: 'dismissable'
											});
										}
									});
							}
							
							// close the tooltip when the origin gets a mouse click (common behavior of
							// native tooltips)
							if (self.__options.triggerClose.originClick) {
								
								self._$origin.on('click.'+ self.__namespace + '-triggerClose', function(event) {
									
									// we could actually let a tap trigger this but this feature just
									// does not make sense on touch devices
									if (	!self._touchIsTouchEvent(event)
										&&	!self._touchIsEmulatedEvent(event)
									) {
										self._close(event);
									}
								});
							}
							
							// set the same bindings for click and touch on the body to close the tooltip
							if (	self.__options.triggerClose.click
								||	(self.__options.triggerClose.tap && env.hasTouchCapability)
							) {
								
								// don't set right away since the click/tap event which triggered this method
								// (if it was a click/tap) is going to bubble up to the body, we don't want it
								// to close the tooltip immediately after it opened
								setTimeout(function() {
									
									if (self.__state != 'closed') {
										
										var eventNames = '',
											$body = $(env.window.document.body);
										
										if (self.__options.triggerClose.click) {
											eventNames += 'click.'+ self.__namespace +'-triggerClose ';
										}
										if (self.__options.triggerClose.tap && env.hasTouchCapability) {
											eventNames += 'touchend.'+ self.__namespace +'-triggerClose';
										}
										
										$body.on(eventNames, function(event) {
											
											if (self._touchIsMeaningfulEvent(event)) {
												
												self._touchRecordEvent(event);
												
												if (!self.__options.interactive || !$.contains(self._$tooltip[0], event.target)) {
													self._close(event);
												}
											}
										});
										
										// needed to detect and ignore swiping
										if (self.__options.triggerClose.tap && env.hasTouchCapability) {
											
											$body.on('touchstart.'+ self.__namespace +'-triggerClose', function(event) {
												self._touchRecordEvent(event);
											});
										}
									}
								}, 0);
							}
							
							self._trigger('ready');
							
							// call our custom callback
							if (self.__options.functionReady) {
								self.__options.functionReady.call(self, self, {
									origin: self._$origin[0],
									tooltip: self._$tooltip[0]
								});
							}
						}
						
						// if we have a timer set, let the countdown begin
						if (self.__options.timer > 0) {
							
							var timeout = setTimeout(function() {
								self._close();
							}, self.__options.timer + extraTime);
							
							self.__timeouts.close.push(timeout);
						}
					}
				}
			}
		}
		
		return self;
	},
	
	/**
	 * When using the mouseenter/touchstart open triggers, this function will
	 * schedule the opening of the tooltip after the delay, if there is one
	 *
	 * @param event
	 * @returns {self}
	 * @protected
 	 */
	_openShortly: function(event) {
		
		var self = this,
			ok = true;
		
		if (self.__state != 'stable' && self.__state != 'appearing') {
			
			// if a timeout is not already running
			if (!self.__timeouts.open) {
				
				self._trigger({
					type: 'start',
					event: event,
					stop: function() {
						ok = false;
					}
				});
				
				if (ok) {
					
					var delay = (event.type.indexOf('touch') == 0) ?
						self.__options.delayTouch :
						self.__options.delay;
					
					if (delay[0]) {
						
						self.__timeouts.open = setTimeout(function() {
							
							self.__timeouts.open = null;
							
							// open only if the pointer (mouse or touch) is still over the origin.
							// The check on the "meaningful event" can only be made here, after some
							// time has passed (to know if the touch was a swipe or not)
							if (self.__pointerIsOverOrigin && self._touchIsMeaningfulEvent(event)) {
								
								// signal that we go on
								self._trigger('startend');
								
								self._open(event);
							}
							else {
								// signal that we cancel
								self._trigger('startcancel');
							}
						}, delay[0]);
					}
					else {
						// signal that we go on
						self._trigger('startend');
						
						self._open(event);
					}
				}
			}
		}
		
		return self;
	},
	
	/**
	 * Meant for plugins to get their options
	 * 
	 * @param {string} pluginName The name of the plugin that asks for its options
	 * @param {object} defaultOptions The default options of the plugin
	 * @returns {object} The options
	 * @protected
	 */
	_optionsExtract: function(pluginName, defaultOptions) {
		
		var self = this,
			options = $.extend(true, {}, defaultOptions);
		
		// if the plugin options were isolated in a property named after the
		// plugin, use them (prevents conflicts with other plugins)
		var pluginOptions = self.__options[pluginName];
		
		// if not, try to get them as regular options
		if (!pluginOptions){
			
			pluginOptions = {};
			
			$.each(defaultOptions, function(optionName, value) {
				
				var o = self.__options[optionName];
				
				if (o !== undefined) {
					pluginOptions[optionName] = o;
				}
			});
		}
		
		// let's merge the default options and the ones that were provided. We'd want
		// to do a deep copy but not let jQuery merge arrays, so we'll do a shallow
		// extend on two levels, that will be enough if options are not more than 1
		// level deep
		$.each(options, function(optionName, value) {
			
			if (pluginOptions[optionName] !== undefined) {
				
				if ((		typeof value == 'object'
						&&	!(value instanceof Array)
						&&	value != null
					)
					&&
					(		typeof pluginOptions[optionName] == 'object'
						&&	!(pluginOptions[optionName] instanceof Array)
						&&	pluginOptions[optionName] != null
					)
				) {
					$.extend(options[optionName], pluginOptions[optionName]);
				}
				else {
					options[optionName] = pluginOptions[optionName];
				}
			}
		});
		
		return options;
	},
	
	/**
	 * Used at instantiation of the plugin, or afterwards by plugins that activate themselves
	 * on existing instances
	 * 
	 * @param {object} pluginName
	 * @returns {self}
	 * @protected
	 */
	_plug: function(pluginName) {
		
		var plugin = $.tooltipster._plugin(pluginName);
		
		if (plugin) {
			
			// if there is a constructor for instances
			if (plugin.instance) {
				
				// proxy non-private methods on the instance to allow new instance methods
				$.tooltipster.__bridge(plugin.instance, this, plugin.name);
			}
		}
		else {
			throw new Error('The "'+ pluginName +'" plugin is not defined');
		}
		
		return this;
	},
	
	/**
	 * This will return true if the event is a mouse event which was
	 * emulated by the browser after a touch event. This allows us to
	 * really dissociate mouse and touch triggers.
	 * 
	 * There is a margin of error if a real mouse event is fired right
	 * after (within the delay shown below) a touch event on the same
	 * element, but hopefully it should not happen often.
	 * 
	 * @returns {boolean}
	 * @protected
	 */
	_touchIsEmulatedEvent: function(event) {
		
		var isEmulated = false,
			now = new Date().getTime();
		
		for (var i = this.__touchEvents.length - 1; i >= 0; i--) {
			
			var e = this.__touchEvents[i];
			
			// delay, in milliseconds. It's supposed to be 300ms in
			// most browsers (350ms on iOS) to allow a double tap but
			// can be less (check out FastClick for more info)
			if (now - e.time < 500) {
				
				if (e.target === event.target) {
					isEmulated = true;
				}
			}
			else {
				break;
			}
		}
		
		return isEmulated;
	},
	
	/**
	 * Returns false if the event was an emulated mouse event or
	 * a touch event involved in a swipe gesture.
	 * 
	 * @param {object} event
	 * @returns {boolean}
	 * @protected
	 */
	_touchIsMeaningfulEvent: function(event) {
		return (
				(this._touchIsTouchEvent(event) && !this._touchSwiped(event.target))
			||	(!this._touchIsTouchEvent(event) && !this._touchIsEmulatedEvent(event))
		);
	},
	
	/**
	 * Checks if an event is a touch event
	 * 
	 * @param {object} event
	 * @returns {boolean}
	 * @protected
	 */
	_touchIsTouchEvent: function(event){
		return event.type.indexOf('touch') == 0;
	},
	
	/**
	 * Store touch events for a while to detect swiping and emulated mouse events
	 * 
	 * @param {object} event
	 * @returns {self}
	 * @protected
	 */
	_touchRecordEvent: function(event) {
		
		if (this._touchIsTouchEvent(event)) {
			event.time = new Date().getTime();
			this.__touchEvents.push(event);
		}
		
		return this;
	},
	
	/**
	 * Returns true if a swipe happened after the last touchstart event fired on
	 * event.target.
	 * 
	 * We need to differentiate a swipe from a tap before we let the event open
	 * or close the tooltip. A swipe is when a touchmove (scroll) event happens
	 * on the body between the touchstart and the touchend events of an element.
	 * 
	 * @param {object} target The HTML element that may have triggered the swipe
	 * @returns {boolean}
	 * @protected
	 */
	_touchSwiped: function(target) {
		
		var swiped = false;
		
		for (var i = this.__touchEvents.length - 1; i >= 0; i--) {
			
			var e = this.__touchEvents[i];
			
			if (e.type == 'touchmove') {
				swiped = true;
				break;
			}
			else if (
				e.type == 'touchstart'
				&&	target === e.target
			) {
				break;
			}
		}
		
		return swiped;
	},
	
	/**
	 * Triggers an event on the instance emitters
	 * 
	 * @returns {self}
	 * @protected
	 */
	_trigger: function() {
		
		var args = Array.prototype.slice.apply(arguments);
		
		if (typeof args[0] == 'string') {
			args[0] = { type: args[0] };
		}
		
		// add properties to the event
		args[0].instance = this;
		args[0].origin = this._$origin ? this._$origin[0] : null;
		args[0].tooltip = this._$tooltip ? this._$tooltip[0] : null;
		
		// note: the order of emitters matters
		this.__$emitterPrivate.trigger.apply(this.__$emitterPrivate, args);
		$.tooltipster._trigger.apply($.tooltipster, args);
		this.__$emitterPublic.trigger.apply(this.__$emitterPublic, args);
		
		return this;
	},
	
	/**
	 * Deactivate a plugin on this instance
	 * 
	 * @returns {self}
	 * @protected
	 */
	_unplug: function(pluginName) {
		
		var self = this;
		
		// if the plugin has been activated on this instance
		if (self[pluginName]) {
			
			var plugin = $.tooltipster._plugin(pluginName);
			
			// if there is a constructor for instances
			if (plugin.instance) {
				
				// unbridge
				$.each(plugin.instance, function(methodName, fn) {
					
					// if the method exists (privates methods do not) and comes indeed from
					// this plugin (may be missing or come from a conflicting plugin).
					if (	self[methodName]
						&&	self[methodName].bridged === self[pluginName]
					) {
						delete self[methodName];
					}
				});
			}
			
			// destroy the plugin
			if (self[pluginName].__destroy) {
				self[pluginName].__destroy();
			}
			
			// remove the reference to the plugin instance
			delete self[pluginName];
		}
		
		return self;
	},
	
	/**
	 * @see self::_close
	 * @returns {self}
	 * @public
	 */
	close: function(callback) {
		
		if (!this.__destroyed) {
			this._close(null, callback);
		}
		else {
			this.__destroyError();
		}
		
		return this;
	},
	
	/**
	 * Sets or gets the content of the tooltip
	 * 
	 * @returns {mixed|self}
	 * @public
	 */
	content: function(content) {
		
		var self = this;
		
		// getter method
		if (content === undefined) {
			return self.__Content;
		}
		// setter method
		else {
			
			if (!self.__destroyed) {
				
				// change the content
				self.__contentSet(content);
				
				if (self.__Content !== null) {
					
					// update the tooltip if it is open
					if (self.__state !== 'closed') {
						
						// reset the content in the tooltip
						self.__contentInsert();
						
						// reposition and resize the tooltip
						self.reposition();
						
						// if we want to play a little animation showing the content changed
						if (self.__options.updateAnimation) {
							
							if (env.hasTransitions) {
								
								// keep the reference in the local scope
								var animation = self.__options.updateAnimation;
								
								self._$tooltip.addClass('tooltipster-update-'+ animation);
								
								// remove the class after a while. The actual duration of the
								// update animation may be shorter, it's set in the CSS rules
								setTimeout(function() {
									
									if (self.__state != 'closed') {
										
										self._$tooltip.removeClass('tooltipster-update-'+ animation);
									}
								}, 1000);
							}
							else {
								self._$tooltip.fadeTo(200, 0.5, function() {
									if (self.__state != 'closed') {
										self._$tooltip.fadeTo(200, 1);
									}
								});
							}
						}
					}
				}
				else {
					self._close();
				}
			}
			else {
				self.__destroyError();
			}
			
			return self;
		}
	},
	
	/**
	 * Destroys the tooltip
	 * 
	 * @returns {self}
	 * @public
	 */
	destroy: function() {
		
		var self = this;
		
		if (!self.__destroyed) {
			
			if(self.__state != 'closed'){
				
				// no closing delay
				self.option('animationDuration', 0)
					// force closing
					._close(null, null, true);
			}
			else {
				// there might be an open timeout still running
				self.__timeoutsClear();
			}
			
			// send event
			self._trigger('destroy');
			
			self.__destroyed = true;
			
			self._$origin
				.removeData(self.__namespace)
				// remove the open trigger listeners
				.off('.'+ self.__namespace +'-triggerOpen');
			
			// remove the touch listener
			$(env.window.document.body).off('.' + self.__namespace +'-triggerOpen');
			
			var ns = self._$origin.data('tooltipster-ns');
			
			// if the origin has been removed from DOM, its data may
			// well have been destroyed in the process and there would
			// be nothing to clean up or restore
			if (ns) {
				
				// if there are no more tooltips on this element
				if (ns.length === 1) {
					
					// optional restoration of a title attribute
					var title = null;
					if (self.__options.restoration == 'previous') {
						title = self._$origin.data('tooltipster-initialTitle');
					}
					else if (self.__options.restoration == 'current') {
						
						// old school technique to stringify when outerHTML is not supported
						title = (typeof self.__Content == 'string') ?
							self.__Content :
							$('<div></div>').append(self.__Content).html();
					}
					
					if (title) {
						self._$origin.attr('title', title);
					}
					
					// final cleaning
					
					self._$origin.removeClass('tooltipstered');
					
					self._$origin
						.removeData('tooltipster-ns')
						.removeData('tooltipster-initialTitle');
				}
				else {
					// remove the instance namespace from the list of namespaces of
					// tooltips present on the element
					ns = $.grep(ns, function(el, i) {
						return el !== self.__namespace;
					});
					self._$origin.data('tooltipster-ns', ns);
				}
			}
			
			// last event
			self._trigger('destroyed');
			
			// unbind private and public event listeners
			self._off();
			self.off();
			
			// remove external references, just in case
			self.__Content = null;
			self.__$emitterPrivate = null;
			self.__$emitterPublic = null;
			self.__options.parent = null;
			self._$origin = null;
			self._$tooltip = null;
			
			// make sure the object is no longer referenced in there to prevent
			// memory leaks
			$.tooltipster.__instancesLatestArr = $.grep($.tooltipster.__instancesLatestArr, function(el, i) {
				return self !== el;
			});
			
			clearInterval(self.__garbageCollector);
		}
		else {
			self.__destroyError();
		}
		
		// we return the scope rather than true so that the call to
		// .tooltipster('destroy') actually returns the matched elements
		// and applies to all of them
		return self;
	},
	
	/**
	 * Disables the tooltip
	 * 
	 * @returns {self}
	 * @public
	 */
	disable: function() {
		
		if (!this.__destroyed) {
			
			// close first, in case the tooltip would not disappear on
			// its own (no close trigger)
			this._close();
			this.__enabled = false;
			
			return this;
		}
		else {
			this.__destroyError();
		}
		
		return this;
	},
	
	/**
	 * Returns the HTML element of the origin
	 *
	 * @returns {self}
	 * @public
	 */
	elementOrigin: function() {
		
		if (!this.__destroyed) {
			return this._$origin[0];
		}
		else {
			this.__destroyError();
		}
	},
	
	/**
	 * Returns the HTML element of the tooltip
	 *
	 * @returns {self}
	 * @public
	 */
	elementTooltip: function() {
		return this._$tooltip ? this._$tooltip[0] : null;
	},
	
	/**
	 * Enables the tooltip
	 * 
	 * @returns {self}
	 * @public
	 */
	enable: function() {
		this.__enabled = true;
		return this;
	},
	
	/**
	 * Alias, deprecated in 4.0.0
	 * 
	 * @param {function} callback
	 * @returns {self}
	 * @public
	 */
	hide: function(callback) {
		return this.close(callback);
	},
	
	/**
	 * Returns the instance
	 * 
	 * @returns {self}
	 * @public
	 */
	instance: function() {
		return this;
	},
	
	/**
	 * For public use only, not to be used by plugins (use ::_off() instead)
	 * 
	 * @returns {self}
	 * @public
	 */
	off: function() {
		
		if (!this.__destroyed) {
			this.__$emitterPublic.off.apply(this.__$emitterPublic, Array.prototype.slice.apply(arguments));
		}
		
		return this;
	},
	
	/**
	 * For public use only, not to be used by plugins (use ::_on() instead)
	 *
	 * @returns {self}
	 * @public
	 */
	on: function() {
		
		if (!this.__destroyed) {
			this.__$emitterPublic.on.apply(this.__$emitterPublic, Array.prototype.slice.apply(arguments));
		}
		else {
			this.__destroyError();
		}
		
		return this;
	},
	
	/**
	 * For public use only, not to be used by plugins
	 *
	 * @returns {self}
	 * @public
	 */
	one: function() {
		
		if (!this.__destroyed) {
			this.__$emitterPublic.one.apply(this.__$emitterPublic, Array.prototype.slice.apply(arguments));
		}
		else {
			this.__destroyError();
		}
		
		return this;
	},
	
	/**
	 * @see self::_open
	 * @returns {self}
	 * @public
	 */
	open: function(callback) {
		
		if (!this.__destroyed) {
			this._open(null, callback);
		}
		else {
			this.__destroyError();
		}
		
		return this;
	},
	
	/**
	 * Get or set options. For internal use and advanced users only.
	 * 
	 * @param {string} o Option name
	 * @param {mixed} val optional A new value for the option
	 * @return {mixed|self} If val is omitted, the value of the option
	 * is returned, otherwise the instance itself is returned
	 * @public
	 */ 
	option: function(o, val) {
		
		// getter
		if (val === undefined) {
			return this.__options[o];
		}
		// setter
		else {
			
			if (!this.__destroyed) {
				
				// change value
				this.__options[o] = val;
				
				// format
				this.__optionsFormat();
				
				// re-prepare the triggers if needed
				if ($.inArray(o, ['trigger', 'triggerClose', 'triggerOpen']) >= 0) {
					this.__prepareOrigin();
				}
				
				if (o === 'selfDestruction') {
					this.__prepareGC();
				}
			}
			else {
				this.__destroyError();
			}
			
			return this;
		}
	},
	
	/**
	 * This method is in charge of setting the position and size properties of the tooltip.
	 * All the hard work is delegated to the display plugin.
	 * Note: The tooltip may be detached from the DOM at the moment the method is called 
	 * but must be attached by the end of the method call.
	 * 
	 * @param {object} event For internal use only. Defined if an event such as
	 * window resizing triggered the repositioning
	 * @param {boolean} tooltipIsDetached For internal use only. Set this to true if you
	 * know that the tooltip not being in the DOM is not an issue (typically when the
	 * tooltip element has just been created but has not been added to the DOM yet).
	 * @returns {self}
	 * @public
	 */
	reposition: function(event, tooltipIsDetached) {
		
		var self = this;
		
		if (!self.__destroyed) {
			
			// if the tooltip is still open and the origin is still in the DOM
			if (self.__state != 'closed' && bodyContains(self._$origin)) {
				
				// if the tooltip has not been removed from DOM manually (or if it
				// has been detached on purpose)
				if (tooltipIsDetached || bodyContains(self._$tooltip)) {
					
					if (!tooltipIsDetached) {
						// detach in case the tooltip overflows the window and adds
						// scrollbars to it, so __geometry can be accurate
						self._$tooltip.detach();
					}
					
					// refresh the geometry object before passing it as a helper
					self.__Geometry = self.__geometry();
					
					// let a plugin fo the rest
					self._trigger({
						type: 'reposition',
						event: event,
						helper: {
							geo: self.__Geometry
						}
					});
				}
			}
		}
		else {
			self.__destroyError();
		}
		
		return self;
	},
	
	/**
	 * Alias, deprecated in 4.0.0
	 *
	 * @param callback
	 * @returns {self}
	 * @public
	 */
	show: function(callback) {
		return this.open(callback);
	},
	
	/**
	 * Returns some properties about the instance
	 * 
	 * @returns {object}
	 * @public
	 */
	status: function() {
		
		return {
			destroyed: this.__destroyed,
			enabled: this.__enabled,
			open: this.__state !== 'closed',
			state: this.__state
		};
	},
	
	/**
	 * For public use only, not to be used by plugins
	 *
	 * @returns {self}
	 * @public
	 */
	triggerHandler: function() {
		
		if (!this.__destroyed) {
			this.__$emitterPublic.triggerHandler.apply(this.__$emitterPublic, Array.prototype.slice.apply(arguments));
		}
		else {
			this.__destroyError();
		}
		
		return this;
	}
};

$.fn.tooltipster = function() {
	
	// for using in closures
	var args = Array.prototype.slice.apply(arguments),
		// common mistake: an HTML element can't be in several tooltips at the same time
		contentCloningWarning = 'You are using a single HTML element as content for several tooltips. You probably want to set the contentCloning option to TRUE.';
	
	// this happens with $(sel).tooltipster(...) when $(sel) does not match anything
	if (this.length === 0) {
		
		// still chainable
		return this;
	}
	// this happens when calling $(sel).tooltipster('methodName or options')
	// where $(sel) matches one or more elements
	else {
		
		// method calls
		if (typeof args[0] === 'string') {
			
			var v = '#*$~&';
			
			this.each(function() {
				
				// retrieve the namepaces of the tooltip(s) that exist on that element.
				// We will interact with the first tooltip only.
				var ns = $(this).data('tooltipster-ns'),
					// self represents the instance of the first tooltipster plugin
					// associated to the current HTML object of the loop
					self = ns ? $(this).data(ns[0]) : null;
				
				// if the current element holds a tooltipster instance
				if (self) {
					
					if (typeof self[args[0]] === 'function') {
						
						if (	this.length > 1
							&&	args[0] == 'content'
							&&	(	args[1] instanceof $
								|| (typeof args[1] == 'object' && args[1] != null && args[1].tagName)
							)
							&&	!self.__options.contentCloning
							&&	self.__options.debug
						) {
							console.log(contentCloningWarning);
						}
						
						// note : args[1] and args[2] may not be defined
						var resp = self[args[0]](args[1], args[2]);
					}
					else {
						throw new Error('Unknown method "'+ args[0] +'"');
					}
					
					// if the function returned anything other than the instance
					// itself (which implies chaining, except for the `instance` method)
					if (resp !== self || args[0] === 'instance') {
						
						v = resp;
						
						// return false to stop .each iteration on the first element
						// matched by the selector
						return false;
					}
				}
				else {
					throw new Error('You called Tooltipster\'s "'+ args[0] +'" method on an uninitialized element');
				}
			});
			
			return (v !== '#*$~&') ? v : this;
		}
		// first argument is undefined or an object: the tooltip is initializing
		else {
			
			// reset the array of last initialized objects
			$.tooltipster.__instancesLatestArr = [];
			
			// is there a defined value for the multiple option in the options object ?
			var	multipleIsSet = args[0] && args[0].multiple !== undefined,
				// if the multiple option is set to true, or if it's not defined but
				// set to true in the defaults
				multiple = (multipleIsSet && args[0].multiple) || (!multipleIsSet && defaults.multiple),
				// same for content
				contentIsSet = args[0] && args[0].content !== undefined,
				content = (contentIsSet && args[0].content) || (!contentIsSet && defaults.content),
				// same for contentCloning
				contentCloningIsSet = args[0] && args[0].contentCloning !== undefined,
				contentCloning =
						(contentCloningIsSet && args[0].contentCloning)
					||	(!contentCloningIsSet && defaults.contentCloning),
				// same for debug
				debugIsSet = args[0] && args[0].debug !== undefined,
				debug = (debugIsSet && args[0].debug) || (!debugIsSet && defaults.debug);
			
			if (	this.length > 1
				&&	(	content instanceof $
					|| (typeof content == 'object' && content != null && content.tagName)
				)
				&&	!contentCloning
				&&	debug
			) {
				console.log(contentCloningWarning);
			}
			
			// create a tooltipster instance for each element if it doesn't
			// already have one or if the multiple option is set, and attach the
			// object to it
			this.each(function() {
				
				var go = false,
					$this = $(this),
					ns = $this.data('tooltipster-ns'),
					obj = null;
				
				if (!ns) {
					go = true;
				}
				else if (multiple) {
					go = true;
				}
				else if (debug) {
					console.log('Tooltipster: one or more tooltips are already attached to the element below. Ignoring.');
					console.log(this);
				}
				
				if (go) {
					obj = new $.Tooltipster(this, args[0]);
					
					// save the reference of the new instance
					if (!ns) ns = [];
					ns.push(obj.__namespace);
					$this.data('tooltipster-ns', ns);
					
					// save the instance itself
					$this.data(obj.__namespace, obj);
					
					// call our constructor custom function.
					// we do this here and not in ::init() because we wanted
					// the object to be saved in $this.data before triggering
					// it
					if (obj.__options.functionInit) {
						obj.__options.functionInit.call(obj, obj, {
							origin: this
						});
					}
					
					// and now the event, for the plugins and core emitter
					obj._trigger('init');
				}
				
				$.tooltipster.__instancesLatestArr.push(obj);
			});
			
			return this;
		}
	}
};

// Utilities

/**
 * A class to check if a tooltip can fit in given dimensions
 * 
 * @param {object} $tooltip The jQuery wrapped tooltip element, or a clone of it
 */
function Ruler($tooltip) {
	
	// list of instance variables
	
	this.$container;
	this.constraints = null;
	this.__$tooltip;
	
	this.__init($tooltip);
}

Ruler.prototype = {
	
	/**
	 * Move the tooltip into an invisible div that does not allow overflow to make
	 * size tests. Note: the tooltip may or may not be attached to the DOM at the
	 * moment this method is called, it does not matter.
	 * 
	 * @param {object} $tooltip The object to test. May be just a clone of the
	 * actual tooltip.
	 * @private
	 */
	__init: function($tooltip) {
		
		this.__$tooltip = $tooltip;
		
		this.__$tooltip
			.css({
				// for some reason we have to specify top and left 0
				left: 0,
				// any overflow will be ignored while measuring
				overflow: 'hidden',
				// positions at (0,0) without the div using 100% of the available width
				position: 'absolute',
				top: 0
			})
			// overflow must be auto during the test. We re-set this in case
			// it were modified by the user
			.find('.tooltipster-content')
				.css('overflow', 'auto');
		
		this.$container = $('<div class="tooltipster-ruler"></div>')
			.append(this.__$tooltip)
			.appendTo(env.window.document.body);
	},
	
	/**
	 * Force the browser to redraw (re-render) the tooltip immediately. This is required
	 * when you changed some CSS properties and need to make something with it
	 * immediately, without waiting for the browser to redraw at the end of instructions.
	 *
	 * @see http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes
	 * @private
	 */
	__forceRedraw: function() {
		
		// note: this would work but for Webkit only
		//this.__$tooltip.close();
		//this.__$tooltip[0].offsetHeight;
		//this.__$tooltip.open();
		
		// works in FF too
		var $p = this.__$tooltip.parent();
		this.__$tooltip.detach();
		this.__$tooltip.appendTo($p);
	},
	
	/**
	 * Set maximum dimensions for the tooltip. A call to ::measure afterwards
	 * will tell us if the content overflows or if it's ok
	 *
	 * @param {int} width
	 * @param {int} height
	 * @return {Ruler}
	 * @public
	 */
	constrain: function(width, height) {
		
		this.constraints = {
			width: width,
			height: height
		};
		
		this.__$tooltip.css({
			// we disable display:flex, otherwise the content would overflow without
			// creating horizontal scrolling (which we need to detect).
			display: 'block',
			// reset any previous height
			height: '',
			// we'll check if horizontal scrolling occurs
			overflow: 'auto',
			// we'll set the width and see what height is generated and if there
			// is horizontal overflow
			width: width
		});
		
		return this;
	},
	
	/**
	 * Reset the tooltip content overflow and remove the test container
	 * 
	 * @returns {Ruler}
	 * @public
	 */
	destroy: function() {
		
		// in case the element was not a clone
		this.__$tooltip
			.detach()
			.find('.tooltipster-content')
				.css({
					// reset to CSS value
					display: '',
					overflow: ''
				});
		
		this.$container.remove();
	},
	
	/**
	 * Removes any constraints
	 * 
	 * @returns {Ruler}
	 * @public
	 */
	free: function() {
		
		this.constraints = null;
		
		// reset to natural size
		this.__$tooltip.css({
			display: '',
			height: '',
			overflow: 'visible',
			width: ''
		});
		
		return this;
	},
	
	/**
	 * Returns the size of the tooltip. When constraints are applied, also returns
	 * whether the tooltip fits in the provided dimensions.
	 * The idea is to see if the new height is small enough and if the content does
	 * not overflow horizontally.
	 *
	 * @param {int} width
	 * @param {int} height
	 * @returns {object} An object with a bool `fits` property and a `size` property
	 * @public
	 */
	measure: function() {
		
		this.__forceRedraw();
		
		var tooltipBcr = this.__$tooltip[0].getBoundingClientRect(),
			result = { size: {
				// bcr.width/height are not defined in IE8- but in this
				// case, bcr.right/bottom will have the same value
				// except in iOS 8+ where tooltipBcr.bottom/right are wrong
				// after scrolling for reasons yet to be determined.
				// tooltipBcr.top/left might not be 0, see issue #514
				height: tooltipBcr.height || (tooltipBcr.bottom - tooltipBcr.top),
				width: tooltipBcr.width || (tooltipBcr.right - tooltipBcr.left)
			}};
		
		if (this.constraints) {
			
			// note: we used to use offsetWidth instead of boundingRectClient but
			// it returned rounded values, causing issues with sub-pixel layouts.
			
			// note2: noticed that the bcrWidth of text content of a div was once
			// greater than the bcrWidth of its container by 1px, causing the final
			// tooltip box to be too small for its content. However, evaluating
			// their widths one against the other (below) surprisingly returned
			// equality. Happened only once in Chrome 48, was not able to reproduce
			// => just having fun with float position values...
			
			var $content = this.__$tooltip.find('.tooltipster-content'),
				height = this.__$tooltip.outerHeight(),
				contentBcr = $content[0].getBoundingClientRect(),
				fits = {
					height: height <= this.constraints.height,
					width: (
						// this condition accounts for min-width property that
						// may apply
						tooltipBcr.width <= this.constraints.width
							// the -1 is here because scrollWidth actually returns
							// a rounded value, and may be greater than bcr.width if
							// it was rounded up. This may cause an issue for contents
							// which actually really overflow  by 1px or so, but that
							// should be rare. Not sure how to solve this efficiently.
							// See http://blogs.msdn.com/b/ie/archive/2012/02/17/sub-pixel-rendering-and-the-css-object-model.aspx
						&&	contentBcr.width >= $content[0].scrollWidth - 1
					)
				};
			
			result.fits = fits.height && fits.width;
		}
		
		// old versions of IE get the width wrong for some reason and it causes
		// the text to be broken to a new line, so we round it up. If the width
		// is the width of the screen though, we can assume it is accurate.
		if (	env.IE
			&&	env.IE <= 11
			&&	result.size.width !== env.window.document.documentElement.clientWidth
		) {
			result.size.width = Math.ceil(result.size.width) + 1;
		}
		
		return result;
	}
};

// quick & dirty compare function, not bijective nor multidimensional
function areEqual(a,b) {
	var same = true;
	$.each(a, function(i, _) {
		if (b[i] === undefined || a[i] !== b[i]) {
			same = false;
			return false;
		}
	});
	return same;
}

/**
 * A fast function to check if an element is still in the DOM. It
 * tries to use an id as ids are indexed by the browser, or falls
 * back to jQuery's `contains` method. May fail if two elements
 * have the same id, but so be it
 *
 * @param {object} $obj A jQuery-wrapped HTML element
 * @return {boolean}
 */
function bodyContains($obj) {
	var id = $obj.attr('id'),
		el = id ? env.window.document.getElementById(id) : null;
	// must also check that the element with the id is the one we want
	return el ? el === $obj[0] : $.contains(env.window.document.body, $obj[0]);
}

// detect IE versions for dirty fixes
var uA = navigator.userAgent.toLowerCase();
if (uA.indexOf('msie') != -1) env.IE = parseInt(uA.split('msie')[1]);
else if (uA.toLowerCase().indexOf('trident') !== -1 && uA.indexOf(' rv:11') !== -1) env.IE = 11;
else if (uA.toLowerCase().indexOf('edge/') != -1) env.IE = parseInt(uA.toLowerCase().split('edge/')[1]);

// detecting support for CSS transitions
function transitionSupport() {
	
	// env.window is not defined yet when this is called
	if (!win) return false;
	
	var b = win.document.body || win.document.documentElement,
		s = b.style,
		p = 'transition',
		v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
	
	if (typeof s[p] == 'string') { return true; }
	
	p = p.charAt(0).toUpperCase() + p.substr(1);
	for (var i=0; i<v.length; i++) {
		if (typeof s[v[i] + p] == 'string') { return true; }
	}
	return false;
}

// we'll return jQuery for plugins not to have to declare it as a dependency,
// but it's done by a build task since it should be included only once at the
// end when we concatenate the main file with a plugin
// sideTip is Tooltipster's default plugin.
// This file will be UMDified by a build task.

var pluginName = 'tooltipster.sideTip';

$.tooltipster._plugin({
	name: pluginName,
	instance: {
		/**
		 * Defaults are provided as a function for an easy override by inheritance
		 *
		 * @return {object} An object with the defaults options
		 * @private
		 */
		__defaults: function() {
			
			return {
				// if the tooltip should display an arrow that points to the origin
				arrow: true,
				// the distance in pixels between the tooltip and the origin
				distance: 6,
				// allows to easily change the position of the tooltip
				functionPosition: null,
				maxWidth: null,
				// used to accomodate the arrow of tooltip if there is one.
				// First to make sure that the arrow target is not too close
				// to the edge of the tooltip, so the arrow does not overflow
				// the tooltip. Secondly when we reposition the tooltip to
				// make sure that it's positioned in such a way that the arrow is
				// still pointing at the target (and not a few pixels beyond it).
				// It should be equal to or greater than half the width of
				// the arrow (by width we mean the size of the side which touches
				// the side of the tooltip).
				minIntersection: 16,
				minWidth: 0,
				// deprecated in 4.0.0. Listed for _optionsExtract to pick it up
				position: null,
				side: 'top',
				// set to false to position the tooltip relatively to the document rather
				// than the window when we open it
				viewportAware: true
			};
		},
		
		/**
		 * Run once: at instantiation of the plugin
		 *
		 * @param {object} instance The tooltipster object that instantiated this plugin
		 * @private
		 */
		__init: function(instance) {
			
			var self = this;
			
			// list of instance variables
			
			self.__instance = instance;
			self.__namespace = 'tooltipster-sideTip-'+ Math.round(Math.random()*1000000);
			self.__previousState = 'closed';
			self.__options;
			
			// initial formatting
			self.__optionsFormat();
			
			self.__instance._on('state.'+ self.__namespace, function(event) {
				
				if (event.state == 'closed') {
					self.__close();
				}
				else if (event.state == 'appearing' && self.__previousState == 'closed') {
					self.__create();
				}
				
				self.__previousState = event.state;
			});
			
			// reformat every time the options are changed
			self.__instance._on('options.'+ self.__namespace, function() {
				self.__optionsFormat();
			});
			
			self.__instance._on('reposition.'+ self.__namespace, function(e) {
				self.__reposition(e.event, e.helper);
			});
		},
		
		/**
		 * Called when the tooltip has closed
		 * 
		 * @private
		 */
		__close: function() {
			
			// detach our content object first, so the next jQuery's remove()
			// call does not unbind its event handlers
			if (this.__instance.content() instanceof $) {
				this.__instance.content().detach();
			}
			
			// remove the tooltip from the DOM
			this.__instance._$tooltip.remove();
			this.__instance._$tooltip = null;
		},
		
		/**
		 * Creates the HTML element of the tooltip.
		 * 
		 * @private
		 */
		__create: function() {
			
			// note: we wrap with a .tooltipster-box div to be able to set a margin on it
			// (.tooltipster-base must not have one)
			var $html = $(
				'<div class="tooltipster-base tooltipster-sidetip">' +
					'<div class="tooltipster-box">' +
						'<div class="tooltipster-content"></div>' +
					'</div>' +
					'<div class="tooltipster-arrow">' +
						'<div class="tooltipster-arrow-uncropped">' +
							'<div class="tooltipster-arrow-border"></div>' +
							'<div class="tooltipster-arrow-background"></div>' +
						'</div>' +
					'</div>' +
				'</div>'
			);
			
			// hide arrow if asked
			if (!this.__options.arrow) {
				$html
					.find('.tooltipster-box')
						.css('margin', 0)
						.end()
					.find('.tooltipster-arrow')
						.hide();
			}
			
			// apply min/max width if asked
			if (this.__options.minWidth) {
				$html.css('min-width', this.__options.minWidth + 'px');
			}
			if (this.__options.maxWidth) {
				$html.css('max-width', this.__options.maxWidth + 'px');
			}
			
			this.__instance._$tooltip = $html;
			
			// tell the instance that the tooltip element has been created
			this.__instance._trigger('created');
		},
		
		/**
		 * Used when the plugin is to be unplugged
		 *
		 * @private
		 */
		__destroy: function() {
			this.__instance._off('.'+ self.__namespace);
		},
		
		/**
		 * (Re)compute this.__options from the options declared to the instance
		 *
		 * @private
		 */
		__optionsFormat: function() {
			
			var self = this;
			
			// get the options
			self.__options = self.__instance._optionsExtract(pluginName, self.__defaults());
			
			// for backward compatibility, deprecated in v4.0.0
			if (self.__options.position) {
				self.__options.side = self.__options.position;
			}
			
			// options formatting
			
			// format distance as a four-cell array if it ain't one yet and then make
			// it an object with top/bottom/left/right properties
			if (typeof self.__options.distance != 'object') {
				self.__options.distance = [self.__options.distance];
			}
			if (self.__options.distance.length < 4) {
				
				if (self.__options.distance[1] === undefined) self.__options.distance[1] = self.__options.distance[0];
				if (self.__options.distance[2] === undefined) self.__options.distance[2] = self.__options.distance[0];
				if (self.__options.distance[3] === undefined) self.__options.distance[3] = self.__options.distance[1];
				
				self.__options.distance = {
					top: self.__options.distance[0],
					right: self.__options.distance[1],
					bottom: self.__options.distance[2],
					left: self.__options.distance[3]
				};
			}
			
			// let's transform:
			// 'top' into ['top', 'bottom', 'right', 'left']
			// 'right' into ['right', 'left', 'top', 'bottom']
			// 'bottom' into ['bottom', 'top', 'right', 'left']
			// 'left' into ['left', 'right', 'top', 'bottom']
			if (typeof self.__options.side == 'string') {
				
				var opposites = {
					'top': 'bottom',
					'right': 'left',
					'bottom': 'top',
					'left': 'right'
				};
				
				self.__options.side = [self.__options.side, opposites[self.__options.side]];
				
				if (self.__options.side[0] == 'left' || self.__options.side[0] == 'right') {
					self.__options.side.push('top', 'bottom');
				}
				else {
					self.__options.side.push('right', 'left');
				}
			}
			
			// misc
			// disable the arrow in IE6 unless the arrow option was explicitly set to true
			if (	$.tooltipster._env.IE === 6
				&&	self.__options.arrow !== true
			) {
				self.__options.arrow = false;
			}
		},
		
		/**
		 * This method must compute and set the positioning properties of the
		 * tooltip (left, top, width, height, etc.). It must also make sure the
		 * tooltip is eventually appended to its parent (since the element may be
		 * detached from the DOM at the moment the method is called).
		 *
		 * We'll evaluate positioning scenarios to find which side can contain the
		 * tooltip in the best way. We'll consider things relatively to the window
		 * (unless the user asks not to), then to the document (if need be, or if the
		 * user explicitly requires the tests to run on the document). For each
		 * scenario, measures are taken, allowing us to know how well the tooltip
		 * is going to fit. After that, a sorting function will let us know what
		 * the best scenario is (we also allow the user to choose his favorite
		 * scenario by using an event).
		 * 
		 * @param {object} helper An object that contains variables that plugin
		 * creators may find useful (see below)
		 * @param {object} helper.geo An object with many layout properties
		 * about objects of interest (window, document, origin). This should help
		 * plugin users compute the optimal position of the tooltip
		 * @private
		 */
		__reposition: function(event, helper) {
			
			var self = this,
				finalResult,
				// to know where to put the tooltip, we need to know on which point
				// of the x or y axis we should center it. That coordinate is the target
				targets = self.__targetFind(helper),
				testResults = [];
			
			// make sure the tooltip is detached while we make tests on a clone
			self.__instance._$tooltip.detach();
			
			// we could actually provide the original element to the Ruler and
			// not a clone, but it just feels right to keep it out of the
			// machinery.
			var $clone = self.__instance._$tooltip.clone(),
				// start position tests session
				ruler = $.tooltipster._getRuler($clone),
				satisfied = false,
				animation = self.__instance.option('animation');
			
			// an animation class could contain properties that distort the size
			if (animation) {
				$clone.removeClass('tooltipster-'+ animation);
			}
			
			// start evaluating scenarios
			$.each(['window', 'document'], function(i, container) {
				
				var takeTest = null;
				
				// let the user decide to keep on testing or not
				self.__instance._trigger({
					container: container,
					helper: helper,
					satisfied: satisfied,
					takeTest: function(bool) {
						takeTest = bool;
					},
					results: testResults,
					type: 'positionTest'
				});
				
				if (	takeTest == true
					||	(	takeTest != false
						&&	satisfied == false
							// skip the window scenarios if asked. If they are reintegrated by
							// the callback of the positionTest event, they will have to be
							// excluded using the callback of positionTested
						&&	(container != 'window' || self.__options.viewportAware)
					)
				) {
					
					// for each allowed side
					for (var i=0; i < self.__options.side.length; i++) {
						
						var distance = {
								horizontal: 0,
								vertical: 0
							},
							side = self.__options.side[i];
						
						if (side == 'top' || side == 'bottom') {
							distance.vertical = self.__options.distance[side];
						}
						else {
							distance.horizontal = self.__options.distance[side];
						}
						
						// this may have an effect on the size of the tooltip if there are css
						// rules for the arrow or something else
						self.__sideChange($clone, side);
						
						$.each(['natural', 'constrained'], function(i, mode) {
							
							takeTest = null;
							
							// emit an event on the instance
							self.__instance._trigger({
								container: container,
								event: event,
								helper: helper,
								mode: mode,
								results: testResults,
								satisfied: satisfied,
								side: side,
								takeTest: function(bool) {
									takeTest = bool;
								},
								type: 'positionTest'
							});
							
							if (	takeTest == true
								||	(	takeTest != false
									&&	satisfied == false
								)
							) {
								
								var testResult = {
									container: container,
									// we let the distance as an object here, it can make things a little easier
									// during the user's calculations at positionTest/positionTested
									distance: distance,
									// whether the tooltip can fit in the size of the viewport (does not mean
									// that we'll be able to make it initially entirely visible, see 'whole')
									fits: null,
									mode: mode,
									outerSize: null,
									side: side,
									size: null,
									target: targets[side],
									// check if the origin has enough surface on screen for the tooltip to
									// aim at it without overflowing the viewport (this is due to the thickness
									// of the arrow represented by the minIntersection length).
									// If not, the tooltip will have to be partly or entirely off screen in
									// order to stay docked to the origin. This value will stay null when the
									// container is the document, as it is not relevant
									whole: null
								};
								
								// get the size of the tooltip with or without size constraints
								var rulerConfigured = (mode == 'natural') ?
										ruler.free() :
										ruler.constrain(
											helper.geo.available[container][side].width - distance.horizontal,
											helper.geo.available[container][side].height - distance.vertical
										),
									rulerResults = rulerConfigured.measure();
								
								testResult.size = rulerResults.size;
								testResult.outerSize = {
									height: rulerResults.size.height + distance.vertical,
									width: rulerResults.size.width + distance.horizontal
								};
								
								if (mode == 'natural') {
									
									if(		helper.geo.available[container][side].width >= testResult.outerSize.width
										&&	helper.geo.available[container][side].height >= testResult.outerSize.height
									) {
										testResult.fits = true;
									}
									else {
										testResult.fits = false;
									}
								}
								else {
									testResult.fits = rulerResults.fits;
								}
								
								if (container == 'window') {
									
									if (!testResult.fits) {
										testResult.whole = false;
									}
									else {
										if (side == 'top' || side == 'bottom') {
											
											testResult.whole = (
													helper.geo.origin.windowOffset.right >= self.__options.minIntersection
												&&	helper.geo.window.size.width - helper.geo.origin.windowOffset.left >= self.__options.minIntersection
											);
										}
										else {
											testResult.whole = (
													helper.geo.origin.windowOffset.bottom >= self.__options.minIntersection
												&&	helper.geo.window.size.height - helper.geo.origin.windowOffset.top >= self.__options.minIntersection
											);
										}
									}
								}
								
								testResults.push(testResult);
								
								// we don't need to compute more positions if we have one fully on screen
								if (testResult.whole) {
									satisfied = true;
								}
								else {
									// don't run the constrained test unless the natural width was greater
									// than the available width, otherwise it's pointless as we know it
									// wouldn't fit either
									if (	testResult.mode == 'natural'
										&&	(	testResult.fits
											||	testResult.size.width <= helper.geo.available[container][side].width
										)
									) {
										return false;
									}
								}
							}
						});
					}
				}
			});
			
			// the user may eliminate the unwanted scenarios from testResults, but he's
			// not supposed to alter them at this point. functionPosition and the
			// position event serve that purpose.
			self.__instance._trigger({
				edit: function(r) {
					testResults = r;
				},
				event: event,
				helper: helper,
				results: testResults,
				type: 'positionTested'
			});
			
			/**
			 * Sort the scenarios to find the favorite one.
			 * 
			 * The favorite scenario is when we can fully display the tooltip on screen,
			 * even if it means that the middle of the tooltip is no longer centered on
			 * the middle of the origin (when the origin is near the edge of the screen
			 * or even partly off screen). We want the tooltip on the preferred side,
			 * even if it means that we have to use a constrained size rather than a
			 * natural one (as long as it fits). When the origin is off screen at the top
			 * the tooltip will be positioned at the bottom (if allowed), if the origin
			 * is off screen on the right, it will be positioned on the left, etc.
			 * If there are no scenarios where the tooltip can fit on screen, or if the
			 * user does not want the tooltip to fit on screen (viewportAware == false),
			 * we fall back to the scenarios relative to the document.
			 * 
			 * When the tooltip is bigger than the viewport in either dimension, we stop
			 * looking at the window scenarios and consider the document scenarios only,
			 * with the same logic to find on which side it would fit best.
			 * 
			 * If the tooltip cannot fit the document on any side, we force it at the
			 * bottom, so at least the user can scroll to see it.
 			 */
			testResults.sort(function(a, b) {
				
				// best if it's whole (the tooltip fits and adapts to the viewport)
				if (a.whole && !b.whole) {
					return -1;
				}
				else if (!a.whole && b.whole) {
					return 1;
				}
				else if (a.whole && b.whole) {
					
					var ai = self.__options.side.indexOf(a.side),
						bi = self.__options.side.indexOf(b.side);
					
					// use the user's sides fallback array
					if (ai < bi) {
						return -1;
					}
					else if (ai > bi) {
						return 1;
					}
					else {
						// will be used if the user forced the tests to continue
						return a.mode == 'natural' ? -1 : 1;
					}
				}
				else {
					
					// better if it fits
					if (a.fits && !b.fits) {
						return -1;
					}
					else if (!a.fits && b.fits) {
						return 1;
					}
					else if (a.fits && b.fits) {
						
						var ai = self.__options.side.indexOf(a.side),
							bi = self.__options.side.indexOf(b.side);
						
						// use the user's sides fallback array
						if (ai < bi) {
							return -1;
						}
						else if (ai > bi) {
							return 1;
						}
						else {
							// will be used if the user forced the tests to continue
							return a.mode == 'natural' ? -1 : 1;
						}
					}
					else {
						
						// if everything failed, this will give a preference to the case where
						// the tooltip overflows the document at the bottom
						if (	a.container == 'document'
							&&	a.side == 'bottom'
							&&	a.mode == 'natural'
						) {
							return -1;
						}
						else {
							return 1;
						}
					}
				}
			});
			
			finalResult = testResults[0];
			
			
			// now let's find the coordinates of the tooltip relatively to the window
			finalResult.coord = {};
			
			switch (finalResult.side) {
				
				case 'left':
				case 'right':
					finalResult.coord.top = Math.floor(finalResult.target - finalResult.size.height / 2);
					break;
				
				case 'bottom':
				case 'top':
					finalResult.coord.left = Math.floor(finalResult.target - finalResult.size.width / 2);
					break;
			}
			
			switch (finalResult.side) {
				
				case 'left':
					finalResult.coord.left = helper.geo.origin.windowOffset.left - finalResult.outerSize.width;
					break;
				
				case 'right':
					finalResult.coord.left = helper.geo.origin.windowOffset.right + finalResult.distance.horizontal;
					break;
				
				case 'top':
					finalResult.coord.top = helper.geo.origin.windowOffset.top - finalResult.outerSize.height;
					break;
				
				case 'bottom':
					finalResult.coord.top = helper.geo.origin.windowOffset.bottom + finalResult.distance.vertical;
					break;
			}
			
			// if the tooltip can potentially be contained within the viewport dimensions
			// and that we are asked to make it fit on screen
			if (finalResult.container == 'window') {
				
				// if the tooltip overflows the viewport, we'll move it accordingly (then it will
				// not be centered on the middle of the origin anymore). We only move horizontally
				// for top and bottom tooltips and vice versa.
				if (finalResult.side == 'top' || finalResult.side == 'bottom') {
					
					// if there is an overflow on the left
					if (finalResult.coord.left < 0) {
						
						// prevent the overflow unless the origin itself gets off screen (minus the
						// margin needed to keep the arrow pointing at the target)
						if (helper.geo.origin.windowOffset.right - this.__options.minIntersection >= 0) {
							finalResult.coord.left = 0;
						}
						else {
							finalResult.coord.left = helper.geo.origin.windowOffset.right - this.__options.minIntersection - 1;
						}
					}
					// or an overflow on the right
					else if (finalResult.coord.left > helper.geo.window.size.width - finalResult.size.width) {
						
						if (helper.geo.origin.windowOffset.left + this.__options.minIntersection <= helper.geo.window.size.width) {
							finalResult.coord.left = helper.geo.window.size.width - finalResult.size.width;
						}
						else {
							finalResult.coord.left = helper.geo.origin.windowOffset.left + this.__options.minIntersection + 1 - finalResult.size.width;
						}
					}
				}
				else {
					
					// overflow at the top
					if (finalResult.coord.top < 0) {
						
						if (helper.geo.origin.windowOffset.bottom - this.__options.minIntersection >= 0) {
							finalResult.coord.top = 0;
						}
						else {
							finalResult.coord.top = helper.geo.origin.windowOffset.bottom - this.__options.minIntersection - 1;
						}
					}
					// or at the bottom
					else if (finalResult.coord.top > helper.geo.window.size.height - finalResult.size.height) {
						
						if (helper.geo.origin.windowOffset.top + this.__options.minIntersection <= helper.geo.window.size.height) {
							finalResult.coord.top = helper.geo.window.size.height - finalResult.size.height;
						}
						else {
							finalResult.coord.top = helper.geo.origin.windowOffset.top + this.__options.minIntersection + 1 - finalResult.size.height;
						}
					}
				}
			}
			else {
				
				// there might be overflow here too but it's easier to handle. If there has
				// to be an overflow, we'll make sure it's on the right side of the screen
				// (because the browser will extend the document size if there is an overflow
				// on the right, but not on the left). The sort function above has already
				// made sure that a bottom document overflow is preferred to a top overflow,
				// so we don't have to care about it.
				
				// if there is an overflow on the right
				if (finalResult.coord.left > helper.geo.window.size.width - finalResult.size.width) {
					
					// this may actually create on overflow on the left but we'll fix it in a sec
					finalResult.coord.left = helper.geo.window.size.width - finalResult.size.width;
				}
				
				// if there is an overflow on the left
				if (finalResult.coord.left < 0) {
					
					// don't care if it overflows the right after that, we made our best
					finalResult.coord.left = 0;
				}
			}
			
			
			// submit the positioning proposal to the user function which may choose to change
			// the side, size and/or the coordinates
			
			// first, set the rules that corresponds to the proposed side: it may change
			// the size of the tooltip, and the custom functionPosition may want to detect the
			// size of something before making a decision. So let's make things easier for the
			// implementor
			self.__sideChange($clone, finalResult.side);
			
			// add some variables to the helper
			helper.tooltipClone = $clone[0];
			helper.tooltipParent = self.__instance.option('parent').parent[0];
			// move informative values to the helper
			helper.mode = finalResult.mode;
			helper.whole = finalResult.whole;
			// add some variables to the helper for the functionPosition callback (these
			// will also be added to the event fired by self.__instance._trigger but that's
			// ok, we're just being consistent)
			helper.origin = self.__instance._$origin[0];
			helper.tooltip = self.__instance._$tooltip[0];
			
			// leave only the actionable values in there for functionPosition
			delete finalResult.container;
			delete finalResult.fits;
			delete finalResult.mode;
			delete finalResult.outerSize;
			delete finalResult.whole;
			
			// keep only the distance on the relevant side, for clarity
			finalResult.distance = finalResult.distance.horizontal || finalResult.distance.vertical;
			
			// beginners may not be comfortable with the concept of editing the object
			//  passed by reference, so we provide an edit function and pass a clone
			var finalResultClone = $.extend(true, {}, finalResult);
			
			// emit an event on the instance
			self.__instance._trigger({
				edit: function(result) {
					finalResult = result;
				},
				event: event,
				helper: helper,
				position: finalResultClone,
				type: 'position'
			});
			
			if (self.__options.functionPosition) {
				
				var result = self.__options.functionPosition.call(self, self.__instance, helper, finalResultClone);
				
				if (result) finalResult = result;
			}
			
			// end the positioning tests session (the user might have had a
			// use for it during the position event, now it's over)
			ruler.destroy();
			
			// compute the position of the target relatively to the tooltip root
			// element so we can place the arrow and make the needed adjustments
			var arrowCoord,
				maxVal;
			
			if (finalResult.side == 'top' || finalResult.side == 'bottom') {
				
				arrowCoord = {
					prop: 'left',
					val: finalResult.target - finalResult.coord.left
				};
				maxVal = finalResult.size.width - this.__options.minIntersection;
			}
			else {
				
				arrowCoord = {
					prop: 'top',
					val: finalResult.target - finalResult.coord.top
				};
				maxVal = finalResult.size.height - this.__options.minIntersection;
			}
			
			// cannot lie beyond the boundaries of the tooltip, minus the
			// arrow margin
			if (arrowCoord.val < this.__options.minIntersection) {
				arrowCoord.val = this.__options.minIntersection;
			}
			else if (arrowCoord.val > maxVal) {
				arrowCoord.val = maxVal;
			}
			
			var originParentOffset;
			
			// let's convert the window-relative coordinates into coordinates relative to the
			// future positioned parent that the tooltip will be appended to
			if (helper.geo.origin.fixedLineage) {
				
				// same as windowOffset when the position is fixed
				originParentOffset = helper.geo.origin.windowOffset;
			}
			else {
				
				// this assumes that the parent of the tooltip is located at
				// (0, 0) in the document, typically like when the parent is
				// <body>.
				// If we ever allow other types of parent, .tooltipster-ruler
				// will have to be appended to the parent to inherit css style
				// values that affect the display of the text and such.
				originParentOffset = {
					left: helper.geo.origin.windowOffset.left + helper.geo.window.scroll.left,
					top: helper.geo.origin.windowOffset.top + helper.geo.window.scroll.top
				};
			}
			
			finalResult.coord = {
				left: originParentOffset.left + (finalResult.coord.left - helper.geo.origin.windowOffset.left),
				top: originParentOffset.top + (finalResult.coord.top - helper.geo.origin.windowOffset.top)
			};
			
			// set position values on the original tooltip element
			
			self.__sideChange(self.__instance._$tooltip, finalResult.side);
			
			if (helper.geo.origin.fixedLineage) {
				self.__instance._$tooltip
					.css('position', 'fixed');
			}
			else {
				// CSS default
				self.__instance._$tooltip
					.css('position', '');
			}
			
			self.__instance._$tooltip
				.css({
					left: finalResult.coord.left,
					top: finalResult.coord.top,
					// we need to set a size even if the tooltip is in its natural size
					// because when the tooltip is positioned beyond the width of the body
					// (which is by default the width of the window; it will happen when
					// you scroll the window horizontally to get to the origin), its text
					// content will otherwise break lines at each word to keep up with the
					// body overflow strategy.
					height: finalResult.size.height,
					width: finalResult.size.width
				})
				.find('.tooltipster-arrow')
					.css({
						'left': '',
						'top': ''
					})
					.css(arrowCoord.prop, arrowCoord.val);
			
			// append the tooltip HTML element to its parent
			self.__instance._$tooltip.appendTo(self.__instance.option('parent'));
			
			self.__instance._trigger({
				type: 'repositioned',
				event: event,
				position: finalResult
			});
		},
		
		/**
		 * Make whatever modifications are needed when the side is changed. This has
		 * been made an independant method for easy inheritance in custom plugins based
		 * on this default plugin.
		 *
		 * @param {object} $obj
		 * @param {string} side
		 * @private
		 */
		__sideChange: function($obj, side) {
			
			$obj
				.removeClass('tooltipster-bottom')
				.removeClass('tooltipster-left')
				.removeClass('tooltipster-right')
				.removeClass('tooltipster-top')
				.addClass('tooltipster-'+ side);
		},
		
		/**
		 * Returns the target that the tooltip should aim at for a given side.
		 * The calculated value is a distance from the edge of the window
		 * (left edge for top/bottom sides, top edge for left/right side). The
		 * tooltip will be centered on that position and the arrow will be
		 * positioned there (as much as possible).
		 *
		 * @param {object} helper
		 * @return {integer}
		 * @private
		 */
		__targetFind: function(helper) {
			
			var target = {},
				rects = this.__instance._$origin[0].getClientRects();
			
			// these lines fix a Chrome bug (issue #491)
			if (rects.length > 1) {
				var opacity = this.__instance._$origin.css('opacity');
				if(opacity == 1) {
					this.__instance._$origin.css('opacity', 0.99);
					rects = this.__instance._$origin[0].getClientRects();
					this.__instance._$origin.css('opacity', 1);
				}
			}
			
			// by default, the target will be the middle of the origin
			if (rects.length < 2) {
				
				target.top = Math.floor(helper.geo.origin.windowOffset.left + (helper.geo.origin.size.width / 2));
				target.bottom = target.top;
				
				target.left = Math.floor(helper.geo.origin.windowOffset.top + (helper.geo.origin.size.height / 2));
				target.right = target.left;
			}
			// if multiple client rects exist, the element may be text split
			// up into multiple lines and the middle of the origin may not be
			// best option anymore. We need to choose the best target client rect
			else {
				
				// top: the first
				var targetRect = rects[0];
				target.top = Math.floor(targetRect.left + (targetRect.right - targetRect.left) / 2);
		
				// right: the middle line, rounded down in case there is an even
				// number of lines (looks more centered => check out the
				// demo with 4 split lines)
				if (rects.length > 2) {
					targetRect = rects[Math.ceil(rects.length / 2) - 1];
				}
				else {
					targetRect = rects[0];
				}
				target.right = Math.floor(targetRect.top + (targetRect.bottom - targetRect.top) / 2);
		
				// bottom: the last
				targetRect = rects[rects.length - 1];
				target.bottom = Math.floor(targetRect.left + (targetRect.right - targetRect.left) / 2);
		
				// left: the middle line, rounded up
				if (rects.length > 2) {
					targetRect = rects[Math.ceil((rects.length + 1) / 2) - 1];
				}
				else {
					targetRect = rects[rects.length - 1];
				}
				
				target.left = Math.floor(targetRect.top + (targetRect.bottom - targetRect.top) / 2);
			}
			
			return target;
		}
	}
});

/* a build task will add "return $;" here */
return $;

}));
/*!
 * URI.js - Mutating URLs
 *
 * Version: 1.19.11
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 */

(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof module === 'object' && module.exports) {
    // Node
    module.exports = factory(require('./punycode'), require('./IPv6'), require('./SecondLevelDomains'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['./punycode', './IPv6', './SecondLevelDomains'], factory);
  } else {
    // Browser globals (root is window)
    root.URI = factory(root.punycode, root.IPv6, root.SecondLevelDomains, root);
  }
}(this, function (punycode, IPv6, SLD, root) {
  'use strict';
  /*global location, escape, unescape */
  // FIXME: v2.0.0 renamce non-camelCase properties to uppercase
  /*jshint camelcase: false */

  // save current URI variable, if any
  var _URI = root && root.URI;

  function URI(url, base) {
    var _urlSupplied = arguments.length >= 1;
    var _baseSupplied = arguments.length >= 2;

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof URI)) {
      if (_urlSupplied) {
        if (_baseSupplied) {
          return new URI(url, base);
        }

        return new URI(url);
      }

      return new URI();
    }

    if (url === undefined) {
      if (_urlSupplied) {
        throw new TypeError('undefined is not a valid argument for URI');
      }

      if (typeof location !== 'undefined') {
        url = location.href + '';
      } else {
        url = '';
      }
    }

    if (url === null) {
      if (_urlSupplied) {
        throw new TypeError('null is not a valid argument for URI');
      }
    }

    this.href(url);

    // resolve to base according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor
    if (base !== undefined) {
      return this.absoluteTo(base);
    }

    return this;
  }

  function isInteger(value) {
    return /^[0-9]+$/.test(value);
  }

  URI.version = '1.19.11';

  var p = URI.prototype;
  var hasOwn = Object.prototype.hasOwnProperty;

  function escapeRegEx(string) {
    // https://github.com/medialize/URI.js/commit/85ac21783c11f8ccab06106dba9735a31a86924d#commitcomment-821963
    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }

  function getType(value) {
    // IE8 doesn't return [Object Undefined] but [Object Object] for undefined value
    if (value === undefined) {
      return 'Undefined';
    }

    return String(Object.prototype.toString.call(value)).slice(8, -1);
  }

  function isArray(obj) {
    return getType(obj) === 'Array';
  }

  function filterArrayValues(data, value) {
    var lookup = {};
    var i, length;

    if (getType(value) === 'RegExp') {
      lookup = null;
    } else if (isArray(value)) {
      for (i = 0, length = value.length; i < length; i++) {
        lookup[value[i]] = true;
      }
    } else {
      lookup[value] = true;
    }

    for (i = 0, length = data.length; i < length; i++) {
      /*jshint laxbreak: true */
      var _match = lookup && lookup[data[i]] !== undefined
        || !lookup && value.test(data[i]);
      /*jshint laxbreak: false */
      if (_match) {
        data.splice(i, 1);
        length--;
        i--;
      }
    }

    return data;
  }

  function arrayContains(list, value) {
    var i, length;

    // value may be string, number, array, regexp
    if (isArray(value)) {
      // Note: this can be optimized to O(n) (instead of current O(m * n))
      for (i = 0, length = value.length; i < length; i++) {
        if (!arrayContains(list, value[i])) {
          return false;
        }
      }

      return true;
    }

    var _type = getType(value);
    for (i = 0, length = list.length; i < length; i++) {
      if (_type === 'RegExp') {
        if (typeof list[i] === 'string' && list[i].match(value)) {
          return true;
        }
      } else if (list[i] === value) {
        return true;
      }
    }

    return false;
  }

  function arraysEqual(one, two) {
    if (!isArray(one) || !isArray(two)) {
      return false;
    }

    // arrays can't be equal if they have different amount of content
    if (one.length !== two.length) {
      return false;
    }

    one.sort();
    two.sort();

    for (var i = 0, l = one.length; i < l; i++) {
      if (one[i] !== two[i]) {
        return false;
      }
    }

    return true;
  }

  function trimSlashes(text) {
    var trim_expression = /^\/+|\/+$/g;
    return text.replace(trim_expression, '');
  }

  URI._parts = function() {
    return {
      protocol: null,
      username: null,
      password: null,
      hostname: null,
      urn: null,
      port: null,
      path: null,
      query: null,
      fragment: null,
      // state
      preventInvalidHostname: URI.preventInvalidHostname,
      duplicateQueryParameters: URI.duplicateQueryParameters,
      escapeQuerySpace: URI.escapeQuerySpace
    };
  };
  // state: throw on invalid hostname
  // see https://github.com/medialize/URI.js/pull/345
  // and https://github.com/medialize/URI.js/issues/354
  URI.preventInvalidHostname = false;
  // state: allow duplicate query parameters (a=1&a=1)
  URI.duplicateQueryParameters = false;
  // state: replaces + with %20 (space in query strings)
  URI.escapeQuerySpace = true;
  // static properties
  URI.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;
  URI.idn_expression = /[^a-z0-9\._-]/i;
  URI.punycode_expression = /(xn--)/i;
  // well, 333.444.555.666 matches, but it sure ain't no IPv4 - do we care?
  URI.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  // credits to Rich Brown
  // source: http://forums.intermapper.com/viewtopic.php?p=1096#1096
  // specification: http://www.ietf.org/rfc/rfc4291.txt
  URI.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  // expression used is "gruber revised" (@gruber v2) determined to be the
  // best solution in a regex-golf we did a couple of ages ago at
  // * http://mathiasbynens.be/demo/url-regex
  // * http://rodneyrehm.de/t/url-regex.html
  URI.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
  URI.findUri = {
    // valid "scheme://" or "www."
    start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
    // everything up to the next whitespace
    end: /[\s\r\n]|$/,
    // trim trailing punctuation captured by end RegExp
    trim: /[`!()\[\]{};:'".,<>?«»“”„‘’]+$/,
    // balanced parens inclusion (), [], {}, <>
    parens: /(\([^\)]*\)|\[[^\]]*\]|\{[^}]*\}|<[^>]*>)/g,
  };
  URI.leading_whitespace_expression = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/
  // https://infra.spec.whatwg.org/#ascii-tab-or-newline
  URI.ascii_tab_whitespace = /[\u0009\u000A\u000D]+/g
  // http://www.iana.org/assignments/uri-schemes.html
  // http://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports
  URI.defaultPorts = {
    http: '80',
    https: '443',
    ftp: '21',
    gopher: '70',
    ws: '80',
    wss: '443'
  };
  // list of protocols which always require a hostname
  URI.hostProtocols = [
    'http',
    'https'
  ];

  // allowed hostname characters according to RFC 3986
  // ALPHA DIGIT "-" "." "_" "~" "!" "$" "&" "'" "(" ")" "*" "+" "," ";" "=" %encoded
  // I've never seen a (non-IDN) hostname other than: ALPHA DIGIT . - _
  URI.invalid_hostname_characters = /[^a-zA-Z0-9\.\-:_]/;
  // map DOM Elements to their URI attribute
  URI.domAttributes = {
    'a': 'href',
    'blockquote': 'cite',
    'link': 'href',
    'base': 'href',
    'script': 'src',
    'form': 'action',
    'img': 'src',
    'area': 'href',
    'iframe': 'src',
    'embed': 'src',
    'source': 'src',
    'track': 'src',
    'input': 'src', // but only if type="image"
    'audio': 'src',
    'video': 'src'
  };
  URI.getDomAttribute = function(node) {
    if (!node || !node.nodeName) {
      return undefined;
    }

    var nodeName = node.nodeName.toLowerCase();
    // <input> should only expose src for type="image"
    if (nodeName === 'input' && node.type !== 'image') {
      return undefined;
    }

    return URI.domAttributes[nodeName];
  };

  function escapeForDumbFirefox36(value) {
    // https://github.com/medialize/URI.js/issues/91
    return escape(value);
  }

  // encoding / decoding according to RFC3986
  function strictEncodeURIComponent(string) {
    // see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
    return encodeURIComponent(string)
      .replace(/[!'()*]/g, escapeForDumbFirefox36)
      .replace(/\*/g, '%2A');
  }
  URI.encode = strictEncodeURIComponent;
  URI.decode = decodeURIComponent;
  URI.iso8859 = function() {
    URI.encode = escape;
    URI.decode = unescape;
  };
  URI.unicode = function() {
    URI.encode = strictEncodeURIComponent;
    URI.decode = decodeURIComponent;
  };
  URI.characters = {
    pathname: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig,
        map: {
          // -._~!'()*
          '%24': '$',
          '%26': '&',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%3A': ':',
          '%40': '@'
        }
      },
      decode: {
        expression: /[\/\?#]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23'
        }
      }
    },
    reserved: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,
        map: {
          // gen-delims
          '%3A': ':',
          '%2F': '/',
          '%3F': '?',
          '%23': '#',
          '%5B': '[',
          '%5D': ']',
          '%40': '@',
          // sub-delims
          '%21': '!',
          '%24': '$',
          '%26': '&',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '='
        }
      }
    },
    urnpath: {
      // The characters under `encode` are the characters called out by RFC 2141 as being acceptable
      // for usage in a URN. RFC2141 also calls out "-", ".", and "_" as acceptable characters, but
      // these aren't encoded by encodeURIComponent, so we don't have to call them out here. Also
      // note that the colon character is not featured in the encoding map; this is because URI.js
      // gives the colons in URNs semantic meaning as the delimiters of path segements, and so it
      // should not appear unencoded in a segment itself.
      // See also the note above about RFC3986 and capitalalized hex digits.
      encode: {
        expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,
        map: {
          '%21': '!',
          '%24': '$',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%40': '@'
        }
      },
      // These characters are the characters called out by RFC2141 as "reserved" characters that
      // should never appear in a URN, plus the colon character (see note above).
      decode: {
        expression: /[\/\?#:]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23',
          ':': '%3A'
        }
      }
    }
  };
  URI.encodeQuery = function(string, escapeQuerySpace) {
    var escaped = URI.encode(string + '');
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    return escapeQuerySpace ? escaped.replace(/%20/g, '+') : escaped;
  };
  URI.decodeQuery = function(string, escapeQuerySpace) {
    string += '';
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    try {
      return URI.decode(escapeQuerySpace ? string.replace(/\+/g, '%20') : string);
    } catch(e) {
      // we're not going to mess with weird encodings,
      // give up and return the undecoded original string
      // see https://github.com/medialize/URI.js/issues/87
      // see https://github.com/medialize/URI.js/issues/92
      return string;
    }
  };
  // generate encode/decode path functions
  var _parts = {'encode':'encode', 'decode':'decode'};
  var _part;
  var generateAccessor = function(_group, _part) {
    return function(string) {
      try {
        return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function(c) {
          return URI.characters[_group][_part].map[c];
        });
      } catch (e) {
        // we're not going to mess with weird encodings,
        // give up and return the undecoded original string
        // see https://github.com/medialize/URI.js/issues/87
        // see https://github.com/medialize/URI.js/issues/92
        return string;
      }
    };
  };

  for (_part in _parts) {
    URI[_part + 'PathSegment'] = generateAccessor('pathname', _parts[_part]);
    URI[_part + 'UrnPathSegment'] = generateAccessor('urnpath', _parts[_part]);
  }

  var generateSegmentedPathFunction = function(_sep, _codingFuncName, _innerCodingFuncName) {
    return function(string) {
      // Why pass in names of functions, rather than the function objects themselves? The
      // definitions of some functions (but in particular, URI.decode) will occasionally change due
      // to URI.js having ISO8859 and Unicode modes. Passing in the name and getting it will ensure
      // that the functions we use here are "fresh".
      var actualCodingFunc;
      if (!_innerCodingFuncName) {
        actualCodingFunc = URI[_codingFuncName];
      } else {
        actualCodingFunc = function(string) {
          return URI[_codingFuncName](URI[_innerCodingFuncName](string));
        };
      }

      var segments = (string + '').split(_sep);

      for (var i = 0, length = segments.length; i < length; i++) {
        segments[i] = actualCodingFunc(segments[i]);
      }

      return segments.join(_sep);
    };
  };

  // This takes place outside the above loop because we don't want, e.g., encodeUrnPath functions.
  URI.decodePath = generateSegmentedPathFunction('/', 'decodePathSegment');
  URI.decodeUrnPath = generateSegmentedPathFunction(':', 'decodeUrnPathSegment');
  URI.recodePath = generateSegmentedPathFunction('/', 'encodePathSegment', 'decode');
  URI.recodeUrnPath = generateSegmentedPathFunction(':', 'encodeUrnPathSegment', 'decode');

  URI.encodeReserved = generateAccessor('reserved', 'encode');

  URI.parse = function(string, parts) {
    var pos;
    if (!parts) {
      parts = {
        preventInvalidHostname: URI.preventInvalidHostname
      };
    }

    string = string.replace(URI.leading_whitespace_expression, '')
    // https://infra.spec.whatwg.org/#ascii-tab-or-newline
    string = string.replace(URI.ascii_tab_whitespace, '')

    // [protocol"://"[username[":"password]"@"]hostname[":"port]"/"?][path]["?"querystring]["#"fragment]

    // extract fragment
    pos = string.indexOf('#');
    if (pos > -1) {
      // escaping?
      parts.fragment = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract query
    pos = string.indexOf('?');
    if (pos > -1) {
      // escaping?
      parts.query = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // slashes and backslashes have lost all meaning for the web protocols (https, http, wss, ws)
    string = string.replace(/^(https?|ftp|wss?)?:+[/\\]*/i, '$1://');
    // slashes and backslashes have lost all meaning for scheme relative URLs
    string = string.replace(/^[/\\]{2,}/i, '//');

    // extract protocol
    if (string.substring(0, 2) === '//') {
      // relative-scheme
      parts.protocol = null;
      string = string.substring(2);
      // extract "user:pass@host:port"
      string = URI.parseAuthority(string, parts);
    } else {
      pos = string.indexOf(':');
      if (pos > -1) {
        parts.protocol = string.substring(0, pos) || null;
        if (parts.protocol && !parts.protocol.match(URI.protocol_expression)) {
          // : may be within the path
          parts.protocol = undefined;
        } else if (string.substring(pos + 1, pos + 3).replace(/\\/g, '/') === '//') {
          string = string.substring(pos + 3);

          // extract "user:pass@host:port"
          string = URI.parseAuthority(string, parts);
        } else {
          string = string.substring(pos + 1);
          parts.urn = true;
        }
      }
    }

    // what's left must be the path
    parts.path = string;

    // and we're done
    return parts;
  };
  URI.parseHost = function(string, parts) {
    if (!string) {
      string = '';
    }

    // Copy chrome, IE, opera backslash-handling behavior.
    // Back slashes before the query string get converted to forward slashes
    // See: https://github.com/joyent/node/blob/386fd24f49b0e9d1a8a076592a404168faeecc34/lib/url.js#L115-L124
    // See: https://code.google.com/p/chromium/issues/detail?id=25916
    // https://github.com/medialize/URI.js/pull/233
    string = string.replace(/\\/g, '/');

    // extract host:port
    var pos = string.indexOf('/');
    var bracketPos;
    var t;

    if (pos === -1) {
      pos = string.length;
    }

    if (string.charAt(0) === '[') {
      // IPv6 host - http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6
      // I claim most client software breaks on IPv6 anyways. To simplify things, URI only accepts
      // IPv6+port in the format [2001:db8::1]:80 (for the time being)
      bracketPos = string.indexOf(']');
      parts.hostname = string.substring(1, bracketPos) || null;
      parts.port = string.substring(bracketPos + 2, pos) || null;
      if (parts.port === '/') {
        parts.port = null;
      }
    } else {
      var firstColon = string.indexOf(':');
      var firstSlash = string.indexOf('/');
      var nextColon = string.indexOf(':', firstColon + 1);
      if (nextColon !== -1 && (firstSlash === -1 || nextColon < firstSlash)) {
        // IPv6 host contains multiple colons - but no port
        // this notation is actually not allowed by RFC 3986, but we're a liberal parser
        parts.hostname = string.substring(0, pos) || null;
        parts.port = null;
      } else {
        t = string.substring(0, pos).split(':');
        parts.hostname = t[0] || null;
        parts.port = t[1] || null;
      }
    }

    if (parts.hostname && string.substring(pos).charAt(0) !== '/') {
      pos++;
      string = '/' + string;
    }

    if (parts.preventInvalidHostname) {
      URI.ensureValidHostname(parts.hostname, parts.protocol);
    }

    if (parts.port) {
      URI.ensureValidPort(parts.port);
    }

    return string.substring(pos) || '/';
  };
  URI.parseAuthority = function(string, parts) {
    string = URI.parseUserinfo(string, parts);
    return URI.parseHost(string, parts);
  };
  URI.parseUserinfo = function(string, parts) {
    // extract username:password
    var _string = string
    var firstBackSlash = string.indexOf('\\');
    if (firstBackSlash !== -1) {
      string = string.replace(/\\/g, '/')
    }
    var firstSlash = string.indexOf('/');
    var pos = string.lastIndexOf('@', firstSlash > -1 ? firstSlash : string.length - 1);
    var t;

    // authority@ must come before /path or \path
    if (pos > -1 && (firstSlash === -1 || pos < firstSlash)) {
      t = string.substring(0, pos).split(':');
      parts.username = t[0] ? URI.decode(t[0]) : null;
      t.shift();
      parts.password = t[0] ? URI.decode(t.join(':')) : null;
      string = _string.substring(pos + 1);
    } else {
      parts.username = null;
      parts.password = null;
    }

    return string;
  };
  URI.parseQuery = function(string, escapeQuerySpace) {
    if (!string) {
      return {};
    }

    // throw out the funky business - "?"[name"="value"&"]+
    string = string.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '');

    if (!string) {
      return {};
    }

    var items = {};
    var splits = string.split('&');
    var length = splits.length;
    var v, name, value;

    for (var i = 0; i < length; i++) {
      v = splits[i].split('=');
      name = URI.decodeQuery(v.shift(), escapeQuerySpace);
      // no "=" is null according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#collect-url-parameters
      value = v.length ? URI.decodeQuery(v.join('='), escapeQuerySpace) : null;

      if (name === '__proto__') {
        // ignore attempt at exploiting JavaScript internals
        continue;
      } else if (hasOwn.call(items, name)) {
        if (typeof items[name] === 'string' || items[name] === null) {
          items[name] = [items[name]];
        }

        items[name].push(value);
      } else {
        items[name] = value;
      }
    }

    return items;
  };

  URI.build = function(parts) {
    var t = '';
    var requireAbsolutePath = false

    if (parts.protocol) {
      t += parts.protocol + ':';
    }

    if (!parts.urn && (t || parts.hostname)) {
      t += '//';
      requireAbsolutePath = true
    }

    t += (URI.buildAuthority(parts) || '');

    if (typeof parts.path === 'string') {
      if (parts.path.charAt(0) !== '/' && requireAbsolutePath) {
        t += '/';
      }

      t += parts.path;
    }

    if (typeof parts.query === 'string' && parts.query) {
      t += '?' + parts.query;
    }

    if (typeof parts.fragment === 'string' && parts.fragment) {
      t += '#' + parts.fragment;
    }
    return t;
  };
  URI.buildHost = function(parts) {
    var t = '';

    if (!parts.hostname) {
      return '';
    } else if (URI.ip6_expression.test(parts.hostname)) {
      t += '[' + parts.hostname + ']';
    } else {
      t += parts.hostname;
    }

    if (parts.port) {
      t += ':' + parts.port;
    }

    return t;
  };
  URI.buildAuthority = function(parts) {
    return URI.buildUserinfo(parts) + URI.buildHost(parts);
  };
  URI.buildUserinfo = function(parts) {
    var t = '';

    if (parts.username) {
      t += URI.encode(parts.username);
    }

    if (parts.password) {
      t += ':' + URI.encode(parts.password);
    }

    if (t) {
      t += '@';
    }

    return t;
  };
  URI.buildQuery = function(data, duplicateQueryParameters, escapeQuerySpace) {
    // according to http://tools.ietf.org/html/rfc3986 or http://labs.apache.org/webarch/uri/rfc/rfc3986.html
    // being »-._~!$&'()*+,;=:@/?« %HEX and alnum are allowed
    // the RFC explicitly states ?/foo being a valid use case, no mention of parameter syntax!
    // URI.js treats the query string as being application/x-www-form-urlencoded
    // see http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type

    var t = '';
    var unique, key, i, length;
    for (key in data) {
      if (key === '__proto__') {
        // ignore attempt at exploiting JavaScript internals
        continue;
      } else if (hasOwn.call(data, key)) {
        if (isArray(data[key])) {
          unique = {};
          for (i = 0, length = data[key].length; i < length; i++) {
            if (data[key][i] !== undefined && unique[data[key][i] + ''] === undefined) {
              t += '&' + URI.buildQueryParameter(key, data[key][i], escapeQuerySpace);
              if (duplicateQueryParameters !== true) {
                unique[data[key][i] + ''] = true;
              }
            }
          }
        } else if (data[key] !== undefined) {
          t += '&' + URI.buildQueryParameter(key, data[key], escapeQuerySpace);
        }
      }
    }

    return t.substring(1);
  };
  URI.buildQueryParameter = function(name, value, escapeQuerySpace) {
    // http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type -- application/x-www-form-urlencoded
    // don't append "=" for null values, according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#url-parameter-serialization
    return URI.encodeQuery(name, escapeQuerySpace) + (value !== null ? '=' + URI.encodeQuery(value, escapeQuerySpace) : '');
  };

  URI.addQuery = function(data, name, value) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          URI.addQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (data[name] === undefined) {
        data[name] = value;
        return;
      } else if (typeof data[name] === 'string') {
        data[name] = [data[name]];
      }

      if (!isArray(value)) {
        value = [value];
      }

      data[name] = (data[name] || []).concat(value);
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }
  };

  URI.setQuery = function(data, name, value) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          URI.setQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      data[name] = value === undefined ? null : value;
    } else {
      throw new TypeError('URI.setQuery() accepts an object, string as the name parameter');
    }
  };

  URI.removeQuery = function(data, name, value) {
    var i, length, key;

    if (isArray(name)) {
      for (i = 0, length = name.length; i < length; i++) {
        data[name[i]] = undefined;
      }
    } else if (getType(name) === 'RegExp') {
      for (key in data) {
        if (name.test(key)) {
          data[key] = undefined;
        }
      }
    } else if (typeof name === 'object') {
      for (key in name) {
        if (hasOwn.call(name, key)) {
          URI.removeQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (value !== undefined) {
        if (getType(value) === 'RegExp') {
          if (!isArray(data[name]) && value.test(data[name])) {
            data[name] = undefined;
          } else {
            data[name] = filterArrayValues(data[name], value);
          }
        } else if (data[name] === String(value) && (!isArray(value) || value.length === 1)) {
          data[name] = undefined;
        } else if (isArray(data[name])) {
          data[name] = filterArrayValues(data[name], value);
        }
      } else {
        data[name] = undefined;
      }
    } else {
      throw new TypeError('URI.removeQuery() accepts an object, string, RegExp as the first parameter');
    }
  };
  URI.hasQuery = function(data, name, value, withinArray) {
    switch (getType(name)) {
      case 'String':
        // Nothing to do here
        break;

      case 'RegExp':
        for (var key in data) {
          if (hasOwn.call(data, key)) {
            if (name.test(key) && (value === undefined || URI.hasQuery(data, key, value))) {
              return true;
            }
          }
        }

        return false;

      case 'Object':
        for (var _key in name) {
          if (hasOwn.call(name, _key)) {
            if (!URI.hasQuery(data, _key, name[_key])) {
              return false;
            }
          }
        }

        return true;

      default:
        throw new TypeError('URI.hasQuery() accepts a string, regular expression or object as the name parameter');
    }

    switch (getType(value)) {
      case 'Undefined':
        // true if exists (but may be empty)
        return name in data; // data[name] !== undefined;

      case 'Boolean':
        // true if exists and non-empty
        var _booly = Boolean(isArray(data[name]) ? data[name].length : data[name]);
        return value === _booly;

      case 'Function':
        // allow complex comparison
        return !!value(data[name], name, data);

      case 'Array':
        if (!isArray(data[name])) {
          return false;
        }

        var op = withinArray ? arrayContains : arraysEqual;
        return op(data[name], value);

      case 'RegExp':
        if (!isArray(data[name])) {
          return Boolean(data[name] && data[name].match(value));
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      case 'Number':
        value = String(value);
        /* falls through */
      case 'String':
        if (!isArray(data[name])) {
          return data[name] === value;
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      default:
        throw new TypeError('URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter');
    }
  };


  URI.joinPaths = function() {
    var input = [];
    var segments = [];
    var nonEmptySegments = 0;

    for (var i = 0; i < arguments.length; i++) {
      var url = new URI(arguments[i]);
      input.push(url);
      var _segments = url.segment();
      for (var s = 0; s < _segments.length; s++) {
        if (typeof _segments[s] === 'string') {
          segments.push(_segments[s]);
        }

        if (_segments[s]) {
          nonEmptySegments++;
        }
      }
    }

    if (!segments.length || !nonEmptySegments) {
      return new URI('');
    }

    var uri = new URI('').segment(segments);

    if (input[0].path() === '' || input[0].path().slice(0, 1) === '/') {
      uri.path('/' + uri.path());
    }

    return uri.normalize();
  };

  URI.commonPath = function(one, two) {
    var length = Math.min(one.length, two.length);
    var pos;

    // find first non-matching character
    for (pos = 0; pos < length; pos++) {
      if (one.charAt(pos) !== two.charAt(pos)) {
        pos--;
        break;
      }
    }

    if (pos < 1) {
      return one.charAt(0) === two.charAt(0) && one.charAt(0) === '/' ? '/' : '';
    }

    // revert to last /
    if (one.charAt(pos) !== '/' || two.charAt(pos) !== '/') {
      pos = one.substring(0, pos).lastIndexOf('/');
    }

    return one.substring(0, pos + 1);
  };

  URI.withinString = function(string, callback, options) {
    options || (options = {});
    var _start = options.start || URI.findUri.start;
    var _end = options.end || URI.findUri.end;
    var _trim = options.trim || URI.findUri.trim;
    var _parens = options.parens || URI.findUri.parens;
    var _attributeOpen = /[a-z0-9-]=["']?$/i;

    _start.lastIndex = 0;
    while (true) {
      var match = _start.exec(string);
      if (!match) {
        break;
      }

      var start = match.index;
      if (options.ignoreHtml) {
        // attribut(e=["']?$)
        var attributeOpen = string.slice(Math.max(start - 3, 0), start);
        if (attributeOpen && _attributeOpen.test(attributeOpen)) {
          continue;
        }
      }

      var end = start + string.slice(start).search(_end);
      var slice = string.slice(start, end);
      // make sure we include well balanced parens
      var parensEnd = -1;
      while (true) {
        var parensMatch = _parens.exec(slice);
        if (!parensMatch) {
          break;
        }

        var parensMatchEnd = parensMatch.index + parensMatch[0].length;
        parensEnd = Math.max(parensEnd, parensMatchEnd);
      }

      if (parensEnd > -1) {
        slice = slice.slice(0, parensEnd) + slice.slice(parensEnd).replace(_trim, '');
      } else {
        slice = slice.replace(_trim, '');
      }

      if (slice.length <= match[0].length) {
        // the extract only contains the starting marker of a URI,
        // e.g. "www" or "http://"
        continue;
      }

      if (options.ignore && options.ignore.test(slice)) {
        continue;
      }

      end = start + slice.length;
      var result = callback(slice, start, end, string);
      if (result === undefined) {
        _start.lastIndex = end;
        continue;
      }

      result = String(result);
      string = string.slice(0, start) + result + string.slice(end);
      _start.lastIndex = start + result.length;
    }

    _start.lastIndex = 0;
    return string;
  };

  URI.ensureValidHostname = function(v, protocol) {
    // Theoretically URIs allow percent-encoding in Hostnames (according to RFC 3986)
    // they are not part of DNS and therefore ignored by URI.js

    var hasHostname = !!v; // not null and not an empty string
    var hasProtocol = !!protocol;
    var rejectEmptyHostname = false;

    if (hasProtocol) {
      rejectEmptyHostname = arrayContains(URI.hostProtocols, protocol);
    }

    if (rejectEmptyHostname && !hasHostname) {
      throw new TypeError('Hostname cannot be empty, if protocol is ' + protocol);
    } else if (v && v.match(URI.invalid_hostname_characters)) {
      // test punycode
      if (!punycode) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-:_] and Punycode.js is not available');
      }
      if (punycode.toASCII(v).match(URI.invalid_hostname_characters)) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-:_]');
      }
    }
  };

  URI.ensureValidPort = function (v) {
    if (!v) {
      return;
    }

    var port = Number(v);
    if (isInteger(port) && (port > 0) && (port < 65536)) {
      return;
    }

    throw new TypeError('Port "' + v + '" is not a valid port');
  };

  // noConflict
  URI.noConflict = function(removeAll) {
    if (removeAll) {
      var unconflicted = {
        URI: this.noConflict()
      };

      if (root.URITemplate && typeof root.URITemplate.noConflict === 'function') {
        unconflicted.URITemplate = root.URITemplate.noConflict();
      }

      if (root.IPv6 && typeof root.IPv6.noConflict === 'function') {
        unconflicted.IPv6 = root.IPv6.noConflict();
      }

      if (root.SecondLevelDomains && typeof root.SecondLevelDomains.noConflict === 'function') {
        unconflicted.SecondLevelDomains = root.SecondLevelDomains.noConflict();
      }

      return unconflicted;
    } else if (root.URI === this) {
      root.URI = _URI;
    }

    return this;
  };

  p.build = function(deferBuild) {
    if (deferBuild === true) {
      this._deferred_build = true;
    } else if (deferBuild === undefined || this._deferred_build) {
      this._string = URI.build(this._parts);
      this._deferred_build = false;
    }

    return this;
  };

  p.clone = function() {
    return new URI(this);
  };

  p.valueOf = p.toString = function() {
    return this.build(false)._string;
  };


  function generateSimpleAccessor(_part){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        this._parts[_part] = v || null;
        this.build(!build);
        return this;
      }
    };
  }

  function generatePrefixAccessor(_part, _key){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        if (v !== null) {
          v = v + '';
          if (v.charAt(0) === _key) {
            v = v.substring(1);
          }
        }

        this._parts[_part] = v;
        this.build(!build);
        return this;
      }
    };
  }

  p.protocol = generateSimpleAccessor('protocol');
  p.username = generateSimpleAccessor('username');
  p.password = generateSimpleAccessor('password');
  p.hostname = generateSimpleAccessor('hostname');
  p.port = generateSimpleAccessor('port');
  p.query = generatePrefixAccessor('query', '?');
  p.fragment = generatePrefixAccessor('fragment', '#');

  p.search = function(v, build) {
    var t = this.query(v, build);
    return typeof t === 'string' && t.length ? ('?' + t) : t;
  };
  p.hash = function(v, build) {
    var t = this.fragment(v, build);
    return typeof t === 'string' && t.length ? ('#' + t) : t;
  };

  p.pathname = function(v, build) {
    if (v === undefined || v === true) {
      var res = this._parts.path || (this._parts.hostname ? '/' : '');
      return v ? (this._parts.urn ? URI.decodeUrnPath : URI.decodePath)(res) : res;
    } else {
      if (this._parts.urn) {
        this._parts.path = v ? URI.recodeUrnPath(v) : '';
      } else {
        this._parts.path = v ? URI.recodePath(v) : '/';
      }
      this.build(!build);
      return this;
    }
  };
  p.path = p.pathname;
  p.href = function(href, build) {
    var key;

    if (href === undefined) {
      return this.toString();
    }

    this._string = '';
    this._parts = URI._parts();

    var _URI = href instanceof URI;
    var _object = typeof href === 'object' && (href.hostname || href.path || href.pathname);
    if (href.nodeName) {
      var attribute = URI.getDomAttribute(href);
      href = href[attribute] || '';
      _object = false;
    }

    // window.location is reported to be an object, but it's not the sort
    // of object we're looking for:
    // * location.protocol ends with a colon
    // * location.query != object.search
    // * location.hash != object.fragment
    // simply serializing the unknown object should do the trick
    // (for location, not for everything...)
    if (!_URI && _object && href.pathname !== undefined) {
      href = href.toString();
    }

    if (typeof href === 'string' || href instanceof String) {
      this._parts = URI.parse(String(href), this._parts);
    } else if (_URI || _object) {
      var src = _URI ? href._parts : href;
      for (key in src) {
        if (key === 'query') { continue; }
        if (hasOwn.call(this._parts, key)) {
          this._parts[key] = src[key];
        }
      }
      if (src.query) {
        this.query(src.query, false);
      }
    } else {
      throw new TypeError('invalid input');
    }

    this.build(!build);
    return this;
  };

  // identification accessors
  p.is = function(what) {
    var ip = false;
    var ip4 = false;
    var ip6 = false;
    var name = false;
    var sld = false;
    var idn = false;
    var punycode = false;
    var relative = !this._parts.urn;

    if (this._parts.hostname) {
      relative = false;
      ip4 = URI.ip4_expression.test(this._parts.hostname);
      ip6 = URI.ip6_expression.test(this._parts.hostname);
      ip = ip4 || ip6;
      name = !ip;
      sld = name && SLD && SLD.has(this._parts.hostname);
      idn = name && URI.idn_expression.test(this._parts.hostname);
      punycode = name && URI.punycode_expression.test(this._parts.hostname);
    }

    switch (what.toLowerCase()) {
      case 'relative':
        return relative;

      case 'absolute':
        return !relative;

      // hostname identification
      case 'domain':
      case 'name':
        return name;

      case 'sld':
        return sld;

      case 'ip':
        return ip;

      case 'ip4':
      case 'ipv4':
      case 'inet4':
        return ip4;

      case 'ip6':
      case 'ipv6':
      case 'inet6':
        return ip6;

      case 'idn':
        return idn;

      case 'url':
        return !this._parts.urn;

      case 'urn':
        return !!this._parts.urn;

      case 'punycode':
        return punycode;
    }

    return null;
  };

  // component specific input validation
  var _protocol = p.protocol;
  var _port = p.port;
  var _hostname = p.hostname;

  p.protocol = function(v, build) {
    if (v) {
      // accept trailing ://
      v = v.replace(/:(\/\/)?$/, '');

      if (!v.match(URI.protocol_expression)) {
        throw new TypeError('Protocol "' + v + '" contains characters other than [A-Z0-9.+-] or doesn\'t start with [A-Z]');
      }
    }

    return _protocol.call(this, v, build);
  };
  p.scheme = p.protocol;
  p.port = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      if (v === 0) {
        v = null;
      }

      if (v) {
        v += '';
        if (v.charAt(0) === ':') {
          v = v.substring(1);
        }

        URI.ensureValidPort(v);
      }
    }
    return _port.call(this, v, build);
  };
  p.hostname = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      var x = { preventInvalidHostname: this._parts.preventInvalidHostname };
      var res = URI.parseHost(v, x);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      v = x.hostname;
      if (this._parts.preventInvalidHostname) {
        URI.ensureValidHostname(v, this._parts.protocol);
      }
    }

    return _hostname.call(this, v, build);
  };

  // compound accessors
  p.origin = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      var protocol = this.protocol();
      var authority = this.authority();
      if (!authority) {
        return '';
      }

      return (protocol ? protocol + '://' : '') + this.authority();
    } else {
      var origin = URI(v);
      this
        .protocol(origin.protocol())
        .authority(origin.authority())
        .build(!build);
      return this;
    }
  };
  p.host = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildHost(this._parts) : '';
    } else {
      var res = URI.parseHost(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.authority = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildAuthority(this._parts) : '';
    } else {
      var res = URI.parseAuthority(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.userinfo = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      var t = URI.buildUserinfo(this._parts);
      return t ? t.substring(0, t.length -1) : t;
    } else {
      if (v[v.length-1] !== '@') {
        v += '@';
      }

      URI.parseUserinfo(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.resource = function(v, build) {
    var parts;

    if (v === undefined) {
      return this.path() + this.search() + this.hash();
    }

    parts = URI.parse(v);
    this._parts.path = parts.path;
    this._parts.query = parts.query;
    this._parts.fragment = parts.fragment;
    this.build(!build);
    return this;
  };

  // fraction accessors
  p.subdomain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    // convenience, return "www" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // grab domain and add another segment
      var end = this._parts.hostname.length - this.domain().length - 1;
      return this._parts.hostname.substring(0, end) || '';
    } else {
      var e = this._parts.hostname.length - this.domain().length;
      var sub = this._parts.hostname.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(sub));

      if (v && v.charAt(v.length - 1) !== '.') {
        v += '.';
      }

      if (v.indexOf(':') !== -1) {
        throw new TypeError('Domains cannot contain colons');
      }

      if (v) {
        URI.ensureValidHostname(v, this._parts.protocol);
      }

      this._parts.hostname = this._parts.hostname.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.domain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // convenience, return "example.org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // if hostname consists of 1 or 2 segments, it must be the domain
      var t = this._parts.hostname.match(/\./g);
      if (t && t.length < 2) {
        return this._parts.hostname;
      }

      // grab tld and add another segment
      var end = this._parts.hostname.length - this.tld(build).length - 1;
      end = this._parts.hostname.lastIndexOf('.', end -1) + 1;
      return this._parts.hostname.substring(end) || '';
    } else {
      if (!v) {
        throw new TypeError('cannot set domain empty');
      }

      if (v.indexOf(':') !== -1) {
        throw new TypeError('Domains cannot contain colons');
      }

      URI.ensureValidHostname(v, this._parts.protocol);

      if (!this._parts.hostname || this.is('IP')) {
        this._parts.hostname = v;
      } else {
        var replace = new RegExp(escapeRegEx(this.domain()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.tld = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // return "org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      var pos = this._parts.hostname.lastIndexOf('.');
      var tld = this._parts.hostname.substring(pos + 1);

      if (build !== true && SLD && SLD.list[tld.toLowerCase()]) {
        return SLD.get(this._parts.hostname) || tld;
      }

      return tld;
    } else {
      var replace;

      if (!v) {
        throw new TypeError('cannot set TLD empty');
      } else if (v.match(/[^a-zA-Z0-9-]/)) {
        if (SLD && SLD.is(v)) {
          replace = new RegExp(escapeRegEx(this.tld()) + '$');
          this._parts.hostname = this._parts.hostname.replace(replace, v);
        } else {
          throw new TypeError('TLD "' + v + '" contains characters other than [A-Z0-9]');
        }
      } else if (!this._parts.hostname || this.is('IP')) {
        throw new ReferenceError('cannot set TLD on non-domain host');
      } else {
        replace = new RegExp(escapeRegEx(this.tld()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.directory = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path && !this._parts.hostname) {
        return '';
      }

      if (this._parts.path === '/') {
        return '/';
      }

      var end = this._parts.path.length - this.filename().length - 1;
      var res = this._parts.path.substring(0, end) || (this._parts.hostname ? '/' : '');

      return v ? URI.decodePath(res) : res;

    } else {
      var e = this._parts.path.length - this.filename().length;
      var directory = this._parts.path.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(directory));

      // fully qualifier directories begin with a slash
      if (!this.is('relative')) {
        if (!v) {
          v = '/';
        }

        if (v.charAt(0) !== '/') {
          v = '/' + v;
        }
      }

      // directories always end with a slash
      if (v && v.charAt(v.length - 1) !== '/') {
        v += '/';
      }

      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.filename = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v !== 'string') {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var pos = this._parts.path.lastIndexOf('/');
      var res = this._parts.path.substring(pos+1);

      return v ? URI.decodePathSegment(res) : res;
    } else {
      var mutatedDirectory = false;

      if (v.charAt(0) === '/') {
        v = v.substring(1);
      }

      if (v.match(/\.?\//)) {
        mutatedDirectory = true;
      }

      var replace = new RegExp(escapeRegEx(this.filename()) + '$');
      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);

      if (mutatedDirectory) {
        this.normalizePath(build);
      } else {
        this.build(!build);
      }

      return this;
    }
  };
  p.suffix = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var filename = this.filename();
      var pos = filename.lastIndexOf('.');
      var s, res;

      if (pos === -1) {
        return '';
      }

      // suffix may only contain alnum characters (yup, I made this up.)
      s = filename.substring(pos+1);
      res = (/^[a-z0-9%]+$/i).test(s) ? s : '';
      return v ? URI.decodePathSegment(res) : res;
    } else {
      if (v.charAt(0) === '.') {
        v = v.substring(1);
      }

      var suffix = this.suffix();
      var replace;

      if (!suffix) {
        if (!v) {
          return this;
        }

        this._parts.path += '.' + URI.recodePath(v);
      } else if (!v) {
        replace = new RegExp(escapeRegEx('.' + suffix) + '$');
      } else {
        replace = new RegExp(escapeRegEx(suffix) + '$');
      }

      if (replace) {
        v = URI.recodePath(v);
        this._parts.path = this._parts.path.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.segment = function(segment, v, build) {
    var separator = this._parts.urn ? ':' : '/';
    var path = this.path();
    var absolute = path.substring(0, 1) === '/';
    var segments = path.split(separator);

    if (segment !== undefined && typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (segment !== undefined && typeof segment !== 'number') {
      throw new Error('Bad segment "' + segment + '", must be 0-based integer');
    }

    if (absolute) {
      segments.shift();
    }

    if (segment < 0) {
      // allow negative indexes to address from the end
      segment = Math.max(segments.length + segment, 0);
    }

    if (v === undefined) {
      /*jshint laxbreak: true */
      return segment === undefined
        ? segments
        : segments[segment];
      /*jshint laxbreak: false */
    } else if (segment === null || segments[segment] === undefined) {
      if (isArray(v)) {
        segments = [];
        // collapse empty elements within array
        for (var i=0, l=v.length; i < l; i++) {
          if (!v[i].length && (!segments.length || !segments[segments.length -1].length)) {
            continue;
          }

          if (segments.length && !segments[segments.length -1].length) {
            segments.pop();
          }

          segments.push(trimSlashes(v[i]));
        }
      } else if (v || typeof v === 'string') {
        v = trimSlashes(v);
        if (segments[segments.length -1] === '') {
          // empty trailing elements have to be overwritten
          // to prevent results such as /foo//bar
          segments[segments.length -1] = v;
        } else {
          segments.push(v);
        }
      }
    } else {
      if (v) {
        segments[segment] = trimSlashes(v);
      } else {
        segments.splice(segment, 1);
      }
    }

    if (absolute) {
      segments.unshift('');
    }

    return this.path(segments.join(separator), build);
  };
  p.segmentCoded = function(segment, v, build) {
    var segments, i, l;

    if (typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (v === undefined) {
      segments = this.segment(segment, v, build);
      if (!isArray(segments)) {
        segments = segments !== undefined ? URI.decode(segments) : undefined;
      } else {
        for (i = 0, l = segments.length; i < l; i++) {
          segments[i] = URI.decode(segments[i]);
        }
      }

      return segments;
    }

    if (!isArray(v)) {
      v = (typeof v === 'string' || v instanceof String) ? URI.encode(v) : v;
    } else {
      for (i = 0, l = v.length; i < l; i++) {
        v[i] = URI.encode(v[i]);
      }
    }

    return this.segment(segment, v, build);
  };

  // mutating query string
  var q = p.query;
  p.query = function(v, build) {
    if (v === true) {
      return URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    } else if (typeof v === 'function') {
      var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
      var result = v.call(this, data);
      this._parts.query = URI.buildQuery(result || data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else if (v !== undefined && typeof v !== 'string') {
      this._parts.query = URI.buildQuery(v, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else {
      return q.call(this, v, build);
    }
  };
  p.setQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);

    if (typeof name === 'string' || name instanceof String) {
      data[name] = value !== undefined ? value : null;
    } else if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          data[key] = name[key];
        }
      }
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }

    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.addQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.addQuery(data, name, value === undefined ? null : value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.removeQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.removeQuery(data, name, value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.hasQuery = function(name, value, withinArray) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    return URI.hasQuery(data, name, value, withinArray);
  };
  p.setSearch = p.setQuery;
  p.addSearch = p.addQuery;
  p.removeSearch = p.removeQuery;
  p.hasSearch = p.hasQuery;

  // sanitizing URLs
  p.normalize = function() {
    if (this._parts.urn) {
      return this
        .normalizeProtocol(false)
        .normalizePath(false)
        .normalizeQuery(false)
        .normalizeFragment(false)
        .build();
    }

    return this
      .normalizeProtocol(false)
      .normalizeHostname(false)
      .normalizePort(false)
      .normalizePath(false)
      .normalizeQuery(false)
      .normalizeFragment(false)
      .build();
  };
  p.normalizeProtocol = function(build) {
    if (typeof this._parts.protocol === 'string') {
      this._parts.protocol = this._parts.protocol.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizeHostname = function(build) {
    if (this._parts.hostname) {
      if (this.is('IDN') && punycode) {
        this._parts.hostname = punycode.toASCII(this._parts.hostname);
      } else if (this.is('IPv6') && IPv6) {
        this._parts.hostname = IPv6.best(this._parts.hostname);
      }

      this._parts.hostname = this._parts.hostname.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizePort = function(build) {
    // remove port of it's the protocol's default
    if (typeof this._parts.protocol === 'string' && this._parts.port === URI.defaultPorts[this._parts.protocol]) {
      this._parts.port = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizePath = function(build) {
    var _path = this._parts.path;
    if (!_path) {
      return this;
    }

    if (this._parts.urn) {
      this._parts.path = URI.recodeUrnPath(this._parts.path);
      this.build(!build);
      return this;
    }

    if (this._parts.path === '/') {
      return this;
    }

    _path = URI.recodePath(_path);

    var _was_relative;
    var _leadingParents = '';
    var _parent, _pos;

    // handle relative paths
    if (_path.charAt(0) !== '/') {
      _was_relative = true;
      _path = '/' + _path;
    }

    // handle relative files (as opposed to directories)
    if (_path.slice(-3) === '/..' || _path.slice(-2) === '/.') {
      _path += '/';
    }

    // resolve simples
    _path = _path
      .replace(/(\/(\.\/)+)|(\/\.$)/g, '/')
      .replace(/\/{2,}/g, '/');

    // remember leading parents
    if (_was_relative) {
      _leadingParents = _path.substring(1).match(/^(\.\.\/)+/) || '';
      if (_leadingParents) {
        _leadingParents = _leadingParents[0];
      }
    }

    // resolve parents
    while (true) {
      _parent = _path.search(/\/\.\.(\/|$)/);
      if (_parent === -1) {
        // no more ../ to resolve
        break;
      } else if (_parent === 0) {
        // top level cannot be relative, skip it
        _path = _path.substring(3);
        continue;
      }

      _pos = _path.substring(0, _parent).lastIndexOf('/');
      if (_pos === -1) {
        _pos = _parent;
      }
      _path = _path.substring(0, _pos) + _path.substring(_parent + 3);
    }

    // revert to relative
    if (_was_relative && this.is('relative')) {
      _path = _leadingParents + _path.substring(1);
    }

    this._parts.path = _path;
    this.build(!build);
    return this;
  };
  p.normalizePathname = p.normalizePath;
  p.normalizeQuery = function(build) {
    if (typeof this._parts.query === 'string') {
      if (!this._parts.query.length) {
        this._parts.query = null;
      } else {
        this.query(URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace));
      }

      this.build(!build);
    }

    return this;
  };
  p.normalizeFragment = function(build) {
    if (!this._parts.fragment) {
      this._parts.fragment = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizeSearch = p.normalizeQuery;
  p.normalizeHash = p.normalizeFragment;

  p.iso8859 = function() {
    // expect unicode input, iso8859 output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = escape;
    URI.decode = decodeURIComponent;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.unicode = function() {
    // expect iso8859 input, unicode output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = strictEncodeURIComponent;
    URI.decode = unescape;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.readable = function() {
    var uri = this.clone();
    // removing username, password, because they shouldn't be displayed according to RFC 3986
    uri.username('').password('').normalize();
    var t = '';
    if (uri._parts.protocol) {
      t += uri._parts.protocol + '://';
    }

    if (uri._parts.hostname) {
      if (uri.is('punycode') && punycode) {
        t += punycode.toUnicode(uri._parts.hostname);
        if (uri._parts.port) {
          t += ':' + uri._parts.port;
        }
      } else {
        t += uri.host();
      }
    }

    if (uri._parts.hostname && uri._parts.path && uri._parts.path.charAt(0) !== '/') {
      t += '/';
    }

    t += uri.path(true);
    if (uri._parts.query) {
      var q = '';
      for (var i = 0, qp = uri._parts.query.split('&'), l = qp.length; i < l; i++) {
        var kv = (qp[i] || '').split('=');
        q += '&' + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace)
          .replace(/&/g, '%26');

        if (kv[1] !== undefined) {
          q += '=' + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace)
            .replace(/&/g, '%26');
        }
      }
      t += '?' + q.substring(1);
    }

    t += URI.decodeQuery(uri.hash(), true);
    return t;
  };

  // resolving relative and absolute URLs
  p.absoluteTo = function(base) {
    var resolved = this.clone();
    var properties = ['protocol', 'username', 'password', 'hostname', 'port'];
    var basedir, i, p;

    if (this._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    if (!(base instanceof URI)) {
      base = new URI(base);
    }

    if (resolved._parts.protocol) {
      // Directly returns even if this._parts.hostname is empty.
      return resolved;
    } else {
      resolved._parts.protocol = base._parts.protocol;
    }

    if (this._parts.hostname) {
      return resolved;
    }

    for (i = 0; (p = properties[i]); i++) {
      resolved._parts[p] = base._parts[p];
    }

    if (!resolved._parts.path) {
      resolved._parts.path = base._parts.path;
      if (!resolved._parts.query) {
        resolved._parts.query = base._parts.query;
      }
    } else {
      if (resolved._parts.path.substring(-2) === '..') {
        resolved._parts.path += '/';
      }

      if (resolved.path().charAt(0) !== '/') {
        basedir = base.directory();
        basedir = basedir ? basedir : base.path().indexOf('/') === 0 ? '/' : '';
        resolved._parts.path = (basedir ? (basedir + '/') : '') + resolved._parts.path;
        resolved.normalizePath();
      }
    }

    resolved.build();
    return resolved;
  };
  p.relativeTo = function(base) {
    var relative = this.clone().normalize();
    var relativeParts, baseParts, common, relativePath, basePath;

    if (relative._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    base = new URI(base).normalize();
    relativeParts = relative._parts;
    baseParts = base._parts;
    relativePath = relative.path();
    basePath = base.path();

    if (relativePath.charAt(0) !== '/') {
      throw new Error('URI is already relative');
    }

    if (basePath.charAt(0) !== '/') {
      throw new Error('Cannot calculate a URI relative to another relative URI');
    }

    if (relativeParts.protocol === baseParts.protocol) {
      relativeParts.protocol = null;
    }

    if (relativeParts.username !== baseParts.username || relativeParts.password !== baseParts.password) {
      return relative.build();
    }

    if (relativeParts.protocol !== null || relativeParts.username !== null || relativeParts.password !== null) {
      return relative.build();
    }

    if (relativeParts.hostname === baseParts.hostname && relativeParts.port === baseParts.port) {
      relativeParts.hostname = null;
      relativeParts.port = null;
    } else {
      return relative.build();
    }

    if (relativePath === basePath) {
      relativeParts.path = '';
      return relative.build();
    }

    // determine common sub path
    common = URI.commonPath(relativePath, basePath);

    // If the paths have nothing in common, return a relative URL with the absolute path.
    if (!common) {
      return relative.build();
    }

    var parents = baseParts.path
      .substring(common.length)
      .replace(/[^\/]*$/, '')
      .replace(/.*?\//g, '../');

    relativeParts.path = (parents + relativeParts.path.substring(common.length)) || './';

    return relative.build();
  };

  // comparing URIs
  p.equals = function(uri) {
    var one = this.clone();
    var two = new URI(uri);
    var one_map = {};
    var two_map = {};
    var checked = {};
    var one_query, two_query, key;

    one.normalize();
    two.normalize();

    // exact match
    if (one.toString() === two.toString()) {
      return true;
    }

    // extract query string
    one_query = one.query();
    two_query = two.query();
    one.query('');
    two.query('');

    // definitely not equal if not even non-query parts match
    if (one.toString() !== two.toString()) {
      return false;
    }

    // query parameters have the same length, even if they're permuted
    if (one_query.length !== two_query.length) {
      return false;
    }

    one_map = URI.parseQuery(one_query, this._parts.escapeQuerySpace);
    two_map = URI.parseQuery(two_query, this._parts.escapeQuerySpace);

    for (key in one_map) {
      if (hasOwn.call(one_map, key)) {
        if (!isArray(one_map[key])) {
          if (one_map[key] !== two_map[key]) {
            return false;
          }
        } else if (!arraysEqual(one_map[key], two_map[key])) {
          return false;
        }

        checked[key] = true;
      }
    }

    for (key in two_map) {
      if (hasOwn.call(two_map, key)) {
        if (!checked[key]) {
          // two contains a parameter not present in one
          return false;
        }
      }
    }

    return true;
  };

  // state
  p.preventInvalidHostname = function(v) {
    this._parts.preventInvalidHostname = !!v;
    return this;
  };

  p.duplicateQueryParameters = function(v) {
    this._parts.duplicateQueryParameters = !!v;
    return this;
  };

  p.escapeQuerySpace = function(v) {
    this._parts.escapeQuerySpace = !!v;
    return this;
  };

  return URI;
}));

/*
Spine.js MVC library
Released under the MIT License
 */

(function() {
  var $, Controller, Events, Log, Model, Module, Spine, createObject, isArray, isBlank, makeArray, moduleKeywords,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Events = {
    bind: function(ev, callback) {
      var calls, evs, j, len, name;
      evs = ev.split(' ');
      calls = this.hasOwnProperty('_callbacks') && (this._callbacks || (this._callbacks = {}));
      for (j = 0, len = evs.length; j < len; j++) {
        name = evs[j];
        calls[name] || (calls[name] = []);
        calls[name].push(callback);
      }
      return this;
    },
    one: function(ev, callback) {
      var handler;
      return this.bind(ev, handler = function() {
        this.unbind(ev, handler);
        return callback.apply(this, arguments);
      });
    },
    trigger: function() {
      var args, callback, ev, j, len, list, ref;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      ev = args.shift();
      list = this.hasOwnProperty('_callbacks') && ((ref = this._callbacks) != null ? ref[ev] : void 0);
      if (!list) {
        return;
      }
      for (j = 0, len = list.length; j < len; j++) {
        callback = list[j];
        if (callback.apply(this, args) === false) {
          break;
        }
      }
      return true;
    },
    listenTo: function(obj, ev, callback) {
      obj.bind(ev, callback);
      this.listeningTo || (this.listeningTo = []);
      this.listeningTo.push({
        obj: obj,
        ev: ev,
        callback: callback
      });
      return this;
    },
    listenToOnce: function(obj, ev, callback) {
      var handler, listeningToOnce;
      listeningToOnce = this.listeningToOnce || [];
      obj.bind(ev, handler = function() {
        var i, idx, j, len, lt;
        idx = -1;
        for (i = j = 0, len = listeningToOnce.length; j < len; i = ++j) {
          lt = listeningToOnce[i];
          if (lt.obj === obj) {
            if (lt.ev === ev && lt.callback === callback) {
              idx = i;
            }
          }
        }
        obj.unbind(ev, handler);
        if (idx !== -1) {
          listeningToOnce.splice(idx, 1);
        }
        return callback.apply(this, arguments);
      });
      listeningToOnce.push({
        obj: obj,
        ev: ev,
        callback: callback,
        handler: handler
      });
      return this;
    },
    stopListening: function(obj, events, callback) {
      var ev, evts, i, idx, j, k, l, len, len1, len2, listeningTo, lt, ref, ref1, results;
      if (arguments.length === 0) {
        ref = [this.listeningTo, this.listeningToOnce];
        for (j = 0, len = ref.length; j < len; j++) {
          listeningTo = ref[j];
          if (!listeningTo) {
            continue;
          }
          for (k = 0, len1 = listeningTo.length; k < len1; k++) {
            lt = listeningTo[k];
            lt.obj.unbind(lt.ev, lt.handler || lt.callback);
          }
        }
        this.listeningTo = void 0;
        return this.listeningToOnce = void 0;
      } else if (obj) {
        ref1 = [this.listeningTo, this.listeningToOnce];
        results = [];
        for (l = 0, len2 = ref1.length; l < len2; l++) {
          listeningTo = ref1[l];
          if (!listeningTo) {
            continue;
          }
          events = events ? events.split(' ') : [void 0];
          results.push((function() {
            var len3, m, results1;
            results1 = [];
            for (m = 0, len3 = events.length; m < len3; m++) {
              ev = events[m];
              results1.push((function() {
                var n, ref2, results2;
                results2 = [];
                for (idx = n = ref2 = listeningTo.length - 1; ref2 <= 0 ? n <= 0 : n >= 0; idx = ref2 <= 0 ? ++n : --n) {
                  lt = listeningTo[idx];
                  if ((!ev) || (ev === lt.ev)) {
                    lt.obj.unbind(lt.ev, lt.handler || lt.callback);
                    if (idx !== -1) {
                      results2.push(listeningTo.splice(idx, 1));
                    } else {
                      results2.push(void 0);
                    }
                  } else if (ev) {
                    evts = lt.ev.split(' ');
                    if (~(i = evts.indexOf(ev))) {
                      evts.splice(i, 1);
                      lt.ev = $.trim(evts.join(' '));
                      results2.push(lt.obj.unbind(ev, lt.handler || lt.callback));
                    } else {
                      results2.push(void 0);
                    }
                  } else {
                    results2.push(void 0);
                  }
                }
                return results2;
              })());
            }
            return results1;
          })());
        }
        return results;
      }
    },
    unbind: function(ev, callback) {
      var cb, evs, i, j, k, len, len1, list, name, ref;
      if (arguments.length === 0) {
        this._callbacks = {};
        return this;
      }
      if (!ev) {
        return this;
      }
      evs = ev.split(' ');
      for (j = 0, len = evs.length; j < len; j++) {
        name = evs[j];
        list = (ref = this._callbacks) != null ? ref[name] : void 0;
        if (!list) {
          continue;
        }
        if (!callback) {
          delete this._callbacks[name];
          continue;
        }
        for (i = k = 0, len1 = list.length; k < len1; i = ++k) {
          cb = list[i];
          if (!(cb === callback)) {
            continue;
          }
          list = list.slice();
          list.splice(i, 1);
          this._callbacks[name] = list;
          break;
        }
      }
      return this;
    }
  };

  Events.on = Events.bind;

  Events.off = Events.unbind;

  Log = {
    trace: true,
    logPrefix: '(App)',
    log: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!this.trace) {
        return;
      }
      if (this.logPrefix) {
        args.unshift(this.logPrefix);
      }
      if (typeof console !== "undefined" && console !== null) {
        if (typeof console.log === "function") {
          console.log.apply(console, args);
        }
      }
      return this;
    }
  };

  moduleKeywords = ['included', 'extended'];

  Module = (function() {
    Module.include = function(obj) {
      var key, ref, value;
      if (!obj) {
        throw new Error('include(obj) requires obj');
      }
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(moduleKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      if ((ref = obj.included) != null) {
        ref.apply(this);
      }
      return this;
    };

    Module.extend = function(obj) {
      var key, ref, value;
      if (!obj) {
        throw new Error('extend(obj) requires obj');
      }
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(moduleKeywords, key) < 0) {
          this[key] = value;
        }
      }
      if ((ref = obj.extended) != null) {
        ref.apply(this);
      }
      return this;
    };

    Module.proxy = function(func) {
      return (function(_this) {
        return function() {
          return func.apply(_this, arguments);
        };
      })(this);
    };

    Module.prototype.proxy = function(func) {
      return (function(_this) {
        return function() {
          return func.apply(_this, arguments);
        };
      })(this);
    };

    function Module() {
      if (typeof this.init === "function") {
        this.init.apply(this, arguments);
      }
    }

    return Module;

  })();

  Model = (function(superClass) {
    extend(Model, superClass);

    Model.extend(Events);

    Model.records = [];

    Model.irecords = {};

    Model.attributes = [];

    Model.configure = function() {
      var attributes, name;
      name = arguments[0], attributes = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      this.className = name;
      this.deleteAll();
      if (attributes.length) {
        this.attributes = attributes;
      }
      this.attributes && (this.attributes = makeArray(this.attributes));
      this.attributes || (this.attributes = []);
      this.unbind();
      return this;
    };

    Model.toString = function() {
      return this.className + "(" + (this.attributes.join(", ")) + ")";
    };

    Model.find = function(id) {
      var record;
      record = this.exists(id);
      if (!record) {
        throw new Error("\"" + this.className + "\" model could not find a record for the ID \"" + id + "\"");
      }
      return record;
    };

    Model.exists = function(id) {
      var ref;
      return (ref = this.irecords[id]) != null ? ref.clone() : void 0;
    };

    Model.addRecord = function(record) {
      if (record.id && this.irecords[record.id]) {
        this.irecords[record.id].remove();
      }
      record.id || (record.id = record.cid);
      this.records.push(record);
      this.irecords[record.id] = record;
      return this.irecords[record.cid] = record;
    };

    Model.refresh = function(values, options) {
      var j, len, record, records, result;
      if (options == null) {
        options = {};
      }
      if (options.clear) {
        this.deleteAll();
      }
      records = this.fromJSON(values);
      if (!isArray(records)) {
        records = [records];
      }
      for (j = 0, len = records.length; j < len; j++) {
        record = records[j];
        this.addRecord(record);
      }
      this.sort();
      result = this.cloneArray(records);
      this.trigger('refresh', result, options);
      return result;
    };

    Model.select = function(callback) {
      var j, len, record, ref, results;
      ref = this.records;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        record = ref[j];
        if (callback(record)) {
          results.push(record.clone());
        }
      }
      return results;
    };

    Model.findByAttribute = function(name, value) {
      var j, len, record, ref;
      ref = this.records;
      for (j = 0, len = ref.length; j < len; j++) {
        record = ref[j];
        if (record[name] === value) {
          return record.clone();
        }
      }
      return null;
    };

    Model.findAllByAttribute = function(name, value) {
      return this.select(function(item) {
        return item[name] === value;
      });
    };

    Model.each = function(callback) {
      var j, len, record, ref, results;
      ref = this.records;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        record = ref[j];
        results.push(callback(record.clone()));
      }
      return results;
    };

    Model.all = function() {
      return this.cloneArray(this.records);
    };

    Model.slice = function(begin, end) {
      if (begin == null) {
        begin = 0;
      }
      return this.cloneArray(this.records.slice(begin, end));
    };

    Model.first = function(end) {
      var ref;
      if (end == null) {
        end = 1;
      }
      if (end > 1) {
        return this.cloneArray(this.records.slice(0, end));
      } else {
        return (ref = this.records[0]) != null ? ref.clone() : void 0;
      }
    };

    Model.last = function(begin) {
      var ref;
      if (typeof begin === 'number') {
        return this.cloneArray(this.records.slice(-begin));
      } else {
        return (ref = this.records[this.records.length - 1]) != null ? ref.clone() : void 0;
      }
    };

    Model.count = function() {
      return this.records.length;
    };

    Model.deleteAll = function() {
      this.records = [];
      return this.irecords = {};
    };

    Model.destroyAll = function(options) {
      var j, len, record, ref, results;
      ref = this.records;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        record = ref[j];
        results.push(record.destroy(options));
      }
      return results;
    };

    Model.update = function(id, atts, options) {
      return this.find(id).updateAttributes(atts, options);
    };

    Model.create = function(atts, options) {
      var record;
      record = new this(atts);
      return record.save(options);
    };

    Model.destroy = function(id, options) {
      return this.find(id).destroy(options);
    };

    Model.change = function(callbackOrParams) {
      if (typeof callbackOrParams === 'function') {
        return this.bind('change', callbackOrParams);
      } else {
        return this.trigger.apply(this, ['change'].concat(slice.call(arguments)));
      }
    };

    Model.fetch = function(callbackOrParams) {
      if (typeof callbackOrParams === 'function') {
        return this.bind('fetch', callbackOrParams);
      } else {
        return this.trigger.apply(this, ['fetch'].concat(slice.call(arguments)));
      }
    };

    Model.toJSON = function() {
      return this.records;
    };

    Model.fromJSON = function(objects) {
      var j, len, results, value;
      if (!objects) {
        return;
      }
      if (typeof objects === 'string') {
        objects = JSON.parse(objects);
      }
      if (isArray(objects)) {
        results = [];
        for (j = 0, len = objects.length; j < len; j++) {
          value = objects[j];
          results.push(new this(value));
        }
        return results;
      } else {
        return new this(objects);
      }
    };

    Model.fromForm = function() {
      var ref;
      return (ref = new this).fromForm.apply(ref, arguments);
    };

    Model.sort = function() {
      if (this.comparator) {
        this.records.sort(this.comparator);
      }
      return this;
    };

    Model.cloneArray = function(array) {
      var j, len, results, value;
      results = [];
      for (j = 0, len = array.length; j < len; j++) {
        value = array[j];
        results.push(value.clone());
      }
      return results;
    };

    Model.idCounter = 0;

    Model.uid = function(prefix) {
      var uid;
      if (prefix == null) {
        prefix = '';
      }
      uid = prefix + this.idCounter++;
      if (this.exists(uid)) {
        uid = this.uid(prefix);
      }
      return uid;
    };

    function Model(atts) {
      Model.__super__.constructor.apply(this, arguments);
      if (atts) {
        this.load(atts);
      }
      this.cid = (atts != null ? atts.cid : void 0) || this.constructor.uid('c-');
    }

    Model.prototype.isNew = function() {
      return !this.exists();
    };

    Model.prototype.isValid = function() {
      return !this.validate();
    };

    Model.prototype.validate = function() {};

    Model.prototype.load = function(atts) {
      var key, value;
      if (atts.id) {
        this.id = atts.id;
      }
      for (key in atts) {
        value = atts[key];
        if (atts.hasOwnProperty(key) && typeof this[key] === 'function') {
          this[key](value);
        } else {
          this[key] = value;
        }
      }
      return this;
    };

    Model.prototype.attributes = function() {
      var j, key, len, ref, result;
      result = {};
      ref = this.constructor.attributes;
      for (j = 0, len = ref.length; j < len; j++) {
        key = ref[j];
        if (key in this) {
          if (typeof this[key] === 'function') {
            result[key] = this[key]();
          } else {
            result[key] = this[key];
          }
        }
      }
      if (this.id) {
        result.id = this.id;
      }
      return result;
    };

    Model.prototype.eql = function(rec) {
      return !!(rec && rec.constructor === this.constructor && ((rec.cid === this.cid) || (rec.id && rec.id === this.id)));
    };

    Model.prototype.save = function(options) {
      var error, record;
      if (options == null) {
        options = {};
      }
      if (options.validate !== false) {
        error = this.validate();
        if (error) {
          this.trigger('error', error);
          return false;
        }
      }
      this.trigger('beforeSave', options);
      record = this.isNew() ? this.create(options) : this.update(options);
      this.stripCloneAttrs();
      this.trigger('save', options);
      return record;
    };

    Model.prototype.stripCloneAttrs = function() {
      var key, ref, value;
      if (this.hasOwnProperty('cid')) {
        return;
      }
      ref = this;
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        value = ref[key];
        if (indexOf.call(this.constructor.attributes, key) >= 0) {
          delete this[key];
        }
      }
      return this;
    };

    Model.prototype.updateAttribute = function(name, value, options) {
      var atts;
      atts = {};
      atts[name] = value;
      return this.updateAttributes(atts, options);
    };

    Model.prototype.updateAttributes = function(atts, options) {
      this.load(atts);
      return this.save(options);
    };

    Model.prototype.changeID = function(id) {
      var records;
      if (id === this.id) {
        return;
      }
      records = this.constructor.irecords;
      records[id] = records[this.id];
      if (this.cid !== this.id) {
        delete records[this.id];
      }
      this.id = id;
      return this.save();
    };

    Model.prototype.remove = function() {
      var i, j, len, record, records;
      records = this.constructor.records.slice(0);
      for (i = j = 0, len = records.length; j < len; i = ++j) {
        record = records[i];
        if (!(this.eql(record))) {
          continue;
        }
        records.splice(i, 1);
        break;
      }
      this.constructor.records = records;
      delete this.constructor.irecords[this.id];
      return delete this.constructor.irecords[this.cid];
    };

    Model.prototype.destroy = function(options) {
      if (options == null) {
        options = {};
      }
      this.trigger('beforeDestroy', options);
      this.remove();
      this.destroyed = true;
      this.trigger('destroy', options);
      this.trigger('change', 'destroy', options);
      if (this.listeningTo) {
        this.stopListening();
      }
      this.unbind();
      return this;
    };

    Model.prototype.dup = function(newRecord) {
      var atts;
      if (newRecord == null) {
        newRecord = true;
      }
      atts = this.attributes();
      if (newRecord) {
        delete atts.id;
      } else {
        atts.cid = this.cid;
      }
      return new this.constructor(atts);
    };

    Model.prototype.clone = function() {
      return createObject(this);
    };

    Model.prototype.reload = function() {
      var original;
      if (this.isNew()) {
        return this;
      }
      original = this.constructor.find(this.id);
      this.load(original.attributes());
      return original;
    };

    Model.prototype.refresh = function(data) {
      var root;
      root = this.constructor.irecords[this.id];
      root.load(data);
      this.trigger('refresh');
      return this;
    };

    Model.prototype.toJSON = function() {
      return this.attributes();
    };

    Model.prototype.toString = function() {
      return "<" + this.constructor.className + " (" + (JSON.stringify(this)) + ")>";
    };

    Model.prototype.fromForm = function(form) {
      var checkbox, j, k, key, l, len, len1, len2, name, name1, ref, ref1, ref2, result;
      result = {};
      ref = $(form).find('[type=checkbox]:not([value])');
      for (j = 0, len = ref.length; j < len; j++) {
        checkbox = ref[j];
        result[checkbox.name] = $(checkbox).prop('checked');
      }
      ref1 = $(form).find('[type=checkbox][name$="[]"]');
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        checkbox = ref1[k];
        name = checkbox.name.replace(/\[\]$/, '');
        result[name] || (result[name] = []);
        if ($(checkbox).prop('checked')) {
          result[name].push(checkbox.value);
        }
      }
      ref2 = $(form).serializeArray();
      for (l = 0, len2 = ref2.length; l < len2; l++) {
        key = ref2[l];
        result[name1 = key.name] || (result[name1] = key.value);
      }
      return this.load(result);
    };

    Model.prototype.exists = function() {
      return this.constructor.exists(this.id);
    };

    Model.prototype.update = function(options) {
      var clone, records;
      this.trigger('beforeUpdate', options);
      records = this.constructor.irecords;
      records[this.id].load(this.attributes());
      this.constructor.sort();
      clone = records[this.id].clone();
      clone.trigger('update', options);
      clone.trigger('change', 'update', options);
      return clone;
    };

    Model.prototype.create = function(options) {
      var clone, record;
      this.trigger('beforeCreate', options);
      this.id || (this.id = this.cid);
      record = this.dup(false);
      this.constructor.addRecord(record);
      this.constructor.sort();
      clone = record.clone();
      clone.trigger('create', options);
      clone.trigger('change', 'create', options);
      return clone;
    };

    Model.prototype.bind = function(events, callback) {
      var binder, fn, j, len, ref, singleEvent;
      this.constructor.bind(events, binder = (function(_this) {
        return function(record) {
          if (record && _this.eql(record)) {
            return callback.apply(_this, arguments);
          }
        };
      })(this));
      ref = events.split(' ');
      fn = (function(_this) {
        return function(singleEvent) {
          var unbinder;
          return _this.constructor.bind("unbind", unbinder = function(record, event, cb) {
            if (record && _this.eql(record)) {
              if (event && event !== singleEvent) {
                return;
              }
              if (cb && cb !== callback) {
                return;
              }
              _this.constructor.unbind(singleEvent, binder);
              return _this.constructor.unbind("unbind", unbinder);
            }
          });
        };
      })(this);
      for (j = 0, len = ref.length; j < len; j++) {
        singleEvent = ref[j];
        fn(singleEvent);
      }
      return this;
    };

    Model.prototype.one = function(events, callback) {
      var handler;
      return this.bind(events, handler = (function(_this) {
        return function() {
          _this.unbind(events, handler);
          return callback.apply(_this, arguments);
        };
      })(this));
    };

    Model.prototype.trigger = function() {
      var args, ref;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      args.splice(1, 0, this);
      return (ref = this.constructor).trigger.apply(ref, args);
    };

    Model.prototype.listenTo = function() {
      return Events.listenTo.apply(this, arguments);
    };

    Model.prototype.listenToOnce = function() {
      return Events.listenToOnce.apply(this, arguments);
    };

    Model.prototype.stopListening = function() {
      return Events.stopListening.apply(this, arguments);
    };

    Model.prototype.unbind = function(events, callback) {
      var event, j, len, ref, results;
      if (arguments.length === 0) {
        return this.trigger('unbind');
      } else if (events) {
        ref = events.split(' ');
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          event = ref[j];
          results.push(this.trigger('unbind', event, callback));
        }
        return results;
      }
    };

    return Model;

  })(Module);

  Model.prototype.on = Model.prototype.bind;

  Model.prototype.off = Model.prototype.unbind;

  Controller = (function(superClass) {
    extend(Controller, superClass);

    Controller.include(Events);

    Controller.include(Log);

    Controller.prototype.eventSplitter = /^(\S+)\s*(.*)$/;

    Controller.prototype.tag = 'div';

    function Controller(options) {
      this.release = bind(this.release, this);
      false;
      var context, key, parent_prototype, ref, value;
      this.options = options;
      ref = this.options;
      for (key in ref) {
        value = ref[key];
        this[key] = value;
      }
      if (!this.el) {
        this.el = document.createElement(this.tag);
      }
      this.el = $(this.el);
      this.$el = this.el;
      if (this.className) {
        this.el.addClass(this.className);
      }
      if (this.attributes) {
        this.el.attr(this.attributes);
      }
      if (!this.events) {
        this.events = this.constructor.events;
      }
      if (!this.elements) {
        this.elements = this.constructor.elements;
      }
      context = this;
      while (parent_prototype = context.constructor.__super__) {
        if (parent_prototype.events) {
          this.events = $.extend({}, parent_prototype.events, this.events);
        }
        if (parent_prototype.elements) {
          this.elements = $.extend({}, parent_prototype.elements, this.elements);
        }
        context = parent_prototype;
      }
      if (this.events) {
        this.delegateEvents(this.events);
      }
      if (this.elements) {
        this.refreshElements();
      }
      Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.release = function() {
      this.trigger('release', this);
      this.el.remove();
      this.unbind();
      return this.stopListening();
    };

    Controller.prototype.$ = function(selector) {
      return $(selector, this.el);
    };

    Controller.prototype.delegateEvents = function(events) {
      var eventName, key, match, method, results, selector;
      results = [];
      for (key in events) {
        method = events[key];
        if (typeof method === 'function') {
          method = (function(_this) {
            return function(method) {
              return function() {
                method.apply(_this, arguments);
                return true;
              };
            };
          })(this)(method);
        } else {
          if (!this[method]) {
            throw new Error(method + " doesn't exist");
          }
          method = (function(_this) {
            return function(method) {
              return function() {
                _this[method].apply(_this, arguments);
                return true;
              };
            };
          })(this)(method);
        }
        match = key.match(this.eventSplitter);
        eventName = match[1];
        selector = match[2];
        if (selector === '') {
          results.push(this.el.bind(eventName, method));
        } else {
          results.push(this.el.on(eventName, selector, method));
        }
      }
      return results;
    };

    Controller.prototype.refreshElements = function() {
      var key, ref, results, value;
      ref = this.elements;
      results = [];
      for (key in ref) {
        value = ref[key];
        results.push(this[value] = this.$(key));
      }
      return results;
    };

    Controller.prototype.delay = function(func, timeout) {
      return setTimeout(this.proxy(func), timeout || 0);
    };

    Controller.prototype.html = function(element) {
      this.el.html(element.el || element);
      this.refreshElements();
      return this.el;
    };

    Controller.prototype.append = function() {
      var e, elements, ref;
      elements = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      elements = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = elements.length; j < len; j++) {
          e = elements[j];
          results.push(e.el || e);
        }
        return results;
      })();
      (ref = this.el).append.apply(ref, elements);
      this.refreshElements();
      return this.el;
    };

    Controller.prototype.appendTo = function(element) {
      this.el.appendTo(element.el || element);
      this.refreshElements();
      return this.el;
    };

    Controller.prototype.prepend = function() {
      var e, elements, ref;
      elements = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      elements = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = elements.length; j < len; j++) {
          e = elements[j];
          results.push(e.el || e);
        }
        return results;
      })();
      (ref = this.el).prepend.apply(ref, elements);
      this.refreshElements();
      return this.el;
    };

    Controller.prototype.replace = function(element) {
      var previous, ref, ref1;
      element = element.el || element;
      if (typeof element === "string") {
        element = $.trim(element);
      }
      ref1 = [this.el, $(((ref = $.parseHTML(element)) != null ? ref[0] : void 0) || element)], previous = ref1[0], this.el = ref1[1];
      previous.replaceWith(this.el);
      this.delegateEvents(this.events);
      this.refreshElements();
      return this.el;
    };

    return Controller;

  })(Module);

  $ = (typeof window !== "undefined" && window !== null ? window.jQuery : void 0) || (typeof window !== "undefined" && window !== null ? window.Zepto : void 0) || function(element) {
    return element;
  };

  createObject = Object.create || function(o) {
    var Func;
    Func = function() {};
    Func.prototype = o;
    return new Func();
  };

  isArray = function(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  };

  isBlank = function(value) {
    var key;
    if (!value) {
      return true;
    }
    for (key in value) {
      return false;
    }
    return true;
  };

  makeArray = function(args) {
    return Array.prototype.slice.call(args, 0);
  };

  Spine = this.Spine = {};

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine;
  }

  Spine.version = '1.2.2';

  Spine.isArray = isArray;

  Spine.isBlank = isBlank;

  Spine.$ = $;

  Spine.Events = Events;

  Spine.Log = Log;

  Spine.Module = Module;

  Spine.Controller = Controller;

  Spine.Model = Model;

  Module.extend.call(Spine, Events);

  Module.create = Module.sub = Controller.create = Controller.sub = Model.sub = function(instances, statics) {
    var Result;
    Result = (function(superClass) {
      extend(Result, superClass);

      function Result() {
        return Result.__super__.constructor.apply(this, arguments);
      }

      return Result;

    })(this);
    if (instances) {
      Result.include(instances);
    }
    if (statics) {
      Result.extend(statics);
    }
    if (typeof Result.unbind === "function") {
      Result.unbind();
    }
    return Result;
  };

  Model.setup = function(name, attributes) {
    var Instance;
    if (attributes == null) {
      attributes = [];
    }
    Instance = (function(superClass) {
      extend(Instance, superClass);

      function Instance() {
        return Instance.__super__.constructor.apply(this, arguments);
      }

      return Instance;

    })(this);
    Instance.configure.apply(Instance, [name].concat(slice.call(attributes)));
    return Instance;
  };

  Spine.Class = Module;

}).call(this);
(function() {
  var $, Spine,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  Spine = this.Spine || require('spine');

  $ = Spine.$;

  Spine.Manager = (function(superClass) {
    extend(Manager, superClass);

    Manager.include(Spine.Events);

    function Manager() {
      this.controllers = [];
      this.bind('change', this.change);
      this.add.apply(this, arguments);
    }

    Manager.prototype.add = function() {
      var cont, controllers, i, len, results;
      controllers = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      results = [];
      for (i = 0, len = controllers.length; i < len; i++) {
        cont = controllers[i];
        results.push(this.addOne(cont));
      }
      return results;
    };

    Manager.prototype.addOne = function(controller) {
      controller.bind('active', (function(_this) {
        return function() {
          var args;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return _this.trigger.apply(_this, ['change', controller].concat(slice.call(args)));
        };
      })(this));
      controller.bind('release', (function(_this) {
        return function() {
          return _this.controllers.splice(_this.controllers.indexOf(controller), 1);
        };
      })(this));
      return this.controllers.push(controller);
    };

    Manager.prototype.deactivate = function() {
      return this.trigger.apply(this, ['change', false].concat(slice.call(arguments)));
    };

    Manager.prototype.change = function() {
      var args, cont, current, i, len, ref;
      current = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      ref = this.controllers;
      for (i = 0, len = ref.length; i < len; i++) {
        cont = ref[i];
        if (cont !== current) {
          cont.deactivate.apply(cont, args);
        }
      }
      if (current) {
        return current.activate.apply(current, args);
      }
    };

    return Manager;

  })(Spine.Module);

  Spine.Controller.include({
    active: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (typeof args[0] === 'function') {
        this.bind('active', args[0]);
      } else {
        args.unshift('active');
        this.trigger.apply(this, args);
      }
      return this;
    },
    isActive: function() {
      return this.el.hasClass('active');
    },
    activate: function() {
      this.el.addClass('active');
      return this;
    },
    deactivate: function() {
      this.el.removeClass('active');
      return this;
    }
  });

  Spine.Stack = (function(superClass) {
    extend(Stack, superClass);

    Stack.prototype.controllers = {};

    Stack.prototype.routes = {};

    Stack.prototype.className = 'spine stack';

    function Stack() {
      var fn, key, ref, ref1, value;
      Stack.__super__.constructor.apply(this, arguments);
      this.manager = new Spine.Manager;
      ref = this.controllers;
      for (key in ref) {
        value = ref[key];
        if (this[key] != null) {
          throw Error("'@" + key + "' already assigned - choose a different name");
        }
        this[key] = new value({
          stack: this
        });
        this.add(this[key]);
      }
      ref1 = this.routes;
      fn = (function(_this) {
        return function(key, value) {
          var callback;
          if (typeof value === 'function') {
            callback = value;
          }
          callback || (callback = function() {
            var ref2;
            return (ref2 = _this[value]).active.apply(ref2, arguments);
          });
          return _this.route(key, callback);
        };
      })(this);
      for (key in ref1) {
        value = ref1[key];
        fn(key, value);
      }
      if (this["default"]) {
        this[this["default"]].active();
      }
    }

    Stack.prototype.add = function(controller) {
      this.manager.add(controller);
      return this.append(controller);
    };

    return Stack;

  })(Spine.Controller);

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Manager;
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports.Stack = Spine.Stack;
  }

}).call(this);
(function() {
  var $, Ajax, Base, Collection, Extend, Include, Model, Queue, Singleton, Spine,
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Spine = this.Spine || require('spine');

  $ = Spine.$;

  Model = Spine.Model;

  Queue = $({});

  Ajax = {
    getURL: function(object) {
      return (typeof object.url === "function" ? object.url() : void 0) || object.url;
    },
    getCollectionURL: function(object) {
      if (object) {
        if (typeof object.url === "function") {
          return this.generateURL(object);
        } else {
          return object.url;
        }
      }
    },
    getScope: function(object) {
      return (typeof object.scope === "function" ? object.scope() : void 0) || object.scope;
    },
    generateURL: function() {
      var args, collection, object, path, scope;
      object = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (object.className) {
        collection = object.className.toLowerCase() + 's';
        scope = Ajax.getScope(object);
      } else {
        if (typeof object.constructor.url === 'string') {
          collection = object.constructor.url;
        } else {
          collection = object.constructor.className.toLowerCase() + 's';
        }
        scope = Ajax.getScope(object) || Ajax.getScope(object.constructor);
      }
      args.unshift(collection);
      args.unshift(scope);
      path = args.join('/');
      path = path.replace(/(\/\/)/g, "/");
      path = path.replace(/^\/|\/$/g, "");
      if (path.indexOf("../") !== 0) {
        return Model.host + "/" + path;
      } else {
        return path;
      }
    },
    enabled: true,
    disable: function(callback) {
      var e;
      if (this.enabled) {
        this.enabled = false;
        try {
          return callback();
        } catch (error1) {
          e = error1;
          throw e;
        } finally {
          this.enabled = true;
        }
      } else {
        return callback();
      }
    },
    queue: function(request) {
      if (request) {
        return Queue.queue(request);
      } else {
        return Queue.queue();
      }
    },
    clearQueue: function() {
      return this.queue([]);
    }
  };

  Base = (function() {
    function Base() {}

    Base.prototype.defaults = {
      dataType: 'json',
      processData: false,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    };

    Base.prototype.queue = Ajax.queue;

    Base.prototype.ajax = function(params, defaults) {
      return $.ajax(this.ajaxSettings(params, defaults));
    };

    Base.prototype.ajaxQueue = function(params, defaults, record) {
      var deferred, jqXHR, promise, request, settings;
      jqXHR = null;
      deferred = $.Deferred();
      promise = deferred.promise();
      if (!Ajax.enabled) {
        return promise;
      }
      settings = this.ajaxSettings(params, defaults);
      request = function(next) {
        var ref;
        if ((record != null ? record.id : void 0) != null) {
          if (settings.url == null) {
            settings.url = Ajax.getURL(record);
          }
          if ((ref = settings.data) != null) {
            ref.id = record.id;
          }
        }
        if (typeof settings.data !== 'string' && settings.processData !== true) {
          settings.data = JSON.stringify(settings.data);
        }
        return jqXHR = $.ajax(settings).done(deferred.resolve).fail(deferred.reject).then(next, next);
      };
      promise.abort = function(statusText) {
        var index;
        if (jqXHR) {
          return jqXHR.abort(statusText);
        }
        index = $.inArray(request, this.queue());
        if (index > -1) {
          this.queue().splice(index, 1);
        }
        deferred.rejectWith(settings.context || settings, [promise, statusText, '']);
        return promise;
      };
      this.queue(request);
      return promise;
    };

    Base.prototype.ajaxSettings = function(params, defaults) {
      return $.extend({}, this.defaults, defaults, params);
    };

    return Base;

  })();

  Collection = (function(superClass) {
    extend(Collection, superClass);

    function Collection(model) {
      this.model = model;
      this.failResponse = bind(this.failResponse, this);
      this.recordsResponse = bind(this.recordsResponse, this);
    }

    Collection.prototype.find = function(id, params, options) {
      var record;
      if (options == null) {
        options = {};
      }
      record = new this.model({
        id: id
      });
      return this.ajaxQueue(params, {
        type: 'GET',
        url: options.url || Ajax.getURL(record)
      }).done(this.recordsResponse).fail(this.failResponse);
    };

    Collection.prototype.all = function(params, options) {
      if (options == null) {
        options = {};
      }
      return this.ajaxQueue(params, {
        type: 'GET',
        url: options.url || Ajax.getURL(this.model)
      }).done(this.recordsResponse).fail(this.failResponse);
    };

    Collection.prototype.fetch = function(params, options) {
      var id;
      if (params == null) {
        params = {};
      }
      if (options == null) {
        options = {};
      }
      if (id = params.id) {
        delete params.id;
        return this.find(id, params, options).done((function(_this) {
          return function(record) {
            return _this.model.refresh(record, options);
          };
        })(this));
      } else {
        return this.all(params, options).done((function(_this) {
          return function(records) {
            return _this.model.refresh(records, options);
          };
        })(this));
      }
    };

    Collection.prototype.recordsResponse = function(data, status, xhr) {
      return this.model.trigger('ajaxSuccess', null, status, xhr);
    };

    Collection.prototype.failResponse = function(xhr, statusText, error) {
      return this.model.trigger('ajaxError', null, xhr, statusText, error);
    };

    return Collection;

  })(Base);

  Singleton = (function(superClass) {
    extend(Singleton, superClass);

    function Singleton(record1) {
      this.record = record1;
      this.failResponse = bind(this.failResponse, this);
      this.recordResponse = bind(this.recordResponse, this);
      this.model = this.record.constructor;
    }

    Singleton.prototype.reload = function(params, options) {
      if (options == null) {
        options = {};
      }
      return this.ajaxQueue(params, {
        type: 'GET',
        url: options.url
      }, this.record).done(this.recordResponse(options)).fail(this.failResponse(options));
    };

    Singleton.prototype.create = function(params, options) {
      if (options == null) {
        options = {};
      }
      return this.ajaxQueue(params, {
        type: 'POST',
        contentType: 'application/json',
        data: this.record.toJSON(),
        url: options.url || Ajax.getCollectionURL(this.record)
      }).done(this.recordResponse(options)).fail(this.failResponse(options));
    };

    Singleton.prototype.update = function(params, options) {
      if (options == null) {
        options = {};
      }
      return this.ajaxQueue(params, {
        type: 'PUT',
        contentType: 'application/json',
        data: this.record.toJSON(),
        url: options.url
      }, this.record).done(this.recordResponse(options)).fail(this.failResponse(options));
    };

    Singleton.prototype.destroy = function(params, options) {
      if (options == null) {
        options = {};
      }
      return this.ajaxQueue(params, {
        type: 'DELETE',
        url: options.url
      }, this.record).done(this.recordResponse(options)).fail(this.failResponse(options));
    };

    Singleton.prototype.recordResponse = function(options) {
      if (options == null) {
        options = {};
      }
      return (function(_this) {
        return function(data, status, xhr) {
          var ref, ref1;
          Ajax.disable(function() {
            if (!(Spine.isBlank(data) || _this.record.destroyed)) {
              if (data.id && _this.record.id !== data.id) {
                _this.record.changeID(data.id);
              }
              return _this.record.refresh(data);
            }
          });
          _this.record.trigger('ajaxSuccess', data, status, xhr);
          if ((ref = options.success) != null) {
            ref.apply(_this.record);
          }
          return (ref1 = options.done) != null ? ref1.apply(_this.record) : void 0;
        };
      })(this);
    };

    Singleton.prototype.failResponse = function(options) {
      if (options == null) {
        options = {};
      }
      return (function(_this) {
        return function(xhr, statusText, error) {
          var ref, ref1;
          _this.record.trigger('ajaxError', xhr, statusText, error);
          if ((ref = options.error) != null) {
            ref.apply(_this.record);
          }
          return (ref1 = options.fail) != null ? ref1.apply(_this.record) : void 0;
        };
      })(this);
    };

    return Singleton;

  })(Base);

  Model.host = '';

  Include = {
    ajax: function() {
      return new Singleton(this);
    },
    url: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      args.unshift(encodeURIComponent(this.id));
      return Ajax.generateURL.apply(Ajax, [this].concat(slice.call(args)));
    }
  };

  Extend = {
    ajax: function() {
      return new Collection(this);
    },
    url: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return Ajax.generateURL.apply(Ajax, [this].concat(slice.call(args)));
    }
  };

  Model.Ajax = {
    extended: function() {
      this.fetch(this.ajaxFetch);
      this.change(this.ajaxChange);
      this.extend(Extend);
      return this.include(Include);
    },
    ajaxFetch: function() {
      var ref;
      return (ref = this.ajax()).fetch.apply(ref, arguments);
    },
    ajaxChange: function(record, type, options) {
      if (options == null) {
        options = {};
      }
      if (options.ajax === false) {
        return;
      }
      return record.ajax()[type](options.ajax, options);
    }
  };

  Model.Ajax.Methods = {
    extended: function() {
      this.extend(Extend);
      return this.include(Include);
    }
  };

  Ajax.defaults = Base.prototype.defaults;

  Ajax.Base = Base;

  Ajax.Singleton = Singleton;

  Ajax.Collection = Collection;

  Spine.Ajax = Ajax;

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Ajax;
  }

}).call(this);
(function() {
  var Collection, Instance, Singleton, Spine, association, isArray, require, singularize, underscore,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Spine = this.Spine || require('spine');

  isArray = Spine.isArray;

  require = this.require || (function(value) {
    return eval(value);
  });

  Collection = (function(superClass) {
    extend(Collection, superClass);

    function Collection(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Collection.prototype.all = function() {
      return this.model.select((function(_this) {
        return function(rec) {
          return _this.associated(rec);
        };
      })(this));
    };

    Collection.prototype.first = function() {
      return this.all()[0];
    };

    Collection.prototype.last = function() {
      var values;
      values = this.all();
      return values[values.length - 1];
    };

    Collection.prototype.count = function() {
      return this.all().length;
    };

    Collection.prototype.find = function(id) {
      var records;
      records = this.select((function(_this) {
        return function(rec) {
          return ("" + rec.id) === ("" + id);
        };
      })(this));
      if (!records[0]) {
        throw new Error("\"" + this.model.className + "\" model could not find a record for the ID \"" + id + "\"");
      }
      return records[0];
    };

    Collection.prototype.findAllByAttribute = function(name, value) {
      return this.model.select((function(_this) {
        return function(rec) {
          return _this.associated(rec) && rec[name] === value;
        };
      })(this));
    };

    Collection.prototype.findByAttribute = function(name, value) {
      return this.findAllByAttribute(name, value)[0];
    };

    Collection.prototype.select = function(cb) {
      return this.model.select((function(_this) {
        return function(rec) {
          return _this.associated(rec) && cb(rec);
        };
      })(this));
    };

    Collection.prototype.refresh = function(values) {
      var i, j, k, l, len, len1, len2, match, record, ref, ref1;
      if (values == null) {
        return this;
      }
      ref = this.all();
      for (j = 0, len = ref.length; j < len; j++) {
        record = ref[j];
        delete this.model.irecords[record.id];
        ref1 = this.model.records;
        for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
          match = ref1[i];
          if (!(match.id === record.id)) {
            continue;
          }
          this.model.records.splice(i, 1);
          break;
        }
      }
      if (!isArray(values)) {
        values = [values];
      }
      for (l = 0, len2 = values.length; l < len2; l++) {
        record = values[l];
        record.newRecord = false;
        record[this.fkey] = this.record.id;
      }
      this.model.refresh(values);
      return this;
    };

    Collection.prototype.create = function(record, options) {
      record[this.fkey] = this.record.id;
      return this.model.create(record, options);
    };

    Collection.prototype.add = function(record, options) {
      return record.updateAttribute(this.fkey, this.record.id, options);
    };

    Collection.prototype.remove = function(record, options) {
      return record.updateAttribute(this.fkey, null, options);
    };

    Collection.prototype.associated = function(record) {
      return record[this.fkey] === this.record.id;
    };

    return Collection;

  })(Spine.Module);

  Instance = (function(superClass) {
    extend(Instance, superClass);

    function Instance(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Instance.prototype.exists = function() {
      if (this.record[this.fkey]) {
        return this.model.exists(this.record[this.fkey]);
      } else {
        return false;
      }
    };

    Instance.prototype.update = function(value) {
      if (value == null) {
        return this;
      }
      if (!(value instanceof this.model)) {
        value = new this.model(value);
      }
      if (value.isNew()) {
        value.save();
      }
      this.record[this.fkey] = value && value.id;
      return this;
    };

    return Instance;

  })(Spine.Module);

  Singleton = (function(superClass) {
    extend(Singleton, superClass);

    function Singleton(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Singleton.prototype.find = function() {
      return this.record.id && this.model.findByAttribute(this.fkey, this.record.id);
    };

    Singleton.prototype.update = function(value) {
      if (value == null) {
        return this;
      }
      if (!(value instanceof this.model)) {
        value = this.model.fromJSON(value);
      }
      value[this.fkey] = this.record.id;
      value.save();
      return this;
    };

    return Singleton;

  })(Spine.Module);

  singularize = function(str) {
    return str.replace(/s$/, '');
  };

  underscore = function(str) {
    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/-/g, '_').toLowerCase();
  };

  association = function(name, model, record, fkey, Ctor) {
    if (typeof model === 'string') {
      model = require(model);
    }
    return new Ctor({
      name: name,
      model: model,
      record: record,
      fkey: fkey
    });
  };

  Spine.Model.extend({
    hasMany: function(name, model, fkey) {
      if (fkey == null) {
        fkey = (underscore(this.className)) + "_id";
      }
      return this.prototype[name] = function(value) {
        return association(name, model, this, fkey, Collection).refresh(value);
      };
    },
    belongsTo: function(name, model, fkey) {
      if (fkey == null) {
        fkey = (underscore(singularize(name))) + "_id";
      }
      this.prototype[name] = function(value) {
        return association(name, model, this, fkey, Instance).update(value).exists();
      };
      return this.attributes.push(fkey);
    },
    hasOne: function(name, model, fkey) {
      if (fkey == null) {
        fkey = (underscore(this.className)) + "_id";
      }
      return this.prototype[name] = function(value) {
        return association(name, model, this, fkey, Singleton).update(value).find();
      };
    }
  });

  Spine.Collection = Collection;

  Spine.Singleton = Singleton;

  Spine.Instance = Instance;

}).call(this);
(function() {
  var Ajax, Model, __original__,
    slice = [].slice;

  Ajax = Spine.Ajax;

  Model = Spine.Model;

  __original__ = Spine.Ajax.generateURL;

  Spine.Ajax.generateURL = function() {
    var args, collection, object, path, scope;
    object = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (object.className) {
      collection = object.className.toLowerCase() + 's';
      scope = Ajax.getScope(object);
    } else {
      if (typeof object.constructor.url === 'string') {
        collection = object.constructor.url;
      } else if (typeof object.constructor.url === 'function') {
        collection = object.constructor.url();
      } else {
        collection = object.constructor.className.toLowerCase() + 's';
      }
      scope = Ajax.getScope(object) || Ajax.getScope(object.constructor);
    }
    args.unshift(collection);
    args.unshift(scope);
    path = args.join('/');
    path = path.replace(/(\/\/)/g, "/");
    path = path.replace(/^\/|\/$/g, "");
    if (path.indexOf("../") !== 0) {
      return Model.host + "/" + path;
    } else {
      return path;
    }
  };

}).call(this);
(function() {
  var BarcodeScanner,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BarcodeScanner = (function() {
    function BarcodeScanner() {
      this.simulateScan = bind(this.simulateScan, this);
      this.submit = bind(this.submit, this);
      this.keyPress = bind(this.keyPress, this);
      this.getArguments = bind(this.getArguments, this);
      this.getAction = bind(this.getAction, this);
      this.execute = bind(this.execute, this);
      this.addAction = bind(this.addAction, this);
      this.addChar = bind(this.addChar, this);
      this.actions = [];
      this.buffer = null;
      this.delay = 100;
      this.timer = null;
    }

    BarcodeScanner.prototype.addChar = function(char) {
      if (this.buffer == null) {
        this.buffer = "";
      }
      this.buffer += char;
      window.clearTimeout(this.timer);
      return this.timer = window.setTimeout(((function(_this) {
        return function() {
          return _this.buffer = null;
        };
      })(this)), this.delay);
    };

    BarcodeScanner.prototype.addAction = function(string, callback) {
      var regexp;
      string = "^" + (string.replace(/\(.*?\)/ig, "(\\S*)")) + "$";
      regexp = new RegExp(string);
      return this.actions.push({
        regexp: regexp,
        callback: callback
      });
    };

    BarcodeScanner.prototype.execute = function(givenString) {
      var action, code, currentVal, string, target;
      target = window.reactBarcodeScannerTarget ? window.reactBarcodeScannerTarget : $("[data-barcode-scanner-target]:last");
      string = givenString || this.buffer;
      code = _.str.trim(string);
      action = this.getAction(code);
      if (action != null) {
        action.callback.apply(target, this.getArguments(code, action));
      } else {
        currentVal = target.val() || '';
        target.val(currentVal + code);
        this.submit(target);
      }
      return this.buffer = null;
    };

    BarcodeScanner.prototype.getAction = function(code) {
      var action, i, len, ref;
      ref = this.actions;
      for (i = 0, len = ref.length; i < len; i++) {
        action = ref[i];
        if (action.regexp.test(code)) {
          return action;
        }
      }
    };

    BarcodeScanner.prototype.getArguments = function(code, action) {
      var matches;
      matches = action.regexp.exec(code);
      return matches.slice(1, +matches.length + 1 || 9e9);
    };

    BarcodeScanner.prototype.keyPress = function(e) {
      var char, charCode, targetType;
      if (e == null) {
        e = window.event;
      }
      targetType = e.target.nodeName;
      if (targetType === 'INPUT' || targetType === 'TEXTAREA') {
        return;
      }
      charCode = typeof e.which === "number" ? e.which : e.keyCode;
      char = String.fromCharCode(charCode);
      if ((charCode === 13) && (this.buffer != null)) {
        e.preventDefault();
        return this.execute();
      } else {
        return this.addChar(char);
      }
    };

    BarcodeScanner.prototype.submit = function(target) {
      var input;
      input = _.isFunction(target.closest) ? target : $(ReactDOM.findDOMNode(target));
      if (input.closest("form").find("[data-barcode-scanner-submit-button]").length) {
        return input.closest("form").find("[data-barcode-scanner-submit-button]").click();
      } else if (!input.closest("[data-prevent-barcode-scanner-submit]").length) {
        return input.closest("form").submit();
      }
    };

    BarcodeScanner.prototype.simulateScan = function(str) {
      if (!(_.isString(str) && !_.isEmpty(str))) {
        throw new Error("`simulateScan` needs to be called with a string!");
      }
      this.buffer = null;
      return this.execute(str);
    };

    return BarcodeScanner;

  })();

  window.BarcodeScanner = new BarcodeScanner();

  $(window).keypress(window.BarcodeScanner.keyPress);

}).call(this);
(function() {
  var BookingCalendar, df,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BookingCalendar = (function() {
    BookingCalendar.sessionStorage = false;

    BookingCalendar.local = {
      dateFormat: i18n.date.L,
      firstDay: i18n.days.first,
      buttonText: {
        today: i18n.today,
        month: i18n.month,
        week: i18n.week,
        day: i18n.day
      },
      monthNames: i18n.months.full,
      monthNamesShort: i18n.months.trunc,
      dayNames: i18n.days.full,
      dayNamesShort: i18n.days.trunc
    };

    function BookingCalendar(options) {
      this.setup = bind(this.setup, this);
      this.setupPartitionSelector = bind(this.setupPartitionSelector, this);
      this.getHolidays = bind(this.getHolidays, this);
      this.setQuantityText = bind(this.setQuantityText, this);
      this.setDayElement = bind(this.setDayElement, this);
      this.getInventoryPool = bind(this.getInventoryPool, this);
      this.getGroupIds = bind(this.getGroupIds, this);
      this.getAvailability = bind(this.getAvailability, this);
      this.setupDayCells = bind(this.setupDayCells, this);
      this.getElementByDate = bind(this.getElementByDate, this);
      this.getDateByElement = bind(this.getDateByElement, this);
      this.setAvailability = bind(this.setAvailability, this);
      this.setSelected = bind(this.setSelected, this);
      this.resetCalendarView = bind(this.resetCalendarView, this);
      this.resetDay = bind(this.resetDay, this);
      this.setTails = bind(this.setTails, this);
      this.toggleGoBack = bind(this.toggleGoBack, this);
      this.holidaysBetween = bind(this.holidaysBetween, this);
      this.setHolidays = bind(this.setHolidays, this);
      this.setOtherMonth = bind(this.setOtherMonth, this);
      this.isClosedDay = bind(this.isClosedDay, this);
      this.validation = bind(this.validation, this);
      this.setClosedDay = bind(this.setClosedDay, this);
      this.renderFunction = bind(this.renderFunction, this);
      this.render = bind(this.render, this);
      this.setupFirstView = bind(this.setupFirstView, this);
      this.goToDate = bind(this.goToDate, this);
      this.setupDateJumper = bind(this.setupDateJumper, this);
      this.resetQuantity = bind(this.resetQuantity, this);
      this.validateQuantity = bind(this.validateQuantity, this);
      this.decreaseQuantity = bind(this.decreaseQuantity, this);
      this.increaseQuantity = bind(this.increaseQuantity, this);
      this.setupQuantity = bind(this.setupQuantity, this);
      this.setMaxQuantity = bind(this.setMaxQuantity, this);
      this.setupCalendarNavigation = bind(this.setupCalendarNavigation, this);
      this.setupFullcalendar = bind(this.setupFullcalendar, this);
      this.validateDateLogic = bind(this.validateDateLogic, this);
      this.resetDate = bind(this.resetDate, this);
      this.validateDate = bind(this.validateDate, this);
      this.decreaseDate = bind(this.decreaseDate, this);
      this.increaseDate = bind(this.increaseDate, this);
      this.setupDates = bind(this.setupDates, this);
      this.formatDates = bind(this.formatDates, this);
      this.setupFromSessionStorage = bind(this.setupFromSessionStorage, this);
      if (options == null) {
        options = {};
      }
      this.fullcalendar = options.calendarEl != null ? options.calendarEl : $("#fullcalendar");
      this.el = options.el != null ? options.el : this.fullcalendar.closest("form");
      if (options.withoutQuantity) {
        this.el.find(".quantity").remove();
      }
      this.quantity_el = options.quantityEl != null ? options.quantityEl : this.el.find(".quantity input");
      this.startDate_el = options.startDateEl != null ? options.startDateEl : this.el.find("#start_date");
      this.endDate_el = options.endDateEl != null ? options.endDateEl : this.el.find("#end_date");
      this.limitMaxQuantity = options.limitMaxQuantity != null ? options.limitMaxQuantity : true;
      this.groupIds = options.groupIds;
      this.availability = options.availability;
      this.renderFunctionCallback = options.renderFunctionCallback;
      this.setup(options);
      if (BookingCalendar.sessionStorage) {
        this.setupFromSessionStorage();
      }
      this.formatDates();
      this.setupDates();
      this.setupQuantity();
      this.setupDateJumper();
      this.setupFullcalendar();
      this.setupCalendarNavigation();
      this.setupFirstView();
      this.setupDayCells();
    }

    BookingCalendar.prototype.setupFromSessionStorage = function() {
      if (sessionStorage.start_date && sessionStorage.end_date) {
        this.startDate_el.val(JSON.parse(sessionStorage.start_date));
        return this.endDate_el.val(JSON.parse(sessionStorage.end_date));
      }
    };

    BookingCalendar.prototype.formatDates = function() {
      _.each([this.startDate_el, this.endDate_el], (function(_this) {
        return function(el) {
          return el.val(moment(el.val()).startOf("day").format(df));
        };
      })(this));
      return _.each([this.startDate_el, this.endDate_el], (function(_this) {
        return function(el) {
          return _this.validateDate(el);
        };
      })(this));
    };

    BookingCalendar.prototype.setupDates = function() {
      return _.each([this.startDate_el, this.endDate_el], (function(_this) {
        return function(el) {
          return el.bind("change", function(e) {
            if (_this.validateDate(el)) {
              return _this.render();
            } else {
              return _this.resetDate(el);
            }
          });
        };
      })(this));
    };

    BookingCalendar.prototype.increaseDate = function(el) {
      return el.val(moment(el.val(), df).add(1, "days").format(df)).change();
    };

    BookingCalendar.prototype.decreaseDate = function(el) {
      return el.val(moment(el.val(), df).subtract(1, "days").format(df)).change();
    };

    BookingCalendar.prototype.validateDate = function(date_el) {
      if (date_el.val().length && moment(date_el.val(), df).format(df) === date_el.val() && moment(date_el.val(), df).year() < 9999) {
        this.validateDateLogic(date_el);
        date_el.data("date", moment(date_el.val(), df).toDate());
        return true;
      } else {
        return false;
      }
    };

    BookingCalendar.prototype.resetDate = function(date_el) {
      date_el.val(moment(date_el.data("date")).format(df)).change();
      return window.setTimeout((function() {
        return date_el.focus().select();
      }), 150);
    };

    BookingCalendar.prototype.validateDateLogic = function(date_el) {
      var dateToday, endDate, startDate;
      dateToday = moment().startOf("day").toDate();
      startDate = moment(this.startDate_el.val(), df);
      endDate = moment(this.endDate_el.val(), df);
      if (startDate < dateToday && this.startDate_el.is(":not(:disabled)")) {
        this.startDate_el.val(moment(dateToday).format(df)).change();
      }
      if (endDate < startDate) {
        if (date_el === this.endDate_el) {
          return this.startDate_el.val(moment(endDate).format(df)).change();
        } else if (date_el === this.startDate_el) {
          return this.endDate_el.val(moment(startDate).format(df)).change();
        } else {
          return this.endDate_el.val(moment(startDate).format(df)).change();
        }
      }
    };

    BookingCalendar.prototype.setupFullcalendar = function() {
      this.fullcalendar.html("");
      return this.fullcalendar.fullCalendar({
        viewDisplay: this.renderFunction,
        header: {
          left: "title",
          right: "today prev next"
        },
        firstDay: BookingCalendar.local.firstDay,
        buttonText: BookingCalendar.local.buttonText,
        monthNames: BookingCalendar.local.monthNames,
        monthNamesShort: BookingCalendar.local.monthNamesShort,
        dayNames: BookingCalendar.local.dayNames,
        dayNamesShort: BookingCalendar.local.dayNamesShort
      });
    };

    BookingCalendar.prototype.setupCalendarNavigation = function() {
      this.fullcalendar.find(".fc-button-next .fc-button-content").html("<span class='fa fa-chevron-right'></span>");
      return this.fullcalendar.find(".fc-button-prev .fc-button-content").html("<span class='fa fa-chevron-left'></span>");
    };

    BookingCalendar.prototype.setMaxQuantity = function(quantity) {
      if (this.limitMaxQuantity) {
        return this.quantity_el.attr("max", quantity);
      }
    };

    BookingCalendar.prototype.setupQuantity = function() {
      if (this.quantity_el.val().length) {
        if (!this.limitMaxQuantity) {
          this.quantity_el.removeAttr("max");
        }
        this.quantity_el.click((function(_this) {
          return function(e) {
            return e.currentTarget.select();
          };
        })(this));
        this.quantity_el.bind("keyup", (function(_this) {
          return function(e) {
            if (e.keyCode === 38) {
              _this.increaseQuantity();
            }
            if (e.keyCode === 40) {
              _this.decreaseQuantity();
            }
            if (!_this.validateQuantity()) {
              _this.resetQuantity();
            }
            return $(e.currentTarget).change();
          };
        })(this));
        return this.quantity_el.bind("change", (function(_this) {
          return function(e) {
            if (_this.validateQuantity()) {
              return _this.render();
            } else {
              return _this.resetQuantity();
            }
          };
        })(this));
      } else {
        return this.quantity_el.prop("disabled", true);
      }
    };

    BookingCalendar.prototype.increaseQuantity = function() {
      return this.quantity_el.val(parseInt(this.quantity_el.val()) + 1).change();
    };

    BookingCalendar.prototype.decreaseQuantity = function() {
      return this.quantity_el.val(parseInt(this.quantity_el.val()) - 1).change();
    };

    BookingCalendar.prototype.validateQuantity = function() {
      var max, min, value;
      if (this.quantity_el.val().match(/\D/)) {
        return false;
      }
      value = parseInt(this.quantity_el.val());
      max = this.quantity_el.attr("max");
      min = this.quantity_el.attr("min");
      if (value <= 0 || isNaN(value)) {
        return false;
      } else if ((max != null) && value > max || value < min) {
        return false;
      } else {
        this.quantity_el.data("last_value", this.quantity_el.val());
        return true;
      }
    };

    BookingCalendar.prototype.resetQuantity = function() {
      if (parseInt(this.quantity_el.val()) > this.quantity_el.attr("max")) {
        this.quantity_el.val(this.quantity_el.attr("max"));
      } else if (this.quantity_el.data("last_value") != null) {
        this.quantity_el.val(this.quantity_el.data("last_value"));
      }
      return this.quantity_el.select();
    };

    BookingCalendar.prototype.setupDateJumper = function() {
      if (this.startDate_el.is(":disabled")) {
        this.el.find("#jump-to-start-date").hide();
      } else {
        this.el.find("#jump-to-start-date").click((function(_this) {
          return function() {
            return _this.goToDate(moment(_this.startDate_el.val(), df));
          };
        })(this));
      }
      return this.el.find("#jump-to-end-date").click((function(_this) {
        return function() {
          return _this.goToDate(moment(_this.endDate_el.val(), df));
        };
      })(this));
    };

    BookingCalendar.prototype.goToDate = function(date) {
      var fullcalendar_date;
      if (date.diff(moment(), "days") < 0) {
        date = moment();
      }
      fullcalendar_date = moment(this.fullcalendar.fullCalendar("getDate"));
      if (date.month() !== fullcalendar_date.month() || date.year() !== fullcalendar_date.year()) {
        return this.fullcalendar.fullCalendar("gotoDate", date.toDate());
      }
    };

    BookingCalendar.prototype.setupFirstView = function() {
      if (this.startDate_el.is(":disabled")) {
        return this.goToDate(moment(this.endDate_el.val(), df));
      } else {
        return this.goToDate(moment(this.startDate_el.val(), df));
      }
    };

    BookingCalendar.prototype.render = function() {
      return this.fullcalendar.fullCalendar("render");
    };

    BookingCalendar.prototype.renderFunction = function(view) {
      var holidaysInView;
      holidaysInView = this.holidaysBetween(this.getHolidays(), view.visStart, view.visEnd);
      this.resetCalendarView();
      this.setTails();
      this.toggleGoBack();
      this.setOtherMonth();
      this.firstRenderDone = true;
      _.each(this.fullcalendar.find(".fc-widget-content"), (function(_this) {
        return function(dayElement) {
          var available, availableInTotal, availableQuantity, date, holidays, totalQuantity;
          available = true;
          availableInTotal = true;
          availableQuantity = void 0;
          totalQuantity = void 0;
          dayElement = $(dayElement);
          date = _this.getDateByElement(dayElement);
          holidays = _this.holidaysBetween(holidaysInView, date, date);
          _this.resetDay(dayElement);
          dayElement.attr("data-date", moment(date).format("YYYY-MM-DD"));
          if (date < moment().startOf("day").toDate()) {
            return dayElement.addClass("history");
          } else {
            if (holidays.length) {
              _this.setHolidays(dayElement, holidays);
            }
            _this.setDayElement(date, dayElement, holidays);
            return _this.setClosedDay(date, dayElement);
          }
        };
      })(this));
      if (this.renderFunctionCallback != null) {
        return this.renderFunctionCallback();
      }
    };

    BookingCalendar.prototype.setClosedDay = function(date, dayElement) {
      if (this.isClosedDay(date)) {
        return dayElement.addClass("closed");
      }
    };

    BookingCalendar.prototype.validation = function() {
      return this.el.trigger("validation-alert");
    };

    BookingCalendar.prototype.isClosedDay = function(date) {
      return this.getInventoryPool().isClosedOn(moment(date));
    };

    BookingCalendar.prototype.setOtherMonth = function() {
      var date, dayElement, j, len, ref, results;
      ref = this.fullcalendar.find(".fc-other-month");
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        dayElement = ref[j];
        date = this.getDateByElement(dayElement);
        dayElement = $(dayElement);
        if (dayElement.find(".fc-day-content .other_month").length === 0) {
          dayElement.find(".fc-day-content").append("<span class='other_month'></span>");
        }
        results.push(dayElement.find(".fc-day-content .other_month").text(BookingCalendar.local.monthNamesShort[date.getMonth()]));
      }
      return results;
    };

    BookingCalendar.prototype.setHolidays = function(dayElement, holidays) {
      var holiday, j, len, results;
      dayElement.addClass("holiday");
      if (dayElement.find(".fc-day-content .holidays").length === 0) {
        dayElement.find(".fc-day-content").append("<span class='holidays'></span>");
      }
      results = [];
      for (j = 0, len = holidays.length; j < len; j++) {
        holiday = holidays[j];
        results.push(dayElement.find(".fc-day-content .holidays").append("<span class='entry' title='" + holiday.name + "'>" + holiday.name + "</span>"));
      }
      return results;
    };

    BookingCalendar.prototype.holidaysBetween = function(holidays, startDate, endDate) {
      return _.filter(holidays, function(holiday) {
        var holidayEndDate, holidayStartDate;
        holidayStartDate = moment(holiday.start_date).toDate();
        holidayEndDate = moment(holiday.end_date).toDate();
        return holidayStartDate <= startDate && endDate <= holidayEndDate || (startDate <= holidayStartDate && holidayStartDate <= endDate) || (startDate <= holidayEndDate && holidayEndDate <= endDate);
      });
    };

    BookingCalendar.prototype.toggleGoBack = function() {
      if (this.fullcalendar.fullCalendar("getDate") <= new Date()) {
        return this.fullcalendar.find(".fc-button-prev").addClass("fc-state-disabled");
      } else {
        return this.fullcalendar.find(".fc-button-prev").removeClass("fc-state-disabled");
      }
    };

    BookingCalendar.prototype.setTails = function() {
      var set, visibleEndDate_el, visibleStartDate_el;
      set = (function(_this) {
        return function(dayElement, el_class, tailId) {
          dayElement.addClass(el_class);
          _this.el.find(tailId).remove();
          dayElement.children("div").append("<div id='" + tailId + "' class='calendar-tail'></div>");
          return dayElement.find("#" + tailId).show();
        };
      })(this);
      visibleStartDate_el = this.getElementByDate(moment(this.startDate_el.val(), df).toDate());
      visibleEndDate_el = this.getElementByDate(moment(this.endDate_el.val(), df).toDate());
      if (visibleStartDate_el != null) {
        set($(visibleStartDate_el), "start-date", "calendar-tail-left");
      }
      if (visibleEndDate_el != null) {
        return set($(visibleEndDate_el), "end-date", "calendar-tail-right");
      }
    };

    BookingCalendar.prototype.resetDay = function(dayElement) {
      dayElement.removeClass("selected");
      dayElement.removeClass("history");
      dayElement.removeClass("holiday");
      dayElement.find(".fc-day-content > div").text("");
      dayElement.find(".holidays").text("");
      return dayElement.find(".total_quantity").text("");
    };

    BookingCalendar.prototype.resetCalendarView = function() {
      this.fullcalendar.find(".calendar-tail").remove();
      this.fullcalendar.find(".other_month").text("");
      this.fullcalendar.find(".closed").removeClass("closed");
      this.fullcalendar.find(".start-date").removeClass("start-date");
      return this.fullcalendar.find(".end-date").removeClass("end-date");
    };

    BookingCalendar.prototype.setSelected = function(dayElement, date) {
      var endDate, startDate;
      startDate = moment(this.startDate_el.val(), df).startOf("day").toDate();
      endDate = moment(this.endDate_el.val(), df).startOf("day").toDate();
      if (date >= startDate && date <= endDate) {
        dayElement.addClass("selected");
      } else {
        dayElement.removeClass("selected");
      }
      return this.validation();
    };

    BookingCalendar.prototype.setAvailability = function(dayElement, available) {
      if (available) {
        return dayElement.removeClass("unavailable").addClass("available");
      } else {
        return dayElement.removeClass("available").addClass("unavailable");
      }
    };

    BookingCalendar.prototype.getDateByElement = function(el) {
      return this.fullcalendar.fullCalendar("getView").cellToDate({
        col: $(el).index(),
        row: $(el).parent().index()
      });
    };

    BookingCalendar.prototype.getElementByDate = function(date) {
      var cell, row, view;
      view = this.fullcalendar.fullCalendar("getView");
      if ((view.visStart <= date && date <= view.visEnd)) {
        cell = view.dateToCell(date);
        row = this.fullcalendar.find(".fc-view > table > tbody > tr")[cell.row];
        return $(row).find("td")[cell.col];
      } else {
        return false;
      }
    };

    BookingCalendar.prototype.setupDayCells = function() {
      var resetSelection;
      resetSelection = (function(_this) {
        return function() {
          var j, len, ref, results, target;
          ref = _this.fullcalendar.find(".selected_for_target_selection");
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            target = ref[j];
            target = $(target);
            target.removeClass("selected_for_target_selection");
            if (target.data("tooltipster") && !target.data("tooltipster").hasClass("tooltipster-dying")) {
              results.push(target.tooltipster("enable").tooltipster("destroy"));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this);
      $(window).on("click", (function(_this) {
        return function(e) {
          if (!$(e.target).closest(".target-selection").length) {
            return resetSelection();
          }
        };
      })(this));
      return this.fullcalendar.on("click", ".fc-widget-content", (function(_this) {
        return function(e) {
          var date, target;
          $.each($.tooltipster.instances(), function(i, instance) {
            return instance.close();
          });
          date = _this.getDateByElement(e.currentTarget);
          target = $(e.currentTarget);
          if (moment(date).startOf("day").diff(moment().startOf("day"), "days") < 0) {
            resetSelection();
          } else if (_this.startDate_el.is(":disabled")) {
            _this.endDate_el.val(moment(date).format(df)).change();
          } else {
            resetSelection();
            target.addClass("selected_for_target_selection");
            new App.Tooltip({
              el: target,
              content: App.Render("views/booking_calendar/target-selection"),
              interactive: true,
              delay: 0,
              trigger: 'click'
            });
            target.tooltipster("open", function(instance, helper) {
              return $(helper.tooltip).one("click", "button", function(e) {
                resetSelection();
                if ($(e.currentTarget).is("#set-start-date")) {
                  _this.startDate_el.val(moment(date).format(df)).change();
                } else if ($(e.currentTarget).is("#set-end-date")) {
                  _this.endDate_el.val(moment(date).format(df)).change();
                }
                return _this.validation();
              });
            });
          }
          e.stopPropagation();
          return false;
        };
      })(this));
    };

    BookingCalendar.prototype.getAvailability = function() {};

    BookingCalendar.prototype.getGroupIds = function() {};

    BookingCalendar.prototype.getInventoryPool = function() {};

    BookingCalendar.prototype.setDayElement = function(date, dayElement, holidaysInView) {};

    BookingCalendar.prototype.setQuantityText = function(dayElement, availableQuantity, totalQuantity) {};

    BookingCalendar.prototype.getHolidays = function() {};

    BookingCalendar.prototype.setupPartitionSelector = function() {};

    BookingCalendar.prototype.setup = function() {};

    return BookingCalendar;

  })();

  window.App.BookingCalendar = BookingCalendar;

  df = BookingCalendar.local.dateFormat;

}).call(this);
(function() {
  var Button;

  Button = (function() {
    function Button() {}

    Button.disable = function(trigger) {
      var button, multibutton;
      trigger = $(trigger);
      multibutton = trigger.closest(".multibutton");
      if (multibutton.length) {
        button = multibutton.children(".button");
        multibutton.attr("autocomplete", "off").prop("disabled", true);
        multibutton.find(".dropdown-toggle").attr("autocomplete", "off").prop("disabled", true);
        multibutton.find(".dropdown").trigger("mouseleave").hide();
      } else {
        button = trigger;
      }
      button.attr("autocomplete", "off").prop("disabled", true);
      return button;
    };

    Button.enable = function(trigger) {
      var button, multibutton;
      trigger = $(trigger);
      multibutton = trigger.closest(".multibutton");
      if (multibutton.length) {
        button = multibutton.children(".button");
        multibutton.removeAttr("disabled");
        multibutton.attr("autocomplete", "off");
        multibutton.find(".dropdown-toggle").removeAttr("disabled");
      } else {
        button = trigger;
      }
      button.attr("autocomplete", "off");
      button.removeAttr("disabled");
      return button;
    };

    return Button;

  })();

  App.Button = Button;

}).call(this);

/*

App.CollapsedToggle

This script provides functionalities for toggle a collapsed container
 */

(function() {
  jQuery(function() {
    return $(document).on("click", "[data-collapsed-toggle]", function(e) {
      var target, trigger;
      trigger = $(e.currentTarget);
      target = $(trigger.data("collapsed-toggle"));
      target.toggleClass("expanded");
      return trigger.toggleClass("expanded");
    });
  });

}).call(this);

/*

App.Dropdown

This script provides functionalities for dropdowns.

It prevents that a dropdown is immediatly shown when hovered (containing delay)
It prevents that a dropdown is immediatly destroy when mouse leaves
 */

(function() {
  if (App.Dropdown == null) {
    App.Dropdown = {
      showDelay: 120,
      hideDelay: 250
    };
  }

  jQuery(function() {
    $(document).on("mouseenter", ".dropdown-holder", function(e) {
      var dropdown, holder;
      holder = $(e.currentTarget);
      dropdown = holder.find(".dropdown");
      holder.data("dropdown", dropdown);
      dropdown.data("holder", holder);
      holder.addClass("mouseover");
      return (function(holder, dropdown) {
        return setTimeout((function(_this) {
          return function() {
            if (holder.hasClass("mouseover")) {
              clearTimeout(dropdown.data("timer"));
              return dropdown.show().addClass("show");
            }
          };
        })(this), App.Dropdown.showDelay);
      })(holder, dropdown);
    });
    $(document).on("mouseenter", ".dropdown", function(e) {
      var dropdown;
      dropdown = $(e.currentTarget);
      return clearTimeout(dropdown.data("timer"));
    });
    $(document).on("mouseleave", ".dropdown", function(e) {
      var dropdown;
      dropdown = $(e.currentTarget);
      return dropdown.hide().removeClass("show");
    });
    return $(document).on("mouseleave", ".dropdown-holder", function(e) {
      var dropdown, holder;
      holder = $(e.currentTarget);
      dropdown = holder.data("dropdown");
      holder.removeClass("mouseover");
      if (dropdown != null) {
        return dropdown.data("timer", setTimeout(((function(_this) {
          return function() {
            if (!holder.hasClass("mouseover")) {
              return dropdown.hide().removeClass("show");
            }
          };
        })(this)), App.Dropdown.hideDelay));
      }
    });
  });

}).call(this);
(function() {
  var initalizeArray, setValue;

  window.App.ElementFormDataAsObject = function(el) {
    var data, datum, i, keys, len, name, ref;
    data = {};
    ref = $("<form></form>").html(el.clone()).serializeArray();
    for (i = 0, len = ref.length; i < len; i++) {
      datum = ref[i];
      name = datum.name.replace(/^\w+\[.*?\]\[.*?\]/, "");
      keys = _.compact(name.match(/(?!\[).*?(?=\])/g));
      _.reduce(keys, function(hash, key) {
        var add;
        hash[key] || (hash[key] = {});
        if (_.last(keys) === key) {
          if (Array.isArray(hash)) {
            add = {};
            add[key] = datum.value;
            hash.push(add);
          } else if (_.size(hash[key]) !== 0) {
            initalizeArray(keys, key, datum, data);
          } else {
            hash[key] = setValue(datum.value);
          }
        }
        return hash[key];
      }, data);
    }
    return data;
  };

  initalizeArray = function(keys, key, datum, data) {
    keys = keys.splice(0, keys.length - 1);
    return _.reduce(keys, function(h, k) {
      var add;
      if (_.last(keys) === k) {
        add = {};
        add[key] = datum.value;
        h[k] = [h[k], add];
      }
      return h[k];
    }, data);
  };

  setValue = function(val) {
    switch (val) {
      case "false":
        return false;
      case "true":
        return true;
      default:
        return val;
    }
  };

}).call(this);
(function() {
  window.App.Flash = (function() {
    function Flash(data, zindex) {
      var flash;
      flash = $("#flash");
      if (zindex != null) {
        flash.css("z-index", zindex);
      } else {
        flash.removeAttr("style");
      }
      flash.html(App.Render("views/flash", data));
      flash.removeClass("hidden");
    }

    Flash.reset = function() {
      return $("#flash").empty().addClass("hidden");
    };

    return Flash;

  })();

  jQuery(function() {
    return $(document).on("click", "#flash [data-remove]", (function(_this) {
      return function(e) {
        return App.Flash.reset();
      };
    })(this));
  });

}).call(this);

/*

Internationalisation

This script provides functionalities for internationalisation in JavaScript.
 */

(function() {
  var slice = [].slice;

  window.i18n.jed = new Jed({
    "domain": "leihs",
    locale_data: i18n.locale_data
  });

  window._jed = function() {
    var args, isKeyPresent, key;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    isKeyPresent = function(key) {
      return (i18n.jed.options.locale_data.leihs[key] != null) && key.length;
    };
    if (typeof args[0] === "number") {
      if ((key = args[1]) && isKeyPresent(key)) {
        return i18n.jed.translate(args[1]).ifPlural(args[0], args[2]).fetch(args[3]);
      } else {
        return key;
      }
    } else {
      if ((key = args[0]) && isKeyPresent(key)) {
        return i18n.jed.translate(args[0]).fetch(args[1]);
      } else {
        return key;
      }
    }
  };

  jQuery(function() {
    $.datepicker.setDefaults({
      closeText: i18n.close,
      prevText: '&lt;',
      nextText: '&gt;',
      currentText: i18n.today,
      monthNames: i18n.months.full,
      monthNamesShort: i18n.months.trunc,
      dayNames: i18n.days.full,
      dayNamesShort: i18n.days.trunc,
      dayNamesMin: i18n.days.trunc,
      weekHeader: 'Wo',
      dateFormat: i18n.datepicker.L,
      firstDay: i18n.days.first,
      isRTL: false,
      showMonthAfterYear: false,
      yearSuffix: ''
    });
    accounting.settings = {
      currency: {
        symbol: window.local_currency_string != null ? window.local_currency_string : "CHF",
        format: "%v %s",
        decimal: i18n.number.decimal,
        thousand: i18n.number.thousand,
        precision: 2
      },
      number: {
        precision: 0,
        decimal: i18n.number.decimal,
        thousand: i18n.number.thousand
      }
    };
    return moment.locale("default", {
      months: i18n.months.full,
      monthsShort: i18n.months.trunc,
      weekdays: i18n.days.full,
      weekdaysShort: i18n.days.trunc,
      longDateFormat: {
        LT: i18n.time,
        L: i18n.days.L,
        LL: i18n.date.XL,
        LLL: i18n.date.XXL,
        LLLL: i18n.date.XXXL
      },
      meridiem: {
        AM: i18n.meridiem.AM,
        am: i18n.meridiem.am,
        PM: i18n.meridiem.PM,
        pm: i18n.meridiem.pm
      },
      calendar: {
        sameDay: i18n.calendar.sameDay,
        sameElse: i18n.calendar.sameElse,
        nextDay: i18n.calendar.nextDay,
        nextWeek: i18n.calendar.nextWeek,
        lastDay: i18n.calendar.lastDay,
        lastWeek: i18n.calendar.lastWeek
      },
      relativeTime: {
        future: i18n.relative.future,
        past: i18n.relative.past,
        s: i18n.relative.s,
        m: i18n.relative.m,
        mm: i18n.relative.mm,
        h: i18n.relative.h,
        hh: i18n.relative.hh,
        d: i18n.relative.d,
        dd: i18n.relative.dd,
        M: i18n.relative.M,
        MM: i18n.relative.MM,
        y: i18n.relative.y,
        yy: i18n.relative.yy
      },
      ordinal: function(number) {
        return ".";
      }
    });
  });

}).call(this);

/*

App.Modal

This script provides functionalities for display modal dialogs.

It also keeps track of existing dialogs to avoid multiple instances of the same dialog in the dom.

It also helps autofocusing fields that have the autofocus attribute.
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.App.Modal = (function() {
    Modal.all = [];

    function Modal(el, onDestroyReact) {
      this.undestroyable = bind(this.undestroyable, this);
      this.destroyable = bind(this.destroyable, this);
      this.shown = bind(this.shown, this);
      this.destroy = bind(this.destroy, this);
      this.setModalBodyMaxHeight = bind(this.setModalBodyMaxHeight, this);
      var i, len, modal, ref;
      this.el = $(el);
      this.onDestroyReact = onDestroyReact;
      this.isDestroyable = true;
      this.delegateEvents();
      ref = App.Modal.all;
      for (i = 0, len = ref.length; i < len; i++) {
        modal = ref[i];
        modal.destroyable().destroy(true);
      }
      App.Modal.all.push(this);
      App.Tooltip.hideAll();
      this.el.modal({
        backdrop: true
      });
    }

    Modal.prototype.delegateEvents = function() {
      this.el.on("hidden", (function(_this) {
        return function() {
          return _this.destroy;
        };
      })(this));
      this.el.on("shown", this.shown);
      $(window).on("resize", this.setModalBodyMaxHeight);
      this.el.on("click", ".modal-close", (function(_this) {
        return function() {
          return _this.destroy(true);
        };
      })(this));
      return this.el.on("hide", (function(_this) {
        return function(e) {
          if (!_this.isDestroyable) {
            return false;
          }
        };
      })(this));
    };

    Modal.prototype.setModalBodyMaxHeight = function() {
      var height;
      height = $(window).height() - this.el.outerHeight() - ($(window).height() / 100 * 20) + this.el.find(".modal-body").height();
      if (height < 10) {
        height = 10;
      }
      return this.el.find(".modal-body").css("max-height", height);
    };

    Modal.prototype.destroy = function(removeBackdrop) {
      if (this.isDestroyable) {
        this.el.remove();
        $(window).off("resize", this.setModalBodyMaxHeight);
        if ((removeBackdrop != null) && removeBackdrop) {
          $(".modal-backdrop").remove();
        }
      }
      if (this.onDestroyReact) {
        return this.onDestroyReact(this);
      }
    };

    Modal.prototype.shown = function() {
      this.el.addClass("ui-shown");
      this.el.find("[autofocus=autofocus]").focus().select();
      return this.setModalBodyMaxHeight();
    };

    Modal.prototype.destroyable = function() {
      this.isDestroyable = true;
      return this;
    };

    Modal.prototype.undestroyable = function() {
      this.isDestroyable = false;
      return this;
    };

    Modal.destroyAll = function(removeBackdrop) {
      var i, len, modal, ref, results;
      ref = App.Modal.all;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        modal = ref[i];
        results.push(modal.destroy(removeBackdrop));
      }
      return results;
    };

    return Modal;

  })();

}).call(this);

/*

jQuery Plugin for having a preChange event triggered even when the field was not blured 

after the default waiting time or the one that is provided with options.delay
 */

(function() {
  var $,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = jQuery;

  $.extend($.fn, {
    preChange: function(options) {
      return this.each(function() {
        if ($(this).data("_delayed_change") == null) {
          return $(this).data('_delayed_change', new PreChange(this, options));
        }
      });
    }
  });

  window.PreChange = (function() {
    function PreChange(target, options) {
      this.validate = bind(this.validate, this);
      this.delay = (options != null) && (options.delay != null) ? options.delay : 500;
      this.target = target;
      this.delegateEvents();
      this;
      this.validates = 0;
      this.timeouts = 0;
    }

    PreChange.prototype.delegateEvents = function() {
      var validate;
      validate = (function(_this) {
        return function(e) {
          var target;
          target = $(e.currentTarget);
          return _this.validate(e);
        };
      })(this);
      if (typeof this.target === "string") {
        $(document).on("keydown mousedown change", this.target, validate);
        return $(document).on("keyup", this.target, this.validate);
      } else {
        $(this.target).on("keydown mousedown change", validate);
        return $(this.target).on("keyup", this.validate);
      }
    };

    PreChange.prototype.validate = function(e) {
      var target;
      target = $(e.currentTarget);
      if (target.data("lastValue") == null) {
        target.data("lastValue", target.val());
      }
      if (e.type === "change") {
        target.data("lastValue", "");
      }
      if (target.data("timeout") != null) {
        clearTimeout(target.data("timeout"));
        target.data("timeout", null);
      }
      return target.data("timeout", setTimeout((function(_this) {
        return function() {
          if (target.data("lastValue") !== target.val()) {
            target.trigger("preChange");
          }
          target.data("lastValue", target.val());
          return target.data("timeout", null);
        };
      })(this), this.delay));
    };

    return PreChange;

  })();

}).call(this);

/*

  Redirect on unauthorized

  redirect the browser when a ajax request returns an error (401 / unauthorized)
 */

(function() {
  jQuery(function() {
    return $(document).on("ajaxError", function(e, xhr) {
      if (xhr.status === 401) {
        return window.location = "/";
      }
    });
  });

}).call(this);

/*

App.Render

This script provides functionalities for rendering.

It is also usefull for abstract the api for rendering things on the client
e.g. in the case of changing the render engine.
 */

(function() {
  window.App.Render = (function() {
    Render.defaultPath = "";

    function Render(template, data, options) {
      if (typeof options === "string") {
        options = JSON.parse(options);
      }
      return $.views.render["" + App.Render.defaultPath + template](data, options);
    }

    Render.path = function(template) {
      return "" + App.Render.defaultPath + template;
    };

    return Render;

  })();

}).call(this);
(function() {
  $(document).on("click", "[data-tab-toggle]", function() {
    var tab, tabTarget, uri;
    tab = $(this);
    $(".active[data-tab-toggle]").removeClass("active");
    tab.addClass("active");
    $(".active[data-tab-target]").removeClass("active");
    tabTarget = $("[data-tab-target=" + (tab.data("tab-toggle")) + "]");
    tabTarget.addClass("active");
    tabTarget.trigger("tab-changed", tab.data("tab-toggle"));
    uri = URI(window.location.href).removeQuery("tab").addQuery("tab", tab.data("tab-toggle"));
    return window.history.replaceState(uri._parts, document.title, uri.toString());
  });

}).call(this);

/*

App.Tooltip

This script provides functionalities for tooltips.

Either use the title tag in an element with the class "tooltip"
or create an Tooltip with new App.Tooltio(options).
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  App.Tooltip = (function() {
    Tooltip.origins = [];

    Tooltip.interactive = true;

    function Tooltip(options) {
      this.show = bind(this.show, this);
      this.reposition = bind(this.reposition, this);
      this.update = bind(this.update, this);
      this.enable = bind(this.enable, this);
      this.disable = bind(this.disable, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      var escHandler, target;
      this.target = $(options.el).tooltipster({
        animation: 'fade',
        arrow: true,
        content: options.content,
        delay: options.delay != null ? options.delay : 150,
        fixedWidth: 0,
        maxWidth: 0,
        interactive: options.interactive != null ? options.interactive : App.Tooltip.interactive,
        interactiveTolerance: 500,
        multiple: false,
        position: 'top',
        speed: 150,
        timer: 0,
        touchDevices: true,
        trigger: options.trigger != null ? options.trigger : 'hover',
        updateAnimation: true,
        trackTooltip: options.trackTooltip != null ? options.trackTooltip : false,
        updateAnimation: false,
        contentAsHTML: true,
        theme: 'tooltipster-default',
        distance: 0,
        functionAfter: function() {
          return document.removeEventListener("keydown", escHandler);
        }
      });
      if (options.content != null) {
        this.content = options.content;
        this.target.tooltipster("show");
      }
      target = this.target;
      escHandler = (function(_this) {
        return function(e) {
          if (e.key === "Escape") {
            return target.tooltipster("close");
          }
        };
      })(this);
      document.addEventListener("keydown", escHandler);
    }

    Tooltip.prototype.delegateEvents = function(tooltip) {
      return tooltip.find("img").load(this.reposition);
    };

    Tooltip.prototype.disable = function() {
      return this.target.tooltipster("disable");
    };

    Tooltip.prototype.enable = function() {
      return this.target.tooltipster("enable");
    };

    Tooltip.prototype.update = function(content) {
      this.content = content;
      return this.target.tooltipster("content", content);
    };

    Tooltip.prototype.reposition = function() {
      return this.target.tooltipster("reposition");
    };

    Tooltip.prototype.show = function() {
      return this.target.tooltipster("open");
    };

    Tooltip.destroyAll = function() {
      var i, len, ref, results, tooltip;
      ref = $(".tooltipster-base:not(.tooltipster-dying)");
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        tooltip = ref[i];
        tooltip = $(tooltip);
        if (tooltip.data("origin") != null) {
          results.push(tooltip.data("origin").tooltipster("destroy"));
        } else {
          results.push(tooltip.remove());
        }
      }
      return results;
    };

    Tooltip.hideAll = function() {
      var i, len, ref, results, tooltip;
      ref = $(".tooltipster-base:not(.tooltipster-dying)");
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        tooltip = ref[i];
        tooltip = $(tooltip);
        if (tooltip.data("origin") != null) {
          results.push(tooltip.data("origin").tooltipster("hide"));
        } else {
          results.push(tooltip.hide());
        }
      }
      return results;
    };

    return Tooltip;

  })();

  window.App.Tooltip = App.Tooltip;

  jQuery(function() {
    return $(document).on("mouseenter", ".tooltip[title], .tooltip[data-tooltip-data]", function(e) {
      var content, target, template;
      template = $(this).data("tooltip-template") != null ? $(this).data("tooltip-template") : "views/tooltips/default";
      if (($(this).attr("title") != null) && ($(this).data("tooltip-data") == null)) {
        $(this).data("tooltip-data", $(this).attr("title"));
      }
      $(this).removeAttr("title");
      content = $(this).data("tooltip-data");
      target = $(this).closest(".line-col").length ? $(this).closest(".line-col") : $(this);
      return new App.Tooltip({
        el: target,
        content: App.Render(template, {
          content: content
        })
      });
    });
  });

}).call(this);

/*

App.TopBarSearchItem

This script provides functionalities for the interactivity with the topbar search item.
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.App.TopBarSearchItem = (function() {
    function TopBarSearchItem(options) {
      this.submit = bind(this.submit, this);
      this.clickOnSubmit = bind(this.clickOnSubmit, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      this.el = options.el;
      this.input = this.el.find("input[type='text']");
      this.delegateEvents();
    }

    TopBarSearchItem.prototype.delegateEvents = function() {
      this.input.on("focus", (function(_this) {
        return function() {
          return _this.el.addClass("active");
        };
      })(this));
      this.input.on("blur", (function(_this) {
        return function() {
          return _this.blurTimeout = setTimeout((function() {
            return _this.el.removeClass("active");
          }), 100);
        };
      })(this));
      this.el.on("click", "[type='submit']", this.clickOnSubmit);
      return this.el.on("submit", this.submit);
    };

    TopBarSearchItem.prototype.clickOnSubmit = function() {
      if (this.blurTimeout != null) {
        clearTimeout(this.blurTimeout);
      }
      this.el.addClass("active");
      return this.input.focus();
    };

    TopBarSearchItem.prototype.submit = function(e) {
      if (!this.input.val().length) {
        return e.preventDefault();
      }
    };

    return TopBarSearchItem;

  })();

}).call(this);
(function() {
  window.App.Modules.FindOrBuild = {
    findOrBuild: function(data) {
      var record;
      record = this.exists(data.id);
      if (record) {
        _.each(Object.keys(data), (function(_this) {
          return function(key) {
            if (!record[key]) {
              return record[key] = data[key];
            }
          };
        })(this));
      } else {
        record = new this(data);
      }
      return record;
    }
  };

}).call(this);
(function() {
  App.Modules.HasLines = {
    getMaxDate: function() {
      var i, len, max_date, max_dates, ref, reservation;
      max_dates = [];
      ref = this.reservations().all();
      for (i = 0, len = ref.length; i < len; i++) {
        reservation = ref[i];
        max_dates.push(moment(reservation.end_date).toDate());
      }
      max_date = max_dates.reduce(function(a, b) {
        return Math.max(a, b);
      });
      return new Date(max_date);
    },
    getMaxRange: function() {
      var i, len, max_ranges, ref, reservation;
      if (this.reservations().all().length === 0) {
        return 0;
      }
      max_ranges = [];
      ref = this.reservations().all();
      for (i = 0, len = ref.length; i < len; i++) {
        reservation = ref[i];
        max_ranges.push(moment(reservation.end_date).endOf("day").diff(moment(reservation.start_date).startOf("day"), "days"));
      }
      return 1 + max_ranges.reduce(function(a, b) {
        return Math.max(a, b);
      });
    },
    groupedLinesByDateRange: function(mergeModels) {
      if (mergeModels == null) {
        mergeModels = false;
      }
      return this.groupByDateRange(this.reservations().all(), mergeModels);
    },
    groupByDateRange: function(reservations, mergeModels, actionDate) {
      var group, hash, i, j, len, len1, name, name1, reservation, result;
      if (mergeModels == null) {
        mergeModels = false;
      }
      if (actionDate == null) {
        actionDate = false;
      }
      if (reservations.length === 0) {
        return [];
      }
      hash = {};
      for (i = 0, len = reservations.length; i < len; i++) {
        reservation = reservations[i];
        (hash[name = JSON.stringify({
          start_date: reservation.start_date,
          end_date: reservation.end_date
        })] != null ? hash[name] : hash[name] = []).push(reservation);
      }
      result = [];
      $.each(hash, function(key, value) {
        var key_obj;
        key_obj = JSON.parse(key);
        reservations = mergeModels ? App.Modules.HasLines.mergeLinesByModel(value) : value;
        reservations.sort(function(r1, r2) {
          var v1, v2;
          v1 = (r1.model().name()) + " " + r1.id;
          v2 = (r2.model().name()) + " " + r2.id;
          if (v1 < v2) {
            return -1;
          } else {
            return 1;
          }
        });
        return result.push({
          start_date: key_obj.start_date,
          end_date: key_obj.end_date,
          reservations: reservations
        });
      });
      result.sort(function(a, b) {
        if (moment(a.start_date).toDate() < moment(b.start_date).toDate()) {
          return false;
        } else if (moment(a.start_date).startOf("day").diff(moment(b.start_date).startOf("day"), "days") === 0) {
          if (moment(a.end_date).toDate() < moment(b.end_date).toDate()) {
            return false;
          } else if (moment(a.end_date).startOf("day").diff(moment(b.end_date).startOf("day"), "days") === 0) {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      });
      if (actionDate) {
        hash = {};
        for (j = 0, len1 = result.length; j < len1; j++) {
          group = result[j];
          (hash[name1 = JSON.stringify({
            date: group[actionDate]
          })] != null ? hash[name1] : hash[name1] = []).push(group);
        }
        result = [];
        $.each(hash, function(key, value) {
          var key_obj;
          key_obj = JSON.parse(key);
          return result.push({
            date: key_obj.date,
            groups: value
          });
        });
        result = _.sortBy(result, function(el) {
          return el.date;
        });
      }
      return result;
    },
    groupByDateAndPool: function(reservations, mergeModels) {
      var k, merge, result, v;
      if (mergeModels == null) {
        mergeModels = false;
      }
      merge = _.groupBy(reservations, function(l) {
        return JSON.stringify({
          start_date: l.start_date,
          inventory_pool_id: l.inventory_pool_id
        });
      });
      for (k in merge) {
        v = merge[k];
        merge[k] = _.chain(v).sortBy(function(l) {
          return l.model().name();
        }).groupBy(function(l) {
          return JSON.stringify({
            model_id: l.model_id,
            end_date: l.end_date
          });
        }).value();
        merge[k] = _(merge[k]).values().map(function(reservations) {
          return {
            reservations: mergeModels ? App.Modules.HasLines.mergeLinesByModel(reservations) : reservations
          };
        });
      }
      result = [];
      for (k in merge) {
        v = merge[k];
        result.push({
          inventory_pool: App.InventoryPool.find(JSON.parse(k).inventory_pool_id),
          start_date: JSON.parse(k).start_date,
          groups: v
        });
      }
      result = _.sortBy(result, function(e) {
        return e.start_date;
      });
      return result;
    },
    mergedLinesByModel: function() {
      return this.mergeLinesByModel(this.reservations().all());
    },
    mergeLinesByModel: function(reservations) {
      var result;
      result = [];
      _.each(reservations, (function(_this) {
        return function(reservation) {
          var existingLine;
          reservation = $.extend(true, {}, reservation);
          reservation.ids = [reservation.id];
          if (reservation.model_id != null) {
            existingLine = _.find(result, function(l) {
              return l.model_id === reservation.model_id;
            });
          }
          if (existingLine != null) {
            if (existingLine.subreservations == null) {
              existingLine.subreservations = [existingLine];
            }
            existingLine.subreservations.push(reservation);
            return existingLine.ids.push(reservation.id);
          } else {
            return result.push(reservation);
          }
        };
      })(this));
      return result;
    }
  };

}).call(this);
(function() {
  App.Modules.InlineEntryHandlers = {
    strikeRemoveUserHandler: function(e) {
      var line, removeButton, userName;
      e.preventDefault();
      removeButton = $(e.currentTarget);
      line = removeButton.closest(".line");
      userName = line.find("[data-user-name]");
      if (userName.hasClass("striked")) {
        userName.removeClass("striked");
        removeButton.text(_jed("Remove"));
        return line.find("[name*='_destroy']").val(null);
      } else {
        userName.addClass("striked");
        removeButton.text(_jed("undo"));
        return line.find("[name*='_destroy']").val(1);
      }
    }
  };

}).call(this);
(function() {
  App.Modules.NestedData = {
    nested: function(data, attr, Model, idAttr) {
      var datum, i, len, ref;
      if (idAttr == null) {
        idAttr = "id";
      }
      if (data[attr] == null) {
        return true;
      }
      ref = (data[attr] instanceof Array ? data[attr] : Array(data[attr]));
      for (i = 0, len = ref.length; i < len; i++) {
        datum = ref[i];
        if (Model.findByAttribute(idAttr, datum[idAttr]) == null) {
          Model.addRecord(new Model(datum));
        }
      }
      return data[attr] = null;
    }
  };

}).call(this);

/*
  
  Availability

  more complex availability (including changes)
  needed for the booking calendar
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Availability = (function(superClass) {
    extend(Availability, superClass);

    Availability.configure("Availability", "inventory_pool_id", "model_id", "changes", "total_borrowable", "total_rentable", "in_stock");

    Availability.belongsTo("inventory_pool", "App.InventoryPool", "inventory_pool_id");

    Availability.belongsTo("model", "App.Model", "model_id");

    Availability.extend(Spine.Model.Ajax);

    function Availability(data) {
      Availability.__super__.constructor.apply(this, arguments);
    }

    Availability.prototype.availabilityForGroups = function(change, groupIds) {
      return _.reduce(change[2], ((function(_this) {
        return function(mem, partition) {
          if (_this.groupIsIn(groupIds, partition.group_id)) {
            return mem + partition.in_quantity;
          } else {
            return mem;
          }
        };
      })(this)), 0);
    };

    Availability.prototype.changesBetween = function(startDate, endDate) {
      startDate = this.mostRecentOrEqualDate(startDate);
      return _.filter(this.changes, function(change) {
        return moment(change[0]).diff(moment(startDate), "days") >= 0 && moment(change[0]).diff(moment(endDate), "days") <= 0;
      });
    };

    Availability.prototype.groupIsIn = function(groupIds, groupId) {
      var result;
      result = _.include(groupIds, groupId) || groupId === 0 || groupId === null;
      return result;
    };

    Availability.prototype.maxAvailableForGroups = function(startDate, endDate, groupIds) {
      var min;
      min = _.min(this.changesBetween(startDate, endDate), (function(_this) {
        return function(change) {
          return _this.availabilityForGroups(change, groupIds);
        };
      })(this));
      if (min != null) {
        return _.reduce(min[2], ((function(_this) {
          return function(mem, partition) {
            if (_this.groupIsIn(groupIds, partition.group_id)) {
              return mem + partition.in_quantity;
            } else {
              return mem;
            }
          };
        })(this)), 0);
      } else {
        return 0;
      }
    };

    Availability.prototype.maxAvailableInTotal = function(startDate, endDate) {
      var changes;
      changes = this.changesBetween(startDate, endDate);
      if (changes.length) {
        return _.min(changes, function(change) {
          return change[1];
        })[1];
      } else {
        return 0;
      }
    };

    Availability.prototype.mostRecentOrEqualDate = function(date) {
      var changesOfPastOrEqual, min;
      changesOfPastOrEqual = _.filter(this.changes, function(change) {
        return moment(change[0]).diff(date, "days") <= 0;
      });
      if (changesOfPastOrEqual.length) {
        min = moment(_.min(changesOfPastOrEqual, function(change) {
          return Math.abs(moment(date).diff(change[0], "days"));
        })[0]).toDate();
      } else {
        min = date;
      }
      return min;
    };

    Availability.prototype.unavailableRanges = function(quantity, groupIds, startDate, endDate) {
      var changes, merge, unavailableRanges;
      changes = this.changesBetween(startDate, endDate);
      unavailableRanges = [];
      _.each(changes, (function(_this) {
        return function(change, i) {
          var availableQuantity, nextChange, rangeEndDate, rangeStartDate;
          availableQuantity = groupIds ? _this.availabilityForGroups(change, groupIds) : change[1];
          if (availableQuantity < quantity) {
            nextChange = changes[i + 1];
            rangeStartDate = moment(change[0]).diff(moment(startDate), "days") > 0 ? change[0] : startDate;
            rangeEndDate = nextChange != null ? moment(nextChange[0]).subtract(1, "days") : endDate;
            return unavailableRanges.push({
              startDate: moment(rangeStartDate).toDate(),
              endDate: moment(rangeEndDate).toDate()
            });
          }
        };
      })(this));
      if (unavailableRanges.length) {
        merge = function(i, ranges) {
          var nextRange, range;
          range = ranges[i];
          nextRange = ranges[i + 1];
          if ((nextRange != null) && moment(nextRange.startDate).diff(moment(range.endDate), "days") === 1) {
            ranges[i] = {
              startDate: range.startDate,
              endDate: nextRange.endDate
            };
            ranges.splice(i + 1, 1);
            return merge(i, ranges);
          }
        };
        merge(0, unavailableRanges);
        return unavailableRanges;
      }
    };


    /*
      solves the self-blocking problem 
      excludes the given reservations from the changes
      if it is not possible to solve the self-blocking problem with just adding the line quantity again
      take care to deep clone the availability to not manipulate the original
     */

    Availability.prototype.withoutLines = function(reservations, recoverSoftOverBooking) {
      var clone;
      clone = $.extend(true, {}, this);
      _.each(clone.changes, (function(_this) {
        return function(change) {
          var allocation, j, k, len, len1, line, outDocumentLines, ref;
          ref = change[2];
          for (j = 0, len = ref.length; j < len; j++) {
            allocation = ref[j];
            for (k = 0, len1 = reservations.length; k < len1; k++) {
              line = reservations[k];
              if (allocation.running_reservations != null) {
                outDocumentLines = allocation.running_reservations;
                if (_.include(outDocumentLines, line.id)) {
                  allocation.running_reservations = _.filter(outDocumentLines, function(l) {
                    return l !== line.id;
                  });
                  if (recoverSoftOverBooking || _this.groupIsIn(line.user().groupIds, allocation.group_id)) {
                    change[1] += line.quantity;
                    allocation.in_quantity += line.quantity;
                  }
                }
              }
            }
          }
          return change;
        };
      })(this));
      return clone;
    };

    return Availability;

  })(Spine.Model);

}).call(this);

/*
  
  Building
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Building = (function(superClass) {
    extend(Building, superClass);

    function Building() {
      return Building.__super__.constructor.apply(this, arguments);
    }

    Building.configure("Building", "id", "name", "code");

    Building.extend(Spine.Model.Ajax);

    return Building;

  })(Spine.Model);

}).call(this);

/*

  Category
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Category = (function(superClass) {
    extend(Category, superClass);

    function Category() {
      this.parents = bind(this.parents, this);
      this.children = bind(this.children, this);
      this.is_used = bind(this.is_used, this);
      return Category.__super__.constructor.apply(this, arguments);
    }

    Category.configure("Category", "id", "name", "used?");

    Category.extend(Spine.Model.Ajax);

    Category.extend(App.Modules.FindOrBuild);

    Category.hasMany("plinks", "App.CategoryLink", "child_id");

    Category.hasMany("clinks", "App.CategoryLink", "parent_id");

    Category.hasMany("models", "App.ModelLink", "model_id");

    Category.url = function() {
      return "/categories";
    };

    Category.prototype.is_used = function() {
      return this['used?'];
    };

    Category.prototype.children = function() {
      return _.filter(_.map(this.clinks().all(), function(l) {
        return l.child();
      }), function(c) {
        return c != null;
      });
    };

    Category.prototype.parents = function() {
      return _filter(_.map(this.plinks().all(), function(l) {
        return l.parent();
      }), function(c) {
        return c != null;
      });
    };

    Category.roots = function() {
      return _.filter(App.Category.all(), function(c) {
        return !_.any(c.plinks().all(), function(l) {
          return l.parent_id != null;
        });
      });
    };

    return Category;

  })(Spine.Model);

}).call(this);

/*

  CategoryLink
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.CategoryLink = (function(superClass) {
    extend(CategoryLink, superClass);

    function CategoryLink() {
      return CategoryLink.__super__.constructor.apply(this, arguments);
    }

    CategoryLink.configure("CategoryLink", "id", "parent_id", "child_id");

    CategoryLink.extend(Spine.Model.Ajax);

    CategoryLink.belongsTo("parent", "App.Category", "parent_id");

    CategoryLink.belongsTo("child", "App.Category", "child_id");

    CategoryLink.url = function() {
      return "/category_links";
    };

    return CategoryLink;

  })(Spine.Model);

}).call(this);

/*

  Contract
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Contract = (function(superClass) {
    extend(Contract, superClass);

    function Contract() {
      this.concatenatedPurposes = bind(this.concatenatedPurposes, this);
      this.quantity = bind(this.quantity, this);
      this.isAvailable = bind(this.isAvailable, this);
      this.to_be_verified = bind(this.to_be_verified, this);
      return Contract.__super__.constructor.apply(this, arguments);
    }

    Contract.configure("Contract", "id", "user_id", "inventory_pool_id", "status", "delegated_user_id", "to_be_verified?", "compact_id");

    Contract.extend(Spine.Model.Ajax);

    Contract.extend(App.Modules.FindOrBuild);

    Contract.include(App.Modules.HasLines);

    Contract.belongsTo("user", "App.User", "user_id");

    Contract.belongsTo("delegatedUser", "App.User", "delegated_user_id");

    Contract.hasMany("reservations", "App.Reservation", "contract_id");

    Contract.url = function() {
      return "/contracts";
    };

    Contract.prototype.to_be_verified = function() {
      return this['to_be_verified?'];
    };

    Contract.prototype.isAvailable = function() {
      return _.all(this.reservations().all(), function(line) {
        return line["available?"];
      });
    };

    Contract.prototype.quantity = function() {
      return _.reduce(this.reservations().all(), (function(mem, line) {
        return mem + line["quantity"];
      }), 0);
    };

    Contract.prototype.concatenatedPurposes = function() {
      return (_.uniq(_.map(this.reservations().all(), function(l) {
        return l.purpose().description;
      }))).join(", ");
    };

    return Contract;

  })(Spine.Model);

}).call(this);

/*
  
  Group
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Group = (function(superClass) {
    extend(Group, superClass);

    function Group() {
      return Group.__super__.constructor.apply(this, arguments);
    }

    Group.configure("Group", "id", "name");

    Group.extend(Spine.Model.Ajax);

    return Group;

  })(Spine.Model);

}).call(this);

/*
  
  Holiday
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Holiday = (function(superClass) {
    extend(Holiday, superClass);

    function Holiday() {
      return Holiday.__super__.constructor.apply(this, arguments);
    }

    Holiday.configure("Holiday");

    Holiday.belongsTo("inventory_pool", "App.InventoryPool", "inventory_pool_id");

    Holiday.extend(Spine.Model.Ajax);

    return Holiday;

  })(Spine.Model);

}).call(this);

/*

  Inventory
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Inventory = (function(superClass) {
    extend(Inventory, superClass);

    function Inventory() {
      return Inventory.__super__.constructor.apply(this, arguments);
    }

    Inventory.types = ["option", "model", "software", "item"];

    Inventory.findOrCreate = function(datum) {
      var className, data, inventoryModel, ref, type;
      if (type = Inventory.getType(datum)) {
        className = _.string.classify(type);
        inventoryModel = App[className];
        data = datum[type];
        return (ref = inventoryModel.exists(data["id"])) != null ? ref : inventoryModel.addRecord(new inventoryModel(data));
      } else {
        throw new Error("unrecognized inventory type");
      }
    };

    Inventory.getType = function(datum) {
      return _.find(Inventory.types, function(type) {
        return datum[type] != null;
      });
    };

    return Inventory;

  })(Spine.Model);

}).call(this);

/*
  
  InventoryPool
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.InventoryPool = (function(superClass) {
    extend(InventoryPool, superClass);

    function InventoryPool() {
      this.hasEnoughReservationAdvanceDays = bind(this.hasEnoughReservationAdvanceDays, this);
      this.isVisitPossible = bind(this.isVisitPossible, this);
      this.isClosedOn = bind(this.isClosedOn, this);
      return InventoryPool.__super__.constructor.apply(this, arguments);
    }

    InventoryPool.configure("InventoryPool", "id", "name", "default_contract_note", "borrow_reservation_advance_days");

    InventoryPool.hasMany("availabilities", "App.Availability", "inventory_pool_id");

    InventoryPool.hasMany("models", "App.Model", "inventory_pool_id");

    InventoryPool.hasMany("holidays", "App.Holiday", "inventory_pool_id");

    InventoryPool.hasOne("workday", "App.Workday", "inventory_pool_id");

    InventoryPool.extend(Spine.Model.Ajax);

    InventoryPool.url = "/inventory_pools";

    InventoryPool.prototype.isClosedOn = function(date) {
      return _.include(this.workday().closedDays(), date.day()) || _.any(this.holidays().all(), function(h) {
        return (date.isAfter(h.start_date) && date.isBefore(h.end_date)) || date.isSame(h.start_date) || date.isSame(h.end_date);
      });
    };

    InventoryPool.prototype.isVisitPossible = function(date) {
      return this.workday().reached_max_visits.indexOf(moment(date).format("YYYY-MM-DD")) === -1;
    };

    InventoryPool.prototype.hasEnoughReservationAdvanceDays = function(date) {
      return date >= moment().startOf('day').add(this.borrow_reservation_advance_days || 0, 'days');
    };

    return InventoryPool;

  })(Spine.Model);

}).call(this);

/*

  Item
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Item = (function(superClass) {
    extend(Item, superClass);

    function Item() {
      this.getProblems = bind(this.getProblems, this);
      return Item.__super__.constructor.apply(this, arguments);
    }

    Item.configure("Item", "id", "inventory_code", "serial_number", "is_broken", "is_incomplete", "is_borrowable", "model_id", "current_location", "properties", "retired");

    Item.belongsTo("model", "App.Model", "model_id");

    Item.hasMany("children", "App.Item", "parent_id");

    Item.belongsTo("parent", "App.Item", "parent_id");

    Item.extend(Spine.Model.Ajax);

    Item.prototype.hasProblems = function() {
      return this.is_broken || this.is_incomplete || !this.is_borrowable;
    };

    Item.prototype.getProblems = function() {
      var problems;
      problems = [];
      if (this.is_broken) {
        problems.push(_jed("Broken"));
      }
      if (this.is_incomplete) {
        problems.push(_jed("Incomplete"));
      }
      if (this.retired) {
        problems.push(_jed("Retired"));
      }
      if (!this.is_borrowable) {
        problems.push(_jed("Unborrowable"));
      }
      return problems.join(", ");
    };

    return Item;

  })(Spine.Model);

}).call(this);

/*
  
  LatestReminder
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.LatestReminder = (function(superClass) {
    extend(LatestReminder, superClass);

    function LatestReminder() {
      return LatestReminder.__super__.constructor.apply(this, arguments);
    }

    LatestReminder.configure("LatestReminder", "id", "created_at");

    LatestReminder.extend(Spine.Model.Ajax);

    return LatestReminder;

  })(Spine.Model);

}).call(this);

/*

  License
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.License = (function(superClass) {
    extend(License, superClass);

    function License() {
      return License.__super__.constructor.apply(this, arguments);
    }

    License.configure("License");

    License.belongsTo("software", "App.Software", "model_id");

    License.prototype.licenseInformation = function() {
      return _.compact([this.osInformation(), this.licenseTypeInformation(), this.properties.total_quantity]).join(", ");
    };

    License.prototype.osInformation = function() {
      if (this.properties.operating_system) {
        return _.map(this.properties.operating_system, function(os) {
          return _jed(App.License.formatString(os));
        }).join(", ");
      }
    };

    License.prototype.licenseTypeInformation = function() {
      return _jed(App.License.formatString(this.properties.license_type));
    };

    License.prototype.itemVersion = function() {
      if (this.item_version) {
        return _jed('item_version') + ' ' + this.item_version;
      } else {
        return null;
      }
    };

    License.formatString = function(s) {
      var capitalizeEachWord;
      if (typeof s !== 'string') {
        return;
      }
      capitalizeEachWord = function(s) {
        return s.replace(/(?:^|\s)\S/g, function(s) {
          return s.toUpperCase();
        });
      };
      return capitalizeEachWord(_.string.humanize(s));
    };

    return License;

  })(window.App.Item);

}).call(this);

/*
  
  Model
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Model = (function(superClass) {
    extend(Model, superClass);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.configure("Model", "id", "product", "version", "type", "properties", "accessory_names");

    Model.hasOne("availability", "App.Availability", "model_id");

    Model.hasMany("plainAvailabilities", "App.PlainAvailability", "model_id");

    Model.hasMany("properties", "App.Property");

    Model.hasMany("items", "App.Item");

    Model.extend(Spine.Model.Ajax);

    Model.extend(App.Modules.FindOrBuild);

    Model.url = function() {
      return "/models";
    };

    Model.prototype.name = function() {
      return [this.product, this.version].join(" ").trim();
    };

    return Model;

  })(Spine.Model);

}).call(this);

/*
  
  ModelLink

  connects models with templates
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelLink = (function(superClass) {
    extend(ModelLink, superClass);

    function ModelLink() {
      return ModelLink.__super__.constructor.apply(this, arguments);
    }

    ModelLink.configure("ModelLink", "id", "template_id", "model_id", "quantity");

    ModelLink.hasOne("template", "App.Template", "template_id");

    ModelLink.extend(Spine.Model.Ajax);

    return ModelLink;

  })(Spine.Model);

}).call(this);

/*
  
  Option
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Option = (function(superClass) {
    extend(Option, superClass);

    function Option() {
      return Option.__super__.constructor.apply(this, arguments);
    }

    Option.configure("Option", "id", "product", "version", "inventory_pool_id", "inventory_code");

    Option.extend(Spine.Model.Ajax);

    Option.url = "/options";

    Option.prototype.name = function() {
      return [this.product, this.version].join(" ");
    };

    return Option;

  })(Spine.Model);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Order = (function(superClass) {
    extend(Order, superClass);

    function Order() {
      this.concatenatedPurposes = bind(this.concatenatedPurposes, this);
      this.quantity = bind(this.quantity, this);
      this.isAvailable = bind(this.isAvailable, this);
      this.to_be_verified = bind(this.to_be_verified, this);
      return Order.__super__.constructor.apply(this, arguments);
    }

    Order.configure("Order", "id", "user_id", "inventory_pool_id", "state", "purpose", "delegated_user_id", "to_be_verified?");

    Order.extend(Spine.Model.Ajax);

    Order.extend(App.Modules.FindOrBuild);

    Order.include(App.Modules.HasLines);

    Order.belongsTo("user", "App.User", "user_id");

    Order.belongsTo("delegatedUser", "App.User", "delegated_user_id");

    Order.hasMany("reservations", "App.Reservation", "order_id");

    Order.url = function() {
      return "/orders";
    };

    Order.prototype.to_be_verified = function() {
      return this['to_be_verified?'];
    };

    Order.prototype.isAvailable = function() {
      return _.all(this.reservations().all(), function(line) {
        return line["available?"];
      });
    };

    Order.prototype.quantity = function() {
      return _.reduce(this.reservations().all(), (function(mem, line) {
        return mem + line["quantity"];
      }), 0);
    };

    Order.prototype.concatenatedPurposes = function() {
      return this.purpose;
    };

    return Order;

  })(Spine.Model);

}).call(this);

/*
  
  Partition
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Partition = (function(superClass) {
    extend(Partition, superClass);

    Partition.configure("Partition", "model_id", "inventory_pool_id", "group_id", "quantity");

    Partition.extend(Spine.Model.Ajax);

    Partition.belongsTo("group", "App.Group", "group_id");

    function Partition() {
      Partition.__super__.constructor.apply(this, arguments);
      this.setId();
    }

    Partition.prototype.setId = function() {
      if ((this.model_id != null) && (this.inventory_pool_id != null)) {
        return this.id = "" + this.model_id + this.inventory_pool_id + this.group_id;
      }
    };

    return Partition;

  })(Spine.Model);

}).call(this);

/*
  
  PlainAvailability

  just quantity for a given range
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.PlainAvailability = (function(superClass) {
    extend(PlainAvailability, superClass);

    function PlainAvailability() {
      return PlainAvailability.__super__.constructor.apply(this, arguments);
    }

    PlainAvailability.configure("PlainAvailability", "inventory_pool_id", "model_id", "quantity");

    PlainAvailability.belongsTo("inventory_pool", "App.InventoryPool", "inventory_pool_id");

    PlainAvailability.belongsTo("model", "App.Model", "model_id");

    PlainAvailability.extend(Spine.Model.Ajax);

    return PlainAvailability;

  })(Spine.Model);

}).call(this);

/*
  Model property
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Property = (function(superClass) {
    extend(Property, superClass);

    function Property() {
      return Property.__super__.constructor.apply(this, arguments);
    }

    Property.configure("Property", "id", "key", "value", "model_id");

    Property.extend(Spine.Model.Ajax);

    Property.url = function() {
      return "/properties";
    };

    return Property;

  })(Spine.Model);

}).call(this);

/*
  
  Reservation
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Reservation = (function(superClass) {
    extend(Reservation, superClass);

    function Reservation() {
      return Reservation.__super__.constructor.apply(this, arguments);
    }

    Reservation.configure("Reservation", "id", "inventory_pool_id", "user_id", "delegated_user_id", "status", "contract_id", "order_id", "model_id", "option_id", "purpose_id", "quantity", "start_date", "end_date", "item_id", "line_purpose");

    Reservation.belongsTo("contract", "App.Contract", "contract_id");

    Reservation.belongsTo("order", "App.Order", "order_id");

    Reservation.belongsTo("inventory_pool", "App.InventoryPool", "inventory_pool_id");

    Reservation.belongsTo("user", "App.User", "user_id");

    Reservation.belongsTo("delegatedUser", "App.User", "delegated_user_id");

    Reservation.belongsTo("model", "App.Model", "model_id");

    Reservation.belongsTo("option", "App.Option", "option_id");

    Reservation.belongsTo("purpose", "App.Purpose", "purpose_id");

    Reservation.belongsTo("item", "App.Item", "item_id");

    Reservation.extend(Spine.Model.Ajax);

    Reservation.url = "/reservations";

    Reservation.prototype.model = function() {
      var model, ref;
      if (this.model_id != null) {
        model = (ref = App.Model.exists(this.model_id)) != null ? ref : App.Software.exists(this.model_id);
        return (function() {
          if (model != null) {
            return model;
          } else {
            throw new Error("Could not find model or software with " + this.model_id);
          }
        }).call(this);
      } else {
        return App.Option.find(this.option_id);
      }
    };

    Reservation.prototype.item = function() {
      var item, ref;
      if (this.item_id) {
        item = (ref = App.Item.exists(this.item_id)) != null ? ref : App.License.exists(this.item_id);
        return (function() {
          if (item != null) {
            return item;
          } else {
            throw new Error("Could not find item or license with " + this.item_id);
          }
        }).call(this);
      }
    };

    Reservation.prototype.inventoryCode = function() {
      if (this.item()) {
        return this.item().inventory_code;
      } else if (this.option()) {
        return this.option().inventory_code;
      }
    };

    return Reservation;

  })(Spine.Model);

}).call(this);

/*

  Software
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Software = (function(superClass) {
    extend(Software, superClass);

    function Software() {
      return Software.__super__.constructor.apply(this, arguments);
    }

    Software.configure("Software");

    Software.hasMany("licenses", "App.License", "model_id");

    return Software;

  })(window.App.Model);

}).call(this);

/*
  
  Template

  a set of models and a quantity for each model
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Template = (function(superClass) {
    extend(Template, superClass);

    function Template() {
      return Template.__super__.constructor.apply(this, arguments);
    }

    Template.configure("Template", "id", "label");

    Template.hasMany("model_links", "App.ModelLink", "template_id");

    Template.extend(Spine.Model.Ajax);

    return Template;

  })(Spine.Model);

}).call(this);

/*

  User
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.User = (function(superClass) {
    extend(User, superClass);

    function User() {
      return User.__super__.constructor.apply(this, arguments);
    }

    User.configure("User", "id", "firstname", "lastname", "settings", "groupIds", "org_id", "delegator_user_id", "is_admin");

    User.hasMany("contracts", "App.Contract", "user_id");

    User.hasMany("accessRights", "App.AccessRight", "user_id");

    User.belongsTo("delegator_user", "App.User", "delegator_user_id");

    User.extend(Spine.Model.Ajax);

    User.extend(App.Modules.FindOrBuild);

    User.prototype.setStartScreen = function(path) {
      return $.post("/manage/users/" + App.User.current.id + "/set_start_screen", {
        path: path
      });
    };

    User.prototype.name = function() {
      return [this.firstname, this.lastname].join(" ");
    };

    User.prototype.isAdmin = function() {
      return this.is_admin;
    };

    User.prototype.accessRight = function() {
      return _.find(this.accessRights().all(), function(ar) {
        var ref;
        return ar.inventory_pool_id === ((ref = App.InventoryPool.current) != null ? ref.id : void 0);
      });
    };

    User.prototype.roleName = function() {
      var ar, ref;
      if (App.InventoryPool.current != null) {
        ar = this.accessRight();
        return (ref = ar != null ? ar.name() : void 0) != null ? ref : _jed("No access");
      } else {
        if (this.isAdmin()) {
          return _jed("Administrator");
        }
      }
    };

    User.prototype.suspendedUntil = function() {
      var ref;
      return (ref = this.accessRight()) != null ? ref.suspended_until : void 0;
    };

    User.prototype.suspended = function() {
      if (this.suspendedUntil()) {
        return moment(this.suspendedUntil()).diff(moment(), "days") >= 0;
      } else {
        return false;
      }
    };

    User.prototype.isDelegation = function() {
      var ref;
      return (ref = this.delegator_user_id) != null ? ref : false;
    };

    User.fetchDelegators = function(users, callback) {
      var delegations, delegator_user_ids;
      if (callback == null) {
        callback = null;
      }
      delegations = _.filter(users, function(r) {
        return r.isDelegation();
      });
      delegator_user_ids = _.uniq(_.map(delegations, function(r) {
        return r.delegator_user_id;
      }));
      if (delegator_user_ids.length) {
        return $.ajax({
          url: App.User.url(),
          type: "GET",
          dataType: "json",
          data: {
            ids: delegator_user_ids
          }
        }).done(function(data) {
          var datum, i, len;
          for (i = 0, len = data.length; i < len; i++) {
            datum = data[i];
            App.User.addRecord(new App.User(datum));
          }
          return typeof callback === "function" ? callback() : void 0;
        });
      } else {
        return typeof callback === "function" ? callback() : void 0;
      }
    };

    return User;

  })(Spine.Model);

}).call(this);

/*
  
  Visit
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Visit = (function(superClass) {
    extend(Visit, superClass);

    Visit.configure("Visit", "id", "date", "quantity", "status", "reservation_ids");

    Visit.extend(Spine.Model.Ajax);

    Visit.extend(App.Modules.FindOrBuild);

    Visit.belongsTo("user", "App.User", "user_id");

    Visit.include(App.Modules.HasLines);

    function Visit(data) {
      this.remind = bind(this.remind, this);
      this.quantity = bind(this.quantity, this);
      this.isOverdue = bind(this.isOverdue, this);
      this.reservations = bind(this.reservations, this);
      this._quantity = data.quantity;
      Visit.__super__.constructor.apply(this, arguments);
      if (App.Visit.exists(this.id) == null) {
        App.Visit.addRecord(this);
      }
    }

    Visit.prototype.reservations = function() {
      return {
        all: (function(_this) {
          return function() {
            var i, id, len, ref, results;
            ref = _this.reservation_ids;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              id = ref[i];
              results.push(App.Reservation.find(id));
            }
            return results;
          };
        })(this)
      };
    };

    Visit.prototype.isOverdue = function() {
      return moment().startOf("day").diff(moment(this.date).startOf("day"), "days") >= 1;
    };

    Visit.prototype.quantity = function() {
      return this._quantity;
    };

    Visit.url = function() {
      return "/manage/" + App.InventoryPool.current.id + "/visits";
    };

    Visit.prototype.remind = function() {
      if (this.status === "signed") {
        return $.post((App.Visit.url()) + "/" + this.id + "/remind");
      }
    };

    return Visit;

  })(Spine.Model);

}).call(this);

/*
  
  Workday
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Workday = (function(superClass) {
    extend(Workday, superClass);

    function Workday() {
      this.closedDays = bind(this.closedDays, this);
      return Workday.__super__.constructor.apply(this, arguments);
    }

    Workday.configure("Workday");

    Workday.belongsTo("inventory_pool", "App.InventoryPool", "inventory_pool_id");

    Workday.extend(Spine.Model.Ajax);

    Workday.prototype.closedDays = function() {
      var days;
      days = [];
      if (!this.sunday) {
        days.push(0);
      }
      if (!this.monday) {
        days.push(1);
      }
      if (!this.tuesday) {
        days.push(2);
      }
      if (!this.wednesday) {
        days.push(3);
      }
      if (!this.thursday) {
        days.push(4);
      }
      if (!this.friday) {
        days.push(5);
      }
      if (!this.saturday) {
        days.push(6);
      }
      return days;
    };

    return Workday;

  })(Spine.Model);

}).call(this);

/*
  
  Workload
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.Workload = (function(superClass) {
    extend(Workload, superClass);

    function Workload() {
      return Workload.__super__.constructor.apply(this, arguments);
    }

    Workload.configure("Workload", "data");

    Workload.extend(Spine.Model.Ajax);

    Workload.url = function() {
      return App.InventoryPool.url + "/" + App.InventoryPool.current.id + "/workload";
    };

    return Workload;

  })(Spine.Model);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.BookingCalendarDialogController = (function(superClass) {
    extend(BookingCalendarDialogController, superClass);

    function BookingCalendarDialogController() {
      this.validationAlerts = bind(this.validationAlerts, this);
      this.valid = bind(this.valid, this);
      this.showError = bind(this.showError, this);
      this.showSubmitting = bind(this.showSubmitting, this);
      this.showOverlay = bind(this.showOverlay, this);
      this.store = bind(this.store, this);
      this.submit = bind(this.submit, this);
      this.setupBookingCalendar = bind(this.setupBookingCalendar, this);
      this.setupQuantity = bind(this.setupQuantity, this);
      this.setupDates = bind(this.setupDates, this);
      this.setupModal = bind(this.setupModal, this);
      this.initalizeDialog = bind(this.initalizeDialog, this);
      this.getSelectedInventoryPool = bind(this.getSelectedInventoryPool, this);
      this.getQuantity = bind(this.getQuantity, this);
      this.getStartDate = bind(this.getStartDate, this);
      this.getEndDate = bind(this.getEndDate, this);
      this.getAvailability = bind(this.getAvailability, this);
      this.fetchAvailability = bind(this.fetchAvailability, this);
      this.fetchGroups = bind(this.fetchGroups, this);
      this.fetchHolidays = bind(this.fetchHolidays, this);
      this.fetchWorkdays = bind(this.fetchWorkdays, this);
      this.fetchData = bind(this.fetchData, this);
      this.fail = bind(this.fail, this);
      this.done = bind(this.done, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      BookingCalendarDialogController.__super__.constructor.apply(this, arguments);
      this.setupModal();
      this.setupDates();
      this.setupQuantity();
      this.fetchData();
      this.delegateEvents();
    }

    BookingCalendarDialogController.prototype.delegateEvents = function() {
      this.submitButton.on("click", this.submit);
      return this.dialog.on("validation-alert", (function(_this) {
        return function() {
          return _this.validationAlerts();
        };
      })(this));
    };

    BookingCalendarDialogController.prototype.done = function() {
      this.modal.destroyable();
      return App.Modal.destroyAll(true);
    };

    BookingCalendarDialogController.prototype.fail = function(e) {
      this.modal.destroyable();
      return this.showError(e.responseText);
    };

    BookingCalendarDialogController.prototype.fetchData = function() {};

    BookingCalendarDialogController.prototype.fetchWorkdays = function() {
      return App.Workday.ajaxFetch().done((function(_this) {
        return function(data) {
          var datum;
          return _this.workdays = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Workday.find(datum.id));
            }
            return results;
          })();
        };
      })(this));
    };

    BookingCalendarDialogController.prototype.fetchHolidays = function() {
      return App.Holiday.ajaxFetch().done((function(_this) {
        return function(data) {
          var datum;
          return _this.holidays = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Holiday.find(datum.id));
            }
            return results;
          })();
        };
      })(this));
    };

    BookingCalendarDialogController.prototype.fetchGroups = function() {
      return App.Group.ajaxFetch().done((function(_this) {
        return function(data) {
          var datum;
          return _this.groups = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Group.find(datum.id));
            }
            return results;
          })();
        };
      })(this));
    };

    BookingCalendarDialogController.prototype.fetchAvailability = function() {};

    BookingCalendarDialogController.prototype.getAvailability = function(inventoryPool) {};

    BookingCalendarDialogController.prototype.getEndDate = function() {
      return moment(this.endDateEl.val(), i18n.date.L);
    };

    BookingCalendarDialogController.prototype.getStartDate = function() {
      return moment(this.startDateEl.val(), i18n.date.L);
    };

    BookingCalendarDialogController.prototype.getQuantity = function() {
      if (this.quantityEl.val().length) {
        return parseInt(this.quantityEl.val());
      }
    };

    BookingCalendarDialogController.prototype.getSelectedInventoryPool = function() {
      return App.InventoryPool.find(this.inventoryPoolSelect.find("option:selected").data("id"));
    };

    BookingCalendarDialogController.prototype.initalizeDialog = function() {
      this.loading.detach();
      this.controlElements.removeClass("hidden");
      this.submitButton.prop("disabled", false);
      return this.setupBookingCalendar();
    };

    BookingCalendarDialogController.prototype.setupModal = function() {
      this.loading = this.dialog.find("img.loading");
      this.submitButton = this.dialog.find("#submit-booking-calendar");
      this.controlElements = this.dialog.find("#booking-calendar-controls");
      this.inventoryPoolSelect = this.dialog.find("#booking-calendar-inventory-pool");
      this.quantityEl = this.dialog.find("#booking-calendar-quantity");
      this.errorsContainer = this.dialog.find("#booking-calendar-errors");
      this.startDateEl = this.dialog.find("#booking-calendar-start-date");
      this.endDateEl = this.dialog.find("#booking-calendar-end-date");
      return this.modal = new App.Modal(this.dialog);
    };

    BookingCalendarDialogController.prototype.setupDates = function() {
      this.startDateEl.val(this.startDate);
      return this.endDateEl.val(this.endDate);
    };

    BookingCalendarDialogController.prototype.setupQuantity = function() {
      return this.quantityEl.val(this.quantity);
    };

    BookingCalendarDialogController.prototype.setupBookingCalendar = function() {};

    BookingCalendarDialogController.prototype.submit = function() {
      if (this.valid()) {
        this.modal.undestroyable();
        this.showOverlay();
        this.showSubmitting();
        return this.store();
      }
    };

    BookingCalendarDialogController.prototype.store = function() {};

    BookingCalendarDialogController.prototype.showOverlay = function() {
      if (this.overlay == null) {
        this.overlay = $(App.Render("views/booking_calendar/overlay"));
      }
      return this.dialog.append(this.overlay);
    };

    BookingCalendarDialogController.prototype.showSubmitting = function() {
      this.submitButton.data("html", this.submitButton.html());
      return this.submitButton.html(App.Render("views/loading", {
        size: "micro"
      }));
    };

    BookingCalendarDialogController.prototype.showError = function(text) {
      if (this.overlay != null) {
        this.overlay.detach();
      }
      this.submitButton.html(this.submitButton.data("html"));
      return this.errorsContainer.html(App.Render("views/booking_calendar/errors", {
        text: text
      }));
    };

    BookingCalendarDialogController.prototype.valid = function() {};

    BookingCalendarDialogController.prototype.validationAlerts = function() {
      if (this.valid()) {
        return this.errorsContainer.html("");
      } else {
        return this.showError(this.errors.join(", "));
      }
    };

    return BookingCalendarDialogController;

  })(Spine.Controller);

}).call(this);
(function($) {$.views.templates("views/autocomplete/element", "<li class=\'separated-bottom exclude-last-child\'>\n  <a>\n    <div class=\'row text-ellipsis\'>\n      {{>label}}\n    <\/div>\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("views/booking_calendar/errors", "<div class=\'padding-horizontal-m padding-bottom-m\'>\n  <div class=\'row emboss red text-align-center font-size-m padding-inset-s\'>\n    <strong>{{>text}}<\/strong>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("views/booking_calendar/overlay", "<div class=\'booking-calendar-overlay\'><\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("views/booking_calendar/target-selection", "<div class=\'target-selection row width-m-alt\'>\n  <div class=\'col1of2 padding-right-xxs\'>\n    <button class=\'button inset width-full\' id=\'set-start-date\'>{{jed \"Start date\"/}}<\/button>\n  <\/div>\n  <div class=\'col1of2 text-align-right padding-left-xxs\'>\n    <button class=\'button inset width-full\' id=\'set-end-date\'>{{jed \"End date\"/}}<\/button>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("views/dropdown/dropdown-item", "{{if link}}\n<a class=\'dropdown-item text-ellipsis\' href=\'{{>link}}\' title=\'{{>text}}\'>{{>text}}<\/a>\n{{else}}\n<div class=\'dropdown-item text-ellipsis\'>{{>text}}<\/div>\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("views/flash", "<div class=\'paragraph-m row emboss straight text-align-center padding-inset-xs {{>type}}\'>\n  <strong>{{>message}}<\/strong>\n  {{if loading}}\n  <img class=\'max-width-micro max-height-micro\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n  {{/if}}\n  <a class=\'no-colors transparent-hover position-absolute-topright height-full padding-horizontal-m\' data-remove=\'true\' title=\'{{jed \'Hide notification\'/}}\'>\n    <div class=\'table\'>\n      <div class=\'table-row\'>\n        <div class=\'table-cell vertical-align-middle\'>\n          <i class=\'fa fa-times-circle\'><\/i>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/a>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function() {
  $.views.helpers({
    isToday: function(date) {
      return moment(date).endOf("day").diff(moment().endOf("day"), "days") === 0;
    }
  });

}).call(this);
(function() {
  (function() {
    var vars;
    vars = {};
    return $.views.helpers({
      setvar: function(key, value) {
        vars[key] = value;
        return "";
      },
      getvar: function(key) {
        return vars[key];
      }
    });
  })();

}).call(this);
(function() {
  var slice = [].slice;

  $.views.helpers({
    moment: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return window.moment.apply(this, args);
    }
  });

}).call(this);
(function($) {$.views.templates("views/loading", "<img class=\'{{if size}}max-width-{{>size}} max-height-{{>size}}{{/if}}\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function() {
  $.views.tags({
    count: function(number) {
      var i, len, num, ref, result;
      result = "";
      ref = _.range(0, number);
      for (i = 0, len = ref.length; i < len; i++) {
        num = ref[i];
        result += this.tagCtx.render({
          count: num
        });
      }
      return result;
    }
  });

}).call(this);
(function() {
  $.views.tags({
    csrf_token: function() {
      var token;
      token = $('meta[name="csrf-token"]').attr('content');
      return "<input type='hidden' name='authenticity_token' value='" + token + "' />";
    }
  });

}).call(this);
(function() {
  $.views.tags({
    diffDates: function(firstDate, secondDate) {
      if (moment(secondDate).startOf("day").diff(moment(firstDate).startOf("day"), "days") < 1) {
        return _jed("Today");
      } else {
        return moment(firstDate).startOf("day").from(moment(secondDate).startOf("day"));
      }
    },
    diffDatesInDays: function(firstDate, secondDate) {
      var days;
      days = moment(secondDate).endOf("day").diff(moment(firstDate).startOf("day"), "days") + 1;
      return days + " " + (_jed(days, 'Day', _jed('Days')));
    },
    diffToday: function(date) {
      if (moment().startOf("day").diff(moment(date).startOf("day"), "days") === 0) {
        return _jed("Today");
      } else {
        return moment(date).startOf("day").from(moment().startOf("day"));
      }
    },
    todayOrDate: function(date) {
      if (moment().startOf("day").diff(moment(date).startOf("day"), "days") < 1) {
        return _jed("Today");
      } else {
        return moment(date).startOf("day").from(moment().startOf("day"));
      }
    },
    date: function(date) {
      return moment(date).format(i18n.date.L);
    },
    day: function(date) {
      return moment(date).format("dddd");
    },
    dateAndTime: function(date) {
      return ($.views.tags.diffToday.render(date)) + " " + (moment(date).format("LT"));
    }
  });

}).call(this);
(function() {
  var slice = [].slice;

  $.views.tags({
    "debugger": function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      debugger;
    }
  });

}).call(this);
(function() {
  $.views.tags({
    encodeURIComponent: function(str) {
      return encodeURIComponent(str);
    }
  });

}).call(this);
(function() {
  $.views.tags({
    interval: function(start_date, end_date) {
      var days;
      days = moment(end_date).diff(moment(start_date), "days") + 1;
      return days + " " + (_jed(days, _jed('Day'), _jed('Days')));
    }
  });

}).call(this);
(function() {
  var slice = [].slice;

  $.views.tags({
    jed: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return _jed.apply(this, args);
    }
  });

}).call(this);
(function() {
  $.views.tags({
    JSON: function(data) {
      return JSON.stringify(data);
    }
  });

}).call(this);
(function() {
  $.views.tags({
    localize: function(date) {
      return moment(date).format(i18n.date.L);
    }
  });

}).call(this);
(function() {
  $.views.tags({
    money: function(num) {
      return accounting.formatMoney(parseFloat(num));
    }
  });

}).call(this);
(function() {
  $.views.tags({
    param: function(data, attribute) {
      var h;
      if (attribute != null) {
        h = {};
        h[attribute] = data;
        return $.param(h);
      } else {
        return $.param(data);
      }
    }
  });

}).call(this);
(function() {
  var slice = [].slice;

  $.views.tags({
    partial: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (args[1] == null) {
        args[1] = {};
      }
      return App.Render.apply(this, args);
    }
  });

}).call(this);
(function() {
  $.views.tags({
    stringify: function(data) {
      return JSON.stringify(data);
    }
  });

}).call(this);
(function() {
  $.views.tags({
    sum: function(data, attr) {
      return _.reduce(data, (function(mem, r) {
        return mem + r[attr];
      }), 0);
    }
  });

}).call(this);
(function() {
  var slice = [].slice;

  $.views.tags({
    truncate: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return _.string.truncate.apply(this, args);
    }
  });

}).call(this);
(function($) {$.views.templates("views/tooltips/default", "<p class=\'paragraph-{{if ~size}}{{>~size}}{{else}}s{{/if}} text-align-center\'>{{>content}}<\/p>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;

  window.AutosizeTextarea = window.createReactClass({
    propTypes: {},

    createAutosize: function () {
      this.jel.autosize();
    },

    destroyAutosize: function () {
      this.jel.trigger('autosize.destroy');
    },

    componentDidMount: function () {
      this.jel = $(this.refs[this.props.refkey]);
      this.jel.on('focus', this.createAutosize).on('blur', this.destroyAutosize);
    },

    componentWillUnmount: function () {
      this.jel.off('focus', this.createAutosize).off('blur', this.destroyAutosize);
    },

    render: function () {
      return React.createElement('textarea', _extends({ ref: this.props.refkey }, this.props));
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;

  window.ChooseUserPreload = createReactClass({
    propTypes: {},

    getInitialState: function () {
      return {
        userDataLoaded: false,
        personInput: '',
        userData: [],
        hideDropdown: false
      };
    },

    componentDidMount: function () {
      document.addEventListener('mousedown', this._handleClickOutside);
      this._loadUsers();
    },

    componentWillUnmount: function () {
      document.removeEventListener('mousedown', this._handleClickOutside);
    },

    _loadUsers: function () {
      var _this = this;

      App.User.ajaxFetch({
        data: $.param({
          delegation_id: this.props.delegationId,
          paginate: false
        })
      }).done(function (data) {
        _this.setState({ userDataLoaded: true, userData: data });
      });
    },

    _onChangePersonInput: function (event) {
      this.setState({
        personInput: event.target.value,
        hideDropdown: false
      });
    },

    _onUserClick: function (event, user) {
      event.preventDefault();
      this.props.onDelegatedUser(user);
      this.setState({ personInput: '' });
    },

    _userAddress: function (user) {
      return (user.address ? user.address : '') + ' ' + (user.city ? user.city : '');
    },

    _renderDropdownLine: function (user) {
      var _this2 = this;

      return React.createElement(
        'li',
        { key: user.id, className: 'separated-bottom exclude-last-child ui-menu-item' },
        React.createElement(
          'a',
          { onClick: function (event) {
              return _this2._onUserClick(event, user);
            }, className: 'row ui-menu-item-wrapper', tabIndex: '-1' },
          React.createElement(
            'div',
            { className: 'row text-ellipsis' },
            React.createElement(
              'strong',
              null,
              user.name
            )
          ),
          React.createElement(
            'div',
            { className: 'row text-ellipsis' },
            this._userAddress(user)
          )
        )
      );
    },

    _renderDropdownLines: function () {
      var _this3 = this;

      return this._dropdownData().map(function (u) {
        return _this3._renderDropdownLine(u);
      });
    },

    _dropdownData: function () {

      var input = this.state.personInput;

      if (input == '') {
        return this.state.userData;
      }

      var contains = function (string, part) {
        if (!string || !part) {
          return false;
        }
        return string.toLowerCase().indexOf(part.toLowerCase()) > -1;
      };

      return _.filter(this.state.userData, function (u) {
        return contains(u.name, input) || contains(u.address, input) || contains(u.city, input);
      });
    },

    _handleClickOutside: function (event) {
      if (this.ulReference && !this.ulReference.contains(event.target) && this.inputReference && !this.inputReference.contains(event.target)) {
        this._onHideDropdown();
      }
    },

    _onHideDropdown: function () {
      this.setState({ hideDropdown: true });
    },

    _renderUl: function () {
      var _this4 = this;

      var display = 'none';
      if (this._dropdownData().length > 0 && !this.props.delegatedUser && !this.state.hideDropdown) {
        display = 'block';
      }

      var top = '30px';
      if (this.props.relative) {
        top = '0px';
      }

      return React.createElement(
        'ul',
        { ref: function (ref) {
            return _this4.ulReference = ref;
          }, id: 'ui-id-1', tabIndex: '0', className: 'ui-menu ui-widget ui-widget-content ui-autocomplete ui-front ui-autocomplete-disabled', style: { display: display, top: top, left: '0px', width: '231px' } },
        this._renderDropdownLines()
      );
    },

    _renderDropdown: function () {

      if (this.props.relative) {
        // TODO Hacky way for correct position in certain cases.
        return React.createElement(
          'div',
          { style: { position: 'relative' } },
          this._renderUl()
        );
      } else {
        return this._renderUl();
      }
    },

    _placeholder: function () {
      return _jed('Contact person') + ' ' + _jed('Name / ID');
    },

    _onClearUser: function () {
      this.props.onDelegatedUser(null);
      this.setState({ delegatedUser: null });
    },

    _renderSelectedUser: function () {

      if (!this.props.delegatedUser) {
        return null;
      }

      return React.createElement(
        'div',
        { className: 'emboss white padding-inset-xxs' },
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'p',
            { className: 'paragraph-s' },
            React.createElement(
              'strong',
              null,
              this.props.delegatedUser.name
            )
          ),
          React.createElement(
            'div',
            { className: 'position-absolute-topright padding-inset-xxs' },
            React.createElement(
              'a',
              { onClick: this._onClearUser, className: 'grey padding-inset-xxs', id: 'remove-user' },
              React.createElement('i', { className: 'fa fa-times-circle icon-m' })
            )
          )
        )
      );
    },

    _onInputFocus: function () {
      this.setState({ hideDropdown: false });
    },

    render: function () {
      var _this5 = this;

      var display = 'inline-block';
      if (this.props.delegatedUser) {
        display = 'none';
      }

      return(
        // NOTE: Here remove the wrapper element as soon as possible in the new React version.
        React.createElement(
          'div',
          null,
          React.createElement('input', { ref: function (ref) {
              return _this5.inputReference = ref;
            }, style: { display: display }, onFocus: this._onInputFocus, onChange: this._onChangePersonInput, value: this.state.personInput, autoComplete: 'off', autoFocus: 'autofocus', className: 'width-full', 'data-barcode-scanner-target': true, 'data-prevent-barcode-scanner-submit': true, id: 'user-id', placeholder: this._placeholder(), type: 'text' }),
          React.createElement(
            'div',
            { id: 'selected-user' },
            this._renderSelectedUser()
          ),
          this._renderDropdown()
        )
      );
    }
  });
})();
;(function () {
  // NOTE: only for linter and clarity:
  /* global _, _jed, $, setUrlParams */
  /* global App */
  /* global React */
  /* global PropTypes */
  /* global CreateItemFieldSwitch, CreateItemContent */

  var f = window.lodash;

  // NOTE: This is the server-side limit (needed because the result page holds uuids in params for all created items, also to protect against mistakes)
  var BATCH_CREATE_MAX_QUANTITY = 100;
  // NOTE: those fields are only relevant for a *single* item instance. the list comes from the "copy item" action, which resets those fields on copy.
  // <https://github.com/leihs/leihs/issues/1015#issuecomment-775999512>
  var ITEM_FIELDS_DISABLED_FOR_BATCH = ['owner',
  // 'inventory_code', // already handled explicitly in the Field component itself, so we cant remove the field!
  'serial_number', 'name', 'last_check', 'attachments'];

  window.CreateItem = window.createReactClass({
    propTypes: {},

    initialPackageChildItems: function () {
      if (this.props.edit && this.props.for_package && this.props.children) {
        var l = window.lodash;
        return l.map(this.props.children, function (c) {
          return {
            item: c.json,
            model: c.json.model
          };
        });
      } else {
        return [];
      }
    },

    // https://reactjs.org/docs/legacy-context.html
    childContextTypes: {
      hackyForPackage: PropTypes.bool,
      isBatchCreate: PropTypes.bool,
      batchCreateInventoryCodePrefix: PropTypes.string
    },
    // NOTE: We need this hack to pass the forPackage value to the mdoel_id input since
    // the current field config does not let us pass this information if we
    // only should list package models or not.
    getChildContext: function () {
      return {
        hackyForPackage: this.props.for_package,
        isBatchCreate: this._isBatchCreate(),
        batchCreateInventoryCodePrefix: this.props.code_prefix
      };
    },

    getInitialState: function () {
      return {
        quantity: 1,
        loadingFields: 'initial',
        fields: null,
        showInvalids: false,
        fieldModels: [],
        showError: false,
        errorMessage: '',
        packageChildItems: this.initialPackageChildItems()
      };
    },

    _targetType: function () {
      return this.props.item_type;
    },

    _fetchFields: function () {
      var _this = this;

      this.setState({ loadingFields: 'loading' });
      App.Field.ajaxFetch({
        data: $.param({ target_type: this._targetType() })
      }).done(function (data) {
        var fields = data;
        if (_this.props.for_package) {
          fields = _.filter(data, function (f) {
            return f.forPackage || f.id == 'model_id';
          });
        }

        _this.setState({
          loadingFields: 'done',
          fields: fields,
          fieldModels: _this._createFieldModels(fields, _this.props.item)
        });
      });
    },

    _createFieldModels: function (fields, item) {
      if (item) {
        return window.FieldModels._createEditFieldModels(fields, item, this._fieldSwitch, this.props.attachments);
      } else {
        return window.FieldModels._createNewFieldModels(fields, this.props.next_code, this.props.inventory_pool, this._fieldSwitch);
      }
    },

    componentDidMount: function () {
      this._fetchFields();
    },

    _fieldSwitch: function () {
      return {
        _hasValidValue: CreateItemFieldSwitch._hasValidValue,
        _createEmptyValue: CreateItemFieldSwitch._createEmptyValue,
        _isDependencyValue: CreateItemFieldSwitch._isDependencyValue
      };
    },

    onChange: function (fieldId, value) {
      var l = window.lodash;
      var fieldModels = l.cloneDeep(this.state.fieldModels);
      window.FieldModels.findFieldModel(fieldModels, fieldId).value = value;
      window.FieldModels._ensureDependents(fieldModels, this.state.fields, this._fieldSwitch);
      this.setState({ fieldModels: fieldModels });
    },

    _loadingFields: function () {
      var loading = React.createElement('div', { className: 'loading-bg' });

      return React.createElement(
        'div',
        { className: 'table' },
        React.createElement(
          'div',
          { className: 'table-row' },
          React.createElement(
            'div',
            {
              className: 'table-cell list-of-lines even separated-top padding-bottom-s min-height-l',
              id: 'inventory',
              style: { border: '0px' } },
            React.createElement('div', { className: 'height-s' }),
            loading,
            React.createElement('div', { className: 'height-s' })
          )
        )
      );
    },

    _onShowAll: function () {
      var _this2 = this;

      var url = '/manage/' + this.props.inventory_pool.id + '/fields';
      $.ajax({
        url: url,
        type: 'post',
        data: {
          _method: 'delete'
        }
      }).done(function () {
        var l = window.lodash;
        var fieldModels = l.cloneDeep(_this2.state.fieldModels);
        _.each(fieldModels, function (fm) {
          fm.hidden = false;
        });

        _this2.setState({ fieldModels: fieldModels });
      });
    },

    _onClose: function (fieldModel) {
      var _this3 = this;

      var url = '/manage/' + this.props.inventory_pool.id + '/fields/' + fieldModel.field.id;
      $.ajax({
        url: url,
        type: 'post'
      }).done(function () {
        var l = window.lodash;
        var fieldModels = l.cloneDeep(_this3.state.fieldModels);
        _.each(fieldModels, function (fm) {
          if (fm.field.id == fieldModel.field.id) {
            fm.hidden = true;
          }
        });

        _this3.setState({ fieldModels: fieldModels });
      });
    },

    onSelectChildItem: function (result) {
      // var term = result.term
      var id = result.id;
      var value = result.value;
      if (id) {
        this.setState(function (old) {
          var l = window.lodash;
          return {
            packageChildItems: l.concat([value], l.reject(old.packageChildItems, function (v) {
              return v.item.id == value.item.id;
            }))
          };
        });
      }
    },

    onRemoveChildItem: function (itemId) {
      this.setState(function (old) {
        var l = window.lodash;
        return {
          packageChildItems: l.reject(old.packageChildItems, function (v) {
            return v.item.id == itemId;
          })
        };
      });
    },

    _readyContent: function () {
      var _this4 = this;

      var isBatch = this._isBatchCreate();
      var isCreating = !this.props.edit;
      var isAPackage = !!this.props.for_package;
      var isPartOfAPackage = !!this.props.parent;
      var isSoftwareLicense = this.props.item_type === 'license';
      var isCreatingNewItem = isCreating && !isAPackage && !isPartOfAPackage && !isSoftwareLicense;
      var fields = this.state.fields;
      var fieldModels = this.state.fieldModels;

      // NOTE: not implemented for licenses, because they are deprecated
      var quantitySelector = isCreatingNewItem && React.createElement(
        'div',
        { className: 'ui-create-item-quantity-selector' },
        React.createElement(
          'div',
          {
            className: 'field row emboss padding-inset-xs margin-vertical-xxs margin-right-xs',
            'data-editable': 'true',
            'data-id': 'item_quantity',
            'data-required': 'true',
            'data-type': 'field' },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'div',
              { className: 'col1of2 padding-vertical-xs', 'data-type': 'key' },
              React.createElement(
                'strong',
                { className: 'font-size-m inline-block' },
                _jed('create_multiple_items_label_quantity'),
                ' *'
              )
            ),
            React.createElement(
              'div',
              { className: 'col1of2', 'data-type': 'value' },
              React.createElement('input', {
                type: 'number',
                name: 'item[quantity]',
                value: this.state.quantity,
                onChange: function (_ref) {
                  var num = _ref.target.value;
                  return _this4.setState({ quantity: Math.min(num, BATCH_CREATE_MAX_QUANTITY) });
                },
                className: 'width-full',
                autoComplete: 'off',
                min: 1,
                max: BATCH_CREATE_MAX_QUANTITY,
                step: 1
              })
            )
          )
        )
      );

      // NOTE: if creating multiple, hide certain fields
      if (isBatch) {
        fields = f.reject(fields, function (field) {
          return f.includes(ITEM_FIELDS_DISABLED_FOR_BATCH, field.id);
        });
        fieldModels = f.reject(fieldModels, function (fieldModel) {
          return f.includes(ITEM_FIELDS_DISABLED_FOR_BATCH, f.get(fieldModel, 'field.id'));
        });
      }

      return(
        // eslint-disable-next-line react/jsx-no-undef
        React.createElement(CreateItemContent, {
          fields: fields,
          fieldModels: fieldModels,
          onChange: this.onChange,
          createItemProps: this.props,
          showInvalids: this.state.showInvalids,
          onClose: this._onClose,
          onSelectChildItem: this.onSelectChildItem,
          onRemoveChildItem: this.onRemoveChildItem,
          packageChildItems: this.state.packageChildItems,
          quantitySelector: quantitySelector
        })
      );
    },

    _fieldsReady: function () {
      return this.state.loadingFields == 'done';
    },

    _content: function () {
      if (!this._fieldsReady()) {
        return this._loadingFields();
      } else {
        return this._readyContent();
      }
    },

    _subtitleMessage: function () {
      if (this.props.edit) {
        _jed('Make changes and save');
      } else {
        _jed('Insert all required information');
      }
    },

    _titleMessage: function () {
      if (this.props.edit) {
        if (this.props.for_package) {
          return _jed('Edit %s', _jed('Package'));
        } else if (this._targetType() == 'license') {
          return _jed('Edit License');
        } else {
          return _jed('Edit Item');
        }
      } else {
        if (this.props.for_package) {
          return _jed('Create %s', _jed('Package'));
        } else if (this._targetType() == 'license') {
          return _jed('Create new software license');
        } else {
          return _jed('Create new item');
        }
      }
    },

    _renderTitle: function () {
      return React.createElement(
        'div',
        { className: 'col1of2' },
        React.createElement(
          'h1',
          { className: 'headline-l' },
          this._titleMessage()
        ),
        React.createElement(
          'h2',
          { className: 'headline-s light' },
          this._subtitleMessage()
        )
      );
    },

    _flatFieldModels: function () {
      return window.FieldModels._flatFieldModels(this.state.fieldModels);
    },

    _isFieldModelForSubmit: function (fieldModel) {
      return fieldModel.field.type != 'attachment' && !fieldModel.field.exclude_from_submit && CreateItemFieldSwitch._isFieldEditable(fieldModel.field, this.props.item);
    },

    _fieldModelsForSubmit: function () {
      var _this5 = this;

      return _.filter(this._flatFieldModels(), function (fieldModel) {
        return _this5._isFieldModelForSubmit(fieldModel);
      });
    },

    _clientValidation: function () {
      return window.CreateItemValidation._clientValidation(this.state.fieldModels);
    },

    _attachmentsFieldModel: function () {
      return _.find(this.state.fieldModels, function (fm) {
        return fm.field.id == 'attachments';
      });
    },

    _attachmentsFileModels: function () {
      if (this._attachmentsFieldModel()) {
        return this._attachmentsFieldModel().value.fileModels;
      } else {
        return [];
      }
    },

    _newAttachementFiles: function () {
      return _.filter(this._attachmentsFileModels(), function (fm) {
        return fm.type == 'new';
      });
    },

    _uploadFile: function (itemId, fileModel, callback) {
      var file = fileModel.file;

      var formData = new FormData();
      formData.append('data', file);
      formData.append('item_id', itemId);

      $.ajax({
        url: this.props.store_attachment_path,
        data: formData,
        contentType: false,
        method: 'POST',
        processData: false
      }).done(function () {
        callback({ result: 'success', fileModel: fileModel });
      }).error(function () {
        callback({ result: 'failure', fileModel: fileModel });
      });
    },

    _uploadFileCallback: function (itemId, fileModels, callback) {
      var _this6 = this;

      return function (answer) {
        if (answer.result != 'success') {
          answer.fileModel.result = 'failure';
        } else {
          answer.fileModel.result = 'success';
        }

        _this6._uploadFiles(itemId, _.rest(fileModels), callback);
      };
    },

    _uploadFiles: function (itemId, fileModels, callback) {
      if (fileModels.length == 0) {
        callback();
        return;
      }

      this._uploadFile(itemId, _.first(fileModels), this._uploadFileCallback(itemId, fileModels, callback));
    },

    _allUploadsSuccessful: function () {
      return _.reduce(this._newAttachementFiles(), function (result, fileModel) {
        return result && fileModel.result == 'success';
      }, true);
    },

    _showAttachmentsHintIfNeeded: function () {
      var message = _jed('%s was saved, but there were problems uploading files', _jed('Item'));
      alert(message);
    },

    _editItemPath: function (itemId) {
      return '/manage/' + this.props.inventory_pool.id + '/items/' + itemId + '/edit';
    },

    _forward: function (redirectUrl, message) {
      var withMessage = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      var defaultMessage = _.string.capitalize(this.props.item_type) + ' saved.';
      var messageToShow = message || defaultMessage;
      var flash = withMessage ? { 'flash[success]': _jed(messageToShow) } : {};
      if (redirectUrl) {
        window.location = setUrlParams(redirectUrl, flash);
      } else {
        window.location = setUrlParams(this.props.inventory_path, flash);
      }
    },

    _submitAttachmentsCallback: function (itemId, redirectUrl) {
      var _this7 = this;

      return function () {
        if (!_this7._allUploadsSuccessful()) {
          _this7._showAttachmentsHintIfNeeded();
          window.location = _this7._editItemPath(itemId);
        } else {
          _this7._forward(redirectUrl, null);
        }
      };
    },

    _submitAttachments: function (itemId, redirectUrl) {
      this._showAttachmentLoadingFlash();

      this._uploadFiles(itemId, this._newAttachementFiles(), this._submitAttachmentsCallback(itemId, redirectUrl));
    },

    _showSuccessFlash: function () {
      App.Flash({
        type: 'error',
        message: _jed('Please provide all required fields')
      });
    },

    _showAttachmentLoadingFlash: function () {
      var modal = new App.Modal($('<div></div>'));
      modal.undestroyable();
      App.Flash({
        type: 'notice',
        message: _jed('Uploading files - please wait'),
        loading: true
      }, 9999);
    },

    _save: function (bypassSerialNumberValidation, copy) {
      var _this8 = this;

      if (!this._clientValidation()) {
        this._showSuccessFlash();
        this.setState({ showInvalids: true });
        return;
      } else {
        App.Flash.reset();
      }

      var isBatch = this._isBatchCreate();

      var data = {
        inventory_pool_id: this.props.inventory_pool.id,
        item: window.SerializeItem._serializeItem(bypassSerialNumberValidation, this._fieldModelsForSubmit())
      };

      if (isBatch) {
        this.setState({ isSaving: true });
        data.quantity = this.state.quantity;
      }

      if (this.props.for_package) {
        data.child_items = _.map(this.state.packageChildItems, function (i) {
          return i.item.id;
        });
      }

      data.item.attachments_attributes = {};
      _.each(this._attachmentsFileModels(), function (fm) {
        if (fm['delete']) {
          data.item.attachments_attributes[fm.id] = {
            id: fm.id,
            _destroy: '1'
          };
        }
      });

      if (copy) {
        data.copy = true;
      }

      var showMessage = !isBatch;

      $.ajax({
        url: isBatch ? this.props.save_multiple_path : this.props.save_path,
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        method: this.props.edit ? 'PUT' : 'POST'
      }).done(function (data) {
        if (_this8._newAttachementFiles().length > 0) {
          _this8._submitAttachments(data.id, data.redirect_url);
        } else {
          _this8._forward(data.redirect_url, null, showMessage);
        }
      }).error(function (res) {
        var data = res && res.responseJSON;
        if (data && data.can_bypass_unique_serial_number_validation) {
          _this8._showSerialNumberModal(res.responseJSON.message, copy);
        } else if (data) {
          _this8._showErrorMessage(res.responseJSON.message);
        } else {
          _this8._showErrorMessage('Unexpected Error!\n' + res.statusText + '\n\n' + res.responseText);
        }
      });
    },

    _onSave: function (event) {
      event.preventDefault();
      this._save(false, false);
    },

    _onSavePackage: function (event) {
      event.preventDefault();

      this._save(true, false);
    },

    _onSaveAndCopy: function (event) {
      event.preventDefault();

      this._save(false, true);
    },

    _onDelete: function (event) {
      var _this9 = this;

      event.preventDefault();

      $.ajax({
        url: this.props.delete_path,
        // data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        method: 'DELETE'
      }).done(function (data) {
        _this9._forward(_this9.props.inventory_path, 'Item deleted.');
      }).error(function (res) {
        var data = res && res.responseJSON;
        if (data) {
          _this9._showErrorMessage(data.message);
        } else {
          _this9._showErrorMessage('Unexpected Error!\n' + res.statusText + '\n\n' + res.responseText);
        }
      });
    },

    _showSerialNumberModal: function (message, copy) {
      var saveAnyway = confirm(message + ' ' + _jed('Save anyway') + '?');
      if (saveAnyway) {
        this._save(true, copy);
      } else {
        // Do nothing
      }
    },

    _saveButtonText: function () {
      if (this.props.for_package) {
        return _jed('Save %s', _jed('Package'));
      } else if (this._targetType() == 'license') {
        return _jed('Save %s', _jed('License'));
      } else {
        return _jed('Save %s', _jed('Item'));
      }
    },

    _isBatchCreate: function () {
      return this.state.quantity > 1;
    },

    _isEditing: function () {
      return !!this.props.edit;
    },

    _renderTitleButtons: function () {
      var displayAllStyle = {};
      displayAllStyle.display = 'none';

      if (this.props.for_package) {
        return React.createElement(
          'div',
          { className: 'col1of2 text-align-right' },
          React.createElement(
            'button',
            {
              onClick: this._onShowAll,
              className: 'button white',
              'data-placement': 'top',
              'data-toggle': 'tooltip',
              id: 'show-all-fields',
              style: displayAllStyle,
              title: 'Alle versteckten Felder wieder anzeigen' },
            'Alle Felder anzeigen'
          ),
          React.createElement(
            'a',
            {
              className: 'button grey',
              href: this.props.return_url ? this.props.return_url : this.props.inventory_path },
            _jed('Cancel')
          ),
          React.createElement(
            'button',
            {
              autoComplete: 'off',
              className: 'button green',
              id: 'save',
              onClick: this._onSavePackage },
            this._saveButtonText()
          )
        );
      }

      var isSaving = !!this.state.isSaving;
      var mainButton = this._isBatchCreate() ? React.createElement(
        'button',
        { className: 'button green', id: 'save', onClick: this._onSave, disabled: isSaving },
        ' ',
        this.state.quantity,
        ' × ',
        this._saveButtonText(),
        ' ',
        isSaving && React.createElement('i', { className: 'fa fa-spinner fa-spin' })
      ) : React.createElement(
        'div',
        { className: 'multibutton' },
        React.createElement(
          'button',
          { autoComplete: 'off', className: 'button green', id: 'save', onClick: this._onSave },
          this._saveButtonText()
        ),
        React.createElement(
          'div',
          { className: 'dropdown-holder inline-block' },
          React.createElement(
            'div',
            { className: 'button green dropdown-toggle' },
            React.createElement('div', { className: 'arrow down' })
          ),
          React.createElement(
            'ul',
            { className: 'dropdown right', style: { display: 'none' } },
            React.createElement(
              'li',
              null,
              React.createElement(
                'a',
                { className: 'dropdown-item', id: 'item-save-and-copy', onClick: this._onSaveAndCopy },
                React.createElement('i', { className: 'fa fa-copy' }),
                ' ' + _jed('Save and copy')
              ),
              this.props.can_destroy && React.createElement(
                'a',
                { className: 'dropdown-item red', id: 'item-delete', onClick: this._onDelete },
                React.createElement('i', { className: 'fa fa-trash' }),
                " " + _jed("Delete")
              )
            )
          )
        )
      );

      return React.createElement(
        'div',
        { className: 'col1of2 text-align-right' },
        React.createElement(
          'button',
          {
            onClick: this._onShowAll,
            className: 'button white',
            'data-placement': 'top',
            'data-toggle': 'tooltip',
            id: 'show-all-fields',
            style: displayAllStyle,
            title: 'Alle versteckten Felder wieder anzeigen' },
          'Alle Felder anzeigen'
        ),
        React.createElement(
          'a',
          {
            className: 'button grey',
            href: this.props.return_url ? this.props.return_url : this.props.inventory_path },
          _jed('Cancel')
        ),
        mainButton
      );
    },

    _renderTitleButtonsIfReady: function () {
      if (this._fieldsReady()) {
        return this._renderTitleButtons();
      } else {
        return null;
      }
    },

    _renderTitleAndButtons: function () {
      return React.createElement(
        'div',
        { className: 'margin-top-l padding-horizontal-m' },
        React.createElement(
          'div',
          { className: 'row' },
          this._renderTitle(),
          this._renderTitleButtonsIfReady()
        )
      );
    },

    _showErrorMessage: function (message) {
      this.setState({
        showError: true,
        errorMessage: message
      });
    },

    _renderErrorMessage: function () {
      var _this10 = this;

      if (this.state.showError) {
        var onClick = function (event) {
          event.preventDefault();
          _this10.setState({ showError: false, errorMessage: '' });
        };

        return React.createElement(
          'div',
          {
            id: 'error-modal',
            style: {
              position: 'absolute',
              top: '0px',
              bottom: '0px',
              left: '0px',
              right: '0px',
              zIndex: '100000'
            } },
          React.createElement('div', {
            style: {
              opacity: '0.8',
              position: 'fixed',
              top: '0',
              right: '0',
              bottom: '0',
              left: '0',
              zIndex: '2000',
              backgroundColor: '#000000'
            }
          }),
          React.createElement(
            'div',
            {
              style: {
                position: 'fixed',
                zIndex: '1000000',
                overflow: 'scroll',
                top: '0px',
                left: '0px',
                bottom: '0px',
                right: '0px'
              } },
            React.createElement(
              'div',
              {
                style: {
                  position: 'static',
                  marginTop: '100px',
                  marginBottom: '100px',
                  overflow: 'visible'
                } },
              React.createElement(
                'div',
                {
                  style: {
                    position: 'static',
                    zIndex: '1000000',
                    margin: 'auto',
                    top: '10%',
                    left: '50%',
                    width: '560px',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    boxShadow: '0 3px 7px rgba(0, 0, 0, 0.3)',
                    backgroundClip: 'padding-box',
                    outline: 'none'
                  } },
                React.createElement(
                  'div',
                  { style: { fontSize: '1.2em', padding: '20px' } },
                  this.state.errorMessage,
                  React.createElement(
                    'div',
                    { className: 'row text-align-right' },
                    React.createElement(
                      'button',
                      { type: 'button', className: 'button small white', onClick: onClick },
                      'Close'
                    )
                  )
                )
              )
            )
          )
        );
      } else {
        return null;
      }
    },

    render: function () {
      return React.createElement(
        'div',
        { className: 'row content-wrapper min-height-xl min-width-full straight-top' },
        this._renderErrorMessage(),
        this._renderTitleAndButtons(),
        this._content()
      );
    }
  });

  window.CreateItem.displayName = 'CreateItem';
})();
;(function () {
  /* global _ */
  /* global _jed */
  /* global App */

  /* global React */
  /* global BasicAutocomplete, RenderCreateItem, CreateItemFieldSwitch */

  window.CreateItemContent = window.createReactClass({
    propTypes: {},

    _attachInputForBarcodeScanner: function () {
      if (window && this.refs) window.reactBarcodeScannerTarget = this.refs['create-item-autocomplete'];
    },
    componentDidMount: function () {
      this._attachInputForBarcodeScanner();
    },
    componentDidUpdate: function () {
      this._attachInputForBarcodeScanner();
    },

    _isItemOwner: function () {
      var owner = this.props.createItemProps.item.owner;
      return owner.id == App.InventoryPool.current.id;
    },

    _renderModelLabel: function (parent) {
      return parent.model.product + (parent.model.version ? ' ' + parent.model.version : '') + ' ' + parent.inventory_code;
    },

    _renderPackageInfo: function () {
      if (this.props.createItemProps.parent) {
        var parent = this.props.createItemProps.parent;
        return React.createElement(
          'div',
          { className: 'padding-bottom-m' },
          React.createElement(
            'div',
            { className: 'row emboss notice text-align-center font-size-m padding-inset-s' },
            React.createElement(
              'strong',
              null,
              _jed('Item is part of package'),
              ': '
            ),
            React.createElement(
              'a',
              { className: 'white', href: parent.edit_path },
              this._renderModelLabel(parent.json)
            )
          )
        );
      } else {
        return null;
      }
    },

    _renderChildrenInfo: function () {
      var _this = this;

      if (this.props.createItemProps.children) {
        var children = this.props.createItemProps.children;

        var childLinks = children.map(function (child) {
          return React.createElement(
            'a',
            { key: child.json.id, className: 'row white', href: child.edit_path },
            _this._renderModelLabel(child.json)
          );
        });

        return React.createElement(
          'div',
          { className: 'padding-bottom-m' },
          React.createElement(
            'div',
            { className: 'row emboss notice text-align-center font-size-m padding-inset-s' },
            React.createElement(
              'strong',
              null,
              _jed('This is a package containing the following items'),
              ': '
            ),
            childLinks
          )
        );
      } else {
        return null;
      }
    },

    _renderNotOwner: function () {
      if (this.props.createItemProps.item && !this._isItemOwner()) {
        return React.createElement(
          'div',
          { className: 'padding-bottom-m' },
          React.createElement(
            'div',
            { className: 'row emboss notice text-align-center font-size-m padding-inset-s' },
            React.createElement(
              'strong',
              null,
              _jed('You are not the owner of this item'),
              ': '
            ),
            _jed('therefore you may not be able to change some of these fields')
          )
        );
      } else {
        return null;
      }
    },

    _renderNotifications: function () {
      return React.createElement(
        'div',
        { className: 'padding-vertical-m', id: 'notifications' },
        this._renderPackageInfo(),
        this._renderChildrenInfo(),
        this._renderNotOwner()
      );
    },

    _isLicense: function () {
      return this.props.createItemProps.item_type == 'license';
    },

    _hasTechnicalDetail: function () {
      if (!this.props.createItemProps.item) {
        return false;
      } else {
        return !_.isEmpty(this.props.createItemProps.item.model.technical_detail);
      }
    },

    _hasAttachments: function () {
      return !_.isEmpty(this.props.createItemProps.model_attachments);
    },

    _technicalDetailLines: function () {
      return this.props.createItemProps.item.model.technical_detail.split('\r\n');
    },

    _technicalDetailLinesWithLinks: function () {
      var _this2 = this;

      return _.filter(this._technicalDetailLines(), function (line) {
        return _this2._lineHasLink(line);
      });
    },

    _linkRegex: function () {
      return (/(https?:\S*)/gi
      );
    },

    _emailRegex: function () {
      return (/(\S+@\S+\.\S+)/gi
      );
    },

    _lineHasLink: function (line) {
      return line.match(this._linkRegex()) || line.match(this._emailRegex());
    },

    _renderTechnicalDetailLine: function (line, index) {
      var innerHtml = line.replace(this._linkRegex(), "<a href='$1' target='_blank'>$1</a>").replace(this._emailRegex(), "<a href='mailto:$1'>$1</a>");
      return React.createElement('div', {
        key: 'technical_detail_' + index,
        className: 'row line font-size-m padding-inset-s',
        dangerouslySetInnerHTML: { __html: innerHtml } });
    },

    _renderTechnicalDetailLines: function () {
      var _this3 = this;

      return this._technicalDetailLinesWithLinks().map(function (line, index) {
        return _this3._renderTechnicalDetailLine(line, index);
      });
    },

    _renderTechnicalDetail: function () {
      if (this._hasTechnicalDetail()) {
        return React.createElement(
          'div',
          { key: 'technical_detail', className: 'col1of2 padding-right-xs' },
          React.createElement(
            'div',
            { className: 'field row emboss margin-vertical-xxs margin-right-xs' },
            React.createElement(
              'div',
              { className: 'row padding-inset-xs' },
              React.createElement(
                'div',
                { className: 'col1of2 padding-vertical-xs' },
                React.createElement(
                  'strong',
                  { className: 'font-size-m inline-block' },
                  _jed('Software Informationen')
                )
              ),
              React.createElement(
                'div',
                { className: 'col1of2' },
                React.createElement('textarea', {
                  autoComplete: 'off',
                  className: 'width-full',
                  disabled: true,
                  name: 'model[technical_detail]',
                  rows: '6',
                  type: 'text',
                  defaultValue: this.props.createItemProps.item.model.technical_detail
                })
              )
            ),
            React.createElement(
              'div',
              { className: 'list-of-lines even padding-bottom-xxs' },
              this._renderTechnicalDetailLines()
            )
          )
        );
      } else {
        return null;
      }
    },

    _renderAttachmentsRows: function () {
      return this.props.createItemProps.model_attachments.map(function (a, index) {
        return React.createElement(
          'div',
          {
            key: 'attachment_' + index,
            className: 'row line font-size-xs focus-hover-thin',
            'data-type': 'inline-entry' },
          React.createElement(
            'div',
            { className: 'line-col col7of10 text-align-left' },
            React.createElement(
              'a',
              { className: 'blue', href: a.public_filename, target: '_blank' },
              a.filename
            )
          ),
          React.createElement('div', { className: 'line-col col3of10 text-align-right' })
        );
      });
    },

    _renderAttachments: function () {
      if (this._hasAttachments()) {
        return React.createElement(
          'div',
          { key: 'attachments', className: 'col1of2 padding-right-xs' },
          React.createElement(
            'div',
            { id: 'attachments' },
            React.createElement(
              'div',
              { className: 'field row emboss margin-vertical-xxs margin-right-xs' },
              React.createElement(
                'div',
                { className: 'row padding-inset-xs' },
                React.createElement(
                  'div',
                  { className: 'col1of2 padding-vertical-xs' },
                  React.createElement(
                    'strong',
                    { className: 'font-size-m inline-block' },
                    _jed('Attachments')
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'col1of2' },
                  React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement('div', { className: 'col1of3' })
                  )
                )
              ),
              React.createElement(
                'div',
                { className: 'list-of-lines even padding-bottom-xxs' },
                this._renderAttachmentsRows()
              )
            )
          )
        );
      } else {
        return null;
      }
    },

    _renderSoftwareDetail: function () {
      if (this._isLicense() && (this._hasTechnicalDetail() || this._hasAttachments())) {
        return _.compact([React.createElement('div', { key: 'separator', className: 'separated-top margin-bottom-m' }), React.createElement(
          'h2',
          { key: 'title', className: 'headline-m padding-bottom-m', style: { clear: 'both' } },
          'Software'
        ), React.createElement(
          'div',
          { key: 'content', className: 'row margin-bottom-l' },
          this._renderTechnicalDetail(),
          this._renderAttachments()
        )]);
      } else {
        return null;
      }
    },

    _renderAutocomplete: function () {
      var _this4 = this;

      var l = window.lodash;

      var makeCall = function (term, callback) {
        // NOTE: only search when there is a search term!
        if (l.isEmpty(term)) return false;

        window.leihsAjax.getAjax('/manage/' + _this4.props.createItemProps.inventory_pool.id + '/items?paginate=true&search_term=' + term + '&not_packaged=true&packages=false&retired=false', {}, function (status, response) {
          var ids = l.join(l.map(response, function (r) {
            return '&' + encodeURIComponent('ids[]') + '=' + r.model_id;
          }), '');

          if (ids.length > 0) {
            window.leihsAjax.getAjax('/manage/' + _this4.props.createItemProps.inventory_pool.id + '/models?paginate=false' + ids, {}, function (status2, response2) {
              callback(_.map(response, function (r) {
                var model = l.find(response2, function (m) {
                  return m.id == r.model_id;
                });

                return {
                  id: r.id,
                  label: r.inventory_code,
                  currentLocation: r.current_location,
                  inventoryCode: r.inventory_code,
                  value: {
                    item: l.cloneDeep(r),
                    model: l.cloneDeep(model)
                  }
                };
              }));
            });
          } else {
            callback([]);
          }
        });
      };

      var liARenderer = function (row) {
        return React.createElement(
          'a',
          { className: 'ui-menu-item-wrapper' },
          React.createElement(
            'div',
            { className: 'row text-ellipsis' },
            React.createElement(
              'div',
              { className: 'col1of3' },
              React.createElement(
                'strong',
                null,
                row.inventoryCode
              )
            ),
            React.createElement(
              'div',
              { className: 'col2of3 text-ellipsis', title: _this4._renderModelName(row.value.model) },
              _this4._renderModelName(row.value.model)
            )
          )
        );
      };

      return(
        // eslint-disable-next-line react/jsx-no-undef
        React.createElement(BasicAutocomplete,
        // eslint-disable-next-line react/no-string-refs
        { ref: 'create-item-autocomplete',
          inputClassName: 'has-addon width-full',
          element: 'div',
          inputId: 'search-item',
          dropdownWidth: '424px',
          label: '',
          _makeCall: makeCall,
          onChange: this.props.onSelectChildItem,
          wrapperStyle: { display: 'inline-block', clear: 'none', marginRight: '10px' },
          liARenderer: liARenderer,
          resetAfterSelection: true
        })
      );
    },

    _renderModelName: function (model) {
      if (model.version) {
        return model.product + ' ' + model.version;
      } else {
        return model.product;
      }
    },

    _renderSelectedItems: function () {
      var _this5 = this;

      return _.map(this.props.packageChildItems, function (i) {
        return React.createElement(
          'div',
          {
            key: i.item.id,
            className: 'row emboss padding-bottom-xxs margin-bottom-xxs',
            'data-id': '00231cb7-331d-4bf4-94f8-a22c5a1f03b0',
            'data-new': '',
            'data-type': 'inline-entry' },
          React.createElement(
            'div',
            { className: 'row padding-inset-xxs' },
            React.createElement(
              'div',
              { className: 'col1of4 padding-left-s padding-top-xs' },
              React.createElement(
                'strong',
                { className: 'font-size-m inline-block' },
                i.item.inventory_code
              )
            ),
            React.createElement(
              'div',
              { className: 'col2of4 padding-top-xs' },
              _this5._renderModelName(i.model)
            ),
            React.createElement(
              'div',
              { className: 'col1of4 text-align-right' },
              React.createElement(
                'button',
                {
                  onClick: function () {
                    return _this5.props.onRemoveChildItem(i.item.id);
                  },
                  className: 'button small inset',
                  'data-remove': '',
                  type: 'button' },
                _jed('Remove')
              )
            )
          )
        );
      });
    },

    _renderPackageTitle: function () {
      if (!this.props.createItemProps.for_package) {
        return null;
      }

      return React.createElement(
        'h2',
        { className: 'headline-m padding-bottom-m' },
        _jed('Package')
      );
    },

    _renderPackageSelectItem: function () {
      if (!this.props.createItemProps.for_package) {
        return null;
      }

      return React.createElement(
        'div',
        { className: 'margin-bottom-m' },
        React.createElement(
          'h2',
          { className: 'headline-m padding-bottom-m' },
          _jed('Content')
        ),
        React.createElement(
          'div',
          { className: 'row emboss margin-vertical-xxs margin-right-xs' },
          React.createElement(
            'div',
            { className: 'row padding-inset-xs' },
            React.createElement(
              'div',
              { className: 'col1of2 padding-vertical-xs' },
              React.createElement(
                'strong',
                { className: 'font-size-m inline-block' },
                _jed('Add %s', _jed('Item'))
              )
            ),
            React.createElement(
              'div',
              { className: 'col1of2' },
              React.createElement(
                'div',
                { className: 'row' },
                this._renderAutocomplete()
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'row', id: 'items' },
          this._renderSelectedItems()
        )
      );
    },

    render: function () {
      var createItemProps = this.props.createItemProps;
      var quantitySelector = this.props.quantitySelector || null;

      var fieldRenderer = function (fieldModel, _fieldModels, onChange, showInvalids, onClose, dependencyValue, dataDependency) {
        var item = createItemProps.item;
        var inventoryCodeProps = {
          next_code: createItemProps.next_code,
          lowest_code: createItemProps.lowest_code,
          highest_code: createItemProps.highest_code
        };

        return CreateItemFieldSwitch.renderField(fieldModel, dependencyValue, dataDependency, function (value) {
          return onChange(fieldModel.field.id, value);
        }, item, inventoryCodeProps, showInvalids, onClose, true);
      };

      var formClass = null;
      if (this.props.createItemProps.for_package) {
        formClass = 'padding-top-s';
      }

      return React.createElement(
        'div',
        { className: 'ui-create-item-content padding-horizontal-m' },
        this._renderNotifications(),
        this._renderPackageSelectItem(),
        React.createElement(
          'form',
          { id: 'form', className: formClass },
          this._renderPackageTitle(),
          React.createElement('input', { disabled: 'disabled', name: 'copy', type: 'hidden' }),
          RenderCreateItem._renderColumns(this.props.fields, this.props.fieldModels, this.props.onChange, this.props.showInvalids, this.props.onClose, fieldRenderer, quantitySelector)
        ),
        this._renderSoftwareDetail()
      );
    }
  });

  window.CreateItemContent.displayName = 'CreateItemContent';
})();
;(function () {
  // NOTE: only for linter and clarity:
  /* global _, _jed, moment, accounting, i18n, React, PropTypes, App, CreateItemFieldSwitch, RenderFieldLabel, InputInventoryCode, InputCheckbox, InputInventoryCode, InputQuantityAllocations, InputAttachment, InputText, InputAutocompleteSearch, InputAutocomplete, InputTextarea, InputSelect, InputRadio, InputDate, InputCheckbox */

  window.CreateItemFieldSwitch = {
    // contextTypes: {
    //   isBatchCreate: PropTypes.bool
    // },

    _hasValue: function (selectedValue) {
      if (selectedValue.field.id == 'properties_quantity_allocations') {
        return selectedValue.value.allocations.length > 0;
      }

      switch (selectedValue.field.type) {
        case 'text':
          return selectedValue.value.text.trim().length > 0;
        case 'autocomplete-search':
          return selectedValue.value.id != null || selectedValue.value.text != '';
        case 'autocomplete':
          return selectedValue.value.id != null || selectedValue.value.text != '';
        case 'textarea':
          return selectedValue.value.text.trim().length > 0;
        case 'select':
          return selectedValue.value.selection != null && selectedValue.value.selection != '';
        case 'radio':
          return selectedValue.value.selection != null;
        case 'date':
          return selectedValue.value.at.trim().length > 0;
        case 'checkbox':
          return selectedValue.value.selections.length > 0;
        case 'attachment':
          return selectedValue.value.fileModels.length > 0;
        default:
          throw 'Unexpected type: ' + selectedValue.field.type;
      }
    },

    _dmyToString: function (dmy) {
      if (dmy) {
        var dayString = '' + (dmy.day + 1);
        var monthString = '' + (dmy.month + 1);
        var yearString = '' + dmy.year;

        if (dayString.length == 1) {
          dayString = '0' + dayString;
        }
        if (monthString.length == 1) {
          monthString = '0' + monthString;
        }

        return yearString + '-' + monthString + '-' + dayString;
      } else {
        return null;
      }
    },

    _parseSavedDate: function (string) {
      var mom = moment(string, 'YYYY-MM-DD', true);
      if (!mom.isValid()) {
        return string;
      } else {
        return mom.format(i18n.date.L);
      }
    },

    _parseDayMonthYear: function (string) {
      if (!string) {
        return null;
      }

      var mom = moment(string, i18n.date.L, true);

      if (!mom.isValid()) {
        return null;
      }

      return this._getDayMonthYear(mom);
    },

    _getDayMonthYear: function (mom) {
      return {
        day: mom.date() - 1,
        month: mom.month(),
        year: mom.year()
      };
    },

    _checkDateStringIsValid: function (d) {
      return moment(d, i18n.date.L, true).isValid();
    },

    _isValid: function (selectedValue) {
      if (selectedValue.field.type == 'date') {
        var d = selectedValue.value.at;
        return this._checkDateStringIsValid(d);
      } else if (selectedValue.field.type == 'autocomplete') {
        return selectedValue.value.text != '' && selectedValue.value.id || selectedValue.value.text == '' && !selectedValue.value.id;
      } else if (selectedValue.field.type == 'autocomplete-search') {
        return selectedValue.value.text != '' && selectedValue.value.id || selectedValue.value.text == '' && !selectedValue.value.id;
      } else {
        return true;
      }
    },

    _itemValue: function (attribute, item) {
      var itemValue = null;
      if (attribute instanceof Array) {
        itemValue = _.reduce(attribute, function (result, current) {
          if (result) {
            return result[current];
          } else {
            return null;
          }
        }, item);
      } else {
        itemValue = item[attribute];
      }

      return itemValue;
    },

    _createEditValue: function (field, item, itemValue, attachments) {
      if (field.id == 'retired') {
        itemValue = !!itemValue;
      }

      if (field.id == 'properties_quantity_allocations') {
        return {
          allocations: itemValue.map(function (v) {
            return {
              quantity: v.quantity,
              location: v.room,
              type: 'edit'
            };
          })
        };
      }

      var text;

      switch (field.type) {
        case 'text':
          if (field.currency) {
            return {
              text: accounting.formatMoney(itemValue, { format: '%v' })
            };
          } else {
            return { text: itemValue };
          }
        case 'autocomplete-search':
          var base = this._itemValue(field.item_value_label, item);
          var ext = this._itemValue(field.item_value_label_ext, item);
          text = base + (ext ? ' ' + ext : '');
          return {
            text: text,
            id: itemValue
          };
        case 'autocomplete':
          text = null;
          if (field.id == 'room_id') {
            text = item.room.name + (!!item.room.description ? ' (' + item.room.description + ')' : '');
          } else {
            if (itemValue) {
              var value = _.find(field.values, function (v) {
                return v.value == itemValue;
              });
              if (value) text = value.label;
            }
          }
          return {
            text: text,
            id: itemValue
          };
        case 'textarea':
          return { text: itemValue };
        case 'attachment':
          var fileModels = attachments.map(function (a) {
            return {
              type: 'edit',
              id: a.id,
              public_filename: a.public_filename,
              filename: a.filename,
              'delete': false,
              content_type: a.content_type
            };
          });
          return { fileModels: fileModels };
        case 'select':
          // TODO read mapping to values from field definition
          // debugger
          return { selection: itemValue };
        case 'radio':
          return { selection: itemValue };
        case 'checkbox':
          return { selections: itemValue };
        case 'date':
          return { at: this._parseSavedDate(itemValue) };
        default:
          throw 'Unexpected type: ' + field.type;
      }
    },

    _createEmptyValue: function (field) {
      if (field.id == 'properties_quantity_allocations') {
        return {
          allocations: []
        };
      }

      switch (field.type) {
        case 'text':
          return { text: '' };
        case 'autocomplete-search':
          return {
            text: '',
            id: null
          };
        case 'autocomplete':
          return {
            text: '',
            id: null
          };
        case 'textarea':
          return { text: '' };
        case 'attachment':
          return { fileModels: [] };
        case 'select':
          return { selection: field['default'] };
        case 'radio':
          return { selection: field['default'] };
        case 'date':
          return { at: '' };
        case 'checkbox':
          return { selections: [] };
        default:
          throw 'Unexpected type ' + field.type + ' for field ' + field.id;
      }
    },

    _hasValidValue: function (selectedValue) {
      return CreateItemFieldSwitch._hasValue(selectedValue) && CreateItemFieldSwitch._isValid(selectedValue);
    },

    _isDependencyValue: function (selectedValue, fieldDependencyValue) {
      if (!fieldDependencyValue) {
        return this._hasValidValue(selectedValue);
      }

      switch (selectedValue.field.type) {
        case 'text':
          return selectedValue.value.text == fieldDependencyValue;
        case 'autocomplete-search':
          return selectedValue.value.text == fieldDependencyValue;
        case 'autocomplete':
          return selectedValue.value.id == fieldDependencyValue;
        case 'textarea':
          return selectedValue.value.text == fieldDependencyValue;
        case 'select':
          return '' + selectedValue.value.selection == fieldDependencyValue;
        case 'radio':
          return '' + selectedValue.value.selection == fieldDependencyValue;
        // case 'checkbox':
        //   return true
        //   break
        case 'date':
          throw 'Not implemented yet for date.';
        default:
          throw 'Unexpected type: ' + selectedValue.field.type;
      }
    },

    _outputByType: function (selectedValue) {
      if (selectedValue.field.id == 'properties_quantity_allocations') {
        return React.createElement(
          'div',
          { className: 'col1of2', 'data-type': 'value' },
          React.createElement(
            'div',
            { className: 'padding-vertical-xs font-size-m', 'data-value': 'invoice' },
            React.createElement(
              'span',
              null,
              'Only visible if owner'
            )
          )
        );
      }

      var type = selectedValue.field.type;
      var label, value;

      if (type == 'text' || type == 'textarea') {
        return React.createElement(
          'div',
          { className: 'col1of2', 'data-type': 'value' },
          React.createElement(
            'div',
            { className: 'padding-vertical-xs font-size-m', 'data-value': 'invoice' },
            React.createElement(
              'span',
              null,
              selectedValue.value.text
            )
          )
        );
      } else if (type == 'date') {
        return React.createElement(
          'div',
          { className: 'col1of2', 'data-type': 'value' },
          React.createElement(
            'div',
            { className: 'padding-vertical-xs font-size-m', 'data-value': 'invoice' },
            React.createElement(
              'span',
              null,
              selectedValue.value.at
            )
          )
        );
      } else if (type == 'radio' || type == 'select') {
        label = _.find(selectedValue.field.values, function (value) {
          return value.value == selectedValue.value.selection;
        }).label;

        return React.createElement(
          'div',
          { className: 'col1of2', 'data-type': 'value' },
          React.createElement(
            'div',
            { className: 'padding-vertical-xs font-size-m', 'data-value': 'invoice' },
            React.createElement(
              'span',
              null,
              _jed(label)
            )
          )
        );
      } else if (type == 'checkbox') {
        var labels = selectedValue.value.selections.map(function (s) {
          var value = _.find(selectedValue.field.values, function (value) {
            return value.value == s;
          });
          if (value) {
            return _jed(value.label);
          } else {
            return s;
          }
        }).join(', ');

        return React.createElement(
          'div',
          { className: 'col1of2', 'data-type': 'value' },
          React.createElement(
            'div',
            { className: 'padding-vertical-xs font-size-m', 'data-value': 'invoice' },
            React.createElement(
              'span',
              null,
              labels
            )
          )
        );
      } else if (type == 'autocomplete') {
        value = selectedValue.value;
        // _.find(selectedValue.field.values, (value) => {
        //   return value.value == selectedValue.value.id
        // })

        label = '';
        if (value) {
          label = value.text;
        } else {
          // debugger
        }

        return React.createElement(
          'div',
          { className: 'col1of2', 'data-type': 'value' },
          React.createElement(
            'div',
            { className: 'padding-vertical-xs font-size-m', 'data-value': 'invoice' },
            React.createElement(
              'span',
              null,
              label
            )
          )
        );
      } else if (type == 'autocomplete-search') {
        value = selectedValue.value;

        label = '';
        if (value) {
          label = value.text;
        }

        return React.createElement(
          'div',
          { className: 'col1of2', 'data-type': 'value' },
          React.createElement(
            'div',
            { className: 'padding-vertical-xs font-size-m', 'data-value': 'invoice' },
            React.createElement(
              'span',
              null,
              label
            )
          )
        );
      } else {
        throw 'Not implemented for: ' + type;
      }
    },

    _inputByType: function (selectedValue, onChangeSelectedValue, dependencyValue) {
      switch (selectedValue.field.type) {
        case 'text':
          return React.createElement(InputText, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        case 'autocomplete-search':
          return React.createElement(InputAutocompleteSearch, {
            onChange: onChangeSelectedValue,
            selectedValue: selectedValue
          });
        case 'autocomplete':
          return React.createElement(InputAutocomplete, {
            selectedValue: selectedValue,
            dependencyValue: dependencyValue,
            onChange: onChangeSelectedValue
          });
        case 'textarea':
          return React.createElement(InputTextarea, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        case 'select':
          return React.createElement(InputSelect, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        case 'radio':
          return React.createElement(InputRadio, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        case 'date':
          return React.createElement(InputDate, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        case 'checkbox':
          return React.createElement(InputCheckbox, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        // case 'attachment':
        //   return <InputAttachment selectedValue={selectedValue} onChange={onChangeSelectedValue} />
        //   break
        default:
          throw 'Unexpected type: ' + selectedValue.field.type;
      }
    },

    _isFieldInvalid: function (fieldModel) {
      if (fieldModel.field.required) {
        return !this._hasValue(fieldModel) || !this._isValid(fieldModel);
      } else {
        return this._hasValue(fieldModel) && !this._isValid(fieldModel);
      }
    },

    _isFieldEditable: function (field, item) {
      if (!item) {
        return true;
      }

      var editable;

      editable = true;

      if (field.permissions != null && typeof item !== 'undefined' && item !== null) {
        if (field.permissions.role != null && !App.AccessRight.atLeastRole(App.User.current.role, field.permissions.role)) {
          editable = false;
        }
        if (field.permissions.owner != null && field.permissions.owner && item.owner != null && App.InventoryPool.current.id !== item.owner.id) {
          editable = false;
        }
      }

      return editable;
    },

    _renderFileRows: function (selectedValue) {
      var _this = this;

      return selectedValue.value.fileModels.map(function (fileModel, index) {
        return _this._renderFileRow(fileModel, index);
      });
    },

    _renderFilename: function (fileModel) {
      return React.createElement(
        'a',
        { className: 'blue', href: fileModel.public_filename, target: '_blank' },
        fileModel.filename
      );
    },

    _renderFileRow: function (fileModel, index) {
      return React.createElement(
        'div',
        {
          key: 'key_' + index,
          className: 'row line font-size-xs focus-hover-thin',
          'data-type': 'inline-entry' },
        React.createElement(
          'div',
          { className: 'line-col col7of10 text-align-left' },
          this._renderFilename(fileModel)
        ),
        React.createElement('div', { className: 'line-col col3of10 text-align-right' })
      );
    },

    _requiredString: function (selectedValue) {
      if (selectedValue.field.required) {
        return 'true';
      } else {
        return 'false';
      }
    },

    _renderOutputField: function (selectedValue, dependencyValue, dataDependency, onChange, showInvalids, onClose, config) {
      var fieldClass;
      if (selectedValue.field.type == 'attachment') {
        fieldClass = 'field row emboss padding-inset-xs margin-vertical-xxs margin-right-xs';
        if (selectedValue.hidden) {
          fieldClass += ' hidden';
        }

        return React.createElement(
          'div',
          {
            className: fieldClass,
            'data-editable': 'true',
            'data-id': 'attachments',
            'data-required': this._requiredString(selectedValue),
            'data-type': 'field' },
          React.createElement(
            'div',
            { className: 'row' },
            RenderFieldLabel._renderFieldLabel(selectedValue.field, onClose, config.showClose),
            React.createElement(
              'div',
              { className: 'col1of2', 'data-type': 'value' },
              React.createElement('div', { className: 'padding-vertical-xs font-size-m' })
            )
          ),
          React.createElement(
            'div',
            { className: 'list-of-lines even padding-bottom-xxs' },
            this._renderFileRows(selectedValue)
          )
        );
      } else {
        fieldClass = 'field row emboss padding-inset-xs margin-vertical-xxs margin-right-xs';
        if (selectedValue.hidden) {
          fieldClass += ' hidden';
        }
        if (config && config.additionalRowClass) {
          fieldClass += ' ' + config.additionalRowClass;
        }

        return React.createElement(
          'div',
          {
            className: fieldClass,
            'data-editable': 'false',
            'data-id': selectedValue.field.id,
            'data-required': this._requiredString(selectedValue),
            'data-type': 'field' },
          React.createElement(
            'div',
            { className: 'row' },
            RenderFieldLabel._renderFieldLabel(selectedValue.field, onClose, config.showClose),
            this._outputByType(selectedValue)
          )
        );
      }
    },

    _renderInputField: function (selectedValue, dependencyValue, dataDependency, onChange, showInvalids, onClose, config) {
      var error = showInvalids && this._isFieldInvalid(selectedValue);

      if (selectedValue.field.id == 'properties_quantity_allocations') {
        return React.createElement(InputQuantityAllocations, {
          onClose: onClose,
          selectedValue: selectedValue,
          dataDependency: dataDependency,
          onChange: onChange,
          error: error
        });
      } else if (selectedValue.field.id == 'inventory_code') {
        return React.createElement(InputInventoryCode, {
          onClose: onClose,
          selectedValue: selectedValue,
          onChange: onChange,
          inventoryCodeProps: null,
          error: error,
          editMode: true
        });
      } else if (selectedValue.field.type == 'attachment') {
        return React.createElement(InputAttachment, {
          onClose: onClose,
          selectedValue: selectedValue,
          onChange: onChange,
          error: error
        });
      } else {
        var fieldClass = 'field row emboss padding-inset-xs margin-vertical-xxs margin-right-xs';
        if (error) {
          fieldClass += ' error';
        }
        if (selectedValue.hidden) {
          fieldClass += ' hidden';
        }
        if (config && config.additionalRowClass) {
          fieldClass += ' ' + config.additionalRowClass;
        }

        return React.createElement(
          'div',
          {
            className: fieldClass,
            'data-editable': 'true',
            'data-id': selectedValue.field.id,
            'data-required': this._requiredString(selectedValue),
            'data-type': 'field' },
          React.createElement(
            'div',
            { className: 'row' },
            RenderFieldLabel._renderFieldLabel(selectedValue.field, onClose, config.showClose),
            this._inputByType(selectedValue, onChange, dependencyValue)
          )
        );
      }
    },

    renderField: function (selectedValue, dependencyValue, dataDependency, onChange, item, inventoryCodeProps, showInvalids, onClose, showClose) {
      var isEditable = !item || item && this._isFieldEditable(selectedValue.field, item);

      if (isEditable) {
        if (selectedValue.field.id == 'inventory_code' && !item) {
          var error = showInvalids && this._isFieldInvalid(selectedValue);
          return React.createElement(InputInventoryCode, {
            onClose: onClose,
            selectedValue: selectedValue,
            onChange: onChange,
            inventoryCodeProps: inventoryCodeProps,
            error: error,
            editMode: false
          });
        } else {
          return this._renderInputField(selectedValue, dependencyValue, dataDependency, onChange, showInvalids, onClose, { showClose: showClose });
        }
      } else {
        return this._renderOutputField(selectedValue, dependencyValue, dataDependency, onChange, showInvalids, onClose, { showClose: showClose });
      }
    }
  };

  window.CreateItemFieldSwitch.displayName = 'CreateItemFieldSwitch';
})();
window.CreateItemValidation = {

  _clientValidation: function (fieldModels) {
    var _this = this;

    return _.reduce(fieldModels, function (memo, fm) {
      return memo && _this._isValid(fm);
    }, true);
  },

  _isValid: function (fieldModel) {
    var _this2 = this;

    var isValid = !CreateItemFieldSwitch._isFieldInvalid(fieldModel);

    return _.reduce(fieldModel.dependents, function (memo, dep) {
      return memo && _this2._isValid(dep);
    }, isValid);
  }

};
window.FieldModels = {

  _getTodayAsString: function () {
    return moment().format(i18n.date.L);
  },

  _createEmptyValue: function (field, next_code, inventory_pool) {
    if (field.id == 'inventory_code') {
      return { text: next_code };
    } else if (field.id == 'owner_id') {
      return {
        text: inventory_pool.name,
        id: inventory_pool.id
      };
    } else if (field.id == 'last_check') {

      return {
        at: this._getTodayAsString()
      };
    } else {
      return window.CreateItemFieldSwitch._createEmptyValue(field);
    }
  },

  _itemValue: function (field, item) {

    var itemValue = null;

    if (field.form_name) {
      itemValue = item[field.form_name];
    } else {
      itemValue = window.CreateItemFieldSwitch._itemValue(field.attribute, item);
    }

    return itemValue;
  },

  _ensureDependents: function (fieldModels, fields, _fieldSwitch) {
    EnsureDependents._ensureDependents(fieldModels, fields, _fieldSwitch());
  },

  _createEditFieldModelRec: function (fields, field, item, _fieldSwitch, attachments) {
    var _this = this;

    var value = null;

    if (field.type == 'attachment') {
      value = window.CreateItemFieldSwitch._createEditValue(field, item, null, attachments);
    } else {
      var itemValue = this._itemValue(field, item);
      if (itemValue != null && itemValue != undefined) {
        value = window.CreateItemFieldSwitch._createEditValue(field, item, itemValue, null);
      } else {
        value = window.CreateItemFieldSwitch._createEmptyValue(field);
      }
    }

    var selectedValue = {
      field: field,
      value: value,
      dependents: [],
      hidden: false

    };

    var dependents = window.EnsureDependents._determineDependents(fields, selectedValue, _fieldSwitch());

    selectedValue.dependents = dependents.map(function (d) {
      return _this._createEditFieldModelRec(fields, d, item, _fieldSwitch, attachments);
    });

    return selectedValue;
  },

  _onlyMainFields: function (fields) {

    return fields.filter(function (f) {
      return !f['visibility_dependency_field_id'] && !f['values_dependency_field_id'];
    });
  },

  _createEditFieldModels: function (fields, item, _fieldSwitch, attachments) {

    return _.compact(this._onlyMainFields(fields).map(function (field) {
      return window.FieldModels._createEditFieldModelRec(fields, field, item, _fieldSwitch, attachments);
    }));
  },

  _createNewFieldModels: function (fields, next_code, inventory_pool, _fieldSwitch) {

    var fms = this._onlyMainFields(fields).map(function (field) {
      return {
        field: field,
        value: window.FieldModels._createEmptyValue(field, next_code, inventory_pool),
        dependents: [],
        hidden: false
      };
    });

    this._ensureDependents(fms, fields, _fieldSwitch);

    return fms;
  },

  findFieldModelRec: function (fieldModel, fieldId) {

    if (fieldModel.field.id == fieldId) {
      return fieldModel;
    } else {
      return this.findFieldModel(fieldModel.dependents, fieldId);
    }
  },

  findFieldModel: function (fieldModels, fieldId) {
    for (var i = 0; i < fieldModels.length; i++) {
      var d = fieldModels[i];
      var fm = this.findFieldModelRec(d, fieldId);
      if (fm) {
        return fm;
      }
    }
    return null;
  },

  _recursiveFieldModels: function (fieldModel) {
    var _this2 = this;

    if (fieldModel.dependents && fieldModel.dependents.length > 0) {

      return _.reduce(fieldModel.dependents, function (result, dependent) {
        return result.concat(_this2._recursiveFieldModels(dependent, result));
      }, [fieldModel]);
    } else {
      return [fieldModel];
    }
  },

  _flatFieldModels: function (fieldModels) {
    var _this3 = this;

    var r = _.reduce(fieldModels, function (result, fieldModel) {
      return result.concat(_this3._recursiveFieldModels(fieldModel));
    }, []);
    return r;
  }

};

window.LeftOrRightColumn = {

  _columnGroupFieldModels: function (fields, fieldModels, leftOrRight) {
    if (leftOrRight == 'left') {
      return this._groupFieldModels(this._columnedGroups(fields).left, fieldModels);
    } else if (leftOrRight == 'right') {
      return this._groupFieldModels(this._columnedGroups(fields).right, fieldModels);
    } else {
      throw 'Unexpected parameter: ' + leftOrRight;
    }
  },

  _groupFieldModels: function (groupedFields, fieldModels) {

    return _.map(groupedFields, function (groupFields) {
      var group = groupFields.group;

      return {
        group: group,
        fieldModels: _.filter(fieldModels, function (fieldModel) {
          return fieldModel.field.group == group;
        })
      };
    });
  },

  _baseFields: function (fields) {
    return _.filter(fields, function (field) {
      return field.group == null;
    });
  },

  _otherFields: function (fields) {
    return _.filter(fields, function (field) {
      return field.group != null;
    });
  },

  _baseGroup: function (fields) {
    return {
      group: null,
      fields: this._baseFields(fields)
    };
  },

  _otherGroups: function (fields) {

    return _.map(_.groupBy(this._otherFields(fields), function (f) {
      return f.group;
    }), function (groupFields, groupName) {
      return {
        group: groupName,
        fields: groupFields
      };
    });
  },

  _rootFields: function (fields) {
    return _.filter(fields, function (field) {
      return !field.visibility_dependency_field_id; //&& !field.values_dependency_field_id
    });
  },

  _groupRootFields: function (fields) {
    return [this._baseGroup(this._rootFields(fields))].concat(this._otherGroups(this._rootFields(fields)));
  },

  _columnedGroups: function (fields) {
    return this._columnedGroupsRecursive({
      groupsToDivide: this._groupRootFields(fields),
      left: [],
      right: []
    }, fields);
  },

  _dependents: function (field, allFields) {
    return allFields.filter(function (field) {
      return field.values_dependency_field_id == field.id;
    });
  },

  _countFieldsForModel: function (field, allFields) {
    var dependents = this._dependents(field, allFields);
    if (dependents.length > 0) {
      return 1; // + this._countFieldsForModel(dependents[0], allFields)
    } else {
        return 1;
      }
  },

  _countFieldsModelFields: function (fields, allFields) {
    var agg = 0;
    for (var i = 0; i < fields.length; i++) {
      agg += this._countFieldsForModel(fields[i], allFields);
    }
    return agg;
  },

  _countFieldsForColum: function (column, allFields) {
    var _this = this;

    return _.reduce(column, function (agg, val) {
      return agg + _this._countFieldsModelFields(val.fields, allFields);
    }, 0);
  },

  _columnedGroupsRecursive: function (params, allFields) {

    if (params.groupsToDivide.length < 1) {
      return params;
    } else {

      var groupsToDivide = params.groupsToDivide;
      var left = params.left;
      var right = params.right;

      // Just order by group count, not anymore by field count, because package
      // view should look the same as item view.
      // Old: if(this._countFieldsForColum(left, allFields) <= this._countFieldsForColum(right, allFields)) {
      if (left.length <= right.length) {
        return this._columnedGroupsRecursive({
          groupsToDivide: _.rest(groupsToDivide),
          left: left.concat(_.first(groupsToDivide)),
          right: right
        }, allFields);
      } else {
        return this._columnedGroupsRecursive({
          groupsToDivide: _.rest(groupsToDivide),
          left: left,
          right: right.concat(_.first(groupsToDivide))
        }, allFields);
      }
    }
  }

};
;(function () {
  /* global _ */
  /* global _jed */

  var React = window.React;
  var LeftOrRightColumn = window.LeftOrRightColumn;

  var RenderCreateItem = {
    _renderFieldContent: function (fieldModel, fieldModels, onChange, showInvalids, onClose, fieldRenderer) {
      var dependencyValue = _.first(_.filter(fieldModels, function (other) {
        return other.field.id == fieldModel.field.values_dependency_field_id;
      }));

      var dataDependency = _.first(_.filter(fieldModels, function (other) {
        return other.field.id == fieldModel.field.data_dependency_field_id;
      }));

      return fieldRenderer(fieldModel, fieldModels, onChange, showInvalids, onClose, dependencyValue, dataDependency);
    },

    _renderDependents: function (fieldModel, fieldModels, onChange, showInvalids, fieldRenderer) {
      var _this = this;

      if (!fieldModel.dependents) {
        return [];
      }

      if (fieldModel.hidden) {
        return [];
      }

      return fieldModel.dependents.map(function (dependent) {
        return _this._renderField(dependent, fieldModels, onChange, showInvalids, null, fieldRenderer);
      });
    },

    _renderField: function (fieldModel, fieldModels, onChange, showInvalids, onClose, fieldRenderer) {
      var _onClose = function () {
        onClose(fieldModel);
      };

      return React.createElement(
        "div",
        { id: fieldModel.field.id, key: fieldModel.field.id },
        this._renderFieldContent(fieldModel, fieldModels, onChange, showInvalids, _onClose, fieldRenderer),
        this._renderDependents(fieldModel, fieldModels, onChange, showInvalids, fieldRenderer)
      );
    },

    _renderFieldsInGroup: function (groupedFieldModels, fieldModels, onChange, showInvalids, onClose, fieldRenderer) {
      var _this2 = this;

      return groupedFieldModels.map(function (fieldModel) {
        return _this2._renderField(fieldModel, fieldModels, onChange, showInvalids, onClose, fieldRenderer);
      });
    },

    _renderGroupNameIfNeeded: function (groupName) {
      if (groupName) {
        return React.createElement(
          "h2",
          { className: "headline-m padding-bottom-m" },
          _jed(groupName)
        );
      } else {
        return null;
      }
    },

    _renderFieldsGroup: function (groupFields, fieldModels, onChange, showInvalids, onClose, fieldRenderer) {
      return React.createElement(
        "section",
        { className: "padding-bottom-l", key: groupFields.group },
        this._renderGroupNameIfNeeded(groupFields.group),
        React.createElement(
          "div",
          { className: "row group-of-fields" },
          this._renderFieldsInGroup(groupFields.fieldModels, fieldModels, onChange, showInvalids, onClose, fieldRenderer)
        )
      );
    },

    _renderFieldsGrouped: function (fields, fieldModels, leftOrRight, onChange, showInvalids, onClose, fieldRenderer) {
      return _.map(LeftOrRightColumn._columnGroupFieldModels(fields, fieldModels, leftOrRight), function (groupFields) {
        return RenderCreateItem._renderFieldsGroup(groupFields, fieldModels, onChange, showInvalids, onClose, fieldRenderer);
      });
    },

    _renderLeftColumn: function (fields, fieldModels, onChange, showInvalids, onClose, fieldRenderer, quantitySelector) {
      return React.createElement(
        "div",
        { className: "col1of2 padding-right-xs", id: "item-form-left-side" },
        quantitySelector,
        this._renderFieldsGrouped(fields, fieldModels, 'left', onChange, showInvalids, onClose, fieldRenderer)
      );
    },

    _renderRightColumn: function (fields, fieldModels, onChange, showInvalids, onClose, fieldRenderer) {
      return React.createElement(
        "div",
        { className: "col1of2", id: "item-form-right-side" },
        this._renderFieldsGrouped(fields, fieldModels, 'right', onChange, showInvalids, onClose, fieldRenderer)
      );
    },

    _renderColumns: function (fields, fieldModels, onChange, showInvalids, onClose, fieldRenderer, quantitySelector) {
      return React.createElement(
        "div",
        { id: "flexible-fields" },
        this._renderLeftColumn(fields, fieldModels, onChange, showInvalids, onClose, fieldRenderer, quantitySelector),
        this._renderRightColumn(fields, fieldModels, onChange, showInvalids, onClose, fieldRenderer)
      );
    }
  };

  window.RenderCreateItem = RenderCreateItem;
  window.RenderCreateItem.displayName = 'RenderCreateItem';
})();
window.SerializeItem = {

  _serializeFieldValue: function (fieldModel) {

    var field = fieldModel.field;
    var value = fieldModel.value;

    if (field.id == 'properties_quantity_allocations') {
      return _.filter(value.allocations, function (a) {
        return !a.deleted;
      }).map(function (v) {
        return {
          quantity: v.quantity,
          room: v.location
        };
      });
    }

    switch (field.type) {
      case 'text':
        return value.text;
        break;
      case 'autocomplete-search':
        return value.id;
        break;
      case 'autocomplete':
        return value.id;
        break;
      case 'textarea':
        return value.text;
        break;
      case 'select':
        return value.selection;
        break;
      case 'radio':
        return value.selection;
        break;
      case 'checkbox':
        return value.selections;
        break;
      case 'date':
        var dmy = CreateItemFieldSwitch._parseDayMonthYear(value.at);
        return CreateItemFieldSwitch._dmyToString(dmy);
        break;
      // case 'attachment':
      //   throw
      //   return ''
      //   break
      default:
        throw 'Unexpected type: ' + field.type;
    }
  },

  _serializeExtensibleFieldValue: function (fieldModel) {

    var field = fieldModel.field;
    var value = fieldModel.value;

    if (field.type == 'autocomplete') {
      return value.text;
    } else {
      throw 'Not supported field type: ' + field.type;
    }
  },

  _serializeItem: function (bypassSerialNumberValidation, fieldModels) {

    var base = {};
    if (bypassSerialNumberValidation) {
      base.skip_serial_number_validation = 'true';
    } else {
      base.skip_serial_number_validation = 'false';
    }

    return _.reduce(fieldModels, function (result, fieldModel) {

      var field = fieldModel.field;

      var value = window.SerializeItem._serializeFieldValue(fieldModel);
      if (field.form_name) {
        result[field.form_name] = value;
      } else if (field.attribute instanceof Array) {
        BackwardTestCompatibility._setValue(result, field.attribute, value);
      } else {
        result[field.attribute] = value;
      }

      if (field.extensible) {
        var extensibleValue = window.SerializeItem._serializeExtensibleFieldValue(fieldModel);
        BackwardTestCompatibility._setValue(result, field.extended_key, extensibleValue);
      }

      return result;
    }, base);
  }

};
(function () {
  var React = window.React;

  window.CreateModel = window.createReactClass({
    propTypes: {},

    createFieldModel: function (params) {
      var type = params.type;
      var key = params.key;
      var label = params.label;
      var mandatory = params.mandatory;
      var disabled = params.disabled;

      var f = {
        type: type,
        key: key,
        label: label,
        mandatory: mandatory,
        disabled: disabled,
        specific: params.specific
      };

      var state = {};
      if (type == 'text' || type == 'textarea' || type == 'software_information') {
        state = { text: params.text };
      } else if (type == 'search-selections') {
        state = { term: '', selections: params.selections };
      } else if (type == 'manufacturer') {
        state = { term: params.manufacturer };
      } else if (type == 'accessories') {
        state = { text: '', accessories: params.accessories };
      } else if (type == 'images') {
        state = { nextId: 0, images: params.images };
      } else if (type == 'attachments') {
        state = { nextId: 0, attachments: params.attachments };
      } else if (type == 'properties') {
        state = { properties: params.properties };
      } else if (type == 'checkbox') {
        state = { checked: params.checked };
      }
      f.state = state;
      return f;
    },

    getInitialState: function () {
      var _this = this;

      var edit = this.props.edit_data ? true : false;
      var model = null;
      if (edit) {
        model = this.props.edit_data.model;
      }

      var product = function () {
        if (edit) {
          return model.product;
        } else {}
      };

      if (this.props.type == 'software') {

        return {

          fields: [this.createFieldModel({
            type: 'text',
            key: 'product',
            label: 'Product',
            mandatory: true,

            text: edit ? model.product || '' : ''
          }), this.createFieldModel({
            type: 'text',
            key: 'version',
            label: 'Version',
            mandatory: false,

            text: edit ? model.version || '' : ''
          }), this.createFieldModel({
            type: 'manufacturer',
            key: 'manufacturer',
            label: 'Manufacturer',
            mandatory: false,
            specific: {
              placeholder: '',
              search: function (term, callback) {

                var result = _.map(_.filter(_this.props.manufacturers, function (m) {
                  return m.toLowerCase().indexOf(term.toLowerCase()) > -1;
                }), function (m, index) {
                  return {
                    id: 'manufacturer_' + index,
                    label: m
                  };
                });

                callback(result);
              },
              onChange: function (field, selected) {

                _this.updateState(['fields', _.findIndex(_this.state.fields, function (f) {
                  return field.key == f.key;
                }), 'state', 'term'], selected.term);
              }
            },

            manufacturer: edit ? model.manufacturer || '' : ''
          }), this.createFieldModel({
            type: 'software_information',
            key: 'software_information',
            label: 'Software Information',
            mandatory: false,

            text: edit ? model.technical_detail || '' : ''
          }), this.createFieldModel({
            type: 'attachments',
            key: 'attachments',
            label: 'Attachments',
            mandatory: false,

            attachments: edit ? _.map(this.props.edit_data.attachments, function (a) {
              return {
                'delete': false,
                id: a.id,
                filename: a.filename,
                type: 'existing'
              };
            }) : []
          })]

        };
      }

      return {
        fields: [this.createFieldModel({
          type: 'text',
          key: 'product',
          label: 'Product',
          mandatory: true,

          text: edit ? model.product || '' : ''
        }), this.createFieldModel({
          type: 'checkbox',
          key: 'is_package',
          label: 'this is a package',
          mandatory: false,
          disabled: edit,

          checked: edit ? model.is_package : false
        }), this.createFieldModel({
          type: 'text',
          key: 'version',
          label: 'Version',
          mandatory: false,

          text: edit ? model.version || '' : ''
        }), this.createFieldModel({
          type: 'manufacturer',
          key: 'manufacturer',
          label: 'Manufacturer',
          mandatory: false,
          specific: {
            placeholder: '',
            search: function (term, callback) {

              var result = _.map(_.filter(_this.props.manufacturers, function (m) {
                return m.toLowerCase().indexOf(term.toLowerCase()) > -1;
              }), function (m, index) {
                return {
                  id: 'manufacturer_' + index,
                  label: m
                };
              });

              callback(result);
            },
            onChange: function (field, selected) {

              _this.updateState(['fields', _.findIndex(_this.state.fields, function (f) {
                return field.key == f.key;
              }), 'state', 'term'], selected.term);
            }
          },

          manufacturer: edit ? model.manufacturer || '' : ''
        }), this.createFieldModel({
          type: 'textarea',
          key: 'description',
          label: 'Description',
          mandatory: false,

          text: edit ? model.description || '' : ''
        }), this.createFieldModel({
          type: 'textarea',
          key: 'technical_details',
          label: 'Technical Details',
          mandatory: false,

          text: edit ? model.technical_detail || '' : ''
        }), this.createFieldModel({
          type: 'textarea',
          key: 'internal_description',
          label: 'Internal Description',
          mandatory: false,

          text: edit ? model.internal_description || '' : ''
        }), this.createFieldModel({
          type: 'textarea',
          key: 'hand_over_notes',
          label: 'Important notes for hand over',
          mandatory: false,

          text: edit ? model.hand_over_note || '' : ''
        }), this.createFieldModel({
          type: 'search-selections',
          key: 'allocations',
          label: 'Allocations',
          mandatory: false,
          specific: {
            placeholder: _jed('Entitlement-Group'),
            search: function (term, callback) {
              _this.getAjax('/manage/' + _this.props.inventory_pool_id + '/groups?search_term=' + term, {}, function (data) {
                callback(_.map(data, function (d) {
                  return {
                    id: d.id,
                    label: d.name
                  };
                }));
              });
            },
            onChange: function (field, selected) {

              if (!selected.id) {
                return;
              }

              if (_.find(field.state.selections, function (s) {
                return s.group_id == selected.id;
              })) {
                return;
              }

              var id = selected.id;
              var label = selected.term;

              _this.updateState(['fields', _.findIndex(_this.state.fields, function (f) {
                return field.key == f.key;
              }), 'state', 'selections'], [{
                group_id: id,
                label: label,
                quantity: '1'
              }].concat(field.state.selections));
            }

          },

          selections: edit ? _.map(this.props.edit_data.allocations, function (a) {
            return {
              id: a.id,
              group_id: a.group_id,
              quantity: a.quantity,
              label: a.label,
              'delete': false
            };
          }) : []
        }), this.createFieldModel({
          type: 'search-selections',
          key: 'categories',
          label: 'Categories',
          mandatory: false,
          specific: {
            placeholder: _jed('Category'),
            search: function (term, callback) {
              _this.getAjax('/manage/' + _this.props.inventory_pool_id + '/categories?search_term=' + term, {}, function (data) {
                callback(_.map(data, function (d) {
                  return {
                    id: d.id,
                    label: d.name
                  };
                }));
              });
            },
            onChange: function (field, selected) {

              if (!selected.id) {
                return;
              }

              if (_.find(field.state.selections, function (s) {
                return s.id == selected.id;
              })) {
                return;
              }

              var id = selected.id;
              var label = selected.term;

              _this.updateState(['fields', _.findIndex(_this.state.fields, function (f) {
                return field.key == f.key;
              }), 'state', 'selections'], field.state.selections.concat({
                id: id,
                label: label
              }));
            }
          },

          selections: edit ? _.map(this.props.edit_data.categories, function (c) {
            return {
              id: c.id,
              label: c.label,
              'delete': false
            };
          }) : []

        }), this.createFieldModel({
          type: 'accessories',
          key: 'accessories',
          label: 'Accessories',
          mandatory: false,

          accessories: edit ? _.map(this.props.edit_data.accessories, function (a) {
            var l = window.lodash;
            return {
              'delete': false,
              active: l.includes(a.inventory_pool_ids, _this.props.inventory_pool_id),
              label: a.name,
              id: a.id
            };
          }) : []
        }), this.createFieldModel({
          type: 'search-selections',
          key: 'compatibles',
          label: 'Compatibles',
          mandatory: false,
          specific: {
            placeholder: _jed('Model'),
            search: function (term, callback) {
              _this.getAjax('/manage/' + _this.props.inventory_pool_id + '/models?search_term=' + term, {}, function (data) {
                callback(_.map(data, function (d) {
                  return {
                    id: d.id,
                    label: d.product + (d.version ? ' ' + d.version : '')
                  };
                }));
              });
            },
            onChange: function (field, selected) {

              if (!selected.id) {
                return;
              }

              if (_.find(field.state.selections, function (s) {
                return s.id == selected.id;
              })) {
                return;
              }

              var id = selected.id;
              var label = selected.term;

              _this.updateState(['fields', _.findIndex(_this.state.fields, function (f) {
                return field.key == f.key;
              }), 'state', 'selections'], field.state.selections.concat({
                id: id,
                label: label
              }));
            }
          },

          selections: edit ? _.map(this.props.edit_data.compatibles, function (c) {
            return {
              id: c.id,
              label: c.label,
              'delete': false
            };
          }) : []

        }), this.createFieldModel({
          type: 'images',
          key: 'images',
          label: 'Images',
          mandatory: false,

          images: edit ? _.map(this.props.edit_data.images, function (i) {
            return {
              'delete': false,
              id: i.id,
              filename: i.filename,
              type: 'existing',
              isCover: _this.props.edit_data.model.cover_image_id == i.id
            };
          }) : []
        }), this.createFieldModel({
          type: 'attachments',
          key: 'attachments',
          label: 'Attachments',
          mandatory: false,

          attachments: edit ? _.map(this.props.edit_data.attachments, function (a) {
            return {
              'delete': false,
              id: a.id,
              filename: a.filename,
              type: 'existing'
            };
          }) : []
        }), this.createFieldModel({
          type: 'properties',
          key: 'properties',
          label: 'Properties',
          mandatory: false,

          properties: edit ? _.map(this.props.edit_data.properties, function (p) {
            return {
              'delete': false,
              key: p.key,
              value: p.value,
              type: 'existing'
            };
          }) : []

        })]
      };
    },

    fieldByKey: function (key) {

      return _.find(this.state.fields, function (f) {
        return f.key == key;
      });
    },

    stateToRequest: function () {
      var _this2 = this;

      if (this.props.type == 'software') {

        return {
          // NOTE: Rails unfortunately automatically wraps the parameters {model: {...}} if you dont do it,
          // which is confusing, but we do it anyways here explicitly.
          model: {
            type: 'software',
            product: this.fieldByKey('product').state.text,
            version: this.fieldByKey('version').state.text,
            manufacturer: this.fieldByKey('manufacturer').state.term,
            technical_detail: this.fieldByKey('software_information').state.text,
            attachments_attributes: _.object(_.map(_.reject(this.fieldByKey('attachments').state.attachments, function (i) {
              return i.type == 'new';
            }), function (a, index) {

              return [a.id, {
                id: a.id,
                _destroy: a['delete'] ? '1' : null
              }];
            }))

          }
        };
      }

      var m = {
        // NOTE: Rails unfortunately automatically wraps the parameters {model: {...}} if you dont do it,
        // which is confusing, but we do it anyways here explicitly.
        model: {
          type: 'model',
          product: this.fieldByKey('product').state.text,
          version: this.fieldByKey('version').state.text,
          manufacturer: this.fieldByKey('manufacturer').state.term,
          description: this.fieldByKey('description').state.text,
          technical_detail: this.fieldByKey('technical_details').state.text,
          internal_description: this.fieldByKey('internal_description').state.text,
          hand_over_note: this.fieldByKey('hand_over_notes').state.text,
          category_ids: _.map(_.reject(this.fieldByKey('categories').state.selections, function (s) {
            return s['delete'];
          }), function (s) {
            return s.id;
          }),
          compatible_ids: _.map(_.reject(this.fieldByKey('compatibles').state.selections, function (s) {
            return s['delete'];
          }), function (s) {
            return s.id;
          }),
          properties_attributes: _.map(_.filter(this.fieldByKey('properties').state.properties, function (p) {
            return !p['delete'];
          }), function (p) {
            return { key: p.key, value: p.value };
          }),
          partitions_attributes: _.object(_.map(this.fieldByKey('allocations').state.selections, function (s, index) {

            if (!s.id) {
              return ['rails_dummy_id_' + index, {
                group_id: s.group_id,
                quantity: s.quantity
              }];
            } else {
              return [s.id, {
                id: s.id,
                group_id: s.group_id,
                quantity: s.quantity,
                _destroy: s['delete'] ? true : null
              }];
            }
          })),
          accessories_attributes: _.object(_.map(this.fieldByKey('accessories').state.accessories, function (a, index) {

            if (a.id) {
              return [a.id, {
                id: a.id,
                inventory_pool_toggle: (a.active ? '1' : '0') + ',' + _this2.props.inventory_pool_id,
                _destroy: a['delete'] ? true : null
              }];
            } else {
              return ['rails_dummy_id_' + index, {
                inventory_pool_toggle: (a.active ? '1' : '0') + ',' + _this2.props.inventory_pool_id,
                name: a.label
              }];
            }
          })),

          images_attributes: _.object(_.map(_.reject(this.fieldByKey('images').state.images, function (i) {
            return i.type == 'new';
          }), function (i, index) {

            return [i.id, {
              id: i.id,
              _destroy: i['delete'] ? '1' : null,
              is_cover: i.isCover
            }];
          })),

          attachments_attributes: _.object(_.map(_.reject(this.fieldByKey('attachments').state.attachments, function (i) {
            return i.type == 'new';
          }), function (a, index) {

            return [a.id, {
              id: a.id,
              _destroy: a['delete'] ? '1' : null
            }];
          }))

        }
      };

      if (!this.isEdit()) {
        m.model.is_package = this.fieldByKey('is_package').state.checked;
      }

      return m;
    },

    hackyShowLoading: function () {
      var modal = new App.Modal($('<div></div>'));
      modal.undestroyable();
      App.Flash({
        type: 'notice',
        message: _jed('Uploading files - please wait'),
        loading: true
      }, 9999);
    },

    onSaveModelSuccess: function (response) {
      var _this3 = this;

      this.hackyHideFlash();

      if (this.flatImageFiles().concat(this.flatAttachments()).length > 0) {
        this.hackyShowLoading();
      }

      var modelId = response.id;
      this.uploadFiles(modelId, function (errors) {
        if (errors.length == 0) {
          var flash = '?flash[success]=' + _jed('Model saved');
          var allModels = '';
          if (!_this3.isEdit()) {
            allModels = '&filters=all_models';
          }
          window.location = _this3.props.inventory_path + flash + allModels;
        } else {
          var message = _jed('%s was saved, but there were problems uploading files', _jed('Model'));
          alert(message);

          window.location = '/manage/' + _this3.props.inventory_pool_id + '/models/' + modelId + '/edit';
        }
      });
    },

    onSaveModelError: function (response) {

      this.hackyShowFlash(response.responseText);
    },

    hackyShowFlash: function (message) {

      var flashContent = React.createElement(
        'div',
        { className: 'paragraph-m row emboss straight text-align-center padding-inset-xs error' },
        React.createElement(
          'strong',
          { key: 'key1' },
          message
        ),
        React.createElement(
          'a',
          { key: 'key2', className: 'no-colors transparent-hover position-absolute-topright height-full padding-horizontal-m', 'data-remove': 'true', title: 'Hide notification' },
          React.createElement(
            'div',
            { className: 'table' },
            React.createElement(
              'div',
              { className: 'table-row' },
              React.createElement(
                'div',
                { className: 'table-cell vertical-align-middle' },
                React.createElement('i', { className: 'fa fa-times-circle' })
              )
            )
          )
        )
      );

      var flash = document.getElementById('flash');
      flash.className = '';
      ReactDOM.render(flashContent, flash);
    },

    hackyHideFlash: function () {
      var flash = document.getElementById('flash');
      flash.className = 'hidden';
    },

    saveModel: function () {
      var _this4 = this;

      var data = this.stateToRequest();
      $.ajax({
        url: this.isEdit() ? this.props.create_model_path + '/' + this.props.edit_data.model.id : this.props.create_model_path,
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        method: this.isEdit() ? 'PUT' : 'POST'
      }).done(function (response) {
        _this4.onSaveModelSuccess(response);
      }).error(function (response) {
        _this4.onSaveModelError(response);
      });
    },

    onClickSaveModel: function (event) {
      event.preventDefault();
      this.saveModel();
    },

    uploadPath: function (type) {
      if (type == 'image') {
        return this.props.store_image_path;
      } else {
        return this.props.store_attachment_path;
      }
    },

    uploadFile: function (type, modelId, fileSpec, callback) {

      var formData = new FormData();
      formData.append('data', fileSpec.file);
      formData.append('model_id', modelId);
      if (fileSpec.isCover) {
        formData.append('is_cover', fileSpec.isCover);
      }

      $.ajax({
        url: this.uploadPath(type),
        data: formData,
        contentType: false,
        method: 'POST',
        processData: false
      }).done(function (data) {
        callback({ result: 'success' });
      }).error(function (data) {
        callback({ result: 'failure' });
      });
    },

    fieldsByType: function (type) {
      return _.filter(this.state.fields, function (f) {
        return f.type == type;
      });
    },

    uploadFiles: function (modelId, callback) {
      var _this5 = this;

      this.uploadImages(modelId, function (errors1) {
        _this5.uploadAttachments(modelId, function (errors2) {
          callback(errors1.concat(errors2));
        });
      });
    },

    flatImageSpecs: function () {
      var imageFields = this.fieldsByType('images');
      return _.flatten(_.map(imageFields, function (f) {
        return _.reject(f.state.images, function (img) {
          return img.type == 'existing';
        });
      }));
    },

    flatImageFiles: function () {
      return _.map(this.flatImageSpecs(), function (spec) {
        return spec.file;
      });
    },

    uploadImages: function (modelId, callback) {
      var imgSpecs = this.flatImageSpecs();
      this.uploadFilesRec('image', modelId, imgSpecs, [], callback);
    },

    flatAttachmentSpecs: function () {
      var attachmentFields = this.fieldsByType('attachments');
      return _.flatten(_.map(attachmentFields, function (f) {
        return _.reject(f.state.attachments, function (a) {
          return a.type == 'existing';
        });
      }));
    },

    flatAttachments: function () {
      return _.map(this.flatAttachmentSpecs(), function (spec) {
        return spec.file;
      });
    },

    uploadAttachments: function (modelId, callback) {
      var files = this.flatAttachmentSpecs();
      this.uploadFilesRec('attachment', modelId, files, [], callback);
    },

    uploadFilesRec: function (type, modelId, fileSpecs, errors, callback) {
      var _this6 = this;

      if (fileSpecs.length == 0) {
        callback(errors);
      } else {

        this.uploadFile(type, modelId, _.first(fileSpecs), (function (result) {

          var nextErrors = errors;
          if (result.result != 'success') {
            nextErrors = errors.concat('error');
          }

          _this6.uploadFilesRec(type, modelId, _.rest(fileSpecs), nextErrors, callback);
        }).bind(this));
      }
    },

    isEdit: function () {
      return this.props.edit_data ? true : false;
    },

    title: function () {
      if (this.props.type == 'software') {
        if (this.isEdit()) {
          return _jed('Edit Software');
        } else {
          return _jed('Create new software');
        }
      } else {
        if (this.isEdit()) {
          return _jed('Edit Model');
        } else {
          return _jed('Create new model');
        }
      }
    },

    hint: function () {
      if (this.isEdit()) {
        return _jed('Make changes and save');
      } else {
        return _jed('Insert all required information');
      }
    },

    renderHeader: function () {
      var _this7 = this;

      return React.createElement(
        'div',
        { className: 'margin-top-l padding-horizontal-m' },
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'div',
            { className: 'col1of2' },
            React.createElement(
              'h1',
              { className: 'headline-l' },
              this.title()
            ),
            React.createElement(
              'h2',
              { className: 'headline-s light' },
              this.hint()
            )
          ),
          React.createElement(
            'div',
            { className: 'col1of2 text-align-right' },
            React.createElement(
              'a',
              { className: 'button grey', href: 'javascript:history.back()' },
              _jed('Cancel')
            ),
            React.createElement(
              'button',
              { onClick: function (e) {
                  return _this7.onClickSaveModel(e);
                }, className: 'button green', id: 'save' },
              _jed('Save %s', this.props.type == 'software' ? _jed('Software') : _jed('Model'))
            )
          )
        )
      );
    },

    leftFields: function () {

      if (this.props.type == 'software') {
        return ['product', 'version', 'manufacturer'];
      }

      return ['product', 'is_package', 'version', 'manufacturer', 'description', 'technical_details', 'internal_description', 'hand_over_notes', 'allocations', 'categories'];
    },

    rightFields: function () {

      if (this.props.type == 'software') {
        return ['software_information', 'attachments'];
      }

      return ['images', 'attachments', 'accessories', 'compatibles', 'properties'];
    },

    findFields: function (keys) {
      var _this8 = this;

      return _.map(keys, (function (k) {
        return _.find(_this8.state.fields, function (f) {
          return f.key == k;
        });
      }).bind(this));
    },

    renderFields: function (fields) {
      var _this9 = this;

      return _.map(fields, function (f) {
        return _this9.renderField(f);
      });
    },

    renderLeftFields: function () {
      var leftFields = this.leftFields();
      var fields = this.findFields(leftFields);
      return this.renderFields(fields);
    },

    renderRightFields: function () {
      var rightFields = this.rightFields();
      var fields = this.findFields(rightFields);
      return this.renderFields(fields);
    },

    renderContent: function () {

      return React.createElement(
        'div',
        { className: 'padding-inset-m' },
        React.createElement(
          'div',
          { className: 'row padding-top-s' },
          React.createElement(
            'form',
            { id: 'form' },
            React.createElement(
              'div',
              { className: 'col1of2 padding-right-xs' },
              this.renderLeftFields()
            ),
            React.createElement(
              'div',
              { className: 'col1of2' },
              this.renderRightFields()
            )
          )
        )
      );
    },

    cloneAndSet: function (obj, path, value) {
      if (path.length == 1) {
        var c = _.clone(obj);
        c[_.first(path)] = value;
        return c;
      } else {
        var c = _.clone(obj);
        c[_.first(path)] = this.cloneAndSet(obj[_.first(path)], _.rest(path), value);
        return c;
      }
    },

    updateState: function (path, value) {
      var _this10 = this;

      this.setState(function (previous) {
        return _this10.cloneAndSet(previous, path, value);
      });
    },

    renderCheckbox: function (field) {
      var _this11 = this;

      var onChange = function (event) {
        var val = event.target.checked;
        _this11.updateState(['fields', _.findIndex(_this11.state.fields, function (f) {
          return field.key == f.key;
        }), 'state', 'checked'], val);
      };

      return React.createElement(
        'div',
        { className: 'padding-vertical-xs' },
        React.createElement('input', { onChange: function (e) {
            return onChange(e);
          }, disabled: field.disabled ? 'disabled' : null, checked: field.state.checked, type: 'checkbox' })
      );
    },

    renderTextInput: function (field) {
      var _this12 = this;

      var onChange = function (event) {
        var val = event.target.value;

        _this12.updateState(['fields', _.findIndex(_this12.state.fields, function (f) {
          return field.key == f.key;
        }), 'state', 'text'], val);
      };
      return React.createElement('input', { onChange: function (e) {
          return onChange(e);
        }, value: field.state.text, autoComplete: 'off', className: 'width-full', name: 'model[product]', type: 'text' });
    },

    renderManufacturer: function (field) {
      return React.createElement(BasicAutocomplete, {
        inputClassName: 'has-addon width-full ui-autocomplete-input ui-autocomplete-loading',
        element: 'label',
        inputId: null,
        dropdownWidth: '350px',
        label: field.specific.placeholder,
        _makeCall: function (term, callback) {
          return field.specific.search(term, callback);
        },
        onChange: function (selected) {
          return field.specific.onChange(field, selected);
        },
        term: field.state.term,
        initialText: field.state.term,
        name: null
      });
    },

    renderSoftwareInformation: function (field) {

      return this.renderTextarea(field);
    },

    renderTextarea: function (field) {
      var _this13 = this;

      var onChange = function (event) {
        var val = event.target.value;

        _this13.updateState(['fields', _.findIndex(_this13.state.fields, function (f) {
          return field.key == f.key;
        }), 'state', 'text'], val);
      };

      // if(field.key == 'software_information' || field.key == 'technical_details' || field.key == 'internal_description' || field.key == 'hand_over_notes' || field.key == 'description') {
      return React.createElement(AutosizeTextarea, { refkey: field.key, onChange: function (e) {
          return onChange(e);
        }, value: field.state.text, autoComplete: 'off', className: 'width-full', name: 'model[technical_detail]', rows: '6', type: 'text' });
      // } else {
      //   return (
      //     <textarea onChange={(e) => onChange(e)} value={field.state.text} autoComplete='off' className='width-full' name='model[technical_detail]' rows='6' type='text'></textarea>
      //   )
      // }
    },

    fileChooser: {},

    renderImages: function (field) {
      var _this14 = this;

      if (this.fileChooser[field.key]) {
        this.fileChooser[field.key].value = '';
      }

      var onClick = function (event) {
        event.preventDefault();
        _this14.fileChooser[field.key].click();
      };

      var onFileChange = function (event) {
        event.preventDefault();

        var file = event.target.files[0];

        var image = {
          type: 'new',
          id: field.state.nextId,
          filename: file.name,
          result: 'pending',
          file: file
        };

        _this14.updateState(['fields', _.findIndex(_this14.state.fields, function (f) {
          return field.key == f.key;
        }), 'state', 'images'], field.state.images.concat(image));

        _this14.updateState(['fields', _.findIndex(_this14.state.fields, function (f) {
          return field.key == f.key;
        }), 'state', 'nextId'], field.state.nextId + 1);

        _this14.readURL(field, image);
      };

      return React.createElement(
        'div',
        { className: 'row' },
        React.createElement('div', { className: 'col1of3' }),
        React.createElement(
          'div',
          { className: 'col2of3' },
          React.createElement(
            'button',
            { onClick: function (e) {
                return onClick(e);
              }, className: 'button inset width-full', 'data-type': 'select' },
            _jed('Select Image')
          ),
          React.createElement('input', { ref: function (ref) {
              return _this14.fileChooser[field.key] = ref;
            }, onChange: function (e) {
              return onFileChange(e);
            }, autoComplete: 'false', className: 'invisible height-full width-full position-absolute-topleft', type: 'file' })
        )
      );
    },

    renderAttachments: function (field) {
      var _this15 = this;

      if (this.fileChooser[field.key]) {
        this.fileChooser[field.key].value = '';
      }

      var onClick = function (event) {
        event.preventDefault();
        _this15.fileChooser[field.key].click();
      };

      var onFileChange = function (event) {
        event.preventDefault();

        var file = event.target.files[0];

        var image = {
          type: 'new',
          id: field.state.nextId,
          filename: file.name,
          result: 'pending',
          file: file
        };

        _this15.updateState(['fields', _.findIndex(_this15.state.fields, function (f) {
          return field.key == f.key;
        }), 'state', 'attachments'], field.state.attachments.concat(image));

        _this15.updateState(['fields', _.findIndex(_this15.state.fields, function (f) {
          return field.key == f.key;
        }), 'state', 'nextId'], field.state.nextId + 1);
      };

      return React.createElement(
        'div',
        { className: 'row' },
        React.createElement('div', { className: 'col1of3' }),
        React.createElement(
          'div',
          { className: 'col2of3' },
          React.createElement(
            'button',
            { onClick: function (e) {
                return onClick(e);
              }, className: 'button inset width-full', 'data-type': 'select' },
            _jed('Select File')
          ),
          React.createElement('input', { ref: function (ref) {
              return _this15.fileChooser[field.key] = ref;
            }, onChange: function (e) {
              return onFileChange(e);
            }, autoComplete: 'false', className: 'invisible height-full width-full position-absolute-topleft', type: 'file' })
        )
      );
    },

    renderProperties: function (field) {
      var _this16 = this;

      var onClick = function (event) {
        event.preventDefault();

        _this16.updateState(['fields', _.findIndex(_this16.state.fields, function (f) {
          return field.key == f.key;
        }), 'state', 'properties'], [{
          'delete': false,
          key: '',
          value: ''
        }].concat(field.state.properties));
      };

      return React.createElement(
        'div',
        { className: 'text-align-right' },
        React.createElement(
          'button',
          { onClick: function (e) {
              return onClick(e);
            }, className: 'button inset', id: 'add-property', type: 'button' },
          _jed('Add %s', _jed('Property'))
        )
      );
    },

    renderAccessories: function (field) {
      var _this17 = this;

      var onChange = function (event) {

        var val = event.target.value;

        _this17.updateState(['fields', _.findIndex(_this17.state.fields, function (f) {
          return field.key == f.key;
        }), 'state', 'text'], val);
      };

      var onClick = function (event) {
        event.preventDefault();

        _this17.updateState(['fields', _.findIndex(_this17.state.fields, function (f) {
          return field.key == f.key;
        }), 'state', 'accessories'], field.state.accessories.concat({
          active: true,
          label: field.state.text
        }));

        _this17.updateState(['fields', _.findIndex(_this17.state.fields, function (f) {
          return field.key == f.key;
        }), 'state', 'text'], '');
      };

      return React.createElement(
        'div',
        { className: 'row text-align-right' },
        React.createElement(
          'div',
          { className: 'col4of5' },
          React.createElement('input', { value: field.state.text, onChange: function (e) {
              return onChange(e);
            }, autoComplete: 'off', className: 'width-full', id: 'accessory-name', placeholder: _jed('Name'), type: 'text' })
        ),
        React.createElement(
          'div',
          { className: 'col1of5' },
          React.createElement(
            'button',
            { onClick: function (e) {
                return onClick(e);
              }, className: 'button inset', id: 'add-accessory' },
            React.createElement('i', { className: 'fa fa-plus' })
          )
        )
      );
    },

    getAjax: function (url, data, callback) {
      $.ajax({
        url: url,
        contentType: 'application/json',
        dataType: 'json',
        method: 'GET',
        data: data
      }).done(function (data) {
        callback(data);
      }).error(function (data) {});
    },

    renderSearch: function (field) {

      return React.createElement(BasicAutocomplete, {
        inputClassName: 'has-addon width-full ui-autocomplete-input ui-autocomplete-loading',
        element: 'label',
        inputId: null,
        dropdownWidth: '350px',
        label: field.specific.placeholder,
        _makeCall: function (term, callback) {
          return field.specific.search(term, callback);
        },
        onChange: function (selected) {
          return field.specific.onChange(field, selected);
        },
        resetAfterSelection: true,
        term: field.state.term,
        initialText: field.state.term,
        name: null
      });
    },

    renderInput: function (f) {

      if (f.type == 'text') {
        return this.renderTextInput(f);
      } else if (f.type == 'textarea') {
        return this.renderTextarea(f);
      } else if (f.type == 'software_information') {
        return this.renderSoftwareInformation(f);
      } else if (f.type == 'search-selections') {
        return this.renderSearch(f);
      } else if (f.type == 'manufacturer') {
        return this.renderManufacturer(f);
      } else if (f.type == 'accessories') {
        return this.renderAccessories(f);
      } else if (f.type == 'images') {
        return this.renderImages(f);
      } else if (f.type == 'attachments') {
        return this.renderAttachments(f);
      } else if (f.type == 'properties') {
        return this.renderProperties(f);
      } else if (f.type == 'checkbox') {
        return this.renderCheckbox(f);
      } else {
        return React.createElement(
          'div',
          null,
          'TODO'
        );
      }
    },

    readURL: function (field, image) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var result = e.target.result;

        var element = document.getElementById('field_' + field.key + '_image_' + image.id);
        if (element) {
          element.src = result;
        }
      };

      reader.readAsDataURL(image.file);
    },

    _technicalDetailLines: function (text) {
      return text.split('\r\n');
    },

    _technicalDetailLinesWithLinks: function (text) {
      var _this18 = this;

      return _.filter(this._technicalDetailLines(text), function (line) {
        return _this18._lineHasLink(line);
      });
    },

    _linkRegex: function () {
      return (/(https?:\S*)/gi
      );
    },

    _emailRegex: function () {
      return (/(\S+@\S+\.\S+)/gi
      );
    },

    _lineHasLink: function (line) {
      return line.match(this._linkRegex()) || line.match(this._emailRegex());
    },

    _renderTechnicalDetailLine: function (line, index) {

      var innerHtml = line.replace(this._linkRegex(), '<a href=\'\$1\' target=\'_blank\'>\$1</a>').replace(this._emailRegex(), '<a href=\'mailto:\$1\'>\$1</a>');
      return React.createElement('div', { key: 'technical_detail_' + index, className: 'row line font-size-m padding-inset-s', dangerouslySetInnerHTML: { __html: innerHtml } });
    },

    _renderTechnicalDetailLines: function (text) {
      var _this19 = this;

      return this._technicalDetailLinesWithLinks(text).map(function (line, index) {
        return _this19._renderTechnicalDetailLine(line, index);
      });
    },

    renderAdditional: function (f) {
      var _this20 = this;

      if (f.type == 'software_information') {

        if (!f.state.text) {
          return null;
        }

        return this._renderTechnicalDetailLines(f.state.text);
      } else if (f.type == 'properties') {

        return _.map(f.state.properties, function (property, index) {

          var onChangeKey = function (event) {
            var val = event.target.value;

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'properties', index, 'key'], val);
          };

          var onChangeValue = function (event) {
            var val = event.target.value;

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'properties', index, 'value'], val);
          };

          var onRemoveExisting = function (event) {
            event.preventDefault();

            var l = window.lodash;
            var next = l.cloneDeep(f.state.properties);
            next[index]['delete'] = true;

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'properties'], next);
          };

          var onRemove = function (event) {
            event.preventDefault();

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'properties'], _.reject(f.state.properties, function (pi, i) {
              return i == index;
            }));
          };

          var undo = function (event) {
            event.preventDefault();

            var l = window.lodash;
            var next = l.cloneDeep(f.state.properties);
            next[index]['delete'] = false;

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'properties'], next);
          };

          if (property.type == 'existing') {

            if (property['delete']) {

              return React.createElement(
                'div',
                { key: 'property_' + index, className: 'row line font-size-xs focus-hover-thin striked', 'data-type': 'inline-entry' },
                React.createElement(
                  'div',
                  { className: 'line-col', title: 'Wird beim speichern entfernt' },
                  React.createElement('i', { className: 'fa fa-trash' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of10 text-align-left no-padding text-align-center cursor-move ui-sortable-handle', 'data-type': 'sort-handle' },
                  React.createElement('i', { className: 'fa fa-resize-vertical' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col4of10 no-padding' },
                  React.createElement('input', { onChange: function (e) {
                      return onChangeKey(e);
                    }, value: property.key, disabled: true, className: 'small width-full', name: 'model[properties_attributes][][key]', type: 'text' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col4of10' },
                  React.createElement('input', { onChange: function (e) {
                      return onChangeValue(e);
                    }, value: property.value, disabled: true, className: 'small width-full', name: 'model[properties_attributes][][value]', type: 'text' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of10 text-align-right' },
                  React.createElement(
                    'button',
                    { onClick: function (e) {
                        return undo(e);
                      }, className: 'button small inset', 'data-remove': '', title: 'Entfernen' },
                    _jed('undo')
                  )
                )
              );
            } else {

              return React.createElement(
                'div',
                { key: 'property_' + index, className: 'row line font-size-xs focus-hover-thin', 'data-type': 'inline-entry' },
                React.createElement(
                  'div',
                  { className: 'line-col col1of10 text-align-left no-padding text-align-center cursor-move ui-sortable-handle', 'data-type': 'sort-handle' },
                  React.createElement('i', { className: 'fa fa-resize-vertical' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col4of10 no-padding' },
                  React.createElement('input', { onChange: function (e) {
                      return onChangeKey(e);
                    }, value: property.key, className: 'small width-full', name: 'model[properties_attributes][][key]', type: 'text' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col4of10' },
                  React.createElement('input', { onChange: function (e) {
                      return onChangeValue(e);
                    }, value: property.value, className: 'small width-full', name: 'model[properties_attributes][][value]', type: 'text' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of10 text-align-right' },
                  React.createElement(
                    'button',
                    { onClick: function (e) {
                        return onRemoveExisting(e);
                      }, className: 'button small inset', 'data-remove': '', title: _jed('Remove') },
                    _jed('Remove')
                  )
                )
              );
            }
          } else {

            return React.createElement(
              'div',
              { key: 'property_' + index, className: 'row line font-size-xs focus-hover-thin', 'data-type': 'inline-entry' },
              React.createElement(
                'div',
                { className: 'line-col col1of10 text-align-left no-padding text-align-center cursor-move ui-sortable-handle', 'data-type': 'sort-handle' },
                React.createElement('i', { className: 'fa fa-resize-vertical' })
              ),
              React.createElement(
                'div',
                { className: 'line-col col4of10 no-padding' },
                React.createElement('input', { onChange: function (e) {
                    return onChangeKey(e);
                  }, value: property.key, className: 'small width-full', name: 'model[properties_attributes][][key]', type: 'text' })
              ),
              React.createElement(
                'div',
                { className: 'line-col col4of10' },
                React.createElement('input', { onChange: function (e) {
                    return onChangeValue(e);
                  }, value: property.value, className: 'small width-full', name: 'model[properties_attributes][][value]', type: 'text' })
              ),
              React.createElement(
                'div',
                { className: 'line-col col1of10 text-align-right' },
                React.createElement(
                  'button',
                  { onClick: function (e) {
                      return onRemove(e);
                    }, className: 'button small inset', 'data-remove': '', title: _jed('Remove') },
                  _jed('Remove')
                )
              )
            );
          }
        });
      } else if (f.type == 'images') {

        return _.map(f.state.images, function (image, index) {

          var onRemove = function (event) {
            event.preventDefault();

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'images'], _.reject(f.state.images, function (si) {
              return si.id == image.id;
            }));
          };

          var onRemoveExisting = function (event) {
            event.preventDefault();

            var l = window.lodash;
            var next = l.cloneDeep(f.state.images);
            next[index]['delete'] = true;

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'images'], next);
          };

          var undo = function (event) {
            event.preventDefault();

            var l = window.lodash;
            var next = l.cloneDeep(f.state.images);
            next[index]['delete'] = false;

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'images'], next);
          };

          var onSetCover = function (event) {
            imageId = event.target.getAttribute('data-image-id');

            var l = window.lodash;
            var next = l.map(l.cloneDeep(f.state.images), function (i) {
              return l.merge(i, { isCover: imageId == i.id });
            });

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'images'], next);
          };

          if (image.type == 'existing') {

            if (image['delete']) {
              return React.createElement(
                'div',
                { key: 'image_' + image.id, className: 'row line font-size-xs focus-hover-thin striked', 'data-type': 'inline-entry' },
                React.createElement(
                  'div',
                  { className: 'line-col col1of10', title: 'Wird beim speichern entfernt' },
                  React.createElement('i', { className: 'fa fa-trash' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of10 text-align-center' },
                  React.createElement(
                    'a',
                    { href: '/images/' + image.id + '/thumbnail', target: '_blank' },
                    React.createElement('img', { className: 'max-height-xxs max-width-xxs', src: '/images/' + image.id + '/thumbnail' })
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col4of10 text-align-left' },
                  React.createElement(
                    'a',
                    { className: 'blue', href: '/images/' + image.id, target: '_blank' },
                    image.filename
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of10 text-align-left' },
                  React.createElement('input', { type: 'radio', title: _jed('Cover Image'), name: 'is_cover', 'data-image-id': image.id, disabled: true })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col3of10 text-align-right' },
                  React.createElement(
                    'button',
                    { onClick: function (e) {
                        return undo(e);
                      }, className: 'button small inset', 'data-image-id': image.id, 'data-remove': '' },
                    _jed('undo')
                  )
                )
              );
            } else {

              return React.createElement(
                'div',
                { key: 'image_' + image.id, className: 'row line font-size-xs focus-hover-thin', 'data-type': 'inline-entry' },
                React.createElement(
                  'div',
                  { className: 'line-col col1of10 text-align-center' },
                  React.createElement(
                    'a',
                    { href: '/images/' + image.id + '/thumbnail', target: '_blank' },
                    React.createElement('img', { className: 'max-height-xxs max-width-xxs', src: '/images/' + image.id + '/thumbnail' })
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col5of10 text-align-left' },
                  React.createElement(
                    'a',
                    { className: 'blue', href: '/images/' + image.id, target: '_blank' },
                    image.filename
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of10 text-align-left' },
                  React.createElement('input', { type: 'radio', title: _jed('Cover Image'), name: 'is_cover', onChange: function (e) {
                      return onSetCover(e);
                    }, 'data-image-id': image.id, checked: image.isCover })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col3of10 text-align-right' },
                  React.createElement(
                    'button',
                    { onClick: function (e) {
                        return onRemoveExisting(e);
                      }, className: 'button small inset', 'data-image-id': image.id, 'data-remove': '' },
                    'Entfernen'
                  )
                )
              );
            }
          } else {

            return React.createElement(
              'div',
              { key: 'image_' + image.id, className: 'row line font-size-xs focus-hover-thin', 'data-new': '', 'data-type': 'inline-entry' },
              React.createElement(
                'div',
                { className: 'line-col col1of10 text-align-center', title: 'File has to be uploaded on save' },
                React.createElement('i', { className: 'fa fa-cloud-upload' })
              ),
              React.createElement(
                'div',
                { className: 'line-col col1of10 text-align-center' },
                React.createElement('img', { id: 'field_' + f.key + '_image_' + image.id, className: 'max-height-xxs max-width-xxs', src: null })
              ),
              React.createElement(
                'div',
                { className: 'line-col col4of10 text-align-left', style: { wordBreak: 'break-all' } },
                image.filename
              ),
              React.createElement(
                'div',
                { className: 'line-col col1of10 text-align-left' },
                React.createElement('input', { type: 'radio', title: _jed('Cover Image'), name: 'is_cover', onChange: function (e) {
                    return onSetCover(e);
                  }, 'data-image-id': image.id, checked: image.isCover })
              ),
              React.createElement(
                'div',
                { className: 'line-col col3of10 text-align-right' },
                React.createElement(
                  'button',
                  { onClick: function (e) {
                      return onRemove(e);
                    }, className: 'button small inset', 'data-remove': '', 'data-image-id': image.id, type: 'button' },
                  _jed('Remove')
                )
              )
            );
          }
        });
      } else if (f.type == 'attachments') {

        return _.map(f.state.attachments, function (attachment, index) {

          var onRemove = function (event) {
            event.preventDefault();

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'attachments'], _.reject(f.state.attachments, function (si) {
              return si.id == attachment.id;
            }));
          };

          var onRemoveExisting = function (event) {
            event.preventDefault();

            var l = window.lodash;
            var next = l.cloneDeep(f.state.attachments);
            next[index]['delete'] = true;

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'attachments'], next);
          };

          var undo = function (event) {
            event.preventDefault();

            var l = window.lodash;
            var next = l.cloneDeep(f.state.attachments);
            next[index]['delete'] = false;

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'attachments'], next);
          };

          if (attachment.type == 'existing') {

            if (attachment['delete']) {

              return React.createElement(
                'div',
                { key: 'attachment_' + attachment.id, className: 'row line font-size-xs focus-hover-thin striked', 'data-type': 'inline-entry' },
                React.createElement(
                  'div',
                  { className: 'line-col', title: 'Wird beim speichern entfernt' },
                  React.createElement('i', { className: 'fa fa-trash' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col7of10 text-align-left' },
                  React.createElement(
                    'a',
                    { className: 'blue', href: '/attachments/' + attachment.id, target: '_blank' },
                    attachment.filename
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col3of10 text-align-right' },
                  React.createElement(
                    'button',
                    { onClick: function (e) {
                        return undo(e);
                      }, className: 'button small inset', 'data-remove': '', type: 'button' },
                    _jed('undo')
                  )
                )
              );
            } else {

              return React.createElement(
                'div',
                { key: 'attachment_' + attachment.id, className: 'row line font-size-xs focus-hover-thin', 'data-type': 'inline-entry' },
                React.createElement(
                  'div',
                  { className: 'line-col col7of10 text-align-left' },
                  React.createElement(
                    'a',
                    { className: 'blue', href: '/attachments/' + attachment.id, target: '_blank' },
                    attachment.filename
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col3of10 text-align-right' },
                  React.createElement(
                    'button',
                    { onClick: function (e) {
                        return onRemoveExisting(e);
                      }, className: 'button small inset', 'data-remove': '', type: 'button' },
                    _jed('Remove')
                  )
                )
              );
            }
          } else {

            return React.createElement(
              'div',
              { key: 'attachment_' + attachment.id, className: 'row line font-size-xs focus-hover-thin', 'data-new': '', 'data-type': 'inline-entry' },
              React.createElement(
                'div',
                { className: 'line-col col1of10 text-align-center', title: 'File has to be uploaded on save' },
                React.createElement('i', { className: 'fa fa-cloud-upload' })
              ),
              React.createElement(
                'div',
                { className: 'line-col col6of10 text-align-left', style: { wordBreak: 'break-all' } },
                attachment.filename
              ),
              React.createElement(
                'div',
                { className: 'line-col col3of10 text-align-right' },
                React.createElement(
                  'button',
                  { onClick: function (e) {
                      return onRemove(e);
                    }, className: 'button small inset', 'data-remove': '', type: 'button' },
                  _jed('Remove')
                )
              )
            );
          }
        });
      } else if (f.type == 'accessories') {

        return _.map(f.state.accessories, function (a, index) {

          var onChange = function (event) {
            var val = event.target.checked;
            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'accessories', index, 'active'], val);
          };

          var onRemove = function (event) {
            event.preventDefault();

            var nextAccessories = null;
            var l = window.lodash;

            if (f.state.accessories[index].id) {
              nextAccessories = l.cloneDeep(f.state.accessories);
              nextAccessories[index]['delete'] = true;
            } else {
              nextAccessories = _.reject(f.state.accessories, function (ai, i) {
                return i == index;
              });
            }

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'accessories'], nextAccessories);
          };

          var onUndo = function () {

            event.preventDefault();

            var l = window.lodash;
            var nextAccessories = null;
            nextAccessories = l.cloneDeep(f.state.accessories);
            nextAccessories[index]['delete'] = false;

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'accessories'], nextAccessories);
          };

          if (a['delete']) {
            return React.createElement(
              'div',
              { key: 'accessory_' + index, className: 'row line font-size-xs focus-hover-thin striked', 'data-type': 'inline-entry' },
              React.createElement(
                'div',
                { className: 'line-col', title: 'Wird beim speichern entfernt' },
                React.createElement('i', { className: 'fa fa-trash' })
              ),
              React.createElement(
                'label',
                { className: 'line-col col1of10 text-align-center no-padding' },
                React.createElement('input', { onChange: function (e) {
                    return onChange(e);
                  }, checked: a.active, autoComplete: 'off', name: 'model[accessories_attributes][uid1][inventory_pool_toggle]', type: 'checkbox' })
              ),
              React.createElement(
                'div',
                { className: 'line-col col6of10 text-align-left' },
                a.label
              ),
              React.createElement(
                'div',
                { className: 'line-col col3of10 text-align-right' },
                React.createElement(
                  'button',
                  { onClick: function (e) {
                      return onUndo(e);
                    }, className: 'button small inset', 'data-remove': '' },
                  _jed('undo')
                )
              )
            );
          } else {
            return React.createElement(
              'div',
              { key: 'accessory_' + index, className: 'row line font-size-xs focus-hover-thin', 'data-new': '', 'data-type': 'inline-entry' },
              React.createElement(
                'label',
                { className: 'line-col col1of10 text-align-center no-padding' },
                React.createElement('input', { onChange: function (e) {
                    return onChange(e);
                  }, checked: a.active, autoComplete: 'off', name: 'model[accessories_attributes][uid1][inventory_pool_toggle]', type: 'checkbox' })
              ),
              React.createElement(
                'div',
                { className: 'line-col col6of10 text-align-left' },
                a.label
              ),
              React.createElement(
                'div',
                { className: 'line-col col3of10 text-align-right' },
                React.createElement(
                  'button',
                  { onClick: function (e) {
                      return onRemove(e);
                    }, className: 'button small inset', 'data-remove': '' },
                  _jed('Remove')
                )
              )
            );
          }
        });
      } else if (f.type == 'search-selections') {

        var allocationRed = false;
        if (f.key == 'allocations' && this.isEdit()) {
          var sumQuantity = _.reduce(f.state.selections, function (m, s) {
            if (s['delete']) {
              return 0;
            } else {
              return m + (isNaN(parseInt(s.quantity)) ? 0 : parseInt(s.quantity));
            }
          }, 0);
          allocationRed = sumQuantity > this.props.edit_data.max_borrowable_quantity;
        }

        return _.map(f.state.selections, function (s, index) {

          var onRemove = function (event) {

            event.preventDefault();

            var next = null;
            var l = window.lodash;

            if (f.state.selections[index].id) {
              next = l.cloneDeep(f.state.selections);
              next[index]['delete'] = true;
            } else {
              next = _.reject(f.state.selections, function (ai, i) {
                return i == index;
              });
            }

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'selections'
            // index,
            // 'quantity'
            ], next);
          };

          var onUndo = function () {

            event.preventDefault();

            var l = window.lodash;
            var next = null;
            next = l.cloneDeep(f.state.selections);
            next[index]['delete'] = false;

            _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
              return f.key == fi.key;
            }), 'state', 'selections'], next);
          };

          if (f.key == 'allocations') {

            var onChange = function (event) {
              var val = event.target.value;
              _this20.updateState(['fields', _.findIndex(_this20.state.fields, function (fi) {
                return f.key == fi.key;
              }), 'state', 'selections', index, 'quantity'], val);
            };

            var red = null;

            if (allocationRed) {
              red = React.createElement('div', { className: 'line-info red' });
            }

            if (s['delete']) {

              return React.createElement(
                'div',
                { key: s.group_id, className: 'row line font-size-xs focus-hover-thin striked', 'data-type': 'inline-entry' },
                red,
                React.createElement(
                  'div',
                  { className: 'line-col', title: 'Wird beim speichern entfernt' },
                  React.createElement('i', { className: 'fa fa-trash' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col3of5 text-align-left', 'data-name': 'AV-Services' },
                  React.createElement(
                    'a',
                    { href: '/manage/' + _this20.props.inventory_pool_id + '/groups/' + s.group_id + '/edit' },
                    s.label
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of5 text-align-center' },
                  React.createElement('input', { value: s.quantity, onChange: function (e) {
                      return onChange(e);
                    }, disabled: true, autoComplete: 'off', className: 'width-xs small text-align-center', name: 'model[partitions_attributes][uid23][quantity]', type: 'text' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of5 text-align-right' },
                  React.createElement(
                    'button',
                    { onClick: function (e) {
                        return onUndo(e);
                      }, className: 'button small inset', 'data-remove': '', type: 'button' },
                    _jed('undo')
                  )
                )
              );
            } else {

              return React.createElement(
                'div',
                { key: s.group_id, className: 'row line font-size-xs focus-hover-thin', 'data-new': '', 'data-type': 'inline-entry' },
                red,
                React.createElement(
                  'div',
                  { className: 'line-col col3of5 text-align-left', 'data-name': 'AV-Techniker' },
                  React.createElement(
                    'a',
                    { href: '/manage/' + _this20.props.inventory_pool_id + '/groups/' + s.group_id + '/edit' },
                    s.label
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of5 text-align-center' },
                  React.createElement('input', { value: s.quantity, onChange: function (e) {
                      return onChange(e);
                    }, autoComplete: 'off', className: 'width-xs small text-align-center', name: 'model[partitions_attributes][uid23][quantity]', type: 'text' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of5 text-align-right' },
                  React.createElement(
                    'button',
                    { onClick: function (e) {
                        return onRemove(e);
                      }, className: 'button small inset' },
                    _jed('Remove')
                  )
                )
              );
            }
          } else {

            if (s['delete']) {

              return React.createElement(
                'div',
                { key: s.id, className: 'row line font-size-xs focus-hover-thin striked', 'data-type': 'inline-entry' },
                React.createElement(
                  'div',
                  { className: 'line-col', title: 'Wird beim speichern entfernt' },
                  React.createElement('i', { className: 'fa fa-trash' })
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col2of3 text-align-left' },
                  s.label
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of3 text-align-right' },
                  React.createElement(
                    'button',
                    { onClick: function (e) {
                        return onUndo(e);
                      }, className: 'button small inset', 'data-remove': '', type: 'button' },
                    _jed('undo')
                  )
                )
              );
            } else {

              return React.createElement(
                'div',
                { key: s.id, className: 'row line font-size-xs focus-hover-thin', 'data-new': '', 'data-type': 'inline-entry' },
                React.createElement(
                  'div',
                  { className: 'line-col col2of3 text-align-left' },
                  s.label
                ),
                React.createElement(
                  'div',
                  { className: 'line-col col1of3 text-align-right' },
                  React.createElement(
                    'button',
                    { onClick: function (e) {
                        return onRemove(e);
                      }, className: 'button small inset', 'data-remove': '' },
                    _jed('Remove')
                  )
                )
              );
            }
          }
        });
      } else {
        return null;
      }
    },

    renderField: function (f) {
      var _this21 = this;

      var renderLabel = function () {
        if (f.key == 'allocations') {
          if (_this21.isEdit()) {
            return _jed(f.label) + ' (max. ' + _this21.props.edit_data.max_borrowable_quantity + ')';
          } else {
            return _jed(f.label);
          }
        } else {
          return _jed(f.label);
        }
      };
      var renderMandatory = function () {
        return f.mandatory ? ' *' : null;
      };

      var labelStyle = {
        color: f.disabled ? '#aaa' : '3a3a3a'
      };

      return React.createElement(
        'div',
        { key: f.key, id: f.key, className: 'field row emboss margin-vertical-xxs margin-right-xs' },
        React.createElement(
          'div',
          { className: 'row padding-inset-xs' },
          React.createElement(
            'div',
            { className: 'col1of2 padding-vertical-xs' },
            React.createElement(
              'strong',
              { className: 'font-size-m inline-block', style: labelStyle },
              renderLabel(),
              renderMandatory()
            )
          ),
          React.createElement(
            'div',
            { className: 'col1of2' },
            this.renderInput(f)
          )
        ),
        React.createElement(
          'div',
          { className: 'list-of-lines even padding-bottom-xxs' + (f.key == 'properties' ? ' ui-sortable' : '') },
          this.renderAdditional(f)
        )
      );
    },

    render: function () {
      return React.createElement(
        'div',
        { className: 'row content-wrapper min-height-xl min-width-full straight-top' },
        this.renderHeader(),
        this.renderContent()
      );
    }
  });
})();
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

;(function () {
  // NOTE: only for linter and clarity:
  /* global React */
  /* global _jed */

  var f = window.lodash;

  var TABLE_CELL_BORDER = '1px solid lightgray';
  var TABLE_CELL_STYLE = {
    padding: '0.25rem 0.5rem',
    verticalAlign: 'bottom',
    border: TABLE_CELL_BORDER
  };

  window.CreateMultipleItemsResult = window.createReactClass({
    propTypes: {},

    getInitialState: function () {
      return {
        showBarcodes: false,
        showFullURLs: false
      };
    },

    render: function () {
      var _this = this;

      var _ref = arguments.length <= 0 || arguments[0] === undefined ? this : arguments[0];

      var props = _ref.props;
      var items = props.items;
      var date = props.date;
      var menu = props.menu;
      var csv_url = props.csv_url;
      var csv_filename = props.csv_filename;

      var pool = items[0].inventory_pool;
      var model = items[0].model;
      // FIXME: get from server, add return_url param
      var modelLink = '/manage/' + pool.id + '/models/' + model.id + '/edit';
      var tdProps = {
        style: {
          padding: '0.25rem 0.5rem',
          verticalAlign: 'bottom',
          border: TABLE_CELL_BORDER
        }
      };

      return React.createElement(
        'div',
        { className: 'row content-wrapper min-height-xl min-width-full straight-top' },
        React.createElement(
          'div',
          { className: 'margin-top-l padding-horizontal-m' },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'div',
              { className: 'col2of3' },
              React.createElement(
                'h1',
                { className: 'headline-xl' },
                _jed('create_multiple_items_head_title')
              )
            ),
            React.createElement(
              'div',
              { className: 'col1of3' },
              React.createElement(
                'div',
                { className: 'text-align-right' },
                React.createElement(InventoryDropdown, { menu: menu })
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'font-size-m padding-horizontal-m margin-top-l' },
          React.createElement(
            'h3',
            { className: 'headline-m padding-bottom-s' },
            _jed('create_multiple_items_head_summary')
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'table',
              null,
              React.createElement(
                'tbody',
                null,
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    tdProps,
                    _jed('create_multiple_items_label_quantity')
                  ),
                  React.createElement(
                    'td',
                    tdProps,
                    items.length
                  )
                ),
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    tdProps,
                    _jed('Model')
                  ),
                  React.createElement(
                    'td',
                    tdProps,
                    React.createElement(
                      'a',
                      { target: '_blank', href: modelLink },
                      model.product,
                      ' ',
                      model.version
                    )
                  )
                ),
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    tdProps,
                    _jed('create_multiple_items_label_date')
                  ),
                  React.createElement(
                    'td',
                    tdProps,
                    date
                  )
                ),
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    tdProps,
                    _jed('create_multiple_items_label_export')
                  ),
                  React.createElement(
                    'td',
                    tdProps,
                    React.createElement(
                      'a',
                      {
                        className: 'button small white',
                        style: { height: '2.2em', fontSize: '0.9em' },
                        href: csv_url,
                        download: csv_filename,
                        target: '_blank' },
                      _jed('create_multiple_items_btn_csv_export')
                    ),
                    ' ',
                    _jed('create_multiple_items_hint_csv_export')
                  )
                )
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'padding-vertical-m' },
            React.createElement(
              'h3',
              { className: 'headline-m padding-bottom-s' },
              _jed('create_multiple_items_head_list')
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'label',
                null,
                React.createElement('input', {
                  type: 'checkbox',
                  checked: this.state.showBarcodes,
                  onChange: function (e) {
                    return _this.setState({ showBarcodes: e.target.checked });
                  }
                }),
                ' ',
                _jed('create_multiple_items_checkbox_show_barcode')
              )
            ),
            React.createElement(
              'div',
              { className: 'margin-bottom-s' },
              React.createElement(
                'label',
                null,
                React.createElement('input', {
                  type: 'checkbox',
                  checked: this.state.showFullURLs,
                  onChange: function (e) {
                    return _this.setState({ showFullURLs: e.target.checked });
                  }
                }),
                ' ',
                _jed('create_multiple_items_checkbox_show_full_urls')
              )
            ),
            React.createElement(ItemsTable, {
              items: items,
              showBarcodes: this.state.showBarcodes,
              showFullURLs: this.state.showFullURLs
            })
          )
        ),
        React.createElement(
          'pre',
          { className: 'hidden' },
          JSON.stringify(props, 0, 2)
        )
      );
    }
  });

  window.CreateMultipleItemsResult.displayName = 'CreateMultipleItemsResult';

  var ItemsTable = function (_ref2) {
    var items = _ref2.items;
    var _ref2$showBarcodes = _ref2.showBarcodes;
    var showBarcodes = _ref2$showBarcodes === undefined ? true : _ref2$showBarcodes;
    var _ref2$showFullURLs = _ref2.showFullURLs;
    var showFullURLs = _ref2$showFullURLs === undefined ? false : _ref2$showFullURLs;

    var tdProps = {
      style: _extends({}, TABLE_CELL_STYLE, { verticalAlign: showBarcodes ? 'middle' : 'bottom' })
    };
    return React.createElement(
      'table',
      {
        className: 'width-full font-size-m',
        style: { fontFamily: 'monospace', border: TABLE_CELL_BORDER, textAlign: 'center' } },
      React.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          null,
          React.createElement(
            'th',
            tdProps,
            '#'
          ),
          React.createElement(
            'th',
            tdProps,
            _jed('Inventory code')
          ),
          React.createElement(
            'th',
            tdProps,
            'UUID/URL'
          )
        )
      ),
      React.createElement(
        'tbody',
        null,
        f.map(items, function (itm, ix) {
          return React.createElement(
            'tr',
            { key: ix, className: 'padding-bottom-s' },
            React.createElement(
              'th',
              _extends({}, tdProps, { scrope: 'row' }),
              ix + 1
            ),
            !showBarcodes ? React.createElement(
              'td',
              tdProps,
              itm.inventory_code
            ) : React.createElement(
              'td',
              { style: _extends({}, TABLE_CELL_STYLE, { padding: 0, textAlign: 'center' }) },
              React.createElement('img', { src: itm.barcode }),
              React.createElement(
                'span',
                { style: { display: 'block', margin: '-0.5rem 0 0.5rem' } },
                itm.inventory_code
              )
            ),
            React.createElement(
              'td',
              tdProps,
              React.createElement(
                'a',
                { target: '_blank', href: itm.url },
                showFullURLs && itm.url ? itm.url : itm.id
              )
            )
          );
        })
      )
    );
  };

  var InventoryDropdown = function (_ref3) {
    var menu = _ref3.menu;

    var spaced = function (str) {
      return ' ' + str + ' ';
    };
    return React.createElement(
      'div',
      { className: 'dropdown-holder inline-block' },
      React.createElement(
        'div',
        { className: 'button white dropdown-toggle' },
        spaced(_jed('Add inventory')),
        React.createElement('div', { className: 'arrow down' })
      ),
      React.createElement(
        'ul',
        { className: 'dropdown right', style: { display: 'none' } },
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { className: 'dropdown-item', href: menu.create_model_url },
            spaced(_jed('Model'))
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { className: 'dropdown-item', href: menu.create_package_url },
            spaced(_jed('Package'))
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { className: 'dropdown-item', href: menu.create_item_url },
            spaced(_jed('Item'))
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { className: 'dropdown-item', href: menu.create_option_url },
            spaced(_jed('Option'))
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { className: 'dropdown-item', href: menu.create_software_url },
            spaced(_jed('Software'))
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { className: 'dropdown-item', href: menu.create_license_url },
            spaced(_jed('Software License'))
          )
        )
      )
    );
  };
})();
/* eslint-disable-next-line react/jsx-no-target-blank */ /* eslint-disable-next-line react/jsx-no-target-blank */ /* eslint-disable-next-line react/jsx-no-target-blank */;
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  // TODO
  // - Highlighting of current day and current selected date in picker.
  // - Make sure no SQL injections are possible.

  window.Expert = window.createReactClass({
    propTypes: {},

    getInitialState: function () {
      return {
        loadingFields: 'initial',
        selectedValues: [],
        searchResult: null,
        openModels: {},
        openPackages: {}
      };
    },

    _fetchFields: function () {
      var _this = this;

      this.setState({ loadingFields: 'loading' });
      App.Field.ajaxFetch({
        data: $.param({ target_type: 'item', exclude_checkbox: true })
      }).done(function (data) {
        _this.setState({
          loadingFields: 'done',
          fields: data
        });
      });
    },

    componentDidMount: function () {
      this.xhrContext = XhrContext();

      Scrolling.mount(this._onScroll);

      this._fetchFields();
      this._refreshList();
    },

    componentWillUnmount: function () {
      // Assumption:
      // If your XHR is pending, and you go to the next page and use the browser back button, then
      // you most likely do not enter the XHR callback, which in this component means,
      // that the next page is not loaded. Thats why we explicitly cancel it.
      this.xhrContext.cancelXhrs();
      Scrollling.unmount(this._onScroll);
    },

    _onScroll: function () {
      this._tryLoadNext();
    },

    _updateSearchResult: function (inventory, availabilities) {
      var page = {
        inventory: inventory,
        availabilities: availabilities,
        items: null
      };

      var searchResult = this.state.searchResult;
      if (!searchResult) {
        searchResult = [page];
      } else {

        var lastPage = searchResult[searchResult.length - 1];
        if (lastPage.inventory.start_index + lastPage.inventory.page_size == inventory.start_index) {
          searchResult = searchResult.concat(page);
        }
      }

      this.setState({
        searchResult: searchResult
      });

      this._tryLoadNext();
    },

    _tryLoadNext: function () {
      if (!this.xhrContext.isEmpty()) {
        return;
      }

      var searchResult = this.state.searchResult;
      var alreadyMoreThanNPages = searchResult && searchResult.length >= 5;

      if (!Scrolling._isBottom() && alreadyMoreThanNPages) {
        return;
      }

      var searchResult = this.state.searchResult;
      if (!searchResult || _.last(searchResult).inventory.has_more) {
        var lastPage = _.last(searchResult);
        this._fetchInventory(lastPage.inventory.start_index + lastPage.inventory.page_size);
      }
    },

    _fetchInventory: function (startIndex) {
      var _this2 = this;

      this.setState({ refresh: !this.state.refresh });
      FetchInventory._fetchInventory(this.xhrContext, startIndex, this.state.selectedValues, function (inventory, data) {
        _this2._updateSearchResult(inventory, data);
      });
    },

    _refreshList: function () {
      var _this3 = this;

      this._clearOpenModels();
      this._clearOpenPackages();

      this.setState({
        searchResult: null
      }, function () {
        _this3._fetchInventory(0);
      });
    },

    _selectedValuesChanged: function (selectedValues) {
      this.setState({ selectedValues: selectedValues }, this._refreshList);
    },

    _searchResultLoading: function () {
      // var loading = <img className='margin-horziontal-auto margin-top-xxl margin-bottom-xxl' src='/assets/loading.gif' />
      var loading = React.createElement('div', { className: 'loading-bg' });
      return React.createElement(
        'div',
        { className: 'table', key: 'result' },
        React.createElement(
          'div',
          { className: 'table-row' },
          React.createElement(
            'div',
            { className: 'table-cell list-of-lines even separated-top padding-bottom-s min-height-l', id: 'inventory' },
            React.createElement('div', { className: 'height-s' }),
            loading,
            React.createElement('div', { className: 'height-s' })
          )
        )
      );
    },

    _searchResultComponent: function () {
      return React.createElement(SearchResult, { key: 'result', searchResult: this.state.searchResult,
        openModels: this.state.openModels,
        openPackages: this.state.openPackages,
        _toggleOpenPackage: this._toggleOpenPackage,
        _toggleOpenModel: this._toggleOpenModel
      });
    },

    _searchResult: function () {
      if (!this.state.searchResult) {
        return this._searchResultLoading();
      } else {
        return this._searchResultComponent();
      }
    },

    _loadingFields: function () {
      // var loading = <img className='margin-horziontal-auto margin-top-xxl margin-bottom-xxl' src='/assets/loading.gif' />
      var loading = React.createElement('div', { className: 'loading-bg' });

      return React.createElement(
        'div',
        { className: 'table' },
        React.createElement(
          'div',
          { className: 'table-row' },
          React.createElement(
            'div',
            { className: 'table-cell list-of-lines even separated-top padding-bottom-s min-height-l', id: 'inventory', style: { border: '0px' } },
            React.createElement('div', { className: 'height-s' }),
            loading,
            React.createElement('div', { className: 'height-s' })
          )
        )
      );
    },

    _fieldSwitch: function () {
      return {
        _hasValue: function (selectedValue) {
          return FieldSwitch._hasValue(selectedValue, true);
        },
        _createEmptyValue: function (field) {
          return FieldSwitch._createEmptyValue(field, true);
        },
        _isDependencyValue: function (selectedValue, fieldDependencyValue) {
          return FieldSwitch._isDependencyValue(selectedValue, fieldDependencyValue, true);
        },
        _inputByType: function (selectedValue, onChangeSelectedValue, dependencyValue) {
          return FieldSwitch._inputByType(selectedValue, onChangeSelectedValue, dependencyValue, true);
        }
      };
    },

    _searchMask: function () {
      return React.createElement(SearchMaskState, { key: 'select', fields: this.state.fields,
        selectedValues: this.state.selectedValues,
        selectedValuesChanged: this._selectedValuesChanged,
        fieldSwitch: this._fieldSwitch()
      });
    },

    _readyContent: function () {
      return [this._searchMask(), this._searchResult()];
    },

    _content: function () {
      if (this.state.loadingFields != 'done') {
        return this._loadingFields();
      } else {
        return this._readyContent();
      }
    },

    _clearOpenModels: function () {
      this.setState({ openModels: {} });
    },

    _clearOpenPackages: function () {
      this.setState({ openPackages: {} });
    },

    _toggleOpenModel: function (id) {
      var openModels = this.state.openModels;
      if (openModels[id]) {
        delete openModels[id];
      } else {
        openModels[id] = 'open';
      }
      this.setState({ openModels: openModels });
    },

    _toggleOpenPackage: function (id) {
      var openPackages = this.state.openPackages;
      if (openPackages[id]) {
        delete openPackages[id];
      } else {
        openPackages[id] = 'open';
      }
      this.setState({ openPackages: openPackages });
    },

    render: function () {
      return React.createElement(
        'div',
        { className: 'row content-wrapper min-height-xl min-width-full straight-top' },
        React.createElement(TitleAndExport, { selectedValues: this.state.selectedValues }),
        this._content()
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  var liBaseClassName = 'separated-bottom exclude-last-child ui-menu-item';

  var NoResults = function () {
    return React.createElement(
      'li',
      { key: 'no_results', className: liBaseClassName, tabIndex: '-1' },
      React.createElement(
        'div',
        { className: 'row text-ellipsis', style: { textAlign: 'center', fontStyle: 'italic', padding: '10px', color: '#aaa', cursor: 'default' } },
        _jed('No results')
      )
    );
  };

  window.BasicAutocompleteInternals = window.createReactClass({
    propTypes: {},

    displayName: 'BasicAutocompleteInternals',

    getInitialState: function () {
      return {
        keyIndex: -1,
        hideDropdown: false
      };
    },

    updateKeyIndex: function (keyIndex) {
      this.makeValidKeyIndex(this.props, keyIndex);
    },

    makeValidKeyIndex: function (props, keyIndex) {

      if (props.result) {
        if (keyIndex >= props.result.length) {
          keyIndex = props.result.length - 1;
        }
        if (keyIndex <= 0) {
          keyIndex = 0;
        }

        this.setState({
          keyIndex: keyIndex
        });
      } else {
        this.setState({
          keyIndex: -1
        });
      }
    },

    componentWillReceiveProps: function (nextProps) {
      this.makeValidKeyIndex(nextProps, this.state.keyIndex);
    },

    _onKeyPress: function (event) {

      if (!this.props.result) {
        return;
      }

      if (event.keyCode == 40) {
        event.preventDefault();
        this.updateKeyIndex(this.state.keyIndex + 1);
      } else if (event.keyCode == 38) {
        event.preventDefault();
        this.updateKeyIndex(this.state.keyIndex - 1);
      } else if (event.keyCode == 13) {
        event.preventDefault();
        var keyIndex = this.state.keyIndex;
        if (keyIndex != -1) {

          var row = this.props.result[keyIndex];

          this.inputReference.blur();

          this.props._onSelect({
            label: _jed(row.label),
            id: row.id,
            value: row.value
          });
        }
      }
    },

    _onFocus: function (event) {
      this.props._onFocus();
      this.setState({ hideDropdown: false });
    },

    _onClick: function (event) {
      this.props._onFocus();
      this.setState({ hideDropdown: false });
    },

    _onChange: function (event) {
      event.preventDefault();
      this.props._onTerm(event.target.value);
    },

    componentDidMount: function () {
      document.addEventListener('mousedown', this._handleClickOutside);
    },

    componentWillUnmount: function () {
      document.removeEventListener('mousedown', this._handleClickOutside);
    },

    _handleClickOutside: function (event) {
      if (this.ulReference && !this.ulReference.contains(event.target) && this.inputReference && !this.inputReference.contains(event.target)) {
        this.setState({ hideDropdown: true });
      }
    },

    _onSelect: function (event, row) {
      event.preventDefault();

      this.inputReference.blur();

      this.props._onSelect({
        label: _jed(row.label),
        id: row.id,
        value: row.value
      });
    },

    _li: function (row, index) {
      var _this = this;

      var className = liBaseClassName;
      if (index == this.state.keyIndex) {
        className += ' ui-state-focus';
      }

      var liARenderer = null;
      if (this.props.liARenderer) {
        liARenderer = this.props.liARenderer;
      } else {
        liARenderer = function (row) {
          return React.createElement(
            'a',
            null,
            React.createElement(
              'div',
              { className: 'row text-ellipsis', style: { width: '500px' } },
              row.label
            )
          );
        };
      }

      return React.createElement(
        'li',
        { key: row.id, className: className, tabIndex: '-1', onMouseDown: function (event) {
            return _this._onSelect(event, row);
          } },
        liARenderer(row)
      );
    },

    renderHasMore: function () {

      if (!this.props.hasMore) {
        return null;
      } else {
        var className = 'separated-bottom exclude-last-child ui-menu-item';
        return React.createElement(
          'li',
          { key: 'has_more', className: className, tabIndex: '-1' },
          React.createElement(
            'div',
            { className: 'row text-ellipsis', style: { textAlign: 'center', fontStyle: 'italic', padding: '10px', color: '#aaa', cursor: 'default' } },
            _jed('has ' + this.props.hasMore + ' more...')
          )
        );
      }
    },

    _lis: function () {
      var _this2 = this;

      return _.compact(this.props.result.map((function (row, index) {
        return _this2._li(row, index);
      }).bind(this)).concat(this.renderHasMore()));
    },

    _ul: function () {
      var _this3 = this;

      if (this.state.hideDropdown) {
        return null;
      } else {
        return React.createElement(
          'ul',
          { ref: function (ref) {
              return _this3.ulReference = ref;
            }, className: 'ui-autocomplete ui-front ui-menu ui-widget ui-widget-content',
            tabIndex: '0', style: { display: 'block', width: this.props.dropdownWidth } },
          this.props.result.length == 0 && this.props.term ? React.createElement(NoResults, null) : this._lis()
        );
      }
    },

    _inputClearedAfterEmptyResults: function () {
      return this.props.result.length == 0 && this.props.term == "";
    },

    _dropdown: function () {
      if (!this.props.result || this._inputClearedAfterEmptyResults()) {
        this.ulReference = null;
        return null;
      } else {
        return React.createElement(
          'div',
          { style: { position: 'relative' } },
          this._ul()
        );
      }
    },

    render: function () {
      var _this4 = this;

      var props = this.props;

      var label = props.label;

      var Element = this.props.element;

      return React.createElement(
        Element,
        { className: 'row', style: this.props.wrapperStyle },
        React.createElement('input', {
          autoComplete: 'off',
          className: this.props.inputClassName,
          id: this.props.inputId,
          ref: function (ref) {
            return _this4.inputReference = ref;
          },
          onChange: this._onChange, value: this.props.term,
          onClick: this._onClick,
          onFocus: this._onFocus,
          onKeyDown: this._onKeyPress,
          placeholder: label, title: label, type: 'text',
          name: this.props.name }),
        React.createElement(
          'div',
          { className: 'addon transparent' },
          React.createElement('i', { className: 'arrow down' })
        ),
        this._dropdown()
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.BasicAutocomplete = window.createReactClass({
    propTypes: {},

    displayName: 'BasicAutocomplete',

    getInitialState: function () {
      return {
        term: this.props.initialText ? this.props.initialText : '',
        result: null
      };
    },

    _callback: function (result) {
      if (this.props.onChange) {
        this.props.onChange(result);
      }
    },

    _onFocus: function () {
      if (!this.state.result) {
        this.debouncedMakeCall();
      }
    },

    _onSelect: function (row) {

      var term = row.label;
      if (this.props.resetAfterSelection) {
        term = '';
      }

      this.setState({
        result: null,
        term: term
      });

      var l = window.lodash;
      this._callback({
        term: row.label,
        id: row.id,
        value: l.cloneDeep(row.value)
      });
    },

    _onTerm: function (term) {
      this.setState({ term: term }, this.debouncedMakeCall);

      this._callback({
        term: term,
        id: null
      });
    },

    componentDidMount: function () {
      this.debouncedMakeCall = _.debounce(this._makeCall, 100);
    },

    _makeCall: function () {
      var _this = this;

      this.props._makeCall(this.state.term, function (result) {
        _this.setState({
          result: result
        });
      });
    },

    // public methods
    // mirror jQueryAutocomplete API (for BarcodeScanner)
    val: function (str) {
      this._onTerm(str);
    },

    render: function () {
      var result = null;
      var hasMore = null;
      if (this.state.result) {
        result = _.first(this.state.result, 100);
        if (this.state.result.length > result.length) {
          hasMore = this.state.result.length - result.length;
        }
      }
      return React.createElement(BasicAutocompleteInternals, {
        inputClassName: this.props.inputClassName,
        element: this.props.element,
        inputId: this.props.inputId,
        dropdownWidth: this.props.dropdownWidth,
        label: this.props.label,
        term: this.state.term,
        result: result,
        hasMore: hasMore,
        _onFocus: this._onFocus,
        _onTerm: this._onTerm,
        _onSelect: this._onSelect,
        name: this.props.name,
        wrapperStyle: this.props.wrapperStyle,
        liARenderer: this.props.liARenderer
      });
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.DatePickerWithInput = window.createReactClass({
    propTypes: {},

    getInitialState: function () {

      return {
        visible: false,
        value: this.props.value ? this.props.value : ''
      };
    },

    _onSelect: function (day, month, year) {
      var _this = this;

      var mom = moment().year(year).month(month).date(day + 1);

      var value = mom.format(i18n.date.L);
      this.setState({
        value: value,
        visible: false
      }, function () {

        if (_this.props.onChange) {
          _this.props.onChange(value);
        }
      });
    },

    _onChange: function (event) {
      var value = event.target.value;
      this.setState({
        value: value
      });

      if (this.props.onChange) {
        this.props.onChange(value);
      }
    },

    _onClose: function () {
      this.setState({ visible: false });
    },

    _renderPicker: function () {

      return React.createElement(
        'div',
        { style: { position: 'relative' } },
        React.createElement(
          'div',
          { style: { position: 'absolute', zIndex: '1', display: this.state.visible ? 'block' : 'none' } },
          React.createElement(DatePicker, { value: CreateItemFieldSwitch._parseDayMonthYear(this.state.value), visible: this.state.visible, onSelect: this._onSelect, onClose: this._onClose })
        )
      );
    },

    _onFocus: function () {
      this.setState({ visible: true });
    },

    componentWillReceiveProps: function (nextProps) {

      if (nextProps.value != this.state.value) {
        this.setState({ value: nextProps.value });
      }
    },

    render: function () {
      var props = this.props;

      if (props.customRenderer) {

        return props.customRenderer({ value: this.state.value, onChange: this._onChange, onFocus: this._onFocus, renderPicker: this._renderPicker });
      } else {

        return(
          // TODO Dummy wrapper. Remove when React supports arrays as return value.
          React.createElement(
            'span',
            null,
            React.createElement('input', { placeholder: i18n.date.L, value: this.state.value, onChange: this._onChange, name: this.props.name, autoComplete: 'off', onFocus: this._onFocus, className: 'width-full hasDatepicker', type: 'text' }),
            this._renderPicker()
          )
        );
      }
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.DatePicker = window.createReactClass({
    propTypes: {},

    _monthTexts: function () {

      return ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    },

    _getMonthText: function () {
      return this._monthTexts()[this.state.month];
    },

    _getYear: function () {
      return this.state.year;
    },

    getInitialState: function () {
      var date = new Date();
      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: null
      };
    },

    _previous: function (event) {
      event.preventDefault();

      var date = new Date(this.state.year, this.state.month, 1);
      date.setMonth(date.getMonth() - 1);
      this.setState({ year: date.getFullYear(), month: date.getMonth() });
    },

    _next: function (event) {
      event.preventDefault();

      var date = new Date(this.state.year, this.state.month, 1);
      date.setMonth(date.getMonth() + 1);
      this.setState({ year: date.getFullYear(), month: date.getMonth() });
    },

    _daysInMonth: function () {
      return new Date(this.state.year, this.state.month + 1, 1 - 1).getDate();
    },

    _firstWeekday: function () {
      return new Date(this.state.year, this.state.month, 1).getDay();
    },

    _firstCol: function () {

      var weekday = this._firstWeekday();
      // Start with monday as 0
      if (weekday == 0) weekday += 7;
      return weekday - 1;
    },

    _select: function (event, index) {
      event.preventDefault();

      var year = this.state.year;
      var month = this.state.month;
      var day = index;

      if (this.props.onSelect) {
        this.props.onSelect(day, month, year);
      }
    },

    componentDidMount: function () {
      document.addEventListener('mousedown', this._handleClickOutside);
    },

    componentWillUnmount: function () {
      document.removeEventListener('mousedown', this._handleClickOutside);
    },

    _handleClickOutside: function (event) {

      if (!this.reference.contains(event.target)) {
        if (this.props.onClose) {
          this.props.onClose();
        }
      }
    },

    _renderNumber: function (index) {
      var _this = this;

      var date = new Date();
      var currentYear = date.getFullYear();
      var currentMonth = date.getMonth();
      var currentDay = date.getDate() - 1;

      var today = currentYear == this.state.year && currentMonth == this.state.month && currentDay == index;

      var selected = false;
      if (this.props.value) {
        var dayMonthYear = this.props.value;
        selected = dayMonthYear.year == this.state.year && dayMonthYear.month == this.state.month && dayMonthYear.day == index;
      }

      if (index >= 0 && index < this._daysInMonth()) {

        var todayStyle = null;
        if (today) {
          todayStyle = {
            border: '1px solid grey',
            borderRadius: '5px'
          };
        }

        if (selected) {
          return React.createElement(
            'td',
            { key: index, className: 'ui-datepicker-days-cell-over ui-datepicker-today' },
            React.createElement(
              'a',
              { style: todayStyle, className: 'ui-state-default ui-state-highlight', href: '#', onClick: function (event) {
                  return _this._select(event, index);
                } },
              index + 1
            )
          );
        } else {

          return React.createElement(
            'td',
            { key: index, className: '' },
            React.createElement(
              'a',
              { style: todayStyle, className: 'ui-state-default', href: '#', onClick: function (event) {
                  return _this._select(event, index);
                } },
              index + 1
            )
          );
        }
      } else {
        return React.createElement(
          'td',
          { key: index, className: 'ui-datepicker-other-month ui-datepicker-unselectable ui-state-disabled' },
          ' '
        );
      }
    },

    _interval: function (n) {
      var arr = [];
      for (var i = 0; i < n; i++) {
        arr.push(i);
      }
      return arr;
    },

    _renderCols: function (row) {
      var _this2 = this;

      return this._interval(7).map(function (col) {

        var index = row * 7 + col - _this2._firstCol();

        return _this2._renderNumber(index);
      });
    },

    _renderTable: function () {
      var _this3 = this;

      var rowCount = Math.ceil((this._firstCol() + this._daysInMonth()) / 7.0);

      return this._interval(rowCount).map(function (row) {
        return React.createElement(
          'tr',
          { key: row },
          _this3._renderCols(row)
        );
      });
    },

    render: function () {
      var _this4 = this;

      var props = this.props;

      return React.createElement(
        'div',
        { ref: function (ref) {
            return _this4.reference = ref;
          }, id: 'ui-datepicker-div', className: 'ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all', style: { display: 'block' } },
        React.createElement(
          'div',
          { className: 'ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all' },
          React.createElement(
            'a',
            { className: 'ui-datepicker-prev ui-corner-all', title: '<', onClick: this._previous },
            React.createElement(
              'span',
              { className: 'ui-icon ui-icon-circle-triangle-w' },
              '<'
            )
          ),
          React.createElement(
            'a',
            { className: 'ui-datepicker-next ui-corner-all', title: '>' },
            React.createElement(
              'span',
              { className: 'ui-icon ui-icon-circle-triangle-e', onClick: this._next },
              '>'
            )
          ),
          React.createElement(
            'div',
            { className: 'ui-datepicker-title' },
            React.createElement(
              'span',
              { className: 'ui-datepicker-month' },
              this._getMonthText()
            ),
            ' ',
            React.createElement(
              'span',
              { className: 'ui-datepicker-year' },
              this._getYear()
            )
          )
        ),
        React.createElement(
          'table',
          { className: 'ui-datepicker-calendar' },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement(
                'th',
                { scope: 'col' },
                React.createElement(
                  'span',
                  { title: 'Montag' },
                  'Mo'
                )
              ),
              React.createElement(
                'th',
                { scope: 'col' },
                React.createElement(
                  'span',
                  { title: 'Dienstag' },
                  'Di'
                )
              ),
              React.createElement(
                'th',
                { scope: 'col' },
                React.createElement(
                  'span',
                  { title: 'Mittwoch' },
                  'Mi'
                )
              ),
              React.createElement(
                'th',
                { scope: 'col' },
                React.createElement(
                  'span',
                  { title: 'Donnerstag' },
                  'Do'
                )
              ),
              React.createElement(
                'th',
                { scope: 'col' },
                React.createElement(
                  'span',
                  { title: 'Freitag' },
                  'Fr'
                )
              ),
              React.createElement(
                'th',
                { scope: 'col', className: 'ui-datepicker-week-end' },
                React.createElement(
                  'span',
                  { title: 'Samstag' },
                  'Sa'
                )
              ),
              React.createElement(
                'th',
                { scope: 'col', className: 'ui-datepicker-week-end' },
                React.createElement(
                  'span',
                  { title: 'Sonntag' },
                  'So'
                )
              )
            )
          ),
          React.createElement(
            'tbody',
            null,
            this._renderTable()
          )
        )
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.ExpertFieldSelection = window.createReactClass({
    propTypes: {},

    displayName: 'ExpertFieldSelection',

    _onChange: function (result) {
      if (!result.id) {
        return;
      }
      var field = _.find(this.props.fields, function (field) {
        return field.id == result.id;
      });
      if (this.props._onSelect) {
        this.props._onSelect(field);
      }
    },

    _makeCall: function (term, callback) {
      callback(FieldsDropdownData._determineData(this.props.fields, this.props.selectedValues, term));
    },

    render: function () {
      var props = this.props;

      return React.createElement(
        'div',
        { className: 'col1of3' },
        React.createElement(
          'label',
          { className: 'row margin-bottom-xxs' },
          _jed('Select Field')
        ),
        React.createElement(BasicAutocomplete, {
          inputClassName: 'has-addon width-full ui-autocomplete-input',
          element: 'div',
          inputId: 'field-input',
          dropdownWidth: '312px',
          label: null,
          _makeCall: this._makeCall,
          onChange: this._onChange,
          resetAfterSelection: true
        })
      );
    }
  });
})();

window.BackwardTestCompatibility = {

  // Should be replaced by lodash.
  _setValue: function (obj, path, val) {
    var fields = path;
    var result = obj;
    for (var i = 0, n = fields.length; i < n && result !== undefined; i++) {
      var field = fields[i];
      if (i === n - 1) {
        result[field] = val;
      } else {
        if (typeof result[field] === 'undefined' || !_.isObject(result[field])) {
          result[field] = {};
        }
        result = result[field];
      }
    }
  },

  _getFormName: function (selectedValue) {

    var field = selectedValue.field;
    if (field.form_name) {
      return '[' + field.form_name + ']';
    } else if (field.attribute instanceof Array) {
      return _.reduce(field.attribute, function (result, part) {
        return result + '[' + part + ']';
      }, '');
      this._setValue(result, field.attribute, value);
    } else {
      return '[' + field.attribute + ']';
    }
  }

};
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputAttachment = window.createReactClass({
    propTypes: {},

    _onFileChange: function (event) {
      event.preventDefault();

      var file = event.target.files[0];

      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.fileModels = value.fileModels.concat({
        type: 'new',
        file: file,
        result: 'pending'
      });

      this.props.onChange(value);
    },

    _renderFileRows: function () {
      var _this = this;

      // debugger
      return this.props.selectedValue.value.fileModels.map(function (fileModel, index) {
        return _this._renderFileRow(fileModel, index);
      });
    },

    _undoRemove: function (index) {

      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.fileModels[index]['delete'] = false;
      this.props.onChange(value);
    },

    _removeNewFile: function (index) {

      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      if (value.fileModels[index].type == 'new') {
        value.fileModels.splice(index, 1);
      } else {
        value.fileModels[index]['delete'] = true;
      }

      this.props.onChange(value);
    },

    _renderFilename: function (fileModel) {
      return React.createElement(
        'a',
        { className: 'blue', href: fileModel.public_filename, target: '_blank' },
        fileModel.filename
      );
    },

    _renderUploadIcon: function (fileModel) {

      return React.createElement(
        'div',
        { className: 'line-col text-align-center', title: 'Datei wird beim speichern hochgeladen' },
        React.createElement('i', { className: 'fa fa-cloud-upload' })
      );
    },

    _renderDeleteIcon: function (fileModel) {

      if (fileModel['delete']) {
        return React.createElement(
          'div',
          { className: 'line-col text-align-center', title: 'Datei wird beim speichern hochgeladen' },
          React.createElement('i', { className: 'fa fa-trash' })
        );
      } else {
        return null;
      }
    },

    _renderDeleteButton: function (fileModel, index) {
      var _this2 = this;

      if (fileModel['delete']) {
        return React.createElement(
          'button',
          { onClick: function (event) {
              return _this2._undoRemove(index);
            }, className: 'button small inset', 'data-remove': '', type: 'button' },
          'Undo'
        );
      } else {
        return React.createElement(
          'button',
          { onClick: function (event) {
              return _this2._removeNewFile(index);
            }, className: 'button small inset', 'data-remove': '', type: 'button' },
          'Entfernen'
        );
      }
    },

    _renderFileRow: function (fileModel, index) {
      var _this3 = this;

      if (fileModel.type == 'new') {

        return React.createElement(
          'div',
          { key: 'key_' + index, className: 'row line font-size-xs focus-hover-thin', 'data-new': '', 'data-type': 'inline-entry' },
          this._renderUploadIcon(fileModel),
          React.createElement(
            'div',
            { className: 'line-col col7of10 text-align-left' },
            fileModel.file.name
          ),
          React.createElement(
            'div',
            { className: 'line-col col3of10 text-align-right' },
            React.createElement(
              'button',
              { onClick: function (event) {
                  return _this3._removeNewFile(index);
                }, className: 'button small inset', 'data-remove': '', type: 'button' },
              'Entfernen'
            )
          )
        );
      } else if (fileModel.type == 'edit') {

        var klass = 'row line font-size-xs focus-hover-thin';
        if (fileModel['delete']) {
          klass += ' striked';
        }

        var isImage = function (fileModel) {
          return fileModel.content_type && fileModel.content_type.indexOf('image') == 0;
        };

        var filenameClass = 'line-col col7of10 text-align-left';
        if (isImage(fileModel)) {
          filenameClass = 'line-col col6of10 text-align-left';
        }

        var renderImage = function (fileModel) {
          if (!isImage(fileModel)) {
            return null;
          }
          return React.createElement(
            'div',
            { className: 'line-col col1of10 text-align-center' },
            React.createElement(
              'a',
              { href: fileModel.public_filename, target: '_blank' },
              React.createElement('img', { className: 'max-height-xxs max-width-xxs', src: fileModel.public_filename })
            )
          );
        };

        return React.createElement(
          'div',
          { key: 'key_' + index, className: klass, 'data-new': '', 'data-type': 'inline-entry' },
          this._renderDeleteIcon(fileModel),
          renderImage(fileModel),
          React.createElement(
            'div',
            { className: filenameClass },
            this._renderFilename(fileModel)
          ),
          React.createElement(
            'div',
            { className: 'line-col col3of10 text-align-right' },
            this._renderDeleteButton(fileModel, index)
          )
        );
      } else {
        throw 'Not implemented for type: ' + fileModel.type;
      }
    },

    render: function () {
      var _this4 = this;

      var props = this.props;
      var selectedValue = props.selectedValue;

      // Make sure input element is cleared always, otherwise you cannot add the same file twice.
      if (this.inputElement) {
        this.inputElement.value = '';
      }

      var fieldClass = 'field row emboss padding-inset-xs margin-vertical-xxs margin-right-xs';
      if (this.props.error) {
        fieldClass += ' error';
      }
      if (selectedValue.hidden) {
        fieldClass += ' hidden';
      }

      return React.createElement(
        'div',
        { className: fieldClass, 'data-editable': 'true', 'data-id': 'attachments', 'data-required': '', 'data-type': 'field' },
        React.createElement(
          'div',
          { className: 'row' },
          RenderFieldLabel._renderFieldLabel(selectedValue.field, this.props.onClose, true),
          React.createElement(
            'div',
            { className: 'col1of2', 'data-type': 'value' },
            React.createElement(
              'button',
              { onClick: function (event) {
                  return _this4.inputElement.click();
                }, type: 'button', className: 'button inset width-full', 'data-type': 'select' },
              'Datei auswählen'
            ),
            React.createElement('input', { ref: function (input) {
                return _this4.inputElement = input;
              }, onChange: this._onFileChange, autoComplete: 'false', className: 'invisible height-full width-full position-absolute-topleft', type: 'file' })
          )
        ),
        React.createElement(
          'div',
          { className: 'list-of-lines even padding-bottom-xxs' },
          this._renderFileRows()
        )
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputAutocompleteSearch = window.createReactClass({
    propTypes: {},

    _onChange: function (result) {

      this.abortAjaxCall();
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.text = result.term;
      value.id = result.id;
      this.props.onChange(value);
    },

    ajaxCall: null,

    abortAjaxCall: function () {
      if (this.ajaxCall) {
        this.ajaxCall.abort();
      }
    },

    _transformResult: function (result) {

      return result.map(function (entry) {

        var label = entry.product;
        if (entry.version) {
          label += ' ' + entry.version;
        }

        return {
          label: label,
          id: entry.id

        };
      });
    },

    _getField: function () {
      return this.props.selectedValue.field;
    },

    _doSearch: function (term, callback) {
      var _this = this;

      var dataUrl = this._getField().search_path;

      if (term.trim() != '') {

        this.abortAjaxCall();

        var params = {
          format: 'json',
          search_term: term
        };

        if (this.context.hackyForPackage && this._getField().id == 'model_id') {
          params.packages = 'true';
        }

        this.ajaxCall = $.ajax({
          url: dataUrl,
          data: $.param(params)
        }).done(function (data) {
          callback(_this._transformResult(data));
        });
      } else {
        callback(null);
      }
    },

    contextTypes: {
      hackyForPackage: PropTypes.bool
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      return React.createElement(FieldAutocomplete, { label: _jed(this._getField().label),
        doSearch: this._doSearch, onChange: this._onChange,
        name: this.props.name, initialText: selectedValue.value.text });
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputAutocomplete = window.createReactClass({
    propTypes: {},

    _onChange: function (result) {

      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.text = result.term;
      value.id = result.id;
      this.props.onChange(value);
    },

    render: function () {
      var _this = this;

      var props = this.props;
      var selectedValue = props.selectedValue;

      var field = selectedValue.field;

      if (field.values_dependency_field_id) {
        var url;
        var doSearch;
        var initialText;

        var _ret = (function () {
          url = field.values_url.replace('$$$parent_value$$$', props.dependencyValue.value.id);

          var formatLabel = function (entry) {
            if (field.id === 'room_id') {
              return entry.name + (!!entry.description ? ' (' + entry.description + ')' : '');
            } else {
              return entry.name;
            }
          };

          doSearch = function (data, term, callback) {
            callback(data.map(function (entry) {
              return {
                label: formatLabel(entry),
                id: entry.id
              };
            }).filter(function (entry) {
              return entry.label.toLowerCase().indexOf(term.toLowerCase()) >= 0;
            }));
          };

          initialText = null;

          if (selectedValue.value.id) {
            initialText = selectedValue.value.text;
          }

          return {
            v: React.createElement(FieldAutocompletePreload, { label: _jed(field.label), preloadUrl: url,
              doDelayedSearch: doSearch, onChange: _this._onChange,
              name: 'item[' + selectedValue.field.id + ']',
              initialText: initialText })
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      } else {

        var transformResult = function (result) {

          return result.map(function (entry) {

            return {
              label: entry.label,
              id: entry.value

            };
          });
        };

        var data = field.values;

        var searchInData = function (term) {

          return data.filter(function (field) {

            return field.label.toLowerCase().indexOf(term.toLowerCase()) >= 0;
          });
        };

        var doSearch = function (term, callback) {

          callback(transformResult(searchInData(term)));
        };

        var initialText = null;
        if (selectedValue.value.id) {
          initialText = selectedValue.value.text;
        }

        return React.createElement(FieldAutocomplete, { label: _jed(field.label),
          initialText: initialText,
          doSearch: doSearch, onChange: this._onChange,
          name: 'item[' + selectedValue.field.id + ']' });
      }
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputCheckbox = window.createReactClass({
    propTypes: {},

    _onChange: function (event, sel) {
      // var value = this.props.selectedValue.field.values[index].value

      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);

      if (event.target.checked) {
        value.selections = _.uniq(value.selections.concat(sel));
      } else {
        value.selections = _.reject(value.selections, function (s) {
          return s === sel;
        });
      }

      this.props.onChange(value);
    },

    _renderCheckboxValues: function (selectedValue) {
      var _this = this;

      return selectedValue.field.values.map(function (value) {

        var checked = _.filter(selectedValue.value.selections, function (s) {
          return s === value.value;
        }).length > 0;

        return React.createElement(
          'label',
          { onClick: function (event) {
              _this._onChange(event, value.value);
            }, key: value.value, className: 'padding-inset-xxs' },
          React.createElement('input', { onChange: function (event) {
              _this._onChange(event, value.value);
            }, type: 'checkbox', checked: checked, value: value.value }),
          checked,
          React.createElement(
            'span',
            { className: 'font-size-m' },
            ' ' + _jed(value.label)
          )
        );
      });
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      return React.createElement(
        'div',
        { className: 'col1of2', 'data-type': 'value' },
        React.createElement(
          'div',
          { className: 'padding-inset-xxs' },
          this._renderCheckboxValues(selectedValue)
        )
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputCurrency = window.createReactClass({
    propTypes: {},

    _onChangeFrom: function (event) {
      event.preventDefault();
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.from = event.target.value;
      this.props.onChange(value);
    },

    _onChangeTo: function (event) {
      event.preventDefault();
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.to = event.target.value;
      this.props.onChange(value);
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      return React.createElement(
        'div',
        { className: 'col1of2', 'data-type': 'value' },
        React.createElement(
          'div',
          { className: 'col1of2' },
          'min:',
          React.createElement('input', { autoComplete: 'off', className: 'width-full', type: 'text', value: selectedValue.value.from, onChange: this._onChangeFrom })
        ),
        React.createElement(
          'div',
          { className: 'col1of2' },
          'max:',
          React.createElement('input', { autoComplete: 'off', className: 'width-full', type: 'text', value: selectedValue.value.to, onChange: this._onChangeTo })
        )
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputDateRange = window.createReactClass({
    propTypes: {},

    _onChangeFrom: function (date) {
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.from = date;
      this.props.onChange(value);
    },

    _onChangeTo: function (date) {
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.to = date;
      this.props.onChange(value);
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      return React.createElement(
        'div',
        { className: 'col1of2', 'data-type': 'value' },
        React.createElement(
          'div',
          { className: 'col1of2' },
          'von:',
          React.createElement(DatePickerWithInput, { value: selectedValue.value.from, onChange: this._onChangeFrom })
        ),
        React.createElement(
          'div',
          { className: 'col1of2' },
          'bis:',
          React.createElement(DatePickerWithInput, { value: selectedValue.value.to, onChange: this._onChangeTo })
        )
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputDate = window.createReactClass({
    propTypes: {},

    _onChange: function (date) {
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.at = date;
      this.props.onChange(value);
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      return React.createElement(
        'div',
        { className: 'col1of2', 'data-type': 'value' },
        React.createElement(DatePickerWithInput, { value: selectedValue.value.at, name: 'item[' + selectedValue.field.id + ']', onChange: this._onChange })
      );
    }
  });
})();
;(function () {
  // NOTE: only for linter and clarity:
  /* global _jed, React, PropTypes, RenderFieldLabel, InputText */

  window.InputInventoryCode = window.createReactClass({
    propTypes: {},
    contextTypes: {
      isBatchCreate: PropTypes.bool,
      batchCreateInventoryCodePrefix: PropTypes.string,
      batchCreateItemFieldsDisabled: PropTypes.arrayOf(PropTypes.string.isRequired)
    },

    getInitialState: function () {
      return {
        selected: 'plusOne'
      };
    },

    _plusOne: function (event) {
      event.preventDefault();
      this.setState({ selected: 'plusOne' });
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.text = this.props.inventoryCodeProps.next_code;
      this.props.onChange(value);
    },

    _fillGap: function (event) {
      event.preventDefault();
      this.setState({ selected: 'fillGap' });
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.text = this.props.inventoryCodeProps.lowest_code;
      this.props.onChange(value);
    },

    _maximum: function (event) {
      event.preventDefault();
      this.setState({ selected: 'maximum' });
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.text = this.props.inventoryCodeProps.highest_code;
      this.props.onChange(value);
    },

    _renderPlusOne: function () {
      return null;
    },

    _renderFillGap: function () {
      return null;
    },

    _renderMaximum: function () {
      return null;
    },

    _renderButtons: function () {
      if (this.props.editMode) {
        return null;
      }

      return React.createElement(
        'div',
        { className: 'row text-align-right margin-top-xs', id: 'switch' },
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: this._plusOne,
            className: 'button small ' + (this.state.selected == 'plusOne' ? 'green' : 'white') },
          ' ' + _jed('last used +1') + ' '
        ),
        ' ',
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: this._fillGap,
            className: 'button small ' + (this.state.selected == 'fillGap' ? 'green' : 'white') },
          ' ' + _jed('fill up gaps') + ' '
        ),
        ' ',
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: this._maximum,
            className: 'button small ' + (this.state.selected == 'maximum' ? 'green' : 'white') },
          ' ' + _jed('assign highest available') + ' '
        )
      );
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      var fieldClass = 'field row emboss padding-inset-xs margin-vertical-xxs margin-right-xs';
      if (this.props.error) {
        fieldClass += ' error';
      }
      if (selectedValue.hidden) {
        fieldClass += ' hidden';
      }

      if (this.context.isBatchCreate) {
        return React.createElement(
          'div',
          { className: fieldClass, 'data-editable': 'false', 'data-required': 'false', 'data-type': 'field' },
          React.createElement(
            'div',
            { className: 'row' },
            RenderFieldLabel._renderFieldLabel(selectedValue.field, this.props.onClose, true),
            React.createElement(
              'div',
              { className: 'col1of2', 'data-type': 'value' },
              React.createElement('input', {
                type: 'text',
                className: 'width-full',
                disabled: true,
                readOnly: true,
                defaultValue: this.context.batchCreateInventoryCodePrefix + '…'
              })
            )
          ),
          React.createElement(
            'p',
            { className: 'font-size-s margin-top-xs' },
            _jed('create_multiple_items_inv_code_notice')
          )
        );
      }

      return React.createElement(
        'div',
        {
          className: fieldClass,
          'data-editable': 'true',
          'data-id': 'inventory_code',
          'data-required': 'true',
          'data-type': 'field' },
        React.createElement(
          'div',
          { className: 'row' },
          RenderFieldLabel._renderFieldLabel(selectedValue.field, this.props.onClose, true),
          React.createElement(InputText, { selectedValue: selectedValue, onChange: this.props.onChange })
        ),
        this._renderButtons()
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputQuantityAllocations = window.createReactClass({
    propTypes: {},

    _undoRemoveAllocation: function (event, index) {
      event.preventDefault();

      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      var allocation = value.allocations[index];
      allocation.deleted = false;
      this.props.onChange(value);
    },

    _removeAllocation: function (event, index) {
      event.preventDefault();

      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);

      var allocation = value.allocations[index];
      if (allocation.type == 'new') {
        var allocations = value.allocations;
        value.allocations.splice(index, 1);
        this.props.onChange(value);
      } else {
        allocation.deleted = true;
        this.props.onChange(value);
      }
    },

    _addAllocation: function (event) {
      event.preventDefault();

      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);

      value.allocations = [{
        quantity: '',
        location: '',
        type: 'new'
      }].concat(value.allocations);

      this.props.onChange(value);
    },

    _onChangeQuantity: function (event, index) {
      event.preventDefault();
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      var allocation = value.allocations[index];
      allocation.quantity = event.target.value;
      this.props.onChange(value);
    },

    _onChangeLocation: function (event, index) {
      event.preventDefault();
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      var allocation = value.allocations[index];
      allocation.location = event.target.value;
      this.props.onChange(value);
    },

    _renderRow: function (allocation, index) {
      var _this = this;

      if (allocation.deleted) {

        return React.createElement(
          'div',
          { key: 'key_' + index, className: 'row line font-size-xs focus-hover-thin striked', 'data-type': 'inline-entry' },
          React.createElement(
            'div',
            { className: 'line-col', title: 'Wird beim speichern entfernt' },
            React.createElement('i', { className: 'fa fa-trash' })
          ),
          React.createElement(
            'div',
            { className: 'line-col col1of10 text-align-center' },
            'Quantity:'
          ),
          React.createElement(
            'div',
            { className: 'line-col col2of10' },
            React.createElement('input', { onChange: function (event) {
                return _this._onChangeQuantity(event, index);
              }, value: allocation.quantity, className: 'width-full small text-align-center', 'data-quantity-allocation': 'true', name: 'item[properties][quantity_allocations][][quantity]', type: 'text' })
          ),
          React.createElement(
            'div',
            { className: 'line-col col1of10 text-align-center' },
            'Location:'
          ),
          React.createElement(
            'div',
            { className: 'line-col col5of10' },
            React.createElement('input', { onChange: function (event) {
                return _this._onChangeLocation(event, index);
              }, value: allocation.location, className: 'width-full small text-align-center', 'data-room-allocation': 'true', name: 'item[properties][quantity_allocations][][room]', type: 'text' })
          ),
          React.createElement(
            'div',
            { className: 'line-col col1of10' },
            React.createElement(
              'button',
              { onClick: function (event) {
                  return _this._undoRemoveAllocation(event, index);
                }, className: 'button inset small', 'data-remove': '' },
              'rückgängig'
            )
          )
        );
      } else {
        return React.createElement(
          'div',
          { key: 'key_' + index, className: 'row line font-size-xs focus-hover-thin', 'data-type': 'inline-entry' },
          React.createElement(
            'div',
            { className: 'line-col col1of10 text-align-center' },
            'Quantity:'
          ),
          React.createElement(
            'div',
            { className: 'line-col col2of10' },
            React.createElement('input', { onChange: function (event) {
                return _this._onChangeQuantity(event, index);
              }, value: allocation.quantity, className: 'width-full small text-align-center', 'data-quantity-allocation': 'true', name: 'item[properties][quantity_allocations][][quantity]', type: 'text' })
          ),
          React.createElement(
            'div',
            { className: 'line-col col1of10 text-align-center' },
            'Location:'
          ),
          React.createElement(
            'div',
            { className: 'line-col col5of10' },
            React.createElement('input', { onChange: function (event) {
                return _this._onChangeLocation(event, index);
              }, value: allocation.location, className: 'width-full small text-align-center', 'data-room-allocation': 'true', name: 'item[properties][quantity_allocations][][room]', type: 'text' })
          ),
          React.createElement(
            'div',
            { className: 'line-col col1of10' },
            React.createElement(
              'button',
              { onClick: function (event) {
                  return _this._removeAllocation(event, index);
                }, className: 'button inset small', 'data-remove': '' },
              'Remove'
            )
          )
        );
      }
    },

    _renderRows: function () {
      var _this2 = this;

      return this.props.selectedValue.value.allocations.map(function (allocation, index) {
        return _this2._renderRow(allocation, index);
      });
    },

    _allocatedQuantity: function () {

      var allocations = this.props.selectedValue.value.allocations;

      var nans = _.filter(allocations, function (a) {
        return a.quantity != '' && isNaN(parseInt(a.quantity));
      });

      if (nans.length > 0) {
        return NaN;
      }

      return _.reduce(allocations, function (result, a) {
        var value = 0;
        if (a.quantity != '') {
          value = parseInt(a.quantity);
        }
        return result + value;
      }, 0);
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      var fieldClass = 'field row emboss padding-inset-xs margin-vertical-xxs margin-right-xs';
      if (this.props.error) {
        fieldClass += ' error';
      }
      if (selectedValue.hidden) {
        fieldClass += ' hidden';
      }

      var totalText = this.props.dataDependency.value.text;
      var total = 0;
      if (totalText != '') {
        total = parseInt(totalText);
      }
      var allocatedQuantity = this._allocatedQuantity();

      var validNumbers = !isNaN(total) && !isNaN(allocatedQuantity);

      var remainingText = 'invalid numbers';
      if (validNumbers) {
        remainingText = _jed('remaining') + ' ' + (total - allocatedQuantity);
      }

      return React.createElement(
        'div',
        { className: fieldClass, 'data-editable': 'true', 'data-id': 'properties_quantity_allocations', 'data-required': '', 'data-type': 'field' },
        React.createElement(
          'div',
          { className: 'row' },
          RenderFieldLabel._renderFieldLabel(selectedValue.field, this.props.onClose, true),
          React.createElement(
            'div',
            { className: 'col1of2', 'data-type': 'value' },
            React.createElement(
              'div',
              { className: 'row' },
              React.createElement(
                'div',
                { className: 'col7of8 padding-vertical-xs', id: 'remaining-total-quantity' },
                remainingText
              ),
              React.createElement(
                'div',
                { className: 'col1of8' },
                React.createElement(
                  'button',
                  { onClick: this._addAllocation, className: 'button inset float-right', id: 'add-inline-entry' },
                  React.createElement('i', { className: 'fa fa-plus' })
                )
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'list-of-lines even' },
          this._renderRows()
        )
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputRadio = window.createReactClass({
    propTypes: {},

    _onChange: function (event, sel) {
      console.log('radio on change');
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.selection = sel;
      this.props.onChange(value);
    },

    _renderRadioValues: function (selectedValue) {
      var _this = this;

      return selectedValue.field.values.map(function (value) {

        var checked = value.value === selectedValue.value.selection;
        return React.createElement(
          'label',
          { onClick: function (event) {
              _this._onChange(event, value.value);
            }, key: value.value, className: 'padding-inset-xxs', htmlFor: selectedValue.field.id + '_' + value.value },
          React.createElement('input', { id: selectedValue.field.id + '_' + value.value, onChange: function (event) {
              _this._onChange(event, value.value);
            }, checked: checked, type: 'radio', value: value.value }),
          React.createElement(
            'span',
            { className: 'font-size-m' },
            ' ' + _jed(value.label)
          )
        );
      });
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      return React.createElement(
        'div',
        { className: 'col1of2' },
        React.createElement(
          'div',
          { className: 'padding-inset-xxs' },
          this._renderRadioValues(selectedValue)
        )
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputSelectWithIndex = window.createReactClass({
    propTypes: {},

    _onChange: function (event) {
      event.preventDefault();

      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.selection = this.props.selectedValue.field.values[parseInt(event.target.value)].value;
      this.props.onChange(value);
    },

    _renderSelectValues: function (selectedValue) {
      return selectedValue.field.values.map(function (value, index) {

        return React.createElement(
          'option',
          { key: '' + index, value: '' + index },
          _jed(value.label)
        );
      });
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      var index = -1;
      for (var i = 0; i < selectedValue.field.values.length; i++) {
        if (selectedValue.field.values[i].value === selectedValue.value.selection) {
          index = i;
        }
      }

      return React.createElement(
        'div',
        { className: 'col1of2' },
        React.createElement(
          'select',
          { className: 'width-full', onChange: this._onChange, value: '' + index },
          this._renderSelectValues(selectedValue)
        )
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputSelect = window.createReactClass({
    propTypes: {},

    _onChange: function (event) {
      event.preventDefault();
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.selection = event.target.value;
      this.props.onChange(value);
    },

    _serializeValue: function (value) {
      if (value == null || value == undefined) {
        return '';
      } else {
        return value;
      }
    },

    _parseValue: function (value) {
      if (value == '') {
        return null;
      } else {
        return value;
      }
    },

    _renderSelectValues: function (selectedValue) {
      var _this = this;

      return selectedValue.field.values.map(function (value) {

        var renderValue = _this._serializeValue(value.value);

        return React.createElement(
          'option',
          { key: value.value, value: renderValue },
          _jed(value.label)
        );
      });
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      return React.createElement(
        'div',
        { className: 'col1of2' },
        React.createElement(
          'select',
          { className: 'width-full', onChange: this._onChange, value: this._serializeValue(selectedValue.value.selection),
            name: 'item' + BackwardTestCompatibility._getFormName(selectedValue) },
          this._renderSelectValues(selectedValue)
        )
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputText = window.createReactClass({
    propTypes: {},

    _onChange: function (event) {
      event.preventDefault();
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.text = event.target.value;
      this.props.onChange(value);
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      return React.createElement(
        'div',
        { className: 'col1of2', 'data-type': 'value' },
        React.createElement('input', { autoComplete: 'off', className: 'width-full', name: 'item' + BackwardTestCompatibility._getFormName(selectedValue),
          type: 'text', value: selectedValue.value.text, onChange: this._onChange })
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InputTextarea = window.createReactClass({
    propTypes: {},

    _onChange: function (event) {
      event.preventDefault();
      var l = window.lodash;
      var value = l.cloneDeep(this.props.selectedValue.value);
      value.text = event.target.value;
      this.props.onChange(value);
    },

    render: function () {
      var props = this.props;
      var selectedValue = props.selectedValue;

      return React.createElement(
        'div',
        { className: 'col1of2', 'data-type': 'value' },
        React.createElement('textarea', { autoComplete: 'off', className: 'width-full', rows: '5', name: 'item[' + selectedValue.field.id + ']',
          value: selectedValue.value.text, onChange: this._onChange })
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  React.findDOMNode = ReactDOM.findDOMNode;

  window.FieldAutocompletePreload = window.createReactClass({
    propTypes: {},

    getInitialState: function () {
      return {
        data: null
      };
    },

    componentDidMount: function () {
      var _this = this;

      App.Model.ajaxFetch({
        url: this.props.preloadUrl,
        data: $.param({
          format: 'json'
        })
      }).done(function (data) {
        _this.setState({ data: data });
      });
    },

    render: function () {
      var _this2 = this;

      var props = this.props;

      if (!this.state.data) {
        return React.createElement('div', null);
      }

      var doSearch = function (term, callback) {
        _this2.props.doDelayedSearch(_this2.state.data, term, callback);
      };

      return React.createElement(FieldAutocomplete, { label: this.props.label,
        doSearch: doSearch, onChange: this.props.onChange,
        initialText: this.props.initialText,
        name: this.props.name });
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var Autocomplete = window.ReactAutocomplete;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.FieldAutocomplete = window.createReactClass({
    propTypes: {},

    name: 'FieldAutocomplete',

    _onChange: function (result) {
      if (this.props.onChange) {
        this.props.onChange(result);
      }
    },

    _makeCall: function (term, callback) {
      this.props.doSearch(term, function (result) {
        callback(result);
      });
    },

    render: function () {
      return React.createElement(
        'div',
        { className: 'col1of2', 'data-type': 'value' },
        React.createElement(BasicAutocomplete, {
          inputClassName: 'has-addon width-full ui-autocomplete-input ui-autocomplete-loading',
          element: 'label',
          inputId: null,
          dropdownWidth: '350px',
          label: this.props.label,
          _makeCall: this._makeCall,
          onChange: this._onChange,
          initialText: this.props.initialText,
          name: this.props.name
        })
      );
    }
  });
})();
window.FieldSwitch = {

  _hasValue: function (selectedValue, queryMode) {
    switch (selectedValue.field.type) {
      case 'text':
        if (selectedValue.field.currency && queryMode) {
          return selectedValue.value.from.trim().length > 0 && selectedValue.value.to.trim().length > 0;
        } else {
          return selectedValue.value.text.trim().length > 0;
        }
        break;
      case 'autocomplete-search':
        return selectedValue.value.id != null;
        break;
      case 'autocomplete':
        return selectedValue.value.id != null;
        break;
      case 'textarea':
        return selectedValue.value.text.trim().length > 0;
        break;
      case 'select':
        return true;
        break;
      case 'radio':
        return true;
        break;
      case 'date':
        if (queryMode) {
          return selectedValue.value.from.trim().length > 0 && selectedValue.value.to.trim().length > 0;
        } else {
          return selectedValue.value.at.trim().length > 0;
        }
        break;
      default:
        throw 'Unexpected type: ' + field.type;
    }
  },

  _createEmptyValue: function (field, queryMode) {
    switch (field.type) {
      case 'text':
        if (field.currency && queryMode) {
          return { from: '', to: '' };
        } else {
          return { text: '' };
        }
        break;
      case 'autocomplete-search':
        return {
          text: '',
          id: null
        };
        break;
      case 'autocomplete':
        return {
          text: '',
          id: null
        };
        break;
      case 'textarea':
        return { text: '' };
        break;
      case 'attachment':
        break;
      case 'select':
        return { selection: field['default'] };
        break;
      case 'radio':
        return { selection: field['default'] };
        break;
      case 'date':
        if (queryMode) {
          return { from: '', to: '' };
        } else {
          return { at: '' };
        }
        break;
      default:
        throw 'Unexpected type: ' + field.type;
    }
  },

  _isDependencyValue: function (selectedValue, fieldDependencyValue, queryMode) {
    switch (selectedValue.field.type) {
      case 'text':
        if (selectedValue.field.currency && queryMode) {
          throw 'Not implemented yet.';
        } else {
          return selectedValue.value.text == fieldDependencyValue;
        }
        break;
      case 'autocomplete-search':
        return selectedValue.value.text == fieldDependencyValue;
        break;
      case 'autocomplete':
        return selectedValue.value.id == fieldDependencyValue;
        break;
      case 'textarea':
        return selectedValue.value.text == fieldDependencyValue;
        break;
      case 'select':
        return '' + selectedValue.value.selection == fieldDependencyValue;
        break;
      case 'radio':
        return '' + selectedValue.value.selection == fieldDependencyValue;
        break;
      case 'date':
        throw 'Not implemented yet.';
        break;
      default:
        throw 'Unexpected type: ' + field.type;
    }
  },

  _inputByType: function (selectedValue, onChangeSelectedValue, dependencyValue, queryMode) {
    switch (selectedValue.field.type) {
      case 'text':
        if (selectedValue.field.currency && queryMode) {
          return React.createElement(InputCurrency, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        } else {
          return React.createElement(InputText, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        }
        break;
      case 'autocomplete-search':
        return React.createElement(InputAutocompleteSearch, { onChange: onChangeSelectedValue, selectedValue: selectedValue });
        break;
      case 'autocomplete':
        return React.createElement(InputAutocomplete, { selectedValue: selectedValue, dependencyValue: dependencyValue, onChange: onChangeSelectedValue });
        break;
      case 'textarea':
        return React.createElement(InputTextarea, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        break;
      case 'select':
        return React.createElement(InputSelectWithIndex, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        break;
      case 'radio':
        return React.createElement(InputRadio, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        break;
      case 'date':
        if (queryMode) {
          return React.createElement(InputDateRange, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        } else {
          return React.createElement(InputDate, { selectedValue: selectedValue, onChange: onChangeSelectedValue });
        }
        break;
      default:
        throw 'Unexpected type: ' + selectedValue.field.type;
    }
  }

};
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.SearchMaskState = window.createReactClass({
    propTypes: {},

    findSelectedValueRec: function (selectedValue, fieldId) {
      if (selectedValue.field.id == fieldId) {
        return selectedValue;
      } else {
        return this.findSelectedValue(selectedValue.dependents, fieldId);
      }
    },

    findSelectedValue: function (selectedValues, fieldId) {
      for (var i = 0; i < selectedValues.length; i++) {
        var d = selectedValues[i];
        var fm = this.findSelectedValueRec(d, fieldId);
        if (fm) {
          return fm;
        }
      }
      return null;
    },

    _onChangeSelectedValue: function (fieldId, value) {
      var l = window.lodash;
      var selectedValues = l.cloneDeep(this.props.selectedValues);
      this.findSelectedValue(selectedValues, fieldId).value = value;
      this._fireSelectedValuesChanged(selectedValues);
    },

    _preventSubmit: function (event) {
      event.preventDefault();
    },

    _onDeselect: function (event, field) {

      event.preventDefault();

      var l = window.lodash;
      var selectedValues = l.cloneDeep(this.props.selectedValues);
      selectedValues = selectedValues.filter(function (selectedValue) {
        return selectedValue.field.id != field.id;
      });

      this._fireSelectedValuesChanged(selectedValues);
    },

    _determineLeftOrRight: function () {

      leftCount = this.props.selectedValues.filter(function (selectedValue) {
        return selectedValue.col == 'left';
      }).length;
      rightCount = this.props.selectedValues.filter(function (selectedValue) {
        return selectedValue.col == 'right';
      }).length;

      if (leftCount <= rightCount) {
        return 'left';
      } else {
        return 'right';
      }
    },

    _onSelect: function (field) {
      var l = window.lodash;
      var selectedValues = l.cloneDeep(this.props.selectedValues);
      selectedValues.push({
        field: field,
        value: this.props.fieldSwitch._createEmptyValue(field),
        col: this._determineLeftOrRight(),
        dependents: []
      });

      this._fireSelectedValuesChanged(selectedValues);
    },

    _fireSelectedValuesChanged: function (selectedValues) {

      EnsureDependents._ensureDependents(selectedValues, this.props.fields, {
        _hasValidValue: this.props.fieldSwitch._hasValue,
        _createEmptyValue: this.props.fieldSwitch._createEmptyValue,
        _isDependencyValue: this.props.fieldSwitch._isDependencyValue
      });
      this.props.selectedValuesChanged(selectedValues);
    },

    render: function () {

      return React.createElement(SearchMask, { onSelect: this._onSelect, fields: this.props.fields,
        selectedValues: this.props.selectedValues, preventSubmit: this._preventSubmit,
        _onDeselect: this._onDeselect,
        _onChangeSelectedValue: this._onChangeSelectedValue,
        fieldSwitch: this.props.fieldSwitch,
        divId: this.props.divId
      });
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.SearchMask = window.createReactClass({
    propTypes: {},

    _renderDependents: function (selectedValue) {
      var _this = this;

      if (!selectedValue.dependents) {
        return [];
      }

      return selectedValue.dependents.map(function (dependent) {
        return _this._renderField(dependent, false);
      });
    },

    _renderCross: function (selectedValue, top) {
      var _this2 = this;

      if (!top) {
        return null;
      }

      return React.createElement(
        'a',
        { onClick: function (event) {
            return _this2.props._onDeselect(event, selectedValue.field);
          }, className: 'font-size-m link grey padding-inset-xs', 'data-placement': 'top', 'data-toggle': 'tooltip', 'data-type': 'remove-field', title: 'Dieses Feld beim Editieren von Gegenständen nicht mehr anzeigen' },
        React.createElement('i', { className: 'fa fa-times-circle' })
      );
    },

    _renderField: function (selectedValue, top) {
      var _this3 = this;

      var dependencyValue = _.first(this.props.selectedValues.filter(function (other) {
        return other.field.id == selectedValue.field.values_dependency_field_id;
      }));

      return React.createElement(
        'div',
        { key: selectedValue.field.id, id: selectedValue.field.id },
        React.createElement(
          'div',
          { className: 'white field row emboss padding-inset-xs margin-vertical-xxs margin-right-xs', 'data-editable': 'true', 'data-id': selectedValue.field.id, 'data-required': selectedValue.field.required ? 'true' : null, 'data-type': selectedValue.field.type },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'div',
              { className: 'col1of2 padding-vertical-xs', 'data-type': 'key' },
              this._renderCross(selectedValue, top),
              React.createElement(
                'strong',
                { className: 'font-size-m inline-block' },
                _jed(selectedValue.field.label) + (selectedValue.field.required ? ' *' : '')
              )
            ),
            this.props.fieldSwitch._inputByType(selectedValue, function (value) {
              return _this3.props._onChangeSelectedValue(selectedValue.field.id, value);
            }, dependencyValue)
          )
        ),
        this._renderDependents(selectedValue)
      );
    },

    _colLeftOrRight: function (leftOrRight) {
      var _this4 = this;

      return this.props.selectedValues.filter(function (selectedValue) {
        return selectedValue.col == leftOrRight;
      }).map(function (selectedValue) {
        return _this4._renderField(selectedValue, true);
      });
    },

    _noFieldsChosen: function () {
      if (this.props.selectedValues.length == 0) {
        return React.createElement(
          'h3',
          { className: 'headline-s light padding-inset-m text-align-center', id: 'no-fields-message' },
          _jed('no fields selected')
        );
      } else {
        return null;
      }
    },

    _colLeft: function () {
      return this._colLeftOrRight('left');
    },

    _colRight: function () {
      return this._colLeftOrRight('right');
    },

    render: function () {

      return React.createElement(
        'div',
        { id: this.props.divId, className: 'row margin-top-l padding-inset-m separated-bottom', style: { borderBottom: '0px' } },
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(ExpertFieldSelection, {
            _onSelect: this.props.onSelect,
            fields: this.props.fields,
            selectedValues: this.props.selectedValues

          })
        ),
        React.createElement(
          'form',
          { onSubmit: this.props.preventSubmit, className: 'row emboss deep margin-top-m padding-inset-s', id: 'field-selection' },
          this._noFieldsChosen(),
          React.createElement(
            'div',
            { className: 'col1of2 padding-right-xs', id: 'field-form-left-side' },
            this._colLeft()
          ),
          React.createElement(
            'div',
            { className: 'col1of2', id: 'field-form-right-side' },
            this._colRight()
          )
        )
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.SearchResult = window.createReactClass({
    propTypes: {},

    _itemEditLink: function (item) {
      return App.Inventory.url().replace('/inventory', '') + '/items/' + item.id + '/edit';
    },

    _itemEditLabel: function (type) {
      switch (type) {
        case 'software':
          return _jed('Edit License');
        case 'model':
          return _jed('Edit Item');
        default:
          throw 'Not supported type: ' + type;
      }
    },

    _itemColumn1ModelLabel: function (modelLabel, isParent) {

      var packageText = null;
      if (isParent) {
        packageText = React.createElement(
          'div',
          { className: 'grey-text' },
          'Package'
        );
      }

      return React.createElement(
        'div',
        { className: 'col1of5 line-col' },
        packageText,
        React.createElement(
          'strong',
          null,
          modelLabel
        )
      );
    },

    _itemColumn1Toggle: function (isParent, item, childCount) {
      var _this = this;

      var toggle = React.createElement('div', { className: 'col1of5 line-col' });
      if (isParent) {
        var _onClick = function (event) {
          _this.props._toggleOpenPackage(item.id);
        };
        var direction = this._isPackageOpen(item.id) ? 'down' : 'right';
        toggle = React.createElement(
          'div',
          { className: 'col1of5 line-col' },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement('div', { className: 'col1of2' }),
            React.createElement(
              'div',
              { className: 'col1of2' },
              React.createElement(
                'button',
                { className: 'button inset small width-full', 'data-type': 'inventory-expander', onClick: _onClick },
                React.createElement('i', { className: 'arrow ' + direction }),
                React.createElement(
                  'span',
                  null,
                  ' ' + childCount + ' '
                )
              )
            )
          )
        );
      }

      return toggle;
    },

    _itemColumn1: function (item, isParent, childCount, isChild, modelLabel) {

      if (modelLabel) {
        if (isChild) {
          return React.createElement('div', { className: 'col1of5 line-col' });
        } else {
          return this._itemColumn1ModelLabel(modelLabel, isParent);
        }
      } else {
        return this._itemColumn1Toggle(isParent, item, childCount);
      }
    },

    _itemColumn23: function (item, isChild) {

      var to_s = null;
      if (isChild) {
        to_s = React.createElement(
          'strong',
          { className: 'grey-text' },
          item.to_s
        );
      }

      var text3 = null;
      if (isChild) {
        text3 = _jed('is part of a package');
      } else {
        text3 = item.current_location;
      }

      return React.createElement(
        'div',
        { className: 'col2of5 line-col text-align-left' },
        React.createElement(
          'div',
          { className: 'row' },
          item.inventory_code
        ),
        to_s,
        React.createElement(
          'div',
          { className: 'row grey-text' },
          text3
        )
      );
    },

    _itemColumn4: function (item) {

      var stati = _.compact([!item.is_borrowable ? _jed('Not Borrowable') : null, item.is_broken ? _jed('Broken') : null, item.is_incomplete ? _jed('Incomplete') : null, item.retired ? _jed('Retired') : null]);

      var status = stati.join(', ');

      return React.createElement(
        'div',
        { className: 'col1of5 line-col text-align-center' },
        React.createElement(
          'strong',
          { className: 'darkred-text' },
          status
        )
      );
    },

    _itemColumn5: function (item, type) {

      return React.createElement(
        'div',
        { className: 'col1of5 line-col line-actions padding-right-xs', style: { paddingRight: '16px' } },
        React.createElement(
          'div',
          { className: 'width-full text-align-right' },
          React.createElement(
            'a',
            { className: 'button white text-ellipsis width-full negative-margin-right-xxs',
              href: this._itemEditLink(item),
              title: this._itemEditLabel(type) },
            this._itemEditLabel(type)
          )
        )
      );
    },

    _searchResultItem: function (type, item, isParent, childCount, isChild, modelLabel) {

      return React.createElement(
        'div',
        { key: 'item_' + item.model_id + '_' + item.id, 'data-item-id': item.id, className: 'line row focus-hover-thin' },
        this._itemColumn1(item, isParent, childCount, isChild, modelLabel),
        this._itemColumn23(item, isChild),
        this._itemColumn4(item),
        this._itemColumn5(item, type)
      );
    },

    _itemsForModel: function (type, searchResult, modelId, is_package, modelLabel) {
      var _this2 = this;

      if (is_package) {
        var parents = searchResult.inventory.items.filter(function (item) {
          return item.model_id == modelId && !item.parent_id;
        });

        return _.flatten(parents.map(function (parent) {

          var children = searchResult.inventory.items.filter(function (item) {
            return parent.id == item.parent_id;
          });

          var result = [_this2._searchResultItem(type, parent, true, children.length, false, modelLabel)];
          if (_this2._isPackageOpen(parent.id) || modelLabel) {
            result = result.concat(children.map(function (child) {
              return _this2._searchResultItem(type, child, false, null, true, modelLabel);
            }));
          }
          return result;
        }));
      } else {
        return searchResult.inventory.items.filter(function (item) {
          return item.model_id == modelId && !item.parent_id;
        }).map(function (item) {
          return _this2._searchResultItem(type, item, false, null, false, modelLabel);
        });
      }
    },

    _isPackageOpen: function (id) {

      return this.props.openPackages[id];
    },

    _isModelOpen: function (id) {

      return this.props.openModels[id];
    },

    _searchResultItemGroup: function (type, searchResult, model, is_package, modelLabel) {

      if (!this._isModelOpen(model.id) && !modelLabel) {
        return null;
      }

      var itemElements = this._itemsForModel(type, searchResult, model.id, is_package, modelLabel);

      var lineClass = 'group-of-lines';
      // if(modelLabel) {
      //   lineClass = 'list-of-lines'
      // }

      if (modelLabel) {
        return itemElements;
      } else {

        return React.createElement(
          'div',
          { key: 'model_group_' + model.id, className: lineClass },
          itemElements
        );
      }
    },

    _availability: function (searchResult, data) {
      return searchResult.availabilities.find(function (a) {
        return a.model_id = data.id;
      });
    },

    _modelItemsCount: function (type, searchResult, modelId, is_package) {
      return searchResult.inventory.items.filter(function (item) {
        return item.model_id == modelId;
      }).length;
    },

    _modelEditLabel: function (type) {
      switch (type) {
        case 'software':
          return _jed('Edit Software');
        case 'model':
          return _jed('Edit Model');
        default:
          throw 'Not supported type: ' + type;
      }
    },

    _modelEditLink: function (model) {
      return App.Inventory.url().replace('/inventory', '') + '/models/' + model.id + '/edit';
    },

    _searchResultModel: function (type, searchResult, data, is_package) {
      var _this3 = this;

      var arrowDirection = 'right';
      if (this._isModelOpen(data.id)) {
        arrowDirection = 'down';
      }

      var availability = this._availability(searchResult, data);

      var itemCount = this._modelItemsCount(type, searchResult, data.id, is_package);

      var downArrow = null;
      var _onItemClick = null;
      if (itemCount > 0) {
        downArrow = React.createElement('i', { className: 'arrow ' + arrowDirection });

        _onItemClick = function () {
          _this3.props._toggleOpenModel(data.id);
        };
      }

      var packageText = null;
      if (is_package) {
        packageText = React.createElement(
          'div',
          { className: 'grey-text' },
          'Package'
        );
      }

      // TODO accessRight? currentUserRole?
      // => check inventory_index_controller
      return React.createElement(
        'div',
        { key: 'model_' + data.id, className: 'line row focus-hover-thin', 'data-id': '8e24ecf3-ca2e-5526-9dc1-582b6d0084fe', 'data-is_package': 'false', 'data-type': 'software' },
        React.createElement(
          'div',
          { className: 'col1of5 line-col' },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'div',
              { className: 'col1of2' },
              React.createElement(
                'button',
                { onClick: _onItemClick, className: 'button inset small width-full', title: 'Gegenstände' },
                downArrow,
                React.createElement(
                  'span',
                  null,
                  ' ' + itemCount
                )
              )
            ),
            React.createElement(
              'div',
              { className: 'col1of2 text-align-center height-xxs' },
              React.createElement(
                'div',
                { className: 'table' },
                React.createElement(
                  'div',
                  { className: 'table-row' },
                  React.createElement(
                    'div',
                    { className: 'table-cell vertical-align-middle' },
                    React.createElement('img', { className: 'max-width-xxs max-height-xxs', src: '/models/' + data.id + '/image_thumb' })
                  )
                )
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'col2of5 line-col text-align-left' },
          packageText,
          React.createElement(
            'strong',
            null,
            data.label
          )
        ),
        React.createElement(
          'div',
          { className: 'col1of5 line-col text-align-center' },
          React.createElement(
            'span',
            { title: 'auf Lager' },
            availability.in_stock
          ),
          '/',
          React.createElement(
            'span',
            { title: 'verleihbar' },
            availability.total_rentable
          )
        ),
        React.createElement(
          'div',
          { className: 'col1of5 line-col line-actions padding-right-xs', style: { paddingRight: '16px' } },
          React.createElement(
            'div',
            { className: 'width-full text-align-right' },
            React.createElement(
              'a',
              { className: 'button white text-ellipsis width-full negative-margin-right-xxs',
                href: this._modelEditLink(data),
                title: this._modelEditLabel(type) },
              this._modelEditLabel(type)
            )
          )
        )
      );
    },

    _searchResultLine: function (sr, data) {

      if (data.type == 'model') {

        var label = data.product;
        if (data.version) {
          label += ' ' + data.version;
        }

        var key = data.model_type.toLowerCase();

        var renderType = 'new';
        if (renderType == 'classic') {

          return [this._searchResultModel(key, sr, {
            id: data.id,
            label: label
          }, data.model_is_package), this._searchResultItemGroup(key, sr, data, data.model_is_package, null)];
        } else {

          return [this._searchResultItemGroup(key, sr, data, data.model_is_package, label)];
        }
      } else {

        throw 'Not implemented for options';
      }
    },

    _searchResultPage: function (sr) {
      var _this4 = this;

      return sr.inventory.data.map(function (entry) {
        return _this4._searchResultLine(sr, entry);
      });
    },

    _searchResultLoader: function (searchResult) {
      if (searchResult[searchResult.length - 1].inventory.has_more) {
        // var loading = <img className='margin-horziontal-auto margin-top-xxl margin-bottom-xxl' src='/assets/loading.gif' />
        var loading = React.createElement('div', { className: 'loading-bg' });
        return React.createElement(
          'div',
          { key: 'loader', className: 'line row focus-hover-thin' },
          loading
        );
      } else {
        return null;
      }
    },

    _appendIfNotNull: function (array, item) {
      if (!item) {
        return array;
      } else {
        return array.concat(item);
      }
    },

    _searchResultLines: function () {
      var _this5 = this;

      var searchResult = this.props.searchResult;

      return this._appendIfNotNull(_.flatten(searchResult.map(function (sr, index) {
        return _this5._searchResultPage(sr);
      })), this._searchResultLoader(searchResult));
    },

    _searchResult: function () {

      if (this.props.searchResult[0].inventory.data.length == 0) {
        return React.createElement(
          'div',
          { className: 'table', key: 'result' },
          React.createElement(
            'div',
            { className: 'table-row' },
            React.createElement(
              'div',
              { className: 'table-cell list-of-lines even separated-top padding-bottom-s min-height-l', id: 'inventory' },
              React.createElement('div', { className: 'height-s' }),
              React.createElement(
                'h3',
                { className: 'headline-s light padding-inset-xl text-align-center' },
                _jed('No entries found')
              ),
              React.createElement('div', { className: 'height-s' })
            )
          )
        );
      }

      return React.createElement(
        'div',
        { className: 'table' },
        React.createElement(
          'div',
          { className: 'table-row' },
          React.createElement(
            'div',
            { className: 'table-cell list-of-lines even separated-top padding-bottom-s min-height-l', id: 'inventory' },
            this._searchResultLines()
          )
        )
      );
    },

    render: function () {
      var props = this.props;

      return this._searchResult();
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.TitleAndExport = window.createReactClass({
    propTypes: {},

    _exportQueryParams: function () {
      var fieldFilters = FetchInventory._buildFieldFilters(this.props.selectedValues);
      var params = {
        search_term: '',
        category_id: void 0,
        include_package_models: true,
        sort: 'name',
        order: 'ASC',
        field_filters: encodeURI(JSON.stringify(fieldFilters))
      };
      return params;
    },

    _csvExportUrl: function () {
      return App.Inventory.url() + '/csv/expert' + '?' + $.param(this._exportQueryParams());
    },

    _excelExportUrl: function () {
      return App.Inventory.url() + '/excel/expert' + '?' + $.param(this._exportQueryParams());
    },

    _titleAndExport: function () {
      return React.createElement(
        'div',
        { className: 'margin-top-l padding-horizontal-m' },
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'div',
            { className: 'col1of3' },
            React.createElement(
              'h1',
              { className: 'headline-xl' },
              _jed('Inventory Advanced Search')
            )
          ),
          React.createElement(
            'div',
            { className: 'col2of3' },
            React.createElement(
              'div',
              { className: 'text-align-right' },
              React.createElement(
                'div',
                { className: 'dropdown-holder inline-block' },
                React.createElement(
                  'div',
                  { className: 'button white dropdown-toggle' },
                  React.createElement('i', { className: 'fa fa-table vertical-align-middle' }),
                  ' Export ',
                  React.createElement('div', { className: 'arrow down' })
                ),
                React.createElement(
                  'ul',
                  { className: 'dropdown right' },
                  React.createElement(
                    'li',
                    null,
                    React.createElement(
                      'a',
                      { className: 'dropdown-item', href: this._csvExportUrl(), id: 'csv-export', target: '_blank' },
                      'CSV'
                    )
                  ),
                  React.createElement(
                    'li',
                    null,
                    React.createElement(
                      'a',
                      { className: 'dropdown-item', href: this._excelExportUrl(), id: 'excel-export', target: '_blank' },
                      'Excel'
                    )
                  )
                )
              )
            )
          )
        )
      );
    },

    render: function () {
      return this._titleAndExport();
    }
  });
})();

window.EnsureDependents = {

  _determineDependents: function (fields, selectedValue, fieldSpecific) {

    var dependents = fields.filter(function (field) {

      // if(field.id == 'properties_quantity_allocations') {
      //   return false;
      // }

      if (field.values_dependency_field_id == selectedValue.field.id && fieldSpecific._hasValidValue(selectedValue)) {
        return true;
      }

      var isDependent = field.visibility_dependency_field_id == selectedValue.field.id;
      if (!isDependent) {
        return false;
      }

      var correctDependencyValue = !field.visibility_dependency_value || fieldSpecific._isDependencyValue(selectedValue, field.visibility_dependency_value);
      if (!correctDependencyValue) {
        return false;
      }

      return true;
    });

    return dependents;
  },

  _ensureDependentsRecursive: function (selectedValue, fields, fieldSpecific) {
    var _this = this;

    var dependents = this._determineDependents(fields, selectedValue, fieldSpecific);

    selectedValue.dependents = dependents.map(function (dependent) {

      var existings = selectedValue.dependents.filter(function (existing) {
        return dependent.id == existing.field.id;
      });
      if (existings.length > 0) {
        return existings[0];
      } else {
        return {
          field: dependent,
          value: fieldSpecific._createEmptyValue(dependent),
          col: selectedValue.col,
          dependents: [],
          hidden: dependent.hidden ? true : false
        };
      }
    });

    selectedValue.dependents.forEach(function (dependent) {
      return _this._ensureDependentsRecursive(dependent, fields, fieldSpecific);
    });
  },

  _ensureDependents: function (selectedValues, fields, fieldSpecific) {
    var _this2 = this;

    if (!selectedValues) {
      return;
    }
    selectedValues.forEach(function (selectedValue) {
      _this2._ensureDependentsRecursive(selectedValue, fields, fieldSpecific);
    });
  }

};

window.FetchInventory = {

  _fetchAvailability: function (xhrContext, inventory, callback) {

    var ids = inventory.data.filter(function (e) {
      return e.type == 'model';
    }).map(function (e) {
      return e.id;
    });

    if (ids.length > 0) {
      var xhrKey = xhrContext.rememberXhr($.ajax({
        url: App.Availability.url() + '/in_stock',
        data: $.param({ model_ids: ids }),
        dataType: 'json'
      }).done(function (data) {
        xhrContext.removeXhr(xhrKey);

        callback(inventory, data);
      }));
    } else {
      callback(inventory, []);
    }
  },

  _buildFieldFilter: function (selectedValue) {
    var field = selectedValue.field;
    return [{
      id: field.id,
      value: selectedValue.value
    }].concat(this._buildFieldFilters(selectedValue.dependents));
  },

  _buildFieldFilters: function (selectedValues) {
    var _this = this;

    return _.compact(_.flatten(selectedValues.map(function (selectedValue) {
      return _this._buildFieldFilter(selectedValue);
    })));
  },

  _fetchInventory: function (xhrContext, startIndex, selectedValues, callback) {
    var _this2 = this;

    xhrContext.cancelXhrs();

    var fieldFilters = this._buildFieldFilters(selectedValues);

    var xhrKey = xhrContext.rememberXhr($.ajax({
      url: App.Inventory.url() + '/expert/index',
      data: $.extend({}, //this._getData(),
      {
        start_index: startIndex,
        search_term: '',
        category_id: void 0,
        include_package_models: true,
        sort: 'name',
        order: 'ASC',
        field_filters: encodeURI(JSON.stringify(fieldFilters))
      }),
      dataType: 'json'

    }).done(function (data) {
      xhrContext.removeXhr(xhrKey);
      _this2._fetchAvailability(xhrContext, data, callback);
    }));
  }

};
window.FieldsDropdownData = {

  _onlyMainFields: function (allFields) {
    return allFields.filter(function (field) {
      return !field['visibility_dependency_field_id'] && !field['values_dependency_field_id'] && field.id != 'attachments';
    });
  },

  _notSelectedFields: function (allFields, selectedValues) {
    return this._onlyMainFields(allFields).filter(function (field) {

      return selectedValues.filter(function (selectedValue) {
        return selectedValue.field.id == field.id;
      }).length == 0;
    });
  },

  _filteredFields: function (allFields, selectedValues, filter) {
    return this._notSelectedFields(allFields, selectedValues).filter(function (field) {

      return _jed(field.label).toLowerCase().indexOf(filter.toLowerCase()) >= 0;
    });
  },

  _determineFields: function (allFields, selectedValues, term) {

    if (term.trim() == '') {
      return this._notSelectedFields(allFields, selectedValues);
    } else {
      return this._filteredFields(allFields, selectedValues, term.trim());
    }
  },

  _determineData: function (allFields, selectedValues, term) {

    return this._determineFields(allFields, selectedValues, term).sort(function (a, b) {
      return _jed(a.label).localeCompare(_jed(b.label));
    }).map(function (field) {
      return {
        id: field.id,
        label: _jed(field.label)
      };
    });
  }

};
window.RenderFieldLabel = {

  _renderFieldLabelText: function (field) {
    if (field.required) {
      return _jed(field.label) + ' *';
    } else {
      return _jed(field.label);
    }
  },

  _renderFieldLabel: function (field, onClose, showClose) {

    var closeIcon = null;

    // if(!field.required && !field.visibility_dependency_field_id && showClose) {
    //   closeIcon = (
    //     <a onClick={onClose} className='font-size-m link grey padding-inset-xs' data-placement='top' data-toggle='tooltip' data-type='remove-field' title='Dieses Feld beim Editieren von Gegenständen nicht mehr anzeigen'>
    //       <i className='fa fa-times-circle'></i>
    //     </a>
    //   )
    // }

    return React.createElement(
      'div',
      { className: 'col1of2 padding-vertical-xs', 'data-type': 'key' },
      closeIcon,
      React.createElement(
        'strong',
        { className: 'font-size-m inline-block' },
        this._renderFieldLabelText(field)
      )
    );
  }

};
window.Scrolling = {
  mount: function (onScroll) {
    window.addEventListener('scroll', onScroll);
  },

  unmount: function (onScroll) {
    window.removeEventListener('scroll', onScroll);
  },

  _getDocHeight: function () {
    D = document;
    return Math.max(D.body.scrollHeight, D.documentElement.scrollHeight, D.body.offsetHeight, D.documentElement.offsetHeight, D.body.clientHeight, D.documentElement.clientHeight);
  },

  _scrollTop: function () {
    return Math.max(document.body.scrollTop, document.documentElement.scrollTop);
  },

  _isBottom: function () {
    return this._scrollTop() + window.innerHeight >= this._getDocHeight() - window.innerHeight * 2; // || window.innerHeight > this._getDocHeight() * 0.3
  }
};
window.XhrContext = function () {

  return {

    xhrRefs: {},

    removeXhr: function (xhrKey) {
      delete this.xhrRefs[xhrKey];
    },

    reuseXhr: function (xhrKey, ajaxRef) {
      this.xhrRefs[xhrKey] = ajaxRef;
    },

    cancelXhrs: function () {

      for (var k in this.xhrRefs) {
        this.xhrRefs[k].abort();
      }
      this.xhrRefs = {};
    },

    rememberXhr: function (ajaxRef) {
      var xhrKey = '' + new Date().getTime();
      this.xhrRefs[xhrKey] = ajaxRef;

      return xhrKey;
    },

    isEmpty: function () {

      return _.isEmpty(this.xhrRefs);
    },

    callXhr: function (xhr) {}

  };
};
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;

  window.HandOverDialog = window.createReactClass({
    propTypes: {},

    getInitialState: function () {
      return {
        showPurposeInput: this._purpose() ? false : true,
        delegatedUser: null
      };
    },

    _userId: function () {
      return this.props.data.user.id;
    },

    _title: function () {
      var itemsCount = this.props.data.itemsCount;
      return _jed(itemsCount, 'Hand over of %s item', 'Hand over of %s items', itemsCount);
    },

    _username: function () {
      var user = this.props.data.user;
      return user.firstname + ' ' + (user.lastname ? user.lastname : '');
    },

    _isUserDelegation: function () {
      return this.props.data.user.isDelegation();
    },

    _onDelegatedUser: function (user) {
      this.setState({
        delegatedUser: user
      });
      this.props.onDelegatedUser(user);
    },

    _renderContactPerson: function () {

      if (this._isUserDelegation()) {

        return React.createElement(
          'div',
          { className: 'row margin-bottom-l' },
          React.createElement(
            'div',
            { className: 'col1of3', id: 'contact-person' },
            React.createElement(ChooseUserPreload, { delegationId: this._userId(), delegatedUser: this.state.delegatedUser, onDelegatedUser: this._onDelegatedUser })
          )
        );
      } else {
        return null;
      }
    },

    _purpose: function () {
      return this.props.data.purpose;
    },

    _showAddPurposeButton: function () {
      return !this.state.showPurposeInput;
    },

    _onAddPurpose: function () {
      this.setState({ showPurposeInput: true });
    },

    _renderAddPurpose: function () {
      if (this._showAddPurposeButton()) {
        return React.createElement(
          'button',
          { onClick: this._onAddPurpose, className: 'button inset', id: 'add-purpose' },
          _jed('Add Purpose')
        );
      } else {
        return null;
      }
    },

    _renderPurpose: function () {

      if (this._purpose()) {
        return React.createElement(
          'div',
          { className: 'row margin-bottom-s emboss padding-inset-s' },
          React.createElement(
            'div',
            { className: 'col3of4' },
            React.createElement(
              'p',
              { className: 'paragraph-s' },
              this._purpose()
            )
          ),
          React.createElement(
            'div',
            { className: 'col1of4 text-align-right' },
            this._renderAddPurpose()
          )
        );
      } else {
        return null;
      }
    },

    _renderProvidePurposeClass: function () {
      if (this.state.showPurposeInput) {
        return '';
      } else {
        return 'hidden';
      }
    },

    _date: function (date) {
      return moment(date).format(i18n.date.L);
    },

    _diffDatesInDays: function (start, end) {
      var ms = moment(start);
      var me = moment(end);
      var days = moment.duration(me.diff(ms)).days() + 1;
      return days + ' ' + _jed(days, 'Day', 'Days');
    },

    _reservationName: function (reservation) {
      return reservation.model().name();
    },

    _subreservationQuantity: function (reservation) {
      return _.reduce(reservation.subreservations, function (mem, r) {
        return mem + r.quantity;
      }, 0);
    },

    _reservationQuantity: function (reservation) {

      if (reservation.subreservations) {
        return this._subreservationQuantity(reservation);
      } else {
        return reservation.quantity;
      }
    },

    _renderReservation: function (reservation, index) {

      return React.createElement(
        'div',
        { key: 'reservation_' + index, className: 'row' },
        React.createElement(
          'div',
          { className: 'col1of8 text-align-center' },
          React.createElement(
            'div',
            { className: 'paragraph-s' },
            this._reservationQuantity(reservation)
          )
        ),
        React.createElement(
          'div',
          { className: 'col7of8' },
          React.createElement(
            'div',
            { className: 'paragraph-s' },
            React.createElement(
              'strong',
              null,
              this._reservationName(reservation)
            )
          )
        )
      );
    },

    _renderReservations: function (groupedLine) {
      var _this = this;

      return groupedLine.reservations.map(function (r, index) {
        return _this._renderReservation(r, index);
      });
    },

    _renderLine: function (groupedLine, index) {

      return React.createElement(
        'div',
        { key: 'grouped_line_' + index, className: 'padding-bottom-m margin-bottom-m no-last-child-margin' },
        React.createElement(
          'div',
          { className: 'row margin-bottom-s' },
          React.createElement(
            'div',
            { className: 'col1of2' },
            React.createElement(
              'p',
              null,
              this._date(groupedLine.start_date),
              ' - ',
              this._date(groupedLine.end_date)
            )
          ),
          React.createElement(
            'div',
            { className: 'col1of2 text-align-right' },
            React.createElement(
              'strong',
              null,
              this._diffDatesInDays(groupedLine.start_date, groupedLine.end_date)
            )
          )
        ),
        this._renderReservations(groupedLine)
      );
    },

    _renderLines: function () {
      var _this2 = this;

      return this.props.data.groupedLines.map(function (gl, index) {
        return _this2._renderLine(gl, index);
      });
    },

    _defaultContractNote: function () {
      return this.props.other.currentInventoryPool.default_contract_note;
    },

    render: function () {

      return(
        // NOTE: Here remove the wrapper element as soon as possible in the new React version.
        React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { className: 'modal-header row' },
            React.createElement(
              'div',
              { className: 'col3of5' },
              React.createElement(
                'h2',
                { className: 'headline-l' },
                this._title()
              ),
              React.createElement(
                'h3',
                { className: 'headline-m light' },
                this._username()
              )
            ),
            React.createElement(
              'div',
              { className: 'col2of5 text-align-right' },
              React.createElement(
                'div',
                { className: 'modal-close' },
                _jed('Cancel')
              ),
              React.createElement(
                'button',
                { className: 'button green', 'data-hand-over': true },
                React.createElement('i', { className: 'fa fa-mail-forward' }),
                _jed('Hand Over')
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'row margin-top-s padding-horizontal-l' },
            React.createElement(
              'div',
              { className: 'separated-bottom padding-bottom-m margin-bottom-m' },
              React.createElement(
                'p',
                { className: 'emboss red padding-inset-s hidden paragraph-s margin-bottom-s', id: 'error' },
                React.createElement('strong', null)
              ),
              this._renderContactPerson(),
              this._renderPurpose(),
              React.createElement(
                'div',
                { className: this._renderProvidePurposeClass(), id: 'purpose-input' },
                React.createElement(
                  'div',
                  { className: 'row padding-bottom-s' },
                  React.createElement(
                    'p',
                    null,
                    _jed('Please provide a purpose...')
                  )
                ),
                React.createElement('textarea', { className: 'row height-xs', id: 'purpose', name: 'purpose' })
              )
            ),
            React.createElement(
              'div',
              { className: 'modal-body' },
              this._renderLines()
            ),
            React.createElement(
              'div',
              { className: 'row separated-top padding-top-m padding-bottom-m' },
              React.createElement(
                'div',
                { className: 'col1of1 padding-bottom-s' },
                React.createElement(
                  'p',
                  null,
                  _jed('Write a note... the note will be part of the contract')
                )
              ),
              React.createElement('textarea', { defaultValue: this._defaultContractNote(), className: 'col1of1 height-xs', id: 'note', name: 'note' })
            )
          )
        )
      );
    }
  });
})();
window.HandOverDialogUtil = {

  _validateStartDate: function (reservations) {

    var hasErrors = _.any(reservations, function (l) {
      return moment(l.start_date).endOf('day').diff(moment().startOf('day'), 'days') > 0;
    });

    if (hasErrors) {
      App.Flash({
        type: 'error',
        message: _jed('you cannot hand out reservations which are starting in the future')
      });
      return false;
    } else {
      return true;
    }
  },

  _validateEndDate: function (reservations) {

    var hasErrors = _.any(reservations, function (l) {
      return moment(l.end_date).endOf('day').diff(moment().startOf('day'), 'days') < 0;
    });

    if (hasErrors) {
      App.Flash({
        type: 'error',
        message: _jed('you cannot hand out reservations which are ending in the past')
      });
      return false;
    } else {
      return true;
    }
  },

  _validateAssignment: function (reservations) {

    var hasErrors = _.any(reservations, function (l) {
      return l.item_id == null && l.option_id == null;
    });

    if (hasErrors) {
      App.Flash({
        type: 'error',
        message: _jed('you cannot hand out reservations with unassigned inventory codes')
      });
      return false;
    } else {
      return true;
    }
  },

  validateDialog: function (reservations) {
    return this._validateStartDate(reservations) && this._validateEndDate(reservations) && this._validateAssignment(reservations);
  },

  loadHandOverDialogData: function (parameters, callback) {
    var _this = this;

    var user = parameters.user;
    var reservations = parameters.reservations;

    $.ajax({
      url: App.Order.url(),
      data: JSON.stringify({
        reservation_ids: _.map(reservations, function (r) {
          return r.id;
        })
      }),
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {

      var orders = data.map(function (datum) {
        return App.Order.find(datum.id);
      });

      var purpose = _.uniq(_.map(orders, function (o) {
        return o.purpose;
      })).join("; ");

      if (_this.validateDialog(reservations)) {

        callback(reservations, purpose);
      } else {
        return false;
      }
    });
  }

};
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InventoryHelperFieldsLoaded = window.createReactClass({
    propTypes: {},

    getInitialState: function () {
      return {
        selectedValues: [],
        currentItem: {
          byId: null,
          byInventoryCode: null,
          loadResult: null
        },
        editFieldModels: null,
        editMode: false,
        saving: false,
        savingResult: null,
        autocompleteItemId: null
      };
    },

    ownerSelected: function (selectedValues) {
      return _.find(selectedValues, function (sv) {
        return sv.field.id == 'owner_id' && sv.value.id != null;
      });
    },

    showOnwerHint: function () {
      App.Flash({
        type: 'notice',
        message: _jed('If you transfer an item to a different inventory pool it\'s not visible for you anymore.')
      });
    },

    selectedValuesChanged: function (selectedValues) {
      var selectedFlat = window.FieldModels._flatFieldModels(selectedValues);

      if (this.ownerSelected(selectedValues)) {
        this.showOnwerHint();
      }

      this.setState({
        selectedValues: selectedValues
      });
    },

    fieldsForForm: function () {
      return _.filter(this.props.fields, function (f) {
        return f.type != 'attachment';
      });
    },

    onNextEditFieldModels: function (nextEditFieldModels) {
      this.setState({ editFieldModels: nextEditFieldModels });
    },

    renderForm: function () {

      if (this.state.saving) {
        return window.InventoryHelperRenderer.renderLoadingItem();
      } else if (!this.state.currentItem.loadResult) {
        return window.InventoryHelperRenderer.renderNoItemSelected();
      } else {
        if (this.state.editMode) {
          return window.InventoryHelperRenderer.renderItemEditor(this.state.currentItem.loadResult, this.fieldsForForm(), this.state.editFieldModels, this.onNextEditFieldModels);
        } else {
          return window.InventoryHelperRenderer.renderAssignResult(this.fieldsForForm(), this.state.currentItem.loadResult, this.state.selectedValuesForSave, this.state.savingResult);
        }
      }
    },

    _editItemFieldSwitch: function () {
      return {
        _hasValidValue: CreateItemFieldSwitch._hasValidValue,
        _createEmptyValue: CreateItemFieldSwitch._createEmptyValue,
        _isDependencyValue: CreateItemFieldSwitch._isDependencyValue
      };
    },

    createFieldModels: function (fields, item) {
      return window.FieldModels._createEditFieldModels(fields, item, this._editItemFieldSwitch, []);
    },

    updateEditItem: function () {
      var _this = this;

      var mergedFieldModels = _.filter(window.FieldModels._flatFieldModels(this.state.editFieldModels), function (fm) {
        return fm.field.type != 'attachment' && !fm.field.exclude_from_submit && CreateItemFieldSwitch._isFieldEditable(fm.field, _this.state.currentItem.loadResult);
      });

      this.ajaxUpdateItem(mergedFieldModels, function (response) {

        _this.setState(function (old) {
          var l = window.lodash;
          var next = l.cloneDeep(old);
          next.currentItem.loadResult = response;
          next.saving = false;
          next.savingResult = null;
          next.editMode = false;
          return next;
        }, function () {});
      });
    },

    ajaxUpdateItem: function (mergedFieldModels, callback) {
      var _this2 = this;

      var serialized = window.SerializeItem._serializeItem(true, mergedFieldModels);

      var data = {
        inventory_pool_id: this.props.inventory_pool_id,
        item: serialized
      };

      var url = '/manage/' + this.props.inventory_pool_id + '/items/' + this.state.currentItem.loadResult.id;

      window.leihsAjax.putAjax(url, data, function (status, data) {

        if (status == 'success') {

          var l = window.lodash;

          _this2.showFlashSuccess('Item was saved.');

          window.leihsAjax.getAjax('/manage/' + _this2.props.inventory_pool_id + '/items/' + _this2.state.currentItem.loadResult.id + '?for=flexibleFields', {}, function (status, response) {

            callback(response);
          });
        } else {

          if (data.responseJSON && data.responseJSON.message) {
            _this2.showFlashError(_jed('Item was not saved') + ' - ' + _jed(data.responseJSON.message));
          } else {
            _this2.showFlashError(_jed('Item was not saved') + ' - ' + _jed('Unexpected error.'));
          }

          _this2.setState({
            saving: false,
            savingResult: 'error'
          }, function () {});
        }
      });
    },

    updateItem: function () {
      var _this3 = this;

      var mergedFieldModels = _.filter(window.FieldModels._flatFieldModels(this.state.selectedValues), function (fm) {
        return fm.field.type != 'attachment' && !fm.field.exclude_from_submit; /*&& CreateItemFieldSwitch._isFieldEditable(fm.field, this.state.currentItem.loadResult)*/
      });

      // if(mergedFieldModels.length == 0) {
      //   this.showFlashError(_jed('You dont have the permission to update any of the selected fields.'))
      //   this.setState({
      //     saving: false
      //   })
      //   return
      // }

      this.ajaxUpdateItem(mergedFieldModels, function (response) {

        _this3.setState(function (old) {
          var l = window.lodash;
          var next = l.cloneDeep(old);
          next.currentItem.loadResult = response;
          next.saving = false;
          next.savingResult = 'success';
          return next;
        }, function () {});
      });
    },

    applySelectedFieldsToItem: function (itemId) {
      var _this4 = this;

      var l = window.lodash;

      window.leihsAjax.getAjax('/manage/' + this.props.inventory_pool_id + '/items/' + itemId + '?for=flexibleFields', {}, function (status, response) {
        _this4.setState(function (old) {
          var next = l.cloneDeep(old);
          next.currentItem.loadResult = response;
          return next;
        }, function () {
          _this4.updateItem();
        });
      });
    },

    cancelApplyByBarcode: function () {
      this.setState(function (old) {
        var l = window.lodash;
        var next = l.cloneDeep(old);
        next.saving = false;
        next.currentItem.byInventoryCode = null;
        return next;
      });
    },

    prepareApplyByBarcode: function () {
      var _this5 = this;

      var l = window.lodash;

      window.leihsAjax.getAjax('/manage/' + this.props.inventory_pool_id + '/items?inventory_code=' + this.state.currentItem.byInventoryCode, {}, function (status, result) {
        if (result.length != 1) {
          App.Flash({
            type: 'error',
            message: _jed('The Inventory Code %s was not found.', _this5.state.currentItem.byInventoryCode)
          });

          _this5.cancelApplyByBarcode();
        } else {
          _this5.applySelectedFieldsToItem(result[0].id);
        }
      });
    },

    onChangeItemId: function (id, term) {
      this.setState({
        autocompleteItemId: id,
        autocompleteItemTerm: term
      });
    },

    cancelSelection: function () {
      this.setState({
        autocompleteItemId: null,
        autocompleteItemTerm: null
      });
    },

    startApplyBySearch: function (callback) {
      var _this6 = this;

      this.setState(function (old) {
        var l = window.lodash;
        var next = l.cloneDeep(old);
        next.selectedValuesForSave = l.cloneDeep(_this6.state.selectedValues);
        next.currentItem.byId = old.autocompleteItemId;
        next.currentItem.loadResult = null;
        next.saving = true;
        next.editMode = false;
        return next;
      }, function () {

        _this6.applySelectedFieldsToItem(_this6.state.currentItem.byId);
      });
    },

    onApplyBySearch: function (event) {

      var l = window.lodash;

      this.hideFlash();

      if (!this.state.autocompleteItemId) {
        this.showFlashError(_jed('Please select an item.'));
        return;
      }

      if (this.state.selectedValues.length == 0) {
        this.showFlashError(_jed('Please select some fields.'));
        return;
      }

      this.startApplyBySearch();
    },

    hideFlash: function () {
      App.Flash.reset();
    },

    showFlashError: function (message) {
      App.Flash({
        type: 'error',
        message: message
      });
    },

    showFlashSuccess: function (message) {
      App.Flash({
        type: 'success',
        message: _jed(message)
      });
    },

    showInvalidFlash: function () {
      App.Flash({
        type: 'error',
        message: _jed('Please provide all required fields')
      });
    },

    renderSaveButton: function () {
      var _this7 = this;

      var onSave = function (event) {

        if (!window.CreateItemValidation._clientValidation(_this7.state.editFieldModels)) {

          _this7.showInvalidFlash();
        } else {
          _this7.hideFlash();
        }

        _this7.setState({
          saving: true
        }, function () {
          _this7.updateEditItem();
        });
      };

      return React.createElement(
        'button',
        { onClick: function (e) {
            return onSave(e);
          }, className: 'button green' + (!this.state.editMode ? ' hidden' : ''), id: 'save-edit' },
        _jed('Save changes')
      );
    },

    renderCancelButton: function () {
      var _this8 = this;

      var onCancel = function (event) {
        _this8.setState({
          editMode: false
        });
      };

      return React.createElement(
        'a',
        { onClick: function (e) {
            return onCancel(e);
          }, className: 'button' + (!this.state.editMode ? ' hidden' : ''), id: 'cancel-edit' },
        _jed('Cancel')
      );
    },

    renderEditButton: function () {
      var _this9 = this;

      var onEdit = function (event) {
        _this9.setState({
          editMode: true,
          editFieldModels: _this9.createFieldModels(_this9.fieldsForForm(), _this9.state.currentItem.loadResult)
        });
      };

      return React.createElement(
        'button',
        { onClick: function (e) {
            return onEdit(e);
          }, className: 'button white' + (this.state.editMode ? ' hidden' : ''), id: 'item-edit' },
        _jed('Edit Item')
      );
    },

    renderButtons: function () {

      if (this.state.saving) {
        return;
      }
      if (!this.state.currentItem.loadResult) {
        return;
      }

      return React.createElement(
        'div',
        { className: 'col1of3 text-align-right' },
        this.renderEditButton(),
        this.renderCancelButton(),
        this.renderSaveButton()
      );
    },

    startApplyByBarcode: function (inventoryCode, callback) {
      var _this10 = this;

      this.setState(function (old) {
        var l = window.lodash;
        var next = l.cloneDeep(old);
        next.selectedValuesForSave = l.cloneDeep(_this10.state.selectedValues);
        next.currentItem.byInventoryCode = inventoryCode;
        next.currentItem.loadResult = null;
        next.saving = true;
        next.editMode = false;
        return next;
      }, function () {
        _this10.prepareApplyByBarcode();
      });
    },

    checkApplyByBarcode: function (inventoryCode) {
      if (inventoryCode.length == 0) {
        this.showFlashError(_jed('Please provide an inventory code'));
        return;
      }

      if (this.state.selectedValues.length == 0) {
        this.showFlashError(_jed('Please select some fields.'));
        return;
      }

      this.startApplyByBarcode(inventoryCode);
    },

    onApplyByBarcode: function (event) {
      var _this11 = this;

      event.preventDefault();

      this.setState({
        autocompleteItemId: null,
        autocompleteItemTerm: null
      }, function () {

        var inventoryCode = _this11.barcodeInput.value;
        _this11.barcodeInput.value = '';

        _this11.hideFlash();

        _this11.checkApplyByBarcode(inventoryCode);
      });
    },

    renderNotOwner: function () {
      return null;

      // if(!this.state.currentItem.loadResult) {
      //   return
      // }
      //
      //
      // var isOwner = () => {
      //
      //   var ownerId = this.state.currentItem.loadResult.owner_id
      //   return ownerId == this.props.inventory_pool_id
      //
      // }
      //
      // if(isOwner()) {
      //   return null
      // }
      //
      //
      // return (
      //   <div className='row emboss red text-align-center font-size-m padding-inset-s'>
      //     <strong>Sie sind nicht Besitzer dieses Gegenstands, deshalb können Sie einige Felder nicht editieren</strong>
      //   </div>
      // )
    },

    setBarcodeRef: function (ref) {
      this.barcodeInput = ref;
    },

    renderManualInput: function () {
      var _this12 = this;

      if (this.state.autocompleteItemId) {
        return React.createElement(
          'div',
          { className: 'row', style: { height: '50px', marginLeft: '5px', border: '1px dashed #bbb', borderRadius: '5px', padding: '5px', marginTop: '10px', marginBottom: '10px', textAlign: 'center' } },
          React.createElement(
            'div',
            { style: { width: '100%', display: 'inline-block' } },
            React.createElement(
              'div',
              { className: 'row', style: { fontSize: '16px', color: 'rgb(153, 153, 153)', display: 'inline-block', clear: 'none', width: '50%', marginRight: '10px' } },
              this.state.autocompleteItemTerm,
              React.createElement('i', { className: 'fa fa-times-circle', style: { margin: '0px 10px' }, onClick: function (e) {
                  return _this12.cancelSelection();
                } })
            ),
            React.createElement(
              'button',
              { onClick: function (e) {
                  return _this12.onApplyBySearch(e);
                }, className: 'button green', type: 'submit' },
              _jed('and assign fields')
            )
          )
        );
      } else {
        return window.InventoryHelperRenderer.renderManualInput(this.props.inventory_pool_id, this.onChangeItemId, this.onApplyBySearch);
      }
    },

    renderItem: function () {

      return React.createElement(
        'div',
        { className: 'row padding-inset-m', id: 'item-section' },
        React.createElement(
          'div',
          { className: 'row', style: { marginBottom: '30px' } },
          React.createElement(
            'div',
            { className: 'col1of2' },
            window.InventoryHelperRenderer.renderBarcodeInput(this.setBarcodeRef, this.onApplyByBarcode)
          ),
          React.createElement(
            'div',
            { className: 'col1of2' },
            this.renderManualInput()
          )
        ),
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement('div', { className: 'col2of3' }),
          this.renderButtons()
        ),
        React.createElement(
          'div',
          { className: 'padding-vertical-m', id: 'notifications' },
          this.renderNotOwner()
        ),
        this.renderForm()
      );
    },

    render: function () {
      return React.createElement(
        'div',
        { className: 'row content-wrapper min-height-xl min-width-full straight-top' },
        React.createElement(
          'div',
          { className: 'margin-top-l padding-horizontal-m' },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'h1',
              { className: 'headline-xl' },
              _jed('Inventory Helper')
            ),
            React.createElement(
              'h2',
              { className: 'headline-m light' },
              _jed('Process multiple fields for multiple items in a row')
            )
          )
        ),
        window.InventoryHelperRenderer.renderSearchMask(this.props.fields, this.state.selectedValues, this.selectedValuesChanged),
        this.renderItem()
      );
    }
  });
})();
window.InventoryHelperRenderer = {

  renderSearchMask: function (fields, selectedValues, selectedValuesChanged) {

    var _fieldSwitch = function () {
      return {
        _hasValue: function (selectedValue) {
          return FieldSwitch._hasValue(selectedValue, false);
        },
        _createEmptyValue: function (field) {
          return FieldSwitch._createEmptyValue(field, false);
        },
        _isDependencyValue: function (selectedValue, fieldDependencyValue) {
          return FieldSwitch._isDependencyValue(selectedValue, fieldDependencyValue, false);
        },
        _inputByType: function (selectedValue, onChangeSelectedValue, dependencyValue) {
          return FieldSwitch._inputByType(selectedValue, onChangeSelectedValue, dependencyValue, false);
        }
      };
    };

    return React.createElement(SearchMaskState, { fields: fields,
      selectedValues: selectedValues,
      selectedValuesChanged: selectedValuesChanged,
      fieldSwitch: _fieldSwitch(),
      divId: 'search-mask'
    });
  },

  renderLoadingItem: function () {
    return React.createElement(
      'div',
      { className: 'row', id: 'flexible-fields' },
      React.createElement('div', { className: 'height-s' }),
      React.createElement('div', { className: 'loading-bg' }),
      React.createElement('div', { className: 'height-s' })
    );
  },

  renderNoItemSelected: function () {

    return React.createElement(
      'form',
      { className: 'row', id: 'flexible-fields' },
      React.createElement('div', { className: 'height-s' }),
      React.createElement(
        'h3',
        { className: 'headline-s light padding-inset-m text-align-center' },
        _jed('no item selected')
      ),
      React.createElement('div', { className: 'height-s' })
    );
  },

  renderItemEditor: function (loadResult, fields, editFieldModels, onNextEditFieldModels) {
    var _this = this;

    var fieldRenderer = function (fieldModel, fieldModels, onChange, showInvalids, onClose, dependencyValue, dataDependency) {

      return CreateItemFieldSwitch.renderField(fieldModel, dependencyValue, dataDependency, function (value) {
        return onChange(fieldModel.field.id, value);
      }, loadResult, {}, showInvalids, onClose, false);
    };

    var onClose = function () {};

    var onChangeEditItem = function (fieldId, value) {
      var l = window.lodash;
      var nextEditFieldModels = l.cloneDeep(editFieldModels);
      window.FieldModels.findFieldModel(nextEditFieldModels, fieldId).value = value;
      window.FieldModels._ensureDependents(nextEditFieldModels, fields, _this._editItemFieldSwitch);
      onNextEditFieldModels(nextEditFieldModels);
    };

    return RenderCreateItem._renderColumns(fields, editFieldModels, onChangeEditItem, true, onClose, fieldRenderer);
  },

  _editItemFieldSwitch: function () {
    return {
      _hasValidValue: CreateItemFieldSwitch._hasValidValue,
      _createEmptyValue: CreateItemFieldSwitch._createEmptyValue,
      _isDependencyValue: CreateItemFieldSwitch._isDependencyValue
    };
  },

  createFieldModels: function (fields, item) {
    return window.FieldModels._createEditFieldModels(fields, item, this._editItemFieldSwitch, []);
  },

  renderAssignResult: function (fields, loadResult, selectedValuesForSave, savingResult) {

    var fieldModels = this.createFieldModels(fields, loadResult);
    var selectedFlat = window.FieldModels._flatFieldModels(selectedValuesForSave);

    var item = loadResult;
    var fieldRenderer = function (fieldModel, fieldModels, onChange, showInvalids, onClose, dependencyValue, dataDependency) {

      var l = window.lodash;

      var selected = _.find(selectedFlat, function (sf) {
        return sf.field.id == fieldModel.field.id;
      });
      var clazz = null;
      if (savingResult != null && selected) {

        if (CreateItemFieldSwitch._isFieldEditable(selected.field, loadResult)) {
          clazz = 'success';
        } else {
          clazz = 'error';
        }

        // if(savingResult == 'success') {
        // } else if(savingResult == 'error') {
        //   clazz = 'error'
        // }
        //
      }

      var v = fieldModel;

      return CreateItemFieldSwitch._renderOutputField(v, dependencyValue, dataDependency, function (value) {
        return onChange(fieldModel.field.id, value);
      }, showInvalids, onClose, {
        additionalRowClass: clazz,
        showClose: false
      });
    };

    var onClose = function () {};

    var onChangeEditItem = function () {};

    return RenderCreateItem._renderColumns(fields, fieldModels, onChangeEditItem, true, onClose, fieldRenderer);
  },

  renderBarcodeInput: function (setBarcodeRef, onSubmit) {
    return React.createElement(
      'div',
      { style: { height: '50px', marginRight: '5px', border: '1px dashed #bbb', borderRadius: '5px', padding: '5px', marginTop: '10px', marginBottom: '10px' } },
      React.createElement(
        'form',
        { className: 'row', id: 'item-selection', onSubmit: function (e) {
            return onSubmit(e);
          } },
        React.createElement('input', { ref: function (ref) {
            return setBarcodeRef(ref);
          }, autoComplete: 'off', style: { border: 'none', fontSize: '16px', color: '#999', textAlign: 'center', boxShadow: 'none', textAlign: 'center' }, className: 'width-full ui-autocomplete-input', 'data-barcode-scanner-target': '', id: 'item-input', placeholder: _jed('use barcode scanner to assign fields to item immediately'), type: 'text' }),
        React.createElement(
          'button',
          { type: 'submit', style: { position: 'absolute', right: '0px', top: '5px', opacity: '0' }, 'data-barcode-scanner-submit-button': '' },
          '>'
        )
      )
    );
  },

  renderManualInput: function (inventory_pool_id, onChangeItemId, assignFields) {
    return React.createElement(
      'div',
      { className: 'row', style: { height: '50px', marginLeft: '5px', border: '1px dashed #bbb', borderRadius: '5px', padding: '5px', marginTop: '10px', marginBottom: '10px', textAlign: 'center' } },
      React.createElement(
        'div',
        { style: { width: '100%', display: 'inline-block' } },
        window.InventoryHelperRenderer.renderItemSearch(inventory_pool_id, onChangeItemId),
        React.createElement(
          'button',
          { onClick: function (e) {
              return assignFields(e);
            }, className: 'button green', type: 'submit' },
          _jed('and assign fields')
        )
      )
    );
  },

  renderItemSearch: function (inventory_pool_id, onChangeItemId) {

    var makeCall = function (term, callback) {

      window.leihsAjax.getAjax('/manage/' + inventory_pool_id + '/items?search_term=' + term, {}, function (status, response) {

        callback(_.map(response, function (r) {
          return {
            id: r.id,
            label: r.inventory_code,
            currentLocation: r.current_location,
            inventoryCode: r.inventory_code
          };
        }));
      });
    };

    var liARenderer = function (row) {
      return React.createElement(
        'a',
        { className: 'ui-menu-item-wrapper' },
        React.createElement(
          'div',
          { className: 'row text-ellipsis' },
          React.createElement(
            'div',
            { className: 'col1of3' },
            React.createElement(
              'strong',
              null,
              row.inventoryCode
            )
          ),
          React.createElement(
            'div',
            { className: 'col2of3 text-ellipsis', title: row.currentLocation },
            row.currentLocation
          )
        )
      );
    };

    var onChange = function (result) {
      var term = result.term;
      var id = result.id;
      if (id) {
        onChangeItemId(id, term);
      }
    };

    return React.createElement(BasicAutocomplete, {
      inputClassName: 'has-addon width-full ui-autocomplete-input',
      element: 'div',
      inputId: 'item-search-input',
      dropdownWidth: '312px',
      label: _jed('or search for item'),
      _makeCall: makeCall,
      onChange: onChange,
      wrapperStyle: { display: 'inline-block', clear: 'none', width: '50%', marginRight: '10px' },
      liARenderer: liARenderer
    });
  }

};
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  React.findDOMNode = ReactDOM.findDOMNode; // NOTE: autocomplete lib needs this

  window.InventoryHelper = window.createReactClass({
    propTypes: {},

    getInitialState: function () {
      return {
        fields: null
      };
    },

    loadFields: function () {
      var _this = this;

      window.leihsAjax.getAjax('/manage/' + this.props.inventory_pool_id + '/fields?target_type=item&exclude_checkbox=true', {}, function (status, response) {
        _this.setState({
          fields: response
        });
      });
    },

    componentDidMount: function () {
      this.loadFields();
    },

    render: function () {

      if (!this.state.fields) {
        return React.createElement(
          'div',
          { className: 'row content-wrapper min-height-xl min-width-full straight-top' },
          React.createElement(
            'div',
            { className: 'margin-top-l padding-horizontal-m' },
            React.createElement(
              'div',
              { className: 'row' },
              React.createElement(
                'h1',
                { className: 'headline-xl' },
                _jed('Inventory Helper')
              ),
              React.createElement(
                'h2',
                { className: 'headline-m light' },
                _jed('Process multiple fields for multiple items in a row')
              )
            )
          )
        );
      } else {

        return React.createElement(InventoryHelperFieldsLoaded, _extends({}, this.props, { fields: this.state.fields }));
      }
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var Flash = window.App.Flash;

  window.Inventory = window.createReactClass({
    propTypes: {},

    _surround: function (string) {
      return ' ' + string + ' ';
    },

    _isLendingManager: function () {
      return this.props.lending_manager;
    },

    _csvImportUrl: function () {
      return this.props.csv_import_url;
    },

    _csvExportUrl: function () {
      return this.props.csv_export_url;
    },

    _excelExportUrl: function () {
      return this.props.excel_export_url;
    },

    _createModelUrl: function () {
      return this.props.create_model_url;
    },

    _createPackageUrl: function () {
      return this.props.create_package_url;
    },

    _createItemUrl: function () {
      return this.props.create_item_url;
    },

    _createOptionUrl: function () {
      return this.props.create_option_url;
    },

    _createSoftwareUrl: function () {
      return this.props.create_software_url;
    },

    _createLicenseUrl: function () {
      return this.props.create_license_url;
    },

    _renderDropdown: function () {

      if (!this._isLendingManager()) {
        return null;
      }

      return React.createElement(
        'div',
        { className: 'dropdown-holder inline-block' },
        React.createElement(
          'div',
          { className: 'button white dropdown-toggle' },
          this._surround(_jed('Add inventory')),
          React.createElement('div', { className: 'arrow down' })
        ),
        React.createElement(
          'ul',
          { className: 'dropdown right', style: { display: 'none' } },
          React.createElement(
            'li',
            null,
            React.createElement(
              'a',
              { className: 'dropdown-item', href: this._createModelUrl() },
              this._surround(_jed('Model'))
            )
          ),
          React.createElement(
            'li',
            null,
            React.createElement(
              'a',
              { className: 'dropdown-item', href: this._createPackageUrl() },
              this._surround(_jed('Package'))
            )
          ),
          React.createElement(
            'li',
            null,
            React.createElement(
              'a',
              { className: 'dropdown-item', href: this._createItemUrl() },
              this._surround(_jed('Item'))
            )
          ),
          React.createElement(
            'li',
            null,
            React.createElement(
              'a',
              { className: 'dropdown-item', href: this._createOptionUrl() },
              this._surround(_jed('Option'))
            )
          ),
          React.createElement(
            'li',
            null,
            React.createElement(
              'a',
              { className: 'dropdown-item', href: this._createSoftwareUrl() },
              this._surround(_jed('Software'))
            )
          ),
          React.createElement(
            'li',
            null,
            React.createElement(
              'a',
              { className: 'dropdown-item', href: this._createLicenseUrl() },
              this._surround(_jed('Software License'))
            )
          )
        )
      );
    },

    _csvExportUrlWithParams: function () {
      return this._csvExportUrl() + '?' + $.param(this._prepareParams());
    },

    _excelExportUrlWithParams: function () {
      return this._excelExportUrl() + '?' + $.param(this._prepareParams());
    },

    _renderActions: function () {

      return React.createElement(
        'div',
        { className: 'text-align-right' },
        React.createElement(
          'span',
          null,
          ' '
        ),
        React.createElement(
          'div',
          { className: 'dropdown-holder inline-block' },
          React.createElement(
            'div',
            { className: 'button white dropdown-toggle' },
            React.createElement('i', { className: 'fa fa-table vertical-align-middle' }),
            this._surround(_jed('Export')),
            React.createElement('div', { className: 'arrow down' })
          ),
          React.createElement(
            'ul',
            { className: 'dropdown right' },
            React.createElement(
              'li',
              null,
              React.createElement(
                'a',
                { className: 'dropdown-item', href: this._csvExportUrlWithParams(), id: 'csv-export', target: '_blank' },
                this._surround(_jed('CSV'))
              )
            ),
            React.createElement(
              'li',
              null,
              React.createElement(
                'a',
                { className: 'dropdown-item', href: this._excelExportUrlWithParams(), id: 'excel-export', target: '_blank' },
                this._surround(_jed('Excel'))
              )
            )
          )
        ),
        React.createElement(
          'span',
          null,
          ' '
        ),
        this._renderDropdown()
      );
    },

    _renderHeader: function () {
      return React.createElement(
        'div',
        { className: 'margin-top-l padding-horizontal-m' },
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'div',
            { className: 'col1of3' },
            React.createElement(
              'h1',
              { className: 'headline-xl' },
              _jed('List of Inventory')
            )
          ),
          React.createElement(
            'div',
            { className: 'col2of3' },
            this._renderActions()
          )
        )
      );
    },

    _onSubTabClick: function (event, config) {
      event.preventDefault();
      this.setState({ tabConfig: config }, this._writeFilterAndReloadList);
    },

    _renderSubTab: function (label, value) {
      var _this = this;

      var className = 'inline-tab-item';
      if (this.state.tabConfig.type == value.type && this.state.tabConfig.packages == value.packages) {
        className = 'active ' + className;
      }

      return React.createElement(
        'a',
        { onClick: function (event) {
            return _this._onSubTabClick(event, value);
          }, className: className, 'data-packages': value.packages, 'data-type': value.type },
        label
      );
    },

    _renderSubTabs: function () {
      return React.createElement(
        'div',
        { className: 'inline-tab-navigation', id: 'list-tabs' },
        this._renderSubTab(_jed('All'), {}),
        this._renderSubTab(_jed('Models'), { type: 'item', packages: 'false' }),
        this._renderSubTab(_jed('Packages'), { type: 'item', packages: 'true' }),
        this._renderSubTab(_jed('Options'), { type: 'option' }),
        this._renderSubTab(_jed('Software'), { type: 'license' })
      );
    },

    _writeInventoryFilter: function () {

      var toWrite = {
        selectedTab: this.state.selectedTab,
        retired: this.state.retired,
        used: this.state.used,
        is_borrowable: this.state.is_borrowable,
        responsible_inventory_pool_id: this.state.responsible_inventory_pool_id,
        search_term: this.state.search_term,
        owned: this.state.owned,
        in_stock: this.state.in_stock,
        incomplete: this.state.incomplete,
        broken: this.state.broken,
        tabConfig: this.state.tabConfig,
        before_last_check: this.state.before_last_check
      };

      window.sessionStorage.inventoryFilter = JSON.stringify(toWrite);
    },

    getInitialState: function () {

      var inventoryFilterJson = window.sessionStorage.inventoryFilter;
      var inventoryFilter = null;
      if (inventoryFilterJson) {
        try {
          inventoryFilter = JSON.parse(inventoryFilterJson);
        } catch (exception) {}
      }

      var filterReset = URI.parseQuery(window.location.search).filters == 'reset';
      var filterAllModels = URI.parseQuery(window.location.search).filters == 'all_models';

      var result = {
        inventory: [],
        pagination: null,

        openModels: {},
        openItems: {},

        showCategories: false,
        categoriesTerm: '',
        categoriesPath: [],
        categories: null,
        categoryLinks: null,
        searchMode: false,

        currentPage: 1,

        delayedReloads: []
      };

      if (inventoryFilter && !filterReset) {

        result = _.extend(result, {
          selectedTab: inventoryFilter.selectedTab,
          retired: inventoryFilter.retired,
          used: filterAllModels ? '' : inventoryFilter.used,
          is_borrowable: inventoryFilter.is_borrowable,
          responsible_inventory_pool_id: inventoryFilter.responsible_inventory_pool_id,
          search_term: inventoryFilter.search_term,
          owned: inventoryFilter.owned,
          in_stock: inventoryFilter.in_stock,
          incomplete: inventoryFilter.incomplete,
          broken: inventoryFilter.broken,
          tabConfig: inventoryFilter.tabConfig,
          before_last_check: inventoryFilter.before_last_check
        });
      } else {

        result = _.extend(result, {
          selectedTab: null,
          retired: 'false',
          used: filterAllModels ? '' : 'true',
          is_borrowable: '',
          responsible_inventory_pool_id: '',
          search_term: '',
          owned: false,
          in_stock: false,
          incomplete: false,
          broken: false,
          tabConfig: {},
          before_last_check: ''
        });
      }

      return result;
    },

    currentRequest: 0,

    _selectionFromState: function (name) {
      return this.state[name] == '' ? null : this.state[name];
    },

    _checkboxFromState: function (name) {
      return this.state[name] ? '1' : null;
    },

    _prepareParams: function () {

      var params = {};

      params.search_term = this.state.search_term;
      params.type = this.state.tabConfig.type;

      if (this._currentCategory() && params.type != 'option') {
        params.category_id = this._currentCategory().id;
      }

      if (params.type != 'option') {

        params.retired = this._selectionFromState('retired');
        params.is_borrowable = this._selectionFromState('is_borrowable');
        params.responsible_inventory_pool_id = this._selectionFromState('responsible_inventory_pool_id');

        params.used = this._selectionFromState('used');

        params.owned = this._checkboxFromState('owned');
        params.in_stock = this._checkboxFromState('in_stock');
        params.incomplete = this._checkboxFromState('incomplete');
        params.broken = this._checkboxFromState('broken');

        params.packages = this.state.tabConfig.packages;
        params.before_last_check = this.state.before_last_check != '' ? this.state.before_last_check : null;
      }

      var result = {};
      _.each(params, function (value, key) {
        if (value) {
          result[key] = value;
        }
      });

      return result;
    },

    _onSearchChange: function (event) {
      event.preventDefault();
      this.setState({ search_term: event.target.value }, this._writeFilterAndDelayedReloadList);
    },

    _onCheckboxChange: function (event, attribute) {
      // NOTE: Never preveent default for checkboxes.
      this.state[attribute] = event.target.checked;
      this.setState(this.state, this._writeFilterAndReloadList);
    },

    _inventoryParams: function (page) {
      return _.extend(this._prepareParams(), {
        page: page,
        include_package_models: true,
        sort: 'name',
        order: 'ASC'
      });
    },

    _fetchInventory: function (page, callback) {

      App.Inventory.fetch(this._inventoryParams(page)).done(function (data, status, xhr) {

        var pagination = JSON.parse(xhr.getResponseHeader('X-Pagination'));

        var inventoryPage = data.map(function (datum) {
          return new App.Inventory.findOrCreate(datum);
        });

        // var inventory = this.state.inventory
        // inventory[page - 1] = inventoryPage

        callback(page, pagination, inventoryPage);

        // this.setState({
        //   pagination: pagination,
        //   inventory: inventory
        // }, () => {
        //   callback(page, pagination)
        // })
      });
    },

    componentDidMount: function () {
      new App.TimeLineController({ el: $('#inventory') });

      Scrolling.mount(this._onScroll);

      this._writeFilterAndReloadList();
    },

    componentWillUnmount: function () {
      Scrollling.unmount(this._onScroll);
    },

    _onScroll: function () {
      this._tryLoadNext();
    },

    _flushLocalCache: function () {
      // NOTE: If you dont do this, then you perhaps get items for a model,
      // which are not in sync with the currently selected filter, but
      // the result of an earlier selected filter.

      _.each([App.Item, App.License, App.Model, App.Software, App.Option], function (e) {
        return e.deleteAll();
      });
    },

    _writeFilterAndDelayedReloadList: function () {
      var _this2 = this;

      this._writeInventoryFilter();
      this.setState({
        delayedReloads: this.state.delayedReloads.concat([true])
      }, function () {
        setTimeout(function () {

          if (_this2.state.delayedReloads.length == 1) {
            _this2._reloadList();
          }
          _this2.setState({
            delayedReloads: _.tail(_this2.state.delayedReloads)
          });
        }, 800);
      });
    },

    _writeFilterAndReloadList: function () {
      var _this3 = this;

      this._writeInventoryFilter();
      this.setState({
        delayedReloads: []
      }, function () {
        _this3._reloadList();
      });
    },

    _reloadList: function () {
      var _this4 = this;

      this.currentRequest++;

      this.setState({
        inventory: [],
        currentPage: 1,
        openModels: {},
        openItems: {},
        pagination: null
      }, function () {
        _this4._flushLocalCache();
        _this4._loadNext();
      });
    },

    _isPaginationNotFinished: function (pagination) {
      if (!pagination) {
        return true;
      }
      return pagination.offset + pagination.per_page < pagination.total_count;
    },

    _loadNext: function () {
      this.loading = true;
      this._fetchNextPage(this.state.currentPage, this.currentRequest);
    },

    _tryLoadNext: function () {

      if (this.loading) {
        return;
      }

      if (this._isPaginationNotFinished(this.state.pagination) && Scrolling._isBottom()) {
        this._loadNext();
      }
    },

    _checkForNextFetch: function (page, request, pagination, inventoryPage) {
      var _this5 = this;

      var inventory = this.state.inventory;
      inventory[page - 1] = inventoryPage;

      this.setState({
        currentPage: page + 1,
        inventory: inventory,
        pagination: pagination
      }, function () {

        _this5.loading = false;

        _this5._tryLoadNext();
      });
    },

    _fetchNextPage: function (page, request) {
      var _this6 = this;

      if (request != this.currentRequest) return;
      this._fetchInventory(page, function (page, pagination, inventoryPage) {
        if (request != _this6.currentRequest) return;
        _this6._fetchAvailability(page, inventoryPage, function (page) {
          if (request != _this6.currentRequest) return;
          _this6._fetchItems(page, inventoryPage, request, function (page) {
            if (request != _this6.currentRequest) return;
            _this6._fetchLicenses(page, inventoryPage, request, function (page) {
              if (request != _this6.currentRequest) return;
              _this6._checkForNextFetch(page, request, pagination, inventoryPage);
            });
          });
        });
      });
    },

    _fetchLicenses: function (page, inventoryPage, request, callback) {
      var _this7 = this;

      var software = _.filter(inventoryPage, function (i) {
        return i.constructor.className == 'Software';
      });
      var ids = _.map(software, function (s) {
        return s.id;
      });
      if (!ids.length > 0) {
        callback(page);
      } else {
        App.License.ajaxFetch({
          data: $.param($.extend(this._prepareParams(), {
            model_ids: ids,
            paginate: false,
            search_term: this.state.search_term,
            all: true,
            sort_by_inventory_code: true
          }))
        }).done(function (data) {

          if (request != _this7.currentRequest) return;

          var licenses = data.map(function (d) {
            return App.License.find(d.id);
          });

          var packages = _.filter(licenses, function (i) {
            return i.software().is_package;
          });

          var children = _.flatten(packages.map(function (p) {
            return p.children().all();
          }));

          var modelIds = children.map(function (c) {
            return c.model_id;
          });

          if (modelIds.length == 0) {
            callback(page);
            return;
          }

          _this7._loadLicensesPackageModels(modelIds, page, callback);
        });
      }
    },

    _loadLicensesPackageModels: function (modelIds, page, callback) {
      var _this8 = this;

      if (modelIds.length == 0) {
        callback(page);
        return;
      }

      App.Software.ajaxFetch({
        data: $.param({
          ids: _.first(modelIds, 20),
          paginate: false,
          include_package_models: true
        })
      }).done(function () {

        _this8._loadLicensesPackageModels(_.rest(modelIds, 20), page, callback);
      });
    },

    _loadItemsPackageModels: function (modelIds, page, callback) {
      var _this9 = this;

      if (modelIds.length == 0) {
        callback(page);
        return;
      }

      App.Model.ajaxFetch({
        data: $.param({
          ids: _.first(modelIds, 20),
          paginate: false,
          include_package_models: true
        })
      }).done(function () {

        _this9._loadItemsPackageModels(_.rest(modelIds, 20), page, callback);
      });
    },

    _fetchItems: function (page, inventoryPage, request, callback) {
      var _this10 = this;

      var models = _.filter(inventoryPage, function (i) {
        return i.constructor.className == 'Model';
      });
      var ids = _.map(models, function (m) {
        return m.id;
      });
      if (!ids.length > 0) {
        callback(page);
      } else {
        App.Item.ajaxFetch({
          data: $.param($.extend(this._prepareParams(), {
            model_ids: ids,
            paginate: false,
            search_term: this.state.search_term,
            all: true,
            sort_by_inventory_code: true
          }))
        }).done(function (data) {

          if (request != _this10.currentRequest) return;

          var items = data.map(function (d) {
            return App.Item.find(d.id);
          });

          var packages = _.filter(items, function (i) {
            return i.model().is_package;
          });

          var children = _.flatten(packages.map(function (p) {
            return p.children().all();
          }));

          var modelIds = children.map(function (c) {
            return c.model_id;
          });

          if (modelIds.length == 0) {
            callback(page);
            return;
          }

          _this10._loadItemsPackageModels(modelIds, page, callback);
        });
      }
    },

    _fetchAvailability: function (page, inventoryPage, callback) {
      var models = _.filter(inventoryPage, function (i) {
        return _.contains(['Model', 'Software'], i.constructor.className);
      });
      var ids = _.map(models, function (m) {
        return m.id;
      });
      if (!ids.length > 0) {
        callback(page);
      } else {
        App.Availability.ajaxFetch({
          url: App.Availability.url() + '/in_stock',
          data: $.param({
            model_ids: ids
          })
        }).done(function () {
          callback(page);
        });
      }
    },

    _toggleCategories: function (event) {
      event.preventDefault();
      this.setState({
        showCategories: !this.state.showCategories,
        categoriesTerm: '',
        categoriesPath: [],
        searchMode: false
      }, this._writeFilterAndReloadList);
      this._loadCategories();
    },

    _loadCategories: function () {
      var _this11 = this;

      App.Category.ajaxFetch().done(function (data) {
        _this11.setState({ categories: data.map(function (d) {
            return App.Category.find(d.id);
          }) });
      });
      App.CategoryLink.ajaxFetch().done(function (data) {
        _this11.setState({ categoryLinks: data.map(function (d) {
            return App.CategoryLink.find(d.id);
          }) });
      });
    },

    _renderToggleAndSearch: function () {

      var showCategories = true;
      if (showCategories && this.state.tabConfig.type != 'option') {
        return React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'div',
            { className: 'col1of6 padding-right-xs' },
            React.createElement(
              'button',
              { onClick: this._toggleCategories, className: 'button inset width-full height-full no-padding text-align-center', id: 'categories-toggle' },
              React.createElement('i', { className: 'fa fa-reorder vertical-align-middle' })
            )
          ),
          React.createElement(
            'div',
            { className: 'col5of6' },
            React.createElement('input', { value: this.state.search_term, onChange: this._onSearchChange, autoComplete: 'off', className: 'width-full', id: 'list-search', name: 'input', placeholder: _jed('Search...'), type: 'text' })
          )
        );
      } else {
        return React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'div',
            null,
            React.createElement('input', { value: this.state.search_term, onChange: this._onSearchChange, autoComplete: 'off', className: 'width-full', id: 'list-search', name: 'input', placeholder: _jed('Search...'), type: 'text' })
          )
        );
      }
    },

    _filteredCategories: function (term) {
      return _.filter(App.Category.all(), function (c) {
        return c.name.match(RegExp(term, 'i'));
      });
    },

    _currentCategory: function () {
      if (this.state.categoriesPath.length == 0) {
        return null;
      } else {
        return _.last(this.state.categoriesPath);
      }
    },

    _categoriesForPath: function () {
      return this._currentCategory().children();
    },

    _rootCategories: function () {
      return App.Category.roots();
    },

    _categoriesToRender: function () {

      if (this.state.searchMode) {
        return this._filteredCategories(this.state.categoriesTerm);
      } else if (this.state.categoriesPath.length > 0) {
        return this._categoriesForPath();
      } else {
        return this._rootCategories();
      }
    },

    _onCategoryLine: function (event, category) {
      event.preventDefault();
      this.setState({
        categoriesPath: this.state.categoriesPath.concat(category),
        searchMode: false
      }, this._writeFilterAndReloadList);
    },

    _renderCategoryLine: function (c) {
      var _this12 = this;

      return React.createElement(
        'a',
        { onClick: function (e) {
            return _this12._onCategoryLine(e, c);
          }, key: 'category_' + c.id, className: 'links black row focus-hover-thin font-size-m padding-horizontal-s padding-vertical-xs round-border-on-hover', 'data-id': c.id, 'data-type': 'category-filter' },
        c.name
      );
    },

    _renderCategoriesLines: function () {
      var _this13 = this;

      return this._categoriesToRender().map(function (c) {
        return _this13._renderCategoryLine(c);
      });
    },

    _renderCategoriesResult: function () {

      return React.createElement(
        'div',
        { className: 'row padding-bottom-s', id: 'category-list' },
        this._renderCategoriesLines()
      );
    },

    _renderCategoriesContent: function () {

      if (this.state.categories && this.state.categoryLinks) {

        return this._renderCategoriesResult();
      } else {
        return React.createElement(
          'div',
          { className: 'row padding-bottom-s', id: 'category-list' },
          React.createElement('div', { className: 'height-xs' }),
          React.createElement('div', { className: 'loading-bg' })
        );
      }
    },

    _onCategoriesTerm: function (event) {
      event.preventDefault();
      this.setState({
        categoriesTerm: event.target.value,
        categoriesPath: [],
        searchMode: event.target.value.length > 0
      });
    },

    _onParentClick: function (event) {
      event.preventDefault();
      this.setState({
        categoriesPath: _.first(this.state.categoriesPath, this.state.categoriesPath.length - 1),
        searchMode: false
      }, this._writeFilterAndReloadList);
    },

    _onRootClick: function (event) {
      event.preventDefault();
      this.setState({
        categoriesPath: [_.first(this.state.categoriesPath)],
        searchMode: false
      }, this._writeFilterAndReloadList);
    },

    _renderRootCategoryContent: function () {
      if (this.state.categoriesPath.length > 1 && !this.state.searchMode) {
        var c = this.state.categoriesPath[0];
        return React.createElement(
          'a',
          { onClick: this._onRootClick, className: 'emboss links black row focus-hover-thin font-size-m padding-horizontal-s padding-vertical-xs round-border-on-hover', 'data-id': c.id, 'data-type': 'category-root' },
          React.createElement(
            'strong',
            null,
            c.name
          )
        );
      } else {
        return null;
      }
    },

    _renderRootCategory: function () {
      return React.createElement(
        'div',
        { id: 'category-root' },
        this._renderRootCategoryContent()
      );
    },

    _renderCurrentCategoryContent: function () {
      if (this.state.categoriesPath.length > 0 && !this.state.searchMode) {
        var c = this._currentCategory();
        return React.createElement(
          'a',
          { onClick: this._onParentClick, className: 'emboss links black row focus-hover-thin font-size-m padding-horizontal-s padding-vertical-xs round-border-on-hover', 'data-id': c.id, 'data-type': 'category-current' },
          React.createElement('i', { className: 'arrow left' }),
          ' ',
          c.name
        );
      } else {
        return null;
      }
    },

    _renderCurrentCategory: function () {
      return React.createElement(
        'div',
        { id: 'category-current' },
        this._renderCurrentCategoryContent()
      );
    },

    _renderCategories: function () {

      if (this.state.tabConfig.type == 'option') {
        return null;
      }

      var classes = 'table-cell separated-top separated-right';
      if (this.state.showCategories) {
        classes += ' col1of5';
      } else {
        classes += ' hidden';
      }

      return React.createElement(
        'div',
        { className: classes, id: 'categories' },
        React.createElement(
          'div',
          { className: 'row padding-inset-s' },
          React.createElement('input', { onChange: this._onCategoriesTerm, value: this.state.categoriesTerm, autoComplete: 'off', className: 'small', id: 'category-search', placeholder: _jed('Search') + ' ' + _jed('Category'), type: 'text' })
        ),
        this._renderRootCategory(),
        this._renderCurrentCategory(),
        this._renderCategoriesContent()
      );
    },

    _renderLinesTable: function () {

      var classes = 'table-cell list-of-lines even separated-top padding-bottom-s min-height-l';
      if (this.state.showCategories && this.state.tabConfig.type != 'option') {
        classes += ' col4of5';
      }

      return React.createElement(
        'div',
        { className: classes, id: 'inventory' },
        this._renderPages(this.state.inventory),
        this._renderPaginationLoading()
      );
    },

    _renderFilters: function () {
      var _this14 = this;

      var formClass = 'row margin-bottom-xs';
      var formClass2 = 'col6of8';
      if (this.state.tabConfig.type == 'option') {
        formClass += ' hidden';
        formClass2 += ' hidden';
      }

      var checkboxesStyle = {};

      return React.createElement(
        'div',
        { className: 'row margin-vertical-xs padding-horizontal-s' },
        React.createElement(
          'form',
          { className: formClass, 'data-filter': 'true' },
          React.createElement(
            'div',
            { className: 'col1of4 padding-right-xs' },
            React.createElement(InventoryFilterSelect, {
              hide: false,
              name: 'retired',
              onChange: function (value) {
                return _this14.setState({ retired: value }, _this14._writeFilterAndReloadList);
              },
              value: this.state.retired,
              values: [{ value: '', label: _jed('retired') + ' & ' + _jed('not retired') }, { value: 'true', label: _jed('retired') }, { value: 'false', label: _jed('not retired') }]
            })
          ),
          React.createElement(
            'div',
            { className: 'col1of4 padding-right-xs' },
            React.createElement(InventoryFilterSelect, {
              hide: false,
              name: 'used',
              onChange: function (value) {
                return _this14.setState({ used: value }, _this14._writeFilterAndReloadList);
              },
              value: this.state.used,
              values: [{ value: '', label: _jed('all models') }, { value: 'true', label: _jed('only models with items') }, { value: 'false', label: _jed('only models without items') }]
            })
          ),
          React.createElement(
            'div',
            { className: 'col1of4 padding-right-xs' },
            React.createElement(InventoryFilterSelect, {
              hide: false,
              name: 'is_borrowable',
              onChange: function (value) {
                return _this14.setState({ is_borrowable: value }, _this14._writeFilterAndReloadList);
              },
              value: this.state.is_borrowable,
              values: [{ value: '', label: _jed('borrowable') + ' & ' + _jed('unborrowable') }, { value: 'true', label: _jed('borrowable') }, { value: 'false', label: _jed('unborrowable') }]
            })
          ),
          React.createElement(
            'div',
            { className: 'col1of4 padding-right-xs' },
            React.createElement(InventoryFilterSelect, {
              hide: false,
              name: 'responsible_inventory_pool_id',
              onChange: function (value) {
                return _this14.setState({ responsible_inventory_pool_id: value }, _this14._writeFilterAndReloadList);
              },
              value: this.state.responsible_inventory_pool_id,
              values: [{ value: '', label: _jed('All inventory pools') }].concat(_.map(this.props.responsibles, function (r) {
                return { value: r.id, label: r.name };
              }))
            })
          )
        ),
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'div',
            { className: 'col2of8 padding-right-xs' },
            this._renderToggleAndSearch()
          ),
          React.createElement(
            'form',
            { className: formClass2, 'data-filter': 'true' },
            React.createElement(
              'div',
              { className: 'row' },
              React.createElement(
                'div',
                { className: 'col1of5 padding-right-xs' },
                React.createElement(
                  'label',
                  { className: 'button inset white width-full height-xxs', htmlFor: 'owned', style: checkboxesStyle },
                  React.createElement('input', { checked: this.state.owned, autoComplete: 'off', id: 'owned', name: 'owned', type: 'checkbox', onChange: function (event) {
                      return _this14._onCheckboxChange(event, 'owned');
                    } }),
                  React.createElement(
                    'span',
                    null,
                    _jed('Owned')
                  )
                )
              ),
              React.createElement(
                'div',
                { className: 'col1of5 padding-right-xs' },
                React.createElement(
                  'label',
                  { className: 'button inset white width-full height-xxs', htmlFor: 'in_stock', style: checkboxesStyle },
                  React.createElement('input', { checked: this.state.in_stock, autoComplete: 'off', id: 'in_stock', name: 'in_stock', type: 'checkbox', onChange: function (event) {
                      return _this14._onCheckboxChange(event, 'in_stock');
                    } }),
                  React.createElement(
                    'span',
                    null,
                    _jed('In Stock')
                  )
                )
              ),
              React.createElement(
                'div',
                { className: 'col1of5 padding-right-xs' },
                React.createElement(
                  'label',
                  { className: 'button inset white width-full height-xxs', htmlFor: 'incomplete', style: checkboxesStyle },
                  React.createElement('input', { checked: this.state.incomplete, autoComplete: 'off', id: 'incomplete', name: 'incomplete', type: 'checkbox', onChange: function (event) {
                      return _this14._onCheckboxChange(event, 'incomplete');
                    } }),
                  React.createElement(
                    'span',
                    null,
                    _jed('Incomplete')
                  )
                )
              ),
              React.createElement(
                'div',
                { className: 'col1of5 padding-right-xs' },
                React.createElement(
                  'label',
                  { className: 'button inset white width-full height-xxs', htmlFor: 'broken', style: checkboxesStyle },
                  React.createElement('input', { checked: this.state.broken, autoComplete: 'off', id: 'broken', name: 'broken', type: 'checkbox', onChange: function (event) {
                      return _this14._onCheckboxChange(event, 'broken');
                    } }),
                  React.createElement(
                    'span',
                    null,
                    _jed('Broken')
                  )
                )
              ),
              React.createElement(DatePickerWithInput, { value: this.state.before_last_check, onChange: this._onDateChange, customRenderer: this._customRenderer })
            )
          )
        )
      );
    },

    _onDateChange: function (dateString) {
      this.setState({ before_last_check: dateString }, this._writeFilterAndReloadList);
    },

    _customRenderer: function (arguments) {
      return React.createElement(
        'div',
        { className: 'col1of5 padding-right-xs' },
        React.createElement(
          'label',
          { className: 'row' },
          React.createElement('input', { value: arguments.value, onChange: arguments.onChange, onFocus: arguments.onFocus, autoComplete: 'off', className: 'has-addon hasDatepicker', name: 'before_last_check', placeholder: 'Inventur vor', type: 'text', id: 'dp1509973221981' }),
          React.createElement(
            'span',
            { className: 'addon', onClick: arguments.onFocus },
            React.createElement('i', { className: 'fa fa-calendar' })
          ),
          arguments.renderPicker()
        )
      );
    },

    _renderLoadingOrNothing: function (child) {

      var classes = 'table-cell list-of-lines even separated-top padding-bottom-s min-height-l';
      if (this.state.showCategories && this.state.tabConfig.type != 'option') {
        classes += ' col4of5';
      }

      return React.createElement(
        'div',
        { className: classes, id: 'inventory' },
        React.createElement('div', { className: 'height-s' }),
        child,
        React.createElement('div', { className: 'height-s' })
      );
    },

    _renderResultLoading: function () {
      return this._renderLoadingOrNothing(React.createElement('img', { className: 'margin-horziontal-auto margin-top-xxl margin-bottom-xxl', src: '/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif' }));
    },

    _renderResultNothingFound: function () {
      return this._renderLoadingOrNothing(React.createElement(
        'h3',
        { className: 'headline-s light padding-inset-xl text-align-center' },
        _jed('No entries found')
      ));
    },

    _itemCount: function (model) {
      return this._modelItems(model).count();
    },

    _isModelOpen: function (model) {
      return this.state.openModels[model.id] ? true : false;
    },

    _isItemOpen: function (item) {
      return this.state.openItems[item.id] ? true : false;
    },

    _renderArrow: function (model) {

      if (this._itemCount(model) == 0) {
        return null;
      } else if (this._isModelOpen(model)) {
        return React.createElement('i', { className: 'arrow down' });
      } else {
        return React.createElement('i', { className: 'arrow right' });
      }
    },

    _onToggleModel: function (event, model) {

      var openModels = this.state.openModels;
      if (this._isModelOpen(model)) {
        delete openModels[model.id];
      } else {
        openModels[model.id] = model;
      }
      this.setState({ openModels: openModels });
    },

    _onToggleItem: function (event, item) {

      var openItems = this.state.openItems;
      if (this._isItemOpen(item)) {
        delete openItems[item.id];
      } else {
        openItems[item.id] = item;
      }
      this.setState({ openItems: openItems });
    },

    _onClickDeleteItem: function (event, item) {
      url = App.Inventory.url().replace('/inventory', '') + '/items/' + item.id;

      $.ajax({
        url: url,
        method: 'DELETE',
        dataType: 'json',
        success: function () {
          url = App.Inventory.url() + '?' + encodeURI('flash[success]=Item deleted');
          window.location = url;
        },
        error: function (jqXHR, _, _) {
          Flash({
            type: 'error',
            message: jqXHR.responseJSON.message
          });
        }
      });
    },

    _renderModelName: function (model) {
      return model.name();
    },

    _renderModelPackage: function (model) {
      if (!model.is_package) {
        return null;
      }

      return React.createElement(
        'div',
        { className: 'grey-text' },
        _jed('Package')
      );
    },

    _modelDeleteLink: function (model) {
      return App.Model.url() + '/' + model.id;
    },

    _renderModelDelete: function (model) {

      if (this._modelItems(model).all().length > 0) {
        return null;
      }

      return React.createElement(
        'li',
        null,
        React.createElement(
          'a',
          { className: 'dropdown-item red', 'data-method': 'delete', href: this._modelDeleteLink(model) },
          React.createElement('i', { className: 'fa fa-trash' }),
          ' ',
          _jed('Delete')
        )
      );
    },

    _renderModelEdit: function (model) {

      var editLabel = _jed('Edit Model');
      if (model.constructor.className == 'Software') {
        editLabel = _jed('Edit Software');
      }

      var timelineUrl = App.Model.url() + '/' + model.id + '/timeline';

      if (this._hasEditRights(model)) {
        return React.createElement(
          'div',
          { className: 'multibutton width-full text-align-right' },
          React.createElement(
            'a',
            { className: 'button white text-ellipsis col4of5 negative-margin-right-xxs', href: this._modelEditLink(model), title: editLabel },
            editLabel
          ),
          React.createElement(
            'div',
            { className: 'dropdown-holder inline-block col1of5' },
            React.createElement(
              'div',
              { className: 'button white dropdown-toggle width-full no-padding text-align-center' },
              React.createElement('div', { className: 'arrow down' })
            ),
            React.createElement(
              'ul',
              { className: 'dropdown right' },
              React.createElement(
                'li',
                null,
                React.createElement(
                  'a',
                  { className: 'dropdown-item', href: timelineUrl, target: '_blank' },
                  React.createElement('i', { className: 'fa fa-align-left' }),
                  ' ',
                  _jed('Timeline')
                )
              ),
              this._renderModelDelete(model)
            )
          )
        );
      } else {
        return React.createElement(
          'a',
          { className: 'button white text-ellipsis', href: timelineUrl, target: '_blank' },
          React.createElement('i', { className: 'fa fa-align-left' }),
          ' ',
          _jed('Timeline')
        );
      }
    },

    _renderModelLine: function (model) {
      var _this15 = this;

      var dataType = model.constructor.className.toLowerCase();

      return React.createElement(
        'div',
        { key: 'model_line_' + model.id, className: 'line row focus-hover-thin', 'data-id': model.id, 'data-is_package': 'true', 'data-type': dataType },
        React.createElement(
          'div',
          { className: 'col1of5 line-col' },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'div',
              { className: 'col1of2' },
              React.createElement(
                'button',
                { onClick: function (event) {
                    return _this15._onToggleModel(event, model);
                  }, className: 'button inset small width-full', 'data-type': 'inventory-expander', title: 'Packages' },
                this._renderArrow(model),
                ' ',
                React.createElement(
                  'span',
                  null,
                  this._itemCount(model)
                )
              )
            ),
            React.createElement(
              'div',
              { className: 'col1of2 text-align-center height-xxs' },
              React.createElement(
                'div',
                { className: 'table' },
                React.createElement(
                  'div',
                  { className: 'table-row' },
                  React.createElement(
                    'div',
                    { className: 'table-cell vertical-align-middle' },
                    React.createElement(
                      'a',
                      { target: '_blank', href: this._modelImageUrl(model) },
                      React.createElement('img', { className: 'max-width-xxs max-height-xxs', src: this._modelImageThumbUrl(model) })
                    )
                  )
                )
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'col2of5 line-col text-align-left' },
          this._renderModelPackage(model),
          React.createElement(
            'strong',
            { className: 'test-fix-timeline' },
            this._renderModelName(model)
          )
        ),
        React.createElement(
          'div',
          { className: 'col1of5 line-col text-align-center' },
          React.createElement(
            'span',
            { title: _jed('in stock') },
            model.availability().in_stock
          ),
          ' / ',
          React.createElement(
            'span',
            { title: _jed('rentable') },
            model.availability().total_rentable
          )
        ),
        React.createElement(
          'div',
          { className: 'col1of5 line-col line-actions padding-right-xs' },
          this._renderModelEdit(model)
        )
      );
    },

    _renderOptionEdit: function (model) {

      if (!this._hasEditRights()) {
        return null;
      }

      return React.createElement(
        'a',
        { className: 'button white text-ellipsis', href: this._optionEditLink(model) },
        _jed('Edit Option')
      );
    },

    _renderOptionLine: function (model) {

      return React.createElement(
        'div',
        { key: 'option_line_' + model.id, className: 'line row focus-hover-thin', 'data-id': model.id, 'data-type': 'option' },
        React.createElement(
          'div',
          { className: 'col1of5 line-col text-align-center' },
          model.inventory_code
        ),
        React.createElement(
          'div',
          { className: 'col2of5 line-col text-align-left' },
          React.createElement(
            'strong',
            { className: 'test-fix-timeline' },
            model.name()
          )
        ),
        React.createElement(
          'div',
          { className: 'col1of5 line-col text-align-center' },
          accounting.formatMoney(model.price)
        ),
        React.createElement(
          'div',
          { className: 'col1of5 line-col line-actions padding-right-xs' },
          this._renderOptionEdit(model)
        )
      );

      // {money(model.price)}
    },

    _itemLocation: function (item) {
      return item.current_location;
    },

    _itemInventoryCode: function (item) {
      return item.inventory_code;
    },

    _itemEditLink: function (item) {
      return App.Inventory.url().replace('/inventory', '') + '/items/' + item.id + '/edit' + '?' + $.param({ return_url: App.Inventory.url() });
    },

    _itemCopyLink: function (item) {
      return App.Inventory.url().replace('/inventory', '') + '/items/' + item.id + '/copy' + '?' + $.param({ return_url: App.Inventory.url() });
    },

    _optionEditLink: function (option) {
      return App.Inventory.url().replace('/inventory', '') + '/options/' + option.id + '/edit' + '?' + $.param({ return_url: App.Inventory.url() });
    },

    _modelEditLink: function (model) {
      return App.Inventory.url().replace('/inventory', '') + '/models/' + model.id + '/edit' + '?' + $.param({ return_url: App.Inventory.url() });
    },

    _modelImageThumbUrl: function (model) {
      return '/models/' + model.id + '/image_thumb';
    },

    _modelImageUrl: function (model) {
      return '/models/' + model.id + '/image';
    },

    _itemEditLabel: function () {
      return _jed('Edit Item');
    },

    _itemCopyLabel: function () {
      return _jed('Copy Item');
    },

    _licenseEditLabel: function () {
      return _jed('Edit License');
    },

    _licenseCopyLabel: function () {
      return _jed('Copy License');
    },

    _appAccessRight: function () {
      return App.AccessRight;
    },

    _appCurrentUser: function () {
      return App.User.current;
    },

    _appCurrentUserRole: function () {
      return this._appCurrentUser().role;
    },

    _hasEditRights: function () {
      return this._appAccessRight().atLeastRole(this._appCurrentUserRole(), 'lending_manager');
    },

    _renderItemEditButtons: function (item) {
      var _this16 = this;

      if (!this._hasEditRights()) {
        return null;
      }

      var editLabel = this._itemEditLabel();
      var copyLabel = this._itemCopyLabel();
      if (item.type == 'License') {
        editLabel = this._licenseEditLabel();
        copyLabel = this._licenseCopyLabel();
      }

      return React.createElement(
        'div',
        { className: 'multibutton width-full text-align-right' },
        React.createElement(
          'a',
          { className: 'button white text-ellipsis col4of5 negative-margin-right-xxs', href: this._itemEditLink(item), title: editLabel },
          editLabel
        ),
        React.createElement(
          'div',
          { className: 'dropdown-holder inline-block col1of5' },
          React.createElement(
            'div',
            { className: 'button white dropdown-toggle width-full no-padding text-align-center' },
            React.createElement('div', { className: 'arrow down' })
          ),
          React.createElement(
            'ul',
            { className: 'dropdown right' },
            React.createElement(
              'li',
              null,
              React.createElement(
                'a',
                { className: 'dropdown-item', href: this._itemCopyLink(item) },
                React.createElement('i', { className: 'fa fa-copy' }),
                ' ',
                copyLabel
              )
            ),
            item.can_destroy && React.createElement(
              'li',
              null,
              React.createElement(
                'a',
                { className: 'dropdown-item red', onClick: function (event) {
                    return _this16._onClickDeleteItem(event, item);
                  } },
                React.createElement('i', { className: 'fa fa-trash' }),
                ' ',
                'Delete Item'
              )
            )
          )
        )
      );
    },

    _itemModel: function (item) {
      if (item.type == 'License') {
        return item.software();
      } else {
        return item.model();
      }
    },

    _itemIsPackage: function (item) {
      return this._itemModel(item).is_package;
    },

    _itemChildCount: function (item) {
      return item.children().count();
    },

    _renderItemArrow: function (item) {
      if (this._itemChildCount(item) == 0) {
        return null;
      }

      if (this._isItemOpen(item)) {
        return React.createElement('i', { className: 'arrow down' });
      } else {
        return React.createElement('i', { className: 'arrow right' });
      }
    },

    _renderItemPackageInfo: function (item) {
      var _this17 = this;

      if (!this._itemIsPackage(item)) {
        return null;
      }

      return React.createElement(
        'div',
        { className: 'row' },
        React.createElement('div', { className: 'col1of2' }),
        React.createElement(
          'div',
          { className: 'col1of2' },
          React.createElement(
            'button',
            { onClick: function (event) {
                return _this17._onToggleItem(event, item);
              }, className: 'button inset small width-full', 'data-type': 'inventory-expander' },
            this._renderItemArrow(item),
            ' ',
            React.createElement(
              'span',
              null,
              this._itemChildCount(item)
            )
          )
        )
      );
    },

    _itemProblems: function (item) {
      return item.getProblems();
    },

    _licenseProblems: function (license) {
      return license.getProblems();
    },

    _renderItemDetail: function (item) {
      if (item.parent_id) {
        return [React.createElement(
          'strong',
          { key: 'model_name', className: 'grey-text' },
          this._itemModel(item).name()
        ), React.createElement(
          'div',
          { key: 'is_package', className: 'row grey-text text-ellipsis width-full', title: _jed('is part of a package') },
          _jed('is part of a package')
        )];
      } else {
        return React.createElement(
          'div',
          { className: 'row grey-text' },
          this._itemLocation(item)
        );
      }
    },

    _licenseVersion: function (item) {
      if (item.item_version) {
        return item.itemVersion() + ', ';
      } else {
        return null;
      }
    },

    _licenseLocation: function (item) {
      if (item.current_location) {
        return item.current_location + ', ';
      } else {
        return null;
      }
    },

    _licenseInformation: function (item) {
      return item.licenseInformation();
    },

    _renderLicenseDetail: function (item) {

      return React.createElement(
        'div',
        { className: 'row grey-text' },
        this._licenseVersion(item),
        this._licenseLocation(item),
        this._licenseInformation(item)
      );
    },

    _renderLicenseLine: function (item) {

      return React.createElement(
        'div',
        { key: 'item_' + item.id, className: 'line row focus-hover-thin', 'data-id': item.id, 'data-type': 'license' },
        React.createElement('div', { className: 'col1of5 line-col' }),
        React.createElement(
          'div',
          { className: 'col2of5 line-col text-align-left' },
          React.createElement(
            'div',
            { className: 'row' },
            this._itemInventoryCode(item)
          ),
          this._renderLicenseDetail(item)
        ),
        React.createElement(
          'div',
          { className: 'col1of5 line-col text-align-center' },
          React.createElement(
            'strong',
            { className: 'darkred-text' },
            this._licenseProblems(item)
          )
        ),
        React.createElement(
          'div',
          { className: 'col1of5 line-col line-actions padding-right-xs' },
          this._renderItemEditButtons(item)
        )
      );
    },

    _renderItemLine: function (item) {

      return React.createElement(
        'div',
        { key: 'item_' + item.id, className: 'line row focus-hover-thin', 'data-id': item.id, 'data-type': 'item' },
        React.createElement(
          'div',
          { className: 'col1of5 line-col' },
          this._renderItemPackageInfo(item)
        ),
        React.createElement(
          'div',
          { className: 'col2of5 line-col text-align-left' },
          React.createElement(
            'div',
            { className: 'row' },
            this._itemInventoryCode(item)
          ),
          this._renderItemDetail(item)
        ),
        React.createElement(
          'div',
          { className: 'col1of5 line-col text-align-center' },
          React.createElement(
            'strong',
            { className: 'darkred-text' },
            this._itemProblems(item)
          )
        ),
        React.createElement(
          'div',
          { className: 'col1of5 line-col line-actions padding-right-xs' },
          this._renderItemEditButtons(item)
        )
      );
    },

    _renderItemOrLicenseLine: function (item) {

      if (item.type == 'License') {
        return this._renderLicenseLine(item);
      } else {
        return this._renderItemLine(item);
      }
    },

    _renderItemItems: function (item) {
      var _this18 = this;

      return _.flatten(item.children().all().map(function (item) {
        return _this18._renderItem(item);
      }));
    },

    _renderItemChildren: function (item) {
      return React.createElement(
        'div',
        { key: 'item_children_' + item.id, className: 'group-of-lines' },
        this._renderItemItems(item)
      );
    },

    _renderItem: function (item) {

      if (this._itemIsPackage(item) && this._isItemOpen(item)) {
        return [this._renderItemOrLicenseLine(item), this._renderItemChildren(item)];
      } else {
        return this._renderItemOrLicenseLine(item);
      }
    },

    _modelItems: function (model) {

      if (model.constructor.className == 'Software') {
        return model.licenses();
      } else if (model.constructor.className == 'Model') {
        return model.items();
      } else {
        throw 'Unexepcted model type: ' + model.constructor.className;
      }
    },

    _renderModelItems: function (model) {
      var _this19 = this;

      return _.flatten(this._modelItems(model).all().map(function (item) {
        return _this19._renderItem(item);
      }));
    },

    _renderModelChildren: function (model) {
      return React.createElement(
        'div',
        { key: 'model_children_' + model.id, className: 'group-of-lines' },
        this._renderModelItems(model)
      );
    },

    _renderModelWithItems: function (model) {

      if (model.constructor.className == 'Option') {
        return this._renderOptionLine(model);
      }

      if (this._isModelOpen(model)) {
        return [this._renderModelLine(model), this._renderModelChildren(model)];
      } else {
        return this._renderModelLine(model);
      }
    },

    _renderPage: function (page) {
      var _this20 = this;

      return _.flatten(page.map(function (model) {
        return _this20._renderModelWithItems(model);
      }));
    },

    _renderPages: function (pages) {
      var _this21 = this;

      return _.flatten(pages.map(function (page) {
        return _this21._renderPage(page);
      }));
    },

    _renderPaginationLoading: function () {

      if (!this._isPaginationNotFinished(this.state.pagination)) {
        return null;
      } else {
        return React.createElement(
          'div',
          { className: 'line row focus-hover-thin' },
          React.createElement('div', { className: 'height-s' }),
          React.createElement('div', { className: 'loading-bg' }),
          React.createElement('div', { className: 'height-s' })
        );
      }
    },

    _renderTable: function () {

      return React.createElement(
        'div',
        { className: 'table' },
        React.createElement(
          'div',
          { className: 'table-row' },
          this._renderCategories(),
          this._renderResult()
        )
      );
    },

    _renderResult: function () {

      if (this.state.inventory.length == 0) {
        return this._renderResultLoading();
      } else if (this.state.inventory[0].length == 0) {
        return this._renderResultNothingFound();
      } else {
        return this._renderLinesTable();
      }
    },

    _renderContent: function () {

      return React.createElement(
        'div',
        { className: 'row margin-top-l' },
        this._renderSubTabs(),
        this._renderFilters(),
        this._renderTable()
      );
    },

    render: function () {
      return React.createElement(
        'div',
        { className: 'row content-wrapper min-height-xl min-width-full straight-top' },
        this._renderHeader(),
        this._renderContent()
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;

  window.InventoryFilterSelect = window.createReactClass({
    propTypes: {},

    _onChange: function (event) {
      event.preventDefault();
      // this.setState({value: event.target.value})
      this.props.onChange(event.target.value);
    },

    _renderOption: function (value) {
      return React.createElement(
        'option',
        { key: 'value_' + value.value, value: value.value },
        value.label
      );
    },

    _renderOptions: function () {
      var _this = this;

      return this.props.values.map(function (v) {
        return _this._renderOption(v);
      });
    },

    render: function () {
      var style = {};
      if (this.props.hide) {
        style.display = 'none';
      }

      return React.createElement(
        'select',
        { name: this.props.name, style: style, value: this.props.value, onChange: this._onChange, className: 'width-full' },
        this._renderOptions()
      );
    }
  });
})();
window.leihsAjax = {

  getAjax: function (url, data, callback) {
    $.ajax({
      url: url,
      contentType: 'application/json',
      dataType: 'json',
      method: 'GET',
      data: data
    }).done(function (data) {
      callback('success', data);
    }).error(function (data) {
      callback('error', data);
    });
  },

  putAjax: function (url, data, callback) {

    $.ajax({
      url: url,
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json',
      method: 'PUT'
    }).done(function (data) {
      callback('success', data);
    }).error(function (data) {
      callback('error', data);
    });
  }

};
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;
  var ReactDOM = window.ReactDOM;

  window.ManageFields = window.createReactClass({
    propTypes: {},

    getInitialState: function () {
      return {
        disabledFields: _.map(this.props.disabled_fields, function (df) {
          return df.field_id;
        })
      };
    },

    isDisabled: function (field) {
      return _.find(this.state.disabledFields, function (df) {
        return df == field.id;
      });
    },

    disable: function (disable, fieldId) {
      var _this = this;

      this.setState(function (old) {
        var next = _.clone(old);
        if (disable) {
          next.disabledFields = _.uniq(old.disabledFields.concat(fieldId));
        } else {
          next.disabledFields = _.reject(old.disabledFields, function (df) {
            return df == fieldId;
          });
        }
        return next;
      }, function () {
        _this.sendDisable(disable, fieldId);
      });
    },

    postAjax: function (url, data, callback) {
      $.ajax({
        url: url,
        contentType: 'application/json',
        dataType: 'json',
        method: 'POST',
        data: JSON.stringify(data)
      }).done(function (data) {
        callback(data);
      }).error(function (data) {});
    },

    sendDisable: function (disable, fieldId) {
      this.postAjax('/manage/' + this.props.inventory_pool_id + '/disable_field', {
        disable: disable,
        field_id: fieldId,
        inventory_pool_id: this.props.inventory_pool_id
      }, function (data) {});
    },

    renderAction: function (field) {
      var _this2 = this;

      if (this.isDisabled(field)) {
        return React.createElement(
          'a',
          { onClick: function (e) {
              return _this2.disable(false, field.id);
            }, className: 'button white' },
          _jed('Enable')
        );
      } else {
        return React.createElement(
          'a',
          { onClick: function (e) {
              return _this2.disable(true, field.id);
            }, className: 'button white' },
          _jed('Disable')
        );
      }
    },

    renderStatus: function (field) {
      if (this.isDisabled(field)) {
        return React.createElement(
          'span',
          { style: { color: 'red' } },
          _jed('disabled')
        );
      } else {
        return React.createElement(
          'span',
          { style: { color: 'green' } },
          _jed('enabled')
        );
      }
    },

    renderTarget: function (field) {
      if (field.target_type == 'license') {
        return _jed('for licenses');
      } else if (field.target_type == 'item') {
        return _jed('for items');
      } else {
        return null;
      }
    },

    renderFields: function () {
      var _this3 = this;

      return _.map(this.props.fields, function (field) {
        return React.createElement(
          'div',
          { className: 'row line', key: field.id },
          React.createElement(
            'div',
            { className: 'col1of6 line-col' },
            React.createElement(
              'strong',
              null,
              _jed(field.label)
            )
          ),
          React.createElement(
            'div',
            { className: 'col2of6 line-col', style: { textAlign: 'left' } },
            field.id
          ),
          React.createElement(
            'div',
            { className: 'col1of6 line-col', style: { textAlign: 'left' } },
            _this3.renderTarget(field)
          ),
          React.createElement(
            'div',
            { className: 'col1of6 line-col', style: { textAlign: 'left' } },
            _this3.renderStatus(field)
          ),
          React.createElement(
            'div',
            { className: 'col1of6 line-col line-actions' },
            _this3.renderAction(field)
          )
        );
      });
    },

    render: function () {

      return React.createElement(
        'div',
        { className: 'row content-wrapper min-height-xl min-width-full straight-top' },
        React.createElement(
          'div',
          { className: 'list-of-lines' },
          this.renderFields()
        )
      );
    }
  });
})();
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;

  window.Popup = window.createReactClass({
    getDefaultProps: function () {
      return {
        trigger: 'hover'
      };
    },

    propTypes: {
      trigger: PropTypes.oneOf(['hover', 'click'])
    },

    getInitialState: function () {
      return {
        visible: false,
        insideThis: false,
        insideChild: false
      };
    },

    popupMouseLeave: function (event) {
      event.preventDefault();
      this.setState({
        insideThis: false
      }, this.handleUpdates);
    },

    popupMouseOver: function (event) {
      event.preventDefault();
      this.setState({
        insideThis: true,
        rectangle: this.popupRef.getBoundingClientRect()
      }, this.handleUpdates);
    },

    contentMouseLeave: function (event) {
      event.preventDefault();
      this.setState({
        insideChild: false
      }, this.handleUpdates);
    },

    contentMouseOver: function (event) {
      event.preventDefault();
      this.setState({
        insideChild: true
      }, this.handleUpdates);
    },

    handleUpdates: function (event) {
      if (this.props.trigger === 'hover') {
        this.setState({ visible: this.state.insideChild || this.state.insideThis });
      }
    },

    handleClick: function (event) {
      var _this = this;

      if (this.props.trigger === 'click') {
        this.setState(function (state) {
          return _extends({}, state, { visible: !_this.state.visible });
        });
      }
    },

    handleClickOutside: function (event) {
      if (!(this.state.insideChild || this.state.insideThis)) {
        this.setState({ visible: false });
      }
    },

    handleEscKey: function (event) {
      if (event.key === 'Escape') {
        this.setState({ visible: false });
      }
    },

    activateClickOutsideAndEsc: function () {
      document.addEventListener('mousedown', this.handleClickOutside);
      document.addEventListener('keydown', this.handleEscKey);
    },

    inactivateClickOutsideAndEsc: function () {
      document.removeEventListener('mousedown', this.handleClickOutside);
      document.removeEventListener('keydown', this.handleEscKey);
    },

    popupRef: null,

    componentWillReceiveProps: function (nextProps) {
      this.setState({ rectangle: nextProps.popupRef.getBoundingClientRect() });
      if (nextProps.popupRef != this.popupRef) {

        if (this.popupRef) {
          this.popupRef.removeEventListener('mouseenter', this.popupMouseOver);
          this.popupRef.removeEventListener('mouseleave', this.popupMouseLeave);
          this.popupRef.removeEventListener('click', this.handleClick);
        }
        this.inactivateClickOutsideAndEsc();

        this.popupRef = nextProps.popupRef;

        if (this.popupRef) {
          this.popupRef.addEventListener('mouseenter', this.popupMouseOver);
          this.popupRef.addEventListener('mouseleave', this.popupMouseLeave);
          this.popupRef.addEventListener('click', this.handleClick);
        }
      }
    },

    componentWillUpdate: function (nextProps, nextState) {
      if (this.props.trigger === 'click') {
        if (!this.state.visible && nextState.visible) {
          this.activateClickOutsideAndEsc();
        } else if (this.state.visible && !nextState.visible) {
          this.inactivateClickOutsideAndEsc();
        }
      }
    },

    componentWillUnmount: function () {
      if (this.popupRef) {
        this.popupRef.removeEventListener('mouseenter', this.popupMouseOver);
        this.popupRef.removeEventListener('mouseleave', this.popupMouseLeave);
        this.popupRef.removeEventListener('click', this.handleClick);
      }
      this.inactivateClickOutsideAndEsc();
    },

    renderPopup: function () {
      if (!this.state.visible) {
        return null;
      }

      var style = {
        position: 'relative',
        left: '-50%',
        height: '100%'
      };

      return React.createElement(
        'div',
        { style: style, onMouseEnter: this.contentMouseOver, onMouseLeave: this.contentMouseLeave },
        this.props.children
      );
    },

    render: function () {

      if (!this.state.visible) {
        return null;
      }

      var r = this.state.rectangle;
      var left = r.left + r.width * 0.5;
      var top = r.top;

      var outer = {
        position: 'fixed',
        top: top + 'px',
        left: left + 'px',
        zIndex: '1000000'
      };

      var inner = {
        position: 'absolute',
        bottom: '-10px'
      };

      return React.createElement(
        'div',
        { style: outer },
        React.createElement(
          'div',
          { style: inner },
          this.renderPopup()
        )
      );
    }
  });
})();
(function () {
  var React = window.React;

  window.RoomsDiff = window.createReactClass({
    propTypes: {},

    render: function () {
      return React.createElement(
        'div',
        { className: 'wrapper margin-top-m', id: 'daily-view' },
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'nav',
            null,
            React.createElement(
              'ul',
              null,
              React.createElement(
                'li',
                null,
                React.createElement(
                  'a',
                  { className: 'active float-left margin-right-xxs navigation-tab-item padding-horizontal-m' },
                  'Rooms Diff'
                )
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'row content-wrapper min-height-xl min-width-full straight-top' },
          React.createElement(
            'div',
            { className: 'margin-top-l padding-horizontal-m' },
            React.createElement(
              'div',
              { className: 'row' },
              React.createElement(
                'h1',
                { className: 'headline-xl' },
                'CSV import'
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'row margin-top-l padding-horizontal-l' },
            React.createElement(
              'div',
              { className: 'row' },
              React.createElement(
                'h2',
                null,
                'Laden Sie eine Komma-separierte CSV-Datei hoch (UTF-8 Kodierung).'
              )
            ),
            React.createElement(
              'div',
              { className: 'row margin-vertical-l' },
              React.createElement(
                'div',
                { className: 'col2of3' },
                React.createElement(
                  'h3',
                  null,
                  'Akzeptierte Spalten:'
                ),
                React.createElement(
                  'ul',
                  { style: { listStyleType: 'disc', margin: '1.5em' } },
                  React.createElement(
                    'li',
                    null,
                    React.createElement(
                      'b',
                      null,
                      'Liegenschaft (zwingend)'
                    )
                  ),
                  React.createElement(
                    'li',
                    null,
                    React.createElement(
                      'b',
                      null,
                      'Raumnummer (zwingend)'
                    )
                  )
                ),
                React.createElement(
                  'h3',
                  null,
                  'Alle weiteren Kolonnen werden ignoriert.'
                )
              ),
              React.createElement(
                'div',
                { className: 'col1of3' },
                React.createElement(
                  'form',
                  { encType: 'multipart/form-data', action: '/manage/rooms_diff', acceptCharset: 'UTF-8', method: 'post' },
                  React.createElement('input', { name: 'utf8', type: 'hidden', value: '✓' }),
                  React.createElement('input', { type: 'hidden', name: 'authenticity_token', value: $('meta[name="csrf-token"]').attr('content') }),
                  React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement('input', { type: 'file', name: 'csv_file', id: 'csv_file' })
                  ),
                  React.createElement(
                    'div',
                    { className: 'row padding-top-l' },
                    React.createElement(
                      'button',
                      { className: 'button green' },
                      'Import',
                      React.createElement('i', { className: 'fa fa-share-alt' })
                    )
                  )
                )
              )
            )
          )
        )
      );
    }
  });
})();
(function () {
  // NOTE: only for linter and clarity:
  /* global _ */
  /* global _jed */
  var React = window.React;

  window.SwapOrderUserDialog = window.createReactClass({
    propTypes: {},

    getInitialState: function () {
      return {
        input: '',
        selectedUser: null,
        hideDropdown: false,
        delegatedUser: null,
        userData: [],
        errors: null
      };
    },

    componentDidMount: function () {
      document.addEventListener('mousedown', this._handleClickOutside);
    },

    componentWillUnmount: function () {
      document.removeEventListener('mousedown', this._handleClickOutside);
    },

    _handleClickOutside: function (event) {
      if (this.ulReference && !this.ulReference.contains(event.target) && this.inputReference && !this.inputReference.contains(event.target)) {
        this._onHideDropdown();
      }
    },

    _onHideDropdown: function () {
      this.setState({ hideDropdown: true });
    },

    _onChangeInput: function (event) {
      this.setState({
        input: event.target.value,
        hideDropdown: false
      }, this._loadUsers);
    },

    _loadUsers: function () {
      var _this = this;

      if (this.state.input.length == 0) {
        this.setState({
          userData: []
        });
        return;
      }

      var data = {
        search_term: this.state.input
      };

      if (this.ajaxCall) {
        this.ajaxCall.abort();
      }

      this.ajaxCall = $.ajax({
        url: App.User.url(),
        data: $.param(data),
        contentType: 'application/json',
        dataType: 'json',
        method: 'GET'
      }).done(function (data) {

        _.each(data, function (d) {
          App.User.addRecord(new App.User(d));
        });

        _this.setState({
          userData: data
        });
      });
    },

    _onClearUser: function () {
      this.setState({
        selectedUser: null,
        userData: [],
        delegatedUser: null
      });
    },

    _renderSelectedUser: function () {

      if (!this.state.selectedUser) {
        return null;
      }

      return React.createElement(
        'div',
        { className: 'emboss white padding-inset-xxs' },
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'p',
            { className: 'paragraph-s' },
            React.createElement(
              'strong',
              null,
              this.state.selectedUser.name
            )
          ),
          React.createElement(
            'div',
            { className: 'position-absolute-topright padding-inset-xxs' },
            React.createElement(
              'a',
              { onClick: this._onClearUser, className: 'grey padding-inset-xxs', id: 'remove-user' },
              React.createElement('i', { className: 'fa fa-times-circle icon-m' })
            )
          )
        )
      );
    },

    _userAddress: function (user) {
      return (user.address ? user.address : '') + ' ' + (user.city ? user.city : '');
    },

    _onUserClick: function (event, user) {
      event.preventDefault();
      this.setState({ selectedUser: user, input: '' });
    },

    _renderDropdownLine: function (user) {
      var _this2 = this;

      return React.createElement(
        'li',
        { key: user.id, className: 'separated-bottom exclude-last-child ui-menu-item' },
        React.createElement(
          'a',
          { onClick: function (event) {
              return _this2._onUserClick(event, user);
            }, className: 'row ui-menu-item-wrapper', tabIndex: '-1' },
          React.createElement(
            'div',
            { className: 'row text-ellipsis' },
            React.createElement(
              'strong',
              null,
              user.name
            )
          ),
          React.createElement(
            'div',
            { className: 'row text-ellipsis' },
            this._userAddress(user)
          )
        )
      );
    },

    _renderDropdownLines: function () {
      var _this3 = this;

      return this._dropdownData().map(function (u) {
        return _this3._renderDropdownLine(u);
      });
    },

    _dropdownData: function () {
      return this.state.userData;
    },

    _renderDropdown: function () {
      var _this4 = this;

      var display = 'none';
      if (this._dropdownData().length > 0 && !this.state.selectedUser && !this.state.hideDropdown) {
        display = 'block';
      }

      return React.createElement(
        'div',
        { style: { position: 'relative' } },
        React.createElement(
          'ul',
          { ref: function (ref) {
              return _this4.ulReference = ref;
            }, id: 'ui-id-1', tabIndex: '0', className: 'ui-menu ui-widget ui-widget-content ui-autocomplete ui-front ui-autocomplete-disabled', style: { display: display, top: '30px', left: '0px', width: '231px', top: '0px' } },
          this._renderDropdownLines()
        )
      );
    },

    _onInputFocus: function () {
      this.setState({ hideDropdown: false });
    },

    _renderDelegatedUser: function () {

      if (!this.props.other.order.delegated_user) {
        return null;
      }

      var delegatedUser = App.User.find(this.props.other.order.delegated_user.id);

      return React.createElement(
        'p',
        { className: 'paragraph-s padding-top-xxs margin-top-xxs' },
        React.createElement(
          'strong',
          null,
          delegatedUser.firstname,
          ' ',
          delegatedUser.lastname
        )
      );
    },

    _onDelegatedUser: function (user) {
      this.setState({
        delegatedUser: user
      });
    },

    _currentUserId: function () {
      return this.state.selectedUser ? this.state.selectedUser.id : this.props.other.order.user().id;
    },

    _renderContactPerson: function () {

      var currentUserId = this._currentUserId();

      if (!App.User.find(currentUserId).isDelegation()) {
        return null;
      }

      return React.createElement(
        'div',
        { className: 'row padding-vertical-m', id: 'contact-person' },
        React.createElement(
          'div',
          { className: 'row emboss padding-inset-m' },
          React.createElement(
            'div',
            { className: 'col4of9 text-align-center', id: 'swapped-person', style: { textAlign: 'left' } },
            React.createElement(ChooseUserPreload, { relative: true, delegationId: currentUserId, delegatedUser: this.state.delegatedUser, onDelegatedUser: this._onDelegatedUser })
          ),
          React.createElement(
            'div',
            { className: 'col1of9 text-align-center' },
            React.createElement('i', { className: 'fa fa-exchange icon-xxl' })
          ),
          React.createElement(
            'div',
            { className: 'col4of9 text-align-center' },
            this._renderDelegatedUser()
          )
        )
      );
    },

    _disableSubmit: function () {
      return !this.state.selectedUser;
    },

    _onSubmit: function (event) {
      event.preventDefault();

      this._doSwapOrderUser();
    },

    _doSwapOrderUser: function () {
      var _this5 = this;

      this.setState({
        errors: null
      });

      var userId = this._currentUserId();
      var delegationId = null;
      if (this.state.delegatedUser) {
        delegationId = this.state.delegatedUser.id;
      }
      this.props.other.order.swapUser(userId, delegationId).done(function () {
        window.location = _this5.props.other.order.editPath();
      }).fail(function (e) {
        _this5.setState({
          errors: '' + e.responseText
        });
      });
    },

    render: function () {
      var _this6 = this;

      var displayInput = 'inline-block';
      if (this.state.selectedUser) {
        displayInput = 'none';
      }

      var disabledSubmit = 'disabled';
      if (!this._disableSubmit()) {
        disabledSubmit = null;
      }
      disabledSubmit = null;

      var errorsClass = 'padding-vertical-m';
      if (this.state.errors == null) {
        errorsClass += ' hidden';
      }

      return React.createElement(
        'form',
        null,
        React.createElement(
          'div',
          { className: 'row padding-vertical-m' },
          React.createElement(
            'div',
            { className: 'col1of2' },
            React.createElement(
              'h3',
              { className: 'headline-l' },
              _jed('Change orderer')
            )
          ),
          React.createElement(
            'div',
            { className: 'col1of2' },
            React.createElement(
              'div',
              { className: 'float-right' },
              React.createElement(
                'a',
                { 'aria-hidden': 'true', className: 'modal-close weak', 'data-dismiss': 'modal', title: _jed('close dialog'), type: 'button' },
                _jed('Cancel')
              ),
              React.createElement(
                'button',
                { onClick: this._onSubmit, disabled: disabledSubmit, className: 'button white text-ellipsis', type: 'submit' },
                _jed('Change orderer')
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: errorsClass, id: 'errors' },
          React.createElement(
            'div',
            { className: 'row emboss red text-align-center font-size-m padding-inset-s' },
            React.createElement(
              'strong',
              null,
              this.state.errors
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'row padding-vertical-m', id: 'user' },
          React.createElement(
            'div',
            { className: 'row emboss padding-inset-m' },
            React.createElement(
              'div',
              { className: 'col4of9 text-align-center', style: { textAlign: 'left' }, id: 'swapped-person' },
              React.createElement('input', { ref: function (ref) {
                  return _this6.inputReference = ref;
                }, style: { display: displayInput }, onFocus: this._onInputFocus, value: this.state.input, onChange: this._onChangeInput, autoComplete: 'off', autoFocus: 'autofocus', className: 'width-m', 'data-barcode-scanner-target': true, 'data-prevent-barcode-scanner-submit': true, id: 'user-id', placeholder: _jed('Name / ID'), type: 'text' }),
              React.createElement(
                'div',
                { id: 'selected-user' },
                this._renderSelectedUser()
              ),
              this._renderDropdown()
            ),
            React.createElement(
              'div',
              { className: 'col1of9 text-align-center' },
              React.createElement('i', { className: 'fa fa-exchange icon-xxl' })
            ),
            React.createElement(
              'div',
              { className: 'col4of9 text-align-center' },
              React.createElement(
                'p',
                { className: 'paragraph-s padding-top-xxs margin-top-xxs' },
                React.createElement(
                  'strong',
                  null,
                  this.props.other.order.user().firstname,
                  ' ',
                  this.props.other.order.user().lastname
                )
              )
            )
          )
        ),
        this._renderContactPerson()
      );
    }
  });
})();
window.TimelineNewAlgorithm = {

  hasPendingBooking: function (booking) {
    return this.pendingBooking(booking) != null;
  },

  pendingBooking: function (booking) {
    return _.find(booking, function (b) {
      return b.assignment == null;
    });
  },

  assignedBookings: function (booking) {
    return _.filter(booking, function (b) {
      return b.assignment != null;
    });
  },

  trySimpleAssign: function (current, leftovers) {

    _.each(current.entitlementGroupIds, function (egid) {
      if (current.assignment == null && leftovers[egid] != undefined && leftovers[egid] > 0) {
        current.assignment = egid;
        leftovers[egid]--;
      }
    });
  },

  tryModify: function (current, assignedBooking, leftovers) {

    var currentAssignment = assignedBooking.assignment;
    var candidates = _.difference(assignedBooking.entitlementGroupIds, [currentAssignment]);
    candidates = _.difference(candidates, current.entitlementGroupIds);

    var candidate = _.find(candidates, function (egid) {
      return leftovers[egid] != undefined && leftovers[egid] > 0;
    });

    if (candidate) {
      current.assignment = assignedBooking.assignment;
      leftovers[assignedBooking.assignment]--;

      leftovers[assignedBooking.assignment]++;
      leftovers[candidate]--;
      assignedBooking.assignment = candidate;
    }
  },

  modifyAnAssignedBooking: function (current, assignedBookings, leftovers) {
    var _this = this;

    _.each(assignedBookings, function (ab) {
      if (current.assignment == null) {
        _this.tryModify(current, ab, leftovers);
      }
    });
  },

  assignBooking: function (current, assignedBookings, leftovers) {

    this.trySimpleAssign(current, leftovers);
    if (current.assignment == null) {
      this.modifyAnAssignedBooking(current, assignedBookings, leftovers);
    }
    if (current.assignment == null) {
      current.assignment = '';
    }
  },

  newAlgorithm: function (reservations, constraints) {

    var leftovers = _.clone(constraints);
    var booking = _.map(reservations, function (entitlementGroupIds, reservationId) {
      return {
        reservationId: reservationId,
        assignment: null,
        entitlementGroupIds: _.sortBy(entitlementGroupIds, function (v) {
          return v;
        }) // general group '' first
      };
    });

    while (this.hasPendingBooking(booking)) {
      var current = this.pendingBooking(booking);
      var assignedBookings = this.assignedBookings(booking);
      this.assignBooking(current, assignedBookings, leftovers);
    }

    return booking;
  }
};
(function () {
  var React = window.React;

  window.TimelineNew = window.createReactClass({
    propTypes: {},

    displayName: 'TimelineNew',

    getInitialState: function () {
      return {
        preprocessedData: TimelinePreprocessData.preprocessData(this.props.timeline_availability),
        showPopup: null,
        popupReservation: null,
        popupPosition: null
      };
    },

    componentDidMount: function () {
      document.addEventListener('scroll', this._onScroll);
    },

    componentWillUnmount: function () {
      document.removeEventListener('scroll', this._onScroll);
    },

    _onToggle: function (event, rr) {
      event.preventDefault();

      var rect = event.nativeEvent.target.getBoundingClientRect();

      var x = window.scrollX + rect.left + event.nativeEvent.offsetX;
      var y = window.scrollY + rect.top + rect.height * 0.5;

      if (this.state.showPopup) {
        this.setState({
          popupPosition: {
            x: x,
            y: y
          }
        });
      } else {
        this.setState({
          showPopup: rr.id,
          popupPosition: {
            x: x,
            y: y
          },
          popupReservation: rr
        });
      }
    },

    _onClose: function () {
      this.setState({ showPopup: null });
    },

    renderPopup: function (timeline_availability, rr) {
      if (!this.state.showPopup) {
        return null;
      }

      if (this.state.showPopup != rr.id) {
        return null;
      }

      var x = this.state.popupPosition.x;
      var y = this.state.popupPosition.y;

      return React.createElement(TimelinePopup, { _onClose: this._onClose, x: x, y: y, rr: rr, timeline_availability: timeline_availability });
    },

    _onScroll: function (event) {
      var _this = this;

      var elements = document.getElementsByClassName('scrollWithPage');
      _.each(elements, function (e) {
        e.style.left = TimelineRender.labelPosition(_this.state.preprocessedData.firstMoment) + 'px';
      });
    },

    numberOfEntitlementQuantities: function (entitlementQuantities) {
      return _.reduce(entitlementQuantities, function (memo, quantity) {
        return memo + 1;
      }, 0);
    },

    calcReservationsHeight: function (layouted) {
      return layouted.length * 20;
    },

    render: function () {
      var preprocessedData = this.state.preprocessedData;

      var firstMoment = preprocessedData.firstMoment;
      var lastMoment = preprocessedData.lastMoment;
      var numberOfDaysToShow = preprocessedData.numberOfDays;
      var dayWidth = 30;
      var relevantItemsCount = preprocessedData.relevantItemsCount;
      var totalCounts = preprocessedData.totalCounts;
      var reservationCounts = preprocessedData.reservationCounts;
      var unusedCounts = preprocessedData.unusedCounts;
      var allLayoutedReservationFrames = preprocessedData.allLayoutedReservationFrames;
      var userEntitlementGroupsForModel = preprocessedData.userEntitlementGroupsForModel;
      var entitlementQuantities = preprocessedData.entitlementQuantities;
      var reservationsInGroups = preprocessedData.reservationsInGroups;
      var wholeWidth = dayWidth * numberOfDaysToShow;

      var unusedColors = function (index) {
        var delta = unusedCounts[index];
        if (delta > 0) {
          return 'rgb(170, 221, 170)';
        } else if (delta == 0) {
          return '#e4db5f';
        } else {
          return 'rgb(221, 170, 170)';
        }
      };

      var topMonths = 0;
      var topDays = topMonths + 40;
      var topTotalQuantities = topDays + 50;
      var topEntitlementQuantities = topTotalQuantities + 50;
      var entitlementLineHeight = 60;
      var entitlementsHeight = this.numberOfEntitlementQuantities(entitlementQuantities) * entitlementLineHeight;
      var topTest = topEntitlementQuantities + entitlementsHeight;
      var topTest2 = topTest + entitlementLineHeight;
      var topAvailabilities = topTest2 + entitlementLineHeight;
      var topReservations = topAvailabilities + 70;
      var wholeHeight = topReservations + this.calcReservationsHeight(allLayoutedReservationFrames) + 200;

      return React.createElement(
        'div',
        { style: { position: 'absolute', top: '0px', left: '0px', height: wholeHeight + 'px', width: wholeWidth + 'px', bottom: '0px', overflow: 'hidden' } },
        React.createElement(
          'div',
          { style: { position: 'fixed', zIndex: '1000000000', left: '0px', right: '0px', bottom: '0px', height: '40px', backgroundColor: 'white' } },
          React.createElement(
            'a',
            { href: window.location.href.replace('/timeline', '/old_timeline') },
            React.createElement(
              'div',
              { style: { borderRadius: '5px', color: '#eee', textAlign: 'center', fontSize: '12px', padding: '6px', backgroundColor: '#4e4e4e', width: '200px', margin: '5px auto 5px auto' } },
              'Old Version'
            )
          )
        ),
        React.createElement(
          'div',
          { style: { position: 'absolute', top: topMonths + 'px', left: '0px', width: wholeWidth + 'px', bottom: '0px' } },
          TimelineRender.renderMonths(firstMoment, lastMoment)
        ),
        React.createElement(
          'div',
          { style: { position: 'absolute', top: topDays + 'px', left: '0px', width: wholeWidth + 'px', bottom: '0px' } },
          TimelineRender.renderDays(firstMoment, numberOfDaysToShow)
        ),
        React.createElement(
          'div',
          { style: { position: 'absolute', top: topReservations + 'px', left: '0px', width: wholeWidth + 'px' } },
          TimelineRenderReservations.renderReservations(allLayoutedReservationFrames, firstMoment, lastMoment, this.props.timeline_availability, this.state.preprocessedData.invalidReservations, this._onToggle)
        ),
        TimelineRender.renderLabelSmall(firstMoment, 'Total:', topTotalQuantities),
        TimelineRender.renderIndexedQuantitiesSmall(null, function (i) {
          return relevantItemsCount;
        }, firstMoment, lastMoment, unusedColors, topTotalQuantities, wholeWidth, undefined),
        TimelineRender.renderEntitlementQuantityLabels(entitlementLineHeight, this.props.timeline_availability, this.state.preprocessedData.changesForDays, reservationsInGroups, entitlementQuantities, topEntitlementQuantities, wholeWidth, firstMoment, lastMoment, relevantItemsCount),
        TimelineRender.renderEntitlementQuantities(entitlementLineHeight, this.props.timeline_availability, this.state.preprocessedData.changesForDays, reservationsInGroups, entitlementQuantities, topEntitlementQuantities + 20, wholeWidth, firstMoment, lastMoment, relevantItemsCount),
        TimelineRender.renderBoldLabel(null, topTest, wholeWidth, 'müssen aus fremden Gruppen genommen werden', undefined, firstMoment),
        TimelineRender.renderNotAssignable(entitlementLineHeight, this.props.timeline_availability, this.state.preprocessedData.changesForDays, reservationsInGroups, entitlementQuantities, topTest + 20, wholeWidth, firstMoment, lastMoment, relevantItemsCount, unusedCounts),
        TimelineRender.renderBoldLabel(null, topTest2, wholeWidth, 'Überbuchungen', undefined, firstMoment),
        TimelineRender.renderNotEnough(entitlementLineHeight, this.props.timeline_availability, this.state.preprocessedData.changesForDays, reservationsInGroups, entitlementQuantities, topTest2 + 20, wholeWidth, firstMoment, lastMoment, relevantItemsCount, unusedCounts),
        TimelineRender.renderLabelSmall(firstMoment, 'Verfügbar:', topAvailabilities),
        TimelineRender.renderIndexedQuantities(function (i) {
          return unusedCounts[i];
        }, firstMoment, lastMoment, unusedColors, topAvailabilities, wholeWidth, null),
        this.renderPopup(this.props.timeline_availability, this.state.popupReservation)
      );
    }
  });
})();
(function () {
  var React = window.React;

  window.TimelinePopup = window.createReactClass({
    propTypes: {},

    displayName: 'TimelinePopup',

    _handleClickOutside: function (event) {
      if (this.popup && !this.popup.contains(event.target)) {
        this.props._onClose();
      }
    },

    componentDidMount: function () {
      document.addEventListener('mousedown', this._handleClickOutside);
    },

    componentWillUnmount: function () {
      document.removeEventListener('mousedown', this._handleClickOutside);
    },

    render: function () {
      var _this = this;

      var x = this.props.x;
      var y = this.props.y;
      var rr = this.props.rr;
      var timeline_availability = this.props.timeline_availability;

      return React.createElement(
        'div',
        { ref: function (ref) {
            return _this.popup = ref;
          }, style: { zIndex: '1000', position: 'absolute', top: y + 'px', left: x + 'px', width: '260px', border: '1px solid black', borderRadius: '5px', margin: '0px', backgroundColor: '#fff', padding: '10px' } },
        React.createElement(
          'div',
          { style: { fontSize: '16px', position: 'static', widthj: '260px' } },
          React.createElement(
            'div',
            { className: 'timeline-event-bubble-title' },
            TimelineRenderPopup.renderPopupLabel(timeline_availability, rr)
          ),
          React.createElement(
            'div',
            { className: 'timeline-event-bubble-body' },
            TimelineRenderPopup.renderPopupPhone(timeline_availability, rr),
            React.createElement('br', null),
            TimelineRenderPopup.renderPopupReservationDates(rr),
            React.createElement('br', null),
            TimelineRenderPopup.renderPopupLateInfo(rr),
            React.createElement('br', null),
            React.createElement(
              'div',
              { className: 'buttons', style: { margin: '1.5em99' } },
              TimelineRenderPopup.renderPopupLink(timeline_availability, rr)
            )
          )
        )
      );
    }

  });
})();
window.TimelinePreprocessData = {

  firstReservationMoment: function () {
    return moment().add(-7, 'days');
  },

  isAfter: function (m1, m2) {
    return m1.isAfter(m2, 'day');
  },

  findMaximumMoment: function (moments) {
    return _.reduce(moments, function (memo, m) {
      if (memo == null) {
        return m;
      } else {
        if (TimelineUtil.isAfter(m, memo)) {
          return m;
        } else {
          return memo;
        }
      }
    }, null);
  },

  mapToMoments: function (isoDates) {
    return isoDates.map(function (iso) {
      return moment(iso);
    });
  },

  reservationEndDates: function (timeline_availability) {
    return timeline_availability.running_reservations.map(function (rr) {
      return rr.end_date;
    });
  },

  lastReservationMoment: function (timeline_availability) {

    if (timeline_availability.running_reservations.length == 0) {
      return moment().add(3, 'months');
    }

    var m = TimelinePreprocessData.findMaximumMoment(TimelinePreprocessData.mapToMoments(TimelinePreprocessData.reservationEndDates(timeline_availability)));

    if (m.isSameOrBefore(moment(), 'day')) {
      return moment().add(+1, 'month');
    } else {
      var inOneYear = moment().add(1, 'year');
      if (m.endOf('month').isAfter(inOneYear)) {
        return inOneYear;
      } else {
        return m.add(+1, 'month');
      }
    }
  },

  relevantItems: function (timeline_availability) {
    return _.filter(timeline_availability.items, function (i) {
      return i.is_borrowable && !i.is_broken && !i.retired;
    });
  },

  relevantItemsCount: function (timeline_availability) {
    return TimelinePreprocessData.relevantItems(timeline_availability).length;
  },

  totalCounts: function (lastMoment, relevantItemsCount) {
    return _.range(0, TimelineUtil.numberOfDays(moment(), lastMoment)).map(function (i) {
      return relevantItemsCount;
    });
  },

  reservationIntersectsDay: function (rf, day) {
    var start = moment(rf.start_date);
    var end = moment(rf.end_date);
    var late = TimelineUtil.late(rf);
    var reserved = TimelineUtil.reserved(rf);

    if (!reserved && TimelineUtil.isAfter(start, day) || !late && TimelineUtil.isAfter(day, end)) {
      return false;
    } else {
      return true;
    }
  },

  reservationsForDay: function (timeline_availability, day) {
    return _.filter(timeline_availability.running_reservations, function (r) {
      return TimelinePreprocessData.reservationIntersectsDay(r, day);
    });
  },

  handoutCounts: function (timeline_availability, lastMoment) {

    return _.range(0, TimelineUtil.numberOfDays(moment(), lastMoment)).map(function (i) {

      var day = moment().add(i, 'days');
      return _.filter(TimelinePreprocessData.reservationsForDay(timeline_availability, day), function (r) {
        return r.status == 'signed';
      });
    });
  },

  reservationCounts: function (timeline_availability, lastMoment) {

    return _.range(0, TimelineUtil.numberOfDays(moment(), lastMoment)).map(function (i) {

      var day = moment().add(i, 'days');
      return _.filter(TimelinePreprocessData.reservationsForDay(timeline_availability, day), function (r) {
        return r.status != 'signed';
      });
    });
  },

  sortedReservations: function (reservations) {

    return _.sortBy(reservations, function (r) {
      var compare = '';
      if (!r.end_date || TimelineUtil.late(r)) {
        compare += '9999-99-99';
      } else {
        compare += r.end_date;
      }
      compare += '/';
      if (!r.start_date) {
        compare += '0000-00-00';
      } else {
        compare += r.start_date;
      }
      return compare;
    });
  },

  hasIntersection: function (rfs, rf) {

    return _.find(rfs, function (rfi) {

      var startA = moment(rf.start_date);
      var endA = moment(rf.end_date);
      var lateA = TimelineUtil.late(rf);
      var reservedA = TimelineUtil.reserved(rf);
      var startB = moment(rfi.start_date);
      var endB = moment(rfi.end_date);
      var lateB = TimelineUtil.late(rfi);
      var reservedB = TimelineUtil.reserved(rfi);

      if (!lateB && !reservedA && TimelineUtil.isAfter(startA, endB) || !lateA && !reservedB && TimelineUtil.isAfter(startB, endA)) {
        return false;
      } else {
        return true;
      }
    });
  },

  findNoneIntersectionLine: function (lines, rf) {
    return _.find(lines, function (line) {
      return !TimelinePreprocessData.hasIntersection(line, rf);
    });
  },

  layoutReservationFrames: function (reservations) {

    var rfs = TimelinePreprocessData.sortedReservations(reservations);

    return _.reduce(rfs, function (memo, rf) {

      if (memo.length == 0) {
        return memo.concat([[rf]]);
      } else {

        var line = TimelinePreprocessData.findNoneIntersectionLine(memo, rf);

        if (!line) {
          return memo.concat([[rf]]);
        } else {
          line.push(rf);
          return memo;
        }
      }
    }, []).map(function (line) {
      return _.sortBy(line, function (rfi) {
        return rfi.start_date;
      });
    });
  },

  calculateUserEntitlementGroups: function (timeline_availability) {

    return _.object(timeline_availability.reservation_users.map(function (u) {
      return [u.id, _.compact( // compact should theoretically not be needed, but there are exceptions e.g.: http://localhost:3000/manage/8bd16d45-056d-5590-bc7f-12849f034351/models/6ef67281-54f1-5460-a5ba-ae984d01d43c/timeline
      _.filter(timeline_availability.entitlement_groups_users, function (egu) {
        return egu.user_id == u.id;
      }).map(function (egu) {
        return _.find(timeline_availability.entitlement_groups, function (eg) {
          return eg.id == egu.entitlement_group_id;
        });
      }))];
    }));
  },

  userEntitlementGroupsForModel: function (timeline_availability) {

    var userEntitlementGroups = TimelinePreprocessData.calculateUserEntitlementGroups(timeline_availability);

    var entitlementGroupIds = timeline_availability.entitlements.map(function (e) {
      return e.entitlement_group_id;
    });

    return _.object(_.map(userEntitlementGroups, function (uegs, uid) {

      return [uid, _.filter(uegs, function (ueg) {
        return _.contains(entitlementGroupIds, ueg.id);
      })];
    }));
  },

  entitlementQuantities: function (timeline_availability, relevantItemsCount) {

    return _.object(timeline_availability.entitlements.map(function (e) {
      return [e.entitlement_group_id, e.quantity];
    }).concat([['', relevantItemsCount - _.reduce(timeline_availability.entitlements, function (memo, e) {
      return memo + e.quantity;
    }, 0)]]));
  },

  groupsForUser: function (user_id, timeline_availability) {
    return _.filter(timeline_availability.entitlement_groups_users, function (egu) {
      return egu.user_id == user_id;
    }).map(function (egu) {
      return egu.entitlement_group_id;
    });
  },

  groupsForUsers: function (timeline_availability) {
    return _.object(timeline_availability.reservation_users.map(function (u) {
      return [u.id, TimelinePreprocessData.groupsForUser(u.id, timeline_availability)];
    }));
  },

  isReservationInGroup: function (reservation, groupId, timeline_availability) {
    return _.contains(TimelinePreprocessData.groupsForUsers(timeline_availability)[reservation.user_id], groupId);
  },

  reservationsInGroups: function (timeline_availability, entitlementQuantities, lastMoment, relevantItemsCount) {

    return _.range(0, TimelineUtil.numberOfDays(moment(), lastMoment)).map(function (i) {

      var day = moment().add(i, 'days');

      var dayReservations = TimelinePreprocessData.reservationsForDay(timeline_availability, day);

      return _.mapObject(entitlementQuantities, function (q, g) {

        return _.filter(dayReservations, function (r) {
          return TimelinePreprocessData.isReservationInGroup(r, g, timeline_availability);
        });
      });
    });
  },

  changesDates: function (timeline_availability) {

    return _.sortBy(_.map(_.reduce(timeline_availability.running_reservations, function (memo, r) {

      var ds = [];
      memo[r.start_date] = r.start_date;
      var before_start_date = moment(r.start_date).add(-1, 'days').format('YYYY-MM-DD');
      memo[before_start_date] = before_start_date;
      if (!TimelineUtil.late(r)) {
        memo[r.end_date] = r.end_date;
        var after_end_date = moment(r.end_date).add(+1, 'days').format('YYYY-MM-DD');
        memo[after_end_date] = after_end_date;
      }

      return memo;
    }, {}), function (v) {
      return v;
    }), function (v) {
      return v;
    });
  },

  calculateChangesReservations: function (timeline_availability, change) {
    var m = moment(change);
    return _.filter(timeline_availability.running_reservations, function (r) {
      var start = moment(r.start_date);
      var end = moment(r.end_date);
      return start.isSameOrBefore(m) && (end.isSameOrAfter(m) || TimelineUtil.late(r));
    });
  },

  reservationEntitlements: function (timeline_availability, reservation, userEntitlementGroupsForModel) {
    var userId = reservation.user_id;
    var entitlements = userEntitlementGroupsForModel[userId];
    return entitlements.map(function (e) {
      return e.id;
    });
  },

  newAlgorithmForReservations: function (timeline_availability, reservationsList, userEntitlementGroupsForModel, relevantItemsCount) {

    var reservations = _.object(reservationsList.map(function (r) {
      return [r.id, TimelinePreprocessData.reservationEntitlements(timeline_availability, r, userEntitlementGroupsForModel).concat([''])];
    }));

    var constraints = _.object(timeline_availability.entitlements.map(function (e) {
      return [e.entitlement_group_id, e.quantity];
    }).concat([['', relevantItemsCount - _.reduce(timeline_availability.entitlements, function (memo, e) {
      return memo + e.quantity;
    }, 0)]]));

    return TimelineNewAlgorithm.newAlgorithm(reservations, constraints);
  },

  changesAlgorithm: function (timeline_availability, changes, userEntitlementGroupsForModel, relevantItemsCount) {
    return changes.map(function (c) {
      var reservations = TimelinePreprocessData.calculateChangesReservations(timeline_availability, c);
      return {
        change: c,
        date: c,
        reservations: reservations,
        algorithm: TimelinePreprocessData.newAlgorithmForReservations(timeline_availability, reservations, userEntitlementGroupsForModel, relevantItemsCount),
        available: relevantItemsCount - _.size(reservations)
      };
    });
  },

  changesForDays: function (timeline_availability, lastMoment, changesAlgorithm, relevantItemsCount) {

    return _.range(0, TimelineUtil.numberOfDays(moment(), lastMoment)).map(function (i) {

      var day = moment().add(i, 'days');

      return _.last(_.filter(changesAlgorithm, function (c) {
        var cm = moment(c.date);

        return day.isSameOrAfter(cm, 'day');
      }));
    });
  },

  invalidReservations: function (timeline_availability, changesAlgorithm, relevantItemsCount) {

    var invalids = _.filter(changesAlgorithm, function (c) {
      return relevantItemsCount - _.size(c.reservations) < 0;
    }).map(function (c) {
      return c.change;
    });

    var rids = _.uniq(_.flatten(invalids.map(function (c) {
      return _.filter(TimelinePreprocessData.calculateChangesReservations(timeline_availability, c), function (r) {
        return !r.item_id;
      }).map(function (r) {
        return r.id;
      });
    })));

    return _.object(rids.map(function (rid) {
      return [rid, rid];
    }));
  },

  preprocessData: function (timeline_availability) {
    var firstMoment = TimelinePreprocessData.firstReservationMoment();
    var lastMoment = TimelinePreprocessData.lastReservationMoment(timeline_availability);
    var numberOfDays = TimelineUtil.numberOfDays(firstMoment, lastMoment);
    var relevantItemsCount = TimelinePreprocessData.relevantItemsCount(timeline_availability);
    var totalCounts = TimelinePreprocessData.totalCounts(lastMoment, relevantItemsCount);
    var handoutCounts = TimelinePreprocessData.handoutCounts(timeline_availability, lastMoment).map(function (hc) {
      return -hc.length;
    });
    var borrowableCounts = _.zip(totalCounts, handoutCounts).map(function (p) {
      return _.first(p) + _.last(p);
    });
    var reservationCounts = TimelinePreprocessData.reservationCounts(timeline_availability, lastMoment).map(function (rc) {
      return -rc.length;
    });
    var unusedCounts = _.zip(borrowableCounts, reservationCounts).map(function (p) {
      return _.first(p) + _.last(p);
    });
    var allLayoutedReservationFrames = TimelinePreprocessData.layoutReservationFrames(timeline_availability.running_reservations);
    var userEntitlementGroupsForModel = TimelinePreprocessData.userEntitlementGroupsForModel(timeline_availability);
    var entitlementQuantities = TimelinePreprocessData.entitlementQuantities(timeline_availability, relevantItemsCount);
    var reservationsInGroups = TimelinePreprocessData.reservationsInGroups(timeline_availability, entitlementQuantities, lastMoment, relevantItemsCount);
    var calculateChanges = TimelinePreprocessData.changesDates(timeline_availability);
    var changesAlgorithm = TimelinePreprocessData.changesAlgorithm(timeline_availability, calculateChanges, userEntitlementGroupsForModel, relevantItemsCount);
    var changesForDays = TimelinePreprocessData.changesForDays(timeline_availability, lastMoment, changesAlgorithm, relevantItemsCount);
    var invalidReservations = TimelinePreprocessData.invalidReservations(timeline_availability, changesAlgorithm, relevantItemsCount);

    return {
      firstMoment: firstMoment,
      lastMoment: lastMoment,
      numberOfDays: numberOfDays,
      relevantItemsCount: relevantItemsCount,
      totalCounts: totalCounts,
      reservationCounts: reservationCounts,
      unusedCounts: unusedCounts,
      allLayoutedReservationFrames: allLayoutedReservationFrames,
      userEntitlementGroupsForModel: userEntitlementGroupsForModel,
      entitlementQuantities: entitlementQuantities,
      reservationsInGroups: reservationsInGroups,
      calculateChanges: calculateChanges,
      changesAlgorithm: changesAlgorithm,
      changesForDays: changesForDays,
      invalidReservations: invalidReservations
    };
  }
};
window.TimelineRenderPopup = {

  renderPopupPhone: function (timeline_availability, rr) {
    var user = TimelineUtil.findUser(timeline_availability, rr.user_id);
    return _jed('Phone') + ': ' + (user.phone ? user.phone : '');
  },

  startDateString: function (rr) {
    return moment(rr.start_date).format('DD.MM.YYYY');
  },

  endDateString: function (rr) {
    return moment(rr.end_date).format('DD.MM.YYYY');
  },

  renderPopupReservationDates: function (rr) {
    return _jed('Reservation') + ': ' + TimelineRenderPopup.startDateString(rr) + ' ' + _jed('until') + ' ' + TimelineRenderPopup.endDateString(rr);
  },

  renderPopupLateInfo: function (rr) {

    if (!TimelineUtil.late(rr)) {
      return null;
    }

    return React.createElement(
      'b',
      null,
      _jed('Item is overdue and therefore unavailable!')
    );
  },

  renderPopupTakeBackLink: function (rr) {
    return '/manage/' + rr.inventory_pool_id + '/users/' + rr.user_id + '/take_back';
  },

  renderPopupHandOverLink: function (rr) {
    return '/manage/' + rr.inventory_pool_id + '/users/' + rr.user_id + '/hand_over';
  },

  renderPopupAcknowledgeLink: function (rr) {
    return '/manage/' + rr.inventory_pool_id + '/orders/' + rr.order_id + '/edit';
  },

  renderPopupLink: function (timeline_availability, rr) {

    if (!timeline_availability.is_lending_manager) {
      return null;
    }

    if (rr.status == 'submitted') {
      return React.createElement(
        'a',
        { target: '_top', href: TimelineRenderPopup.renderPopupAcknowledgeLink(rr) },
        _jed('Acknowledge')
      );
    } else if (rr.status == 'approved') {
      return React.createElement(
        'a',
        { target: '_top', href: TimelineRenderPopup.renderPopupHandOverLink(rr) },
        _jed('Hand Over')
      );
    } else if (rr.status == 'signed') {
      return React.createElement(
        'a',
        { target: '_top', href: TimelineRenderPopup.renderPopupTakeBackLink(rr) },
        _jed('Take Back')
      );
    } else {
      return null;
    }
  },

  renderPopupLabel: function (timeline_availability, rr) {

    var username = TimelineUtil.username(timeline_availability, rr);
    var inventoryCode = TimelineUtil.inventoryCode(timeline_availability, rr);

    return username + (inventoryCode ? ' (' + inventoryCode + ')' : '');
  }
};
window.TimelineRenderReservations = {

  reservationLabel: function (timeline_availability, rr, color) {

    var label = TimelineUtil.username(timeline_availability, rr);

    var elements = [React.createElement(
      'span',
      { key: 'label' },
      label
    )];

    var inventoryCode = TimelineUtil.inventoryCode(timeline_availability, rr);
    if (inventoryCode) {
      elements.push(React.createElement(
        'span',
        { key: 'inventory_code', style: { color: color, backgroundColor: '#383838', marginLeft: '10px', padding: '0px 3px 0px 3px' } },
        inventoryCode
      ));
    }

    return elements;
  },

  renderReservations: function (layouted, firstMoment, lastMoment, timeline_availability, invalidReservations, _onToggle) {

    return layouted.map(function (line, index) {

      return line.map(function (rr) {

        var start = moment(rr.start_date);
        var end = moment(rr.end_date);

        var offset = TimelineUtil.daysDifference(start, firstMoment);

        var height = 15;
        var padding = 5;
        var totalHeight = height + padding;

        if (TimelineUtil.late(rr)) {
          var length = TimelineUtil.numberOfDays(start, end);
          var lateLength = TimelineUtil.numberOfDays(start, lastMoment) - length + 1;
          var fullLength = TimelineUtil.numberOfDays(start, lastMoment);

          var labelOffset = offset;
          if (labelOffset < 0) {
            labelOffset = 0;
            fullLength = fullLength + offset;
          }

          return [React.createElement(
            'div',
            { key: 'reservation_late_' + rr.id, style: { position: 'absolute', top: index * totalHeight + 'px', left: offset * 30 + length * 30 + 'px', width: lateLength * 30 + 'px', height: height + 'px', border: '0px' } },
            React.createElement(
              'div',
              { style: { backgroundColor: 'rgba(212, 84, 84, 0.5)', position: 'absolute', top: '0px', left: '0px', bottom: '0px', right: '0px', borderRadius: '0px 5px 5px 0px', margin: '0px 3px 0px 0px' } },
              ' '
            )
          ), React.createElement(
            'div',
            { key: 'reservation_' + rr.id, style: { position: 'absolute', top: index * totalHeight + 'px', left: offset * 30 + 'px', width: length * 30 + 'px', height: height + 'px', border: '0px' } },
            React.createElement(
              'div',
              { style: { backgroundColor: 'rgba(212, 84, 84, 1.0)', position: 'absolute', top: '0px', left: '0px', bottom: '0px', width: length * 30 - 4 + 'px', borderRadius: '5px 0px 0px 5px', margin: '0px 0px 0px 3px' } },
              ' '
            )
          ), React.createElement(
            'div',
            { key: 'reservation_label_' + rr.id, style: { position: 'absolute', top: index * totalHeight + 'px', left: labelOffset * 30 + 'px', width: fullLength * 30 + 'px', height: height + 'px', border: '0px' } },
            React.createElement(
              'div',
              { onClick: function (e) {
                  return _onToggle(e, rr);
                }, style: { backgroundColor: 'none', color: '#eee', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: fullLength * 30 - 4 + 'px', position: 'absolute', top: '0px', left: '0px', bottom: '0px', borderRadius: '5px 0px 0px 5px', padding: '2px 5px', margin: '0px 0px 0px 3px' } },
              TimelineRenderReservations.reservationLabel(timeline_availability, rr, '#eee')
            )
          )];
        } else {

          var length = TimelineUtil.numberOfDays(start, end);

          var backgroundColor = '#e3be1f';
          var margin = '0px 3px';
          var border = 'none';
          var padding = '2px 5px';
          if (invalidReservations[rr.id]) {
            margin = '0px 3px';
            border = '2px solid red';
            padding = '0px 5px';
          }

          var labelOffset = offset;
          var labelLength = length;
          if (labelOffset < 0) {
            labelOffset = 0;
            labelLength = labelLength + offset;
          }

          var invalidBorder = null;
          if (invalidReservations[rr.id]) {

            invalidBorder = React.createElement(
              'div',
              { key: 'reservation_border_' + rr.id, style: { position: 'absolute', top: index * totalHeight + 'px', left: offset * 30 + 'px', width: length * 30 + 'px', height: height + 'px', border: '0px' } },
              React.createElement(
                'div',
                { style: { backgroundColor: 'none', position: 'absolute', top: '0px', left: '0px', bottom: '0px', right: '0px', borderRadius: '5px', margin: '0px 3px 0px 3px', border: '2px solid red' } },
                ' '
              )
            );
          }

          return _.compact([React.createElement(
            'div',
            { key: 'reservation_' + rr.id, style: { position: 'absolute', top: index * totalHeight + 'px', left: offset * 30 + 'px', width: length * 30 + 'px', height: height + 'px', border: '0px' } },
            React.createElement(
              'div',
              { style: { backgroundColor: backgroundColor, position: 'absolute', top: '0px', left: '0px', bottom: '0px', right: '0px', borderRadius: '5px', margin: '0px 3px 0px 3px' } },
              ' '
            )
          ), invalidBorder, React.createElement(
            'div',
            { key: 'reservation_label' + rr.id, style: { position: 'absolute', top: index * totalHeight + 'px', left: labelOffset * 30 + 'px', width: labelLength * 30 + 'px', height: height + 'px', border: '0px' } },
            React.createElement(
              'div',
              { onClick: function (e) {
                  return _onToggle(e, rr);
                }, style: { backgroundColor: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: labelLength * 30 - 4 - 3 + 'px', padding: '2px 5px', margin: '0px 3px' } },
              TimelineRenderReservations.reservationLabel(timeline_availability, rr, '#e3be1f')
            )
          )]);
        }
      });
    });
  }

};
window.TimelineRender = {

  renderLabelSmall: function (firstMoment, text, top) {

    var offset = TimelineUtil.offset(firstMoment);

    return React.createElement(
      'div',
      { style: { fontSize: '10px', padding: '4px', margin: '2px', position: 'absolute', top: top + 'px', left: offset * 30 - 1000 - 20 + 'px', textAlign: 'right', width: '1000px', height: '30px', border: '0px' } },
      text
    );
  },

  renderValue: function (prefix, index, offset, value, backgroundColor) {
    return React.createElement(
      'div',
      { key: prefix + index, style: { position: 'absolute', top: '0px', left: (offset + index) * 30 + 'px', width: '30px', height: '30px', border: '0px' } },
      React.createElement(
        'div',
        { style: { backgroundColor: backgroundColor, textAlign: 'center', fontSize: '16px', position: 'absolute', top: '0px', left: '0px', right: '0px', bottom: '0px', padding: '4px', margin: '2px', borderRadius: '5px' } },
        value
      )
    );
  },

  renderValueSmall: function (prefix, index, offset, value, backgroundColor) {
    return React.createElement(
      'div',
      { key: prefix + index, style: { position: 'absolute', top: '0px', left: (offset + index) * 30 + 'px', width: '30px', height: '30px', border: '0px' } },
      React.createElement(
        'div',
        { style: { textAlign: 'center', fontSize: '10px', position: 'absolute', top: '0px', left: '0px', right: '0px', bottom: '0px', padding: '4px', margin: '2px' } },
        value
      )
    );
  },

  renderIndexedQuantities: function (valueFunc, firstMoment, lastMoment, colorFunc, top, wholeWidth, key) {

    var offset = TimelineUtil.offset(firstMoment);

    var range = _.range(0, TimelineUtil.numberOfDays(moment(), lastMoment));

    var values = _.map(range, function (i) {

      var value = valueFunc(i);

      var color = colorFunc(i);

      return TimelineRender.renderValue('handout_count_', i, offset, value, color);
    });

    return React.createElement(
      'div',
      { style: { position: 'absolute', top: top + 'px', left: '0px', width: wholeWidth + 'px' } },
      values
    );
  },

  renderIndexedQuantitiesSmall: function (title, valueFunc, firstMoment, lastMoment, colorFunc, top, wholeWidth, key) {

    var offset = TimelineUtil.offset(firstMoment);

    var range = _.range(0, TimelineUtil.numberOfDays(moment(), lastMoment));

    var values = _.map(range, function (i) {
      var value = valueFunc(i);
      var color = colorFunc(i);
      return TimelineRender.renderValueSmall('handout_count_', i, offset, value, color);
    });

    return React.createElement(
      'div',
      { key: key, title: title, style: { position: 'absolute', top: top + 'px', left: '0px', width: wholeWidth + 'px' } },
      values
    );
  },

  renderMonth: function (firstMoment, monthFrom, monthTo, isLast) {

    var offset = function (m) {
      return TimelineUtil.daysDifference(m, firstMoment);
    };

    var offset = offset(monthFrom);
    var length = TimelineUtil.numberOfDays(monthFrom, monthTo);

    var border = '1px solid black';
    if (isLast) {
      border = 'none';
    }

    return React.createElement(
      'div',
      { key: 'month_' + monthFrom.format('YYYY-MM'), style: { position: 'absolute', top: '0px', left: offset * 30 + 'px', width: length * 30 + 'px', bottom: '0px', border: '0px' } },
      React.createElement(
        'div',
        { style: { fontSize: '14px', paddingTop: '10px', textAlign: 'center', position: 'absolute', top: '0px', left: '0px', bottom: '0px', right: '0px', border: border, borderWidth: '0px 1px 0px 0px' } },
        monthFrom.format('MMMM')
      )
    );
  },

  renderMonths: function (firstMoment, lastMoment) {

    var months = [];
    var monthFrom = moment(firstMoment);
    while (monthFrom.isSameOrBefore(lastMoment, 'day')) {

      var monthTo = moment(monthFrom).endOf('month');
      if (monthTo.isAfter(lastMoment)) {
        monthTo = moment(lastMoment);
      }

      months.push({
        from: monthFrom,
        to: monthTo
      });

      monthFrom = moment(monthTo).add(1, 'month').startOf('month');
    }

    return months.map(function (month, index) {
      return TimelineRender.renderMonth(firstMoment, month.from, month.to, index == months.length - 1);
    });
  },

  renderDays: function (firstMoment, numberOfDaysToShow) {

    return _.map(_.range(0, numberOfDaysToShow), function (i) {

      var m = moment(firstMoment).add(i, 'days');

      var backgroundColor = 'none';
      if (m.isSame(moment(), 'day')) {
        backgroundColor = '#dadada';
      }

      return React.createElement(
        'div',
        { key: 'day_' + i, style: { position: 'absolute', top: '0px', left: i * 30 + 'px', width: '30px', bottom: '0px', border: '0px' } },
        React.createElement(
          'div',
          { style: { backgroundColor: backgroundColor, position: 'absolute', top: '0px', left: '0px', bottom: '0px', right: '0px', border: '1px dotted black', borderWidth: '1px 1px 0px 0px' } },
          React.createElement(
            'div',
            { style: { border: '1px dotted black', borderWidth: '0px 0px 1px 0px', paddingTop: '5px', paddingBottom: '5px', textAlign: 'center' } },
            m.format('DD')
          )
        )
      );
    });
  },

  labelPosition: function (firstMoment) {

    var offset = TimelineUtil.offset(firstMoment);
    var x = 0;

    if (window.scrollX > offset * 30 - 20) {
      x = window.scrollX + 20;
    } else {
      x = offset * 30;
    }

    return x;
  },

  renderBoldLabel: function (title, top, wholeWidth, label, key, firstMoment) {

    var offset = TimelineUtil.offset(firstMoment);
    return React.createElement(
      'div',
      { key: key, title: title, className: 'scrollWithPage', style: { fontWeight: 'bold', fontSize: '10px', padding: '4px', margin: '2px', position: 'absolute', top: top + 'px', left: TimelineRender.labelPosition(firstMoment) + 'px', textAlign: 'lef', width: '400px', height: '30px', border: '0px' } },
      label
    );
  },

  entitlementGroupNameForId: function (timeline_availability, groupId) {
    var entitlementGroup = _.find(timeline_availability.entitlement_groups, function (eg) {
      return eg.id == groupId;
    });

    var name = '';
    if (entitlementGroup) {
      name = entitlementGroup.name;
    }

    return name;
  },

  renderEntitlementQuantityLabel: function (title, timeline_availability, groupId, top, wholeWidth, quantity, firstMoment) {

    if (quantity < 0) {
      quantity = 0;
    }
    if (groupId == '') {
      label = quantity + ' verfügbar für Allgemein, davon zugewiesen';
    } else {
      var name = TimelineRender.entitlementGroupNameForId(timeline_availability, groupId);
      label = quantity + ' reserviert für Gruppe ' + name + ', davon zugewiesen';
    }

    return TimelineRender.renderBoldLabel(title, top, wholeWidth, label, 'label_' + groupId, firstMoment);
  },

  reservationColors: function (index) {
    return 'rgb(210, 210, 210)';
  },

  renderNotEnough: function (lineHeight, timeline_availability, changesForDays, reservationsInGroups, entitlementQuantities, top, wholeWidth, firstMoment, lastMoment, relevantItemsCount, unusedCounts) {

    var quantity = entitlementQuantities[''];

    var mappingAssigned = function (index) {

      if (!changesForDays[index]) {
        return '0';
      }

      var algo = changesForDays[index].algorithm;
      var count = _.size(_.filter(algo, function (a) {
        return a.assignment == '';
      }));

      if (unusedCounts[index] < 0) {
        return React.createElement(
          'span',
          { style: { color: 'red' } },
          -unusedCounts[index]
        );
      } else {
        return 0;
      }
    };
    return TimelineRender.renderIndexedQuantitiesSmall(null, mappingAssigned, firstMoment, lastMoment, TimelineRender.reservationColors, top, wholeWidth, undefined);
  },

  renderNotAssignable: function (lineHeight, timeline_availability, changesForDays, reservationsInGroups, entitlementQuantities, top, wholeWidth, firstMoment, lastMoment, relevantItemsCount, unusedCounts) {

    var quantity = entitlementQuantities[''];
    if (quantity < 0) {
      quantity = 0;
    }

    var mappingAssigned = function (index) {

      if (!changesForDays[index]) {
        return '0';
      }

      var algo = changesForDays[index].algorithm;
      var count = _.size(_.filter(algo, function (a) {
        return a.assignment == '';
      }));

      if (count > quantity) {

        if (unusedCounts[index] < 0) {
          return React.createElement(
            'span',
            { style: { color: 'red' } },
            count - quantity + unusedCounts[index]
          );
        } else {
          return React.createElement(
            'span',
            { style: { color: 'red' } },
            count - quantity
          );
        }
      } else {
        return 0;
      }
    };

    return TimelineRender.renderIndexedQuantitiesSmall(null, mappingAssigned, firstMoment, lastMoment, TimelineRender.reservationColors, top, wholeWidth, undefined);
  },

  renderEntitlementQuantity: function (timeline_availability, changesForDays, reservationsInGroups, quantity, groupId, topEntitlement, wholeWidth, firstMoment, lastMoment, relevantItemsCount) {

    var mappingAssigned = function (index) {

      if (!changesForDays[index]) {
        return '0';
      }

      var algo = changesForDays[index].algorithm;
      var count = _.size(_.filter(algo, function (a) {
        return a.assignment == groupId;
      }));

      if (quantity < 0) {
        return '0';
      } else if (count > quantity) {
        return quantity;
      } else {
        return count;
      }
    };

    return TimelineRender.renderIndexedQuantitiesSmall('Entitlement ' + groupId, mappingAssigned, firstMoment, lastMoment, TimelineRender.reservationColors, topEntitlement, wholeWidth, 'reserved_' + groupId);
  },

  renderEntitlementQuantities: function (lineHeight, timeline_availability, changesForDays, reservationsInGroups, entitlementQuantities, topEntitlements, wholeWidth, firstMoment, lastMoment, relevantItemsCount) {

    return _.map(entitlementQuantities, function (quantity, groupId) {
      return {
        groupId: groupId,
        quantity: quantity
      };
    }).map(function (v, index) {
      return TimelineRender.renderEntitlementQuantity(timeline_availability, changesForDays, reservationsInGroups, v.quantity, v.groupId, topEntitlements + index * lineHeight, wholeWidth, firstMoment, lastMoment, relevantItemsCount);
    });
  },

  renderEntitlementQuantityLabels: function (lineHeight, timeline_availability, changesForDays, reservationsInGroups, entitlementQuantities, topEntitlements, wholeWidth, firstMoment, lastMoment, relevantItemsCount) {
    return _.map(entitlementQuantities, function (quantity, groupId) {
      return {
        groupId: groupId,
        quantity: quantity
      };
    }).map(function (v, index) {
      return TimelineRender.renderEntitlementQuantityLabel('Entitlement Info ' + v.groupId, timeline_availability, v.groupId, topEntitlements + index * lineHeight, wholeWidth, v.quantity, firstMoment);
    });
  }
};
window.TimelineUtil = {

  isBefore: function (m1, m2) {
    return m1.isBefore(m2, 'day');
  },

  isAfter: function (m1, m2) {
    return m1.isAfter(m2, 'day');
  },

  daysDifference: function (m1, m2) {
    return m1.startOf('day').diff(m2.startOf('day'), 'days');
  },

  numberOfDays: function (firstMoment, lastMoment) {
    return this.daysDifference(lastMoment, firstMoment) + 1;
  },

  offset: function (firstMoment) {
    return this.daysDifference(moment(), firstMoment);
  },

  late: function (r) {
    return r.status == 'signed' && !r.returned_date && TimelineUtil.isBefore(moment(r.end_date), moment());
  },

  reserved: function (r) {
    return TimelineUtil.isAfter(moment(r.start_date), moment()) && r.item_id;
  },

  findUser: function (timeline_availability, user_id) {
    return _.find(timeline_availability.reservation_users, function (ru) {
      return ru.id == user_id;
    });
  },

  username: function (timeline_availability, rr) {
    var u = TimelineUtil.findUser(timeline_availability, rr.user_id);
    var name = u.firstname;
    if (u.lastname) {
      name += ' ' + u.lastname;
    }
    return name;
  },

  inventoryCode: function (timeline_availability, rr) {

    if (!rr.item_id) {
      return null;
    }

    return _.find(timeline_availability.items, function (i) {
      return i.id == rr.item_id;
    }).inventory_code;
  }
};
(function() {
  var humanizeDates;

  humanizeDates = function() {
    return $('[data-humanize-date]').each(function() {
      var $el, md, utcDate;
      $el = $(this);
      utcDate = $el.data('humanizeDate');
      if (!utcDate) {
        return;
      }
      md = moment(new Date(utcDate));
      return $el.text(md.fromNow() + ' (' + md.toISOString() + ')').attr('title', utcDate);
    });
  };

  $(function() {
    return humanizeDates();
  });

}).call(this);
