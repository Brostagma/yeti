import { useState } from 'react'
import { AuthService } from '@/core/auth/AuthService'

interface LoginProps {
    onLogin: () => void
}

const Login = ({ onLogin }: LoginProps) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        const auth = AuthService.getInstance()
        if (auth.login(username, password)) {
            onLogin()
        } else {
            setError('Invalid credentials')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#050505] text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none"></div>
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-amber-900/10 via-transparent to-blue-900/10 animate-spin-slow pointer-events-none"></div>

            <div className="z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform transition-all hover:scale-[1.01] duration-500">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-thin tracking-tighter text-white/90 font-serif italic mb-2">Yeti</h1>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400">Access Control</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-gray-500 ml-1">Identity</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder-gray-700"
                            placeholder="Username"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-gray-500 ml-1">Passcode</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder-gray-700"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs text-center tracking-wide bg-red-500/10 py-2 rounded border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-amber-900/20 transition-all duration-300 transform hover:-translate-y-0.5 text-xs uppercase tracking-widest"
                    >
                        Authenticate
                    </button>
                </form>
            </div>

            <div className="absolute bottom-6 text-[10px] text-gray-600 tracking-widest uppercase opacity-50">
                Secure System v0.1.3
            </div>
        </div>
    )
}

export default Login
