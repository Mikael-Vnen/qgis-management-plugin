from qgis.core import QgsApplication, QgsProject, QgsVectorLayer, QgsRasterLayer
from qgis_management.bridge import ProjectBridge


def get_feature_attr(project):
    """
    Left over from testing container env, but ill leave this since Ill probably implement something similar.
    """

    for layer in project.mapLayers().values():

        # Raster layers atm cause issues (atleast the openstreetmap one) due to the way they are handled.
        # WIP find a way to handle these without simple filtering them out.
        if isinstance(layer, QgsRasterLayer):
            continue

        features = layer.getFeatures()
            
        for field in features:
            print(field.attributes())

        print("===================================")



def read_project(project_name: str ):

    QgsApplication.setPrefixPath('C:/PROGRA~1/QGIS34~1.7/apps/qgis', True)
    bridge = ProjectBridge()

    app = QgsApplication([], False)
    app.initQgis()

    project = QgsProject.instance()
    assert project.read(project_name), "Failed to load project"

    print(bridge.list_layers())

    app.exitQgis()


def main():
    app = QgsApplication([], False)
    app.initQgis()

    project = QgsProject.instance()

    try:
        bridge = ProjectBridge()

        # An empty project should return an empty list.
        assert bridge.list_layers() == []

        # Create a temporary layer without needing a data file.
        layer = QgsVectorLayer(
            "Point?crs=EPSG:3067",
            "Test locations",
            "memory",
        )
        assert layer.isValid(), "Failed to create the test layer"

        project.addMapLayer(layer)

        expected = [{"name": "Test locations", "id": layer.id()}]
        actual = bridge.list_layers()

        assert actual == expected, f"Expected {expected}, got {actual}"
        print("Both checks passed.")

    finally:
        project.removeAllMapLayers()
        app.exitQgis()


if __name__ == "__main__":
    main()
