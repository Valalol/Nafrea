const menu = document.getElementById("side_menu");
const game = document.getElementById("game_window")
const timeline = document.getElementById('water_timeline');
const water_bar = document.getElementById("water_bar_colored")


function shrink_menu() {
    if (menu.style.left == "-25%") {
        menu.style.left = "0";
        game.style.width = "75%";
        game.style.marginLeft = "25%";
    } else {
        menu.style.left = "-25%";
        game.style.width = "100%";
        game.style.marginLeft = "0";
    }
}

function new_frame() {
    new_value = 0.5;

    date_fin = date_fin + 1;
    water_data.push(new_value);

    water_bar.style.height = new_value*100+"%";
    console.log("bah là normalement y'a des trucs mis à jour")
}




const date_debut = 2023;
var date_fin = 2033;

var years = [];
for (var i = date_debut; i <= date_fin; i++) {
    years.push(i);
}

var water_data = [];
for (var i = date_debut; i <= date_fin; i++) {
    water_data.push(Math.random());
}

new Chart(timeline, {
    type: 'line',
    data: {
        labels: years,
        datasets: [{
            data: water_data,
            borderColor: 'rgb(104, 176, 235)',
            tension: 0.25
        }]
    },
    options: {
        maintainAspectRatio: false,
        scales: {
            x: {
                // display: false,
                ticks: {
                    callback: function (val, index) {
                        return index % 3 === 0 ? this.getLabelForValue(val) : '';
                    },
                },
            },
            y: {
                ticks: {
                    display: false,
                },
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            subtitle: {
                display: false,
            }
        }
    }
});


var cvWidth = 850;
var cvHeight = 700;
var baseHeight = 350;
var gridWidth = cvWidth-20;
var gridHeight = Math.floor(gridWidth/2); 
var gridSize = 5;
var canvas = document.getElementById("game_canvas");
var ctx = canvas.getContext("2d");

//Contour
ctx.beginPath();
ctx.strokeStyle = 'black';
ctx.lineWidth = 3;
ctx.moveTo(10, baseHeight);
ctx.lineTo(Math.floor(cvWidth/2), Math.floor(baseHeight-gridHeight/2));
ctx.lineTo(cvWidth-10, baseHeight);
ctx.lineTo(Math.floor(cvWidth/2), Math.floor(baseHeight+gridHeight/2));
ctx.lineTo(10, baseHeight);

//ctx.moveTo(10, baseHeight);
ctx.lineTo(10,baseHeight+(cvHeight-gridHeight)/2)

ctx.moveTo(Math.floor(cvWidth/2), Math.floor(baseHeight+gridHeight/2));
ctx.lineTo(Math.floor(cvWidth/2),baseHeight+gridHeight/2+(cvHeight-gridHeight)/2)

ctx.moveTo(cvWidth-10, baseHeight)
ctx.lineTo(cvWidth-10,baseHeight+(cvHeight-gridHeight)/2)

ctx.lineTo(Math.floor(cvWidth/2),baseHeight+gridHeight/2+(cvHeight-gridHeight)/2)
ctx.lineTo(10,baseHeight+(cvHeight-gridHeight)/2)

ctx.stroke();

//Quadrillage
ctx.lineWidth = 1;

for(let i = 1; i < gridSize; i++){
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(10 + i*(gridWidth/(gridSize*2)), baseHeight - i*(gridHeight/(gridSize*2)));
    ctx.lineTo(10 + i*(gridWidth/(gridSize*2)) + gridWidth/2, baseHeight - i*(gridHeight/(gridSize*2)) + gridHeight/2);

    ctx.stroke();
}

for(let i = 1; i < gridSize; i++){
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(10 + i*(gridWidth/(gridSize*2)), baseHeight + i*(gridHeight/(gridSize*2)));
    ctx.lineTo(10 + i*(gridWidth/(gridSize*2)) + gridWidth/2, baseHeight + i*(gridHeight/(gridSize*2)) - gridHeight/2);

    ctx.stroke();
}