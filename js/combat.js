export class Combat{


constructor(game){


this.game=game;

this.active=false;

this.enemy=null;


this.playerATB=0;

this.enemyATB=0;


this.lastUpdate=performance.now();


this.message="";

this.messageUntil=0;


this.buttons={

attack:{x:0,y:0,width:170,height:48},

skills:{x:0,y:0,width:170,height:48},

flee:{x:0,y:0,width:170,height:48}

};


}



startCombat(enemy){


if(
this.active ||
!enemy
)
return false;


this.active=true;

this.enemy=enemy;


if(!Number.isFinite(enemy.maxHP))
enemy.maxHP=20;


if(!Number.isFinite(enemy.hp))
enemy.hp=enemy.maxHP;


if(!Number.isFinite(enemy.attack))
enemy.attack=4;


if(!Number.isFinite(enemy.defense))
enemy.defense=1;


if(!Number.isFinite(enemy.combatSpeed))
enemy.combatSpeed=4;


this.playerATB=0;

this.enemyATB=0;

this.lastUpdate=performance.now();


this.message=
enemy.name+" greift an!";

this.messageUntil=
Date.now()+1800;


if(this.game){


this.game.inputLocked=true;


if(
this.game.player &&
this.game.player.keys
){


for(
let key in this.game.player.keys
){


this.game.player.keys[key]=false;


}


}


}


return true;


}



update(){


if(
!this.active ||
!this.enemy ||
!this.game.playerStats
)
return;


let now=performance.now();


let dt=
Math.min(
100,
now-this.lastUpdate
);


this.lastUpdate=now;


let stats=
this.game.playerStats;


// ATB: Speed 5 braucht ungefähr 5 Sekunden.
// 100 ATB / (speed / 250 pro ms).

if(this.playerATB<100){


this.playerATB=
Math.min(
100,
this.playerATB+
dt*(stats.speed/250)
);


}


if(this.enemyATB<100){


this.enemyATB=
Math.min(
100,
this.enemyATB+
dt*(this.enemy.combatSpeed/250)
);


}


// Gegner greift automatisch an,
// sobald seine ATB voll ist.

if(this.enemyATB>=100){


this.enemyAttack();


}


}



enemyAttack(){


if(
!this.active ||
!this.enemy
)
return;


let stats=
this.game.playerStats;


let damage=
Math.max(
1,
Math.floor(
this.enemy.attack-
stats.defense
)
);


// Namen VOR dem Schaden sichern.
// takeDamage() kann bei 0 HP bereits die Tod-Sequenz
// starten und dadurch den Kampf beenden / this.enemy leeren.

let enemyName=
this.enemy.name;


stats.takeDamage(
damage
);


this.enemyATB=0;


// Wenn der Treffer tödlich war, hat handleCollapse()
// den Kampf bereits beendet.
// Deshalb hier SOFORT raus und niemals mehr
// auf this.enemy zugreifen.

if(
stats.hp<=0 ||
!this.active ||
!this.enemy
){


return;


}


this.message=
enemyName+
" verursacht "+
damage+
" Schaden!";


this.messageUntil=
Date.now()+1600;


}



playerAttack(){


if(
!this.active ||
this.playerATB<100 ||
!this.enemy
)
return;


let stats=
this.game.playerStats;


let damage=
Math.max(
1,
Math.floor(
stats.attack-
this.enemy.defense
)
);


this.enemy.hp=
Math.max(
0,
this.enemy.hp-damage
);


this.playerATB=0;


this.message=
"Du verursachst "+
damage+
" Schaden!";


this.messageUntil=
Date.now()+1600;


if(this.enemy.hp<=0){


this.finishCombat(
"victory"
);


}


}



useSkills(){


if(
!this.active ||
this.playerATB<100
)
return;


this.message=
"Noch keine Skills freigeschaltet.";


this.messageUntil=
Date.now()+1800;


// Skills sind noch leer.
// ATB wird deshalb NICHT verbraucht.


}



tryFlee(){


if(
!this.active ||
this.playerATB<100
)
return;


this.playerATB=0;


if(Math.random()<0.25){


this.message=
"Flucht gelungen!";


this.messageUntil=
Date.now()+900;


this.finishCombat(
"fled"
);


}
else{


this.message=
"Flucht fehlgeschlagen!";


this.messageUntil=
Date.now()+1600;


}


}



giveDrops(enemy){


if(
!enemy ||
!Array.isArray(enemy.drops)
)
return [];


let received=[];


for(let drop of enemy.drops){


if(
!drop ||
Math.random()>drop.chance
)
continue;


let min=
Math.max(
0,
Math.floor(drop.min ?? 1)
);


let max=
Math.max(
min,
Math.floor(drop.max ?? min)
);


let amount=
Math.floor(
Math.random()*
(max-min+1)
)
+
min;


let item=
this.game.items[
drop.item
];


if(
!item ||
amount<=0
)
continue;


this.game.backpack.add(
item,
amount
);


received.push(
amount+"x "+item.name
);


}


return received;


}





finishCombat(result){


if(!this.active)
return;


let enemy=
this.enemy;


let receivedDrops=[];


// Drops gibt es NUR bei einem Sieg.

if(
result==="victory" &&
enemy
){


receivedDrops=
this.giveDrops(
enemy
);


}


// Das beteiligte Monster ist nach JEDEM Kampf weg:
// Sieg, Flucht oder Niederlage.

if(
this.game.enemies &&
typeof this.game.enemies.removeEnemy==="function" &&
enemy
){


this.game.enemies.removeEnemy(
enemy
);


}


this.active=false;

this.enemy=null;

this.playerATB=0;

this.enemyATB=0;


if(this.game){


this.game.inputLocked=
!!(
this.game.playerStats &&
this.game.playerStats.dying
);


}


if(
result==="victory" &&
this.game.player
){


this.game.player.message=
receivedDrops.length>0
?
"Alien-Krabbler besiegt! Beute: "+
receivedDrops.join(", ")
:
"Alien-Krabbler besiegt! Keine Beute.";


this.game.player.messageTime=
Date.now()+2500;


}


if(
result==="fled" &&
this.game.player
){


this.game.player.message=
"Flucht gelungen!";


this.game.player.messageTime=
Date.now()+2200;


}


}



handleClick(mx,my,canvas){


if(!this.active)
return false;


let ready=
this.playerATB>=100;


for(
let [name,button] of Object.entries(this.buttons)
){


if(
mx>=button.x &&
mx<=button.x+button.width &&
my>=button.y &&
my<=button.y+button.height
){


if(!ready)
return true;


if(name==="attack")
this.playerAttack();


if(name==="skills")
this.useSkills();


if(name==="flee")
this.tryFlee();


return true;


}


}


return true;


}



drawBar(
ctx,
x,
y,
width,
height,
value,
max,
color,
text
){


let ratio=
Math.max(
0,
Math.min(
1,
value/max
)
);


ctx.fillStyle="#181818";


ctx.fillRect(
x,
y,
width,
height
);


ctx.fillStyle=color;


ctx.fillRect(
x+2,
y+2,
(width-4)*ratio,
height-4
);


ctx.strokeStyle="#888";

ctx.lineWidth=2;


ctx.strokeRect(
x,
y,
width,
height
);


ctx.fillStyle="white";

ctx.font="bold 15px Arial";

ctx.textAlign="center";

ctx.textBaseline="middle";


ctx.fillText(
text,
x+width/2,
y+height/2
);


}



draw(ctx,canvas){


if(
!this.active ||
!this.enemy ||
!this.game.playerStats
)
return;


let stats=
this.game.playerStats;


ctx.save();


// Gesamte Welt abdunkeln.

ctx.fillStyle=
"rgba(0,0,0,0.88)";


ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);


let width=
Math.min(
900,
canvas.width-50
);


let height=
Math.min(
600,
canvas.height-50
);


let x=
canvas.width/2-
width/2;


let y=
canvas.height/2-
height/2;


ctx.fillStyle=
"#111";


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


// ======================
// TITEL
// ======================

ctx.fillStyle="white";

ctx.textAlign="center";

ctx.font="32px Arial";


ctx.fillText(
"Kampf",
canvas.width/2,
y+48
);


// ======================
// GEGNER
// ======================

ctx.font="25px Arial";


ctx.fillText(
this.enemy.name,
canvas.width/2,
y+100
);


let barWidth=
Math.min(
440,
width-120
);


this.drawBar(
ctx,
canvas.width/2-barWidth/2,
y+125,
barWidth,
30,
this.enemy.hp,
this.enemy.maxHP,
"#9c27b0",
"HP - "+
Math.ceil(this.enemy.hp)+"/"+
this.enemy.maxHP
);


this.drawBar(
ctx,
canvas.width/2-barWidth/2,
y+170,
barWidth,
24,
this.enemyATB,
100,
"#f44336",
"ATB"
);


// ======================
// SPIELER
// ======================

ctx.font="23px Arial";


ctx.fillText(
"Spieler",
canvas.width/2,
y+250
);


this.drawBar(
ctx,
canvas.width/2-barWidth/2,
y+275,
barWidth,
30,
stats.hp,
stats.maxHP,
"#c62828",
"Leben - "+
Math.ceil(stats.hp)+"/"+
stats.maxHP
);


this.drawBar(
ctx,
canvas.width/2-barWidth/2,
y+320,
barWidth,
24,
stats.stamina,
stats.maxStamina,
"#2e7d32",
"Ausdauer - "+
Math.ceil(stats.stamina)+"/"+
stats.maxStamina
);


this.drawBar(
ctx,
canvas.width/2-barWidth/2,
y+358,
barWidth,
24,
this.playerATB,
100,
"#4caf50",
"ATB"
);


// ======================
// MELDUNG
// ======================

ctx.font="18px Arial";

ctx.fillStyle=
Date.now()<this.messageUntil
?
"#ffd54f"
:
"#bbb";


ctx.fillText(
Date.now()<this.messageUntil
?
this.message
:
(
this.playerATB>=100
?
"Du bist am Zug."
:
"ATB lädt..."
),
canvas.width/2,
y+410
);


// ======================
// BUTTONS
// ======================

let buttonY=
y+445;


let gap=18;

let totalWidth=
170*3+
gap*2;


let startX=
canvas.width/2-
totalWidth/2;


let ready=
this.playerATB>=100;


let definitions=[

["attack","Angriff"],

["skills","Skills"],

["flee","Flüchten"]

];


definitions.forEach(
(entry,i)=>{


let key=entry[0];

let label=entry[1];

let button=
this.buttons[key];


button.x=
startX+
i*(170+gap);


button.y=
buttonY;


button.width=170;

button.height=48;


ctx.fillStyle=
ready
?
"#2e7d32"
:
"#444";


ctx.fillRect(
button.x,
button.y,
button.width,
button.height
);


ctx.strokeStyle=
ready
?
"#8bc34a"
:
"#777";


ctx.lineWidth=2;


ctx.strokeRect(
button.x,
button.y,
button.width,
button.height
);


ctx.fillStyle="white";

ctx.font="19px Arial";

ctx.textAlign="center";

ctx.textBaseline="middle";


ctx.fillText(
label,
button.x+
button.width/2,
button.y+
button.height/2
);


}
);


ctx.font="14px Arial";

ctx.fillStyle="#aaa";

ctx.textBaseline="alphabetic";


ctx.fillText(
"Angriff = ATK - DEF  |  Fluchtchance: 25 %",
canvas.width/2,
y+height-28
);


ctx.restore();


}


}
