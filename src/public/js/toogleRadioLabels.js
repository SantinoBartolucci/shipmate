function ToogleCheckedRadioLabel() {
	document.querySelectorAll('.viajes-input-radio-container label').forEach((label) => {
		label.classList.remove('checked');
	});

	document.querySelectorAll('.viajes-input-radio-container input[type="radio"]:checked').forEach((radio) => {
		radio.parentElement.classList.add('checked');
		
		if (radio.id == "ida-vuelta") {
			if (!document.getElementById("fecha-ida-vuelta")) {
				const div = document.createElement('div');
                div.classList.add('viajes-input-container');
                div.innerHTML = `
                    <input type='text' placeholder='Fecha de Vuelta' id='fecha-ida-vuelta' onfocus="(this.type='date')" onblur="(this.type='text')"/>
                `;
				
				const form = document.getElementById("form-viajes");
                form.insertBefore(div, form.lastElementChild);
			}
		} else {
			const fechaVueltaDiv = document.getElementById("fecha-ida-vuelta");
            if (fechaVueltaDiv) {
                fechaVueltaDiv.parentNode.parentElement.removeChild(fechaVueltaDiv.parentElement);
            }
		}
	});
}
