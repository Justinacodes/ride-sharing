import Image from 'next/image'
import LoginPage from './login/page'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">


      <div>
        <LoginPage />
      </div>
    </main>
  )
}
