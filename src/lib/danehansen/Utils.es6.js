"use strict";

//////////////////////////////////////////////////
//author:Dane Hansen/////////////////////////////
//www.danehansen.com////////////////////////////
//version:1.0.0////////////////////////////////
//////////////////////////////////////////////

var Utils={};

(function(){
	if(typeof window=="undefined")
		var window={
			getComputedStyle:function(){},
			location:{href:""}
		};

	function _isList(list)
	{
		return list.length!=undefined;
	}

	Utils.addClass=function(elements, str)
	{
		if(_isList(elements))
		{
			for(var i=0, iLen=elements.length; i<iLen; i++)
			{
				_addClass(elements[i]);
			}
		}
		else
		{
			_addClass(elements);
		}
	}
		function _addClass(element, str)
		{
			var className=element.className;
			if(className.split(" ").indexOf(str)==-1)
				element.className=className+(className.length==0?"":" ")+str;
		}

	Utils.addEventListener=function(elements, evt, handler)
	{
		for(var i=0,iLen=elements.length; i<iLen; i++)
		{
			elements[i].addEventListener(evt, handler);
		}
	}

	Utils.addMouseEnter=function(elements, handler)
	{
		if(_isList(elements))
		{
			for(var i=0, iLen=elements.length; i<iLen; i++)
			{
				_addMouseEnter(elements[i], handler);
			}
		}
		else
		{
			_addMouseEnter(elements, handler);
		}
	}
		var _ON_MOUSE_ENTER_ELEMENTS=[];
		var _ON_MOUSE_ENTER_HANDLERS=[];
		function _addMouseEnter(element, handler)
		{
			var index=_ON_MOUSE_ENTER_ELEMENTS.indexOf(element);
			if(index<0)
			{
				_ON_MOUSE_ENTER_ELEMENTS.push(element);
				index=_ON_MOUSE_ENTER_ELEMENTS.indexOf(element);
			}
			_ON_MOUSE_ENTER_HANDLERS[index]={handler:handler, _handler:Utils.bind(_onMouseEnter, element)};
			element.addEventListener("mouseover",_ON_MOUSE_ENTER_HANDLERS[index]._handler);
		}
		function _onMouseEnter(evt)
		{
			var relTarg=evt.relatedTarget || evt.fromElement;
			if(this.contains(relTarg) || relTarg==this)
				evt.preventDefault();
			else
				_ON_MOUSE_ENTER_HANDLERS[_ON_MOUSE_ENTER_ELEMENTS.indexOf(this)].handler(evt);
		}

	Utils.addMouseLeave=function(elements, handler)
	{
		if(_isList(elements))
		{
			for(var i=0, iLen=elements.length; i<iLen; i++)
			{
				_addMouseLeave(elements[i], handler);
			}
		}
		else
		{
			_addMouseLeave(elements, handler);
		}
	}
		var _ON_MOUSE_LEAVE_ELEMENTS=[];
		var _ON_MOUSE_LEAVE_HANDLERS=[];
		function _addMouseLeave(element, handler)
		{
			var index=_ON_MOUSE_LEAVE_ELEMENTS.indexOf(element);
			if(index<0)
			{
				_ON_MOUSE_LEAVE_ELEMENTS.push(element);
				index=_ON_MOUSE_LEAVE_ELEMENTS.indexOf(element);
			}
			_ON_MOUSE_LEAVE_HANDLERS[index]={handler:handler, _handler:Utils.bind(_onMouseLeave, element)};
			element.addEventListener("mouseout",_ON_MOUSE_LEAVE_HANDLERS[index]._handler);
		}
		function _onMouseLeave(evt)
		{
			var relTarg=evt.relatedTarget || evt.fromElement;
			if(this.contains(relTarg) || relTarg==this)
				evt.preventDefault();
			else
				_ON_MOUSE_LEAVE_HANDLERS[_ON_MOUSE_LEAVE_ELEMENTS.indexOf(this)].handler(evt);
		}

	Utils.autoAlpha=function(elements, num)
	{
		Utils.css(elements,{opacity:num,visibility:num==0?"hidden":"visible"});
	}

	Utils.bind=function(funcs, obj)
	{
		var args=Array.prototype.slice.call(arguments, 1);
		for(var i=0, iLen=funcs.length; i<iLen; i++)
		{
			var str=funcs[i];
			var func=obj[str];
			obj[str]=func.bind.apply(func, args);
		}
	}

	Utils.browser=function()
	{
		if(!_browser)
		{
			var ua=navigator.userAgent,
				msie=/(msie|trident)/i.test(ua),
				chrome=/chrome|crios/i.test(ua),
				phantom=/phantom/i.test(ua),
				safari=/safari/i.test(ua) && !chrome && !phantom,
				firefox=/firefox/i.test(ua),
				android=/android/i.test(ua),
				ios=/(ipod|iphone|ipad)/i.test(ua),
				tablet=/tablet/i.test(ua),
				mobile=tablet || android || ios,
				phone=!tablet && /[^-]mobi/i.test(ua);
			if(chrome)
			{
				_browser=
				{
					name:"chrome",
					version:parseFloat(ua.match(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)[1]),
					webkit:true,
					prefix:"webkit"
				}
			}
			else if(firefox)
			{
				_browser=
				{
					name:"firefox",
					version:parseFloat(ua.match(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)[1]),
					webkit:false,
					prefix:"moz"
				}
			}
			else if(safari)
			{
				_browser=
				{
					name:"safari",
					version:parseFloat(ua.match(/version\/(\d+(\.\d+)?)/i)[2]),
					webkit:true,
					prefix:"webkit"
				}
			}
			else if(msie)
			{
				_browser=
				{
					name:"msie",
					version:parseFloat(ua.match(/(?:msie |rv:)(\d+(\.\d+)?)/i)[2]),
					webkit:false,
					prefix:"ms"
				}
			}
			else
			{
				_browser=
				{
					name:"",
					version:0,
					webkit:false,
					prefix:""
				}
			}
		}
		_browser.android=android;
		_browser.ios=ios;
		_browser.tablet=tablet;
		_browser.mobile=mobile;
		_browser.phone=phone;
		return _browser;
	}
		var _browser;

	Utils.compare=function(a, b)
	{
		if(a && b)
		{
			var props=Object.getOwnPropertyNames(a);
			var bProps=Object.getOwnPropertyNames(b);
			for(var i=0, iLen=bProps.length; i<iLen; i++)
			{
				var prop=bProps[i];
				if(props.indexOf(prop)<0)
					props.push(prop);
			}
			for(i=0, iLen=props.length; i<iLen; i++)
			{
				prop=props[i]
				var aVal=a[prop];
				var bVal=b[prop];
				var aType=typeof aVal;
				var bType=typeof bVal;
				if(aType=="object" && bType=="object")
				{
					var equal=compare(aVal, bVal);
					if(!equal)
						return false;
				}
				else if(aType!=bType || aVal!=bVal)
				{
					return false;
				}
			}
			return true;
		}
		else if(typeof a==typeof b && a==b)
		{
			return true;
		}
		return false;
	}

	Utils.css=function(elements, props)
	{
		if(_isList(elements))
		{
			for(var i=0, iLen=elements.length; i<iLen; i++)
			{
				_css(elements[i], props);
			}
		}
		else
		{
			_css(elements, props);
		}
	}
		var _propStorage={};
		function _css(element, props)
		{
			var style=element.style;
			for(var j in props)
			{
				if(_propsStorage[j])
				{
					style[_propsStorage[j]]=props[j];
				}
				else
				{
					style[j]=props[j];
					if(style[j])
					{
						_propsStorage[j]=j;
					}
					else
					{
						j=Utils.browser().prefix+j.replace(/\b[a-z]/,  _captitalize);
						style[j]=props[j];
						_propsStorage[j]=j;
					}
				}
			}
		}
		function _captitalize(str)
		{
			return str.toUpperCase();
		}

	Utils.duplicate=function(obj)
	{
		return Utils.merge({}, obj, true);
	}

	Utils.getStyle=function(element, property)
	{
		var style=element.style[property];
		if(style!="")
			return style;
		else
			return window.getComputedStyle(element)[property];
	}

	Utils.getURLVars=function()
	{
		var vars={};
		var parts=window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value){vars[key]=value;});
		return vars;
	}

	Utils.hasClass=function(elements, str)
	{
		if(_isList(elements))
		{
			for(var i=0, iLen=elements.length; i<iLen; i++)
			{
				if(_hasClass(elements[i], str))
					return true;
			}
			return false;
		}
		else
		{
			return _hasClass(elements, str);
		}
	}
		function _hasClass(element, str)
		{
			if(element.className.split(" ").indexOf(str)>=0)
				return true;
			return false;
		}

	Utils.loadBigImages=function(parent)
	{
		if(!parent)
			parent=document;
		var elements=Array.prototype.slice.call(parent.querySelectorAll("*[data-background-image]"), 0);
		if(parent!=document && (parent.hasAttribute("data-background-image") || parent.hasAttribute("data-src")))
			elements.push(parent);
		for(var i=0, iLen=elements.length; i<iLen; i++)
		{
			var element=elements[i];
			element.style.backgroundImage="url("+element.getAttribute("data-background-image")+")";
			element.removeAttribute("data-background-image");
		}
		elements=parent.querySelectorAll("img[data-src]");
		for(i=0, iLen=elements.length; i<iLen; i++)
		{
			element=elements[i];
			element.setAttribute("src", element.getAttribute("data-src"));
			element.removeAttribute("data-src");
		}
	}

	Utils.merge=function(newObj, oldObj, copy)
	{
		var result=copy?oldObj.constructor():oldObj;
		if(copy)
		{
			Utils.merge(oldObj, result);
			Utils.merge(newObj, result);
		}
		else
		{
			for(var i in newObj)
			{
				var newProp=newObj[i];
				var type=typeof newProp;
				if(type=="object" && newProp!=null)
				{
					if(!result[i])
						result[i]=newProp.constructor();
					if(result[i])
						Utils.merge(newProp, result[i]);
				}
				else
				{
					result[i]=newProp;
				}
			}
		}
		return result;
	}

	Utils.removeClass=function(elements, str)
	{
		if(_isList(elements))
		{
			for(var i=0, iLen=elements.length; i<iLen; i++)
			{
				_removeClass(elements[i], str);
			}
		}
		else
		{
			_removeClass(elements, str);
		}
	}
		function _removeClass(element, str)
		{
			var className=element.className;
			var split=className.split(" ");
			var index=split.indexOf(str);
			if(index>=0)
			{
				split.splice(index,1);
				element.className=split.join(" ");
			}
		}

	Utils.removeEventListener=function(elements, event, handler)
	{
		for(var i=0,iLen=elements.length; i<iLen; i++)
		{
			elements[i].removeEventListener(event,handler);
		}
	}

	Utils.removeMouseEnter=function(elements)
	{
		if(_isList(elements))
		{
			for(var i=0, iLen=elements.length; i<iLen; i++)
			{
				_removeMouseEnter(elements[i]);
			}
		}
		else
		{
			_removeMouseEnter(elements);
		}
	}
		function _removeMouseEnter(element)
		{
			var index=_ON_MOUSE_ENTER_ELEMENTS.indexOf(element)
			if(index>=0)
			{
				element.removeEventListener("mouseover", _ON_MOUSE_ENTER_HANDLERS[index]._handler);
				_ON_MOUSE_ENTER_ELEMENTS.splice(index, 1);
				_ON_MOUSE_ENTER_HANDLERS.splice(index, 1);
			}
		}

	Utils.removeMouseLeave=function(elements)
	{
		if(_isList(elements))
		{
			for(var i=0, iLen=elements.length; i<iLen; i++)
			{
				_removeMouseLeave(elements[i]);
			}
		}
		else
		{
			_removeMouseLeave(elements);
		}
	}
		function _removeMouseLeave(element)
		{
			var index=_ON_MOUSE_LEAVE_ELEMENTS.indexOf(element)
			if(index>=0)
			{
				element.removeEventListener("mouseout", _ON_MOUSE_LEAVE_HANDLERS[index]._handler);
				_ON_MOUSE_LEAVE_ELEMENTS.splice(index, 1);
				_ON_MOUSE_LEAVE_HANDLERS.splice(index, 1);
			}
		}

	Utils.touch=function()
	{
		if(_touch==null)
			_touch="ontouchstart" in window;
		return _touch;
	}
		var _touch;
})();

export default Utils;