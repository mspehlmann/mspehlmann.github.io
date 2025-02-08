document.getElementById("inputForm").addEventListener("submit", (e) => {
  e.preventDefault();

  // Get user inputs
  const nX = parseInt(document.getElementById("n_points_X").value);
  const nY = parseInt(document.getElementById("n_points_Y").value);
  const randomPoints = parseInt(document.getElementById("random_points").value);
  const categories = parseInt(document.getElementById("categories").value);

  // Create a grid
  const x = math.linspace(0, 10, nX);
  const y = math.linspace(0, 10, nY);
  const locations = [];
  x.forEach((xi) => y.forEach((yi) => locations.push([xi, yi])));

  // Generate random points
  const randomLocations = Array.from({ length: randomPoints }, () => [
    Math.random() * 10,
    Math.random() * 10,
  ]);

  // Gaussian kernel (pairwise distances)
  function gaussianKernel(locations, range, variance) {
    const n = locations.length;
    const kernel = math.zeros([n, n]);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const dist = math.distance(locations[i], locations[j]);
        kernel.set([i, j], variance * Math.exp(-0.5 * Math.pow(dist / range, 2)));
      }
    }
    return kernel;
  }

  // Simulate the categorical process
  const rangeCat = 2.0;
  const varianceCat = 1.0;
  const covCat = gaussianKernel(locations, rangeCat, varianceCat);
  const categoriesMatrix = Array.from({ length: categories }, (_, k) =>
    math.random([locations.length])
  );

  // Assign categories based on max covariance
  const categoryGrid = locations.map((_, i) =>
    categoriesMatrix.reduce(
      (maxIdx, _, k) => (categoriesMatrix[k][i] > categoriesMatrix[maxIdx][i] ? k : maxIdx),
      0
    )
  );

  // Draw the categorical process on canvas
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const cellWidth = canvas.width / nX;
  const cellHeight = canvas.height / nY;
  categoryGrid.forEach((cat, idx) => {
    const i = Math.floor(idx / nY);
    const j = idx % nY;
    ctx.fillStyle = d3.schemeCategory10[cat % 10];
    ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
  });

  // Simulate continuous process (e.g., random spatial field)
  const rangeCont = 2.0;
  const varianceCont = 1.0;
  const covCont = gaussianKernel(randomLocations, rangeCont, varianceCont);
  const spatialField = Array.from({ length: randomPoints }, () =>
    Math.random()
  );

  console.log("Generated spatial field", spatialField);
});
