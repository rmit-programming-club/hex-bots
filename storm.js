
// bridges sorted by x
var bridges = [
	[[1, -1], [1, 0]],
	[[0, -1], [1, -1]],
	[[1, 0], [0, 1]],
	[[-1, 0], [0, -1]],
	[[0, 1], [-1, 1]],
	[[-1, 1], [-1, 0]]
];

const PLAYER1 = 0;
const turn = 0;



// Create an array of all non-empty pieces
const checkers = [...friendlies, ...enemies];

const empty = (x1,y1) =>
  !checkers.some(({ x, y }) => x1 === x && y1 === y);

const hex = (x,y) =>
  ({x,y});


const rnd = (num) => Math.floor(Math.random() * num);
const rndg = () => rnd(11);

Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array)
      return false;

  // compare lengths - can save a lot of time 
  if (this.length != array.length)
      return false;

  for (var i = 0, l=this.length; i < l; i++) {
      // Check if we have nested arrays
      if (this[i] instanceof Array && array[i] instanceof Array) {
          // recurse into the nested arrays
          if (!this[i].equals(array[i]))
              return false;       
      }           
      else if (this[i] != array[i]) { 
          // Warning - two different object instances will never be equal: {x:20} != {x:20}
          return false;   
      }           
  }       
  return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

function init (){
	state.watchList = [];
	state.tileChain = [];
	state.winRight = false;
	state.winLeft = false;
}

function getRightHead(){
	return state.tileChain[state.tileChain.length - 1];
}

function getLeftHead(){
	return state.tileChain[0];
}

function outOfBounds(position){
	return position[0] > 10 || position[0] < 0 || position[1] > 10 || position[1] < 0;
}

function add(x, y){
	return [x[0] +y[0], x[1]+ y[1]]
}

function sub(x, y){
	return [x[0] - y[0], x[1] - y[1]]
}

function isEmpty(pos){
	return (turn == PLAYER1) ? empty(pos[0], pos[1]) : empty(pos[1], pos[0])
}

function watch(pair){
	for(let i = 0; i <state.watchList.length; i++){
		if(state.watchList[i] == pair) return;
	}
	state.watchList.push(pair)
}

function place(position){
	// Can we bridge to the right edge?
	if(position[0] == 9){
		let bridgeStep1 = add(position, [1, -1])
		let bridgeStep2 = add(position,[1, 0])
		// We have made it all the way across!
		if(isEmpty(bridgeStep1) && isEmpty(bridgeStep2)){
			watch([bridgeStep1, bridgeStep2])
			state.winRight = true
		}
	}
	
	// Are we on the right edge?
	if(position[0] == 10){
		state.winRight = true
	}
	
	
	// Can we bridge to the left edge?
	if(position[0] == 1){
		let bridgeStep1 = add(position, [-1, 1])
		let bridgeStep2 = add(position,[-1, 0])
		// We have made it all the way across!
		if(isEmpty(bridgeStep1) && isEmpty(bridgeStep2)){
			watch([bridgeStep1, bridgeStep2])
			state.winLeft = true
		}
	}
	
	// Are we on the left edge?
	if(position[0] == 0){
		state.winLeft = true
	}
	return (turn == PLAYER1) ? hex(position[0], position[1]) : hex(position[1], position[0])
}

function getBridgeRight(head){
	// Check for any easy bridges, first 3 go right
	for(let i = 0; i < 3; i++){
		let fullBridge = add(bridges[i][0], bridges[i][1])
		
		// First make sure that I am not bridging out of the board
		if(outOfBounds(add(head, fullBridge))) continue;
		
		// Check if I am obstructured before checking bridge
		let bridgeStep1 = add(head, bridges[i][0]);
		if(!isEmpty(bridgeStep1)){
			continue;
		}
		
		let bridgeStep2 = add(head, bridges[i][1])
		if(!isEmpty(bridgeStep2)){
			continue;
		}
		
		// Finally, check if the bridge is taken
		if(!isEmpty(add(head, fullBridge))){
			continue;
		}
		
		// If we got here, then we should take this and bridge!
		watch([bridgeStep1, bridgeStep2])
		
		return add(head, fullBridge)
	}
	return [];
}

function getBridgeLeft(head){
	// Check for any easy bridges, last 3 go left
	for(let i = 5; i > 2 ; i--){
		let fullBridge = add(bridges[i][0], bridges[i][1])
		
		// First make sure that I am not bridging out of the board
		if(outOfBounds(add(head, fullBridge))) continue;
		
		// Check if I am obstructured before checking bridge
		let bridgeStep1 = add(head, bridges[i][0]);
		if(!isEmpty(bridgeStep1)){
			continue;
		}
		
		let bridgeStep2 = add(head, bridges[i][1])
		if(!isEmpty(bridgeStep2)){
			continue;
		}
		
		// Finally, check if the bridge is taken
		if(!isEmpty(add(head, fullBridge))){
			continue;
		}
		
		// If we got here, then we should take this and bridge!
		watch([bridgeStep1, bridgeStep2])
		
		return add(head, fullBridge)
	}
	return [];
}

function getOpponents () {
  return enemies.map(a => [a.x, a.y]);
}

function main (){
	
	// Check for any attempts to burst through my bridge, enforce my wall
	for(var i = 0; i<state.watchList.length; i++){
		let watchPair = state.watchList[i]
		if(!isEmpty(watchPair[0])){
			state.watchList.splice(i, 1);
			return place(watchPair[1])
		}
		if(!isEmpty(watchPair[1])){
			state.watchList.splice(i, 1);
			return place(watchPair[0])
		}
	}
	
	// Check if we have already won and need to fill in bridges
	if(state.winLeft && state.winRight){
		let bridge = state.watchList.pop();
		return (turn == PLAYER1) ? hex(bridge[0][0], bridge[0][1]) :hex(bridge[0][1], bridge[0][0])
	}
		
	// Make bridges
	while(state.tileChain.length > 0){
		
		let opponentTiles = getOpponents();
		
		// Get the opponets average x position
		let averageOppX = 0;
		for(let i = 0; i < opponentTiles.length; i++){
			averageOppX += opponentTiles[i][0]
		}
		averageOppX = averageOppX / opponentTiles.length;
			
		// Find out what range we have covered
		let chainMinX = getLeftHead()[0]
		let chainMaxX = getRightHead()[0]
			
		// Find what side we should protect
		let goRight = Math.abs((chainMaxX + 0.1) - averageOppX) < Math.abs((chainMinX - 0.1) - averageOppX)
		
		// Decide which way we should go, taking in the fact we may have
		// won one side already
		if((goRight || state.winLeft) && !state.winRight){
			let bridge = getBridgeRight(getRightHead());
			
			if(bridge.length > 0){ 
				state.tileChain.push(bridge)
				return place(bridge);
			}
			
			// no possible bridges, the head is covered, drop the head
			let lostHead = state.tileChain.pop();
		
			// drop not needed watch pair
			for(let i = 0; i < state.watchList.length; i++){
			
				if(add(getRightHead(), add(sub(state.watchList[i][0], getRightHead()), sub(state.watchList[i][1], getRightHead()))).equals(lostHead)){
					state.watchList.splice(i, 1)
					break;
				}
			}
		}
		
		// Otherwise, go to the left
		else{
			let bridge = getBridgeLeft(getLeftHead());
			
			if(bridge.length > 0){ 
				state.tileChain.unshift(bridge)
				return place(bridge);
			}
			
			// no possible bridges, the head is covered, drop the head
			let lostHead = state.tileChain.shift();
		
			// drop not needed watch pair
			for(let i = 0; i < state.watchList.length; i++){
			
				if(add(getLeftHead(), add(sub(state.watchList[i][0], getLeftHead()), sub(state.watchList[i][1], getLeftHead()))).equals(lostHead)){
					state.watchList.splice(i, 1)
					break;
				}
			}
		}
	}
	// Checks if we have any starting positions
	let foundEmpty = false;
	for(let i = 3; i < 8; i++){
		if(isEmpty([5, i])){
			foundEmpty = true;
			break;
		}
	}
	
	// Start chain if we have none
	if(state.tileChain.length == 0 && foundEmpty){
		let starty = 0
		do{
			starty = 3 + rnd(4)
		}while(!isEmpty([5, starty]));
		
		state.tileChain.push([5, starty])
		return (turn == PLAYER1) ? hex(5, starty) : hex(starty, 5)
	}
	
	// Very last resort, incredibly rare, random
	do{
	var x = rndg()
	var y = rndg()
	} while(!empty(x, y))
	return hex(x, y)
}

if(state.watchList == undefined){
  init();
}
return main();
