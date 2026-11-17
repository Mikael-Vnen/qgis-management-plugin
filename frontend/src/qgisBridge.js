let bridgePromise = null

export function qgisGetProjectBridge() {
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


async function withTimeout(operation, timeoutMs = 10000) {
  let timeoutId

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`QGIS request timed out after ${timeoutMs / 1000} seconds.`))
    }, timeoutMs)
  })

  try {
    return await Promise.race([
      Promise.resolve().then(operation),
      timeout,
    ])
  } finally {
    clearTimeout(timeoutId)
  }
}


export async function refreshPlugin(pluginName) {

  if (typeof pluginName !== 'string') {
    return 'Wrong dtype'
  }
  
  return withTimeout(async () => {
    const bridge = await qgisGetProjectBridge()

    return new Promise((resolve) => {
      bridge.b_refresh_plugin(pluginName, resolve)
    })
  })
}


export async function qgisListCurrentLayers() {
  return withTimeout(async () => {
    const bridge = await qgisGetProjectBridge()

    return new Promise((resolve) => {
      bridge.b_list_current_layers(resolve)
    })
  })
}


export async function qgisGetFieldsFromLayer(layerId) {

  if (typeof layerId !== 'string' || layerId.trim() === '') {
    throw new TypeError('Select a layer before requesting its fields.')
  }

  return withTimeout(async () => {
    const bridge = await qgisGetProjectBridge()

    return new Promise((resolve) => {
      bridge.b_list_vector_layer_fields(layerId, resolve)
    })
  })
}


export async function qgisReadFieldSettings(layerId, fieldNames, settingKeys) {
  if (typeof layerId !== 'string' || layerId.trim() === '') {
    throw new TypeError('Select a layer before requesting field settings.')
  }

  if (
    !Array.isArray(fieldNames) ||
    fieldNames.length === 0 ||
    fieldNames.some(name => typeof name !== 'string' || name.trim() === '')
  ) {
    throw new TypeError('Provide at least one valid field name.')
  }

  if (
    !Array.isArray(settingKeys) ||
    settingKeys.length === 0 ||
    settingKeys.some(key => typeof key !== 'string' || key.trim() === '')
  ) {
    throw new TypeError('Provide at least one valid setting key.')
  }

  return withTimeout(async () => {
    const bridge = await qgisGetProjectBridge()

    return new Promise((resolve) => {
      bridge.b_get_field_settings(
        layerId,
        fieldNames,
        settingKeys,
        resolve,
      )
    })
  })
}


export async function qgisSetFieldDefault(layerId, fieldName, expression, applyOnUpdate,) {
  if (
    [layerId, fieldName].some(
      value => typeof value !== 'string' || value.trim() === '',
    )
  ) {
    throw new TypeError('Select a layer and a field.')
  }

  if (typeof expression !== 'string' || typeof applyOnUpdate !== 'boolean') {
    throw new TypeError('Expected an expression string and an update flag.')
  }

  return withTimeout(async () => {
    const bridge = await qgisGetProjectBridge()

    return new Promise((resolve) => {
      bridge.b_set_field_default(
        layerId, fieldName, expression, applyOnUpdate, resolve,
      )
    })
  })
}
