import {ITEMS} from "./items.js";
import {drawItemIcon,drawIngredientLine} from "./itemicons.js";


export class Furnace{


constructor(backpack,audio,game){


this.backpack=backpack;

this.audio=audio;

this.game=game;


this.open=false;


this.category="Schmelzen";


this.mouseX=0;
this.mouseY=0;


this.scroll=0;

this.maxScroll=0;




window.addEventListener(
"mousemove",
(e)=>{


let canvas =
document.getElementById("game");


let rect =
canvas.getBoundingClientRect();


this.mouseX =
e.clientX-rect.left;


this.mouseY =
e.clientY-rect.top;


});





window.addEventListener(
"keydown",
(e)=>{


if(!this.open)
return;


if(e.key==="Escape"){


this.close();


}


});





window.addEventListener(
"mousedown",
(e)=>{


if(e.button!==0)
return;


if(!this.open)
return;


this.handleClick();


});





window.addEventListener(
"wheel",
(e)=>{


if(!this.open)
return;


this.scroll+=
e.deltaY*0.3;


this.scroll =
Math.max(
0,
Math.min(
this.scroll,
this.maxScroll
)
);


});


}






openMenu(){


this.open=true;


this.scroll=0;


if(this.game){


this.game.inputLocked=true;


}


}






close(){


this.open=false;


if(this.game){


this.game.inputLocked=false;


}


}






getLayout(canvas){


let width=900;

let height=600;


return {


x:
canvas.width/2-width/2,


y:
canvas.height/2-height/2,


width,

height


};


}






handleClick(){


let canvas =
document.getElementById("game");


let l =
this.getLayout(canvas);




// =====================
// KATEGORIEN
// =====================


if(
this.mouseX>=l.x+40 &&
this.mouseX<=l.x+240 &&
this.mouseY>=l.y+90 &&
this.mouseY<=l.y+140
){


this.category="Schmelzen";

this.scroll=0;


}



if(
this.mouseX>=l.x+40 &&
this.mouseX<=l.x+240 &&
this.mouseY>=l.y+150 &&
this.mouseY<=l.y+200
){


this.category="Köhlerei";

this.scroll=0;


}





// =====================
// REZEPTE
// =====================


let recipes =
this.getRecipes();


recipes.forEach(
(recipe,index)=>{


let y =
l.y+140+
index*90-
this.scroll;


if(

this.mouseX>=l.x+700 &&

this.mouseX<=l.x+820 &&

this.mouseY>=y-30 &&

this.mouseY<=y+15

){


this.craft(recipe);


}


});


}






getRecipes(){


// =====================
// SCHMELZEN
// =====================


if(
this.category==="Schmelzen"
){


return [

{

name:"2x Kupferbarren",

ingredients:[

{
item:ITEMS.COPPER_ORE,
amount:5
},

{
item:ITEMS.COAL,
amount:2
}

],

output:ITEMS.COPPER_BAR,

outputAmount:2

},

{

name:"2x Eisenbarren",

ingredients:[

{
item:ITEMS.IRON_ORE,
amount:5
},

{
item:ITEMS.COAL,
amount:2
}

],

output:ITEMS.IRON_BAR,

outputAmount:2

},

{

name:"2x Silberbarren",

ingredients:[

{
item:ITEMS.SILVER_ORE,
amount:5
},

{
item:ITEMS.COAL,
amount:2
}

],

output:ITEMS.SILVER_BAR,

outputAmount:2

},

{

name:"2x Goldbarren",

ingredients:[

{
item:ITEMS.GOLD_ORE,
amount:5
},

{
item:ITEMS.COAL,
amount:2
}

],

output:ITEMS.GOLD_BAR,

outputAmount:2

},

{

name:"2x Diamantbarren",

ingredients:[

{
item:ITEMS.DIAMOND_ORE,
amount:5
},

{
item:ITEMS.COAL,
amount:2
}

],

output:ITEMS.DIAMOND_BAR,

outputAmount:2

},

{

name:"2x Kobaltbarren",

ingredients:[

{
item:ITEMS.COBALT_ORE,
amount:5
},

{
item:ITEMS.COAL,
amount:2
}

],

output:ITEMS.COBALT_BAR,

outputAmount:2

},

{

name:"2x Mithrilbarren",

ingredients:[

{
item:ITEMS.MITHRIL_ORE,
amount:5
},

{
item:ITEMS.COAL,
amount:2
}

],

output:ITEMS.MITHRIL_BAR,

outputAmount:2

},

{

name:"2x Obsidianbarren",

ingredients:[

{
item:ITEMS.OBSIDIAN_ORE,
amount:5
},

{
item:ITEMS.COAL,
amount:2
}

],

output:ITEMS.OBSIDIAN_BAR,

outputAmount:2

},

{

name:"2x Adamantbarren",

ingredients:[

{
item:ITEMS.ADAMANT_ORE,
amount:5
},

{
item:ITEMS.COAL,
amount:2
}

],

output:ITEMS.ADAMANT_BAR,

outputAmount:2

}

];


}





// =====================
// KÖHLEREI
// =====================


if(
this.category==="Köhlerei"
){


return [

{

name:"3x Kohle",

ingredients:[

{
item:ITEMS.WOOD,
amount:1
},

{
item:ITEMS.COAL,
amount:1
}

],

output:ITEMS.COAL,

outputAmount:3

}

];


}


return [];


}






hasItem(item,amount){


let entry =
this.backpack.items.find(
e=>e.item.id===item.id
);


return (
entry &&
entry.amount>=amount
);


}






removeItem(item,amount){


let entry =
this.backpack.items.find(
e=>e.item.id===item.id
);


if(!entry)
return;


entry.amount-=amount;


if(entry.amount<=0){


this.backpack.items.splice(

this.backpack.items.indexOf(entry),

1

);


}


}






craft(recipe){


for(
let ing of recipe.ingredients
){


if(
!this.hasItem(
ing.item,
ing.amount
)
)
return;


}



for(
let ing of recipe.ingredients
){


this.removeItem(

ing.item,

ing.amount

);


}



this.backpack.add(

recipe.output,

recipe.outputAmount

);


if(this.audio){


this.audio.playSound(
"craft"
);


}


}






draw(ctx,canvas){


if(!this.open)
return;


let l =
this.getLayout(canvas);


ctx.save();




// =====================
// FENSTER
// =====================


ctx.fillStyle=
"rgba(0,0,0,0.9)";


ctx.fillRect(

l.x,

l.y,

l.width,

l.height

);



ctx.strokeStyle="white";

ctx.lineWidth=3;


ctx.strokeRect(

l.x,

l.y,

l.width,

l.height

);




// =====================
// TITEL
// =====================


ctx.fillStyle="white";

ctx.textAlign="center";

ctx.font="32px Arial";


ctx.fillText(

"Ofen",

canvas.width/2,

l.y+45

);




// =====================
// KATEGORIEN
// =====================


ctx.font="22px Arial";

ctx.textAlign="left";


let cats=[

"Schmelzen",

"Köhlerei"

];


cats.forEach(
(cat,i)=>{


if(
this.category===cat
){


ctx.fillStyle="yellow";


}
else{


ctx.fillStyle="white";


}


ctx.fillText(

cat,

l.x+40,

l.y+110+i*60

);


});




// =====================
// REZEPTE
// =====================


let recipes =
this.getRecipes();


this.maxScroll =
Math.max(
0,
recipes.length*90-350
);


ctx.save();


ctx.beginPath();


ctx.rect(

l.x+300,

l.y+90,

550,

400

);


ctx.clip();


ctx.textAlign="left";

ctx.font="20px Arial";


recipes.forEach(
(recipe,index)=>{


let y =
l.y+140+
index*90-
this.scroll;



// NAME

ctx.fillStyle="white";

drawItemIcon(
ctx,
recipe.output,
l.x+330,
y-25,
30
);

ctx.textAlign="left";
ctx.textBaseline="alphabetic";
ctx.font="20px Arial";

ctx.fillText(
recipe.name,
l.x+370,
y
);


// MATERIALIEN

ctx.fillStyle="#aaa";

drawIngredientLine(
ctx,
recipe.ingredients,
l.x+330,
y+25
);


// BUTTON AKTIV?


let canCraft=true;


for(
let ing of recipe.ingredients
){


if(
!this.hasItem(
ing.item,
ing.amount
)
){


canCraft=false;


}


}



// BUTTON


ctx.fillStyle =
canCraft
?
"#2ecc71"
:
"#555";


ctx.fillRect(

l.x+700,

y-30,

120,

45

);


ctx.fillStyle="white";

ctx.textAlign="center";

ctx.font="18px Arial";


ctx.fillText(

"Schmelzen",

l.x+760,

y

);


ctx.textAlign="left";

ctx.font="20px Arial";


});


ctx.restore();




// =====================
// SCHLIESSEN
// =====================


ctx.font="16px Arial";

ctx.fillStyle="white";

ctx.textAlign="left";


ctx.fillText(

"[ESC] Schließen",

l.x+40,

l.y+l.height-30

);


ctx.restore();


}


}
