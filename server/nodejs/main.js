const {Pool, Client } = require('pg')
const http = require("http");
var qs = require('querystring');
const url = require('url');
var crypto = require('crypto')

const host = 'localhost';
const port = 1234;

const places_table = 'places'
const users_table = 'users'

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'zibby',
  port: 5432,
})

client.connect()

var getHashStr = (data) =>{
	return crypto.createHash('md5').update(data).digest('hex');
};

var getPoints = (x, y, radius) => {
	return 'SELECT * FROM '+ places_table +' WHERE sqrt( power(x_pos -' + x +',2) - power(y_pos -' + y +',2) ) < '+ radius;
};
//todo upload photo 
var addUser = (login, email, password) => {
	return 'INSERT into '+ users_table+ ' VALUES((SELECT MAX(id) + 1 FROM '+ users_table +'),\''+ email+'\',\'' + login +'\' , \''+ getHashStr(password)+'\')';
}; 


var addPlace = (x_pos, y_pos, type, user_id, path, description) =>{
	return 'INSERT into ' + places_table + ' VALUES((SELECT MAX(id) + 1 FROM '+ places_table +'),'+ x_pos+',' + y_pos +', \''+ type+'\',\''+ path+'\','+user_id+ ',\''+description+'\')';
};


var findUserWithRawPassword = (login, password) => { 
	return 'SELECT * FROM ' + users_table + ' WHERE login = \'' +login+ '\' and hash_pass = \''+getHashStr(password)+ '\'';
};

var findUserWithoutHash = (login, password) => { 
	return 'SELECT login, hash_pass FROM ' + users_table + ' WHERE login = \'' +login+ '\' and hash_pass = \''+password+ '\'';
};


const ON_ERROR_RESPONSE = 'Ooops, error';

/*словарь команд*/
var actions = new Map();


actions.set('/loadpoints', async (req, res, query) =>{
	
	const x = query['x']
	const y = query['y']
	const radius = query['radius']
		
	if(x != null && y!= null && radius!=null){
		
		try{
				
			res.writeHead(200, { 'Content-Type': 'application/json' });
			db = await client.query(getPoints(x, y, radius) );
			res.write(JSON.stringify(db['rows']));
		
		}catch (err){
			console.log(err);
			res.writeHead(400);
		}
	}else{
		res.writeHead(400);
	}
});

actions.set('/registration', async (req, res, query) => {
	
		const login = query['login'];
		const email = query['email'];
		const password = query['password'];
			
		if(login != null && email != null && password != null){
				
			try{
			
				db = await client.query(addUser(login, email, password) );
				console.log('Registration user ' + login);
				res.writeHead(303, {
				'Location': 'signin/signed.html'
				});
		
			}catch (err){
				console.log(err);
				res.writeHead(400);
			}	
				
			}else{
				res.writeHead(400);
		}
	
});

actions.set('/login', async (req, res, query) => {
	
		const login = query['login'];
		const password = query['password'];
	
		if(login == null || password == null){
			res.writeHead(404);
			return;
		}
		
		try{
			
			var user_id = '';
			var pass_hash = '';

			db = await client.query(findUserWithRawPassword(login, password), async (err, qres) =>{
				
				try{
					
					const id = qres['rows'][0]['id'];
					const hash_pass = qres['rows'][0]['hash_pass'];
					
					
					console.log('login user ' + login);
					
					res.writeHead(303, {
						'Location': 'signin/signed.html'
					});
					
					
					//res.writeHead(303, {
						//'Set-Cookie': 'user_id='+id,
						//'Set-Cookie': 'hash_pass='+hash_pass,
					//	'Location': 'main/index.html'
					//});
					
				}catch(err){
					/*cannot find a user*/
					console.log(err);
					res.writeHead(400);
					return;
				}
				
				
			});
			
		}catch(err){
			/*database error*/
			res.writeHead(400);
			return;
		}
	
});

const requestListener = async function (req, res) {


		const hrefObject = url.parse(req.url.toString(),true).href;
		const HREF = JSON.parse(JSON.stringify(hrefObject));
		
        const queryObject = url.parse(req.url.toString(),true).query;
        const query = JSON.parse(JSON.stringify(queryObject));
		
		const action = HREF.split('?')[0];
		
		console.log(action);
		
		try{
			f = actions.get(action);
			await f(req, res, query);

		}catch(err){
			res.writeHead(404);
			console.log(err);
		}
		res.end();

};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

