import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
    open: boolean
    cancelText?: string
    okText?: string
    onCancel?: () => void
    onOk?: () => void
    footer?: ReactNode
    children?: ReactNode
}

const Modal = ({ open, cancelText, okText, onCancel, onOk, footer, children }: ModalProps) => {
    if (!open) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 text-left align-middle shadow-xl transition-all animate-in zoom-in-95 duration-200">

                {/* Content */}
                <div className="mt-2">
                    {children}
                </div>

                {/* Footer */}
                {footer === undefined ? (
                    <div className="mt-6 flex justify-end gap-3">
                        {cancelText && (
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors"
                                onClick={onCancel}
                            >
                                {cancelText}
                            </button>
                        )}
                        {okText && (
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-lg border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-colors shadow-lg shadow-amber-900/20"
                                onClick={onOk}
                            >
                                {okText}
                            </button>
                        )}
                    </div>
                ) : (
                    footer
                )}
            </div>
        </div>,
        document.body
    )
}

export default Modal
