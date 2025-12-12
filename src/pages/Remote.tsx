import { useState, useEffect, useRef } from 'react'
import Peer, { DataConnection, MediaConnection } from 'peerjs'

export default function Remote() {
    const [peerId, setPeerId] = useState<string>('')
    const [remotePeerId, setRemotePeerId] = useState<string>('')
    const [status, setStatus] = useState<string>('Disconnected')
    const [isHost, setIsHost] = useState<boolean>(false)

    const peerRef = useRef<Peer | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const connRef = useRef<DataConnection | null>(null)

    useEffect(() => {
        const peer = new Peer()
        peerRef.current = peer

        peer.on('open', (id) => {
            setPeerId(id)
            setStatus('Ready')
        })

        peer.on('call', async (call) => {
            // Incoming call (We are the client viewing the host, or host receiving?)
            // Actually, usually Host shares screen. Client calls Host? Or Host calls Client?
            // Let's say: Host (shares screen) waits for connection. Client connects to Host.
            // So Client calls Host. Host answers with stream.

            // Wait, if Host shares screen, Host should provide the stream.
            // So Client calls Host. Host answers and provides stream.

            // But peerjs `answer` takes a stream.
            // So if Client calls Host, Host must have stream ready.

            // Let's implement: Host clicks "Start Hosting", gets stream.
            // Then Client connects to Host ID.

            // If we are Host:
            if (isHost) {
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: true,
                        audio: false
                    })
                    call.answer(stream)
                    setStatus('Streaming...')
                } catch (err) {
                    console.error('Failed to get display media', err)
                }
            } else {
                // We are client, we shouldn't be receiving calls usually, but maybe bidirectional?
                call.answer()
            }
        })

        peer.on('connection', (conn) => {
            // Data connection
            connRef.current = conn
            conn.on('data', (data: any) => {
                // Received data (Input events)
                // Send to main process
                if (window.ipcRenderer) {
                    try {
                        const event = JSON.parse(data)
                        window.ipcRenderer.send('input-event', event)
                    } catch (e) {
                        console.error('Failed to parse input event', e)
                    }
                }
            })
            conn.on('open', () => {
                setStatus('Connected')
            })
        })

        return () => {
            peer.destroy()
        }
    }, [isHost])

    const startHosting = async () => {
        setIsHost(true)
        setStatus('Waiting for connection...')
    }

    const connectToHost = () => {
        if (!peerRef.current || !remotePeerId) return

        const conn = peerRef.current.connect(remotePeerId)
        connRef.current = conn

        conn.on('open', () => {
            setStatus('Connected to Host')
        })

        // Call for video
        const call = peerRef.current.call(remotePeerId, new MediaStream())
        call.on('stream', (remoteStream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = remoteStream
                videoRef.current.play()
            }
        })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isHost) return // Host doesn't send events to self
        if (!connRef.current) return

        // Calculate relative coordinates? Or absolute?
        // For simplicity, send screen coordinates if possible, or relative to video element
        // But we need to map to host screen size.
        // For MVP, let's send raw client coordinates and let host handle scaling or just assume full screen.
        // Actually, `enigo` takes absolute coordinates.
        // We need to know host screen size.
        // Let's just send clientX/clientY and assume full screen for now.

        const event = {
            type: 'MouseMove',
            payload: {
                x: Math.round(e.clientX),
                y: Math.round(e.clientY)
            }
        }
        connRef.current.send(JSON.stringify(event))
    }

    const handleClick = (e: React.MouseEvent) => {
        if (isHost) return
        if (!connRef.current) return

        const buttonMap: Record<number, string> = { 0: 'left', 1: 'middle', 2: 'right' }
        const event = {
            type: 'MouseClick',
            payload: {
                button: buttonMap[e.button] || 'left'
            }
        }
        connRef.current.send(JSON.stringify(event))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isHost) return
        if (!connRef.current) return

        const event = {
            type: 'KeyPress',
            payload: {
                key: e.key
            }
        }
        connRef.current.send(JSON.stringify(event))
    }

    return (
        <div className="h-full flex flex-col p-6 text-white" onKeyDown={handleKeyDown} tabIndex={0}>
            <h1 className="text-2xl font-bold mb-6">Remote Desktop</h1>

            <div className="flex gap-4 mb-6">
                <div className="bg-white/5 p-4 rounded-lg flex-1">
                    <h2 className="text-xl mb-2">Your ID</h2>
                    <div className="text-green-400 font-mono text-lg">{peerId || 'Generating...'}</div>
                    <div className="mt-2 text-sm text-gray-400">Status: {status}</div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg flex-1">
                    <h2 className="text-xl mb-2">Connect to Peer</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={remotePeerId}
                            onChange={(e) => setRemotePeerId(e.target.value)}
                            placeholder="Enter Peer ID"
                            className="bg-black/20 border border-white/10 rounded px-3 py-2 flex-1 outline-none focus:border-amber-500"
                        />
                        <button
                            onClick={connectToHost}
                            className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded transition-colors"
                        >
                            Connect
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={startHosting}
                    className={`px-6 py-3 rounded font-bold transition-colors ${isHost ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isHost ? 'Hosting Active' : 'Start Hosting'}
                </button>
            </div>

            <div className="flex-1 bg-black/40 rounded-lg overflow-hidden relative border border-white/5">
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
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Sharing your screen...
                    </div>
                )}
            </div>
        </div>
    )
}
