	window.distanceCalc = function(p1, p2){

		var xDiff = p1.getBBox().x - p2.getBBox().x;
		var yDiff = p1.getBBox().y - p2.getBBox().y;

		return Math.sqrt( Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

	};


// 	window.findNearest = function(source){

// 		var minPoint; 
// 		var minDistance = Number.POSITIVE_INFINITY;


// 		for(var i =0; i < clusterArray.length; i++){

// 			if( distanceCalc(source, clusterArray[i]) < minDistance && source != clusterArray[i])
// 			{
// 				minDistance = distanceCalc(source, clusterArray[i]);
// 				minPoint = clusterArray[i];
// 			}

// 		}

// 		console.log('closest is ' + minPoint + " at distance" + minDistance);

// 		return minPoint;


// 	// //Sort according to X distance

// 	// var sortedclusterArray = clusterArray.sort(function(a,b){

// 	// 	if(a.getBBox().x < b.getBBox().x)
// 	// 		return -1;

// 	// 	if(a.getBBox().x > b.getBBox().x)
// 	// 		return 1;

// 	// 	return 0;
// 	// });


// 	// //Split into two parts, 0 to n/2, n/2+1 to n

// 	// var tempA = sortedclusterArray.slice(0, sortedclusterArray.length/2);
// 	// var tempB = sortedclusterArray.slice(sortedclusterArray.length/2);


// };


// window.drawLine = function(p1, p2){

// 	var x1 = Math.round(p1.getBBox().x * 100) / 100 + 5;
// 	var y1 = Math.round(p1.getBBox().y * 100) / 100 + 5;
// 	var x2 = Math.round(p2.getBBox().x * 100) / 100 + 5;
// 	var y2 = Math.round(p2.getBBox().y * 100) / 100 + 5;


// 	var pathString = "M" + x1 + "," + y1;
// 	pathString += "L" + x2 + "," + y2;

// 	var p = window.s.path(pathString);

// 	var length = p.getTotalLength();


// 	p.attr({
// 		stroke: "#3C1775",
// 		strokeWidth: 2,
// 		strokeDasharray :length + ' ' + length,
// 		strokeDashoffset : length,
// 		strokeOpacity : 0.5,
// 		class: "s-line"
// 	});


// 	p.animate({

// 		strokeDashoffset:0

// 	}, 1000, mina.easeout, function(){

// 		p.animate({

// 			strokeOpacity:1

// 		}, 500);
// 	})
// }


window.startClustering = function(){

	//Push random point to stack
	var randIndex = 0; Math.round( Math.random() * (clusterArray.length -1) ) + 1; 
	window.clusterStack.push( clusterArray[randIndex]);

	console.log('random index' + randIndex);
	
	// $.notify("Added point" + randIndex + " : " + clusterArray[randIndex].id +"(" + clusterArray[randIndex].getBBox().cx + ", " + clusterArray[randIndex].getBBox().cy + ") to stack", {
	// 	autoHideDelay: 5000,
	// 	globalPosition: 'bottom right',
	// 	className: 'success',
	// });


	//repeat for n-1 times

	var iterationCount = 0,
	mergerCount = 0,
	t0 = performance.now();
	Session.set("timeCounter", 0);


	function clusterify(){
		setTimeout(function () { 
			var topClusterID = clusterStack[clusterStack.length - 1].id;
			var minDistance = Number.POSITIVE_INFINITY;
			var minPointID, topClusterPointIDS =[], index=0, minSourceID;
			iterationCount++;

			log("Iteration " + iterationCount , 'heading');
			console.log('Stack contents: ', _.pluck(clusterStack, 'id'));

		//Populate topCluster points
		window.topCluster = document.getElementById(topClusterID);

		$('#' + topClusterID).find('circle').each(function(){
			topClusterPointIDS.push($(this).attr('id'));
		});

		console.log('Points in topcluster are: ' , topClusterPointIDS);

		for( j in topClusterPointIDS){
			var curDistanceArray = Snap.select('#' + topClusterPointIDS[j]).distanceArray ;

			for ( k in curDistanceArray){

				if(topClusterPointIDS.indexOf(k) < 0 &&
					curDistanceArray[k] < minDistance)
				{
					minSourceID = topClusterPointIDS[j];
					minDistance = curDistanceArray[k];
					minPointID = k;
				}
			}

			var nextClusterID = Snap.select('#' + minPointID).clusterID;
		}
		console.log("Nearest cluster is: " , Snap.select('#' + nextClusterID));

		//Check if nextClusterID is already present in stack (one below topmost element, if it is)

		if(clusterStack.length > 1
			&& clusterStack[clusterStack.length - 2].id == nextClusterID)
		{
			log('Nearest Cluster already present in stack, popping both', 'success');

			var clusterA = clusterStack.pop();
			var clusterB = clusterStack.pop();

			var mergedCluster = s.group(clusterA, clusterB);
			mergedCluster.attr({
				id: mergedCluster.id
			});
			mergerCount++;
			console.log("Merged being pushed to stack: " , mergedCluster);

			$('#rec-' + clusterA.id).animate({
				opacity:0
			}, 600);

			$('#rec-' + clusterB.id).animate({
				opacity:0
			}, 600, mina.easein);

			var bound = s.rect( mergedCluster.getBBox().x + mergedCluster.getBBox().height/2, mergedCluster.getBBox().y + mergedCluster.getBBox().width/2, 0, 0, 10, 10);

			bound.attr({
				class : 'cluster-bound',
				id:"rec-" + mergedCluster.id,
				opacity:0
			});

			bound.animate({
				x:mergedCluster.getBBox().x -10,
				y:mergedCluster.getBBox().y -10,
				width:mergedCluster.getBBox().width + 20,
				height:mergedCluster.getBBox().height + 20,
				opacity:1
			}, 300);


			//change cluster id of all points to new mergedClusterID
			$('#' + clusterA.id + ', #' + clusterB.id).find('circle').each(function(){
				Snap.select('#' + $(this).attr('id')).clusterID = mergedCluster.id;
			});

			//Push merged cluster to back to the stack

			clusterStack.push(mergedCluster);

		}

		else{
			log('Nearest Cluster not present in stack, pushing it to the stack...', 'warning');
			clusterStack.push(Snap.select("#" + nextClusterID));
			addPath(minSourceID, minPointID);

		}

		console.log('Refreshed stack contents: ', _.pluck(clusterStack, 'id'));



		// for(var j = 0; j < topClusterPoints.length; j++ )
		// {
		// 	var curPoint = topClusterPoints[i];

		// 	console.log("Searching distanceArray of ", curPoint, "for minimum");

		// 	for( point in curPoint.distanceArray){

		// 		if(topClusterPoints.indexOf(point) > -1 && distanceArray[point] < min)
		// 		{
		// 			console.log("new minimum is " + distanceArray[point] + "for point", point);
		// 			minDistance = distanceArray[point];
		// 			minPoint = point;
		// 		}
		// 	}
		// }

		if(mergerCount < (pointArray.length - 1))
			clusterify();
		else{
			var t1 = performance.now();
			Session.set('timeCounter', Math.round((t1-t0) - 700 * (pointArray.length + 1)));

		}

	}, 700);

}

var t0 = performance.now();

clusterify();


var $target = $('#svg-canvas').children();
Session.set('depthCounter', 0);

Session.set('calcDone', true);



}