let previous;

function CloseOfertar() {
    const closebtn = document.getElementsByClassName("my-data-offers-header-close")[0];
    const divOfertar = document.getElementById("ofertar-offers");

    closebtn.classList.add("disabled");
    divOfertar.classList.add("disabled");

    previous.classList.remove("disabled");
}

function OpenOfertar(e) {
    const closebtn = document.getElementsByClassName("my-data-offers-header-close")[0];
    const divOfertar = document.getElementById("ofertar-offers");

    let parent = (e.id == "ofertar1") ? e.parentElement : e.parentElement.parentElement.parentElement;
    
    parent.classList.add("disabled");
    closebtn.classList.remove("disabled");
    divOfertar.classList.remove("disabled");

    previous = parent;
}