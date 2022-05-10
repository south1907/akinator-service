var express = require('express');
const { Aki } = require('aki-api');
const NodeCache = require( "node-cache" );

var app = express();
app.use(express.json());

const region = 'en';
const childMode = false;
const proxy = undefined;
const myCache = new NodeCache();

app.post('/start', async (req, res) => {
	let user_id = req.body.user_id;

	const aki = new Aki({ region, childMode, proxy });
	await aki.start();
	myCache.set( user_id, aki, 10000 );
	res.json(aki);
});

app.post('/get-by-id', async (req, res) => {
	let user_id = req.body.user_id;

	let aki = myCache.get( user_id );
	res.json(aki);
});

app.post('/answer', async (req, res) => {
	let user_id = req.body.user_id;
	let answer = req.body.answer;

	let aki = myCache.get( user_id );

	if (aki) {
		await aki.step(answer);

		if (aki.progress >= 70 || aki.currentStep >= 78) {
			// winnnnnn
			await aki.win();
		}
		myCache.set( user_id, aki, 10000 );
	}

	
	res.json(aki);
});

app.listen(3000, function () {
	console.log('app listening on port 3000.');
});
