import dbConnect from "@/lib/dbConnect";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import UserModel from "@/model/user.model";
import bcrypt from 'bcryptjs'


export async function POST(request: Request) {
  await dbConnect()

  try {
    const { username, email, password } = await request.json()
    const existingUsernameVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true
    })

    if (existingUsernameVerifiedUser) {
      return Response.json({
        success: false,
        message: "Username is already taken"
      }, {
        status: 400
      })
    }

    const existingEmailVerifiedUser = await UserModel.findOne({ email })

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

    if (existingEmailVerifiedUser) {
      if (existingEmailVerifiedUser.isVerified) {
        return Response.json({
          success: false,
          message: "User already exists with this email"
        }, { status: 500 })
      } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        existingEmailVerifiedUser.password = hashedPassword;
        existingEmailVerifiedUser.verifyCode = verifyCode;
        existingEmailVerifiedUser.verifyCodeExpiry = new Date(Date.now() + 360000)
        await existingEmailVerifiedUser.save()
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() + 1)

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: true,
        isAcceptingMessage: true,
        message: []
      })

      await newUser.save()
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )

    if (!emailResponse.success) {
      return Response.json({
        success: false,
        message: emailResponse.message
      }, { status: 500 })
    }

    return Response.json({
      success: true,
      message: "User registered succesfully, please verify your email"
    }, { status: 201 })

  } catch (error) {
    console.error("Error registering user", error)
    return Response.json(
      {
        success: false,
        message: "Error registering user"
      }, {
      status: 500
    }
    )
  }
}
