from dataclasses import dataclass
from typing import Any

from partydata import Sprite, Stamp


@dataclass
class ModelSprite:
  data: Sprite
  image_name: str = ""


class PartyModel:
  def __init__(self) -> None:
    self.images: dict[str, Any] = {}
    self.sprites: dict[str, ModelSprite] = {}
    self.stamps: dict[str, Stamp] = {}
    self.stamp_images: dict[str, str] = {}
    self._nextStampId: int = 0
    self.currentImageName: str = ""
    self.currentImage: Any | None = None
    self.active_path: str = ""
    self.payload: dict[str, Any] | None = None
    self.last_error: str = ""

  def setImage(self, name: str, image: Any) -> None:
    self.images[name.lower()] = image

  def getImage(self, name: str) -> bool:
    key = name.lower()
    image = self.images.get(key)
    if image is None:
      return False
    self.currentImageName = key
    self.currentImage = image
    return True

  def setSprite(self, name: str, sprite: Sprite, image_name: str = "") -> None:
    self.sprites[name] = ModelSprite(data=sprite, image_name=image_name)

  def getSprite(self, name: str) -> ModelSprite | None:
    return self.sprites.get(name)

  def clearSpriteData(self) -> None:
    self.sprites = {}
    self.stamps = {}
    self.stamp_images = {}
    self._nextStampId = 0

  def setStamp(self, key: str, stamp: Stamp, image_name: str = "") -> str:
    stamp_key = key.strip() if isinstance(key, str) else ""
    if not stamp_key:
      stamp_key = f"stamp.{self._nextStampId}"
      self._nextStampId += 1
    self.stamps[stamp_key] = stamp
    self.stamp_images[stamp_key] = image_name.lower()
    return stamp_key

  def setSpriteStamp(
    self,
    sprite_name: str,
    stamp_index: int,
    stamp: Stamp,
    image_name: str = "",
  ) -> str:
    model_sprite = self.sprites.get(sprite_name)
    if model_sprite is None:
      model_sprite = ModelSprite(data=Sprite(label=sprite_name), image_name=image_name)
      self.sprites[sprite_name] = model_sprite
    else:
      model_sprite.image_name = image_name or model_sprite.image_name

    model_sprite.data.set_stamp(stamp_index, stamp)
    return self.setStamp(f"{sprite_name}.{stamp_index}", stamp, image_name=image_name)

  def set_loaded(self, file_path: str, payload: dict[str, Any]) -> None:
    self.active_path = file_path
    self.payload = payload
    self.last_error = ""

  def set_error(self, message: str) -> None:
    self.last_error = message
