import { useState } from 'react'
import './App.css'

function App() {
  const [version] = useState('v0.1.0-alpha')

  const handleMinimize = () => {
    window.ipcRenderer.send('window-minimize')
  }
  const handleClose = () => {
    window.ipcRenderer.send('window-close')
  }

  return (
    <div className="h-screen w-screen bg-gray-950 text-white overflow-hidden flex flex-col relative border border-gray-800 rounded-lg shadow-2xl">
      {/* Background Image/Effect */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center filter blur-sm transition-all duration-1000 hover:blur-none hover:opacity-30"></div>

      {/* Custom Titlebar */}
      <div className="h-10 flex justify-between items-center px-4 z-50 bg-black/40 backdrop-blur-md draggable select-none border-b border-white/5">
        <div className="text-xs font-mono text-gray-400 tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {version}
        </div>
        <div className="flex space-x-3 no-drag">
          <button onClick={handleMinimize} className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-all hover:scale-110"></button>
          <button onClick={handleClose} className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-all hover:scale-110"></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center z-10 relative">
        <div className="relative group cursor-default">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <h1 className="relative text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-2 select-none">
            YETI
          </h1>
        </div>

        <p className="text-2xl text-gray-300 font-light tracking-[0.5em] uppercase mb-12 opacity-80">
          Modern Uygulama
        </p>

        <div className="absolute bottom-10 opacity-40 text-xs font-light tracking-[0.3em] uppercase">
          YARATICI EMİN
        </div>
      </div>
    </div>
  )
}

export default App