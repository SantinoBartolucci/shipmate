const { Router } = require('express');
const router = Router();

const { DateToDayMonthAndYear, TodayDate } = require('../helpers/date_related');

router.get('/profile/:id', (req, res) => {
	const user = req.user[0];
	const profileId = req.params.id;
	let userId,
		name = 'Santino';
	const creation_date = TodayDate(); //TODO? Buscar en la base de datos segun el id
	const isOwner = true; //If id found in DB is equal to req.user[0].id
	const profileRating = 3;

	const reviews = [
		{
			id: 1,
			name: 'Whitus',
			product: 'Celular 12931293',
			content: 'Todo Super! Gracias Niggus!',
			date: DateToDayMonthAndYear(creation_date),
			rating: 2,
		},
		{
			id: 2,
			name: 'Blancus',
			product: 'Pantalon jasduwlaiw',
			content: 'Todo Super! Gracias Niggus!',
			date: DateToDayMonthAndYear(creation_date),
			rating: 3.5,
		},
	];

	res.render('pages/profile/index', { user, name, creation_date, isOwner, profileRating, reviews });
});

module.exports = router;
