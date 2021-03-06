

const {Pool, Client } = require('pg');
fs = require('fs');
//var formidable = require('formidable');

var multer  = require('multer')
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
	return 'SELECT * FROM '+ places_table +' WHERE sqrt( power(x_pos -' + x +',2) + power(y_pos -' + y +',2) ) < '+ radius;
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

var findUserWithoutHashById = (id, password) => { 
	return 'SELECT login, hash_pass FROM ' + users_table + ' WHERE id = \'' +id+ '\' and hash_pass = \''+password+ '\'';
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


actions.set('/addpoint', async (req, res, query) => {
	
		const x = query['placex'];
		const y = query['placey'];
		const description = query['description'];
			
		if(x != null && y != null){
				
			try{

				
				var pairs = req['headers']['cookie'].split(';');
				let map = '';
				let user_id = -1;
				let hash = '';
				pairs.forEach((pair) => {
					p_e = pair.split('=');
					
					if(p_e.length > 1){
						p_e[0] = p_e[0].trim();
						p_e[1] = p_e[1].trim();
						if(p_e[0] == 'user_id'){
							user_id = p_e[1];
						}else if(p_e[0] == 'hash_pass'){
							hash = p_e[1];
						}
					}
				});
				
				userInDb = await client.query(findUserWithoutHashById(user_id, hash));
				if(userInDb['rows'] == null){
					console.log('cannot find');
				}else{
					db = await client.query(addPlace(x, y,'lavochka', user_id, ''/*path*/, description));
				}
				
				
				console.log('place added by userId '+ user_id);
				
				res.writeHead(200, {
				//'Location': 'signin/signed.html'
				});
		
			}catch (err){
				/*cannot find*/
				//console.log(err);
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
			res.writeHead(200);
			db = await client.query(findUserWithRawPassword(login, password));
			
			
			try{
				id = db['rows'][0]['id'];
				hash = db['rows'][0]['hash_pass'].trim();
				console.log('user_id='+id+'; hash_pass='+hash);
				res.writeHead(303, [
					['Set-Cookie', 'user_id='+id],
					['Set-Cookie', 'hash_pass='+hash],
					['Location', 'main/index.html']
				]);
			
			}catch(err){
				res.writeHead(303, [
					['Location', 'log_in/unlogin.html']
				]);
			
			}
			
			
		}catch(err){
			/*database error*/
			res.writeHead(400);
			return;
		}
	
});

actions.set('/loadpoints', async (req, res, query) => {
	
		const x = query['x'];
		const y = query['y'];
		const radius = query['radius'];
	
		if(x == null || y == null || radius == null){
			res.writeHead(404);
			return;
		}
		
		try{
			
			res.writeHead(200);
			db = await client.query(getPoints(x, y, radius));

			try{
				rows = db['rows'];
				
				res.write(JSON.stringify(rows));
				
			
			}catch(err){
				console.log(err);
				res.writeHead(404);
			
			}
			
			
		}catch(err){
			/*database error*/
			console.log(err);
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

