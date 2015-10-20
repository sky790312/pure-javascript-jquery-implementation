/* =========================================================
 * pure javascript implementation - jquery - support all browser => created by kevin hu
 * ========================================================= */

(function(global) {
  var myLibrary = function(selector, container) {
  	// implement every time
    return new myLibrary.method.init(selector, container);
  };

  // common method
  var utils = {
    trim: function(text) {
	    return (text || '').replace( /^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');
    },
    isArray: function(obj) {
	    return Object.prototype.toString.call(obj) === '[object Array]';
    },
    isFunction: function(obj) {
	    return Object.prototype.toString.call(obj) === '[object Function]';
    },
    each: function(obj, callback) {
      var length = obj.length,
          isObj = (length === undefined) || this.isFunction(obj);
      if (isObj) {
				for(var name in obj) {
					if(callback.call(obj[name], obj[name], name) === false ) {
						break;
					}
				}
			}else {
				for(var i = 0, value = obj[0];
					i < length && callback.call(obj[i], value, i) !== false; value = obj[++i] ) {}
			}
      return obj;
    },
    makeArray: function(arrayLike) {
			if(arrayLike.length != null) {
        return Array.prototype.slice.call(arrayLike, 0)
              	.filter(function(ele) { return ele !== undefined; });
			}
      return [];
		}
  };

  // deal with Event
  myLibrary.Event = function(original) {
      if(!this.stopPropagation) {
        return new myLibrary.Event(original);
      }
      // stantard
      this.original = original;
      this.type = original.type;
      this.target = original.target || original.srcElement;
  };

  myLibrary.Event.prototype = {
    stopPropagation: function() {
      // stantard
      if(this.original.stopPropagation) {
        this.original.stopPropagation();
      }else {
        this.original.cancelBubble = true;
      }
    }
  };

  // stantard
  if(document.addEventListener) {
    utils.bind = function(element, eventType, handler) {
      element.addEventListener(eventType, function(event) {
      	console.log(handler)
        var result = handler.call(event.currentTarget, myLibrary.Event(event));
        if(result === false) {
          event.preventDefault();
        }
        return result;
      }, false);
    };
    utils.unbind = function(element, eventType, handler) {
      element.removeEventListener(eventType, handler, false);
    };
  }else if(document.attachEvent) {
    utils.bind = function(element, eventType, handler) {
      element.attachEvent('on' + eventType, function() {
        var result = handler.call(element, myLibrary.Event(window.event));
        if(result === false) {
          window.event.returnValue = false;
        }
        return result;
      });
    };
    utils.unbind = function(element, eventType, handler) {
      element.detachEvent(eventType, handler);
    };
  }

  // extend common method to myLibrary
  function extend(target, source) {
    utils.each(source, function(value, key) {
        target[key] = value;
    });
  }

  extend(myLibrary, utils);

  // extend method also add to myLibrary
  myLibrary.extend = extend;
  // standard name
  myLibrary.props = {
    'for': 'htmlFor',
    'class': 'className',
    readonly: 'readOnly',
    maxlength: 'maxLength',
    cellspacing: 'cellSpacing',
    rowspan: 'rowSpan',
    colspan: 'colSpan',
    tabindex: 'tabIndex',
    usemap: 'useMap',
    frameborder: 'frameBorder'
  };

  myLibrary.method = myLibrary.prototype = {
    init: function(selector, container) {
      // 選取的 element
			if(selector.nodeType) {
			  this[0] = selector;
			  this.length = 1;
			  return this;
			}

			if(container && container[0]) {
			  container = container[0];
			} else {
			  container = document;
			}

			var elements = [];
			// 可選取 multiple element by ','
			myLibrary.each(selector.split(','), function(text) {
			  text = myLibrary.trim(text);
			  // myLibrary('#xxx') -> id
			  if(text.charAt(0) === '#') {
			    elements.push(container.getElementById(text.substring(1)));
			  // myLibrary('<') -> html tag
			  } else if(text.charAt(0) === '<') {
			    elements.push(document.createElement(text.substring(1, text.length - 1)));
			  } else {
			    myLibrary.each(container.getElementsByTagName(text), function(element) {
			      elements.push(element);
			    });
			   }
			});

			// bound element to this
			myLibrary.extend(this, elements);
			this.length = elements.length;
    },
    size: function() {
		  return this.length;
		},
		isEmpty: function() {
		  return this.length === 0;
		},
		each: function(callback) {
		  return myLibrary.each(this, callback);
		},
		html: function(value) {
		  if(value === undefined) {
		    return this[0] && this[0].nodeType === 1 ? this[0].innerHTML : null;
		  } else {
		    return myLibrary.each(this, function(element) {
		      if(element.nodeType === 1) {
		        element.innerHTML = value;
		      }
		    });
		  }
		},
		attr: function(name, value) {
		  // convert to use
		  name = myLibrary.props[name] || name;
		  if(value === undefined) {
		    return this[0] && this[0].nodeType !== 3 && this[0].nodeType !== 8 ? this[0][name] : undefined;
		  }
		  else {
		    return myLibrary.each(this, function(element) {
		      if(element.nodeType !== 3 && element.nodeType !== 8) {
		        element[name] = value;
		      }
		    });
		  }
		},
		val: function(value) {
			// 目前只處理 <input> 元素
			if(value === undefined) {
				return this[0] && this[0].nodeName === 'INPUT' ? this[0].value : null;
			}
			else {
			  return myLibrary.each(this, function(element) {
			    if(element.nodeName === 'INPUT') {
			      element.value = value;
			    }
			  });
			}
		},
		append: function(childs) {
		  if(typeof childs === 'string' || childs.nodeType) {
		    childs = myLibrary(childs);
		  }
			// 只有一個父節點
		  if(this.length === 1) {
		    var parent = this[0];
		    myLibrary.each(childs, function(child) {
		      parent.appendChild(child);
		    });
			// 有多個父節點
			}else if(this.length > 1){
			  myLibrary.each(this, function(parent) {
		      childs.each(function(child) {
						// 複製子節點
						var container = document.createElement('div');
						container.appendChild(child);
						container.innerHTML = container.innerHTML;
						parent.appendChild(container.firstChild);
		      });
			  });
			}
			return this;
    },
		appendTo: function(parents) {
			if(typeof parents === 'string' || parents.nodeType) {
				parents = myLibrary(parents);
			}
			return parents.append(this);
		},
		remove: function() {
			return myLibrary.each(this, function(element) {
				element.parentNode.removeChild(element);
			});
		},
		bind: function(eventType, handler) {
			return myLibrary.each(this, function(element) {
				myLibrary.bind(element, eventType, handler);
			});
		},
		unbind: function(eventType, handler) {
			return myLibrary.each(this, function(element) {
				myLibrary.unbind(element, eventType, handler);
			});
		},
		click: function(handler) {
			return this.bind('click', handler);
		}
	};

	// myLibrary.method, myLibrary.prototype 參考同一物件, 之後 myLibrary.method.init.prototype 再參考 myLibrary.method
  myLibrary.method.init.prototype = myLibrary.method;

  global.myLibrary = myLibrary;
})(this);