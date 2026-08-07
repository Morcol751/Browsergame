import {World} from "./world.js";
import {Player} from "./player.js";
import {Camera} from "./camera.js";
import {Renderer} from "./renderer.js";
import {Minimap} from "./minimap.js";

import {Inventory} from "./inventory.js";
import {Input} from "./input.js";
import {Hotbar} from "./hotbar.js";
import {Crafting} from "./crafting.js";
import {Backpack} from "./backpack.js";

import {AudioManager} from "./audio.js";

import {BuildingSystem} from "./building.js";
import {BuildingInteraction} from "./buildinginteraction.js";
import {Workbench} from "./workbench.js";
import {Furnace} from "./furnace.js";

import {ITEMS} from "./items.js";
import {Console} from "./console.js";

import {WorldMap} from "./worldmap.js";

import {SaveManager} from "./save.js";







export class Game{







constructor(){







this.canvas =
document.getElementById("game");





this.ctx =
this.canvas.getContext("2d");









// ======================
// AUDIO
// ======================


this.audio =
new AudioManager();




this.settingsOpen=false;


this.draggingSlider=false;









// ======================
// MINIMAP
// ======================


this.radar =
document.getElementById("radar");



this.minimap =
new Minimap(
this.radar
);





// ======================
// DEV KONSOLE
// ======================


this.items =
ITEMS;


this.console =
new Console(
this
);



// ======================
// INVENTAR
// ======================


this.backpack =
new Backpack(
this.audio
);



this.inventory =
new Inventory(
this.backpack
);



this.crafting =
new Crafting(
this.backpack
);


this.workbench =
new Workbench(
this.backpack,
this.audio,
this
);


this.furnace =
new Furnace(
this.backpack,
this.audio,
this
);






// ======================
// WORLD
// ======================


this.world =
new World(
2500,
2500
);


this.worldMap =
new WorldMap(
this.world
);

this.save =
new SaveManager(
this
);




// ======================
// BUILDING
// ======================


this.building =
new BuildingSystem(
this.world,
this.inventory
);









// ======================
// INPUT
// ======================


this.input =
new Input(
this.inventory,
this
);









// ======================
// HOTBAR
// ======================


this.hotbar =
new Hotbar(

this.inventory,

this.backpack,

this.crafting,

this.building

);









// ======================
// PLAYER
// ======================


this.player =
new Player(

1250,

1250,

this.audio

);


this.buildingInteraction =
new BuildingInteraction(
this.player,
this.building,
this.backpack,
this.workbench,
this.furnace
);






// ======================
// CAMERA
// ======================


this.camera =
new Camera();


this.building.setCamera(
this.camera,
this.canvas
);






// ======================
// RENDERER
// ======================


this.renderer =
new Renderer(
this.ctx,
this.items
);









this.mouseX=0;

this.mouseY=0;









// ======================
// RESIZE
// ======================


this.resize();



window.addEventListener(
"resize",
()=>this.resize()
);









// ======================
// MOUSE
// ======================


this.canvas.addEventListener(
"mousemove",
(e)=>{


let rect =
this.canvas.getBoundingClientRect();



this.mouseX =
e.clientX-rect.left;


this.mouseY =
e.clientY-rect.top;





if(
this.settingsOpen &&
this.draggingSlider
){

this.updateSliders();

}



});













// ======================
// KLICK
// ======================


this.canvas.addEventListener(
"mousedown",
(e)=>{


if(e.button!==0)
return;







// Gebäude platzieren


if(
this.building.placing
){


this.building.place();


return;


}







// Zahnrad


let gearX =
this.canvas.width-90;


let gearY =
this.canvas.height-90;




if(

this.mouseX>=gearX &&

this.mouseX<=gearX+60 &&

this.mouseY>=gearY &&

this.mouseY<=gearY+60

){


this.toggleSettings();


return;


}







if(
this.save
){

this.save.click(
this.mouseX,
this.mouseY,
this.canvas
);


}

if(this.settingsOpen){


this.draggingSlider=true;


this.updateSliders();


}



});









window.addEventListener(
"mouseup",
()=>{


this.draggingSlider=false;


});





}






resize(){



this.canvas.width =
window.innerWidth;



this.canvas.height =
window.innerHeight;



}









toggleSettings(){



this.settingsOpen =
!this.settingsOpen;



}









updateSliders(){



let width=420;


let height=280;



let x =
this.canvas.width/2-width/2;



let y =
this.canvas.height/2-height/2+120;









// MUSIK


if(

this.mouseY>=y+115 &&

this.mouseY<=y+135

){



let value =

(
this.mouseX-(x+80)
)
/260;



value =
Math.max(
0,
Math.min(
1,
value
)
);



this.audio.setMusicVolume(
value
);



}









// SOUNDS


if(

this.mouseY>=y+185 &&

this.mouseY<=y+205

){



let value =

(
this.mouseX-(x+80)
)
/260;



value =
Math.max(
0,
Math.min(
1,
value
)
);



this.audio.setSoundVolume(
value
);



}



}









start(){



let enableAudio = ()=>{


this.audio.startMusic();



window.removeEventListener(
"click",
enableAudio
);



window.removeEventListener(
"keydown",
enableAudio
);



};






window.addEventListener(
"click",
enableAudio
);



window.addEventListener(
"keydown",
enableAudio
);




this.loop();



}









loop(){



this.update();



this.draw();



requestAnimationFrame(
()=>this.loop()
);



}









update(){



if(
this.settingsOpen ||
this.workbench.open ||
this.furnace.open ||
this.worldMap.open
)
return;







this.player.update(
this.world
);





this.camera.update(
this.player
);









this.player.setMouse(

this.mouseX,

this.mouseY

);









// Building Position aktualisieren


this.building.update(

this.camera,

this.canvas

);

this.buildingInteraction.update();







if(this.player.mining){



this.player.mine(

this.world,

this.camera,

this.canvas,

this.inventory,

this.backpack

);



}



}









draw(){



this.renderer.draw(



this.world,


this.player,


this.camera,


this.canvas,


this.mouseX,


this.mouseY,


this.audio,


this.settingsOpen



);










// Gebäude Vorschau


this.building.drawPreview(

this.ctx

);









this.minimap.draw(

this.world,

this.player

);





this.buildingInteraction.draw(
this.ctx,
this.canvas
);



this.hotbar.draw(

this.ctx,

this.canvas

);









this.backpack.draw(

this.ctx

);









this.crafting.draw(

this.ctx,

this.canvas

);


this.workbench.draw(
this.ctx,
this.canvas
);


this.furnace.draw(
this.ctx,
this.canvas
);


this.console.draw(
this.ctx
);

this.worldMap.draw(
this.player
);


this.worldMap.render(
this.ctx,
this.canvas
);

this.save.draw(
this.ctx,
this.canvas
);

}





}