export class Backpack{


constructor(audio){


this.audio = audio;


this.open=false;


this.items=[];


this.selectedItem=null;



window.addEventListener(
"keydown",
(e)=>{


if(
e.key.toLowerCase()==="b"
){


this.open =
!this.open;


}


});


}









add(item,amount=1){



if(
item.type==="tool"
){


this.items.push({

item:item,

amount:1

});


return;


}








let existing =
this.items.find(
entry =>
entry.item.id===item.id
);






if(existing){


existing.amount+=amount;


}
else{


this.items.push({

item:item,

amount:amount

});


}



}









removeItem(item){


let index =
this.items.findIndex(
entry =>
entry.item.id===item.id
);





if(index===-1)
return;






let entry =
this.items[index];



entry.amount--;





if(entry.amount<=0){


this.items.splice(
index,
1
);


}








if(
this.selectedItem &&
this.selectedItem.item.id===item.id
){


this.selectedItem=null;


}



}









selectItem(index){



if(
!this.items[index]
)
return;



this.selectedItem =
this.items[index];


}









clearSelection(){


this.selectedItem=null;


}









draw(ctx){



if(!this.open)
return;






// ======================
// CANVAS ZUSTAND RESET
// ======================


ctx.save();


ctx.textAlign="left";

ctx.textBaseline="alphabetic";

ctx.font="20px Arial";








let x=30;

let y=30;

let width=380;

let height=500;








ctx.fillStyle=
"rgba(0,0,0,0.85)";


ctx.fillRect(
x,
y,
width,
height
);







ctx.strokeStyle="white";


ctx.lineWidth=3;



ctx.strokeRect(
x,
y,
width,
height
);








ctx.fillStyle="white";


ctx.font="28px Arial";


ctx.fillText(

"Rucksack",

x+20,

y+40

);







ctx.font="20px Arial";


let offset=85;
for(
let i=0;
i<this.items.length;
i++
){





let entry =
this.items[i];







if(
entry===this.selectedItem
){


ctx.fillStyle="yellow";


}
else{


ctx.fillStyle="white";


}








ctx.fillText(

entry.item.icon+
" "+
entry.item.name+
(
entry.amount
?
" x"+entry.amount
:
""
),


x+20,


y+offset


);



offset+=35;



}







// ======================
// CANVAS ZUSTAND ZURÜCKSETZEN
// ======================


ctx.restore();





}









getItemAtMouse(x,y){



let startY=80;



let index =
Math.floor(
(y-startY)/35
);



if(
index<0 ||
index>=this.items.length
)
return null;



return index;



}



}