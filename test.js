var uuid = require('node-uuid');
var Vector2D = require('./lib/Vector2D.js')
// var f = function(arr, inputUpdate) {
// 	let i = arr.length;
// 	while (i > 0 && arr[i-1] > inputUpdate){
// 		i--;
// 	}
// 	arr.splice(i, 0, inputUpdate); //add update to array
// }

// var test=[]

// f(test, 1);
// console.log(test);
// f(test, 2);
// console.log(test);
// f(test, 4);
// console.log(test);
// f(test, 7);
// console.log(test);
// f(test, 0);
// console.log(test);
// f(test, 3);
// console.log(test);
// f(test, 5);
// console.log(test);
// f(test, 6);
// console.log(test);
// f(test, 8);
// console.log(test);
// f(test, -1);
// console.log(test);

// var item = {

// 	__b: undefined

// }


// if (!item.__b){
// 	console.log("wow");
// }

range={};
range._checked = true;
console.log(undefined===range._checked);
delete range._checked;
console.log(undefined===range._checked);



function lengthInUtf8Bytes(str) {
  // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}


var myJson = JSON.stringify({
  	position: new Vector2D(0,0),
	radius: 100,
	health: 100,
	color: "red",
	outlineColor: "yellow",
	children: null,
	// id: uuid()
})


console.log(lengthInUtf8Bytes(myJson));

