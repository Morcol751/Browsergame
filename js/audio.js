export class AudioManager{



constructor(){



// ======================
// LAUTSTÄRKEN
// ======================



this.musicVolume = 0.15;


this.soundVolume = 0.5;




// ======================
// INDIVIDUELLE SOUND-LAUTSTÄRKEN
// ======================
//
// 1.0 = 100 %
// 0.5 = 50 %
// 0.25 = 25 %
//
// Diese Werte werden zusätzlich mit dem
// globalen Sound-Regler multipliziert.

this.soundVolumes={

chop_wood:1.0,

mine_ore:1.0,

pickup_item:0.3,

craft:1.0,

place_building:1.0,

remove_building:0.2

};








// ======================
// SOUNDEFFEKTE
// ======================



this.sounds={



chop_wood:
new Audio("sounds/chop_wood.mp3"),



mine_ore:
new Audio("sounds/mine_ore.mp3"),



pickup_item:
new Audio("sounds/pickup_item.mp3"),




craft:
new Audio("sounds/craft.mp3"),




place_building:
new Audio("sounds/place_building.mp3"),




remove_building:
new Audio("sounds/remove_building.mp3")




};








// ======================
// HINTERGRUNDMUSIK
// ======================



this.music=[



"music/bgm1.mp3",


"music/bgm2.mp3",


"music/bgm3.mp3",


"music/bgm4.mp3",


"music/bgm5.mp3",


"music/bgm6.mp3",


"music/bgm7.mp3",


"music/bgm8.mp3",


"music/bgm9.mp3",


"music/bgm10.mp3"



];






this.currentMusic=null;



this.lastMusicIndex=-1;




}










// ======================
// SOUND-MULTIPLIKATOR HOLEN
// ======================



getSoundMultiplier(name){



let value =
this.soundVolumes[name];



if(
typeof value!=="number" ||
!Number.isFinite(value)
){

return 1;

}



return Math.max(
0,
Math.min(
1,
value
)
);



}










// ======================
// SOUND LAUTSTÄRKE
// ======================



setSoundVolume(value){



this.soundVolume=
Math.max(
0,
Math.min(
1,
value
)
);



// Bereits laufende Loop-Sounds sofort
// an den neuen Reglerwert anpassen.

for(let name in this.sounds){



let sound =
this.sounds[name];



if(sound.loop){



sound.volume =
this.soundVolume
*
this.getSoundMultiplier(name)
*
0.7;



}



}



}










// ======================
// MUSIK LAUTSTÄRKE
// ======================



setMusicVolume(value){




this.musicVolume=
Math.max(
0,
Math.min(
1,
value
)
);




if(this.currentMusic){



this.currentMusic.volume =
this.musicVolume;



}




}












// ======================
// NORMALER SOUND
// ======================



playSound(name){




let sound =
this.sounds[name];




if(!sound)
return;





sound.currentTime=0;



sound.volume =
this.soundVolume
*
this.getSoundMultiplier(name);




sound.play()
.catch(()=>{});




}












// ======================
// ABBau LOOP SOUND
// ======================



startMiningSound(name){




let sound =
this.sounds[name];




if(!sound)
return;




if(sound.loop)
return;





sound.loop=true;



sound.volume =
this.soundVolume
*
this.getSoundMultiplier(name)
*
0.7;




sound.currentTime=0;




sound.play()
.catch(()=>{});




}










stopMiningSound(){




for(let name in this.sounds){




let sound =
this.sounds[name];




if(sound.loop){




sound.pause();



sound.currentTime=0;



sound.loop=false;




}




}




}












// ======================
// MUSIK START
// ======================



startMusic(){




if(this.currentMusic)
return;




this.playMusic();




}













// ======================
// ZUFÄLLIGEN SONG AUSWÄHLEN
// ======================



getRandomMusic(){




let index;




do{



index =
Math.floor(
Math.random()*this.music.length
);




}
while(
index===this.lastMusicIndex &&
this.music.length>1
);




this.lastMusicIndex=index;




return index;




}













// ======================
// MUSIK ABSPIELEN
// ======================



playMusic(){




if(this.currentMusic){



this.currentMusic.pause();



this.currentMusic.currentTime=0;



}







let index =
this.getRandomMusic();







this.currentMusic =
new Audio(
this.music[index]
);







this.currentMusic.volume =
this.musicVolume;




// KEIN LOOP MEHR


this.currentMusic.loop=false;






this.currentMusic.onended = ()=>{



this.playMusic();



};







this.currentMusic.play()
.catch(
err=>{



console.log(
"Musik wartet auf Benutzeraktion:",
err
);



}
);




}







}
