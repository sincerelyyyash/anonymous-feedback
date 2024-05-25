'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import {useForm } from "react-hook-form"
import Link from "next/link"
import * as z from 'zod'
import { useEffect, useState } from "react"
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, {AxiosError} from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"



const page = () => {
  const [username, setUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debounced = useDebounceCallback(setUsername,300)
  const { toast} = useToast()
  const router = useRouter()

  const form  = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })

  useEffect(()=>{
    const checkUsernameUnique = async () =>{
      if(username){
        setIsCheckingUsername(true)
        setUsernameMessage('')
        
        try {
          const response = await axios.get(`/api/check-username?username=${username}`)
          setUsernameMessage(response.data.message)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
        }finally {
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()
  },[username])

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)

    try {
      const response = await axios.post<ApiResponse>('/api/signup', data)
      toast({
        title: "Success",
        description: response.data.message
      })
      router.replace(`/verify/${username}`)
    } catch (error) {
      console.error("Error in signing up user")
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive"
      })
    }finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-black/[0.96] antialiased border border-white rounded-xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Anonymous Opinions
          </h1>
          <p className="mb-4">
            Sign up to start your mystery adventure
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} 
                onChange={(e)=>{
                  field.onChange(e)
                  debounced(e.target.value)
                }}
                />
              </FormControl>
                {isCheckingUsername && <Loader2 className="animate-spin" />}
                <p className={`text-sm ${usernameMessage === "Username available" ? "text-green-500" : "text-red-500"}`}>
                    {usernameMessage}
                </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="Enter E-mail" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="border rounded-xl" >
          {
            isSubmitting ? (
              <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please Wait
              </>
            ) : ("Sign Up")
          }
        </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href={"/signin"} className="text-blue-600 hover:text-blue-600">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default page