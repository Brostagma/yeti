import { useState, useEffect } from 'react'
import Update from '@/components/update'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Remote from '@/pages/Remote'
import { AuthService } from '@/core/auth/AuthService'
import './styles/App.css'

function App() {
  const [version, setVersion] = useState('v0.1.3')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    // Fetch version from main process
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('get-app-version').then((ver) => {
        if (ver) setVersion(`v${ver}`)
      }).catch(err => console.error(err))
    }
  }, [])

  const handleMinimize = () => {
    window.ipcRenderer?.send('window-minimize')
  }
  const handleClose = () => {
    window.ipcRenderer?.send('window-close')
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLaunchApp = (appId: string) => {
    setCurrentPage(appId)
  }

  return (
    <div className="h-full w-full bg-[#0a0a0a] text-gray-200 overflow-hidden flex flex-col relative border border-white/5 rounded-lg shadow-2xl font-sans selection:bg-amber-500/30">

      {/* Custom Titlebar */}
      <div className="h-8 flex justify-between items-center px-4 z-50 bg-black/40 backdrop-blur-md draggable select-none border-b border-white/5 absolute top-0 left-0 w-full">
        <div className="text-[10px] font-medium tracking-[0.2em] text-gray-500 uppercase flex items-center gap-3">
          <span className={`w-1.5 h-1.5 rounded-full ${isAuthenticated ? 'bg-green-500/50' : 'bg-amber-600/50'}`}></span>
          {version}
        </div>
        <div className="flex space-x-3 no-drag">
          <button onClick={handleMinimize} className="w-2.5 h-2.5 rounded-full bg-white/10 hover:bg-white/30 transition-all duration-300"></button>
          <button onClick={handleClose} className="w-2.5 h-2.5 rounded-full bg-white/10 hover:bg-red-500/50 transition-all duration-300"></button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 mt-8 h-[calc(100%-2rem)]">
        {isAuthenticated ? (
          currentPage === 'dashboard' ? (
            <Dashboard onLaunchApp={handleLaunchApp} />
          ) : currentPage === 'remote' ? (
            <Remote />
          ) : (
            <Dashboard onLaunchApp={handleLaunchApp} />
          )
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>

      {/* Auto Update Component */}
      <div className="absolute bottom-4 right-4 z-50">
        <Update />
      </div>
    </div>
  )
}

export default App