function CloseOfertar() {
    const closebtn = document.getElementsByClassName("my-data-offers-header-close")[0];
    const divOfertar = document.getElementById("ofertar-offers");

    closebtn.classList.add("disabled");
    divOfertar.classList.add("disabled");
}