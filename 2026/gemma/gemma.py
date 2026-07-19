from pathlib import Path
import time

import pygame

from partysystem import PartySystem
from partyux import PartyUx


class Program:
  MIN_FRAME_DT = 0.01
  MAX_FRAME_DT = 0.10

  def __init__(self) -> None:
    pygame.init()

    width, height = 1280, 720
    self.screen = pygame.display.set_mode((width, height), pygame.RESIZABLE)
    pygame.display.set_caption("Gemma")

    self.font = pygame.font.SysFont("consolas", 16)
    self.background = (80, 80, 80)
    self.text_color = (245, 245, 245)

    self.frame = 0
    self.running = True
    self.queued_events: list[dict[str, str]] = []
    self.started = False
    self.last_draw_wallclock = 0.0
    self.elapsed_time = 0.0

    self.system = PartySystem(self.screen)
    self.ux = PartyUx(self.system, self.screen, self.font, self.text_color)

  def queue_event(self, event_type: str, file_path: str = "") -> None:
    self.queued_events.append({"type": event_type, "file": file_path})

  def run(self) -> None:
    while self.running:
      self._handle_events()
      now = time.perf_counter()

      if not self.started:
        self.started = True
        self.last_draw_wallclock = now
        self._render(self.MIN_FRAME_DT, 0.0)
        continue

      raw_dt = now - self.last_draw_wallclock
      if raw_dt < self.MIN_FRAME_DT:
        pygame.time.wait(1)
        continue

      dx = min(raw_dt, self.MAX_FRAME_DT)
      self.elapsed_time += dx
      self.last_draw_wallclock = now
      self._render(dx, self.elapsed_time)
    pygame.quit()

  def _handle_events(self) -> None:
    while self.queued_events:
      queued = self.queued_events.pop(0)
      event_type = queued.get("type", "")
      if event_type == "drop":
        self.ux.on_drop_file(queued.get("file", ""))
      elif event_type == "quit":
        self.running = False

    for event in pygame.event.get():
      if event.type == pygame.QUIT:
        self.running = False
      elif event.type == pygame.DROPFILE:
        self.ux.on_drop_file(event.file)
      elif event.type == pygame.MOUSEBUTTONDOWN:
        click_x, click_y = event.pos
        self.ux.on_click(click_x, click_y)

  def _render(self, dx: float, time_value: float) -> None:
    self.frame += 1

    self.screen.fill(self.background)
    self.ux.draw(dx, time_value)

    pygame.display.flip()


def main() -> None:
  program = Program()
  test_path = Path(__file__).resolve().parent / "testdata" / "sheet01.json"
  program.queue_event("drop", str(test_path))
  for i in range(20):
    obj = program.system.tree.add(None)
    obj["position"] = [i * 10, i * 20]
    for j in range(5):
      child = program.system.tree.add(None, obj)
      child["position"] = [(j + 1) * 100, 0]
      child["size"] = [10, 10]

      def grow(target: dict = child) -> None:
        size = target.get("size")
        if not isinstance(size, list) or len(size) < 2:
          size = [0, 0]
        target["size"] = [int(size[0]) + 10, int(size[1]) + 10]

      child["onclick"] = grow
  program.run()


if __name__ == "__main__":
  main()
