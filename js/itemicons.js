const iconCache = new Map();

export function getItemIcon(item){

if(!item || !item.icon)
return null;

if(iconCache.has(item.icon))
return iconCache.get(item.icon);

let img = new Image();
img.src = item.icon;
iconCache.set(item.icon,img);

return img;

}

export function drawItemIcon(ctx,item,x,y,size=28){

let img = getItemIcon(item);

if(!img || !img.complete || img.naturalWidth===0)
return false;

ctx.drawImage(
img,
Math.round(x),
Math.round(y),
size,
size
);

return true;

}

export function drawIngredientLine(ctx,ingredients,x,y){

let cursor=x;

ctx.textAlign="left";
ctx.textBaseline="middle";
ctx.font="16px Arial";

ingredients.forEach((ing,index)=>{

let amountText=ing.amount+"x";
ctx.fillText(amountText,cursor,y);
cursor+=ctx.measureText(amountText).width+5;

drawItemIcon(ctx,ing.item,cursor,y-11,22);
cursor+=27;

ctx.fillText(ing.item.name,cursor,y);
cursor+=ctx.measureText(ing.item.name).width;

if(index<ingredients.length-1){
ctx.fillText(" + ",cursor,y);
cursor+=ctx.measureText(" + ").width;
}

});

}
