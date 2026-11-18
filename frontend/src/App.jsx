import { 
  useState,
  useEffect, 
  useCallback 
} from 'react'

import { 
  qgisGetFieldsFromLayer, 
  qgisListCurrentLayers,
  refreshPlugin, 
} from './qgisBridge.js'

import DefaultValueEditor from './features/field-settings/DefaultValueEditor.jsx'
import useProjectLayers from './features/project/useProjectLayers.js'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false)
  const [refreshError, setReError] = useState('')
  
  const busy = layersLoading || loading
  const {
    layers,
    loading: layersLoading,
    error: layerError,
    refreshLayers,
  } = useProjectLayers()


  // layer fields & related properties
  const [fields, setFields] = useState(null)
  const [fieldError, setFieldError] = useState('')
  const [selectedLayerFields, setSelectedLayerFields] = useState('')

  // layer field defaults & related properties
  const [selectedFieldDefault, setSelectedFieldDefault] = useState('')

  async function getFields() {
    
    if (!selectedLayerFields) {
      setFieldError('Layer not selected')
      return
    } 
    
    setLoading(true)
    setFieldError('')

    try {
      const result = await qgisGetFieldsFromLayer(selectedLayerFields)
      if (result.error !== null) {
        setFields(null)
        setFieldError(result.error)
      } else {
        setFields(result.fields)
      }
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function callRefresh() {
    
    setReError('')
    const pluginName = 'qgis_management'
    try {
      const result = await refreshPlugin(pluginName)
      
      if (result == 'False'){
        setReError('Refresh returned false')
      } else {
        setReError(result)
      }
    } catch (err) {
      setReError(err instanceof Error ? err.message : String(err))
    } 
  }

  useEffect(() => {
    if (layers === null || !selectedLayerFields) return

    const selectedLayerExists = layers.some(
      layer => layer.id === selectedLayerFields
    )

    if (!selectedLayerExists) {
      setSelectedLayerFields('')
      setSelectedFieldDefault('')
      setFields(null)
      setFieldError('')
    }
  }, [layers, selectedLayerFields])

  return (
    <>
      <section id="refresh-button">
        <button type="button" onClick={callRefresh}> 
          Reload plugin 
        </button>
        {refreshError && <p role="alert" className='error-text'> {refreshError}</p>}
      </section>

      <section id="project-layers">
        <h2>Project layers</h2>

        <button type="button" onClick={refreshLayers} disabled={busy}>
          {layersLoading ? 'Loading…' : 'Refresh layers'}
        </button>

        {layerError  && <p role="alert">{layerError }</p>}

        {layers === null ? (
          <p>
            {layersLoading
              ? 'Loading layers…'
              : 'Layers could not be loaded. Try refreshing.'}
          </p>
        ) : layers.length === 0 ? (
          <p className='error-text'>
            The project has no layers, or you don't have project opened.
          </p>
        ) : (
          <ul>
            {layers.map((layer) => (
              <li key={layer.id}> {layer.name} - <code>{layer.id}</code> </li>
            ))}
          </ul>
        )}
      </section>

      <label htmlFor="layer-select">Layer selection</label>
      <select
        id="layer-select"
        value={selectedLayerFields}
        disabled={busy || !layers?.length}
        onChange={(event) => {
          setSelectedLayerFields(event.target.value)
          setSelectedFieldDefault('')
          setFields(null)
          setFieldError('')
        }}
      >
        <option value="">Select a layer…</option>

        {(layers ?? []).map((layer) => (
          <option key={layer.id} value={layer.id}>
            {layer.name}
          </option>
        ))}
      </select>

      <section id="layer-fields">
        <h2>Layer fields</h2>

        <button type="button" onClick={getFields} disabled={busy}>
          {loading ? 'Loading…' : 'Get fields'}
        </button>

        {fieldError && <p id="layer-fields-error" className="error-text" role="alert"> {fieldError}</p>}

        {fields === null ? (
          <p>Get fields for a particular field.</p>
        ) : fields.length === 0 ? (
          <p>No fields, or error.</p>
        ) : (
          <ul>
            {fields.map((field) => (
              <li key={field.name}> {field.name} - <code>{field.type}</code> </li>
            ))}
          </ul>
        )}
      </section>

      <label htmlFor="field-select-default">Field selection</label>
      <select
        id="field-select-default"
        value={selectedFieldDefault}
        disabled={busy || !fields?.length}
        onChange={(event) => {setSelectedFieldDefault(event.target.value)}}
      >
        <option value="">Select a field…</option>

        {(fields ?? []).map((field) => (
          <option key={field.name} value={field.name}>
            {field.name}
          </option>
        ))}
      </select>

      <DefaultValueEditor
        key={JSON.stringify([selectedLayerFields, selectedFieldDefault])}
        layerId={selectedLayerFields}
        fieldName={selectedFieldDefault}
        loading={busy}
        onLoadingChange={setLoading}
      />
    </>
  )
}

export default App
