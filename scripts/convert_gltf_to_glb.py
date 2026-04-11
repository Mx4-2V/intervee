import sys
from pathlib import Path

import bpy


def parse_args() -> tuple[Path, Path]:
    argv = sys.argv

    if "--" not in argv:
        raise SystemExit("Expected Blender args after '--'")

    args = argv[argv.index("--") + 1 :]
    if len(args) != 2:
        raise SystemExit("Usage: blender -b --python convert_gltf_to_glb.py -- input.gltf output.glb")

    input_path = Path(args[0]).resolve()
    output_path = Path(args[1]).resolve()

    if not input_path.exists():
        raise SystemExit(f"Input file not found: {input_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    return input_path, output_path


def main() -> None:
    input_path, output_path = parse_args()

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(input_path))
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        use_selection=False,
    )


if __name__ == "__main__":
    main()
