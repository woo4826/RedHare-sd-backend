const crypto = require('crypto');
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User');
const Session = require('../models/Session');
const jwt = require('../../config/jwt');
const auth = require('../middlewares/isAuth');
const { domainToASCII } = require('url');


// const message = (req) => {
// 	//let message = req.flash('error');
// 	if (message.length > 0) {
// 		message = message[0];
// 	} else {
// 		message = null;
// 	}

// 	return message;
// }

// const oldInput = (req) => {
// 	let oldInput = req.flash('oldInput');
// 	if (oldInput.length > 0) {
// 		oldInput = oldInput[0];
// 	} else {
// 		oldInput = null;
// 	}
	
// 	return oldInput;
// }

// exports.loginPage = (req, res, next) => {
// 	if(res.locals.isAuthenticated){
// 		res.redirect('/');
// 	} else {
// 		res.render('login',{layout: 'login_layout', loginPage: true, pageTitle: 'Login', errorMessage: message(req), oldInput: oldInput(req)});
// 	}
// };

exports.login = (req, res, next) => {
	

	const validationErrors = [];
	console.log(req.body);
	if (!validator.isEmail(req.body.inputEmail)) validationErrors.push('Please enter a valid email address.');
	if (validator.isEmpty(req.body.inputPassword)) validationErrors.push('Password cannot be blank.');
	if (validationErrors.length) {
		//req.flash('error', validationErrors);
		return res.redirect('/login');
	}
	User.findOne({
		where: {
			email: req.body.inputEmail
		}
	}).then(user => {
		if(user) {
			bcrypt
				.compare(req.body.inputPassword, user.password)
				.then(doMatch => {
					if (doMatch) {
						console.log("1");
						//req.session.isLoggedIn = true;
						const accessToken = jwt.makeAccessToken({id: user.id});
						const refreshToken = jwt.makeRefreshToken();
						res.send({
							"accessToken" : accessToken,
							"refreshToken" : refreshToken,
						});


					}
					else{

						res.send(403);
					}
				})
				.catch(err => {
					console.log(err);
					//req.flash('error', 'Sorry! Somethig went wrong.');
					//req.flash('oldInput',{email: req.body.inputEmail});
					return res.redirect('/login');
				});
		} else {
			//req.flash('error', 'No user found with this email');
			//req.flash('oldInput',{email: req.body.inputEmail});
			return res.redirect('/login');
		}
	})
	.catch(err => console.log(err));
};

exports.logout = (req, res, next) => {
	if(res.locals.isAuthenticated){
		req.session.destroy(err => {
			
			return res.redirect('/');
		});
	} else {
		return res.redirect('/login');
	}
};



exports.signUp = (req, res, next) => {
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(user => {
		if(!user) {
			return bcrypt
					.hash(req.body.password, 12)
					.then(hashedPassword => {
						const user = new User({
							fullName: req.body.name,
							email: req.body.email,
							password: hashedPassword,
							accessToken: "",
							refreshToken: "",
						});
						return user.save();
					})
					.then(result => {
						return res.redirect('/login');
					});
		} else {
			//req.flash('error', 'E-Mail exists already, please pick a different one.');
			//req.flash('oldInput',{name: req.body.name});
        	return res.redirect('/sign-up');
		}
	})
	.catch(err => console.log(err));
};

// exports.forgotPasswordPage = (req, res, next) => {
// 	if(res.locals.isAuthenticated){
// 		return res.redirect('/');
// 	} else {
// 		return res.render('forgot_password',{layout: 'login_layout', loginPage: true, pageTitle: 'Forgot Password', errorMessage: message(req), oldInput: oldInput(req)});
// 	}
// };

exports.forgotPassword = (req, res, next) => {
	const validationErrors = [];
	if (!validator.isEmail(req.body.email)) validationErrors.push('Please enter a valid email address.');

	if (validationErrors.length) {
		//req.flash('error', validationErrors);
		return res.redirect('/forgot-password');
	}
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect('/forgot-password');
		}
		const token = buffer.toString('hex');
		User.findOne({where: {
				email: req.body.email
				}
			})
			.then(user => {
				if(!user){
					//req.flash('error', 'No user found with that email');
					return res.redirect('/forgot-password');
				}
				user.resetToken = token;
				user.resetTokenExpiry = Date.now() + 3600000;
				return user.save();
			}).then(result => {
				if(result) return res.redirect('/resetlink');
			}).catch(err => {console.log(err)})
	});
};

exports.refresh = async (req, res)=>{
    // access, refresh 토큰이 헤더에 담겨 온 경우
    if (req.headers["authorization"] && req.headers["refresh"]){
        const accessToken = req.headers["authorization"].split(" ")[1];
        const refreshToken = req.headers["refresh"];
        
        // access token 검증 -> expired여야 함.
        const authResult = jwt.verify(accessToken);
 
        // access token 디코딩하여 userId를 가져온다.
        const decoded = jwt.decode(accessToken);

        // 디코딩 결과가 없으면 권한이 없음을 응답.
        if (!decoded) {
            res.status(401).send(failResponse(401,"No authorized!"));
        }
        
        // access 토큰 만료 시
        if (authResult.ok === false && authResult.message === "jwt expired") {
          // 1. access token이 만료되고, refresh token도 만료 된 경우 => 새로 로그인해야합니다.
          const refreshResult = await TokenUtils.refreshVerify(refreshToken, decoded.id);
          if (refreshResult === false) {
            res.status(401).send(failResponse(401,"No authorized! 다시 로그인해주세요."));
          } else {
            // 2. access token이 만료되고, refresh token은 만료되지 않은 경우 => 새로운 access token을 발급
            const newAccessToken = TokenUtils.makeAccessToken({ id: decoded.id });
     
            res.status(200).send(successResponse(
                200,{
                accessToken: newAccessToken,
                refreshToken,
                }
                ));
          }
        } else {
          // 3. access token이 만료되지 않은경우 => refresh 할 필요가 없습니다.
          res.status(400).send(failResponse(400,"Acess token is not expired!"));
        }
      } else {
        // access token 또는 refresh token이 헤더에 없는 경우
        res.status(401).send(failResponse(400,"Access token and refresh token are need for refresh!"));
      }
};