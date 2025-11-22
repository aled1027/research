# Three.js Layering Quiz

An interactive quiz to test your understanding of Three.js depth testing, transparency, render order, and blending modes.

## Overview

This quiz complements the Three.js Layering Demo by testing your knowledge through 20 multiple-choice questions. Each question presents specific material settings and asks you to predict the visual outcome. After answering, you see the correct answer, an explanation, and a live Three.js render showing the actual result.

## Features

- **20 Comprehensive Questions** covering all key concepts
- **Interactive Multiple Choice** with instant feedback
- **Live Three.js Rendering** shows the actual result after each answer
- **Detailed Explanations** for every question
- **Score Tracking** throughout the quiz
- **Organized by Category** for structured learning

## Question Categories

### Depth Testing (Questions 1-4)
Tests understanding of:
- How depthTest=true vs false affects rendering
- When objects ignore depth buffer
- Proper depth testing for opaque objects

### Depth Write (Questions 5-8)
Tests understanding of:
- The common mistake: depthWrite=true on transparent objects
- Correct transparency setup
- How depthWrite affects object layering

### Render Order (Questions 9-12)
Tests understanding of:
- How renderOrder overrides spatial position
- Back-to-front vs front-to-back rendering
- Negative renderOrder values
- Proper ordering for transparency

### Blending Modes (Questions 13-16)
Tests understanding of:
- AdditiveBlending for glow effects
- MultiplyBlending for darkening
- Visual differences between blending modes
- When to use each blending mode

### Combined Concepts (Questions 17-20)
Tests understanding of:
- Identifying common configuration mistakes
- Material type differences (Basic vs Standard)
- Complex interactions between settings
- Edge cases and special scenarios

## How to Use

1. **Read the Question** - Each question describes a scenario with specific settings
2. **Review the Settings** - See the exact material properties for each plane
3. **Select Your Answer** - Choose from 4 multiple-choice options
4. **Submit** - Click "Submit Answer" to check if you're correct
5. **See the Result** - View:
   - Whether your answer was correct
   - The correct answer (if you were wrong)
   - A detailed explanation of why
   - A live Three.js render showing the actual outcome
6. **Continue** - Move to the next question

## Scoring

- Each correct answer: 1 point
- Total possible: 20 points
- Percentage shown at the end
- Performance feedback based on score:
  - 90%+: Excellent - You've mastered the concepts!
  - 75-89%: Great job - Solid understanding
  - 60-74%: Good effort - Review missed concepts
  - <60%: Keep practicing - Try the interactive demo

## Learning Strategy

### For Best Results:
1. **Use the Interactive Demo First** - Experiment with settings at `../threejs-layering/index.html`
2. **Take the Quiz** - Test your understanding
3. **Review Wrong Answers** - Read explanations carefully
4. **Retake if Needed** - Aim for 90%+ mastery

### Common Mistakes to Watch For:
- ✗ depthWrite=true on transparent objects
- ✗ Wrong renderOrder for transparent objects (front-to-back instead of back-to-front)
- ✗ Forgetting that depthTest=false makes objects ignore depth
- ✗ Not understanding how blending modes affect color

## Key Concepts Reinforced

After completing this quiz, you should be able to:

1. **Depth Testing**
   - Explain when to use depthTest=true vs false
   - Understand how depth buffer works
   - Know when objects ignore depth

2. **Depth Writing**
   - Know why transparent objects need depthWrite=false
   - Understand the most common transparency mistake
   - Recognize correct vs incorrect transparency setups

3. **Render Order**
   - Explain how renderOrder overrides Z position
   - Know the correct ordering for transparent objects (back-to-front)
   - Understand that higher values render last

4. **Blending Modes**
   - Identify which blending mode creates glow effects (Additive)
   - Know when colors get brighter vs darker
   - Choose appropriate blending for different effects

5. **Material Types**
   - Distinguish between Basic, Standard, and Shader materials
   - Know which materials respond to lighting

## Technical Details

- Built with vanilla JavaScript and Three.js r160
- No build process - runs directly in browser
- Uses ES6 modules for Three.js imports
- Fully responsive layout
- OrbitControls for 3D scene interaction

## Files

- `index.html` - Complete quiz application
- `README.md` - This documentation
- `notes.md` - Development notes and question design

## Running the Quiz

Simply open `index.html` in a modern web browser. No server required.

**Recommended Browsers:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Related Resources

- **Interactive Demo**: `../threejs-layering/index.html` - Hands-on experimentation
- **Three.js Docs**: Official documentation for deeper learning
- **Help Modal**: In the demo tool for quick reference

## Tips for Success

1. Read each question carefully - details matter!
2. Pay attention to ALL settings shown (don't miss depthWrite or renderOrder)
3. Think about how settings interact with each other
4. Use the rendered result to understand what you missed
5. Read explanations even when you get it right - they often include extra insights

Good luck! 🎓
