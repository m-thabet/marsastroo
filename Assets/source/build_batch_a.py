"""Run in Blender's Scripting workspace, not in a normal Python interpreter.

Default: only a representative Habitat. Set BUILD = 'batch-a' for the terrain,
Habitat, SolarArray and LifeSupport after reviewing the Habitat preview.
Uses a NEW temporary scene. Existing output filenames are skipped.
Produces illustrative procedural drafts, not approved final artwork or NASA data.
"""
import bpy
import json
import math
from pathlib import Path
from mathutils import Vector

# Change only this path if the project is moved to another computer.
ASSETS = Path(r'C:\Users\mahmo\Downloads\marsastro\Assets')
BUILD = 'habitat'  # 'habitat' or 'batch-a'
RENDER_PREVIEWS = True


def material(name, color, metallic=0, roughness=.65):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    return mat


def parent(obj, name, root, mat):
    obj.name = name
    obj.parent = root
    if mat:
        obj.data.materials.append(mat)
    return obj


def box(name, loc, size, root, mat, bevel=.12):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new('SoftEngineeringEdges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return parent(obj, name, root, mat)


def cylinder(name, loc, radius, depth, root, mat, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=depth, location=loc, rotation=rotation)
    return parent(bpy.context.object, name, root, mat)


def habitat(root, mats):
    shell, dark, glass, accent = mats
    box('Body', (0, 0, 2.3), (11.7, 7.7, 4.4), root, shell, .75)
    box('Foundation', (0, 0, .22), (12, 8, .44), root, dark)
    box('Door', (0, -3.89, 1.45), (1.65, .18, 2.6), root, dark)
    box('DoorInset', (0, -4, 1.6), (1.1, .07, 1.4), root, shell, .08)
    for x in [-3.6, -2, 2, 3.6]:
        box(f'Window_{x}', (x, -3.87, 2.75), (1.05, .12, .85), root, glass, .15)
    for x in [-4.3, 4.3]:
        box(f'StructuralRib_{x}', (x, 0, 2.5), (.18, 7.8, 4.8), root, dark, .08)
    box('StatusLight', (.98, -4.02, 2.8), (.22, .06, .13), root, accent, .03)
    box('RoofModule', (0, 0, 4.7), (3.2, 2, .6), root, dark)


def solar(root, mats):
    shell, dark, glass, accent = mats
    box('Frame', (0, 0, .2), (9.8, 5.5, .4), root, dark)
    for label, sign in [('Left', -1), ('Right', 1)]:
        # Parent panel geometry to an Empty located at the hinge.
        pivot = bpy.data.objects.new(f'Panel{label}', None)
        bpy.context.scene.collection.objects.link(pivot)
        pivot.parent = root
        pivot.location = (sign*.2, 0, 2)
        bpy.context.view_layer.update()
        panel = box(f'Panel{label}Surface', (sign*2.6, 0, 2), (4.7, 5.5, .13), root, glass, .04)
        world = panel.matrix_world.copy()
        panel.parent = pivot
        panel.matrix_world = world
        for row in range(1, 5):
            strip = box(f'{label}CellDivider{row}', (sign*2.6, -2.75+row*1.1, 2.08), (4.7, .025, .025), root, shell, 0)
            world = strip.matrix_world.copy()
            strip.parent = pivot
            strip.matrix_world = world
        for y in [-2, 2]:
            cylinder(f'{label}Support{y}', (sign*2.6, y, 1.05), .13, 1.8, root, dark)
    box('StatusLight', (0, -2.8, .6), (.3, .1, .16), root, accent, .03)


def life_support(root, mats):
    shell, dark, glass, accent = mats
    box('Body', (-1.1, .3, 2), (5.5, 5.6, 4), root, shell, .5)
    box('Foundation', (0, 0, .15), (8, 6, .3), root, dark)
    for y in [-1.6, 1.5]:
        cylinder(f'OxygenTank_{y}', (2.5, y, 2), .85, 3.6, root, shell)
        cylinder(f'TankCap_{y}', (2.5, y, 3.85), .65, .14, root, dark)
        cylinder(f'TankPipe_{y}', (1.7, y, 3.1), .1, 1.6, root, dark, (0, math.pi/2, 0))
    cylinder('IntakeHousing', (-1.1, -2.6, 2.7), .9, .22, root, dark, (math.pi/2, 0, 0))
    # A central Empty provides a usable fan pivot in front of its housing.
    fan = bpy.data.objects.new('IntakeFan', None)
    bpy.context.scene.collection.objects.link(fan)
    fan.parent = root
    fan.location = (-1.1, -2.75, 2.7)
    bpy.context.view_layer.update()
    for angle in [0, math.pi/2]:
        blade = box('FanBlade', (-1.1, -2.75, 2.7), (1.4, .06, .15), root, shell, .05)
        blade.rotation_euler[1] = angle
        world = blade.matrix_world.copy()
        blade.parent = fan
        blade.matrix_world = world
    box('StatusLight', (.7, -2.6, 1.8), (.2, .1, .2), root, accent, .03)


def terrain(root, mats):
    steps = 128
    vertices, faces = [], []
    for j in range(steps+1):
        y = (j/steps-.5)*512
        for i in range(steps+1):
            x = (i/steps-.5)*512
            outer = max(0, min(1, (max(abs(x), abs(y))-60)/70))
            height = outer * (6 + 4*math.sin(x*.019)*math.cos(y*.027)+2*math.sin((x+y)*.043))
            route = abs(x) < 12 and 0 < y < 160
            if route:
                height *= min(1, abs(x)/12)**2
            vertices.append((x, y, height))
    for j in range(steps):
        for i in range(steps):
            a = j*(steps+1)+i
            faces.append((a, a+1, a+steps+2, a+steps+1))
    mesh = bpy.data.meshes.new('IllustrativeTerrainMesh')
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new('TerrainSurface', mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = root
    ground = material('IllustrativeMarsGround', (.48, .24, .12), roughness=.95)
    obj.data.materials.append(ground)
    uv = mesh.uv_layers.new(name='UVMap')
    for poly in mesh.polygons:
        for loop_id in poly.loop_indices:
            point = vertices[mesh.loops[loop_id].vertex_index]
            uv.data[loop_id].uv = ((point[0]+256)/32, (point[1]+256)/32)
    texture_path = ASSETS / 'world' / 'mars-ground-basecolor.jpg'
    if texture_path.exists():
        texture = ground.node_tree.nodes.new('ShaderNodeTexImage')
        texture.image = bpy.data.images.load(str(texture_path), check_existing=True)
        texture.image.pack()
        ground.node_tree.links.new(texture.outputs['Color'], ground.node_tree.nodes['Principled BSDF'].inputs['Base Color'])


def preview(scene, root, path, overhead=False):
    points = [obj.matrix_world @ Vector(corner) for obj in root.children_recursive if obj.type == 'MESH' for corner in obj.bound_box]
    center = sum(points, Vector()) / len(points)
    size = max((point-center).length for point in points)*2
    camera_data = bpy.data.cameras.new('PreviewCamera')
    camera = bpy.data.objects.new('PreviewCamera', camera_data)
    scene.collection.objects.link(camera)
    camera.location = center + (Vector((0, -.01, 1)) if overhead else Vector((1, -1.5, 1.05))).normalized() * size*1.25
    camera.rotation_euler = (center-camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = size*1.15
    scene.camera = camera
    scene.render.resolution_x = 1100
    scene.render.resolution_y = 850
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True, scene=scene.name)
    bpy.data.objects.remove(camera, do_unlink=True)


def build_one(slug, root_name, category, creator):
    target = ASSETS/category/f'{slug}.glb'
    source = ASSETS/'source'/f'{slug}-draft.blend'
    if target.exists() or source.exists():
        print(f'SKIP: existing output for {slug}; nothing overwritten')
        return
    previous_scene = bpy.context.window.scene
    existing_objects = set(bpy.data.objects)
    scene = bpy.data.scenes.new(f'MarsAssets_{root_name}')
    bpy.context.window.scene = scene
    try:
        try:
            scene.render.engine = 'BLENDER_EEVEE_NEXT'
        except TypeError:
            scene.render.engine = 'BLENDER_EEVEE'
        scene.world = bpy.data.worlds.new(f'{root_name}PreviewWorld')
        scene.world.use_nodes = True
        scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.15, .17, .19, 1)
        root = bpy.data.objects.new(root_name, None)
        scene.collection.objects.link(root)
        mats = [material('WarmShell', (.8, .77, .67)), material('GraphiteFrame', (.12, .16, .17), metallic=.3),
                material('BluePanel', (.025, .09, .16), metallic=.25, roughness=.4), material('StatusOff', (.18, .28, .18))]
        creator(root, mats)
        bpy.context.view_layer.update()
        bpy.ops.object.select_all(action='DESELECT')
        objects = [root, *root.children_recursive]
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = root
        bpy.ops.export_scene.gltf(filepath=str(target), export_format='GLB', use_selection=True, export_yup=True)
        bounds = [o.matrix_world @ Vector(c) for o in objects if o.type == 'MESH' for c in o.bound_box]
        dimensions = [round(max(p[i] for p in bounds)-min(p[i] for p in bounds), 3) for i in range(3)]
        report = {'root': root_name, 'file': str(target.relative_to(ASSETS)), 'status': 'procedural-draft-awaiting-visual-review',
                  'illustrative': True, 'objects': [o.name for o in objects],
                  'sourceDimensionsXYZMeters': dimensions,
                  'triangles': sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in objects if o.type == 'MESH'),
                  'blenderVersion': bpy.app.version_string}
        (ASSETS/'previews'/f'{slug}-draft-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
        if RENDER_PREVIEWS:
            light_data = bpy.data.lights.new('PreviewSun', 'SUN')
            light_data.energy = 2.5
            light = bpy.data.objects.new('PreviewSun', light_data)
            scene.collection.objects.link(light)
            light.rotation_euler = (.4, -.6, -.4)
            for suffix, top in [('perspective', False), ('top', True)]:
                preview(scene, root, ASSETS/'previews'/f'{slug}-{suffix}.png', top)
            bpy.data.objects.remove(light, do_unlink=True)
        # Saving a COPY does not change the currently open user's .blend path.
        bpy.ops.wm.save_as_mainfile(filepath=str(source), copy=True)
        print(f'CREATED draft: {target}')
    finally:
        bpy.context.window.scene = previous_scene
        bpy.data.scenes.remove(scene)
        for obj in list(bpy.data.objects):
            if obj not in existing_objects:
                bpy.data.objects.remove(obj, do_unlink=True)


def main():
    if BUILD not in {'habitat', 'batch-a'}:
        raise ValueError("BUILD must be 'habitat' or 'batch-a'")
    for folder in ['buildings', 'world', 'source', 'previews']:
        (ASSETS/folder).mkdir(parents=True, exist_ok=True)
    choices = [('habitat', 'Habitat', 'buildings', habitat)]
    if BUILD == 'batch-a':
        choices += [('solar-array', 'SolarArray', 'buildings', solar),
                    ('life-support', 'LifeSupport', 'buildings', life_support),
                    ('mars-region', 'MarsRegion', 'world', terrain)]
    for choice in choices:
        build_one(*choice)


if __name__ == '__main__':
    main()
