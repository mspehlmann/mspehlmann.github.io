class GaussianProcess {
  constructor(gridSize, sigma) {
      this.gridSize = gridSize;
      this.sigma = sigma;
      this.grid = this.createGrid(gridSize);
  }

  createGrid(size) {
      let grid = new Array(size).fill(0).map(() => new Array(size).fill(0));
      return grid;
  }

  applyGaussianKernel(x, y) {
      let total = 0;
      for (let i = 0; i < this.gridSize; i++) {
          for (let j = 0; j < this.gridSize; j++) {
              let distanceSq = (i - x) ** 2 + (j - y) ** 2;
              this.grid[i][j] += Math.exp(-distanceSq / (2 * this.sigma ** 2));
              total += this.grid[i][j];
          }
      }
      return total;
  }

  normalizeGrid() {
      let maxVal = Math.max(...this.grid.flat());
      for (let i = 0; i < this.gridSize; i++) {
          for (let j = 0; j < this.gridSize; j++) {
              this.grid[i][j] /= maxVal;
          }
      }
  }

  render(canvasId) {
      let canvas = document.getElementById(canvasId);
      let ctx = canvas.getContext("2d");
      let imgData = ctx.createImageData(this.gridSize, this.gridSize);
      for (let i = 0; i < this.gridSize; i++) {
          for (let j = 0; j < this.gridSize; j++) {
              let value = Math.floor(this.grid[i][j] * 255);
              let index = (i * this.gridSize + j) * 4;
              imgData.data[index] = value;
              imgData.data[index + 1] = value;
              imgData.data[index + 2] = 255;
              imgData.data[index + 3] = 255;
          }
      }
      ctx.putImageData(imgData, 0, 0);
  }
}

function runGaussianProcess() {
  let gridSize = parseInt(document.getElementById("gridSize").value);
  let sigma = parseFloat(document.getElementById("sigma").value);
  let gp = new GaussianProcess(gridSize, sigma);
  gp.applyGaussianKernel(Math.floor(gridSize / 2), Math.floor(gridSize / 2));
  gp.normalizeGrid();
  gp.render("canvas");
}
