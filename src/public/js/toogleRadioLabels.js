function ToogleCheckedRadioLabel() {
	document.querySelectorAll('.viajes-input-radio-container label').forEach((label) => {
		label.classList.remove('checked');
	});

	document.querySelectorAll('.viajes-input-radio-container input[type="radio"]:checked').forEach((radio) => {
		radio.parentElement.classList.add('checked');
	});
}
