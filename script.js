const menu = document.getElementById("side_menu");
const shrink_button = document.getElementById("shrink_button")
const shrink_container = document.getElementById("shrink_container")
const game = document.getElementById("game_window");
const timeline = document.getElementById('water_timeline');
const water_bar = document.getElementById("water_bar_colored");
const water_bar_quantity = document.getElementById("water_bar_quantity");

function shrink_menu() {
    if (menu.style.left == "-25%") {
        menu.style.left = "0";
        shrink_button.style.transform = "rotateY(0deg)"
        game.style.width = "75%";
        game.style.marginLeft = "25%";
    } else {
        menu.style.left = "-25%";
        game.style.width = "100%";
        game.style.marginLeft = "0";
        shrink_button.style.transform = "rotateY(180deg)"
    }
}

var old_value = 0.65;

const date_debut = 2023;
var date_fin = date_debut;

var years = [date_debut];

var water_data = [0.65];

var water_chart = new Chart(timeline, {
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



var gridsize = 8;
const grid_3d_div = document.getElementById("grid_3d_div");

function redraw_grid(size) {
    console.log(size)
    grid_3d_div.textContent = '';
    draw_grid(size);
}


function draw_grid(size) {
    grid_3d_div.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    grid_3d_div.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    
    for(let i = 1; i <= size; i++){
        for(let j = 1; j <= size; j++){
            let div = document.createElement('div');
            div.className = 'case_grid';
            div.id = `case${i}${j}`;
            div.style.zIndex = i-j + parseInt(size) + 1
            div.onclick = function () {div_selected(this)};
            grid_3d_div.appendChild(div);
        }
    }
}
draw_grid(gridsize);



pave_3d = document.getElementById("pave_3d");
cube_face_right = document.getElementById("cube_face_right");
cube_face_left = document.getElementById("cube_face_left");

function place_cube_side_faces() {
    grid_3d_div.style.transform = `translateZ(${pave_3d.offsetWidth/8}px)`;
    cube_face_left.style.transform = `rotateY(-90deg) translateZ(${pave_3d.offsetWidth/2}px)`;
    cube_face_right.style.transform = `rotateX(-90deg) translateZ(${pave_3d.offsetHeight/2}px)`;
}
place_cube_side_faces();
const resizeObserver_cube = new ResizeObserver(entries => {
    for (let entry of entries) {
        place_cube_side_faces();
    }
});
resizeObserver_cube.observe(pave_3d);




var selected_case = null;
occupied_list = [];

function div_selected(item) {
    if (selected_case != null) {
        if (!occupied_list.includes(selected_case)) {
            document.getElementById(selected_case).style.backgroundColor = '';
        } else {
            document.getElementById(selected_case).style.backgroundColor = 'yellow';
        }
    }
    selected_case = item.id;
    console.log(selected_case);
    if (!occupied_list.includes(selected_case)) {
        item.style.backgroundColor = 'red';
    } else {
        item.style.backgroundColor = 'orange';
    }
}


function place_building() {
    if (selected_case != null) {
        occupied_list.push(selected_case);
        div = document.getElementById(selected_case);
        div.style.backgroundColor = 'yellow';
        let maison_image = document.createElement('img');
        maison_image.src = "Images/test_image.png";
        maison_image.classList.add("sprite_cool");
        div.appendChild(maison_image);
    }
}


function new_frame() {
    // new_value = Math.random().toFixed(2);
    new_value = old_value + (Math.random() - 0.5)*old_value;
    water_data.push(new_value);
    
    date_fin = date_fin;
    years.push(date_fin);
    
    water_chart.data.datasets.data = water_data;
    water_chart.data.labels = years;
    water_chart.update();
    
    water_bar.style.height = new_value*100+"%";
    water_bar_quantity.innerHTML = (Math.round(new_value*100)).toString() +"%";
    
    old_value = new_value
}

