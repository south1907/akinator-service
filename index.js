const express = require('express')
const { Aki } = require('aki-api')
const NodeCache = require( "node-cache" )

const app = express()
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Express JS')
})

const region_default = 'en';
// const region_default = 'en_animals';
// const region_default = 'en_objects';
const list_region = [
  'en',
  'en_objects',
  'en_animals',
  'ar',
  'cn',
  'de',
  'de_animals',
  'es',
  'es_animals',
  'fr',
  'fr_objects',
  'fr_animals',
  'il',
  'it',
  'it_animals',
  'jp',
  'jp_animals',
  'kr',
  'nl',
  'pl',
  'pt',
  'ru',
  'tr',
  'id'
];

const childMode = false;
const proxy = undefined;
const myCache = new NodeCache();

app.post('/start', async (req, res) => {
	console.log(req.body)
	let user_id = req.body.user_id;
	let region = req.body.region;
	if (!region) {
		region = region_default
	}

	if (list_region.includes(region)) {
		try {
			const aki = new Aki({ region, childMode, proxy });
			await aki.start();
			myCache.set( user_id, aki, 10000 );
			res.json(aki);
		}
		catch(err) {
			console.log("loi roi")
			res.json({});
		}
	} else {
		res.json({});
	}
	
});

app.post('/get-by-id', async (req, res) => {
	console.log(req.body)
	let user_id = req.body.user_id;

	let aki = myCache.get( user_id );
	res.json(aki);
});

app.post('/answer', async (req, res) => {
	console.log(req.body)
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

const port = process.env.PORT || 8080

app.listen(port, (err, res) => {
    if (err) {
        console.log(err)
        return res.status(500).send(err.message)
    } else {
        console.log('[INFO] Server Running on port:', port)
    }
})