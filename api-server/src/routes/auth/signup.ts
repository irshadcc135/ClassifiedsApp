/*
    To implement Verification of email     
    To implment validation middleware and handle validation errors
*/

import express, { Request, Response } from 'express' ;
import jwt from 'jsonwebtoken' ;

import User from '../../models/User' ;
import RequestValidationError from '../../errors/request-validation-error' ;
import { currentUser } from '../../middlewares/auth-middleware';


const router = express.Router() ;

router.use(currentUser) ;

router.post('/api/users/signup',

    async (req : Request, res : Response) => {


        const { first_name ,last_name,email, password } = req.body ;
        const existingUser = await User.findOne({ email : email}) ;
        
        if(existingUser){

            throw new RequestValidationError([{
                field : "email",
                message : "Email already in use"
            }])
        }


        const user = new User({
            first_name : first_name,
            last_name : last_name,
            email : email ,
            password : password,
            info : {
                status : "Active",
                last_login: {
                    attempt_count: 0
                }
            }
        })


        await user.save() ;

        const userJwt = jwt.sign(
            {
                id : user.id ,
                email : user.email 
            },
            process.env.JWT_KEY!
        )
        
        req.session = {
            token : userJwt 
        }
        res.status(201).send(user)
    }
)



export default router ;