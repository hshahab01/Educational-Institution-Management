
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Models = require('../models/index');

const Student = Models.Student;

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

            req.user = await Student.findByPk(decoded.id)

            next();
        } catch (err) {
            console.log(err.message)
            if (err.message === 'jwt expired') {
                console.log(req.params.id)
                try {
                    let refreshToken = generateRefreshToken(req.params.id);
                    let newAccessToken = await regenerateAccessToken(refreshToken);
                    req.headers.authorization = `Bearer ${newAccessToken}`;
                    // Recall the protect function with the new access token
                    return protect(req, res, next);
                } catch (err) {
                    console.log('Error while refreshing access token:', err.message);
                    return res.status(401).send('Unauthorized');
                }
            } else if (err.message === 'invalid signature') {
                console.log("Invalid token");
                return res.status(401).send("Invalid token");
            } else {
                next(err);
            }
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
})

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '20s',
    })
}
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '10d',
    })
}

const regenerateAccessToken = (refreshToken) => {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccess = generateAccessToken(decoded.id);
    return newAccess;
}

// const regenerateAccessToken = asyncHandler(async (req, res, next) => {
//     let token;

//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         try {
//             token = req.headers.authorization.split(' ')[1]

//             const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

//             const newAccess = generateAccessToken(decoded.id);

//             res.status(200).json(newAccess);
//             next();
//         } catch (error) {
//             console.log(error);
//             res.status(401)
//             throw new Error('Not authorized');
//         }
//     }
//     if (!token) {
//         res.status(401);
//         throw new Error('Not authorized, no token');
//     }
// })

module.exports = {
    protect,
    generateAccessToken,
    generateRefreshToken,
    regenerateAccessToken,
};