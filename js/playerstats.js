export class PlayerStats{


constructor(game){


this.game=game;


// ======================
// STARTSTATS
// ======================

this.maxHP=100;
this.hp=100;

this.attack=5;
this.defense=2;
this.speed=5;


// ======================
// AUSDAUER
// ======================

this.maxStamina=100;
this.stamina=100;

this.staminaDrainPerSecond=12;
this.staminaRegenPerSecond=0.30;


// Gesundheit regeneriert außerhalb des Kampfes
// sehr langsam: 1 HP alle 10 Sekunden.

this.hpRegenPerSecond=0.10;


this.maxHunger=100;
this.hunger=100;

this.maxThirst=100;
this.thirst=100;


// Volle Balken halten ungefähr:
// Hunger: 30 Minuten
// Durst: 20 Minuten

this.hungerDrainPerSecond=
100/(30*60);

this.thirstDrainPerSecond=
100/(20*60);


// Bei leerem Hunger/Durst:
// 2 Schaden alle 3 Sekunden je leerem Wert.
// Beide leer = 4 Schaden.

this.survivalDamagePerEmptyStat=2;
this.survivalDamageInterval=3000;

this.lastUpdate=performance.now();
this.lastSurvivalDamage=Date.now();


// ======================
// TOD / RESPAWN
// ======================

this.dying=false;

this.deathStart=0;

this.deathDuration=5000;

this.respawnHP=10;


this.panelOpen=false;


this.button={

x:20,
y:142,
width:130,
height:38

};



window.addEventListener(
"keydown",
(e)=>{


if(
e.key.toLowerCase()==="p"
){


if(
this.game &&
this.game.combat &&
this.game.combat.active
)
return;


e.preventDefault();
e.stopImmediatePropagation();


this.togglePanel();


return;


}


if(
e.key==="Escape" &&
this.panelOpen
){


e.preventDefault();
e.stopImmediatePropagation();


this.closePanel();


}


},
true
);


}



togglePanel(){


this.panelOpen=
!this.panelOpen;


if(this.game){

this.game.inputLocked=
this.panelOpen;

}


}



closePanel(){


this.panelOpen=false;


if(this.game){

this.game.inputLocked=false;

}


}



update(){


let now=performance.now();

let dt=
Math.min(
1,
(now-this.lastUpdate)/1000
);

this.lastUpdate=now;


// Während der Tod-Sequenz läuft nur der Schwarzbild-Timer.

if(this.dying){


this.updateDeath();


return;


}


let inCombat=
!!(
this.game &&
this.game.combat &&
this.game.combat.active
);


let sprinting=
!!(
this.game &&
this.game.player &&
this.game.player.isSprinting
);


// ======================
// AUSDAUER-REGENERATION
// ======================
// Läuft außerhalb UND innerhalb eines Kampfes.
// Nur beim tatsächlichen Sprinten wird nicht regeneriert.

if(!sprinting){


this.stamina=
Math.min(
this.maxStamina,
this.stamina+
this.staminaRegenPerSecond*dt
);


}


// ======================
// LANGSAME HP-REGENERATION
// ======================
// Nur außerhalb eines Kampfes.

if(
!inCombat &&
this.hp>0 &&
this.hp<this.maxHP
){


this.hp=
Math.min(
this.maxHP,
this.hp+
this.hpRegenPerSecond*dt
);


}


// Hunger und Durst pausieren im Kampf und Intro.

if(
inCombat ||
(
this.game &&
this.game.intro &&
this.game.intro.active
)
)
return;


// In Menüs pausieren Hunger/Durst ebenfalls.

if(
this.panelOpen ||
(this.game && (
this.game.settingsOpen ||
(this.game.workbench && this.game.workbench.open) ||
(this.game.furnace && this.game.furnace.open) ||
(this.game.mechanicalWorkbench && this.game.mechanicalWorkbench.open) ||
(this.game.cookingStation && this.game.cookingStation.open) ||
(this.game.worldMap && this.game.worldMap.open)
))
)
return;


this.hunger=
Math.max(
0,
this.hunger-
this.hungerDrainPerSecond*dt
);


this.thirst=
Math.max(
0,
this.thirst-
this.thirstDrainPerSecond*dt
);


// ======================
// HUNGER / DURST SCHADEN
// ======================

let emptyCount=0;


if(this.hunger<=0)
emptyCount++;


if(this.thirst<=0)
emptyCount++;


if(
emptyCount>0 &&
Date.now()-this.lastSurvivalDamage>=
this.survivalDamageInterval
){


this.lastSurvivalDamage=Date.now();


this.takeDamage(
this.survivalDamagePerEmptyStat*
emptyCount
);


}


}


useStamina(amount){


amount=
Math.max(
0,
Number(amount) || 0
);


if(amount<=0)
return true;


if(this.stamina<=0)
return false;


this.stamina=
Math.max(
0,
this.stamina-amount
);


return this.stamina>0;


}



canSprint(){


return (
this.stamina>0.01
);


}



takeDamage(amount){


amount=
Math.max(
0,
Math.floor(amount)
);


if(amount<=0)
return;


this.hp=
Math.max(
0,
this.hp-amount
);


if(this.hp<=0){


this.handleCollapse();


}


}



heal(amount){


this.hp=
Math.min(
this.maxHP,
this.hp+Math.max(0,amount)
);


}



handleCollapse(){


if(this.dying)
return;


this.dying=true;

this.deathStart=
performance.now();


this.hp=0;


this.panelOpen=false;


// Alles sperren.

if(this.game){


this.game.inputLocked=true;


}


// Bewegung sofort stoppen.

if(
this.game &&
this.game.player
){


this.game.player.isSprinting=false;

this.game.player.walking=false;


if(this.game.player.keys){


for(
let key in this.game.player.keys
){


this.game.player.keys[key]=false;


}


}


}


// Falls der Tod im Kampf passiert,
// Kampf beenden und das beteiligte Monster entfernen.

if(
this.game &&
this.game.combat &&
this.game.combat.active
){


this.game.combat.finishCombat(
"defeat"
);


// finishCombat entsperrt normalerweise den Input.
// Während der Tod-Sequenz muss er aber gesperrt bleiben.

this.game.inputLocked=true;


}


}





updateDeath(){


if(!this.dying)
return;


let elapsed=
performance.now()-
this.deathStart;


if(elapsed<this.deathDuration)
return;


// ======================
// RESPAWN
// ======================

if(
this.game &&
this.game.player &&
this.game.world
){


this.game.player.x=
this.game.world.spawnX;


this.game.player.y=
this.game.world.spawnY;


}


// Nur 10 Leben nach dem Tod.

this.hp=
Math.min(
this.maxHP,
this.respawnHP
);


// Sprint soll nach Respawn nicht direkt weitergehen.

if(
this.game &&
this.game.player
){


this.game.player.isSprinting=false;


}


// Tod-Sequenz beenden.

this.dying=false;

this.deathStart=0;


this.lastUpdate=
performance.now();


this.lastSurvivalDamage=
Date.now();


if(this.game){


this.game.inputLocked=false;


}


if(
this.game &&
this.game.player
){


this.game.player.message=
"Du bist am Spawn wieder aufgewacht.";


this.game.player.messageTime=
Date.now()+3000;


}


}





drawDeathOverlay(ctx,canvas){


if(!this.dying)
return;


let elapsed=
performance.now()-
this.deathStart;


// Kurzes Einblenden ins Schwarze.
// Nach ca. 350 ms ist der Bildschirm komplett schwarz.

let alpha=
Math.min(
1,
elapsed/350
);


ctx.save();


ctx.fillStyle=
"rgba(0,0,0,"+
alpha+
")";


ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);


// Sobald es fast schwarz ist, kleiner Hinweis.

if(alpha>0.85){


ctx.fillStyle=
"rgba(255,255,255,"+
Math.min(
1,
(elapsed-300)/350
)+
")";


ctx.font=
"24px Arial";


ctx.textAlign=
"center";


ctx.textBaseline=
"middle";


ctx.fillText(
"Du bist zusammengebrochen ...",
canvas.width/2,
canvas.height/2
);


}


ctx.restore();


}


exportData(){


return {

maxHP:this.maxHP,
hp:this.hp,

attack:this.attack,
defense:this.defense,
speed:this.speed,

maxStamina:this.maxStamina,
stamina:this.stamina,

maxHunger:this.maxHunger,
hunger:this.hunger,

maxThirst:this.maxThirst,
thirst:this.thirst

};


}



importData(data){


if(!data)
return;


let numberOr=
(value,fallback)=>
Number.isFinite(value)
?
value
:
fallback;


this.maxHP=
Math.max(
1,
numberOr(data.maxHP,this.maxHP)
);


this.hp=
Math.max(
0,
Math.min(
this.maxHP,
numberOr(data.hp,this.hp)
)
);


this.attack=
Math.max(
0,
numberOr(data.attack,this.attack)
);


this.defense=
Math.max(
0,
numberOr(data.defense,this.defense)
);


this.speed=
Math.max(
1,
numberOr(data.speed,this.speed)
);


this.maxStamina=
Math.max(
1,
numberOr(data.maxStamina,this.maxStamina)
);


this.stamina=
Math.max(
0,
Math.min(
this.maxStamina,
numberOr(data.stamina,this.stamina)
)
);


this.maxHunger=
Math.max(
1,
numberOr(data.maxHunger,this.maxHunger)
);


this.hunger=
Math.max(
0,
Math.min(
this.maxHunger,
numberOr(data.hunger,this.hunger)
)
);


this.maxThirst=
Math.max(
1,
numberOr(data.maxThirst,this.maxThirst)
);


this.thirst=
Math.max(
0,
Math.min(
this.maxThirst,
numberOr(data.thirst,this.thirst)
)
);


this.lastUpdate=performance.now();

this.lastSurvivalDamage=Date.now();


this.dying=false;

this.deathStart=0;


}



handleClick(mx,my,canvas){


if(
this.game &&
this.game.combat &&
this.game.combat.active
)
return false;


if(
mx>=this.button.x &&
mx<=this.button.x+this.button.width &&
my>=this.button.y &&
my<=this.button.y+this.button.height
){


this.togglePanel();


return true;


}


return false;


}



drawBar(
ctx,
x,
y,
width,
height,
value,
maxValue,
fillColor,
label
){


let ratio=
Math.max(
0,
Math.min(
1,
value/maxValue
)
);


ctx.fillStyle=
"rgba(0,0,0,0.78)";


ctx.fillRect(
x,
y,
width,
height
);


ctx.fillStyle=
fillColor;


ctx.fillRect(
x+2,
y+2,
(width-4)*ratio,
height-4
);


ctx.strokeStyle="#bdbdbd";

ctx.lineWidth=2;


ctx.strokeRect(
x,
y,
width,
height
);


ctx.fillStyle="white";

ctx.font="bold 14px Arial";

ctx.textAlign="center";

ctx.textBaseline="middle";


ctx.fillText(
label+" - "+
Math.ceil(value)+"/"+
Math.ceil(maxValue),
x+width/2,
y+height/2
);


}



drawHUD(ctx,canvas){


ctx.save();


let x=20;
let y=20;
let width=250;
let barHeight=30;
let gap=8;


ctx.fillStyle=
"rgba(0,0,0,0.65)";


ctx.fillRect(
x-8,
y-8,
width+16,
barHeight*4+
gap*3+
16
);


this.drawBar(
ctx,
x,
y,
width,
barHeight,
this.hp,
this.maxHP,
"#c62828",
"Leben"
);


this.drawBar(
ctx,
x,
y+barHeight+gap,
width,
barHeight,
this.stamina,
this.maxStamina,
"#2e7d32",
"Ausdauer"
);


this.drawBar(
ctx,
x,
y+(barHeight+gap)*2,
width,
barHeight,
this.hunger,
this.maxHunger,
"#ef6c00",
"Hunger"
);


this.drawBar(
ctx,
x,
y+(barHeight+gap)*3,
width,
barHeight,
this.thirst,
this.maxThirst,
"#1976d2",
"Durst"
);


// ======================
// STATUS-BUTTON
// ======================

this.button.x=20;

this.button.y=
y+(barHeight+gap)*4+5;


ctx.fillStyle=
this.panelOpen
?
"#666"
:
"#303030";


ctx.fillRect(
this.button.x,
this.button.y,
this.button.width,
this.button.height
);


ctx.strokeStyle="#888";

ctx.lineWidth=2;


ctx.strokeRect(
this.button.x,
this.button.y,
this.button.width,
this.button.height
);


ctx.fillStyle="white";

ctx.font="17px Arial";

ctx.textAlign="center";

ctx.textBaseline="middle";


ctx.fillText(
"Status [P]",
this.button.x+
this.button.width/2,
this.button.y+
this.button.height/2
);


ctx.restore();


}



drawPanel(ctx,canvas){


if(!this.panelOpen)
return;


let width=460;
let height=435;

let x=
canvas.width/2-
width/2;

let y=
canvas.height/2-
height/2;


ctx.save();


ctx.fillStyle=
"rgba(0,0,0,0.93)";


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

ctx.textAlign="center";

ctx.font="30px Arial";


ctx.fillText(
"Spielerstatus",
canvas.width/2,
y+45
);


ctx.textAlign="left";

ctx.font="21px Arial";


let rows=[

["Leben",Math.ceil(this.hp)+" / "+this.maxHP],
["Ausdauer",Math.ceil(this.stamina)+" / "+this.maxStamina],
["Angriff",this.attack],
["Verteidigung",this.defense],
["Geschwindigkeit",this.speed],
["Hunger",Math.ceil(this.hunger)+" / "+this.maxHunger],
["Durst",Math.ceil(this.thirst)+" / "+this.maxThirst]

];


rows.forEach(
(row,i)=>{


let rowY=
y+100+
i*42;


ctx.fillStyle=
i%2===0
?
"rgba(255,255,255,0.06)"
:
"rgba(255,255,255,0.02)";


ctx.fillRect(
x+35,
rowY-26,
width-70,
34
);


ctx.fillStyle="white";


ctx.fillText(
row[0],
x+55,
rowY
);


ctx.textAlign="right";


ctx.fillText(
String(row[1]),
x+width-55,
rowY
);


ctx.textAlign="left";


}
);


ctx.font="15px Arial";

ctx.fillStyle="#ccc";

ctx.textAlign="center";


ctx.fillText(
"[P] oder [ESC] schließen",
canvas.width/2,
y+height-28
);


ctx.restore();


}



draw(ctx,canvas){


this.drawHUD(
ctx,
canvas
);


this.drawPanel(
ctx,
canvas
);


}


}
