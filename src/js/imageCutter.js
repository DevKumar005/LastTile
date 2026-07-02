
export class ImageCutter {
  static sliceImage(imageSrc, N) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageSrc;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const side = Math.min(img.width, img.height);
        const startX = (img.width - side) / 2;
        const startY = (img.height - side) / 2;

        const totalTiles = N * N;
        const tileSide = 300; // Resolution per tile slice
        const tilesMap = {};

        canvas.width = tileSide;
        canvas.height = tileSide;

        const srcTileSize = side / N;

        let tileNum = 1;
        for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
            if (tileNum === totalTiles) break; // Last tile is empty space

            ctx.clearRect(0, 0, tileSide, tileSide);
            ctx.drawImage(
              img,
              startX + c * srcTileSize,
              startY + r * srcTileSize,
              srcTileSize,
              srcTileSize,
              0,
              0,
              tileSide,
              tileSide
            );

            tilesMap[tileNum] = canvas.toDataURL('image/png');
            tileNum++;
          }
        }

        resolve(tilesMap);
      };

      img.onerror = (err) => reject(err);
    });
  }
  static getPresetImages() {
    return [
      {
        id: 'cyberpunk',
        name: 'Cyberpunk Neon',
        url: ImageCutter.createCyberpunkPreset()
      },
      {
        id: 'cat',
        name: 'Vibrant Kitty',
        url: ImageCutter.createCatPreset()
      },
      {
        id: 'nature',
        name: 'Emerald Forest',
        url: ImageCutter.createNaturePreset()
      },
      {
        id: 'abstract',
        name: 'Cosmic Geometry',
        url: ImageCutter.createAbstractPreset()
      },
      {
        id: 'ocean',
        name: 'Ocean Reef',
        url: ImageCutter.createOceanPreset()
      },
      {
        id: 'sunset',
        name: 'Sunset Peaks',
        url: ImageCutter.createSunsetPreset()
      }
    ];
  }

  static createCyberpunkPreset() {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 600, 600);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#581c87');
    grad.addColorStop(1, '#be185d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 600);
    const sunGrad = ctx.createRadialGradient(300, 300, 20, 300, 300, 160);
    sunGrad.addColorStop(0, '#fde047');
    sunGrad.addColorStop(0.6, '#f43f5e');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(300, 300, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    for (let i = 0; i <= 600; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 300);
      ctx.lineTo((i - 300) * 2.5 + 300, 600);
      ctx.stroke();
    }
    for (let y = 320; y <= 600; y += (y - 300) * 0.4 + 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(600, y);
      ctx.stroke();
    }

    return canvas.toDataURL();
  }

  static createCatPreset() {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 600, 600);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(1, '#f472b6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 600);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(160, 240);
    ctx.lineTo(220, 100);
    ctx.lineTo(280, 220);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(320, 220);
    ctx.lineTo(380, 100);
    ctx.lineTo(440, 240);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(300, 320, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(245, 300, 25, 0, Math.PI * 2);
    ctx.arc(355, 300, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(245, 300, 12, 0, Math.PI * 2);
    ctx.arc(355, 300, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(300, 340, 14, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL();
  }

  static createNaturePreset() {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 600);
    grad.addColorStop(0, '#065f46');
    grad.addColorStop(0.5, '#047857');
    grad.addColorStop(1, '#10b981');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 600);
    ctx.fillStyle = '#022c22';
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.lineTo(200, 200);
    ctx.lineTo(400, 450);
    ctx.lineTo(600, 180);
    ctx.lineTo(600, 600);
    ctx.lineTo(0, 600);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(450, 150, 60, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL();
  }

  static createAbstractPreset() {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 600, 600);

    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'];
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      const x = Math.random() * 600;
      const y = Math.random() * 600;
      const r = 40 + Math.random() * 120;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas.toDataURL();
  }

  static createOceanPreset() {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 600);
    grad.addColorStop(0, '#0ea5e9');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1, '#082f49');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 600);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(100 + i * 100, 0);
      ctx.lineTo(150 + i * 120, 0);
      ctx.lineTo(250 + i * 80, 600);
      ctx.lineTo(150 + i * 70, 600);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 600;
      const y = Math.random() * 600;
      const r = 2 + Math.random() * 8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    return canvas.toDataURL();
  }

  static createSunsetPreset() {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 600);
    grad.addColorStop(0, '#4c1d95');
    grad.addColorStop(0.3, '#be123c');
    grad.addColorStop(0.6, '#f97316');
    grad.addColorStop(1, '#fde047');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 600);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(300, 400, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, 600);
    ctx.lineTo(0, 450);
    ctx.lineTo(150, 300);
    ctx.lineTo(350, 480);
    ctx.lineTo(500, 350);
    ctx.lineTo(600, 450);
    ctx.lineTo(600, 600);
    ctx.fill();

    return canvas.toDataURL();
  }
}
