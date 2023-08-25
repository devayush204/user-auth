const { connect } = require('@/dbConfig/dbConfig');
const User = require('@/models/userModel').default;
const { NextRequest, NextResponse } = require("next/server");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');



connect()

export async function POST(request){
    try {
        const reqBody = await request.json();
        const {email, password} = reqBody;
        console.log(reqBody)

         //check if user exists
         const user = await User.findOne({email: email})
         if(!user){
             return NextResponse.json({error: "User does not exist"}, {status: 400})
         }
         console.log("user exists");

         
        //check if password is correct
        const validPassword = await bcryptjs.compare(password, user.password)
        if(!validPassword){
            return NextResponse.json({error: "Invalid password"}, {status: 400})
        }
        console.log(user);
         console.log("password is correct");

          //create token data
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        }

         //create token
         const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET, {expiresIn: "1h"})

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
        })
        response.cookies.set("token", token, {
            httpOnly: true, 
            
        })
        return response;

        
    } catch (error) {
        return NextResponse.json({error: error.message} ,
            {status: 400})
    }
}