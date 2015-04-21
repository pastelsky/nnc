	
// Function to calculate the geometrical distance between two points

window.distanceCalc = function(p1, p2){

	var xDiff = p1.getBBox().x - p2.getBBox().x;
	var yDiff = p1.getBBox().y - p2.getBBox().y;

	return Math.sqrt( Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

};

//Funciton to perform clustering (with slowed down animation)
window.startClustering = function(){

	//Push random point to stack (aribatrarily chosen as 0 in this case)
	var randIndex = 0; 
	window.clusterStack.push( clusterArray[randIndex]);

	var iterationCount = 0,
	mergerCount = 0,

	//get start execution time
	t0 = performance.now();
	Session.set("timeCounter", 0);


	//Recursive function to loop over the given points and cluster them
	function clusterify(){

		//Timeout function to delay running of the loop by 700ms
		setTimeout(function () { 

			//Stores the topmost cluster in the stack
			var topClusterID = clusterStack[clusterStack.length - 1].id;

			//Minimum distance initialised to infinity
			var minDistance = Number.POSITIVE_INFINITY;
			var minPointID, topClusterPointIDS =[], index=0, minSourceID;
			iterationCount++;

			log("Iteration " + iterationCount , 'heading');
			console.log('Stack contents: ', _.pluck(clusterStack, 'id'));

		//Populate points in topmost cluster
		window.topCluster = document.getElementById(topClusterID);

		$('#' + topClusterID).find('circle').each(function(){
			topClusterPointIDS.push($(this).attr('id'));
		});

		console.log('Points in topcluster are: ' , topClusterPointIDS);


		// for each point in the topmost cluster, calculate 
		// 	distance using the single point linkage method

		for( j in topClusterPointIDS){

			//Each point has an attribute 'distanceArray' that stores 
			// its distances to every other point in the canvas

			var curDistanceArray = Snap.select('#' + topClusterPointIDS[j]).distanceArray ;


			//Find the minimum distance
			for ( k in curDistanceArray){

				if(topClusterPointIDS.indexOf(k) < 0 &&
					curDistanceArray[k] < minDistance)
				{
					minSourceID = topClusterPointIDS[j];
					minDistance = curDistanceArray[k];
					minPointID = k;
				}
			}

			//Get the cluster which the nearest point belongs to
			var nextClusterID = Snap.select('#' + minPointID).clusterID;
		}
		console.log("Nearest cluster is: " , Snap.select('#' + nextClusterID));


		//Check if nextClusterID is already present in stack 
		// (one below topmost element, if it is)

		if(clusterStack.length > 1
			&& clusterStack[clusterStack.length - 2].id == nextClusterID)
		{
			log('Nearest Cluster already present in stack, popping both', 'success');

			var clusterA = clusterStack.pop();
			var clusterB = clusterStack.pop();

			//Merge the popped elements and push them back to the stack
			var mergedCluster = s.group(clusterA, clusterB);
			mergedCluster.attr({
				id: mergedCluster.id
			});
			mergerCount++;

			//Animation for clustering/de-clusturing

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
			console.log("Merged being pushed to stack: " , mergedCluster);
			clusterStack.push(mergedCluster);

		}

		else{
			log('Nearest Cluster not present in stack, pushing it to the stack...', 'warning');
			clusterStack.push(Snap.select("#" + nextClusterID));
			addPath(minSourceID, minPointID);

		}

		console.log('Refreshed stack contents: ', _.pluck(clusterStack, 'id'));

		//Number of iterations was found to be equal to one less
		//than the number of pop mergers
		if(mergerCount < (pointArray.length - 1))
			clusterify();

		else{
			//Base condition for exiting the recursive function

			//Get end execution  time
			var t1 = performance.now();
			Session.set('timeCounter', Math.round((t1-t0) - 700 * (pointArray.length + 1)));

		}

	}, 700);

}


//Begin recursive routine, clusterify
clusterify();


//Set defaults
Session.set('depthCounter', 0);
Session.set('calcDone', true);


}