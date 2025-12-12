import { useState, useEffect, useRef } from 'react'
import Peer, { DataConnection } from 'peerjs'
import ConnectionModal from '@/components/remote/ConnectionModal'

export default function Remote() {
    const [peerId, setPeerId] = useState<string>('')
    const [remotePeerId, setRemotePeerId] = useState<string>('')
    const [status, setStatus] = useState<string>('Disconnected')
    const [isHost, setIsHost] = useState<boolean>(false)
    const [incomingCall, setIncomingCall] = useState<string | null>(null)
    const [permissions, setPermissions] = useState({ screen: false, accessibility: false })

    const peerRef = useRef<Peer | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const connRef = useRef<DataConnection | null>(null)

    useEffect(() => {
        // Check permissions on mount (macOS only)
        const checkPermissions = async () => {
            if (window.ipcRenderer) {
                const screen = await window.ipcRenderer.invoke('check-media-access')
                const accessibility = await window.ipcRenderer.invoke('request-accessibility')
                setPermissions({ screen, accessibility })
            }
        }
        checkPermissions()
    }, [])

    useEffect(() => {
        const peer = new Peer()
        peerRef.current = peer

        peer.on('open', (id) => {
            setPeerId(id)
            setStatus('Ready')
        })

        // Handle incoming data connection (Handshake)
        peer.on('connection', (conn) => {
            conn.on('data', (data: any) => {
                try {
                    const msg = JSON.parse(data)

                    if (msg.type === 'REQUEST_CONNECT') {
                        // Show modal to accept/reject
                        setIncomingCall(conn.peer)
                        connRef.current = conn
                    } else if (msg.type === 'ACCEPT_CONNECT') {
                        // Host accepted, start call
                        setStatus('Host Accepted. Starting Stream...')
                        startCall(conn.peer)
                    } else if (msg.type === 'REJECT_CONNECT') {
                        setStatus('Connection Rejected by Host')
                        conn.close()
                    } else if (['MouseMove', 'MouseClick', 'KeyPress'].includes(msg.type)) {
                        // Input events
                        if (window.ipcRenderer) {
                            window.ipcRenderer.send('input-event', msg)
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse message', e)
                }
            })

            conn.on('close', () => {
                setStatus('Connection Closed')
                connRef.current = null
            })
        })

        // Handle incoming media call (Stream)
        peer.on('call', async (call) => {
            if (isHost) {
                // We are host, we provide the stream
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: true,
                        audio: false
                    })
                    call.answer(stream)
                    setStatus('Streaming...')
                } catch (err) {
                    console.error('Failed to get display media', err)
                    setStatus('Failed to capture screen')
                }
            } else {
                // We are client, we receive the stream
                call.answer()
                call.on('stream', (remoteStream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = remoteStream
                        videoRef.current.play()
                        setStatus('Viewing Remote Screen')
                    }
                })
            }
        })

        return () => {
            peer.destroy()
        }
    }, [isHost])

    const startHosting = () => {
        setIsHost(true)
        setStatus('Waiting for connection...')
    }

    const connectToHost = () => {
        if (!peerRef.current || !remotePeerId) return

        setStatus('Connecting...')
        const conn = peerRef.current.connect(remotePeerId)
        connRef.current = conn

        conn.on('open', () => {
            setStatus('Waiting for Host to Accept...')
            conn.send(JSON.stringify({ type: 'REQUEST_CONNECT' }))
        })
    }

    const acceptConnection = () => {
        if (connRef.current) {
            connRef.current.send(JSON.stringify({ type: 'ACCEPT_CONNECT' }))
            setIncomingCall(null)
            setStatus('Connection Accepted. Waiting for stream...')
        }
    }

    const rejectConnection = () => {
        if (connRef.current) {
            connRef.current.send(JSON.stringify({ type: 'REJECT_CONNECT' }))
            connRef.current.close()
            setIncomingCall(null)
        }
    }

    const startCall = (remoteId: string) => {
        // Client initiates the call to receive the stream
        // Wait, logic above says:
        // Host answers with stream.
        // So Client must call Host.
        if (!peerRef.current) return
        const call = peerRef.current.call(remoteId, new MediaStream())

        call.on('stream', (remoteStream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = remoteStream
                videoRef.current.play()
                setStatus('Viewing Remote Screen')
            }
        })
    }

    const handleInput = (event: any) => {
        if (isHost) return
        if (!connRef.current) return
        connRef.current.send(JSON.stringify(event))
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        handleInput({
            type: 'MouseMove',
            payload: { x: Math.round(e.clientX), y: Math.round(e.clientY) }
        })
    }

    const handleClick = (e: React.MouseEvent) => {
        const buttonMap: Record<number, string> = { 0: 'left', 1: 'middle', 2: 'right' }
        handleInput({
            type: 'MouseClick',
            payload: { button: buttonMap[e.button] || 'left' }
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        handleInput({
            type: 'KeyPress',
            payload: { key: e.key }
        })
    }

    return (
        <div className="h-full flex flex-col p-6 text-white" onKeyDown={handleKeyDown} tabIndex={0}>
            <ConnectionModal
                open={!!incomingCall}
                peerId={incomingCall || ''}
                onAccept={acceptConnection}
                onReject={rejectConnection}
            />

            <h1 className="text-2xl font-bold mb-6">Remote Desktop</h1>

            {/* Permissions Warning (macOS) */}
            {(!permissions.screen || !permissions.accessibility) && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg mb-6 flex items-start gap-3">
                    <span className="text-amber-500 text-xl">⚠️</span>
                    <div>
                        <h3 className="font-bold text-amber-500">Permissions Required</h3>
                        <p className="text-sm text-gray-300">
                            To host a session, please grant <strong>Screen Recording</strong> and <strong>Accessibility</strong> permissions in System Settings.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex gap-4 mb-6">
                <div className="bg-white/5 p-4 rounded-lg flex-1 border border-white/5">
                    <h2 className="text-xl mb-2 font-medium">Your ID</h2>
                    <div className="text-green-400 font-mono text-lg tracking-wider">{peerId || 'Generating...'}</div>
                    <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status.includes('Connected') || status.includes('Streaming') ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        {status}
                    </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg flex-1 border border-white/5">
                    <h2 className="text-xl mb-2 font-medium">Connect to Peer</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={remotePeerId}
                            onChange={(e) => setRemotePeerId(e.target.value)}
                            placeholder="Enter Peer ID"
                            className="bg-black/20 border border-white/10 rounded px-3 py-2 flex-1 outline-none focus:border-amber-500 transition-colors text-sm"
                        />
                        <button
                            onClick={connectToHost}
                            className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded transition-colors text-sm font-medium"
                        >
                            Connect
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={startHosting}
                    className={`px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${isHost ? 'bg-green-600 shadow-green-900/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'}`}
                >
                    {isHost ? 'Hosting Active' : 'Start Hosting'}
                </button>
            </div>

            <div className="flex-1 bg-black/40 rounded-xl overflow-hidden relative border border-white/5 shadow-inner">
                {!isHost && (
                    <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        onMouseMove={handleMouseMove}
                        onMouseDown={handleClick}
                        onContextMenu={(e) => e.preventDefault()}
                    />
                )}
                {isHost && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                            <span className="text-2xl">📡</span>
                        </div>
                        <p>Sharing your screen...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
