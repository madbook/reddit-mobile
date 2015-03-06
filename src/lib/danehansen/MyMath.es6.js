"use strict";

//////////////////////////////////////////////////
//author:Dane Hansen/////////////////////////////
//www.danehansen.com////////////////////////////
//version:1.0.0////////////////////////////////
//////////////////////////////////////////////

var MyMath={};

(function(){
  MyMath.average=function()
  {
    if(typeof arguments[0]=="number")
      var list=arguments;
    else
      list=arguments[0];
    var num=0;
    for(var i=0; i<list.length; i++)
    {
      num+=list[i];
    }
    return num/list.length;
  }

  MyMath.ceil=function(num, increment)
  {
    increment=typeof increment!=='undefined'?increment:1;
    var goesInto=num/increment;
    return increment*Math.ceil(goesInto);
  }

  MyMath.circleIntersection=function(p1, r1, p2, r2)
  {
    var dx=p2.x-p1.x;
    var dy=p2.y-p1.y;
    var d=Math.sqrt((dy*dy)+(dx*dx));
    if(d>(r1+r2) || d<Math.abs(r1-r2))
      return false;
    var a=((r1*r1)-(r2*r2)+(d*d))/(2*d);
    var x2=p1.x+(dx*a/d);
    var y2=p1.y+(dy*a/d);
    var h=Math.sqrt((r1*r1)-(a*a));
    var rx=-dy*(h/d);
    var ry=dx*(h/d);
    return [{x:x2+rx, y:y2+ry}, {x:x2-rx, y:y2-ry}];
  }

  var _COVER_ELEMENTS=[];
  var _COVER_ASPECTS=[];
  MyMath.cover=function(content, frame)
  {
    content=content[0]?content[0]:content;
    frame=frame[0]?frame[0]:frame;
    var index=_COVER_ELEMENTS.indexOf(content);
    if(index<0)
    {
      _COVER_ELEMENTS.push(content);
      _COVER_ASPECTS.push(content.offsetWidth/content.offsetHeight);
      index=_COVER_ELEMENTS.indexOf(content);
    }
    var contentRatio=_COVER_ASPECTS[index];
    var frameWidth=frame.offsetWidth;
    var frameHeight=frame.offsetHeight;
    var frameRatio=frameWidth/frameHeight;
    if(frameRatio)
    {
      var style=content.style;
      if(contentRatio>frameRatio)
      {
        var newWidth=frameHeight*contentRatio;
        style.width=newWidth+"px";
        style.height=frameHeight+"px";
        style.left=-(newWidth-frameWidth)/2+"px";
        style.top=0;
      }
      else
      {
        var newHeight=frameWidth/contentRatio;
        style.width=frameWidth+"px";
        style.height=newHeight+"px";
        style.left=0;
        style.top=-(newHeight-frameHeight)/2+"px";
      }
    }
    else
    {
      setTimeout(function(){MyMath.cover(content,frame);},1);
    }
  }

  MyMath.ease=function(targOrNum, propOrDest, destOrSpeed, speed)
  {
    var defaultSpeed=0.05;
    if(typeof targOrNum=="number")
      return targOrNum+=(propOrDest-targOrNum)*(destOrSpeed||defaultSpeed);
    else
      targOrNum[propOrDest]+=(destOrSpeed-targOrNum[propOrDest])*(speed||defaultSpeed);
  }

  var _VELOCITY_VICTIMS=[];
  MyMath.velocityEase=function(targ, prop, dest, speed, decay)
  {
    if(typeof speed!="number")
      speed=0.5;
    if(typeof decay!="number")
      decay=0.9;
    for(var i=0, iLen=_VELOCITY_VICTIMS.length; i<iLen; i++)
    {
      var item=_VELOCITY_VICTIMS[i];
      if(item.targ==targ)
        break;
    }
    if(!item)
    {
      item={targ:targ};
      _VELOCITY_VICTIMS.push(item);
    }
    if(typeof item[prop]!="number")
      item[prop]=0;
    item[prop]+=(dest-targ[prop])*speed;
    item[prop]*=decay;
    targ[prop]+=item[prop];
    return item[prop];
  }

  MyMath.floor=function(num, increment)
  {
    increment=typeof increment!=='undefined'?increment:1;
    var goesInto=num/increment;
    return increment*Math.floor(goesInto);
  }

  MyMath.indexOf=function(list, value)
  {
    var index=-1;
    for(var i=0; i<list.length; i++)
    {
      if(list[i]==value)
        index=i;
    }
    return index;
  }

  MyMath.intLength=function(num)
  {
    var len=Math.ceil(Math.log(Math.abs(num)) / Math.LN10);
    if(!(num%10))
      len++;
    return len;
  }

  MyMath.luhn=function(num)
  {
    var check;
    var even=true;
    var total=0;
    while(num>1)
    {
      var d=num%10;
      num=(num-d)/10;
      if(check===undefined)
      {
        check=d;
      }
      else
      {
        if(!even)
        {
          d*=2;
          if(d>9)
            d-=9;
        }
        total+=d;
      }
      even=!even;
    }
    var numCheck=(10-total%10)%10;
    return check==numCheck;
  }

  MyMath.modulo=function(num, limit)
  {
    var mod=num%limit;
    if(num>=0)
      return mod;
    else if(mod<0)
      return (mod+limit)%limit;
    else
      return 0;
  }

  MyMath.primes=function(limit)
  {
    var uints=[];
    for(var i=2; i<=limit; i++)
      uints.push(i);
    for(i=2; i<=limit; i++)
    {
      for(var j=0; j<uints.length; j++)
      {
        if(uints[j]%i==0 && uints[j]!=i)
          uints.splice(j,1);
      }
    }
    return uints;
  }

  MyMath.random=function(firstNum, secondNum, round, natural)
  {
    secondNum = typeof secondNum !== 'undefined' ? secondNum : 0;
    round = typeof round !== 'undefined' ? round : false;
    natural = typeof natural !== 'undefined' ? natural : 1;
    var total=0;
    if(!round)
    {
      for(var i=0; i<natural; i++)
      {
        total+=Math.random()*((secondNum-firstNum)/natural);
      }
      return firstNum+total;
    }
    else
    {
      var num;
      if(secondNum>firstNum)
      {
        num=secondNum;
        secondNum=firstNum;
        firstNum=num;
      }
      for(i=0; i<natural; i++)
      {
        total+=Math.random()*((firstNum+1-secondNum)/natural);
      }
      return Math.floor(secondNum+total);
    }
  }

  MyMath.randomChoice=function(list, natural)
  {
    list=typeof list!=='undefined'?list:[-1,1];
    natural=typeof natural!=='undefined'?natural:1;
    return list[MyMath.random(0,list.length-1,true,natural)];
  }

  MyMath.randomPointInCircle=function(center, radius)
  {
    var random={};
    do
    {
      random.x=MyMath.random(center.x-radius, center.x+radius);
      random.y=MyMath.random(center.y-radius, center.y+radius);
    }
    while(Point.distance(random, center)>radius)
    return random;
  }

  MyMath.relativePercentage=function(bottomEnd, topEnd, current)
  {
     return (current-bottomEnd)/(topEnd-bottomEnd);
  }

  MyMath.round=function(num, increment)
  {
    increment=typeof increment!=='undefined'?increment:1;
    var goesInto=num/increment;
    var lower=increment*Math.floor(goesInto);
    var higher=increment*Math.ceil(goesInto);
    if(Math.abs(num-lower)<Math.abs(num-higher))
      return lower;
    else
      return higher;
  }

  MyMath.shuffle=function(list, duplicate)
  {
    var length=list.length;
    if(duplicate)
      var shuffledArray=Array.prototype.slice.call(list, 0, length);
    else
      var shuffledArray=list;
    for (var i=0; i<length; i++)
    {
      var randomIndex=Math.floor(Math.random()*(length-i));
      var dest=shuffledArray[length-1-i];
      shuffledArray[length-1-i]=shuffledArray[randomIndex];
      shuffledArray[randomIndex]=dest;
    }
    return shuffledArray;
  }

  MyMath.sortAscending=function(a,b)
  {
    return a>b?1:a<b?-1:0;
  }

  MyMath.sortDescending=function(a,b)
  {
    return a>b?-1:a<b?1:0;
  }

  MyMath.splitUint=function(num)
  {
    var l=MyMath.intLength(num);
    var split=[];
    for(var i=0; i<l; i++)
    {
      var d=num%10;
      split.push(d);
      num=(num-d)/10;
    }
    return split.reverse();
  }

  MyMath.toDegrees=function(targ, offset)
  {
    offset = typeof offset !== 'undefined' ? offset : false;
    if(offset)
      return (-targ+Math.PI/2) * 180/Math.PI;
    else
      return -targ * 180/Math.PI;
  }

  MyMath.toRadians=function(targ, offset)
  {
    offset = typeof offset !== 'undefined' ? offset : false;
    if(offset)
      return (-targ-90) * Math.PI/180;
    else
      return -targ * Math.PI/180;
  }

  MyMath.total=function(list)
  {
    var sum=0;
    for(var i=0; i<list.length; i++)
    {
      if(typeof list[i]=="number")
      {
        sum+=list[i];
      }
      else if(typeof list[i]=="boolean")
      {
        if(list[i])
          sum++;
      }
    }
    return sum;
  }
})();

export default MyMath;