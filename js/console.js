export class Console{


constructor(game){


this.game = game;


this.open=false;


this.input="";






window.addEventListener(
"keydown",
(e)=>{



// ======================
// KONSOLE ÖFFNEN
// ======================


if(
e.key==="/"
&&
!this.open
){


e.preventDefault();

e.stopImmediatePropagation();


this.open=true;


// INPUT SPERREN

if(this.game){

this.game.inputLocked=true;

}


return;


}








// ======================
// KONSOLE AKTIV
// ======================


if(
this.open
){



e.preventDefault();

e.stopImmediatePropagation();




// KONSOLE SCHLIESSEN

if(
e.key==="Escape"
){


this.input="";

this.open=false;



if(this.game){

this.game.inputLocked=false;

}


return;


}







// ENTER AUSFÜHREN

if(
e.key==="Enter"
){


this.execute(
this.input
);


this.input="";

this.open=false;



if(this.game){

this.game.inputLocked=false;

}


return;


}









// BACKSPACE

if(
e.key==="Backspace"
){


this.input =
this.input.slice(
0,
-1
);


return;


}









// TEXT EINGABE

if(
e.key.length===1
){


this.input+=e.key;


}



return;


}



},
true
);



}









execute(command){


let args =
command.trim().split(" ");






if(
args[0]==="give"
){



let itemName =
args[1];



let amount =
parseInt(args[2])
||
1;








if(
itemName==="all"
){



Object.values(
this.game.items
)
.forEach(
item=>{


if(
item.type==="resource"
){


this.game.backpack.add(
item,
100
);


}



});


return;


}









let item =
this.game.items[
itemName.toUpperCase()
];






if(item){


this.game.backpack.add(
item,
amount
);


}



}




}









draw(ctx){


if(
!this.open
)
return;



ctx.save();





ctx.fillStyle=
"rgba(0,0,0,0.8)";


ctx.fillRect(
20,
20,
500,
40
);






ctx.fillStyle=
"white";


ctx.font=
"22px Arial";




ctx.fillText(
"> "+this.input,
30,
48
);






ctx.restore();



}



}