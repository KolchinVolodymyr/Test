'use strict';

const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const db = require('../../utils/database');
const User = db.user;


module.exports = [
    {
        //1. Login user
        method: 'POST',
        path: '/api/login',
        handler: async (request, h) => {
            try {
                const { email, password } = request.payload;
                const candidate = await User.findOne({
                    where: {
                        email: email
                    }
                });
                if (candidate) {
                    const areSame = await bcrypt.compare(password, candidate.password);
                    if (areSame) {
                        request.cookieAuth.set({
                            id: candidate.id,
                            name: candidate.name,
                            phone: candidate.phone,
                            email: candidate.email
                        });
                        const token = JWT.sign(
                            { candidate },
                            'jwtSecret',
                            { expiresIn: '10h' });

                        return h.response({token: token}).code(200);
                    } else {
                        return h.response({field :"password", message :"Wrong email or password"}).code(422);
                    }
                } else {
                    return h.response({message: 'This Email is not registered'}).code(422);
                }
            } catch (e) {
                console.log(e)
            }
        },
        options: {
            auth: false,
        }
    },
    {   //2. Register
        method: 'POST',
        path: '/api/register',
        handler: async function (request, h) {
            try {
                const {name, email, password, phone} = request.payload;
                if(password.length<4){
                    return h.response({
                        field:"current_password",
                        message:"Wrong current password"
                    }).code(422);
                }
                if(name.length<4){
                    return h.response({
                        field:"current_name",
                        message:"Wrong current name"
                    }).code(422);
                }
                const hashPassword = await bcrypt.hash(password, 10)
                const ItemUser = await User.create({
                    name: request.payload.name,
                    email: request.payload.email,
                    password: hashPassword,
                    phone: request.payload.phone
                });
                const token = JWT.sign(
                    { userId: User.name },
                    'jwtSecret',
                    { expiresIn: '10h' }
                    );

                return h.response({token: token}).code(200);
            } catch (e) {
                console.log(e)
            }
        },
        options: {
            auth: {
                mode: 'try'
            }
        }
    }

];