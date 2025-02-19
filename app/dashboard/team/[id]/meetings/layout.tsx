import StreamVideoProvider from '@/providers/StreamClientProvider'
import React, { ReactNode } from 'react'

export default async function MeetingLayout ({ children }: { children: ReactNode }) {
  return (
    <StreamVideoProvider>
        {children}
    </StreamVideoProvider>
  )
}
