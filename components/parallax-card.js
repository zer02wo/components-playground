class ParallaxCard extends HTMLElement {
    connectedCallback () {
        const bounds = this.getBoundingClientRect();
        const centerX = bounds.left + (bounds.width / 2);
        const centerY = bounds.top + (bounds.height / 2);

        this.addEventListener('mousemove', (e) => {
            const rotationX = this.calculateParallaxRotation(e.y, centerY);
            const rotationY = this.calculateParallaxRotation(e.x, centerX);

            // perspective() = distance to object = distance to vanishing point
            // Like in art: closer to the vanishing point, the more extreme the perspective
                // I.e. crazy foreshortening - 300px seems like a nice balance
            // Value of 'none' or high enough effectively becomes 2D/orthographic

            this.style.transform = `perspective(300px)
                rotateX(${rotationX}deg)
                rotateY(${rotationY}deg)
                scale(1.5)`;

            this.style.boxShadow = this.calculateShadowCast(rotationX, rotationY);
        });

        this.addEventListener('mouseleave', (e) => {
            this.style.transform = 'none';
            // I probably should reset boxShadow here, but I quite like that it ends up somewhere random
        });

        // TODO: Think about how to make this work on mobile
            // TODO: touch events at a minimum?
            // TODO: Maybe with accelerometer as well? https://developer.mozilla.org/en-US/docs/Web/API/Accelerometer
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
