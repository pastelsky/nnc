

if (Meteor.isClient) {

  Template.body.helpers({

    'timeCount' : function(){
      return Session.get('timeCounter');
    },
    'pointCount' : function(){
      return Session.get('pointsInNumber');
    },
    'depthCount' : function(){
      return Session.get('depthCount');
    },
    'cDone' : function(){
      return Session.get('calcDone');
    },
    'depthCount' : function(){
      return Session.get('treeDepth');
    },
    'hideControls' : function(){
      return ( Session.get('pointsInNumber') > 0);
    }
  });

  Template.body.events({

    'click #clearCanvas' : function(){

      document.getElementById('svg-canvas').textContent = '';
      Session.set('calcDone', false);


      pointArray.length = 0;
      clusterArray.length = 0;
      pathArray.length = 0;
      clusterStack.length = 0;
      Session.set('pointsInNumber', 0);


      $.notify("All clear!",  {
        autoHideDelay: 1500,
        globalPosition: 'bottom right',
        className: 'warning',

      });

    },

    'click #startCluster' : function(){

      window.startClustering();
    },

    'change #clusterDOM' : function(){

      var depth = parseInt($('#clusterDOM').val());

      Session.set('treeDepth', depth);

      var selString= "#svg-canvas ";

      $('.cluster-bound').remove();

      while(--depth > 0){
        selString += ">g ";
      }

      console.log("Selstring is : " + selString);
      $(selString).each(function(){

        var curCluster = Snap.select('#' + $(this).attr('id'));

        var bound = s.rect( curCluster.getBBox().x + curCluster.getBBox().height/2, curCluster.getBBox().y + curCluster.getBBox().width/2, 0, 0, 10, 10);

        bound.attr({
          class : 'cluster-bound',
          opacity:0
        });

        bound.animate({
          x:curCluster.getBBox().x -10,
          y:curCluster.getBBox().y -10,
          width:curCluster.getBBox().width + 20,
          height:curCluster.getBBox().height + 20,
          opacity:1
        }, 300);


      });

    }


  });

Template.body.rendered = function () {

  window.s = Snap('#svg-canvas');

  $('#svg-canvas').click(function(e){

    if($(e.target).attr('class') == 's-point')
      return false;

    addPoint(e.clientX - $('#svg-canvas').offset().left, e.clientY - $('#svg-canvas').offset().top);

    });//click svg canvas


  var canvasWidth = $('#svg-canvas').width();
  var canvasHeight = $('#svg-canvas').height();
  $('#addRandom').click(function(){
    var randX = Math.floor(Math.random()*( canvasWidth-40+1) + 20);
    var randY = Math.floor(Math.random()*( canvasHeight-40+1) + 20);

    addPoint(randX, randY, true);
  });

  $('#add10Random').click(function(){
    for(var i =0; i < 10; i++)
    {
      var randX = Math.floor(Math.random()*( canvasWidth-40+1) + 20);
      var randY = Math.floor(Math.random()*( canvasHeight-40+1) + 20);

      addPoint(randX, randY, false);
    }
  });


    /***********
    shortcuts
    ***********/

    $('html').on('keypress', function(e){


      //Undo - U
      if(e.keyCode == 117 || e.keyCode == 85)
        $('#undo').trigger('click');



    //clear canvas
    else if(e.keyCode == 99 || e.keyCode == 67){
      $('#clearCanvas').trigger('click')
    }

    //add Random point
    else if(e.keyCode == 65 || e.keyCode == 97){
      $('#addRandom').trigger('click')
    }

    //start Clustering
    else if(e.keyCode == 83 || e.keyCode == 115){
      $('#startCluster').trigger('click');
    }

  }); //keypress

  };//redenred
}//isclient

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
