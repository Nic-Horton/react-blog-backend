const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
	res.json({
		success: true,
		message: 'hello world',
	});
});

app.listen(3001, () => {
	console.log('app started in port 3001');
});
