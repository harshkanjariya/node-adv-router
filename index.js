module.exports = (options = {}) => {
	let status = options.status || {
		success: {
			code: 200,
			message: 'success'
		},
		missing_param: {
			code: 419,
			message: 'param missing'
		}
	}
	let router = options.router || require('express').Router();
	let missingValidator;
	if (options.missingValidator) {
		missingValidator = options.missingValidator;
	} else {
		missingValidator = (param) => !param;
	}
	let onMissingParam;
	if (options.onMissingParam) {
		onMissingParam = options.onMissingParam;
	} else {
		onMissingParam = (param, req, res) => {
			if (status.missing_param) {
				res.status(status.missing_param.code);
				res.statusMessage = status.missing_param.message;
				res.json({...status.missing_param,name: param});
			} else {
				res.status(400);
				res.statusMessage = "Missing parameter";
				res.end();
			}
			return false;
		}
	}

	function codes(res) {
		let obj = {};
		Object.keys(status).forEach(key => {
			obj[key] = (data) => {
				res.status(status[key].code);
				res.statusMessage = status[key].message;
				if (!data)
					data = {};
				res.json({
					...status[key],
					...data,
				});
			};
		})
		return obj;
	}

	return {
		router,
		/**
		 * @name Handlers
		 * @function
		 * @param {Request} req
		 * @param {Response} res
		 * @param {Array<Object>} status
		 * @param {Function} next
		 */
		/**
		 * @param {{
		 *     path: String,
		 *     params: Array<String>|undefined
		 * }} opt
		 * @param {Handlers} handlers
		 */
		post: (opt, handlers) => {
			let params = opt.params || [];
			let path = opt.path || '';
			if (params && !Array.isArray(params)) {
				throw new Error('requireParams must be a type of array.');
			}
			router.post(path, (req, res, next) => {
				let isMissing = false;
				for (let p of params) {
					if (missingValidator(req.body[p])) {
						let val = onMissingParam(p, req, res);
						isMissing = !val;
						if (isMissing) return;
					}
				}
				res.sendJson = codes(res);
				handlers(req, res, next);
			});
		},
		/**
		 * @param {{
		 *     path: String,
		 *     query: Array<String>|undefined
		 * }} opt
		 * @param {Handlers} handlers
		 */
		get: (opt, handlers) => {
			let params = opt.query || [];
			let path = opt.path || '';
			if (params && !Array.isArray(params)) {
				throw new Error('require query params must be a type of array.');
			}
			router.get(path, (req, res, next) => {
				let isMissing = false;
				for (let p of params) {
					if (missingValidator(req.query[p])) {
						let val = onMissingParam(p, req, res);
						isMissing = !val;
						if (isMissing) return;
					}
				}
				res.sendJson = codes(res);
				handlers(req, res, next);
			});
		},
		use: router.use,
	}
}