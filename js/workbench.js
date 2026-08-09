import {ITEMS} from "./items.js";
import {drawItemIcon,drawIngredientLine} from "./itemicons.js";


export class Workbench{


constructor(backpack,audio,game){


this.backpack=backpack;

this.audio=audio;

this.game=game;


this.open=false;


this.category="Verarbeitung";



this.mouseX=0;
this.mouseY=0;




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
this.mouseX<=l.x+240
&&
this.mouseY>=l.y+90 &&
this.mouseY<=l.y+140
){

this.category="Verarbeitung";
this.scroll=0;

}



if(
this.mouseX>=l.x+40 &&
this.mouseX<=l.x+240
&&
this.mouseY>=l.y+150 &&
this.mouseY<=l.y+200
){

this.category="Werkzeuge";
this.scroll=0;

}



if(
this.mouseX>=l.x+40 &&
this.mouseX<=l.x+240
&&
this.mouseY>=l.y+210 &&
this.mouseY<=l.y+260
){

this.category="Förderbänder";
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


if(
this.category==="Verarbeitung"
){


return [

{

name:"Holzbretter",

input:ITEMS.WOOD,

amount:1,

output:ITEMS.WOOD_PLANKS,

outputAmount:1


},

{
name:"1x Glasflasche",

input:ITEMS.GLASS,

amount:2,

output:ITEMS.GLASS_BOTTLE,

outputAmount:1

},

{

name:"3x Holzstangen",

input:ITEMS.WOOD_PLANKS,

amount:1,

output:ITEMS.WOOD_ROD,

outputAmount:3


},

{

name:"Steinplatte",

input:ITEMS.STONE,

amount:1,

output:ITEMS.STONE_PLATE,

outputAmount:1


},

{

name:"3x Kupferplatte",

input:ITEMS.COPPER_BAR,

amount:2,

output:ITEMS.COPPER_PLATE,

outputAmount:3


},

{

name:"3x Eisenplatte",


input:ITEMS.IRON_BAR,

amount:2,

output:ITEMS.IRON_PLATE,

outputAmount:3


},

{

name:"3x Silberplatte",

input:ITEMS.SILVER_BAR,

amount:2,

output:ITEMS.SILVER_PLATE,

outputAmount:3


},

{

name:"3x Goldplatte",

input:ITEMS.GOLD_BAR,

amount:2,

output:ITEMS.GOLD_PLATE,

outputAmount:3


},

{

name:"3x Diamantplatte",

input:ITEMS.DIAMOND_BAR,

amount:2,

output:ITEMS.DIAMOND_PLATE,

outputAmount:3


},

{

name:"3x Kobaltplatte",

input:ITEMS.COBALT_BAR,

amount:2,

output:ITEMS.COBALT_PLATE,

outputAmount:3


},

{

name:"3x Mithrilplatte",

input:ITEMS.MITHRIL_BAR,

amount:2,

output:ITEMS.MITHRIL_PLATE,

outputAmount:3


},

{

name:"3x Obsidianplatte",

input:ITEMS.OBSIDIAN_BAR,

amount:2,

output:ITEMS.OBSIDIAN_PLATE,

outputAmount:3


},

{

name:"3x Adamantplatte",

input:ITEMS.ADAMANT_BAR,

amount:2,

output:ITEMS.ADAMANT_PLATE,

outputAmount:3


},

];


}







if(
this.category==="Werkzeuge"
){


return [


{

name:"Holzspitzhacke",

ingredients:[

{
item:ITEMS.WOOD_PLANKS,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.WOOD_PICKAXE,

outputAmount:1

},


{

name:"Holzaxt",

ingredients:[

{
item:ITEMS.WOOD_PLANKS,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.WOOD_AXE,

outputAmount:1

},


{

name:"Holzschaufel",

ingredients:[

{
item:ITEMS.WOOD_PLANKS,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.WOOD_SHOVEL,

outputAmount:1

},


{

name:"Steinspitzhacke",

ingredients:[

{
item:ITEMS.STONE_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.STONE_PICKAXE,

outputAmount:1

},


{

name:"Steinaxt",

ingredients:[

{
item:ITEMS.STONE_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.STONE_AXE,

outputAmount:1

},


{

name:"Steinschaufel",

ingredients:[

{
item:ITEMS.STONE_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.STONE_SHOVEL,

outputAmount:1

},


{

name:"Kupferspitzhacke",

ingredients:[

{
item:ITEMS.COPPER_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.COPPER_PICKAXE,

outputAmount:1

},


{

name:"Kupferaxt",

ingredients:[

{
item:ITEMS.COPPER_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.COPPER_AXE,

outputAmount:1

},


{

name:"Kupferschaufel",

ingredients:[

{
item:ITEMS.COPPER_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.COPPER_SHOVEL,

outputAmount:1

},


{

name:"Eisenspitzhacke",

ingredients:[

{
item:ITEMS.IRON_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.IRON_PICKAXE,

outputAmount:1

},


{

name:"Eisenaxt",

ingredients:[

{
item:ITEMS.IRON_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.IRON_AXE,

outputAmount:1

},


{

name:"Eisenschaufel",

ingredients:[

{
item:ITEMS.IRON_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.IRON_SHOVEL,

outputAmount:1

},


{

name:"Silberspitzhacke",

ingredients:[

{
item:ITEMS.SILVER_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.SILVER_PICKAXE,

outputAmount:1

},


{

name:"Silberaxt",

ingredients:[

{
item:ITEMS.SILVER_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.SILVER_AXE,

outputAmount:1

},


{

name:"Silberschaufel",

ingredients:[

{
item:ITEMS.SILVER_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.SILVER_SHOVEL,

outputAmount:1

},


{

name:"Goldspitzhacke",

ingredients:[

{
item:ITEMS.GOLD_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.GOLD_PICKAXE,

outputAmount:1

},


{

name:"Goldaxt",

ingredients:[

{
item:ITEMS.GOLD_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.GOLD_AXE,

outputAmount:1

},


{

name:"Goldschaufel",

ingredients:[

{
item:ITEMS.GOLD_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.GOLD_SHOVEL,

outputAmount:1

},


{

name:"Diamantspitzhacke",

ingredients:[

{
item:ITEMS.DIAMOND_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.DIAMOND_PICKAXE,

outputAmount:1

},


{

name:"Diamantaxt",

ingredients:[

{
item:ITEMS.DIAMOND_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.DIAMOND_AXE,

outputAmount:1

},


{

name:"Diamantschaufel",

ingredients:[

{
item:ITEMS.DIAMOND_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.DIAMOND_SHOVEL,

outputAmount:1

},


{

name:"Kobaltspitzhacke",

ingredients:[

{
item:ITEMS.COBALT_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.COBALT_PICKAXE,

outputAmount:1

},


{

name:"Kobaltaxt",

ingredients:[

{
item:ITEMS.COBALT_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.COBALT_AXE,

outputAmount:1

},


{

name:"Kobaltschaufel",

ingredients:[

{
item:ITEMS.COBALT_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.COBALT_SHOVEL,

outputAmount:1

},


{

name:"Mithrilspitzhacke",

ingredients:[

{
item:ITEMS.MITHRIL_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.MITHRIL_PICKAXE,

outputAmount:1

},


{

name:"Mithrilaxt",

ingredients:[

{
item:ITEMS.MITHRIL_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.MITHRIL_AXE,

outputAmount:1

},


{

name:"Mithrilschaufel",

ingredients:[

{
item:ITEMS.MITHRIL_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.MITHRIL_SHOVEL,

outputAmount:1

},


{

name:"Obsidianspitzhacke",

ingredients:[

{
item:ITEMS.OBSIDIAN_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.OBSIDIAN_PICKAXE,

outputAmount:1

},


{

name:"Obsidianaxt",

ingredients:[

{
item:ITEMS.OBSIDIAN_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.OBSIDIAN_AXE,

outputAmount:1

},


{

name:"Obsidianschaufel",

ingredients:[

{
item:ITEMS.OBSIDIAN_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.OBSIDIAN_SHOVEL,

outputAmount:1

},


{

name:"Adamantspitzhacke",

ingredients:[

{
item:ITEMS.ADAMANT_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.ADAMANT_PICKAXE,

outputAmount:1

},


{

name:"Adamantaxt",

ingredients:[

{
item:ITEMS.ADAMANT_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.ADAMANT_AXE,

outputAmount:1

},


{

name:"Adamantschaufel",

ingredients:[

{
item:ITEMS.ADAMANT_PLATE,
amount:3
},

{
item:ITEMS.WOOD_ROD,
amount:2
}

],

output:ITEMS.ADAMANT_SHOVEL,

outputAmount:1

}


];


}




if(
this.category==="Förderbänder"
){

return [];

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



















craft(recipe){



// Verarbeitung


if(recipe.input){



if(
!this.hasItem(
recipe.input,
recipe.amount
)
)
return;




this.backpack.removeItem(

recipe.input,

recipe.amount

);




this.backpack.add(

recipe.output,

recipe.outputAmount

);




if(this.audio){

this.audio.playSound(
"craft"
);


}



return;


}









// Werkzeuge


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


this.backpack.removeItem(

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








ctx.fillStyle="white";

ctx.textAlign="center";


ctx.font="32px Arial";


ctx.fillText(

"Handwerksbank",

canvas.width/2,

l.y+45

);








// Kategorien


ctx.font="22px Arial";

ctx.textAlign="left";



let cats=[

"Verarbeitung",

"Werkzeuge",

"Förderbänder"

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

let ingredients =
recipe.input
? [{item:recipe.input,amount:recipe.amount}]
: recipe.ingredients;

drawIngredientLine(
ctx,
ingredients || [],
l.x+330,
y+25
);


// BUTTON AKTIV?


let canCraft=true;



if(recipe.input){


canCraft =
this.hasItem(
recipe.input,
recipe.amount
);


}
else if(recipe.ingredients){



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

"Bauen",

l.x+760,

y

);




ctx.textAlign="left";


ctx.font="20px Arial";



});



ctx.restore();







ctx.font="16px Arial";


ctx.fillStyle="white";


ctx.fillText(

"[ESC] Schließen",

l.x+40,

l.y+l.height-30

);





ctx.restore();



}



}