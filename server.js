const express = require('express');
const { User, Comment, Blog, sequelize } = require('./models');
const { Op } = require('sequelize');
const cors = require('cors');
const app = express();

const session = require('express-session');
const cookieParser = require('cookie-parser');
const SessionStore = require('express-session-sequelize')(session.Store);
const PORT = 3001;

const corsOptions = {
	origin: 'http://localhost:3000',
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const bcrypt = require('bcrypt');
const saltRounds = 10;

const sequelizeSessionStore = new SessionStore({
	db: sequelize,
});

app.use(
	session({
		secret: 'your-secret-key',
		resave: false,
		saveUninitialized: true,
		store: sequelizeSessionStore,
		cookie: { maxAge: 10800000 },
	})
);

const isLoggedIn = (req, res, next) => {
	if (req.session.user) {
		next();
	} else {
		return res.json({ error: 'Please Log In' });
	}
};

app.get('/authenticate', (req, res) => {
	if (req.session.user) {
		return res.json({ isLoggedIn: true, user: req.session.user.username });
	} else {
		return res.json({ isLoggedIn: false });
	}
});

app.post('/register', async (req, res) => {
	const { username, email, password } = req.body;

	if (!email || !password || !username) {
		return res.json({
			error: 'email, password, and username must be entered ',
		});
	}

	const emailExists = await User.findOne({ where: { email } });
	if (emailExists) {
		return res.json({ error: 'email in use' });
	}

	let hashPassword = bcrypt.hashSync(password, saltRounds);

	User.create({ username, email, password: hashPassword }).then((new_user) => {
		res.json(new_user);
	});
});

app.post('/login', (req, res) => {
	const { username, password } = req.body;

	User.findOne({
		where: { [Op.or]: [{ email: username }, { username }] },
	}).then((user) => {
		if (!user) {
			return res.json({ error: 'No user found' });
		}

		console.log(user);

		let comparison = bcrypt.compareSync(password, user.password);

		if (comparison == true) {
			req.session.user = user;
			res.json({ success: true });
		} else {
			res.json({ success: false });
		}
	});
});

app.get('/logout', (req, res) => {
	req.session.destroy(() => {
		res.json({ message: 'session destroyed', session: req.session });
	});
});

app.post('/new/blog', isLoggedIn, (req, res) => {
	const { title, content } = req.body;
	if (!title || !content) {
		return res.json({
			error: 'title and content are required ',
		});
	}

	Blog.create({ title, content, user_id: req.session.user.id }).then(
		(new_blog) => {
			res.json(new_blog);
		}
	);
});

app.get('/blogs', (req, res) => {
	Blog.findAll({
		attributes: ['id', 'title'],
		include: [
			{
				model: User,
				attributes: ['username'],
			},
		],
	}).then((blogs) => {
		console.log(blogs);
		res.json(blogs);
	});
});

app.get('/blogs/:id', (req, res) => {
	const { id } = req.params;
	Blog.findOne({
		attributes: ['id', 'title', 'content'],
		where: { id },
		include: [
			{
				model: User,
				attributes: ['username'],
			},
		],
	}).then((blog) => {
		console.log(blog);
		res.json(blog);
	});
});

app.get('/user/blogs', isLoggedIn, (req, res) => {
	Blog.findAll({
		where: { user_id: req.session.user.id },
		attributes: ['id', 'title', 'content'],
	}).then((blogs) => {
		console.log(blogs);
		res.json(blogs);
	});
});

app.put('/blogs/:id', isLoggedIn, (req, res) => {
	const { id } = req.params;
	const { title, content } = req.body;
	const updateFields = {};
	if (title) {
		updateFields.title = title;
	}
	if (content) {
		updateFields.content = content;
	}
	Blog.update(updateFields, { where: { id } })
		.then((result) => {
			console.log(result);
			res.json({ success: true });
		})
		.catch((error) => {
			console.log(error);
			res.json({ error: 'There was a problem updating your information' });
		});
});

app.delete('/blogs/:id', isLoggedIn, (req, res) => {
	const { id } = req.params;
	Blog.destroy({ where: { id } }).then((results) => {
		console.log(results);
		res.json({ success: true });
	});
});

app.post('/new/comment/:blog_id', isLoggedIn, (req, res) => {
	const { blog_id } = req.params;
	const { message } = req.body;
	if (!message) {
		return res.json({
			error: 'comment required to post ',
		});
	}

	Comment.create({ message, blog_id, user_id: req.session.user.id }).then(
		(new_comment) => {
			res.json(new_comment);
		}
	);
});

app.get('/comments/:blog_id', (req, res) => {
	const { blog_id } = req.params;
	Comment.findAll({
		attributes: ['id', 'message'],
		where: { blog_id },
		include: [
			{
				model: User,
				attributes: ['username'],
			},
		],
	}).then((comments) => {
		console.log(comments);
		res.json(comments);
	});
});

app.get('/user/comments', isLoggedIn, (req, res) => {
	Comment.findAll({
		where: { user_id: req.session.user.id },
		attributes: ['id', 'message'],
	}).then((comments) => {
		console.log(comments);
		res.json(comments);
	});
});

app.put('/comments/:id', isLoggedIn, (req, res) => {
	const { id } = req.params;
	const { message } = req.body;

	Comment.update({ message }, { where: { id } })
		.then((result) => {
			console.log(result);
			res.json({ success: true });
		})
		.catch((error) => {
			console.log(error);
			res.json({ error: 'There was a problem updating your information' });
		});
});

app.delete('/comments/:id', isLoggedIn, (req, res) => {
	const { id } = req.params;
	Comment.destroy({ where: { id } }).then((results) => {
		console.log(results);
		res.json({ success: true });
	});
});

app.listen(PORT, () => {
	console.log('app started in port ' + PORT);
});
