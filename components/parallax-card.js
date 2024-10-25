class ParallaxCard extends HTMLElement {
    #centerX;
    #centerY;

    connectedCallback () {
        this.initialiseBounds();
        window.addEventListener('resize', this.initialiseBounds.bind(this));

        // Mouse & touch pointer events
        this.addEventListener('pointermove', this.pointerInteractionCallback);
        this.addEventListener('pointerleave', this.pointerInteractionEndCallback);

        // Use DeviceOrientation event for rotation effect
        this.initialiseOrientationSensorRotation();
    }

    disconnectedCallback() {
        this.removeEventListener('pointermove', this.pointerInteractionCallback);
        this.removeEventListener('pointerleave', this.pointerInteractionEndCallback);
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
        const direction = Math.sign(cursorPos - centerPos);
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
        // RelativeOrientationSensor would be better for mobile support - as currently relative to angle on page load
        // however, this sensor does not seem to emulate within desktop Chrome devtools

        window.addEventListener('deviceorientation', (e) => {
            const [rotationX, rotationY] = this.calculateOrientationRotation(e.alpha, e.beta, e.gamma);

            this.style.transform = `perspective(300px)
                rotateX(${rotationX}deg)
                rotateY(${rotationY}deg)
                scale(1.5)`;

            this.style.boxShadow = this.calculateShadowCast(rotationX, rotationY);
        });

        // This is an imperfect solution.
        // For a more accurate/mathematical approach to this, overcoming problems like gimbal lock, see:
        // https://stackoverflow.com/a/56681378
    }

    // Not using quaternion/euler/matrix rotation to limit complexity
    // Approximation calculated here is working for my use case where one axis is ignored
    calculateOrientationRotation (alpha, beta, gamma, maxAngle = 45) {
        // Assuming device is intended to be displayed portrait
        const angleX = 90 - beta;
        const magnitudeX = Math.abs(angleX);
        const directionX = Math.sign(angleX);
        const rotationX = Math.min(magnitudeX, maxAngle) * directionX;

        // Use gamma angle for vector with alpha angle
        let angleY = alpha + gamma;

        // Limit rotation to a plane
        if (Math.abs(angleY) >= 180) {
            angleY = (angleY % 180) - 180;
        }

        const magnitudeY = Math.abs(angleY);
        const directionY = Math.sign(angleY);
        const rotationY = Math.min(magnitudeY, maxAngle) * directionY;

        return [rotationX, rotationY];
    }
}

customElements.define('parallax-card', ParallaxCard);
