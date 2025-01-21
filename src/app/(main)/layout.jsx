import { useUser } from '@clerk/nextjs'
import React from 'react'
import {BarLoader} from "react-spinners";

const AppLayout = ({children}) => {


    const {isLoaded} = useUser();

  return (
    <>
    {!isLoaded && <BarLoader width={"100%"} color="#36d7s7" />}
    {children}</>
  )
}

export default AppLayout