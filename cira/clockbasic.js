export default class ClockBasic {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  draw(now = new Date()) {
    // Clear canvas with light background
    this.ctx.fillStyle = '#f8f8f8';
    this.ctx.fillRect(0, 0, 400, 400);

    const centerX = 200;
    const centerY = 200;
    const radius = 195; // 390/2

    // Draw clock face circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Draw hour markers
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const x1 = centerX + Math.cos(angle - Math.PI / 2) * (radius - 20);
      const y1 = centerY + Math.sin(angle - Math.PI / 2) * (radius - 20);
      const x2 = centerX + Math.cos(angle - Math.PI / 2) * (radius - 5);
      const y2 = centerY + Math.sin(angle - Math.PI / 2) * (radius - 5);

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }

    // Draw minute markers
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
      if (i % 5 !== 0) { // Skip hour markers
        const angle = (i * Math.PI) / 30;
        const x1 = centerX + Math.cos(angle - Math.PI / 2) * (radius - 10);
        const y1 = centerY + Math.sin(angle - Math.PI / 2) * (radius - 10);
        const x2 = centerX + Math.cos(angle - Math.PI / 2) * (radius - 5);
        const y2 = centerY + Math.sin(angle - Math.PI / 2) * (radius - 5);

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
    }

    // Get current time
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Calculate angles (subtract PI/2 to start from top)
    const hourAngle = (hours + minutes / 60) * (Math.PI / 6) - Math.PI / 2;
    const minuteAngle = (minutes + seconds / 60) * (Math.PI / 30) - Math.PI / 2;
    const secondAngle = seconds * (Math.PI / 30) - Math.PI / 2;

    // Draw hour hand
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(
      centerX + Math.cos(hourAngle) * (radius * 0.5),
      centerY + Math.sin(hourAngle) * (radius * 0.5)
    );
    this.ctx.stroke();

    // Draw minute hand
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(
      centerX + Math.cos(minuteAngle) * (radius * 0.7),
      centerY + Math.sin(minuteAngle) * (radius * 0.7)
    );
    this.ctx.stroke();

    // Draw second hand
    this.ctx.strokeStyle = '#f44';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(
      centerX + Math.cos(secondAngle) * (radius * 0.8),
      centerY + Math.sin(secondAngle) * (radius * 0.8)
    );
    this.ctx.stroke();

    // Draw center dot
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    this.ctx.fillStyle = '#333';
    this.ctx.fill();
  }
}
