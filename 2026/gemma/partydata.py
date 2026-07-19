from dataclasses import dataclass, field


@dataclass
class Stamp:
  source: list[int] = field(default_factory=lambda: [0, 0, 16, 16])
  origin: list[int] = field(default_factory=lambda: [0, 0])


@dataclass
class Sprite:
  label: str = ""
  size: list[int] = field(default_factory=lambda: [16, 16])
  stamps: list[Stamp | None] = field(default_factory=list)

  def set_stamp(self, index: int, stamp: Stamp) -> None:
    if index < 0:
      return
    while len(self.stamps) <= index:
      self.stamps.append(None)
    self.stamps[index] = stamp
    self._refresh_size()

  def get_stamp(self, index: int) -> Stamp | None:
    if index < 0 or index >= len(self.stamps):
      return None
    return self.stamps[index]

  def _refresh_size(self) -> None:
    max_w = 0
    max_h = 0
    for stamp in self.stamps:
      if stamp is None:
        continue
      source = stamp.source
      if len(source) >= 4:
        max_w = max(max_w, source[2])
        max_h = max(max_h, source[3])

    if max_w <= 0 or max_h <= 0:
      self.size = [16, 16]
      return
    self.size = [max_w, max_h]
