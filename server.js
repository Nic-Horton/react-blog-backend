const express = require('express');
const { User, Comment, Blog, sequelize } = require('./models');
const { Op } = require('sequelize');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/register', (req, res) => {
	const { username, email, password } = req.body;

	if (!email || !password || !username) {
		return res.json({
			error: 'email, password, and username must be entered ',
		});
	}

	User.create({ username, email, password }).then((new_user) => {
		res.json(new_user);
	});
});

app.post('/login', (req, res) => {
	const { email, username, password } = req.body;

	User.findOne({ where: { [Op.or]: [{ email }, { username }] } }).then(
		(user) => {
			if (!user) {
				return res.json({ error: 'No user found' });
			}

			console.log(user);

			if (password === user.password) {
				res.json({ success: true });
			} else {
				res.json({ success: false });
			}
		}
	);
});

app.post('/new/blog', (req, res) => {
	const { title, content } = req.body;
	if (!title || !content) {
		return res.json({
			error: 'title and content are required ',
		});
	}

	Blog.create({ title, content }).then((new_blog) => {
		res.json(new_blog);
	});
});

app.post('/new/comment/:blog_id', (req, res) => {
	const { blog_id } = req.params;
	const { message } = req.body;
	if (!message) {
		return res.json({
			error: 'comment required to post ',
		});
	}

	Comment.create({ message, blog_id }).then((new_comment) => {
		res.json(new_comment);
	});
});

app.listen(3001, () => {
	console.log('app started in port 3001');
});
