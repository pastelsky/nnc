window.clusterArray =[];
window.pointArray =[];

window.pathArray =[];
window.clusterStack= [];

Session.setDefault('pointsInNumber', 0);
Session.setDefault('depthCounter', 0);
Session.set('calcDone', false);
Session.set('treeDepth', 2);


window.s;


window.calcDistanceArray = function(src)
{
  var distanceArray = {};

  for(var i=0; i < pointArray.length; i++){
    var dist = distanceCalc(src, pointArray[i]);

    distanceArray[ pointArray[i].id ] = dist;
    pointArray[i].distanceArray[src.id] = dist;
  }

  return distanceArray;

}

window.addPoint = function addPoint(x, y, showNotif){
  var c = s.circle(x, y, 10);
  c.attr({
    class: "s-point",
    strokeWidth:2,
    id:c.id,

  });

  c.animate({
    r:5
  }, 300, mina.easein);

  var g = s.group(c);
  g.attr({
    id: g.id,
    class :"point-wrapper"
  });

  var title = s.el('title');
  title.node.textContent ='(' + x + ', ' + y + ')\nID:' + c.id + '\nCID:' + g.id;

  c.append(title);

  clusterArray.push(g);
  pointArray.push(c);

  c.distanceArray ={};
  c.clusterID = g.id;
  c.distanceArray = calcDistanceArray(c);

  Session.set('pointsInNumber', Session.get('pointsInNumber') + 1);


  if(showNotif)
    $.notify("Added new point at: " + Math.round(x) + "," + Math.round(y),  {
      autoHideDelay: 2000,
      globalPosition: 'bottom right',
      className: 'success',
    });

};

window.addPath = function(pID, qID){

  p1 = Snap.select("#" + pID);
  p2 = Snap.select("#" + qID);
  var dArray, sOpacity, sWidth;

  var x1 = Math.round(p1.getBBox().cx * 100) / 100;
  var y1 = Math.round(p1.getBBox().cy * 100) / 100;
  var x2 = Math.round(p2.getBBox().cx * 100) / 100;
  var y2 = Math.round(p2.getBBox().cy * 100) / 100;


  var pathString = "M" + x1 + "," + y1;
  pathString += "L" + x2 + "," + y2;

  var p = window.s.path(pathString);

  p.sPoint = p1;
  p.dPoint = p2;

  var length = p.getTotalLength();


  p.attr({

    strokeDasharray :dArray || (length + ' ' + length),
    strokeDashoffset : length,
    strokeOpacity : 0.7,
    class: "s-line"
  });

  p2.animate({
    r:14,

  }, 500, mina.easeout, function(){

    p2.animate({

      r:5,
    }, 500);

  });

  p.animate({

    strokeDashoffset:0

  }, 700, mina.easeout, function(){

    p.animate({

      strokeOpacity:1,
      strokeWidth: 2

    }, 500);

  });



  pathArray.push(p);
}


window.log = function log(msg, color){
  color = color || "black";
  bgc = "White";
  switch (color) {
    case "success":  color = "#5ED72D";      bgc = "#EEFEE5";       break;
    case "info":     color = "DodgerBlue"; bgc = "Turquoise";       break;
    case "error":    color = "Red";        bgc = "#FCE7DE";           break;
    case "start":    color = "OliveDrab";  bgc = "PaleGreen";       break;
    case "warning":  color = "#F4AA29";     bgc = "#FFFEF4";           break;
    case "end":      color = "Orchid";     bgc = "MediumVioletRed"; break;
    default: color = color;
  }
  if(color == 'heading')
    console.log("%c" + ( "\n" + msg + "\n--------------------------------------\n"), "color:#252525;font-weight:bold; font-size:0.7rem; background-color:'#C2C2C2';");

  else if (typeof msg == "object"){
    console.log(msg);
  } else if (typeof color == "object"){
    console.log("%c" + msg, "color: PowderBlue;font-weight:bold; background-color: RoyalBlue;");
    console.log(color);
  } else {
    console.log("%c" + msg, "color:" + color + ";font-weight:bold; background-color: " + bgc + "; padding:2px 12px; margin-left:-10px");
  }
}




