from qgis.PyQt.QtCore import (
    QObject, 
    pyqtSlot
)

from qgis.core import (
    QgsProject,
    QgsVectorLayer
)

from qgis.utils import plugins, reloadPlugin
from .field_settings import p_read_field_settings, p_set_field_default

class ProjectBridge(QObject):

    @pyqtSlot(result="QVariantList")
    def b_list_current_layers(self):

        project_layers = []

        for layer in QgsProject.instance().mapLayers().values():
            layer_dict = {
                "name": layer.name(),
                "id": layer.id()
            }
        
            project_layers.append(layer_dict)

        return project_layers 


    @pyqtSlot(str, result="QVariantMap")
    def b_list_vector_layer_fields(self, layer_id: str):

        layer_fields = []

        print(layer_id)
        # Only vector layer supported atm
        if isinstance((target_layer := QgsProject.instance().mapLayer(layer_id)), QgsVectorLayer):
            for field in target_layer.fields():

                field_dict = {
                    "name": field.name(),
                    "type": field.typeName()
                }
            
                layer_fields.append(field_dict)

            print(layer_fields)
            return {"fields":layer_fields, "error": None}

        elif target_layer == None:
            return {"fields": [], "error": "Layer for that ID not found or you don't have a project open"}
            
        else:
            return {"fields": [], "error": f"Unsupported layer type: {str(target_layer)}"}


    @pyqtSlot(str, "QStringList", "QStringList", result="QVariantMap")
    def b_get_field_settings(self, layer_id, field_names, setting_keys):
        return p_read_field_settings(
            QgsProject.instance(), layer_id, field_names, setting_keys
        )


    @pyqtSlot(str, str, str, bool, result="QVariantMap")
    def b_set_field_default(self, layer_id, field_name, expression, apply_on_update):
        return p_set_field_default(
            QgsProject.instance(), layer_id, field_name, expression, apply_on_update
        )


    @pyqtSlot(str, result=str)
    def b_refresh_plugin(self, plugin_name):
        
        if not isinstance(plugin_name, str):
            return f"Type error: Expected type string for plugin_name, got {type(plugin_name)}"
        
        if plugin_name == '':
            return "Empty field passed as plugin name"
        
        result = reloadPlugin(plugin_name)

        if result:
            plugin = plugins[plugin_name]
            plugin.open_window()

        return(str(result))

        






