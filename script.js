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

const annee_debut = 2023;
const mois_debut = 01;
var annee_actuelle = annee_debut;
var mois_actuel = mois_debut;

var new_data_label = mois_actuel.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + "/" + annee_actuelle;

var time_labels = [new_data_label];

var water_data = [0.65];

var water_chart = new Chart(timeline, {
    type: 'line',
    data: {
        labels: time_labels,
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
                        return index % 2 === 0 ? this.getLabelForValue(val) : '';
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
const map_size_label = document.getElementById("map_size_label");

function redraw_grid(size) {
    console.log(size)
    map_size_label.textContent = "Taille de la carte (" + size + ")";
    grid_3d_div.textContent = '';
    draw_grid(size);
}


function draw_grid(size) {
    grid_3d_div.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    grid_3d_div.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    for (let i = 1; i <= size; i++) {
        for (let j = 1; j <= size; j++) {
            let div = document.createElement('div');
            div.className = 'case_grid';
            div.id = `case${i}${j}`;
            div.style.zIndex = i - j + parseInt(size) + 1
            div.onclick = function () { div_selected(this) };
            grid_3d_div.appendChild(div);
        }
    }
}
draw_grid(gridsize);

const depth_label = document.getElementById("depth_label")
const permeability_coeff_label = document.getElementById("permeability_coeff_label")
const capacity_label = document.getElementById("capacity_label")

function setting_changed(setting, value) {
    switch (setting) {
        case "depth":
            depth_label.textContent = "Profondeur de la nappe (" + value + " km)";
            break;
        case "permeability_coeff":
            permeability_coeff_label.textContent = "Coefficient de perm??abilit?? (" + value + "m/s)";
            break;
        case "capacity":
            capacity_label.textContent = "Capacit?? de la nappe (" + value + "e9 m??)";
            break;
    }
}




pave_3d = document.getElementById("pave_3d");
cube_face_right = document.getElementById("cube_face_right");
cube_face_left = document.getElementById("cube_face_left");

function place_cube_side_faces() {
    grid_3d_div.style.transform = `translateZ(${pave_3d.offsetWidth / 8}px)`;
    cube_face_left.style.transform = `rotateY(-90deg) translateZ(${pave_3d.offsetWidth / 2}px)`;
    cube_face_right.style.transform = `rotateX(-90deg) translateZ(${pave_3d.offsetHeight / 2}px)`;
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


function place_building(src) {
    if (selected_case != null && !occupied_list.includes(selected_case)) {
        occupied_list.push(selected_case);
        div = document.getElementById(selected_case);
        div.style.backgroundColor = 'yellow';
        let maison_image = document.createElement('img');
        maison_image.src = src;
        maison_image.classList.add("sprite_cool");
        div.appendChild(maison_image);
    }
}


function new_frame() {
    mois_actuel = mois_actuel + 1;
    if (mois_actuel == 13) {
        mois_actuel = 1;
        annee_actuelle = annee_actuelle + 1;
    }
    new_data_label = mois_actuel.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + "/" + annee_actuelle;
    time_labels.push(new_data_label);

    // ??coulement lat??ral souterrain Q = K*S*DeltaH/L = K*S*tan(alpha)
    new_value = (Math.random() * 0.5 + 0.5) * (Math.sin(((annee_actuelle - 2023) * 12 + mois_actuel) * 2 * Math.PI / 12) + 1) / 2 * Math.exp(-((annee_actuelle - 2023) * 12 + mois_actuel) / 100);
    water_data.push(new_value);


    water_chart.data.datasets.data = water_data;
    water_chart.data.labels = time_labels;
    water_chart.update();

    water_bar.style.height = new_value * 100 + "%";
    water_bar_quantity.innerHTML = (Math.round(new_value * 100)).toString() + "%";

    old_value = new_value
}



var simulation_speed = 1;
var play_pause_button = document.getElementById("play_pause_button");
var main_simulation;

function slow_down() {
    if (simulation_speed > 0.125) {
        simulation_speed = simulation_speed / 2;
        clearInterval(main_simulation);
        main_simulation = setInterval(new_frame, 500/simulation_speed);
        console.log(simulation_speed);
    }
}
function speed_up() {
    if (simulation_speed < 128) {
        simulation_speed = simulation_speed * 2;
        clearInterval(main_simulation);
        main_simulation = setInterval(new_frame, 500/simulation_speed);
        console.log(simulation_speed);
    }
}
function resume() {
    main_simulation = setInterval(new_frame, 500/simulation_speed);
    play_pause_button.src = "Images/pause.svg";
    play_pause_button.onclick =  function () { pause() };
}
function pause() {
    clearInterval(main_simulation);
    play_pause_button.src = "Images/play.svg";
    play_pause_button.onclick =  function () { resume() };
}
