import Modal from '@/components/update/Modal'

interface ConnectionModalProps {
    open: boolean
    peerId: string
    onAccept: () => void
    onReject: () => void
}

const ConnectionModal = ({ open, peerId, onAccept, onReject }: ConnectionModalProps) => {
    return (
        <Modal
            open={open}
            cancelText="Reject"
            okText="Accept"
            onCancel={onReject}
            onOk={onAccept}
        >
            <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">Incoming Connection</h3>
                <p className="text-gray-400 mb-4">
                    A remote peer is requesting to connect to your computer.
                </p>
                <div className="bg-white/5 p-3 rounded-lg font-mono text-amber-500 text-sm mb-4">
                    {peerId}
                </div>
                <p className="text-xs text-gray-500">
                    Accepting will allow them to view your screen and control your mouse/keyboard.
                </p>
            </div>
        </Modal>
    )
}

export default ConnectionModal
