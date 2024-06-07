class ParallaxCard extends HTMLElement {
    #centerX;
    #centerY;

    connectedCallback () {
        this.initialiseBounds();
        window.addEventListener('resize', this.initialiseBounds.bind(this));

        // Mouse & touch pointer events
        this.addEventListener('pointermove', this.pointerInteractionCallback);
        this.addEventListener('pointerleave', this.pointerInteractionEndCallback);

        // TODO: Implement with gyroscope as well: https://developer.mozilla.org/en-US/docs/Web/API/Gyroscope
        // TODO: Orientation emulation does not appear to work on desktop chrome due to 'NotReadableError'
        const gyroscope = new Gyroscope({ frequency: 60 });

        Promise.resolve(navigator.permissions.query({ name: 'gyroscope' }))
            .then((result) => {
                if (result.state !== 'granted') {
                    console.error('No permissions to use Gyroscope.');

                    return;
                }

                gyroscope.addEventListener('reading', (e) => {
                    // TODO: Temp to allow reading values on mobile
                    const debugEl = document.getElementById('debug');

                    let debugLog = `<span>X-axis ${gyroscope.x}</span>`;
                    debugLog += `<span>Y-axis ${gyroscope.y}</span>`;
                    debugLog += `<span>Z-axis ${gyroscope.z}</span>`;

                    debugEl.innerHTML = debugLog;
                });

                gyroscope.onerror = (event) => {
                    if (event.error.name === 'NotReadableError') {
                        console.error('Sensor is not available.');
                        console.debug(event);
                    }
                };

                gyroscope.start();
            });
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
}

customElements.define('parallax-card', ParallaxCard);
