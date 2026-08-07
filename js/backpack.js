import {drawItemIcon} from "./itemicons.js";

export class Backpack{

constructor(audio){

this.audio=audio;
this.open=false;
this.items=[];
this.selectedItem=null;

// Backpack-Kategorien
this.category="Ressourcen";
this.categories=[
    {name:"Ressourcen",type:"resource"},
    {name:"Werkzeuge",type:"tool"},
    {name:"Platzierbares",type:"building"}
];

// Scrollposition wird pro Kategorie getrennt gespeichert
this.scrollByCategory={
    Ressourcen:0,
    Werkzeuge:0,
    Platzierbares:0
};

this.rowHeight=42;

window.addEventListener("keydown",(e)=>{
    if(e.key.toLowerCase()==="b"){
        this.open=!this.open;
    }
});

window.addEventListener("wheel",(e)=>{
    if(!this.open)
    return;

    let canvas=document.getElementById("game");
    if(!canvas)
    return;

    let rect=canvas.getBoundingClientRect();
    let mouseX=e.clientX-rect.left;
    let mouseY=e.clientY-rect.top;
    let l=this.getLayout();

    // Nur scrollen, wenn die Maus wirklich über der Itemliste ist
    if(
        mouseX>=l.listX &&
        mouseX<=l.listX+l.listWidth &&
        mouseY>=l.listY &&
        mouseY<=l.listY+l.listHeight
    ){
        let maxScroll=this.getMaxScroll();
        let current=this.scrollByCategory[this.category] || 0;

        current+=Math.sign(e.deltaY)*this.rowHeight;
        current=Math.max(0,Math.min(current,maxScroll));

        this.scrollByCategory[this.category]=current;
        e.preventDefault();
    }
},{passive:false});

}


getLayout(){

const x=30;
const y=30;
const width=500;
const height=500;

return{
    x,
    y,
    width,
    height,
    categoryY:y+58,
    categoryHeight:42,
    listX:x+20,
    listY:y+120,
    listWidth:width-40,
    listHeight:height-165
};

}


getCurrentType(){

let category=this.categories.find(c=>c.name===this.category);
return category ? category.type : "resource";

}


getFilteredItems(){

let type=this.getCurrentType();

return this.items
.map((entry,index)=>({entry,index}))
.filter(data=>data.entry.item.type===type);

}


getMaxScroll(){

let itemCount=this.getFilteredItems().length;
let contentHeight=itemCount*this.rowHeight;
let l=this.getLayout();

return Math.max(0,contentHeight-l.listHeight);

}


add(item,amount=1){

if(item.type==="tool"){
    this.items.push({item:item,amount:1});
    return;
}

let existing=this.items.find(entry=>entry.item.id===item.id);

if(existing){
    existing.amount+=amount;
}
else{
    this.items.push({item:item,amount:amount});
}

}


removeItem(item){

let index=this.items.findIndex(entry=>entry.item.id===item.id);

if(index===-1)
return;

let entry=this.items[index];
entry.amount--;

if(entry.amount<=0){
    this.items.splice(index,1);
}

if(
    this.selectedItem &&
    this.selectedItem.item.id===item.id
){
    this.selectedItem=null;
}

// Nach dem Entfernen Scrollposition wieder in gültigen Bereich bringen
let maxScroll=this.getMaxScroll();
this.scrollByCategory[this.category]=Math.min(
    this.scrollByCategory[this.category] || 0,
    maxScroll
);

}


selectItem(index){

if(!this.items[index])
return;

this.selectedItem=this.items[index];

}


clearSelection(){
this.selectedItem=null;
}


handleClick(mouseX,mouseY){

if(!this.open)
return false;

let l=this.getLayout();

// =====================
// KATEGORIEN
// =====================

const gap=8;
const innerWidth=l.width-40;
const buttonWidth=(innerWidth-gap*2)/3;

for(let i=0;i<this.categories.length;i++){

    let buttonX=l.x+20+i*(buttonWidth+gap);
    let buttonY=l.categoryY;

    if(
        mouseX>=buttonX &&
        mouseX<=buttonX+buttonWidth &&
        mouseY>=buttonY &&
        mouseY<=buttonY+l.categoryHeight
    ){
        this.category=this.categories[i].name;
        this.selectedItem=null;
        return true;
    }
}

// =====================
// ITEM
// =====================

let index=this.getItemAtMouse(mouseX,mouseY);

if(index!==null){
    this.selectItem(index);
    return true;
}

// Klick innerhalb des Backpacks soll nicht auf die Welt durchgehen
return(
    mouseX>=l.x &&
    mouseX<=l.x+l.width &&
    mouseY>=l.y &&
    mouseY<=l.y+l.height
);

}


draw(ctx){

if(!this.open)
return;

let l=this.getLayout();

ctx.save();
ctx.textAlign="left";
ctx.textBaseline="alphabetic";

// =====================
// BACKPACK BOX
// =====================

ctx.fillStyle="rgba(0,0,0,0.88)";
ctx.fillRect(l.x,l.y,l.width,l.height);

ctx.strokeStyle="white";
ctx.lineWidth=3;
ctx.strokeRect(l.x,l.y,l.width,l.height);

ctx.fillStyle="white";
ctx.font="28px Arial";
ctx.fillText("Rucksack",l.x+20,l.y+38);

// =====================
// KATEGORIEN
// =====================

const gap=8;
const innerWidth=l.width-40;
const buttonWidth=(innerWidth-gap*2)/3;

ctx.font="16px Arial";
ctx.textAlign="center";
ctx.textBaseline="middle";

this.categories.forEach((cat,i)=>{

    let buttonX=l.x+20+i*(buttonWidth+gap);
    let buttonY=l.categoryY;

    ctx.fillStyle=this.category===cat.name ? "#555" : "#292929";
    ctx.fillRect(buttonX,buttonY,buttonWidth,l.categoryHeight);

    ctx.strokeStyle=this.category===cat.name ? "yellow" : "#777";
    ctx.lineWidth=2;
    ctx.strokeRect(buttonX,buttonY,buttonWidth,l.categoryHeight);

    ctx.fillStyle=this.category===cat.name ? "yellow" : "white";
    ctx.fillText(
        cat.name,
        buttonX+buttonWidth/2,
        buttonY+l.categoryHeight/2
    );
});

// =====================
// ITEMLISTE - CLIPPING
// =====================

let filtered=this.getFilteredItems();
let scroll=this.scrollByCategory[this.category] || 0;
let maxScroll=this.getMaxScroll();

if(scroll>maxScroll){
    scroll=maxScroll;
    this.scrollByCategory[this.category]=scroll;
}

ctx.save();
ctx.beginPath();
ctx.rect(l.listX,l.listY,l.listWidth,l.listHeight);
ctx.clip();

ctx.textAlign="left";
ctx.textBaseline="middle";
ctx.font="18px Arial";

filtered.forEach((data,visibleIndex)=>{

    let entry=data.entry;
    let rowY=l.listY+visibleIndex*this.rowHeight-scroll;

    // Zeilen außerhalb des sichtbaren Bereichs gar nicht erst zeichnen
    if(
        rowY+this.rowHeight<l.listY ||
        rowY>l.listY+l.listHeight
    )
    return;

    if(entry===this.selectedItem){
        ctx.fillStyle="rgba(255,255,0,0.14)";
        ctx.fillRect(l.listX,rowY,l.listWidth,this.rowHeight-2);
    }

    drawItemIcon(
        ctx,
        entry.item,
        l.listX+6,
        rowY+5,
        30
    );

    ctx.fillStyle=entry===this.selectedItem ? "yellow" : "white";

    let amountText=(entry.amount!==undefined && entry.amount!==null)
        ? " x"+entry.amount
        : "";

    ctx.fillText(
        entry.item.name+amountText,
        l.listX+48,
        rowY+this.rowHeight/2
    );

});

ctx.restore();

// =====================
// SCROLLBAR
// =====================

if(maxScroll>0){

    const barX=l.listX+l.listWidth-7;
    const barY=l.listY;
    const barWidth=5;
    const barHeight=l.listHeight;

    ctx.fillStyle="#333";
    ctx.fillRect(barX,barY,barWidth,barHeight);

    let contentHeight=filtered.length*this.rowHeight;
    let thumbHeight=Math.max(30,barHeight*(barHeight/contentHeight));
    let thumbTravel=barHeight-thumbHeight;
    let thumbY=barY+(scroll/maxScroll)*thumbTravel;

    ctx.fillStyle="#aaa";
    ctx.fillRect(barX,thumbY,barWidth,thumbHeight);
}

// Untere Hilfezeile
ctx.textAlign="left";
ctx.textBaseline="alphabetic";
ctx.font="14px Arial";
ctx.fillStyle="#bbb";

let help=maxScroll>0
    ? "Mausrad: Scrollen   •   B: Schließen"
    : "B: Schließen";

ctx.fillText(help,l.x+20,l.y+l.height-15);

ctx.restore();

}


getItemAtMouse(x,y){

let l=this.getLayout();

if(
    x<l.listX ||
    x>l.listX+l.listWidth ||
    y<l.listY ||
    y>l.listY+l.listHeight
)
return null;

let scroll=this.scrollByCategory[this.category] || 0;
let visibleIndex=Math.floor((y-l.listY+scroll)/this.rowHeight);
let filtered=this.getFilteredItems();

if(
    visibleIndex<0 ||
    visibleIndex>=filtered.length
)
return null;

return filtered[visibleIndex].index;

}

}
