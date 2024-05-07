exports.pageNotFound = (req, res, next) => {
	res.status(404).send() 	  // HTTP status 404: NotFound	
};