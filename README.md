# advance-router

router with different status codes and required parameters.

#### setup

setup mainRouter.js for re-use
```javascript
let statusCodes = {
	success: {
		code: 200,
		message: "success",
	},
	//client side codes
	missing_param: {
		code: 419,
		message: "missing parameter",
	},
	//server side codes
	db_error: {
		code: 520,
		message: "database error",
	},
}
module.exports = (router)=>{
	return require('advance-router')({
		status: statusCodes,
		// optional
		missingValidator: (param)=> !param,
		// optional
		onMissingParam: (param, req, res) => {
			res.status(419);
			res.statusMessage = 'missing parameter';
			res.json({
				code: 419,
				message: 'parameter missing',
				name: param
			});
			return false;
		},
		router
	});
}
```

use in  app.js
```javascript
const express = require('express');
const app = express();
const router = require('./mainRouter.js')();

router.post({
	path: '/hello_name',
	// this params are required for api call
	// calling without this params will result in error 419 / missing param error
	params: ['name']
},(req,res)=>{
	res.sendJson.success({
		data: 'Hello '+req.body.name
	});
});

app.use(router.router);

app.listen(3000);
```