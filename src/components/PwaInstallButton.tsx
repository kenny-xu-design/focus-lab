import { Download, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { requestPwaInstall, usePwaInstall } from '../utils/pwaInstall'

export default function PwaInstallButton() {
  const { installed } = usePwaInstall()
  const [help, setHelp] = useState(false)
  const [busy, setBusy] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const installUrl = `${window.location.origin}/launcher`

  useEffect(() => {
    if (help && !dialog.current?.open) dialog.current?.showModal()
    if (!help && dialog.current?.open) dialog.current?.close()
  }, [help])

  const install = async () => {
    setBusy(true)
    const result = await requestPwaInstall()
    setBusy(false)
    if (result === 'manual') { setCopyStatus(''); setHelp(true) }
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(installUrl); setCopyStatus('启动器网址已复制，请在系统浏览器打开。') }
    catch { setCopyStatus('无法自动复制，请选择下方网址手动复制。') }
  }

  if ('__TAURI__' in window || '__TAURI_INTERNALS__' in window) return null
  if (installed) return <button className="install-button installed" type="button" disabled>已安装</button>

  return <>
    <button className="install-button" type="button" onClick={install} disabled={busy}><Download size={16} aria-hidden="true" />{busy ? '正在打开…' : '安装应用'}</button>
    <dialog ref={dialog} className="pwa-install-dialog" aria-labelledby={titleId} onCancel={() => setHelp(false)} onClose={() => setHelp(false)}>
      <div className="pwa-dialog-heading"><h2 id={titleId}>安装 Focus Lab</h2><button className="button ghost compact" type="button" aria-label="关闭安装说明" onClick={() => setHelp(false)}><X size={20} aria-hidden="true" /></button></div>
      <p>安装后从主屏幕或桌面打开训练启动器。首次请联网加载完成，之后可以离线训练。</p>
      <p>不同设备、浏览器与安装版的记录可能分别保存在本地，目前不会自动同步。</p>
      <ul className="pwa-platform-list">
        <li><strong>Android 手机</strong><span>用 Chrome 打开网址，在菜单中选择“安装应用”或“添加到主屏幕”；出现安装提示时也可直接安装。</span></li>
        <li><strong>iPhone / iPad</strong><span>用 Safari 打开网址，点“分享”→“添加到主屏幕”；如有“作为网页 App 打开”选项，请保持开启，再点“添加”。</span></li>
        <li><strong>Windows / Mac 电脑</strong><span>用 Chrome 或 Edge 打开网址，点击地址栏的安装图标，或在浏览器菜单中选择安装此网站为应用。</span></li>
        <li><strong>Mac Safari</strong><span>在支持网页 App 的 macOS 上，选择“文件”→“添加到程序坞”。</span></li>
      </ul>
      <p>如果当前是应用内浏览器，请复制网址到上面的系统浏览器操作。安装选项由浏览器提供，未出现自动提示时可使用浏览器菜单。</p>
      {['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) && <p>当前是本机预览地址，手机无法用它访问这台电脑。手机安装请使用发布后的 HTTPS 网址。</p>}
      {!window.isSecureContext && <p>当前连接不支持应用安装，请改用此网站的 HTTPS 网址。</p>}
      <label className="field-label" htmlFor={`${titleId}-url`}>启动器网址</label><input className="text-input" id={`${titleId}-url`} value={installUrl} readOnly />
      <button className="button" type="button" onClick={copy}>复制启动器网址</button><p className="pwa-copy-status" role="status">{copyStatus}</p>
    </dialog>
  </>
}
