var f = function(arr, inputUpdate) {
	let i = arr.length;
	while (i > 0 && arr[i-1] > inputUpdate){
		i--;
	}
	arr.splice(i, 0, inputUpdate); //add update to array
}

var test=[]

f(test, 1);
console.log(test);
f(test, 2);
console.log(test);
f(test, 4);
console.log(test);
f(test, 7);
console.log(test);
f(test, 0);
console.log(test);
f(test, 3);
console.log(test);
f(test, 5);
console.log(test);
f(test, 6);
console.log(test);
f(test, 8);
console.log(test);
f(test, -1);
console.log(test);

var item = {

	__b: undefined

}


if (!item.__b){
	console.log("wow");
}





