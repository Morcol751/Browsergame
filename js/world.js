export class World{


constructor(width,height){


this.width=width;
this.height=height;


this.spawnX=width/2;
this.spawnY=height/2;


this.tiles=[];

this.veins=[];

this.grassRotation=[];




for(let y=0;y<this.height;y++){


this.tiles[y]=[];

this.grassRotation[y]=[];


for(let x=0;x<this.width;x++){


this.tiles[y][x]=0;


// zufällige Drehung für Gras
this.grassRotation[y][x] =
Math.floor(Math.random()*4);


}


}



this.generateOres();

this.generateTrees();

this.generateStone();



}









generateOres(){


let totalVeins=500;



for(let i=0;i<totalVeins;i++){



let x;
let y;


let tries=0;



do{


x=Math.floor(
Math.random()*this.width
);


y=Math.floor(
Math.random()*this.height
);



tries++;


}
while(

this.distanceFromSpawn(x,y)<80
&&
tries<100

);





if(this.isTooClose(x,y))
continue;





let distance =
this.distanceFromSpawn(x,y);



let ore =
this.chooseOre(distance);





let size =
this.getVeinSize(ore);





this.createVein(

x,

y,

ore,

size

);





this.veins.push({

x:x,

y:y

});



}



}









generateTrees(){


let forests = 200;




for(let i=0;i<forests;i++){



let centerX =
Math.floor(
Math.random()*this.width
);



let centerY =
Math.floor(
Math.random()*this.width
);





if(
this.distanceFromSpawn(centerX,centerY)<80
)
continue;





let size =
Math.floor(
Math.random()*6
)+8;








for(
let x=-size;
x<=size;
x++
){



for(
let y=-size;
y<=size;
y++
){



let distance =
Math.sqrt(
x*x+y*y
);





if(distance>size)
continue;





let chance =
1-(distance/size);





if(
Math.random()>chance
)
continue;





let treeX =
centerX+x;



let treeY =
centerY+y;





if(

treeX<0 ||
treeY<0 ||
treeX>=this.width ||
treeY>=this.height

)
continue;






if(
this.tiles[treeY][treeX]!==0
)
continue;







this.tiles[treeY][treeX]={


ore:1,

quality:this.generateWoodQuality()


};




}



}



}



}









generateStone(){


let stones = 700;



for(let i=0;i<stones;i++){



let x =
Math.floor(
Math.random()*this.width
);



let y =
Math.floor(
Math.random()*this.height
);





if(
this.distanceFromSpawn(x,y)<100
)
continue;





if(
this.tiles[y][x]!==0
)
continue;





let size =
Math.floor(
Math.random()*6
)+4;






for(
let dx=-size;
dx<=size;
dx++
){



for(
let dy=-size;
dy<=size;
dy++
){



let distance =
Math.sqrt(
dx*dx+
dy*dy
);






if(distance>size)
continue;






let chance =
1-(distance/size);






if(
Math.random()>chance
)
continue;







let sx=x+dx;

let sy=y+dy;






if(
sx<0 ||
sy<0 ||
sx>=this.width ||
sy>=this.height
)
continue;







if(
this.tiles[sy][sx]!==0
)
continue;








this.tiles[sy][sx]={


ore:12,


quality:this.generateStoneQuality()



};




}



}



}



}

distanceFromSpawn(x,y){


let dx=x-this.spawnX;

let dy=y-this.spawnY;



return Math.sqrt(

dx*dx+

dy*dy

);



}









chooseOre(distance){


let bonus =
distance/900;


let r=Math.random();





if(r < 0.1+bonus*0.015)
return 11;



if(r < 0.2+bonus*0.025)
return 10;



if(r < 0.3+bonus*0.05)
return 9;



if(r < 0.4+bonus*0.08)
return 8;



if(r < 0.5+bonus*0.10)
return 7;



if(r < 0.60+bonus*0.12)
return 6;



if(r < 0.70+bonus*0.15)
return 5;



if(r < 0.8)
return 4;



if(r < 0.90)
return 3;



return 2;



}









getVeinSize(type){


switch(type){


case 2:return 7;

case 3:return 6;

case 4:return 6;

case 5:return 6;

case 6:return 5;

case 7:return 5;

case 8:return 5;

case 9:return 4;

case 10:return 4;

case 11:return 3;


}



}









isTooClose(x,y){



for(let v of this.veins){


let dx=x-v.x;

let dy=y-v.y;


let d=Math.sqrt(
dx*dx+
dy*dy
);



if(d<50)
return true;



}



return false;



}









createVein(x,y,type,size){



for(
let dx=-size;
dx<=size;
dx++
){



for(
let dy=-size;
dy<=size;
dy++
){



let dist =
Math.sqrt(
dx*dx+
dy*dy
);






if(

dist<size &&

Math.random()>0.25

){



let nx=x+dx;

let ny=y+dy;






if(

nx>=0 &&
ny>=0 &&
nx<this.width &&
ny<this.height

){



this.tiles[ny][nx]={


ore:type,

quality:this.generateQuality()


};



}



}



}



}



}









generateQuality(){


let r=Math.random();




if(r<0.02)
return 3;




if(r<0.20)
return 2;




return 1;



}









generateWoodQuality(){


let r=Math.random();




if(r<0.005)
return 3;




if(r<0.10)
return 2;




return 1;



}









generateStoneQuality(){


let r=Math.random();




if(r<0.01)
return 3;




if(r<0.15)
return 2;




return 1;



}









getAmount(q){


if(q===3)
return 5;



if(q===2)
return 3;



return 1;



}









getTile(x,y){


if(

x<0 ||
y<0 ||
x>=this.width ||
y>=this.height

)
return 0;



return this.tiles[y][x];


}









getOreName(id){


return [

"Gras",

"Holz",

"Kohle",

"Kupfer",

"Eisen",

"Silber",

"Gold",

"Diamant",

"Kobalt",

"Mithril",

"Obsidian",

"Adamant",

"Stein"


][id];



}









getQualityName(id){


return [


"",

"Normal",

"Selten",

"Legendär"


][id];



}









removeTile(x,y){


if(

x<0 ||
y<0 ||
x>=this.width ||
y>=this.height

)
return;



this.tiles[y][x]=0;



}



}