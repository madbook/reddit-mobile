"use strict";

//////////////////////////////////////////////////
// author: Dane Hansen //////////////////////////
// www.danehansen.com //////////////////////////
// version: 1.0.0 /////////////////////////////
//////////////////////////////////////////////

(function(){
  function Point(x, y)
  {
    this.x = x || 0;
    this.y = y || 0;
  }

  Point.prototype.add = function(point)
  {
    this.x += point.x;
    this.y += point.y;
  }

  Point.prototype.angle = function()
  {
    return Math.atan2(this.y, this.x);
    return Math.atan2(this.y, this.x);
  }

  Point.prototype.clone = function()
  {
    return new Point(this.x, this.y);
  }

  Point.prototype.copyFrom = function(point)
  {
    this.x = point.x;
    this.y = point.y;
  }

  Point.distance = function(point1, point2)
  {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
  }

  Point.prototype.equals = function(point)
  {
    return this.x == point.x && this.y == point.y;
  }

  Point.interpolate = function(point1, point2, amount)
  {
    return new Point(point1.x + (point2.x - point1.x) * amount, point1.y + (point2.y - point1.y) * amount);
  }

  Point.intersection = function(aStart, aEnd, bStart, bEnd)
  {
    var x1 = aStart.x;
    var y1 = aStart.y;
    var x2 = aEnd.x;
    var y2 = aEnd.y;
    var x3 = bStart.x;
    var y3 = bStart.y;
    var x4 = bEnd.x;
    var y4 = bEnd.y;
    var a = x1 - x2;
    var b = y3 - y4;
    var c = y1 - y2;
    var d = x3 - x4;
    var e = a * b - c * d;
    if(e == 0)
      return null;
    var f = x1 * y2 - y1 * x2;
    var g = x3 * y4 - y3 * x4;
    return new Point((f * d - a * g) / e, (f * b - c * g) / e);
  }

  Point.prototype.length = function()
  {
    return Point.distance(this, new Point());
  }

  Point.prototype.normalize = function(thickness)
  {
    var ratio = thickness/this.length();
    this.x *= ratio;
    this.y *= ratio;
  }

  Point.prototype.offset = function(x, y)
  {
    this.x += x;
    this.y += y;
  }

  Point.polar = function(len, angle)
  {
    return new Point(Math.cos(angle) * len, Math.sin(angle) * len);
  }

  Point.relativePosition = function(evt, relativeTo)
  {
    relativeTo = relativeTo?relativeTo:evt.currentTarget;
    return new Point(evt.clientX - relativeTo.getBoundingClientRect().left, evt.clientY - relativeTo.getBoundingClientRect().top);
  }

  Point.prototype.setTo = function(x, y)
  {
    this.x = x;
    this.y = y;
  }

  Point.prototype.subtract = function(point)
  {
    this.x -= point.x;
    this.y -= point.y;
  }

  Point.prototype.toString = function()
  {
    return "{x: " + this.x + ", y: " + this.y+"}";
  }

  Point.deviceOrientation = function(evt, ref)
  {
    var gamma = evt.gamma;
    if(gamma)
    {
      if(!ref)
        ref = evt;
      var orientation = window.orientation;
      gamma -= ref.gamma;
      if(gamma <- 180)
        gamma += 360;
      gamma = _unadjust(gamma);
      gamma /= 90;
      var beta = _adjustBeta(evt);
      var refBeta = _adjustBeta(ref);
      beta -= refBeta;
      if(beta < -180)
        beta += 360;
      beta = _unadjust(beta);
      beta /= 90;
      var alpha = evt.alpha - ref.alpha;
      if(alpha < 0)
        alpha += 360;
      alpha = (alpha + orientation) / 90;
      if(alpha < 2)
      {
        if(alpha > 1)
          alpha = 2 - alpha;
        alpha *= -1;
      }
      else
      {
        if(alpha < 3)
          alpha -= 2;
        else
          alpha = 4 - alpha;
      }
      if(Math.abs(orientation) == 90)
      {
        var a = gamma;
        gamma = beta;
        beta = a;
      }
      if(orientation < 0)
      {
        gamma = -gamma;
        beta = -beta;
      }
      return {x:gamma, y:beta, z:alpha};
    }
  }

  function _adjustBeta(evt)
  {
    var beta = evt.beta;
    var gamma = evt.gamma;
    if(gamma > 90)
      beta = 180 - beta;
    else if(gamma < -90)
      beta = -180 - beta;
    return beta;
  }

  function _unadjust(num)
  {
    if(num > 90)
      num = 180 - num;
    else if(num < -90)
      num = -180 - num;
    return num;
  }

  if(typeof module != "undefined")
    module.exports = Point;
  else if(typeof window != "undefined")
    window.Point = Point;
})();