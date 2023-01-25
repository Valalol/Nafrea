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