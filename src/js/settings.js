import { SETTINGS } from './constants';
import worker from './worker';
import WebWorker from './WebWorker';

// TODO Move this canvas to web worker for faster performance
const loadCanvas = (url, cropperImageData) => {
  const promise = new Promise((resolve) => {
    const image = new Image();
    image.src = url;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropperImageData.width;
      canvas.height = cropperImageData.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        0,
        0,
        cropperImageData.width,
        cropperImageData.height,
      );
      resolve(canvas);
    };
  });
  return promise;
};

export default {
  resetSettings() {
    this.settingsList = [];
  },

  /**
   * Apply Render the canvas with image settings
   * @param {string} name - Name of the setting, example brightness, vibrance
   * @param {number} [factor] - Factor by which setting will be applied on image
   */
  renderSettingsCanvas(name, factor) {
    let index = -1;
    this.settingsList.forEach((element) => {
      index += 1;
      if (element.name === name) this.settingsList.splice(index, 1);
    });
    if (name === SETTINGS.BRIGHTNESS.name) {
      this.settingsList.unshift({ name, factor });
    } else {
      this.settingsList.push({ name, factor });
    }
    const ctx = this.settingsCanvas.getContext('2d');
    const data = ctx.getImageData(
      0,
      0,
      this.settingsCanvas.width,
      this.settingsCanvas.height,
    );
    this.settingsWorker.postMessage({
      imageData: data.data,
      filters: this.settingsList,
      factor,
    });
  },

  /**
   * Initialise canvas and web worker
   */
  initSettings() {
    loadCanvas(this.originalUrl, this.getImageData()).then((canvas) => {
      this.settingsCanvas = canvas;
    });
    this.settingsList = [];
    const myWorker = new WebWorker(worker);
    this.settingsWorker = myWorker;

    this.settingsWorker.onmessage = (event) => {
      const ctx = this.settingsCanvas.getContext('2d');
      const imageData = new ImageData(
        event.data,
        this.settingsCanvas.width,
        this.settingsCanvas.height,
      );
      ctx.putImageData(imageData, 0, 0);
      loadCanvas(this.originalUrl, this.getImageData()).then((canvas) => {
        this.replace(this.settingsCanvas.toDataURL(), true);
        this.settingsCanvas = canvas;
      });
    };
  },
};
