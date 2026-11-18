
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. MOBILE NAVIGATION
    // ==========================================

    const menu = document.querySelector(".menu");
    const nav = document.querySelector("nav");

    if (menu && nav) {
        menu.addEventListener("click", () => {
            nav.classList.toggle("open");

            menu.textContent = nav.classList.contains("open")
                ? "×"
                : "☰";
        });
    }


    // ==========================================
    // 2. SCROLL REVEAL
    // ==========================================

    const elements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {

                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }

                });
            },
            { threshold: 0.12 }
        );

        elements.forEach(element => observer.observe(element));

    } else {

        elements.forEach(element => {
            element.classList.add("visible");
        });

    }


    // ==========================================
    // 3. CROP IMAGE MAPPING
    // ==========================================

    const cropImages = {

        rice: "rice.jpg",
        maize: "maize.jpg",
        chickpea: "chickpea.jpg",
        kidneybeans: "kidneybeans.jpg",
        pigeonpeas: "pigeonpeas.jpg",
        mothbeans: "mothbeans.jpg",
        mungbean: "mungbean.jpg",
        blackgram: "blackgram.jpg",
        lentil: "lentil.jpg",
        pomegranate: "pomegranate.jpg",
        banana: "banana.jpg",
        mango: "mango.jpg",
        grapes: "grapes.jpg",
        watermelon: "watermelon.jpg",
        muskmelon: "muskmelon.jpg",
        apple: "apple.jpg",
        orange: "orange.jpg",
        papaya: "papaya.jpg",
        coconut: "coconut.jpg",
        cotton: "cotton.jpg",
        jute: "jute.jpg",
        coffee: "coffee.jpg"

    };


    // ==========================================
    // 4. GET HTML ELEMENTS
    // ==========================================

    const form = document.querySelector("#cropForm");

    if (!form) return;

    const button = document.querySelector("#predictBtn");
    const result = document.querySelector("#result");

    const cropName = document.querySelector("#cropName");
    const cropMessage = document.querySelector("#cropMessage");
    const cropImage = document.querySelector("#cropImage");

    const errorMessage = document.querySelector("#errorMessage");

    // Probability elements

    const predictionProbability =
        document.querySelector("#predictionProbability");

    const probabilityBar =
        document.querySelector("#probabilityBar");

    // Top predictions element

    const topPredictions =
        document.querySelector("#topPredictions");


    // ==========================================
    // 5. HELPER: FORMAT CROP NAME
    // ==========================================

    function formatCropName(crop) {

        return String(crop)
            .trim()
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());

    }


    // ==========================================
    // 6. DISPLAY TOP 3 PREDICTIONS
    // ==========================================

    function displayTopPredictions(predictions) {

        if (!topPredictions) return;

        topPredictions.replaceChildren();

        predictions.forEach((item, index) => {

            const probability = Number(item.probability);

            if (!Number.isFinite(probability)) return;

            const cropItem = document.createElement("div");
            cropItem.className = "prediction-item";

            const header = document.createElement("div");
            header.className = "prediction-item-header";

            const name = document.createElement("span");

            name.textContent =
                `${index + 1}. ${formatCropName(item.crop)}`;

            const percentage = document.createElement("strong");

            percentage.textContent =
                `${probability.toFixed(2)}%`;

            header.append(name, percentage);

            const track = document.createElement("div");
            track.className = "prediction-track";

            const fill = document.createElement("div");
            fill.className = "prediction-fill";

            fill.style.width =
                `${Math.max(0, Math.min(100, probability))}%`;

            track.appendChild(fill);

            cropItem.append(header, track);

            topPredictions.appendChild(cropItem);

        });

    }


    // ==========================================
    // 7. DISPLAY FIELD MEASUREMENTS
    // ==========================================

    function displayMeasurements(inputData) {

        const measurements = {

            usedN: `${inputData.N} kg/ha`,
            usedP: `${inputData.P} kg/ha`,
            usedK: `${inputData.K} kg/ha`,

            usedTemperature: `${inputData.temperature} °C`,
            usedHumidity: `${inputData.humidity}%`,

            usedPh: inputData.ph,

            usedRainfall: `${inputData.rainfall} mm`

        };

        Object.entries(measurements).forEach(([id, value]) => {

            const element = document.getElementById(id);

            if (element) {
                element.textContent = value;
            }

        });

    }


    // ==========================================
    // 8. DISPLAY PREDICTION PROBABILITY
    // ==========================================

    function displayProbability(probability) {

        const value = Number(probability);

        if (!Number.isFinite(value) || value < 0 || value > 100) {
            throw new Error("Invalid prediction probability received.");
        }

        if (predictionProbability) {

            predictionProbability.textContent =
                `${value.toFixed(2)}%`;

        }

        if (probabilityBar) {

            probabilityBar.style.width = `${value}%`;

        }

    }


    // ==========================================
    // 9. DISPLAY CROP IMAGE
    // ==========================================

    function displayCropImage(normalizedCrop, displayCrop) {

        if (!cropImage) return;

        const imageFile = cropImages[normalizedCrop];

        if (!imageFile) {

            cropImage.hidden = true;

            console.error(
                `No image mapping found for: ${normalizedCrop}`
            );

            return;

        }

        cropImage.hidden = false;
        cropImage.alt = `${displayCrop} crop`;

        cropImage.onerror = () => {

            cropImage.hidden = true;

            console.error(
                `Could not load crop image: images/crops/${imageFile}`
            );

        };

        cropImage.src = `images/crops/${imageFile}`;

    }


    // ==========================================
    // 10. CROP PREDICTION
    // ==========================================

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const originalButtonText = button.textContent;

        errorMessage.hidden = true;

        if (result) {
            result.hidden = true;
        }

        button.disabled = true;

        button.textContent = "Analyzing your soil...";


        try {

            // Collect form values

            const formData = new FormData(form);

            const inputData = {

                N: Number(formData.get("N")),
                P: Number(formData.get("P")),
                K: Number(formData.get("K")),

                temperature: Number(formData.get("temperature")),
                humidity: Number(formData.get("humidity")),

                ph: Number(formData.get("ph")),
                rainfall: Number(formData.get("rainfall"))

            };


            // Validate form values

            if (Object.values(inputData).some(value => !Number.isFinite(value))) {

                throw new Error("Please enter valid numerical values.");

            }


            // Send request to FastAPI

            const response = await fetch(
                "http://127.0.0.1:8000/predict",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(inputData)

                }
            );


            // Check API response

            if (!response.ok) {

                const errorDetails = await response.text();

                throw new Error(
                    `API Error ${response.status}: ${errorDetails}`
                );

            }


            // Read JSON response

            const data = await response.json();


            if (!data.recommended_crop) {

                throw new Error(
                    "No crop was returned by the API."
                );

            }


            if (
                !Array.isArray(data.top_predictions) ||
                data.top_predictions.length === 0
            ) {

                throw new Error(
                    "Prediction probabilities were not returned by the API."
                );

            }


            // Normalize crop name

            const crop = String(data.recommended_crop).trim();

            const normalizedCrop = crop
                .toLowerCase()
                .replace(/[\s_-]/g, "");

            const displayCrop = formatCropName(crop);


            // ==========================================
            // 11. DISPLAY CROP RECOMMENDATION
            // ==========================================

            cropName.textContent = displayCrop;

            cropMessage.textContent =
                `Our trained Random Forest model recommends exploring ${displayCrop} for the supplied field measurements.`;


            // ==========================================
            // 12. DISPLAY ACTUAL CROP IMAGE
            // ==========================================

            displayCropImage(normalizedCrop, displayCrop);


            // ==========================================
            // 13. DISPLAY PREDICTION PROBABILITY
            // ==========================================

            displayProbability(data.prediction_probability);


            // ==========================================
            // 14. DISPLAY TOP 3 CROP PREDICTIONS
            // ==========================================

            displayTopPredictions(data.top_predictions);


            // ==========================================
            // 15. DISPLAY FIELD MEASUREMENTS
            // ==========================================

            displayMeasurements(inputData);


            // ==========================================
            // 16. SHOW RESULT
            // ==========================================

            result.hidden = false;

            result.scrollIntoView({

                behavior: "smooth",
                block: "start"

            });


        } catch (error) {

            console.error("Prediction error:", error);

            errorMessage.textContent =
                error.message.includes("Failed to fetch")
                    ? "Could not connect to the prediction service. Check that your FastAPI backend is running."
                    : error.message;

            errorMessage.hidden = false;


        } finally {

            button.disabled = false;

            button.textContent = originalButtonText;

        }

    });

});
