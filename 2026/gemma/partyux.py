import pygame

from partysystem import PartySystem


class PartyUx:
  DRAW_MODE_STAMPS = "stamps"
  DRAW_MODE_SPRITES = "sprites"

  def __init__(
    self,
    system: PartySystem,
    screen: pygame.Surface,
    font: pygame.font.Font,
    text_color: tuple[int, int, int],
  ) -> None:
    self.system = system
    self.screen = screen
    self.font = font
    self.stamp_font = pygame.font.SysFont("consolas", 12)
    self.text_color = text_color
    self.sprite_color = (255, 0, 255)
    self.stamp_text_color = (245, 245, 245)
    self.last_drop_path = ""
    self.draw_mode = self.DRAW_MODE_SPRITES

  def on_drop_file(self, path: str) -> None:
    self.last_drop_path = path
    self.system.load_json_file(path)

  def get_lines(self) -> list[str]:
    lines = self.system.get_summary_lines()
    if self.last_drop_path:
      lines.append(f"last_drop: {self.last_drop_path}")
    return lines

  def on_click(self, x: int, y: int) -> None:
    obj = self.system.tree.find(x, y)
    if obj is None:
      return

    handler = None
    if isinstance(obj, dict):
      handler = obj.get("onclick") or obj.get("oncluck") or obj.get("onclikc")
    else:
      handler = getattr(obj, "onclick", None)

    if not callable(handler):
      return

    try:
      handler(obj)
    except TypeError:
      handler()

  def draw(self, dx: float, time_value: float) -> None:
    self.system.tree.draw()

    width, height = self.screen.get_size()
    lines = [
      f"dx: {dx:.4f}",
      f"time: {time_value:.3f}",
      f"size: {width}x{height}",
      f"mode: {self.draw_mode}",
    ]
    lines.extend(self.get_lines())

    y = 2
    line_height = self.font.get_linesize()
    for line in lines:
      text_surface = self.font.render(line, True, self.text_color)
      self.screen.blit(text_surface, (2, y))
      y += line_height

    top = y + 4
    if self.draw_mode == self.DRAW_MODE_STAMPS:
      self._draw_stamps(top, width)
    else:
      self._draw_sprites(top, width, time_value)

  def _draw_stamps(self, top: int, width: int) -> None:
    margin = 1
    col_gap = 2
    row_gap = 2
    label_gap = 2
    label_height = self.stamp_font.get_linesize()
    x = 2
    row_max_stamp_height = 0
    stamp_keys = sorted(self.system.model.stamps.keys())
    for stamp_key in stamp_keys:
      stamp = self.system.model.stamps.get(stamp_key)
      stamp_w = 32
      stamp_h = 32
      if stamp is not None and len(stamp.source) >= 4:
        stamp_w = max(1, int(stamp.source[2]))
        stamp_h = max(1, int(stamp.source[3]))

      stamp_total_w = stamp_w + (2 * margin)
      if x + stamp_total_w > width and x > 2:
        x = 2
        top += row_max_stamp_height + label_gap + label_height + row_gap
        row_max_stamp_height = 0

      image_name = self.system.model.stamp_images.get(stamp_key, "")
      image = self.system.model.images.get(image_name)
      if stamp is not None and image is not None:
        source = stamp.source
        if len(source) >= 4:
          src_rect = pygame.Rect(source[0], source[1], source[2], source[3])
          self.screen.blit(image, (x + margin, top + margin), src_rect)
      else:
        pygame.draw.rect(
          self.screen,
          self.sprite_color,
          pygame.Rect(x + margin, top + margin, stamp_w, stamp_h),
        )
      key_surface = self.stamp_font.render(stamp_key, True, self.stamp_text_color)
      self.screen.blit(key_surface, (x, top + (2 * margin) + stamp_h + label_gap))

      row_max_stamp_height = max(row_max_stamp_height, stamp_h + (2 * margin))
      x += stamp_total_w + col_gap

  def _draw_sprites(self, top: int, width: int, time_value: float) -> None:
    margin = 1
    col_gap = 2
    row_gap = 2
    label_gap = 2
    label_height = self.stamp_font.get_linesize()
    x = 2
    row_max_stamp_height = 0
    frame_step = int(time_value * 10.0)
    sprite_names = sorted(self.system.model.sprites.keys())

    for sprite_name in sprite_names:
      model_sprite = self.system.model.sprites.get(sprite_name)
      if model_sprite is None:
        continue

      sprite = model_sprite.data
      available_indexes: list[int] = []
      for index, stamp in enumerate(sprite.stamps):
        if stamp is not None:
          available_indexes.append(index)
      if not available_indexes:
        continue

      frame_index = available_indexes[frame_step % len(available_indexes)]
      stamp = sprite.get_stamp(frame_index)
      if stamp is None or len(stamp.source) < 4:
        continue

      stamp_w = max(1, int(stamp.source[2]))
      stamp_h = max(1, int(stamp.source[3]))
      sprite_total_w = stamp_w + (2 * margin)
      if x + sprite_total_w > width and x > 2:
        x = 2
        top += row_max_stamp_height + label_gap + label_height + row_gap
        row_max_stamp_height = 0

      image_name = model_sprite.image_name.lower()
      image = self.system.model.images.get(image_name)
      if image is not None:
        src_rect = pygame.Rect(stamp.source[0], stamp.source[1], stamp_w, stamp_h)
        self.screen.blit(image, (x + margin, top + margin), src_rect)
      else:
        pygame.draw.rect(
          self.screen,
          self.sprite_color,
          pygame.Rect(x + margin, top + margin, stamp_w, stamp_h),
        )

      label = f"{sprite_name}.{frame_index}"
      key_surface = self.stamp_font.render(label, True, self.stamp_text_color)
      self.screen.blit(key_surface, (x, top + (2 * margin) + stamp_h + label_gap))

      row_max_stamp_height = max(row_max_stamp_height, stamp_h + (2 * margin))
      x += sprite_total_w + col_gap
