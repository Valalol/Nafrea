function shrink_menu(){
    menu = document.getElementById("side_menu");
    game = document.getElementById("game_window")
    if (menu.style.left == "-25%"){
        menu.style.left = "0";
        game.style.width = "75%"
        game.style.marginLeft = "25%"
    } else {
        menu.style.left = "-25%";
        game.style.width = "100%"
        game.style.marginLeft = "0"
    }
}