from qgis.PyQt.QtCore import (
    QObject, 
    pyqtSlot
)

from qgis.core import (
    QgsProject,
)


class ProjectBridge(QObject):

    @pyqtSlot(result="QVariantList")
    def list_layers(self):

        project_layers = []

        for layer in QgsProject.instance().mapLayers().values():
            layer_dict = {
                "name": layer.name(),
                "id": layer.id()
            }
        
            project_layers.append(layer_dict)

        return project_layers 
