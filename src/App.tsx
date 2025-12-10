import { useState, useEffect } from 'react'
import Update from '@/components/update'
import './App.css'

function App() {
  const [version, setVersion] = useState('v0.1.3') // Fallback initial state

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

  return (
    <div className="h-full w-full bg-[#0a0a0a] text-gray-200 overflow-hidden flex flex-col relative border border-white/5 rounded-lg shadow-2xl font-sans selection:bg-amber-500/30">

      {/* Background Texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>

      {/* Custom Titlebar */}
      <div className="h-12 flex justify-between items-center px-6 z-50 bg-black/20 backdrop-blur-sm draggable select-none border-b border-white/5">
        <div className="text-[10px] font-medium tracking-[0.2em] text-gray-500 uppercase flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600/50"></span>
          {version}
        </div>
        <div className="flex space-x-4 no-drag">
          <button onClick={handleMinimize} className="w-3 h-3 rounded-full bg-white/10 hover:bg-white/30 transition-all duration-300"></button>
          <button onClick={handleClose} className="w-3 h-3 rounded-full bg-white/10 hover:bg-red-500/50 transition-all duration-300"></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center z-10 relative">
        <div className="relative group cursor-default mb-8">
          <h1 className="text-9xl font-thin tracking-tighter text-white/90 select-none font-serif italic">
            Yeti
          </h1>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent"></div>
        </div>

        <p className="text-sm text-gray-400 font-medium tracking-[0.4em] uppercase mb-16 opacity-60">
          Premium Desktop Experience
        </p>

        <div className="absolute bottom-12 opacity-30 text-[10px] font-medium tracking-[0.3em] uppercase text-amber-500/50">
          Designed by Emin
        </div>
      </div>

      {/* Auto Update Component */}
      <div className="absolute bottom-6 right-6 z-50">
        <Update />
      </div>
    </div>
  )
}

export default App