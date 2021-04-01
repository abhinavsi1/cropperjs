export default function worker() {
  const sepia = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(
        data[i] * 0.393 + data[i + 1] * 0.769 + data[i + 2] * 0.189,
        255,
      );
      data[i + 1] = Math.min(
        data[i] * 0.349 + data[i + 1] * 0.686 + data[i + 2] * 0.168,
        255,
      );
      data[i + 2] = Math.min(
        data[i] * 0.272 + data[i + 1] * 0.534 + data[i + 2] * 0.131,
        255,
      );
    }

    return data;
  };

  const invert = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }

    return data;
  };

  const greyscale = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }

    return data;
  };

  const brightness = (data, factor) => {
    const brightnessFactor = Math.floor(255 * (factor / 100));

    for (let i = 0; i < data.length; i += 4) {
      data[i] += brightnessFactor;
      data[i + 1] += brightnessFactor;
      data[i + 2] += brightnessFactor;
    }

    return data;
  };

  const saturation = (data, factor) => {
    const saturationFactor = factor * -0.01;

    for (let i = 0; i < data.length; i += 4) {
      const max = Math.max(data[i], data[i + 1], data[i + 2]);

      data[i] += max === data[i] ? 0 : (max - data[i]) * saturationFactor;
      data[i + 1]
        += max === data[i + 1] ? 0 : (max - data[i + 1]) * saturationFactor;
      data[i + 2]
        += max === data[i + 2] ? 0 : (max - data[i + 2]) * saturationFactor;
    }

    return data;
  };

  const vibrance = (data, factor) => {
    const vibranceFactor = factor * -1;

    for (let i = 0; i < data.length; i += 4) {
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const amount = (((Math.abs(max - avg) * 2) / 255) * vibranceFactor) / 100;

      data[i] += max === data[i] ? 0 : (max - data[i]) * amount;
      data[i + 1] += max === data[i + 1] ? 0 : (max - data[i + 1]) * amount;
      data[i + 2] += max === data[i + 2] ? 0 : (max - data[i + 2]) * amount;
    }

    return data;
  };

  onmessage = (e) => {
    const { imageData, filters } = e.data;
    let result = null;
    filters.forEach((element) => {
      const filter = element.name;
      const { factor } = element;
      switch (filter) {
        case 'sepia':
          result = sepia(imageData);
          break;
        case 'invert':
          result = invert(imageData);
          break;
        case 'greyscale':
          result = greyscale(imageData);
          break;
        case 'brightness':
          result = brightness(imageData, factor);
          break;
        case 'saturation':
          result = saturation(imageData, factor);
          break;
        case 'vibrance':
          result = vibrance(imageData, factor);
          break;
        default:
          result = imageData;
          break;
      }
    });
    postMessage(result);
  };
}
