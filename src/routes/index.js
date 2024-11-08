const { Router } = require('express');
const router = Router();

const XLSX = require('xlsx');
const pool = require('../database');
const { isLoggedIn } = require('../helpers/isLogged');

const query = `
	SELECT 
		p.id AS Id_Pedido,
		p.name AS Producto,
		p.price AS Precio_Original,
		ep.estado AS Estado,
		ep.fecha AS Fecha
	FROM 
		(SELECT id, name, price FROM pedidos) p
	JOIN 
		(SELECT pedido_id, estado, fecha FROM estado_pedido) ep ON p.id = ep.pedido_id
	ORDER BY 
		p.id, ep.fecha;
`;

router.get('/', (req, res) => {
	let user = null;
	if (req.user) user = req.user[0];

	res.render('index', { user });
});

router.get('/export-excell-file', isLoggedIn, (req, res) => {
	pool.query(query, (error, results) => {
		if (error) {
			console.error('Error en la consulta: ', error);
			return;
		}

		// Convertir el resultado a una hoja de Excel
		const worksheet = XLSX.utils.json_to_sheet(results);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

		// Generar el archivo Excel en memoria
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

		// Establecer los encabezados de la respuesta para forzar la descarga
		res.setHeader('Content-Disposition', 'attachment; filename=Informe.xlsx');
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

		// Enviar el archivo Excel como respuesta
		res.send(excelBuffer);
	});
});

module.exports = router;
