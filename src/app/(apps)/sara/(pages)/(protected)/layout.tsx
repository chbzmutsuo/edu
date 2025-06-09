'use client'

import 'src/cm/styles/globals.css'

import {Suspense} from 'react'
import {Metadata} from 'next'
import GlobalToast from '@components/utils/GlobalToast'

import React from 'react'

import {getServerSession, Session} from 'next-auth'
import {authOptions} from '@app/api/auth/authOptions'
import SessionContextProvider from '@hooks/useGlobalContext/providers/SessionContextProvider'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import {User} from '@prisma/client'
import Redirector from '@components/utils/Redirector'
import useGlobal from '@hooks/globalHooks/useGlobal'

export default function template(props) {
  const {session} = useGlobal()
  console.log(session) //logs
  // if (!session?.id) {
  //   return <Redirector redirectPath="/sara/" />
  // }

  return <div>{props.children}</div>
}
