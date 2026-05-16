import './App.css'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

function App() {
  return (
    <>
      <header>
        <Show when="signed-out">
          <SignInButton mode='modal' />
          <SignUpButton mode='modal' />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>

      <div style={{ height: "40px", width: "50px", fontSize: '45px' }} >hello</div>
    </>
  )
}

export default App
