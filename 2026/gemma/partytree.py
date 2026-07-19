from typing import Any

import pygame


class Partytree:
  def __init__(self, surface: Any) -> None:
    self.surface = surface
    self.objects: list[Any] = []
    self._drawn_objects: list[Any] = []

  def add(self, obj: Any, parent: Any | None = None) -> Any:
    if obj is None:
      obj = {"position": [0, 0]}

    if parent is None:
      self.objects.append(obj)
      return obj

    children = self._get_value(parent, "children")
    if children is None:
      children = []
      self._set_value(parent, "children", children)
    self._set_value(obj, "parent", parent)
    children.append(obj)
    return obj

  def draw(self) -> None:
    self._drawn_objects = []
    for obj in self.objects:
      self._drawn_objects.extend(self._collect(obj))

    color = (200, 200, 200)
    radius = 5
    for obj in self._drawn_objects:
      position = self._get_position(obj, default=(0, 0))
      parent = self._get_value(obj, "parent")
      if parent is not None:
        parent_offset = self._get_parent_offset(parent)
        if parent_offset is not None:
          world = [position[0] + parent_offset[0], position[1] + parent_offset[1]]
          self._set_value(obj, "world", world)

      world = self._get_value(obj, "world")
      if isinstance(world, (list, tuple)) and len(world) >= 2:
        x, y = int(world[0]), int(world[1])
      else:
        x, y = position

      size = self._get_size(obj)
      if size is not None:
        w, h = size
        pygame.draw.rect(self.surface, color, pygame.Rect(x, y, w, h), 1)
        self._set_value(obj, "aabb", [x, y, w, h])
      else:
        pygame.draw.line(self.surface, color, (x - radius, y), (x + radius, y), 1)
        pygame.draw.line(self.surface, color, (x, y - radius), (x, y + radius), 1)

  def find(self, x: int, y: int) -> Any | None:
    for obj in reversed(self._drawn_objects):
      aabb = self._get_value(obj, "aabb")
      if not isinstance(aabb, (list, tuple)) or len(aabb) < 4:
        continue
      rx, ry, rw, rh = int(aabb[0]), int(aabb[1]), int(aabb[2]), int(aabb[3])
      if x >= rx and x <= rx + rw and y >= ry and y <= ry + rh:
        return obj
    return None

  def _collect(self, obj: Any) -> list[Any]:
    result = [obj]
    children = self._get_value(obj, "children")
    if isinstance(children, list):
      for child in children:
        result.extend(self._collect(child))
    return result

  def _get_size(self, obj: Any) -> tuple[int, int] | None:
    size = self._get_value(obj, "size")
    if isinstance(size, (list, tuple)) and len(size) >= 2:
      return int(size[0]), int(size[1])
    return None

  def _get_position(self, obj: Any, default: tuple[int, int] = (0, 0)) -> tuple[int, int]:
    position = self._get_value(obj, "position")
    if isinstance(position, (list, tuple)) and len(position) >= 2:
      return int(position[0]), int(position[1])

    x = self._get_value(obj, "x")
    y = self._get_value(obj, "y")
    if x is not None and y is not None:
      return int(x), int(y)
    return default

  def _get_parent_offset(self, parent: Any) -> tuple[int, int] | None:
    world = self._get_value(parent, "world")
    if isinstance(world, (list, tuple)) and len(world) >= 2:
      return int(world[0]), int(world[1])

    position = self._get_value(parent, "position")
    if isinstance(position, (list, tuple)) and len(position) >= 2:
      return int(position[0]), int(position[1])
    return None

  def _get_value(self, obj: Any, key: str) -> Any:
    if isinstance(obj, dict):
      return obj.get(key)
    return getattr(obj, key, None)

  def _set_value(self, obj: Any, key: str, value: Any) -> None:
    if isinstance(obj, dict):
      obj[key] = value
      return
    setattr(obj, key, value)
