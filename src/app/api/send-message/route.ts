import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";

export async function POST(request: Request){
    await dbConnect()

    const {username, content} = await request.json()

    try {
        const user = await UserModel.findOne({username})
        if(!user){
            return Response.json({
                success: false,
                message: "User not found"
            },{status: 404})
        }

        if(!user.isAcceptingMessage){
            return Response.json({
                success: false,
                message: "User not accepting messages"
            },{status: 403})
        }

        const newMessage  = {content, createdAt: new Date()}
        user.message.push(newMessage as Message)

        await user.save()

        return Response.json({
            success: true,
            message: "Message sent successfully"
        },{status: 200})

    } catch (error) {
        console.log("Error in sending messages", error)
        return Response.json({
            success:false,
            message: "Error in sending messages"
        },{status: 500})
    }
}