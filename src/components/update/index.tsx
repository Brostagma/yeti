import type { ProgressInfo } from 'electron-updater'
import { useCallback, useEffect, useState } from 'react'
import Modal from '@/components/update/Modal'
import Progress from '@/components/update/Progress'

const Update = () => {
  const [checking, setChecking] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [versionInfo, setVersionInfo] = useState<VersionInfo>()
  const [updateError, setUpdateError] = useState<ErrorType>()
  const [progressInfo, setProgressInfo] = useState<Partial<ProgressInfo>>()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [modalBtn, setModalBtn] = useState<{
    cancelText?: string
    okText?: string
    onCancel?: () => void
    onOk?: () => void
  }>({
    onCancel: () => setModalOpen(false),
    onOk: async () => {
      try {
        await window.ipcRenderer.invoke('start-download')
      } catch (error: any) {
        setUpdateError({ message: error?.message || 'Failed to start download', error })
      }
    },
  })

  const checkUpdate = async () => {
    setChecking(true)
    try {
      const result = await window.ipcRenderer.invoke('check-update')
      setProgressInfo({ percent: 0 })

      // Only open modal if there is an error or update available
      if (result?.error) {
        setUpdateAvailable(false)
        setUpdateError(result?.error)
        setModalOpen(true)
      }
    } catch (error: any) {
      setUpdateAvailable(false)
      setUpdateError({ message: error?.message || 'Failed to check for updates', error })
      setModalOpen(true)
    } finally {
      setChecking(false)
    }
  }

  const onUpdateCanAvailable = useCallback((_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
    setVersionInfo(arg1)
    setUpdateError(undefined)
    if (arg1.update) {
      setModalBtn(state => ({
        ...state,
        cancelText: 'Later',
        okText: 'Update Now',
        onOk: () => window.ipcRenderer.invoke('start-download'),
      }))
      setUpdateAvailable(true)
      setModalOpen(true)
    } else {
      setUpdateAvailable(false)
    }
  }, [])

  const onUpdateError = useCallback((_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
    setUpdateAvailable(false)
    setUpdateError(arg1)
    setModalOpen(true)
  }, [])

  const onDownloadProgress = useCallback((_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
    setProgressInfo(arg1)
  }, [])

  const onUpdateDownloaded = useCallback((_event: Electron.IpcRendererEvent, ...args: any[]) => {
    setProgressInfo({ percent: 100 })
    setModalBtn(state => ({
      ...state,
      cancelText: 'Later',
      okText: 'Restart Now',
      onOk: async () => {
        try {
          await window.ipcRenderer.invoke('quit-and-install')
        } catch (error: any) {
          setUpdateError({ message: error?.message || 'Failed to restart', error })
        }
      },
    }))
  }, [])

  useEffect(() => {
    window.ipcRenderer.on('update-can-available', onUpdateCanAvailable)
    window.ipcRenderer.on('update-error', onUpdateError)
    window.ipcRenderer.on('download-progress', onDownloadProgress)
    window.ipcRenderer.on('update-downloaded', onUpdateDownloaded)

    return () => {
      window.ipcRenderer.off('update-can-available', onUpdateCanAvailable)
      window.ipcRenderer.off('update-error', onUpdateError)
      window.ipcRenderer.off('download-progress', onDownloadProgress)
      window.ipcRenderer.off('update-downloaded', onUpdateDownloaded)
    }
  }, [])

  return (
    <>
      <Modal
        open={modalOpen}
        cancelText={modalBtn?.cancelText}
        okText={modalBtn?.okText}
        onCancel={modalBtn?.onCancel}
        onOk={modalBtn?.onOk}
        footer={updateAvailable && !updateError ? null : undefined}
      >
        <div className="space-y-4">
          {updateError ? (
            <div className="text-center">
              <div className="text-red-500 text-xl mb-2">⚠️</div>
              <h3 className="text-lg font-medium text-white">Update Failed</h3>
              <p className="text-sm text-gray-400 mt-1">{updateError.message}</p>
            </div>
          ) : updateAvailable ? (
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-1">New Version Available</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">v{versionInfo?.version}</span>
                <span>→</span>
                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold">v{versionInfo?.newVersion}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 uppercase tracking-wider">
                  <span>Downloading...</span>
                  <span>{Math.round(progressInfo?.percent || 0)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300 ease-out"
                    style={{ width: `${progressInfo?.percent || 0}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Download complete. Restart to apply changes.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-300">Checking for updates...</p>
            </div>
          )}
        </div>
      </Modal>

      <button
        disabled={checking}
        onClick={checkUpdate}
        className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-xs transition-all border border-white/5 hover:border-white/10 flex items-center gap-2"
      >
        {checking ? (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Checking...
          </>
        ) : (
          <>
            <span className="text-amber-500">↻</span>
            Check for Updates
          </>
        )}
      </button>
    </>
  )
}

export default Update
