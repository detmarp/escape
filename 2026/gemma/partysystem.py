import json
from pathlib import Path
from typing import Any

import pygame

from partydata import Sprite, Stamp
from partymodel import PartyModel
from partytree import Partytree


class PartySystem:
  def __init__(self, surface: Any) -> None:
    self.model = PartyModel()
    self.tree = Partytree(surface)

  def load_json_file(self, file_path: str) -> bool:
    path = Path(file_path)
    self.model.active_path = str(path)

    json_leaf_name = path.name.lower()
    if not self.model.getImage(json_leaf_name):
      png_path = path.with_suffix(".png")
      if png_path.exists():
        try:
          image = pygame.image.load(str(png_path))
          self.model.setImage(json_leaf_name, image)
          self.model.setImage(png_path.name.lower(), image)
          self.model.getImage(json_leaf_name)
        except Exception as exc:
          self.model.set_error(str(exc).splitlines()[0])
          return False

    if not path.exists():
      self.model.set_error("file does not exist")
      return False

    try:
      payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
      self.model.set_error(str(exc).splitlines()[0])
      return False

    if not isinstance(payload, dict):
      self.model.set_error("root json value must be an object")
      return False

    if not self._parse_sprites_from_payload(path, payload, json_leaf_name):
      return False

    self.model.set_loaded(str(path), payload)
    return True

  def _parse_sprites_from_payload(
    self,
    path: Path,
    payload: dict[str, Any],
    image_name: str,
  ) -> bool:
    sprites_value = payload.get("sprites")
    if sprites_value is None:
      return True

    if not isinstance(sprites_value, list):
      self.model.set_error("sprites must be an array")
      return False

    self.model.clearSpriteData()

    basename = path.stem
    for index, item in enumerate(sprites_value):
      item_obj = item if isinstance(item, dict) else {}

      label_value = item_obj.get("label")
      if isinstance(label_value, str) and label_value.strip():
        label = label_value.strip()
      else:
        label = f"{basename}.{index}"

      source = self._read_int_list(item_obj.get("source"), [0, 0, 16, 16])
      origin = self._read_int_list(item_obj.get("origin"), [0, 0])

      columns = self._read_int(item_obj.get("columns"), 1)
      if columns < 1:
        columns = 1
      frame = self._read_int(item_obj.get("frame"), 0)
      if frame < 0:
        frame = 0

      base_x = source[0]
      base_y = source[1]
      stamp_w = source[2]
      stamp_h = source[3]

      for col in range(columns):
        stamp_index = frame + col
        stamp_source = [base_x + (col * stamp_w), base_y, stamp_w, stamp_h]
        stamp = Stamp(source=stamp_source, origin=origin.copy())
        self.model.setSpriteStamp(label, stamp_index, stamp, image_name=image_name)

    return True

  def _read_int(self, value: Any, default: int) -> int:
    if isinstance(value, (int, float)):
      return int(value)
    return default

  def _read_int_list(
    self,
    value: Any,
    default: list[int],
  ) -> list[int]:
    if not isinstance(value, list):
      return default.copy()

    result = default.copy()
    limit = min(len(value), len(default))
    for i in range(limit):
      entry = value[i]
      if isinstance(entry, (int, float)):
        result[i] = int(entry)
    return result

  def get_summary_lines(self) -> list[str]:
    lines = ["party validator/tester/viewer"]

    if not self.model.active_path:
      lines.append("drop a json file to begin")
      return lines

    lines.append(f"file: {self.model.active_path}")
    if self.model.last_error:
      lines.append(f"error: {self.model.last_error}")
      return lines

    payload = self.model.payload or {}
    lines.append("json: ok")
    lines.append(f"keys: {len(payload.keys())}")
    lines.append(f"images: {len(self.model.images)}")
    lines.append(f"sprites: {len(self.model.sprites)}")
    lines.append(f"stamps: {len(self.model.stamps)}")
    if self.model.currentImageName:
      lines.append(f"current_image: {self.model.currentImageName}")
    return lines
