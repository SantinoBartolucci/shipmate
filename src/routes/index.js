const { Router } = require('express');
const router = Router();

const XLSX = require('xlsx');
const pool = require('../database');

router.get('/', (req, res) => {
	let user = null;
	if (req.user) user = req.user[0];

	res.render('index', { user });
});

router.get("/lol", (req, res) => {
	// Hacer la consulta SQL
	const query = `
		SELECT 
    		p.id AS Id_Pedido,
    		p.name AS Producto,
    		p.price AS Precio_Original,
    		o.total AS Precio_Oferta,
    		ep.estado AS Estado,
    		ep.fecha AS Fecha
		FROM 
    		pedidos p
		JOIN 
    		ofertas o ON p.id = o.id_pedido
		JOIN 
    		estado_pedido ep ON p.id = ep.pedido_id
	`;

	/*
	SELECT 
    p.id AS Id_Pedido,
    CASE 
        WHEN ep.estado = 'publicado' THEN NULL 
        ELSE o.id 
    END AS Id_Oferta,
    p.name AS Producto,
    p.price AS Precio_Original,
    CASE 
        WHEN ep.estado = 'publicado' THEN NULL 
        ELSE o.total 
    END AS Precio_Oferta,
    ep.estado AS Estado,
    ep.fecha AS Fecha
FROM 
    pedidos p
JOIN 
    ofertas o ON p.id = o.id_pedido
JOIN 
    estado_pedido ep ON p.id = ep.pedido_id
GROUP BY 
    p.id, ep.estado
HAVING 
    NOT (ep.estado = 'publicado' AND COUNT(*) > 1);
	*/

	pool.query(query, (error, results) => {
		if (error) {
			console.error('Error en la consulta: ', error);
			return;
		}

		// Convertir el resultado a una hoja de Excel
		const worksheet = XLSX.utils.json_to_sheet(results);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

		// Guardar el archivo Excel
		const filePath = './resultado.xlsx';
		XLSX.writeFile(workbook, filePath);

		console.log(`Archivo Excel guardado en: ${filePath}`);
	});

	res.redirect("/");
})

module.exports = router;
