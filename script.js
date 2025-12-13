// Creative Project - Starter JavaScript
// Add your custom functionality here!

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeApp();
});

// Setup all event listeners
function setupEventListeners() {
    const demoBtn = document.getElementById('demoBtn');
    const submitBtn = document.getElementById('submitBtn');
    const userInput = document.getElementById('userInput');

    if (demoBtn) {
        demoBtn.addEventListener('click', handleDemoClick);
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }

    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });
    }
}

// Initialize app
function initializeApp() {
    console.log('App initialized! Start building your creative project here.');

    // TODO: Add your initialization code here
    // Examples:
    // - Load saved data from localStorage
    // - Fetch data from an API
    // - Set up initial state
}

// Handle demo button click
function handleDemoClick() {
    alert('Welcome to your creative project! Replace this with your own functionality.');

    // TODO: Replace this with your feature
    // Examples:
    // - Show a modal
    // - Trigger an animation
    // - Start a game
    // - Display information
}

// Handle submit button
function handleSubmit() {
    const input = document.getElementById('userInput');
    const output = document.getElementById('output');

    if (!input || !output) return;

    const userText = input.value.trim();

    if (userText) {
        // Clear output safely
        while (output.firstChild) {
            output.removeChild(output.firstChild);
        }

        // Create response elements safely
        const resultPara = document.createElement('p');
        resultPara.style.color = 'var(--primary-color)';
        resultPara.style.fontWeight = '600';
        resultPara.textContent = `You entered: "${userText}"`;

        const instructionPara = document.createElement('p');
        instructionPara.style.color = 'var(--text-light)';
        instructionPara.style.marginTop = '10px';
        instructionPara.textContent = 'Replace this with your own processing logic!';

        output.appendChild(resultPara);
        output.appendChild(instructionPara);

        input.value = ''; // Clear input
    } else {
        // Clear output safely
        while (output.firstChild) {
            output.removeChild(output.firstChild);
        }

        const errorPara = document.createElement('p');
        errorPara.style.color = '#e53e3e';
        errorPara.textContent = 'Please enter something first!';
        output.appendChild(errorPara);
    }
}

// Example utility functions you might use:

// Save data to localStorage
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// Load data from localStorage
function loadData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
}

// Example: Generate random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Example: Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// TODO: Add your own functions below!
// This is where you build your unique project features.
// Some ideas:
// - API integration (fetch data from external source)
// - Interactive game logic
// - Data visualization
// - Form validation
// - Animation control
// - Calculator functions
// - Text manipulation
// - Image processing
// - And anything else you can imagine!

// Your code here...
