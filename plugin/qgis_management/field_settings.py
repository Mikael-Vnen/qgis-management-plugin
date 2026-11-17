from qgis.core import QgsVectorLayer
from qgis.core import QgsDefaultValue, QgsExpression

def c_read_default_value(layer: QgsVectorLayer, field_index: int) -> dict | None:
    rule = layer.defaultValueDefinition(field_index)

    if not rule.isValid():
        return None

    return {
        "expression": rule.expression(),
        "applyOnUpdate": rule.applyOnUpdate(),
    }


FIELD_SETTING_READERS = {"defaultValue": c_read_default_value}


def p_read_field_settings(project, layer_id, field_names, setting_keys):
    
    layer = project.mapLayer(layer_id)
    if layer is None:
        return {"settings": {}, "error": "The selected layer does not exists."}
    if not isinstance(layer, QgsVectorLayer) or not layer.isValid():
        return {"settings": {}, "error": "Select a valid vector layer"}
    if not field_names:
        return {"settings": {}, "error": "Field selection not passed properly"}
    if not setting_keys:
        return {"settings": {}, "error": "Settings selection not passed properly"}
    
    for key in setting_keys:
        if key not in FIELD_SETTING_READERS:
            return {"settings": {}, "error": f"Unknown field setting: {key}"}

    fields = layer.fields()
    indices = {name: fields.indexFromName(name) for name in field_names}
    for name, index in indices.items():
        if index < 0:
            return {"settings": {}, "error": f"Field {name} does not exist"}

    settings = {}
    for name, index in indices.items():
        settings[name] = {
            key: FIELD_SETTING_READERS[key](layer, index)
            for key in setting_keys
        }

    return {"settings": settings, "error": None}


def p_set_field_default(project, layer_id, field_name, expression, apply_on_update = False):

    layer = project.mapLayer(layer_id)
    if layer is None:
        return {"settings": {}, "error": "The selected layer does not exists."}
    if not isinstance(layer, QgsVectorLayer) or not layer.isValid():
        return {"settings": {}, "error": "Select a valid vector layer"}
    if not field_name:
        return {"settings": {}, "error": "Field selection not passed properly"}
    if not expression:
        return {"settings": {}, "error": "Field default value not passed properly"}
    if apply_on_update == None:
        return {"settings": {}, "error": "Apply on update not passed properly"}

    if expression.strip():
        parsed_expression = QgsExpression(expression)
        if parsed_expression.hasParserError():
            return {
                "settings": {},
                "error": parsed_expression.parserErrorString(),
            }
        definition = QgsDefaultValue(expression, apply_on_update)
    else:
        definition = QgsDefaultValue()

    layer_fields = layer.fields()

    field_index = layer_fields.indexFromName(field_name)

    layer.setDefaultValueDefinition(field_index, definition)
    project.setDirty(True)

    return {
        "settings": {field_name: {"defaultValue": c_read_default_value(layer, field_index),}},
        "error": None,
    }

    
