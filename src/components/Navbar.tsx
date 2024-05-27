"use client"
import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'


const Navbar = () => {
    const { data: session} = useSession()
    const user: User = session?.user as User

  return (
    <nav className='p-4 md:p-6 shadow-md bg-black/[0.60]'>
        <div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
            <a 
            className='text-xl font-bold mb-4 md:mb-0'
            href="#">Anonymous Opinions</a>
            {
                session ? (
                    <>
                    <span className='mr-4'>Welcome, {user.username || user.email}</span>
                    <button className='w-full md:w-auto' onClick={()=>{
                        signOut()
                    }}>Logout</button>
                    </> 
                ) : (
                    <Link href={'/signin'}>
                        <button className='w-full md:w-auto' >Log In</button>
                    </Link>
                )
            }
        </div>
    </nav>
  )
}


export default Navbar