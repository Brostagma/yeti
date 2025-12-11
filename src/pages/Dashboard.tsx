import { useState } from 'react'

const Dashboard = () => {
    const [activeApp, setActiveApp] = useState<string | null>(null)

    const apps = [
        { id: 'filescanner', name: 'File Scanner', icon: '📂', description: 'Analyze directory structures' },
        { id: 'settings', name: 'Settings', icon: '⚙️', description: 'System configuration' },
    ]

    return (
        <div className="flex flex-col h-full w-full bg-[#0a0a0a] text-white relative overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-serif italic tracking-tight">Yeti</h2>
                    <span className="text-xs text-gray-600 uppercase tracking-widest border-l border-white/10 pl-4">Dashboard</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-xs font-bold shadow-lg shadow-amber-900/20">
                        A
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((app) => (
                        <div
                            key={app.id}
                            onClick={() => setActiveApp(app.id)}
                            className="group relative p-6 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-transparent rounded-xl transition-all duration-500"></div>
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{app.icon}</div>
                            <h3 className="text-lg font-medium text-gray-200 mb-1 group-hover:text-amber-500 transition-colors">{app.name}</h3>
                            <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{app.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
