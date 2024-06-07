class ParallaxCard extends HTMLElement {
    #centerX;
    #centerY;

    connectedCallback () {
        this.initialiseBounds();
        window.addEventListener('resize', this.initialiseBounds.bind(this));

        // Mouse & touch pointer events
        this.addEventListener('pointermove', this.pointerInteractionCallback);
        this.addEventListener('pointerleave', this.pointerInteractionEndCallback);

        // Use RelativeOrientationSensor API for parallax effect
        this.initialiseOrientationSensorRotation();
    }

    initialiseBounds () {
        const bounds = this.getBoundingClientRect();

        this.#centerX = bounds.left + (bounds.width / 2);
        this.#centerY = bounds.top + (bounds.height / 2);
    }

    pointerInteractionCallback (e) {
        const rotationX = this.calculateParallaxRotation(e.y, this.#centerY);
        const rotationY = this.calculateParallaxRotation(e.x, this.#centerX);

        // perspective() = distance to object = distance to vanishing point
        // Like in art: closer to the vanishing point, the more extreme the perspective
            // I.e. crazy foreshortening - 300px seems like a nice balance
        // Value of 'none' or high enough effectively becomes 2D/orthographic

        this.style.transform = `perspective(300px)
            rotateX(${rotationX}deg)
            rotateY(${rotationY}deg)
            scale(1.5)`;

        this.style.boxShadow = this.calculateShadowCast(rotationX, rotationY);
    }

    pointerInteractionEndCallback (e) {
        this.style.transform = 'none';
        // I probably should reset boxShadow here, but I quite like that it ends up somewhere random
    }

    // TODO: Refactor this to use a % value, rather than pixel distance - supports any card size
    calculateParallaxRotation (cursorPos, centerPos, maxAngle = 30) {
        // Calculate angle of rotation based on cursor position
        const direction = Math.sign(cursorPos - centerPos) || 1;
        const magnitude = Math.abs(cursorPos - centerPos);
        // maxAngle to prevent card content being obscured
        const rotation = Math.min(magnitude, maxAngle);

        return rotation * direction;
    }

    calculateShadowCast (rotationX, rotationY, blur = 80, shade = 'rgba(51, 51, 51, 0.5)') {
        // Calculate where shadow would be cast - opposite to rotation angle
        // TODO: Setting shade by element/image colour would be cool
        // TODO: Maybe applying a filter/overlay of some kind where the cursor is to make it seem like a light source??
        return `${-rotationY}px ${-rotationX}px ${blur}px ${shade}`;
    }

    initialiseOrientationSensorRotation () {
        // TODO: Implement card rotation with RelativeOrientationSensor:
        // https://developer.mozilla.org/en-US/docs/Web/API/RelativeOrientationSensor/RelativeOrientationSensor
        const options = { frequency: 60, referenceFrame: "device" };
        const sensor = new RelativeOrientationSensor(options);

        Promise.all([
            navigator.permissions.query({ name: "accelerometer" }),
            navigator.permissions.query({ name: "gyroscope" }),
        ]).then((results) => {
            if (results.every((result) => result.state !== 'granted')) {
                console.error('No permissions to use RelativeOrientationSensor.');

                return;
            }

            sensor.addEventListener('reading', (e) => {
                // TODO: Temp to research quaternion to euler/CSS-friendly rotation
                console.log(e);
                console.log(sensor);
            });

            sensor.addEventListener('error', (e) => {
                if (e.error.name === 'NotReadableError') {
                    console.error('Sensor is not available.');
                    console.debug(e);
                }
            });

            sensor.start();
        });
    }
}

customElements.define('parallax-card', ParallaxCard);
