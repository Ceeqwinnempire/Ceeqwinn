const canvas=document.getElementById("gameCanvas");

const ctx=canvas.getContext("2d");

resize();

window.addEventListener("resize",resize);

function resize(){

canvas.width=window.innerWidth;

canvas.height=window.innerHeight;

}

let gravity=.8;

let score=0;

let speed=6;

const player={

x:120,

y:200,

w:50,

h:70,

dy:0,

jump:false

};

let items=[];

let obstacles=[];

function spawnItem(){

items.push({

x:canvas.width+20,

y:Math.random()*(canvas.height-250)+80,

r:18

});

}

function spawnObstacle(){

obstacles.push({

x:canvas.width+20,

y:canvas.height-120,

w:40,

h:60

});

}

setInterval(spawnItem,1200);

setInterval(spawnObstacle,1700);

window.addEventListener("pointerdown",jump);

window.addEventListener("keydown",e=>{

if(e.code==="Space")jump();

});

function jump(){

if(!player.jump){

player.dy=-16;

player.jump=true;

}

}

function update(){

player.dy+=gravity;

player.y+=player.dy;

let ground=canvas.height-120-player.h;

if(player.y>ground){

player.y=ground;

player.dy=0;

player.jump=false;

}

items.forEach(i=>i.x-=speed);

obstacles.forEach(o=>o.x-=speed);

items=items.filter(i=>i.x>-50);

obstacles=obstacles.filter(o=>o.x>-50);

items.forEach((i,index)=>{

if(

player.x<i.x+i.r &&

player.x+player.w>i.x-i.r &&

player.y<i.y+i.r &&

player.y+player.h>i.y-i.r

){

score+=10;

items.splice(index,1);

}

});

obstacles.forEach(o=>{

if(

player.x<o.x+o.w &&

player.x+player.w>o.x &&

player.y<o.y+o.h &&

player.y+player.h>o.y

){

score=0;

items=[];

obstacles=[];

}

});

}

function draw(){

ctx.fillStyle="#ffe8f2";

ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="#ffb6c1";

ctx.fillRect(0,canvas.height-120,canvas.width,120);

ctx.fillStyle="#ff66aa";

ctx.fillRect(

player.x,

player.y,

player.w,

player.h

);

ctx.font="30px Arial";

items.forEach(i=>{

ctx.fillText("👠",i.x,i.y);

});

ctx.fillStyle="#444";

obstacles.forEach(o=>{

ctx.fillRect(

o.x,

o.y,

o.w,

o.h

);

});

ctx.fillStyle="#000";

ctx.font="30px Arial";

ctx.fillText("Score: "+score,20,40);

}

function loop(){

update();

draw();

requestAnimationFrame(loop);

}

loop();
