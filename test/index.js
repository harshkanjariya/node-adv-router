const express = require('express');
const app = express();

const router = require('../index')();

router.get('/hello',(req,res)=>{
	res.sendJson.success({
		data: 'hii'
	});
});

app.use(router.router);

app.listen(3000);