const { Router } = require('express');
const router = Router();

const pool = require('../database');
const { DateToDayMonthAndYear, DateToMonthAndYear } = require('../helpers/date_related');
const { isLoggedIn } = require('../helpers/isLogged');

router.get('/profile/:id', isLoggedIn, async (req, res) => {
	const user = req.user[0];
	const userByParams = await getUserInfo(parseInt(req.params.id));

	const requestedUser = {
		id: parseInt(req.params.id),
		name: userByParams.name,
		profile_image_route: userByParams.profile_image_route,
		creation_date: `Me uní en ${DateToMonthAndYear(userByParams.creation_date)}`,
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

router.get('/mytripsandproducts', isLoggedIn, (req, res) => {
	let user = req.user[0];
	res.render('pages/profile/mytripsandproducts', { user });
});

async function getUserInfo(id) {
	const ans = await pool.query('select * from usuario where id = ? ', [id]);
	return ans[0];
}

async function getReviews(id) {
	const ans = await pool.query('select * from reseñas where id_reviewed = ?', [id]);
	return ans;
}

module.exports = router;
