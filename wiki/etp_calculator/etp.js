console.log("js started");

var mois = 1;
var NBJ = 365;
var phi = 40*Math.PI/180; //rad (input:°)
var z = 30; //m
var Tn = 6; //°C
var Tx = 10; //°C
var HRmoy = 80; //%
var Rg = 5*3.6; //MJ/m²/jour (input:kWh/m²/mois)
var v10m = 10/3.6; //m/S (input:km/h)

const tabjours = [31,28,31,30,31,30,31,31,30,31,30,31];


function fes(T){
    return 0.6108*Math.exp((17.27*T)/(T+237.3))
}


function etp(){
	check_warning();

	//Paramètres calculés
	var rad_phi = phi * (Math.PI/180);
	
	var J = 30*(mois-1) + 15; //→15e jour du mois
	var Tmoy = (Tn+Tx)/2; //température moyenne (°C)
	var delta = 4098*(fes(Tmoy)/(Tmoy+237.3)**2); //variation de la pression partielle de la vapeur d'eau par rapport à la variation de la température de l'air (kPa/°C)

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

	var ET0 = (0.408*delta*Rn+gamma*(900/(Tmoy+273)) * v2m * Math.max(es-ea,0)) / (delta+gamma*(1+0.34*v2m)); //évapotranspiration journalière de référence pour les cultures (mm/j)
	document.getElementById("etp_label").innerHTML = (Math.round(ET0*10000)/10000).toString() + " mm/jour";
	document.getElementById("etpmois_label").innerHTML = ((Math.round(ET0*tabjours[mois-1]*10000)/10000)).toString() + " mm/mois";

	return ET0; //mm/jour
}



function setting_changed(setting, value){
	add_warning("", false);
	switch(setting){
		case "mois":
			mois = parseInt(value);
			//document.getElementById("mois_label").innerHTML = "mois = " + value.toString() + " (numéro du mois)";
			document.getElementById("mois_slider").value = value;
			document.getElementById("mois_box").value = value;
			etp();
			break;
		case "NBJ":
			NBJ = parseInt(value);
			//document.getElementById("NBJ_label").innerHTML = "NBJ = " + value.toString() + " (nombre de jours dans l'année)";
			document.getElementById("NBJ_slider").value = value;
			document.getElementById("NBJ_box").value = value;
			etp();
			break;
		case "phi":
			phi = parseFloat(value) * Math.PI/180;
			//document.getElementById("phi_label").innerHTML = "phi = " + value.toString() + " ° (latitude)";
			document.getElementById("phi_slider").value = value;
			document.getElementById("phi_box").value = value;
			etp();
			break;
		case "z":
			z = parseFloat(value);
			//document.getElementById("z_label").innerHTML = "z = " + value.toString() + " m (alttiude du site)";
			document.getElementById("z_slider").value = value;
			document.getElementById("z_box").value = value;
			etp();
			break;
		case "Tn":
			Tn = parseFloat(value);
			//document.getElementById("Tn_label").innerHTML = "Tn = " + value.toString() + " °C (température minimum quotidienne)";
			document.getElementById("Tn_slider").value = value;
			document.getElementById("Tn_box").value = value;
			etp();
			break;
		case "Tx":
			Tx = parseFloat(value);
			//document.getElementById("Tx_label").innerHTML = "Tx = " + value.toString() + " °C (température maximum quotidienne)";
			document.getElementById("Tx_slider").value = value;
			document.getElementById("Tx_box").value = value;
			etp();
			break;
		case "HRmoy":
			HRmoy = parseFloat(value);
			//document.getElementById("HRmin_label").innerHTML = "HRmin = " + value.toString() + " % (humidité relative minimum quotidienne)";
			document.getElementById("HRmoy_slider").value = value;
			document.getElementById("HRmoy_box").value = value;
			etp();
			break;
		case "Rg":
			Rg = parseFloat(value)*3.6; //kWh/m²/jour → MJ/m²/jour
			document.getElementById("Rg_slider").value = value;
			document.getElementById("Rg_box").value = value;
			document.getElementById("Rgmj_box").value = value*3.6; // kWh/m²/jour → MJ/m²/jour
			document.getElementById("Rgw_box").value = value*3.6/0.0864; // kWh/m²/mois → W/m²
			etp();
			break;
		case "Rgmj":
			Rg = parseFloat(value);
			document.getElementById("Rg_slider").value = value/3.6; // MJ/m²/jour → kWh/m²/jour
			document.getElementById("Rg_box").value = value/3.6; // MJ/m²/jour → kWh/m²/jour
			document.getElementById("Rgmj_box").value = value;
			document.getElementById("Rgw_box").value = value/0.0864; // MJ/m²/jour → W/m²
			etp();
			break;
		case "Rgw":
			Rg = parseFloat(value)*0.0864;
			document.getElementById("Rg_slider").value = value*0.0864/3.6; //W/m² → kWh/m²/jour
			document.getElementById("Rg_box").value = value*0.0864/3.6; // W/m² → kWh/m²/jour
			document.getElementById("Rgmj_box").value = value*0.0864; // W/m² → MJ/m²/jour 
			document.getElementById("Rgw_box").value = value;
			etp();
			break;
		case "v10m":
			v10m = parseFloat(value)/3.6;
			document.getElementById("v10m_slider").value = value;
			document.getElementById("v10m_box").value = value;
			document.getElementById("v10mms_box").value = value/3.6;
			etp();
			break;
		case "v10mms":
			v10m = parseFloat(value);
			document.getElementById("v10m_slider").value = value;
			document.getElementById("v10m_box").value = value*3.6;
			document.getElementById("v10mms_box").value = value;
			etp();
			break;
		default:
			add_warning("erreur inconnue");
			etp();
			break;

	}
}

function check_warning(){
	if(Tn>Tx){
		add_warning("Tn > Tx");
	}
}

function add_warning(message, show=true){
	if(show){
		document.getElementById("error_label").innerHTML += "<br>" + "[warning] : " + message;
	} else{
		document.getElementById("error_label").innerHTML = "";
	}
	
}



function searchdata(order){
	var city = document.getElementById("searchinput").value;
	document.getElementById("searchresult").innerHTML = "https://www.annuaire-mairie.fr/ensoleillement-" + city + ".html";
	document.getElementById("searchresult").href = "https://www.annuaire-mairie.fr/ensoleillement-" + city + ".html";

	if (order=="open"){
		window.open("https://www.annuaire-mairie.fr/ensoleillement-" + city + ".html");
	}
}


var detailsopened = false;
var dataopened = false;
var convopened = false;
var exopened = false;

const basecolor = "white";
const selectcolor = "#c0d7fc";

function showdetails(){
	if(detailsopened){
		document.getElementById("detailsdiv").style.display = 'none'
		document.getElementById("btndetails").innerHTML = "Afficher les détails du calcul";
		document.getElementById("btndetails").style.backgroundColor = basecolor;
		detailsopened = false;
	} else{
		document.getElementById("detailsdiv").style.display = 'block'
		document.getElementById("btndetails").innerHTML = "Cacher les détails du calcul";
		document.getElementById("btndetails").style.backgroundColor = selectcolor;
		detailsopened = true;

		window.scrollTo(0, document.body.scrollHeight);
	}
	
}

function showdata(){
	if(dataopened){
		document.getElementById("searchdiv").style.display = 'none';
		document.getElementById("btndata").innerHTML = "Trouver des données";
		document.getElementById("btndata").style.backgroundColor = basecolor;
		dataopened = false;
	} else{
		document.getElementById("searchdiv").style.display = 'block';
		document.getElementById("btndata").innerHTML = "Cacher les sources de données";
		document.getElementById("btndata").style.backgroundColor = selectcolor;
		dataopened = true;

		window.scrollTo(0, document.body.scrollHeight);
	}
}

function showconv(){
	if(convopened){
		document.getElementById("convdiv").style.display = 'none';
		document.getElementById("btnconv").innerHTML = "Afficher la table de conversion";
		document.getElementById("btnconv").style.backgroundColor = basecolor;
		convopened = false;
	} else{
		document.getElementById("convdiv").style.display = 'block';
		document.getElementById("btnconv").innerHTML = "Cacher la table de conversion";
		document.getElementById("btnconv").style.backgroundColor = selectcolor;
		convopened = true;

		window.scrollTo(0, document.body.scrollHeight);
	}
}

function showex(){
	if(exopened){
		document.getElementById("exdiv").style.display = 'none';
		document.getElementById("btnex").innerHTML = "Afficher l'exemple";
		document.getElementById("btnex").style.backgroundColor = basecolor;
		exopened = false;
	} else{
		document.getElementById("exdiv").style.display = 'block';
		document.getElementById("btnex").innerHTML = "Cacher l'exemple";
		document.getElementById("btnex").style.backgroundColor = selectcolor;
		exopened = true;

		window.scrollTo(0, document.body.scrollHeight);
	}
}



const nantesphi = 47.21;
const nantesz = 33;
const nantesTn = [3.1,2.9,4.8,6.4,9.9,12.6,14.4,14.2,11.9,9.4,5.7,3.4]; //°C
const nantesTx = [9,9.9,13,15.5,19.2,22.7,14.8,15,22.1,17.5,12.4,9.3]; //°C
const nantesHRmoy = [85,81,77,73,74,69,68,70,70,80,85,85]; //%
const nantesRg = [1.96,3.3,4.6,5.59,5.65,5.93,5.99,5.79,5.43,3.46,2.46,2.01]; //kWh/m²/j
const nantesv10m = [5.22,5.06,4.89,4.69,4.36,4.22,4.06,3.92,4.19,4.64,4.89,5.14]; //m/s

const tabmois = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

function example(mm){
	if(mm>=0){
		setting_changed("mois",mm+1);
		setting_changed("phi",nantesphi);
		setting_changed("z",nantesz);
		setting_changed("Tn",nantesTn[mm]);
		setting_changed("Tx",nantesTx[mm]);
		setting_changed("HRmoy",nantesHRmoy[mm]);
		setting_changed("Rg",nantesRg[mm]);
		setting_changed("v10m",nantesv10m[mm]);

		document.getElementById("ex_label").innerHTML = "Loire-Atlantique (Nantes) : " + tabmois[mm];
	} else{
		document.getElementById("ex_label").innerHTML = "Loire-Atlantique (Nantes) : choisissez un mois avec le curseur";
	}
}
	

window.onload = (event) => {
  etp();
};
