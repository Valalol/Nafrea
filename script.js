// Classes de bâtiments
class City {
    constructor(nb_hab = 100000, conso = 54, density = 5000, category = 2, green_cover = 25) {
        this.buildingtype = "city";
        this.nb_hab = nb_hab; //nombre d'habitants
        this.conso_hab = conso; //consommation par habitant (m³)
        this.density = density; //densité d'habitants dans la ville (hab/km²)
        this.category = category; //catégorie de ville : 1=petite, 2=moyenne, 3=grande
        this.green_cover = green_cover; //couverture végétale de la ville (%)
    }
    export() { //fonction d'export du batiment
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
        this.plante = plante; //plante cultivée
        this.cover = cover; //couverture des plantes (ha)
    }
    export() { //fonction d'export du batiment
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
        this.tree_type = tree_type; //type d'arbre (chêne, épicea, hêtre)
        this.density = density; //densité de la foret (%)
    }
    export() { //fonction d'export du batiment
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
        this.conso = conso; //consommation par industie (m³)
        this.size = size; //taille de chaque industrie (ha)
        this.nb_industries = nb_industries; //nombre d'industries
    }
    export() { //fonction d'export du batiment
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
        this.animal_type = animal_type; //type d'animal (vache, cochon, poule, cheval, brebis)
        this.nb_animals = nb_animals; //nombre d'animaux
    }
    export() { //fonction d'export du batiment
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



var temp_data, rain_data;
var actual_scenario = "245"; //scenario du giec (126, 245 ou 370)

async function change_climatic_scenario(x){
    actual_scenario = x;
    rain_data = await read_climate_csv(`precipitations/precip_combine_${x}.csv`); //importation depuis le depot github
    temp_data = await read_climate_csv(`temperatures/temp_combine_${x}.csv`); //importation depuis le depot github

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

var old_value = 0.65; //% remplissage de la nappe

var annee_debut = 2023; //année de début de la simulation (1850 à 2099)
var mois_debut = 01; //mois de début de la simulation (1 à 12)
var annee_actuelle = annee_debut; //année actuelle
var mois_actuel = mois_debut; //mois actuel

var new_data_label = mois_actuel.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + "/" + annee_actuelle; //format mm/aaaa

var time_labels = [new_data_label]; //tableau des mois (abscisse graphique)

var water_data_per = [0.65]; //remplissage en %
var water_data_rain = [0]; //précipitations en mm
var water_data_temperature = [0]; //températures en °C

// Données calculées pendant la simulation
var record_data_per = true; //calcul des données de remplissage = oui
var record_data_ngf = true; //calcul des données de remplissage = oui
var record_data_temperature = false; //calcul des données de température = non (optimisation)
var record_data_rain = false; //calcul des données de précipitations = non (optimisation)

function create_chart(canvas_used, title_bool) { //création graphique
    return new Chart(canvas_used, {
        type: 'line', //graphique en ligne
        data: {
            labels: time_labels, //abscisse = mm/aaaa
            datasets: [{
                data: water_data_per, //ordonnées = remplissage nappe (%)
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
                    min: 0, //ordonnée min
                    max: 1, //ordonnée max
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

var water_chart = create_chart(water_timeline, false); //timeline
var water_chart_stats = create_chart(water_timeline_stats, true); //graphique de la fenetre des stats
var water_consumption = [0, 0, 0, 0, 0, 0,0]; //consommations totales depuis début [villes, irrigation, forets, etp, ecoul. lateral, industries, elevages]
var water_consumption_current = [0, 0, 0, 0, 0, 0,0]; //consommations du mois actuel

var pie_chart_conso = new Chart(pie_chart_conso_canvas, {
    type: 'pie', //graphique en camembert
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


var gridsize = 8; //nombre de cases par colonnes (nb total de cases = gridsize²)
var selected_case = null; //case sélectionnée


var capacity = 15 * 10 ** 9; //capacité max de la nappe (m³) 
var phi = 48; //latitude (deg)
var z = 30; //altitude (m ngf)
var depth = 10; //prodondeur minimale de la nappe (m)
var permeability = 10**-5; //coefficient de permeabilite du sol (m/s)
var inclinaison = 5*Math.PI/180; //inclinaison de la nappe (deg)
var rain_intensity = 100; //intensité de la pluie (%)
var wind_intensity = 100; //intensité du vent (%)
var solar_intensity = 100; //intensité de l'irradiance (%)
var temperature_intensity = 100; //intensité des températures (%)
var etp_limit = Infinity; //limite d'etp (% des précipitations, Infinity=pas de limite)

var water_data_ngf = [z - depth - capacity*(1-old_value) / ((square_size ** 2)*(gridsize ** 2))]; //niveau de la nappe en m ngf
var displayed_data = "per"; //donnée affichée sur la timeline (per, ngf, rain ou temperature)
var displayed_stats_conso = "total"; //donnée affichée sur le camembert des consos (total ou month)

function change_chart_var(value){ //change la donnée affichée sur la timeline et le graphique des stats
    switch(value){
        case "percentage" :
            water_chart.options.scales.y.min = 0; //ordonnée min (timeline)
            water_chart.options.scales.y.max = 1; //ordonnée max (timeline)
            water_chart_stats.options.scales.y.min = 0; //ordonnée min (stats)
            water_chart_stats.options.scales.y.max = 1; //ordonnée max (stats)
            displayed_data = "per";
            water_chart_stats.config.options.plugins.title.text = "Remplissage de la nappe au cours du temps (%)";
            update_all_charts();
            break;

        case "niv_ngf" :
            water_chart.options.scales.y.min = z - depth - capacity / ((square_size ** 2)*(gridsize ** 2)); //ordonnée min (timeline)
            water_chart.options.scales.y.max = z - depth; //ordonnée max (timeline)
            water_chart_stats.options.scales.y.min = z - depth - capacity / ((square_size ** 2)*(gridsize ** 2)); //ordonnée min (stats)
            water_chart_stats.options.scales.y.max = z - depth; //ordonnée max (stats)
            displayed_data = "ngf";
            water_chart_stats.config.options.plugins.title.text = "Niveau ngf de la nappe au cours du temps (m)";
            update_all_charts();
            break;

        case "rain" :
            water_chart.options.scales.y.min = 0; //ordonnée min (timeline)
            water_chart.options.scales.y.max = 130; //ordonnée max (timeline)
            water_chart_stats.options.scales.y.min = 0; //ordonnée min (stats)
            water_chart_stats.options.scales.y.max = 130; //ordonnée max (stats)

            displayed_data = "rain";
            water_chart_stats.config.options.plugins.title.text = "Niveau mensuel des précipitations (mm)";
            update_all_charts();
            break;

        case "temperature" :
            water_chart.options.scales.y.min = -10; //ordonnée min (timeline)
            water_chart.options.scales.y.max = 50; //ordonnée max (timeline)
            water_chart_stats.options.scales.y.min = -10; //ordonnée min (stats)
            water_chart_stats.options.scales.y.max = 50; //ordonnée max (stats)

            displayed_data = "temperature";
            water_chart_stats.config.options.plugins.title.text = "Température moyenne mensuelle (°C)";
            update_all_charts();
            break;

        default:
            water_chart.options.scales.y.min = 0; //ordonnée min (timeline)
            water_chart.options.scales.y.max = 1; //ordonnée max (timeline)
            water_chart_stats.options.scales.y.min = 0; //ordonnée min (stats)
            water_chart_stats.options.scales.y.max = 1; //ordonnée max (stats)
            displayed_data = "per";
            water_chart_stats.config.options.plugins.title.text = "Remplissage de la nappe au cours du temps (%)";
            update_all_charts();
            break;
    }
}

function change_stats_conso(value){ //change les valeurs du camembert des stats (consos totales ou mois actuel)
    switch(value){
        case "month":
            displayed_stats_conso = "month"; //valeurs du mois actuel
            update_all_charts();
            break;
        case "total":
            displayed_stats_conso = "total"; //valeurs cummulées depuis le début
            update_all_charts();
            break;
        default:
            displayed_stats_conso = "total"; //valeurs cummulées depuis le début
            update_all_charts();
            break;

    }
}

function change_record_parameters(value){ //change les données calculés
    //Selection de la donnée affichée, on désactive les choix des données non-calculées
    per_radio.disabled = !record_per_checkbox.checked;
    ngf_radio.disabled = !record_ngf_checkbox.checked;
    rain_radio.disabled = !record_rain_checkbox.checked;
    temperature_radio.disabled = !record_temperature_checkbox.checked;
    //Export de données, on désactive les choix des données non-calculées
    export_per_button.disabled = !record_per_checkbox.checked;
    export_ngf_button.disabled = !record_ngf_checkbox.checked;
    export_rain_button.disabled = !record_rain_checkbox.checked;
    export_temperature_button.disabled = !record_temperature_checkbox.checked;
    //Mise a jour des booléens
    record_data_per = record_per_checkbox.checked;
    record_data_ngf = record_ngf_checkbox.checked;
    record_data_rain = record_rain_checkbox.checked;
    record_data_temperature = record_temperature_checkbox.checked;
}


function change_animations_status(value){ //active ou désactive les animations des graphiques
    water_chart.options.animation = value;
    water_chart_stats.options.animation = value;
}

function redraw_grid(size) { //recrée une grille de la taille size² 
    gridsize = size;
    selected_case = null;
    buildings = [];
    grid_3d_div.textContent = '';
    draw_grid(size);
}


function draw_grid(size) { //crée une grille de la taille size² 
    grid_3d_div.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
    grid_3d_div.style.gridTemplateRows = `repeat(${size}, minmax(0, 1fr))`;

    for (let i = 1; i <= size; i++) {
        for (let j = 1; j <= size; j++) { //création des cases
            let div = document.createElement('div');
            div.className = 'case_grid';
            div.id = `case${i}_${j}`; //appelation : case_ligne_colonne
            div.style.zIndex = i - j + parseInt(size) + 1; //ordre d'affichage
            div.onclick = function () { div_selected(this) }; //case cliquée → on appelle div_selected()
            grid_3d_div.appendChild(div); //élément html qui stocke toutes les cases
        }
    }
}
draw_grid(gridsize); //on crée initialement une grille de taille gridsize²

function setting_changed(setting, value) { //mise à jour de paramètre (depuis sliders ou fenetre parametres avancés)
    switch (setting) {
        case "size": //nb de cases par colonne
            gridsize = parseInt(value);
            map_size_label.textContent = "Taille de la carte (" + gridsize + ")";
            map_size_input.value = gridsize;
            redraw_grid(gridsize);
            break;
         case "square_size": //longueur d'une case (m)
            //advanced only
            square_size = parseInt(value);
            break;
        case "start_date": //date de début (mois+année)
            mois_debut = parseInt(start_month_select.value);
            annee_debut = parseInt(start_year_box.value);
            annee_actuelle = annee_debut;
            mois_actuel = mois_debut;
            new_data_label = mois_actuel.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + "/" + annee_actuelle;
            time_labels = [new_data_label];
            update_all_charts();
            break;
        case "altitude": //altitude du site (m)
            altitude_label.textContent = "Altitude du site (" + value + " m)";
            altitude_input.value = value;
            altitude_box.value = value;
            z = parseFloat(value);
            water_data_ngf = [z - depth - capacity*(1-old_value) / ((square_size ** 2)*(gridsize ** 2))];
            update_all_charts();
            break;
        case "latitude": //latitude du site (deg)
            //advanced only
            latitude_box.value = parseFloat(value);
            phi = parseFloat(value);
            break;
        case "depth": //profondeur minimale de la nappe (m)
            depth_label.textContent = "Profondeur de la nappe (" + value + " m)";
            depth_input.value = value;
            depth_box.value = value;
            depth = parseInt(value);
            water_data_ngf = [z - depth - capacity*(1-old_value) / ((square_size ** 2)*(gridsize ** 2))];
            update_all_charts();
            break;
        case "permeability_coeff": //coeff de permeabilité (m/s)
            permeability_coeff_label.textContent = "Coefficient de perméabilité (1e" + value + " m/s)";
            permeability_coeff_input.value = value;
            permeability = parseFloat(10 ** value);
            permeability_coeff_box.value = "1e"+value.toString();
            break;
        case "permeability_coeff_advanced": //coeff de permeabilité format XXeX (parametres avancés) (m/s)
            if(value.split("e").length == 2){
                permeability_coeff_label.textContent = "Coefficient de perméabilité (" + value + " m/s)";
                permeability_coeff_input.value = parseInt(value.split("e")[1]);
                permeability = parseFloat(value.split("e")[0]*10**value.split("e")[1]);
            } else{
                permeability_coeff_advanced_label.textContent = "Coefficient de perméabilité (m/s) (ex: 9e-6) [FORMAT INVALIDE]";
            }
            break;
        case "capacity": //capacité de la nappe (10^9 m³)
            capacity_label.textContent = "Capacité de la nappe (" + value + " e9 m³)";
            capacity_input.value = value;
            capacity = parseFloat(value * 10 ** 9);

            capacity_box.value = value.toString() + "e9";
            break;
        case "capacity_advanced": //capacité de la nappe format XXeX (parametres avancés) (10^9 m³)
            if(value.split("e").length == 2){
                capacity_label.textContent = "Capacité de la nappe (" + value + " m³)";
                capacity_input.value = parseInt(value.split("e")[0]);
                capacity = parseInt(value.split("e")[0]) * 10 ** parseInt(value.split("e")[1]);
                capacity_box.value = value;
            } else{
                capacity_advanced_label.textContent = "Capacité de la nappe (m³) (ex: 10e9) [FORMAT INVALIDE]";
            }
            break;
        case "inclinaison": //inclinaison de la nappe (deg)
            inclinaison_label.textContent = "Inclinaison (" + value + "°)";
            inclinaison_input.value = value;
            inclinaison_box.value = value;
            inclinaison = parseFloat(value)*Math.PI/180; //conversion en rad
            break;
        case "startfilling": //remplissage initial (%)
            //advanced only
            startfilling_box.value = value;
            old_value = parseInt(value)/100;
            water_data_per = [old_value];
            water_data_ngf = [z - depth - capacity*(1-old_value) / ((square_size ** 2)*(gridsize ** 2))];
            water_data_rain = [0];
            water_data_temperature = [0];
            water_bar_colored.style.height = old_value * 100 + "%";
            water_bar_quantity.innerHTML = (Math.round(old_value * 100)).toString() + "%";
            update_all_charts();
            break;
        case "rain_intensity": //intensité de la pluie (%)
            rain_intensity_label.textContent = "Intensité des précipitations (" + value + "%)";
            rain_intensity_input.value = value;
            rain_intensity_box.value = value;
            rain_intensity = parseFloat(value);
            break;
        case "wind_intensity": //intensité du vent (%)
            //advanced only
            wind_intensity_box.value = value;
            wind_intensity = parseFloat(value);
            break;
        case "solar_intensity": //intensité du rayonnement solaire (%)
            //advanced only
            solar_intensity_box.value = value;
            solar_intensity = parseFloat(value);
            break;
        case "temperature_intensity": //intensité des températures (%)
            //advanced only
            temperature_intensity_box.value = value;
            temperature_intensity = parseFloat(value);
            break;
        case "etp_limit": //limite d'etp (% de la pluie du mois)
            //advanced only
            if(parseFloat(value) == 0){
                etp_limit = Infinity;
            } else{
                etp_limit = parseFloat(value);
            }
            break;
        case "tabHR": //tableau mensuel des humidités relatives (%)
            //advanced only
            mytmp = value.toString();
            mytmp = mytmp.replace("[","");
            mytmp = mytmp.replace("]","");
            mytmp = mytmp.split(",").map(Number);
            if(mytmp.length == 12){
                tabHR = mytmp;
                tabHR_label.textContent = "Humidité relative mensuelle moyenne (%)";
            } else{
                tabHR_label.textContent = "Humidité relative mensuelle moyenne (%) [FORMAT INVALIDE]";
            }
            tabHR_box.value = value;
            break;
        case "tabRg": //tableau mensuel des valeurs moyennes quotidiennes des rayonnements solaires (kWh/m²/jour)
            //advanced only
            mytmp = value.toString();
            mytmp = mytmp.replace("[","");
            mytmp = mytmp.replace("]","");
            mytmp = mytmp.split(",").map(Number);
            if(mytmp.length == 12){
                tabRg = mytmp;
                tabRg_label.textContent = "Irradiance quotidienne moyenne (kWh/m²/jour)";
            } else{
                tabRg_label.textContent = "Irradiance quotidienne moyenne (kWh/m²/jour) [FORMAT INVALIDE]";
            }
            tabRg_box.value = value;
            break;
        case "tabv10": //tableau mensuel de la force du vent à 10m (m/s)
            //advanced only
            mytmp = value.toString();
            mytmp = mytmp.replace("[","");
            mytmp = mytmp.replace("]","");
            mytmp = mytmp.split(",").map(Number);
            if(mytmp.length == 12){
                tabv10 = mytmp;
                tabv10_label.textContent = "Vitesse mensuelle moyenne du vent à 10m (m/s)";
            } else{
                tabv10_label.textContent = "Vitesse mensuelle moyenne du vent à 10m (m/s) [FORMAT INVALIDE]"
            }
            tabv10_box.value = value;
            break;
        case "city_size": //[ville] taille de la ville (1=petite, 2=moyenne, 3=grande)
            buildings[selected_case].category = parseInt(value);
            if(value == "1"){ //[ville] petite ville
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
            if(value == "2"){ //[ville] moyenne ville
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
            if(value == "3"){ //[ville] grande ville
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
        case "city_nb_hab": //[ville] nombre d'habitants
            nb_hab_label.textContent = "Nombre d'habitants (" + value + ")";
            buildings[selected_case].nb_hab = value;
            city_density_input.min = Math.min(value/100,city_density_input.max);
            if (city_density_input.value <= city_density_input.min){
                setting_changed("city_density",value/100);
            } 
            break;
        case "city_conso_hab": //[ville] conso annuelle par habitant (m³/an) 
            conso_hab_label.textContent = "Consommation par habitant (" + value + " m³/an)";
            buildings[selected_case].conso_hab = value;
            break;
        case "city_density": //[ville] densité de la population
            city_density_label.textContent = "Densité de la population (" + value + " hb/km²)";
            buildings[selected_case].density = value;
            break;
        case "city_green_cover": //[ville] couverture végétale
            city_green_cover_label.textContent = "Couverture végétale (" + value + " %)";
            buildings[selected_case].green_cover = value;
            break;
        case "farm_plante": //[ferme] type de culture (blé, maïs, pommes de terre, soja, tournesol)
            buildings[selected_case].plante = value;
            break;
        case "farm_cover": //[ferme] couverture de la ferme (ha)
            farm_cover_label.textContent = "Couverture des plantations (" + value + " ha)";
            buildings[selected_case].cover = value;
            break;
        case "forest_density": //[fôret] densité de la foret (%)
            forest_density_label.textContent = "Densité de la forêt (" + value + " %)";
            buildings[selected_case].density = value;

            //mise a jour de l'image de la foret selon sa densité
            if(value==0){
                document.getElementById(selected_case).firstChild.src = sprites["dead forest"];
            } else if(value<20){
                document.getElementById(selected_case).firstChild.src = sprites["small forest"];
            } else if(value<30){
                document.getElementById(selected_case).firstChild.src = sprites["medium forest"];
            } else{
                document.getElementById(selected_case).firstChild.src = sprites["forest"];
            };
            break;
        case "forest_tree_type": //[fôret] type d'arbre (chêne, épicéa, hêtre)
            buildings[selected_case].tree_type = value;
            break;
        case "industry_conso": //[zone industrielle] consommation annuelle par industrie (m³/an)
            industrie_conso_label.textContent = "Consommation par industrie (" + value + " m³)";
            buildings[selected_case].conso = parseInt(value);
            break;
        case "industry_size": //[zone industrielle] surface de chaque industrie (ha)
            industrie_size_label.textContent = "Taille de chaque industrie (" + value + " ha)";
            buildings[selected_case].size = parseInt(value);
            nb_industries_input.max = 10000 / parseInt(value);
            if (buildings[selected_case].nb_industries > parseInt(nb_industries_input.max)){
                setting_changed("industry_number", value = parseInt(nb_industries_input.max));
            }
            break;
        case "industry_number": //[zone industrielle] nombre d'industries
            nb_industries_label.textContent = "Nombre d'industrie (" + value + ")";
            buildings[selected_case].nb_industries = parseInt(value);
            break;
        case "animal_type": //[élevage] type d'animal (vache, cochon, cheval, brebis, poules)
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
        case "nb_animals": //[élevage] nombre d'animaux
            buildings[selected_case].nb_animals = value;
            nb_animals_label.textContent = "Nombre d'animaux (" + value + ")"
            nb_animals_input.value = value;
            break;
    }
}


function place_cube_side_faces() { //crée les faces inférieures du terrain (sol)
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


var occupied_list = []; //liste des cases occupées
var buildings = {}; //liste des bâtiments et de leurs propriétés

function div_selected(item) { //case sélectionnée (click)
    if (selected_case != null) { //si une autre case était sélectionné, on la déselectionne
        document.getElementById(selected_case).style.backgroundColor = '';
        document.getElementById(selected_case).classList.remove("grid_case_selected");
    }
    selected_case = item.id; //format casei_j
    
    item.style.backgroundColor = 'red';
    item.classList.add("grid_case_selected");

    //on cache de la barre latérale les menus de toutes les classes de batiment
    Selected_building_parameters_div.style.display = "none";
    City_menu_div.style.display = "none";
    Farm_menu_div.style.display = "none";
    Forest_menu_div.style.display = "none";
    Industrial_area_menu_div.style.display = "none";
    Animals_menu_div.style.display = "none";


    if (selected_case in buildings) {
        switch (buildings[selected_case].buildingtype) {
            case "city":
                Selected_building_parameters_div.style.display = "block"; //affichage du menu de la classe sélectionnée

                //affichage paramètres spécifiques ville
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
                //affichage paramètres spécifiques ferme
                Selected_building_parameters_div.style.display = "block";

                plantation_type_select.value = buildings[selected_case].plante;
                farm_cover_input.value = buildings[selected_case].cover;
                setting_changed("farm_cover", buildings[selected_case].cover);
                Farm_menu_div.style.display = "block";
                break;
            case "forest":
                //affichage paramètres spécifiques fôret
                Selected_building_parameters_div.style.display = "block";

                tree_type_select.value = buildings[selected_case].tree_type;
                forest_density_input.value = buildings[selected_case].density;
                setting_changed("forest_density", buildings[selected_case].density);
                Forest_menu_div.style.display = "block";
                break;
            case "industrial_area":
                //affichage paramètres spécifiques zone industrielle
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
                //affichage paramètres spécifiques élevage
                Selected_building_parameters_div.style.display = "block";

                setting_changed("nb_animals", buildings[selected_case].nb_animals);
                Animals_menu_div.style.display = "block";
            default:
                break;
        }
    }
}

//liens internes vers les visuels du site
const sprites = {
    "city": "Images/Ville.png",
    "medium city" : "Images/Ville Moyenne.png",
    "small city" : "Images/Ville Petite.png",
    "farm": "Images/Ferme 2.png",
    "forest": "Images/Forêt Epicea.png",
    "medium forest": "Images/Forêt medium.png",
    "small forest": "Images/Forêt mal.png",
    "dead forest" : "Images/Forêt morte.png",
    "industrial_area": "Images/Industrie.png",
    "animals": "Images/Elevage.png",
}

var copied_building = false; //par défaut : aucun bâtiment sélectionné pour la copie

function place_building(type, template = false) { //place un bâtiment sur la grille
    if (selected_case != null && !occupied_list.includes(selected_case)) { //case sélectionnée vide
        occupied_list.push(selected_case);
        div = document.getElementById(selected_case);
        div.style.backgroundColor = 'yellow';
        let maison_image = document.createElement('img');
        maison_image.src = sprites[type];
        maison_image.classList.add("sprite_cool");
        div.appendChild(maison_image);

        var build; //objet de la classe "type" de batiment
        if (!template) { //pas de template (cas basique:ajout nouveau batiment par défaut)
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
        } else { //si template : on veut coller ou importer les batiments d'une config
            if(copied_building){ //collage du batiment copié sur la grille
                build = Object.assign(Object.create(Object.getPrototypeOf(copied_building)), copied_building)
            } else{ //placement des batiments de l'import
                build = template;
            }            
        }
        buildings[selected_case] = build; //case sélectionnée = case placée
    }
    div_selected(div);
}

function remove_building() { //supprime le batiment sélectionné
    div = document.getElementById(selected_case); //case à supprimer
    if (selected_case != null && occupied_list.includes(selected_case)) { //case occupée
        occupied_list.splice(occupied_list.indexOf(selected_case), 1);
        div.removeChild(div.childNodes[0]);
        delete buildings[selected_case];
    }
    div_selected(div);
}

function copy_building() { //copie le batiment sélectionné
    if (selected_case != null && occupied_list.includes(selected_case)) { //case occupée
        copied_building = buildings[selected_case];
    }
    div_selected(div);
}

function paste_building() { //colle un batiment avec les memes paramètres que le batiment copié
    if (copied_building) {
        place_building(copied_building.buildingtype, template = true)
    }
}

function calc_delay(date) { //calcul le délai d'infiltration de l'eau
    Q = (permeability) * (parseFloat(rain_data[date]['WCE'])*0.001+depth)/(depth);
    return Math.floor((depth/Q)/2629800); // conversion secondes -> mois
}

function evapotranspiration(date){ //EN ATTENTE DE SUPPRESSION
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

function evapotranspiration2(date, cover){ //EN ATTENTE DE SUPPRESSION
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

function evapotranspiration3(date, cover) { //EN ATTENTE DE SUPPRESSION
    p = rain_data[date]["WCE"];
    t = temp_data[date]["WCE"];
    l = 300 + 25*t + 0.05*t**3;
    ETR = (p/((0.9+p**2/l**2))**1/2);
    return ETR*30*cover
}

function fes(T){ //appelée depuis etp()
    return 0.6108*Math.exp((17.27*T)/(T+237.3))
}


var tabHR = [85, 81, 77, 73, 74, 69, 68, 70, 70, 80, 85, 85]; //humidité relative mensuelle moyenne (%)
var tabRg = [1.96, 3.3, 4.6, 5.59, 5.65, 5.93, 5.99, 5.79, 5.43, 3.46, 2.46, 2.01]; //irradiance quotidienne moyenne par mois (kWh/m²/jour)
var tabv10 = [5.22, 5.06, 4.89, 4.69, 4.36, 4.22, 4.06, 3.92, 4.19, 4.64, 4.89, 5.14]; //vitesse du vent mensuelle moyenne (m/s)
var grasskc = 0.8; //EN ATTENTE DE SUPPRESSION

function etp(date,cover){ //calcul l'evapotranspiration pour une date donnée et sur une surface donnée
    
    var Tmoy = parseFloat(temp_data[date]["WCE"])*temperature_intensity/100; //température moyenne (°C)
    var Tn = Tmoy-5; //température minimum (°C)
    var Tx = Tmoy+5; //température maximum (°C)
    var mois = parseInt(date.split("-")[1]); //numéro du mois (1-12)
    var HRmoy = tabHR[mois-1]; //humidité relative moyenne (%)
    var Rg = tabRg[mois-1]*3.6*solar_intensity/100; //irradiance moyenne (kWh/m²/jour)
    var NBJ = 365; //nombre de jours dans l'année
    var rad_phi = phi * (Math.PI/180); //latitude en radian
    
    var v10m = tabv10[mois-1]*wind_intensity/100; //vitesse du vent à 10m d'altitude (m/s)


    var J = 30*(mois-1) + 15; //→15e jour du mois
    var delta = 4098*(fes(Tmoy)/((Tmoy+237.3)**2)) //variation de la pression partielle de la vapeur d'eau par rapport à la variation de la température de l'air (kPa/°C)

    var Pa = 101.3*((293-0.0065*z)/293)**5.26; //pression atmosphérique à l'altitude z (kPa)
    var gamma = 0.665e-3*Pa; //constante psychométrique (kPa/°C)

    var v2m = v10m*4.87/Math.log(672.58); //vitesse du vent à 2m d'altitude (m/s)

    var es = (fes(Tn)+fes(Tx))/2; //pression de vapeur d'eau saturante
    var ea = HRmoy/100 * es; //pression de vapeur d'eau actuelle

    var pdelta = 0.409*Math.sin(2*Math.PI*J/NBJ - 1.39); //déclinaison solaire (rad)
    var dr = 1+0.033*Math.cos(2*Math.PI*J/NBJ); //variation de distance entre la Terre et le Soleil
    var ws = Math.acos(-Math.tan(rad_phi)*Math.tan(pdelta)); //angle horaire du coucher du Soleil (rad)
    var Ra = (24*60/Math.PI)*0.082*dr*(ws*Math.sin(rad_phi)*Math.sin(pdelta) + Math.cos(rad_phi)*Math.cos(pdelta)*Math.sin(ws)); //radiation extraterrestre horaire (MJ/m²/heure)

    var Rso = (0.75+(2e-5)*z)*Ra; //radiation solaire à ciel dégagé (MJ/m²/jour)
    var Rn = 0.77*Rg - (0.34-0.14*Math.sqrt(ea))*(4.903e-9) * ((Tn+273.15)**4 + (Tx+273.15)**4)/2 * (1.35*Math.min(Rg/Rso,1)-0.35); //rayonnement IR émis par la Terre (MJ/m²/jour)
    
    //ET0 QUOTIDIENNE PENMAN-MONTEITH FAO

    var ET0 = (0.408*delta*Rn+gamma*(900/(Tmoy+273)) * v2m * Math.max(es-ea,0)) / (delta+gamma*(1+0.34*v2m)); //évapotranspiration journalière de référence pour les cultures
    ET0 = Math.min(ET0, parseFloat(rain_data[date]['WCE'])*etp_limit/100); //si une limite d'etp est fixée

    return ET0*30*cover; //etp mensuelle de référence (mm/mois)
}
//conso des plantes par type de culture et selon la saison (m³)
var conso_plantes = {"Blé" : {"1": 0, "2": 0, "3": 0, "4": 25, "5" : 90, "6": 60, "7": 0, "8": 0, "9": 0, "10": 0, "11":0, "12": 0},"Maïs" : {"1": 0, "2": 0, "3": 0, "4": 0, "5" : 10, "6": 80, "7": 200, "8": 120, "9": 25, "10": 0, "11":0, "12": 0},"PDT" : {"1": 0, "2": 0, "3": 0, "4": 0, "5" : 0, "6": 20, "7": 70, "8": 120, "9": 30, "10": 0, "11":0, "12": 0}, "Soja" : {"1": 0, "2": 0, "3": 0, "4": 0, "5" : 0, "6": 35, "7": 110, "8": 120, "9": 35, "10": 0, "11":0, "12": 0},"Tournesol" : {"1": 0, "2": 0, "3": 0, "4": 0, "5" : 0, "6": 60, "7": 180, "8": 75, "9": 0, "10": 0, "11":0, "12": 0}} //mm / mois

var kc = {"Blé" : {"1": 2/3, "2": 1, "3": 1, "4": 1.2, "5" : 1.2, "6": 1.1, "7": 0, "8": 0, "9": 0, "10": 0, "11":0, "12": 0.5},"Maïs" : {"1": 0, "2": 0, "3": 0, "4": 0, "5" : 0.4, "6": 1, "7": 1.1, "8": 1, "9": .8, "10": 0, "11":0, "12": 0},"PDT" : {"1": 0, "2": 0, "3": 0, "4": 0, "5" : .4, "6": .7, "7": .9, "8": 1.05, "9": 1, "10": 0.8, "11":0, "12": 0}, "Soja" : {"1": 0, "2": 0, "3": 0, "4": 0, "5" : 0.4, "6": 2/3, "7": 1, "8": 2/3, "9": 0.4, "10": 0, "11":0, "12": 0},"Tournesol" : {"1": 0, "2": 0, "3": 0, "4": 0.5, "5" : 2/3, "6": 1.05, "7": 0.9, "8": 0.6, "9": 0, "10": 0, "11":0, "12": 0}}//coefficient cultural des cultures

var conso_animaux = {"Vache" : 80*30, "Cochon" : 10*30, "Cheval" : 30*30, "Brebis" : 6*30, "Poules" : 320*30} //conso par animal (m³)

var etp_formules = { //EN ATTENTE DE SUPPRESSION
    "abondance" : etp,
    "manque" : etp
}
var current_formula = "abondance";
var hist = []; //enregistre les manques d'eau


function calc_conso(date) { //calcule la consommation mensuelle
    let total_city_conso = 0; //conso totale des villes
    let agri_conso = 0; //conso totale des fermes
    let forets_conso = 0; //conso totale des fôrets
    let industry_conso = 0; //conso totale des zones industrielles
    let animals_conso = 0; //conso totale des élevages

    let etp_val; //valeur mensuelle de l'etp calculée
    etp_val = etp(date,(square_size ** 2) * (gridsize ** 2)); // mm/mois
    
    //On enregistre si y'a un manque ou pas
    check_etp_hist()

    water_consumption[3] += etp_val/1000; //conversion en m/mois
    water_consumption_current[3] = etp_val/1000;

    for (var key of Object.keys(buildings)) { //pour chaque batiment
        if (buildings[key].buildingtype === 'city') { //ville
            total_city_conso = total_city_conso + buildings[key].nb_hab * (buildings[key].conso_hab / 12); //ajout de la conso de la ville à la conso totale des villes
        }
        if (buildings[key].buildingtype === 'farm') { //ferme
            agri_conso += conso_plantes[buildings[key].plante][mois_actuel] * buildings[key].cover * 10; //ajout de la conso de la ferme à la conso totale des fermes
            agri_conso += etp(date,buildings[key].cover * 10000) * kc[buildings[key].plante][mois_actuel]/10000; //ajout de l'etp de la culture à l'etp totale
            //etp_val -= etp(date,buildings[key].cover * 10000);
        }
        if (buildings[key].buildingtype === 'forest') { //fôret
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
        if (buildings[key].buildingtype === 'industrial_area') { //zone industrielle
            industry_conso = industry_conso + buildings[key].conso * buildings[key].nb_industries;
        }
        if (buildings[key].buildingtype === 'animals') { //élevage
            animals_conso = animals_conso + (buildings[key].nb_animals * conso_animaux[buildings[key].animal_type])/1000
        }

    }

    //water consumption = [villes,fermes,forets,etp,écoulement latéral,industries,élevages]
    //maj conso totale
    water_consumption[0] += total_city_conso;
    water_consumption[1] += agri_conso;
    water_consumption[2] += forets_conso;
    water_consumption[5] += industry_conso;
    water_consumption[6] += animals_conso;
    //maj conso du mois actuel
    water_consumption_current[0] = total_city_conso;
    water_consumption_current[1] = agri_conso;
    water_consumption_current[2] = forets_conso;
    water_consumption_current[5] = industry_conso;
    water_consumption_current[6] = animals_conso;

    var total_conso = total_city_conso + agri_conso + forets_conso + industry_conso + animals_conso + etp_val; //conso totale (naturelle+humaine) (m³)

    // REDONDANCE A REVOIR

    //Conversions en % du niveau de la nappe
    total_city_conso = total_city_conso / capacity;
    agri_conso = agri_conso / capacity;
    forets_conso = forets_conso / capacity;
    industry_conso = industry_conso / capacity;
    animals_conso = animals_conso / capacity;

    etp_val = etp_val/(1000*capacity); // conversion en %/mois

    var total_conso = total_city_conso + agri_conso + forets_conso + industry_conso + animals_conso + etp_val;

    // Affichage du flux sortant dans la topbar
    if(parseInt(total_conso*capacity*10**-9)>0){
        Sorties_counter.innerHTML = parseFloat(Math.floor(total_conso*capacity*10**-8)/10).toString() + "e9 m³";
    } else if(parseInt(total_conso*capacity*10**-6)>0){
        Sorties_counter.innerHTML = parseFloat(Math.floor(total_conso*capacity*10**-5)/10).toString() + "e6 m³";
    } else{
        Sorties_counter.innerHTML = parseFloat(Math.floor(total_conso*capacity*10**-2)/10).toString() + "e3 m³";
    }   
    
    return total_conso; //en % de la nappe (0-1)
}

var secheresse = false;

function check_etp_hist(){ //vérifie si l'eau est en abondance/manque pour déclencher une sécheresse
    if (hist.filter(x => x <= 0.2).length >= 9){
        secheresse = true;
    } else {
        secheresse = false;
    }
}


var future_rain = {}; //pluie à venir
var surface_betonee = 0; //surface bétonnée totale du terrain

function update_future_rain(delay){ //maj de la pluie à venir
    let annee_futur = annee_actuelle;
    let mois_futur = mois_actuel + delay;
    if (mois_futur > 12) {
        annee_futur = annee_actuelle + Math.floor((mois_actuel+delay-1)/12);
        if (mois_futur%12 != 0){
            mois_futur = (mois_actuel+delay) % 12;
        }
    }

    if (annee_futur > 2100){ //fin de la simulation en l'an 2100
        return 0;
    }

    let key = annee_futur.toString() + "-";
    if (mois_futur < 10) {
        key = key + "0";
    }

    key = key + mois_futur.toString();

    if (!(key in future_rain)){ //pluie à venir (m/mois) à partir des données du GIEC
        future_rain[key] = ((parseFloat(rain_data[key]['WCE']) * 30 * ((square_size ** 2) * (gridsize ** 2) - surface_betonee)) / (1000*capacity))*rain_intensity/100;
    } else { 
        future_rain[key] += ((parseFloat(rain_data[key]['WCE']) * 30 * ((square_size ** 2) * (gridsize ** 2) - surface_betonee))  / (1000*capacity))*rain_intensity/100;
    }
}

function update_surface_betonee(){ //maj de la surface bétonnée du terrain
    surface_betonee = 0;
    for (var key of Object.keys(buildings)) {
        if (buildings[key].buildingtype === 'city') { //pour chaque ville
            surface_betonee += (buildings[key].nb_hab/buildings[key].density)*(1-buildings[key].green_cover/100)*1000000;
        }
    }
}

function seuils(){ //gère les effets de seuil et déclenche des évènements
    let val; //valeur de diminution aléatoire des paramètres
    let sum = 0;
    for (let i = 0; i < 12; i++){
        sum += hist[i];
    } 
    let moy = sum / 12;

    for (var key of Object.keys(buildings)) {
        if (buildings[key].buildingtype === 'farm') { //maj de la couverture des fermes
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
        if (buildings[key].buildingtype === 'animals') { //maj du nb d'animaux des élevages
            val = Math.round(buildings[key].nb_animals * (1-0.2));
            buildings[key].nb_animals = val;
            if (key == selected_case){
                setting_changed("nb_animals", val);
                nb_animals_input.value = val;
            }
        }
        if (buildings[key].buildingtype === 'forest') { //maj de la densité des fôrets
            val = buildings[key].density;
            if (moy <= 0.2){
                val = Math.round(buildings[key].density * (1-0.05)); //grosse diminution si niveau très bas
                buildings[key].density = val;
            } else if (moy <= 0.4){
                val = Math.round(buildings[key].density * (1-0.01)); //diminution si niveau bas
                buildings[key].density = val;
            }

            if (moy < 0.1){ //proba de 0.1% de faire mourir la fôret
                if (Math.floor(Math.random()*1000) == 1){
                    val = 0;
                    buildings[key].density = val;
                }
            }
            //mise a jour de l'image de la foret selon sa densité
            if(val==0){
                document.getElementById(key).firstChild.src = sprites["dead forest"];
            } else if(val<20){
                document.getElementById(key).firstChild.src = sprites["small forest"];
            } else if(val<30){
                document.getElementById(key).firstChild.src = sprites["medium forest"];
            }

            if (key == selected_case){
                setting_changed("forest_density", val);
                forest_density_input.value = val;
            }
        }
    }
}

function forest_easter_egg(){ //mort d'une fôret
    for (var key of Object.keys(buildings)) {
        if (buildings[key].buildingtype == 'forest') {
            let val = buildings[key].density ;
            if (old_value <= 0.1){ //niveau de la nappe < 10%
                if (Math.floor(Math.random()*10000) == 1){ //proba 0.1%
                    val = 0;
                    buildings[key].density = val;
                    document.getElementById(key).firstChild.src = sprites["dead forest"];
                }
            }
            if (key == selected_case){
                setting_changed("forest_density", val);
                forest_density_input.value = val;
            }
        }
    }
}

function update_all_charts() { //maj de tous les graphiques
    switch(displayed_data){ //donnée affichée sur les graphiques (remplissage (%), niveau ngf (m), pluie (mm), température (°C))
        case "per":
            water_chart.data.datasets[0].data = water_data_per; //valeur des ordonnées (timeline)
            water_chart_stats.data.datasets[0].data = water_data_per; //valeur des ordonnées (stats)
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
    
    water_chart.data.labels = time_labels; //valeur des abscisses
    water_chart.update();
    
    water_chart_stats.data.labels = time_labels;
    


    switch(displayed_stats_conso){ //donnée affichée sur le camembert (cumulée ou mensuelle actuelle)
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
    if(windows_opened[0]){ //si fenetre de stats ouverte
        pie_chart_conso.update();
        water_chart_stats.update();
    }

    
}

function new_frame() { //maj des données
    mois_actuel = mois_actuel + 1;
    if (mois_actuel == 13) {
        mois_actuel = 1;
        annee_actuelle = annee_actuelle + 1;
    }
    stats_time_past.textContent = "Durée écoulée : " + (annee_actuelle - annee_debut) + " ans " + (mois_actuel - 1) + " mois"; //affichage durée écoulée (stats)
    new_data_label = mois_actuel.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + "/" + annee_actuelle;
    time_labels.push(new_data_label);

    update_surface_betonee();

    // Écoulement latéral souterrain Q = K*S*DeltaH/L = K*S*tan(alpha)
    //new_value = (Math.random() * 0.5 + 0.5) * (Math.sin(((annee_actuelle - 2023) * 12 + mois_actuel) * 2 * Math.PI / 12) + 1) / 2 * Math.exp(-((annee_actuelle - 2023) * 12 + mois_actuel) / 100);

    // ECOULEMENT LATERAL SOUTERRAIN

    var hauteurnappe=old_value*capacity/(gridsize*10000)**2;
    var lateralflow=permeability*gridsize*10000*hauteurnappe*Math.tan(inclinaison)*2629800; //écoulement latéral souterrain (m³)
    water_consumption[4] += lateralflow;
    water_consumption_current[4] = lateralflow;

    lateralflow /= capacity; //conversion en % de la nappe
    
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
    
    update_future_rain(delay); //maj de la pluie à venir

    
    if (key in future_rain){
        new_value = old_value + future_rain[key]; //on ajoute les précipitations au niveau
        
        // Affichage du flux entrant dans la topbar
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


    new_value = new_value - conso - lateralflow; //on retire l'écoulement latéral et la conso totale des batiments
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
        seuils();
    }

    if(record_data_per){ //si on a demandé l'enregistrement des données de remplissage
        water_data_per.push(new_value);
    }

    if(record_data_ngf){ //si on a demandé l'enregistrement des données de niveau ngf
        niv_ngf = z - depth - capacity*(1-new_value) / ((square_size ** 2)*(gridsize ** 2));
        water_data_ngf.push(niv_ngf);
    }
    if(record_data_rain){ //si on a demandé l'enregistrement des données des précipitations
        water_data_rain.push(parseFloat(rain_data[key]['WCE']) * 30 * rain_intensity/100);
    }
    if(record_data_temperature){ //si on a demandé l'enregistrement des données de température
        water_data_temperature.push(parseFloat(temp_data[key]['WCE']) * temperature_intensity/100);
    }
     

    update_all_charts();

    //maj de l'affichage du niveau dans la barre de droite
    water_bar_colored.style.height = new_value * 100 + "%";
    water_bar_quantity.innerHTML = (Math.round(new_value * 100)).toString() + "%";

    if(new_value < 0.2){ //style en cas de niveau faible
        water_bar_colored.style.backgroundColor = '#eb6868';
        vagues.style.backgroundColor = '#eb6868';
    } else{
        water_bar_colored.style.backgroundColor = '#68b0eb';
        vagues.style.backgroundColor = '#68b0eb';
    }

    old_value = new_value

}



var simulation_speed = 1; //vitesse de la simulation
var main_simulation = 0;
var simulation_running = false; //simulation en cours
var simulation_ended = false; //simulation terminée (année > 2100)

function slow_down() { //ralentit la fréquence de maj des données
    if (simulation_speed > 0.125) {
        simulation_speed = simulation_speed / 2;
        restart()
        console.log(simulation_speed);
    }
}

function speed_up() { //accélère la fréquence de maj des données
    if (simulation_speed < 128) {
        simulation_speed = simulation_speed * 2;
        restart();
        console.log(simulation_speed);
    }
}

function play_pause() { //change l'état de la simulation (pause/en cours)
    lock_parameters(true);
    if (!simulation_running) {resume()} else {pause()}
}

function resume() { //continue la simulation
    simulation_running = true;
    if (!simulation_ended) {
        main_simulation = setInterval(new_frame, 500 / simulation_speed); //on fait le calcul toutes les 500/... ms
        play_pause_button.src = "Images/pause.svg";
    }
}

function pause() { //pause la simulation
    simulation_running = false;
    clearInterval(main_simulation);
    play_pause_button.src = "Images/play.svg";
}

function restart() { //relance la simulation avec les paramètres de vitesse mis a jour
    if (simulation_running && !simulation_ended) {
        clearInterval(main_simulation);
        main_simulation = setInterval(new_frame, 500 / simulation_speed);
    }
}



var windows_opened = [false, false, false]; //fenetres ouvertes [stats, advanced, export]
const mywindows = [stats_window_div, advanced_window_div, export_window_div]; //id des fenetres [stats, advanced, export]
const windows_display = ["flex", "flex", "flex"]; //style d'affichage des fenetrs [stats, advanced, export]

function open_window(wid){ //ouvre la fenetre donnée
    windows_opened[wid] = true;
    mywindows[wid].classList.remove("disparition");
    mywindows[wid].style.display = windows_display[wid];
}

function close_window(wid){ //ferme la fenetre donnée
    windows_opened[wid] = false;
    mywindows[wid].classList.add("disparition");
    setTimeout(() => {
        mywindows[wid].style.display = "none"; // set display to "none" after the animation has completed
    }, 300);
}

function toggle_window(wid=0) { //change l'état de la fenetre donnée (ouverte/fermée)
    wid = parseInt(wid); // 0:stats, 1:advanced, 2:export
    if (windows_opened[wid]) {
        close_window(wid); //on ferme la fenetre
    } else {
        if(windows_opened.includes(true)){ //autres fenetres ouvertes ?
            close_all_windows(); //on les ferme
            setTimeout(() => {
                open_window(wid); //on ouvre la fenetre
            }, 300);
        } else{
            open_window(wid); //on ouvre la fenetre
        }
    }
}

function close_all_windows(name){ //ferme toutes les fenêtres
    close_window(0);
    close_window(1);
    close_window(2);
}


function export_water_data_per() { //EN ATTENTE DE SUPPRESSION
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


function export_data(dataid, myname) { //exporte les données choisies au format csv
    if(confirmation("Vous êtes sur le point de télécharger un fichier csv.")){
        let mydata = [];
        switch(dataid){ //choix de la donnée
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
        //création du csv
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
        hiddenElement.download = myname + '.csv'; //téléchargement automatique du fichier
        hiddenElement.click();
    }
}





function export_config() { //exporte la config actuelle au format json
    var output_data = {}; //dictionnaire avec tous les éléments de la simulation
    //ajout de tous les paramètres
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



    //ajout des batiments
    output_data["buildings"] = [];
    Object.keys(buildings).forEach(function(key) { //pour chaque batiment
        var building = buildings[key];
        var building_data = building.export();
        building_data["position"] = key;
        output_data["buildings"].push(building_data);
    });

    //création du json
    var json = JSON.stringify(output_data);
    console.log(json);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(json);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'Config.json'; //téléchargement automatique du fichier
    hiddenElement.click();
}


function import_sub_function(data) { //importe les données d'un fichier config
    initialisation();
    //importation des paramètres
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

    //importation des donnéesd e la simulation
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

    //importation des batiments
    buildings = {};
    data["buildings"].forEach(function(building_data) {
        selected_case = building_data["position"];

        var template
        switch (building_data["buildingtype"]) {
            case "city":
                template = new City(building_data["nb_hab"], building_data["conso_hab"], building_data["density"], building_data["category"], building_data["green_cover"]);
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

function initialisation(){
    // appelée par import_sub_function()
    //réinitialise certains paramètres, notamment graphiques
    square_size = 10000 //m de côté

    water_data_rain = [0];
    water_data_temperature = [0];
    record_rain_checkbox.checked = false;
    record_data_temperature.checked = false;
    change_record_parameters("");

    water_consumption_current = [0, 0, 0, 0, 0, 0,0];

    selected_case = null;
    setting_changed("etp_limit",0);

    displayed_data = "per";
    change_chart_var("per");

    update_all_charts();

    copied_building = false;

    secheresse = false;

    future_rain = {};

    redraw_grid(gridsize); //on vide la grille
    occupied_list = [];

    simulation_speed = 1;
    main_simulation = 0;
    simulation_running = false;
    pause();
    simulation_ended = false;

    close_all_windows();
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function import_config(known = false) {
    if (confirmation()) { //message de config pour confirmer
        if (!known) { //config locale
            //lecture du fichier json
            var input = document.createElement('input');
            input.type = 'file';
        
            input.onchange = e => { 
                var file = e.target.files[0]; 
                var reader = new FileReader();
                reader.readAsText(file,'UTF-8');
        
                reader.onload = readerEvent => {
                    var content = readerEvent.target.result;
                    var data = JSON.parse(content);
                    import_sub_function(data); //maj de la grille et des paramètres
                }
            }
            input.click();
        }
        else { //préconfig de Nafrea
            //lecture du fichier json
            var file = preconfig_selector.value;
            readTextFile(`preconfigs/${file}.json`, function(text){
                var data = JSON.parse(text);
                import_sub_function(data);
            });
        }
    }
}


function confirmation(message="Vous êtes sur le point de créer une nouvelle simulation. Tous les paramètres de la simulation et la grille seront réinitialisés."){
    //envoie un message de confirmation
    pause();
    return confirm(message);
}

function new_session(){
    //nouvelle session
    if (confirmation()){
        location.reload(true); //recharge la page (et vide le cache)
    }
}


function restart_sim(){ 
    //recommencer la simulation
    let check = confirm("La timeline sera réinitialisée.");
    if(check){
        pause();
        //reinitialisation des données de la simulation
        water_data_per = [];
        water_data_ngf = [];
        water_data_rain = [];
        water_data_temperature = [];
        water_consumption = [];
        water_consumption_current = 0;
    
        setting_changed("start_date","");
        setting_changed("startfilling", startfilling_box.value);
    
        update_all_charts();
        lock_parameters(false);
    }
}



function lock_parameters(status){
    //(dé)vérouille certains sliders ou champ de texte qui servent à modifier les paramètres
    // Paramètres initiaux
    start_month_select.disabled = status;
    start_year_box.disabled = status;
    map_size_input.disabled = status;
    altitude_input.disabled = status;
    depth_input.disabled = status;
    capacity_input.disabled = status;

    //Affichage
    record_per_checkbox.disabled = status;
    record_ngf_checkbox.disabled = status;
    record_rain_checkbox.disabled = status;
    record_temperature_checkbox.disabled = status;

    //Paramètres avancés
    square_size_box.disabled = status;
    altitude_box.disabled = status;
    latitude_box.disabled = status;
    depth_box.disabled = status;
    startfilling_box.disabled = status;
}


let zoom = 1; //zoom sur la grille
const ZOOM_SPEED = 0.1; //vitesse du zoom
let zoomElement = pave_3d;

//RACCOURCIS CLAVIER
document.addEventListener("wheel", function(e) {  
    //zoom via molette
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
        case "c": //copie via c
            copy_building();
            break;
        case "v": //colle via v
            paste_building();
            break;
        case " ": //résume/met en pause la simulation via espace
            play_pause();
            break;
        case "Delete": //supprime via retour arrière
            remove_building();
            break;
        case "i": //ouvre les stats via i
            toggle_window(0);
            break;
    }
});



