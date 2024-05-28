module.exports = {
	TodayDate() {
		const date = new Date();
		var d = date.getDate();
		var m = date.getMonth() + 1; // +1 because of Month begin from 0 to 11
		var y = date.getFullYear();
		return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
	},

	DateToMonthAndYear(date) {
		let fecha = new Date(date);

		// Obtener el nombre del mes y el año
		let nombreMes = fecha.toLocaleString('es-ES', { month: 'long' });
		nombreMes = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
		let año = fecha.getFullYear();

		// Devolver la fecha en formato "MES de AÑO"
		return `${nombreMes} de ${año}`;
	},

	DateToDayMonthAndYear(date) {
		// Separar la cadena de fecha en partes (año, mes, día)
		const fecha = new Date(date);

		// Obtener el nombre del mes y el año
		let nombreMes = fecha.toLocaleString('es-ES', { month: 'long' });
		nombreMes = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
		let año = fecha.getFullYear();
		let day = fecha.getDate()+1;

		// Devolver la fecha en formato "DIA de MES de AÑO"
		return `${day} de ${nombreMes} de ${año}`;
	},
};
