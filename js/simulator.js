document.addEventListener("DOMContentLoaded", function () {
    const rangeSlider = document.getElementById("range");
    const varianceSlider = document.getElementById("variance");
    const categoriesSlider = document.getElementById("categories");

    const rangeValue = document.getElementById("rangeValue");
    const varianceValue = document.getElementById("varianceValue");
    const categoriesValue = document.getElementById("categoriesValue");

    rangeSlider.addEventListener("input", () => rangeValue.textContent = rangeSlider.value);
    varianceSlider.addEventListener("input", () => varianceValue.textContent = varianceSlider.value);
    categoriesSlider.addEventListener("input", () => categoriesValue.textContent = categoriesSlider.value);

    document.getElementById("simulate").addEventListener("click", simulateSpatialProcess);

    function gaussianKernel(locations, range = 1.0, variance = 1.0) {
        const n = locations.length;
        const kernel = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j <= i; j++) {
                const dx = locations[i][0] - locations[j][0];
                const dy = locations[i][1] - locations[j][1];
                const distance = Math.sqrt(dx * dx + dy * dy);
                kernel[i][j] = variance * Math.exp(-0.5 * Math.pow(distance / range, 2));
                if (i !== j) kernel[j][i] = kernel[i][j];
            }
        }
        return kernel;
    }

    function choleskyDecomposition(matrix) {
        const n = matrix.length;
        const L = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j <= i; j++) {
                let sum = 0;
                for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
                if (i === j) {
                    L[i][j] = Math.sqrt(matrix[i][i] - sum);
                } else {
                    L[i][j] = (matrix[i][j] - sum) / L[j][j];
                }
            }
        }
        return L;
    }

    function randn() {
        let u = Math.random(), v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    function multivariateNormal(mean, cov) {
        const n = mean.length;
        const L = choleskyDecomposition(cov);
        const z = Array.from({ length: n }, randn);
        return Array.from({ length: n }, (_, i) =>
            mean[i] + L[i].reduce((sum, val, j) => sum + val * z[j], 0)
        );
    }

    function simulateSpatialProcess() {
        const nPointsX = 20, nPointsY = 20;
        const x = Array.from({ length: nPointsX }, (_, i) => i / (nPointsX - 1));
        const y = Array.from({ length: nPointsY }, (_, i) => i / (nPointsY - 1));
        const locations = x.flatMap(xi => y.map(yi => [xi, yi]));

        const rangeProp = parseFloat(rangeSlider.value);
        const varianceCat = parseFloat(varianceSlider.value);
        const k = parseInt(categoriesSlider.value, 10);

        const maxDistance = Math.sqrt(1 ** 2 + 1 ** 2);
        const scaledRange = rangeProp * maxDistance;

        const covCat = gaussianKernel(locations, scaledRange, varianceCat);

        try {
            const gpSamplesCat = Array.from({ length: k }, () => multivariateNormal(new Array(locations.length).fill(0), covCat));
            const gpStacked = gpSamplesCat[0].map((_, i) => gpSamplesCat.map(row => row[i]));
            const categories = gpStacked.map(row => row.indexOf(Math.max(...row)));

            const discreteColorscale = [
                [0.0, 'rgb(255, 0, 0)'],
                [0.5, 'rgb(0, 255, 0)'],
                [1.0, 'rgb(0, 0, 255)']
            ];

            if (k > 3) {
                const additionalColors = [
                    'rgb(255, 255, 0)', 'rgb(255, 0, 255)', 'rgb(0, 255, 255)',
                    'rgb(128, 0, 0)', 'rgb(0, 128, 0)', 'rgb(0, 0, 128)',
                    'rgb(128, 128, 0)', 'rgb(128, 0, 128)', 'rgb(0, 128, 128)',
                    'rgb(192, 192, 192)'
                ];
                for (let i = 3; i < k; i++) {
                    discreteColorscale.push([i / (k - 1), additionalColors[i % additionalColors.length]]);
                }
            }

            const trace = {
                x: locations.map(loc => loc[0]),
                y: locations.map(loc => loc[1]),
                z: categories,
                type: 'heatmap',
                colorscale: discreteColorscale,
                zmin: 0,
                zmax: k - 1
            };

            const layout = {
                title: 'Categorical Process Simulation',
                xaxis: { title: 'X' },
                yaxis: { title: 'Y' }
            };

            setTimeout(() => {
                Plotly.newPlot('plot', [trace], layout);
            }, 100);
        } catch (error) {
            console.error("Error in simulation:", error);
        }
    }

    simulateSpatialProcess();
});
