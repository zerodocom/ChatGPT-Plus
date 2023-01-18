import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  name: 'ChatGPT Plus',
  description: 'A browser plugin that enhances the ability of ChatGPT',
  version: '1.0.2',
  manifest_version: 3,
  icons: {
    16: 'img/logo.png',
    32: 'img/logo.png',
    48: 'img/logo.png',
    128: 'img/logo.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo.png',
  },
  options_page: 'options.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/content/index.ts'],
    },
  ],
  permissions: ["contextMenus"],
  host_permissions: ["http://*/", "https://*/"],
})
