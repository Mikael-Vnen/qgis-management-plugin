import { useEffect, useState } from 'react'
import { qgisGetFieldsFromLayer } from '../../qgisBridge.js'
import DefaultValueEditor from '../field-settings/DefaultValueEditor.jsx'

export default function LayerPage({ layer, onBack }) {
  const [fields, setFields] = useState(null)
  const [error, setError] = useState('')
  const [fieldName, setFieldName] = useState('')
  const [editorBusy, setEditorBusy] = useState(false)

  useEffect(() => {
    let active = true

    async function loadFields() {
      try {
        const result = await qgisGetFieldsFromLayer(layer.id)

        if (result.error !== null) throw new Error(result.error)
        if (!Array.isArray(result.fields)) {
          throw new TypeError('QGIS returned an invalid field list.')
        }

        if (active) setFields(result.fields)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : String(err))
        }
      }
    }

    loadFields()

    return () => {
      active = false
    }
  }, [layer.id])

  return (
    <section id="layer-fields">
      <button type="button" onClick={onBack} disabled={editorBusy}>
        Back to layers
      </button>
      <h2>{layer.name}</h2>

      {error && <p role="alert">{error}</p>}
      {!error && fields === null && <p role="status">Loading fields…</p>}
      {fields?.length === 0 && <p>This layer has no fields.</p>}

      {fields?.length > 0 && (
        <ul>
          {fields.map(field => (
            <li key={field.name}>
              <button
                type="button"
                onClick={() => setFieldName(field.name)}
                disabled={editorBusy}
              >
                {field.name}
              </button>{' '}
              <code>{field.type}</code>
            </li>
          ))}
        </ul>
        
      )}

      {fieldName && (
        <DefaultValueEditor
          key={fieldName}
          layerId={layer.id}
          fieldName={fieldName}
          loading={editorBusy}
          onLoadingChange={setEditorBusy}
        />
      )}
    </section>
  )
}
