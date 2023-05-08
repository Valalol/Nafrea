class City {
    constructor(nb_hab = 100000, conso = 54, density = 5000, category = 2, green_cover = 25) {
        this.buildingtype = "city";
        this.nb_hab = nb_hab;
        this.conso_hab = conso;
        this.density = density;
        this.category = category;
        this.green_cover = green_cover;
    }
    export() {
        return {
            buildingtype: this.buildingtype,
            nb_hab: this.nb_hab,
            conso_hab: this.conso_hab,
            density: this.density,
            category: this.category,
            green_cover: this.green_cover
        }
    }
}

class Farm {
    constructor(plante = "Blé", cover = 1000) {
        this.buildingtype = "farm";
        this.plante = plante;
        this.cover = cover;
    }
    export() {
        return {
            buildingtype: this.buildingtype,
            plante: this.plante,
            cover: this.cover
        }
    }
}

class Forest {
    constructor(tree_type = "Chêne", density = 50) {
        this.buildingtype = "forest";
        this.tree_type = tree_type;
        this.density = density;
    }
    export() {
        return {
            buildingtype: this.buildingtype,
            tree_type: this.tree_type,
            density: this.density
        }
    }
}

class Industrial_area {
    constructor(conso = 1500,size = 9, nb_industries = 1){
        this.buildingtype = "industrial_area"
        this.conso = conso;
        this.size = size;
        this.nb_industries = nb_industries;
    }
    export() {
        return {
            buildingtype: this.buildingtype,
            conso: this.conso,
            size: this.size,
            nb_industries: this.nb_industries
        }
    }
}

class Animals {
    constructor(animal_type = "Vache", nb_animals = 1000){
        this.buildingtype = "animals";
        this.animal_type = animal_type;
        this.nb_animals = nb_animals;
    }
    export() {
        return {
            buildingtype: this.buildingtype,
            animal_type: this.animal_type,
            nb_animals: this.nb_animals
        }
    }
}

function shrink_menu() {
    if (side_menu.style.left == "-25%") {
        side_menu.style.left = "0";
        shrink_button.style.transform = "rotateY(0deg)"
        game_window.style.width = "75%";
        game_window.style.marginLeft = "25%";
    } else {
        side_menu.style.left = "-25%";
        game_window.style.width = "100%";
        game_window.style.marginLeft = "0";
        shrink_button.style.transform = "rotateY(180deg)"
    }
}

function initialisation(){
    // appelée par new_session() et import_config()
    actual_scenario = "245";
    change_climatic_scenario(actual_scenario);
    square_size = 10000 //m de côté
    old_value = 0.65;

    start_month_select.value = "01";
    start_year_box.value = 2023;
    setting_changed("start_date",0);

    water_data_per = [0.65];
    water_data_rain = [0];
    water_data_temperature = [0];

    water_consumption = [0, 0, 0, 0, 0, 0,0];
    water_consumption_current = [0, 0, 0, 0, 0, 0,0];

    update_all_charts();

    gridsize = 8;
    redraw_grid(gridsize);
    selected_case = null;


    setting_changed("capacity",15);
    setting_changed("latitude",48);
    setting_changed("altitude",30);
    setting_changed("depth",10);
    setting_changed("permeability_coeff",-5);
    setting_changed("inclinaison",5);
    setting_changed("grasskc",0.8);
    setting_changed("rain_intensity",100);
    setting_changed("wind_intensity",100);
    setting_changed("solar_intensity",100);
    setting_changed("temperature_intensity",100);
    setting_changed("etp_limit",0);


    water_data_ngf = [z - depth - capacity*(1-old_value) / ((square_size ** 2)*(gridsize ** 2))]; //valeurs en m ngf
    displayed_data = "per";
    displayed_stats_conso = "total";


    occupied_list = [];
    buildings = {};

    place_cube_side_faces();
    const resizeObserver_cube = new ResizeObserver(entries => {
        for (let entry of entries) {
            place_cube_side_faces();
        }
    });
    resizeObserver_cube.observe(pave_3d);


    copied_building = false;

    tabHR = [85, 81, 77, 73, 74, 69, 68, 70, 70, 80, 85, 85];
    tabRg = [1.96, 3.3, 4.6, 5.59, 5.65, 5.93, 5.99, 5.79, 5.43, 3.46, 2.46, 2.01];
    tabv10 = [5.22, 5.06, 4.89, 4.69, 4.36, 4.22, 4.06, 3.92, 4.19, 4.64, 4.89, 5.14];


    current_formula = "manque";
    hist = [];

    secheresse = false;

    future_rain = {};
    surface_betonee = 0;

    simulation_speed = 1;
    main_simulation = 0;
    simulation_running = false;
    pause();
    simulation_ended = false;

    stats_opened = false;
    advanced_opened = false;
    export_opened = false;

    close_stats();
    close_advanced();
    close_export();
}

var temp_data, rain_data;
var actual_scenario = "245";

async function change_climatic_scenario(x){
    actual_scenario = x;
    rain_data = await read_climate_csv(`precipitations/precip_combine_${x}.csv`);
    temp_data = await read_climate_csv(`temperatures/temp_combine_${x}.csv`);

}

async function read_climate_csv(name){
    let response = await fetch(`data_meteo/${name}`);
    let csv = await response.text();
    let climate_data = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim()
    }).data.reduce((acc, row) => {
        acc[row["date"]] = {"WCE" : row["WCE"], "World" : row["world"]};
        return acc;
    }, {});   
    return climate_data;
}

change_climatic_scenario(actual_scenario);

var square_size = 10000 //m de côté

var old_value = 0.65;

var annee_debut = 2023;
var mois_debut = 01;
var annee_actuelle = annee_debut;
var mois_actuel = mois_debut;

var new_data_label = mois_actuel.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + "/" + annee_actuelle;

var time_labels = [new_data_label];

var water_data_per = [0.65];
var water_data_rain = [0];//[parseFloat(rain_data[mois_debut.toString()+"-01"]['WCE']) * 30];
var water_data_temperature = [0];


function create_chart(canvas_used, title_bool) {
    return new Chart(canvas_used, {
        type: 'line',
        data: {
            labels: time_labels,
            datasets: [{
                data: water_data_per,
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
                    min: 0,
                    max: 1,
                    ticks: {
                        display: true,
                    },
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    text: "Pourcentage de remplissage de la nappe phréatique au cours du temps",
                    display: title_bool,
                    font: {
                        size: 18,
                        weight: false,
                    }
                },
                subtitle: {
                    display: false,
                }
            }
        }
    });
}

var water_chart = create_chart(water_timeline, false);
var water_chart_stats = create_chart(water_timeline_stats, true);
var water_consumption = [0, 0, 0, 0, 0, 0,0];
var water_consumption_current = [0, 0, 0, 0, 0, 0,0];

var pie_chart_conso = new Chart(pie_chart_conso_canvas, {
    type: 'pie',
    data: {
        labels: [
            'Villes',
            'Fermes',
            'Forêts',
            'Évapotranspiration',
            'Écoulement latéral souterrain',
            'Industries',
            'Elevages'
        ],
        datasets: [{
            data: water_consumption,
        }]
    },
    options: {
        animation: {
            animateRotate: false
        }
    }
});


var gridsize = 8;
var selected_case = null;


var capacity = 15 * 10 ** 9;// m^3
var phi = 48; //latitude (deg)
var z = 30; //m ngf
var depth = 10; //m
var permeability = 10**-5; //m.s^-1
var inclinaison = 5*Math.PI/180; //deg
var rain_intensity = 100; //%
var wind_intensity = 100; //%
var solar_intensity = 100; //%
var temperature_intensity = 100; //%
var etp_limit = Infinity; //% des précipitations, Infinity=pas de limite

var water_data_ngf = [z - depth - capacity*(1-old_value) / ((square_size ** 2)*(gridsize ** 2))]; //valeurs en m ngf
var displayed_data = "per";
var displayed_stats_conso = "total";

function change_chart_var(value){
    console.log(value);
    switch(value){
        case "percentage" :
            water_chart.options.scales.y.min = 0;
            water_chart.options.scales.y.max = 1;
            water_chart_stats.options.scales.y.min = 0;
            water_chart_stats.options.scales.y.max = 1;
            displayed_data = "per";
            water_chart_stats.config.options.plugins.title.text = "Remplissage de la nappe au cours du temps (%)";
            update_all_charts();
            break;

        case "niv_ngf" :
            water_chart.options.scales.y.min = z - depth - capacity / ((square_size ** 2)*(gridsize ** 2));
            water_chart.options.scales.y.max = z - depth;
            water_chart_stats.options.scales.y.min = z - depth - capacity / ((square_size ** 2)*(gridsize ** 2));
            water_chart_stats.options.scales.y.max = z - depth;
            displayed_data = "ngf";
            water_chart_stats.config.options.plugins.title.text = "Niveau ngf de la nappe au cours du temps (m)";
            update_all_charts();
            break;

        case "rain" :
            water_chart.options.scales.y.min = 0;
            water_chart.options.scales.y.max = 130;
            water_chart_stats.options.scales.y.min = 0;
            water_chart_stats.options.scales.y.max = 130;

            displayed_data = "rain";
            water_chart_stats.config.options.plugins.title.text = "Niveau mensuel des précipitations (mm)";
            update_all_charts();
            break;

        case "temperature" :
            water_chart.options.scales.y.min = -10;
            water_chart.options.scales.y.max = 50;
            water_chart_stats.options.scales.y.min = -10;
            water_chart_stats.options.scales.y.max = 50;

            displayed_data = "temperature";
            water_chart_stats.config.options.plugins.title.text = "Température mensuelle (°C)";
            update_all_charts();
            break;

        default:
            water_chart.options.scales.y.min = 0;
            water_chart.options.scales.y.max = 1;
            water_chart_stats.options.scales.y.min = 0;
            water_chart_stats.options.scales.y.max = 1;
            displayed_data = "per";
            water_chart_stats.config.options.plugins.title.text = "Remplissage de la nappe au cours du temps (%)";
            update_all_charts();
            break;
    }
}

function change_stats_conso(value){
    switch(value){
        case "month":
            displayed_stats_conso = "month";
            update_all_charts();
            break;
        case "total":
            displayed_stats_conso = "total";
            update_all_charts();
            break;
        default:
            displayed_stats_conso = "total";
            update_all_charts();
            break;

    }
}

function redraw_grid(size) {
    gridsize = size;
    selected_case = null;
    buildings = [];
    grid_3d_div.textContent = '';
    draw_grid(size);
}


function draw_grid(size) {
    grid_3d_div.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
    grid_3d_div.style.gridTemplateRows = `repeat(${size}, minmax(0, 1fr))`;

    for (let i = 1; i <= size; i++) {
        for (let j = 1; j <= size; j++) {
            let div = document.createElement('div');
            div.className = 'case_grid';
            div.id = `case${i}_${j}`;
            div.style.zIndex = i - j + parseInt(size) + 1
            div.onclick = function () { div_selected(this) };
            grid_3d_div.appendChild(div);
        }
    }
}
draw_grid(gridsize);

function setting_changed(setting, value) {
    switch (setting) {
        case "size":
            gridsize = parseInt(value);
            map_size_label.textContent = "Taille de la carte (" + gridsize + ")";
            map_size_input.value = gridsize;
            redraw_grid(gridsize);
            break;
         case "square_size":
            //advanced only
            square_size = parseInt(value);
            break;
        case "start_date":
            mois_debut = parseInt(start_month_select.value);
            annee_debut = parseInt(start_year_box.value);
            annee_actuelle = annee_debut;
            mois_actuel = mois_debut;
            new_data_label = mois_actuel.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + "/" + annee_actuelle;
            time_labels = [new_data_label];
            update_all_charts();
            break;

        case "altitude":
            altitude_label.textContent = "Altitude du site (" + value + " m)";
            altitude_input.value = value;
            altitude_box.value = value;
            z = parseFloat(value);
            water_data_ngf = [z - depth - capacity*(1-old_value) / ((square_size ** 2)*(gridsize ** 2))];
            update_all_charts();
            break;
        case "latitude":
            //advanced only
            latitude_box.value = parseFloat(value);
            phi = parseFloat(value);
            break;
        case "depth":
            depth_label.textContent = "Profondeur de la nappe (" + value + " m)";
            depth_input.value = value;
            depth_box.value = value;
            depth = parseInt(value);
            water_data_ngf = [z - depth - capacity*(1-old_value) / ((square_size ** 2)*(gridsize ** 2))];
            update_all_charts();
            break;
        case "permeability_coeff":
            permeability_coeff_label.textContent = "Coefficient de perméabilité (1e" + value + " m/s)";
            permeability_coeff_input.value = value;
            permeability = parseFloat(10 ** value);

            permeability_coeff_box.value = "1e"+value.toString();
            break;
        case "permeability_coeff_advanced":
            if(value.split("e").length == 2){
                permeability_coeff_label.textContent = "Coefficient de perméabilité (" + value + " m/s)";
                permeability_coeff_input.value = parseInt(value.split("e")[1]);
                permeability = parseFloat(value.split("e")[0]*10**value.split("e")[1]);
            } else{
                permeability_coeff_advanced_label.textContent = "Coefficient de perméabilité (m/s) (ex: 9e-6) [FORMAT INVALIDE]";
            }
            break;
        case "capacity":
            capacity_label.textContent = "Capacité de la nappe (" + value + " e9 m³)";
            capacity_input.value = value;
            capacity = parseFloat(value * 10 ** 9);

            capacity_box.value = value.toString() + "e9";
            break;
        case "capacity_advanced":
            if(value.split("e").length == 2){
                capacity_label.textContent = "Capacité de la nappe (" + value + " m³)";
                capacity_input.value = parseInt(value.split("e")[0]);
                capacity = parseInt(value.split("e")[0]) * 10 ** parseInt(value.split("e")[1]);

                capacity_box.value = value;
            } else{
                capacity_advanced_label.textContent = "Capacité de la nappe (m³) (ex: 10e9) [FORMAT INVALIDE]";
            }
            break;
        case "inclinaison":
            inclinaison_label.textContent = "Inclinaison (" + value + "°)";
            inclinaison_input.value = value;
            inclinaison_box.value = value;
            inclinaison = parseFloat(value)*Math.PI/180;
            break;
        case "grasskc":
            //advanced only
            grasskc_box.value = value;
            grasskc = parseFloat(value);
            break;
        case "rain_intensity":
            rain_intensity_label.textContent = "Intensité des précipitations (" + value + "%)";
            rain_intensity_input.value = value;
            rain_intensity_box.value = value;
            rain_intensity = parseFloat(value);
            break;
        case "wind_intensity":
            //advanced only
            wind_intensity_box.value = value;
            wind_intensity = parseFloat(value);
            break;
        case "solar_intensity":
            //advanced only
            solar_intensity_box.value = value;
            solar_intensity = parseFloat(value);
            break;
        case "temperature_intensity":
            //advanced only
            temperature_intensity_box.value = value;
            temperature_intensity = parseFloat(value);
            break;
        case "etp_limit":
            //advanced only
            if(parseFloat(value) == 0){
                etp_limit = Infinity;
            } else{
                etp_limit = parseFloat(value);
            }
            break;
        case "tabHR":
            //advanced only
            mytmp = value.toString();
            mytmp = mytmp.replace("[","");
            mytmp = mytmp.replace("]","");
            mytmp = mytmp.split(",").map(Number);
            if(mytmp.length == 12){
                tabHR = mytmp;
            } else{
                tabHR_label.textContent = "Humidité relative mensuelle moyenne (%) [FORMAT INVALIDE]";
            }
            tabHR_box.value = value;
            break;
        case "tabRg":
            //advanced only
            mytmp = value.toString();
            mytmp = mytmp.replace("[","");
            mytmp = mytmp.replace("]","");
            mytmp = mytmp.split(",").map(Number);
            if(mytmp.length == 12){
                tabRg = mytmp;
            } else{
                tabRg_label.textContent = "Irradiance quotidienne moyenne (kWh/m²/jour) [FORMAT INVALIDE]";
            }
            tabRg_box.value = value;
            break;
        case "tabv10":
            //advanced only
            mytmp = value.toString();
            mytmp = mytmp.replace("[","");
            mytmp = mytmp.replace("]","");
            mytmp = mytmp.split(",").map(Number);
            if(mytmp.length == 12){
                tabv10 = mytmp;
            } else{
                tabv10_label.textContent = "Vitesse mensuelle moyenne du vent à 10m (m/s) [FORMAT INVALIDE]"
            }
            tabv10_box.value = value;
            break;
        case "city_size":
            buildings[selected_case].category = parseInt(value);
            if(value == "1"){
                nb_hab_input.min = 1000;
                nb_hab_input.max = 100000;
                nb_hab_input.step = 1000;
                setting_changed("city_nb_hab", value = 20000);
                nb_hab_input.value = 20000;

                city_green_cover_input.min = 10;
                city_green_cover_input.max = 90;
                setting_changed("city_green_cover", 25);
                city_green_cover_input.value = 25;

                document.getElementById(selected_case).firstChild.src = sprites["small city"];
            }
            if(value == "2"){
                nb_hab_input.min = 100000;
                nb_hab_input.max = 500000;
                nb_hab_input.step = 10000;
                setting_changed("city_nb_hab", value = 250000);
                nb_hab_input.value = 250000;

                city_green_cover_input.min = 10;
                city_green_cover_input.max = 50;
                setting_changed("city_green_cover", 25);
                city_green_cover_input.value = 25;

                document.getElementById(selected_case).firstChild.src = sprites["medium city"];
            }
            if(value == "3"){
                nb_hab_input.min = 500000;
                nb_hab_input.max = 2000000;
                nb_hab_input.step = 100000;
                setting_changed("city_nb_hab", value = 1000000);
                nb_hab_input.value = 1000000;

                city_green_cover_input.min = 5;
                city_green_cover_input.max = 30;
                setting_changed("city_green_cover", 25);
                city_green_cover_input.value = 25;

                document.getElementById(selected_case).firstChild.src = sprites["city"];
            }
        case "city_nb_hab":
            nb_hab_label.textContent = "Nombre d'habitants (" + value + ")";
            buildings[selected_case].nb_hab = value;
            city_density_input.min = Math.min(value/100,city_density_input.max);
            if (city_density_input.value <= city_density_input.min){
                setting_changed("city_density",value/100);
            } 
            break;
        case "city_conso_hab":
            conso_hab_label.textContent = "Consommation par habitant (" + value + " m³/an)";
            buildings[selected_case].conso_hab = value;
            break;
        case "city_density":
            city_density_label.textContent = "Densité de la population (" + value + " hb/km²)";
            buildings[selected_case].density = value;
            break;
        case "city_green_cover":
            city_green_cover_label.textContent = "Couverture végétale (" + value + " %)";
            buildings[selected_case].green_cover = value;
            break;
        case "farm_plante":
            buildings[selected_case].plante = value;
            break;
        case "farm_cover":
            farm_cover_label.textContent = "Couverture des plantations (" + value + " ha)";
            buildings[selected_case].cover = value;
            break;
        case "forest_density":
            forest_density_label.textContent = "Densité de la forêt (" + value + " %)";
            buildings[selected_case].density = value;
            break;
        case "forest_tree_type":
            buildings[selected_case].tree_type = value;
            break;
        case "industry_conso":
            industrie_conso_label.textContent = "Consommation par industrie (" + value + " m³)";
            buildings[selected_case].conso = parseInt(value);
            break;
        case "industry_size":
            industrie_size_label.textContent = "Taille de chaque industrie (" + value + " ha)";
            buildings[selected_case].size = parseInt(value);
            nb_industries_input.max = 10000 / parseInt(value);
            if (buildings[selected_case].nb_industries > parseInt(nb_industries_input.max)){
                setting_changed("industry_number", value = parseInt(nb_industries_input.max));
            }
            break;
        case "industry_number":
            nb_industries_label.textContent = "Nombre d'industrie (" + value + ")";
            buildings[selected_case].nb_industries = parseInt(value);
            break;
        case "animal_type":
            buildings[selected_case].animal_type = value;
            switch (value){
                case "Vache":
                    nb_animals_input.min = 100;
                    nb_animals_input.max = 10000;
                    if (nb_animals_input.value < 100){setting_changed("nb_animals",100)} 
                    if (nb_animals_input.value > 10000){setting_changed("nb_animals",10000)} 

                    break;  
                case "Cochon":
                    nb_animals_input.min = 2000;
                    nb_animals_input.max = 2000000;
                    if (nb_animals_input.value < 2000){setting_changed("nb_animals",2000)} 
                    if (nb_animals_input.value > 2000000){setting_changed("nb_animals",2000000)} 
                    break;  
                case "Cheval":
                    nb_animals_input.min = 100;
                    nb_animals_input.max = 10000;
                    if (nb_animals_input.value < 100){setting_changed("nb_animals",100)} 
                    if (nb_animals_input.value > 10000){setting_changed("nb_animals",10000)} 
                    break;  
                case "Brebis":
                    nb_animals_input.min = 1000;
                    nb_animals_input.max = 100000;
                    if (nb_animals_input.value < 1000){setting_changed("nb_animals",1000)} 
                    if (nb_animals_input.value > 100000){setting_changed("nb_animals",100000)} 
                    break;  
                case "Poules":
                    nb_animals_input.min = 100;
                    nb_animals_input.max = 10000;
                    if (nb_animals_input.value < 100){setting_changed("nb_animals",100)} 
                    if (nb_animals_input.value > 10000){setting_changed("nb_animals",10000)} 
                    break;  
            }
            break;
        case "nb_animals":
            buildings[selected_case].nb_animals = value;
            nb_animals_label.textContent = "Nombre d'animaux (" + value + ")"
            nb_animals_input.value = value;
            break;
    }
}


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


var occupied_list = [];
var buildings = {};

function div_selected(item) {
    if (selected_case != null) {
        document.getElementById(selected_case).style.backgroundColor = '';
        document.getElementById(selected_case).classList.remove("grid_case_selected");
    }
    selected_case = item.id;
    
    item.style.backgroundColor = 'red';
    item.classList.add("grid_case_selected");

    
    Selected_building_parameters_div.style.display = "none";
    City_menu_div.style.display = "none";
    Farm_menu_div.style.display = "none";
    Forest_menu_div.style.display = "none";
    Industrial_area_menu_div.style.display = "none";
    Animals_menu_div.style.display = "none";


    if (selected_case in buildings) {
        switch (buildings[selected_case].buildingtype) {
            case "city":
                Selected_building_parameters_div.style.display = "block";


                if (buildings[selected_case].category == 1){
                    nb_hab_input.min = 1000;
                    nb_hab_input.max = 100000;
                    nb_hab_input.step = 1000;
                    
                    city_green_cover_input.min = 10;
                    city_green_cover_input.max = 90;

                    document.getElementById(selected_case).firstChild.src = sprites["small city"];
                } else if(buildings[selected_case].category == 2){
                    nb_hab_input.min = 100000;
                    nb_hab_input.max = 500000;
                    nb_hab_input.step = 10000;

                    city_green_cover_input.min = 10;
                    city_green_cover_input.max = 50;

                    document.getElementById(selected_case).firstChild.src = sprites["medium city"];
                } else if(buildings[selected_case].category == 3){
                    nb_hab_input.min = 500000;
                    nb_hab_input.max = 2000000;
                    nb_hab_input.step = 100000;

                    city_green_cover_input.min = 5;
                    city_green_cover_input.max = 30;

                    document.getElementById(selected_case).firstChild.src = sprites["city"];
                }

                nb_hab_input.value = buildings[selected_case].nb_hab;
                setting_changed("city_nb_hab", buildings[selected_case].nb_hab);
                conso_hab_input.value = buildings[selected_case].conso_hab;
                setting_changed("city_conso_hab", buildings[selected_case].conso_hab);
                city_density_input.value = buildings[selected_case].density;
                setting_changed("city_density", buildings[selected_case].density);
                city_green_cover_input.value = buildings[selected_case].green_cover;
                setting_changed("city_green_cover", buildings[selected_case].green_cover);
                City_menu_div.style.display = "block";
                document.getElementsByClassName("city_size_button")[buildings[selected_case].category-1].checked = true;

                break;
            case "farm":
                Selected_building_parameters_div.style.display = "block";

                plantation_type_select.value = buildings[selected_case].plante;
                farm_cover_input.value = buildings[selected_case].cover;
                setting_changed("farm_cover", buildings[selected_case].cover);
                Farm_menu_div.style.display = "block";
                break;
            case "forest":
                Selected_building_parameters_div.style.display = "block";

                tree_type_select.value = buildings[selected_case].tree_type;
                forest_density_input.value = buildings[selected_case].density;
                setting_changed("forest_density", buildings[selected_case].density);
                Forest_menu_div.style.display = "block";
                break;
            case "industrial_area":
                Selected_building_parameters_div.style.display = "block";
                
                industrie_conso_input.value = buildings[selected_case].conso;
                setting_changed("industry_conso", buildings[selected_case].conso);
                industrie_size_input.value = buildings[selected_case].size;
                setting_changed("industry_size", buildings[selected_case].size);
                nb_industries_input.value = buildings[selected_case].nb_industries;
                setting_changed("industry_number", buildings[selected_case].nb_industries);

                Industrial_area_menu_div.style.display = "block";
                break;
            case "animals":
                Selected_building_parameters_div.style.display = "block";

                Animals_menu_div.style.display = "block";
            default:
                break;
        }
    }
}


const sprites = {
    "city": "Images/Ville.png",
    "medium city" : "Images/Ville Moyenne.png",
    "small city" : "Images/Ville Petite.png",
    "farm": "Images/Ferme 2.png",
    "forest": "Images/Forêt Epicea.png",
    "dead forest" : "Images/Forêt morte.png",
    "industrial_area": "Images/Industrie.png",
    "animals": "Images/Elevage.png",
}

var copied_building = false

function place_building(type, template = false) {
    if (selected_case != null && !occupied_list.includes(selected_case)) {
        occupied_list.push(selected_case);
        div = document.getElementById(selected_case);
        div.style.backgroundColor = 'yellow';
        let maison_image = document.createElement('img');
        maison_image.src = sprites[type];
        maison_image.classList.add("sprite_cool");
        div.appendChild(maison_image);

        var build;
        if (!template) {
            switch (type) {
                case "city":
                    build = new City();
                    nb_hab_input.min = 100000;
                    nb_hab_input.max = 500000;
                    nb_hab_input.step = 10000;

                    city_green_cover_input.min = 10;
                    city_green_cover_input.max = 50;

                    document.getElementById(selected_case).firstChild.src = sprites["medium city"];
                    break;
                case "farm":
                    build = new Farm();
                    break;
                case "forest":
                    build = new Forest();
                    break;
                case "industrial_area":
                    build = new Industrial_area();
                    break;
                case "animals":
                    build = new Animals();
                    break;
                default:
                    break;
            }
        } else {
            if(copied_building){
                build = Object.assign(Object.create(Object.getPrototypeOf(copied_building)), copied_building)
            } else{
                build = template;
            }            
        }
        buildings[selected_case] = build;
    }
    div_selected(div);
}

function remove_building() {
    div = document.getElementById(selected_case);
    if (selected_case != null && occupied_list.includes(selected_case)) {
        occupied_list.splice(occupied_list.indexOf(selected_case), 1);
        div.removeChild(div.childNodes[0]);
        delete buildings[selected_case];
    }
    div_selected(div);
}

function copy_building() {
    if (selected_case != null && occupied_list.includes(selected_case)) {
        copied_building = buildings[selected_case];
    }
    div_selected(div);
}

function paste_building() {
    if (copied_building) {
        place_building(copied_building.buildingtype, template = true)
    }
}

function calc_delay(date) {
    Q = (permeability) * (parseFloat(rain_data[date]['WCE'])*0.001+depth)/(depth);
    return Math.floor((depth/Q)/2629800); // conversion secondes -> mois
}

function evapotranspiration(date){
    Ta = parseFloat(temp_data[date]['WCE']);
    delta = (2504*Math.exp(17.27*(Ta-273.15)/(Ta-35.85)))/((Ta-35.85)**2);
    console.log(delta)

    deltae = 0.6108*Math.exp(17.27*(Ta-273.15)/(Ta-35.85));

    e = soleil[mois_actuel];
    Rg = 295*e+197.5*(1-e);
    Ra = 492;
    alpha = 0.23;
    epsilon = 1;
    sigma = 5.67*10**8;
    Rn = (1-alpha)*Rg + epsilon*Ra - epsilon*sigma*(Ta**4)

    console.log(Rn)

    zom = 0.015;
    zm = 50;
    zh = 50;
    zoh = 0.0015;
    d = 0.08;
    k = 0.41;
    v = 6.9;
    ra = (Math.log((zm-d)/zom)*Math.log((zh-d)/zoh))/((k**2)*v);

    rho = 1.2;
    Cp = 1013;
    lambda = 2.45106;
    gamma = 0.000665;
    Rs = 70;
    G = 0.3;

    ETP = (delta*(Rn-G)+rho*Cp*deltae/ra)/(lambda*(delta+gamma*(1+Rs/ra)))
    return ETP
}

function evapotranspiration2(date, cover){
    T = 283.15;
    delta = 0.145;
    //delta = delta*10**-3 + 273.15;

    Rn = 7.6;
    //Rn = (Rn*10**-6);

    //G = 0.1*Rn;
    G = 0.3; //valeur officielle


    v = 5.4;
    deltae = 0.91;
    gamma = 0.067;
    //gamma = gamma/(10**3) + 273.15;

    ETP = (0.408*delta*(Rn-G)+(900/T)*gamma*v*deltae)/(delta+gamma*(1+0.34*v));

    return ETP*30*cover
}

function evapotranspiration3(date, cover) {
    p = rain_data[date]["WCE"];
    t = temp_data[date]["WCE"];
    l = 300 + 25*t + 0.05*t**3;
    ETR = (p/((0.9+p**2/l**2))**1/2);
    return ETR*30*cover
}

function fes(T){
    return 0.6108*Math.exp((17.27*T)/(T+237.3))
}


var tabHR = [85, 81, 77, 73, 74, 69, 68, 70, 70, 80, 85, 85];
var tabRg = [1.96, 3.3, 4.6, 5.59, 5.65, 5.93, 5.99, 5.79, 5.43, 3.46, 2.46, 2.01];
var tabv10 = [5.22, 5.06, 4.89, 4.69, 4.36, 4.22, 4.06, 3.92, 4.19, 4.64, 4.89, 5.14];
var grasskc = 0.8;

function etp(date,cover){
    
    var t = parseFloat(temp_data[date]["World"])*temperature_intensity/100;
    var Tn = t-5;
    var Tx = t+5;
    var mois = parseInt(date.split("-")[1]);
    var HRmoy = tabHR[mois-1];
    var Rg = tabRg[mois-1]*3.6*solar_intensity/100;
    var NBJ = 365;
    var rad_phi = phi * (Math.PI/180)
    
    var v10m = tabv10[mois-1]*wind_intensity/100;


    var J = 30*(mois-1) + 15;
    var Tmoy = (Tn+Tx)/2;
    var delta = 4098*(fes(Tmoy)/((Tmoy+237.3)**2))

    var Pa = 101.3*((293-0.0065*z)/293)**5.26;
    var gamma = 0.665e-3*Pa;

    var v2m = v10m*4.87/Math.log(672.58);

    var es = (fes(Tn)+fes(Tx))/2;
    var ea = HRmoy/100 * es;

    var pdelta = 0.409*Math.sin(2*Math.PI*J/NBJ - 1.39);
    var dr = 1+0.033*Math.cos(2*Math.PI*J/NBJ);
    var ws = Math.acos(-Math.tan(rad_phi)*Math.tan(pdelta));
    var Ra = (24*60/Math.PI)*0.082*dr*(ws*Math.sin(rad_phi)*Math.sin(pdelta) + Math.cos(rad_phi)*Math.cos(pdelta)*Math.sin(ws));

    var Rso = (0.75+(2e-5)*z)*Ra;
    var Rn = 0.77*Rg - (0.34-0.14*Math.sqrt(ea))*(4.903e-9) * ((Tn+273.15)**4 + (Tx+273.15)**4)/2 * (1.35*Math.min(Rg/Rso,1)-0.35);
    //ET0 QUOTIDIENNE PENMAN-MONTEITH FAO

    var ET0 = (0.408*delta*Rn+gamma*(900/(Tmoy+273)) * v2m * Math.max(es-ea,0)) / (delta+gamma*(1+0.34*v2m));
    ET0 = Math.min(ET0, parseFloat(rain_data[date]['WCE'])*etp_limit/100);

    return ET0*30*cover;
}

var conso_plantes = {"Blé" : {"1": 0, "2": 0, "3": 0, "4": 25, "5" : 90, "6": 60, "7": 0, "8": 0, "9": 0, "10": 0, "11":0, "12": 0},"Maïs" : {"1": 0, "2": 0, "3": 0, "4": 0, "5" : 10, "6": 80, "7": 200, "8": 120, "9": 25, "10": 0, "11":0, "12": 0},"PDT" : {"1": 0, "2": 0, "3": 0, "4": 0, "5" : 0, "6": 20, "7": 70, "8": 120, "9": 30, "10": 0, "11":0, "12": 0}, "Soja" : {"1": 0, "2": 0, "3": 0, "4": 0, "5" : 0, "6": 35, "7": 110, "8": 120, "9": 35, "10": 0, "11":0, "12": 0},"Tournesol" : {"1": 0, "2": 0, "3": 0, "4": 0, "5" : 0, "6": 60, "7": 180, "8": 75, "9": 0, "10": 0, "11":0, "12": 0}} //mm / mois

var kc = {"Blé" : 0.65, "Maïs" : 0.8, "PDT" : 0.85, "Soja" : 0.7, "Tournesol" : 0.9}

var conso_animaux = {"Vache" : 80*30, "Cochon" : 10*30, "Cheval" : 30*30, "Brebis" : 6*30, "Poules" : 320*30}

var etp_formules = {
    "abondance" : etp,
    "manque" : etp
}
var current_formula = "abondance";
var hist = [];


function calc_conso(date) {
    let total_city_conso = 0;
    let agri_conso = 0;
    let forets_conso = 0;
    let industry_conso = 0;
    let animals_conso = 0;

    //Si pendant 3 mois pluie > etp alors etp2 sinon si 3 mois pluie < etr etp3
    let etp 
    if (current_formula == "manque"){
        etp = grasskc*etp_formules[current_formula](date,(square_size ** 2) * (gridsize ** 2)); // mm/mois
    } else {
        etp = etp_formules[current_formula](date,(square_size ** 2) * (gridsize ** 2)); // mm/mois
    }
    //On enregistre si y'a un manque ou pas

    check_etp_hist()

    water_consumption[3] += etp/1000;
    water_consumption_current[3] = etp/1000;

    for (var key of Object.keys(buildings)) {
        if (buildings[key].buildingtype === 'city') {
            total_city_conso = total_city_conso + buildings[key].nb_hab * (buildings[key].conso_hab / 12);
        }
        if (buildings[key].buildingtype === 'farm') {
            agri_conso += conso_plantes[buildings[key].plante][mois_actuel] * buildings[key].cover * 10;
            agri_conso += evapotranspiration2(date,buildings[key].cover * 10000) * kc[buildings[key].plante]/10000;
            etp -= etp_formules[current_formula](date,buildings[key].cover * 10000);
        }
        if (buildings[key].buildingtype === 'forest') {
            switch (buildings[key].tree_type) {
                case "Chêne":
                    if (7 <= mois_actuel && mois_actuel <= 9){
                        forets_conso = forets_conso + 850 * (buildings[key].density / 100) * (square_size ** 2 / 10000);
                    } else {
                        forets_conso = forets_conso + ((4000 - 3*850)/9) * (buildings[key].density / 100) * (square_size ** 2 / 10000);
                    }
                    break;
                case "Hêtre":
                    if (7 <= mois_actuel && mois_actuel <= 9){
                        forets_conso = forets_conso + 800 * (buildings[key].density / 100) * (square_size ** 2 / 10000);
                    } else {
                        forets_conso = forets_conso + ((3500 - 3*800)/9) * (buildings[key].density / 100) * (square_size ** 2 / 10000);
                    }
                    break;
                case "Epicéa":
                    if (7 <= mois_actuel && mois_actuel <= 9){
                        forets_conso = forets_conso + 900 * (buildings[key].density / 100) * (square_size ** 2 / 10000);
                    } else {
                        forets_conso = forets_conso + ((5000 - 3*900)/9) * (buildings[key].density / 100) * (square_size ** 2 / 10000);
                    }
                    break;
                
            };
        }
        if (buildings[key].buildingtype === 'industrial_area') {
            industry_conso = industry_conso + buildings[key].conso * buildings[key].nb_industries;
        }
        if (buildings[key].buildingtype === 'animals') {
            animals_conso = animals_conso + (buildings[key].nb_animals * conso_animaux[buildings[key].animal_type])/1000
        }

    }

    water_consumption[0] += total_city_conso;
    water_consumption[1] += agri_conso;
    water_consumption[2] += forets_conso;
    water_consumption[5] += industry_conso;
    water_consumption[6] += animals_conso;

    water_consumption_current[0] = total_city_conso;
    water_consumption_current[1] = agri_conso;
    water_consumption_current[2] = forets_conso;
    water_consumption_current[5] = industry_conso;
    water_consumption_current[6] = animals_conso;

    var total_conso = total_city_conso + agri_conso + forets_conso + industry_conso + animals_conso + etp;

    total_city_conso = total_city_conso / capacity;
    agri_conso = agri_conso / capacity;
    forets_conso = forets_conso / capacity;
    industry_conso = industry_conso / capacity;
    animals_conso = animals_conso / capacity;

    etp = etp/(1000*capacity); // conversion en %/mois

    var total_conso = total_city_conso + agri_conso + forets_conso + industry_conso + animals_conso + etp;

    // Affichage du flux sortant
    if(parseInt(total_conso*capacity*10**-9)>0){
        Sorties_counter.innerHTML = parseFloat(Math.floor(total_conso*capacity*10**-8)/10).toString() + "e9 m³";
    } else if(parseInt(total_conso*capacity*10**-6)>0){
        Sorties_counter.innerHTML = parseFloat(Math.floor(total_conso*capacity*10**-5)/10).toString() + "e6 m³";
    } else{
        Sorties_counter.innerHTML = parseFloat(Math.floor(total_conso*capacity*10**-2)/10).toString() + "e3 m³";
    }   
    
    return total_conso;
}

var secheresse = false;

function check_etp_hist(){
    if (hist.filter(x => x <= 0.2).length >= 9){
        secheresse = true;
    } else {
        secheresse = false;
    }
}


var future_rain = {}
var surface_betonee = 0;

function update_future_rain(delay){
    let annee_futur = annee_actuelle;
    let mois_futur = mois_actuel + delay;
    if (mois_futur > 12) {
        annee_futur = annee_actuelle + Math.floor((mois_actuel+delay-1)/12);
        if (mois_futur%12 != 0){
            mois_futur = (mois_actuel+delay) % 12;
        }
    }

    if (annee_futur > 2100){
        return 0;
    }

    let key = annee_futur.toString() + "-";
    if (mois_futur < 10) {
        key = key + "0";
    }

    key = key + mois_futur.toString();

    if (!(key in future_rain)){
        future_rain[key] = ((parseFloat(rain_data[key]['WCE']) * 30 * ((square_size ** 2) * (gridsize ** 2) - surface_betonee)) / (1000*capacity))*rain_intensity/100;

    } else { 
        future_rain[key] += ((parseFloat(rain_data[key]['WCE']) * 30 * ((square_size ** 2) * (gridsize ** 2) - surface_betonee))  / (1000*capacity))*rain_intensity/100;
    }
}

function update_surface_betonee(){
    surface_betonee = 0;
    for (var key of Object.keys(buildings)) {
        if (buildings[key].buildingtype === 'city') {
            surface_betonee += (buildings[key].nb_hab/buildings[key].density)*(1-buildings[key].green_cover/100)*1000000;
        }
    }
}

function seuils(){
    let val;
    let sum = 0;
    for (let i = 0; i < 12; i++){
        sum += hist[i];
    } 
    let moy = sum / 12;

    for (var key of Object.keys(buildings)) {
        if (buildings[key].buildingtype === 'farm') {
            switch (buildings[key].plante) {
                case "Blé":
                    val = Math.round(buildings[key].cover * (1-0.3))
                    buildings[key].cover = val;
                    break;
                case "Maïs":
                    val = Math.round(buildings[key].cover * (1-0.18))
                    buildings[key].cover = val;
                    break;
                case "PDT":
                    val = Math.round(buildings[key].cover * (1-0.15))
                    buildings[key].cover = val;
                    break;
                case "Soja":
                    val = Math.round(buildings[key].cover * (1-0.116))
                    buildings[key].cover = val;
                    break;
                case "Tournesol":
                    val = Math.round(buildings[key].cover * (1-0.5))
                    buildings[key].cover = val;
                    break;
            }
            if (key == selected_case){
                setting_changed("farm_cover", val);
                farm_cover_input.value = val;
            }
        }
        if (buildings[key].buildingtype === 'animals') {
            val = Math.round(buildings[key].nb_animals * (1-0.2));
            buildings[key].nb_animals = val;
            if (key == selected_case){
                setting_changed("nb_animals", val);
                nb_animals_input.value = val;
            }
        }
        if (buildings[key].buildingtype === 'forest') {
            val = buildings[key].density;
            if (moy <= 0.2){
                val = Math.round(buildings[key].density * (1-0.05));
                buildings[key].density = val;
            } else if (moy <= 0.4){
                val = Math.round(buildings[key].density * (1-0.01));
                buildings[key].density = val;
            }

            if (moy < 0.1){
                if (Math.floor(Math.random()*1000) == 1){
                    val = 0;
                    buildings[key].density = val;
                }
            }
            if (key == selected_case){
                setting_changed("forest_density", val);
                forest_density_input.value = val;
            }
        }
    }
}

function forest_easter_egg(){
    for (var key of Object.keys(buildings)) {
        if (buildings[key].buildingtype === 'forest') {
            let val = buildings[key].density ;
            if (old_value <= 0.1){
                if (Math.floor(Math.random()*1000) == 1){
                    val = 0;
                    buildings[key].density = val;
                    document.getElementById(key).firstChild.src = spirtes["dead forest"];
                }
            }
            if (key == selected_case){
                setting_changed("forest_density", val);
                forest_density_input.value = val;
            }
        }
    }
}

function update_all_charts() {
    switch(displayed_data){
        case "per":
            water_chart.data.datasets[0].data = water_data_per;
            water_chart_stats.data.datasets[0].data = water_data_per;
            break;
        case "ngf":
            water_chart.data.datasets[0].data = water_data_ngf;
            water_chart_stats.data.datasets[0].data = water_data_ngf;
            break;
        case "rain":
            water_chart.data.datasets[0].data = water_data_rain;
            water_chart_stats.data.datasets[0].data = water_data_rain;
            break;
        case "temperature":
            water_chart.data.datasets[0].data = water_data_temperature;
            water_chart_stats.data.datasets[0].data = water_data_temperature;
            break;
        default:
            water_chart.data.datasets[0].data = water_data_per;
            water_chart_stats.data.datasets[0].data = water_data_per;
            break;
    }
    
    water_chart.data.labels = time_labels;
    water_chart.update();
    
    water_chart_stats.data.labels = time_labels;
    water_chart_stats.update();


    switch(displayed_stats_conso){
        case "total":
            pie_chart_conso.data.datasets[0].data = water_consumption;
            break;
        case "month":
            pie_chart_conso.data.datasets[0].data = water_consumption_current;
            break;
        default:
            pie_chart_conso.data.datasets[0].data = water_consumption;
            break;
    }
    
    pie_chart_conso.update();
    
}

function new_frame() {
    mois_actuel = mois_actuel + 1;
    if (mois_actuel == 13) {
        mois_actuel = 1;
        annee_actuelle = annee_actuelle + 1;
    }
    stats_time_past.textContent = "Durée écoulée : " + (annee_actuelle - annee_debut) + " ans " + (mois_actuel - 1) + " mois"
    new_data_label = mois_actuel.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + "/" + annee_actuelle;
    time_labels.push(new_data_label);

    update_surface_betonee();

    // Écoulement latéral souterrain Q = K*S*DeltaH/L = K*S*tan(alpha)
    //new_value = (Math.random() * 0.5 + 0.5) * (Math.sin(((annee_actuelle - 2023) * 12 + mois_actuel) * 2 * Math.PI / 12) + 1) / 2 * Math.exp(-((annee_actuelle - 2023) * 12 + mois_actuel) / 100);

    // ECOULEMENT LATERAL SOUTERRAIN

    var hauteurnappe=old_value*capacity/(gridsize*10000)**2;
    var lateralflow=permeability*gridsize*10000*hauteurnappe*Math.tan(inclinaison)*2629800;
    water_consumption[4] += lateralflow;
    water_consumption_current[4] = lateralflow;

    lateralflow /= capacity; 
    
    let key = annee_actuelle.toString() + "-";
    if (mois_actuel < 10) {
        key = key + "0";
    }
    key = key + mois_actuel.toString();

    // stop if the key is "2101-01"
    if (key == "2101-01") {
        simulation_ended = true;
        clearInterval(main_simulation);
        return;
    }

    forest_easter_egg();

    let conso = calc_conso(key); //Calcul de la consommation totale

    var delay = calc_delay(key); //Calcul du délai d'écoulement
    
    update_future_rain(delay);

    
    if (key in future_rain){
        new_value = old_value + future_rain[key];
        
    // Affichage du flux entrant
        let rain_in = (parseFloat(future_rain[key]) * capacity);
    if(parseInt(rain_in*10**-9)>0){
            Entrées_counter.innerHTML = parseFloat(Math.floor(rain_in*10**-8)/10).toString() + "e9 m³";
    } else if(parseInt(rain_in*10**-6)>0){
            Entrées_counter.innerHTML = parseFloat(Math.floor(rain_in*10**-5)/10).toString() + "e6 m³";
    } else{
            Entrées_counter.innerHTML = parseFloat(Math.floor(rain_in*10**-2)/10).toString() + "e3 m³";
    }
        
    } else {
        new_value = old_value;
    }
    delete future_rain[key];


    new_value = new_value - conso - lateralflow;
    if (new_value < 0) { new_value = 0; }
    if (new_value > 1) { new_value = 1; }

    //--------------------------------
    //Historique des dernières valeurs

    hist.push(new_value);

    while (hist.length > 12){
        hist.shift()
    }
    //--------------------------------
    if (mois_actuel == 12){ //Bilan de l'année (sécheresse ou non)
        check_etp_hist();
    }
    
    if (mois_actuel == 1 && secheresse){ //Conséquences d'une sécheresse
        console.log(secheresse);
        seuils();
    }

    water_data_per.push(new_value);

    niv_ngf = z - depth - capacity*(1-new_value) / ((square_size ** 2)*(gridsize ** 2));
    water_data_ngf.push(niv_ngf);

    water_data_rain.push(parseFloat(rain_data[key]['WCE']) * 30 * rain_intensity/100);

    water_data_temperature.push(parseFloat(temp_data[key]['WCE']) * temperature_intensity/100);

    update_all_charts();

    water_bar_colored.style.height = new_value * 100 + "%";
    water_bar_quantity.innerHTML = (Math.round(new_value * 100)).toString() + "%";
    if(new_value < 0.2){
        water_bar_colored.style.backgroundColor = '#eb6868';
        vagues.style.backgroundColor = '#eb6868';
    } else{
        water_bar_colored.style.backgroundColor = '#68b0eb';
        vagues.style.backgroundColor = '#68b0eb';
    }



    old_value = new_value

}



var simulation_speed = 1;
var main_simulation = 0;
var simulation_running = false;
var simulation_ended = false;

function slow_down() {
    if (simulation_speed > 0.125) {
        simulation_speed = simulation_speed / 2;
        restart()
        console.log(simulation_speed);
    }
}

function speed_up() {
    if (simulation_speed < 128) {
        simulation_speed = simulation_speed * 2;
        restart();
        console.log(simulation_speed);
    }
}

function play_pause() {
    if (!simulation_running) {resume()} else {pause()}
}

function resume() {
    simulation_running = true;
    if (!simulation_ended) {
        main_simulation = setInterval(new_frame, 500 / simulation_speed);
        play_pause_button.src = "Images/pause.svg";
    }
}

function pause() {
    simulation_running = false;
    clearInterval(main_simulation);
    play_pause_button.src = "Images/play.svg";
}

function restart() {
    if (simulation_running && !simulation_ended) {
        clearInterval(main_simulation);
        main_simulation = setInterval(new_frame, 500 / simulation_speed);
    }
}

var stats_opened = false;
function open_stats() {
    stats_opened = true;
    stats_window_div.classList.remove("disparition");
    stats_window_div.style.display = "flex";
    pie_chart_conso.update();
}
function close_stats() {
    stats_opened = false;
    stats_window_div.classList.add("disparition");
    setTimeout(() => {
        stats_window_div.style.display = "none"; // set display to "none" after the animation has completed
    }, 300);
}
function toggle_stats() {
    if (stats_opened) {
        close_stats();
    } else {
        open_stats();
        if (advanced_opened){
            close_advanced();
        }
        if (export_opened){
            close_export();
        }
    }
}


var advanced_opened = false;
function open_advanced() {
    advanced_opened = true;
    advanced_window_div.classList.remove("disparition");
    advanced_window_div.style.display = "flex";
}
function close_advanced() {
    advanced_opened = false;
    advanced_window_div.classList.add("disparition");
    setTimeout(() => {
        advanced_window_div.style.display = "none"; // set display to "none" after the animation has completed
    }, 300);
}
function toggle_advanced() {
    if (advanced_opened) {
        close_advanced();
    } else {
        open_advanced();
        if (stats_opened){
            close_stats();
        }
        if (export_opened){
            close_export();
        }
    }
}



var export_opened = false;
function open_export() {
    export_opened = true;
    export_window_div.classList.remove("disparition");
    export_window_div.style.display = "inline-grid";
}
function close_export() {
    export_opened = false;
    export_window_div.classList.add("disparition");
    setTimeout(() => {
        export_window_div.style.display = "none"; // set display to "none" after the animation has completed
    }, 300);
}
function toggle_export() {
    if (export_opened) {
        close_export();
    } else {
        open_export();
        if (stats_opened){
            close_stats();
        }
        if (advanced_opened){
            close_advanced();
        }
    }
}


function export_water_data_per() {
    var output_data = [];
    for (let i=0; i<water_data_per.length; i++) {
        output_data.push([time_labels[i],water_data_per[i]])
    }
    var csv = 'Date,Water_level\n';
    output_data.forEach(function(row) {
        csv += row.join(',');
        csv += "\n";
    });
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'water_data_per.csv';
    hiddenElement.click();
}


function export_data(dataid, myname) {
    let mydata = [];
    switch(dataid){
        case "per":
            mydata = water_data_per;
            break;
        case "ngf":
            mydata = water_data_ngf;
            break;
        case "rain":
            mydata = water_data_rain;
            break;
        case "temperature":
            mydata = water_data_temperature;
            break;
        default:
            mydata = water_data_per;
            break;
    }

    var output_data = [];
    for (let i=0; i<mydata.length; i++) {
        output_data.push([time_labels[i],mydata[i]])
    }
    var csv = 'Date,Water_' + myname + '\n';
    output_data.forEach(function(row) {
        csv += row.join(',');
        csv += "\n";
    });
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = myname + '.csv';
    hiddenElement.click();
}





function export_config() {
    var output_data = {};
    output_data["gridsize"] = gridsize;
    output_data["depth"] = depth;
    output_data["permeability"] = permeability;
    output_data["capacity"] = capacity;
    output_data["inclinaison"] = inclinaison;
    output_data["rain_intensity"] = rain_intensity;
    output_data["solar_intensity"] = solar_intensity;
    output_data["wind_intensity"] = wind_intensity;
    output_data["temperature_intensity"] = temperature_intensity;
    output_data["etp_limit"] = etp_limit;
    output_data["water_data_per"] = water_data_per;
    output_data["water_data_ngf"] = water_data_ngf;
    output_data["time_labels"] = time_labels;
    output_data["water_consumption"] = water_consumption;
    output_data["annee_actuelle"] = annee_actuelle;
    output_data["mois_actuel"] = mois_actuel;
    output_data["actual_scenario"] = actual_scenario;
    output_data["future_rain"] = future_rain;
    output_data["old_value"] = old_value;
    output_data["hist"] = hist;
    output_data["z"] = z;
    output_data["phi"] = phi;
    output_data["tabHR"] = tabHR;
    output_data["tabRg"] = tabRg;
    output_data["tabv10"] = tabv10;




    output_data["buildings"] = [];
    Object.keys(buildings).forEach(function(key) {
        var building = buildings[key];
        var building_data = building.export();
        building_data["position"] = key;
        output_data["buildings"].push(building_data);
    });

    var json = JSON.stringify(output_data);
    console.log(json);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(json);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'Config.json';
    hiddenElement.click();
}


function import_config() {
    new_session();

    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
        var file = e.target.files[0]; 

        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');

        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            var data = JSON.parse(content);
            console.log(data);
            setting_changed("size", data["gridsize"]);
            setting_changed("depth", data["depth"]);
            setting_changed("permeability", data["permeability"]);
            setting_changed("capacity", data["capacity"]/ 10 ** 9);
            setting_changed("inclinaison", data["inclinaison"]/Math.PI*180);
            setting_changed("rain_intensity", data["rain_intensity"]);
            setting_changed("solar_intensity", data["solar_intensity"]);
            setting_changed("wind_intensity", data["wind_intensity"]);
            setting_changed("temperature_intensity", data["temperature_intensity"]);
            setting_changed("altitude",data["z"]);
            setting_changed("latitude", data["phi"]);

            setting_changed("tabHR",data["tabHR"]);
            setting_changed("tabRg", data["tabRg"]);
            setting_changed("tabv10", data["tabv10"]);

            water_data_per = data["water_data_per"];
            water_data_ngf = data["water_data_ngf"];
            time_labels = data["time_labels"];
            water_consumption = data["water_consumption"];
            update_all_charts();
            annee_actuelle = data["annee_actuelle"];
            mois_actuel = data["mois_actuel"];
            change_climatic_scenario(data["actual_scenario"]);
            future_rain = data["future_rain"];
            old_value = data["old_value"];
            hist = data["hist"];


            buildings = {};
            data["buildings"].forEach(function(building_data) {
                selected_case = building_data["position"];

                var template
                switch (building_data["buildingtype"]) {
                    case "city":
                        template = new City(building_data["nb_hab"], building_data["conso"], building_data["density"], building_data["category"], building_data["green_cover"]);
                        break;
                    case "farm":
                        template = new Farm(building_data["plante"], building_data["cover"]);
                        break;
                    case "forest":
                        template = new Forest(building_data["tree_type"], building_data["density"]);
                        break;
                    case "industrial_area":
                        template = new Industrial_area(building_data["conso"], building_data["size"], building_data["nb_industries"]);
                        break;
                    case "animals":
                        template = new Animals(building_data["animal_type"], building_data["nb_animals"]);
                        break;
                }
                place_building(building_data["buildingtype"], template);
            });
        }
    }

    input.click();
}


function new_session(){
    let check = confirm("Vous êtes sur le point de créer une nouvelle simulation. Tous les paramètres de la simulation et la grille seront réinitialisés.");
    if (check){
        //location.reload();
        initialisation();
    }
}

let zoom = 1;
const ZOOM_SPEED = 0.1;
let zoomElement = pave_3d;

document.addEventListener("wheel", function(e) {  
    var offsets = document.getElementById('grid_3d_div').getBoundingClientRect();

    let dx = e.clientX - (offsets.x + offsets.width/2);
    let dy = e.clientY - (offsets.y + offsets.height/2);

    if(e.deltaY < 0 && e.clientX > offsets.x && e.clientX < offsets.x + offsets.width && e.clientY > offsets.y && e.clientY < offsets.y + offsets.height){    
        if (zoom < 2) {zoom += ZOOM_SPEED}
        zoomElement.style.transform = `rotateX(50deg) rotateZ(315deg) scale(${zoom})`;  
        zoomElement.style.left = `${-dx/2}px`;
        zoomElement.style.top = `${-dy/2}px`

    }else if (e.clientX > offsets.x && e.clientX < offsets.x + offsets.width && e.clientY > offsets.y && e.clientY < offsets.y + offsets.height ){    
        if (zoom > 1) {zoom -= ZOOM_SPEED}
        zoomElement.style.transform = `rotateX(50deg) rotateZ(315deg) scale(${zoom})`;  
        zoomElement.style.left = `0`;
        zoomElement.style.top = `0`;
    }
});

document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "c":
            copy_building();
            break;
        case "v":
            paste_building();
            break;
        case " ":
            play_pause();
            break;
        case "Delete":
            remove_building();
            break;
        case "i":
            toggle_stats();
            break;
    }
});



