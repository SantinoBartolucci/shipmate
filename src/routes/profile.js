const { Router } = require('express');
const router = Router();

const pool = require('../database');
const {
	DateToDayMonthAndYear,
	DateToMonthAndYear,
} = require('../helpers/date_related');
const { isLoggedIn } = require('../helpers/isLogged');
const e = require('connect-flash');

router.get('/profile/:id', isLoggedIn, async (req, res) => {
	const user = req.user[0];
	const userByParams = await getUserInfo(parseInt(req.params.id));

	const requestedUser = {
		id: parseInt(req.params.id),
		name: userByParams.name,
		profile_image_route: userByParams.profile_image_route,
		creation_date: `Me uní en ${DateToMonthAndYear(
			userByParams.creation_date
		)}`,
		profileRating: userByParams.rating,
	};

	const isOwner = user.id == requestedUser.id ? true : false;

	const reviewsFromDB = await getReviews(requestedUser.id);

	const reviews = await Promise.all(
		reviewsFromDB.map(async (element) => {
			const reviewer = await getUserInfo(element.id_reviewer);

			return {
				id: element.id,
				id_reviewer: element.id_reviewer,
				id_reviewed: element.id_reviewed,
				product: element.product,
				content: element.content,
				date: DateToDayMonthAndYear(element.date),
				rating: element.rating,
				reviewerName: reviewer.name,
				reviewer_profile_image_route: reviewer.profile_image_route,
			};
		})
	);

	res.render('pages/profile/index', {
		requestedUser,
		user,
		isOwner,
		reviews,
	});
});

router.get('/mytripsandproducts', isLoggedIn, async (req, res) => {
	let user = req.user[0];
	let travels = await getTravels(user.id);
	let products = await getProducts(user.id);
	res.render('pages/profile/mytripsandproducts', { user, travels, products });
});

async function getUserInfo(id) {
	const ans = await pool.query('select * from usuario where id = ? ', [id]);
	return ans[0];
}

async function getReviews(id) {
	const ans = await pool.query('select * from reseñas where id_reviewed = ?', [
		id,
	]);
	return ans;
}
async function getTravels(id) {
	const travelId = await pool.query(
		'select travel_id from viajando where user_id = ?',
		[id]
	);

	const travelPromises = travelId.map(async (e) => {
		return await pool.query('SELECT * FROM viajes WHERE id = ?', [e.travel_id]);
	});

	const travels = await Promise.all(travelPromises);

	let results = [];

	travels.forEach((i) => {
		i.forEach((e) => {
			let ans = {
				id: e.id,
				place_from: e.place_from,
				place_to: e.place_to,
				date_start: DateToDayMonthAndYear(e.date_start),
				date_end: DateToDayMonthAndYear(e.date_end),
			};
			results.push(ans);
		});
	});

	return results;
}
async function getProducts(id) {
	const products = await pool.query('select * from pedidos where user_id = ?', [
		id,
	]);
	return products;
}

module.exports = router;
