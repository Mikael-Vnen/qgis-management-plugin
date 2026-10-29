let bridgePromise = null

export function getProjectBridge() {
  if (bridgePromise !== null) {
    return bridgePromise
  }

  const transport = window.qt?.webChannelTransport

  if (!transport || typeof window.QWebChannel !== 'function') {
    return Promise.reject(new Error('QGIS connection unavailable'))
  }

  bridgePromise = new Promise((resolve, reject) => {
    new window.QWebChannel(transport, (channel) => {
      const bridge = channel.objects.projectBridge

      if (!bridge) {
        reject(new Error('projectBridge is not registered'))
        return
      }

      resolve(bridge)
    })
  })

  return bridgePromise
}


export async function listLayers() {
  const bridge = await getProjectBridge()

  return new Promise((resolve) => {
    bridge.list_layers((layers) => {
      resolve(layers)
    })
  })
}
