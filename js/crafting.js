import {ITEMS} from "./items.js";
import {drawItemIcon,drawIngredientLine} from "./itemicons.js";


export class Crafting{


constructor(backpack){

this.backpack=backpack;

this.open=false;

this.category="Werkbänke";

this.mouseX=0;
this.mouseY=0;

this.scroll=0;
this.maxScroll=0;


window.addEventListener(
"keydown",
(e)=>{

if(e.key.toLowerCase()==="c"){

this.open=!this.open;
this.scroll=0;

}

if(this.open && e.key==="Escape"){

this.open=false;
this.scroll=0;

}

});


window.addEventListener(
"mousemove",
(e)=>{

let canvas=document.getElementById("game");
let rect=canvas.getBoundingClientRect();

this.mouseX=e.clientX-rect.left;
this.mouseY=e.clientY-rect.top;

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

this.scroll+=e.deltaY*0.3;

this.scroll=Math.max(
0,
Math.min(
this.scroll,
this.maxScroll
)
);

});

}



getLayout(canvas){

let width=900;
let height=600;

return {

x:canvas.width/2-width/2,
y:canvas.height/2-height/2,
width,
height

};

}



handleClick(){

let canvas=document.getElementById("game");
let l=this.getLayout(canvas);


// =====================
// KATEGORIEN
// =====================

if(
this.mouseX>=l.x+40 &&
this.mouseX<=l.x+240 &&
this.mouseY>=l.y+90 &&
this.mouseY<=l.y+140
){

this.category="Werkbänke";
this.scroll=0;

}


if(
this.mouseX>=l.x+40 &&
this.mouseX<=l.x+240 &&
this.mouseY>=l.y+150 &&
this.mouseY<=l.y+200
){

this.category="Maschinen";
this.scroll=0;

}


if(
this.mouseX>=l.x+40 &&
this.mouseX<=l.x+240 &&
this.mouseY>=l.y+210 &&
this.mouseY<=l.y+260
){

this.category="Platzierbares";
this.scroll=0;

}


// =====================
// REZEPTE
// =====================

let recipes=this.getRecipes();

recipes.forEach(
(recipe,index)=>{

let y=l.y+140+index*90-this.scroll;

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


if(this.category==="Werkbänke"){

return [

{
name:"Handwerksbank",
ingredients:[
{item:ITEMS.WOOD,amount:10}
],
output:ITEMS.CRAFTING_TABLE,
outputAmount:1
},

{
name:"Ofen",
ingredients:[
{item:ITEMS.STONE,amount:10}
],
output:ITEMS.FURNACE,
outputAmount:1
},

{
name:"Mechanische Werkbank",
ingredients:[
{item:ITEMS.WOOD_PLANKS,amount:2},
{item:ITEMS.WOOD_ROD,amount:4},
{item:ITEMS.IRON_BAR,amount:1}
],
output:ITEMS.MECHANICAL_WORKBENCH,
outputAmount:1
},

{
name:"Kochstation",
ingredients:[
{item:ITEMS.WOOD_PLANKS,amount:4},
{item:ITEMS.STONE,amount:4},
{item:ITEMS.IRON_BAR,amount:1}
],
output:ITEMS.COOKING_STATION,
outputAmount:1
}

];

}


if(this.category==="Maschinen"){

return [];

}


if(this.category==="Platzierbares"){

return [

{
name:"3x Holzbrücke",
ingredients:[
{item:ITEMS.WOOD_PLANKS,amount:5},
{item:ITEMS.WOOD_ROD,amount:4}
],
output:ITEMS.WOOD_BRIDGE,
outputAmount:3
}

];

}


return [];

}



hasItem(item,amount){

let entry=this.backpack.items.find(
e=>e.item.id===item.id
);

return(
entry &&
entry.amount>=amount
);

}







craft(recipe){

for(let ing of recipe.ingredients){

if(!this.hasItem(ing.item,ing.amount))
return;

}

for(let ing of recipe.ingredients){

this.backpack.removeItem(
ing.item,
ing.amount
);

}

this.backpack.add(
recipe.output,
recipe.outputAmount
);

if(this.backpack.audio){

this.backpack.audio.playSound(
"craft"
);

}

}



draw(ctx,canvas){

if(!this.open)
return;

let l=this.getLayout(canvas);

ctx.save();


// =====================
// FENSTER
// =====================

ctx.fillStyle="rgba(0,0,0,0.9)";
ctx.fillRect(l.x,l.y,l.width,l.height);

ctx.strokeStyle="white";
ctx.lineWidth=3;
ctx.strokeRect(l.x,l.y,l.width,l.height);


// =====================
// TITEL
// =====================

ctx.fillStyle="white";
ctx.textAlign="center";
ctx.font="32px Arial";

ctx.fillText(
"Crafting",
canvas.width/2,
l.y+45
);


// =====================
// KATEGORIEN
// =====================

ctx.font="22px Arial";
ctx.textAlign="left";

let cats=[
"Werkbänke",
"Maschinen",
"Platzierbares"
];

cats.forEach(
(cat,i)=>{

ctx.fillStyle=(this.category===cat)
? "yellow"
: "white";

ctx.fillText(
cat,
l.x+40,
l.y+110+i*60
);

});


// =====================
// REZEPTE
// =====================

let recipes=this.getRecipes();

this.maxScroll=Math.max(
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

let y=l.y+140+index*90-this.scroll;

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

ctx.fillStyle="#aaa";

drawIngredientLine(
ctx,
recipe.ingredients,
l.x+330,
y+25
);

let canCraft=true;

for(let ing of recipe.ingredients){

if(!this.hasItem(ing.item,ing.amount)){
canCraft=false;
}

}

ctx.fillStyle=canCraft
? "#2ecc71"
: "#555";

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
"Bauen",
l.x+760,
y
);

ctx.textAlign="left";
ctx.font="20px Arial";

});

ctx.restore();


// =====================
// HINWEIS / SCHLIESSEN
// =====================

if(
this.category==="Maschinen" &&
recipes.length===0
){

ctx.fillStyle="#aaa";
ctx.font="18px Arial";
ctx.textAlign="left";
ctx.fillText(
"Noch keine Rezepte verfügbar.",
l.x+330,
l.y+140
);

}

ctx.font="16px Arial";
ctx.fillStyle="white";
ctx.textAlign="left";

ctx.fillText(
"[C / ESC] Schließen",
l.x+40,
l.y+l.height-30
);

ctx.restore();

}

}
