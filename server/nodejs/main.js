

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


var addPlace = (x_pos, y_pos, type, user_id, path) =>{
	return 'INSERT into ' + places_table + ' VALUES((SELECT MAX(id) + 1 FROM '+ places_table +'),'+ x_pos+',' + y_pos +', \''+ type+'\',\''+ path+'\','+user_id+ ')';
};


var findUser = (login, password) => { 
	return 'SELECT login, hash_pass FROM ' + users_table + ' WHERE login = \'' +login+ '\' and hash_pass = \''+getHashStr(password)+ '\'';
};

const ON_ERROR_RESPONSE = 'Ooops, error';

const requestListener = async function (req, res) {


		const hrefObject = url.parse(req.url.toString(),true).href;
		const HREF = JSON.parse(JSON.stringify(hrefObject));
		
        const queryObject = url.parse(req.url.toString(),true).query;
        const obj = JSON.parse(JSON.stringify(queryObject));
		
		const action = HREF.split('?')[0];
		
		console.log(action);
		
		if(action == '/loadpoints'){
			/*загрузить точки*/
			const x = obj['x']
			const y = obj['y']
			const radius = obj['radius']
		
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
		}else if(action == '/registration'){
			/*регистрация в аккаунте*/
			const login = obj['login'];
			const email = obj['email'];
			const password = obj['password'];
			
			if(login != null && email != null && password != null){
				
				try{
			
					db = await client.query(addUser(login, email, password) );
					console.log('Registration user ' + login);
					res.writeHead(303/*2*/, {
					'Location': 'signin/signed.html'
					//add other headers here...
					});
		
				}catch (err){
					console.log(err);
					res.writeHead(400);
				}
				
				
			}else{
				res.writeHead(400);
			}
			
		}
		res.end();

};





const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

