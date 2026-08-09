export class Intro{


constructor(game){


this.game=game;

this.active=false;

this.seen=false;


this.image=new Image();

this.image.src="assets/ui/intro.png";



window.addEventListener(
"keydown",
(e)=>{


if(!this.active)
return;


e.preventDefault();

e.stopImmediatePropagation();


if(
e.code==="Space" ||
e.key===" "
){


this.close();


}


},
true
);



window.addEventListener(
"mousedown",
(e)=>{


if(!this.active)
return;


e.preventDefault();

e.stopImmediatePropagation();


},
true
);


}



show(){


if(this.seen)
return;


this.active=true;


if(this.game){

this.game.inputLocked=true;

}


}



hideWithoutMarkingSeen(){


this.active=false;


if(this.game){

this.game.inputLocked=false;

}


}



async close(){


if(!this.active)
return;


this.active=false;

this.seen=true;


if(this.game){

this.game.inputLocked=false;

}


// Intro-Status sofort mitspeichern.
// Dadurch erscheint es auch nach einem direkt folgenden
// Browser-Reload nicht erneut.

if(
this.game &&
this.game.save &&
typeof this.game.save.save==="function"
){


try{


await this.game.save.save(false);


}
catch(e){


console.warn(
"Intro-Status konnte nicht gespeichert werden:",
e
);


}


}


}



draw(ctx,canvas){


if(!this.active)
return;


ctx.save();


ctx.fillStyle="black";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);


if(
this.image.complete &&
this.image.naturalWidth>0
){


let scale =
Math.min(
canvas.width/this.image.naturalWidth,
canvas.height/this.image.naturalHeight
);


let width =
this.image.naturalWidth*scale;


let height =
this.image.naturalHeight*scale;


let x =
(canvas.width-width)/2;


let y =
(canvas.height-height)/2;


ctx.imageSmoothingEnabled=false;


ctx.drawImage(
this.image,
x,
y,
width,
height
);


}
else{


ctx.fillStyle="white";

ctx.textAlign="center";

ctx.font="24px Arial";


ctx.fillText(
"Forgevein wird geladen ...",
canvas.width/2,
canvas.height/2
);


}


ctx.restore();


}


}
